/**
 * Formate un nombre en devise.
 * @param amount - Le montant à formater
 * @param currency - Le code de la devise (défaut: 'XAF')
 * @param locale - La locale pour le formatage (défaut: 'fr-FR')
 */
export const formatCurrency = (
    amount: number | string,
    currency: string = 'XAF',
    locale: string = 'fr-FR'
): string => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(value)) return '0 ' + currency;

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0, // Pour éviter les décimales inutiles comme ,00
        maximumFractionDigits: 2,
    }).format(value);
};