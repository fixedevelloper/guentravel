import { useState, useCallback }       from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FilterParams, HotelFilters, Hotel, FilterStatus } from "@/types/hotel";
import { hotelService } from "../services/hotelService";
import { hotelKeys }    from "../queryKeys/hotelKeys";

export function useHotelFilter(sessionId: string) {
    const queryClient               = useQueryClient();
    const [hotels,    setHotels]    = useState<Hotel[]>([]);
    const [status,    setStatus]    = useState<FilterStatus | null>(null);
    const [filterKey, setFilterKey] = useState<string | null>(null);
    const [noResults, setNoResults] = useState(false);

    const mutation = useMutation({
        mutationFn: hotelService.filterHotels,

        onSuccess: (data) => {
            // Cas no_results — liste vide, pas une erreur
            if (!data.success && data.type === "no_results") {
                setHotels([]);
                setNoResults(true);
                setFilterKey(null);
                return;
            }

            setNoResults(false);
            setHotels(data.hotels   ?? []);
            setStatus(data.status   ?? null);
            setFilterKey(data.filter_key ?? null);

            queryClient.setQueryData(
                hotelKeys.filter({ session_id: sessionId }),
                data
            );
        },

        onError: () => {
            setNoResults(false);
            setHotels([]);
        },
    });

    // Retourne les hôtels pour usage inline (FiltersPanel)
    const applyFilters = useCallback(async (
        filters:   HotelFilters,
        maxResult: number = 20
    ): Promise<Hotel[]> => {
        const result = await mutation.mutateAsync({
            session_id: sessionId,
            max_result: maxResult,
            filters,
        });

        if (!result.success && result.type === "no_results") {
            return [];
        }

        return result?.hotels ?? [];
    }, [sessionId, mutation]);

    const reset = useCallback(() => {
        setHotels([]);
        setStatus(null);
        setFilterKey(null);
        setNoResults(false);
        mutation.reset();
    }, [mutation]);

    return {
        applyFilters,
        reset,
        hotels,
        status,
        filterKey,
        noResults,
        loading: mutation.isPending,
        error:   mutation.error?.message ?? null,
    };
}