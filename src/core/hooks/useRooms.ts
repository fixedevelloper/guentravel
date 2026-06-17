"use client";

import { useQuery } from "@tanstack/react-query";
import {api} from "../api/axios-instance";

/**
 * Hook pour récupérer les chambres avec filtres optionnels
 */
export function useRooms(params: {
    city?: string | null;
    guests?: number | null;
    min_price?: number | null;
    page?: number;
} = {}) {
    return useQuery({
        // La clé inclut les paramètres pour que le cache se vide automatiquement si les filtres changent
        queryKey: ["rooms", params],
        queryFn: async () => {
            const { data } = await api.get("/rooms", { params });
            return data.data; // Retourne l'objet paginé (data, meta, etc.)
        },
        placeholderData: (previousData) => previousData, // Garde les anciennes données pendant le chargement
    });
}

/**
 * Hook spécifique pour récupérer les offres (pour la homepage)
 */
export function useRoomOffers() {
    return useQuery({
        queryKey: ["rooms-offers"],
        queryFn: async () => {
            const { data } = await api.get("/rooms/offers");
            return data.data;
        },
    });
}