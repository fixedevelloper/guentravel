import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { Property, PaginatedResponse } from "@/types/property";

const fetchProperties = async (): Promise<PaginatedResponse<Property>> => {
    // La réponse de l'API contient { success: true, meta: {...}, data: [...] }
    const { data } = await api.get("/properties");

    // On retourne tout l'objet car votre interface PaginatedResponse
    // doit correspondre à la structure { meta, data }
    return data;
};

export function useProperties() {
    return useQuery({
        queryKey: ["default-properties"],
        queryFn: fetchProperties,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
}