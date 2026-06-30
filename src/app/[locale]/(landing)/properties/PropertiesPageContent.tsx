"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useProperties } from "@/core/hooks/useProperties";
import { PropertyCard } from "@/components/PropertyCard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterSidebar } from "./FilterSidebar";
import FilterComponent from "../../../../components/FilterComponent"; // Assurez-vous d'importer le composant créé précédemment

export function PropertiesPageContent() {
    const t = useTranslations("PropertiesPage");

    // 1. État des filtres
    const [filters, setFilters] = useState({
        types: [],
        maxPrice: 500000,
        minRating: 0,
        amenities: []
    });

    // 2. Connexion au hook avec les filtres
    // Votre hook utilisera cet objet 'filters' pour construire l'URL de l'API
    const { data, isLoading } = useProperties();

    const listProperties = data?.data || [];
    const pagination = data?.meta;

    // 3. Gestionnaire de mise à jour des filtres
    const handleFilterChange = (newFilters: any) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    return (
        <div className="min-h-screen bg-zinc-50">
            <Header />
            <main className="max-w-7xl mx-auto px-6 py-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">{t("title")}</h1>
                </header>

                <div className="flex flex-col lg:flex-row gap-10 items-start">

                    {/* COLONNE GAUCHE : FILTRES CONNECTÉS */}

                    <div className="lg:col-span-3">
                        <FilterComponent onFiltersChange={handleFilterChange}/>
                    </div>
                    {/* COLONNE DROITE : RÉSULTATS */}
                    <section className="flex-1">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[...Array(6)].map((_, index) => (
                                    <Skeleton key={index} className="h-96 w-full rounded-3xl" />
                                ))}
                            </div>
                        ) : (
                            <>
                                {listProperties.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {listProperties.map((property, index) => (
                                            <PropertyCard key={property.hotel_id} property={property} index={index} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-zinc-100 shadow-sm">
                                        <h2 className="text-2xl font-bold text-zinc-700">{t("emptyTitle")}</h2>
                                        <p className="text-zinc-500 mt-2">{t("emptyDescription")}</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Pagination info */}
                        { (pagination?.total ?? 0) > 0 && (
                            <footer className="mt-16 text-center text-sm text-zinc-400 font-medium">
                                {t("pagination", { total: pagination?.total ?? 0 })}
                            </footer>
                        )}
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}