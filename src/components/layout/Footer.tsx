"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { MapPin, Mail, Phone, Globe } from "lucide-react";
import Image from "next/image";
import React from "react";

export function Footer() {
    const t = useTranslations("Footer");

    return (
        <footer className="bg-zinc-900 text-white border-t border-zinc-800" aria-label="Footer">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid md:grid-cols-4 gap-12">
                    {/* Colonne 1: Identité SEO */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Image
                                src="/images/logo.png"
                                alt="Logo Officiel GUEN'S TRAVEL & TOURS"
                                width={180} // Ajustez la largeur selon vos besoins réels
                                height={50} // Ajustez la hauteur selon vos besoins réels
                                priority // 🔥 Charge le logo immédiatement (LCP optimization)
                                className="object-contain"
                            />
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            {t("description")}
                        </p>
                    </div>

                    {/* Liens avec traductions */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">{t("company.title")}</h3>
                        <ul className="space-y-3 text-zinc-400">
                            <li><Link href="/about" className="hover:text-[#15a4e6]">{t("company.about")}</Link></li>
                            <li><Link href="/careers" className="hover:text-[#15a4e6]">{t("company.careers")}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-4">{t("support.title")}</h3>
                        <ul className="space-y-3 text-zinc-400">
                            <li><Link href="/help" className="hover:text-[#15a4e6]">{t("support.help")}</Link></li>
                            <li><Link href="/terms" className="hover:text-[#15a4e6]">{t("support.terms")}</Link></li>
                            <li><Link href="/privacy" className="text-zinc-400 hover:text-[#15a4e6] transition">Confidentialité</Link></li>
                        </ul>
                    </div>

                    {/* Contact avec micro-données */}
                    <div className="space-y-4 text-zinc-400">
                        <h3 className="font-bold text-lg text-white mb-4">{t("contact.title")}</h3>
                        <a href="tel:+237600000000" className="flex items-center gap-3 hover:text-[#15a4e6]"><Phone className="h-4 w-4" /> +237 6 83 43 71 57</a>
                        <a href="mailto:contact@guenstravel.com" className="flex items-center gap-3 hover:text-[#15a4e6]"><Mail className="h-4 w-4" /> contact@guenstravel.com</a>
                        <div className="flex items-center gap-3"><Globe className="h-4 w-4" /> Douala, Cameroun</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}