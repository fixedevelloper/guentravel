"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { useParams } from "next/navigation";
import {
    SlidersHorizontal,
    ArrowRight,
    PlaneTakeoff,
    History,
    XCircle,
    CheckCircle2,
    Clock,
    Download,
    Ticket,
    Plane,
    User2,
    Briefcase,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/date";

// --- TYPAGES STRUCTURES ---
interface Segment {
    id: string;
    airline_name: string;
    airline_code: string;
    flight_number: string;
    booking_class: any; // Changé en any pour tolérer un objet {cabin, checked} ou string
    departure_airport: string;
    departure_city: string;
    departure_time: string;
    arrival_airport: string;
    arrival_city: string;
    arrival_time: string;
    duration: string;
}

interface Passenger {
    first_name: string;
    last_name: string;
    passenger_type: string;
    ticket_number?: string;
}

interface FlightBooking {
    id: string;
    pnr: string;
    departure_city: string;
    arrival_city: string;
    departure_date: string;
    total_price: number;
    status: "pending" | "confirmed" | "cancelled";
    segments: Segment[];
    passengers: Passenger[];
    baggage_allowance?: any; // Idem ici
}

const translations = {
    fr: {
        title: "Mes Réservations Vols",
        subtitle: "Gérez vos e-billets, PNR et l'état de vos vols en temps réel.",
        loading: "Chargement de vos vols...",
        noBookings: "Aucun vol ne correspond à ce filtre.",
        filterAll: "Tous les vols",
        filterUpcoming: "À venir",
        filterPast: "Historique",
        filterCancelled: "Annulés",
        pnrRef: "Code PNR",
        totalPrice: "Montant total",
        downloadTicket: "E-Billet PDF",
        statusConfirmed: "Émis (Billet)",
        statusPending: "En attente (Hold)",
        statusCancelled: "Annulé",
        passengers: "Voyageurs",
        baggage: "Franchise Bagages",
        hideDetails: "Masquer les détails",
        showDetails: "Voir les détails du vol",
        layover: "Escale",
        cabinBaggage: "Cabine",
        checkedBaggage: "En soute",
    },
    en: {
        title: "My Flight Bookings",
        subtitle: "Manage your e-tickets, PNR codes, and live flight statuses.",
        loading: "Loading your flights...",
        noBookings: "No flights match this filter.",
        filterAll: "All Flights",
        filterUpcoming: "Upcoming",
        filterPast: "Past Flights",
        filterCancelled: "Cancelled",
        pnrRef: "PNR Code",
        totalPrice: "Total amount",
        downloadTicket: "E-Ticket PDF",
        statusConfirmed: "Ticketed",
        statusPending: "On Hold",
        statusCancelled: "Cancelled",
        passengers: "Passengers",
        baggage: "Baggage Allowance",
        hideDetails: "Hide details",
        showDetails: "Show flight details",
        layover: "Layover",
        cabinBaggage: "Cabin",
        checkedBaggage: "Checked",
    }
};

export default function CustomerFlightBookingsPage() {
    const params = useParams();
    const locale = (params?.locale as "fr" | "en") || "fr";
    const t = translations[locale];

    const [activeFilter, setActiveFilter] = useState<"all" | "upcoming" | "past" | "cancelled">("all");
    const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

    const { data: bookings = [], isLoading } = useQuery<FlightBooking[]>({
        queryKey: ["customer-flights-list"],
        queryFn: async () => {
            const response = await api.get("/customer/flights/bookings");
            return response.data.data;
        },
    });

    const toggleExpand = (id: string) => {
        setExpandedBooking(expandedBooking === id ? null : id);
    };

    const filteredBookings = bookings.filter((booking) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const flightDate = new Date(booking.departure_date);

        if (activeFilter === "cancelled") return booking.status === "cancelled";
        if (booking.status === "cancelled") return false;

        if (activeFilter === "upcoming") return flightDate >= today && booking.status === "confirmed";
        if (activeFilter === "past") return flightDate < today && booking.status === "confirmed";

        return true;
    });

    // Fonction utilitaire pour rendre de façon sécurisée le booking_class ou brand_value s'il s'agit d'un objet
    const renderBookingClass = (bookingClass: any) => {
        if (!bookingClass) return "Économique";
        if (typeof bookingClass === "object") {
            return bookingClass.cabin || bookingClass.checked || "Économique";
        }
        return String(bookingClass);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-[#15a4e6] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-zinc-600">{t.loading}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
            <main className="max-w-6xl mx-auto py-8 px-6 space-y-8">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
                        <Plane className="h-9 w-9 text-[#15a4e6]" />
                        {t.title}
                    </h1>
                    <p className="text-zinc-500 font-medium">{t.subtitle}</p>
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
                        className={`rounded-xl text-sm font-bold px-5 transition-all ${activeFilter === "all" ? "bg-zinc-900 text-white shadow-lg" : "text-zinc-600 hover:bg-zinc-100"}`}
                        onClick={() => setActiveFilter("all")}
                    >
                        <SlidersHorizontal className="h-4 w-4 mr-2" /> {t.filterAll}
                    </Button>
                    <Button
                        variant={activeFilter === "upcoming" ? "default" : "ghost"}
                        className={`rounded-xl text-sm font-bold px-5 transition-all ${activeFilter === "upcoming" ? "bg-[#15a4e6] text-white shadow-lg shadow-[#15a4e6]/30" : "text-zinc-600 hover:bg-zinc-100"}`}
                        onClick={() => setActiveFilter("upcoming")}
                    >
                        <PlaneTakeoff className="h-4 w-4 mr-2" /> {t.filterUpcoming}
                    </Button>
                    <Button
                        variant={activeFilter === "past" ? "default" : "ghost"}
                        className={`rounded-xl text-sm font-bold px-5 transition-all ${activeFilter === "past" ? "bg-zinc-900 text-white shadow-lg" : "text-zinc-600 hover:bg-zinc-100"}`}
                        onClick={() => setActiveFilter("past")}
                    >
                        <History className="h-4 w-4 mr-2" /> {t.filterPast}
                    </Button>
                    <Button
                        variant={activeFilter === "cancelled" ? "default" : "ghost"}
                        className={`rounded-xl text-sm font-bold px-5 transition-all ${activeFilter === "cancelled" ? "bg-red-50 text-red-700 border border-red-200 shadow-lg" : "text-zinc-600 hover:bg-zinc-100"}`}
                        onClick={() => setActiveFilter("cancelled")}
                    >
                        <XCircle className="h-4 w-4 mr-2" /> {t.filterCancelled}
                    </Button>
                </motion.div>

                {/* Flights List */}
                <AnimatePresence mode="wait">
                    {filteredBookings.length > 0 ? (
                        <div className="space-y-4">
                            {filteredBookings.map((booking, index) => {
                                const isExpanded = expandedBooking === booking.id;
                                const firstSegment = booking.segments?.[0];
                                const lastSegment = booking.segments?.[booking.segments.length - 1];

                                return (
                                    <motion.div key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                                        <Card className="rounded-3xl border-zinc-100 shadow-xl overflow-hidden bg-white hover:border-zinc-200 transition-all">
                                            <CardContent className="p-0">

                                                {/* Header principal du ticket */}
                                                <div className="p-6 grid gap-6 md:grid-cols-4 md:items-center border-b border-zinc-50">
                                                    <div className="space-y-2 md:col-span-1">
                                                        <div className="flex items-center gap-2">
                                                            <StatusBadge status={booking.status} t={t} />
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xl font-black text-zinc-900">
                                                            <span>{booking.departure_city}</span>
                                                            <ArrowRight className="h-4 w-4 text-[#15a4e6]" />
                                                            <span>{booking.arrival_city}</span>
                                                        </div>
                                                        <p className="text-xs font-mono font-bold bg-zinc-100 text-zinc-700 px-2 py-1 rounded-md w-fit">
                                                            {t.pnrRef}: <span className="text-[#15a4e6] font-extrabold">{booking.pnr}</span>
                                                        </p>
                                                    </div>

                                                    <div className="md:col-span-2 flex items-center justify-between bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100">
                                                        {firstSegment ? (
                                                            <div>
                                                                <p className="text-xs font-bold text-zinc-400 uppercase">{firstSegment.departure_airport}</p>
                                                                <p className="text-base font-black text-zinc-800">
                                                                    {new Date(firstSegment.departure_time).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                                <p className="text-[10px] font-medium text-zinc-400">{formatDate(firstSegment.departure_time)}</p>
                                                            </div>
                                                        ) : <div className="text-sm font-medium text-zinc-400">--:--</div>}

                                                        <div className="flex flex-col items-center flex-grow px-4 relative">
                                                            <span className="text-[10px] font-bold text-[#15a4e6] bg-white px-2 border rounded-full shadow-sm z-10">
                                                                {(!booking.segments || booking.segments.length <= 1) ? "Direct" : `${booking.segments.length - 1} ${t.layover}`}
                                                            </span>
                                                            <div className="w-full h-[2px] bg-dashed bg-zinc-300 absolute top-1/2 transform -translate-y-1/2"></div>
                                                        </div>

                                                        {lastSegment ? (
                                                            <div className="text-right">
                                                                <p className="text-xs font-bold text-zinc-400 uppercase">{lastSegment.arrival_airport}</p>
                                                                <p className="text-base font-black text-zinc-800">
                                                                    {new Date(lastSegment.arrival_time).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                                <p className="text-[10px] font-medium text-zinc-400">{formatDate(lastSegment.arrival_time)}</p>
                                                            </div>
                                                        ) : <div className="text-sm font-medium text-zinc-400 text-right">--:--</div>}
                                                    </div>

                                                    <div className="flex flex-col items-start md:items-end gap-3 md:pl-6 border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0">
                                                        <div className="md:text-right">
                                                            <p className="text-xs font-bold text-zinc-400 uppercase">{t.totalPrice}</p>
                                                            <p className="text-2xl font-black text-zinc-900">{booking.total_price.toLocaleString()} FCFA</p>
                                                        </div>
                                                        <div className="flex gap-2 w-full justify-between md:justify-end">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => toggleExpand(booking.id)}
                                                                className="rounded-xl font-bold text-xs gap-1 border-zinc-200 text-zinc-600 hover:bg-zinc-50 shadow-sm"
                                                            >
                                                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                                {isExpanded ? t.hideDetails : t.showDetails}
                                                            </Button>
                                                            {booking.status === "confirmed" && (
                                                                <Button size="sm" className="rounded-xl font-bold text-xs bg-[#15a4e6] text-white hover:bg-[#15a4e6]/90 gap-1.5 shadow-md shadow-[#15a4e6]/20">
                                                                    <Download className="h-3.5 w-3.5" /> {t.downloadTicket}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Détails étendus */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="bg-zinc-50/70 overflow-hidden border-t border-zinc-100">
                                                            <div className="p-6 space-y-6">

                                                                {/* Tronçons de vols réels */}
                                                                <div className="space-y-4">
                                                                    {booking.segments?.map((segment, sIndex) => (
                                                                        <div key={segment.id || sIndex} className="relative flex items-start gap-4">
                                                                            <div className="flex flex-col items-center">
                                                                                <div className="bg-[#15a4e6]/10 p-2.5 rounded-xl text-[#15a4e6]">
                                                                                    <Plane className="h-4 w-4" />
                                                                                </div>
                                                                                {sIndex < booking.segments.length - 1 && (
                                                                                    <div className="w-[2px] h-20 bg-gradient-to-b from-[#15a4e6] to-zinc-200 mt-2" />
                                                                                )}
                                                                            </div>
                                                                            <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                                                                <div>
                                                                                    <p className="font-extrabold text-zinc-900">{segment.airline_name}</p>
                                                                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                                                                        Vol {segment.airline_code} {segment.flight_number} • {renderBookingClass(segment.booking_class)}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="text-sm">
                                                                                    <span className="font-bold text-zinc-700">{segment.departure_city} ({segment.departure_airport})</span>
                                                                                    <p className="text-xs text-zinc-500 font-medium">{formatDate(segment.departure_time)} à {new Date(segment.departure_time).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</p>
                                                                                </div>
                                                                                <div className="text-sm">
                                                                                    <span className="font-bold text-zinc-700">{segment.arrival_city} ({segment.arrival_airport})</span>
                                                                                    <p className="text-xs text-zinc-500 font-medium">{formatDate(segment.arrival_time)} à {new Date(segment.arrival_time).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* Passagers & Bagages */}
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100">

                                                                    {/* Passagers */}
                                                                    <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm space-y-3">
                                                                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                                                            <User2 className="h-4 w-4 text-[#15a4e6]" /> {t.passengers}
                                                                        </h4>
                                                                        <div className="divide-y divide-zinc-50">
                                                                            {booking.passengers?.map((passenger, pIndex) => (
                                                                                <div key={pIndex} className="py-2 flex items-center justify-between text-sm">
                                                                                    <span className="font-extrabold text-zinc-800">
                                                                                        {passenger.last_name?.toUpperCase()} / {passenger.first_name}
                                                                                    </span>
                                                                                    {passenger.ticket_number && (
                                                                                        <span className="font-mono text-xs text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">
                                                                                            No: {passenger.ticket_number}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {/* Franchise bagages - PROTECTION CONTRE OBJET ICI */}
                                                                    <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between">
                                                                        <div className="space-y-2">
                                                                            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                                                                <Briefcase className="h-4 w-4 text-[#15a4e6]" /> {t.baggage}
                                                                            </h4>
                                                                            <div className="text-sm font-extrabold text-zinc-800 space-y-1">
                                                                                {booking.baggage_allowance && typeof booking.baggage_allowance === "object" ? (
                                                                                    <div className="flex flex-col gap-1 text-xs text-zinc-700">
                                                                                        {booking.baggage_allowance.checked && (
                                                                                            <div>• {t.checkedBaggage} : <span className="font-black text-zinc-900">{booking.baggage_allowance.checked}</span></div>
                                                                                        )}
                                                                                        {booking.baggage_allowance.cabin && (
                                                                                            <div>• {t.cabinBaggage} : <span className="font-black text-zinc-900">{booking.baggage_allowance.cabin}</span></div>
                                                                                        )}
                                                                                    </div>
                                                                                ) : (
                                                                                    <p>{booking.baggage_allowance || "2 PC (2x23KG)"}</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="pt-4 text-[11px] text-zinc-400 font-medium">
                                                                            * Enregistrement ouvert 3 heures avant le départ. Munissez-vous de vos passeports.
                                                                        </div>
                                                                    </div>

                                                                </div>

                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200">
                            <div className="bg-zinc-100 w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <Ticket className="h-10 w-10 text-zinc-400" />
                            </div>
                            <p className="text-sm font-medium text-zinc-500 mb-2">{t.noBookings}</p>
                            <p className="text-xs text-zinc-400">Préparez votre prochain voyage avec nos offres exclusives.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function StatusBadge({ status, t }: { status: FlightBooking["status"]; t: any }) {
    switch (status) {
        case "confirmed":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {t.statusConfirmed}
                </span>
            );
        case "pending":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200 shadow-sm">
                    <Clock className="h-3.5 w-3.5" /> {t.statusPending}
                </span>
            );
        case "cancelled":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 shadow-sm">
                    <XCircle className="h-3.5 w-3.5" /> {t.statusCancelled}
                </span>
            );
    }
}