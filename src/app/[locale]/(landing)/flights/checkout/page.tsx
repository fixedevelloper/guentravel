'use client'

import React, { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ArrowRight, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/core/store/useCartStore'
import { useFlightCheckout } from '@/core/hooks/useFlightCheckout'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { toast } from 'sonner'

import { CheckoutStepPassenger } from './CheckoutStepPassenger'
import { CheckoutStepOptions }   from './CheckoutStepOptions'
import { CheckoutStepPayment }   from './CheckoutStepPayment'
import { FlightSummarySidebar }  from './FlightSummarySidebar'
import { FareRulesDialog }       from './FareRulesDialog'
import { SeatMapDialog }         from './SeatMapDialog'

const RESERVATION_HOLD_FEE = 5000

export default function FlightCheckoutPage() {
    const router = useRouter()

    // ── Étapes ───────────────────────────────────────────────────────────────
    const [step,        setStep]        = useState(1)
    const [isHydrated,  setIsHydrated]  = useState(false)

    // ── Paiement ─────────────────────────────────────────────────────────────
    const [bookingType,    setBookingType]    = useState<'now' | 'hold'>('now')
    const [paymentMethod,  setPaymentMethod]  = useState<'momo' | 'om' | 'wave' | 'card'>('momo')
    const [momoOperator,   setMomoOperator]   = useState<'momo' | 'om'>('momo')
    const [momoPhone,      setMomoPhone]      = useState('')

    // ── Options vol ──────────────────────────────────────────────────────────
    const [insuranceSelected, setInsuranceSelected] = useState(false)
    const [extraBaggage,      setExtraBaggage]      = useState(0)
    const [outboundMeal,      setOutboundMeal]      = useState('')
    const [inboundMeal,       setInboundMeal]       = useState('')

    // ── Sièges (Multi-trajets) ────────────────────────────────────────────────
    const [isSeatMapOpen,   setIsSeatMapOpen]   = useState(false)
    const [currentSegmentIdx, setCurrentSegmentIdx] = useState<number>(0)

    // États transformés en objets/dictionnaires indexés par segment_idx
    const [selectedSeats,          setSelectedSeats]          = useState<Record<number, string>>({})
    const [selectedSeatServiceIds, setSelectedSeatServiceIds] = useState<Record<number, string>>({})
    const [selectedSeatPrices,     setSelectedSeatPrices]     = useState<Record<number, number>>({})

    // ── Modales ──────────────────────────────────────────────────────────────
    const [isFareRulesOpen, setIsFareRulesOpen] = useState(false)

    // ── Store Zustand ────────────────────────────────────────────────────────
    const selectedFlight    = useCartStore((s) => s.selectedFlight)
    const passengers        = useCartStore((s) => s.passengers)
    const contactInfo       = useCartStore((s) => s.contactInfo)
    const updatePassenger   = useCartStore((s) => s.updatePassenger)
    const updateContactInfo = useCartStore((s) => s.updateContactInfo)
    const travelportSessionId = useCartStore((s) => s.travelportSessionId)

    const { mutate: checkout, isPending: isCheckoutPending } = useFlightCheckout()

    useEffect(() => { setIsHydrated(true) }, [])

    const formatDuration = (totalMinutes: number) => {
        const hours   = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    }

    // ── Prix cumulés ─────────────────────────────────────────────────────────
    const insurancePrice         = insuranceSelected ? 12500 : 0
    const baggagePrice           = extraBaggage * 45000

    // Somme des montants de tous les sièges réservés
    const totalSeatsPrice        = Object.values(selectedSeatPrices).reduce((sum, price) => sum + price, 0)

    const totalFlightWithOptions = (selectedFlight?.price_details?.final_price_to_pay || 0) + insurancePrice + baggagePrice + totalSeatsPrice
    const finalTotalPrice         = bookingType === 'hold' ? RESERVATION_HOLD_FEE : totalFlightWithOptions

    // ── Codes Travelport ─────────────────────────────────────────────────────
    const fareSourceCode         = selectedFlight?.travelport?.gds_authority_value          || ''
    const fareSourceCodeInbound  = selectedFlight?.travelport?.gds_authority_value_inbound  || null

    // ── Checkout ─────────────────────────────────────────────────────────────
    const handleFinalCheckout = () => {
        const exactPaymentMethod = paymentMethod === 'momo' ? momoOperator : paymentMethod
        const cleanedPhone       = momoPhone.replace(/\s+/g, '').replace(/\D/g, '')
        const isMobileMoney      = ['momo', 'om', 'wave'].includes(exactPaymentMethod)
        const fullPhoneNumber    = isMobileMoney && cleanedPhone ? cleanedPhone : ''

        // ── CONSTRUCTION DU PAYLOAD SERVICES DYNAMIQUES PAR PASSAGER ─────────
        const extraServicesPayload: Record<string, any> = {}

        // Récupération linéaire et sécurisée de tous les segments du vol
        const allSegments = selectedFlight?.itinerary?.flatMap((it: any) => it.segments || []) || []

        passengers.forEach((_, passengerIdx) => {
            const pKey = passengerIdx + 1

            // 1. Extras Outbound (Repas & Bagages)
            const outboundExtras: any[] = []
            if (outboundMeal && outboundMeal !== 'NoMeal') {
                outboundExtras.push({
                    serviceId: outboundMeal,
                    quantity: "1",
                    segment: "0",
                })
            }
            if (extraBaggage > 0 && passengerIdx === 0) {
                outboundExtras.push({
                    serviceId: "XBPA",
                    quantity: String(extraBaggage),
                    segment: "0",
                })
            }

            // 2. Extras Inbound (Repas)
            const inboundExtras: any[] = []
            if (inboundMeal && inboundMeal !== 'NoMeal') {
                inboundExtras.push({
                    serviceId: inboundMeal,
                    quantity: "1",
                    segment: "0",
                })
            }

            // 3. Extraction, Tri et Alignement des Sièges par Direction
            const outboundSeats: string[] = []
            const inboundSeats: string[] = []

            const outboundCodes: string[] = []
            const inboundCodes: string[] = []

            const outboundPrices: number[] = []
            const inboundPrices: number[] = []

            // Utilisation explicite d'un Object.entries robuste
            Object.entries(selectedSeatServiceIds || {}).forEach(([segIdxStr, serviceId]) => {
                if (!serviceId) return

                const segIdx = Number(segIdxStr)
                const seatCode = selectedSeats?.[segIdx]
                const seatPrice = selectedSeatPrices?.[segIdx] || 0

                // 1. Récupération du segment pour ce vol précis
                const segmentDetails = allSegments[segIdx]

                // 2. Déduction ultra-sécurisée de la direction du segment courant
                let isOutboundSegment = true

                if (segmentDetails && typeof segmentDetails.direction === 'string') {
                    isOutboundSegment = segmentDetails.direction.toLowerCase() === 'outbound'
                } else {
                    // Fallback critique : si l'API ne fournit pas direction, on utilise les indices
                    // En supposant que l'itinéraire est divisé équitablement ou que l'index 0 est l'aller
                    isOutboundSegment = selectedFlight?.itinerary?.[0]?.segments?.some(
                        (s: any) => s.flight_number === segmentDetails?.flight_number
                    ) ?? (segIdx === 0)
                }

                // 3. Dispatching dans les bonnes structures
                if (isOutboundSegment) {
                    outboundSeats.push(serviceId)
                    if (seatCode) outboundCodes.push(seatCode)
                    outboundPrices.push(seatPrice)
                } else {
                    inboundSeats.push(serviceId)
                    if (seatCode) inboundCodes.push(seatCode)
                    inboundPrices.push(seatPrice)
                }
            })

            // Assignation forcée au format attendu par le contrôleur Laravel [[...]]
            extraServicesPayload[`ExtraServiceOutbound_${pKey}`] = [outboundExtras]
            extraServicesPayload[`ExtraServiceInbound_${pKey}`]  = [inboundExtras]

            extraServicesPayload[`SeatOutbound_${pKey}`]         = [outboundSeats]
            extraServicesPayload[`SeatInbound_${pKey}`]          = [inboundSeats]

            // Métadonnées triées pour la base de données
            extraServicesPayload [`SeatOutboundCode_${pKey}`]   = outboundCodes
            extraServicesPayload[`SeatOutboundPrice_${pKey}`]  = outboundPrices

            extraServicesPayload[`SeatInboundCode_${pKey}`]    = inboundCodes
            extraServicesPayload[`SeatInboundPrice_${pKey}`]   = inboundPrices
        })

        console.log("Payload final envoyé à la mutation :", extraServicesPayload)
/*        console.log("=== VÉRIFICATION DES SIÈGES EN CLAIR ===");
        console.log("ID Sièges Aller :", JSON.stringify(extraServicesPayload[`SeatOutbound_${pKey}`]));
        console.log("Codes Sièges Aller :", extraServicesPayload[`SeatOutboundCode_${pKey}`]);
        console.log("ID Sièges Retour :", JSON.stringify(extraServicesPayload[`SeatInbound_${pKey}`]));
        console.log("Codes Sièges Retour :", extraServicesPayload[`SeatInboundCode_${pKey}`]);*/
        checkout(
            {
                session_identifier: travelportSessionId,
                booking_type:       bookingType,
                payment_method:     exactPaymentMethod,
                phone_number:       fullPhoneNumber,
                selected_flight:    selectedFlight,
                finalpricetopay:    finalTotalPrice,
                contact_info:       contactInfo,
                passengers,
                insuranceSelected,
                extraBaggage,
                outboundMeal:       outboundMeal !== 'NoMeal' ? outboundMeal : null,
                inboundMeal:        inboundMeal  !== 'NoMeal' ? inboundMeal  : null,
                ...extraServicesPayload,
            },
            {
                onSuccess: (response: any) => {
                    if (response.status === 'redirect_required') {
                        window.location.href = response.redirect_url
                        return
                    }
                    if (response.status === 'waiting_confirmation') {
                        useCartStore.getState().clearCart()
                        router.push(`/flights/checkout/waiting?id=${response.booking_id}`)
                        return
                    }
                    toast.error('Statut de traitement inconnu, veuillez contacter le support.')
                },
                onError: (error: any) => {
                    toast.error(
                        error?.response?.data?.message ||
                        "Une erreur est survenue lors de l'initialisation de votre paiement."
                    )
                },
            }
        )
    }

    // ── Guards ───────────────────────────────────────────────────────────────
    if (!isHydrated) {
        return <div className="p-8 text-center font-medium">Chargement de votre panier...</div>
    }

    if (!selectedFlight) {
        return (
            <div className="p-12 text-center space-y-4">
                <p className="text-zinc-500 font-bold">Aucun vol n'a été sélectionné.</p>
                <Button onClick={() => router.push('/')} className="bg-[#15a4e6]">
                    Retourner à l'accueil
                </Button>
            </div>
        )
    }

    return (
        <div>
            <Header />

            <main className="w-full max-w-7xl mx-auto p-4 lg:py-8 text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-6">

                    {/* Stepper */}
                    <div className="flex items-center justify-between bg-white border border-zinc-200 p-4 rounded-xl shadow-sm">
                        {[
                            { id: 1, label: 'Passagers' },
                            { id: 2, label: 'Options'   },
                            { id: 3, label: 'Paiement'  },
                        ].map((s, i) => (
                            <React.Fragment key={s.id}>
                                <div className="flex items-center gap-2">
                                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                        step >= s.id ? 'bg-[#15a4e6] text-white' : 'bg-zinc-100 text-zinc-400'
                                    }`}>
                                        {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : s.id}
                                    </div>
                                    <span className={`text-xs font-semibold ${step >= s.id ? 'text-zinc-900' : 'text-zinc-400'}`}>
                                        {s.label}
                                    </span>
                                </div>
                                {i < 2 && <ArrowRight className="h-3 w-3 text-zinc-300 mx-2" />}
                            </React.Fragment>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">

                        {/* Étape 1 — Passagers */}
                        {step === 1 && (
                            <CheckoutStepPassenger
                                passengers={passengers}
                                contactInfo={contactInfo}
                                updatePassenger={updatePassenger}
                                updateContactInfo={updateContactInfo}
                                onNext={() => setStep(2)}
                            />
                        )}

                        {/* Étape 2 — Options */}
                        {step === 2 && (
                            <CheckoutStepOptions
                                sessionId={travelportSessionId ?? ''}
                                fareSourceCode={fareSourceCode}
                                selectedFlight={selectedFlight}
                                insuranceSelected={insuranceSelected}
                                setInsuranceSelected={setInsuranceSelected}
                                extraBaggage={extraBaggage}
                                setExtraBaggage={setExtraBaggage}
                                outboundMeal={outboundMeal}
                                setOutboundMeal={setOutboundMeal}
                                inboundMeal={inboundMeal}
                                setInboundMeal={setInboundMeal}
                                selectedSeatCode={selectedSeats}
                                onOpenSeatMap={(segmentIdx) => {
                                    setCurrentSegmentIdx(segmentIdx)
                                    setIsSeatMapOpen(true)
                                }}
                                onBack={() => setStep(1)}
                                onNext={() => setStep(3)}
                            />
                        )}

                        {/* Étape 3 — Paiement */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <CheckoutStepPayment
                                    bookingType={bookingType}
                                    setBookingType={setBookingType}
                                    paymentMethod={paymentMethod}
                                    setPaymentMethod={setPaymentMethod}
                                    momoOperator={momoOperator}
                                    setMomoOperator={setMomoOperator}
                                    momoPhone={momoPhone}
                                    setMomoPhone={setMomoPhone}
                                    finalTotalPrice={finalTotalPrice}
                                    onBack={() => setStep(2)}
                                    onSubmit={handleFinalCheckout}
                                    isCheckoutPending={isCheckoutPending}
                                />

                                {/* Règles tarifaires */}
                                <div className="bg-zinc-50 border border-zinc-200/60 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                                    <div className="flex items-start gap-2.5">
                                        <Scale className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-zinc-800">
                                                Règles d&apos;annulation & modifications
                                            </p>
                                            <p className="text-[11px] text-zinc-500 leading-normal">
                                                Ce tarif est soumis aux conditions d&apos;annulation et de non-présentation de la compagnie.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsFareRulesOpen(true)}
                                        className="text-xs font-bold text-[#15a4e6] hover:underline bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap"
                                    >
                                        Consulter les règles
                                    </button>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar récapitulatif */}
                <FlightSummarySidebar
                    selectedFlight={selectedFlight}
                    insuranceSelected={insuranceSelected}
                    insurancePrice={insurancePrice}
                    extraBaggage={extraBaggage}
                    baggagePrice={baggagePrice}
                    selectedSeat={Object.values(selectedSeats).filter(Boolean).join(' + ') || undefined}
                    seatPrice={totalSeatsPrice}
                    totalFlightWithOptions={totalFlightWithOptions}
                    bookingType={bookingType}
                    finalTotalPrice={finalTotalPrice}
                    reservationHoldFee={RESERVATION_HOLD_FEE}
                    formatDuration={formatDuration}
                />
            </main>

            <Footer />

            {/* Modal plan de cabine synchronisé sur segmentIdx */}
            <SeatMapDialog
                isOpen={isSeatMapOpen}
                onClose={() => setIsSeatMapOpen(false)}
                sessionId={travelportSessionId ?? ''}
                fareSourceCode={fareSourceCode}
                segmentIdx={currentSegmentIdx}
                selectedSeat={selectedSeats[currentSegmentIdx]}
                onSelectSeat={(seatCode, serviceId, amount) => {
                    setSelectedSeats(prev => ({ ...prev, [currentSegmentIdx]: seatCode }))
                    setSelectedSeatServiceIds(prev => ({ ...prev, [currentSegmentIdx]: serviceId }))
                    setSelectedSeatPrices(prev => ({ ...prev, [currentSegmentIdx]: amount || 0 }))
                }}
            />

            {/* Modal règles tarifaires */}
            <FareRulesDialog
                isOpen={isFareRulesOpen}
                onClose={() => setIsFareRulesOpen(false)}
                sessionId={travelportSessionId ?? ''}
                fareSourceCode={fareSourceCode}
                fareSourceCodeInbound={fareSourceCodeInbound}
            />
        </div>
    )
}