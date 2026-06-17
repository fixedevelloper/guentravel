"use client";

import React, {useEffect, useState} from "react";
import { useTranslations } from "next-intl";
import { Smartphone, Apple } from "lucide-react";
import { motion } from "framer-motion";
import QRCode from "qrcode";

export function AppPromo() {
    const t = useTranslations("AppPromo");
    const [qr, setQr] = useState("");

    useEffect(() => {
        QRCode.toDataURL("https://travel.guens.org/fr")
            .then(setQr)
            .catch(console.error);
    }, []);

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#1d9e4b] rounded-1xl md:p-12 text-white overflow-hidden relative"
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

                    <div className="flex gap-4 flex-wrap">
                        {/* Bouton App Store */}
                        <a
                            href="#"
                            className="h-14 px-6 bg-white rounded-xl flex items-center gap-3 text-zinc-900 font-semibold cursor-pointer hover:bg-zinc-100 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <Apple className="h-7 w-7" />
                            <div className="text-left">
                                <div className="text-xs uppercase tracking-wide">Download on the</div>
                                <div className="text-lg font-bold -mt-1">App Store</div>
                            </div>
                        </a>

                        {/* Bouton Google Play */}
                        <a
                            href="#"
                            className="h-14 px-6 bg-white rounded-xl flex items-center gap-3 text-zinc-900 font-semibold cursor-pointer hover:bg-zinc-100 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.37,12.65L14.23,14.79L19.09,17.91L20.63,16.37C20.86,16.14 21,15.84 21,15.5V14.5C21,14.16 20.86,13.86 20.63,13.63L19.09,12.09L16.37,12.65M5.84,6.84L10.34,11.34L12.69,9L5.84,3.15C5.34,3.4 5,3.91 5,4.5V9.5C5,9.84 5.14,10.14 5.34,10.37L5.84,6.84Z"/>
                            </svg>
                            <div className="text-left">
                                <div className="text-xs uppercase tracking-wide">Get it on</div>
                                <div className="text-lg font-bold -mt-1">Google Play</div>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Espace QR Code */}
                <div className="flex justify-center md:justify-end">
                    <div className="bg-white p-4 rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <div className="w-36 h-36 bg-zinc-900 flex items-center justify-center rounded-lg">
                        {qr ? (
                            <img src={qr} alt="QR Code" className="w-32 h-32 rounded-lg" />
                        ) : (
                            <div className="w-34 h-34 bg-zinc-200 flex items-center justify-center rounded-lg">
                                <span className="text-zinc-500 text-sm">Loading...</span>
                            </div>
                        )}
                        </div></div>
                </div>
            </div>
        </motion.section>
    );
}