"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query"; // Ajout de useMutation
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Plane, User, CreditCard, Luggage, ShieldCheck,
    CheckCircle2, ArrowRight, Clock, Phone, Lock, Loader2
} from "lucide-react";
import { useCartStore } from "../../../../../core/store/useCartStore";
import {useFlightCheckout} from "../../../../../core/hooks/useFlightCheckout";
import {Header} from "../../../../../components/layout/Header";
import {Footer} from "../../../../../components/layout/Footer";
import {api} from "../../../../../core/api/axios-instance";
import {toast} from "sonner";
import {useState} from "react";

export default function FlightCheckoutPage() {
    const router = useRouter();
    const [bookingType, setBookingType] = useState<'now' | 'hold'>("now");
    // Zustand Hooks
    const selectedFlight = useCartStore((state) => state.selectedFlight);
    const passengers = useCartStore((state) => state.passengers);
    const contactInfo = useCartStore((state) => state.contactInfo);
    const updatePassenger = useCartStore((state) => state.updatePassenger);
    const updateContactInfo = useCartStore((state) => state.updateContactInfo);

    // États Locaux d'UI
    const [step, setStep] = React.useState<number>(1);
//  APRÈS (Typage strict aligné sur les exigences de la passerelle de paiement)
    const [paymentMethod, setPaymentMethod] = React.useState<'momo' | 'om' | 'wave' | 'card'>("momo");

// Si momoOperator ne prend que Orange Money ou Mobile Money MTN :
    const [momoOperator, setMomoOperator] = React.useState<'momo' | 'om'>("momo");
    const [momoPhone, setMomoPhone] = React.useState<string>("");
    const [insuranceSelected, setInsuranceSelected] = React.useState<boolean>(false);
    const [extraBaggage, setExtraBaggage] = React.useState<number>(0);
    const [isHydrated, setIsHydrated] = React.useState<boolean>(false);

    // Mutation Finale (Phase de paiement)
    const { mutate: checkout, isPending: isCheckoutPending } = useFlightCheckout();
    const RESERVATION_HOLD_FEE = 5000; // Frais fixes en XAF pour bloquer un billet
// 1. Récupération de l'identifiant depuis Zustand
    const travelportSessionId = useCartStore((state) => state.travelportSessionId);

    React.useEffect(() => {
        setIsHydrated(true);
    }, []);

    if (!isHydrated) {
        return <div className="p-8 text-center font-medium">Chargement de votre panier...</div>;
    }

    if (!selectedFlight) {
        return (
            <div className="p-12 text-center space-y-4">
                <p className="text-zinc-500 font-bold">Aucun vol n&apos;a été sélectionné.</p>
                <Button onClick={() => router.push("/")} className="bg-[#15a4e6]">Retourner à l&apos;accueil</Button>
            </div>
        );
    }

    const insurancePrice = insuranceSelected ? 12500 : 0;
    const baggagePrice = extraBaggage * 45000;

// Le prix total réel du voyage (Billet + Options)
    const totalFlightWithOptions = selectedFlight.price_details.final_price_to_pay + insurancePrice + baggagePrice;

// 🔥 Le montant exact à débiter IMMEDIATEMENT
    const finalTotalPrice = bookingType === "hold"
        ? RESERVATION_HOLD_FEE
        : totalFlightWithOptions;

    const formatDuration = (totalMinutes: number) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
    };




        const handleFinalCheckout = () => {
            // 1. Détermination de la méthode de paiement
            const exactPaymentMethod = paymentMethod === "momo" ? momoOperator : "card";

            // 2. Nettoyage du numéro de téléphone
            // On vire les espaces, et on s'assure de ne pas envoyer de symboles parasites.
            const cleanedPhone = momoPhone.replace(/\s+/g, "").replace(/^\+/, "");

            const isMobileMoney = ["momo", "om", "wave"].includes(exactPaymentMethod);
            const fullPhoneNumber = isMobileMoney && cleanedPhone ? cleanedPhone : undefined;

            // 3. Envoi sécurisé du payload à votre API/Mutation
            checkout(
                {
                    session_identifier: travelportSessionId,
                    booking_type: bookingType,               // 'now' ou 'hold'
                    payment_method: exactPaymentMethod,      // 'momo', 'om', 'wave' ou 'card'
                    phone_number: fullPhoneNumber || "",

                    selected_flight: {
                        ...selectedFlight,
                        price_details: {
                            ...selectedFlight.price_details,
                            // Le backend Laravel décide du montant selon le booking_type
                            final_price_to_pay: selectedFlight.price_details.final_price_to_pay,
                        },
                    },
                    contact_info: {
                        email: contactInfo.email,
                        phone: contactInfo.phone,
                    },
                    passengers: passengers,
                },
                {
                    onSuccess: (response) => {
                        // ------------------------------------------------------------
                        // CAS 1 : REDIRECTION BANCAIRE (Carte Visa / Mastercard)
                        // ------------------------------------------------------------
                        if (response.status === "redirect_required" && response.redirect_url) {
                            console.log("Redirection externe vers le 3D Secure...");

                            // window.location.href reste la méthode standard sous Next.js
                            // pour sortir de l'application vers un domaine externe (la banque).
                            window.location.href = response.redirect_url;
                            return;
                        }

                        // ------------------------------------------------------------
                        // CAS 2 : ATTENTE CONFIRMATION PIN (Momo, Orange, Wave)
                        // ------------------------------------------------------------
                        if (response.status === "waiting_confirmation") {
                            console.log("Push USSD lancé.");

                            // Optionnel : Vider le panier Zustand
                            // useCartStore.getState().clearCart();

                            // Next.js utilise router.push() à la place de navigate()
                            router.push(`/flights/checkout/waiting?id=${response.booking_id}`);
                            return;
                        }

                        toast("Statut de traitement inconnu, veuillez contacter le support.");
                    },
                    onError: (error:any) => {
                        console.error("Erreur durant le checkout final :", error);

                        const errorMessage = error?.response?.data?.message
                            || "Une erreur est survenue lors de l'initialisation de votre paiement. Veuillez réessayer.";

                        toast(errorMessage);
                    },
                }
            );
        };


    return (
        <>
            <Header />
            <div className="w-full max-w-7xl mx-auto p-4 lg:py-8 text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                <main className="lg:col-span-8 space-y-6">
                    {/* INDICATEUR D'ÉTAPES */}
                    <div className="flex items-center justify-between bg-white border border-zinc-200 p-4 rounded-xl shadow-sm">
                        {[
                            { id: 1, label: "Passagers" },
                            { id: 2, label: "Options" },
                            { id: 3, label: "Paiement" }
                        ].map((s) => (
                            <div key={s.id} className="flex items-center gap-2">
                                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                    step >= s.id ? "bg-[#15a4e6] text-white" : "bg-zinc-100 text-zinc-400"
                                }`}>
                                    {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : s.id}
                                </div>
                                <span className={`text-xs font-semibold ${step === s.id ? "text-zinc-900" : "text-zinc-400"}`}>
                                {s.label}
                            </span>
                                {s.id < 3 && <ArrowRight className="h-3 w-3 text-zinc-300 mx-2" />}
                            </div>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {/* ÉTAPE 1 : LISTE DYNAMIQUE DES PASSAGERS */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                                {passengers.map((passenger, index) => (
                                    <Card key={index} className="border-zinc-200 shadow-sm">
                                        <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
                                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                                                <User className="h-4 w-4 text-[#15a4e6]" /> Informations Voyageur ({index + 1})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Civilité</Label>
                                                <select
                                                    value={passenger.civility}
                                                    onChange={(e) => updatePassenger(index, { civility: e.target.value })}
                                                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#15a4e6]"
                                                >
                                                    <option value="M.">M.</option>
                                                    <option value="Mme">Mme</option>
                                                </select>
                                            </div>
                                            <div className="hidden md:block" />
                                            <div className="space-y-2">
                                                <Label>Prénom(s) (comme sur le passeport)</Label>
                                                <Input value={passenger.first_name} onChange={(e) => updatePassenger(index, { first_name: e.target.value })} placeholder="Ex: Lorenzo" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Nom(s)</Label>
                                                <Input value={passenger.last_name} onChange={(e) => updatePassenger(index, { last_name: e.target.value })} placeholder="Ex: Creativ" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Date de naissance</Label>
                                                <Input type="date" value={passenger.birth_date} onChange={(e) => updatePassenger(index, { birth_date: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Numéro de Passeport</Label>
                                                <Input value={passenger.passport_number} onChange={(e) => updatePassenger(index, { passport_number: e.target.value })} placeholder="N° de passeport obligatoire" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Contacts */}
                                <Card className="border-zinc-200 shadow-sm">
                                    <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-800">Coordonnées de Contact</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Adresse Email</Label>
                                            <Input type="email" value={contactInfo.email} onChange={(e) => updateContactInfo({ email: e.target.value })} placeholder="lorenzo@example.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Téléphone portable</Label>
                                            <Input type="tel" value={contactInfo.phone} onChange={(e) => updateContactInfo({ phone: e.target.value })} placeholder="+237 6xx xxx xxx" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Button
                                    onClick={() => setStep(2)}
                                    className="w-full md:w-auto bg-[#15a4e6] hover:bg-[#167f3c] text-white font-bold px-8 h-12 rounded-xl float-right"
                                >
                                    Continuer vers les options
                                </Button>
                            </motion.div>
                        )}

                        {/* ÉTAPE 2 : BAGAGES & ASSURANCES */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                                <Card className="border-zinc-200 shadow-sm">
                                    <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex gap-4">
                                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Luggage className="h-6 w-6" /></div>
                                            <div>
                                                <h4 className="font-bold text-zinc-900 text-sm">Bagages en soute supplémentaires</h4>
                                                <p className="text-xs text-zinc-400 mt-1">Ajoutez des pièces de 23kg supplémentaires gérées par Travelport+ GDS.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 border border-zinc-200 rounded-lg p-1 bg-zinc-50">
                                            <button onClick={() => setExtraBaggage(Math.max(0, extraBaggage - 1))} className="h-8 w-8 font-bold bg-white rounded border border-zinc-200 hover:bg-zinc-100 text-sm">-</button>
                                            <span className="w-6 text-center text-sm font-bold text-zinc-800">{extraBaggage}</span>
                                            <button onClick={() => setExtraBaggage(extraBaggage + 1)} className="h-8 w-8 font-bold bg-white rounded border border-zinc-200 hover:bg-zinc-100 text-sm">+</button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className={`border transition-colors shadow-sm ${insuranceSelected ? "border-blue-500 bg-blue-50/10" : "border-zinc-200"}`}>
                                    <CardContent className="p-6 flex items-start gap-4">
                                        <Checkbox id="insurance" checked={insuranceSelected} onCheckedChange={(checked) => setInsuranceSelected(!!checked)} className="mt-1" />
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                            <div className="md:col-span-3">
                                                <label htmlFor="insurance" className="font-bold text-zinc-900 text-sm flex items-center gap-2 cursor-pointer">
                                                    <ShieldCheck className="h-4 w-4 text-blue-600" /> Ajouter une Assurance Multirisque (+12 500 XAF)
                                                </label>
                                                <p className="text-xs text-zinc-400 mt-1">Couverture complète : Annulation de vol, assistance médicale d&apos;urgence et perte de bagages en soute.</p>
                                            </div>
                                            <div className="text-right font-bold text-blue-600 text-sm hidden md:block">12 500 XAF</div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex justify-between items-center pt-4">
                                    <Button variant="outline" onClick={() => setStep(1)} className="h-12 px-6 rounded-xl text-zinc-600">Retour</Button>
                                    <Button onClick={() => setStep(3)} className="bg-[#15a4e6] hover:bg-[#167f3c] text-white font-bold px-8 h-12 rounded-xl">Procéder au paiement</Button>
                                </div>
                            </motion.div>
                        )}

                        {/* ÉTAPE 3 : PAIEMENT FINTECH */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">

                                {/* CHOIX DU TYPE DE RÈGLEMENT */}
                                <Card className="border-zinc-200 shadow-sm">
                                    <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                                            Type de règlement
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <RadioGroup
                                            defaultValue="now"
                                            onValueChange={(val) => setBookingType(val as "now" | "hold")}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                            <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${bookingType === "now" ? "border-[#15a4e6] bg-emerald-50/10 shadow-sm" : "border-zinc-200"}`}>
                                                <RadioGroupItem value="now" id="pay_now" className="mt-1" />
                                                <div>
                                                    <span className="font-bold text-sm block text-zinc-900">Payer la totalité maintenant</span>
                                                    <span className="text-xs text-zinc-400 block mt-1">Votre billet électronique est émis et envoyé instantanément par e-mail.</span>
                                                </div>
                                            </label>

                                            <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${bookingType === "hold" ? "border-[#15a4e6] bg-amber-50/10 shadow-sm" : "border-zinc-200"}`}>
                                                <RadioGroupItem value="hold" id="pay_hold" className="mt-1" />
                                                <div>
                                                    <span className="font-bold text-sm block text-amber-600">Bloquer ce tarif & Réserver (+{(RESERVATION_HOLD_FEE ?? 0).toLocaleString()} XAF)</span>
                                                    <span className="text-xs text-zinc-500 block mt-1">
                                                    Évitez que le prix n'augmente. Bloquez vos places immédiatement en ne payant que les frais de réservation de {(RESERVATION_HOLD_FEE ?? 0).toLocaleString()} XAF. Vous solderez le reste plus tard.
                                                </span>
                                                </div>
                                            </label>
                                        </RadioGroup>
                                    </CardContent>
                                </Card>

                                {/* SECTION PAIEMENT */}
                                <Card className="border-zinc-200 shadow-sm">
                                    <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-[#15a4e6]" />
                                            {bookingType === "hold"
                                                ? `Règlement des frais de réservation (${(RESERVATION_HOLD_FEE ?? 0).toLocaleString()} XAF)`
                                                : "Méthode de Paiement Sécurisée"
                                            }
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <RadioGroup defaultValue="momo"
                                                    onValueChange={(val) => setPaymentMethod(val as "momo" | "om" | "wave" | "card")}
                                                    className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "momo" ? "border-[#15a4e6] bg-emerald-50/10 shadow-sm" : "border-zinc-200"}`}>
                                                <RadioGroupItem value="momo" id="momo" />
                                                <div>
                                                    <span className="font-bold text-sm block text-zinc-900">Mobile Money (MTN / Orange)</span>
                                                    <span className="text-xs text-zinc-400">Débit via USSD</span>
                                                </div>
                                            </label>
                                            <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "card" ? "border-[#15a4e6] bg-emerald-50/10 shadow-sm" : "border-zinc-200"}`}>
                                                <RadioGroupItem value="card" id="card" />
                                                <div>
                                                    <span className="font-bold text-sm block text-zinc-900">Carte Bancaire (Visa / Mastercard)</span>
                                                    <span className="text-xs text-zinc-400">3D Secure</span>
                                                </div>
                                            </label>
                                        </RadioGroup>

                                        {paymentMethod === "momo" ? (
                                            <div className="p-4 bg-zinc-50 rounded-xl border space-y-4">
                                                <div className="flex gap-4">
                                                    <button type="button" onClick={() => setMomoOperator("momo")} className={`px-4 py-2 rounded-lg font-bold text-xs border uppercase transition-all ${momoOperator === "momo" ? "bg-amber-400 border-amber-500 text-zinc-900" : "bg-white text-zinc-500"}`}>MTN MoMo</button>
                                                    <button type="button" onClick={() => setMomoOperator("om")} className={`px-4 py-2 rounded-lg font-bold text-xs border uppercase transition-all ${momoOperator === "om" ? "bg-orange-500 border-orange-600 text-white" : "bg-white text-zinc-500"}`}>Orange Money</button>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700"><Phone className="h-3.5 w-3.5 text-zinc-400" /> Numéro de téléphone payeur</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-2.5 text-sm font-bold text-zinc-400">+237</span>
                                                        <Input value={momoPhone} onChange={(e) => setMomoPhone(e.target.value)} className="pl-14 font-semibold" placeholder="6xx xxx xxx" maxLength={9} />
                                                    </div>
                                                    <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-1"><Lock className="h-3 w-3" /> Vous validerez le débit de {(finalTotalPrice ?? 0).toLocaleString()} XAF sur votre téléphone.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-zinc-50 rounded-xl border grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="md:col-span-3 space-y-2"><Label>Numéro de Carte</Label><Input placeholder="XXXX XXXX XXXX XXXX" /></div>
                                                <div className="space-y-2"><Label>Date d&apos;expiration</Label><Input placeholder="MM/AA" /></div>
                                                <div className="space-y-2"><Label>Code CVV</Label><Input placeholder="123" /></div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* BOUTONS D'ACTION */}
                                <div className="flex justify-between items-center pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(2)}
                                        disabled={isCheckoutPending}
                                        className="h-12 px-6 rounded-xl text-zinc-600"
                                    >
                                        Retour
                                    </Button>
                                    <Button
                                        onClick={handleFinalCheckout}
                                        disabled={isCheckoutPending}
                                        className="bg-[#15a4e6] hover:bg-[#167f3c] text-white font-bold px-10 h-12 rounded-xl shadow-md flex items-center gap-2"
                                    >
                                        {isCheckoutPending
                                            ? "Traitement en cours..."
                                            : `Confirmer et Régler ${(finalTotalPrice ?? 0).toLocaleString()} XAF`
                                        }
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* SIDEBAR DE DROITE DEVENUE ULTRA-RESILIENTE */}
                <aside className="lg:col-span-4 space-y-4 sticky top-6">
                    {selectedFlight && (
                        <Card className="border-zinc-200 shadow-sm overflow-hidden bg-white">
                            <div className="bg-zinc-900 text-white p-4">
                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#15a4e6]">
                                    <span>Résumé du Vol</span>
                                    <span className="bg-white/10 px-2 py-0.5 rounded text-white font-medium">
                                    {selectedFlight.itinerary?.[0]?.segments?.[0]?.airline_code ?? "GDS"}{' '}
                                        {selectedFlight.itinerary?.[0]?.segments?.[0]?.flight_number ?? ""}
                                </span>
                                </div>
                                <div className="mt-4 flex items-center justify-between gap-2">
                                    <div>
                                        <div className="text-xl font-black">
                                            {selectedFlight.itinerary?.[0]?.segments?.[0]?.departure?.time ? (
                                                new Date(selectedFlight.itinerary[0].segments[0].departure.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            ) : (
                                                "--:--"
                                            )}
                                        </div>
                                        <div className="text-xs font-bold text-zinc-400 mt-0.5">
                                            {selectedFlight.itinerary?.[0]?.segments?.[0]?.departure?.airport  ?? "N/A"}
                                        </div>
                                    </div>
                                    <div className="flex-1 text-center px-2">
                                    <span className="text-[10px] text-zinc-400 flex items-center justify-center gap-1">
                                       <Clock className="h-3 w-3" /> {
                                        typeof selectedFlight.itinerary?.[0]?.segments?.[0]?.duration === 'number'
                                            ? formatDuration(selectedFlight.itinerary[0].segments[0].duration)
                                            : (selectedFlight.itinerary?.[0]?.segments?.[0]?.duration || "N/A")
                                    }
                                    </span>
                                        <div className="w-full border-t border-dashed border-white/20 my-1 relative">
                                            <Plane className="h-3 w-3 absolute -top-1.5 left-1/2 -translate-x-1/2 rotate-45 text-[#15a4e6]" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-black">
                                            {(() => {
                                                const segments = selectedFlight.itinerary?.[0]?.segments ?? [];
                                                const lastSegment = segments[segments.length - 1];
                                                return lastSegment?.arrival?.time ? (
                                                    new Date(lastSegment.arrival.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                ) : (
                                                    "--:--"
                                                );
                                            })()}
                                        </div>
                                        <div className="text-xs font-bold text-zinc-400 mt-0.5">
                                            {(() => {
                                                const segments = selectedFlight.itinerary?.[0]?.segments ?? [];
                                                return segments[segments.length - 1]?.arrival?.airport  ?? "N/A";
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION FINANCIERE SECURISÉE CONTRE LES DATA UNDEFINED */}
                            <CardContent className="p-4 space-y-3 text-sm">
                                <div className="flex justify-between text-zinc-600">
                                    <span>Tarif de base</span>
                                    <span className="font-medium">
                                    {(selectedFlight.price_details?.base_price ?? 0).toLocaleString()} F
                                </span>
                                </div>
                                <div className="flex justify-between text-zinc-600">
                                    <span>Taxes aéroportuaires</span>
                                    <span className="font-medium">
                                    {(selectedFlight.price_details?.taxes ?? 0).toLocaleString()} F
                                </span>
                                </div>
                                <div className="flex justify-between text-zinc-600">
                                    <span>Frais de service agence</span>
                                    <span className="font-medium">
                                    {(selectedFlight.price_details?.agency_fees ?? 0).toLocaleString()} F
                                </span>
                                </div>

                                {extraBaggage > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-medium bg-emerald-50/40 p-1.5 rounded text-xs">
                                        <span>Bagage sup. (x{extraBaggage})</span>
                                        <span>+{(baggagePrice ?? 0).toLocaleString()} F</span>
                                    </div>
                                )}
                                {insuranceSelected && (
                                    <div className="flex justify-between text-blue-600 font-medium bg-blue-50/40 p-1.5 rounded text-xs">
                                        <span>Assurance Multirisque</span>
                                        <span>+{(insurancePrice ?? 0).toLocaleString()} F</span>
                                    </div>
                                )}

                                <hr className="border-zinc-100 my-2" />

                                {/* BLOC DE CALCUL DYNAMIQUE: HOLD ACOMPTE VS COMPLET */}
                                {bookingType === "hold" ? (
                                    <div className="space-y-2 bg-amber-50/60 p-3 rounded-xl border border-amber-200 text-xs">
                                        <div className="flex justify-between text-zinc-600">
                                            <span>Total de la commande :</span>
                                            <span className="font-semibold text-zinc-900">
                                            {(totalFlightWithOptions ?? 0).toLocaleString()} F
                                        </span>
                                        </div>
                                        <div className="flex justify-between text-zinc-600">
                                            <span>Frais de réservation payés :</span>
                                            <span className="font-semibold text-zinc-900">
                                            -{(RESERVATION_HOLD_FEE ?? 0).toLocaleString()} F
                                        </span>
                                        </div>
                                        <div className="flex justify-between text-amber-800 font-bold bg-amber-100/50 p-1.5 rounded">
                                            <span>Reste à solder plus tard :</span>
                                            <span>
                                            {((totalFlightWithOptions ?? 0) - (RESERVATION_HOLD_FEE ?? 0)).toLocaleString()} F
                                        </span>
                                        </div>
                                        <hr className="border-amber-200 my-1" />
                                        <div className="flex justify-between items-baseline pt-1">
                                            <span className="font-bold text-amber-950 text-sm">Acompte à payer aujourd'hui</span>
                                            <div className="text-right">
                                            <span className="text-2xl font-black text-amber-600 tracking-tight">
                                                {(RESERVATION_HOLD_FEE ?? 0).toLocaleString()}
                                            </span>
                                                <span className="text-xs font-bold text-amber-700 uppercase ml-1">XAF</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-baseline pt-1">
                                        <span className="font-bold text-zinc-900">Montant total à payer</span>
                                        <div className="text-right">
                                        <span className="text-2xl font-black text-[#15a4e6] tracking-tight">
                                            {(finalTotalPrice ?? 0).toLocaleString()}
                                        </span>
                                            <span className="text-xs font-bold text-zinc-500 uppercase ml-1">
                                            {selectedFlight.price_details?.currency || "XAF"}
                                        </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </aside>
            </div>
            <Footer />
        </>
    );
}