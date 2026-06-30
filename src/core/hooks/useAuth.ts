import { useMutation } from "@tanstack/react-query";
import { api } from "../api/axios-instance";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";

// ✅ Correction ici : Remplacement de z.create par z.object
export const loginSchema = z.object({
    email: z.string().email("Format d'email invalide"),
    password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
});

type LoginCredentials = z.infer<typeof loginSchema>;

const loginRequest = async (credentials: LoginCredentials) => {
    const { data } = await api.post("/login", credentials);
    return data;
};

export function useAuth() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const clearAuth = useAuthStore((state) => state.clearAuth);

    const loginMutation = useMutation({
        mutationFn: loginRequest,
        onSuccess: (response) => {
            // Sauvegarde dans Zustand (et dans le localStorage)
            setAuth(response.user, response.access_token);

            toast.success("Connexion réussie !", {
                description: `Bienvenue, ${response.user.name}.`
            });

            // Routage intelligent basé sur le rôle utilisateur
         /*   const role = response.user.role;
            if (role === "admin") router.push("/admin/dashboard");
            else if (role === "host") router.push("/host/dashboard");
            else router.push("/bookings");*/
        },
        onError: (error: any) => {
            const backendError = error.response?.data?.message || "Identifiants invalides.";
            toast.error("Échec de l'authentification", {
                description: backendError,
            });
        },
    });

    return {
        login: loginMutation.mutateAsync,
        isPending: loginMutation.isPending,
        logout: () => {
            clearAuth();
            toast.info("Déconnecté", { description: "Votre session a été fermée." });
            router.push("/");
        }
    };
}