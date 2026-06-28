// hooks/useHotelBook.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HotelBookParams, HotelBooking } from "@/types/hotel";
import {hotelService} from "../services/hotelService";
import {hotelKeys} from "../queryKeys/hotelKeys";

export function useHotelBook() {
    const queryClient = useQueryClient();

    const mutation = useMutation<HotelBooking, Error, HotelBookParams>({
        mutationFn: hotelService.bookHotel,

        onSuccess: (data) => {
            // Met en cache la confirmation pour la page de succès
            queryClient.setQueryData(
                hotelKeys.booking(data.reference_num),
                data
            );
        },

        onError: (error) => {
            console.error("[useHotelBook]", error.message);
        },
    });

    return {
        book:      mutation.mutateAsync,
        loading:   mutation.isPending,
        error:     mutation.error?.message ?? null,
        booking:   mutation.data ?? null,
        reset:     mutation.reset,
    };
}