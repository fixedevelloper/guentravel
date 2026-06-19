"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Target, Heart, Users, MapPin, Building } from "lucide-react";
import { motion } from "framer-motion";
import {AppPromo} from "../../../../components/layout/AppPromo";

export default function AboutPage() {
    const t = useTranslations("About");

    const features = [
        { icon: Target, key: "mission" },
        { icon: ShieldCheck, key: "trust" },
        { icon: Heart, key: "passion" },
        { icon: Users, key: "support" }
    ];

    const stats = [
        { label: t("stats.properties"), value: "500+" },
        { label: t("stats.guests"), value: "10k+" },
        { label: t("stats.cities"), value: "50+" }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-5xl mx-auto px-6 py-20">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-24"
                >
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-zinc-900">
                        {t.rich("title", {
                            green: (chunks) => <span className="text-[#15a4e6]">{chunks}</span>
                        })}
                    </h1>
                    <p className="text-xl text-zinc-600 max-w-2xl mx-auto">{t("subtitle")}</p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-10 mb-24">
                    {features.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex gap-4 p-6 rounded-2xl hover:bg-zinc-50 transition-colors"
                        >
                            <div className="p-3 bg-green-50 rounded-2xl h-fit">
                                <item.icon className="w-6 h-6 text-[#15a4e6]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-2 text-zinc-900">{t(`${item.key}.title`)}</h3>
                                <p className="text-zinc-600 leading-relaxed text-sm">{t(`${item.key}.text`)}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-3 gap-6 mb-24 py-12 border-y border-zinc-100">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-3xl md:text-4xl font-extrabold text-zinc-900 mb-1">{stat.value}</div>
                            <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">{stat.label}</div>
                        </div>
                    ))}
                </div>

            </main>
            <AppPromo />
            <Footer />
        </div>
    );
}