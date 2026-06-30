
"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Skeleton }                   from "@/components/ui/skeleton";
import { Badge }                      from "@/components/ui/badge";
import { Header }                     from "@/components/layout/Header";
import { Footer }                     from "@/components/layout/Footer";
import {
    CheckCircle2, Clock, XCircle,
    MapPin, Phone, Mail, Calendar,
    BedDouble, Users, CreditCard,
    Building2,
} from "lucide-react";
import {useBookingDetails} from "../../../../../../../core/hooks/useBookingDetails";
import React from "react";

const STATUS_CONFIG = {
    CONFIRMED: {
        icon:  CheckCircle2,
        color: "text-green-500",
        bg:    "bg-green-50 border-green-100",
        label: "Confirmée",
    },
    PENDING: {
        icon:  Clock,
        color: "text-amber-500",
        bg:    "bg-amber-50 border-amber-100",
        label: "En attente",
    },
    CANCELLED: {
        icon:  XCircle,
        color: "text-red-500",
        bg:    "bg-red-50 border-red-100",
        label: "Annulée",
    },
} as const;

export default function BookingDetailsPage() {
    const params       = useParams();
    const searchParams = useSearchParams();

    const referenceNum             = params.ref as string;
    const supplierConfirmationNum  = searchParams.get("supplier") ?? "";

    const { data: booking, isLoading, error } = useBookingDetails(
        supplierConfirmationNum,
        referenceNum
    );

    const statusConfig = STATUS_CONFIG[
    (booking?.status as keyof typeof STATUS_CONFIG) ?? "PENDING"
        ] ?? STATUS_CONFIG.PENDING;

    const StatusIcon = statusConfig.icon;

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col">

            <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10 space-y-6">

                {/* Statut */}
                {isLoading ? (
                    <Skeleton className="h-24 w-full rounded-2xl" />
                ) : (
                    <div className={`flex items-center gap-4 p-5 rounded-2xl border ${statusConfig.bg}`}>
                        <StatusIcon className={`h-10 w-10 shrink-0 ${statusConfig.color}`} />
                        <div>
                            <p className="font-bold text-zinc-900 text-lg">
                                Réservation {statusConfig.label}
                            </p>
                            <p className="text-sm text-zinc-500 mt-0.5">
                                Réf. fournisseur : <strong>{booking?.supplier_confirmation_num}</strong>
                                {" · "}
                                Réf. interne : <strong>{booking?.reference_num}</strong>
                            </p>
                            {booking?.booking_date_time && (
                                <p className="text-xs text-zinc-400 mt-1">
                                    Réservé le {new Date(booking.booking_date_time)
                                    .toLocaleDateString("fr-FR", {
                                        day: "numeric", month: "long",
                                        year: "numeric", hour: "2-digit", minute: "2-digit"
                                    })}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Hôtel */}
                <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                    {isLoading ? (
                        <Skeleton className="h-48 w-full" />
                    ) : (
                        <>
                            {booking?.hotel.image && (
                                <img
                                    src={booking.hotel.image}
                                    alt={booking.hotel.name}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="p-6 space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="font-bold text-zinc-900 text-xl">
                                            {booking?.hotel.name}
                                        </h2>
                                        {booking?.hotel.rating && (
                                            <Badge variant="outline" className="mt-1 text-xs">
                                                {booking.hotel.rating}
                                            </Badge>
                                        )}
                                    </div>
                                    <Badge className={
                                        booking?.fare_type === "Refundable"
                                            ? "bg-green-100 text-green-700 shrink-0"
                                            : "bg-red-100 text-red-700 shrink-0"
                                    }>
                                        {booking?.fare_type}
                                    </Badge>
                                </div>

                                <div className="space-y-1.5 text-sm text-zinc-600">
                                    <p className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                                        {booking?.hotel.address}, {booking?.hotel.city}, {booking?.hotel.country}
                                        {booking?.hotel.postal_code && ` ${booking.hotel.postal_code}`}
                                    </p>
                                    {booking?.hotel.phone && (
                                        <p className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
                                            {booking.hotel.phone}
                                        </p>
                                    )}
                                    {booking?.hotel.email && (
                                        <p className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                                            {booking.hotel.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Séjour */}
                <div className="bg-white rounded-2xl border border-zinc-200 divide-y divide-zinc-100">
                    <div className="px-6 py-4 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#15a4e6]" />
                        <span className="text-sm font-semibold text-zinc-800">Séjour</span>
                    </div>

                    {isLoading ? (
                        <div className="p-6 space-y-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/3" />
                        </div>
                    ) : (
                        <>
                            <div className="px-6 py-3 flex justify-between text-sm">
                                <span className="text-zinc-500">Check-in</span>
                                <span className="font-medium text-zinc-800">
                                    {new Date(booking!.check_in).toLocaleDateString("fr-FR", {
                                        weekday: "long", day: "numeric", month: "long", year: "numeric"
                                    })}
                                </span>
                            </div>
                            <div className="px-6 py-3 flex justify-between text-sm">
                                <span className="text-zinc-500">Check-out</span>
                                <span className="font-medium text-zinc-800">
                                    {new Date(booking!.check_out).toLocaleDateString("fr-FR", {
                                        weekday: "long", day: "numeric", month: "long", year: "numeric"
                                    })}
                                </span>
                            </div>
                            <div className="px-6 py-3 flex justify-between text-sm">
                                <span className="text-zinc-500">Durée</span>
                                <span className="font-medium text-zinc-800">
                                    {booking!.days} nuit{booking!.days > 1 ? "s" : ""}
                                </span>
                            </div>
                            <div className="px-6 py-4 flex justify-between items-center">
                                <span className="text-sm text-zinc-500 flex items-center gap-1">
                                    <CreditCard className="h-4 w-4" /> Total
                                </span>
                                <span className="text-xl font-bold text-zinc-900">
                                    {booking!.currency} {booking!.net_price.toLocaleString()}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Chambres & Voyageurs */}
                <div className="bg-white rounded-2xl border border-zinc-200 divide-y divide-zinc-100">
                    <div className="px-6 py-4 flex items-center gap-2">
                        <BedDouble className="h-4 w-4 text-[#15a4e6]" />
                        <span className="text-sm font-semibold text-zinc-800">
                            Chambres & Voyageurs
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="p-6 space-y-2">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ) : booking?.rooms.map((room, i) => (
                        <div key={i} className="px-6 py-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-zinc-400" />
                                <span className="text-sm font-medium text-zinc-800">
                                    {room.name}
                                </span>
                                <Badge variant="outline" className="text-xs ml-auto">
                                    {room.board_type}
                                </Badge>
                            </div>
                            <div className="pl-6 space-y-1">
                                {room.guests.map((guest, j) => (
                                    <p key={j} className="text-sm text-zinc-500 flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5 text-zinc-300" />
                                        {guest}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Politique annulation */}
                {!isLoading && (booking?.cancellation_policy?.length ?? 0) > 0 && (
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-2">
                        <h3 className="text-sm font-semibold text-zinc-800 mb-3">
                            Politique d'annulation
                        </h3>
                        {booking!.cancellation_policy.map((rule, i) => (
                            <p key={i} className="text-xs text-zinc-500 flex items-start gap-2">
                                <span className="text-zinc-300 mt-0.5">•</span>
                                {rule}
                            </p>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                        ⚠️ Impossible de récupérer les détails de la réservation.
                    </div>
                )}
            </main>
        </div>
    );
}