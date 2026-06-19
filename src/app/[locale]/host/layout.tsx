"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    LayoutGrid, Home, CalendarCheck2, WalletCards, Sliders,
    ChevronLeft, ChevronRight, Menu, User, MapPin, Bell,
    LogOut, Settings, Building, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {AuthProvider} from "../../../providers/AuthProvider";

// Remplacez par votre vrai hook d'auth
const useAuth = () => ({
    user: { name: "John Doe", role: "Hôte" },
    logout: () => console.log("Déconnexion...")
});

const hostNavigationItems = [
    { id: "dashboard", href: "/host/dashboard", icon: LayoutGrid },
    { id: "properties", href: "/host/properties", icon: Home },
    { id: "bookings", href: "/host/bookings", icon: CalendarCheck2 },
    { id: "payouts", href: "/host/payouts", icon: WalletCards },
    { id: "settings", href: "/host/settings", icon: Sliders },
];

export default function HostLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const t = useTranslations("host.navigation");
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const currentActiveItem = hostNavigationItems.find(item => pathname.includes(item.href));
    const pageTitle = currentActiveItem ? t(currentActiveItem.id) : "Guen's Host";

    const renderSidebarContent = (forceOpen = false) => {
        const showText = isSidebarOpen || forceOpen;
        return (
            <div className="flex flex-col h-full bg-zinc-900 text-zinc-300">
                <div className="h-16 flex items-center px-6 border-b border-zinc-800 gap-2 shrink-0">
                    <div className="bg-[#15a4e6] p-1.5 rounded-lg text-white"><MapPin className="h-5 w-5" /></div>
                    {showText && <span className="font-black text-lg text-white">Guen's <span className="text-[#7bcd4f]">Host</span></span>}
                </div>
                <nav className="flex-1 py-6 px-4 space-y-1.5">
                    {hostNavigationItems.map((item) => {
                        const isActive = pathname.includes(item.href);
                        return (
                            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all ${isActive ? "bg-[#15a4e6] text-white" : "hover:bg-zinc-800 text-zinc-400"}`}>
                                <item.icon className="h-5 w-5 shrink-0" />
                                {showText && <span>{t(item.id)}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        );
    };

    return (
       /* <AuthProvider>*/
            <div className="min-h-screen bg-zinc-50/60 flex flex-row overflow-hidden">
                <aside className={`hidden md:block border-r border-zinc-200 shrink-0 h-screen sticky top-0 transition-all ${isSidebarOpen ? "w-64" : "w-20"}`}>
                    {renderSidebarContent()}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute bottom-16 -right-3 bg-white border border-zinc-200 h-6 w-6 rounded-full flex items-center justify-center shadow-sm z-50">
                        {isSidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </button>
                </aside>

                <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                    <header className="h-16 border-b border-zinc-200 bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                            <Sheet>
                                <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-5 w-5" /></Button></SheetTrigger>
                                <SheetContent side="left" className="p-0 w-64 bg-zinc-900 border-0">{renderSidebarContent(true)}</SheetContent>
                            </Sheet>
                            <h2 className="text-sm font-black text-zinc-800">{pageTitle}</h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2 text-zinc-400 hover:text-zinc-700 rounded-xl relative"><Bell className="h-4 w-4" /><span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" /></button>
                            <Separator orientation="vertical" className="h-6" />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 hover:bg-zinc-50 p-1 rounded-xl outline-none transition-all">
                                        <div className="h-8 w-8 rounded-xl bg-[#7bcd4f]/10 text-[#7bcd4f] flex items-center justify-center font-bold text-xs uppercase">
                                            {user?.name?.charAt(0) || "H"}
                                        </div>
                                        <ChevronDown className="h-3 w-3 text-zinc-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                                    <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem><Building className="mr-2 h-4 w-4" /> Propriétés</DropdownMenuItem>
                                    <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /> Paramètres</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="text-red-600"><LogOut className="mr-2 h-4 w-4" /> Déconnexion</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>
                    <main className="flex-1">{children}</main>
                </div>
            </div>
        // </AuthProvider>

    );
}