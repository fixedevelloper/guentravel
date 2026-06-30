"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { HotelImage } from "@/types/hotel";
import { ChevronLeft, ChevronRight, X, ImageIcon } from "lucide-react";

export function HotelGallery({ images, name }: { images: HotelImage[]; name: string }) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Filtrage et nettoyage des URLs pour éviter les corruptions de chaînes Next.js
    const valid = images
        .filter(img => img && img.url)
        .map(img => ({
            ...img,
            url: img.url.split("?")[0] // Nettoie les doubles query-strings d'API (?2024...?2025)
        }));

    // Gestion de la navigation au clavier pour la Lightbox
    useEffect(() => {
        if (lightboxIndex === null) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setLightboxIndex(null);
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxIndex]);

    if (!valid.length) {
        return (
            <div className="w-full h-80 bg-zinc-100 rounded-3xl flex flex-col items-center justify-center text-zinc-400 gap-2 border border-zinc-200/60">
                <ImageIcon size={32} strokeWidth={1.5} />
                <span className="text-xs font-medium">Aucune photo disponible pour cet établissement</span>
            </div>
        );
    }

    const handlePrev = () => {
        setLightboxIndex(prev => (prev !== null ? (prev - 1 + valid.length) % valid.length : null));
    };

    const handleNext = () => {
        setLightboxIndex(prev => (prev !== null ? (prev + 1) % valid.length : null));
    };

    return (
        <>
            {/* Grille Mosaïque Principale (Layout Desktop Style) */}
            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2.5 h-[320px] md:h-[440px] rounded-3xl overflow-hidden bg-white group/gallery">

                {/* Image principale (Grande gauche - 50% de la largeur) */}
                <div
                    onClick={() => setLightboxIndex(0)}
                    className="col-span-1 md:col-span-2 row-span-2 relative cursor-pointer overflow-hidden bg-zinc-100"
                >
                    <Image
                        src={valid[0].url}
                        alt={name}
                        fill
                        priority
                        sizes="(max-w-768px) 100vw, 50vw"
                        className="object-cover hover:scale-[1.015] transition-transform duration-500 ease-out"
                    />
                </div>

                {/* Miniatures de droite */}
                {valid.slice(1, 5).map((img, i) => {
                    const globalIndex = i + 1;
                    const isLast = i === 3;
                    const hasMore = valid.length > 5;

                    return (
                        <div
                            key={i}
                            onClick={() => setLightboxIndex(globalIndex)}
                            className="hidden md:block relative cursor-pointer overflow-hidden bg-zinc-100"
                        >
                            <Image
                                src={img.url}
                                alt={`${name} ${globalIndex + 1}`}
                                fill
                                sizes="25vw"
                                className="object-cover hover:scale-[1.03] transition-transform duration-500 ease-out"
                            />

                            {/* Overlay de fin "+ X photos" */}
                            {isLast && hasMore && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white transition-colors hover:bg-black/50">
                                    <span className="font-black text-xl tracking-tight">
                                        +{valid.length - 5}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 mt-0.5">
                                        Photos
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Lightbox / Modal Plein Écran Haute Qualité */}
            {lightboxIndex !== null && (
                <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex items-center justify-center animate-fade-in select-none">

                    {/* Bouton Fermer */}
                    <button
                        onClick={() => setLightboxIndex(null)}
                        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition shadow-lg border border-zinc-800/50"
                    >
                        <X size={20} />
                    </button>

                    {/* Navigation : Précédent */}
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="absolute left-6 p-3 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 transition shadow-lg border border-zinc-800/50"
                    >
                        <ChevronLeft size={22} />
                    </button>

                    {/* Zone de l'image centrale */}
                    <div className="relative w-full max-w-5xl h-[75vh] mx-16" onClick={() => setLightboxIndex(null)}>
                        <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
                            <Image
                                src={valid[lightboxIndex].url}
                                alt={`${name} - vue ${lightboxIndex + 1}`}
                                fill
                                unoptimized // Évite de surcharger le serveur d'optimisation Next pour la Lightbox HD
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {/* Navigation : Suivant */}
                    <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="absolute right-6 p-3 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 transition shadow-lg border border-zinc-800/50"
                    >
                        <ChevronRight size={22} />
                    </button>

                    {/* Compteur de pagination inférieur discret */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-zinc-900/60 backdrop-blur-sm rounded-full text-xs font-semibold text-zinc-400 border border-zinc-800/30 tracking-wide">
                        <span className="text-white">{lightboxIndex + 1}</span> / {valid.length}
                    </div>
                </div>
            )}
        </>
    );
}