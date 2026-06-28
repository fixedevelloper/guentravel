import {HotelDetailsParams, HotelSearchParams, RoomRatesParams} from "../../types/hotel";

export const hotelKeys = {
    all:        ["hotels"]                                      as const,
    search:     (params: HotelSearchParams) =>
        [...hotelKeys.all, "search", params]           as const,
    cities:     (from: number, to: number) =>
        [...hotelKeys.all, "cities", { from, to }]     as const,
    citySearch: (term: string, limit: number) =>
        [...hotelKeys.all, "cities", "search", { term, limit }] as const,
    roomRates: (params: RoomRatesParams) =>
        [...hotelKeys.all, "room-rates", params] as const,
    hotelDetails: (params: HotelDetailsParams) =>
        [...hotelKeys.all, "details", params] as const,
    booking: (refNum: number) =>
        [...hotelKeys.all, "booking", refNum] as const,
};