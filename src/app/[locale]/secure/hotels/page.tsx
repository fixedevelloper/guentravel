"use client";

import React, { useEffect, useState } from "react";
import { BedDouble, Calendar, User, Loader2, CreditCard, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { api } from "../../../../core/api/axios-instance";

interface HotelBooking {
    id: number;
    reference_num: string;
    supplier_confirmation_num: string | null;
    check_in: string;
    check_out: string;
    days: number;
    currency: string;
    net_price: number;
    status: string;
    customer_email: string;
    rooms_booked: any; // Contient souvent le nom de l'hôtel, le type de chambre, etc.
    user?: { name: string; email: string } | null;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export default function HotelBookingsPage() {
    const [bookings, setBookings] = useState<HotelBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/admin/hotels?page=${page}`);
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
                console.error("Erreur de chargement des hôtels", err);
                setError("Impossible de charger les réservations d'hôtels.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [page]);

    // Formatage rapide des dates
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

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
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Réservations d'Hôtels</h1>
                    <p className="text-sm text-zinc-500">Suivi des nuitées, confirmations fournisseurs et statuts.</p>
                </div>
                {loading && <Loader2 className="h-5 w-5 animate-spin text-[#15a4e6]" />}
            </div>

            {bookings.length === 0 ? (
                <div className="p-12 text-center text-sm text-zinc-500 bg-white border border-zinc-200 rounded-lg">
                    Aucune réservation d'hôtel trouvée.
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-500">
                                <th className="px-6 py-4">Référence / Client</th>
                                <th className="px-6 py-4">Hôtel & Chambres</th>
                                <th className="px-6 py-4">Séjour</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4 text-right">Prix Net</th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-zinc-100 text-sm">
                            {bookings.map((booking) => {
                                // Extraction adaptative du nom de l'hôtel (à ajuster selon la structure de votre JSON rooms_booked)
                                const hotelName = booking.rooms_booked?.[0]?.hotel_name || booking.rooms_booked?.hotelName || `Hôtel (ID: ${booking.id})`;
                                const roomType = booking.rooms_booked?.[0]?.room_name || "Chambre Standard";

                                return (
                                    <tr key={booking.id} className="hover:bg-zinc-50/50 transition-colors">
                                        {/* Références & Infos Client */}
                                        <td className="px-6 py-4">
                                                <span className="inline-block px-2 py-0.5 bg-zinc-100 text-zinc-800 font-mono font-bold text-xs rounded mb-1">
                                                    Ref: {booking.reference_num}
                                                </span>
                                            <div className="font-medium text-zinc-900">{booking.user?.name ?? "Invité"}</div>
                                            <div className="text-xs text-zinc-400">{booking.customer_email}</div>
                                            {booking.supplier_confirmation_num && (
                                                <div className="text-[11px] text-zinc-500 mt-0.5">
                                                    SDR: <span className="font-mono">{booking.supplier_confirmation_num}</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Détails Hôtel */}
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-zinc-800 flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                                <span className="truncate max-w-[200px]">{hotelName}</span>
                                            </div>
                                            <div className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                                                <BedDouble className="h-3 w-3 text-zinc-400" />
                                                {roomType}
                                            </div>
                                        </td>

                                        {/* Durée & Dates */}
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-zinc-800">
                                                {booking.days} {booking.days > 1 ? "nuits" : "nuit"}
                                            </div>
                                            <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(booking.check_in)} - {formatDate(booking.check_out)}</span>
                                            </div>
                                        </td>

                                        {/* Statut de Réservation */}
                                        <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                    booking.status === "CONFIRMED" || booking.status === "confirmed"
                                                        ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                                                        : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                                                }`}>
                                                    {booking.status.toUpperCase()}
                                                </span>
                                        </td>

                                        {/* Prix Net */}
                                        <td className="px-6 py-4 text-right font-bold text-zinc-900">
                                            {booking.net_price.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {booking.currency}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
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