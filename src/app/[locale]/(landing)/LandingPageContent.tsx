"use client";

import React, {useEffect, useState} from "react";
import { useTranslations } from "next-intl"; // Import essentiel
import { Link } from "@/i18n/routing"; // Utilisez votre routage localisé
import { useProperties } from "@/core/hooks/useProperties";
import { motion } from "framer-motion";
import { ShieldCheck, CreditCard, Users, ChevronRight } from "lucide-react";
import { Header } from "../../../components/layout/Header";
import { SearchComponent } from "../../../components/search/SearchComponent";
import { PropertyCard } from "../../../components/PropertyCard";
import { Footer } from "../../../components/layout/Footer";
import { AppPromo } from "../../../components/layout/AppPromo";

export default function LandingPageContent() {
    const t = useTranslations("Landing"); // Namespace dédié
    const { data } = useProperties();
    const listProperties = data?.data || [];

    return (
        <div className="min-h-screen bg-white text-zinc-900 selection:bg-[#1d9e4b] selection:text-white">
            <Header />

            <main>
                {/* HERO SECTION */}
                <section className="relative h-[80vh] flex flex-col items-center justify-center bg-zinc-900 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-40"></div>
                    <div className="relative z-10 text-center px-6 max-w-8xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight"
                        >
                            {t.rich("hero.title", { green: (chunks) => <span className="text-[#1d9e4b]">{chunks}</span> })}
                        </motion.h1>
                        <p className="text-xl md:text-2xl mb-12 text-zinc-300 font-light">
                            {t("hero.subtitle")}
                        </p>
                        <SearchComponent />
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
                            <div key={i} className="flex flex-col items-center text-center space-y-4">
                                <div className="p-4 bg-[#1d9e4b]/10 rounded-2xl text-[#1d9e4b]">
                                    <item.icon size={32} />
                                </div>
                                <h3 className="font-bold text-xl">{t(`trust.${item.key}.title`)}</h3>
                                <p className="text-zinc-500 leading-relaxed max-w-[250px]">{t(`trust.${item.key}.desc`)}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* LISTING SECTION */}
                <section className="py-24 bg-zinc-50">
                    <div className="max-w-7xl mx-auto px-6">
                        <header className="flex justify-between items-end mb-16">
                            <h2 className="text-4xl font-black tracking-tight">{t("listings.title")}</h2>
                            <Link href="/properties" className="text-[#1d9e4b] font-bold flex items-center hover:gap-2 transition-all">
                                {t("listings.explore")} <ChevronRight size={20} />
                            </Link>
                        </header>

                        <div className="grid md:grid-cols-3 gap-8">
                            {listProperties?.slice(0, 3).map((property, idx) => (
                                <PropertyCard key={property.id} property={property} index={idx} />
                            ))}
                        </div>
                    </div>
                </section>

                <AppPromo />
            </main>

            <Footer />
        </div>
    );
}