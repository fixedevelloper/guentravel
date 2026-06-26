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
import { CheckoutStepOptions } from './CheckoutStepOptions'
import { CheckoutStepPayment } from './CheckoutStepPayment'
import { FlightSummarySidebar } from './FlightSummarySidebar'
import { FareRulesDialog } from "./FareRulesDialog"

const RESERVATION_HOLD_FEE = 5000

export default function FlightCheckoutPage() {
    const router = useRouter()

    const [bookingType, setBookingType] = useState<'now' | 'hold'>('now')
    const [step, setStep] = useState(1)
    const [paymentMethod, setPaymentMethod] = useState<'momo' | 'om' | 'wave' | 'card'>('momo')
    const [momoOperator, setMomoOperator] = useState<'momo' | 'om'>('momo')
    const [momoPhone, setMomoPhone] = useState('')
    const [insuranceSelected, setInsuranceSelected] = useState(false)
    const [extraBaggage, setExtraBaggage] = useState(0)
    const [isHydrated, setIsHydrated] = useState(false)
// À ajouter au niveau de vos autres useState (comme insuranceSelected, extraBaggage...)
    const [outboundMeal, setOutboundMeal] = React.useState<string>("");
    const [inboundMeal, setInboundMeal] = React.useState<string>("");
    // État pour contrôler l'affichage des règles tarifaires (Fare Rules)
    const [isFareRulesOpen, setIsFareRulesOpen] = useState(false)

    const selectedFlight = useCartStore((state) => state.selectedFlight)
    const passengers = useCartStore((state) => state.passengers)
    const contactInfo = useCartStore((state) => state.contactInfo)
    const updatePassenger = useCartStore((state) => state.updatePassenger)
    const updateContactInfo = useCartStore((state) => state.updateContactInfo)
    const travelportSessionId = useCartStore((state) => state.travelportSessionId)

    const { mutate: checkout, isPending: isCheckoutPending } = useFlightCheckout()

    useEffect(() => {
        setIsHydrated(true)
    }, [])

    const formatDuration = (totalMinutes: number) => {
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    }

    const insurancePrice = insuranceSelected ? 12500 : 0
    const baggagePrice = extraBaggage * 45000
    const totalFlightWithOptions = (selectedFlight?.price_details?.final_price_to_pay || 0) + insurancePrice + baggagePrice
    const finalTotalPrice = bookingType === 'hold' ? RESERVATION_HOLD_FEE : totalFlightWithOptions

    // Extraction sécurisée des codes requis pour TravelNext
    const fareSourceCode = selectedFlight?.travelport?.gds_authority_value || ''
    const fareSourceCodeInbound = selectedFlight?.travelport?.gds_authority_value_inbound || null

    const handleFinalCheckout = () => {
        const exactPaymentMethod = paymentMethod === 'momo' ? momoOperator : paymentMethod
        const cleanedPhone = momoPhone.replace(/\s+/g, '').replace(/\D/g, '')
        const isMobileMoney = ['momo', 'om', 'wave'].includes(exactPaymentMethod)
        const fullPhoneNumber = isMobileMoney && cleanedPhone ? cleanedPhone : ''

        checkout(
            {
                session_identifier: travelportSessionId,
                booking_type: bookingType,
                payment_method: exactPaymentMethod,
                phone_number: fullPhoneNumber,
                selected_flight: selectedFlight,
                finalpricetopay: selectedFlight?.price_details?.final_price_to_pay,
                contact_info: contactInfo,
                passengers,
                insuranceSelected,
                extraBaggage,
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
                    <div className="flex items-center justify-between bg-white border border-zinc-200 p-4 rounded-xl shadow-sm">
                        {[
                            { id: 1, label: 'Passagers' },
                            { id: 2, label: 'Options' },
                            { id: 3, label: 'Paiement' },
                        ].map((s, i) => (
                            <React.Fragment key={s.id}>
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                            step >= s.id ? 'bg-[#15a4e6] text-white' : 'bg-zinc-100 text-zinc-400'
                                        }`}
                                    >
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
                        {step === 1 && (
                            <CheckoutStepPassenger
                                passengers={passengers}
                                contactInfo={contactInfo}
                                // 🔥 Alignement parfait et sécurisé des actions Zustand passées à l'enfant
                                updatePassenger={updatePassenger}
                                updateContactInfo={updateContactInfo}
                                onNext={() => {
                                    // Optionnel : Vous pouvez ajouter ici une logique de validation locale avant de passer au step 2
                                    setStep(2)
                                }}
                            />
                        )}

                        {step === 2 && (
                            <CheckoutStepOptions
                                insuranceSelected={insuranceSelected}
                                setInsuranceSelected={setInsuranceSelected}
                                extraBaggage={extraBaggage}
                                setExtraBaggage={setExtraBaggage}
                                // 🔥 Ajout des propriétés manquantes :
                                outboundMeal={outboundMeal}
                                setOutboundMeal={setOutboundMeal}
                                inboundMeal={inboundMeal}
                                setInboundMeal={setInboundMeal}
                                onBack={() => setStep(1)}
                                onNext={() => setStep(3)}
                                fareSourceCode={fareSourceCode}
                                sessionId={travelportSessionId ?? ''}
                            />
                        )}

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

                                {/* Alerte légale de réassurance contextuelle sur le récapitulatif de paiement */}
                                <div className="bg-zinc-50 border border-zinc-200/60 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                                    <div className="flex items-start gap-2.5">
                                        <Scale className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-zinc-800">Règles d&apos;annulation & modifications</p>
                                            <p className="text-[11px] text-zinc-500 leading-normal">
                                                Ce tarif est soumis aux conditions d&apos;annulation et de non-présentation (no-show) de la compagnie aérienne.
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

                <FlightSummarySidebar
                    selectedFlight={selectedFlight}
                    insuranceSelected={insuranceSelected}
                    insurancePrice={insurancePrice}
                    extraBaggage={extraBaggage}
                    baggagePrice={baggagePrice}
                    totalFlightWithOptions={totalFlightWithOptions}
                    bookingType={bookingType}
                    finalTotalPrice={finalTotalPrice}
                    reservationHoldFee={RESERVATION_HOLD_FEE}
                    formatDuration={formatDuration}
                />
            </main>

            <Footer />

            {/* Modal des conditions tarifaires injecté globalement à la racine du DOM de checkout */}
            <FareRulesDialog
                isOpen={isFareRulesOpen}
                onClose={() => setIsFareRulesOpen(false)}
                sessionId={travelportSessionId ?? ""}
                fareSourceCode={fareSourceCode}
                fareSourceCodeInbound={fareSourceCodeInbound}
            />
        </div>
    )
}