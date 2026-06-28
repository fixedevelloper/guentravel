// hooks/useCities.ts
import { useQuery } from "@tanstack/react-query";
import {hotelKeys} from "../queryKeys/hotelKeys";
import {hotelService} from "../services/hotelService";
import {City} from "../../types/hotel";


export function useCities(from = 1, to = 100) {
    const query = useQuery({
        queryKey: hotelKeys.cities(from, to),
        queryFn:  () => hotelService.cities(from, to),
        staleTime: 60 * 60 * 1000,  // 1h — données rarement modifiées
        gcTime:    24 * 60 * 60 * 1000, // 24h en cache
    });

    // Recherche locale sur les résultats mis en cache
    const search = (term: string): City[] => {
        if (!query.data?.cities || term.trim().length < 2) return [];
        const lower = term.toLowerCase();
        return query.data.cities.filter(
            (c) =>
                c.city_name.toLowerCase().includes(lower) ||
                c.country_name.toLowerCase().includes(lower)
        );
    };

    return {
        cities:  query.data?.cities ?? [],
        loading: query.isLoading,
        error:   query.error?.message ?? null,
        search,
    };
}