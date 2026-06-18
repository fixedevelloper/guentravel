"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
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
    Edit3
} from "lucide-react";
import SearchFlight from "../../../../../components/search/flights/SearchFlight";
import {useCartStore} from "../../../../../core/store/useCartStore";
import {useRouter} from "@/i18n/routing";

// Types des données de vol (Sabre Compliant)
interface Segment {
    airline_name: string;
    airline_code: string;
    flight_number: string;
    departure: { airport: string; time: string };
    arrival: { airport: string; time: string };
    duration: number; // en minutes
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

    // État pour afficher/masquer le panneau de modification de recherche
    const [isEditing, setIsEditing] = React.useState<boolean>(false);

    // États pour les filtres locaux
    const [maxPrice, setMaxPrice] = React.useState<number>(1500000);
    const [stopsFilter, setStopsFilter] = React.useState<string[]>([]);
    const [selectedAirlines, setSelectedAirlines] = React.useState<string[]>([]);

    // Extraction des compagnies uniques pour le filtre de recherche
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
    const router = useRouter();

    const handleSelectFlight = (flight: any) => {
        console.log(flight);

        // On extrait le premier et le dernier segment pour calculer les aéroports de départ et de destination finale
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

            // CORRECTION CRITIQUE : Tu dois propager l'itinéraire brut reçu de l'API
            // pour que Laravel puisse valider les segments en soute / cabine
            itinerary: flight.itinerary || [],

            price_details: {
                base_fare: flight.price_details.base_price,
                taxes: flight.price_details.taxes,
                agency_fees: flight.price_details.agency_fees,
                final_price_to_pay: flight.price_details.final_price_to_pay,
                currency: flight.price_details.currency,
            }
        });

        // Initialise la liste selon le nombre de passagers demandés lors de la recherche
        initPassengersList(1);
        router.push("/flights/checkout");
    };
    if (isPending) {
        return (
            <div className="flex flex-col items-center justify-center p-24 space-y-6 bg-zinc-50 min-h-[60vh]">
                <div className="relative flex items-center justify-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-200 border-t-[#1d9e4b]" />
                    <Plane className="h-6 w-6 text-[#1d9e4b] absolute animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-zinc-900">Analyse des offres Sabre en cours...</h3>
                    <p className="text-sm text-zinc-500 max-w-sm">Nous recherchons les meilleurs tarifs et les itinéraires les plus rapides pour votre voyage.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 space-y-6 text-left">

            {/* 1. TOP SUMMARY BAR (BANDEAU RÉCAPITULATIF) */}
            <Card className="bg-zinc-900 text-white border-none shadow-md overflow-hidden">
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-xl text-[#1d9e4b]">
                            <Plane className="h-6 w-6 rotate-45" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-lg font-bold">
                                <span className="uppercase">{searchCriteria.origin}</span>
                                <ArrowRight className="h-4 w-4 text-zinc-400" />
                                <span className="uppercase">{searchCriteria.destination}</span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                {searchCriteria.departure_date} {searchCriteria.return_date ? `| ${searchCriteria.return_date}` : ""} • {searchCriteria.passengers.adults + searchCriteria.passengers.children + searchCriteria.passengers.infants} voyageur(s)
                            </p>
                        </div>
                    </div>

                    {/* Bouton de bascule d'édition */}
                    <Button
                        variant="outline"
                        onClick={() => setIsEditing(!isEditing)}
                        className={`transition-colors text-white border-white/20 hover:bg-white/10 h-10 text-xs gap-2 ${
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

            {/* FORMULAIRE DE RECHERCHE EXTENSIBLE ANIME */}
            <AnimatePresence initial={false}>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden w-full bg-zinc-50 rounded-2xl border border-zinc-200/60 shadow-inner"
                    >
                        <div className="p-2">
                            <SearchFlight />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CONTENU PRINCIPAL : FILTRES + RÉSULTATS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* 2. SIDEBAR FILTERS */}
                <aside className="lg:col-span-3 bg-white rounded-2xl border border-zinc-200 p-5 space-y-6 sticky top-20 shadow-sm">
                    <div className="flex justify-between items-center border-b pb-3">
                        <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <SlidersHorizontal className="h-4 w-4 text-[#1d9e4b]" /> Filtres
                        </h3>
                        <button className="text-xs font-semibold text-zinc-400 hover:text-[#1d9e4b] transition-colors">Effacer tout</button>
                    </div>

                    {/* Filtre Escales */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-xs text-zinc-500 uppercase tracking-wide">Nombre d&apos;escales</h4>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 text-sm font-medium text-zinc-700 cursor-pointer">
                                <Checkbox id="direct" /> <span>Vols directs</span>
                            </label>
                            <label className="flex items-center gap-3 text-sm font-medium text-zinc-700 cursor-pointer">
                                <Checkbox id="1stop" /> <span>1 escale</span>
                            </label>
                            <label className="flex items-center gap-3 text-sm font-medium text-zinc-700 cursor-pointer">
                                <Checkbox id="2stops" /> <span>2 escales ou plus</span>
                            </label>
                        </div>
                    </div>

                    <hr className="border-zinc-100" />

                    {/* Filtre Budget / Prix */}
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
                            className="text-[#1d9e4b]"
                        />
                    </div>

                    <hr className="border-zinc-100" />

                    {/* Filtre Compagnies Aériennes */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-xs text-zinc-500 uppercase tracking-wide">Compagnies aériennes</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                            {uniqueAirlines.length === 0 ? (
                                <p className="text-xs text-zinc-400 italic">Aucune compagnie disponible</p>
                            ) : (
                                uniqueAirlines.map((airline, idx) => (
                                    <label key={idx} className="flex items-center gap-3 text-sm font-medium text-zinc-700 cursor-pointer">
                                        <Checkbox id={`airline-${idx}`} /> <span className="truncate">{airline}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                </aside>

                {/* 3. LISTING DES BILLETS D'AVION */}
                <section className="lg:col-span-9 space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <p className="text-sm text-zinc-500 font-medium">
                            <span className="text-zinc-900 font-bold">{flights.length}</span> propositions de vols trouvées
                        </p>

                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 bg-zinc-100 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-zinc-200/70 transition-colors">
                            <span>Trier par : Moins cher</span>
                            <ChevronDown className="h-3 w-3" />
                        </div>
                    </div>

                    {flights.length === 0 ? (
                        <Card className="p-12 text-center border-dashed border-2">
                            <CardContent className="p-0 flex flex-col items-center space-y-3">
                                <Info className="h-8 w-8 text-zinc-300" />
                                <h3 className="font-bold text-zinc-800 text-base">Aucun vol ne correspond à vos critères</h3>
                                <p className="text-xs text-zinc-400 max-w-xs">Essayez de modifier vos aéroports de destination ou d&apos;élargir vos filtres de prix.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        flights.map((flight) => (
                            <Card key={flight.id} className="overflow-hidden bg-white border border-zinc-200 hover:border-zinc-300 shadow-sm transition-all group">
                                <CardContent className="p-0 grid grid-cols-1 md:grid-cols-12 items-stretch">

                                    {/* BLOC DES ITINÉRAIRES */}
                                    <div className="md:col-span-9 p-6 space-y-6 border-b md:border-b-0 md:border-r border-zinc-100">
                                        {flight.itinerary.map((journey, jIndex) => {
                                            const firstSegment = journey.segments[0];
                                            const lastSegment = journey.segments[journey.segments.length - 1];
                                            const totalDuration = journey.segments.reduce((acc, s) => acc + s.duration, 0);

                                            return (
                                                <div key={jIndex} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative">
                                                    <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1 min-w-[140px]">
                                                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                                                            {firstSegment.airline_name}
                                                        </span>
                                                        <span className="text-[11px] text-zinc-400 font-medium">
                                                            Vol {firstSegment.airline_code} {firstSegment.flight_number}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-6 flex-1 w-full sm:w-auto">
                                                        <div className="text-left">
                                                            <div className="text-xl font-extrabold text-zinc-900">
                                                                {new Date(firstSegment.departure.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            <div className="text-xs font-bold text-zinc-800 uppercase mt-0.5">{firstSegment.departure.airport}</div>
                                                        </div>

                                                        <div className="flex-1 text-center px-4 max-w-[180px]">
                                                            <span className="text-xs font-medium text-zinc-400 flex items-center justify-center gap-1">
                                                                <Clock className="h-3 w-3" /> {formatDuration(totalDuration)}
                                                            </span>
                                                            <div className="relative flex items-center justify-center my-2">
                                                                <div className="w-full border-t-2 border-zinc-200 group-hover:border-zinc-300 transition-colors"></div>
                                                                <Plane className="absolute text-zinc-400 group-hover:text-[#1d9e4b] h-3.5 w-3.5 bg-white px-0.5 transition-colors rotate-45" />
                                                            </div>
                                                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                                journey.stops_count === 0 ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                                                            }`}>
                                                                {journey.stops_count === 0 ? "Direct" : `${journey.stops_count} escale(s)`}
                                                            </span>
                                                        </div>

                                                        <div className="text-right">
                                                            <div className="text-xl font-extrabold text-zinc-900">
                                                                {new Date(lastSegment.arrival.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            <div className="text-xs font-bold text-zinc-800 uppercase mt-0.5">{lastSegment.arrival.airport}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        <div className="flex items-center gap-4 text-xs font-medium text-zinc-400 border-t pt-4">
                                            <span className="flex items-center gap-1.5">
                                                <Briefcase className="h-3.5 w-3.5 text-zinc-400" /> Sac à main cabine inclus
                                            </span>
                                            {flight.baggage_allowance?.checked && (
                                                <span className="flex items-center gap-1.5 text-zinc-600 font-semibold">
                                                    <Luggage className="h-3.5 w-3.5 text-emerald-600" /> Bagage en soute : {flight.baggage_allowance.checked}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* BLOC COMMERCIAL */}
                                    <div className="md:col-span-3 bg-zinc-50/50 p-6 flex flex-col justify-center items-center md:items-end space-y-4">
                                        <div className="text-center md:text-right w-full">
                                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Tarif par voyageur</p>
                                            <div className="mt-1 flex items-baseline justify-center md:justify-end gap-1">
                                                <span className="text-3xl font-black text-zinc-900 tracking-tight">
                                                    {flight.price_details.final_price_to_pay.toLocaleString()}
                                                </span>
                                                <span className="text-xs font-bold text-zinc-500 uppercase">{flight.price_details.currency}</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-400 mt-1 font-medium">Taxes d&apos;aéroport inclues</p>
                                        </div>

                                        <Button onClick={() => handleSelectFlight(flight)}  className="w-full bg-[#1d9e4b] hover:bg-[#167f3c] text-white font-bold h-11 shadow-sm transition-colors rounded-xl">
                                            Choisir ce vol
                                        </Button>
                                    </div>

                                </CardContent>
                            </Card>
                        ))
                    )}
                </section>

            </div>
        </div>
    );
}