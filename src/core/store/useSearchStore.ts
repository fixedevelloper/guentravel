import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// 1. Types stricts pour l'occupation
export interface RoomOccupancy {
    room_no: number;
    adult: number;
    child: number;
    child_ages?: number[];
}

interface SearchState {
    // Dates et Durée de séjour
    check_in: string;  // Format Y-m-d
    check_out: string; // Format Y-m-d
    days: number;

    // Occupation des chambres
    occupancy: RoomOccupancy[];

    // Actions de mise à jour globale
    setSearchPeriod: (checkIn: string, checkOut: string) => void;
    setOccupancy: (occupancy: RoomOccupancy[]) => void;
    resetSearchStore: () => void;

    // Actions granulaires (parfaite maîtrise de l'UX)
    addRoom: () => void;
    removeRoom: (roomNo: number) => void;
    updateGuests: (roomNo: number, type: "adult" | "child", value: number) => void;
    updateChildAge: (roomNo: number, childIdx: number, age: number) => void;

    // Sérialiseur d'URL complet pour Next.js Server Components
    getSearchQueryParams: () => { rooms: string; check_in: string; check_out: string; days: string };
}

// Génération de dates par défaut dynamiques (Ex: Aujourd'hui et dans 2 jours)
const getInitialDates = () => {
    const today = new Date();
    const inTwoDays = new Date();
    inTwoDays.setDate(today.getDate() + 2);

    return {
        check_in: today.toISOString().split("T")[0],
        check_out: inTwoDays.toISOString().split("T")[0],
        days: 2
    };
};

const DEFAULT_OCCUPANCY: RoomOccupancy[] = [{ room_no: 1, adult: 2, child: 0, child_ages: [] }];

export const useSearchStore = create<SearchState>()(
    persist(
        (set, get) => ({
            // États initiaux fusionnés
            ...getInitialDates(),
            occupancy: DEFAULT_OCCUPANCY,

            // Met à jour la période et recalcule automatiquement le nombre de jours
            setSearchPeriod: (check_in, check_out) => {
                const dateIn = new Date(check_in);
                const dateOut = new Date(check_out);
                const differenceInTime = dateOut.getTime() - dateIn.getTime();
                const days = Math.max(1, Math.ceil(differenceInTime / (1000 * 3600 * 24)));

                set({ check_in, check_out, days });
            },

            setOccupancy: (occupancy) => set({ occupancy }),

            resetSearchStore: () => set({
                ...getInitialDates(),
                occupancy: DEFAULT_OCCUPANCY
            }),

            addRoom: () => set((state) => {
                const nextRoomNo = state.occupancy.length + 1;
                return {
                    occupancy: [
                        ...state.occupancy,
                        { room_no: nextRoomNo, adult: 2, child: 0, child_ages: [] }
                    ]
                };
            }),

            removeRoom: (roomNo) => set((state) => {
                if (state.occupancy.length <= 1) return {};
                const filtered = state.occupancy.filter((r) => r.room_no !== roomNo);
                const reindexed = filtered.map((r, idx) => ({ ...r, room_no: idx + 1 }));
                return { occupancy: reindexed };
            }),

            updateGuests: (roomNo, type, value) => set((state) => ({
                occupancy: state.occupancy.map((r) => {
                    if (r.room_no !== roomNo) return r;

                    if (type === "adult") {
                        return { ...r, adult: Math.max(1, value) };
                    } else {
                        const currentAges = r.child_ages || [];
                        const newAges = value > r.child
                            ? [...currentAges, ...Array(value - r.child).fill(8)]
                            : currentAges.slice(0, value);
                        return { ...r, child: Math.max(0, value), child_ages: newAges };
                    }
                })
            })),

            updateChildAge: (roomNo, childIdx, age) => set((state) => ({
                occupancy: state.occupancy.map((r) => {
                    if (r.room_no !== roomNo) return r;
                    const ages = [...(r.child_ages || [])];
                    ages[childIdx] = age;
                    return { ...r, child_ages: ages };
                })
            })),

            // Compresse et centralise tous les paramètres essentiels pour les requêtes Next.js et API
            getSearchQueryParams: () => {
                const { occupancy, check_in, check_out, days } = get();
                return {
                    rooms: encodeURIComponent(JSON.stringify(occupancy)),
                    check_in,
                    check_out,
                    days: days.toString()
                };
            }
        }),
        {
            name: "hotel-search-occupancy",
            storage: createJSONStorage(() => localStorage),
        }
    )
);