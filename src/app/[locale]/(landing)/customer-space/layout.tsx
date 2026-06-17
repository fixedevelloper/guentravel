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

// 1. Dictionnaire de traduction local pour la Sidebar
const translations = {
    fr: {
        menu: "Menu",
        logout: "Déconnexion",
        home: "Accueil",
        bookings: "Mes Réservations",
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
        profile: "My Profile",
        invoices: "Invoices",
        favorites: "Favorites",
        wallet: "My Wallet",
        reviews: "My Reviews",
        settings: "Settings"
    }
};

// 2. Les chemins (href) n'incluent plus le préfixe de langue, on le gérera dynamiquement
const sidebarItems = [
    {
        icon: Home,
        translationKey: "home" as const,
        href: "/customer-space/dashboard", // Page d'accueil racine
        color: "text-[#1d9e4b]"
    },
    {
        icon: Calendar,
        translationKey: "bookings" as const,
        href: "/customer-space/bookings",
        color: "text-[#1d9e4b]"
    },
    {
        icon: User,
        translationKey: "profile" as const,
        href: "/customer-space/profile",
        color: "text-[#1d9e4b]"
    },
/*    {
        icon: Receipt,
        translationKey: "invoices" as const,
        href: "/customer-space/invoices",
        color: "text-[#1d9e4b]"
    },*/
    {
        icon: Heart,
        translationKey: "favorites" as const,
        href: "/customer-space/favorites",
        color: "text-[#f39c28]"
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
        color: "text-[#f39c28]"
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
    const pathname = usePathname();
    const params = useParams();

    // Récupération de la langue actuelle (ex: 'fr' ou 'en'). Par défaut 'fr' si non trouvé.
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
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
                                // On génère l'URL finale avec la langue courante (ex: /fr/customer/bookings)
                                const localizedHref = `/${locale}${item.href}`;

                                // Gestion intelligente du lien actif :
                                // Si c'est l'accueil (/fr), correspondance exacte. Sinon, on vérifie si le pathname commence par le href.
                                const isActive = item.href === ""
                                    ? pathname === `/${locale}` || pathname === `/${locale}/`
                                    : pathname.startsWith(localizedHref);

                                const ItemIcon = item.icon;

                                return (
                                    <Link
                                        key={index}
                                        href={localizedHref}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                            isActive
                                                ? "bg-[#1d9e4b]/10 text-[#1d9e4b] font-bold"
                                                : "text-zinc-600 hover:bg-zinc-100"
                                        }`}
                                    >
                                        <ItemIcon className={`h-5 w-5 ${isActive ? item.color : "text-zinc-400"}`} />
                                        {isSidebarOpen && (
                                            <span>{t[item.translationKey]}</span>
                                        )}
                                        {isActive && isSidebarOpen && (
                                            <div className="ml-auto w-1.5 h-1.5 bg-[#1d9e4b] rounded-full" />
                                        )}
                                    </Link>
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