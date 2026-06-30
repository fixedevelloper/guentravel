"use client";

import { useQuery }     from "@tanstack/react-query";
import { CheckCircle2, MapPin, Calendar, Users } from "lucide-react";
import { Badge }        from "@/components/ui/badge";
import { Button }       from "@/components/ui/button";
import { useRouter }    from "@/i18n/routing";
import {hotelKeys} from "../../../../../../core/queryKeys/hotelKeys";
import {HotelBooking} from "../../../../../../types/hotel";
import React from "react";

export default function ConfirmationPage({
                                             params: { ref }
                                         }: {
    params: { ref: string }
}) {
    const router  = useRouter();
    const { data: booking } = useQuery<HotelBooking>({
        queryKey: hotelKeys.booking(Number(ref)),
        enabled:  false, // Lecture cache uniquement
    });

    if (!booking) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-zinc-500">Réservation introuvable.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">

            {/* Header succès */}
            <div className="text-center space-y-3">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                <h1 className="text-2xl font-bold text-zinc-900">
                    Réservation confirmée !
                </h1>
                <p className="text-zinc-500">
                    Confirmation envoyée à <strong>{booking.customer_email}</strong>
                </p>
            </div>

            {/* Récapitulatif */}
            <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-100">

                <div className="px-6 py-4 flex justify-between items-center">
                    <span className="text-sm text-zinc-500">Référence</span>
                    <Badge variant="outline" className="font-mono">
                        {booking.supplier_confirmation_num}
                    </Badge>
                </div>

                <div className="px-6 py-4 flex justify-between items-center">
                    <span className="text-sm text-zinc-500 flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> Séjour
                    </span>
                    <span className="text-sm font-medium text-zinc-800">
                        {booking.check_in} → {booking.check_out}
                        <span className="text-zinc-400 ml-1">({booking.days} nuit{booking.days > 1 ? "s" : ""})</span>
                    </span>
                </div>

                <div className="px-6 py-4 flex justify-between items-center">
                    <span className="text-sm text-zinc-500">Montant total</span>
                    <span className="text-lg font-bold text-zinc-900">
                        {booking.currency} {booking.net_price.toLocaleString()}
                    </span>
                </div>

                <div className="px-6 py-4 flex justify-between items-center">
                    <span className="text-sm text-zinc-500">Type de tarif</span>
                    <Badge className={
                        booking.fare_type === "Refundable"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                    }>
                        {booking.fare_type}
                    </Badge>
                </div>

                {/* Chambres */}
                {booking.rooms.map((room, i) => (
                    <div key={i} className="px-6 py-4 space-y-2">
                        <p className="text-sm font-medium text-zinc-700 flex items-center gap-1">
                            <Users className="h-4 w-4 text-[#15a4e6]" />
                            {room.name} — {room.board_type}
                        </p>
                        {room.guests.map((g, j) => (
                            <p key={j} className="text-sm text-zinc-500 pl-5">{g}</p>
                        ))}
                    </div>
                ))}

                {/* Politique annulation */}
                <div className="px-6 py-4 space-y-1">
                    <p className="text-sm font-medium text-zinc-700 mb-2">
                        Politique d'annulation
                    </p>
                    {booking.cancellation_policy.map((rule, i) => (
                        <p key={i} className="text-xs text-zinc-500">{rule}</p>
                    ))}
                </div>
            </div>

            <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full">
                Retour à l'accueil
            </Button>
        </div>
    );
}