// src/app/[locale]/(landing)/properties/page.tsx
import { getTranslations } from "next-intl/server";
import React from "react";
import {PropertiesPageContent} from "./PropertiesPageContent";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'PropertiesPage' });
    return {
        title: t('title'),
        description: t('description'),
    };
}

export default function PropertiesPage() {
    return <PropertiesPageContent />;
}