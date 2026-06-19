"use client";

import { motion } from "framer-motion";
import { Phone, Globe, MapPin } from "lucide-react";

interface PropertyContactInfoProps {
    phone?: string;
    website?: string;
    city: string;
}

export function PropertyContactInfo({ phone, website, city }: PropertyContactInfoProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
        >
            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-zinc-50 p-6 rounded-2xl flex items-center gap-4">
                    <Phone className="h-6 w-6 text-[#15a4e6]" />
                    <div>
                        <p className="text-sm text-zinc-500">Téléphone</p>
                        <p className="font-semibold">{phone || "+237 6XX XX XX XX"}</p>
                    </div>
                </div>
                <div className="bg-zinc-50 p-6 rounded-2xl flex items-center gap-4">
                    <Globe className="h-6 w-6 text-[#15a4e6]" />
                    <div>
                        <p className="text-sm text-zinc-500">Site web</p>
                        <p className="font-semibold">{website || "bookit.cm"}</p>
                    </div>
                </div>
                <div className="bg-zinc-50 p-6 rounded-2xl flex items-center gap-4">
                    <MapPin className="h-6 w-6 text-[#15a4e6]" />
                    <div>
                        <p className="text-sm text-zinc-500">Adresse</p>
                        <p className="font-semibold">{city}</p>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}