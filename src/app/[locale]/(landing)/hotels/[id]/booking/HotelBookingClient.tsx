"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { BookingRoom, PaxInfo } from "@/types/hotel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    MapPin, Star, BedDouble, Loader2, ChevronRight,
    ShieldCheck, User, Info, Lock, Timer, Calendar, RefreshCw, CheckCircle2
} from "lucide-react";
import { useHotelBook } from "../../../../../../core/hooks/useHotelBook";
import Image from "next/image";
import { useSearchStore } from "../../../../../../core/store/useSearchStore";
import { useCartHotelStore } from "../../../../../../core/store/useCartHotelStore";

interface Props {
    rateBasisId: string;
}

const emptyPax = (): PaxInfo => ({ title: "Mr", first_name: "", last_name: "" });

export function HotelBookingClient({ rateBasisId }: Props) {
    const router = useRouter();
    const cart = useCartHotelStore((state) => state.cart);
    const selectedRate = cart?.selectedRate;

    // Récupération et actions du store de recherche
    const { check_in, check_out, days, occupancy, setSearchPeriod, setOccupancy } = useSearchStore();
    const { book, loading: booking, error: bookingError } = useHotelBook();

    // États du cycle de réservation (0: Dispo & Modif, 1: Voyageurs, 2: Paiement)
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [note, setNote] = useState("");

    // États locaux pour le formulaire de modification de recherche (Étape 0)
    const [localCheckIn, setLocalCheckIn] = useState(check_in);
    const [localCheckOut, setLocalCheckOut] = useState(check_out);
    const [checkingDispo, setCheckingDispo] = useState(false);
    const [dispoVerified, setDispoVerified] = useState(false);

    // Initialisation synchrone des voyageurs
    const [rooms, setRooms] = useState<BookingRoom[]>([]);

    // Générer les formulaires passagers dès que l'occupation du store change
    useEffect(() => {
        setRooms(
            occupancy.map((room) => ({
                room_no: room.room_no,
                adults: Array.from({ length: room.adult }, emptyPax),
                children: Array.from({ length: room.child || 0 }, emptyPax),
            }))
        );
    }, [occupancy]);

    // Simulation d'une vérification de disponibilité en temps réel auprès de l'API
    const handleVerifyAvailability = async () => {
        setCheckingDispo(true);
        setDispoVerified(false);

        // Applique les modifications de dates locales au store de recherche global
        setSearchPeriod(localCheckIn, localCheckOut);

        try {
            // Simulez ici l'appel vers votre méthode API checkAvailability({ product_id, check_in... })
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setDispoVerified(true);
            setStep(1); // Passe automatiquement à l'étape Voyageurs si ok
        } catch (error) {
            console.error("Chambre non disponible aux dates sélectionnées", error);
        } finally {
            setCheckingDispo(false);
        }
    };

    const updatePax = (roomIdx: number, type: "adults" | "children", paxIdx: number, field: keyof PaxInfo, value: string) => {
        setRooms((prev) => {
            const updated = structuredClone(prev);
            updated[roomIdx][type]![paxIdx][field] = value;
            return updated;
        });
    };

    const isStep1Valid = rooms.length > 0 && rooms.every((room) =>
        room.adults.every((p) => p.first_name.trim() && p.last_name.trim()) &&
        (room.children ?? []).every((p) => p.first_name.trim() && p.last_name.trim())
    );

    const isStep2Valid = email.includes("@") && phone.trim().length > 6;

    const formatPrice = (amount: number, currency: string) => {
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
    };

    const handleBook = async () => {
        if (!cart) return;

        const result = await book({
            session_id:    cart.sessionId,
            product_id:    cart.productId,
            token_id:      cart.tokenId,
            rate_basis_id: cart.selectedRate.rate_basis_id,
            hotel_id:      cart.hotelId,
            client_ref:    `REF-${Date.now()}`,
            customer_email: email,
            customer_phone: phone,
            booking_note:  note,
            net_price:     cart.selectedRate.net_price,
            fare_type:     cart.selectedRate.fare_type,
            payment_method: 'momo',
            currency:      'XAF',
            check_in,
            check_out,
            days,
            rooms,
        });

        if (result) {
            router.push(`/hotels/waiting?booking_id=${result.booking_id}&session=${result.session_id}`);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50/60 antialiased pb-12">

            {/* Header Étapes */}
            <div className="bg-white border-b border-zinc-200/80 sticky top-0 z-40 backdrop-blur-md bg-white/90">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 hover:bg-zinc-100 rounded-xl transition text-zinc-500 hover:text-zinc-800">
                            <ChevronRight className="h-5 w-5 rotate-180" />
                        </button>
                        <h1 className="font-black text-zinc-900 tracking-tight text-base sm:text-lg">
                            Séjour à {cart?.city || "l'hôtel"}
                        </h1>
                    </div>

                    {/* Stepper étendu à 3 étapes */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        {[
                            { n: 0, label: "Disponibilité" },
                            { n: 1, label: "Voyageurs" },
                            { n: 2, label: "Paiement" },
                        ].map(({ n, label }) => (
                            <div key={n} className="flex items-center gap-2">
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-black tracking-tight transition-colors ${step >= n ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400"}`}>
                                    {n === 0 && dispoVerified ? <CheckCircle2 size={12} className="text-emerald-400" /> : n + 1}
                                </div>
                                <span className={`text-xs font-bold hidden md:block ${step >= n ? "text-zinc-900" : "text-zinc-400"}`}>{label}</span>
                                {n < 2 && <ChevronRight className="h-3 w-3 text-zinc-300" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-amber-50/60 border-b border-amber-100 px-4 py-2 flex items-center justify-center gap-2 text-amber-800 text-xs font-semibold">
                <Timer size={14} className="animate-pulse text-amber-600" />
                <span>Tarif bloqué et garanti pendant encore 14:59 minutes.</span>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Formulaire Principal adaptatif */}
                <div className="lg:col-span-8 space-y-6">

                    {/* ÉTAPE 0 : Formulaire de Modification & Disponibilité */}
                    {step === 0 && (
                        <div className="bg-white rounded-3xl border border-zinc-200/60 shadow-sm p-6 space-y-6 animate-fade-in">
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-zinc-900 tracking-tight">Vérification de la chambre</h2>
                                <p className="text-xs text-zinc-400 font-medium">Ajustez vos dates de séjour si nécessaire avant de lancer la réservation définitive.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-zinc-700 flex items-center gap-1"><Calendar size={12}/> Arrivée</Label>
                                    <Input type="date" value={localCheckIn} onChange={(e) => setLocalCheckIn(e.target.value)} className="rounded-xl border-zinc-200" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-zinc-700 flex items-center gap-1"><Calendar size={12}/> Départ</Label>
                                    <Input type="date" value={localCheckOut} onChange={(e) => setLocalCheckOut(e.target.value)} className="rounded-xl border-zinc-200" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-zinc-700">Durée du séjour</Label>
                                    <div className="h-10 px-3 flex items-center bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600">
                                        {days} nuit{days > 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleVerifyAvailability} disabled={checkingDispo} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-6 text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2">
                                {checkingDispo ? (
                                    <><RefreshCw className="h-4 w-4 animate-spin" /> Vérification des stocks API...</>
                                ) : (
                                    <>Confirmer la disponibilité et continuer</>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* ÉTAPE 1 : Liste des Voyageurs */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-black text-zinc-900 tracking-tight">Qui voyage ?</h2>
                                    <p className="text-xs text-zinc-400 font-medium">Saisissez les noms exactement tels qu'ils apparaissent sur les passeports.</p>
                                </div>
                                <button onClick={() => setStep(0)} className="text-xs font-bold text-zinc-500 underline flex items-center gap-1"><RefreshCw size={12}/> Modifier les dates</button>
                            </div>

                            {rooms.map((room, rIdx) => (
                                <div key={rIdx} className="bg-white rounded-3xl border border-zinc-200/60 shadow-sm overflow-hidden">
                                    <div className="bg-zinc-50/80 px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 bg-white text-zinc-950 border border-zinc-100 rounded-lg"><BedDouble size={14} /></div>
                                            <span className="font-bold text-zinc-800 text-sm">Chambre {room.room_no}</span>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-6 divide-y divide-zinc-100">
                                        {room.adults.map((pax, pIdx) => (
                                            <div key={`ad-${pIdx}`} className={`${pIdx > 0 ? "pt-6" : ""}`}>
                                                <PaxFields label={`Adulte ${pIdx + 1}`} pax={pax} onChange={(field, val) => updatePax(rIdx, "adults", pIdx, field, val)} />
                                            </div>
                                        ))}
                                        {room.children?.map((pax, pIdx) => (
                                            <div key={`ch-${pIdx}`} className="pt-6">
                                                <PaxFields label={`Enfant ${pIdx + 1}`} pax={pax} isChild onChange={(field, val) => updatePax(rIdx, "children", pIdx, field, val)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <Button onClick={() => setStep(2)} disabled={!isStep1Valid} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-6 text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm flex items-center justify-center gap-2">
                                Continuer vers le paiement <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {/* ÉTAPE 2 : Facturation & Lancement du Process Asynchrone */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <button onClick={() => setStep(1)} className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-900">
                                <ChevronRight className="h-3 w-3 rotate-180" /> Modifier les voyageurs
                            </button>

                            <div className="bg-white rounded-3xl border border-zinc-200/60 shadow-sm p-6 space-y-6">
                                <div className="space-y-1">
                                    <h2 className="text-base font-black text-zinc-900 flex items-center gap-2">
                                        <User className="h-4 w-4 text-zinc-900" /> Coordonnées de facturation
                                    </h2>
                                    <p className="text-[11px] text-zinc-400 font-medium">Les billets et confirmations de séjour seront envoyés à ces adresses.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-zinc-700">Adresse Email *</Label>
                                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@exemple.com" className="rounded-xl border-zinc-200 text-sm" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-zinc-700">Téléphone portable *</Label>
                                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+237 6xx xx xx xx" className="rounded-xl border-zinc-200 text-sm" />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <Label className="text-xs font-bold text-zinc-700">Demandes spéciales (Optionnel)</Label>
                                        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex: lits jumeaux, arrivée tardive..." className="rounded-xl border-zinc-200 text-sm" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-100 border border-zinc-200/60 rounded-2xl p-4 flex items-start gap-3">
                                <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                                <p className="text-[11px] text-zinc-500 leading-relaxed">
                                    En cliquant sur confirmer, vous acceptez les politiques de non-présentation et les conditions d'annulation récapitulées sur la droite.
                                </p>
                            </div>

                            {bookingError && (
                                <div className="text-rose-600 text-xs font-medium text-center bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 flex items-center gap-2">
                                    <Info size={14} className="shrink-0" /> <span>{bookingError}</span>
                                </div>
                            )}

                            <Button onClick={handleBook} disabled={!isStep2Valid || booking} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md flex items-center justify-center gap-2">
                                {booking ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Génération de la demande de débit...</>
                                ) : (
                                    <><Lock className="h-4 w-4" /> Confirmer la réservation et payer par Mobile Money</>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Sidebar Récapitulatif d'Achat */}
                <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
                    <div className="bg-white rounded-3xl border border-zinc-200/60 shadow-sm overflow-hidden">
                        <div className="relative w-full h-36 bg-zinc-100">
                            {cart?.hotelImages?.[0] && (
                                <Image src={cart.hotelImages[0]} alt={cart.hotelName} fill className="object-cover" sizes="25vw" priority />
                            )}
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="space-y-1">
                                {cart?.rating && cart.rating > 0 && (
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: cart.rating }).map((_, i) => (
                                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                )}
                                <h3 className="font-black text-zinc-900 text-sm tracking-tight leading-tight">{cart?.hotelName}</h3>
                                <p className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                                    <MapPin size={12} className="text-zinc-500" /> {cart?.city}
                                </p>
                            </div>

                            <hr className="border-zinc-100" />

                            {/* Résumé Temporel Actuel */}
                            <div className="text-xs text-zinc-600 font-semibold space-y-1.5 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                                <div className="flex justify-between"><span>Du:</span> <span className="text-zinc-900">{check_in}</span></div>
                                <div className="flex justify-between"><span>Au:</span> <span className="text-zinc-900">{check_out}</span></div>
                                <div className="flex justify-between border-t border-zinc-200/60 pt-1 mt-1 text-[11px] text-zinc-400">
                                    <span>Total:</span> <span className="font-black text-zinc-700">{days} nuit{days > 1 ? 's' : ''}</span>
                                </div>
                            </div>

                            {/* Éclatement Financier Stable */}
                            <div className="border-t border-zinc-100 pt-4 space-y-2.5">
                                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Détails du prix</h4>
                                {selectedRate && (
                                    <div className="space-y-2 bg-zinc-50/50 p-3 rounded-2xl border border-zinc-100 text-xs">
                                        <div className="flex justify-between font-medium text-zinc-500">
                                            <span>Tarif de la chambre</span>
                                            <span>{formatPrice(selectedRate.net_price, selectedRate.currency)}</span>
                                        </div>
                                        <div className="flex justify-between font-medium text-zinc-500">
                                            <span>Frais & Taxes</span>
                                            <span className="text-emerald-600 font-bold">Inclus</span>
                                        </div>
                                        <hr className="border-zinc-200/60 my-1" />
                                        <div className="flex justify-between items-baseline pt-1">
                                            <span className="font-black text-zinc-900 text-sm">Prix total TTC</span>
                                            <span className="text-xl font-black text-zinc-900 tracking-tight">
                                                {formatPrice(selectedRate.net_price, selectedRate.currency)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

// Composant Inputs Voyageurs
function PaxFields({ label, pax, isChild = false, onChange }: { label: string; pax: PaxInfo; isChild?: boolean; onChange: (field: keyof PaxInfo, value: string) => void; }) {
    const TITLES = isChild ? ["Master", "Miss"] : ["Mr", "Mrs", "Ms", "Miss", "Dr", "Prof"];

    return (
        <div className="space-y-2.5">
            <Label className={`text-xs font-bold uppercase tracking-wider ${isChild ? "text-amber-600" : "text-zinc-400"}`}>{label}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                    <Select value={pax.title} onValueChange={(v) => onChange("title", v)}>
                        <SelectTrigger className="rounded-xl border-zinc-200 shadow-none text-sm focus:ring-zinc-900">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {TITLES.map((t) => (
                                <SelectItem key={t} value={t} className="text-xs font-medium rounded-lg">{t}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="sm:col-span-1.5">
                    <Input placeholder="Prénom" value={pax.first_name} onChange={(e) => onChange("first_name", e.target.value)} className="rounded-xl border-zinc-200 text-sm focus-visible:ring-zinc-900" />
                </div>
                <div className="sm:col-span-1.5">
                    <Input placeholder="Nom de famille" value={pax.last_name} onChange={(e) => onChange("last_name", e.target.value)} className="rounded-xl border-zinc-200 text-sm focus-visible:ring-zinc-900" />
                </div>
            </div>
        </div>
    );
}