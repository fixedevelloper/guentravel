"use client";

import React, { useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { SlidersHorizontal, DollarSign, Star, Building, ChevronDown } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { api } from "../core/api/axios-instance";
import { Checkbox } from "@/components/ui/checkbox";

export type FilterState = {
    budget: string[];
    rating: string | null;
    facilities: string[];
};

interface FilterComponentProps {
    onFiltersChange?: (filters: FilterState) => void;
    initialFilters?: FilterState;
}

const BUDGET_RANGES = ["<50", "50-100", "100-200", ">200"];
const RATINGS = [
    { label: "4.5+", value: "4.5" },
    { label: "4.0+", value: "4.0" },
    { label: "3.5+", value: "3.5" }
];

const FilterComponent: React.FC<FilterComponentProps> = ({
                                                             onFiltersChange,
                                                             initialFilters = { budget: [], rating: null, facilities: [] }
                                                         }) => {
    const t = useTranslations("FilterComponent");
    const locale = useLocale();

    const { data: propertyAmenities = [] } = useQuery({ queryKey: ['amenities'], queryFn: async () => (await api.get('/amenities')).data.data });
    const { data: roomAmenities = [] } = useQuery({ queryKey: ["amenities-room"], queryFn: async () => (await api.get("/amenities/room")).data.data });

    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [showAllProperty, setShowAllProperty] = useState(false);
    const [showAllRoom, setShowAllRoom] = useState(false);

    const getLabel = (item: any) => (typeof item.name === 'object' ? (item.name[locale] || item.name.fr) : item.name);

    const handleRatingChange = useCallback((value: string) => {
        setFilters(prev => {
            const next = { ...prev, rating: value };
            onFiltersChange?.(next);
            return next;
        });
    }, [onFiltersChange]);

    const handleBudgetChange = useCallback((value: string) => {
        setFilters(prev => {
            const newBudget = prev.budget.includes(value) ? prev.budget.filter(b => b !== value) : [...prev.budget, value];
            const next = { ...prev, budget: newBudget };
            onFiltersChange?.(next);
            return next;
        });
    }, [onFiltersChange]);

    const handleFacilityChange = useCallback((id: string) => {
        setFilters(prev => {
            const newFacilities = prev.facilities.includes(id) ? prev.facilities.filter(f => f !== id) : [...prev.facilities, id];
            const next = { ...prev, facilities: newFacilities };
            onFiltersChange?.(next);
            return next;
        });
    }, [onFiltersChange]);

    const activeCount = filters.budget.length + (filters.rating ? 1 : 0) + filters.facilities.length;

    return (
        <aside className="hidden lg:block lg:col-span-3 sticky top-[80px] h-[calc(100vh-120px)] overflow-y-auto pr-2 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <h2 className="text-sm font-bold uppercase text-zinc-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" /> {t("title")} {activeCount > 0 && `(${activeCount})`}
                </h2>
                {activeCount > 0 && (
                    <button onClick={() => { setFilters({ budget: [], rating: null, facilities: [] }); onFiltersChange?.({ budget: [], rating: null, facilities: [] }); }} className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 underline">
                        {t("clear")}
                    </button>
                )}
            </div>

            {/* Budget */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> {t("budget.title")}</h3>
                {BUDGET_RANGES.map((val) => (
                    <label key={val} className="flex items-center gap-3 text-sm text-zinc-600 cursor-pointer">
                        <Checkbox checked={filters.budget.includes(val)} onCheckedChange={() => handleBudgetChange(val)} />
                        {t(`budget.options.${val.replace(/[<>]/g, '')}`)}
                    </label>
                ))}
            </div>

            <hr className="border-zinc-100" />

            {/* Note */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> {t("rating.title")}</h3>
                {RATINGS.map((r) => (
                    <label key={r.value} className="flex items-center gap-3 text-sm text-zinc-600 cursor-pointer">
                        <input type="radio" name="rating" checked={filters.rating === r.value} onChange={() => handleRatingChange(r.value)} />
                        {t(`rating.options.${r.value.replace('.', '_')}`)}
                    </label>
                ))}
            </div>

            <hr className="border-zinc-100" />

            {/* Équipements */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> {t("amenities.title")}</h3>

                {/* Logement */}
                <h4 className="text-xs font-semibold text-zinc-700">{t("amenities.property")}</h4>
                {(showAllProperty ? propertyAmenities : propertyAmenities.slice(0, 5)).map((f: any) => (
                    <label key={f.id} className="flex items-center gap-3 text-sm text-zinc-600 cursor-pointer">
                        <Checkbox checked={filters.facilities.includes(f.id.toString())} onCheckedChange={() => handleFacilityChange(f.id.toString())} />
                        {getLabel(f)}
                    </label>
                ))}
                {propertyAmenities.length > 5 && (
                    <button onClick={() => setShowAllProperty(!showAllProperty)} className="text-xs font-semibold text-zinc-500 mt-2 flex items-center">
                        {showAllProperty ? t("showLess") : t("showMore")} <ChevronDown className={`w-3 h-3 ml-1 ${showAllProperty ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>
        </aside>
    );
};

export default FilterComponent;