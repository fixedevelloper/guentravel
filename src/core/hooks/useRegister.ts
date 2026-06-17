import { useMutation } from "@tanstack/react-query";
import { api } from "../api/axios-instance";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";

// Validation du schéma d'inscription avec Zod
export const registerSchema = z.object({
    name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
    email: z.string().email("Format d'email invalide"),
    password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
});

type RegisterCredentials = z.infer<typeof registerSchema>;

const registerRequest = async (credentials: RegisterCredentials) => {
    const { data } = await api.post("/register", credentials);
    return data;
};

export function useRegister() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const registerMutation = useMutation({
        mutationFn: registerRequest,
        onSuccess: (response) => {
            // Sauvegarde dans Zustand (User + Token renvoyés par Laravel après inscription)
            setAuth(response.user, response.access_token);

            toast.success("Compte créé avec succès !", {
                description: `Bienvenue à bord, ${response.user.name}.`
            });

            // Routage automatique vers l'espace par défaut (voyageur)
            router.push("/bookings");
        },
        onError: (error: any) => {
            const backendError = error.response?.data?.message || "Erreur lors de la création du compte.";
            toast.error("Échec de l'inscription", {
                description: backendError,
            });
        },
    });

    return {
        register: registerMutation.mutateAsync,
        isPending: registerMutation.isPending,
    };
}