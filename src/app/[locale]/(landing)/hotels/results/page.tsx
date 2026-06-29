"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, ShieldCheck } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useHotelSearch } from "../../../../../core/hooks/useHotelSearch";
import { HotelSearchParams, OccupancyRoom, Hotel } from "@/types/hotel";
import { HotelItem } from "../../../../../components/PropertyItem";
import { FiltersPanel } from "../../../../../components/hotel/HotelFiltersPanel";
import { HotelMap } from "../../../../../components/hotel/HotelMap";

// CORRECTIONS : Les imports directs de react-leaflet ont été supprimés ici !

function SearchResultsContent() {
    const searchParams = useSearchParams();

    const [filteredHotels, setFilteredHotels] = useState<Hotel[] | null>(null);

    const hotelFilters = useMemo<HotelSearchParams | null>(() => {
        const checkin  = searchParams.get("checkin");
        const checkout = searchParams.get("checkout");
        const lat      = searchParams.get("latitude");
        const lng      = searchParams.get("longitude");

        if (!checkin || !checkout || !lat || !lng) return null;

        let occupancy: OccupancyRoom[] = [];
        try {
            const roomsRaw = searchParams.get("rooms");
            occupancy = roomsRaw
                ? JSON.parse(decodeURIComponent(roomsRaw))
                : [{ room_no: 1, adult: 2, child: 0, child_age: [] }];
        } catch {
            occupancy = [{ room_no: 1, adult: 2, child: 0, child_age: [] }];
        }

        return {
            checkin,
            checkout,
            latitude:    parseFloat(lat),
            longitude:   parseFloat(lng),
            nationality: searchParams.get("nationality") || "FR",
            currency:    searchParams.get("currency")    || "EUR",
            city_name:   searchParams.get("location")    || undefined,
            radius:      parseInt(searchParams.get("radius")     ?? "20"),
            max_result:  parseInt(searchParams.get("max_result") ?? "50"),
            occupancy,
        };
    }, [searchParams]);

    const { results, loading, error } = useHotelSearch(hotelFilters);

    const hotelsList   = filteredHotels ?? results?.hotels ?? [];
    const isFiltered   = filteredHotels !== null;
    const sessionId    = results?.status.session_id ?? "";
    const currency     = hotelFilters?.currency ?? "EUR";
    const totalResults = hotelsList.length;
    const totalGuests  = hotelFilters?.occupancy
        .reduce((sum, r) => sum + r.adult + r.child, 0) ?? 2;

    return (
        <div className="min-h-screen bg-white text-zinc-900 flex flex-col antialiased">
            <Header />

            <div className="border-b border-zinc-100 bg-zinc-50/50">
                <div className="max-w-[1500px] mx-auto px-6 py-3 flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-2 font-medium">
                        <span className="text-zinc-800">
                            {hotelFilters?.city_name || "Destination"}
                        </span>
                        <span>•</span>
                        <span>{totalGuests} voyageur{totalGuests > 1 ? "s" : ""}</span>
                        {isFiltered && (
                            <>
                                <span>•</span>
                                <button
                                    onClick={() => setFilteredHotels(null)}
                                    className="text-[#15a4e6] hover:underline">
                                    Voir tous les résultats ({results?.hotels.length})
                                </button>
                            </>
                        )}
                    </div>
                    <span className="hidden sm:inline">Prix TTC, taxes incluses</span>
                </div>
            </div>

            <main className="flex-1 max-w-[1500px] w-full mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold tracking-tight mb-8">
                    {loading ? (
                        <Skeleton className="h-8 w-64" />
                    ) : (
                        <>
                            {totalResults} hébergement{totalResults > 1 ? "s" : ""} trouvé
                            {hotelFilters?.city_name && ` à ${hotelFilters.city_name}`}
                            {isFiltered && (
                                <span className="ml-2 text-sm font-normal text-zinc-400">
                                    (sur {results?.hotels.length} au total)
                                </span>
                            )}
                        </>
                    )}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Filtres */}
                    <div className="lg:col-span-2">
                        {loading || !sessionId ? (
                            <div className="space-y-3">
                                <Skeleton className="h-8  w-full rounded-xl" />
                                <Skeleton className="h-28 w-full rounded-xl" />
                                <Skeleton className="h-20 w-full rounded-xl" />
                                <Skeleton className="h-32 w-full rounded-xl" />
                            </div>
                        ) : (
                            <FiltersPanel
                                sessionId={sessionId}
                                currency={currency}
                                onApply={(hotels) => setFilteredHotels(hotels)}
                                onReset={() => setFilteredHotels(null)}
                            />
                        )}
                    </div>

                    {/* Liste hôtels */}
                    <section className="lg:col-span-7 space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        {loading ? (
                            <LoadingSkeleton />
                        ) : totalResults === 0 ? (
                            <EmptyState
                                isFiltered={isFiltered}
                                onReset={() => setFilteredHotels(null)}
                            />
                        ) : (
                            <div className="space-y-6">
                                {hotelsList.map((hotel: Hotel) => (
                                    <div key={hotel.hotel_id}
                                         className="border-b border-zinc-100 pb-6 last:border-none">
                                        <HotelItem
                                            property={hotel}
                                            locale="fr"
                                            session_id={sessionId}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Sidebar */}
                    <aside className="hidden lg:col-span-3 lg:block sticky top-[80px] space-y-6">
                        <div className="border border-zinc-200 rounded-2xl p-4 bg-white shadow-sm">
                            <h3 className="text-xs font-bold uppercase text-zinc-400 mb-3 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" /> Localisation
                            </h3>

                            {/* CORRECTION : Remplacement de l'aperçu problématique par un conteneur stylisé neutre et sécurisé */}
                            <div className="h-36 w-full bg-zinc-50 border border-zinc-100 rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-4 text-center group">
                                <div className="absolute inset-0 opacity-45 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                                {!loading && sessionId ? (
                                    <div className="relative z-10 space-y-2">
                                        <p className="text-[11px] text-zinc-500 font-medium">
                                            Visualisez les {totalResults} logements sur un plan interactif.
                                        </p>
                                        <HotelMap
                                            hotels={hotelsList}
                                            sessionId={sessionId}
                                        />
                                    </div>
                                ) : (
                                    <Skeleton className="w-full h-full absolute inset-0" />
                                )}
                            </div>
                        </div>

                        <div className="border border-zinc-200 rounded-2xl p-5 bg-zinc-50/50 space-y-3">
                            <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-[#15a4e6]" />
                                Réserver en confiance
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

export default function SearchResultsPage() {
    return (
        <Suspense fallback={<PageFallback />}>
            <SearchResultsContent />
        </Suspense>
    );
}

const PageFallback = () => (
    <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1 max-w-[1500px] w-full mx-auto px-6 py-8">
            <LoadingSkeleton />
        </main>
        <Footer />
    </div>
);

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

const EmptyState = ({
                        isFiltered,
                        onReset,
                    }: {
    isFiltered: boolean;
    onReset:    () => void;
}) => (
    <div className="text-center py-20 border-2 border-dashed border-zinc-100 rounded-2xl">
        <Search className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-zinc-900">Aucun résultat</h3>
        <p className="text-xs text-zinc-500 mt-1">
            {isFiltered
                ? "Aucun hôtel ne correspond aux filtres sélectionnés."
                : "Ajustez vos critères pour voir plus de choix."
            }
        </p>
        {isFiltered && (
            <button
                onClick={onReset}
                className="mt-4 text-xs text-[#15a4e6] hover:underline font-medium">
                Voir tous les résultats
            </button>
        )}
    </div>
);