"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react"; // <-- Ajouté pour une meilleure UX

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Globe } from "lucide-react";
import React from "react";

export function SelectLanguage() {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();
    const [isPending, startTransition] = useTransition(); // <-- Déclaration de la transition

    const handleLanguageChange = (newLocale: string) => {
        startTransition(() => {
            router.replace(pathname, {
                locale: newLocale
            });
        });
    };

    return (
        <Select
            value={locale}
            onValueChange={handleLanguageChange}
            disabled={isPending} // <-- Optionnel : Désactive le select pendant le chargement
        >
            <SelectTrigger className="w-[120px] bg-zinc-50 border-none shadow-none font-semibold text-zinc-700 data-[disabled]:opacity-70">
                {/* Petit feedback visuel si c'est en train de charger */}
                <Globe className={`w-4 h-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
                <SelectValue />
            </SelectTrigger>

            <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
            </SelectContent>
        </Select>
    );
}