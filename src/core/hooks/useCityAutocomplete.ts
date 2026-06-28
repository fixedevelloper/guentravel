// hooks/useCityAutocomplete.ts
import { useQuery } from "@tanstack/react-query";
import { hotelKeys } from "../queryKeys/hotelKeys";
import { hotelService } from "../services/hotelService";

export function useCityAutocomplete(term: string, limit = 10) {
    const trimmedTerm = term.trim();

    return useQuery({
        // 1. On utilise le terme nettoyé (sans espaces inutiles) dans la clé
        queryKey: hotelKeys.citySearch(trimmedTerm, limit),

        // 2. On passe également le terme nettoyé à l'API
        queryFn: () => hotelService.searchCities(trimmedTerm, limit),

        // 3. Ne se déclenche que s'il y a au moins 2 caractères réels
        enabled: trimmedTerm.length >= 2,

        staleTime: 5 * 60 * 1000,

        // Maintient une UX fluide lors de la saisie
        placeholderData: (previousData) => previousData,
    });
}