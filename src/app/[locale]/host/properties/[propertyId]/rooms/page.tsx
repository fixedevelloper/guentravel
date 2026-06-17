"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { api } from "@/core/api/axios-instance";
import {
    Plus,
    ArrowLeft,
    Users,
    Baby,
    Layers,
    Eye,
    EyeOff,
    ChevronLeft,
    ChevronRight,
    Bed, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

interface Media {
    id: number;
    original_url: string;
}

interface Room {
    id: number;
    property_id: number;
    name: Record<string, string>;
    description: Record<string, string>;
    base_occupancy: number;
    max_occupancy: number;
    max_children: number;
    total_inventory: number;
    default_price_per_night: string;
    is_active: boolean;
    media?: Media[]; // Ajout de la structure média de l'API
    property: {
        id: number;
        name: Record<string, string>;
        city: string;
    };
}

export default function PropertyRoomsPage() {
    const params = useParams();
    const currentLocale = useLocale();
    const propertyId = params.propertyId;
    const [page, setPage] = useState(1);

    // Récupération des chambres paginées
    const { data: apiResponse, isLoading } = useQuery({
        queryKey: ["property-rooms", propertyId, page],
        queryFn: async () => {
            const response = await api.get(`/host/properties/${propertyId}/rooms?page=${page}`);
            return response.data;
        },
    });

    const roomsData: Room[] = apiResponse?.data?.data || [];
    const pagination = apiResponse?.data;

    // Fallback global pour le nom de l'hôtel
    const hotelName =
        roomsData[0]?.property?.name?.[currentLocale] ||
        roomsData[0]?.property?.name?.["en"] ||
        roomsData[0]?.property?.name?.["fr"] ||
        "Établissement";

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

            {/* EN-TÊTE DE LA PAGE */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                <div className="flex items-center gap-3">
                    <Link href="/host/properties">
                        <Button variant="ghost" size="icon" className="rounded-xl border border-zinc-200">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-zinc-900 tracking-tight">
                            {hotelName}
                        </h1>
                        <p className="text-xs text-zinc-500">Gestion des types de chambres disponibles</p>
                    </div>
                </div>

                <Link href={`/host/properties/${propertyId}/rooms/create`}>
                    <Button className="bg-[#1d9e4b] hover:bg-[#15803c] rounded-xl gap-2 text-xs font-bold self-start md:self-auto transition-all active:scale-95">
                        <Plus className="h-4 w-4" />
                        Ajouter une chambre
                    </Button>
                </Link>
            </div>

            {/* GRILLE DES CHAMBRES */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((n) => (
                        <div key={n} className="h-48 bg-zinc-50 border border-zinc-200 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : roomsData.length === 0 ? (
                <div className="border border-dashed border-zinc-200 rounded-2xl p-12 text-center bg-zinc-50/50">
                    <p className="text-sm font-semibold text-zinc-600">Aucune chambre pour cet établissement.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roomsData.map((room) => {
                        const roomName = room.name[currentLocale] || room.name["en"] || room.name["fr"] || "Unnamed Room";
                        const roomDesc = room.description[currentLocale] || room.description["en"] || room.description["fr"] || "No description available.";

                        // Récupération de la première image comme cover
                        const coverUrl = room.media && room.media.length > 0 ? room.media[0].original_url : null;

                        return (
                            <div key={room.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row hover:border-zinc-300 transition-all group">

                                {/* CONTENEUR IMAGE DE COUVERTURE */}
                                <div className="relative w-full sm:w-40 h-40 sm:h-auto bg-zinc-100 flex-shrink-0 overflow-hidden border-b sm:border-b-0 sm:border-r border-zinc-100">
                                    {coverUrl ? (
                                        <img
                                            src={coverUrl}
                                            alt={roomName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-1">
                                            <Bed className="h-5 w-5 stroke-[1.5]" />
                                            <span className="text-[10px] font-medium">Pas de photo</span>
                                        </div>
                                    )}

                                    {/* BADGE DE VISIBILITÉ SUR L'IMAGE */}
                                    <span className={`absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-md ${room.is_active ? "bg-white/90 text-green-700" : "bg-black/70 text-zinc-300"}`}>
                                        {room.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                        {room.is_active ? "Actif" : "Masqué"}
                                    </span>
                                </div>

                                {/* CONTENU TEXTUEL */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-zinc-800 text-base leading-tight">{roomName}</h3>
                                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{roomDesc}</p>
                                    </div>

                                    {/* CARACTÉRISTIQUES TECHNIQUES */}
                                    <div className="grid grid-cols-3 gap-1 my-3 bg-zinc-50 p-2 rounded-xl border border-zinc-100/70 text-[11px]">
                                        <div className="flex items-center gap-1 text-zinc-600 justify-center">
                                            <Users className="h-3 w-3 text-zinc-400" />
                                            <span>Max: <strong>{room.max_occupancy}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-1 text-zinc-600 justify-center">
                                            <Baby className="h-3 w-3 text-zinc-400" />
                                            <span>Enfants: <strong>{room.max_children}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-1 text-zinc-600 justify-center">
                                            <Layers className="h-3 w-3 text-zinc-400" />
                                            <span>Dispo: <strong>{room.total_inventory}</strong></span>
                                        </div>
                                    </div>

                                    {/* FOOTER DE LA CARD CHAMBRE */}
                                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                                        <div>
                                            <span className="text-[10px] text-zinc-400 block leading-none">Tarif de base</span>
                                            <span className="text-sm font-black text-zinc-900">
                                                {parseFloat(room.default_price_per_night).toLocaleString()} € <span className="text-[10px] text-zinc-500 font-normal">/nuit</span>
                                            </span>
                                        </div>

                                    </div>
                                    <div className="flex items-center gap-2">
                                    <Link href={`/host/properties/${propertyId}/rooms/${room.id}/calendar`}>
                                        <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs font-bold border-zinc-200 hover:bg-[#f39c28]/10 hover:text-[#f39c28]">
                                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                            Calendrier
                                        </Button>
                                    </Link>
                                    <Link href={`/host/properties/${propertyId}/rooms/${room.id}/edit`}>
                                        <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs font-bold border-zinc-200 hover:bg-zinc-50">
                                            Modifier
                                        </Button>
                                    </Link>
                                </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* SYSTÈME DE PAGINATION */}
            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                    <span className="text-xs text-zinc-500">
                        Affichage {pagination.from} à {pagination.to} sur {pagination.total} chambres
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPage(p => Math.max(p - 1, 1))}
                            disabled={page === 1}
                            className="rounded-xl"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPage(p => Math.min(p + 1, pagination.last_page))}
                            disabled={page === pagination.last_page}
                            className="rounded-xl"
                        >
                            Suivant <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}