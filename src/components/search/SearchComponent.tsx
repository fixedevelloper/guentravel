// components/SearchComponent.tsx
"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { DateRangePicker } from "./date-range-picker";
import { GuestCounter } from "./GuestCounter";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { City } from "../../types/hotel";
import { CityAutocomplete } from "./CityAutocomplete";
import { useSearchStore } from "../../core/store/useSearchStore";
import { useLocale } from "next-intl";

interface Room {
    adults: number;
    children: number;
    child_ages: number[];
}

export function SearchComponent() {
    const t = useTranslations("SearchComponent");
    const router = useRouter();
    const locale = useLocale();

    // Gestion d'un état de chargement local pendant la redirection
    const [loading, setLoading] = useState(false);

    // Extraction de l'état d'occupation depuis le store Zustand
    const occupancy = useSearchStore((state) => state.occupancy);
    const [date, setDate] = useState<DateRange | undefined>();
    const [location, setLocation] = useState("");
    const [countryName, setCountryName] = useState("");
    const [rooms, setRooms] = useState<Room[]>([
        { adults: 2, children: 0, child_ages: [] }
    ]);

    const [cityCoords, setCityCoords] = useState<{ lat: number; lng: number } | null>(null);

    const handleCityChange = (value: string, city: City | null) => {
        setLocation(value);
        setCityCoords(city ? { lat: city.latitude, lng: city.longitude } : null);
        setCountryName(city?.country_name ?? "");
    };

    const handleSearch = () => {
        if (!date?.from || !date?.to || !location || !cityCoords) return;

        setLoading(true); // Déclenche l'état visuel "Searching..."

        const currentCurrency = typeof window !== "undefined"
            ? (document.cookie.split("; ").find(row => row.startsWith("currency="))?.split("=")[1] || "XAF")
            : "XAF";

        const defaultNationality = locale === "fr" ? "FR" : "US";

        const occupancyFormatted = occupancy.map((room) => ({
            room_no:   room.room_no,
            adult:     room.adult,
            child:     room.child,
            child_age: room.child > 0 ? (room.child_ages || []) : [],
        }));

        const query = new URLSearchParams({
            location:     location,
            latitude:     cityCoords.lat.toString(),
            longitude:    cityCoords.lng.toString(),
            checkin:      format(date.from, "yyyy-MM-dd"),
            checkout:     format(date.to,   "yyyy-MM-dd"),
            rooms:        JSON.stringify(occupancyFormatted),
            nationality:  defaultNationality,
            currency:     currentCurrency,
        });

        if (countryName) {
            query.append("country_name", countryName);
        }

        router.push(`/hotels/results?${query.toString()}`);
    };

    const isValid = date?.from && date?.to && location.trim().length > 0 && !loading;

    return (
        <div className="bg-white p-3 rounded-xl shadow-2xl flex flex-col md:flex-row gap-3 max-w-7xl mx-auto border-2 border-[#15a4e6]">

            {/* Location */}
            <div className="flex-1 flex items-center px-4 py-3 border-r border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors">
                <CityAutocomplete value={location} onChange={handleCityChange} />
            </div>

            {/* Dates */}
            <div className="flex-1 flex items-center px-4 py-3 border-r border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors">
                <Calendar className="text-[#15a4e6] mr-3 h-5 w-5 shrink-0" />
                <DateRangePicker date={date} setDate={setDate} />
            </div>

            {/* Chambres + Voyageurs */}
            <div className="flex-1">
                <GuestCounter rooms={rooms} setRooms={setRooms} />
            </div>

            {/* Bouton */}
            <Button
                onClick={handleSearch}
                disabled={!isValid}
                className="bg-[#7bcd4f] hover:bg-[#d68910] disabled:opacity-50 text-white px-10 py-6 font-bold uppercase tracking-wider text-lg shadow-lg rounded-lg"
            >
                {loading ? t("searching") : t("searchButton")}
            </Button>
        </div>
    );
}