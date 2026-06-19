import type {Metadata} from "next";

export const metadata: Metadata = {
    title: {
        default: "GUEN'S TRAVEL & TOURS | Agence de Voyage & Gestion Hôtelière",
        template: "%s | GUEN'S TRAVEL & TOURS"
    },
    description: "Réservez vos vols, hôtels et séjours au meilleur prix. GUEN'S TRAVEL & TOURS vous accompagne avec des solutions de gestion hôtelière et financière intégrées.",
    keywords: [
        "agence de voyage",
        "réservation de vol",
        "gestion hôtelière",
        "billets d'avion",
        "tourisme",
        "gestion financière hôtel",
        "Guens Travel"
    ],
    authors: [{ name: "GUEN'S TRAVEL & TOURS" }],
    creator: "GUEN'S TRAVEL & TOURS",
    openGraph: {
        type: "website",
        locale: "fr_FR",
        url: "https://www.guenstravel.com", // Remplacez par votre vrai domaine
        title: "GUEN'S TRAVEL & TOURS | Voyages & Gestion Hôtelière",
        description: "Plateforme intégrée de services touristiques, réservation de vols et gestion hôtelière.",
        siteName: "GUEN'S TRAVEL & TOURS",
        images: [
            {
                url: "https://www.guenstravel.com/og-image.jpg", // Image de partage (1200x630 recommandé)
                width: 1200,
                height: 630,
                alt: "GUEN'S TRAVEL & TOURS",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "GUEN'S TRAVEL & TOURS | Voyages & Gestion Hôtelière",
        description: "Réservez vos vols et gérez vos structures hôtelières sur une seule plateforme.",
        images: ["https://www.guenstravel.com/og-image.jpg"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({
                                       children
                                   }: {
    children: React.ReactNode;
}) {
    return children;
}