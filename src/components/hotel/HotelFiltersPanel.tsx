"use client";

import { useState, useEffect }  from "react";
import { HotelFilters, SortingOption, FareType, Hotel } from "@/types/hotel";
import { Button }               from "@/components/ui/button";
import { Slider }               from "@/components/ui/slider";
import { Checkbox }             from "@/components/ui/checkbox";
import { Label }                from "@/components/ui/label";
import { Input }                from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
    from "@/components/ui/select";
import { SlidersHorizontal, X, Loader2 } from "lucide-react";
import { useHotelFilter } from "../../core/hooks/useHotelFilter";
import React from "react";

const FACILITIES = [
    "Internet access", "Air conditioning", "Wi-Fi",
    "Restaurant",      "Room Service",     "Car Park",
    "Laundry Service", "Bar",              "Swimming Pool", "Gym",
];
const RATINGS = [1, 2, 3, 4, 5];
const SORTING_OPTIONS: { value: SortingOption; label: string }[] = [
    { value: "price-low-high",  label: "Prix croissant"   },
    { value: "price-high-low",  label: "Prix décroissant" },
];

// Configuration des échelles de prix par devise
const PRICE_LIMITS: Record<string, { min: number; max: number; step: number }> = {
    XAF: { min: 0, max: 500000, step: 5000 },
    EUR: { min: 0, max: 1000,   step: 10 },
    USD: { min: 0, max: 1200,   step: 10 },
};

const DEFAULT_LIMITS = { min: 0, max: 150000, step: 100 };

interface FiltersPanelProps {
    sessionId:  string;
    currency:   string;
    onApply:    (hotels: Hotel[]) => void;
    onReset:    () => void;
}

export function FiltersPanel({ sessionId, currency, onApply, onReset }: FiltersPanelProps) {
    const { applyFilters, loading } = useHotelFilter(sessionId);

    // Récupération des limites propres à la devise active
    const currentLimits = PRICE_LIMITS[currency] || DEFAULT_LIMITS;

    const [price,      setPrice]      = useState<[number, number]>([currentLimits.min, currentLimits.max]);
    const [ratings,    setRatings]    = useState<number[]>([]);
    const [fareType,   setFareType]   = useState<FareType | "">("");
    const [facilities, setFacilities] = useState<string[]>([]);
    const [hotelName,  setHotelName]  = useState("");
    const [sorting,    setSorting]    = useState<SortingOption>("price-low-high");
    const [isDirty,    setIsDirty]    = useState(false);

    // Ajustement automatique des bornes du slider si la devise change en cours de route
    useEffect(() => {
        const limits = PRICE_LIMITS[currency] || DEFAULT_LIMITS;
        setPrice([limits.min, limits.max]);
    }, [currency]);

    const markDirty = () => setIsDirty(true);

    const handleApply = async () => {
        const filters: HotelFilters = {
            price:      { min: price[0], max: price[1] },
            rating:     ratings.length    ? ratings     : undefined,
            fare_type:  fareType          ? fareType as FareType : undefined,
            facilities: facilities.length ? facilities  : undefined,
            hotel_name: hotelName         || undefined,
            sorting,
        };

        const result = await applyFilters(filters);
        if (result) {
            onApply(result);
            setIsDirty(false);
        }
    };

    const handleReset = () => {
        const limits = PRICE_LIMITS[currency] || DEFAULT_LIMITS;
        setPrice([limits.min, limits.max]);
        setRatings([]);
        setFareType("");
        setFacilities([]);
        setHotelName("");
        setSorting("price-low-high");
        setIsDirty(false);
        onReset();
    };

    const toggleRating = (r: number) => {
        setRatings((prev) =>
            prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
        );
        markDirty();
    };

    const toggleFacility = (f: string) => {
        setFacilities((prev) =>
            prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
        );
        markDirty();
    };

    return (
        <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900 flex items-center gap-2 text-sm">
                    <SlidersHorizontal className="h-4 w-4 text-[#15a4e6]" />
                    Filtres
                </h2>
                <button
                    onClick={handleReset}
                    className="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1">
                    <X className="h-3 w-3" /> Réinitialiser
                </button>
            </div>

            {/* Tri */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-zinc-600">Trier par</Label>
                <Select value={sorting}
                        onValueChange={(v) => { setSorting(v as SortingOption); markDirty(); }}>
                    <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {SORTING_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value} className="text-xs">
                                {o.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Prix Dynamique */}
            <div className="space-y-3">
                <Label className="text-xs font-medium text-zinc-600">
                    Prix — {price[0].toLocaleString()} {currency} → {price[1].toLocaleString()} {currency}
                </Label>
                <Slider
                    min={currentLimits.min}
                    max={currentLimits.max}
                    step={currentLimits.step}
                    value={price}
                    onValueChange={(v) => { setPrice(v as [number, number]); markDirty(); }}
                />
            </div>

            {/* Étoiles */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-zinc-600">Étoiles</Label>
                <div className="flex gap-1.5">
                    {RATINGS.map((r) => (
                        <button key={r} onClick={() => toggleRating(r)}
                                className={`h-7 w-7 rounded-lg text-xs font-medium border transition-colors
                                ${ratings.includes(r)
                                    ? "bg-[#15a4e6] text-white border-[#15a4e6]"
                                    : "bg-white text-zinc-600 border-zinc-200 hover:border-[#15a4e6]"
                                }`}>
                            {r}★
                        </button>
                    ))}
                </div>
            </div>

            {/* Type de tarif */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-zinc-600">Type de tarif</Label>
                {(["Refundable", "Non-Refundable"] as FareType[]).map((type) => (
                    <div key={type} className="flex items-center gap-2">
                        <Checkbox id={type} checked={fareType === type}
                                  onCheckedChange={() => {
                                      setFareType((prev) => prev === type ? "" : type);
                                      markDirty();
                                  }} />
                        <label htmlFor={type} className="text-xs text-zinc-600 cursor-pointer">
                            {type === "Refundable" ? "Remboursable" : "Non remboursable"}
                        </label>
                    </div>
                ))}
            </div>

            {/* Équipements */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-zinc-600">Équipements</Label>
                <div className="space-y-1.5">
                    {FACILITIES.map((f) => (
                        <div key={f} className="flex items-center gap-2">
                            <Checkbox id={f} checked={facilities.includes(f)}
                                      onCheckedChange={() => toggleFacility(f)} />
                            <label htmlFor={f} className="text-xs text-zinc-600 cursor-pointer">
                                {f}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Nom hôtel */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-zinc-600">Nom de l'hôtel</Label>
                <Input
                    className="h-8 text-xs"
                    placeholder="Rechercher..."
                    value={hotelName}
                    onChange={(e) => { setHotelName(e.target.value); markDirty(); }}
                />
            </div>

            {/* Bouton — visible seulement si filtres modifiés */}
            <Button
                onClick={handleApply}
                disabled={loading || !isDirty}
                className="w-full bg-[#15a4e6] hover:bg-[#1290cc] text-white text-xs font-semibold rounded-xl h-9 disabled:opacity-40">
                {loading
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Application...</>
                    : isDirty ? "Appliquer les filtres" : "Filtres appliqués ✓"
                }
            </Button>
        </div>
    );
}