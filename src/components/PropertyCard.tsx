"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing"; // Mis à jour pour matcher l'import de tes autres fichiers
import { Button } from "@/components/ui/button";
import { MapPin, Star, Heart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Hotel } from "../types/hotel";

interface PropertyCardProps {
    property: Hotel;
    index: number;
    sessionId?: string; // Optionnel : utile si tu l'utilises pour la redirection
}

export function PropertyCard({ property, index, sessionId = "" }: PropertyCardProps) {
    const locale = useLocale() as "fr" | "en";
    const t = useTranslations("Properties");
    const [isFavorite, setIsFavorite] = useState(false);

    // ADAPTATION : Utilisation de property.total (qui est le prix total du séjour)
    const formattedPrice = new Intl.NumberFormat(locale, {
        style: 'decimal',
        maximumFractionDigits: 0
    }).format(property.total || 0);
    sessionId='paderf.derfoplk8574sdrhdtegh'
    // ADAPTATION : Utilisation de property.thumbnail
    const coverImage = property.thumbnail || "/images/placeholder-property.jpg";

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
            {/* ADAPTATION : Utilisation de property.hotel_id au lieu de uuid */}
            <Link
                href={`/hotels/${property.hotel_id}?token=${property.token_id}&product=${property.product_id}&session=${sessionId}`}
                className="relative block h-60 overflow-hidden bg-zinc-100"
            >
                <img
                    src={coverImage}
                    alt={property.name}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.currentTarget.src = "/images/placeholder-property.jpg"; }}
                />

                {/* Badge Note */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] font-bold text-zinc-900 shadow-sm">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {/* ADAPTATION : Dynamisation de la note (ou TripAdvisor alternative) */}
                    {property.rating || property.trip_advisor?.rating || "4.5"}
                </div>

                {/* Bouton Favori */}
                <button
                    onClick={toggleFavorite}
                    className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full transition-all hover:bg-black/40 group/fav z-10"
                >
                    <Heart
                        className={`w-5 h-5 transition-all ${isFavorite ? "fill-red-500 text-red-500" : "text-white"}`}
                    />
                </button>
            </Link>

            {/* --- Section Contenu --- */}
            <div className="p-6 flex flex-col flex-grow">
                {/* ADAPTATION : property.property_type au lieu de property.type */}
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#15a4e6] bg-[#15a4e6]/5 px-2 py-0.5 rounded w-fit mb-3">
                    {property.property_type || "Hôtel"}
                </span>

                <Link href={`/hotels/${property.hotel_id}?token=HTB0zd1QyPEeR3oIpmVn&product=${property.product_id}&session=${sessionId}&is_local=${true}`}>
                    {/* ADAPTATION : property.name est une string directe dans ton type, pas un objet par locale */}
                    <h3 className="text-lg font-black text-zinc-900 leading-tight group-hover:text-[#15a4e6] transition-colors line-clamp-1 mb-2">
                        {property.name}
                    </h3>
                </Link>

                {/* ADAPTATION : property.city au lieu de property.location.city */}
                <div className="flex items-center text-zinc-400 text-[11px] font-medium mb-4">
                    <MapPin className="w-3 h-3 mr-1" />
                    {property.city}{property.locality ? `, ${property.locality}` : ""}
                </div>

                {/* ADAPTATION : Utilisation de l'adresse ou des équipements à défaut de description de l'API */}
                <p className="text-zinc-500 text-xs line-clamp-2 mb-6 flex-grow">
                    {property.address} — {property.facilities?.slice(0, 3).join(", ")}
                </p>

                {/* --- Footer (Prix & CTA) --- */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                    <div>
                        <p className="text-[10px] text-zinc-400 uppercase font-bold">{t("from") || "À partir de"}</p>
                        <p className="text-[#15a4e6] font-black text-lg">
                            {formattedPrice} <span className="text-[10px] font-normal text-zinc-600">{property.currency || "FCFA"}</span>
                        </p>
                    </div>

                    <Link href={`/hotels/${property.hotel_id}?token=HTB0zd1QyPEeR3oIpmVn&product=${property.product_id}&session=${sessionId}&is_local=${true}`}>
                        <Button size="sm" className="bg-zinc-900 hover:bg-[#15a4e6] text-white rounded-xl px-5 font-bold transition-all">
                            {t("bookNow") || "Réserver"}
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}