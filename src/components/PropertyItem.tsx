"use client";

import React from "react";
import useEmblaCarousel from 'embla-carousel-react';
import { MapPin, ChevronLeft, ChevronRight, Star, Heart } from "lucide-react";
import { Property } from "../types/property";
import { Link } from "@/i18n/navigation";

interface PropertyItemProps {
    property: Property;
    locale: "fr" | "en";
}

export const PropertyItem: React.FC<PropertyItemProps> = ({ property, locale }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

    const scrollPrev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        emblaApi?.scrollPrev();
    };
    const scrollNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        emblaApi?.scrollNext();
    };

    const images = [property.media.cover, ...property.media.gallery].filter(Boolean) as string[];

    return (
        <div className="flex flex-col md:flex-row bg-white rounded-2xl border border-zinc-200/70 overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer">

            {/* Zone Média / Slider (Format Rectangulaire Pro) */}
            <div className="w-full md:w-72 h-52 shrink-0 relative overflow-hidden bg-zinc-100">
                <div className="overflow-hidden h-full" ref={emblaRef}>
                    <div className="flex h-full">
                        {images.map((img, i) => (
                            <div key={i} className="flex-[0_0_100%] min-w-0 h-full">
                                <img src={img} alt={property.name[locale]} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bouton Favoris discret */}
                <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm text-zinc-700 hover:text-rose-500 hover:bg-white transition shadow-sm z-10">
                    <Heart size={16} className="transition-colors" />
                </button>

                {/* Boutons de navigation (visibles principalement au survol) */}
                {images.length > 1 && (
                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <button onClick={scrollPrev} className="bg-white/90 p-1.5 rounded-full text-zinc-800 hover:bg-white shadow-md transition-transform active:scale-95">
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={scrollNext} className="bg-white/90 p-1.5 rounded-full text-zinc-800 hover:bg-white shadow-md transition-transform active:scale-95">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}

                {/* Indicateur de pagination d'images discret */}
                <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/60 text-white rounded text-[10px] font-medium tracking-wide">
                    1 / {images.length}
                </div>
            </div>

            {/* Zone Contenu / Informations (Layout Multi-colonnes) */}
            <div className="flex flex-col md:flex-row justify-between flex-1 p-5 gap-4">

                {/* Colonne Infos Principales */}
                <div className="flex flex-col justify-between flex-1">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                            <span>Appartement / Logement</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-amber-500">
                                <Star size={12} fill="currentColor" /> 4.8
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 tracking-tight leading-snug group-hover:text-zinc-700 transition-colors">
                            {property.name[locale]}
                        </h3>
                        <p className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
                            <MapPin size={13} className="text-zinc-400" /> {property.location.city}, {property.location.country_code}
                        </p>
                    </div>

                    {/* Tags d'avantages style Hotels.com */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 text-[#1d9e4b] rounded">
                            Annulation gratuite
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded">
                            Wi-Fi inclus
                        </span>
                    </div>
                </div>

                {/* Colonne Prix & Call to Action (Alignée à droite sur Desktop) */}
                <div className="flex flex-row md:flex-col justify-between md:justify-end md:items-end md:text-right border-t md:border-t-0 border-zinc-100 pt-3 md:pt-0 shrink-0 min-w-[140px]">

                    {/* Note d'évaluation compacte */}
                    <div className="hidden md:flex items-center gap-2 mb-auto">
                        <div className="text-right">
                            <p className="text-xs font-bold text-zinc-900">Excellent</p>
                            <p className="text-[10px] text-zinc-400">45 avis</p>
                        </div>
                        <span className="bg-[#1d9e4b] text-white text-xs font-bold px-2 py-1 rounded-lg">
                            9.2
                        </span>
                    </div>

                    {/* Bloc Prix */}
                    <div className="space-y-0.5">
                        <p className="text-[10px] text-zinc-400 font-medium line-through decoration-zinc-300">
                            {(property.price_range.min * 1.15).toLocaleString()} FCFA
                        </p>
                        <p className="text-lg font-extrabold text-zinc-900 tracking-tight">
                            {property.price_range.min.toLocaleString()} FCFA
                        </p>
                        <p className="text-[10px] text-zinc-400 font-medium">
                            par nuit (TTC)
                        </p>
                    </div>

                    {/* Bouton d'action */}
                    <Link href={`/properties/${property.uuid}`} className="md:mt-3 px-5 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-sm active:scale-98">
                        Voir les options
                    </Link>
                </div>

            </div>
        </div>
    );
};