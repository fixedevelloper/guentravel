'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Luggage, ShieldCheck, Loader2, Utensils, Armchair } from 'lucide-react'
import { api } from "../../../../../core/api/axios-instance"

interface ServiceItem {
    service_id:       string;
    description:      string;
    fare_description: string | null;
    checkin_type:     string;
    is_mandatory:     boolean;
    min_quantity:     number;
    max_quantity:     number;
    amount:           number;
    currency:         string;
}

interface BaggageGroup {
    behavior:         string;
    is_multi_select:  boolean;
    services:         ServiceItem[];
}

interface MealGroup {
    behavior:         string;
    is_multi_select:  boolean;
    segments:         ServiceItem[][];
}

interface Seat {
    service_id:   string;
    seat_code:    string;
    seat_no:      string;
    row_no:       string;
    seat_type:    { code: number; text: string };
    is_available: boolean;
    is_reserved:  boolean;
    amount:       number;
    currency:     string;
    from:         string;
    to:           string;
    flight_number:string;
}

interface SeatRow   { row_no: number; seats: Seat[] }
interface SeatDeck  { deck_no: number; rows: SeatRow[] }
interface SeatSegment { direction: string; segment_idx: number; decks: SeatDeck[] }

interface ExtraServicesData {
    baggage: BaggageGroup[];
    meals:   MealGroup[];
    seats:   SeatSegment[];
}

type Props = {
    sessionId:            string;
    fareSourceCode:       string;
    selectedFlight:       any;
    insuranceSelected:    boolean;
    setInsuranceSelected: (value: boolean) => void;
    extraBaggage:         number;
    setExtraBaggage:      (value: number) => void;
    outboundMeal:         string;
    setOutboundMeal:      (value: string) => void;
    inboundMeal:          string;
    setInboundMeal:       (value: string) => void;
    onOpenSeatMap?:       (segmentIdx: number) => void;
    selectedSeatCode?:    Record<number, string>;
    onBack:               () => void;
    onNext:               () => void;
}

export function CheckoutStepOptions({
                                        sessionId,
                                        fareSourceCode,
                                        selectedFlight,
                                        insuranceSelected,
                                        setInsuranceSelected,
                                        extraBaggage,
                                        setExtraBaggage,
                                        outboundMeal,
                                        setOutboundMeal,
                                        inboundMeal,
                                        setInboundMeal,
                                        onOpenSeatMap,
                                        selectedSeatCode,
                                        onBack,
                                        onNext,
                                    }: Props) {

    const { data, isPending, error } = useQuery<ExtraServicesData>({
        queryKey: ['flight-extra-services', sessionId, fareSourceCode],
        queryFn: async () => {
            const res = await api.post('/flights/extra-services', {
                session_id:       sessionId,
                fare_source_code: fareSourceCode,
            });

            if (!res.data.success) {
                throw new Error(res.data.message ?? 'Erreur services supplémentaires');
            }

            return res.data.data as ExtraServicesData;
        },
        enabled: !!sessionId && !!fareSourceCode,
        retry: 1,
    });

    // Aplatissement de TOUS les segments de l'itinéraire (Aller et Retour confondus)
    const allSegments = selectedFlight?.itinerary?.flatMap((it: any) => it.segments || []) || [];

    const outboundBaggage = data?.baggage.find((b) => b.behavior === 'PER_PAX_OUTBOUND');
    const baggageServices = outboundBaggage?.services ?? [];

    const outboundMeals = data?.meals
        .find((m) => m.behavior === 'PER_PAX_PER_SEGMENT_OUTBOUND')
        ?.segments.flat()
        .filter((m) => m.description !== '') ?? [];

    const inboundMeals = data?.meals
        .find((m) => m.behavior === 'PER_PAX_PER_SEGMENT_INBOUND')
        ?.segments.flat()
        .filter((m) => m.description !== '') ?? [];

    const hasSeats = (data?.seats ?? []).some(
        (seg) => seg.decks.some((d) => d.rows.length > 0)
    );

    const selectedBaggageService = baggageServices[0];

    return (
        <motion.div
            key="step2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-5"
        >
            {isPending && (
                <Card className="border-zinc-200 shadow-sm p-8 text-center flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 text-[#15a4e6] animate-spin" />
                    <p className="text-sm text-zinc-500 font-medium">
                        Analyse des options disponibles pour votre vol...
                    </p>
                </Card>
            )}

            {error && !isPending && (
                <Card className="border-red-200 bg-red-50/50 p-4 text-center">
                    <p className="text-sm text-red-600 font-medium">
                        Options de vol indisponibles pour le moment. Vous pourrez finaliser vos choix à l'aéroport.
                    </p>
                </Card>
            )}

            {!isPending && !error && (
                <>
                    {/* 1. BAGAGES */}
                    {baggageServices.length > 0 && (
                        <Card className="border-zinc-200 shadow-sm">
                            <CardContent className="p-5 flex justify-between items-center gap-4">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                        <Luggage className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 text-sm">
                                            Bagages en soute additionnels
                                        </h4>
                                        <p className="text-xs text-zinc-400 mt-0.5">
                                            {selectedBaggageService?.description}
                                            {selectedBaggageService && (
                                                <span className="ml-2 font-semibold text-emerald-600">
                                                    {selectedBaggageService.amount} {selectedBaggageService.currency}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 border border-zinc-200 rounded-lg p-1 bg-zinc-50">
                                    <button
                                        type="button"
                                        onClick={() => setExtraBaggage(Math.max(0, extraBaggage - 1))}
                                        className="h-8 w-8 font-bold bg-white rounded border border-zinc-200 hover:bg-zinc-100 text-sm"
                                    >
                                        −
                                    </button>
                                    <span className="w-6 text-center text-sm font-bold text-zinc-800">
                                        {extraBaggage}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setExtraBaggage(
                                            Math.min(selectedBaggageService?.max_quantity ?? 2, extraBaggage + 1)
                                        )}
                                        className="h-8 w-8 font-bold bg-white rounded border border-zinc-200 hover:bg-zinc-100 text-sm"
                                    >
                                        +
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* 2. SIÈGES */}
                    {hasSeats && onOpenSeatMap && allSegments.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
                                Choix des sièges par trajet
                            </h3>

                            {/* CORRECTION : Boucle sur la liste aplatie de tous les segments */}
                            {allSegments.map((segment: any, idx: number) => {
                                const currentSeat = selectedSeatCode?.[idx];

                                return (
                                    <Card key={idx} className="border-zinc-200 shadow-sm bg-gradient-to-r from-zinc-50 to-white">
                                        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex gap-4 items-center">
                                                <div className={`p-3 rounded-xl ${currentSeat ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                    <Armchair className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded uppercase">
                                                            Vol {idx + 1} ({segment?.direction === 'outbound' ? 'Aller' : 'Retour'})
                                                        </span>
                                                        <h4 className="font-bold text-zinc-900 text-xs">
                                                            {segment?.departure?.airport} → {segment?.arrival?.airport}
                                                        </h4>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 mt-1">
                                                        {currentSeat
                                                            ? `Siège sélectionné : `
                                                            : "Aucun siège sélectionné pour ce vol"
                                                        }
                                                        {currentSeat && <span className="font-black text-indigo-600">{currentSeat}</span>}
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => onOpenSeatMap(idx)}
                                                className={`font-semibold rounded-xl text-xs px-4 h-9 ${
                                                    currentSeat
                                                        ? "border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                                                        : "border-indigo-200 hover:bg-indigo-50 text-indigo-600"
                                                }`}
                                            >
                                                {currentSeat ? "Modifier" : "Choisir un siège"}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}

                    {/* 3. REPAS */}
                    {(outboundMeals.length > 0 || inboundMeals.length > 0) && (
                        <Card className="border-zinc-200 shadow-sm">
                            <CardContent className="p-5 space-y-5">
                                <div className="flex gap-4 items-center">
                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                        <Utensils className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 text-sm">
                                            Préférences de repas à bord
                                        </h4>
                                        <p className="text-xs text-zinc-400 mt-0.5">
                                            Frais intégrés à l'émission du billet.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {outboundMeals.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                                Vol Aller
                                            </Label>
                                            <select
                                                value={outboundMeal}
                                                onChange={(e) => setOutboundMeal(e.target.value)}
                                                className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 focus:border-[#15a4e6] focus:ring-1 focus:ring-[#15a4e6]"
                                            >
                                                <option value="NoMeal">Repas standard / Aucun</option>
                                                {outboundMeals.map((meal) => (
                                                    <option key={meal.service_id} value={meal.service_id}>
                                                        {meal.description} — {meal.amount} {meal.currency}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {inboundMeals.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                                Vol Retour
                                            </Label>
                                            <select
                                                value={inboundMeal}
                                                onChange={(e) => setInboundMeal(e.target.value)}
                                                className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 focus:border-[#15a4e6] focus:ring-1 focus:ring-[#15a4e6]"
                                            >
                                                <option value="NoMeal">Repas standard / Aucun</option>
                                                {inboundMeals.map((meal) => (
                                                    <option key={meal.service_id} value={meal.service_id}>
                                                        {meal.description} — {meal.amount} {meal.currency}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* 4. ASSURANCE */}
            <Card className={`border transition-colors shadow-sm ${insuranceSelected ? 'border-blue-500 bg-blue-50/10' : 'border-zinc-200'}`}>
                <CardContent className="p-5 flex items-start gap-4">
                    <Checkbox
                        id="insurance"
                        checked={insuranceSelected}
                        onCheckedChange={(checked) => setInsuranceSelected(!!checked)}
                        className="mt-1"
                    />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div className="md:col-span-3">
                            <Label htmlFor="insurance" className="font-bold text-zinc-900 text-sm flex items-center gap-2 cursor-pointer">
                                <ShieldCheck className="h-4 w-4 text-blue-600" />
                                Ajouter une Assurance Multirisque
                            </Label>
                            <p className="text-xs text-zinc-400 mt-1">
                                Couverture complète : assistance médicale d&apos;urgence et perte de bagages.
                            </p>
                        </div>
                        <div className="text-right font-bold text-blue-600 text-sm hidden md:block">
                            12 500 XAF
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="h-12 px-6 rounded-xl text-zinc-600"
                >
                    Retour
                </Button>
                <Button
                    onClick={onNext}
                    disabled={isPending}
                    className="bg-[#15a4e6] hover:bg-[#1182b6] text-white font-bold px-8 h-12 rounded-xl disabled:opacity-50"
                >
                    Procéder au paiement
                </Button>
            </div>
        </motion.div>
    );
}