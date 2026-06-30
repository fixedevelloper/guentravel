"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Hotel } from "@/types/hotel";
import { fixLeafletIcons, priceIcon } from "@/lib/leaflet-icons";
import { Star, ArrowRight } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import React from "react";

// Auto-fit bounds sur les hôtels
function FitBounds({ hotels }: { hotels: Hotel[] }) {
    const map = useMap();

    useEffect(() => {
        if (!hotels.length) return;
        const valid = hotels.filter((h) => h.latitude && h.longitude);
        if (!valid.length) return;

        const bounds = valid.map((h) => [h.latitude, h.longitude] as [number, number]);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }, [hotels, map]);

    return null;
}

interface MapInnerProps {
    hotels:    Hotel[];
    sessionId: string;
    onClose:   () => void;
}

export default function MapInner({ hotels, sessionId, onClose }: MapInnerProps) {
    const router                          = useRouter();
    const [selectedId, setSelectedId]     = useState<string | null>(null);

    useEffect(() => { fixLeafletIcons(); }, []);

    const validHotels = hotels.filter(
        (h) => h.latitude && h.longitude &&
            !isNaN(h.latitude) && !isNaN(h.longitude)
    );

    const center: [number, number] = validHotels.length
        ? [validHotels[0].latitude, validHotels[0].longitude]
        : [48.8566, 2.3522]; // Paris par défaut

    return (
        <MapContainer
            center={center}
            zoom={12}
            style={{ width: "100%", height: "100%" }}
            zoomControl={true}>

            {/* Fond de carte OpenStreetMap */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Auto-fit */}
            <FitBounds hotels={validHotels} />

            {/* Marqueurs */}
            {validHotels.map((hotel) => (
                <Marker
                    key={hotel.hotel_id}
                    position={[hotel.latitude, hotel.longitude]}
                    icon={priceIcon(
                        String(hotel.total),
                        hotel.currency,
                        selectedId === hotel.hotel_id
                    )}
                    eventHandlers={{
                        // Déclanché au clic sur le marqueur
                        click: () => setSelectedId(hotel.hotel_id),
                        // CORRECTION : Déclanché quand la popup s'ouvre
                        popupopen: () => setSelectedId(hotel.hotel_id),
                        // CORRECTION : Déclanché quand la popup se ferme (croix ou clic à côté)
                        popupclose: () => setSelectedId(null),
                    }}>

                    {/* Le paramètre onClose a été retiré d'ici */}
                    <Popup
                        maxWidth={280}
                        className="hotel-popup">

                        <div className="w-64 overflow-hidden">
                            {/* Image */}
                            {hotel.thumbnail && (
                                <div className="relative h-32 w-full -mx-3 -mt-3 mb-3">
                                    <img
                                        src={hotel.thumbnail}
                                        alt={hotel.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Infos */}
                            <div className="space-y-1.5">
                                {/* Étoiles */}
                                <div className="flex gap-0.5">
                                    {Array.from({ length: hotel.rating ?? 0 }).map((_, i) => (
                                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>

                                <p className="font-semibold text-sm text-zinc-900 leading-tight">
                                    {hotel.name}
                                </p>

                                <p className="text-xs text-zinc-500">{hotel.city}</p>

                                <div className="flex items-center justify-between pt-1">
                                    <div>
                                        <span className="text-base font-bold text-zinc-900">
                                            {hotel.currency} {hotel.total.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-zinc-400 ml-1">/ nuit</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            onClose();
                                            router.push(
                                                `/hotels/${hotel.hotel_id}?token=${hotel.token_id}&product=${hotel.product_id}&session=${sessionId}`
                                            );
                                        }}
                                        className="flex items-center gap-1 bg-[#15a4e6] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#1290cc] transition-colors">
                                        Voir
                                        <ArrowRight className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}