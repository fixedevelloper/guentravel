"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { ShieldCheck, CreditCard, Users, ChevronRight, PlaneTakeoff } from "lucide-react";
import SearchFlight from "../../../../components/search/flights/SearchFlight";
import { AppPromo } from "../../../../components/layout/AppPromo";
import { Card, CardContent } from "@/components/ui/card";
import {Header} from "../../../../components/layout/Header";
import {Footer} from "../../../../components/layout/Footer"; // Import de shadcn si disponible

export default function LandingPageContent() {
    const t = useTranslations("Flight");

    const listProperties: any[] = []; // data?.data || [];

    return (
        <div className="min-h-screen bg-white text-zinc-900 selection:bg-[#15a4e6] selection:text-white">
            <Header />

            <main>
                {/* HERO SECTION */}
                <section className="relative min-h-[85vh] lg:min-h-[90vh] flex flex-col items-center justify-center bg-zinc-900 text-white overflow-hidden py-10 md:py-16 lg:py-24">
                    {/* Image de fond adaptative (positionnée pour ne pas couper le ciel/l'avion sur petit écran) */}
                    <div className="absolute inset-0 bg-[url('/images/flights.jpg')] bg-cover bg-center sm:bg-center opacity-30"></div>

                    <div className="relative z-10 text-center px-4 sm:px-6 w-full max-w-6xl mx-auto flex flex-col items-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 md:mb-6 tracking-tight leading-tight max-w-4xl"
                        >
                            {t.rich("hero.title", { green: (chunks) => <span className="text-[#15a4e6]">{chunks}</span> })}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-base sm:text-lg md:text-xl mb-8 md:mb-12 text-zinc-300 font-light max-w-2xl px-2"
                        >
                            {t("hero.subtitle")}
                        </motion.p>

                        {/* Conteneur de recherche sécurisé pour le responsive */}
                        <div className="w-full overflow-x-visible px-1 sm:px-0">
                            <SearchFlight />
                        </div>
                    </div>
                </section>
                {/* TRUST SECTION */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
                        {[
                            { icon: ShieldCheck, key: "escrow" },
                            { icon: CreditCard, key: "payment" },
                            { icon: Users, key: "support" }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center space-y-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors">
                                <div className="p-4 bg-[#15a4e6]/10 rounded-2xl text-[#15a4e6]">
                                    <item.icon size={32} />
                                </div>
                                <h3 className="font-bold text-xl">{t(`trust.${item.key}.title`)}</h3>
                                <p className="text-zinc-500 leading-relaxed max-w-[280px] text-sm">{t(`trust.${item.key}.desc`)}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* LISTING SECTION (Vols Récents / Populaires) */}
                <section className="py-24 bg-zinc-50">
                    <div className="max-w-7xl mx-auto px-6">
                        <header className="flex justify-between items-end mb-12">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                                {t("flights.listings.title")} {/* Correction faute d'orthographe "flihts" */}
                            </h2>
                        </header>

                        {listProperties.length === 0 ? (
                            <div className="text-center text-zinc-400 py-8 text-sm">
                                Aucun vol récent à afficher pour le moment.
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-3 gap-8">
                                {listProperties.slice(0, 3).map((property: any, idx: number) => (
                                    <Card key={idx} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-xs font-bold text-[#15a4e6] bg-[#15a4e6]/10 px-2 py-1 rounded">
                                                    {property.airline || "Vol Populaire"}
                                                </span>
                                                <PlaneTakeoff className="h-4 w-4 text-zinc-400" />
                                            </div>
                                            <h4 className="font-bold text-lg text-zinc-800">
                                                {property.origin} → {property.destination}
                                            </h4>
                                            <p className="text-xs text-zinc-500 mt-1">Meilleur tarif constaté récemment</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <AppPromo />
            </main>

            <Footer />
        </div>
    );
}