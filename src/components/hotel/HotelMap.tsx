"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Hotel } from "@/types/hotel";
import { X, Maximize2, Minimize2 } from "lucide-react";

// Import dynamique pour éviter SSR (Leaflet nécessite window)
const MapInner = dynamic(() => import("./MapInner"), {
    ssr:     false,
    loading: () => (
        <div className="w-full h-full bg-zinc-100 animate-pulse rounded-xl flex items-center justify-center">
            <p className="text-xs text-zinc-400">Chargement de la carte...</p>
        </div>
    ),
});

interface HotelMapProps {
    hotels:     Hotel[];
    sessionId:  string;
    className?: string;
}

export function HotelMap({ hotels, sessionId, className = "" }: HotelMapProps) {
    const [isOpen,     setIsOpen]     = useState(false);
    const [isFullscreen, setFullscreen] = useState(false);

    return (
        <>
            {/* Bouton déclencheur */}
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs font-semibold px-4 py-2 bg-white rounded-md shadow-sm border border-zinc-200 hover:bg-zinc-50 transition-colors">
                Afficher la carte
            </button>

            {/* Modal carte */}
            {isOpen && (
                <div className={`
                    fixed inset-0 z-999 flex items-center justify-center
                    bg-black/50 backdrop-blur-sm
                `}>
                    <div className={`
                        bg-white rounded-2xl shadow-2xl overflow-hidden
                        transition-all duration-300
                        ${isFullscreen
                        ? "w-full h-[90vh] rounded-none"
                        : "w-[90vw] h-[80vh] max-w-5xl"
                    }
                    `}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 relative z-999 bg-white">
                            <h3 className="text-sm font-semibold text-zinc-900">
                                {hotels.length} hôtel{hotels.length > 1 ? "s" : ""} sur la carte
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setFullscreen((p) => !p)}
                                    className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-500">
                                    {isFullscreen
                                        ? <Minimize2 className="h-4 w-4" />
                                        : <Maximize2 className="h-4 w-4" />
                                    }
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-500">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Carte */}
                        <div className="w-full" style={{ height: "calc(100% - 53px)" }}>
                            <MapInner
                                hotels={hotels}
                                sessionId={sessionId}
                                onClose={() => setIsOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}