"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import SearchFlightResults from "./SearchFlightResults";

// Fonction pour extraire et formater tous les paramètres de vol depuis l'URL
function useFlightSearchParams() {
    const searchParams = useSearchParams();

    // 1. Reconstruction de la structure passagers
    const adults = parseInt(searchParams.get("adults") || "1", 10);
    const children = parseInt(searchParams.get("children") || "0", 10);
    const infants = parseInt(searchParams.get("infants") || "0", 10);

    const trip_type = (searchParams.get("trip_type") || "round_trip") as "one_way" | "round_trip" | "multi_city";
    const return_date = searchParams.get("return_date") || undefined;
    const travel_class=searchParams.get("travel_class") || 'Economy';
    // 2. Extraction dynamique des segments
    const segments: Array<{ origin: string; destination: string; departure_date: string }> = [];

    if (trip_type === "multi_city") {
        let index = 0;
        // On boucle tant que l'URL contient un paramètre indexé (ex: origin[0], origin[1]...)
        while (searchParams.has(`origin[${index}]`)) {
            segments.push({
                origin: searchParams.get(`origin[${index}]`) || "",
                destination: searchParams.get(`destination[${index}]`) || "",
                departure_date: searchParams.get(`departure_date[${index}]`) || "",
            });
            index++;
        }
    }

    // Fallback : Si le tableau est resté vide (Aller simple / Aller-Retour ou URL classique)
    if (segments.length === 0) {
        segments.push({
            origin: searchParams.get("origin") || "",
            destination: searchParams.get("destination") || "",
            departure_date: searchParams.get("departure_date") || "",
        });
    }

    return {
        trip_type,
        return_date,
        passengers: { adults, children, infants },
        segments,
        origin: segments[0]?.origin || "",
        destination: segments[0]?.destination || "",
        departure_date: segments[0]?.departure_date || "",
        travel_class
    };
}

function SearchFlightResultsContent() {
    const searchCriteria = useFlightSearchParams();

    const { data: flightsResponse, isPending } = useQuery({
        queryKey: ["flights-search", searchCriteria],
        queryFn: async () => {
            if (!searchCriteria.origin || !searchCriteria.destination) return null;

            const response = await api.post("/flights/search", searchCriteria);
            return response.data; // This returns the root object containing { success, data: { offers, ... } }
        },
        enabled: !!searchCriteria.origin && !!searchCriteria.destination,
    });

    // Extracting fields according to your actual JSON structure
    const flights = flightsResponse?.data?.offers || [];
    const sessionId = flightsResponse?.data?.session_id || "";

    return (
        <div className="min-h-screen bg-white text-zinc-900 flex flex-col antialiased">
            <Header />

            <main className="flex-1 w-full mx-auto py-8">
                <SearchFlightResults
                    searchCriteria={searchCriteria}
                    flights={flights}      // Safely passes down the array of flight offers
                    isPending={isPending}
                />
            </main>

            <Footer />
        </div>
    );
}

// Export par défaut entouré de la Suspense Boundary obligatoire sous Next.js (App Router)
export default function SearchResultsPage() {
    return (
        <Suspense fallback={<PageFallback />}>
            <SearchFlightResultsContent />
        </Suspense>
    );
}

// Fallback global de la page
const PageFallback = () => (
    <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
            <div className="space-y-4 mb-8">
                <Skeleton className="h-20 w-full rounded-xl" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3">
                    <Skeleton className="h-[400px] w-full rounded-2xl" />
                </div>
                <div className="lg:col-span-9 space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-44 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        </main>
        <Footer />
    </div>
);