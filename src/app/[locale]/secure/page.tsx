// app/[locale]/admin/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { DashboardData } from "@/types/admin";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
    TrendingUp, TrendingDown, BedDouble, Plane,
    Users, Clock, DollarSign, ArrowUpRight, Loader2,
} from "lucide-react";
import Link from "next/link";
import React from "react";

const STATUS_COLORS: Record<string, string> = {
    CONFIRMED: "#15a4e6",
    PENDING:   "#f59e0b",
    CANCELLED: "#ef4444",
    FAILED:    "#71717a",
};

export default function AdminDashboardPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["admin-dashboard"],
        queryFn: async (): Promise<DashboardData> => {
            const res = await api.get("/admin/dashboard");
            return res.data.data;
        },
        staleTime: 60 * 1000,
    });

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#15a4e6]" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-zinc-400 text-sm">
                Impossible de charger le tableau de bord.
            </div>
        );
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "XAF",
            minimumFractionDigits: 0,
        }).format(val);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

            <div>
                <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
                    Tableau de bord
                </h1>
                <p className="text-sm font-medium text-zinc-500">
                    Vue d'ensemble de l'activité vols et hôtels
                </p>
            </div>

            {/* KPIs avec répartition hôtels/vols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    icon={BedDouble}
                    label="Réservations totales"
                    value={data.kpis.total_bookings.value.toLocaleString()}
                    change={data.kpis.total_bookings.change}
                    breakdown={[
                        { label: "Hôtels", value: data.kpis.total_bookings.hotels  ?? 0, icon: BedDouble },
                        { label: "Vols",   value: data.kpis.total_bookings.flights ?? 0, icon: Plane },
                    ]}
                />
                <KpiCard
                    icon={DollarSign}
                    label="Revenu total"
                    value={formatCurrency(data.kpis.total_revenue.value)}
                    change={data.kpis.total_revenue.change}
                    breakdown={[
                        { label: "Hôtels", value: formatCurrency(data.kpis.total_revenue.hotels  ?? 0), icon: BedDouble },
                        { label: "Vols",   value: formatCurrency(data.kpis.total_revenue.flights ?? 0), icon: Plane },
                    ]}
                />
                <KpiCard
                    icon={Clock}
                    label="En attente"
                    value={data.kpis.pending_bookings.value.toLocaleString()}
                    accent="amber"
                    breakdown={[
                        { label: "Hôtels", value: data.kpis.pending_bookings.hotels  ?? 0, icon: BedDouble },
                        { label: "Vols",   value: data.kpis.pending_bookings.flights ?? 0, icon: Plane },
                    ]}
                />
                <KpiCard
                    icon={Users}
                    label="Utilisateurs"
                    value={data.kpis.total_users.value.toLocaleString()}
                    subLabel={`+${data.kpis.total_users.change} ce mois`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Graphique revenu hôtels vs vols */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 p-6">
                    <h3 className="font-bold text-zinc-900 mb-1">Revenu (30 derniers jours)</h3>
                    <p className="text-xs text-zinc-400 mb-4">Hôtels et vols confondus</p>

                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={data.revenue_chart}>
                            <defs>
                                <linearGradient id="hotelsGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#15a4e6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#15a4e6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="flightsGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                formatter={(value: any, name: any) => {
                                    const numericValue = typeof value === 'number' ? value : Number(value) || 0;
                                    return [
                                        `${numericValue.toLocaleString('fr-FR')} €`,
                                        name ? String(name) : "" // Sécurise le cas où name est undefined
                                    ];
                                }}
                                // On force l'argument du labelFormatter à accepter 'any' pour Recharts
                                labelFormatter={(label: any) => formatDate(label)}
                                contentStyle={{ borderRadius: 12, border: "1px solid #e4e4e7", fontSize: 12 }}
                            />
                            <Area type="monotone" dataKey="hotels"  stackId="1" stroke="#15a4e6" strokeWidth={2} fill="url(#hotelsGradient)" />
                            <Area type="monotone" dataKey="flights" stackId="1" stroke="#7c3aed" strokeWidth={2} fill="url(#flightsGradient)" />
                        </AreaChart>
                    </ResponsiveContainer>

                    <div className="flex items-center gap-4 mt-2 px-2">
                        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <span className="h-2 w-2 rounded-full bg-[#15a4e6]" /> Hôtels
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <span className="h-2 w-2 rounded-full bg-[#7c3aed]" /> Vols
                        </span>
                    </div>
                </div>

                {/* Statuts */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                    <h3 className="font-bold text-zinc-900 mb-1">Statuts des réservations</h3>
                    <p className="text-xs text-zinc-400 mb-4">Hôtels + vols</p>

                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={data.status_breakdown}
                                dataKey="count"
                                nameKey="status"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={2}
                            >
                                {data.status_breakdown.map((entry, i) => (
                                    <Cell key={i} fill={STATUS_COLORS[entry.status] ?? "#a1a1aa"} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-2 mt-2">
                        {data.status_breakdown.map((s) => (
                            <div key={s.status} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] ?? "#a1a1aa" }} />
                                    <span className="text-zinc-600 font-medium">{s.status}</span>
                                </div>
                                <span className="font-bold text-zinc-900">{s.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Réservations récentes — hôtels + vols mélangés */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                        <h3 className="font-bold text-zinc-900">Réservations récentes</h3>
                        <Link href="/admin/hotels" className="text-xs text-[#15a4e6] hover:underline font-semibold flex items-center gap-1">
                            Voir tout <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="divide-y divide-zinc-100">
                        {data.recent_bookings.length === 0 ? (
                            <p className="p-6 text-center text-sm text-zinc-400">Aucune réservation récente</p>
                        ) : (
                            data.recent_bookings.map((b) => (
                                <div key={`${b.type}-${b.id}`} className="flex items-center justify-between px-6 py-3 hover:bg-zinc-50/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0
                                            ${b.type === "hotel" ? "bg-[#15a4e6]/10 text-[#15a4e6]" : "bg-purple-50 text-purple-600"}`}>
                                            {b.type === "hotel"
                                                ? <BedDouble className="h-3.5 w-3.5" />
                                                : <Plane className="h-3.5 w-3.5" />
                                            }
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-zinc-900">{b.contact}</p>
                                            <p className="text-[10px] text-zinc-400">
                                                {b.pnr ? `PNR ${b.pnr}` : new Date(b.created_at).toLocaleDateString("fr-FR")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-zinc-900">
                                            {formatCurrency(b.amount)}
                                        </p>
                                        <StatusPill status={b.status} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top établissements */}
                <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-100">
                        <h3 className="font-bold text-zinc-900">Top établissements</h3>
                    </div>

                    <div className="divide-y divide-zinc-100">
                        {data.top_properties.length === 0 ? (
                            <p className="p-6 text-center text-sm text-zinc-400">Aucune donnée</p>
                        ) : (
                            data.top_properties.map((p, i) => (
                                <div key={p.hotel_id} className="flex items-center gap-3 px-6 py-3">
                                    <div className="h-7 w-7 rounded-full bg-[#15a4e6]/10 flex items-center justify-center shrink-0 text-xs font-bold text-[#15a4e6]">
                                        {i + 1}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-zinc-900 truncate">{p.name}</p>
                                        <p className="text-[10px] text-zinc-400">
                                            {p.bookings_count} réservation{p.bookings_count > 1 ? "s" : ""}
                                        </p>
                                    </div>
                                    <p className="text-xs font-bold text-zinc-900 shrink-0">
                                        {formatCurrency(p.revenue)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({
                     icon: Icon,
                     label,
                     value,
                     change,
                     subLabel,
                     accent = "blue",
                     breakdown,
                 }: {
    icon:       React.ComponentType<{ className?: string }>;
    label:      string;
    value:      string;
    change?:    number;
    subLabel?:  string;
    accent?:    "blue" | "amber";
    breakdown?: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }> }[];
}) {
    const isPositive = (change ?? 0) >= 0;

    return (
        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="flex items-center justify-between mb-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center
                    ${accent === "amber" ? "bg-amber-50 text-amber-600" : "bg-[#15a4e6]/10 text-[#15a4e6]"}`}>
                    <Icon className="h-4 w-4" />
                </div>
                {change !== undefined && (
                    <span className={`flex items-center gap-0.5 text-xs font-bold ${isPositive ? "text-green-600" : "text-red-500"}`}>
                        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(change)}%
                    </span>
                )}
            </div>

            <p className="text-xl font-black text-zinc-900">{value}</p>
            <p className="text-xs font-medium text-zinc-500 mt-0.5">{label}</p>
            {subLabel && <p className="text-[10px] text-zinc-400 mt-1">{subLabel}</p>}

            {breakdown && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-50">
                    {breakdown.map((item) => (
                        <div key={item.label} className="flex items-center gap-1.5">
                            <item.icon className="h-3 w-3 text-zinc-300" />
                            <span className="text-[10px] font-semibold text-zinc-500">{item.value}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const config: Record<string, { bg: string; text: string }> = {
        CONFIRMED: { bg: "bg-green-50", text: "text-green-700" },
        PENDING:   { bg: "bg-amber-50", text: "text-amber-700" },
        CANCELLED: { bg: "bg-red-50",   text: "text-red-700" },
        FAILED:    { bg: "bg-zinc-100", text: "text-zinc-500" },
    };
    const c = config[status] ?? config.FAILED;

    return (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${c.bg} ${c.text}`}>
            {status}
        </span>
    );
}