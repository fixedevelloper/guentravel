"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Plane,
    ArrowRight,
    Clock,
    SlidersHorizontal,
    ChevronDown,
    Briefcase,
    Info,
    Luggage,
    X,
    Edit3,
    Loader2
} from "lucide-react";
import SearchFlight from "../../../../../components/search/flights/SearchFlight";
import {useCartStore} from "../../../../../core/store/useCartStore";
import {useRouter} from "@/i18n/routing";
import FlightCard from "../FlightCard";
import {api} from "../../../../../core/api/axios-instance";
import { useMutation } from "@tanstack/react-query";
import {toast} from "sonner"; // Import TanStack
interface Segment {
    airline_name: string;
    airline_code: string;
    flight_number: string;
    departure: { airport: string; time: string };
    arrival: { airport: string; time: string };
    duration: number;
}

interface Journey {
    direction: "outbound" | "inbound";
    stops_count: number;
    segments: Segment[];
}

interface FlightOffer {
    id: string;
    price_details: {
        final_price_to_pay: number;
        currency: string;
        base_fare: number;
        taxes: number;
    };
    itinerary: Journey[];
    baggage_allowance?: {
        checked: string;
        cabin: string;
    };
}

interface ResultsProps {
    searchCriteria: {
        origin: string;
        destination: string;
        departure_date: string;
        return_date?: string;
        trip_type: string;
        passengers: { adults: number; children: number; infants: number };
    };
    flights: FlightOffer[];
    isPending: boolean;
}

export default function SearchFlightResults({ searchCriteria, flights = [], isPending }: ResultsProps) {
    const t = useTranslations("Flight");

    const [isEditing, setIsEditing] = React.useState<boolean>(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState<boolean>(false);
    const [isBookingId, setIsBookingId] = React.useState<string | null>(null);

    const [maxPrice, setMaxPrice] = React.useState<number>(1500000);

    const uniqueAirlines = React.useMemo(() => {
        const airlines = new Set<string>();
        flights.forEach(f => f.itinerary.forEach(j => j.segments.forEach(s => airlines.add(s.airline_name))));
        return Array.from(airlines);
    }, [flights]);

    const formatDuration = (totalMinutes: number) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
    };

    const setFlight = useCartStore((state) => state.setFlight);
    const initPassengersList = useCartStore((state) => state.initPassengersList);
    const setTravelportSessionId = useCartStore((state) => state.setTravelportSessionId);
    const router = useRouter();

    const handleSelectFlight = (flight: any) => {
        const outboundSegments = flight.itinerary[0].segments;
        const firstSegment = outboundSegments[0];
        const lastSegment = outboundSegments[outboundSegments.length - 1];

        setFlight({
            id: flight.id,
            airline_name: firstSegment.airline_name,
            airline_code: firstSegment.airline_code,
            flight_number: firstSegment.flight_number,
            origin: firstSegment.departure.airport,
            destination: lastSegment.arrival.airport,
            departure_time: firstSegment.departure.time,
            arrival_time: lastSegment.arrival.time,
            duration: flight.itinerary[0].duration || 0,
            itinerary: flight.itinerary || [],
            price_details: {
                base_fare: flight.price_details.base_price,
                taxes: flight.price_details.taxes,
                agency_fees: flight.price_details.agency_fees,
                final_price_to_pay: flight.price_details.final_price_to_pay,
                currency: flight.price_details.currency,
            }
        });

        // Nombre de passagers total basé sur la recherche d'origine
        const totalPassengers = searchCriteria.passengers.adults +
            searchCriteria.passengers.children +
            searchCriteria.passengers.infants;

        initPassengersList(totalPassengers);
        router.push("/flights/checkout");
    };

// ----------------------------------------------------------------
    // 🚀 TANSTACK MUTATION AVEC AXIOS (CORRIGÉE)
    // ----------------------------------------------------------------
    const { mutate: initBookingSession, variables } = useMutation({
        mutationFn: async (flight: any) => {
            // Appel à l'aide de votre instance Axios
            const response = await api.post('/flights/booking/session/init');
            // response.data contient le corps JSON renvoyé par Laravel
            return { data: response.data, flight };
        },
        onSuccess: ({ data, flight }) => {
            if (data.status === 'success') {
                // 🔥 Attention au double "data" si votre Laravel renvoie { status: 'success', data: { session_identifier: '...' } }
                const sessionId = data.data?.session_identifier || data.session_identifier;

                if (sessionId) {
                    // 1. On stocke d'abord l'ID de session de manière synchrone
                    setTravelportSessionId(sessionId);
                    // 2. On traite le vol et on redirige vers /checkout
                    handleSelectFlight(flight);
                } else {
                    console.error("Identifiant de session manquant dans la réponse API", data);
                    toast.error("Erreur technique : Session de réservation introuvable.");
                }
            } else {
                toast.error(data.message || "Impossible d'initialiser votre session de réservation.");
            }
        },
        onError: (error: any) => {
            console.error("Erreur lors de l'initialisation TanStack/Axios :", error);
            const apiError = error.response?.data?.message || "Une erreur de communication est survenue.";
            toast.error(apiError);
        }
    });

    if (isPending) {
        return (
            <div className="flex flex-col items-center justify-center p-12 sm:p-24 space-y-6 bg-zinc-50 min-h-[60vh]">
                <div className="relative flex items-center justify-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-200 border-t-[#1d9e4b]" />
                    <Plane className="h-6 w-6 text-[#1d9e4b] absolute animate-pulse" />
                </div>
                <div className="text-center space-y-2 px-4">
                    <h3 className="text-lg sm:text-xl font-bold text-zinc-900">Analyse des offres en cours...</h3>
                    <p className="text-xs sm:text-sm text-zinc-500 max-w-sm">Nous recherchons les meilleurs tarifs et les itinéraires les plus rapides pour votre voyage.</p>
                </div>
            </div>
        );
    }

    const FilterContent = () => (
        <div className="space-y-6 text-left">
            <div className="space-y-3">
                <h4 className="font-semibold text-xs text-zinc-500 uppercase tracking-wide">Nombre d&apos;escales</h4>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 text-sm font-medium text-zinc-700 cursor-pointer">
                        <Checkbox id="direct" className="rounded-md border-zinc-300 data-[state=checked]:bg-[#1d9e4b] data-[state=checked]:border-[#1d9e4b]" /> <span>Vols directs</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-zinc-700 cursor-pointer">
                        <Checkbox id="1stop" className="rounded-md border-zinc-300 data-[state=checked]:bg-[#1d9e4b] data-[state=checked]:border-[#1d9e4b]" /> <span>1 escale</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-zinc-700 cursor-pointer">
                        <Checkbox id="2stops" className="rounded-md border-zinc-300 data-[state=checked]:bg-[#1d9e4b] data-[state=checked]:border-[#1d9e4b]" /> <span>2 escales ou plus</span>
                    </label>
                </div>
            </div>

            <hr className="border-zinc-100" />

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-xs text-zinc-500 uppercase tracking-wide">Budget maximum</h4>
                    <span className="text-sm font-bold text-zinc-900">{maxPrice.toLocaleString()} F</span>
                </div>
                <Slider
                    defaultValue={[maxPrice]}
                    max={2500000}
                    step={25000}
                    onValueChange={(val) => setMaxPrice(val[0])}
                    className="py-2"
                />
            </div>

            <hr className="border-zinc-100" />

            <div className="space-y-3">
                <h4 className="font-semibold text-xs text-zinc-500 uppercase tracking-wide">Compagnies aériennes</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                    {uniqueAirlines.length === 0 ? (
                        <p className="text-xs text-zinc-400 italic">Aucune compagnie disponible</p>
                    ) : (
                        uniqueAirlines.map((airline, idx) => (
                            <label key={idx} className="flex items-center gap-3 text-sm font-medium text-zinc-700 cursor-pointer">
                                <Checkbox id={`airline-${idx}`} className="rounded-md border-zinc-300 data-[state=checked]:bg-[#1d9e4b] data-[state=checked]:border-[#1d9e4b]" /> <span className="truncate">{airline}</span>
                            </label>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6 text-left mb-16 lg:mb-0">

            {/* 1. TOP SUMMARY BAR */}
            <Card className="bg-zinc-900 text-white border-none shadow-md rounded-2xl overflow-hidden">
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 bg-white/10 rounded-xl text-[#1d9e4b] shrink-0">
                            <Plane className="h-5 w-5 sm:h-6 sm:w-6 rotate-45" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-base sm:text-lg font-bold">
                                <span className="uppercase">{searchCriteria.origin}</span>
                                <ArrowRight className="h-4 w-4 text-zinc-400" />
                                <span className="uppercase">{searchCriteria.destination}</span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 truncate max-w-[250px] sm:max-w-none">
                                {searchCriteria.departure_date} {searchCriteria.return_date ? `| ${searchCriteria.return_date}` : ""} • {searchCriteria.passengers.adults + searchCriteria.passengers.children + searchCriteria.passengers.infants} voy.
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setIsEditing(!isEditing)}
                        className={`w-full sm:w-auto transition-colors text-white border-white/20 hover:bg-white/10 h-10 text-xs gap-2 rounded-xl sm:rounded-lg ${
                            isEditing ? "bg-red-600/20 border-red-500/30 hover:bg-red-600/30" : "bg-transparent"
                        }`}
                    >
                        {isEditing ? (
                            <>
                                <X className="h-3.5 w-3.5" /> Fermer
                            </>
                        ) : (
                            <>
                                <Edit3 className="h-3.5 w-3.5" /> Modifier la recherche
                            </>
                        )}
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
                        className="overflow-hidden w-full bg-zinc-50 rounded-2xl border border-zinc-200/60 shadow-inner"
                    >
                        <div className="p-1 sm:p-2">
                            <SearchFlight />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                <aside className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-zinc-200 p-5 space-y-6 sticky top-20 shadow-sm">
                    <div className="flex justify-between items-center border-b pb-3">
                        <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <SlidersHorizontal className="h-4 w-4 text-[#1d9e4b]" /> Filtres
                        </h3>
                        <button className="text-xs font-semibold text-zinc-400 hover:text-[#1d9e4b] transition-colors">Effacer tout</button>
                    </div>
                    <FilterContent />
                </aside>

                <section className="lg:col-span-9 space-y-4">

                    <div className="flex justify-between items-center px-1">
                        <p className="text-xs sm:text-sm text-zinc-500 font-medium">
                            <span className="text-zinc-900 font-bold">{flights.length}</span> propositions de vols
                        </p>

                        <div className="flex items-center gap-2">
                            <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm" className="lg:hidden flex items-center gap-2 h-9 text-xs font-semibold px-3 border-zinc-200 rounded-xl bg-white text-zinc-700">
                                        <SlidersHorizontal className="h-3.5 w-3.5 text-[#1d9e4b]" />
                                        Filtres
                                    </Button>
                                </SheetTrigger>

                                <SheetContent side="bottom" className="rounded-t-3xl h-[85vh] p-0 bg-white border-t flex flex-col overflow-hidden">
                                    <SheetHeader className="flex flex-row justify-between items-center p-4 sm:p-6 pb-4 border-b border-zinc-100 shrink-0">
                                        <SheetTitle className="text-base font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-wide">
                                            <SlidersHorizontal className="h-4 w-4 text-[#1d9e4b]" /> Filtres de recherche
                                        </SheetTitle>
                                        <button type="button" className="text-xs font-bold text-zinc-400 hover:text-[#1d9e4b] mr-6">Effacer tout</button>
                                    </SheetHeader>

                                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                                        <FilterContent />
                                    </div>

                                    <div className="p-4 border-t border-zinc-100 bg-white shrink-0 pb-safe-bottom">
                                        <Button className="w-full bg-[#1d9e4b] hover:bg-[#167f3c] text-white font-bold h-12 rounded-xl" onClick={() => setIsMobileFilterOpen(false)}>
                                            Appliquer les filtres
                                        </Button>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 bg-zinc-100 px-3 py-2 rounded-xl sm:rounded-lg cursor-pointer hover:bg-zinc-200/70 transition-colors h-9">
                                <span>Trier</span>
                                <ChevronDown className="h-3 w-3 text-zinc-400" />
                            </div>
                        </div>
                    </div>

                    {flights.length === 0 ? (
                        <Card className="p-12 text-center border-dashed border-2 rounded-2xl">
                            <CardContent className="p-0 flex flex-col items-center space-y-3">
                                <Info className="h-8 w-8 text-zinc-300" />
                                <h3 className="font-bold text-zinc-800 text-base">Aucun vol trouvé</h3>
                                <p className="text-xs text-zinc-400 max-w-xs">Modifiez vos critères ou élargissez vos filtres de prix.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        flights.map((flight) => (
                            <FlightCard
                                key={flight.id}
                                flight={flight}
                                formatDuration={formatDuration}
                                // On déclenche directement la mutation TanStack ici
                                handleSelectFlight={() => initBookingSession(flight)}
                                // `variables` contient le paramètre de la mutation courante.
                                // Si variables.id correspond à ce vol, alors ce FlightCard passe en mode loader.
                                isBooking={variables?.id === flight.id}
                            />
                        ))
                    )}
                </section>

            </div>
        </div>
    );
}