import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Passenger {
    civility: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    passport_number: string;
    passport_expiry:string;
}

export interface ProductBrandOffering {
    brand_ref: string;
    product_refs: string[];
    terms_and_conditions_ref: string;
}

export interface TravelportData {
    transaction_id: string | null;
    offering_id: string | null;
    gds_authority_value: string | null;
    gds_authority_value_inbound: string | null;
    catalog_offerings_identifier: string; // Parfaitement aligné sur le Payload de ton API
    available_brands?: string[];
    product_brand_offerings?: ProductBrandOffering[];
    products?: string[];
    flight_refs?: string[];
    raw_offering?: any;
}

export interface FlightOffer {
    id: string;
    travelport: TravelportData;
    price_details: {
        base_price: number;
        taxes: number;
        agency_fees: number;
        final_price_to_pay: number;
        currency: string;
    };
    itinerary: Array<{
        direction: "outbound" | "inbound";
        offering_id: string | null;
        brand_value: string | null;
        travelport?: {
            brand_value: string | null;
        };
        stops_count: number;
        segments: Array<{
            flight_number: string | null;
            airline_code: string | null;
            airline_name: string | null;
            departure: {
                airport: string | null;
                time: string | null;
            };
            arrival: {
                airport: string | null;
                time: string | null;
            };
            booking_class: string | null;
            duration: string | number | null;
        }>;
    }>;
    baggage_allowance?: {
        checked: string;
        cabin: string;
    };
}

export interface FlightCartState {
    selectedFlight: FlightOffer | null;
    passengers: Passenger[];
    travelportSessionId: string | null;
    contactInfo: {
        email: string;
        phone: string;
    };

    setFlight: (flight: FlightOffer) => void;
    setTravelportSessionId: (id: string | null) => void;
    initPassengersList: (count: number) => void;
    updatePassenger: (index: number, fields: Partial<Passenger>) => void;
    updateContactInfo: (fields: Partial<{ email: string; phone: string }>) => void;
    clearCart: () => void;
}

export const useCartStore = create<FlightCartState>()(
    persist(
        (set) => ({
            // --- ÉTAT INITIAL ---
            selectedFlight: null,
            passengers: [],
            travelportSessionId: null,
            contactInfo: { email: "", phone: "" },

            // --- ACTIONS ---
            setFlight: (flight) => set({ selectedFlight: flight }),

            setTravelportSessionId: (id) => set({ travelportSessionId: id }),

            initPassengersList: (count) => {
                const emptyPassengers = Array.from({ length: count }, () => ({
                    civility: "MR",
                    first_name: "",
                    last_name: "",
                    birth_date: "",
                    passport_number: "",
                    passport_expiry:''
                }));
                set({ passengers: emptyPassengers });
            },

            updatePassenger: (index, fields) =>
                set((state) => {
                    if (index < 0 || index >= state.passengers.length) return state;

                    const updated = [...state.passengers];
                    updated[index] = { ...updated[index], ...fields };
                    return { passengers: updated };
                }),

            updateContactInfo: (fields) =>
                set((state) => ({
                    contactInfo: { ...state.contactInfo, ...fields },
                })),

            clearCart: () => set({
                selectedFlight: null,
                passengers: [],
                travelportSessionId: null,
                contactInfo: { email: "", phone: "" }
            }),
        }),
        {
            name: "creativ-flight-cart", // clé localStorage
        }
    )
);