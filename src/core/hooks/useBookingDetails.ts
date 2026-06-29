// hooks/useBookingDetails.ts
import { useQuery } from "@tanstack/react-query";
import {hotelKeys} from "../queryKeys/hotelKeys";
import {hotelService} from "../services/hotelService";

export function useBookingDetails(
    supplierConfirmationNum: string,
    referenceNum:            string
) {
    return useQuery({
        queryKey: hotelKeys.bookingDetails(referenceNum),
        queryFn:  () => hotelService.getBookingDetails({
            supplier_confirmation_num: supplierConfirmationNum,
            reference_num:             referenceNum,
        }),
        enabled:   !!supplierConfirmationNum && !!referenceNum,
        staleTime: 5 * 60 * 1000,
    });
}