// components/GuestCounter.tsx
"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Users, Minus, Plus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface Room {
    adults: number;
    children: number;
    child_ages: number[];
}

interface GuestCounterProps {
    rooms: Room[];
    setRooms: (rooms: Room[]) => void;
}

const Counter = ({ label, sub, value, onChange }: {
    label: string; sub: string; value: number; onChange: (v: number) => void;
}) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <p className="font-medium text-sm text-zinc-900">{label}</p>
            <p className="text-xs text-zinc-500">{sub}</p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full"
                    onClick={() => onChange(Math.max(0, value - 1))}>
                <Minus className="h-4 w-4" />
            </Button>
            <span className="w-4 text-center font-medium">{value}</span>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full"
                    onClick={() => onChange(value + 1)}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    </div>
);

export function GuestCounter({ rooms, setRooms }: GuestCounterProps) {
    const t = useTranslations("GuestCounter");

    const totalAdults   = rooms.reduce((s, r) => s + r.adults, 0);
    const totalChildren = rooms.reduce((s, r) => s + r.children, 0);

    const updateRoom = (index: number, field: keyof Room, value: any) => {
        const updated = [...rooms];
        updated[index] = { ...updated[index], [field]: value };

        // Sync child_ages length avec children count
        if (field === "children") {
            const ages = [...updated[index].child_ages];
            while (ages.length < value) ages.push(0);
            updated[index].child_ages = ages.slice(0, value);
        }

        setRooms(updated);
    };

    const updateChildAge = (roomIndex: number, childIndex: number, age: number) => {
        const updated = [...rooms];
        const ages    = [...updated[roomIndex].child_ages];
        ages[childIndex] = age;
        updated[roomIndex] = { ...updated[roomIndex], child_ages: ages };
        setRooms(updated);
    };

    const addRoom = () => setRooms([...rooms, { adults: 1, children: 0, child_ages: [] }]);

    const removeRoom = (index: number) => {
        if (rooms.length === 1) return;
        setRooms(rooms.filter((_, i) => i !== index));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="flex-1 flex items-center px-4 py-3 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer">
                    <Users className="text-[#15a4e6] mr-3 h-5 w-5" />
                    <div className="text-left">
                        <span className="text-zinc-500 text-sm block">{t("label")}</span>
                        <span className="text-zinc-900 font-medium text-sm">
                            {t("summary", {
                                total: totalAdults + totalChildren,
                                rooms: rooms.length,
                            })}
                        </span>
                    </div>
                </div>
            </PopoverTrigger>

            <PopoverContent className="w-96 p-4 max-h-[480px] overflow-y-auto">
                {rooms.map((room, rIdx) => (
                    <div key={rIdx} className="mb-4 pb-4 border-b border-zinc-100 last:border-0">
                        <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm text-zinc-800">
                                {t("room")} {rIdx + 1}
                            </p>
                            {rooms.length > 1 && (
                                <button onClick={() => removeRoom(rIdx)}
                                        className="text-zinc-400 hover:text-red-500 transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <Counter
                            label={t("adults.label")}
                            sub={t("adults.sub")}
                            value={room.adults}
                            onChange={(v) => updateRoom(rIdx, "adults", Math.max(1, v))}
                        />
                        <Counter
                            label={t("children.label")}
                            sub={t("children.sub")}
                            value={room.children}
                            onChange={(v) => updateRoom(rIdx, "children", v)}
                        />

                        {/* Âges des enfants */}
                        {room.children > 0 && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {room.child_ages.map((age, cIdx) => (
                                    <div key={cIdx}>
                                        <label className="text-xs text-zinc-500 block mb-1">
                                            {t("childAge", { n: cIdx + 1 })}
                                        </label>
                                        <select
                                            value={age}
                                            onChange={(e) => updateChildAge(rIdx, cIdx, Number(e.target.value))}
                                            className="w-full border border-zinc-200 rounded-md px-2 py-1 text-sm text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#15a4e6]"
                                        >
                                            {Array.from({ length: 18 }, (_, i) => (
                                                <option key={i} value={i}>
                                                    {i === 0 ? t("infant") : `${i} ${t("years")}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                <Button variant="outline" className="w-full mt-1 text-sm" onClick={addRoom}>
                    <Plus className="h-4 w-4 mr-2" /> {t("addRoom")}
                </Button>
            </PopoverContent>
        </Popover>
    );
}