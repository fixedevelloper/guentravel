import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { Property, PropertySearchParams } from "@/types/property";
import { useEffect, useState } from "react";

// 1. Retourner un objet contenant le tableau 'data' pour correspondre à votre composant
const searchProperties = async (params: PropertySearchParams): Promise<{ data: Property[] }> => {
    if (Object.keys(params).length === 0) return { data: [] };

    const { data } = await api.get("/search", { params });
    // On s'assure de retourner la structure { data: Property[] }
    return { data: data.data || [] };
};

export function usePropertySearch(params: PropertySearchParams) {
    const [debouncedParams, setDebouncedParams] = useState(params);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedParams(params);
        }, 500);

        return () => clearTimeout(handler);
    }, [params]);

    // 2. On récupère le résultat du query
    const query = useQuery({
        queryKey: ["properties-search", debouncedParams],
        queryFn: () => searchProperties(debouncedParams),
        enabled: Object.keys(params).length > 0,
        // Optionnel : maintient les données précédentes pendant le chargement (meilleure UX)
        placeholderData: { data: [] },
    });

    return {
        // 3. On retourne une valeur par défaut sécurisée
        searchResults: query.data ?? { data: [] },
        isSearching: query.isLoading,
        ...query
    };
}