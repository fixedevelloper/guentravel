"use client";

import React from "react";
import { useParams } from "next/navigation"; // Pour récupérer la locale dynamiquement
import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { Link } from "@/i18n/navigation";
import { MapPin, Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header"; // Correction du chemin
import { Footer } from "@/components/layout/Footer"; // Ajout de l'import manquant

interface Experience {
    id: number;
    title: { fr: string; en: string };
    location: string;
    duration: number;
    price: number;
    image_url: string;
    rating: number;
}

export default function ExperiencesPage() {
    const params = useParams();
    const locale = (params?.locale as "fr" | "en") || "fr";

    const { data: experiences = [], isLoading } = useQuery<Experience[]>({
        queryKey: ["publicExperiences"],
        queryFn: async () => {
            const res = await api.get("/experiences");
            return res.data?.data || [];
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#15a4e6]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-black mb-8 tracking-tight">Découvrez nos expériences</h1>

                {experiences.length === 0 ? (
                    <div className="text-center py-20 text-zinc-500">
                        Aucune expérience disponible pour le moment.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {experiences.map((exp) => (
                            <Link key={exp.id} href={`/experiences/${exp.id}`}>
                                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 rounded-2xl border-zinc-200 bg-white">
                                    <div className="h-48 w-full bg-zinc-100">
                                        <img
                                            src={exp.image_url}
                                            alt={exp.title[locale]}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <CardContent className="p-4 space-y-3">
                                        <h3 className="font-bold text-lg leading-tight">{exp.title[locale]}</h3>
                                        <p className="text-sm text-zinc-500 flex items-center">
                                            <MapPin className="h-3.5 w-3.5 mr-1.5" /> {exp.location}
                                        </p>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-[11px] font-bold flex items-center bg-zinc-100 px-2.5 py-1 rounded-full text-zinc-600">
                                                <Clock className="h-3 w-3 mr-1" /> {exp.duration} min
                                            </span>
                                            <span className="font-black text-[#15a4e6]">
                                                {new Intl.NumberFormat('fr-FR').format(exp.price)} FCFA
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}