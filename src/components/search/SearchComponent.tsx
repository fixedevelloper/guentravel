"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl"; // Import essentiel
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users } from "lucide-react";
import { DateRangePicker } from "./date-range-picker";
import { DateRange } from "react-day-picker";
import { GuestCounter } from "./GuestCounter";

export function SearchComponent() {
    const t = useTranslations("SearchComponent"); // Namespace dédié
    const router = useRouter();
    const [date, setDate] = useState<DateRange | undefined>();
    const [location, setLocation] = useState("");
    const [guests, setGuests] = useState({
        adults: 1,
        children: 0,
        rooms: 1
    });

    const handleSearch = () => {
        const queryParams = new URLSearchParams({
            location: location,
            adults: guests.adults.toString(),
            children: guests.children.toString(),
            rooms: guests.rooms.toString(),
        });

        router.push(`/search?${queryParams.toString()}`);
    };

    return (
        <div className="bg-white p-3 rounded-xl shadow-2xl flex flex-col md:flex-row gap-3 max-w-7xl mx-auto border-2 border-[#15a4e6]">
            {/* Input Location */}
            <div className="flex-1 flex items-center px-4 py-3 border-r border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer">
                <MapPin className="text-[#15a4e6] mr-3 h-5 w-5" />
                <input
                    className="w-full text-zinc-900 outline-none placeholder:text-zinc-400 font-medium bg-transparent"
                    placeholder={t("whereTo")}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
            </div>

            {/* Date Picker */}
            <div className="flex-1 flex items-center px-4 py-3 border-r border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer">
                <Calendar className="text-[#15a4e6] mr-3 h-5 w-5" />
                <DateRangePicker date={date} setDate={setDate} />
            </div>

            {/* Guest Counter */}
            <div className="flex-1 flex items-center px-4 py-3 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer">
                <GuestCounter guests={guests} setGuests={setGuests} />
            </div>

            {/* Button */}
            <Button
                onClick={handleSearch}
                className="bg-[#7bcd4f] hover:bg-[#d68910] text-white px-10 py-6 font-bold uppercase tracking-wider text-lg shadow-lg rounded-lg"
            >
                {t("searchButton")}
            </Button>
        </div>
    );
}