"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { fr, enUS, Locale } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils"; // Optionnel : utilitaire shadcn classique si disponible

interface DateRangePickerProps {
    date: DateRange | undefined;
    setDate: (date: DateRange | undefined) => void;
}

export function DateRangePicker({ date, setDate }: DateRangePickerProps) {
    const t = useTranslations("DateRangePicker");
    const locale = useLocale();
    const [open, setOpen] = React.useState(false);

    // Définition de la locale date-fns
    const dateFnsLocale = React.useMemo<Locale>(() =>
        (locale === "fr" ? fr : enUS), [locale]
    );

    const formattedDate = React.useMemo(() => {
        if (!date?.from) return t("placeholder");

        const from = format(date.from, "LLL dd", { locale: dateFnsLocale });
        if (!date.to) return from;

        const to = format(date.to, "LLL dd", { locale: dateFnsLocale });
        return `${from} - ${to}`;
    }, [date, dateFnsLocale, t]);

    return (
        <div className="w-full">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div
                        role="button"
                        tabIndex={0}
                        aria-label={t("label")}
                        className="text-left cursor-pointer hover:bg-zinc-50 rounded-lg p-2 transition-colors border border-transparent hover:border-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15a4e6]"
                        onClick={() => setOpen(true)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setOpen(true);
                            }
                        }}
                    >
                        <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold block select-none">
                            {t("label")}
                        </span>
                        <span className="text-zinc-900 font-medium text-sm block truncate mt-0.5">
                            {formattedDate}
                        </span>
                    </div>
                </PopoverTrigger>

                <PopoverContent
                    className="w-auto p-0 bg-white border border-zinc-200 rounded-xl shadow-xl z-[9999]"
                    align="start"
                    sideOffset={8}
                >
                    <Calendar
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        locale={dateFnsLocale}
                        // Empêche la sélection de jours passés réajustée sur minuit local
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                        autoFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}