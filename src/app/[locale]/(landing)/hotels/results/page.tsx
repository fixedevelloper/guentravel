"use client";

import React, { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, ShieldCheck } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import FilterComponent, { FilterState } from "../../../../../components/FilterComponent";
import { useHotelSearch } from "../../../../../core/hooks/useHotelSearch";
import { HotelSearchParams, OccupancyRoom } from "@/types/hotel";
import {HotelItem} from "../../../../../components/PropertyItem";

// Composant interne qui extrait l'URL et affiche les résultats
function SearchResultsContent() {
    const searchParams = useSearchParams();

    // 1. Extraction et formatage des paramètres d'URL vers l'interface HotelSearchParams
    const hotelFilters = useMemo<HotelSearchParams | null>(() => {
        const checkin = searchParams.get("checkin");
        const checkout = searchParams.get("checkout");
        const location = searchParams.get("location");

        // ⚠️ ATTENTION : Votre formulaire DOIT envoyer la latitude et la longitude dans l'URL.
        // Exemple : &latitude=31.6295&longitude=-7.9811
        const lat = searchParams.get("latitude");
        const lng = searchParams.get("longitude");

        // Si les paramètres obligatoires manquent, on ne lance pas le hook
        if (!checkin || !checkout || !lat || !lng) {
            console.warn("⚠️ Paramètres de coordonnées manquants dans l'URL (latitude/longitude)");
            return null;
        }

        // Extraction et conversion de "rooms" (URL) vers "occupancy" (Type attendu par Laravel)
        let occupancy: OccupancyRoom[] = [];
        try {
            const roomsRaw = searchParams.get("rooms"); // Extraction de la clé 'rooms' de votre URL
            if (roomsRaw) {
                occupancy = JSON.parse(decodeURIComponent(roomsRaw));
            } else {
                occupancy = [{ room_no: 1, adult: 2, child: 0, child_age: [] }];
            }
        } catch (e) {
            console.error("Erreur de parsing du paramètre 'rooms'", e);
            occupancy = [{ room_no: 1, adult: 2, child: 0, child_age: [] }];
        }

        return {
            checkin,
            checkout,
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
            nationality: searchParams.get("nationality") || "FR",
            currency: searchParams.get("currency") || "EUR",
            city_name: location || undefined, // On mappe 'location' sur 'city_name' pour Laravel
            radius: searchParams.get("radius") ? parseInt(searchParams.get("radius")!) : 20,
            max_result: searchParams.get("max_result") ? parseInt(searchParams.get("max_result")!) : 50,
            occupancy,
        };
    }, [searchParams]);

    // 2. Appel de notre hook useQuery (s'exécute automatiquement si hotelFilters n'est pas null)
    const { results, loading, error } = useHotelSearch(hotelFilters);

    console.log(results)
    // Extraction des données basées sur l'interface HotelSearchResponse retournée par Laravel
    const hotelsList = results?.hotels ?? [];
    const session_id = results?.status.session_id;
    const totalResults = hotelsList.length;

    const totalGuests = hotelFilters?.occupancy.reduce((sum, r) => sum + r.adult + r.child, 0) || 2;

    const handleFiltersChange = (newFilters: FilterState) => {
        console.log('Filtres mis à jour:', newFilters);
        // Optionnel : pousser les filtres secondaires (prix, étoiles) dans l'URL ici
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 flex flex-col antialiased">
            <Header />

            {/* Infos de contexte de recherche */}
            <div className="border-b border-zinc-100 bg-zinc-50/50">
                <div className="max-w-[1500px] mx-auto px-6 py-3 flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-2 font-medium">
                        <span className="text-zinc-800">{hotelFilters?.city_name || "Destination"}</span>
                        <span>•</span>
                        <span>{totalGuests} voyageur{totalGuests > 1 ? 's' : ''}</span>
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
                            {totalResults} hébergement{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
                            {hotelFilters?.city_name && ` à ${hotelFilters.city_name}`}
                        </>
                    )}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Filtres de recherche */}
                    <div className="lg:col-span-2">
                        <FilterComponent onFiltersChange={handleFiltersChange} />
                    </div>

                    {/* Section principale : Liste des Hôtels */}
                    <section className="lg:col-span-7 space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                                ⚠️ Une erreur est survenue lors de la recherche : {error}
                            </div>
                        )}

                        {loading ? (
                            <LoadingSkeleton />
                        ) : totalResults === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="space-y-6">
                                {hotelsList.map((hotel: any) => (
                                    <div key={hotel.hotel_id} className="border-b border-zinc-100 pb-6 last:border-none">
                                        {/* Remplacement par les données d'interface 'Hotel' de votre backend */}
                                        <HotelItem
                                            property={hotel}
                                            locale="fr"
                                            session_id={session_id ?? ""} // Si null ou undefined, utilise ""
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Encadrés d'informations latéraux */}
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

export default function SearchResultsPage() {
    return (
        <Suspense fallback={<PageFallback />}>
            <SearchResultsContent />
        </Suspense>
    );
}

// ... Les composants PageFallback, LoadingSkeleton et EmptyState restent inchangés

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