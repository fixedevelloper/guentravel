import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios-instance';
import { toast } from 'sonner';

// Fonction API : Lister les retraits
const fetchWithdrawals = async () => {
    const { data } = await api.get('/host/withdrawals');
    return data.data; // Structure standard retournée par Laravel
};

// Fonction API : Créer une demande de retrait
const createWithdrawal = async (payload: { amount: number; bank_details: object }) => {
    const { data } = await api.post('/host/withdrawals', payload);
    return data.data;
};

export function useWithdrawals() {
    const queryClient = useQueryClient();

    // 1. Récupération des données avec cache automatique
    const withdrawalsQuery = useQuery({
        queryKey: ['withdrawals'],
        queryFn: fetchWithdrawals,
    });

    // 2. Action de création avec gestion des notifications Sonner
    const createWithdrawalMutation = useMutation({
        mutationFn: createWithdrawal,
        onSuccess: (data) => {
            // Rafraîchir le cache immédiatement pour mettre le tableau à jour
            queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
            toast.success('Demande enregistrée !', {
                description: `Votre retrait de ${data.amount} EUR est en cours de traitement.`,
            });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Une erreur financière est survenue.';
            toast.error('Échec du retrait', { description: message });
        },
    });

    return {
        withdrawals: withdrawalsQuery.data || [],
        isLoading: withdrawalsQuery.isLoading,
        isCreating: createWithdrawalMutation.isPending,
        requestWithdrawal: createWithdrawalMutation.mutateAsync,
    };
}