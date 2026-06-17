"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Mail } from "lucide-react";
import {AppPromo} from "../../../../components/layout/AppPromo";

export default function HelpPage() {
    const t = useTranslations("Help");

    // Liste des questions (à gérer idéalement via le fichier JSON ou une API)
    const faqs = [
        { id: "1", q: t("faq.q1"), a: t("faq.a1") },
        { id: "2", q: t("faq.q2"), a: t("faq.a2") },
        { id: "3", q: t("faq.q3"), a: t("faq.a3") },
    ];

    return (
        <div className="min-h-screen bg-white text-zinc-900">
            <Header />

            <main className="max-w-3xl mx-auto px-6 py-20">
                {/* En-tête */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold mb-4">{t("title")}</h1>
                    <p className="text-zinc-600">{t("subtitle")}</p>
                </div>

                {/* Barre de recherche (purement décorative ici) */}
                <div className="relative mb-12">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
                    <input
                        type="text"
                        placeholder={t("searchPlaceholder")}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#1d9e4b]/20"
                    />
                </div>

                {/* Section FAQ */}
                <Accordion type="single" collapsible className="space-y-4">
                    {faqs.map((item) => (
                        <AccordionItem key={item.id} value={item.id} className="border border-zinc-100 rounded-xl px-6">
                            <AccordionTrigger className="font-semibold text-left">{item.q}</AccordionTrigger>
                            <AccordionContent className="text-zinc-600 leading-relaxed">
                                {item.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                {/* Contact support */}
                <div className="mt-16 bg-zinc-50 rounded-2xl p-8 text-center border border-zinc-100">
                    <h3 className="font-bold text-lg mb-2">{t("contact.title")}</h3>
                    <p className="text-zinc-500 mb-6 text-sm">{t("contact.subtitle")}</p>
                    <a href="mailto:support@guenstravel.cm" className="inline-flex items-center gap-2 bg-[#1d9e4b] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#198a3e] transition">
                        <Mail className="h-5 w-5" /> {t("contact.button")}
                    </a>
                </div>

            </main>
            <AppPromo />
            <Footer />
        </div>
    );
}