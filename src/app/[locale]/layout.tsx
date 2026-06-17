import type {Metadata} from "next";
import QueryProvider from "@/providers/query-provider";
import "@/app/globals.css";
import {Inter} from "next/font/google";
import {cn} from "@/lib/utils";
import React from "react";
import {Toaster} from "sonner";
import {NextIntlClientProvider} from "next-intl";
import {notFound} from "next/navigation";
import {routing} from "@/i18n/routing";
import {getMessages, setRequestLocale} from "next-intl/server"; // <-- Ajout de setRequestLocale

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans"
});

export const metadata: Metadata = {
    title: "Guen's Travel - FinTech & Hosting",
    description: "Plateforme de gestion hôtelière et financière intégrée."
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
                                               children,
                                               params
                                           }: {
    children: React.ReactNode;
    params: Promise<{locale: string}>;
}) {
    const {locale} = await params;

    // Valide que le locale est supporté
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    // Crucial pour le Static Generation (SSG) avec Next.js 15+
    setRequestLocale(locale);

    // Récupère les messages via la configuration centralisée de src/i18n/request.ts
    const messages = await getMessages();

    return (
        <html
            lang={locale}
            className={cn("font-sans", inter.variable)}
        >
        <body className="antialiased">
        {/* Si vous avez beaucoup de composants clients, ceci reste correct,
            mais privilégiez getTranslations() dans vos Server Components ! */}
        <NextIntlClientProvider messages={messages}>
            <QueryProvider>
                {children}

                <Toaster
                    position="top-right"
                    richColors
                    closeButton
                />
            </QueryProvider>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}