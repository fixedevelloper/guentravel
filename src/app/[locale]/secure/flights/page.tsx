"use client";

import React, { useEffect, useState } from "react";
import { Plane, User, ArrowRight, Loader2, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../../../../core/api/axios-instance";

interface FlightTrip {
    id: number;
    origin: string;
    destination: string;
    departure_time: string;
    airline_code?: string;
    flight_number: string;
}

interface FlightPassenger {
    id: number;
    first_name: string;
    last_name: string;
}

interface FlightBooking {
    id: number;
    pnr: string | null;
    booking_type: string;
    booking_status: string;
    total_amount: string | number;
    currency: string;
    payment_status: string;
    user?: { name: string; email: string } | null;
    contact_email: string;
    trips?: FlightTrip[];
    passengers?: FlightPassenger[];
}

// Interface pour calquer la structure de pagination de Laravel
interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export default function FlightBookingsPage() {
    const [bookings, setBookings] = useState<FlightBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // États pour contrôler la pagination
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                // On passe le numéro de page en paramètre de requête (?page=X)
                const res = await api.get(`/admin/flights?page=${page}`);

                // Laravel renvoie les données dans res.data.data
                // et les infos de pagination à la racine de res.data
                setBookings(res.data?.data ?? []);

                setMeta({
                    current_page: res.data?.current_page ?? 1,
                    last_page: res.data?.last_page ?? 1,
                    per_page: res.data?.per_page ?? 15,
                    total: res.data?.total ?? 0,
                    from: res.data?.from ?? 0,
                    to: res.data?.to ?? 0,
                });
            } catch (err) {
                console.error("Erreur de chargement", err);
                setError("Impossible de charger les réservations.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [page]); // Le hook se déclenche à chaque fois que la page change

    if (loading && bookings.length === 0) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#15a4e6]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Réservations de Vols</h1>
                    <p className="text-sm text-zinc-500">Suivi des PNR, statuts de paiement et itinéraires.</p>
                </div>
                {loading && <Loader2 className="h-5 w-5 animate-spin text-[#15a4e6]" />}
            </div>

            {bookings.length === 0 ? (
                <div className="p-12 text-center text-sm text-zinc-500 bg-white border border-zinc-200 rounded-lg">
                    Aucune réservation trouvée.
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-500">
                                <th className="px-6 py-4">PNR / Contact</th>
                                <th className="px-6 py-4">Itinéraire principal</th>
                                <th className="px-6 py-4">Passagers</th>
                                <th className="px-6 py-4">Statuts</th>
                                <th className="px-6 py-4 text-right">Montant</th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-zinc-100 text-sm">
                            {bookings.map((booking) => {
                                const trips = booking.trips ?? [];
                                const passengers = booking.passengers ?? [];
                                const firstTrip = trips[0];

                                return (
                                    <tr key={booking.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-2 py-0.5 bg-zinc-100 text-zinc-800 font-mono font-bold text-xs rounded mb-1">
                                                {booking.pnr ?? "SANS PNR"}
                                            </span>
                                            <div className="font-medium text-zinc-900">{booking.user?.name ?? "Invité"}</div>
                                            <div className="text-xs text-zinc-400">{booking.contact_email}</div>
                                        </td>

                                        <td className="px-6 py-4">
                                            {firstTrip ? (
                                                <>
                                                    <div className="flex items-center gap-2 font-semibold text-zinc-800">
                                                        <span>{firstTrip.origin}</span>
                                                        <ArrowRight className="h-3 w-3 text-zinc-400" />
                                                        <span>{firstTrip.destination}</span>
                                                    </div>
                                                    <div className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                                                        <Plane className="h-3 w-3" />
                                                        {firstTrip.flight_number} • {firstTrip.departure_time}
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-xs text-zinc-400">Aucun itinéraire rattaché</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-zinc-600">
                                            <div className="flex items-center gap-1">
                                                <User className="h-3.5 w-3.5 text-zinc-400" />
                                                <span className="font-medium text-zinc-900">{passengers.length}</span>
                                                <span className="text-xs text-zinc-400">pax</span>
                                            </div>
                                            {passengers.length > 0 && (
                                                <div className="text-xs text-zinc-400 truncate max-w-[150px]">
                                                    {passengers[0].first_name} {passengers[0].last_name}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 space-y-1">
                                            <div>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                    booking.booking_status === "confirmed" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                                                }`}>
                                                    {booking.booking_status}
                                                </span>
                                            </div>
                                            <div>
                                                <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                                                    booking.payment_status === "paid" ? "text-green-600" : "text-zinc-400"
                                                }`}>
                                                    <CreditCard className="h-3 w-3" />
                                                    {booking.payment_status}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right font-bold text-zinc-900">
                                            {booking.total_amount} {booking.currency}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    {/* Barre de pagination UI alignée sur Laravel */}
                    {meta && meta.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-6 py-4">
                            <div className="text-xs text-zinc-500">
                                Affichage de <span className="font-medium text-zinc-700">{meta.from}</span> à{" "}
                                <span className="font-medium text-zinc-700">{meta.to}</span> sur{" "}
                                <span className="font-medium text-zinc-700">{meta.total}</span> réservations
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                    disabled={page === 1 || loading}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:bg-zinc-50 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <span className="text-xs font-medium text-zinc-700 px-2">
                                    Page {meta.current_page} sur {meta.last_page}
                                </span>

                                <button
                                    onClick={() => setPage((p) => Math.min(p + 1, meta.last_page))}
                                    disabled={page === meta.last_page || loading}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:bg-zinc-50 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}