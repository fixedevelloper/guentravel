import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { Property } from "@/types/property";

const fetchOffers = async (): Promise<Property[]> => {
    const response = await api.get("/properties/offers");
    return response.data.data;
};

export function usePropertyOffers() {
    return useQuery({
        queryKey: ["properties-offers"],
        queryFn: fetchOffers,
        staleTime: 1000 * 60 * 5, // Garde en cache 5 minutes
    });
}