"use client";

import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Calendar, Plane, Building, MessageSquare, Loader2, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { api } from "../../../../core/api/axios-instance";

interface UserClient {
    id: number;
    name: string;
    email: string;
    phone_number: string | null;
    email_verified_at: string | null;
    created_at: string;
    bookings_count: number;
    flight_bookings_count: number;
    reviews_count: number;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/admin/users?page=${page}`);
                setUsers(res.data?.data ?? []);
                setMeta({
                    current_page: res.data?.current_page ?? 1,
                    last_page: res.data?.last_page ?? 1,
                    per_page: res.data?.per_page ?? 15,
                    total: res.data?.total ?? 0,
                    from: res.data?.from ?? 0,
                    to: res.data?.to ?? 0,
                });
            } catch (err) {
                console.error("Erreur de chargement des utilisateurs", err);
                setError("Impossible de charger la base des données clients.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [page]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    if (loading && users.length === 0) {
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
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Gestion des Clients</h1>
                    <p className="text-sm text-zinc-500">Base globale des utilisateurs voyageurs, statuts de comptes et volumes d'activité.</p>
                </div>
                {loading && <Loader2 className="h-5 w-5 animate-spin text-[#15a4e6]" />}
            </div>

            {users.length === 0 ? (
                <div className="p-12 text-center text-sm text-zinc-500 bg-white border border-zinc-200 rounded-lg">
                    Aucun compte client trouvé dans le système.
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-500">
                                <th className="px-6 py-4">Client / Voyageur</th>
                                <th className="px-6 py-4">Vérification Email</th>
                                <th className="px-6 py-4">Activité (Réservations)</th>
                                <th className="px-6 py-4">Date d'inscription</th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-zinc-100 text-sm">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">

                                    {/* Identité Profil */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                                                <User className="h-4 w-4 text-zinc-500" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-zinc-900">{user.name}</div>
                                                <div className="space-y-0.5 text-xs text-zinc-400 mt-0.5">
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3 shrink-0" />
                                                        <span>{user.email}</span>
                                                    </div>
                                                    {user.phone_number && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3 shrink-0" />
                                                            <span>{user.phone_number}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Statut Email */}
                                    <td className="px-6 py-4">
                                        {user.email_verified_at ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md px-2 py-0.5">
                                                    <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                                    Vérifié
                                                </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5">
                                                    <XCircle className="h-3.5 w-3.5 text-amber-500" />
                                                    En attente
                                                </span>
                                        )}
                                    </td>

                                    {/* Résumés des métriques d'activité */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4 text-xs font-medium text-zinc-600">
                                            {/* Vols */}
                                            <div className="flex items-center gap-1" title="Réservations de vols">
                                                <Plane className="h-3.5 w-3.5 text-zinc-400" />
                                                <span>{user.flight_bookings_count} <span className="text-zinc-400 font-normal">vols</span></span>
                                            </div>
                                            {/* Hébergements */}
                                            <div className="flex items-center gap-1" title="Réservations d'hébergements">
                                                <Building className="h-3.5 w-3.5 text-zinc-400" />
                                                <span>{user.bookings_count} <span className="text-zinc-400 font-normal">hôtels</span></span>
                                            </div>
                                            {/* Avis */}
                                            <div className="flex items-center gap-1" title="Avis laissés">
                                                <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                                                <span>{user.reviews_count} <span className="text-zinc-400 font-normal">avis</span></span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Date d'inscription */}
                                    <td className="px-6 py-4 text-zinc-500 text-xs">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                            <span>{formatDate(user.created_at)}</span>
                                        </div>
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
                                <span className="font-medium text-zinc-700">{meta.total}</span> clients inscrits
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