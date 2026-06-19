"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Receipt,
    Download,
    Loader2,
    Calendar,
    FileText,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Coins,
    Wallet,
    CreditCard
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// --- TYPAGES ---
interface Invoice {
    id: string;
    number: string;
    booking_reference: string;
    property_name: string;
    issue_date: string;
    due_date: string;
    total_amount: number;
    amount_paid: number;
    status: "paid" | "partial" | "unpaid";
}

// --- DICTIONNAIRE MULTI-LANGUE ---
const translations = {
    fr: {
        title: "Mes Factures",
        subtitle: "Consultez, suivez vos paiements et téléchargez vos reçus officiels.",
        loading: "Chargement de vos factures...",
        noInvoices: "Vous n'avez pas encore de factures émises.",
        invoiceNum: "Facture N°",
        bookingRef: "Réservation",
        issuedOn: "Émise le",
        dueOn: "Échéance",
        totalAmount: "Total TTC",
        remaining: "Reste à payer",
        downloadBtn: "Télécharger PDF",
        statusPaid: "Payée",
        statusPartial: "Partiel",
        statusUnpaid: "Impayée"
    },
    en: {
        title: "My Invoices",
        subtitle: "View, track your payments, and download your official receipts.",
        loading: "Loading your invoices...",
        noInvoices: "You do not have any invoices issued yet.",
        invoiceNum: "Invoice No.",
        bookingRef: "Booking",
        issuedOn: "Issued on",
        dueOn: "Due date",
        totalAmount: "Total Amount",
        remaining: "Remaining",
        downloadBtn: "Download PDF",
        statusPaid: "Paid",
        statusPartial: "Partial",
        statusUnpaid: "Unpaid"
    }
};

export default function CustomerInvoicesPage() {
    const params = useParams();
    const locale = (params?.locale as "fr" | "en") || "fr";
    const t = translations[locale];

    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
        queryKey: ["customer-invoices-list"],
        queryFn: async () => {
            const response = await api.get("/customer/invoices");
            return response.data.data;
        },
    });

    const handleDownloadPDF = async (invoiceId: string, invoiceNumber: string) => {
        setDownloadingId(invoiceId);
        try {
            const response = await api.get(`/customer/invoices/${invoiceId}/download`, {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Facture-${invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Erreur lors du téléchargement du PDF:", error);
        } finally {
            setDownloadingId(null);
        }
    };

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
                            <Receipt className="h-6 w-6 text-[#15a4e6]" />
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

                {/* Invoices List */}
                <AnimatePresence mode="wait">
                    {invoices.length > 0 ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            {invoices.map((invoice, index) => {
                                const remainingAmount = invoice.total_amount - invoice.amount_paid;

                                return (
                                    <motion.div
                                        key={invoice.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="rounded-3xl border-zinc-100 shadow-xl hover:shadow-2xl transition-all overflow-hidden bg-white group">
                                            <CardContent className="p-6 grid gap-6 md:grid-cols-4 md:items-center">

                                                {/* Colonne 1: Infos Facture */}
                                                <div className="md:col-span-2 space-y-3">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider bg-zinc-50 border border-zinc-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                                                            <FileText className="h-3.5 w-3.5 text-[#15a4e6]" />
                                                            {t.invoiceNum} {invoice.number}
                                                        </span>
                                                        <span className="text-xs font-bold text-zinc-400 bg-zinc-50 px-3 py-1 rounded-full">
                                                            {t.bookingRef}: {invoice.booking_reference}
                                                        </span>
                                                        <InvoiceStatusBadge status={invoice.status} t={t} />
                                                    </div>
                                                    <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight leading-tight group-hover:text-[#15a4e6] transition-colors">
                                                        {invoice.property_name}
                                                    </h3>

                                                    <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400 pt-1">
                                                        <span className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-full">
                                                            <Calendar className="h-3.5 w-3.5 text-[#15a4e6]" />
                                                            {t.issuedOn} {invoice.issue_date}
                                                        </span>
                                                        {invoice.status !== "paid" && (
                                                            <span className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full text-amber-600">
                                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                                {t.dueOn} {invoice.due_date}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Colonne 2: Montants */}
                                                <div className="space-y-3 border-l border-zinc-100 pl-0 md:pl-6">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wide">
                                                        <Coins className="h-4 w-4 text-[#15a4e6]" />
                                                        <span>{t.totalAmount}</span>
                                                    </div>
                                                    <div className="text-2xl font-extrabold text-[#15a4e6]">
                                                        {invoice.total_amount.toLocaleString()} FCFA
                                                    </div>
                                                    {invoice.amount_paid > 0 && (
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                                                            <CreditCard className="h-3.5 w-3.5" />
                                                            Payé: {invoice.amount_paid.toLocaleString()} FCFA
                                                        </div>
                                                    )}
                                                    {remainingAmount > 0 && (
                                                        <motion.p
                                                            initial={{ opacity: 0, x: -5 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="text-sm font-bold text-red-600 flex items-center gap-1.5"
                                                        >
                                                            <Wallet className="h-4 w-4" />
                                                            {t.remaining}: {remainingAmount.toLocaleString()} FCFA
                                                        </motion.p>
                                                    )}
                                                </div>

                                                {/* Colonne 3: Bouton téléchargement */}
                                                <div className="flex items-center md:justify-end pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-zinc-100 pl-0 md:pl-6">
                                                    <Button
                                                        variant="outline"
                                                        className="rounded-xl font-bold text-sm border-zinc-200 text-zinc-700 h-11 w-full md:w-auto px-5 gap-2 shadow-sm hover:bg-zinc-50 hover:shadow-md transition-all"
                                                        onClick={() => handleDownloadPDF(invoice.id, invoice.number)}
                                                        disabled={downloadingId === invoice.id}
                                                    >
                                                        {downloadingId === invoice.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                                                        ) : (
                                                            <Download className="h-4 w-4 text-[#15a4e6]" />
                                                        )}
                                                        {t.downloadBtn}
                                                    </Button>
                                                </div>

                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center py-24 bg-white rounded-3xl border border-dashed border-zinc-200"
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-zinc-100 w-20 h-20 rounded-full flex items-center justify-center mb-6"
                            >
                                <Receipt className="h-10 w-10 text-zinc-400" />
                            </motion.div>
                            <div className="space-y-3">
                                <p className="text-sm font-bold text-zinc-900">{t.noInvoices}</p>
                                <p className="text-xs text-zinc-400">Réservez un séjour pour générer votre première facture!</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function InvoiceStatusBadge({ status, t }: { status: Invoice["status"]; t: any }) {
    switch (status) {
        case "paid":
            return (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 shadow-sm">
                    <CheckCircle2 className="h-4 w-4" /> {t.statusPaid}
                </span>
            );
        case "partial":
            return (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200 shadow-sm">
                    <AlertTriangle className="h-4 w-4" /> {t.statusPartial}
                </span>
            );
        case "unpaid":
            return (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 shadow-sm">
                    <XCircle className="h-4 w-4" /> {t.statusUnpaid}
                </span>
            );
    }
}