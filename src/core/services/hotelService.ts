// services/hotelService.ts
import { HotelSearchParams, HotelSearchResponse, CitiesResponse } from "@/types/hotel";
import { api } from "../api/axios-instance";
import {
    BookingDetails,
    FilterParams,
    FilterResponse,
    HotelBooking,
    HotelBookParams,
    HotelDetails,
    HotelDetailsParams,
    RoomRatesParams,
    RoomRatesResponse
} from "../../types/hotel";

export const hotelService = {
    search: async (params: HotelSearchParams): Promise<HotelSearchResponse> => {
        const { data } = await api.get<HotelSearchResponse>("/hotels/search", {
            // CORRECTION : Les paramètres d'un GET doivent impérativement
            // être enveloppés dans la clé 'params'
            params,
        });
        return data;
    },

    cities: async (from = 1, to = 100): Promise<CitiesResponse> => {
        const { data } = await api.get<CitiesResponse>("/hotels/cities", {
            params: { from, to },
        });
        return data;
    },

    searchCities: async (term: string, limit = 10): Promise<CitiesResponse> => {
        const { data } = await api.get<CitiesResponse>("/hotels/cities/search", {
            // CORRECTION : Alignement avec votre contrôleur Laravel qui attend 'term'
            params: { term, limit },
        });
        return data;
    },
    getRoomRates: async (params: RoomRatesParams): Promise<RoomRatesResponse> => {
        const { data } = await api.get<RoomRatesResponse>("/hotels/room-rates", {
            // CORRECTION : Encapsulation obligatoire pour les requêtes GET
            params,
        });
        return data;
    },

    getHotelDetails: async (params: HotelDetailsParams): Promise<HotelDetails> => {
        const { data } = await api.get<HotelDetails>("/hotels/details", {
            params: {
                session_id: params.session_id,
                hotel_id:   params.hotel_id,
                product_id: params.product_id,
                token_id:   params.token_id,
            },
        });
        return data;
    },

    bookHotel: async (params: HotelBookParams): Promise<HotelBooking> => {
        const { data } = await api.post<HotelBooking>("/hotels/book", params);
        return data;
    },
    filterHotels: async (params: FilterParams): Promise<FilterResponse> => {
        const { data } = await api.post<FilterResponse>(
            "/hotels/filter",
            params
        );
        return data;
    },
    // services/hotelService.ts
    getBookingDetails: async (params: {
        supplier_confirmation_num: string;
        reference_num:             string;
    }): Promise<BookingDetails> => {
        const { data } = await api.post<BookingDetails>(
            "/hotels/booking-details",
            params
        );
        return data;
    },
};