'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Scale, AlertTriangle, CheckCircle2, XCircle, PlaneTakeoff, PlaneLanding } from 'lucide-react'
import {fetchFareRules} from "../../../../../core/hooks/flightService";

type Props = {
    isOpen: boolean
    onClose: () => void
    sessionId: string
    fareSourceCode: string
    fareSourceCodeInbound?: string | null
}

export function FareRulesDialog({ isOpen, onClose, sessionId, fareSourceCode, fareSourceCodeInbound }: Props) {

    const { data, isPending, error } = useQuery({
        queryKey: ['flight-fare-rules', sessionId, fareSourceCode, fareSourceCodeInbound],
        queryFn: () => fetchFareRules({ sessionId, fareSourceCode, fareSourceCodeInbound }),
        enabled: isOpen && !!sessionId && !!fareSourceCode,
        staleTime: 1000 * 60 * 5,
    })

    // Extraction selon la structure exacte reçue de l'API
    const fareRulesArray = data?.FareRules1_1Response?.FareRules1_1Result?.FareRules || []

    // Fonction utilitaire pour parser la chaîne brute textuelle de règles de TravelNext
    const parseRulesString = (htmlString: string) => {
        if (!htmlString) return []

        // Nettoyage des balises de mise en forme basiques
        const cleanText = htmlString
            .replace(/<\/?b>/gi, '')
            .replace(/<\/?u>/gi, '')
            .replace(/<br\s*\/?>/gi, '\n')

        // Découpage par ligne pour extraire les clés de conditions
        return cleanText.split('\n')
            .map(line => line.trim())
            .filter(line => line.includes(':'))
            .map(line => {
                const [key, value] = line.split(':')
                return {
                    label: formatRuleKey(key.trim()),
                    allowed: value.trim().toLowerCase() === 'allowed',
                    rawStatus: value.trim()
                }
            })
    }

    // Rendre les clés techniques lisibles en français
    const formatRuleKey = (key: string) => {
        switch (key) {
            case 'NoShowNOSHOW_CHANGE': return 'Modification après No-Show'
            case 'NoShowNOSHOW_CANCELLATION': return 'Annulation après No-Show'
            case 'CancellationPDE': return 'Annulation avant départ (PDE)'
            case 'CancellationADE': return 'Annulation après départ (ADE)'
            case 'ChangePDE': return 'Modification avant départ (PDE)'
            case 'ChangeADE': return 'Modification après départ (ADE)'
            default: return key
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-[95vw] bg-white p-6 rounded-2xl border-none shadow-xl gap-0">
                <DialogHeader className="pb-4 border-b border-zinc-100">
                    <DialogTitle className="text-lg font-black text-zinc-900 flex items-center gap-2">
                        <Scale className="h-5 w-5 text-[#15a4e6]" />
                        Conditions Tarifaires & Règles
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-500">
                        Détails des politiques d'annulation et de modification appliquées à votre billet.
                    </DialogDescription>
                </DialogHeader>

                <div className="h-[360px] flex flex-col justify-center items-center w-full">
                    {/* CHARGEMENT */}
                    {isPending && (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-7 w-7 text-[#15a4e6] animate-spin" />
                            <p className="text-xs text-zinc-500">Lecture des règles de vol...</p>
                        </div>
                    )}

                    {/* ERREUR */}
                    {error && (
                        <div className="text-center p-4">
                            <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                            <p className="text-xs text-zinc-600 font-semibold">Données indisponibles en temps réel.</p>
                        </div>
                    )}

                    {/* SUCCÈS */}
                    {!isPending && !error && (
                        <ScrollArea className="w-full h-full pr-2 pt-4">
                            {fareRulesArray.length === 0 ? (
                                <p className="text-xs text-zinc-400 text-center py-12">Aucune condition spécifique trouvée.</p>
                            ) : (
                                <div className="space-y-6">
                                    {fareRulesArray.map((item: any, index: number) => {
                                        const ruleData = item.FareRule
                                        const parsedRules = parseRulesString(ruleData.Rules || '')
                                        const isOutbound = index === 0

                                        return (
                                            <div key={index} className="border border-zinc-100 rounded-xl p-4 bg-zinc-50/50">
                                                {/* En-tête du segment de vol */}
                                                <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        {isOutbound ? (
                                                            <PlaneTakeoff className="h-4 w-4 text-[#15a4e6]" />
                                                        ) : (
                                                            <PlaneLanding className="h-4 w-4 text-emerald-500" />
                                                        )}
                                                        <span className="text-xs font-black text-zinc-800 tracking-wide uppercase">
                              {isOutbound ? 'Vol Aller' : 'Vol Retour'} : {ruleData.CityPair}
                            </span>
                                                    </div>
                                                    <span className="text-[10px] bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-full font-bold">
                            Cie: {ruleData.Airline}
                          </span>
                                                </div>

                                                {/* Liste ordonnée et stylisée des règles */}
                                                <div className="grid grid-cols-1 gap-2">
                                                    {parsedRules.map((rule, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-zinc-100 shadow-2xs"
                                                        >
                                                            <span className="text-xs text-zinc-600 font-medium">{rule.label}</span>
                                                            <div className="flex items-center gap-1.5">
                                                                {rule.allowed ? (
                                                                    <>
                                                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                                                        <span className="text-[11px] font-bold text-emerald-600">Autorisé</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                                                                        <span className="text-[11px] font-bold text-red-500">Non autorisé</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}