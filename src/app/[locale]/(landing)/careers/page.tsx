"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MapPin, Users, Briefcase, Zap } from "lucide-react";
import {AppPromo} from "../../../../components/layout/AppPromo";

export default function CareersPage() {
    const t = useTranslations("Careers");

    // Simulation d'offres d'emploi
    const jobs = [
        { id: 1, title: "Développeur Fullstack (React/Node)", location: "Douala, Cameroun" },
        { id: 2, title: "Responsable Support Client", location: "Douala / Remote" },
        { id: 3, title: "Commercial Terrain / Partenariats", location: "Yaoundé, Cameroun" },
    ];

    return (
        <div className="min-h-screen bg-white text-zinc-900">
            <Header />

            <main className="max-w-5xl mx-auto px-6 py-20">
                <header className="text-center mb-20">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6">{t("title")}</h1>
                    <p className="text-xl text-zinc-600 max-w-2xl mx-auto">{t("subtitle")}</p>
                </header>

                {/* Culture Section */}
                <section className="grid md:grid-cols-3 gap-8 mb-20">
                    {[
                        { icon: Users, title: t("culture.team") },
                        { icon: Zap, title: t("culture.impact") },
                        { icon: Briefcase, title: t("culture.growth") },
                    ].map((item, i) => (
                        <div key={i} className="p-8 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <item.icon className="h-8 w-8 text-[#1d9e4b] mb-4" />
                            <h3 className="font-bold text-lg">{item.title}</h3>
                        </div>
                    ))}
                </section>

                {/* Offres d'emploi */}
                <section>
                    <h2 className="text-3xl font-bold mb-8">{t("jobs.title")}</h2>
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <div key={job.id} className="flex items-center justify-between p-6 border border-zinc-200 rounded-xl hover:border-[#1d9e4b] transition">
                                <div>
                                    <h3 className="font-bold text-lg">{job.title}</h3>
                                    <div className="flex items-center gap-2 text-zinc-500 text-sm mt-1">
                                        <MapPin className="h-4 w-4" /> {job.location}
                                    </div>
                                </div>
                                <button className="bg-zinc-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1d9e4b] transition">
                                    {t("jobs.apply")}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Candidature spontanée */}
                <section className="mt-20 text-center p-12 bg-[#1d9e4b]/5 rounded-3xl border border-[#1d9e4b]/20">
                    <h3 className="text-2xl font-bold mb-4">{t("spontaneous.title")}</h3>
                    <p className="text-zinc-600 mb-6">{t("spontaneous.text")}</p>
                    <a href="mailto:rh@guenstravel.com" className="text-[#1d9e4b] font-bold underline hover:no-underline">
                        rh@guenstravel.com
                    </a>
                </section>

            </main>
            <AppPromo />
            <Footer />
        </div>
    );
}