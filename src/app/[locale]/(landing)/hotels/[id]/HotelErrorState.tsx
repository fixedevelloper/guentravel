"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import {useSearchStore} from "../../../../../core/store/useSearchStore";

interface Props {
    hotelError: any; // Ajustez le type selon votre gestionnaire d'erreurs
}

export function HotelErrorState({ hotelError }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const occupancy = useSearchStore((state) => state.occupancy);

    if (!hotelError) return null;

    const handleRetry = () => {
        startTransition(() => {
            // Force le rafraîchissement des données de la page actuelle (relance les requêtes serveur/hooks)
            router.refresh();
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[550px] text-center px-6 max-w-sm mx-auto animate-fade-in select-none">

            {/* Icône animée au design moderne */}
            <div className="p-4 bg-rose-50 rounded-2xl text-rose-500 mb-5 border border-rose-100 shadow-sm relative group">
                <AlertTriangle size={28} strokeWidth={2} className="group-hover:animate-bounce transition-transform" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
            </div>

            {/* Textes hiérarchisés */}
            <h3 className="text-lg font-black text-zinc-900 tracking-tight">
                Offre expirée ou complet
            </h3>

            <p className="text-zinc-500 text-xs mt-2 leading-relaxed font-medium">
                Les tarifs de cet établissement ne sont plus synchronisés ou les chambres ont été réservées entre-temps.
            </p>

            {/* Actions de récupération UX (Double boutons) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full mt-6">

                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="rounded-xl text-xs font-bold border-zinc-200 text-zinc-600 hover:bg-zinc-50 py-5 order-2 sm:order-1 flex items-center gap-1.5"
                >
                    <ArrowLeft size={14} />
                    Retour
                </Button>

                <Button
                    onClick={handleRetry}
                    disabled={isPending}
                    className="rounded-xl text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white hover:bg-zinc-800 py-5 shadow-sm active:scale-[0.98] transition-all order-1 sm:order-2 flex items-center justify-center gap-1.5"
                >
                    <RefreshCw size={13} className={isPending ? "animate-spin" : ""} />
                    {isPending ? "Actualisation..." : "Actualiser"}
                </Button>

            </div>

            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-5">
                Code Erreur : Session_Timeout
            </p>
        </div>
    );
}