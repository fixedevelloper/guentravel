"use client";

import React, { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { MapPin, Star, ShieldCheck, BedDouble, Users, Maximize, Heart, Share, Wifi, Coffee, Lock, Car, Tv2, LucideRefreshCcw, Bed } from "lucide-react";
import { RoomBookingCard } from "../RoomBookingCard";
import { Header } from "../../../../../components/layout/Header";
import { Footer } from "../../../../../components/layout/Footer";
import { useLocale } from 'next-intl';

// Correspondance des icônes
const iconMap: Record<string, any> = { Wifi, Tv2, LucideRefreshCcw, Coffee, Bed, Lock, Car };

export default function RoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
    // 1. Déballage sécurisé de la promesse des paramètres
    const resolvedParams = use(params);
    const roomId = resolvedParams?.roomId;
    const locale = useLocale() as "fr" | "en";
    // 2. Récupération des données avec gestion de l'état
    const { data: room, isLoading, error } = useQuery({
        queryKey: ["room", roomId],
        queryFn: async () => {
            const res = await api.get(`/rooms/${roomId}`);
            return res.data.data;
        },
        enabled: !!roomId, // Attend que l'ID soit disponible
    });

    // État de chargement
    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

    // État d'erreur ou données manquantes
    if (error || !room) return <div className="min-h-screen flex items-center justify-center text-red-500">Erreur lors du chargement de la suite.</div>;

    return (
        <>
            <Header />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <header className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <h1 className="text-3xl font-semibold text-gray-900 leading-tight">{room.name[locale]}</h1>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 hover:border-gray-800 hover:bg-gray-50 transition-all text-sm font-medium">
                                <Heart size={18} /> <span>Sauvegarder</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 hover:border-gray-800 hover:bg-gray-50 transition-all text-sm font-medium">
                                <Share size={18} /> <span>Partager</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1.5 font-medium text-gray-900">
                            <Star size={16} className="fill-red-500 text-red-500" />
                            {room.average_rating}
                            <span className="text-gray-600">({room.reviews_count} avis)</span>
                        </span>
                        <span className="text-gray-400">•</span>
                        <a href="#" className="flex items-center gap-1.5 text-gray-900 hover:text-gray-600 underline">
                            <MapPin size={16} /> {room.location}
                        </a>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">

                        {/* Galerie d'images sécurisée */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl overflow-hidden">
                            {(room.images || []).slice(0, 4).map((img: string, i: number) => (
                                <div key={i} className="relative aspect-[4/3] bg-gray-200 rounded-2xl overflow-hidden group">
                                    <img src={img} alt={`Vue ${i}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                </div>
                            ))}
                        </div>

                        {/* Badges d'infos */}
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-sm">
                                <Users size={18} /> <span className="font-medium">{room.capacity} adultes</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-sm">
                                <BedDouble size={18} /> <span className="font-medium">{room.bed_details}</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-sm">
                                <Maximize size={18} /> <span className="font-medium">{room.size} m²</span>
                            </div>
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900">Détails de la Suite</h2>
                            <p className="text-gray-600 leading-relaxed text-base">{room.description[locale]}</p>
                        </section>

                        {/* Amenities avec fallback d'icône */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900">Ce que propose cet hébergement</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {(room.amenities || []).map((item: any, index: number) => {
                                    const IconComponent = iconMap[item.icon_key] || Wifi;
                                    return (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
                                            <div className="p-2 bg-gray-100 rounded-lg"><IconComponent size={20} /></div>
                                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    <aside className="md:col-span-1">
                        <div className="sticky top-24">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                <RoomBookingCard roomId={roomId} price={room.default_price_per_night} />
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
            <Footer />
        </>
    );
}