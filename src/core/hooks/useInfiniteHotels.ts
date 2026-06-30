// hooks/useInfiniteHotels.ts
import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation }           from "@tanstack/react-query";
import { Hotel }                 from "@/types/hotel";
import {hotelService} from "../services/hotelService";

export function useInfiniteHotels(
    initialHotels: Hotel[],
    sessionId:     string,
    nextToken:     string | null
) {
    const [hotels,  setHotels]  = useState<Hotel[]>(initialHotels);
    const [token,   setToken]   = useState<string | null>(nextToken);
    const [hasMore, setHasMore] = useState(!!nextToken);

    // Évite de re-synchroniser après que l'utilisateur ait déjà chargé plus de pages
    const hasLoadedMore = useRef(false);

    // Resynchronise quand la recherche initiale arrive (results passe de undefined → data)
    useEffect(() => {
        if (hasLoadedMore.current) return; // Ne pas écraser si déjà paginé
        setHotels(initialHotels);
        setToken(nextToken);
        setHasMore(!!nextToken);
    }, [initialHotels, nextToken]);

    const mutation = useMutation({
        mutationFn: () => hotelService.getMoreResults(sessionId, token!, 20),

        onSuccess: (data) => {
            hasLoadedMore.current = true;

            if (!data.status.more_results) {
                setHasMore(false);
                return;
            }

            setHotels((prev) => [...prev, ...data.hotels]);
            setToken(data.status.next_token);
            setHasMore(data.status.more_results && !!data.status.next_token);
        },

        onError: () => setHasMore(false),
    });

    const loadMore = useCallback(() => {
        if (!token || mutation.isPending) return;
        mutation.mutate();
    }, [token, mutation]);

    return {
        hotels,
        hasMore,
        loadMore,
        loading: mutation.isPending,
        error:   mutation.error?.message ?? null,
    };
}