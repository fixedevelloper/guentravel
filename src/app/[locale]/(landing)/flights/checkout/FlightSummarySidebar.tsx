'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Plane, Clock } from 'lucide-react'

type Props = {
    selectedFlight: any
    insuranceSelected: boolean
    insurancePrice: number
    extraBaggage: number
    baggagePrice: number
    // ── NOUVELLES PROPS AJOUTÉES ─────────────────────────────────────────────
    selectedSeat?: string
    seatPrice?: number
    // ─────────────────────────────────────────────────────────────────────────
    totalFlightWithOptions: number
    bookingType: 'now' | 'hold'
    finalTotalPrice: number
    reservationHoldFee: number
    formatDuration: (minutes: number) => string
}

export function FlightSummarySidebar({
                                         selectedFlight,
                                         insuranceSelected,
                                         insurancePrice,
                                         extraBaggage,
                                         baggagePrice,
                                         selectedSeat,         // <-- Injecté ici
                                         seatPrice = 0,        // <-- Injecté ici avec 0 par défaut
                                         totalFlightWithOptions,
                                         bookingType,
                                         finalTotalPrice,
                                         reservationHoldFee,
                                         formatDuration,
                                     }: Props) {
    const firstSegment = selectedFlight?.itinerary?.[0]?.segments?.[0]
    const segments = selectedFlight?.itinerary?.[0]?.segments ?? []
    const lastSegment = segments[segments.length - 1]

    return (
        <aside className="lg:col-span-4 space-y-4 sticky top-6">
            <Card className="border-zinc-200 shadow-sm overflow-hidden bg-white">
                <div className="bg-zinc-900 text-white p-4">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#15a4e6]">
                        <span>Résumé du Vol</span>
                        <span className="bg-white/10 px-2 py-0.5 rounded text-white font-medium">
              {firstSegment?.airlinecode ?? 'GDS'} {firstSegment?.flightnumber ?? ''}
            </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                        <div>
                            <div className="text-xl font-black">
                                {firstSegment?.departure?.time
                                    ? new Date(firstSegment.departure.time).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : '--:--'}
                            </div>
                            <div className="text-xs font-bold text-zinc-400 mt-0.5">
                                {firstSegment?.departure?.airport ?? 'N/A'}
                            </div>
                        </div>

                        <div className="flex-1 text-center px-2">
              <span className="text-[10px] text-zinc-400 flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                  {typeof firstSegment?.duration === 'number' ? formatDuration(firstSegment.duration) : 'N/A'}
              </span>
                            <div className="w-full border-t border-dashed border-white/20 my-1 relative">
                                <Plane className="h-3 w-3 absolute -top-1.5 left-1/2 -translate-x-1/2 rotate-45 text-[#15a4e6]" />
                            </div>
                        </div>

                        <div>
                            <div className="text-xl font-black">
                                {lastSegment?.arrival?.time
                                    ? new Date(lastSegment.arrival.time).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : '--:--'}
                            </div>
                            <div className="text-xs font-bold text-zinc-400 mt-0.5">
                                {lastSegment?.arrival?.airport ?? 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                <CardContent className="p-4 space-y-3 text-sm">
                    <div className="flex justify-between text-zinc-600">
                        <span>Tarif de base</span>
                        <span className="font-medium">{selectedFlight?.price_details?.base_price?.toLocaleString() ?? 0} F</span>
                    </div>

                    <div className="flex justify-between text-zinc-600">
                        <span>Taxes aéroportuaires</span>
                        <span className="font-medium">{selectedFlight?.price_details?.taxes?.toLocaleString() ?? 0} F</span>
                    </div>

                    <div className="flex justify-between text-zinc-600">
                        <span>Frais de service agence</span>
                        <span className="font-medium">{selectedFlight?.price_details?.agency_fees?.toLocaleString() ?? 0} F</span>
                    </div>

                    {extraBaggage > 0 && (
                        <div className="flex justify-between text-emerald-600 font-medium bg-emerald-50/40 p-1.5 rounded text-xs">
                            <span>Bagage sup. x{extraBaggage}</span>
                            <span>{baggagePrice.toLocaleString()} F</span>
                        </div>
                    )}

                    {insuranceSelected && (
                        <div className="flex justify-between text-blue-600 font-medium bg-blue-50/40 p-1.5 rounded text-xs">
                            <span>Assurance Multirisque</span>
                            <span>{insurancePrice.toLocaleString()} F</span>
                        </div>
                    )}

                    {/* ── AFFICHAGE DU SIÈGE SÉLECTIONNÉ ─────────────────────────── */}
                    {selectedSeat && (
                        <div className="flex justify-between text-indigo-600 font-medium bg-indigo-50/40 p-1.5 rounded text-xs">
                            <span>Siège sélectionné ({selectedSeat})</span>
                            <span>{seatPrice === 0 ? 'Gratuit' : `${seatPrice.toLocaleString()} F`}</span>
                        </div>
                    )}
                    {/* ───────────────────────────────────────────────────────── */}

                    <hr className="border-zinc-100 my-2" />

                    {bookingType === 'hold' ? (
                        <div className="space-y-2 bg-amber-50/60 p-3 rounded-xl border border-amber-200 text-xs">
                            <div className="flex justify-between text-zinc-600">
                                <span>Total de la commande</span>
                                <span className="font-semibold text-zinc-900">{totalFlightWithOptions.toLocaleString()} F</span>
                            </div>
                            <div className="flex justify-between text-zinc-600">
                                <span>Frais de réservation</span>
                                <span className="font-semibold text-zinc-900">{(-reservationHoldFee).toLocaleString()} F</span>
                            </div>
                            <div className="flex justify-between text-amber-800 font-bold bg-amber-100/50 p-1.5 rounded">
                                <span>Reste à solder plus tard</span>
                                <span>{(totalFlightWithOptions - reservationHoldFee).toLocaleString()} F</span>
                            </div>

                            <hr className="border-amber-200 my-1" />

                            <div className="flex justify-between items-baseline pt-1">
                                <span className="font-bold text-amber-950 text-sm">Acompte payer aujourd'hui</span>
                                <div className="text-right">
                  <span className="text-2xl font-black text-amber-600 tracking-tight">
                    {reservationHoldFee.toLocaleString()}
                  </span>
                                    <span className="text-xs font-bold text-amber-700 uppercase ml-1">XAF</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-baseline pt-1">
                            <span className="font-bold text-zinc-900">Montant total à payer</span>
                            <div className="text-right">
                <span className="text-2xl font-black text-[#15a4e6] tracking-tight">
                  {finalTotalPrice.toLocaleString()}
                </span>
                                <span className="text-xs font-bold text-zinc-500 uppercase ml-1">
                  {selectedFlight?.price_details?.currency ?? 'XAF'}
                </span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </aside>
    )
}