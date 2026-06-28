// hooks/useRoomRates.ts
import { useQuery } from "@tanstack/react-query";
import { RoomRatesParams, RoomRate } from "@/types/hotel";
import { hotelKeys } from "../queryKeys/hotelKeys";
import { hotelService } from "../services/hotelService";

export function useRoomRates(params: RoomRatesParams | null) {
    const query = useQuery({
        // Utilisation d'une condition sûre pour éviter de passer un null à vos clés de requête
        queryKey: params ? hotelKeys.roomRates(params) : ["hotel", "rates", "empty"],
        queryFn:  () => hotelService.getRoomRates(params!),
        enabled:  !!params?.session_id && !!params?.hotel_id,
        staleTime: 5 * 60 * 1000,  // 5 min — les prix peuvent changer
        gcTime:    10 * 60 * 1000,
    });

    // Groupement par type de chambre (Correction syntaxe reduce)
    const groupedByRoomType = query.data?.room_rates.reduce<Record<string, RoomRate[]>>((acc, rate) => {
        const key = rate.room_type;
        acc[key] = [...(acc[key] ?? []), rate];
        return acc;
    }, {}) ?? {};

    // Groupement par type de pension (Correction syntaxe reduce)
    const groupedByBoardType = query.data?.room_rates.reduce<Record<string, RoomRate[]>>((acc, rate) => {
        const key = rate.board_type;
        acc[key] = [...(acc[key] ?? []), rate];
        return acc;
    }, {}) ?? {};

    return {
        roomRates:          query.data?.room_rates ?? [],
        sessionId:          query.data?.session_id ?? "",
        groupedByRoomType,
        groupedByBoardType,
        loading:            query.isLoading,
        error:              query.error?.message   ?? null,
        refetch:            query.refetch,
    };
}