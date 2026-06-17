"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Smartphone } from "lucide-react";
import { motion } from "framer-motion";

export function AppPromo() {
    const t = useTranslations("AppPromo");

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#1d9e4b] rounded-1xl md:p-12  text-white overflow-hidden relative"
        >
            <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                {/* Texte */}
                <div>
                    <div className="flex items-center gap-2 mb-4 opacity-90">
                        <Smartphone className="h-6 w-6" />
                        <span className="uppercase tracking-widest text-sm font-bold">{t("badge")}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{t("title")}</h2>
                    <p className="text-green-50 text-lg mb-6 leading-relaxed">{t("description")}</p>

                    <div className="flex gap-4">
                        {/* Boutons stores */}
                        <div className="h-12 w-36 bg-white rounded-lg flex items-center justify-center text-zinc-900 font-bold cursor-pointer hover:bg-zinc-100 transition">App Store</div>
                        <div className="h-12 w-36 bg-white rounded-lg flex items-center justify-center text-zinc-900 font-bold cursor-pointer hover:bg-zinc-100 transition">Google Play</div>
                    </div>
                </div>

                {/* Espace QR Code */}
                <div className="flex justify-center md:justify-end">
                    <div className="bg-white p-4 rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        {/* Remplacez ceci par votre composant QR Code ou une image */}
                        <div className="w-32 h-32 bg-zinc-900 flex items-center justify-center rounded-lg">
                            <span className="text-[10px] text-white text-center p-2">QR CODE PLACEHOLDER</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}