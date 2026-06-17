import { create } from 'zustand';

// 1. Définition de l'interface des états de l'interface graphique
interface UIState {
    // État des menus de navigation (Sidebars)
    isHostSidebarOpen: boolean;
    isAdminSidebarOpen: boolean;

    // Thème de l'application (Optionnel, si géré de manière synchronisée avec next-themes)
    isDarkMode: boolean;

    // Actions pour modifier les états
    toggleHostSidebar: () => void;
    toggleAdminSidebar: () => void;
    setHostSidebar: (isOpen: boolean) => void;
    setAdminSidebar: (isOpen: boolean) => void;
    toggleTheme: () => void;
}

// 2. Création du store UI réactif
export const useUIStore = create<UIState>()((set) => ({
    // Valeurs initiales par défaut (Sidebars fermées sur mobile, adaptables par CSS)
    isHostSidebarOpen: true, // true par défaut pour les écrans de bureau
    isAdminSidebarOpen: true,
    isDarkMode: false,

    /**
     * Alterne l'état d'ouverture du menu Hôte (Ouverture / Fermeture).
     */
    toggleHostSidebar: () => set((state) => ({
        isHostSidebarOpen: !state.isHostSidebarOpen
    })),

    /**
     * Alterne l'état d'ouverture du menu Administrateur.
     */
    toggleAdminSidebar: () => set((state) => ({
        isAdminSidebarOpen: !state.isAdminSidebarOpen
    })),

    /**
     * Force l'état d'ouverture du menu Hôte (Utile lors des changements de page ou resize).
     */
    setHostSidebar: (isOpen) => set({ isHostSidebarOpen: isOpen }),

    /**
     * Force l'état d'ouverture du menu Administrateur.
     */
    setAdminSidebar: (isOpen) => set({ isAdminSidebarOpen: isOpen }),

    /**
     * Inverse le mode visuel (clair / sombre).
     */
    toggleTheme: () => set((state) => ({
        isDarkMode: !state.isDarkMode
    })),
}));