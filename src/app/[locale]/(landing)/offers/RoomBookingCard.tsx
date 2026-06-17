"use client";

import { Button } from "@/components/ui/button";

interface RoomBookingCardProps {
    roomId: string;
    price: number;
}

export function RoomBookingCard({ roomId, price }: RoomBookingCardProps) {
    return (
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl">
            <div className="mb-6">
                <span className="text-zinc-500 font-medium">Prix par nuit</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[#1d9e4b]">{price?.toLocaleString()}</span>
                    <span className="text-zinc-400">FCFA</span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <input type="date" className="p-3 border border-zinc-200 rounded-xl focus:ring-2 ring-[#1d9e4b] outline-none" />
                    <input type="date" className="p-3 border border-zinc-200 rounded-xl focus:ring-2 ring-[#1d9e4b] outline-none" />
                </div>

                <Button className="w-full h-14 bg-[#1d9e4b] hover:bg-[#167c3a] text-lg font-bold rounded-xl shadow-lg shadow-[#1d9e4b]/20">
                    Réserver cette chambre
                </Button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-400">
                <span>✓ Annulation gratuite jusqu'à 24h</span>
            </div>
        </div>
    );
}