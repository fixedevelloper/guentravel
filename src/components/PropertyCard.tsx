"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Heart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {Property} from "../types/property";

interface PropertyCardProps {
    property: Property;
    index: number;
}

export function PropertyCard({ property, index }: PropertyCardProps) {
    const locale = useLocale() as "fr" | "en";
    const t = useTranslations("Properties");
    const [isFavorite, setIsFavorite] = useState(false);

    // Formatage monétaire professionnel
    const formattedPrice = new Intl.NumberFormat(locale, {
        style: 'decimal',
        maximumFractionDigits: 0
    }).format(property.price_range.min || 0);

    const coverImage = property.media?.cover || "/images/placeholder-property.jpg";

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsFavorite(!isFavorite);
        // Ici : ajouter votre logique d'appel API (POST/DELETE)
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-2xl transition-all duration-300"
        >
            {/* --- Section Image --- */}
            <Link href={`/properties/${property.uuid}`} className="relative block h-60 overflow-hidden bg-zinc-100">
                <img
                    src={coverImage}
                    alt={property.name?.[locale]}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.currentTarget.src = "/images/placeholder-property.jpg"; }}
                />

                {/* Badge Note */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] font-bold text-zinc-900 shadow-sm">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> 4.8
                </div>

                {/* Bouton Favori */}
                <button
                    onClick={toggleFavorite}
                    className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full transition-all hover:bg-black/40 group/fav"
                >
                    <Heart
                        className={`w-5 h-5 transition-all ${isFavorite ? "fill-red-500 text-red-500" : "text-white"}`}
                    />
                </button>
            </Link>

            {/* --- Section Contenu --- */}
            <div className="p-6 flex flex-col flex-grow">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#15a4e6] bg-[#15a4e6]/5 px-2 py-0.5 rounded w-fit mb-3">
                    {property.type}
                </span>

                <Link href={`/properties/${property.uuid}`}>
                    <h3 className="text-lg font-black text-zinc-900 leading-tight group-hover:text-[#15a4e6] transition-colors line-clamp-1 mb-2">
                        {property.name?.[locale] || property.name?.['fr']}
                    </h3>
                </Link>

                <div className="flex items-center text-zinc-400 text-[11px] font-medium mb-4">
                    <MapPin className="w-3 h-3 mr-1" />
                    {property.location.city}
                </div>

                <p className="text-zinc-500 text-xs line-clamp-2 mb-6 flex-grow">
                    {property.description?.[locale] || property.description?.['fr']}
                </p>

                {/* --- Footer (Prix & CTA) --- */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                    <div>
                        <p className="text-[10px] text-zinc-400 uppercase font-bold">{t("from")}</p>
                        <p className="text-[#15a4e6] font-black text-lg">
                            {formattedPrice} <span className="text-[10px] font-normal text-zinc-600">FCFA</span>
                        </p>
                    </div>

                    <Button  size="sm" className="bg-zinc-900 hover:bg-[#15a4e6] text-white rounded-xl px-5 font-bold transition-all">
                        {t("bookNow")}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}