"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { useAuthStore } from "@/core/store/useAuthStore";
import {
    Calendar,
    MapPin,
    Receipt,
    User,
    ChevronRight,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Compass,
    Phone,
    Star,
    Heart,
    FileText,
    Download,
    Mail,
    Shield,
    TrendingUp,
    CalendarDays,
    Wallet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Booking {
    id: string;
    reference: string;
    property_name: string;
    property_address: string;
    room_names: string;
    check_in: string;
    check_out: string;
    total_price: number;
    status: "pending" | "confirmed" | "cancelled";
    host_phone?: string;
    property_image?: string;
    rating?: number;
}

interface CustomerDashboardData {
    stats: {
        total_bookings: number;
        completed_stays: number;
        amount_spent: number;
    };
    upcoming_bookings: Booking[];
    past_bookings: Booking[];
}

export default function CustomerDashboardPage() {
    const user = useAuthStore((state) => state.user);
    const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

    const { data: dashboard, isLoading } = useQuery<CustomerDashboardData>({
        queryKey: ["customer-dashboard"],
        queryFn: async () => (await api.get("/customer/dashboard-data")).data.data,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                >
                    <div className="w-16 h-16 border-4 border-[#15a4e6] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-zinc-600">Préparation de vos voyages...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">



            <main className="max-w-6xl mx-auto py-8 px-6 space-y-8">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-zinc-100 rounded-3xl p-8 shadow-xl"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#15a4e6] to-[#167c3a] flex items-center justify-center text-white font-extrabold text-3xl shadow-lg shadow-[#15a4e6]/30">
                                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                            </div>
                            <div>
                                <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                                    Bonjour, {user?.name}! 👋
                                </h2>
                                <p className="text-zinc-500 mt-2 font-medium">
                                    Gère tes réservations, télécharge tes reçus et prépare tes séjours.
                                </p>
                                <div className="flex items-center gap-2 mt-3">
                                    <Mail className="h-4 w-4 text-[#15a4e6]" />
                                    <span className="text-sm text-zinc-600 font-semibold">{user?.email}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-[#15a4e6]/10 px-5 py-3 rounded-full">
                            <Shield className="h-5 w-5 text-[#15a4e6]" />
                            <span className="font-bold text-[#15a4e6]">Compte vérifié</span>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-blue-100 p-4 rounded-2xl">
                                <CalendarDays className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Réservations</p>
                                <p className="text-3xl font-extrabold text-zinc-900 mt-1">{dashboard?.stats?.total_bookings || 0}</p>
                            </div>
                        </div>
                        <div className="bg-blue-50 px-4 py-2 rounded-xl">
                            <p className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> Total toutes réservations
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-green-100 p-4 rounded-2xl">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Séjours effectués</p>
                                <p className="text-3xl font-extrabold text-zinc-900 mt-1">{dashboard?.stats?.completed_stays || 0}</p>
                            </div>
                        </div>
                        <div className="bg-green-50 px-4 py-2 rounded-xl">
                            <p className="text-xs text-green-600 font-semibold">Voyages complétés</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-[#15a4e6]/10 p-4 rounded-2xl">
                                <Wallet className="h-6 w-6 text-[#15a4e6]" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total investi</p>
                                <p className="text-3xl font-extrabold text-[#15a4e6] mt-1">{(dashboard?.stats?.amount_spent || 0).toLocaleString()}</p>
                                <p className="text-xs text-zinc-400 font-semibold mt-1">FCFA</p>
                            </div>
                        </div>
                        <div className="bg-[#15a4e6]/10 px-4 py-2 rounded-xl">
                            <p className="text-xs text-[#15a4e6] font-semibold flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> Dépenses totales
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => setActiveTab("upcoming")}
                            className={`pb-3 px-6 font-bold text-sm border-b-2 transition-all ${
                                activeTab === "upcoming"
                                    ? "border-[#15a4e6] text-[#15a4e6]"
                                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                            }`}
                        >
                            Prochains séjours
                        </button>
                        <button
                            onClick={() => setActiveTab("past")}
                            className={`pb-3 px-6 font-bold text-sm border-b-2 transition-all ${
                                activeTab === "past"
                                    ? "border-[#15a4e6] text-[#15a4e6]"
                                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                            }`}
                        >
                            Historique
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "upcoming" ? (
                            <motion.div
                                key="upcoming"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {dashboard?.upcoming_bookings && dashboard.upcoming_bookings.length > 0 ? (
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {dashboard.upcoming_bookings.map((booking, index) => (
                                            <motion.div
                                                key={booking.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <Card className="rounded-3xl border-zinc-100 shadow-xl hover:shadow-2xl transition-all overflow-hidden bg-white group">
                                                    {booking.property_image && (
                                                        <div className="h-48 bg-zinc-200 overflow-hidden relative">
                                                            <img
                                                                src={booking.property_image}
                                                                alt={booking.property_name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                            <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-zinc-900">
                                                                Réf: {booking.reference}
                                                            </div>
                                                            {booking.rating && (
                                                                <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#7bcd4f] text-white px-3 py-1 rounded-full">
                                                                    <Star className="h-3 w-3 fill-white" />
                                                                    <span className="font-bold text-sm">{booking.rating}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="p-6 space-y-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="text-xl font-extrabold text-zinc-900 mt-2">{booking.property_name}</h3>
                                                                <p className="text-sm text-zinc-500 mt-1">{booking.room_names}</p>
                                                            </div>
                                                            <BookingStatusBadge status={booking.status} />
                                                        </div>

                                                        <div className="space-y-3 text-sm font-medium text-zinc-600">
                                                            <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                                                                <MapPin className="h-5 w-5 text-[#15a4e6] shrink-0" />
                                                                <span className="truncate">{booking.property_address}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                                                                <Calendar className="h-5 w-5 text-[#15a4e6] shrink-0" />
                                                                <span className="flex items-center gap-2">
                                                                    {formatDate(booking.check_in)} au {formatDate(booking.check_out)}
</span>
                                                            </div>
                                                        </div>

                                                        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                                                            <div>
                                                                <p className="text-xs font-bold text-zinc-400 uppercase">Total payé</p>
                                                                <p className="text-2xl font-extrabold text-zinc-900">{booking.total_price?.toLocaleString()} FCFA</p>
                                                            </div>

                                                            {booking.host_phone && booking.status === "confirmed" && (
                                                                <a
                                                                    href={`tel:${booking.host_phone}`}
                                                                    className="inline-flex items-center gap-2 text-sm font-bold text-zinc-700 bg-zinc-50 border hover:bg-zinc-100 transition-all px-4 py-3 rounded-xl group-hover:bg-[#15a4e6] group-hover:text-white"
                                                                >
                                                                    <Phone className="h-4 w-4 text-[#15a4e6] group-hover:text-white" /> Appeler l'hôte
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-16 bg-white rounded-3xl border border-dashed border-zinc-200"
                                    >
                                        <div className="bg-zinc-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                                            <CalendarDays className="h-10 w-10 text-zinc-400" />
                                        </div>
                                        <p className="text-sm font-medium text-zinc-500 mb-2">Aucun voyage prévu pour le moment.</p>
                                        <p className="text-xs text-zinc-400 mb-6">Découvre nos hébergements et commence à voyager!</p>
                                        <Button asChild className="bg-[#15a4e6] hover:bg-[#167c3a] font-bold rounded-xl">
                                            <Link href="/">
                                                <Compass className="mr-2 h-4 w-4" /> Parcourir les hébergements
                                            </Link>
                                        </Button>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="past"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="rounded-3xl border-zinc-100 shadow-xl bg-white overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                            <tr className="bg-gradient-to-r from-zinc-50 to-zinc-100 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-500">
                                                <th className="p-5 pl-6">Établissement</th>
                                                <th className="p-4">Dates</th>
                                                <th className="p-4">Montant</th>
                                                <th className="p-4 pr-6 text-right">Documents</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100 text-sm font-medium text-zinc-600">
                                            {dashboard?.past_bookings && dashboard.past_bookings.length > 0 ? (
                                                dashboard.past_bookings.map((past, index) => (
                                                    <motion.tr
                                                        key={past.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="hover:bg-zinc-50/50 transition-all"
                                                    >
                                                        <td className="p-5 pl-6">
                                                            <p className="font-extrabold text-zinc-900">{past.property_name}</p>
                                                            <p className="text-xs text-zinc-400 mt-1">{past.room_names}</p>
                                                        </td>
                                                        <td className="p-4 text-zinc-500 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-[#15a4e6]" />
                                                                {formatDate(past.check_in)} au {formatDate(past.check_out)}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 font-extrabold text-zinc-900">
                                                            {past.total_price?.toLocaleString()} FCFA
                                                        </td>
                                                        <td className="p-4 pr-6 text-right">
                                                            <Button variant="ghost" className="text-sm font-bold text-zinc-500 hover:text-[#15a4e6] hover:bg-green-50/50 rounded-xl gap-2">
                                                                <Receipt className="h-4 w-4" /> Reçu PDF
                                                                <Download className="h-3 w-3" />
                                                            </Button>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-12">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <FileText className="h-8 w-8 text-zinc-300" />
                                                            <p className="text-sm text-zinc-400">Aucun historique de voyage disponible.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
}

function BookingStatusBadge({ status }: { status: Booking["status"] }) {
    switch (status) {
        case "confirmed":
            return (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 shadow-sm">
                    <CheckCircle2 className="h-4 w-4" /> Validé
                </span>
            );
        case "pending":
            return (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200 shadow-sm">
                    <Clock className="h-4 w-4" /> En attente
                </span>
            );
        case "cancelled":
            return (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 shadow-sm">
                    <XCircle className="h-4 w-4" /> Annulé
                </span>
            );
    }
}