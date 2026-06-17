import React, { memo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const CalendarCell = memo(({
                               day, dayData, isSelected, isBooked, isBlocked, occupancy, onMouseDown, onMouseEnter, onMouseUp
                           }: any) => {
    return (
        <div
            onMouseDown={() => onMouseDown(day)}
            onMouseEnter={() => onMouseEnter(day)}
            onMouseUp={onMouseUp}
            className={cn(
                "min-h-[95px] p-2.5 flex flex-col justify-between transition-all select-none border-r border-zinc-100 dark:border-zinc-800",
                isBooked ? "bg-zinc-50 cursor-not-allowed" : isBlocked ? "bg-red-50/50 cursor-not-allowed" : "cursor-pointer hover:bg-zinc-100",
                isSelected && !isBooked && !isBlocked && "bg-blue-50 ring-2 ring-blue-500 ring-inset z-10"
            )}
        >
            <span className={cn("text-sm font-bold", isBooked ? "text-zinc-400" : isBlocked ? "text-red-400" : "text-zinc-900")}>
                {format(day, 'd', { locale: fr })}
            </span>

            <div className="flex-1 flex flex-col justify-end mt-1">
                {isBooked ? <Lock className="w-4 h-4 text-zinc-300 mx-auto" /> :
                    isBlocked ? <span className="text-[10px] font-black text-red-500">BLOQUÉ</span> :
                        dayData && (
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-black text-emerald-600">{dayData.price}€</p>
                                <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${occupancy * 100}%` }} />
                                </div>
                            </div>
                        )}
            </div>
        </div>
    );
});

CalendarCell.displayName = "CalendarCell";