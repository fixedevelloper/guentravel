"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { MapPin, Menu, X, User, LogOut, LayoutDashboard, ChevronDown, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectLanguage } from "./SelectLanguage";
import { useTranslations, useLocale } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "../../core/hooks/useAuth";
import { useAuthStore } from "../../core/store/useAuthStore";

export function Header() {
    const t = useTranslations("Header");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuthStore();
    const { logout } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const locale = useLocale();

    const logoutMutation = useMutation({
        mutationFn: () => api.post("/logout"),
        onSuccess: () => {
            queryClient.clear();
            logout();
            router.push(`/${locale}/login`);
        }
    });

    // Structure de navigation pour SEO
    const navLinks = [
        { key: 'properties', href: '/properties', label: t("properties") },
        { key: 'experiences', href: '/experiences', label: t("experiences") },
        { key: 'offers', href: '/offers', label: t("deals") },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
            <div className="max-w-7xl mx-auto px-6">
                <nav className="flex items-center justify-between h-16" aria-label="Navigation principale">

                    {/* LOGO SEO */}
                    <Link href="/" className="flex items-center gap-2" aria-label="Accueil Guen's Travel">
                        <div className="bg-[#1d9e4b] p-2 rounded-lg"><MapPin className="h-6 w-6 text-white" /></div>
                        <span className="text-2xl font-extrabold text-[#1d9e4b]">Guen's<span className="text-[#f39c28]">Travel</span></span>
                    </Link>

                    {/* NAVIGATION DESKTOP SÉMANTIQUE */}
                    <ul className="hidden md:flex items-center gap-8" role="list">
                        {navLinks.map((link) => (
                            <li key={link.key}>
                                <Link href={link.href} className="font-semibold text-zinc-700 hover:text-[#1d9e4b] transition-colors">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* ACTIONS */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/host-portal/register" className="text-sm font-bold border border-zinc-200 px-4 py-1.5 rounded-full flex items-center gap-2 hover:border-[#1d9e4b]/30">
                            <Hotel className="h-4 w-4 text-[#1d9e4b]" /> {t("becomeHost")}
                        </Link>
                        <SelectLanguage />

                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-2 bg-zinc-50 border rounded-full pl-2 pr-4 py-1" aria-label="Menu utilisateur">
                                    <div className="h-7 w-7 rounded-full bg-[#1d9e4b]/10 flex items-center justify-center font-bold text-xs">{user.name?.substring(0, 2)}</div>
                                    <ChevronDown className="h-3 w-3" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                                    <DropdownMenuItem asChild><Link href="/customer-space/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> {t("dashboard")}</Link></DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="text-red-600"><LogOut className="mr-2 h-4 w-4" /> {t("logout")}</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button className="bg-[#1d9e4b] hover:bg-[#167c3a] rounded-xl" onClick={() => router.push(`/${locale}/login`)}>
                                {t("login")}
                            </Button>
                        )}
                    </div>

                    {/* MOBILE TOGGLE */}
                    <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Ouvrir menu">
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </nav>
            </div>

            {/* MOBILE MENU SÉMANTIQUE */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-zinc-200 overflow-hidden"
                    >
                        <ul className="flex flex-col p-6 gap-4" role="list">
                            {navLinks.map((link) => (
                                <li key={link.key}>
                                    <Link href={link.href} onClick={() => setIsMenuOpen(false)} className="text-lg font-bold block">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}