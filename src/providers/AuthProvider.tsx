"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {  usePathname } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { Loader2 } from "lucide-react";
import {useAuthStore} from "../core/store/useAuthStore";
import {api} from "../core/api/axios-instance";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    // États et actions de votre store Zustand
    const { user, token, setAuth, clearAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            // 1. Si aucun token n'est trouvé localement (Zustand / LocalStorage via persist)
            if (!token) {
                clearAuth();
                setIsLoading(false);
                // Redirection vers la page de login appropriée selon l'arborescence
                    router.push("/login");

                return;
            }

            try {

                // On interroge Laravel pour valider le token et récupérer le profil
                if (!user) {
                    const response = await api.get("/me"); // Ajustez l'endpoint (ex: /user ou /api/me)

                    if (response.data?.user) {
                        setAuth(response.data.user, token);
                    } else if (response.data?.data) {
                        setAuth(response.data.data, token);
                    }
                }

                setIsLoading(false);
            } catch (error) {
                // 4. Si le token est expiré ou invalide côté Laravel (Erreur 401)
                console.error("Session expirée ou invalide:", error);
                clearAuth();
                delete api.defaults.headers.common["Authorization"];
                setIsLoading(false);

                    router.push("/login");

            }
        };

        verifyAuth();
    }, [token, user, pathname, router, setAuth, clearAuth]);

    // Pendant la vérification, on affiche un écran de chargement élégant
    // pour éviter le "flash" de contenu privé pour un utilisateur non connecté
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <div className="text-center space-y-3">
                    <Loader2 className="h-9 w-9 animate-spin text-[#1d9e4b] mx-auto" />
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                        Vérification de la session...
                    </p>
                </div>
            </div>
        );
    }

    // Si tout est OK, on donne accès aux pages enfants du layout
    return (
        <AuthContext.Provider value={{ isAuthenticated: !!token, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personnalisé si jamais un composant enfant a besoin de consommer le contexte directement
export const useAuthContext = () => useContext(AuthContext);