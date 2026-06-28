"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation"; // Utile si vous passez la devise en query param ou rafraîchissez la page
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Coins } from "lucide-react";

// Types des devises acceptées
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

    // État local initialisé avec la valeur stockée (ou XAF par défaut)
    const [currentCurrency, setCurrentCurrency] = React.useState<CurrencyCode>(() => {
        if (typeof window !== "undefined") {
            return (document.cookie.split("; ").find(row => row.startsWith("currency="))?.split("=")[1] as CurrencyCode) || "XAF";
        }
        return "XAF";
    });

    const handleCurrencyChange = (newCurrency: CurrencyCode) => {
        startTransition(() => {
            // 1. Mise à jour de l'état local
            setCurrentCurrency(newCurrency);

            // 2. Sauvegarde dans un Cookie (accessible par Laravel en HTTP via $request->cookie('currency'))
            // Expire dans 1 an
            document.cookie = `currency=${newCurrency}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax; Secure`;

            // 3. Optionnel : Rafraîchir les données de la page actuelle (React Query / Next Cache)
            router.refresh();
        });
    };

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
                {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code} className="font-medium">
                        {currency.label} ({currency.symbol})
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}