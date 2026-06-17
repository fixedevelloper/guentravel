import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Interface enrichie pour inclure les détails nécessaires à l'affichage
interface RoomSelection {
    id: string;
    name: string;   // Ajouté
    price: number;  // Ajouté
    quantity: number;
}

interface Guests {
    adults: number;
    children: number;
}

interface BookingState {
    selectedRooms: RoomSelection[];
    checkIn: string;
    checkOut: string;
    guests: Guests;
    setBooking: (data: Partial<Omit<BookingState, 'setBooking' | 'reset'>>) => void;
    reset: () => void;
}

export const useBookingStore = create<BookingState>()(
    persist(
        (set) => ({
            selectedRooms: [],
            checkIn: '',
            checkOut: '',
            guests: { adults: 1, children: 0 },

            setBooking: (data) => set((state) => {
                const nextState = { ...state, ...data };
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Validation simple des dates
                if (data.checkIn && new Date(data.checkIn) < today) return state;

                if (nextState.checkIn && nextState.checkOut &&
                    new Date(nextState.checkIn) >= new Date(nextState.checkOut)) {
                    nextState.checkOut = '';
                }

                return nextState;
            }),

            reset: () => set({
                selectedRooms: [],
                checkIn: '',
                checkOut: '',
                guests: { adults: 1, children: 0 }
            }),
        }),
        {
            name: 'booking-storage',
        }
    )
);