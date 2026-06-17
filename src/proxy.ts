import createMiddleware from 'next-intl/middleware';
import {routing} from '@/i18n/routing';
import type {NextRequest} from 'next/server';

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
    // Log temporaire pour vérifier que le proxy s'exécute bien.
    // À supprimer une fois le souci de redirection confirmé résolu.
    console.log('[proxy] pathname:', request.nextUrl.pathname);

    return intlMiddleware(request);
}

export const config = {
    matcher: [
        '/((?!api|_next|_vercel|.*\\..*).*)'
    ]
};