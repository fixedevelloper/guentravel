"use client";

import * as React from "react";
import { useTranslations } from "next-intl"; // Hook essentiel
import { Users, Minus, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface CounterProps {
    label: string;
    sub: string;
    value: number;
    onChange: (val: number) => void;
}

const Counter = ({ label, sub, value, onChange }: CounterProps) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <p className="font-medium text-sm text-zinc-900">{label}</p>
            <p className="text-xs text-zinc-500">{sub}</p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => onChange(Math.max(0, value - 1))}>
                <Minus className="h-4 w-4" />
            </Button>
            <span className="w-4 text-center font-medium">{value}</span>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => onChange(value + 1)}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    </div>
);

export function GuestCounter({ guests, setGuests }: any) {
    const t = useTranslations("GuestCounter");

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="flex-1 flex items-center px-4 py-3 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer">
                    <Users className="text-[#15a4e6] mr-3 h-5 w-5" />
                    <div className="text-left">
                        <span className="text-zinc-500 text-sm block">{t("label")}</span>
                        <span className="text-zinc-900 font-medium text-sm">
                            {t("summary", { total: guests.adults + guests.children, rooms: guests.rooms })}
                        </span>
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-92 p-4">
                <Counter
                    label={t("adults.label")}
                    sub={t("adults.sub")}
                    value={guests.adults}
                    onChange={(v) => setGuests({...guests, adults: v})}
                />
                <Counter
                    label={t("children.label")}
                    sub={t("children.sub")}
                    value={guests.children}
                    onChange={(v) => setGuests({...guests, children: v})}
                />
                <Counter
                    label={t("rooms.label")}
                    sub={t("rooms.sub")}
                    value={guests.rooms}
                    onChange={(v) => setGuests({...guests, rooms: v})}
                />
            </PopoverContent>
        </Popover>
    );
}