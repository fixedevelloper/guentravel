import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { RoomRate } from "@/types/hotel";

// Interface représentant l'élément stocké dans le panier
export interface CartHotelItem {
    hotelId: string;
    hotelName: string;
    hotelImages: string[];
    city: string;
    rating: number;
    // Session API voyage
    sessionId: string;
    productId: string;
    tokenId: string;
    // L'offre tarifaire exacte choisie
    selectedRate: RoomRate;
    // Date de mise en panier pour calculer l'expiration de l'offre
    addedAt: number;
}

interface CartHotelState {
    cart: CartHotelItem | null;

    // Actions principales
    addToCart: (item: Omit<CartHotelItem, "addedAt">) => void;
    clearCart: () => void;

    // Sécurité UX : Vérifier si la session d'API voyage a expiré (ex: > 15 minutes)
    isCartExpired: () => boolean;
}

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes d'expiration standard de l'API

export const useCartHotelStore = create<CartHotelState>()(
    persist(
        (set, get) => ({
            cart: null,

            addToCart: (item) => set({
                cart: {
                    ...item,
                    addedAt: Date.now() // Horodatage précis
                }
            }),

            clearCart: () => set({ cart: null }),

            isCartExpired: () => {
                const cart = get().cart;
                if (!cart) return true;
                return Date.now() - cart.addedAt > SESSION_TIMEOUT_MS;
            }
        }),
        {
            name: "hotel-booking-cart", // Clé unique dans le Local Storage
            storage: createJSONStorage(() => localStorage),
        }
    )
);