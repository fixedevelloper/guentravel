// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing'; // Import de votre config

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    // Si le locale n'est pas défini ou n'est pas supporté, on prend la valeur par défaut
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    try {
        return {
            locale,
            messages: (await import(`@/messages/${locale}.json`)).default
        };
    } catch (error) {
        // Repli sécurisé sur la langue par défaut si le fichier JSON a un problème
        return {
            locale,
            messages: (await import(`@/messages/${routing.defaultLocale}.json`)).default
        };
    }
});