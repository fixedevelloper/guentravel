"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    LayoutDashboard,
    Plane,
    BedDouble,
    Users,
    Building2,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    ShieldAlert,
    Loader2,
} from "lucide-react";
import {useAuthStore} from "../../../core/store/useAuthStore";
import {useAuth} from "../../../core/hooks/useAuth";

// 1. Importez votre store Zustand (ou votre hook personnalisé)

interface NavItem {
    href:  string;
    icon:  React.ComponentType<{ className?: string }>;
    label: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router    = useRouter();
    const t         = useTranslations("admin.navigation");

    // 2. Récupération directe des états depuis votre Store Zustand global
    const user = useAuthStore((state) => state.user);
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const { logout } = useAuth(); // Optionnel : si le logout effectue un appel API avant

    const [collapsed,     setCollapsed]     = useState(false);
    const [mobileOpen,    setMobileOpen]    = useState(false);

    // 3. Éviter les erreurs d'hydratation (Next.js charge le localStorage uniquement côté client)
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // ── Navigation ───────────────────────────────────────────────────────────
    const navSections: { title: string; items: NavItem[] }[] = [
        {
            title: t("general"),
            items: [
                { href: "/secure",            icon: LayoutDashboard, label: t("dashboard") },
            ],
        },
        {
            title: t("flights"),
            items: [
                { href: "/secure/flights",            icon: Plane, label: t("flightBookings") },
                { href: "/secure/flights/airports",   icon: Plane, label: t("airports") },
            ],
        },
        {
            title: t("hotels"),
            items: [
                { href: "/secure/hotels",            icon: BedDouble, label: t("hotelBookings") },
                { href: "/secure/hotels/properties", icon: Building2, label: t("properties") },
            ],
        },
        {
            title: t("management"),
            items: [
                { href: "/secure/users", icon: Users,    label: t("users") },
                { href: "/secure/hosts", icon: Building2, label: t("hosts") },
            ],
        },
        {
            title: t("system"),
            items: [
                { href: "/secure/settings", icon: Settings, label: t("settings") },
            ],
        },
    ];

    const isActive = (href: string) =>
        href === "/secure" ? pathname === href : pathname.startsWith(href);

    // ── Garde de rôle ────────────────────────────────────────────────────────

    // Si Zustand n'est pas encore hydraté depuis le localStorage, on affiche un loader
    if (!isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <Loader2 className="h-6 w-6 animate-spin text-[#15a4e6]" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <Loader2 className="h-6 w-6 animate-spin text-[#15a4e6]" />
            </div>
        );
    }

    if (user.role !== "admin") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 gap-3 px-4 text-center">
                <ShieldAlert className="h-10 w-10 text-red-500" />
                <h2 className="font-bold text-zinc-900">Accès refusé</h2>
                <p className="text-sm text-zinc-500 max-w-sm">
                    Vous n'avez pas les permissions nécessaires pour accéder à cette zone.
                </p>
                <button
                    onClick={() => router.push("/")}
                    className="mt-2 text-sm text-[#15a4e6] hover:underline font-medium">
                    Retour à l'accueil
                </button>
            </div>
        );
    }

    const handleLogout = async () => {
        try {
            if (logout) await logout(); // Appel API Laravel si nécessaire
        } catch (e) {
            console.error("Erreur déconnexion:", e);
        } finally {
            clearAuth(); // Vider Zustand (LocalStorage)
            router.push("/login");
        }
    };

    // ── Sidebar contenu (partagé desktop/mobile) ────────────────────────────
    const SidebarContent = () => (
        <>
            {/* Logo / Header */}
            <div className={`flex items-center gap-2 px-4 h-16 border-b border-zinc-100 ${collapsed ? "justify-center" : ""}`}>
                <div className="h-8 w-8 rounded-lg bg-[#15a4e6] flex items-center justify-center shrink-0">
                    <ShieldAlert className="h-4 w-4 text-white" />
                </div>
                {!collapsed && (
                    <span className="font-bold text-zinc-900 text-sm truncate">
                        Administration
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                {navSections.map((section) => (
                    <div key={section.title} className="space-y-1">
                        {!collapsed && (
                            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                                {section.title}
                            </p>
                        )}
                        {section.items.map((item) => {
                            const Icon   = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    title={collapsed ? item.label : undefined}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                                        ${collapsed ? "justify-center" : ""}
                                        ${active
                                        ? "bg-[#15a4e6]/10 text-[#15a4e6]"
                                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                                    }
                                    `}>
                                    <Icon className="h-4 w-4 shrink-0" />
                                    {!collapsed && <span className="truncate">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Footer — utilisateur + logout */}
            <div className="border-t border-zinc-100 p-3 space-y-2">
                <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? "justify-center" : ""}`}>
                    <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 text-xs font-bold text-zinc-600">
                        {user.name?.[0]?.toUpperCase() ?? "A"}
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-zinc-900 truncate">{user.name}</p>
                            <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    title={collapsed ? t("logout") : undefined}
                    className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                        text-red-600 hover:bg-red-50 transition-colors
                        ${collapsed ? "justify-center" : ""}
                    `}>
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{t("logout")}</span>}
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-zinc-50 flex">

            {/* Sidebar desktop */}
            <aside className={`
                hidden lg:flex flex-col bg-white border-r border-zinc-200 sticky top-0 h-screen
                transition-all duration-300 shrink-0
                ${collapsed ? "w-[72px]" : "w-64"}
            `}>
                <SidebarContent />

                {/* Bouton collapse */}
                <button
                    onClick={() => setCollapsed((p) => !p)}
                    className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-400 hover:text-[#15a4e6] hover:border-[#15a4e6] transition-colors">
                    {collapsed
                        ? <ChevronRight className="h-3.5 w-3.5" />
                        : <ChevronLeft  className="h-3.5 w-3.5" />
                    }
                </button>
            </aside>

            {/* Sidebar mobile (drawer) */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative flex flex-col bg-white w-72 h-full shadow-xl">
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-4 h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-100">
                            <X className="h-4 w-4" />
                        </button>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Contenu principal */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Topbar mobile */}
                <header className="lg:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-zinc-100 sticky top-0 z-30">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="h-9 w-9 rounded-lg flex items-center justify-center text-zinc-600 hover:bg-zinc-100">
                        <Menu className="h-5 w-5" />
                    </button>
                    <span className="font-bold text-sm text-zinc-900">Administration</span>
                    <div className="h-9 w-9" />
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}