import { useQuery } from "@tanstack/react-query";
import {api} from "../api/axios-instance";

interface BookingStatusResponse {
    id: number;
    booking_status: string;
    pnr: string | null;
    message?: string;
}

export function useBookingStatusPolling(bookingId: string | null) {
    return useQuery<BookingStatusResponse>({
        queryKey: ["bookingStatus", bookingId],
        queryFn: async () => {
            // Utilisation d'Axios (l'URL est déjà corrigée sans le double /api)
            const { data } = await api.get(`/flights/my-bookings-status/${bookingId}`);
            return data;
        },
        // Le hook s'exécute uniquement si on a un bookingId valide
        enabled: !!bookingId,

        // Dynamic Polling : Tant que le statut requiert une attente, on re-teste toutes les 4000ms
        refetchInterval: (query) => {
            const status = query.state.data?.booking_status;

            // Si le statut est final (Succès ou Échec), on retourne false pour ARRÊTER le polling
            if (
                status === "ticketed" ||
                status === "hold" ||
                status === "paid_hold_forced" ||
                ["payment_failed", "gds_failed", "gds_failed_requires_refund", "initiation_failed"].includes(status || "")
            ) {
                return false;
            }

            // Tant qu'on est en "pending_payment" ou "paid_pending_gds", on continue
            return 4000;
        },
        // Options de confort pour éviter les re-tentatives agressives si l'API crash
        retry: 1,
        refetchOnWindowFocus: false,
    });
}