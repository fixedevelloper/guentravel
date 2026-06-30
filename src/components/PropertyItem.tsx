"use client";

import React from "react";
import useEmblaCarousel from 'embla-carousel-react';
import { MapPin, ChevronLeft, ChevronRight, Star, Heart } from "lucide-react";
import { Hotel } from "@/types/hotel";
import { Link } from "@/i18n/routing";

interface HotelItemProps {
    property: Hotel; // Reçoit l'objet typé Hotel
    locale: "fr" | "en";
    session_id:string
}

export const HotelItem: React.FC<HotelItemProps> = ({ property, locale,session_id }) => {
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

    // Extraction de la miniature (thumbnail). On crée un tableau avec la valeur si elle existe.
    const images = [property.thumbnail].filter(Boolean) as string[];

    // Formatage propre du prix en fonction de la devise retournée (EUR, USD, etc.)
    const formattedPrice = new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
        style: "currency",
        currency: property.currency,
    }).format(property.total);

    // Calcul d'un prix barré fictif si besoin (ex: +15%) pour l'effet marketing original
    const formattedOriginalPrice = new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
        style: "currency",
        currency: property.currency,
    }).format(property.total * 1.15);

    return (
        <div className="flex flex-col md:flex-row bg-white rounded-2xl border border-zinc-200/70 overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer">

            {/* Zone Média / Image */}
            <div className="w-full md:w-72 h-52 shrink-0 relative overflow-hidden bg-zinc-100">
                <div className="overflow-hidden h-full" ref={emblaRef}>
                    <div className="flex h-full">
                        {images.length > 0 ? (
                            images.map((img, i) => (
                                <div key={i} className="flex-[0_0_100%] min-w-0 h-full">
                                    <img
                                        src={img}
                                        alt={property.name}
                                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                </div>
                            ))
                        ) : (
                            /* Fallback si l'hôtel n'a pas d'image */
                            <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400 text-xs">
                                Aucune image disponible
                            </div>
                        )}
                    </div>
                </div>

                {/* Bouton Favoris discret */}
                <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm text-zinc-700 hover:text-rose-500 hover:bg-white transition shadow-sm z-10">
                    <Heart size={16} className="transition-colors" />
                </button>

                {/* Boutons de navigation (visibles si plusieurs images disponibles) */}
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

                {/* Indicateur de pagination */}
                {images.length > 0 && (
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/60 text-white rounded text-[10px] font-medium tracking-wide">
                        1 / {images.length}
                    </div>
                )}
            </div>

            {/* Zone Contenu / Informations */}
            <div className="flex flex-col md:flex-row justify-between flex-1 p-5 gap-4">

                {/* Colonne Infos Principales */}
                <div className="flex flex-col justify-between flex-1">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                            <span className="capitalize">{property.property_type || "Hôtel"}</span>
                            {property.rating > 0 && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-0.5 text-amber-500">
                                        {Array.from({ length: Math.min(5, property.rating) }).map((_, idx) => (
                                            <Star key={idx} size={12} fill="currentColor" />
                                        ))}
                                    </span>
                                </>
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-zinc-900 tracking-tight leading-snug group-hover:text-[#15a4e6] transition-colors">
                            {property.name}
                        </h3>

                        <div className="space-y-1">
                            <p className="flex items-center gap-1 Richmond text-xs text-zinc-500 font-medium">
                                <MapPin size={13} className="text-zinc-400 shrink-0" />
                                <span className="truncate">{property.address}, {property.city}</span>
                            </p>
                            {property.distance && (
                                <p className="text-[11px] text-[#15a4e6] font-semibold pl-4">
                                    À {property.distance.value} {property.distance.unit.toLowerCase()} du centre
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Éléments de confiance / Avantages extraits du JSON */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                        {property.fare_type === "Refundable" && (
                            <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100">
                                {locale === "fr" ? "Annulation gratuite" : "Free Cancellation"}
                            </span>
                        )}
                        {property.facilities?.slice(0, 2).map((facility, idx) => (
                            <span key={idx} className="text-[11px] font-medium px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded capitalize">
                                {facility}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Colonne Prix & Call to Action */}
                <div className="flex flex-row md:flex-col justify-between md:justify-end md:items-end md:text-right border-t md:border-t-0 border-zinc-100 pt-3 md:pt-0 shrink-0 min-w-[150px]">

                    {/* Note TripAdvisor si elle est supérieure à 0 */}
                    {property.trip_advisor && Number(property.trip_advisor.rating) > 0 ? (
                        <div className="hidden md:flex items-center gap-2 mb-auto">
                            <div className="text-right">
                                <p className="text-xs font-bold text-zinc-900">TripAdvisor</p>
                                <p className="text-[10px] text-zinc-400">{property.trip_advisor.reviews} avis</p>
                            </div>
                            <span className="bg-[#7bcd4f] text-white text-xs font-bold px-2 py-1 rounded-lg">
                                {property.trip_advisor.rating}
                            </span>
                        </div>
                    ) : (
                        <div className="hidden md:block mb-auto text-xs text-zinc-400 italic">
                            Aucun avis récent
                        </div>
                    )}

                    {/* Bloc Prix Global */}
                    <div className="space-y-0.5">
                        <p className="text-[10px] text-zinc-400 font-medium line-through decoration-zinc-300">
                            {formattedOriginalPrice}
                        </p>
                        <p className="text-lg font-extrabold text-zinc-900 tracking-tight">
                            {formattedPrice}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-medium">
                            {locale === "fr" ? "prix total du séjour" : "total stay price"}
                        </p>
                    </div>

                    {/* Bouton vers la page détails de l'hôtel */}
                    <Link
                        href={`/hotels/${property.hotel_id}?token=${property.token_id}&session=${session_id}&product=${property.product_id}&is_local=${false}`}
                        className="md:mt-3 px-5 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-sm active:scale-98 text-center"
                    >
                        {locale === "fr" ? "Voir les chambres" : "View rooms"}
                    </Link>
                </div>

            </div>
        </div>
    );
};