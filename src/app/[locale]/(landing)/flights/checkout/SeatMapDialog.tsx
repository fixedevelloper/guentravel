'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Armchair, Info, Loader2 } from 'lucide-react'
import { api } from '../../../../../core/api/axios-instance'

interface ParsedSeat {
    service_id: string
    seat_code: string // ex: "1A"
    seat_no: string | null // ex: "A" ou "1A" selon le parser
    row_no: string
    seat_type: { code: number; text: string }
    is_available: boolean
    is_reserved: boolean
    amount: number
    currency: string
    from: string
    to: string
    flight_number: string
}

interface ParsedRow {
    row_no: number
    seats: ParsedSeat[]
}

interface ParsedDeck {
    deck_no: number
    rows: ParsedRow[]
}

interface SeatSegment {
    direction: string
    segment_idx: number
    decks: ParsedDeck[]
}

type Props = {
    isOpen: boolean
    onClose: () => void
    sessionId: string
    fareSourceCode: string
    selectedSeat?: string
    segmentIdx: number
    // Correction : Ajout explicite de currency dans la signature de type
    onSelectSeat: (seatCode: string, serviceId: string, amount: number, currency: string) => void
}

const COLUMNS = ['A', 'B', 'C', '', 'D', 'E', 'F']

export function SeatMapDialog({
                                  isOpen,
                                  onClose,
                                  sessionId,
                                  fareSourceCode,
                                  selectedSeat,
                                  segmentIdx,
                                  onSelectSeat,
                              }: Props) {
    const [hoveredSeat, setHoveredSeat] = useState<ParsedSeat | null>(null)

    useEffect(() => {
        setHoveredSeat(null)
    }, [isOpen, segmentIdx])

    const { data, isLoading, error } = useQuery<SeatSegment[]>({
        queryKey: ['flight-extra-services', sessionId, fareSourceCode, 'seats'],
        queryFn: async () => {
            const res = await api.post('/flights/extra-services', {
                session_id: sessionId,
                fare_source_code: fareSourceCode,
            })

            if (!res.data.success) {
                throw new Error(res.data.message ?? 'Erreur chargement sièges')
            }

            return res.data.data.seats as SeatSegment[]
        },
        enabled: isOpen && !!sessionId && !!fareSourceCode,
        staleTime: 5 * 60 * 1000,
    })

    const segments = data ?? []
    const segment = segments.find((s) => s.segment_idx === segmentIdx) ?? segments[0]
    const deck = segment?.decks.find((d) => d.rows && d.rows.length > 0) ?? segment?.decks[0]
    const rows = deck?.rows ?? []

    const formatPrice = (amount: number, currency: string) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount)

    const displaySeat =
        hoveredSeat ??
        rows.flatMap((r) => r.seats).find((s) => s.seat_code === selectedSeat)

    const firstActiveDeck = segment?.decks.find((d) => d.rows && d.rows.length > 0)
    const sampleSeat = firstActiveDeck?.rows[0]?.seats[0]

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-7xl max-h-[90vh] bg-white p-6 rounded-2xl border-none shadow-xl gap-0 overflow-hidden">
                <DialogHeader className="pb-4 border-b border-zinc-100">
                    <DialogTitle className="text-xl font-bold text-zinc-900">
                        Sélection du siège
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-500">
                        Cliquez sur un siège disponible pour le sélectionner.
                    </DialogDescription>
                </DialogHeader>

                {segment && sampleSeat && (
                    <div className="pt-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            <span>{segment.direction === 'outbound' ? 'Vol Aller' : 'Vol Retour'} :</span>
                            <span className="font-semibold text-zinc-600">{sampleSeat.from} → {sampleSeat.to}</span>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                        <p className="text-xs text-zinc-500">Chargement du plan de cabine...</p>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="py-8 text-center text-sm text-red-500 font-medium">
                        Impossible de charger le plan de cabine. Vous pourrez choisir votre siège à l'aéroport.
                    </div>
                )}

                {!isLoading && !error && rows.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 pt-6 h-[75vh]">
                        <div className="flex flex-col items-center border border-zinc-100 rounded-xl bg-zinc-50/50 p-5 overflow-hidden">
                            <div
                                className="grid gap-1.5 mb-3 px-2"
                                style={{
                                    gridTemplateColumns: `repeat(${COLUMNS.length}, 1fr)`,
                                    width: '100%',
                                    maxWidth: 420,
                                }}
                            >
                                {COLUMNS.map((col, idx) => (
                                    <div key={idx} className="text-center text-[10px] font-bold text-zinc-400">
                                        {col}
                                    </div>
                                ))}
                            </div>

                            <ScrollArea className="w-full h-full pr-2">
                                <div className="flex flex-col gap-2 items-center py-2">
                                    {rows.map((row) => (
                                        <div key={row.row_no} className="flex items-center gap-3">
                                            <span className="w-6 text-right text-[10px] font-bold text-zinc-400">
                                                {row.row_no}
                                            </span>

                                            <div
                                                className="grid gap-1.5"
                                                style={{
                                                    gridTemplateColumns: `repeat(${COLUMNS.length}, 1fr)`,
                                                    width: 420,
                                                }}
                                            >
                                                {COLUMNS.map((col, colIdx) => {
                                                    if (col === '') {
                                                        return <div key={`aisle-${colIdx}`} className="h-9 w-full" />
                                                    }

                                                    // CORRECTION : Tolérance sur le format (ex: "A" ou "1A")
                                                    const seat = row.seats.find(
                                                        (s) => s.seat_no === col || s.seat_no === `${row.row_no}${col}`
                                                    )

                                                    if (!seat) {
                                                        return <div key={`empty-${colIdx}`} className="h-9 w-full" />
                                                    }

                                                    const isSelected = seat.seat_code === selectedSeat
                                                    const isAvailable = seat.is_available

                                                    return (
                                                        <button
                                                            key={seat.service_id}
                                                            type="button"
                                                            disabled={!isAvailable}
                                                            onClick={() => onSelectSeat(seat.seat_code, seat.service_id, seat.amount, seat.currency)}
                                                            onMouseEnter={() => isAvailable && setHoveredSeat(seat)}
                                                            onMouseLeave={() => setHoveredSeat(null)}
                                                            className={`
                                                                h-9 w-full rounded-md flex items-center justify-center
                                                                text-[10px] font-bold transition-all
                                                                ${
                                                                !isAvailable
                                                                    ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                                                                    : isSelected
                                                                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-1'
                                                                    : 'bg-white border border-zinc-200 text-zinc-700 hover:border-indigo-400 hover:text-indigo-600'
                                                            }
                                                            `}
                                                        >
                                                            {col} {/* Affichage de la lettre unique de la colonne sur le bouton */}
                                                        </button>
                                                    )
                                                })}
                                            </div>

                                            <span className="w-6 text-left text-[10px] font-bold text-zinc-400">
                                                {row.row_no}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        <div className="flex flex-col justify-between border border-zinc-100 rounded-xl p-4 bg-white shadow-sm">
                            <div>
                                <h4 className="font-bold text-zinc-900 text-sm mb-4">Détails</h4>

                                {displaySeat ? (
                                    <div className="space-y-4">
                                        <div className="p-3 bg-zinc-50 rounded-xl space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-zinc-500">Siège</span>
                                                <span className="text-sm font-black text-zinc-800">
                                                    {displaySeat.seat_code}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-zinc-500">Type</span>
                                                <span className="text-xs font-semibold text-zinc-700">
                                                    {displaySeat.seat_type.text}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-zinc-500">Vol</span>
                                                <span className="text-xs font-semibold text-zinc-700">
                                                    {displaySeat.from} → {displaySeat.to}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center border-t border-dashed border-zinc-200 pt-2 mt-2">
                                                <span className="text-xs text-zinc-500">Prix</span>
                                                <span className="text-sm font-bold text-indigo-600">
                                                    {displaySeat.amount === 0
                                                        ? 'Gratuit'
                                                        : formatPrice(displaySeat.amount, displaySeat.currency)}
                                                </span>
                                            </div>
                                        </div>

                                        {selectedSeat === displaySeat.seat_code && (
                                            <p className="text-[11px] text-emerald-600 bg-emerald-50 p-2 rounded-lg font-medium text-center">
                                                ✓ Place sélectionnée pour ce trajet.
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-zinc-400 space-y-2">
                                        <Armchair className="h-8 w-8 mx-auto stroke-[1.5]" />
                                        <p className="text-xs">
                                            Survolez ou cliquez sur un siège disponible.
                                        </p>
                                    </div>
                                )}

                                <div className="mt-4 space-y-1.5">
                                    {[
                                        { color: 'bg-white border border-zinc-200', label: 'Disponible' },
                                        { color: 'bg-indigo-600', label: 'Sélectionné' },
                                        { color: 'bg-zinc-200', label: 'Réservé' },
                                    ].map(({ color, label }) => (
                                        <div key={label} className="flex items-center gap-2">
                                            <div className={`h-4 w-4 rounded ${color}`} />
                                            <span className="text-[10px] text-zinc-500">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-zinc-100">
                                <div className="flex gap-2 items-start text-[10px] text-zinc-400 leading-snug">
                                    <Info className="h-3.5 w-3.5 shrink-0 text-zinc-400 mt-0.5" />
                                    <span>Les frais de siège seront ajoutés lors de l'émission du billet.</span>
                                </div>
                                <Button
                                    onClick={onClose}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 text-xs rounded-xl"
                                >
                                    {selectedSeat ? `Confirmer ${selectedSeat}` : 'Fermer'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}