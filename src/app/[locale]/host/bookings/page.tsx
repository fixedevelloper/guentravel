"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { useParams } from "next/navigation";
import {
    CalendarCheck,
    Search,
    SlidersHorizontal,
    Loader2,
    AlertCircle,
    User,
    Building2,
    Calendar,
    DollarSign,
    CheckCircle2,
    Clock,
    XCircle,
    Check,
    X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// --- DICTIONNAIRE MULTI-LANGUE ---
const translations = {
    fr: {
        title: "Suivi des Réservations",
        subtitle: "Consultez vos séjours en cours, acceptez les demandes ou gérez l'historique de vos voyageurs.",
        searchPlaceholder: "Rechercher un voyageur...",
        filterAll: "Toutes les réservations",
        filterPending: "En attente",
        filterConfirmed: "Confirmées",
        filterCancelled: "Annulées",
        thGuest: "Voyageur",
        thProperty: "Hébergement",
        thDates: "Période du séjour",
        thAmount: "Revenu brut",
        thStatus: "Statut",
        thActions: "Actions",
        noBookings: "Aucune réservation ne correspond à vos critères.",
        acceptBtn: "Accepter",
        rejectBtn: "Refuser",
        actionSuccess: "Le statut de la réservation a été mis à jour.",
        errorLoad: "Erreur lors du chargement des réservations."
    },
    en: {
        title: "Bookings Management",
        subtitle: "Check ongoing stays, approve incoming requests, or review your guest history.",
        searchPlaceholder: "Search by guest name...",
        filterAll: "All bookings",
        filterPending: "Pending",
        filterConfirmed: "Confirmed",
        filterCancelled: "Cancelled",
        thGuest: "Guest",
        thProperty: "Property",
        thDates: "Stay Dates",
        thAmount: "Gross Revenue",
        thStatus: "Status",
        thActions: "Actions",
        noBookings: "No bookings match your criteria.",
        acceptBtn: "Approve",
        rejectBtn: "Decline",
        actionSuccess: "Booking status updated successfully.",
        errorLoad: "Failed to load bookings."
    }
};

export default function HostBookingsPage() {
    const params = useParams();
    const locale = (params?.locale as "fr" | "en") || "fr";
    const t = translations[locale];
    const queryClient = useQueryClient();

    // États de filtrage client
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // --- 1. RÉCUPÉRATION DES RÉSERVATIONS ---
    const { data: responseData, isLoading, isError } = useQuery({
        queryKey: ["hostBookings"],
        queryFn: async () => {
            const response = await api.get("/host/bookings");
            // S'adapte si votre API renvoie directement le tableau ou s'il est encapsulé dans .data ou .data.data
            return response.data?.data?.data || [];
        }
    });

    // --- 2. MUTATION : ACCEPTER OU REFUSER UNE DEMANDE ---
    const updateStatusMutation = useMutation({
        mutationFn: async ({ bookingId, status }: { bookingId: number; status: "confirmed" | "cancelled" }) => {
            return await api.patch(`/host/bookings/${bookingId}/status`, { status });
        },
        onSuccess: () => {
            toast.success(t.actionSuccess);
            queryClient.invalidateQueries({ queryKey: ["hostBookings"] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Une erreur est survenue.";
            toast.error(msg);
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-[#1d9e4b]" />
                <p className="text-sm font-medium text-zinc-500">Chargement de vos dossiers voyageurs...</p>
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

    // Sécurité tableau vide
    const bookingsList = Array.isArray(responseData) ? responseData : [];

    // --- FILTRAGE LOCAL ---
    const filteredBookings = bookingsList.filter((booking: any) => {
        const guestName = booking.guest_name || booking.user?.name || "";
        const propertyTitle = booking.property_title || booking.property?.name?.[locale] || booking.property?.name?.fr || "";

        const matchesSearch = guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            propertyTitle.toLowerCase().includes(searchQuery.toLowerCase());

        if (statusFilter === "all") return matchesSearch;
        return matchesSearch && booking.status === statusFilter;
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
            style: "currency",
            currency: "XAF",
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDateRange = (start: string, end: string) => {
        if (!start || !end) return "—";
        // Convertit les dates SQL "YYYY-MM-DD" en chaînes plus élégantes
        const s = new Date(start).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "short" });
        const e = new Date(end).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "short", year: "numeric" });
        return `${s} - ${e}`;
    };

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">

            {/* EN-TÊTE DE PAGE */}
            <div>
                <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{t.title}</h1>
                <p className="text-sm font-medium text-zinc-500">{t.subtitle}</p>
            </div>

            {/* BARRE DE RECHERCHE ET FILTRES */}
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

            {/* LISTING DES RÉSERVATIONS COULISSANT */}
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
                            {filteredBookings.map((booking: any) => {
                                const propertyObj = booking.booking_items?.[0]?.room?.property;
                                const propertyTitle = propertyObj?.name?.[locale] || propertyObj?.name?.fr || "Hébergement";
                                const guestName = booking.guest?.name || "Voyageur";
                                const guestEmail = booking.guest?.email || "";
                                return (
                                    <tr key={booking.id} className="hover:bg-zinc-50/30 transition-colors">

                                        {/* VOYAGEUR */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 bg-zinc-100 rounded-xl flex items-center justify-center border border-zinc-200 shrink-0 text-zinc-600">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-zinc-900 leading-tight">{guestName}</h4>
                                                    <span className="text-xs text-zinc-400 font-medium">{guestEmail}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* HÉBERGEMENT */}
                                        <td className="py-4 px-6 text-zinc-600">
                                            <div className="flex items-center gap-2 max-w-[200px]">
                                                <Building2 className="h-4 w-4 text-zinc-400 shrink-0" />
                                                <span className="truncate text-xs font-semibold">{propertyTitle}</span>
                                            </div>
                                        </td>

                                        {/* DATES */}
                                        <td className="py-4 px-6 text-zinc-600">
                                            <div className="flex items-center gap-2 text-xs font-semibold">
                                                <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
                                                <span>{formatDateRange(booking.start_date, booking.end_date)}</span>
                                            </div>
                                        </td>

                                        {/* REVENU BRUT */}
                                        <td className="py-4 px-6 font-bold text-zinc-900">
                                            {formatCurrency(booking.total_price)}
                                        </td>

                                        {/* STATUT BADGE */}
                                        <td className="py-4 px-6">
                                            <div className="flex justify-center">
                                                {booking.status === "confirmed" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-full">
                                                            <CheckCircle2 className="h-3 w-3" /> {t.filterConfirmed}
                                                        </span>
                                                )}
                                                {booking.status === "pending" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
                                                            <Clock className="h-3 w-3" /> {t.filterPending}
                                                        </span>
                                                )}
                                                {booking.status === "cancelled" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-full">
                                                            <XCircle className="h-3 w-3" /> {t.filterCancelled}
                                                        </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* ACTIONS ACTIONS RAPIDES (POUR LES DEMANDES EN ATTENTE) */}
                                        <td className="py-4 px-6 text-right">
                                            {booking.status === "pending" ? (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: "confirmed" })}
                                                        className="h-8 bg-[#1d9e4b] hover:bg-[#167c3a] text-white rounded-lg text-xs font-bold px-2.5 shadow-sm gap-1"
                                                        disabled={updateStatusMutation.isPending}
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                        <span className="hidden lg:inline">{t.acceptBtn}</span>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: "cancelled" })}
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