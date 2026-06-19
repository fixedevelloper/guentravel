import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Passenger {
    civility: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    passport_number: string;
}

export interface FlightCartState {
    selectedFlight: any | null;
    passengers: Passenger[];
    travelportSessionId: string | null; // 🔥 Stockage de l'ID de session Travelport
    contactInfo: {
        email: string;
        phone: string;
    };
    setFlight: (flight: any) => void;
    setTravelportSessionId: (id: string | null) => void; // 🔥 Action pour modifier l'ID de session
    initPassengersList: (count: number) => void;
    updatePassenger: (index: number, fields: Partial<Passenger>) => void;
    updateContactInfo: (fields: Partial<{ email: string; phone: string }>) => void;
    clearCart: () => void;
}

export const useCartStore = create<FlightCartState>()(
    persist(
        (set) => ({
            selectedFlight: null,
            passengers: [],
            travelportSessionId: null, // Initialisé à null
            contactInfo: { email: "", phone: "" },

            setFlight: (flight) => set({ selectedFlight: flight }),

            // 🔥 Implémentation de la méthode de mise à jour
            setTravelportSessionId: (id) => set({ travelportSessionId: id }),

            initPassengersList: (count) => {
                const emptyPassengers = Array.from({ length: count }, () => ({
                    civility: "M.",
                    first_name: "",
                    last_name: "",
                    birth_date: "",
                    passport_number: "",
                }));
                set({ passengers: emptyPassengers });
            },

            updatePassenger: (index, fields) =>
                set((state) => {
                    const updated = [...state.passengers];
                    updated[index] = { ...updated[index], ...fields };
                    return { passengers: updated };
                }),

            updateContactInfo: (fields) =>
                set((state) => ({
                    contactInfo: { ...state.contactInfo, ...fields },
                })),

            // 🔥 Ajout de la remise à zéro du travelportSessionId lors du vidage de panier
            clearCart: () => set({
                selectedFlight: null,
                passengers: [],
                travelportSessionId: null,
                contactInfo: { email: "", phone: "" }
            }),
        }),
        {
            name: "creativ-flight-cart", // Le middleware persist sauvegarde automatiquement le travelportSessionId dans le localStorage
        }
    )
);