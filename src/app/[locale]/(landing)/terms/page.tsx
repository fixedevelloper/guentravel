"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
    const t = useTranslations("Terms");

    return (
        <div className="min-h-screen bg-white text-zinc-900">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-20">
                <header className="mb-12">
                    <h1 className="text-4xl font-extrabold mb-4">{t("title")}</h1>
                    <p className="text-zinc-500">{t("lastUpdated")} : 16 juin 2026</p>
                </header>

                <div className="prose prose-zinc max-w-none leading-relaxed">
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold mb-4">{t("sections.intro.title")}</h2>
                        <p>{t("sections.intro.text")}</p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold mb-4">{t("sections.booking.title")}</h2>
                        <p>{t("sections.booking.text")}</p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold mb-4">{t("sections.cancellation.title")}</h2>
                        <p>{t("sections.cancellation.text")}</p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold mb-4">{t("sections.liability.title")}</h2>
                        <p>{t("sections.liability.text")}</p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}