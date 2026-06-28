"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { useParams } from "next/navigation";
import {
    Calendar,
    MapPin,
    Phone,
    Receipt,
    SlidersHorizontal,
    ArrowRight,
    PlaneTakeoff,
    History,
    XCircle,
    CheckCircle2,
    Clock,
    Star,
    Download,
    FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/date";

// --- TYPAGES CORRECTS POUR LES HÔTELS ---
interface Booking {
    id: number;
    reference: string;
    property_name: string;
    property_image?: string;
    property_address?: string;
    room_names?: string;
    check_in: string;
    check_out: string;
    total_price: number;
    currency: string;
    status: "CONFIRMED" | "TICKETED" | "PENDING_PAYMENT" | "WAITING_PIN" | "PROCESSING" | "FAILED" | "CANCELLED";
    rating?: string | number;
    host_phone?: string;
}

// --- DICTIONNAIRE MULTI-LANGUE ---
const translations = {
    fr: {
        title: "Mes Réservations d'Hôtels",
        subtitle: "Retrouvez l'historique complet et le statut de vos séjours.",
        loading: "Chargement de vos réservations...",
        noBookings: "Aucune réservation ne correspond à ce filtre.",
        filterAll: "Toutes",
        filterUpcoming: "À venir",
        filterPast: "Terminées",
        filterCancelled: "Échecs & Annulées",
        ref: "Réf",
        totalPaid: "Montant",
        callHost: "Contacter l'établissement",
        downloadReceipt: "Voucher PDF",
        statusConfirmed: "Confirmé",
        statusPending: "En attente",
        statusCancelled: "Annulé / Échoué",
        rooms: "Chambres",
    },
    en: {
        title: "My Hotel Bookings",
        subtitle: "View the complete history and status of your stays.",
        loading: "Loading your bookings...",
        noBookings: "No bookings match this filter.",
        filterAll: "All",
        filterUpcoming: "Upcoming",
        filterPast: "Completed",
        filterCancelled: "Failed & Cancelled",
        ref: "Ref",
        totalPaid: "Amount",
        callHost: "Contact Property",
        downloadReceipt: "Voucher PDF",
        statusConfirmed: "Confirmed",
        statusPending: "Pending",
        statusCancelled: "Cancelled",
        rooms: "Rooms",
    }
};

export default function CustomerBookingsPage() {
    const params = useParams();
    const locale = (params?.locale as "fr" | "en") || "fr";
    const t = translations[locale];

    const [activeFilter, setActiveFilter] = useState<"all" | "upcoming" | "past" | "cancelled">("all");

    // Fetch des réservations
    const { data: bookings = [], isLoading } = useQuery<Booking[]>({
        queryKey: ["customer-bookings-list"],
        queryFn: async () => {
            const response = await api.get("/customer/bookings");
            return response.data.data;
        },
    });

    const filteredBookings = bookings.filter((booking) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkInDate = new Date(booking.check_in);

        // Filtre Annulé ou Échoué
        if (activeFilter === "cancelled") {
            return ["FAILED", "CANCELLED"].includes(booking.status);
        }
        if (["FAILED", "CANCELLED"].includes(booking.status)) return false;

        // Filtre À Venir (Statut validé et date future ou égale à aujourd'hui)
        if (activeFilter === "upcoming") {
            return checkInDate >= today && ["CONFIRMED", "TICKETED"].includes(booking.status);
        }
        // Filtre Passé
        if (activeFilter === "past") {
            return checkInDate < today && ["CONFIRMED", "TICKETED"].includes(booking.status);
        }

        return true;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                >
                    <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-zinc-600">{t.loading}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
            <main className="max-w-6xl mx-auto py-8 px-6 space-y-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">
                        {t.title}
                    </h1>
                    <p className="text-zinc-500 font-medium">
                        {t.subtitle}
                    </p>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm"
                >
                    <Button
                        variant={activeFilter === "all" ? "default" : "ghost"}
                        className={`rounded-xl text-sm font-bold px-5 transition-all ${
                            activeFilter === "all"
                                ? "bg-zinc-900 text-white shadow-lg"
                                : "text-zinc-600 hover:bg-zinc-100"
                        }`}
                        onClick={() => setActiveFilter("all")}
                    >
                        <SlidersHorizontal className="h-4 w-4 mr-2" /> {t.filterAll}
                    </Button>
                    <Button
                        variant={activeFilter === "upcoming" ? "default" : "ghost"}
                        className={`rounded-xl text-sm font-bold px-5 transition-all ${
                            activeFilter === "upcoming"
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                                : "text-zinc-600 hover:bg-zinc-100"
                        }`}
                        onClick={() => setActiveFilter("upcoming")}
                    >
                        <PlaneTakeoff className="h-4 w-4 mr-2" /> {t.filterUpcoming}
                    </Button>
                    <Button
                        variant={activeFilter === "past" ? "default" : "ghost"}
                        className={`rounded-xl text-sm font-bold px-5 transition-all ${
                            activeFilter === "past"
                                ? "bg-zinc-900 text-white shadow-lg"
                                : "text-zinc-600 hover:bg-zinc-100"
                        }`}
                        onClick={() => setActiveFilter("past")}
                    >
                        <History className="h-4 w-4 mr-2" /> {t.filterPast}
                    </Button>
                    <Button
                        variant={activeFilter === "cancelled" ? "default" : "ghost"}
                        className={`rounded-xl text-sm font-bold px-5 transition-all ${
                            activeFilter === "cancelled"
                                ? "bg-red-50 text-red-700 border border-red-200 shadow-lg"
                                : "text-zinc-600 hover:bg-zinc-100"
                        }`}
                        onClick={() => setActiveFilter("cancelled")}
                    >
                        <XCircle className="h-4 w-4 mr-2" /> {t.filterCancelled}
                    </Button>
                </motion.div>

                {/* Bookings List */}
                <AnimatePresence mode="wait">
                    {filteredBookings.length > 0 ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            {filteredBookings.map((booking, index) => (
                                <motion.div
                                    key={booking.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="rounded-3xl border-zinc-100 shadow-xl hover:shadow-2xl transition-all overflow-hidden bg-white group">
                                        {booking.property_image && (
                                            <div className="h-48 bg-zinc-200 overflow-hidden relative">
                                                <img
                                                    src={booking.property_image}
                                                    alt={booking.property_name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-zinc-900 shadow-sm">
                                                    {t.ref}: {booking.reference || "En attente"}
                                                </div>
                                                {booking.rating && (
                                                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-emerald-500 text-white px-3 py-1 rounded-full shadow-sm">
                                                        <Star className="h-3 w-3 fill-white" />
                                                        <span className="font-bold text-sm">{booking.rating}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <CardContent className="p-6 grid gap-6 md:grid-cols-4 md:items-center">

                                            {/* Établissement */}
                                            <div className="md:col-span-2 space-y-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <StatusBadge status={booking.status} t={t} />
                                                </div>
                                                <h3 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                                                    {booking.property_name}
                                                </h3>
                                                {booking.property_address && (
                                                    <p className="text-sm text-zinc-500 flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-emerald-600" />
                                                        {booking.property_address}
                                                    </p>
                                                )}
                                                {booking.room_names && (
                                                    <p className="text-xs text-zinc-400 flex items-center gap-1">
                                                        <FileText className="h-3 w-3" />
                                                        {t.rooms}: {booking.room_names}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Dates */}
                                            <div className="space-y-3 border-l border-zinc-100 pl-0 md:pl-6">
                                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wide">
                                                    <Calendar className="h-4 w-4 text-emerald-600" />
                                                    <span>Séjour</span>
                                                </div>
                                                <div className="text-sm font-bold text-zinc-900 flex flex-wrap items-center gap-2">
                                                    <span>{formatDate(booking.check_in)}</span>
                                                    <ArrowRight className="h-4 w-4 text-zinc-400" />
                                                    <span>{formatDate(booking.check_out)}</span>
                                                </div>
                                            </div>

                                            {/* Prix et Actions */}
                                            <div className="flex flex-col items-start md:items-end justify-between gap-4 pt-4 border-t md:border-t-0 md:border-l border-zinc-100">
                                                <div className="md:text-right">
                                                    <p className="text-xs font-bold text-zinc-400 uppercase">{t.totalPaid}</p>
                                                    <p className="text-2xl font-extrabold text-emerald-600">
                                                        {booking.total_price.toLocaleString()} {booking.currency || "FCFA"}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {booking.host_phone && ["CONFIRMED", "TICKETED"].includes(booking.status) && (
                                                        <a
                                                            href={`tel:${booking.host_phone}`}
                                                            className="inline-flex items-center justify-center p-3 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                            title={t.callHost}
                                                        >
                                                            <Phone className="h-5 w-5" />
                                                        </a>
                                                    )}
                                                    {["CONFIRMED", "TICKETED"].includes(booking.status) && (
                                                        <Button
                                                            variant="outline"
                                                            className="rounded-xl font-bold text-sm border-zinc-200 text-zinc-700 hover:bg-zinc-50 gap-2 shadow-sm"
                                                            title={t.downloadReceipt}
                                                        >
                                                            <Receipt className="h-4 w-4" />
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200"
                        >
                            <div className="bg-zinc-100 w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <Calendar className="h-10 w-10 text-zinc-400" />
                            </div>
                            <p className="text-sm font-medium text-zinc-500 mb-2">{t.noBookings}</p>
                            <p className="text-xs text-zinc-400">Changez le filtre ou découvrez nos hébergements !</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function StatusBadge({ status, t }: { status: Booking["status"]; t: any }) {
    switch (status) {
        case "CONFIRMED":
        case "TICKETED":
            return (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 shadow-sm">
                    <CheckCircle2 className="h-4 w-4" /> {t.statusConfirmed}
                </span>
            );
        case "PENDING_PAYMENT":
        case "WAITING_PIN":
        case "PROCESSING":
            return (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200 shadow-sm">
                    <Clock className="h-4 w-4" /> {t.statusPending}
                </span>
            );
        case "FAILED":
        case "CANCELLED":
        default:
            return (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 shadow-sm">
                    <XCircle className="h-4 w-4" /> {t.statusCancelled}
                </span>
            );
    }
}