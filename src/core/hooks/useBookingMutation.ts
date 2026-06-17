import {api} from "../api/axios-instance";

export const createBooking = async (bookingData: any) => {
    // On envoie les données du store au backend
    const response = await api.post("/bookings", bookingData);
    return response.data;
};
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useBookingMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createBooking,
        onSuccess: (data) => {
            console.log("Réservation enregistrée avec succès", data);
            // Invalider le cache si nécessaire (ex: liste des réservations de l'utilisateur)
            queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
        },
        onError: (error) => {
            console.error("Erreur lors de la réservation:", error);
        }
    });
};