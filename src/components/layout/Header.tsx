"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, usePathname } from "@/i18n/navigation";
import { MapPin, LogOut, LayoutDashboard, ChevronDown, Hotel, Plane, Bed, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectLanguage } from "./SelectLanguage";
import { SelectCurrency } from "./SelectCurrency";
import { useTranslations, useLocale } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "../../core/hooks/useAuth";
import { useAuthStore } from "../../core/store/useAuthStore";
import Image from "next/image";

export function Header() {
    const t = useTranslations("Header");
    const { user } = useAuthStore();
    const { logout } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const locale = useLocale();
    const pathname = usePathname();

    const logoutMutation = useMutation({
        mutationFn: () => api.post("/logout"),
        onSuccess: () => {
            queryClient.clear();
            logout();
            router.push(`/${locale}/login`);
        }
    });

    // Structure des liens bureau
    const navLinks = [
        { key: 'flights', href: '/flights', label: t("flights") },
        { key: 'hotels', href: '/', label: t("hotels") },
    ];

    // Structure adaptée pour la Bottom Navigation Mobile (avec icônes)
    const mobileLinks = [
        { key: 'flights', href: '/flights', label: t("flights"), icon: Plane },
        { key: 'hotels', href: '/', label: t("hotels"), icon: Bed },
        { key: 'account', href: user ? '/customer-space/dashboard' : '/login', label: user ? t("dashboard") : t("login"), icon: User },
    ];

    return (
        <>
            {/* TOP BAR (Desktop & Mobile) */}
            <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
                <div className="max-w-7xl mx-auto px-6">
                    <nav className="flex items-center justify-between h-16" aria-label="Navigation principale">

                        <Link href="/" className="flex items-center gap-2" aria-label="Accueil GUEN'S TRAVEL & TOURS">
                            <Image
                                src="/images/logo.png"
                                alt="Logo Officiel GUEN'S TRAVEL & TOURS"
                                width={180}
                                height={50}
                                priority
                                className="object-contain"
                            />
                        </Link>

                        {/* NAVIGATION DESKTOP SÉMANTIQUE */}
                        <ul className="hidden md:flex items-center gap-8" role="list">
                            {navLinks.map((link) => {
                                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

                                return (
                                    <li key={link.key}>
                                        <Link
                                            href={link.href}
                                            aria-current={isActive ? "page" : undefined}
                                            className={`font-semibold transition-colors relative py-2 ${
                                                isActive ? "text-[#15a4e6]" : "text-zinc-700 hover:text-[#15a4e6]"
                                            }`}
                                        >
                                            {link.label}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#15a4e6] rounded-full"
                                                />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* ACTIONS DESKTOP */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link href="/host-portal/register" className="text-sm font-bold border border-zinc-200 px-4 py-1.5 rounded-full flex items-center gap-2 hover:border-[#15a4e6]/30">
                                <Hotel className="h-4 w-4 text-[#15a4e6]" /> {t("becomeHost")}
                            </Link>

                            {/* Sélecteurs de Devise et de Langue groupés */}
                            <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-100 rounded-xl px-1">
                                <SelectCurrency />
                                <div className="h-4 w-[1px] bg-zinc-200 self-center" /> {/* Séparateur visuel subti */}
                                <SelectLanguage />
                            </div>

                            {user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center gap-2 bg-zinc-50 border rounded-full pl-2 pr-4 py-1" aria-label="Menu utilisateur">
                                        <div className="h-7 w-7 rounded-full bg-[#15a4e6]/10 flex items-center justify-center font-bold text-xs">{user.name?.substring(0, 2)}</div>
                                        <ChevronDown className="h-3 w-3" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                                        <DropdownMenuItem asChild><Link href="/customer-space/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> {t("dashboard")}</Link></DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="text-red-600"><LogOut className="mr-2 h-4 w-4" /> {t("logout")}</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button className="bg-[#15a4e6] hover:bg-[#167c3a] rounded-xl" onClick={() => router.push(`/${locale}/login`)}>
                                    {t("login")}
                                </Button>
                            )}
                        </div>

                        {/* ACTIONS RAPIDES MOBILE (Haut à droite) */}
                        <div className="flex md:hidden items-center gap-1 bg-zinc-50 border border-zinc-100 rounded-xl px-1">
                            <SelectCurrency />
                            <SelectLanguage />
                        </div>
                    </nav>
                </div>
            </header>

            {/* BOTTOM NAV BAR (Mobile uniquement) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-zinc-200 pb-safe-bottom shadow-[0_-4px_12px_rgba(0,0,0,0.05)]" aria-label="Navigation mobile">
                <ul className="flex justify-around items-center h-16" role="list">
                    {mobileLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

                        return (
                            <li key={link.key} className="flex-1">
                                <Link
                                    href={link.href}
                                    aria-current={isActive ? "page" : undefined}
                                    className="flex flex-col items-center justify-center h-full gap-1 text-center transition-colors"
                                >
                                    <div className={`relative p-1 rounded-xl transition-transform ${isActive ? "text-[#15a4e6] scale-105" : "text-zinc-500"}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className={`text-[11px] font-medium tracking-wide ${isActive ? "text-[#15a4e6] font-bold" : "text-zinc-500"}`}>
                                        {link.label}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </>
    );
}