import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 1. Définition stricte des types de l'utilisateur alignés sur Laravel
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'host' | 'customer';
    wallet_balance?: string | number; // Optionnel : Utile pour afficher le solde en haut de l'interface
}

// 2. Définition de la structure de notre état global d'authentification
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;

    // Actions
    setAuth: (user: User, token: string) => void;
    updateUser: (user: Partial<User>) => void;
    clearAuth: () => void;
}

// 3. Création du store avec persistance automatique
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            /**
             * Initialise la session après une connexion ou inscription réussie.
             */
            setAuth: (user, token) => set({
                user,
                token,
                isAuthenticated: true
            }),

            /**
             * Permet de mettre à jour à la volée des informations de l'utilisateur
             * sans écraser le reste (ex: actualisation du solde du portefeuille).
             */
            updateUser: (updatedFields) => set((state) => ({
                user: state.user ? { ...state.user, ...updatedFields } : null
            })),

            /**
             * Réinitialise complètement le store lors de la déconnexion.
             */
            clearAuth: () => set({
                user: null,
                token: null,
                isAuthenticated: false
            }),
        }),
        {
            name: 'guens-travel-auth', // Clé unique pour le localStorage
            storage: createJSONStorage(() => localStorage), // Utilise le localStorage du navigateur
            // Optionnel : Permet de ne sauvegarder que certaines clés (évite de sauvegarder des états éphémères)
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);