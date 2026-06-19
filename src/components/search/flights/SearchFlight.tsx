"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { fr, enUS, Locale } from "date-fns/locale";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import {Plane, Calendar as CalendarIcon, Users, Minus, Plus, Trash2, PlusCircle, ChevronDown} from "lucide-react";

interface PassengerConfig {
    adults: number;
    children: number;
    infants: number;
}

interface FlightSegment {
    origin: string;
    destination: string;
    departure_date: string;
}

interface ExtendedSearchFormValues {
    trip_type: "one_way" | "round_trip" | "multi_city";
    passengers: PassengerConfig;
    return_date?: string;
    segments: FlightSegment[];
}

export default function SearchFlight() {
    const router = useRouter();
    const t = useTranslations("Flight");
    const tCounter = useTranslations("GuestCounter");
    const tCalendar = useTranslations("DateRangePicker");
    const locale = useLocale();

    const dateFnsLocale = React.useMemo<Locale>(() => (locale === "fr" ? fr : enUS), [locale]);

    // 1. Initialisation du Formulaire avec React Hook Form
    const form = useForm<ExtendedSearchFormValues>({
        defaultValues: {
            trip_type: "round_trip",
            passengers: { adults: 1, children: 0, infants: 0 },
            return_date: "",
            segments: [{ origin: "", destination: "", departure_date: "" }]
        },
    });

    const { watch, setValue, control, handleSubmit } = form;
    const tripType = watch("trip_type");
    const passengers = watch("passengers");

    // Gestion dynamique des segments pour le Multi-Destination
    const { fields, append, remove } = useFieldArray({
        control,
        name: "segments",
    });

    const handleTripTypeChange = (type: "one_way" | "round_trip" | "multi_city") => {
        setValue("trip_type", type);
        if (type !== "multi_city" && fields.length > 1) {
            const firstSegment = form.getValues("segments")[0];
            setValue("segments", [firstSegment]);
        }
    };

    // 2. Traitement de la soumission et construction de la Query String
    const onSubmit = (values: ExtendedSearchFormValues) => {
        const searchParams = new URLSearchParams();

        searchParams.set("trip_type", values.trip_type);
        searchParams.set("adults", values.passengers.adults.toString());
        searchParams.set("children", values.passengers.children.toString());
        searchParams.set("infants", values.passengers.infants.toString());

        if (values.trip_type === "round_trip" && values.return_date) {
            searchParams.set("return_date", values.return_date);
        }

        // Pour les segments, on extrait le premier pour une lecture simple à la Wakanow
        // ou on passe des index si votre page de destination gère le multi-city complet.
        if (values.segments && values.segments.length > 0) {
            searchParams.set("origin", values.segments[0].origin);
            searchParams.set("destination", values.segments[0].destination);
            searchParams.set("departure_date", values.segments[0].departure_date);

            // Si multi-destination, on serialize le reste des segments en JSON ou index séparés
            if (values.trip_type === "multi_city") {
                searchParams.set("all_segments", JSON.stringify(values.segments));
            }
        }

        // Redirection vers la page de recherche avec les paramètres construits
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

                        {/* COMPTEUR DE PASSAGERS AVANCÉ */}
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
                                        {/* ADULTES */}
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

                                        {/* ENFANTS */}
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

                                        {/* BÉBÉS */}
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

                                    {/* CONTENEUR ORIGINE / DESTINATION (Côte à côte sur mobile) */}
                                    <div className="grid grid-cols-2 lg:contents gap-3">
                                        {/* ORIGINE */}
                                        <div className="lg:col-span-3">
                                            <FormField
                                                control={control}
                                                name={`segments.${index}.origin`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-zinc-500 text-[11px] sm:text-xs uppercase tracking-wider font-semibold">Départ (IATA)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ex: DLA" maxLength={3} className="uppercase font-bold h-12 bg-white rounded-xl lg:rounded-lg" {...field} />
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
                                                    <FormItem>
                                                        <FormLabel className="text-zinc-500 text-[11px] sm:text-xs uppercase tracking-wider font-semibold">Arrivée (IATA)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ex: CDG" maxLength={3} className="uppercase font-bold h-12 bg-white rounded-xl lg:rounded-lg" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* CONTENEUR DATES (Côte à côte sur mobile pour Aller-Retour) */}
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
                                <Button type="submit" className="w-full lg:w-48 h-12 bg-[#15a4e6] hover:bg-[#167f3c] text-white font-bold transition-colors shadow-md rounded-xl text-base">
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