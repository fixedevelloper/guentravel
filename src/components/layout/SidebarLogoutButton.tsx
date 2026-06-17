"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SidebarLogoutButton({ isSidebarOpen, t }: { isSidebarOpen: boolean; t: any }) {
    const router = useRouter();
    const params = useParams();
    const queryClient = useQueryClient();
    const locale = (params?.locale as "fr" | "en") || "fr";

    // --- MUTATION POUR GÉRER LA DÉCONNEXION ---
    const logoutMutation = useMutation({
        mutationFn: async () => {
            // 1. Appel à l'API Laravel pour révoquer le jeton (Token Sanctum)
            return await api.post("/logout");
        },
        onSuccess: () => {
            // 2. Nettoyage de tous les caches TanStack Query (Profil, Wallet, Favoris...)
            queryClient.clear();

            // OPTIONNEL : Si vous stockez le token dans le localStorage ou cookie client, videz-le ici :
            // localStorage.removeItem("token");

            toast.success(locale === "fr" ? "Déconnexion réussie" : "Logged out successfully");

            // 3. Redirection vers la page d'accueil ou de login
            router.refresh(); // Force le rafraîchissement des Server Components d'authentification
            router.push(`/${locale}/login`);
        },
        onError: () => {
            // Même si l'API échoue (ex: token déjà expiré), on force souvent la déco côté client
            queryClient.clear();
            router.push(`/${locale}/login`);
        }
    });

    return (
        <div className="p-4">
            <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-zinc-600 hover:bg-red-50 hover:text-red-600 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed group"
            >
                {logoutMutation.isPending ? (
                    <Loader2 className="h-5 w-5 text-red-600 animate-spin" />
                ) : (
                    <LogOut className="h-5 w-5 text-zinc-400 group-hover:text-red-600 transition-colors" />
                )}

                {isSidebarOpen && (
                    <span className="font-semibold text-sm">
                        {logoutMutation.isPending ? "..." : t.logout}
                    </span>
                )}
            </button>
        </div>
    );
}