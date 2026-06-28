// hooks/useHotelSearch.ts
import { useQuery } from "@tanstack/react-query";
import { HotelSearchParams } from "@/types/hotel";
import { hotelService } from "../services/hotelService";
import { hotelKeys } from "../queryKeys/hotelKeys";

export function useHotelSearch(params: HotelSearchParams | null) {

    const query = useQuery({
        // 1. Les paramètres sont dans la clé : si les dates ou la ville changent,
        // React Query récupère automatiquement la bonne version du cache ou relance l'API
        queryKey: params ? hotelKeys.search(params) : [...hotelKeys.all, "search", "empty"],

        // 2. La fonction appelle l'API Laravel (qui fait un GET /hotels/search)
        queryFn: () => {
            if (!params) throw new Error("Paramètres manquants");
            return hotelService.search(params);
        },

        // 3. IMPORTANT : N'exécute la requête QUE si on a des paramètres valides
        enabled: !!params,

        // Données d'hôtels valides pendant 15 minutes (évite de ré-appeler l'API à chaque clic)
        staleTime: 15 * 60 * 1000,

        // Garde les anciens hôtels affichés pendant le rechargement d'un filtre
        placeholderData: (prev) => prev,
    });

    return {
        results: query.data ?? null,
        loading: query.isFetching, // Captures les chargements initiaux ET les rafraîchissements
        error:   query.error instanceof Error ? query.error.message : null,
        refetch: query.refetch,
    };
}