"use client";

import { useState } from "react";
import {
    MapPin, Star, Wifi, Car, ShieldCheck, Dumbbell,
    Tv, Coffee, ChevronDown, ChevronUp, Layers, Info
} from "lucide-react";
import { HotelDetails } from "@/types/hotel";
import { Badge } from "@/components/ui/badge";

// Dictionnaire pour associer les mots-clés d'API à des icônes spécifiques
const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    "wi-fi": Wifi,
    "wifi": Wifi,
    "internet": Wifi,
    "wired internet": Wifi,
    "car park": Car,
    "parking": Car,
    "gym": Dumbbell,
    "aerobics": Dumbbell,
    "fitness center": Dumbbell,
    "tv lounge": Tv,
    "bathroom": Info,
    "breakfast": Coffee,
    "american express": ShieldCheck,
};

export function HotelInfo({ hotel }: { hotel: HotelDetails }) {
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    // Filtrage des équipements pour repérer les "Key Facilities"
    const facilities = hotel.facilities || [];

    // Séparation des équipements avec icônes connues et le reste
    const featuredFacilities = facilities.filter(f =>
        Object.keys(AMENITY_ICONS).some(key => f.toLowerCase().includes(key))
    ).slice(0, 4);

    // Seuil de troncation de la description
    const shouldTruncate = hotel.description && hotel.description.length > 280;
    const displayedDescription = shouldTruncate && !isDescExpanded
        ? `${hotel.description?.slice(0, 280)}...`
        : hotel.description;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* --- En-tête : Nom, Étoiles & Localisation --- */}
            <div className="space-y-2">
                {hotel.rating > 0 && (
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: Math.min(5, hotel.rating) }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        ))}
                    </div>
                )}
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight leading-none">
                    {hotel.name}
                </h1>
                <div className="flex items-start gap-1.5 text-zinc-500 pt-1">
                    <MapPin className="h-4 w-4 text-[#15a4e6] shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm font-medium leading-relaxed">
                        {hotel.address}
                    </p>
                </div>
            </div>

            <hr className="border-zinc-100" />

            {/* --- Section : À propos (Description dynamique) --- */}
            {hotel.description && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        À propos de cet établissement
                    </h3>
                    <div className="text-sm text-zinc-600 leading-relaxed font-normal transition-all duration-300">
                        {/* On injecte le HTML de manière sécurisée dans un span inline */}
                        <span
                            dangerouslySetInnerHTML={{ __html: displayedDescription ?? "" }}
                        />

                        {shouldTruncate && (
                            <button
                                onClick={() => setIsDescExpanded(!isDescExpanded)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#15a4e6] hover:text-[#118ec7] ml-2 group focus:outline-none"
                            >
                                {isDescExpanded ? (
                                    <>Moins de détails <ChevronUp size={14} /></>
                                ) : (
                                    <>Lire la suite <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" /></>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* --- Section : Équipements vedettes à icônes --- */}
            {featuredFacilities.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Points forts de l'hôtel
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {featuredFacilities.map((facility, index) => {
                            // Trouver la clé d'icône correspondante
                            const matchedKey = Object.keys(AMENITY_ICONS).find(key =>
                                facility.toLowerCase().includes(key)
                            );
                            const IconComponent = matchedKey ? AMENITY_ICONS[matchedKey] : Info;

                            return (
                                <div key={index} className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-100 bg-zinc-50/30">
                                    <div className="p-2 bg-white rounded-xl text-zinc-700 shadow-sm border border-zinc-100 shrink-0">
                                        <IconComponent className="h-4 w-4 text-zinc-600" />
                                    </div>
                                    <span className="text-xs font-semibold text-zinc-700 capitalize truncate">
                                        {facility}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* --- Section : Tous les équipements (Badges secondaires) --- */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Layers size={14} className="text-zinc-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Tous les services & installations
                    </h3>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                    {facilities.map((f, i) => (
                        <Badge
                            key={i}
                            variant="secondary"
                            className="bg-zinc-100/70 text-zinc-600 hover:bg-zinc-200/60 font-medium px-2.5 py-1 rounded-xl text-[11px] border border-zinc-200/20 capitalize tracking-wide transition-colors"
                        >
                            {f}
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    );
}