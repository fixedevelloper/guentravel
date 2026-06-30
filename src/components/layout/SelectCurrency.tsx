"use client";

import * as React from "react";
import { useTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Coins } from "lucide-react";

export type CurrencyCode = "XAF" | "USD" | "EUR";

interface CurrencyOption {
    code: CurrencyCode;
    label: string;
    symbol: string;
}

const currencies: CurrencyOption[] = [
    { code: "XAF", label: "FCFA", symbol: "FCFA" },
    { code: "USD", label: "USD", symbol: "$" },
    { code: "EUR", label: "EUR", symbol: "€" },
];

export function SelectCurrency() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // 1. On initialise TOUJOURS avec la même valeur par défaut sur le serveur et le client
    const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>("XAF");
    const [mounted, setMounted] = useState(false);

    // 2. On lit le cookie APRÈS le premier rendu (uniquement côté client)
    useEffect(() => {
        setMounted(true);
        const cookieValue = document.cookie
            .split("; ")
            .find((row) => row.startsWith("currency="))
            ?.split("=")[1] as CurrencyCode;

        if (cookieValue && ["XAF", "USD", "EUR"].includes(cookieValue)) {
            setCurrentCurrency(cookieValue);
        }
    }, []);

    const handleCurrencyChange = (newCurrency: CurrencyCode) => {
        // Optimistic update : on change d'abord l'état visuel immédiatement
        setCurrentCurrency(newCurrency);

        startTransition(() => {
            // Sauvegarde dans un Cookie
            document.cookie = `currency=${newCurrency}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax; Secure`;

            // Rafraîchir les Server Components pour que Laravel/Next prennent en compte le nouveau cookie
            router.refresh();
        });
    };

    // Pour éviter les flashs de contenu ou les désynchronisations Radix UI avant le montage
    if (!mounted) {
        return (
            <div className="w-[120px] h-9 bg-zinc-50 rounded-lg animate-pulse border border-zinc-100" />
        );
    }

    return (
        <Select
            value={currentCurrency}
            onValueChange={(val) => handleCurrencyChange(val as CurrencyCode)}
            disabled={isPending}
        >
            <SelectTrigger className="w-[120px] bg-zinc-50 border-none shadow-none font-semibold text-zinc-700 data-[disabled]:opacity-70">
                <Coins className={`w-4 h-4 mr-2 text-zinc-500 ${isPending ? "animate-spin" : ""}`} />
                <SelectValue />
            </SelectTrigger>

            <SelectContent>
                {currencies.map((currency) => {
                    // On construit explicitement la string en amont pour éviter tout nœud React parasite
                    const itemDisplayText = `${currency.label} (${currency.symbol})`;

                    return (
                        <SelectItem
                            key={currency.code}
                            value={currency.code}
                            className="font-medium"
                        >
                            {itemDisplayText}
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
}