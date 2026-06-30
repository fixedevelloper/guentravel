"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import React from "react";

interface SelectedRoom {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

type Props = {
    selectedRooms: SelectedRoom[]; // Remplacement de room: any
    guests: {
        adults: number;
        children: number;
    };
    checkIn: string;
    checkOut: string;
};

export function BookingSidebar({
                                   selectedRooms = [],
                                   guests,
                                   checkIn,
                                   checkOut,
                               }: Props) {
    const totalNights = (() => {
        if (!checkIn || !checkOut) return 1;

        const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
        const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));

        return nights > 0 ? nights : 1;
    })();

    const totalGuests = (guests?.adults || 0) + (guests?.children || 0);

    // Calcul du sous-total cumulé pour toutes les chambres et toutes les nuits
    const roomsSubtotal = selectedRooms.reduce(
        (acc, room) => acc + room.price * room.quantity * totalNights,
        0
    );

    const serviceFee = roomsSubtotal > 0 ? 0 : 0;
    const finalTotal = roomsSubtotal + serviceFee;

    return (
        <div className="lg:col-span-1">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="sticky top-6 bg-white border border-zinc-100 shadow-xl rounded-3xl p-6 space-y-5"
            >
                <div>
                    <h3 className="text-xl font-extrabold text-zinc-900">
                        Total de la réservation
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                        Récapitulatif de votre séjour
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Liste détaillée des chambres sélectionnées */}
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1 divide-y divide-zinc-100">
                        {selectedRooms.map((room) => (
                            <div key={room.id} className="flex justify-between text-zinc-600 pt-2 first:pt-0">
                                <div className="text-sm">
                                    <p className="font-medium text-zinc-800">{room.name}</p>
                                    <p className="text-xs text-zinc-400">
                                        {room.quantity} × {room.price?.toLocaleString()} FCFA × {totalNights} nuit{totalNights > 1 ? "s" : ""}
                                    </p>
                                </div>
                                <span className="font-semibold text-sm self-center text-zinc-700">
                                    {(room.price * room.quantity * totalNights).toLocaleString()} FCFA
                                </span>
                            </div>
                        ))}
                    </div>

                    <hr className="border-zinc-100" />

                    {/* Informations voyageurs */}
                    <div className="flex justify-between text-zinc-600 text-sm">
                        <span>
                            Capacité ({totalGuests} voyageur{totalGuests > 1 ? "s" : ""})
                        </span>
                        <span className="font-medium text-zinc-500">Inclus</span>
                    </div>

                    {/* Frais de service */}
                    <div className="flex justify-between text-zinc-600 text-sm">
                        <span>Frais de dossier</span>
                        <span className="font-semibold">
                            {serviceFee.toLocaleString()} FCFA
                        </span>
                    </div>
                </div>

                <div className="border-t border-zinc-200 pt-5">
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-extrabold text-zinc-900">
                            Total
                        </span>
                        <span className="text-3xl font-extrabold text-[#15a4e6]">
                            {finalTotal.toLocaleString()} FCFA
                        </span>
                    </div>
                </div>

                <div className="bg-[#15a4e6]/10 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-[#15a4e6] mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-[#15a4e6]">
                                Réservation sécurisée
                            </p>
                            <p className="text-xs text-zinc-600 mt-1">
                                Toutes les transactions sont protégées et vos informations restent confidentielles.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-center text-zinc-500">
                    Le montant final inclut les frais applicables au moment de la réservation.
                </div>
            </motion.div>
        </div>
    );
}