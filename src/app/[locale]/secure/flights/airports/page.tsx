"use client";

import React, { useEffect, useState } from "react";
import { PlaneTakeoff, Globe, MapPin, Loader2, ChevronLeft, ChevronRight, Search, Filter, X } from "lucide-react";
import {api} from "../../../../../core/api/axios-instance";

interface Airport {
    id: number;
    airport_code: string;
    airport_name: string;
    city: string;
    country: string;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export default function AirportsPage() {
    const [airports, setAirports] = useState<Airport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // États pour la pagination et les filtres
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [countryFilter, setCountryFilter] = useState("");

    // Liste unique des pays pour alimenter le sélecteur de filtre (optionnel/dynamique)
    const [countries, setCountries] = useState<string[]>([]);

    // 1. Effet de Debounce pour la recherche (attend 400ms d'inactivité avant de lancer la recherche)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Réinitialise à la page 1 lors d'une nouvelle recherche
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // 2. Récupération des données avec Query Parameters complexes
    useEffect(() => {
        const fetchAirports = async () => {
            setLoading(true);
            try {
                // Construction dynamique des paramètres d'URL
                const params = new URLSearchParams({
                    page: page.toString(),
                    ...(debouncedSearch && { search: debouncedSearch }),
                    ...(countryFilter && { country: countryFilter })
                });

                const res = await api.get(`/admin/airports?${params.toString()}`);

                setAirports(res.data?.data ?? []);
                setMeta({
                    current_page: res.data?.current_page ?? 1,
                    last_page: res.data?.last_page ?? 1,
                    per_page: res.data?.per_page ?? 15,
                    total: res.data?.total ?? 0,
                    from: res.data?.from ?? 0,
                    to: res.data?.to ?? 0,
                });

                // Optionnel : Extraire la liste des pays uniques disponibles si Laravel ne la fournit pas à part
                if (countries.length === 0 && res.data?.data) {
                    const uniqueCountries: string[] = Array.from(
                        new Set(res.data.data.map((a: Airport) => a.country))
                    );
                    setCountries(uniqueCountries.sort());
                }

            } catch (err) {
                console.error("Erreur de chargement des aéroports", err);
                setError("Impossible de charger le référentiel des aéroports.");
            } finally {
                setLoading(false);
            }
        };

        fetchAirports();
    }, [page, debouncedSearch, countryFilter]);

    // Réinitialisation globale des filtres
    const clearFilters = () => {
        setSearch("");
        setCountryFilter("");
        setPage(1);
    };

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
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Référentiel Aéroports</h1>
                    <p className="text-sm text-zinc-500">Base de données des hubs aériens mondiaux et codes IATA.</p>
                </div>
                {loading && <Loader2 className="h-5 w-5 animate-spin text-[#15a4e6]" />}
            </div>

            {/* --- BARRE DE FILTRES ET RECHERCHE --- */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Rechercher (Code, nom, ville...)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#15a4e6]/20 focus:border-[#15a4e6] transition-all"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex w-full sm:w-auto items-center gap-2">
                    <div className="relative w-full sm:w-48">
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <select
                            value={countryFilter}
                            onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-8 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#15a4e6]/20 focus:border-[#15a4e6] transition-all cursor-pointer"
                        >
                            <option value="">Tous les pays</option>
                            {countries.map((country) => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
                    </div>

                    {(search || countryFilter) && (
                        <button
                            onClick={clearFilters}
                            className="text-xs font-medium text-zinc-500 hover:text-zinc-800 px-3 py-2 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition-colors shrink-0"
                        >
                            Effacer
                        </button>
                    )}
                </div>
            </div>

            {/* --- GRILLE / TABLEAU --- */}
            {airports.length === 0 && !loading ? (
                <div className="p-12 text-center text-sm text-zinc-500 bg-white border border-zinc-200 rounded-lg shadow-sm">
                    Aucun aéroport ne correspond à vos critères de recherche.
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden opacity-100 transition-opacity duration-200" style={{ opacity: loading ? 0.7 : 1 }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-500">
                                <th className="px-6 py-4 w-32">Code IATA</th>
                                <th className="px-6 py-4">Nom de l'Aéroport</th>
                                <th className="px-6 py-4">Ville</th>
                                <th className="px-6 py-4">Pays</th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-zinc-100 text-sm">
                            {airports.map((airport) => (
                                <tr key={airport.id} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 font-mono font-bold text-sm border border-blue-200 rounded-lg shadow-sm">
                                                <PlaneTakeoff className="h-3.5 w-3.5 text-blue-500" />
                                                {airport.airport_code.toUpperCase()}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-zinc-900">
                                        {airport.airport_name}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4 text-zinc-400 shrink-0" />
                                            <span>{airport.city}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600">
                                        <div className="flex items-center gap-1.5">
                                            <Globe className="h-4 w-4 text-zinc-400 shrink-0" />
                                            <span>{airport.country}</span>
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
                                <span className="font-medium text-zinc-700">{meta.total}</span> résultats
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