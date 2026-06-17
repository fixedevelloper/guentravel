// @/lib/date.ts

export const formatDate = (dateString: string): string => {
    // Vérification de sécurité si la date est vide ou invalide
    if (!dateString) return "";

    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

// Optionnel : Une fonction pour les formats courts si nécessaire
export const formatDateShort = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
    });
};