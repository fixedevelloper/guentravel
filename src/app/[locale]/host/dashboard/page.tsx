"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
    Home,
    DollarSign,
    CalendarCheck,
    TrendingUp,
    Plus,
    ArrowUpRight,
    Wallet,
    Loader2,
    AlertCircle,
    Building2,
    Clock,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

// --- DICTIONNAIRE MULTI-LANGUE ---
const translations = {
    fr: {
        welcome: "Content de vous revoir,",
        subtitle: "Voici un aperçu des performances de vos hébergements aujourd'hui.",
        quickActions: "Actions rapides",
        addProperty: "Ajouter un logement",
        requestPayout: "Demander un retrait",
        statsEarnings: "Revenus totaux",
        statsBookings: "Réservations",
        statsOccupancy: "Taux d'occupation",
        statsProperties: "Logements actifs",
        chartEarningsTitle: "Évolution des revenus",
        chartOccupancyTitle: "Taux d'occupation mensuel",
        recentBookings: "Réservations récentes",
        seeAllBookings: "Voir tout",
        noBookings: "Aucune réservation enregistrée pour le moment.",
        thGuest: "Voyageur",
        thProperty: "Hébergement",
        thDates: "Dates",
        thAmount: "Montant",
        thStatus: "Statut",
        status_pending: "En attente",
        status_confirmed: "Confirmé",
        status_cancelled: "Annulé",
        errorLoad: "Impossible de charger les données du tableau de bord."
    },
    en: {
        welcome: "Welcome back,",
        subtitle: "Here is what's happening with your properties today.",
        quickActions: "Quick Actions",
        addProperty: "Add a property",
        requestPayout: "Request payout",
        statsEarnings: "Total Earnings",
        statsBookings: "Total Bookings",
        statsOccupancy: "Occupancy Rate",
        statsProperties: "Active Properties",
        chartEarningsTitle: "Earnings Overview",
        chartOccupancyTitle: "Monthly Occupancy Rate",
        recentBookings: "Recent Bookings",
        seeAllBookings: "View all",
        noBookings: "No bookings recorded yet.",
        thGuest: "Guest",
        thProperty: "Property",
        thDates: "Dates",
        thAmount: "Amount",
        thStatus: "Status",
        status_pending: "Pending",
        status_confirmed: "Confirmed",
        status_cancelled: "Cancelled",
        errorLoad: "Failed to load dashboard data."
    }
};

export default function HostDashboardPage() {
    const params = useParams();
    const locale = (params?.locale as "fr" | "en") || "fr";
    const t = translations[locale];

    // --- RÉCUPÉRATION DES DONNÉES DEPUIS LARAVEL ---
    const { data: dashboardData, isLoading, isError } = useQuery({
        queryKey: ["hostDashboardMetrics"],
        queryFn: async () => {
            const response = await api.get("/host/dashboard-metrics");
            return response.data;
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-[#1d9e4b]" />
                <p className="text-sm font-medium text-zinc-500">Chargement de votre espace...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
                <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                <h3 className="text-base font-bold text-zinc-900">{t.errorLoad}</h3>
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 rounded-xl text-xs">
                    Réessayer
                </Button>
            </div>
        );
    }

    // Extraction des données de l'API (avec fallbacks pour éviter les crashs)
    const metrics = dashboardData?.metrics || { total_earnings: 0, total_bookings: 0, occupancy_rate: 0, active_properties: 0 };
    const chartData = dashboardData?.charts?.earnings || [];
    const occupancyData = dashboardData?.charts?.occupancy || [];
    const recentBookings = dashboardData?.recent_bookings || [];
    const hostName = dashboardData?.host_name || "Partenaire";

    // Formatage des devises (XAF / EUR selon votre business model Afrique)
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
            style: "currency",
            currency: "XAF",
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">

            {/* EN-TÊTE BIENVENUE & ACTIONS RAPIDES */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
                        {t.welcome} {hostName} 👋
                    </h1>
                    <p className="text-sm font-medium text-zinc-500 max-w-xl">
                        {t.subtitle}
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Button asChild variant="outline" className="rounded-xl text-xs font-bold h-10 border-zinc-200 shadow-sm gap-2">
                        <Link href={`/${locale}/host/payouts`}>
                            <Wallet className="h-4 w-4 text-zinc-500" />
                            {t.requestPayout}
                        </Link>
                    </Button>
                    <Button asChild className="bg-[#1d9e4b] hover:bg-[#167c3a] text-white rounded-xl text-xs font-bold h-10 shadow-sm gap-1.5">
                        <Link href={`/host/properties/create`}>
                            <Plus className="h-4 w-4" />
                            {t.addProperty}
                        </Link>
                    </Button>
                </div>
            </div>

            {/* GRILLE DES KPI / STATISTIQUES */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">

                {/* Revenus */}
                <Card className="rounded-2xl border-zinc-200/80 shadow-sm bg-white">
                    <CardContent className="p-4 md:p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.statsEarnings}</p>
                            <h3 className="text-lg md:text-2xl font-black text-zinc-900 tracking-tight">
                                {formatCurrency(metrics.total_earnings)}
                            </h3>
                        </div>
                        <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-[#1d9e4b]">
                            <DollarSign className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                    </CardContent>
                </Card>

                {/* Réservations */}
                <Card className="rounded-2xl border-zinc-200/80 shadow-sm bg-white">
                    <CardContent className="p-4 md:p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.statsBookings}</p>
                            <h3 className="text-lg md:text-2xl font-black text-zinc-900 tracking-tight">
                                {metrics.total_bookings}
                            </h3>
                        </div>
                        <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-[#f39c28]">
                            <CalendarCheck className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                    </CardContent>
                </Card>

                {/* Taux d'occupation */}
                <Card className="rounded-2xl border-zinc-200/80 shadow-sm bg-white">
                    <CardContent className="p-4 md:p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.statsOccupancy}</p>
                            <h3 className="text-lg md:text-2xl font-black text-zinc-900 tracking-tight">
                                {metrics.occupancy_rate}%
                            </h3>
                        </div>
                        <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-blue-600">
                            <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                    </CardContent>
                </Card>

                {/* Logements actifs */}
                <Card className="rounded-2xl border-zinc-200/80 shadow-sm bg-white">
                    <CardContent className="p-4 md:p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.statsProperties}</p>
                            <h3 className="text-lg md:text-2xl font-black text-zinc-900 tracking-tight">
                                {metrics.active_properties}
                            </h3>
                        </div>
                        <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-purple-600">
                            <Building2 className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* SECTIONS GRAPHIQUES */}
            <div className="grid gap-6 lg:grid-cols-12">

                {/* Courbe des revenus */}
                <Card className="lg:col-span-8 rounded-2xl border-zinc-200/80 shadow-sm bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-zinc-800">{t.chartEarningsTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="h-72 pl-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1d9e4b" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#1d9e4b" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                                <Tooltip formatter={(value: any) => [formatCurrency(value), ""]} />
                                <Area type="monotone" dataKey="amount" stroke="#1d9e4b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEarnings)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Histogramme taux d'occupation */}
                <Card className="lg:col-span-4 rounded-2xl border-zinc-200/80 shadow-sm bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-zinc-800">{t.chartOccupancyTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="h-72 pl-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={occupancyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                                <Tooltip formatter={(value) => [`${value}%`, ""]} />
                                <Bar dataKey="rate" fill="#f39c28" radius={[6, 6, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* LISTE DES RÉSERVATIONS RÉCENTES */}
            <Card className="rounded-2xl border-zinc-200/80 shadow-sm bg-white overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 p-4 md:p-6">
                    <div>
                        <CardTitle className="text-base font-black text-zinc-900 tracking-tight">{t.recentBookings}</CardTitle>
                    </div>
                    <Button asChild variant="ghost" className="text-xs font-bold text-[#1d9e4b] hover:text-[#167c3a] hover:bg-zinc-50 rounded-xl h-8 px-3 gap-1">
                        <Link href={`/${locale}/host/bookings`}>
                            {t.seeAllBookings}
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    {recentBookings.length === 0 ? (
                        <div className="p-8 text-center text-sm font-medium text-zinc-400">
                            {t.noBookings}
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                            <tr className="bg-zinc-50/70 border-b border-zinc-100 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                <th className="py-3 px-6">{t.thGuest}</th>
                                <th className="py-3 px-6">{t.thProperty}</th>
                                <th className="py-3 px-6">{t.thDates}</th>
                                <th className="py-3 px-6">{t.thAmount}</th>
                                <th className="py-3 px-6 text-center">{t.thStatus}</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-sm font-medium text-zinc-700">
                            {recentBookings.map((booking: any) => (
                                <tr key={booking.id} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="py-3.5 px-6 font-bold text-zinc-900">{booking.guest_name}</td>
                                    <td className="py-3.5 px-6 text-zinc-500 max-w-[200px] truncate">
                                        {booking.property_name?.[locale] || booking.property_name?.fr || "Hébergement"}
                                    </td>
                                    <td className="py-3.5 px-6 text-xs text-zinc-500">{booking.dates}</td>
                                    <td className="py-3.5 px-6 font-bold text-zinc-900">{formatCurrency(booking.total_price)}</td>
                                    <td className="py-3.5 px-6">
                                        <div className="flex justify-center">
                                            {booking.status === "confirmed" && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-full">
                                                        <CheckCircle2 className="h-3 w-3" /> {t.status_confirmed}
                                                    </span>
                                            )}
                                            {booking.status === "pending" && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
                                                        <Clock className="h-3 w-3" /> {t.status_pending}
                                                    </span>
                                            )}
                                            {booking.status === "cancelled" && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-full">
                                                        <XCircle className="h-3 w-3" /> {t.status_cancelled}
                                                    </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}