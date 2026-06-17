import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { Property, PaginatedResponse } from "@/types/property";
import { toast } from "sonner";

/**
 * Récupération des propriétés de l'hôte authentifié
 */
const fetchHostProperties = async (): Promise<PaginatedResponse<Property>> => {
    const { data } = await api.get("/host/properties");
    return data;
};

export function useHostProperties() {
    const queryClient = useQueryClient();

    // 1. Requête de lecture
    const query = useQuery({
        queryKey: ["host-properties"],
        queryFn: fetchHostProperties,
    });

    // 2. Mutation de création (exemple)
    const createMutation = useMutation({
        mutationFn: (payload: FormData) => api.post("/host/properties", payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["host-properties"] });
            toast.success("Établissement ajouté avec succès !");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Erreur lors de la création");
        }
    });

    // 3. Mutation de suppression
    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/host/properties/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["host-properties"] });
            toast.success("Établissement supprimé.");
        }
    });

    return {
        properties: query.data?.data || [],
        meta: query.data?.meta,
        isLoading: query.isLoading,
        createProperty: createMutation.mutate,
        isCreating: createMutation.isPending,
        deleteProperty: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending
    };
}