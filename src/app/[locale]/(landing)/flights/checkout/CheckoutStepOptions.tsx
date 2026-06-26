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
import {SeatMapDialog} from "./SeatMapDialog";

type Props = {
    sessionId: string
    fareSourceCode: string
    insuranceSelected: boolean
    setInsuranceSelected: (value: boolean) => void
    extraBaggage: number
    setExtraBaggage: (value: number) => void

    // États pour les repas (Aller / Retour)
    outboundMeal: string
    setOutboundMeal: (value: string) => void
    inboundMeal: string
    setInboundMeal: (value: string) => void

    // Action vers la sélection de siège sur plan
    onOpenSeatMap?: () => void
    selectedSeatCode?: string // Exemple : "23A"

    onBack: () => void
    onNext: () => void
}

export function CheckoutStepOptions({
                                        sessionId,
                                        fareSourceCode,
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

    // 1. Récupération des services
    const { data: response, isPending, error } = useQuery({
        queryKey: ['flight-extra-services', sessionId, fareSourceCode],
        queryFn: async () => {
            const res = await api.post('/flights/extra-services', {
                session_id: sessionId,
                fare_source_code: fareSourceCode
            });
            return res.data;
        },
        enabled: !!sessionId && !!fareSourceCode,
    });

    // Extraction robuste selon la structure racine de la réponse
    const servicesData = response?.data?.ExtraServicesData || response?.ExtraServicesData;

    const baggageSectors = servicesData?.DynamicBaggage || [];
    const mealSectors = servicesData?.DynamicMeal || [];
    const seatSectors = servicesData?.DynamicSeat || [];

    // --- BAGAGES ---
    const availableBaggage = baggageSectors[0]?.Services?.[0];

    // --- REPAS (Séparés par Aller / Retour depuis votre JSON) ---
    const outboundSector = mealSectors.find((m: any) => m.Behavior === 'PER_PAX_OUTBOUND');
    const inboundSector = mealSectors.find((m: any) => m.Behavior === 'PER_PAX_INBOUND');

    const outboundMeals = outboundSector?.Services?.filter((m: any) => m.Description !== "") || [];
    const inboundMeals = inboundSector?.Services?.filter((m: any) => m.Description !== "") || [];

    // --- SIÈGES (Vérification de présence pour affichage du bouton) ---
    const hasSeatsAvailable = seatSectors.length > 0 && seatSectors[0]?.DeckSeats?.length > 0;

    return (
        <motion.div
            key="step2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-5"
        >
            {/* ÉTAT CHARGEMENT */}
            {isPending && (
                <Card className="border-zinc-200 shadow-sm p-8 text-center flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 text-[#15a4e6] animate-spin" />
                    <p className="text-sm text-zinc-500 font-medium">
                        Analyse des options de repas et de sièges disponibles pour votre vol...
                    </p>
                </Card>
            )}

            {/* ÉTAT ERREUR */}
            {error && !isPending && (
                <Card className="border-red-200 bg-red-50/50 p-4 text-center">
                    <p className="text-sm text-red-600 font-medium">
                        Options de vol indisponibles pour le moment. Vous pourrez finaliser vos choix à l'aéroport.
                    </p>
                </Card>
            )}

            {!isPending && !error && (
                <>
                    {/* 1. BLOC BAGAGES (Masqué ici car votre JSON renvoie un tableau vide []) */}
                    {availableBaggage && (
                        <Card className="border-zinc-200 shadow-sm">
                            <CardContent className="p-5 flex justify-between items-center gap-4">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                        <Luggage className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 text-sm">Bagages en soute additionnels</h4>
                                        <p className="text-xs text-zinc-400 mt-0.5">{availableBaggage.Description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 border border-zinc-200 rounded-lg p-1 bg-zinc-50">
                                    <button type="button" onClick={() => setExtraBaggage(Math.max(0, extraBaggage - 1))} className="h-8 w-8 font-bold bg-white rounded border border-zinc-200 hover:bg-zinc-100 text-sm">-</button>
                                    <span className="w-6 text-center text-sm font-bold text-zinc-800">{extraBaggage}</span>
                                    <button type="button" onClick={() => setExtraBaggage(Math.min(availableBaggage.MaximumQuantity || 2, extraBaggage + 1))} className="h-8 w-8 font-bold bg-white rounded border border-zinc-200 hover:bg-zinc-100 text-sm">+</button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* 2. BLOC SIÈGES (Bouton d'appel vers votre carte de sièges) */}
                    {hasSeatsAvailable && onOpenSeatMap && (
                        <Card className="border-zinc-200 shadow-sm bg-gradient-to-r from-zinc-50 to-white">
                            <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                        <Armchair className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 text-sm">Sélection du siège à bord</h4>
                                        <p className="text-xs text-zinc-400 mt-0.5">
                                            {selectedSeatCode ? `Siège sélectionné : ${selectedSeatCode}` : "Choisissez votre place (Hublot, Couloir, Issue de secours)."}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onOpenSeatMap}
                                    className="border-indigo-200 hover:bg-indigo-50 text-indigo-600 font-semibold rounded-xl text-xs"
                                >
                                    {selectedSeatCode ? "Modifier le siège" : "Ouvrir le plan de cabine"}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* 3. BLOC REPAS (Gestion dynamique Aller ET Retour) */}
                    {(outboundMeals.length > 0 || inboundMeals.length > 0) && (
                        <Card className="border-zinc-200 shadow-sm">
                            <CardContent className="p-5 space-y-5">
                                <div className="flex gap-4 items-center">
                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                        <Utensils className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 text-sm">Préférences de repas à bord</h4>
                                        <p className="text-xs text-zinc-400 mt-0.5">Repas inclus (frais intégrés à l'émission du billet).</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* SECTION VOL ALLER */}
                                    {outboundMeals.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Vol Aller (DLA → CDG)</Label>
                                            <select
                                                value={outboundMeal}
                                                onChange={(e) => setOutboundMeal(e.target.value)}
                                                className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 focus:border-[#15a4e6] focus:ring-1 focus:ring-[#15a4e6]"
                                            >
                                                <option value="NoMeal">Repas Standard / Aucun</option>
                                                {outboundMeals.map((meal: any, idx: number) => (
                                                    <option key={idx} value={meal.ServiceId}>
                                                        {meal.Description.replace("MEAL - ", "")}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* SECTION VOL RETOUR */}
                                    {inboundMeals.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Vol Retour (CDG → DLA)</Label>
                                            <select
                                                value={inboundMeal}
                                                onChange={(e) => setInboundMeal(e.target.value)}
                                                className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 focus:border-[#15a4e6] focus:ring-1 focus:ring-[#15a4e6]"
                                            >
                                                <option value="NoMeal">Repas Standard / Aucun</option>
                                                {inboundMeals.map((meal: any, idx: number) => (
                                                    <option key={idx} value={meal.ServiceId}>
                                                        {meal.Description.replace("MEAL - ", "")}
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

            {/* 4. SECTION ASSURANCE */}
            <Card className={`border transition-colors shadow-sm ${insuranceSelected ? 'border-blue-500 bg-blue-50/10' : 'border-zinc-200'}`}>
                <CardContent className="p-5 flex items-start gap-4">
                    <Checkbox id="insurance" checked={insuranceSelected} onCheckedChange={(checked) => setInsuranceSelected(!!checked)} className="mt-1" />
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
{/*                    <SeatMapDialog
                        isOpen={isSeatMapOpen}
                        onClose={() => setIsSeatMapOpen(false)}
                        seatData={response?.data?.ExtraServicesData?.DynamicSeat || []} // Données JSON
                        selectedSeat={selectedSeat}
                        onSelectSeat={(seat) => setSelectedSeat(seat)}
                    />*/}
                </CardContent>
            </Card>

            {/* NAVIGATION */}
            <div className="flex justify-between items-center pt-4">
                <Button variant="outline" onClick={onBack} className="h-12 px-6 rounded-xl text-zinc-600">Retour</Button>
                <Button onClick={onNext} disabled={isPending} className="bg-[#15a4e6] hover:bg-[#1182b6] text-white font-bold px-8 h-12 rounded-xl disabled:opacity-50">
                    Procéder au paiement
                </Button>
            </div>
        </motion.div>
    )
}