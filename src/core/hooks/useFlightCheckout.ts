import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {api} from "../api/axios-instance";
import {toast} from "sonner";

// Typage du payload attendu par ton API Laravel
interface CheckoutPayload {
    selected_flight: any;
    payment_method: string;
    phone_number: string;
    contact_info: {
        email: string;
        phone: string;
    };
    passengers: any[];
}

export function useFlightCheckout() {
    const router = useRouter();

    return useMutation({
        mutationFn: async (payload: CheckoutPayload) => {
            const { data } = await api.post("/flights/verify-and-pay", payload);

            if (data.status !== "success") {
                throw new Error(data.message || "Une erreur est survenue lors de la transaction.");
            }

            return data.data;
        },
        onSuccess: (data) => {
            // Toast de succès enrichi avec Sonner
            toast.success("Réservation confirmée !", {
                description: `Votre code PNR est ${data.pnr}. Les e-tickets ont été rattachés.`,
                duration: 6000,
            });

            // Redirection fluide vers ta page de confirmation locale
            // router.push(`/checkout/confirmation?pnr=${data.pnr}`);
        },
        onError: (error: any) => {
            console.error("Payment integration error:", error);
            const errorMessage = error.response?.data?.message || error.message;

            // Toast d'erreur
            toast.error("Échec de la transaction", {
                description: errorMessage,
            });
        },
    });
}