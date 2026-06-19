"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Loader2, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface Room {
    id: number;
    name: { fr: string; en: string };
    description: { fr: string; en: string };
    default_price_per_night: string;
    property: { name: { fr: string; en: string }; city: string };
}

export default function RoomsOffersPage() {
    const params = useParams();
    const locale = (params?.locale as "fr" | "en") || "fr";

    const { data, isLoading } = useQuery({
        queryKey: ["rooms-offers"],
        queryFn: async () => {
            const res = await api.get("/rooms/offers");
            return res?.data?.data || [];
        }
    });

    const rooms = Array.isArray(data) ? data : [];

    if (isLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#15a4e6]" />
            <p className="text-zinc-500 font-medium">Recherche des meilleures offres...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-16">
                {/* SEO: Header de section */}
                <header className="mb-16 text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#15a4e6]/10 text-[#15a4e6] text-xs font-bold uppercase tracking-widest mb-4">
                        <Sparkles className="h-3 w-3" /> Offres Exclusives
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-900 mb-6">
                        Séjours d'exception à prix doux
                    </h1>
                    <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
                        Découvrez notre sélection de chambres premium soigneusement choisies pour votre confort.
                    </p>
                </header>

                {rooms.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-3xl">
                        <p className="text-zinc-400">Aucune offre disponible actuellement.</p>
                    </div>
                ) : (
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rooms.map((room) => (
                            <article key={room.id} className="group">
                                <Card className="h-full rounded-3xl border-zinc-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white hover:-translate-y-2">
                                    <div className="h-48 bg-zinc-200" /> {/* Placeholder pour l'image */}
                                    <CardContent className="p-7">
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#15a4e6] mb-3 bg-[#15a4e6]/5 px-2 py-1 rounded-md w-fit uppercase">
                                            <MapPin className="h-3 w-3" /> {room.property.city}
                                        </div>
                                        <h2 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-[#15a4e6] transition-colors">
                                            {room.name[locale]}
                                        </h2>
                                        <p className="text-sm text-zinc-500 mb-6 line-clamp-2 h-10">
                                            {room.description[locale]}
                                        </p>

                                        <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
                                            <div>
                                                <span className="block text-[10px] text-zinc-400 uppercase font-bold">À partir de</span>
                                                <span className="text-lg font-black text-zinc-900">
                                                    {Number(room.default_price_per_night).toLocaleString('fr-FR')} FCFA
                                                </span>
                                            </div>
                                            <Link href={`/offers/${room.id}`} className="bg-zinc-900 text-white p-3 rounded-full hover:bg-[#15a4e6] transition-colors">
                                                <ArrowRight className="h-5 w-5" />
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </article>
                        ))}
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}