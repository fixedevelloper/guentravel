"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Loader2,
    History,
    PlusCircle,
    HelpCircle,
    CheckCircle2,
    Clock,
    XCircle,
    Receipt,
    TrendingUp,
    CreditCard,
    Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// --- TYPAGES ---
interface Transaction {
    id: string;
    reference: string;
    type: "credit" | "debit";
    amount: number;
    description: string;
    status: "completed" | "pending" | "failed";
    created_at: string;
}

interface WalletData {
    balance: number;
    currency: string;
    total_refunded: number;
    total_spent_from_wallet: number;
    transactions: Transaction[];
}

// --- DICTIONNAIRE MULTI-LANGUE ---
const translations = {
    fr: {
        title: "Mon Wallet Guen's Travel",
        subtitle: "Utilisez votre solde pour réserver instantanément vos prochains séjours.",
        currentBalance: "Solde disponible",
        totalRefunds: "Total remboursements",
        walletSpent: "Payé via le Wallet",
        addFunds: "Recharger mon Wallet",
        recentTransactions: "Historique des transactions",
        loading: "Chargement de votre portefeuille...",
        noTransactions: "Aucune transaction enregistrée pour le moment.",
        typeCredit: "Crédit",
        typeDebit: "Débit",
        ref: "Réf",
        statusCompleted: "Réussi",
        statusPending: "En attente",
        statusFailed: "Échoué",
        noticeTitle: "Comment fonctionne le Wallet ?",
        noticeDesc: "En cas d'annulation éligible, vos fonds sont reversés instantanément ici. Vous pouvez les réutiliser pour n'importe quelle autre réservation sans frais supplémentaires."
    },
    en: {
        title: "Guen's Travel Wallet",
        subtitle: "Use your balance to instantly book your next stays.",
        currentBalance: "Available Balance",
        totalRefunds: "Total Refunds",
        walletSpent: "Paid via Wallet",
        addFunds: "Add Funds",
        recentTransactions: "Transaction History",
        loading: "Loading your wallet...",
        noTransactions: "No transactions recorded yet.",
        typeCredit: "Credit",
        typeDebit: "Debit",
        ref: "Ref",
        statusCompleted: "Success",
        statusPending: "Pending",
        statusFailed: "Failed",
        noticeTitle: "How does the Wallet work?",
        noticeDesc: "In case of an eligible cancellation, your funds are instantly credited here. You can reuse them for any future booking with zero extra fees."
    }
};

export default function CustomerWalletPage() {
    const params = useParams();
    const locale = (params?.locale as "fr" | "en") || "fr";
    const t = translations[locale];

    const { data: wallet, isLoading } = useQuery<WalletData>({
        queryKey: ["customer-wallet-data"],
        queryFn: async () => {
            const response = await api.get("/customer/wallet");
            return response.data.data;
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                >
                    <div className="w-16 h-16 border-4 border-[#15a4e6] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-zinc-600">{t.loading}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
            <main className="max-w-6xl mx-auto py-8 px-6 space-y-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-[#15a4e6]/10 p-3 rounded-xl">
                            <Wallet className="h-6 w-6 text-[#15a4e6]" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">
                                {t.title}
                            </h1>
                            <p className="text-zinc-500 font-medium mt-1">
                                {t.subtitle}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid gap-6 sm:grid-cols-3">

                    {/* Solde principal */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="rounded-3xl border-zinc-100 shadow-xl bg-gradient-to-br from-[#15a4e6] to-[#167c3a] text-white overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <CardContent className="p-6 flex flex-col justify-between h-full min-h-[160px] relative">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                                        {t.currentBalance}
                                    </span>
                                    <Wallet className="h-6 w-6 text-white" />
                                </div>
                                <div className="space-y-2 mt-4">
                                    <div className="text-4xl font-extrabold tracking-tight">
                                        {(wallet?.balance || 0).toLocaleString()}
                                    </div>
                                    <div className="text-sm font-bold text-white/70">
                                        {wallet?.currency || "FCFA"}
                                    </div>
                                </div>
                                <Button className="bg-white text-[#15a4e6] hover:bg-white/90 font-bold rounded-xl text-sm mt-4">
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    {t.addFunds}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Remboursements */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="rounded-3xl border-zinc-100 shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-all">
                            <CardContent className="p-6 flex flex-col justify-between h-full min-h-[160px]">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                        {t.totalRefunds}
                                    </span>
                                    <div className="p-3 bg-green-100 rounded-xl">
                                        <ArrowDownLeft className="h-5 w-5 text-[#15a4e6]" />
                                    </div>
                                </div>
                                <div className="space-y-2 mt-4">
                                    <div className="text-3xl font-extrabold text-zinc-900">
                                        {(wallet?.total_refunded || 0).toLocaleString()}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                                        <TrendingUp className="h-3 w-3" />
                                        Remboursements accumulés
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Dépenses */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="rounded-3xl border-zinc-100 shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-all">
                            <CardContent className="p-6 flex flex-col justify-between h-full min-h-[160px]">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                        {t.walletSpent}
                                    </span>
                                    <div className="p-3 bg-zinc-100 rounded-xl">
                                        <ArrowUpRight className="h-5 w-5 text-zinc-600" />
                                    </div>
                                </div>
                                <div className="space-y-2 mt-4">
                                    <div className="text-3xl font-extrabold text-zinc-900">
                                        {(wallet?.total_spent_from_wallet || 0).toLocaleString()}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-semibold text-zinc-500">
                                        <CreditCard className="h-3 w-3" />
                                        Payé via Wallet
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Grid: Transactions + Info */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Transactions Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2"
                    >
                        <Card className="rounded-3xl border-zinc-100 shadow-xl bg-white overflow-hidden">
                            <CardHeader className="border-b border-zinc-100 pb-4 flex flex-row items-center gap-3 px-6">
                                <div className="p-2 bg-[#15a4e6]/10 rounded-xl">
                                    <History className="h-5 w-5 text-[#15a4e6]" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-extrabold text-zinc-900">{t.recentTransactions}</CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                        <tr className="bg-gradient-to-r from-zinc-50 to-zinc-100 border-b border-zinc-100 text-xs font-bold uppercase tracking-wider text-zinc-400">
                                            <th className="p-4 pl-6">Détails / {t.ref}</th>
                                            <th className="p-4">Type</th>
                                            <th className="p-4">Montant</th>
                                            <th className="p-4 pr-6 text-right">Statut</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 text-sm font-medium text-zinc-600">
                                        {wallet?.transactions && wallet.transactions.length > 0 ? (
                                            wallet.transactions.map((tx, index) => (
                                                <motion.tr
                                                    key={tx.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="hover:bg-zinc-50/50 transition-all"
                                                >
                                                    <td className="p-4 pl-6">
                                                        <p className="font-bold text-zinc-900 leading-tight">{tx.description}</p>
                                                        <p className="text-xs text-zinc-400 font-semibold mt-1">Ref: {tx.reference} • {tx.created_at}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        {tx.type === "credit" ? (
                                                            <span className="text-xs font-bold text-[#15a4e6] bg-green-50 px-3 py-1 rounded-full">
                                                                    {t.typeCredit}
                                                                </span>
                                                        ) : (
                                                            <span className="text-xs font-bold text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full">
                                                                    {t.typeDebit}
                                                                </span>
                                                        )}
                                                    </td>
                                                    <td className={`p-4 font-extrabold ${tx.type === "credit" ? "text-[#15a4e6]" : "text-zinc-900"}`}>
                                                        {tx.type === "credit" ? "+" : "-"}{tx.amount.toLocaleString()} F
                                                    </td>
                                                    <td className="p-4 pr-6 text-right">
                                                        <TransactionStatusBadge status={tx.status} t={t} />
                                                    </td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="text-center py-12">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Receipt className="h-8 w-8 text-zinc-300" />
                                                        <p className="text-sm text-zinc-400">{t.noTransactions}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Info Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="rounded-3xl border-zinc-100 shadow-xl bg-gradient-to-br from-[#15a4e6]/5 to-[#15a4e6]/10 p-6 flex gap-4 items-start border border-[#15a4e6]/20">
                            <div className="p-3 bg-[#15a4e6]/10 rounded-2xl shrink-0">
                                <HelpCircle className="h-6 w-6 text-[#15a4e6]" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">
                                    {t.noticeTitle}
                                    <Sparkles className="h-4 w-4 text-[#15a4e6]" />
                                </h4>
                                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                                    {t.noticeDesc}
                                </p>
                            </div>
                        </Card>
                    </motion.div>

                </div>
            </main>
        </div>
    );
}

function TransactionStatusBadge({ status, t }: { status: Transaction["status"]; t: any }) {
    switch (status) {
        case "completed":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                    <CheckCircle2 className="h-4 w-4" /> {t.statusCompleted}
                </span>
            );
        case "pending":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                    <Clock className="h-4 w-4 animate-pulse" /> {t.statusPending}
                </span>
            );
        case "failed":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                    <XCircle className="h-4 w-4" /> {t.statusFailed}
                </span>
            );
    }
}