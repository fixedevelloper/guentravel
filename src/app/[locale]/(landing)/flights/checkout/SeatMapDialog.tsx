'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Armchair, Info } from 'lucide-react'

// Types adaptés à votre structure JSON
interface Seat {
    ServiceId: string
    SeatNo: string
    SeatCode: string
    SeatType: { Code: string; Text: string }
    AvailabilityType: { Code: string; Text: string }
    Fare: { Amount: string; CurrencyCode: string; DecimalPlaces: string }
}

interface RowSeat {
    RowNo: string
    Seats: Seat[]
}

interface DeckSeat {
    DeckNo: number
    RowSeats: RowSeat[]
}

type Props = {
    isOpen: boolean
    onClose: () => void
    seatData: DeckSeat[]
    selectedSeat: Seat | null
    onSelectSeat: (seat: Seat) => void
}

const COLUMN_LAYOUT = ['A', 'C', '', 'D', 'E', 'G', 'H', '', 'J', 'L']

export function SeatMapDialog({ isOpen, onClose, seatData, selectedSeat, onSelectSeat }: Props) {
    const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null)

    // 🔥 FIX : Extraction conforme à l'interface DeckSeat
    const rows: RowSeat[] = seatData[0]?.RowSeats?.filter((r: RowSeat) => r.RowNo !== '0') || []

    const formatPrice = (amount: string, currency: string) => {
        const value = parseFloat(amount)
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(value)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white p-6 rounded-2xl border-none shadow-xl gap-0">
                <DialogHeader className="pb-4 border-b border-zinc-100">
                    <DialogTitle className="text-xl font-bold text-zinc-900">Sélection du siège</DialogTitle>
                    <DialogDescription className="text-xs text-zinc-500">
                        Vol AF947 • Douala (DLA) → Paris (CDG)
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 h-[500px]">
                    {/* GAUCHE : PLAN DE CABINE */}
                    <div className="md:col-span-2 flex flex-col items-center border border-zinc-100 rounded-xl bg-zinc-50/50 p-4 overflow-hidden">
                        <div className="grid grid-cols-10 gap-1 w-full max-w-[280px] text-center text-[10px] font-bold text-zinc-400 mb-2 px-2">
                            {COLUMN_LAYOUT.map((char, idx) => (
                                <div key={idx}>{char}</div>
                            ))}
                        </div>

                        <ScrollArea className="w-full h-full pr-2">
                            <div className="flex flex-col gap-2 items-center py-2">
                                {rows.map((row: RowSeat) => (
                                    <div key={row.RowNo} className="flex items-center gap-4">
                                        <span className="w-5 text-right text-xs font-bold text-zinc-400">{row.RowNo}</span>

                                        <div className="grid grid-cols-10 gap-1 w-[280px]">
                                            {COLUMN_LAYOUT.map((colLetter, colIdx) => {
                                                if (colLetter === '') {
                                                    return <div key={`aisle-${colIdx}`} className="w-full h-6" />
                                                }

                                                // 🔥 Typé de manière sécurisée grâce à RowSeat
                                                const seat = row.Seats.find((s: Seat) => s.SeatNo === colLetter)

                                                if (!seat) {
                                                    return <div key={`empty-${colIdx}`} className="w-full h-6" />
                                                }

                                                const isSelected = selectedSeat?.ServiceId === seat.ServiceId
                                                const isOpenSeat = seat.AvailabilityType.Code === '1'

                                                return (
                                                    <button
                                                        key={seat.ServiceId}
                                                        disabled={!isOpenSeat}
                                                        onClick={() => onSelectSeat(seat)}
                                                        onMouseEnter={() => isOpenSeat && setHoveredSeat(seat)}
                                                        onMouseLeave={() => setHoveredSeat(null)}
                                                        className={`
                                                            h-7 w-full rounded-md flex items-center justify-center transition-all relative group text-[9px] font-bold
                                                            ${!isOpenSeat
                                                            ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                                                            : isSelected
                                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-1'
                                                                : 'bg-white border border-zinc-200 text-zinc-700 hover:border-indigo-400 hover:text-indigo-600'
                                                        }
                                                        `}
                                                    >
                                                        {seat.SeatNo}
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        <span className="w-5 text-left text-xs font-bold text-zinc-400">{row.RowNo}</span>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* DROITE : DÉTAILS ET TARIFS */}
                    <div className="flex flex-col justify-between border border-zinc-100 rounded-xl p-4 bg-white shadow-sm">
                        <div>
                            <h4 className="font-bold text-zinc-900 text-sm mb-4">Détails de la place</h4>

                            {(selectedSeat || hoveredSeat) ? (
                                <div className="space-y-4">
                                    <div className="p-3 bg-zinc-50 rounded-xl space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-zinc-500">Siège</span>
                                            <span className="text-sm font-black text-zinc-800">
                                                {(selectedSeat || hoveredSeat)?.SeatCode}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-zinc-500">Type</span>
                                            <span className="text-xs font-semibold text-zinc-700">
                                                {(selectedSeat || hoveredSeat)?.SeatType.Text}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-dashed border-zinc-200 pt-2 mt-2">
                                            <span className="text-xs text-zinc-500">Prix extra</span>
                                            <span className="text-sm font-bold text-indigo-600">
                                                {formatPrice(
                                                    (selectedSeat || hoveredSeat)?.Fare.Amount || '0',
                                                    (selectedSeat || hoveredSeat)?.Fare.CurrencyCode || 'XAF'
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedSeat && (
                                        <p className="text-[11px] text-emerald-600 bg-emerald-50 p-2 rounded-lg font-medium text-center">
                                            ✓ Place sélectionnée pour votre voyage.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-zinc-400 space-y-2">
                                    <Armchair className="h-8 w-8 mx-auto stroke-[1.5]" />
                                    <p className="text-xs">Survolez ou cliquez sur un siège pour voir ses spécifications.</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 pt-4 border-t border-zinc-100">
                            <div className="flex gap-2 items-start text-[10px] text-zinc-400 leading-snug">
                                <Info className="h-3.5 w-3.5 shrink-0 text-zinc-400 mt-0.5" />
                                <span>Les frais de siège seront ajoutés au montant global lors de l'émission.</span>
                            </div>
                            <Button
                                onClick={onClose}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 text-xs rounded-xl"
                            >
                                Confirmer
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}