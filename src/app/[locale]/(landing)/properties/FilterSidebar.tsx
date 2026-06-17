"use client";

import React from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Star, Home, Wifi, Coffee, Car } from "lucide-react";

export function FilterSidebar({ onFilterChange, currentFilters }: { onFilterChange: (f: any) => void, currentFilters: any }) {

    return (
        <aside className="w-full lg:w-72 shrink-0">
            <div className="sticky top-24 bg-white p-7 rounded-3xl border border-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-8">

                <div className="flex items-center justify-between">
                    <h3 className="font-black text-xl text-zinc-900">Filtres</h3>
                    <button onClick={() => onFilterChange({ maxPrice: 500000 })} className="text-xs font-bold text-[#1d9e4b] hover:underline">
                        Tout effacer
                    </button>
                </div>

                {/* 1. Type d'établissement */}
                <FilterGroup title="Type d'établissement">
                    {["Hôtel", "Villa", "Appartement"].map((type) => (
                        <FilterOption
                            key={type}
                            label={type}
                            icon={<Home size={16} />}
                            onCheckedChange={(checked) => onFilterChange({ type })}
                        />
                    ))}
                </FilterGroup>

                {/* 2. Prix - SLIDER FONCTIONNEL */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Budget max</h4>
                        <span className="text-xs font-black text-[#1d9e4b]">{currentFilters.maxPrice.toLocaleString()} FCFA</span>
                    </div>

                    <Slider
                        defaultValue={[currentFilters.maxPrice]}
                        max={500000}
                        step={5000}
                        className="py-2"
                        onValueChange={(val) => onFilterChange({ maxPrice: val[0] })}
                    />
                </div>

                {/* 3. Note des clients */}
                <FilterGroup title="Note des voyageurs">
                    {[5, 4, 3].map((note) => (
                        <div key={note} className="flex items-center gap-2 p-2 hover:bg-zinc-50 rounded-lg">
                            <Checkbox id={`note-${note}`} onCheckedChange={() => onFilterChange({ minRating: note })} />
                            <Label className="flex items-center gap-1 text-sm cursor-pointer">{note}+ <Star size={14} className="fill-yellow-400 text-yellow-400" /></Label>
                        </div>
                    ))}
                </FilterGroup>
            </div>
        </aside>
    );
}

// Composants utilitaires
function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">{title}</h4>
            <div className="space-y-1">{children}</div>
        </div>
    );
}

function FilterOption({ label, icon, onCheckedChange }: { label: string; icon: React.ReactNode, onCheckedChange: (c: boolean) => void }) {
    return (
        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 cursor-pointer group">
            <Checkbox onCheckedChange={onCheckedChange} />
            <span className="text-sm font-medium text-zinc-600 flex items-center gap-2">
                {icon} {label}
            </span>
        </label>
    );
}