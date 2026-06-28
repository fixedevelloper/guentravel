"use client";

import { RoomRate } from "@/types/hotel";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
    Check, Coffee, BedDouble, Users, AlertCircle,
    ShieldAlert, ArrowRight, ImageIcon, TextQuote
} from "lucide-react";
import React from "react";
import { useRouter } from "@/i18n/routing";
import { useCartHotelStore } from "../../core/store/useCartHotelStore";

interface Props {
    grouped:   Record<string, RoomRate[]>;
    loading:   boolean;
    sessionId: string;
    tokenId:   string;
    hotelId:   string;
    // Données de l'hôtel parent pour alimenter correctement le panier de réservation
    hotelName: string;
    hotelCity: string;
    hotelStars: number;
    hotelMainImage: string;
    occupancy: { room_no: number; adult: number; child: number }[];
}

export function RoomRatesList({
                                  grouped, loading, sessionId, tokenId, hotelId, hotelName, hotelCity, hotelStars, hotelMainImage, occupancy
                              }: Props) {

    const router = useRouter();
    const addToCart = useCartHotelStore((state) => state.addToCart);

    const handleBook = (rate: RoomRate) => {
        const params = new URLSearchParams({
            session:       sessionId,
            product:       rate.product_id,
            token:         tokenId ?? "",
            rate_basis_id: rate.rate_basis_id,
            rooms:         encodeURIComponent(JSON.stringify(occupancy)),
        });

        // 1. Enregistrement des données dans le store Zustand
        addToCart({
            hotelId,
            hotelName: hotelName,
            hotelImages: hotelMainImage ? [hotelMainImage] : [],
            city: hotelCity,
            rating: hotelStars,
            sessionId,
            productId: rate.product_id, // CORRECTION: Syntaxe clé/valeur rétablie
            tokenId,
            selectedRate: rate,
        });

        // 2. Redirection vers le tunnel d'achat avec les paramètres d'URL sécurisés
        router.push(`/hotels/${hotelId}/booking?${params.toString()}`);
    };

    if (loading) return (
        <div className="space-y-8">
            {[1, 2].map(i => (
                <div key={i} className="border border-zinc-200/60 rounded-3xl overflow-hidden bg-white grid grid-cols-1 md:grid-cols-12 h-auto md:h-64 animate-pulse">
                    <div className="md:col-span-4 bg-zinc-200 h-48 md:h-full" />
                    <div className="md:col-span-8 p-6 space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-1/3 rounded-lg" />
                            <Skeleton className="h-4 w-full rounded" />
                        </div>
                        <div className="flex justify-between items-center pt-4">
                            <Skeleton className="h-4 w-24 rounded" />
                            <Skeleton className="h-12 w-32 rounded-xl" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const hasRooms = Object.keys(grouped).length > 0;

    if (!hasRooms) return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <div className="p-3 bg-zinc-100 rounded-full text-zinc-400 mb-3">
                <AlertCircle size={24} />
            </div>
            <p className="text-zinc-700 font-semibold text-sm">Aucune chambre disponible</p>
            <p className="text-zinc-400 text-xs mt-1">Modifiez vos filtres ou vos dates pour voir d'autres offres.</p>
        </div>
    );

    const formatPrice = (amount: number, currency: string) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-10 animate-fade-in">
            {Object.entries(grouped).map(([roomType, rates]) => {
                const sampleRate = rates[0];
                const roomImages = sampleRate.room_images || [];
                const roomFacilities = sampleRate.facilities || []; // Extraction propre du tableau

                return (
                    <div
                        key={roomType}
                        className="bg-white border border-zinc-200/70 rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-300 hover:shadow-md hover:border-zinc-300"
                    >
                        {/* --- BLOC GAUCHE (4 Cols) : Visuel principal de la chambre --- */}
                        <div className="lg:col-span-4 relative bg-zinc-50 border-b lg:border-b-0 lg:border-r border-zinc-100 min-h-[200px] lg:min-h-full flex flex-col">
                            {roomImages.length > 0 ? (
                                <div className="relative w-full h-48 lg:h-full lg:min-h-[280px] flex-1 group overflow-hidden">
                                    <Image
                                        src={roomImages[0]}
                                        alt={roomType}
                                        fill
                                        sizes="(max-w-1024px) 100vw, 33vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    {roomImages.length > 1 && (
                                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white px-2 py-1 rounded-lg">
                                            + {roomImages.length} photos
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full h-48 lg:h-full flex-1 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50 border-b border-zinc-100 lg:border-b-0 gap-1.5">
                                    <ImageIcon size={24} strokeWidth={1.5} />
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Visuel non contractuel</span>
                                </div>
                            )}

                            {/* En-tête général de la catégorie de chambre */}
                            <div className="p-4 bg-zinc-50/80 space-y-2 mt-auto">
                                <h3 className="font-black text-zinc-900 text-sm tracking-tight capitalize leading-tight">
                                    {roomType.toLowerCase()}
                                </h3>
                                <div className="flex items-center gap-1.5 text-zinc-600">
                                    <Users size={12} className="text-zinc-400" />
                                    <span className="text-[11px] font-bold">Max {sampleRate.max_occupancy} personnes</span>
                                </div>
                            </div>
                        </div>

                        {/* --- BLOC DROITE (8 Cols) : Grille des Options Tarifaires & Descriptions --- */}
                        <div className="lg:col-span-8 divide-y divide-zinc-100 flex flex-col justify-center bg-white">
                            {rates.map((rate) => {
                                const isRefundable = rate.fare_type.toLowerCase() === "refundable";
                                const hasBreakfast = rate.board_type.toLowerCase().includes("breakfast") ||
                                    rate.board_type.toLowerCase().includes("pension");

                                return (
                                    <div
                                        key={rate.rate_basis_id}
                                        className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6 hover:bg-zinc-50/30 transition-colors"
                                    >
                                        {/* Détails de l'offre */}
                                        <div className="space-y-3.5 flex-1">

                                            {/* Badges d'état supérieurs */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* Repas */}
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold ${hasBreakfast ? 'bg-amber-50 text-amber-700 border border-amber-100/40' : 'bg-zinc-100 text-zinc-600'}`}>
                                                    <Coffee size={12} className={hasBreakfast ? "text-amber-600" : "text-zinc-400"} />
                                                    <span className="capitalize">{rate.board_type.toLowerCase()}</span>
                                                </div>

                                                {/* Politique */}
                                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${isRefundable ? 'bg-emerald-50 text-emerald-700 border-emerald-100/80' : 'bg-rose-50 text-rose-700 border-rose-100/80'}`}>
                                                    {isRefundable ? "Annulation Gratuite" : "Non Remboursable"}
                                                </span>

                                                {/* Instant booking */}
                                                {rate.inventory_type === "Instant" && (
                                                    <Badge className="bg-sky-50 text-sky-700 hover:bg-sky-50 border-sky-100 text-[10px] font-bold rounded-xl shadow-none">
                                                        ⚡ Confirmation Directe
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Description spécifique du tarif */}
                                            {rate.description && (
                                                <div className="bg-zinc-50/40 border border-zinc-200/50 rounded-xl p-3 flex items-start gap-2.5 max-w-xl">
                                                    <TextQuote size={14} className="text-zinc-400 shrink-0 mt-0.5" />
                                                    <p className="text-zinc-600 text-xs leading-relaxed font-medium first-letter:capitalize">
                                                        {rate.description.toLowerCase()}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Politiques d'annulation */}
                                            {rate.cancellation_policy && rate.cancellation_policy.length > 0 && (
                                                <div className="space-y-1 bg-zinc-50/60 p-3 rounded-xl border border-zinc-100/70 max-w-xl">
                                                    {rate.cancellation_policy.map((rule, i) => (
                                                        <p key={i} className="text-[11px] text-zinc-500 flex items-start gap-1.5 leading-normal">
                                                            {isRefundable ? (
                                                                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                                            ) : (
                                                                <ShieldAlert className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                                                            )}
                                                            <span className="first-letter:capitalize">{rule.toLowerCase()}</span>
                                                        </p>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Équipements de la chambre (CORRIGÉ: Utilisation directe de roomFacilities) */}
                                            {roomFacilities && roomFacilities.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {roomFacilities.slice(0, 3).map((f) => (
                                                        <span
                                                            key={f}
                                                            className="text-[10px] font-semibold text-zinc-400 bg-zinc-50 border border-zinc-200/40 px-2 py-0.5 rounded-md capitalize"
                                                        >
                                                            {f.toLowerCase()}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Prix & Bouton Réserver */}
                                        <div className="flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end border-t sm:border-t-0 border-zinc-100 pt-4 sm:pt-0 shrink-0 sm:pl-6 sm:text-right min-w-[160px] sm:self-center">
                                            <div className="space-y-0.5">
                                                <div className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                                                    {formatPrice(rate.net_price, rate.currency)}
                                                </div>
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                                    par nuit (TTC)
                                                </p>
                                            </div>

                                            <Button
                                                onClick={() => handleBook(rate)}
                                                className="sm:mt-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center gap-1.5 group">
                                                Réserver
                                                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}