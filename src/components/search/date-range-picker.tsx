"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { fr, enUS, Locale } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps {
    date: DateRange | undefined;
    setDate: (date: DateRange | undefined) => void;
}

export function DateRangePicker({ date, setDate }: DateRangePickerProps) {
    const t = useTranslations("DateRangePicker");
    const locale = useLocale();

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
        <Popover>
            <PopoverTrigger asChild>
                <div className="text-left cursor-pointer hover:bg-zinc-50 rounded-lg p-2 transition-colors border border-transparent hover:border-zinc-200">
                    <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">
                        {t("label")}
                    </span>
                    <span className="text-zinc-900 font-medium text-sm block truncate">
                        {formattedDate}
                    </span>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  //  initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    locale={dateFnsLocale}
                />
            </PopoverContent>
        </Popover>
    );
}