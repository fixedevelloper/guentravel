"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Loader2, AlertCircle, Search, SlidersHorizontal,
    CalendarCheck, User, Building2, Calendar,
    CheckCircle2, Clock, XCircle, Check, X,
} from "lucide-react";
import React from "react";

// ── Types alignés sur la vraie réponse API ──────────────────────────────────
interface HotelBooking {
    id:                         number;
    user_id:                    number;
    reference_num:              string | null;
    supplier_confirmation_num:  string | null;
    client_ref_num:             string;
    product_id:                 string;
    hotel_id:                   string;
    check_in:                   string;
    check_out:                  string;
    days:                       number;
    currency:                   string;
    net_price:                  number;
    fare_type:                  string;
    status:                     "PENDING" | "CONFIRMED" | "CANCELLED" | "FAILED";
    customer_email:             string;
    customer_phone:             string;
    booking_note:               string | null;
    property_name:              string; // JSON stringifié {"en":..,"fr":..,"es":..}
    property_city:               string;
    created_at:                 string;
}

const translations = {
    fr: {
        title:    "Réservations",
        subtitle: "Gérez les demandes de réservation de vos établissements",
        searchPlaceholder: "Rechercher un client ou un établissement...",
        filterAll: "Tous les statuts",
        filterPending: "En attente",
        filterConfirmed: "Confirmées",
        filterCancelled: "Annulées",
        thGuest: "Client", thProperty: "Établissement", thDates: "Dates",
        thAmount: "Montant", thStatus: "Statut", thActions: "Actions",
        noBookings: "Aucune réservation trouvée",
        errorLoad: "Impossible de charger les réservations",
        acceptBtn: "Accepter", rejectBtn: "Refuser",
        actionSuccess: "Statut mis à jour avec succès",
    },
    en: {
        title:    "Bookings",
        subtitle: "Manage booking requests for your properties",
        searchPlaceholder: "Search guest or property...",
        filterAll: "All statuses",
        filterPending: "Pending",
        filterConfirmed: "Confirmed",
        filterCancelled: "Cancelled",
        thGuest: "Guest", thProperty: "Property", thDates: "Dates",
        thAmount: "Amount", thStatus: "Status", thActions: "Actions",
        noBookings: "No bookings found",
        errorLoad: "Unable to load bookings",
        acceptBtn: "Accept", rejectBtn: "Reject",
        actionSuccess: "Status updated successfully",
    },
};

// Parse le JSON stringifié de property_name
function parsePropertyName(raw: string, locale: "fr" | "en"): string {
    try {
        const parsed = JSON.parse(raw);
        return parsed[locale] || parsed.fr || parsed.en || "Hébergement";
    } catch {
        return raw || "Hébergement";
    }
}

export default function HostBookingsPage() {
    const params = useParams();
    const locale = (params?.locale as "fr" | "en") || "fr";
    const t = translations[locale];
    const queryClient = useQueryClient();

    const [searchQuery,  setSearchQuery]  = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // ── Récupération des réservations ───────────────────────────────────────
    const { data: bookingsList, isLoading, isError } = useQuery({
        queryKey: ["hostBookings"],
        queryFn: async (): Promise<HotelBooking[]> => {
            const response = await api.get("/host/bookings");
            return response.data?.data?.data ?? [];
        },
    });

    // ── Mutation accepter/refuser ────────────────────────────────────────────
    const updateStatusMutation = useMutation({
        mutationFn: async ({
                               bookingId,
                               status,
                           }: {
            bookingId: number;
            status: "CONFIRMED" | "CANCELLED";
        }) => {
            return await api.patch(`/host/bookings/${bookingId}/status`, { status });
        },
        onSuccess: () => {
            toast.success(t.actionSuccess);
            queryClient.invalidateQueries({ queryKey: ["hostBookings"] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Une erreur est survenue.";
            toast.error(msg);
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-[#15a4e6]" />
                <p className="text-sm font-medium text-zinc-500">
                    Chargement de vos dossiers voyageurs...
                </p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-4">
                <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                <h3 className="text-base font-bold text-zinc-900">{t.errorLoad}</h3>
            </div>
        );
    }

    const list = bookingsList ?? [];

    // ── Filtrage local ────────────────────────────────────────────────────────
    const filteredBookings = list.filter((booking) => {
        const guestName    = `${booking.customer_email}`;
        const propertyTitle = parsePropertyName(booking.property_name, locale);

        const matchesSearch =
            guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            propertyTitle.toLowerCase().includes(searchQuery.toLowerCase());

        if (statusFilter === "all") return matchesSearch;
        return matchesSearch && booking.status === statusFilter.toUpperCase();
    });

    const formatCurrency = (value: number, currency: string) => {
        return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
            style: "currency",
            currency: currency || "XAF",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDateRange = (start: string, end: string) => {
        if (!start || !end) return "—";
        const s = new Date(start).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
            day: "numeric", month: "short",
        });
        const e = new Date(end).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
            day: "numeric", month: "short", year: "numeric",
        });
        return `${s} - ${e}`;
    };

    const StatusBadge = ({ status }: { status: HotelBooking["status"] }) => {
        if (status === "CONFIRMED") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> {t.filterConfirmed}
                </span>
            );
        }
        if (status === "PENDING") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
                    <Clock className="h-3 w-3" /> {t.filterPending}
                </span>
            );
        }
        if (status === "CANCELLED" || status === "FAILED") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-full">
                    <XCircle className="h-3 w-3" /> {t.filterCancelled}
                </span>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">

            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{t.title}</h1>
                <p className="text-sm font-medium text-zinc-500">{t.subtitle}</p>
            </div>

            {/* Recherche + filtres */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder={t.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full bg-white rounded-xl border border-zinc-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-zinc-400 transition-all shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-zinc-400 hidden md:block" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-700 outline-none shadow-sm cursor-pointer"
                    >
                        <option value="all">{t.filterAll}</option>
                        <option value="pending">{t.filterPending}</option>
                        <option value="confirmed">{t.filterConfirmed}</option>
                        <option value="cancelled">{t.filterCancelled}</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <Card className="rounded-2xl border-zinc-200/80 shadow-sm bg-white overflow-hidden">
                <CardContent className="p-0 overflow-x-auto">
                    {filteredBookings.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                            <CalendarCheck className="h-10 w-10 text-zinc-300" />
                            <p className="text-sm font-medium text-zinc-400">{t.noBookings}</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                            <tr className="bg-zinc-50/70 border-b border-zinc-100 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                <th className="py-3.5 px-6">{t.thGuest}</th>
                                <th className="py-3.5 px-6">{t.thProperty}</th>
                                <th className="py-3.5 px-6">{t.thDates}</th>
                                <th className="py-3.5 px-6">{t.thAmount}</th>
                                <th className="py-3.5 px-6 text-center">{t.thStatus}</th>
                                <th className="py-3.5 px-6 text-right">{t.thActions}</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-sm font-medium text-zinc-700">
                            {filteredBookings.map((booking) => {
                                const propertyTitle = parsePropertyName(booking.property_name, locale);

                                return (
                                    <tr key={booking.id} className="hover:bg-zinc-50/30 transition-colors">

                                        {/* Voyageur — pas de nom, juste email/phone */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 bg-zinc-100 rounded-xl flex items-center justify-center border border-zinc-200 shrink-0 text-zinc-600">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-zinc-900 leading-tight">
                                                        {booking.customer_phone}
                                                    </h4>
                                                    <span className="text-xs text-zinc-400 font-medium">
                                                            {booking.customer_email}
                                                        </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Établissement */}
                                        <td className="py-4 px-6 text-zinc-600">
                                            <div className="flex items-center gap-2 max-w-[200px]">
                                                <Building2 className="h-4 w-4 text-zinc-400 shrink-0" />
                                                <div className="truncate">
                                                    <p className="text-xs font-semibold truncate">{propertyTitle}</p>
                                                    <p className="text-[10px] text-zinc-400">{booking.property_city}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Dates */}
                                        <td className="py-4 px-6 text-zinc-600">
                                            <div className="flex items-center gap-2 text-xs font-semibold">
                                                <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
                                                <span>{formatDateRange(booking.check_in, booking.check_out)}</span>
                                            </div>
                                        </td>

                                        {/* Montant */}
                                        <td className="py-4 px-6 font-bold text-zinc-900">
                                            {formatCurrency(booking.net_price, booking.currency)}
                                        </td>

                                        {/* Statut */}
                                        <td className="py-4 px-6">
                                            <div className="flex justify-center">
                                                <StatusBadge status={booking.status} />
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-6 text-right">
                                            {booking.status === "PENDING" ? (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => updateStatusMutation.mutate({
                                                            bookingId: booking.id,
                                                            status: "CONFIRMED",
                                                        })}
                                                        className="h-8 bg-[#15a4e6] hover:bg-[#1290cc] text-white rounded-lg text-xs font-bold px-2.5 shadow-sm gap-1"
                                                        disabled={updateStatusMutation.isPending}
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                        <span className="hidden lg:inline">{t.acceptBtn}</span>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => updateStatusMutation.mutate({
                                                            bookingId: booking.id,
                                                            status: "CANCELLED",
                                                        })}
                                                        className="h-8 border-zinc-200 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg text-xs font-bold px-2.5 shadow-sm gap-1"
                                                        disabled={updateStatusMutation.isPending}
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                        <span className="hidden lg:inline">{t.rejectBtn}</span>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-zinc-400 font-bold">—</span>
                                            )}
                                        </td>

                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}