// hooks/useHotelDetails.ts
import { useQuery } from "@tanstack/react-query";
import { HotelDetailsParams } from "@/types/hotel";
import {hotelKeys} from "../queryKeys/hotelKeys";
import {hotelService} from "../services/hotelService";

export function useHotelDetails(params: HotelDetailsParams | null) {
    return useQuery({
        queryKey:  hotelKeys.hotelDetails(params!),
        queryFn:   () => hotelService.getHotelDetails(params!),
        enabled:   !!params?.session_id &&
            !!params?.hotel_id   &&
            !!params?.product_id &&
            !!params?.token_id,
        staleTime: 10 * 60 * 1000,  // 10 min
        gcTime:    20 * 60 * 1000,
    });
}