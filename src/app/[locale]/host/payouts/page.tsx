"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { useParams } from "next/navigation";
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    Building,
    DollarSign,
    Send
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";

// --- TRADUCTIONS ---
const translations = {
    fr: {
        title: "Portefeuille & Facturation",
        subtitle: "Suivez vos revenus nets, gérez vos réserves de séquestre et demandez vos virements.",
        balanceAvailable: "Solde disponible",
        balanceEscrow: "Fonds en séquestre",
        balanceEscrowDesc: "Réservations en cours avant check-out",
        withdrawBtn: "Demander un retrait",
        tabWithdrawals: "Historique des retraits",
        tabLedger: "Livre des comptes (Transactions)",
        colRef: "Référence",
        colAmount: "Montant",
        colMethod: "Méthode",
        colStatus: "Statut",
        colDate: "Date",
        colDesc: "Description",
        colType: "Type",
        status_pending: "En attente",
        status_processing: "En cours",
        status_completed: "Payé",
        status_failed: "Échoué",
        status_rejected: "Refusé",
        noData: "Aucun historique disponible.",
        modalTitle: "Nouvelle demande de retrait",
        modalDesc: "Le montant sera déduit de votre solde disponible après validation par nos administrateurs.",
        fieldAmount: "Montant à retirer (XAF)",
        fieldMethod: "Moyen de paiement",
        fieldPhone: "Numéro de téléphone / Coordonnées",
        submitRequest: "Confirmer le retrait",
        successWithdraw: "Votre demande de retrait a été enregistrée avec succès.",
        errorWithdraw: "Solde insuffisant ou montant invalide."
    },
    en: {
        title: "Wallet & Payouts",
        subtitle: "Track your net earnings, manage escrow reserves, and request payouts.",
        balanceAvailable: "Available Balance",
        balanceEscrow: "Escrow Funds",
        balanceEscrowDesc: "Active bookings before check-out",
        withdrawBtn: "Request a Payout",
        tabWithdrawals: "Payouts History",
        tabLedger: "Account Ledger (Transactions)",
        colRef: "Reference",
        colAmount: "Amount",
        colMethod: "Method",
        colStatus: "Status",
        colDate: "Date",
        colDesc: "Description",
        colType: "Type",
        status_pending: "Pending",
        status_processing: "Processing",
        status_completed: "Completed",
        status_failed: "Failed",
        status_rejected: "Rejected",
        noData: "No history available.",
        modalTitle: "Request a Withdrawal",
        modalDesc: "The amount will be deducted from your available balance once reviewed by administrators.",
        fieldAmount: "Amount to withdraw (XAF)",
        fieldMethod: "Payment Method",
        fieldPhone: "Phone Number / Account details",
        submitRequest: "Confirm Withdrawal",
        successWithdraw: "Your payout request was successfully submitted.",
        errorWithdraw: "Insufficient balance or invalid amount."
    }
};

export default function HostPayoutsPage() {
    const params = useParams();
    const locale = (params?.locale as "fr" | "en") || "fr";
    const t = translations[locale];
    const queryClient = useQueryClient();

    // États de l'onglet actif et du formulaire modal
    const [activeTab, setActiveTab] = useState<"withdrawals" | "ledger">("withdrawals");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("wave");
    const [accountDetails, setAccountDetails] = useState("");

    // --- 1. RÉCUPÉRATION DES FINANCES DE L'HÔTE (Solde, Retraits, Journal) ---
    const { data: walletData, isLoading, isError } = useQuery({
        queryKey: ["hostFinances"],
        queryFn: async () => {
            const response = await api.get("/host/payouts-data");
            return response.data; // Attend { user: { wallet_balance, wallet_escrow }, withdrawals: [], transactions: [] }
        }
    });

    // --- 2. MUTATION : SOUMETTRE UN RETRAIT ---
    const createWithdrawalMutation = useMutation({
        mutationFn: async (payload: any) => {
            return await api.post("/host/withdrawals", payload);
        },
        onSuccess: () => {
            toast.success(t.successWithdraw);
            setIsModalOpen(false);
            setWithdrawAmount("");
            setAccountDetails("");
            queryClient.invalidateQueries({ queryKey: ["hostFinances"] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || t.errorWithdraw;
            toast.error(msg);
        }
    });

    const handleWithdrawSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(withdrawAmount);

        if (isNaN(amount) || amount <= 0) {
            return toast.error("Montant invalide");
        }
        if (amount > parseFloat(walletData?.user?.wallet_balance || "0")) {
            return toast.error(t.errorWithdraw);
        }

        createWithdrawalMutation.mutate({
            amount,
            payment_method: paymentMethod,
            account_details: accountDetails
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-[#15a4e6]" />
                <p className="text-sm font-medium text-zinc-500">Chargement de vos comptes comptables...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-4">
                <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                <h3 className="text-base font-bold text-zinc-900">Impossible de charger vos données financières.</h3>
            </div>
        );
    }

    const { user, withdrawals = [], transactions = [] } = walletData || {};

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
            style: "currency",
            currency: "XAF",
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">

            {/* EN-TÊTE */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{t.title}</h1>
                    <p className="text-sm font-medium text-zinc-500">{t.subtitle}</p>
                </div>

                {/* MODAL VIA SHADCN DIALOG */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#15a4e6] hover:bg-[#167c3a] text-white rounded-xl text-xs font-bold h-10 shadow-sm gap-1.5">
                            <Wallet className="h-4 w-4" />
                            {t.withdrawBtn}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl">
                        <form onSubmit={handleWithdrawSubmit}>
                            <DialogHeader>
                                <DialogTitle className="text-lg font-black text-zinc-900">{t.modalTitle}</DialogTitle>
                                <DialogDescription className="text-xs text-zinc-500">{t.modalDesc}</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 text-sm font-medium text-zinc-700">
                                <div className="flex flex-col gap-1.5">
                                    <label>{t.fieldAmount}</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="Ex: 50000"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        className="bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-zinc-400 font-bold"
                                    />
                                    <span className="text-[11px] text-zinc-400 font-semibold">
                                        Max transmissible : {formatCurrency(user?.wallet_balance || 0)}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label>{t.fieldMethod}</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm outline-none shadow-sm cursor-pointer font-semibold"
                                    >
                                        <option value="wave">Wave</option>
                                        <option value="orange_money">Orange Money</option>
                                        <option value="mtn_momo">MTN Mobile Money</option>
                                        <option value="bank_transfer">Virement Bancaire</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label>{t.fieldPhone}</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="N° de téléphone ou IBAN"
                                        value={accountDetails}
                                        onChange={(e) => setAccountDetails(e.target.value)}
                                        className="bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-zinc-400"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    className="w-full bg-[#15a4e6] hover:bg-[#167c3a] text-white rounded-xl font-bold h-10 text-xs gap-1.5"
                                    disabled={createWithdrawalMutation.isPending}
                                >
                                    {createWithdrawalMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                    {t.submitRequest}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* BLOCS KPI DE SOLDE (WALLET) */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm overflow-hidden">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.balanceAvailable}</p>
                            <h3 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight mt-1">
                                {formatCurrency(user?.wallet_balance || 0)}
                            </h3>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-green-50 text-[#15a4e6] border border-green-100 flex items-center justify-center shrink-0">
                            <Wallet className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm overflow-hidden">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.balanceEscrow}</p>
                            <h3 className="text-2xl md:text-3xl font-black text-zinc-600 tracking-tight mt-1">
                                {formatCurrency(user?.wallet_escrow || 0)}
                            </h3>
                            <span className="text-[11px] text-zinc-400 font-medium mt-0.5 block">{t.balanceEscrowDesc}</span>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                            <Clock className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* INTERRUPTEUR D'ONGLETS COMPTABLES */}
            <div className="flex border-b border-zinc-200 gap-6 text-sm font-bold">
                <button
                    onClick={() => setActiveTab("withdrawals")}
                    className={`pb-3 transition-all relative ${activeTab === "withdrawals" ? "text-[#15a4e6]" : "text-zinc-400 hover:text-zinc-600"}`}
                >
                    {t.tabWithdrawals}
                    {activeTab === "withdrawals" && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#15a4e6]" />}
                </button>
                <button
                    onClick={() => setActiveTab("ledger")}
                    className={`pb-3 transition-all relative ${activeTab === "ledger" ? "text-[#15a4e6]" : "text-zinc-400 hover:text-zinc-600"}`}
                >
                    {t.tabLedger}
                    {activeTab === "ledger" && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#15a4e6]" />}
                </button>
            </div>

            {/* AFFICHAGE CONDITIONNEL DES TABLEAUX */}
            <Card className="rounded-2xl border-zinc-200/80 shadow-sm bg-white overflow-hidden">
                <CardContent className="p-0 overflow-x-auto">

                    {/* ONGLET 1 : HISTORIQUE DES RETRAITS */}
                    {activeTab === "withdrawals" && (
                        withdrawals.length === 0 ? (
                            <div className="p-12 text-center text-zinc-400 text-sm font-medium">{t.noData}</div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                <tr className="bg-zinc-50/70 border-b border-zinc-100 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                    <th className="py-3.5 px-6">{t.colRef}</th>
                                    <th className="py-3.5 px-6">{t.colAmount}</th>
                                    <th className="py-3.5 px-6">{t.colMethod}</th>
                                    <th className="py-3.5 px-6 text-center">{t.colStatus}</th>
                                    <th className="py-3.5 px-6 text-right">{t.colDate}</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 text-sm font-medium text-zinc-700">
                                {withdrawals.map((wd: any) => (
                                    <tr key={wd.id} className="hover:bg-zinc-50/30 transition-colors">
                                        <td className="py-4 px-6 font-bold text-zinc-900">{wd.reference}</td>
                                        <td className="py-4 px-6 font-bold">{formatCurrency(wd.amount)}</td>
                                        <td className="py-4 px-6 text-zinc-500 uppercase text-xs font-bold">{wd.payment_method}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex justify-center">
                                                {wd.status === "completed" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-full">
                                                            <CheckCircle2 className="h-3 w-3" /> {t.status_completed}
                                                        </span>
                                                )}
                                                {wd.status === "pending" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
                                                            <Clock className="h-3 w-3" /> {t.status_pending}
                                                        </span>
                                                )}
                                                {wd.status === "processing" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
                                                            <Clock className="h-3 w-3" /> {t.status_processing}
                                                        </span>
                                                )}
                                                {wd.status === "rejected" && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-full">
                                                            <XCircle className="h-3 w-3" /> {t.status_rejected}
                                                        </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right text-zinc-400 text-xs">
                                            {new Date(wd.created_at).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US")}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )
                    )}

                    {/* ONGLET 2 : LIVRE COMPTABLE DES TRANSACTIONS */}
                    {activeTab === "ledger" && (
                        transactions.length === 0 ? (
                            <div className="p-12 text-center text-zinc-400 text-sm font-medium">{t.noData}</div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                <tr className="bg-zinc-50/70 border-b border-zinc-100 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                    <th className="py-3.5 px-6">{t.colType}</th>
                                    <th className="py-3.5 px-6">{t.colDesc}</th>
                                    <th className="py-3.5 px-6">{t.colAmount}</th>
                                    <th className="py-3.5 px-6 text-right">{t.colDate}</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 text-sm font-medium text-zinc-700">
                                {transactions.map((tx: any) => (
                                    <tr key={tx.id} className="hover:bg-zinc-50/30 transition-colors">
                                        <td className="py-4 px-6">
                                            {tx.type === "credit" ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 border border-green-100 px-2 py-0.5 rounded-lg">
                                                        <ArrowDownLeft className="h-3 w-3" /> Entrée
                                                    </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 border border-red-100 px-2 py-0.5 rounded-lg">
                                                        <ArrowUpRight className="h-3 w-3" /> Sortie
                                                    </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-zinc-600 font-semibold text-xs max-w-[300px] truncate">
                                            {tx.description}
                                        </td>
                                        <td className={`py-4 px-6 font-bold ${tx.type === "credit" ? "text-green-600" : "text-zinc-900"}`}>
                                            {tx.type === "credit" ? "+" : "-"} {formatCurrency(tx.amount)}
                                        </td>
                                        <td className="py-4 px-6 text-right text-zinc-400 text-xs">
                                            {new Date(tx.created_at).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US")}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )
                    )}

                </CardContent>
            </Card>

        </div>
    );
}