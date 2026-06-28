"use client";

import React, { useMemo } from "react";
import { HotelGallery } from "@/components/hotel/HotelGallery";
import { HotelInfo } from "@/components/hotel/HotelInfo";
import { RoomRatesList } from "@/components/hotel/RoomRatesList";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, ArrowRight, Zap } from "lucide-react";
import { useHotelDetails } from "../../../../../core/hooks/useHotelDetails";
import { useRoomRates } from "../../../../../core/hooks/useRoomRates";
import { HotelErrorState } from "./HotelErrorState";
import { useSearchStore } from "../../../../../core/store/useSearchStore"; // Import du store d'occupation

interface Props {
    hotelId:   string;
    tokenId:   string;
    productId: string;
    sessionId: string;
}

export function HotelDetailsClient({
                                       hotelId, tokenId, productId, sessionId
                                   }: Props) {

    // Récupération de l'occupation actuelle de la recherche depuis le store Zustand
    const occupancy = useSearchStore((state) => state.occupancy);

    const detailsParams = useMemo(() => ({
        hotel_id: hotelId,
        token_id: tokenId,
        product_id: productId,
        session_id: sessionId
    }), [hotelId, tokenId, productId, sessionId]);

    const { data: hotel, isLoading: loadingHotel, error: hotelError } =
        useHotelDetails(detailsParams);

    const { loading: loadingRates, groupedByRoomType, roomRates } =
        useRoomRates(detailsParams);

    // Calcul du prix d'appel le plus bas pour la sidebar de conversion (protection contre les valeurs nulles)
    const lowestPrice = useMemo(() => {
        if (!roomRates || roomRates.length === 0) return null;
        // Correction : Utiliser net_price ou total selon votre structure de prix d'API
        return Math.min(...roomRates.map(r => r.net_price || 0));
    }, [roomRates]);

    if (hotelError) {
        return <HotelErrorState hotelError={hotelError} />;
    }

    return (
        <div className="min-h-screen bg-zinc-50/40 pb-16 antialiased">

            {/* Barre d'action flottante / Contextuelle supérieure */}
            {!loadingHotel && hotel && (
                <div className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200/60 hidden md:block transition-all duration-300 animate-fade-in">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Vous consultez</span>
                            <h2 className="text-sm font-bold text-zinc-800 tracking-tight truncate max-w-md">{hotel.name}</h2>
                        </div>
                        <button
                            onClick={() => document.getElementById("rates-section")?.scrollIntoView({ behavior: "smooth" })}
                            className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 group"
                        >
                            Sélectionner une chambre
                            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">

                {/* Galerie Premium */}
                {loadingHotel ? (
                    <Skeleton className="w-full h-[480px] rounded-3xl shadow-inner bg-zinc-200/80" />
                ) : hotel ? (
                    <div className="rounded-3xl overflow-hidden shadow-sm border border-zinc-200/40 bg-white">
                        <HotelGallery images={hotel.images || []} name={hotel.name} />
                    </div>
                ) : null}

                {/* Structure principale : Layout Scindé Asymétrique */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Colonne Principale (Gauche - 66%) */}
                    <div className="lg:col-span-8 space-y-8">
                        {loadingHotel ? (
                            <div className="space-y-6 bg-white p-8 rounded-3xl border border-zinc-200/50 shadow-sm">
                                <Skeleton className="h-8 w-1/3 rounded-lg" />
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-full rounded" />
                                    <Skeleton className="h-4 w-full rounded" />
                                    <Skeleton className="h-4 w-4/5 rounded" />
                                </div>
                                <hr className="border-zinc-100" />
                                <div className="grid grid-cols-3 gap-4">
                                    <Skeleton className="h-12 rounded-xl" />
                                    <Skeleton className="h-12 rounded-xl" />
                                    <Skeleton className="h-12 rounded-xl" />
                                </div>
                            </div>
                        ) : hotel ? (
                            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/50 shadow-sm transition-all duration-300">
                                <HotelInfo hotel={hotel} />
                            </div>
                        ) : null}
                    </div>

                    {/* Sidebar de Conversion / Panneau d'achat Épuré (Droite - 33%) */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-[90px] space-y-6">
                        <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-sm space-y-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 border border-emerald-100/40 px-2 py-0.5 rounded-md">
                                        Meilleur tarif garanti
                                    </span>
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide pt-1">À partir de</h3>
                                </div>

                                <div className="text-right">
                                    {loadingRates ? (
                                        <Skeleton className="h-7 w-24 ml-auto rounded" />
                                    ) : lowestPrice ? (
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black text-zinc-900 tracking-tight">
                                                {new Intl.NumberFormat('fr-FR', {
                                                    style: 'currency',
                                                    currency: roomRates[0]?.currency || 'EUR',
                                                    maximumFractionDigits: 0
                                                }).format(lowestPrice)}
                                            </span>
                                            <span className="text-[10px] text-zinc-400 font-medium">Taxes & frais inclus</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm font-semibold text-zinc-500">Complet</span>
                                    )}
                                </div>
                            </div>

                            <hr className="border-zinc-100" />

                            {/* Attributs de rassurance immédiate */}
                            <div className="space-y-3.5">
                                <div className="flex items-center gap-3 text-xs text-zinc-600 font-medium">
                                    <div className="p-2 bg-zinc-50 text-zinc-500 rounded-xl border border-zinc-100">
                                        <Zap size={14} className="text-amber-500 fill-amber-500" />
                                    </div>
                                    <span>Confirmation instantanée après paiement</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-zinc-600 font-medium">
                                    <div className="p-2 bg-zinc-50 text-zinc-500 rounded-xl border border-zinc-100">
                                        <ShieldCheck size={14} className="text-emerald-600" />
                                    </div>
                                    <span>Paiement 100% sécurisé et encrypté</span>
                                </div>
                            </div>

                            {/* Bouton d'ancrage principal */}
                            <button
                                disabled={loadingRates || !lowestPrice}
                                onClick={() => document.getElementById("rates-section")?.scrollIntoView({ behavior: "smooth" })}
                                className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                            >
                                {loadingRates ? "Calcul des offres..." : lowestPrice ? "Voir les disponibilités" : "Établissement complet"}
                            </button>
                        </div>

                        {/* Carte d'assistance client dédiée */}
                        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-3xl p-6 shadow-sm space-y-2 relative overflow-hidden">
                            <div className="absolute -right-6 -bottom-6 text-zinc-700/20 transform rotate-12 pointer-events-none">
                                <ShieldCheck size={120} />
                            </div>
                            <h4 className="text-xs font-bold tracking-wider uppercase text-zinc-500">Besoin d'aide ?</h4>
                            <p className="text-sm font-bold text-white tracking-tight">Notre conciergerie est disponible 24/7</p>
                            <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                                Une question sur les politiques d'annulation ou les lits d'appoint ? Nos agents vous accompagnent.
                            </p>
                        </div>
                    </aside>
                </div>

                {/* Section d'affichage des grilles tarifaires */}
                <div id="rates-section" className="border-t border-zinc-200/80 pt-10 scroll-mt-20">
                    <div className="mb-6 space-y-1">
                        <h2 className="text-xl font-black text-zinc-900 tracking-tight">Chambres & Tarifs disponibles</h2>
                        <p className="text-xs text-zinc-500 font-medium">Sélectionnez la configuration idéale pour votre séjour.</p>
                    </div>

                    <div className="bg-white rounded-3xl border border-zinc-200/50 shadow-sm overflow-hidden p-2 sm:p-6">
                        <RoomRatesList
                            grouped={groupedByRoomType || {}}
                            loading={loadingRates}
                            sessionId={sessionId}
                            tokenId={tokenId}
                            hotelId={hotelId}
                            // --- PASSE DES PARAMÈTRES REQUIS DU NOUVEAU COMPOSANT ---
                            hotelName={hotel?.name || ""}
                            hotelCity={hotel?.city || ""}
                            hotelStars={hotel?.rating || 0}
                            hotelMainImage={hotel?.images?.[0]?.url || ""}
                            occupancy={occupancy} // Transmis sans erreurs à présent
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}