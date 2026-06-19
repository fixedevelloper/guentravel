"use client";

import React, { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { formatCurrency } from "@/lib/formatCurrency";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
    Plus, Search, SlidersHorizontal, Building2, Eye, EyeOff,
    Edit3, Trash2, Loader2, AlertCircle, MapPin, BedDouble,
    CheckCircle, XCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- INTERFACES ---
interface Property {
    id: number;
    name: { fr: string; en: string };
    location: { city: string; country_code: string };
    is_active: boolean;
    rooms_count: number;
    price_range: { min: number; max: number };
    media: { cover: string | null };
}

const translations = {
    fr: {
        title: "Mes Logements",
        subtitle: "Gérez vos annonces et tarifs.",
        addBtn: "Ajouter une annonce",
        searchPlaceholder: "Rechercher...",
        filterAll: "Tous les statuts",
        filterActive: "En ligne",
        filterInactive: "Hors ligne",
        thProperty: "Hébergement",
        thLocation: "Emplacement",
        thPrice: "Prix",
        thStatus: "Statut",
        thActions: "Actions",
        noProperties: "Aucun logement publié.",
        toggleOffline: "Mettre hors ligne",
        toggleOnline: "Mettre en ligne",
        deleteConfirm: "Supprimer cette annonce ?",
        deleteSuccess: "Supprimé avec succès",
        statusSuccess: "Statut mis à jour",
        errorLoad: "Erreur de chargement.",
        free: "Gratuit"
    },
    en: {
        title: "My Properties",
        subtitle: "Manage your listings and prices.",
        addBtn: "Add a listing",
        searchPlaceholder: "Search...",
        filterAll: "All statuses",
        filterActive: "Online",
        filterInactive: "Offline",
        thProperty: "Property",
        thLocation: "Location",
        thPrice: "Price",
        thStatus: "Status",
        thActions: "Actions",
        noProperties: "No properties published.",
        toggleOnline: "Publish online",
        toggleOffline: "Take offline",
        deleteConfirm: "Delete this listing?",
        deleteSuccess: "Deleted successfully",
        statusSuccess: "Status updated",
        errorLoad: "Failed to load.",
        free: "Free"
    }
};

export default function HostPropertiesPage() {
    const params = useParams();
    const locale = (params?.locale as "fr" | "en") || "fr";
    const t = translations[locale];
    const queryClient = useQueryClient();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // --- 1. RÉCUPÉRATION ---
    const { data: properties = [], isLoading, isError } = useQuery<Property[]>({
        queryKey: ["hostProperties"],
        queryFn: async () => {
            const response = await api.get("/host/properties");
            return response.data?.data || [];
        }
    });

    // --- 2. MUTATIONS ---
    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
            api.patch(`/host/properties/${id}/toggle-status`, { is_active }),
        onSuccess: () => {
            toast.success(t.statusSuccess);
            queryClient.invalidateQueries({ queryKey: ["hostProperties"] });
        }
    });

    const deletePropertyMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/host/properties/${id}`),
        onSuccess: () => {
            toast.success(t.deleteSuccess);
            queryClient.invalidateQueries({ queryKey: ["hostProperties"] });
        }
    });
    const goRooms = (propertyId: string) => {
        router.push(`/host/properties/${propertyId}/rooms`);
    };
    // --- FILTRAGE ---
    const filteredProperties = properties.filter((item) => {
        const title = item.name?.[locale] || "";
        const city = item.location?.city || "";
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            city.toLowerCase().includes(searchQuery.toLowerCase());

        if (statusFilter === "active") return matchesSearch && item.is_active;
        if (statusFilter === "inactive") return matchesSearch && !item.is_active;
        return matchesSearch;
    });

    if (isLoading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    function handleDelete(id: any) {

    }

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">

            {/* EN-TÊTE DE LA PAGE */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{t.title}</h1>
                    <p className="text-sm font-medium text-zinc-500">{t.subtitle}</p>
                </div>
                <Button asChild className="bg-[#15a4e6] hover:bg-[#167c3a] text-white rounded-xl text-xs font-bold h-10 shadow-sm gap-1.5 self-start sm:self-auto">
                    <Link href={`/host/properties/create`}>
                        <Plus className="h-4 w-4" />
                        {t.addBtn}
                    </Link>
                </Button>
            </div>

            {/* BARRE DE FILTRES ET RECHERCHE */}
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
                        <option value="active">{t.filterActive}</option>
                        <option value="inactive">{t.filterInactive}</option>
                    </select>
                </div>
            </div>

            {/* TABLEAU DES LOGEMENTS */}
            <Card className="rounded-2xl border-zinc-200/80 shadow-sm bg-white overflow-hidden">
                <CardContent className="p-0 overflow-x-auto">
                    {filteredProperties.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                            <Building2 className="h-10 w-10 text-zinc-300" />
                            <p className="text-sm font-medium text-zinc-400">{t.noProperties}</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                            <tr className="bg-zinc-50/70 border-b border-zinc-100 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                <th className="py-3.5 px-6">{t.thProperty}</th>
                                <th className="py-3.5 px-6">{t.thLocation}</th>
                                <th className="py-3.5 px-6">{t.thPrice}</th>
                                <th className="py-3.5 px-6 text-center">{t.thStatus}</th>
                                <th className="py-3.5 px-6 text-right">{t.thActions}</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-sm font-medium text-zinc-700">
                            {filteredProperties.map((property: any) => {
                                const propertyName = property.name?.[locale] || property.name?.fr || "Sans nom";

                                // Extraction sécurisée de la cover depuis la structure Spatie Media de ton API
                                const coverUrl = property.media?.cover || null;

                                return (
                                    <tr key={property.id} className="hover:bg-zinc-50/30 transition-colors">

                                        {/* LOGEMENT (IMAGE COVER + TITRE TRADUIT) */}
                                        <td className="py-4 px-6 flex items-center gap-3">
                                            <div className="h-12 w-16 bg-zinc-100 border border-zinc-200 rounded-lg overflow-hidden shrink-0 relative">
                                                {coverUrl ? (
                                                    <img src={coverUrl} alt={propertyName} className="object-cover h-full w-full" />
                                                ) : (
                                                    <Building2 className="h-5 w-5 text-zinc-400 absolute inset-0 m-auto" />
                                                )}
                                            </div>
                                            <div className="max-w-[220px]">
                                                <h4 className="font-bold text-zinc-900 truncate leading-snug">{propertyName}</h4>
                                                <p className="text-xs text-zinc-400 font-medium flex items-center gap-1 mt-0.5">
                                                    <BedDouble className="h-3 w-3" /> {property.rooms_count || 0} {property.rooms_count > 1 ? "chambres" : "chambre"}
                                                </p>
                                            </div>
                                        </td>

                                        {/* EMPLACEMENT */}
                                        <td className="py-4 px-6 text-zinc-500">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold">
                                                <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                                <span>{property.location?.city}, {property.location?.country_code}</span>
                                            </div>
                                        </td>

                                        {/* TARIFS (FOURCHETTE MIN / MAX DE L'API) */}
                                        <td className="py-4 px-6 font-bold text-zinc-900 text-xs">
                                            {property.price_range ? (
                                                <span>
                                                    {formatCurrency(property.price_range.min)} - {formatCurrency(property.price_range.max)}
                                                    <span className="text-[10px] text-zinc-400 font-normal block mt-0.5">/ nuit</span>
                                                </span>
                                            ) : (
                                                "—"
                                            )}
                                        </td>

                                        {/* STATUT VISIBILITÉ */}
                                        <td className="py-4 px-6">
                                            <div className="flex justify-center">
                                                {property.is_active ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-full">
                                                        <CheckCircle className="h-3 w-3" /> {t.filterActive}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-zinc-500 bg-zinc-100 border border-zinc-200 rounded-full">
                                                        <XCircle className="h-3 w-3" /> {t.filterInactive}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* MENU D'ACTIONS */}
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 rounded-lg">
                                                    <Link href={`/host/properties/${property.id}/edit`}>
                                                        <Edit3 className="h-4 w-4" />
                                                    </Link>
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-700 rounded-lg transition-colors">
                                                            <SlidersHorizontal className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent align="end" className="w-52 bg-white rounded-xl p-1.5 shadow-md border border-zinc-100 animate-in fade-in-50 duration-200">

                                                        {/* Gestion des Chambres */}
                                                        <DropdownMenuItem
                                                            onClick={() => goRooms(property.id)}
                                                            className="rounded-lg cursor-pointer text-xs font-bold text-zinc-700 focus:bg-zinc-50 flex items-center gap-2.5 px-2.5 py-2 transition-colors"
                                                        >
                                                            <BedDouble className="h-4 w-4 text-zinc-400" />
                                                            <span>Gérer les chambres</span>
                                                        </DropdownMenuItem>

                                                        {/* Basculer le Statut de Visibilité */}
                                                        <DropdownMenuItem
                                                            onClick={() => toggleStatusMutation.mutate({ id: property.id, is_active: !property.is_active })}
                                                            className="rounded-lg cursor-pointer text-xs font-bold text-zinc-700 focus:bg-zinc-50 flex items-center gap-2.5 px-2.5 py-2 transition-colors"
                                                        >
                                                            {property.is_active ? (
                                                                <>
                                                                    <EyeOff className="h-4 w-4 text-zinc-400" />
                                                                    <span>{t.toggleOffline}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Eye className="h-4 w-4 text-[#15a4e6]" />
                                                                    <span>{t.toggleOnline}</span>
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>

                                                        <div className="h-px bg-zinc-100 my-1" />

                                                        {/* Suppression définitive */}
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(property.id)}
                                                            className="rounded-lg cursor-pointer text-xs font-bold text-red-600 focus:bg-red-50 focus:text-red-700 flex items-center gap-2.5 px-2.5 py-2 transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span>Supprimer l'établissement</span>
                                                        </DropdownMenuItem>

                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
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