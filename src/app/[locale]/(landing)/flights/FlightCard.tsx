"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Clock, Plane, Briefcase, Luggage, ChevronDown, ChevronUp, AlertCircle, RefreshCcw, Loader2 } from "lucide-react";

interface FlightCardProps {
    flight: any;
    handleSelectFlight: (flight: any) => void;
    formatDuration: (duration: any) => string;
    isBooking: boolean;    // CE vol précis est en cours de revalidation
    isDisabled?: boolean;  // Un AUTRE vol de la liste est en cours de traitement
}

export default function FlightCard({ flight, handleSelectFlight, formatDuration, isBooking, isDisabled = false }: FlightCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Extraction sécurisée des détails globaux du prix
    const finalPrice = flight?.price_details?.final_price_to_pay?.toLocaleString() || "0";
    const currency = flight?.price_details?.currency || "XAF";

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            {/* Ajout d'une opacité réduite et désactivation des clics si un autre vol charge */}
            <Card className={`overflow-hidden bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl shadow-sm transition-all group ${
                isDisabled ? 'opacity-40 pointer-events-none' : ''
            }`}>
                <CardContent className="p-0 grid grid-cols-1 md:grid-cols-12 items-stretch">

                    {/* BLOC DES ITINÉRAIRES */}
                    <div className="md:col-span-9 p-4 sm:p-6 space-y-6 border-b md:border-b-0 md:border-r border-zinc-100">
                        {flight?.itinerary && flight.itinerary.length > 0 ? (
                            flight.itinerary.map((journey: any, jIndex: number) => {
                                const segments = journey?.segments || [];

                                // Sécurité : si aucun segment n'est hydraté (Ex: Cas d'erreur GDS)
                                if (segments.length === 0) {
                                    return (
                                        <div key={jIndex} className="flex items-center justify-between gap-4 p-3 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                                                    Données indisponibles
                                                </span>
                                                <p className="text-xs font-semibold text-zinc-600">
                                                    Itinéraire {journey.direction === "outbound" ? "Aller" : "Retour"}
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded text-amber-600 bg-amber-50 shrink-0">
                                                {journey.stops_count || 0} escale(s) via GDS
                                            </span>
                                        </div>
                                    );
                                }

                                const firstSegment = segments[0] || {};
                                const lastSegment = segments[segments.length - 1] || {};

                                const totalDuration = journey?.duration
                                    || firstSegment?.duration
                                    || segments.reduce((acc: number, s: any) => acc + (parseInt(s?.duration, 10) || 0), 0);

                                return (
                                    <div key={jIndex} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 relative">
                                        {/* Compagnie et Numéro de vol */}
                                        <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-1 w-full sm:w-auto sm:min-w-[140px]">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md max-w-max truncate">
                                                {firstSegment?.airline_name || "Compagnie"}
                                            </span>
                                            <span className="text-[10px] text-zinc-400 font-medium">
                                                {firstSegment?.airline_code} {firstSegment?.flight_number}
                                            </span>
                                        </div>

                                        {/* Timeline graphique du vol */}
                                        <div className="flex items-center justify-between gap-4 sm:gap-6 flex-1 w-full">
                                            <div className="text-left shrink-0">
                                                <div className="text-lg sm:text-xl font-black text-zinc-900">
                                                    {firstSegment?.departure?.time ? (
                                                        (() => {
                                                            const d = new Date(firstSegment.departure.time);
                                                            return isNaN(d.getTime())
                                                                ? firstSegment.departure.time
                                                                : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                        })()
                                                    ) : "--:--"}
                                                </div>
                                                <div className="text-xs font-bold text-zinc-500 uppercase mt-0.5">{firstSegment?.departure?.airport || "---"}</div>
                                            </div>

                                            <div className="flex-1 text-center px-1 max-w-[180px]">
                                                <span className="text-[10px] sm:text-xs font-medium text-zinc-400 flex items-center justify-center gap-1">
                                                    <Clock className="h-3 w-3" /> {formatDuration(totalDuration)}
                                                </span>
                                                <div className="relative flex items-center justify-center my-1.5">
                                                    <div className="w-full border-t-2 border-zinc-200 group-hover:border-zinc-300 transition-colors"></div>
                                                    <Plane className="absolute text-zinc-400 group-hover:text-[#15a4e6] h-3.5 w-3.5 bg-white px-0.5 transition-colors rotate-45" />
                                                </div>
                                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                    journey.stops_count === 0 ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                                                }`}>
                                                    {journey.stops_count === 0 ? "Direct" : `${journey.stops_count} escale(s)`}
                                                </span>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <div className="text-lg sm:text-xl font-black text-zinc-900">
                                                    {lastSegment?.arrival?.time ? (
                                                        (() => {
                                                            const d = new Date(lastSegment.arrival.time);
                                                            return isNaN(d.getTime())
                                                                ? lastSegment.arrival.time
                                                                : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                        })()
                                                    ) : "--:--"}
                                                </div>
                                                <div className="text-xs font-bold text-zinc-500 uppercase mt-0.5">{lastSegment?.arrival?.airport || "---"}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-xs text-zinc-400 italic">Aucun itinéraire disponible pour cette offre.</p>
                        )}

                        {/* Bagages inclus */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] font-medium text-zinc-400 border-t pt-4">
                            <span className="flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5 text-zinc-400" /> Cabine : {flight?.baggage_allowance?.cabin || "Inclus"}
                            </span>
                            {flight?.baggage_allowance?.checked && (
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
                                    {finalPrice}
                                </span>
                                <span className="text-xs font-bold text-zinc-500 uppercase">{currency}</span>
                            </div>
                            <p className="text-[9px] text-zinc-400 font-medium md:mt-1">Taxes & frais agence inclus</p>
                        </div>

                        <div className="w-full space-y-2">
                            <Button
                                disabled={isBooking || isDisabled}
                                onClick={() => handleSelectFlight(flight)}
                                className="w-full bg-[#15a4e6] hover:bg-[#1182b8] disabled:bg-zinc-300 text-white font-bold h-10 shadow-sm rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                            >
                                {isBooking ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Vérification...
                                    </>
                                ) : (
                                    "Sélectionner"
                                )}
                            </Button>

                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full text-zinc-500 font-medium h-9 rounded-xl text-xs flex items-center justify-center gap-1 hover:bg-zinc-100">
                                    {isOpen ? (
                                        <>Masquer détails <ChevronUp className="h-3.5 w-3.5" /></>
                                    ) : (
                                        <>Voir les détails <ChevronDown className="h-3.5 w-3.5" /></>
                                    )}
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                    </div>

                </CardContent>

                {/* CONTENU DU COLLAPSE */}
                <CollapsibleContent className="border-t border-zinc-100 bg-zinc-50/30 transition-all">
                    <div className="p-4 sm:p-6 space-y-6">

                        <div className="space-y-6">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Détails de l'itinéraire</h4>

                            {flight?.itinerary?.map((journey: any, jIndex: number) => {
                                const segments = journey?.segments || [];
                                return (
                                    <div key={jIndex} className="border-l-2 border-dashed border-zinc-200 pl-4 ml-2 space-y-4 relative">
                                        <div className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                                            {journey.direction === "outbound" ? "✈️ Vol Aller" : journey.direction === "inbound" ? "🔄 Vol Retour" : `📍 Segment Multi-destination ${jIndex + 1}`}
                                        </div>

                                        {segments.length === 0 ? (
                                            <p className="text-xs text-zinc-500 italic">
                                                Aucun segment disponible pour cet itinéraire.
                                            </p>
                                        ) : (
                                            segments.map((segment: any, sIndex: number) => {
                                                const isLast = sIndex === segments.length - 1;
                                                return (
                                                    <div key={sIndex} className="space-y-2">
                                                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                                            <div className="font-bold text-zinc-800">
                                                                Vol {segment?.airline_code} {segment?.flight_number} — {segment?.airline_name}
                                                            </div>
                                                            <div className="text-zinc-400 font-medium">
                                                                Durée : {formatDuration(segment?.duration || 0)}
                                                            </div>
                                                        </div>

                                                        <div className="text-xs text-zinc-600 space-y-1 bg-white p-3 rounded-xl border border-zinc-100">
                                                            <p>
                                                                🟢 <strong>Départ :</strong>{" "}
                                                                {segment?.departure?.time ? (
                                                                    (() => {
                                                                        const d = new Date(segment.departure.time);
                                                                        return isNaN(d.getTime())
                                                                            ? segment.departure.time
                                                                            : d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
                                                                    })()
                                                                ) : "N/A"}{" "}
                                                                — {segment?.departure?.airport}
                                                            </p>
                                                            <p>
                                                                🔴 <strong>Arrivée :</strong>{" "}
                                                                {segment?.arrival?.time ? (
                                                                    (() => {
                                                                        const d = new Date(segment.arrival.time);
                                                                        return isNaN(d.getTime())
                                                                            ? segment.arrival.time
                                                                            : d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
                                                                    })()
                                                                ) : "N/A"}{" "}
                                                                — {segment?.arrival?.airport}
                                                            </p>
                                                        </div>

                                                        {!isLast && segments[sIndex + 1] && (
                                                            <div className="my-3 mx-2 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-2 max-w-max flex items-center gap-1.5">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                Escale à {segment?.arrival?.airport}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* CONDITIONS DE REMBOURSEMENT */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 border-zinc-100">
                            <div className="p-4 bg-white border border-zinc-100 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
                                    <RefreshCcw className="h-4 w-4 text-blue-500" /> Modification de billet
                                </div>
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                    {flight?.rules?.modifiable ? "Modifiable selon les conditions de la compagnie." : "Billet non modifiable après émission sur ce tarif économique GDS."}
                                </p>
                            </div>

                            <div className="p-4 bg-white border border-zinc-100 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
                                    <AlertCircle className="h-4 w-4 text-amber-500" /> Conditions de remboursement
                                </div>
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                    {flight?.rules?.refundable ? "Remboursable selon les barèmes applicables." : "Attention, ce tarif aérien est non remboursable en cas d'annulation."}
                                </p>
                            </div>
                        </div>

                    </div>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}