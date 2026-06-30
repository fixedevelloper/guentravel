"use client";

import React, { useEffect, useState } from "react";
import { Building2, MapPin, User, Loader2, ChevronLeft, ChevronRight, Percent, ShieldCheck, ShieldAlert } from "lucide-react";
import {api} from "../../../../../core/api/axios-instance";


interface Property {
    id: number;
    name: string;
    type: string;
    city: string;
    country_code: string;
    is_active: boolean;
    commission_rate: string;
    min_price: number;
    max_price: number;
    host_name: string;
    cover_url: string;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/admin/properties?page=${page}`);
                setProperties(res.data?.data ?? []);
                setMeta({
                    current_page: res.data?.current_page ?? 1,
                    last_page: res.data?.last_page ?? 1,
                    per_page: res.data?.per_page ?? 15,
                    total: res.data?.total ?? 0,
                    from: res.data?.from ?? 0,
                    to: res.data?.to ?? 0,
                });
            } catch (err) {
                console.error("Erreur de chargement des établissements", err);
                setError("Impossible de charger le catalogue des établissements.");
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [page]);

    if (loading && properties.length === 0) {
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
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Catalogue des Établissements</h1>
                    <p className="text-sm text-zinc-500">Gestion des hôtels, appartements et commissions des partenaires hôtes.</p>
                </div>
                {loading && <Loader2 className="h-5 w-5 animate-spin text-[#15a4e6]" />}
            </div>

            {properties.length === 0 ? (
                <div className="p-12 text-center text-sm text-zinc-500 bg-white border border-zinc-200 rounded-lg">
                    Aucun établissement enregistré pour le moment.
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-500">
                                <th className="px-6 py-4">Établissement</th>
                                <th className="px-6 py-4">Hôte / Partenaire</th>
                                <th className="px-6 py-4">Gamme de Prix</th>
                                <th className="px-6 py-4">Commission</th>
                                <th className="px-6 py-4">Statut</th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-zinc-100 text-sm">
                            {properties.map((property) => (
                                <tr key={property.id} className="hover:bg-zinc-50/50 transition-colors">

                                    {/* Établissement (Miniature + Nom + Ville) */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={property.cover_url}
                                                alt={property.name}
                                                className="h-10 w-12 rounded-md bg-zinc-100 object-cover border border-zinc-200 shrink-0"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/images/placeholder-property.jpg";
                                                }}
                                            />
                                            <div className="min-w-0">
                                                <div className="font-semibold text-zinc-900 truncate max-w-[220px]">
                                                    {property.name}
                                                </div>
                                                <div className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="h-3 w-3 shrink-0" />
                                                    <span>{property.city}, {property.country_code}</span>
                                                    <span className="text-zinc-300">•</span>
                                                    <span className="capitalize text-[11px] bg-zinc-100 px-1.5 py-0.2 rounded font-medium text-zinc-600">{property.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Propriétaire / Hôte */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-zinc-800 font-medium">
                                            <User className="h-3.5 w-3.5 text-zinc-400" />
                                            <span>{property.host_name}</span>
                                        </div>
                                        <div className="text-[11px] text-zinc-400 mt-0.5">ID Partenaire: #{property.id}</div>
                                    </td>

                                    {/* Tranche tarifaire (Rooms Min / Max) */}
                                    <td className="px-6 py-4">
                                        {property.min_price === 0 && property.max_price === 0 ? (
                                            <span className="text-xs text-zinc-400 italic">Aucune chambre</span>
                                        ) : (
                                            <div className="font-medium text-zinc-900">
                                                {property.min_price}€ <span className="text-zinc-400 font-normal text-xs">à</span> {property.max_price}€
                                                <span className="block text-[10px] text-zinc-400 font-normal">par nuit</span>
                                            </div>
                                        )}
                                    </td>

                                    {/* Taux de Commission */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-0.5 font-semibold text-zinc-800">
                                            <span>{property.commission_rate}</span>
                                            <Percent className="h-3 w-3 text-zinc-400" />
                                        </div>
                                    </td>

                                    {/* Statut En ligne / Hors ligne */}
                                    <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                property.is_active
                                                    ? "bg-green-50 text-green-700 ring-1 ring-green-600/10"
                                                    : "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200"
                                            }`}>
                                                {property.is_active ? (
                                                    <>
                                                        <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                                                        Actif
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldAlert className="h-3.5 w-3.5 text-zinc-400" />
                                                        Suspendu
                                                    </>
                                                )}
                                            </span>
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
                                <span className="font-medium text-zinc-700">{meta.total}</span> établissements
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