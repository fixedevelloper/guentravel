// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['fr', 'en'],
    defaultLocale: 'fr'
});

// Exportez ces utilitaires pour les utiliser partout à la place de 'next/link' ou 'next/navigation'
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);