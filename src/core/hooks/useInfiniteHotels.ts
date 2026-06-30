// hooks/useInfiniteHotels.ts
import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation }           from "@tanstack/react-query";
import { Hotel }                 from "@/types/hotel";
import {hotelService} from "../services/hotelService";

function areHotelListsEqual(a: Hotel[], b: Hotel[]): boolean {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    return a.every((hotel, i) => hotel.hotel_id === b[i]?.hotel_id);
}

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
    // ✅ FIX : on ne déclenche setState que si le contenu a réellement changé,
    // ce qui évite la boucle quand `initialHotels` change de référence sans
    // changer de contenu (ex: tableau vide recréé à chaque render parent).
    useEffect(() => {
        if (hasLoadedMore.current) return; // Ne pas écraser si déjà paginé

        setHotels((prev) =>
            areHotelListsEqual(prev, initialHotels) ? prev : initialHotels
        );
        setToken((prev) => (prev === nextToken ? prev : nextToken));
        setHasMore((prev) => {
            const next = !!nextToken;
            return prev === next ? prev : next;
        });
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
    }, [token, mutation.isPending, mutation.mutate]);

    return {
        hotels,
        hasMore,
        loadMore,
        loading: mutation.isPending,
        error:   mutation.error?.message ?? null,
    };
}