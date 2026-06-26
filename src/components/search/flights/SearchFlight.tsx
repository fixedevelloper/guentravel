"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from '@tanstack/react-query';
import { useForm, useFieldArray } from "react-hook-form";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { fr, enUS, Locale } from "date-fns/locale";
import { useDebounce } from "use-debounce";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Icons
import { Plane, Calendar as CalendarIcon, Users, Minus, Plus, Trash2, PlusCircle, ChevronDown, Loader2 } from "lucide-react";
import { api } from "../../../core/api/axios-instance";

// 🔥 ÉTAPE 1 : Import ou écriture locale du hook d'extraction pour la réhydratation
function useFlightSearchParams() {
    const searchParams = useSearchParams();

    const adults = parseInt(searchParams.get("adults") || "1", 10);
    const children = parseInt(searchParams.get("children") || "0", 10);
    const infants = parseInt(searchParams.get("infants") || "0", 10);
    const trip_type = (searchParams.get("trip_type") || "round_trip") as "one_way" | "round_trip" | "multi_city";
    const return_date = searchParams.get("return_date") || "";

    const segments: FlightSegment[] = [];

    if (trip_type === "multi_city") {
        let index = 0;
        while (searchParams.has(`origin[${index}]`)) {
            segments.push({
                origin: searchParams.get(`origin[${index}]`) || "",
                destination: searchParams.get(`destination[${index}]`) || "",
                departure_date: searchParams.get(`departure_date[${index}]`) || "",
            });
            index++;
        }
    }

    if (segments.length === 0) {
        segments.push({
            origin: searchParams.get("origin") || "",
            destination: searchParams.get("destination") || "",
            departure_date: searchParams.get("departure_date") || "",
        });
    }

    return { trip_type, return_date, passengers: { adults, children, infants }, segments };
}

interface PassengerConfig { adults: number; children: number; infants: number; }
interface FlightSegment { origin: string; destination: string; departure_date: string; }
interface ExtendedSearchFormValues { trip_type: "one_way" | "round_trip" | "multi_city"; passengers: PassengerConfig; return_date?: string; segments: FlightSegment[]; }
interface Airport { airport_code: string; airport_name: string; city: string; country: string; }

export default function SearchFlight() {
    const router = useRouter();
    const t = useTranslations("Flight");
    const locale = useLocale();

    const dateFnsLocale = React.useMemo<Locale>(() => (locale === "fr" ? fr : enUS), [locale]);

    // 🔥 ÉTAPE 2 : Récupération des paramètres d'URL actuels
    const urlParams = useFlightSearchParams();

    // 🔥 ÉTAPE 3 : Injection des paramètres d'URL comme defaultValues
    const form = useForm<ExtendedSearchFormValues>({
        defaultValues: {
            trip_type: urlParams.trip_type,
            passengers: urlParams.passengers,
            return_date: urlParams.return_date,
            segments: urlParams.segments
        },
    });

    const { watch, setValue, control, handleSubmit, reset } = form;
    const tripType = watch("trip_type");
    const passengers = watch("passengers");

    const { fields, append, remove } = useFieldArray({
        control,
        name: "segments",
    });

// 🔥 ÉTAPE 4 : Écouter et synchroniser les changements d'URL externes (Bouton retour, etc.)
// On sérialise les objets pour éviter que React ne recrée la dépendance à chaque rendu.
    const serializedSegments = JSON.stringify(urlParams.segments);
    const serializedPassengers = JSON.stringify(urlParams.passengers);

    React.useEffect(() => {
        reset({
            trip_type: urlParams.trip_type,
            passengers: urlParams.passengers,
            return_date: urlParams.return_date,
            segments: urlParams.segments
        });
    }, [
        urlParams.trip_type,
        urlParams.return_date,
        serializedPassengers, // 🟢 Utilisation de la version sérialisée stable
        serializedSegments,   // 🟢 Utilisation de la version sérialisée stable
        reset
    ]);

    const handleTripTypeChange = (type: "one_way" | "round_trip" | "multi_city") => {
        setValue("trip_type", type);
        if (type !== "multi_city" && fields.length > 1) {
            const firstSegment = form.getValues("segments")[0];
            setValue("segments", [firstSegment]);
        }
    };

    const onSubmit = (values: ExtendedSearchFormValues) => {
        const searchParams = new URLSearchParams();
        searchParams.set("trip_type", values.trip_type);
        searchParams.set("adults", values.passengers.adults.toString());
        searchParams.set("children", values.passengers.children.toString());
        searchParams.set("infants", values.passengers.infants.toString());

        if (values.trip_type === "round_trip" && values.return_date) {
            searchParams.set("return_date", values.return_date);
        }

        if (values.segments && values.segments.length > 0) {
            if (values.trip_type === "multi_city") {
                values.segments.forEach((segment, index) => {
                    searchParams.set(`origin[${index}]`, segment.origin);
                    searchParams.set(`destination[${index}]`, segment.destination);
                    searchParams.set(`departure_date[${index}]`, segment.departure_date);
                });
            } else {
                searchParams.set("origin", values.segments[0].origin);
                searchParams.set("destination", values.segments[0].destination);
                searchParams.set("departure_date", values.segments[0].departure_date);
            }
        }

        router.push(`/flights/search-results?${searchParams.toString()}`);
    };

    const totalPassengers = passengers.adults + passengers.children + passengers.infants;

    return (
        <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 space-y-6 md:space-y-8 text-left mb-20 md:mb-0">
            <Card className="shadow-xl border-t-4 border-[#15a4e6] bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-4 sm:p-6 space-y-6">

                    {/* TYPE DE VOYAGE & PASSAGERS */}
                    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 border-b pb-4">
                        <Tabs value={tripType} onValueChange={(v) => handleTripTypeChange(v as any)} className="w-full lg:w-auto">
                            <TabsList className="bg-zinc-100 w-full justify-start sm:w-auto overflow-x-auto flex">
                                <TabsTrigger value="round_trip" className="flex-1 sm:flex-initial data-[state=active]:bg-[#15a4e6] data-[state=active]:text-white text-xs sm:text-sm">Aller-retour</TabsTrigger>
                                <TabsTrigger value="one_way" className="flex-1 sm:flex-initial data-[state=active]:bg-[#15a4e6] data-[state=active]:text-white text-xs sm:text-sm">Aller simple</TabsTrigger>
                                <TabsTrigger value="multi_city" className="flex-1 sm:flex-initial data-[state=active]:bg-[#15a4e6] data-[state=active]:text-white text-xs sm:text-sm">Multi-ville</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* COMPTEUR DE PASSAGERS */}
                        <FormField
                            control={control}
                            name="passengers"
                            render={({ field }) => (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="h-11 lg:h-10 justify-between sm:justify-start gap-2 text-sm font-medium border-zinc-200 w-full sm:w-auto rounded-xl sm:rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Users className="text-[#15a4e6] h-4 w-4" />
                                                <span>{totalPassengers} {totalPassengers > 1 ? "Voyageurs" : "Voyageur"}</span>
                                            </div>
                                            <ChevronDown className="h-4 w-4 text-zinc-400 sm:hidden" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full sm:w-72 p-4 space-y-4" align="end">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-sm text-zinc-950">Adultes</p>
                                                <p className="text-xs text-zinc-500">12 ans et plus</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-full" disabled={field.value.adults <= 1} onClick={() => field.onChange({ ...field.value, adults: field.value.adults - 1 })}>
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-4 text-center text-sm font-bold">{field.value.adults}</span>
                                                <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => field.onChange({ ...field.value, adults: field.value.adults + 1 })}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-sm text-zinc-950">Enfants</p>
                                                <p className="text-xs text-zinc-500">De 2 à 11 ans</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-full" disabled={field.value.children <= 0} onClick={() => field.onChange({ ...field.value, children: field.value.children - 1 })}>
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-4 text-center text-sm font-bold">{field.value.children}</span>
                                                <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => field.onChange({ ...field.value, children: field.value.children + 1 })}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-sm text-zinc-950">Bébés</p>
                                                <p className="text-xs text-zinc-500">Moins de 2 ans</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-full" disabled={field.value.infants <= 0} onClick={() => field.onChange({ ...field.value, infants: field.value.infants - 1 })}>
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-4 text-center text-sm font-bold">{field.value.infants}</span>
                                                <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => field.onChange({ ...field.value, infants: Math.min(field.value.adults, field.value.infants + 1) })}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                    </div>

                    {/* FORMULAIRE PRINCIPAL */}
                    <Form {...form}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {fields.map((segmentField, index) => (
                                <div key={segmentField.id} className="flex flex-col lg:grid lg:grid-cols-12 gap-3 sm:gap-4 items-stretch lg:items-end bg-zinc-50/70 p-3 sm:p-4 rounded-xl border border-zinc-100 relative">

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:contents gap-3">
                                        {/* ORIGINE */}
                                        <div className="lg:col-span-3">
                                            <FormField
                                                control={control}
                                                name={`segments.${index}.origin`}
                                                render={({ field }) => (
                                                    <FormItem className="relative">
                                                        <FormLabel className="text-zinc-500 text-[11px] sm:text-xs uppercase tracking-wider font-semibold">Départ</FormLabel>
                                                        <FormControl>
                                                            <AirportAutocomplete
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                placeholder="Ville ou Aéroport de départ"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* DESTINATION */}
                                        <div className="lg:col-span-3">
                                            <FormField
                                                control={control}
                                                name={`segments.${index}.destination`}
                                                render={({ field }) => (
                                                    <FormItem className="relative">
                                                        <FormLabel className="text-zinc-500 text-[11px] sm:text-xs uppercase tracking-wider font-semibold">Arrivée</FormLabel>
                                                        <FormControl>
                                                            <AirportAutocomplete
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                placeholder="Ville ou Aéroport d'arrivée"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className={`grid ${tripType === "round_trip" ? "grid-cols-2" : "grid-cols-1"} lg:contents gap-3`}>
                                        {/* DATE DE DÉPART */}
                                        <div className={tripType === "round_trip" ? "lg:col-span-3" : "lg:col-span-5"}>
                                            <FormField
                                                control={control}
                                                name={`segments.${index}.departure_date`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel className="text-zinc-500 text-[11px] sm:text-xs uppercase tracking-wider font-semibold mb-1">Départ</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button variant="outline" className={`w-full h-12 text-left font-medium justify-start gap-2 bg-white rounded-xl lg:rounded-lg ${!field.value && "text-zinc-400"}`}>
                                                                        <CalendarIcon className="h-4 w-4 text-[#15a4e6] shrink-0" />
                                                                        <span className="truncate text-xs sm:text-sm">
                                                                            {field.value ? format(new Date(field.value), "dd LLL yyyy", { locale: dateFnsLocale }) : <span>Choisir</span>}
                                                                        </span>
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={field.value ? new Date(field.value) : undefined}
                                                                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                                                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                                                    locale={dateFnsLocale}
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* DATE DE RETOUR */}
                                        {tripType === "round_trip" && index === 0 && (
                                            <div className="lg:col-span-3">
                                                <FormField
                                                    control={control}
                                                    name="return_date"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel className="text-zinc-500 text-[11px] sm:text-xs uppercase tracking-wider font-semibold mb-1">Retour</FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button variant="outline" className={`w-full h-12 text-left font-medium justify-start gap-2 bg-white rounded-xl lg:rounded-lg ${!field.value && "text-zinc-400"}`}>
                                                                            <CalendarIcon className="h-4 w-4 text-[#15a4e6] shrink-0" />
                                                                            <span className="truncate text-xs sm:text-sm">
                                                                                {field.value ? format(new Date(field.value), "dd LLL yyyy", { locale: dateFnsLocale }) : <span>Choisir</span>}
                                                                            </span>
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={field.value ? new Date(field.value) : undefined}
                                                                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                                                        disabled={(date) => {
                                                                            const depDateStr = watch("segments.0.departure_date");
                                                                            const minDate = depDateStr ? new Date(depDateStr) : new Date();
                                                                            return date < minDate;
                                                                        }}
                                                                        locale={dateFnsLocale}
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* RETRAIT SEGMENT MULTI-CITY */}
                                    {tripType === "multi_city" && fields.length > 1 && (
                                        <div className="lg:col-span-1 flex justify-end lg:justify-center mt-1 lg:mt-0 lg:pb-2">
                                            <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 w-full lg:w-auto h-10 lg:h-10 rounded-xl" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4 mr-2 lg:mr-0" />
                                                <span className="lg:hidden text-xs">Supprimer cette étape</span>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* AJOUT SEGMENT MULTI-CITY */}
                            {tripType === "multi_city" && fields.length < 5 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full lg:w-auto text-[#15a4e6] border-[#15a4e6]/30 hover:bg-[#15a4e6]/10 gap-2 mt-2 h-11 rounded-xl text-sm font-semibold"
                                    onClick={() => append({ origin: "", destination: "", departure_date: "" })}
                                >
                                    <PlusCircle className="h-4 w-4" /> Ajouter un vol / une destination
                                </Button>
                            )}

                            {/* BOUTON RECHERCHER */}
                            <div className="flex justify-end pt-4 border-t">
                                <Button type="submit" className="w-full lg:w-48 h-12 bg-[#15a4e6] hover:bg-[#1182b8] text-white font-bold transition-colors shadow-md rounded-xl text-base">
                                    Rechercher
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

interface Airport {
    airport_code: string;
    airport_name: string;
    city: string;
    country: string;
}

interface AutocompleteProps {
    value: string;
    onChange: (code: string) => void;
    placeholder?: string;
}

function AirportAutocomplete({ value, onChange, placeholder }: AutocompleteProps) {
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Un seul état pour piloter le champ de saisie
    const [searchTerm, setSearchTerm] = React.useState("");
    const [debouncedSearch] = useDebounce(searchTerm, 300);

    // TanStack Query gère entièrement le statut et le cache
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['airports', debouncedSearch],
        queryFn: async ({ signal }) => {
            if (debouncedSearch.length < 2) return null;

            const res = await api.get('/airports/search', {
                params: { q: debouncedSearch },
                signal
            });
            return res.data;
        },
        enabled: debouncedSearch.length >= 2,
        staleTime: 1000 * 60 * 5, // Cache de 5 minutes
    });

    // Extraction propre des résultats sans collision de variables
    const results: Airport[] = data?.success && data?.results ? data.results : [];
    const isSearching = isLoading || isFetching;

    // Fermer la liste si clic à l'extérieur
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative flex items-center">
                <Input
                    type="text"
                    placeholder={placeholder}
                    // Affiche la saisie en cours si ouvert, sinon la valeur sélectionnée
                    value={open ? searchTerm : value}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => {
                        setSearchTerm(value);
                        setOpen(true);
                    }}
                    className="font-bold h-12 bg-white rounded-xl lg:rounded-lg pr-10"
                />

                {isSearching && (
                    <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-zinc-400" />
                )}

                {!isSearching && value && !open && (
                    <span className="absolute right-3 text-xs bg-zinc-100 text-zinc-600 font-black px-1.5 py-0.5 rounded border uppercase">
                        {value}
                    </span>
                )}
            </div>

            {/* Fenêtre flottante de résultats */}
            {open && (searchTerm.length >= 2 || results.length > 0) && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1">
                    {isSearching && results.length === 0 && (
                        <div className="p-3 text-sm text-zinc-500 text-center flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-[#15a4e6]" />
                            Recherche en cours...
                        </div>
                    )}

                    {!isSearching && results.length === 0 && (
                        <div className="p-3 text-sm text-zinc-400 text-center">
                            Aucun aéroport trouvé
                        </div>
                    )}

                    {results.map((airport) => (
                        <button
                            key={airport.airport_code}
                            type="button"
                            className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center justify-between gap-4 border-b border-zinc-50 last:border-0 transition-colors"
                            onClick={() => {
                                // Envoie le code IATA au parent/formulaire (ex: 'DLA')
                                onChange(airport.airport_code);
                                // Met à jour le texte affiché localement pour plus de clarté
                                setSearchTerm(`${airport.city} (${airport.airport_code})`);
                                setOpen(false);
                            }}
                        >
                            <div className="truncate">
                                <p className="font-bold text-sm text-zinc-900 truncate">
                                    {airport.city}, {airport.country}
                                </p>
                                <p className="text-xs text-zinc-500 truncate">
                                    {airport.airport_name}
                                </p>
                            </div>
                            <span className="font-black text-xs text-[#15a4e6] bg-[#15a4e6]/10 px-2 py-1 rounded shrink-0 uppercase tracking-wider">
                                {airport.airport_code}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}