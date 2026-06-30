import { getTranslations } from 'next-intl/server';
import LandingPageContent from './LandingPageContent';
import React from "react";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'Metadata' });
    return {
        title: t('title'),
        description: t('description'),
    };
}

export default function Page() {
    return <LandingPageContent />;
}