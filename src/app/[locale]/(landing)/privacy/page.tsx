"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {AppPromo} from "../../../../components/layout/AppPromo";

export default function PrivacyPage() {
    const t = useTranslations("Privacy");

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
                        <h2 className="text-2xl font-bold mb-4">{t("sections.data.title")}</h2>
                        <p>{t("sections.data.text")}</p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold mb-4">{t("sections.usage.title")}</h2>
                        <p>{t("sections.usage.text")}</p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold mb-4">{t("sections.sharing.title")}</h2>
                        <p>{t("sections.sharing.text")}</p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold mb-4">{t("sections.rights.title")}</h2>
                        <p>{t("sections.rights.text")}</p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}