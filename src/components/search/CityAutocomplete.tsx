"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { City } from "@/types/hotel";
import { Loader2, MapPin, X } from "lucide-react";
import { useCityAutocomplete } from "../../core/hooks/useCityAutocomplete";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CityAutocompleteProps {
    value:    string;
    onChange: (value: string, city: City | null) => void;
}

export function CityAutocomplete({ value, onChange }: CityAutocompleteProps) {
    const t                               = useTranslations("SearchComponent");
    const [inputValue, setInput]          = useState(value);
    const [open, setOpen]                 = useState(false);
    const [term, setTerm]                 = useState("");
    const [isDebouncing, setIsDebouncing] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const { data, isFetching } = useCityAutocomplete(term);
    const suggestions          = data?.cities ?? [];

    useEffect(() => {
        setInput(value);
    }, [value]);

    const handleInput = (value: string) => {
        setInput(value);
        onChange(value, null);

        if (value.trim().length < 2) {
            setOpen(false);
            setIsDebouncing(false);
            clearTimeout(debounceRef.current);
            return;
        }

        setIsDebouncing(true);

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setTerm(value);
            setIsDebouncing(false);
            setOpen(true);
        }, 300);
    };

    const handleSelect = (city: City) => {
        setInput(city.city_name);
        setTerm("");
        onChange(city.city_name, city);
        setOpen(false);
    };

    const handleClear = () => {
        setInput("");
        setTerm("");
        onChange("", null);
        setOpen(false);
    };

    const isLoadingData = isDebouncing || isFetching;

    return (
        <div className="w-full">
            <Popover open={open} onOpenChange={setOpen}>
                {/* PopoverTrigger encapsule la zone d'input principale */}
                <PopoverTrigger asChild>
                    <div className="flex items-center gap-2 w-full cursor-text">
                        {isLoadingData
                            ? <Loader2 className="text-[#15a4e6] h-5 w-5 animate-spin shrink-0" />
                            : <MapPin  className="text-[#15a4e6] h-5 w-5 shrink-0" />
                        }
                        <input
                            className="w-full text-zinc-900 outline-none placeholder:text-zinc-400 font-medium bg-transparent"
                            placeholder={t("whereTo")}
                            value={inputValue}
                            onChange={(e) => handleInput(e.target.value)}
                            onFocus={() => inputValue.trim().length >= 2 && setOpen(true)}
                        />
                        {inputValue && (
                            <button onClick={handleClear} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </PopoverTrigger>

                {/* PopoverContent remplace l'ancien tag <ul> absolute */}
                <PopoverContent
                    className="p-0 w-72 bg-white border border-zinc-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-[9999]"
                    align="start"
                    sideOffset={8}
                    // Empêche le focus automatique sur le premier élément pour laisser l'utilisateur écrire dans l'input
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <ul className="w-full">
                        {isLoadingData && suggestions.length === 0 ? (
                            <li className="px-4 py-3 text-sm text-zinc-400 text-center">
                                Recherche...
                            </li>
                        ) : suggestions.length === 0 ? (
                            <li className="px-4 py-3 text-sm text-zinc-400 text-center">
                                {t("noResults")}
                            </li>
                        ) : (
                            suggestions.map((city) => (
                                <li
                                    key={city.id}
                                    onClick={() => handleSelect(city)}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 cursor-pointer transition-colors border-b border-zinc-50 last:border-0"
                                >
                                    <MapPin className="h-4 w-4 text-[#15a4e6] shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900">
                                            {city.city_name}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {city.country_name}
                                        </p>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </PopoverContent>
            </Popover>
        </div>
    );
}