"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, ShieldCheck } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import FilterComponent, { FilterState } from "../../../../components/FilterComponent";
import { usePropertySearch } from "../../../../core/hooks/usePropertySearch";
import {HotelItem} from "../../../../components/PropertyItem";

// Composant interne qui utilise useSearchParams
function SearchResultsContent() {
    const searchParams = useSearchParams();

    const filters = {
        city: searchParams.get("location") || "",
        guests: searchParams.get("guests") ? parseInt(searchParams.get("guests")!) : 1,
    };

    const { searchResults, isSearching } = usePropertySearch(filters);
    const totalResults = searchResults?.data?.length || 0;

    const handleFiltersChange = (newFilters: FilterState) => {
        console.log('Filtres mis à jour:', newFilters);
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 flex flex-col antialiased">
            <Header />

            <div className="border-b border-zinc-100 bg-zinc-50/50">
                <div className="max-w-[1500px] mx-auto px-6 py-3 flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-2 font-medium">
                        <span className="text-zinc-800">{filters.city || "Partout"}</span>
                        <span>•</span>
                        <span>{filters.guests} voyageur{filters.guests > 1 ? 's' : ''}</span>
                    </div>
                    <span className="hidden sm:inline">Prix TTC, taxes incluses</span>
                </div>
            </div>

            <main className="flex-1 max-w-[1500px] w-full mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold tracking-tight mb-8">
                    {totalResults} hébergement{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
                    {filters.city && ` à ${filters.city}`}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    <div className="lg:col-span-3">
                        <FilterComponent onFiltersChange={handleFiltersChange} />
                    </div>

                    <section className="lg:col-span-6 space-y-6">
                        {isSearching ? (
                            <LoadingSkeleton />
                        ) : totalResults === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="space-y-6">
                                {searchResults.data.map((property: any) => (
                                    <div key={property.id} className="border-b border-zinc-100 pb-6 last:border-none">
                                        <HotelItem property={property} locale="fr"  session_id={'none'}/>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <aside className="hidden lg:col-span-3 lg:block sticky top-[80px] space-y-6">
                        <div className="border border-zinc-200 rounded-2xl p-4 bg-white shadow-sm">
                            <h3 className="text-xs font-bold uppercase text-zinc-400 mb-3 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" /> Localisation
                            </h3>
                            <div className="h-36 w-full bg-zinc-100 rounded-lg border border-zinc-200 flex items-center justify-center">
                                <button className="text-xs font-semibold px-4 py-2 bg-white rounded-md shadow-sm border border-zinc-200 hover:bg-zinc-50">
                                    Afficher la carte
                                </button>
                            </div>
                        </div>

                        <div className="border border-zinc-200 rounded-2xl p-5 bg-zinc-50/50 space-y-3">
                            <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-[#15a4e6]" /> Réserver en confiance
                            </h4>
                            <ul className="text-[11px] text-zinc-600 space-y-2">
                                <li>• Annulation gratuite sur la plupart des logements.</li>
                                <li>• Garantie du meilleur prix.</li>
                                <li>• Service client dédié 24/7.</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </main>
            <Footer />
        </div>
    );
}

// Export par défaut : englobe le contenu dans une boundary Suspense
export default function SearchResultsPage() {
    return (
        <Suspense fallback={<PageFallback />}>
            <SearchResultsContent />
        </Suspense>
    );
}

// Fallback affiché pendant le chargement initial (avant que useSearchParams soit résolu)
const PageFallback = () => (
    <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1 max-w-[1500px] w-full mx-auto px-6 py-8">
            <LoadingSkeleton />
        </main>
        <Footer />
    </div>
);

// Composants de support pour alléger le rendu
const LoadingSkeleton = () => (
    <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-6 border-b pb-6">
                <Skeleton className="h-40 w-40 rounded-xl" />
                <div className="space-y-3 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

const EmptyState = () => (
    <div className="text-center py-20 border-2 border-dashed border-zinc-100 rounded-2xl">
        <Search className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-zinc-900">Aucun résultat</h3>
        <p className="text-xs text-zinc-500 mt-1">Ajustez vos filtres pour voir plus de choix.</p>
    </div>
);