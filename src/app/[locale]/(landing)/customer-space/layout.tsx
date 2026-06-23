'use client'
import { ReactNode, useState } from "react";
import { Header } from "../../../../components/layout/Header";
import { Footer } from "../../../../components/layout/Footer";
import { AuthProvider } from "../../../../providers/AuthProvider";
import {
    User,
    Calendar,
    Receipt,
    Settings,
    Heart,
    Home,
    Star,
    Wallet,
    LogOut,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import SidebarLogoutButton from "../../../../components/layout/SidebarLogoutButton";

interface CustomerLayoutProps {
    children: ReactNode;
}

// 1. Dictionnaire de traduction local mis à jour
const translations = {
    fr: {
        menu: "Menu",
        logout: "Déconnexion",
        home: "Accueil",
        bookings: "Mes Réservations",
        flights: "Vols",
        hotels: "Hôtels",
        profile: "Mon Profil",
        invoices: "Factures",
        favorites: "Favoris",
        wallet: "Mon Wallet",
        reviews: "Mes Avis",
        settings: "Paramètres"
    },
    en: {
        menu: "Menu",
        logout: "Log Out",
        home: "Home",
        bookings: "My Bookings",
        flights: "Flights",
        hotels: "Hotels",
        profile: "My Profile",
        invoices: "Invoices",
        favorites: "Favorites",
        wallet: "My Wallet",
        reviews: "My Reviews",
        settings: "Settings"
    }
};

// 2. Les chemins (href) avec les sous-menus pour les réservations
const sidebarItems = [
    {
        icon: Home,
        translationKey: "home" as const,
        href: "/customer-space/dashboard",
        color: "text-[#15a4e6]"
    },
    {
        icon: Calendar,
        translationKey: "bookings" as const,
        href: "/customer-space/bookings",
        color: "text-[#15a4e6]",
        // Ajout des sous-menus ici
        subItems: [
            { translationKey: "flights" as const, href: "/customer-space/bookings/flights" },
            { translationKey: "hotels" as const, href: "/customer-space/bookings/hotels" }
        ]
    },
    {
        icon: User,
        translationKey: "profile" as const,
        href: "/customer-space/profile",
        color: "text-[#15a4e6]"
    },
    {
        icon: Heart,
        translationKey: "favorites" as const,
        href: "/customer-space/favorites",
        color: "text-[#7bcd4f]"
    },
    {
        icon: Wallet,
        translationKey: "wallet" as const,
        href: "/customer-space/wallet",
        color: "text-blue-600"
    },
    {
        icon: Star,
        translationKey: "reviews" as const,
        href: "/customer-space/reviews",
        color: "text-[#7bcd4f]"
    },
    {
        icon: Settings,
        translationKey: "settings" as const,
        href: "/customer-space/settings",
        color: "text-zinc-600"
    },
];

export default function CustomerLayout({ children }: CustomerLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    // État pour contrôler l'ouverture du sous-menu Bookings
    const [isBookingsOpen, setIsBookingsOpen] = useState(true);

    const pathname = usePathname();
    const params = useParams();

    const locale = (params?.locale as "fr" | "en") || "fr";
    const t = translations[locale] || translations.fr;

    return (
        <AuthProvider>
            <div className="flex flex-col min-h-screen bg-zinc-50">
                <Header />

                <div className="flex-1 flex">
                    {/* Sidebar */}
                    <aside
                        className={`bg-white border-r border-zinc-200 transition-all duration-300 ease-in-out ${
                            isSidebarOpen ? "w-64" : "w-20"
                        }`}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
                            {isSidebarOpen && (
                                <span className="font-extrabold text-xl text-zinc-900">{t.menu}</span>
                            )}
                            <button
                                onClick={() => {
                                    setIsSidebarOpen(!isSidebarOpen);
                                    // Optionnel : refermer le sous-menu si on ferme la sidebar
                                    if (isSidebarOpen) setIsBookingsOpen(false);
                                }}
                                className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
                            >
                                {isSidebarOpen ? (
                                    <ChevronLeft className="h-5 w-5 text-zinc-600" />
                                ) : (
                                    <ChevronRight className="h-5 w-5 text-zinc-600" />
                                )}
                            </button>
                        </div>

                        <nav className="p-4 space-y-2">
                            {sidebarItems.map((item, index) => {
                                const localizedHref = `/${locale}${item.href}`;

                                // Un item est actif si on est sur sa page ou sur l'une de ses sous-pages
                                const isActive = item.href === ""
                                    ? pathname === `/${locale}` || pathname === `/${locale}/`
                                    : pathname.startsWith(localizedHref);

                                const ItemIcon = item.icon;
                                const hasSubItems = item.subItems && item.subItems.length > 0;

                                // Si l'élément a des sous-menus, on peut vouloir bloquer la navigation directe
                                // ou la permettre. Ici, le clic sur "Bookings" ouvre/ferme le sous-menu.
                                const handleItemClick = (e: React.MouseEvent) => {
                                    if (hasSubItems && isSidebarOpen) {
                                        e.preventDefault(); // Empêche la redirection directe si on veut forcer l'usage du sous-menu
                                        setIsBookingsOpen(!isBookingsOpen);
                                    }
                                };

                                return (
                                    <div key={index} className="space-y-1">
                                        <Link
                                            href={localizedHref}
                                            onClick={handleItemClick}
                                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                                isActive && !hasSubItems
                                                    ? "bg-[#15a4e6]/10 text-[#15a4e6] font-bold"
                                                    : "text-zinc-600 hover:bg-zinc-100"
                                            } ${hasSubItems && isActive ? "bg-zinc-50 font-semibold" : ""}`}
                                        >
                                            <ItemIcon className={`h-5 w-5 ${isActive ? item.color : "text-zinc-400"}`} />
                                            {isSidebarOpen && (
                                                <span>{t[item.translationKey]}</span>
                                            )}

                                            {/* Petite flèche pour indiquer le sous-menu (seulement si la sidebar est ouverte) */}
                                            {hasSubItems && isSidebarOpen && (
                                                <div className="ml-auto transition-transform duration-200" style={{ transform: isBookingsOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                                                </div>
                                            )}

                                            {isActive && !hasSubItems && isSidebarOpen && (
                                                <div className="ml-auto w-1.5 h-1.5 bg-[#15a4e6] rounded-full" />
                                            )}
                                        </Link>

                                        {/* Rendu des sous-menus (Animation accordéon basique en CSS) */}
                                        {hasSubItems && isSidebarOpen && (
                                            <div className={`pl-9 space-y-1 transition-all duration-200 overflow-hidden ${
                                                isBookingsOpen ? "max-h-40 opacity-100 py-1" : "max-h-0 opacity-0 pointer-events-none"
                                            }`}>
                                                {item.subItems.map((subItem, subIndex) => {
                                                    const localizedSubHref = `/${locale}${subItem.href}`;
                                                    const isSubActive = pathname === localizedSubHref;

                                                    return (
                                                        <Link
                                                            key={subIndex}
                                                            href={localizedSubHref}
                                                            className={`flex items-center p-2 rounded-lg text-sm transition-all ${
                                                                isSubActive
                                                                    ? "text-[#15a4e6] font-bold bg-[#15a4e6]/5"
                                                                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                                                            }`}
                                                        >
                                                            {t[subItem.translationKey]}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>

                        {/* Separator */}
                        <div className="mx-4 mb-4">
                            <div className="border-t border-zinc-100" />
                        </div>

                        {/* Logout */}
                        <SidebarLogoutButton isSidebarOpen={isSidebarOpen} t={t}/>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 overflow-auto">
                        {children}
                    </main>
                </div>

                <Footer />
            </div>
        </AuthProvider>
    );
}