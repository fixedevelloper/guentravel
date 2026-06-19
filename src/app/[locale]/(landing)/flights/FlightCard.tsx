import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Clock, Plane, Briefcase, Luggage, ChevronDown, ChevronUp, AlertCircle, RefreshCcw } from "lucide-react";

// Exemple de composant (à adapter selon votre logique d'import/export)
interface FlightCardProps {
    flight: any; // Autorise n'importe quelle structure pour le vol
    handleSelectFlight: (flight: any) => void;
    formatDuration: (duration: any) => string;
    isBooking: boolean;
}

export default function FlightCard({ flight, handleSelectFlight, formatDuration,isBooking }: FlightCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <Card className="overflow-hidden bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl shadow-sm transition-all group">
                <CardContent className="p-0 grid grid-cols-1 md:grid-cols-12 items-stretch">

                    {/* BLOC DES ITINÉRAIRES */}
                    <div className="md:col-span-9 p-4 sm:p-6 space-y-6 border-b md:border-b-0 md:border-r border-zinc-100">
                        {flight.itinerary.map((journey:any, jIndex:number) => {
                            const firstSegment = journey.segments[0];
                            const lastSegment = journey.segments[journey.segments.length - 1];
                            const totalDuration = journey.segments.reduce((acc: number, s: any) => acc + s.duration, 0);

                            return (
                                <div key={jIndex} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 relative">

                                    {/* Compagnie et Numéro de vol */}
                                    <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-1 w-full sm:w-auto sm:min-w-[140px]">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md max-w-max truncate">
                                            {firstSegment.airline_name}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 font-medium">
                                            {firstSegment.airline_code} {firstSegment.flight_number}
                                        </span>
                                    </div>

                                    {/* Timeline graphique du vol */}
                                    <div className="flex items-center justify-between gap-4 sm:gap-6 flex-1 w-full">
                                        <div className="text-left shrink-0">
                                            <div className="text-lg sm:text-xl font-black text-zinc-900">
                                                {new Date(firstSegment.departure.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="text-xs font-bold text-zinc-500 uppercase mt-0.5">{firstSegment.departure.airport}</div>
                                        </div>

                                        <div className="flex-1 text-center px-1 max-w-[180px]">
                                            <span className="text-[10px] sm:text-xs font-medium text-zinc-400 flex items-center justify-center gap-1">
                                                <Clock className="h-3 w-3" /> {formatDuration(totalDuration)}
                                            </span>
                                            <div className="relative flex items-center justify-center my-1.5">
                                                <div className="w-full border-t-2 border-zinc-200 group-hover:border-zinc-300 transition-colors"></div>
                                                <Plane className="absolute text-zinc-400 group-hover:text-[#1d9e4b] h-3.5 w-3.5 bg-white px-0.5 transition-colors rotate-45" />
                                            </div>
                                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                journey.stops_count === 0 ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                                            }`}>
                                                {journey.stops_count === 0 ? "Direct" : `${journey.stops_count} escale(s)`}
                                            </span>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <div className="text-lg sm:text-xl font-black text-zinc-900">
                                                {new Date(lastSegment.arrival.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="text-xs font-bold text-zinc-500 uppercase mt-0.5">{lastSegment.arrival.airport}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Bagages inclus */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] font-medium text-zinc-400 border-t pt-4">
                            <span className="flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5 text-zinc-400" /> Cabine incluse
                            </span>
                            {flight.baggage_allowance?.checked && (
                                <span className="flex items-center gap-1.5 text-zinc-600 font-semibold">
                                    <Luggage className="h-3.5 w-3.5 text-emerald-600" /> Soute : {flight.baggage_allowance.checked}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* BLOC COMMERCIAL */}
                    <div className="md:col-span-3 bg-zinc-50/50 p-4 sm:p-6 flex flex-col justify-center items-center md:items-end gap-3 sm:space-y-4">
                        <div className="text-center md:text-right w-full flex md:flex-col justify-between md:justify-center items-center md:items-end">
                            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide hidden md:block">Tarif par voyageur</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                                    {flight.price_details.final_price_to_pay.toLocaleString()}
                                </span>
                                <span className="text-xs font-bold text-zinc-500 uppercase">{flight.price_details.currency}</span>
                            </div>
                            <p className="text-[9px] text-zinc-400 font-medium md:mt-1">Taxes incluses</p>
                        </div>

                        <CollapsibleTrigger asChild>
                            <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-11 shadow-sm transition-colors rounded-xl text-sm flex items-center justify-center gap-2">
                                {isOpen ? (
                                    <>Masquer les détails <ChevronUp className="h-4 w-4" /></>
                                ) : (
                                    <>Détails du vol <ChevronDown className="h-4 w-4" /></>
                                )}
                            </Button>
                        </CollapsibleTrigger>
                    </div>

                </CardContent>

                {/* CONTENU DU COLLAPSE (DÉTAILS DU TRAJET / RÈGLES) */}
                <CollapsibleContent className="border-t border-zinc-100 bg-zinc-50/30 transition-all data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
                    <div className="p-4 sm:p-6 space-y-6">

                        {/* 1. DÉTAIL SEGMENT PAR SEGMENT (Escale etc.) */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Détails de l'itinéraire</h4>

                            {flight.itinerary.map((journey:any, jIndex:number) => (
                                <div key={jIndex} className="border-l-2 border-dashed border-zinc-200 pl-4 ml-2 space-y-4 relative">
                                    {journey.segments.map((segment:any, sIndex:number) => {
                                        const isLast = sIndex === journey.segments.length - 1;
                                        return (
                                            <div key={sIndex} className="space-y-2">
                                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                                    <div className="font-bold text-zinc-800">
                                                        Vol {segment.airline_code} {segment.flight_number} — {segment.airline_name}
                                                    </div>
                                                    <div className="text-zinc-400 font-medium">
                                                        Durée : {formatDuration(segment.duration)}
                                                    </div>
                                                </div>

                                                <div className="text-xs text-zinc-600 space-y-1 bg-white p-3 rounded-xl border border-zinc-100 shadow-xs">
                                                    <p>🟢 <strong>Départ :</strong> {new Date(segment.departure.time).toLocaleString()} — {segment.departure.airport_name} ({segment.departure.airport})</p>
                                                    <p>🔴 <strong>Arrivée :</strong> {new Date(segment.arrival.time).toLocaleString()} — {segment.arrival.airport_name} ({segment.arrival.airport})</p>
                                                </div>

                                                {/* Affichage de l'escale s'il y a un vol suivant */}
                                                {!isLast && journey.segments[sIndex + 1] && (
                                                    <div className="my-3 mx-2 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-2 max-w-max flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        Escale de {formatDuration(
                                                        (new Date(journey.segments[sIndex + 1].departure.time).getTime() - new Date(segment.arrival.time).getTime()) / 60000
                                                    )} à {segment.arrival.airport}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        {/* 2. CONDITIONS DE REMBOURSEMENT & MODIFICATIONS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 border-zinc-100">
                            <div className="p-4 bg-white border border-zinc-100 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
                                    <RefreshCcw className="h-4 w-4 text-blue-500" /> Modification de billet
                                </div>
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                    {flight.rules?.modifiable ? "Modifiable avec frais de la compagnie aérienne + des frais de gestion d'agence." : "Billet non modifiable après émission."}
                                </p>
                            </div>

                            <div className="p-4 bg-white border border-zinc-100 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
                                    <AlertCircle className="h-4 w-4 text-amber-500" /> Conditions de remboursement
                                </div>
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                    {flight.rules?.refundable ? "Remboursable selon les barèmes de la compagnie (hors taxes d'agence)." : "Attention, ce tarif économique est non remboursable en cas d'annulation."}
                                </p>
                            </div>
                        </div>

                        {/* 3. APPEL À L'ACTION (BOUTON DE RÉSERVATION) */}
                        <div className="flex justify-end border-t pt-4 border-zinc-100">
                            <Button
                                onClick={() => handleSelectFlight(flight)}
                                className="w-full sm:w-auto bg-[#1d9e4b] hover:bg-[#167f3c] text-white font-black h-12 px-8 shadow-md transition-all rounded-xl text-sm uppercase tracking-wider"
                            >
                                Réserver ce vol maintenant
                            </Button>
                        </div>

                    </div>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}