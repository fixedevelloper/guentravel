"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
    Sheet, SheetContent, SheetHeader,
    SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
    Plane, ArrowRight, SlidersHorizontal,
    ChevronDown, Info, X, Edit3,
} from "lucide-react";
import SearchFlight from "../../../../../components/search/flights/SearchFlight";
import { useCartStore, FlightOffer as StoreFlightOffer } from "../../../../../core/store/useCartStore";
import { useRouter } from "@/i18n/routing";
import FlightCard from "../FlightCard";
import { api } from "../../../../../core/api/axios-instance";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────
interface Segment {
    flight_number: string | null;
    airline_code:  string | null;
    airline_name:  string | null;
    departure: { airport: string | null; time: string | null };
    arrival:   { airport: string | null; time: string | null };
    booking_class: string | null;
    duration:      string | number | null;
}
interface Journey {
    direction:   "outbound" | "inbound";
    offering_id: string | null;
    brand_value: string | null;
    travelport?: { brand_value: string | null };
    stops_count: number;
    segments:    Segment[];
}
interface FlightOffer {
    id: string;
    travelport: {
        transaction_id:                string | null;
        offering_id:                   string | null;
        fare_source_code:              string | null;
        session_id:                    string | null;
        raw_offering?:                 any;
        flight_refs?:                  any;
        catalog_offerings_identifier?: any;
        available_brands?:             any;
        product_brand_offerings?:      any;
        products?:                     any;
    };
    price_details: {
        base_price:         number;
        taxes:              number;
        final_price_to_pay: number;
        currency:           string;
        agency_fees:        number;
    };
    itinerary:          Journey[];
    baggage_allowance?: { checked: string; cabin: string };
}
interface FlightSegmentCriteria {
    origin:         string;
    destination:    string;
    departure_date: string;
}
interface ResultsProps {
    searchCriteria: {
        trip_type: "one_way" | "round_trip" | "multi_city";
        passengers: { adults: number; children: number; infants: number };
        segments:   FlightSegmentCriteria[];
        return_date?: string;
    };
    flights:   FlightOffer[];
    isPending: boolean;
}

// ── Filtre state ──────────────────────────────────────────────────────────────
interface FilterState {
    stops:      ("direct" | "1stop" | "2stops")[];
    maxPrice:   number;
    airlines:   string[];
}

const DEFAULT_MAX = 2500000;

const initialFilter: FilterState = {
    stops:    [],
    maxPrice: DEFAULT_MAX,
    airlines: [],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function applyFilters(flights: FlightOffer[], filters: FilterState): FlightOffer[] {
    return flights.filter((flight) => {
        // Prix
        if (flight.price_details.final_price_to_pay > filters.maxPrice) return false;

        // Escales
        if (filters.stops.length > 0) {
            const maxStops = Math.max(
                ...flight.itinerary.map((j) => j.stops_count ?? 0)
            );
            const match = filters.stops.some((s) => {
                if (s === "direct") return maxStops === 0;
                if (s === "1stop")  return maxStops === 1;
                if (s === "2stops") return maxStops >= 2;
                return false;
            });
            if (!match) return false;
        }

        // Compagnies
        if (filters.airlines.length > 0) {
            const flightAirlines = new Set(
                flight.itinerary.flatMap((j) =>
                    j.segments.map((s) => s.airline_name).filter(Boolean)
                )
            );
            const hasMatch = filters.airlines.some((a) => flightAirlines.has(a));
            if (!hasMatch) return false;
        }

        return true;
    });
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function SearchFlightResults({
                                                searchCriteria,
                                                flights = [],
                                                isPending,
                                            }: ResultsProps) {
    const t = useTranslations("Flight");

    const [isEditing,         setIsEditing]         = React.useState(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState(false);

    // État des filtres
    const [pendingFilters,  setPendingFilters]  = React.useState<FilterState>(initialFilter);
    const [appliedFilters,  setAppliedFilters]  = React.useState<FilterState>(initialFilter);
    const [isFilterDirty,   setIsFilterDirty]   = React.useState(false);
    const currentCurrency = typeof window !== "undefined"
        ? (document.cookie.split("; ").find(row => row.startsWith("currency="))?.split("=")[1] || "XAF")
        : "XAF";
    // Vols après filtrage
    const filteredFlights = React.useMemo(
        () => applyFilters(flights, appliedFilters),
        [flights, appliedFilters]
    );

    // Compagnies uniques
    const uniqueAirlines = React.useMemo(() => {
        const set = new Set<string>();
        flights.forEach((f) =>
            f.itinerary?.forEach((j) =>
                j.segments?.forEach((s) => { if (s.airline_name) set.add(s.airline_name); })
            )
        );
        return Array.from(set);
    }, [flights]);

    // Prix max parmi les vols (initialise le slider)
    const maxFlightPrice = React.useMemo(
        () => Math.max(...flights.map((f) => f.price_details.final_price_to_pay), DEFAULT_MAX),
        [flights]
    );

    // Helpers pour modifier pendingFilters
    const toggleStop = (stop: FilterState["stops"][number]) => {
        setPendingFilters((prev) => {
            const stops = prev.stops.includes(stop)
                ? prev.stops.filter((s) => s !== stop)
                : [...prev.stops, stop];
            return { ...prev, stops };
        });
        setIsFilterDirty(true);
    };

    const toggleAirline = (airline: string) => {
        setPendingFilters((prev) => {
            const airlines = prev.airlines.includes(airline)
                ? prev.airlines.filter((a) => a !== airline)
                : [...prev.airlines, airline];
            return { ...prev, airlines };
        });
        setIsFilterDirty(true);
    };

    const handlePriceChange = (val: number[]) => {
        setPendingFilters((prev) => ({ ...prev, maxPrice: val[0] }));
        setIsFilterDirty(true);
    };

    const handleApply = () => {
        setAppliedFilters(pendingFilters);
        setIsFilterDirty(false);
        setIsMobileFilterOpen(false);
    };

    const handleReset = () => {
        const reset = { ...initialFilter, maxPrice: maxFlightPrice };
        setPendingFilters(reset);
        setAppliedFilters(reset);
        setIsFilterDirty(false);
    };

    const isFiltered =
        appliedFilters.stops.length > 0      ||
        appliedFilters.airlines.length > 0   ||
        appliedFilters.maxPrice < maxFlightPrice;

    // ── Store / router ────────────────────────────────────────────────────────
    const setFlight              = useCartStore((s) => s.setFlight);
    const initPassengersList     = useCartStore((s) => s.initPassengersList);
    const setTravelportSessionId = useCartStore((s) => s.setTravelportSessionId);
    const router = useRouter();

    const handleSelectFlight = (flight: FlightOffer) => {
        if (!flight.itinerary?.length) return;
        const flightToStore: StoreFlightOffer = {
            id: flight.id,
            travelport: {
                transaction_id:              flight.travelport?.fare_source_code ?? null,
                offering_id:                 flight.travelport?.fare_source_code ?? null,
                gds_authority_value:         flight.travelport?.fare_source_code ?? null,
                gds_authority_value_inbound: null,
                catalog_offerings_identifier: flight.travelport?.catalog_offerings_identifier ?? null,
            },
            price_details: {
                base_price:         Number(flight.price_details?.base_price         ?? 0),
                taxes:              Number(flight.price_details?.taxes              ?? 0),
                final_price_to_pay: Number(flight.price_details?.final_price_to_pay ?? 0),
                currency:           flight.price_details?.currency ?? "XAF",
                agency_fees:        Number(flight.price_details?.agency_fees        ?? 0),
            },
            itinerary: flight.itinerary.map((j) => ({
                direction:   j.direction,
                offering_id: j.offering_id,
                brand_value: j.brand_value,
                travelport:  j.travelport,
                stops_count: j.stops_count,
                segments:    j.segments.map((s) => ({
                    flight_number: s.flight_number,
                    airline_code:  s.airline_code,
                    airline_name:  s.airline_name,
                    departure:     { airport: s.departure?.airport ?? null, time: s.departure?.time ?? null },
                    arrival:       { airport: s.arrival?.airport   ?? null, time: s.arrival?.time   ?? null },
                    booking_class: s.booking_class ?? null,
                    duration:      s.duration      ?? null,
                })),
            })),
            baggage_allowance: flight.baggage_allowance ?? { checked: "1 PC", cabin: "1 PC" },
        };
        setFlight(flightToStore);
        const total =
            (searchCriteria.passengers?.adults   || 1) +
            (searchCriteria.passengers?.children || 0) +
            (searchCriteria.passengers?.infants  || 0);
        initPassengersList(total);
        router.push("/flights/checkout");
    };

    const { mutate: revalidateFare, isPending: isMutationPending, variables } = useMutation({
        mutationFn: async (flight: FlightOffer) => {
            const response = await api.post("/flights/revalidate", {
                session_id:       flight.travelport?.session_id,
                fare_source_code: flight.travelport?.fare_source_code,
            });
            return { data: response.data, flight };
        },
        onSuccess: ({ data, flight }) => {
            if (data.success || data.status === "success") {
                const sessionId =
                    data.data?.session_identifier ||
                    data.data?.session_id         ||
                    flight.travelport?.session_id;
                if (sessionId) {
                    setTravelportSessionId(sessionId);
                    handleSelectFlight(flight);
                } else {
                    toast.error("Erreur technique : Session de réservation introuvable.");
                }
            } else {
                toast.error(data.message || "Le prix de ce vol a changé ou n'est plus disponible.");
            }
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Le tarif n'a pas pu être validé.";
            toast.error(msg);
        },
    });

    // ── Loading ───────────────────────────────────────────────────────────────
    if (isPending) {
        return (
            <div className="flex flex-col items-center justify-center p-12 sm:p-24 space-y-6 bg-zinc-50 min-h-[60vh]">
                <div className="relative flex items-center justify-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-200 border-t-[#15a4e6]" />
                    <Plane className="h-6 w-6 text-[#15a4e6] absolute animate-pulse" />
                </div>
                <div className="text-center space-y-2 px-4">
                    <h3 className="text-lg sm:text-xl font-bold text-zinc-900">
                        Analyse des offres en cours...
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 max-w-sm">
                        Nous recherchons les meilleurs tarifs et les itinéraires les plus rapides.
                    </p>
                </div>
            </div>
        );
    }

    // ── Contenu filtres (partagé desktop/mobile) ──────────────────────────────
    const FilterContent = () => (
        <div className="space-y-6 text-left">

            {/* Escales */}
            <div className="space-y-3">
                <h4 className="font-semibold text-xs text-zinc-500 uppercase tracking-wide">
                    Nombre d&apos;escales
                </h4>
                <div className="space-y-3">
                    {(["direct", "1stop", "2stops"] as const).map((stop) => {
                        const labels = {
                            direct:  "Vols directs",
                            "1stop": "1 escale",
                            "2stops":"2 escales ou plus",
                        };
                        return (
                            <label key={stop} className="flex items-center gap-3 text-sm font-medium text-zinc-700 cursor-pointer">
                                <Checkbox
                                    id={stop}
                                    checked={pendingFilters.stops.includes(stop)}
                                    onCheckedChange={() => toggleStop(stop)}
                                    className="rounded-md border-zinc-300 data-[state=checked]:bg-[#15a4e6] data-[state=checked]:border-[#15a4e6]"
                                />
                                <span>{labels[stop]}</span>
                            </label>
                        );
                    })}
                </div>
            </div>

            <hr className="border-zinc-100" />

            {/* Prix */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-xs text-zinc-500 uppercase tracking-wide">
                        Budget maximum
                    </h4>
                    <span className="text-sm font-bold text-zinc-900">
                        {pendingFilters.maxPrice.toLocaleString()} {currentCurrency}
                    </span>
                </div>
                <Slider
                    value={[pendingFilters.maxPrice]}
                    max={maxFlightPrice}
                    step={25000}
                    onValueChange={handlePriceChange}
                    className="py-2"
                />
                <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>0 F</span>
                    <span>{maxFlightPrice.toLocaleString()} {currentCurrency}</span>
                </div>
            </div>

            <hr className="border-zinc-100" />

            {/* Compagnies */}
            <div className="space-y-3">
                <h4 className="font-semibold text-xs text-zinc-500 uppercase tracking-wide">
                    Compagnies aériennes
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {uniqueAirlines.length === 0 ? (
                        <p className="text-xs text-zinc-400 italic">Aucune compagnie disponible</p>
                    ) : (
                        uniqueAirlines.map((airline, idx) => (
                            <label key={idx} className="flex items-center gap-3 text-sm font-medium text-zinc-700 cursor-pointer">
                                <Checkbox
                                    id={`airline-${idx}`}
                                    checked={pendingFilters.airlines.includes(airline)}
                                    onCheckedChange={() => toggleAirline(airline)}
                                    className="rounded-md border-zinc-300 data-[state=checked]:bg-[#15a4e6] data-[state=checked]:border-[#15a4e6]"
                                />
                                <span className="truncate">{airline}</span>
                            </label>
                        ))
                    )}
                </div>
            </div>

            {/* Bouton appliquer (desktop) */}
            <Button
                onClick={handleApply}
                disabled={!isFilterDirty}
                className="w-full bg-[#15a4e6] hover:bg-[#1290cc] text-white font-bold h-10 rounded-xl text-xs disabled:opacity-40">
                {isFilterDirty ? "Appliquer les filtres" : "Filtres appliqués ✓"}
            </Button>
        </div>
    );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6 text-left mb-16 lg:mb-0">

            {/* Summary bar */}
            <Card className="bg-zinc-900 text-white border-none shadow-md rounded-2xl overflow-hidden">
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 bg-white/10 rounded-xl text-[#15a4e6] shrink-0">
                            <Plane className="h-5 w-5 sm:h-6 sm:w-6 rotate-45" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-base sm:text-lg font-bold">
                                <span className="uppercase">{searchCriteria?.segments?.[0]?.origin      || "---"}</span>
                                <ArrowRight className="h-4 w-4 text-zinc-400" />
                                <span className="uppercase">{searchCriteria?.segments?.[0]?.destination || "---"}</span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 truncate max-w-[250px] sm:max-w-none">
                                {searchCriteria?.segments?.[0]?.departure_date || "---"}
                                {searchCriteria?.return_date ? ` | ${searchCriteria.return_date}` : ""}
                                {" • "}
                                {(searchCriteria?.passengers?.adults   || 0) +
                                (searchCriteria?.passengers?.children || 0) +
                                (searchCriteria?.passengers?.infants  || 0)} voy.
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setIsEditing(!isEditing)}
                        className={`w-full sm:w-auto text-white border-white/20 hover:bg-white/10 h-10 text-xs gap-2 rounded-xl
                            ${isEditing ? "bg-red-600/20 border-red-500/30" : "bg-transparent"}`}>
                        {isEditing
                            ? <><X className="h-3.5 w-3.5" /> Fermer</>
                            : <><Edit3 className="h-3.5 w-3.5" /> Modifier la recherche</>
                        }
                    </Button>
                </CardContent>
            </Card>

            <AnimatePresence initial={false}>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden w-full bg-zinc-50 rounded-2xl border border-zinc-200/60 shadow-inner">
                        <div className="p-1 sm:p-2"><SearchFlight /></div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Sidebar filtres desktop */}
                <aside className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-zinc-200 p-5 space-y-6 sticky top-20 shadow-sm">
                    <div className="flex justify-between items-center border-b pb-3">
                        <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <SlidersHorizontal className="h-4 w-4 text-[#15a4e6]" /> Filtres
                        </h3>
                        <button
                            onClick={handleReset}
                            className="text-xs font-semibold text-zinc-400 hover:text-[#15a4e6] transition-colors">
                            Effacer tout
                        </button>
                    </div>
                    <FilterContent />
                </aside>

                {/* Liste vols */}
                <section className="lg:col-span-9 space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <p className="text-xs sm:text-sm text-zinc-500 font-medium">
                            <span className="text-zinc-900 font-bold">{filteredFlights.length}</span>
                            {isFiltered && (
                                <span className="text-zinc-400">
                                    {" "}sur {flights.length} propositions
                                </span>
                            )}
                            {!isFiltered && " propositions de vols"}
                            {isFiltered && (
                                <button
                                    onClick={handleReset}
                                    className="ml-2 text-[#15a4e6] hover:underline text-xs">
                                    Réinitialiser
                                </button>
                            )}
                        </p>

                        <div className="flex items-center gap-2">
                            {/* Filtres mobile */}
                            <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm"
                                            className="lg:hidden flex items-center gap-2 h-9 text-xs font-semibold px-3 border-zinc-200 rounded-xl bg-white text-zinc-700">
                                        <SlidersHorizontal className="h-3.5 w-3.5 text-[#15a4e6]" />
                                        Filtres
                                        {isFiltered && (
                                            <span className="bg-[#15a4e6] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                {[
                                                    appliedFilters.stops.length,
                                                    appliedFilters.airlines.length,
                                                    appliedFilters.maxPrice < maxFlightPrice ? 1 : 0,
                                                ].reduce((a, b) => a + b, 0)}
                                            </span>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="rounded-t-3xl h-[85vh] p-0 bg-white border-t flex flex-col overflow-hidden">
                                    <SheetHeader className="flex flex-row justify-between items-center p-4 sm:p-6 pb-4 border-b border-zinc-100 shrink-0">
                                        <SheetTitle className="text-base font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-wide">
                                            <SlidersHorizontal className="h-4 w-4 text-[#15a4e6]" /> Filtres
                                        </SheetTitle>
                                        <button onClick={handleReset}
                                                className="text-xs font-bold text-zinc-400 hover:text-[#15a4e6] mr-6">
                                            Effacer tout
                                        </button>
                                    </SheetHeader>
                                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                                        <FilterContent />
                                    </div>
                                    <div className="p-4 border-t border-zinc-100 bg-white shrink-0">
                                        <Button
                                            onClick={handleApply}
                                            className="w-full bg-[#15a4e6] hover:bg-[#1290cc] text-white font-bold h-12 rounded-xl">
                                            Voir {filteredFlights.length} résultat{filteredFlights.length > 1 ? "s" : ""}
                                        </Button>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 bg-zinc-100 px-3 py-2 rounded-xl cursor-pointer hover:bg-zinc-200/70 transition-colors h-9">
                                <span>Trier</span>
                                <ChevronDown className="h-3 w-3 text-zinc-400" />
                            </div>
                        </div>
                    </div>

                    {filteredFlights.length === 0 ? (
                        <Card className="p-12 text-center border-dashed border-2 rounded-2xl">
                            <CardContent className="p-0 flex flex-col items-center space-y-3">
                                <Info className="h-8 w-8 text-zinc-300" />
                                <h3 className="font-bold text-zinc-800 text-base">Aucun vol trouvé</h3>
                                <p className="text-xs text-zinc-400 max-w-xs">
                                    {isFiltered
                                        ? "Aucun vol ne correspond à vos filtres."
                                        : "Modifiez vos critères ou élargissez vos filtres."
                                    }
                                </p>
                                {isFiltered && (
                                    <button onClick={handleReset}
                                            className="text-xs text-[#15a4e6] hover:underline font-semibold mt-1">
                                        Voir tous les vols ({flights.length})
                                    </button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        filteredFlights.map((flight) => (
                            <FlightCard
                                key={flight.id}
                                flight={flight}
                                formatDuration={(d) => {
                                    if (!d) return "--";
                                    if (typeof d === "string") return d.replace("PT","").replace("H","h ").replace("M","m").toLowerCase();
                                    return `${Math.floor(+d/60)}h ${+d%60>0?`${+d%60}m`:""}`;
                                }}
                                handleSelectFlight={() => !isMutationPending && revalidateFare(flight)}
                                isBooking={isMutationPending && variables?.id === flight.id}
                                isDisabled={isMutationPending && variables?.id !== flight.id}
                            />
                        ))
                    )}
                </section>
            </div>
        </div>
    );
}