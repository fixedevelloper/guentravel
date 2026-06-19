"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
    format,
    eachDayOfInterval,
    startOfMonth,
    endOfMonth,
    addMonths,
    isWithinInterval
} from "date-fns";
import { fr } from "date-fns/locale";
import { Lock, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CalendarCellData {
    date: string;
    price: number;
    inventory: number;
    total: number;
    is_blocked: boolean;
    has_booking: boolean;
}

interface DateRange {
    from: Date;
    to: Date;
}

interface GuenGridCalendarProps {
    data: CalendarCellData[];
    onSelectRange: (range: DateRange | null) => void;
}

export const GuenGridCalendar = ({ data, onSelectRange }: GuenGridCalendarProps) => {
    const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [monthOffset, setMonthOffset] = useState(0);

    // 2 mois consécutifs (mois actuel + offset)
    const months = useMemo(() =>
            [0, 1].map(m => addMonths(new Date(), m + monthOffset)),
        [monthOffset]
    );

    const days = useMemo(() =>
            eachDayOfInterval({
                start: startOfMonth(months[0]),
                end: endOfMonth(months[1])
            }),
        [months]
    );

    const isDateBooked = useCallback((date: Date) => {
        return data.find(d => d.date === format(date, 'yyyy-MM-dd'))?.has_booking ?? false;
    }, [data]);

    const isDateBlocked = useCallback((date: Date) => {
        return data.find(d => d.date === format(date, 'yyyy-MM-dd'))?.is_blocked ?? false;
    }, [data]);

    const getMonthIndex = useCallback((day: Date) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const firstDayOfMonth0 = format(months[0], 'yyyy-MM-dd');
        const firstDayOfMonth1 = format(months[1], 'yyyy-MM-dd');

        if (dayKey >= firstDayOfMonth1) return 1;
        return 0;
    }, [months]);

    const handleMouseEnter = useCallback((date: Date) => {
        if (!isSelecting || !selectedRange) return;

        const start = selectedRange.from;
        const newRange = {
            from: start < date ? start : date,
            to: start < date ? date : start
        };

        const rangeDays = eachDayOfInterval({ start: newRange.from, end: newRange.to });
        if (rangeDays.some(d => isDateBooked(d) || isDateBlocked(d))) {
            return;
        }

        setSelectedRange(newRange);
        onSelectRange(newRange);
    }, [isSelecting, selectedRange, isDateBooked, isDateBlocked, onSelectRange]);

    const handleMouseDown = useCallback((date: Date) => {
        if (isDateBooked(date)) {
            toast.error("Date déjà réservée");
            return;
        }
        if (isDateBlocked(date)) {
            toast.error("Date bloquée");
            return;
        }

        setIsSelecting(true);
        const range = { from: date, to: date };
        setSelectedRange(range);
        onSelectRange(range);
    }, [isDateBooked, isDateBlocked, onSelectRange]);

    const handleMouseUp = useCallback(() => {
        setIsSelecting(false);
    }, []);

    const getOccupancyRate = (dayData: CalendarCellData) => {
        return dayData.total > 0 ? (dayData.total - dayData.inventory) / dayData.total : 0;
    };

    return (
        <div className="space-y-4">
            {/* Header avec navigation */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setMonthOffset(Math.max(-12, monthOffset - 1))}
                    className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Mois précédent"
                >
                    <ChevronLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                </button>

                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    <CalendarIcon className="w-4 h-4 text-[#15a4e6]" />
                    <span>
            {format(months[0], 'MMM yyyy', { locale: fr })} → {format(months[1], 'MMM yyyy', { locale: fr })}
          </span>
                </div>

                <button
                    onClick={() => setMonthOffset(Math.min(12, monthOffset + 1))}
                    className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Mois suivant"
                >
                    <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                </button>

                {selectedRange && (
                    <span className="ml-auto text-sm text-[#15a4e6] font-medium">
            {format(selectedRange.from, 'd MMM', { locale: fr })} → {format(selectedRange.to, 'd MMM', { locale: fr })}
          </span>
                )}
            </div>

            {/* Grid principale */}
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 shadow-lg">
                {/* Headers: Jours de la semaine */}
                <div className="grid grid-cols-7">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
                        <div
                            key={d}
                            className="bg-zinc-50 dark:bg-zinc-900 py-2.5 text-center border-r border-zinc-200 dark:border-zinc-700 last:border-r-0"
                        >
                            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                {d}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Labels de mois (au-dessus de chaque bloc de 7 jours) */}
                <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
                    {/* Mois 1 */}
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div
                            key={`m1-${i}`}
                            className={cn(
                                "py-2 text-center",
                                i === 6 ? "border-r-2 border-zinc-300 dark:border-zinc-600" : ""
                            )}
                        >
                            {i === 0 && (
                                <span className="text-[10px] font-bold text-[#15a4e6] uppercase tracking-wide bg-[#15a4e6]/10 px-2 py-0.5 rounded">
                  {format(months[0], 'MMM yyyy', { locale: fr })}
                </span>
                            )}
                        </div>
                    ))}

                    {/* Mois 2 */}
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={`m2-${i}`} className="py-2 text-center">
                            {i === 0 && (
                                <span className="text-[10px] font-bold text-[#15a4e6] uppercase tracking-wide bg-[#15a4e6]/10 px-2 py-0.5 rounded">
                  {format(months[1], 'MMM yyyy', { locale: fr })}
                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Cells du calendrier */}
                <div className="grid grid-cols-7 bg-zinc-200 dark:bg-zinc-800">
                    {days.map((day, index) => {
                        const dayKey = format(day, 'yyyy-MM-dd');
                        const dayData = data.find(d => d.date === dayKey);
                        const isSelected = selectedRange && isWithinInterval(day, { start: selectedRange.from, end: selectedRange.to });
                        const isBooked = dayData?.has_booking;
                        const isBlocked = dayData?.is_blocked;
                        const occupancy = dayData ? getOccupancyRate(dayData) : 0;
                        const monthIndex = getMonthIndex(day);
                        const monthBg = monthIndex === 0
                            ? "bg-white dark:bg-zinc-950"
                            : "bg-zinc-50/30 dark:bg-zinc-950/50";
                        const isDisabled = isBooked || isBlocked;
                        const isSeparator = index === 6; // ✅ Seul le séparateur entre mois 1 et 2

                        return (
                            <div
                                key={day.toString()}
                                onMouseDown={() => handleMouseDown(day)}
                                onMouseEnter={() => handleMouseEnter(day)}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={() => setIsSelecting(false)}
                                role="button"
                                aria-label={`${format(day, 'd MMMM', { locale: fr })} — ${dayData ? `${dayData.price}€` : 'Non disponible'}`}
                                tabIndex={isDisabled ? -1 : 0}
                                className={cn(
                                    monthBg,
                                    "min-h-[95px] p-2.5 flex flex-col justify-between transition-all select-none",
                                    isSeparator ? "border-r-2 border-zinc-300 dark:border-zinc-600" : "border-r border-zinc-100 dark:border-zinc-800 last:border-r-0",
                                    isBooked
                                        ? "bg-zinc-50 dark:bg-zinc-900 cursor-not-allowed"
                                        : isBlocked
                                        ? "bg-red-50/50 dark:bg-red-950/10 cursor-not-allowed"
                                        : "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900",
                                    isSelected && !isDisabled && "bg-blue-50 dark:bg-blue-950/20 ring-2 ring-blue-500 ring-inset z-10",
                                    "transition-colors duration-150"
                                )}
                            >
                <span className={cn(
                    "text-sm font-bold transition-colors",
                    isBooked
                        ? "text-zinc-400 dark:text-zinc-500"
                        : isBlocked
                        ? "text-red-400 dark:text-red-500"
                        : isSelected
                            ? "text-blue-700 dark:text-blue-400"
                            : "text-zinc-900 dark:text-zinc-100"
                )}>
                  {format(day, 'd', { locale: fr })}
                </span>

                                <div className="flex-1 flex flex-col justify-end mt-1">
                                    {isBooked ? (
                                        <div className="flex justify-center items-center h-full">
                                            <Lock className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
                                        </div>
                                    ) : isBlocked ? (
                                        <div className="text-center">
                      <span className="text-[10px] font-black text-red-500 dark:text-red-400 tracking-wide">
                        BLOQUÉ
                      </span>
                                        </div>
                                    ) : dayData ? (
                                        <div className="space-y-1.5">
                                            <p className={cn(
                                                "text-[11px] font-black truncate",
                                                dayData.is_blocked
                                                    ? "text-red-500 dark:text-red-400"
                                                    : "text-emerald-600 dark:text-emerald-400"
                                            )}>
                                                {dayData.price}€
                                            </p>

                                            <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full transition-all duration-300",
                                                        occupancy > 0.8
                                                            ? "bg-red-500 dark:bg-red-400"
                                                            : occupancy > 0.5
                                                            ? "bg-emerald-500 dark:bg-emerald-400"
                                                            : "bg-zinc-400 dark:bg-zinc-500"
                                                    )}
                                                    style={{ width: `${occupancy * 100}%` }}
                                                />
                                            </div>

                                            <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">
                                                {dayData.inventory} rest.
                                            </p>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-zinc-300 dark:text-zinc-600 font-medium">N/A</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-emerald-500 rounded" />
                    <span>Disponible</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span>Bloqué</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-zinc-300 rounded" />
                    <span>Réservé</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    <span>Sélection</span>
                </div>
            </div>
        </div>
    );
};