import { useMutation } from "@tanstack/react-query";
import { api } from "../api/axios-instance";
import { toast } from "sonner";

// Typage précis du payload attendu par l'API Laravel
export interface CheckoutPayload {
    session_identifier: string | null;
    booking_type: 'now' | 'hold';
    selected_flight: any;
    payment_method: 'momo' | 'om' | 'wave' | 'card';
    phone_number: string;
    contact_info: {
        email: string;
        phone: string;
    };
    passengers: any[];
}

// Typage de la réponse asynchrone de l'API Laravel
export interface CheckoutResponse {
    status: 'waiting_confirmation' | 'redirect_required' | 'error' | 'initiation_failed';
    message: string;
    booking_id: number;
    redirect_url?: string; // Présent uniquement si status === 'redirect_required'
}

export function useFlightCheckout() {
    return useMutation<CheckoutResponse, Error, CheckoutPayload>({
        mutationFn: async (payload: CheckoutPayload): Promise<CheckoutResponse> => {
            // Sécurisation du payload pour s'assurer que booking_type respecte le contrat
            const securePayload = {
                ...payload,
                booking_type: payload.booking_type as 'now' | 'hold'
            };

            // Appel de l'endpoint Laravel
            const { data } = await api.post("/flights/verify-and-pay", securePayload);

            // Validation du statut renvoyé par l'API Laravel
            if (data.status === "error" || data.status === "initiation_failed") {
                throw new Error(data.message || "La passerelle a refusé d'initier la transaction.");
            }

            return data;
        },
        onSuccess: (data) => {
            // Notifications visuelles adaptées selon la réponse de la passerelle
            if (data.status === "redirect_required") {
                toast.info("Redirection bancaire", {
                    description: "Nous vous redirigeons vers l'espace sécurisé de paiement...",
                    duration: 4000,
                });
            } else if (data.status === "waiting_confirmation") {
                toast.success("Demande de paiement émise !", {
                    description: "Consultez votre téléphone pour valider l'opération avec votre code PIN.",
                    duration: 6000,
                });
            }
        },
        onError: (error: any) => {
            console.error("Erreur lors de l'initialisation du checkout :", error);

            // Extraction propre du message d'erreur structuré par Laravel ou Axios
            const errorMessage = error.response?.data?.message || error.message || "Une erreur inconnue est survenue.";

            toast.error("Échec de l'opération", {
                description: errorMessage,
                duration: 6000
            });
        },
    });
}