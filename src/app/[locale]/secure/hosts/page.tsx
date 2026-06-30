"use client";

import React, { useEffect, useState } from "react";
import { Users, Mail, Phone, Wallet, Landmark, Building2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../../../../core/api/axios-instance";

interface Host {
    id: number;
    name: string;
    email: string;
    phone_number: string | null;
    wallet_balance: string | number;
    wallet_escrow: string | number;
    properties_count: number;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export default function HostsPage() {
    const [hosts, setHosts] = useState<Host[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);

    useEffect(() => {
        const fetchHosts = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/admin/hosts?page=${page}`);
                setHosts(res.data?.data ?? []);
                setMeta({
                    current_page: res.data?.current_page ?? 1,
                    last_page: res.data?.last_page ?? 1,
                    per_page: res.data?.per_page ?? 15,
                    total: res.data?.total ?? 0,
                    from: res.data?.from ?? 0,
                    to: res.data?.to ?? 0,
                });
            } catch (err) {
                console.error("Erreur de chargement des hôtes", err);
                setError("Impossible de charger la liste des hôtes partenaires.");
            } finally {
                setLoading(false);
            }
        };

        fetchHosts();
    }, [page]);

    if (loading && hosts.length === 0) {
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
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Hôtes & Partenaires</h1>
                    <p className="text-sm text-zinc-500">Suivi des comptes hôteliers, des propriétés gérées et des soldes financiers.</p>
                </div>
                {loading && <Loader2 className="h-5 w-5 animate-spin text-[#15a4e6]" />}
            </div>

            {hosts.length === 0 ? (
                <div className="p-12 text-center text-sm text-zinc-500 bg-white border border-zinc-200 rounded-lg">
                    Aucun hôte partenaire enregistré.
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-500">
                                <th className="px-6 py-4">Hôte / Contact</th>
                                <th className="px-6 py-4">Établissements</th>
                                <th className="px-6 py-4">Solde Disponible</th>
                                <th className="px-6 py-4">Montant Séquestre (Escrow)</th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-zinc-100 text-sm">
                            {hosts.map((host) => (
                                <tr key={host.id} className="hover:bg-zinc-50/50 transition-colors">

                                    {/* Identité de l'hôte */}
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-zinc-900">{host.name}</div>
                                        <div className="space-y-0.5 mt-1 text-xs text-zinc-500">
                                            <div className="flex items-center gap-1.5">
                                                <Mail className="h-3 w-3 text-zinc-400" />
                                                <span>{host.email}</span>
                                            </div>
                                            {host.phone_number && (
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="h-3 w-3 text-zinc-400" />
                                                    <span>{host.phone_number}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Nombre d'établissements rattachés */}
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 text-zinc-700 px-3 py-1 rounded-xl font-medium">
                                            <Building2 className="h-4 w-4 text-zinc-400" />
                                            <span>{host.properties_count}</span>
                                            <span className="text-xs font-normal text-zinc-400">
                                                    {host.properties_count > 1 ? "propriétés" : "propriété"}
                                                </span>
                                        </div>
                                    </td>

                                    {/* Solde disponible en portefeuille */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-green-700 font-bold text-base">
                                            <Wallet className="h-4 w-4 text-green-500 shrink-0" />
                                            <span>
                                                    {Number(host.wallet_balance).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                                                </span>
                                        </div>
                                        <span className="text-[10px] text-zinc-400 block mt-0.5">Prêt pour demande de retrait</span>
                                    </td>

                                    {/* Solde bloqué en séquestre */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-zinc-600 font-semibold">
                                            <Landmark className="h-4 w-4 text-zinc-400 shrink-0" />
                                            <span>
                                                    {Number(host.wallet_escrow).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                                                </span>
                                        </div>
                                        <span className="text-[10px] text-zinc-400 block mt-0.5">Réservations non consommées</span>
                                    </td>

                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {meta && meta.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-6 py-4">
                            <div className="text-xs text-zinc-500">
                                Affichage de <span className="font-medium text-zinc-700">{meta.from}</span> à{" "}
                                <span className="font-medium text-zinc-700">{meta.to}</span> sur{" "}
                                <span className="font-medium text-zinc-700">{meta.total}</span> hôtes inscrits
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