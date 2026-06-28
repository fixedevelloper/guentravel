"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { DateRangePicker } from "../../search/date-range-picker";
import { GuestCounter } from "../../search/GuestCounter";
import React from "react";
import { DateRange } from "react-day-picker";

interface RoomSelection {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

// Interface pour matcher la structure attendue par GuestCounter
interface RoomGuestConfig {
    adults: number;
    children: number;
    child_ages: number[];
}

interface BookingWidgetProps {
    selectedRooms: RoomSelection[];
    date: { from?: Date; to?: Date };
    setDate: (range: any) => void;
    // On change "guests" pour "roomsConfig" (ou "rooms") pour correspondre au composant enfant
    roomsConfig: RoomGuestConfig[];
    setRoomsConfig: (rooms: RoomGuestConfig[]) => void;
    nights: number;
    checkIn: string;
    checkOut: string;
    onSubmit: () => void;
    isPending?: boolean;
}

export function PropertyBookingWidget({
                                          selectedRooms,
                                          date,
                                          setDate,
                                          roomsConfig,
                                          setRoomsConfig,
                                          checkIn,
                                          checkOut,
                                          nights,
                                          onSubmit,
                                          isPending = false
                                      }: BookingWidgetProps) {

    const total = selectedRooms.reduce((acc, r) => acc + (r.price * r.quantity * nights), 0);
    const isReady = date.from && date.to && selectedRooms.length > 0;

    return (
        <aside className="lg:col-span-1">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-24 p-6 border border-zinc-200 rounded-3xl shadow-xl bg-white space-y-6"
            >
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#15a4e6]" />
                    <h3 className="font-extrabold text-xl text-zinc-900">Réservation</h3>
                </div>

                {/* Sélecteurs de dates et invités */}
                <div className="space-y-4">
                    <DateRangePicker date={date as DateRange} setDate={setDate} />
                    {/* On passe maintenant les bonnes variables ici */}
                    <GuestCounter rooms={roomsConfig} setRooms={setRoomsConfig} />
                </div>

                {selectedRooms.length > 0 ? (
                    <div className="space-y-6 pt-4 border-t">
                        <div className="space-y-3">
                            {selectedRooms.map((r) => (
                                <div key={r.id} className="flex justify-between text-sm">
                                    <span className="text-zinc-600">{r.quantity} × {r.name}</span>
                                    <span className="font-medium">{(r.price * r.quantity * nights).toLocaleString()} FCFA</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t flex justify-between items-center">
                            <span className="font-bold text-lg">Total</span>
                            <span className="text-2xl font-extrabold text-[#15a4e6]">{total.toLocaleString()} FCFA</span>
                        </div>

                        <Button
                            onClick={onSubmit}
                            disabled={!isReady || isPending}
                            className="w-full bg-[#15a4e6] hover:bg-[#167c3a] py-6 font-bold rounded-xl shadow-lg transition-all"
                        >
                            {isPending ? "Traitement..." : "Confirmer la réservation"}
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-8 border-2 border-dashed border-zinc-100 rounded-2xl">
                        <p className="text-zinc-500 font-medium">Aucune chambre sélectionnée</p>
                    </div>
                )}
            </motion.div>
        </aside>
    );
}