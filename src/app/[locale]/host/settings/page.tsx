"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { useParams } from "next/navigation";
import {
    User,
    Lock,
    CreditCard,
    Loader2,
    Save,
    ShieldCheck,
    Smartphone,
    Mail,
    Building
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// --- DICTIONNAIRE MULTI-LANGUE ---
const translations = {
    fr: {
        title: "Configuration du Compte",
        subtitle: "Mettez à jour vos informations personnelles, sécurisez votre accès et configurez vos préférences de retrait.",
        tabProfile: "Profil Partenaire",
        tabPayoutMethods: "Modes de versement",
        lblGeneral: "Informations Générales",
        lblGeneralDesc: "Ces coordonnées sont utilisées pour la facturation et les alertes de réservation.",
        fieldName: "Nom complet / Raison sociale",
        fieldEmail: "Adresse email professionnelle",
        fieldPhone: "Numéro de téléphone (WhatsApp)",
        lblPayoutConfig: "Configuration des Versements",
        lblPayoutConfigDesc: "Sélectionnez et configurez le canal automatique vers lequel vos fonds validés seront transférés.",
        payoutMethod: "Moyen de réception par défaut",
        payoutDetails: "Identifiant du compte (IBAN, N° Wave ou Orange Money)",
        saveBtn: "Enregistrer les modifications",
        successSave: "Vos configurations ont été mises à jour avec succès.",
        errorSave: "Impossible de sauvegarder les modifications."
    },
    en: {
        title: "Account Settings",
        subtitle: "Update your personal details, secure your access, and configure your payout preferences.",
        tabProfile: "Partner Profile",
        tabPayoutMethods: "Payout Methods",
        lblGeneral: "General Information",
        lblGeneralDesc: "These details are used for billing accounts and booking alerts.",
        fieldName: "Full Name / Company Name",
        fieldEmail: "Professional Email Address",
        fieldPhone: "Phone Number (WhatsApp)",
        lblPayoutConfig: "Payout Configuration",
        lblPayoutConfigDesc: "Select and configure the default channel where your validated funds will be transferred.",
        payoutMethod: "Default Reception Method",
        payoutDetails: "Account Identifier (IBAN, Wave or Orange Money N°)",
        saveBtn: "Save Configurations",
        successSave: "Your settings have been successfully updated.",
        errorSave: "Failed to save settings."
    }
};

export default function HostSettingsPage() {
    const params = useParams();
    const locale = (params?.locale as "fr" | "en") || "fr";
    const t = translations[locale];
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<"profile" | "payout">("profile");

    // États des formulaires locaux
    const [profileForm, setProfileForm] = useState({ name: "", email: "", phone_number: "" });
    const [payoutForm, setPayoutForm] = useState({ default_method: "wave", account_identifier: "" });

    // --- 1. CHARGEMENT DES PARAMÈTRES ACTUELS ---
    const { isLoading } = useQuery({
        queryKey: ["hostSettings"],
        queryFn: async () => {
            const response = await api.get("/host/settings");
            const data = response.data?.data || response.data;

            // Hydratation des formulaires locaux
            setProfileForm({
                name: data.user?.name || "",
                email: data.user?.email || "",
                phone_number: data.user?.phone_number || ""
            });
            setPayoutForm({
                default_method: data.payout_preference?.method || "wave",
                account_identifier: data.payout_preference?.account || ""
            });
            return data;
        }
    });

    // --- 2. MUTATION : ENREGISTRER LE PROFIL ---
    const updateProfileMutation = useMutation({
        mutationFn: async (payload: typeof profileForm) => {
            return await api.put("/host/settings/profile", payload);
        },
        onSuccess: () => {
            toast.success(t.successSave);
            queryClient.invalidateQueries({ queryKey: ["hostSettings"] });
        },
        onError: () => toast.error(t.errorSave)
    });

    // --- 3. MUTATION : ENREGISTRER LES INFOS DE PAYEMENT ---
    const updatePayoutMutation = useMutation({
        mutationFn: async (payload: typeof payoutForm) => {
            return await api.put("/host/settings/payout-preference", payload);
        },
        onSuccess: () => {
            toast.success(t.successSave);
            queryClient.invalidateQueries({ queryKey: ["hostSettings"] });
        },
        onError: () => toast.error(t.errorSave)
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfileMutation.mutate(profileForm);
    };

    const handlePayoutSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updatePayoutMutation.mutate(payoutForm);
    };

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-[#1d9e4b]" />
                <p className="text-sm font-medium text-zinc-500">Chargement de votre espace de configuration...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-4xl mx-auto">

            {/* EN-TÊTE DE PAGE */}
            <div>
                <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{t.title}</h1>
                <p className="text-sm font-medium text-zinc-500">{t.subtitle}</p>
            </div>

            {/* SÉLECTEUR D'ONGLETS SANS WALL OF TEXT */}
            <div className="flex border-b border-zinc-200 gap-6 text-sm font-bold">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`pb-3 transition-all relative ${activeTab === "profile" ? "text-[#1d9e4b]" : "text-zinc-400 hover:text-zinc-600"}`}
                >
                    <span className="flex items-center gap-2">
                        <User className="h-4 w-4" /> {t.tabProfile}
                    </span>
                    {activeTab === "profile" && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#1d9e4b]" />}
                </button>

                <button
                    onClick={() => setActiveTab("payout")}
                    className={`pb-3 transition-all relative ${activeTab === "payout" ? "text-[#1d9e4b]" : "text-zinc-400 hover:text-zinc-600"}`}
                >
                    <span className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> {t.tabPayoutMethods}
                    </span>
                    {activeTab === "payout" && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#1d9e4b]" />}
                </button>
            </div>

            {/* CONTENU ONGLET 1 : PROFIL UTILISATEUR */}
            {activeTab === "profile" && (
                <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-zinc-100 p-6">
                        <CardTitle className="text-base font-black text-zinc-900">{t.lblGeneral}</CardTitle>
                        <CardDescription className="text-xs font-medium text-zinc-400 mt-1">{t.lblGeneralDesc}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleProfileSubmit} className="space-y-4 text-sm font-medium text-zinc-700">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-zinc-600">{t.fieldName}</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        required
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-zinc-400 font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-zinc-600">{t.fieldEmail}</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                        <input
                                            type="email"
                                            required
                                            value={profileForm.email}
                                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-zinc-400 font-semibold"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-zinc-600">{t.fieldPhone}</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                        <input
                                            type="tel"
                                            value={profileForm.phone_number}
                                            onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-zinc-400 font-semibold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="bg-[#1d9e4b] hover:bg-[#167c3a] text-white rounded-xl text-xs font-bold h-10 shadow-sm gap-1.5"
                                    disabled={updateProfileMutation.isPending}
                                >
                                    {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {t.saveBtn}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* CONTENU ONGLET 2 : CONFIGURATION BANCAIRE / MOBILE MONEY */}
            {activeTab === "payout" && (
                <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-zinc-100 p-6">
                        <CardTitle className="text-base font-black text-zinc-900">{t.lblPayoutConfig}</CardTitle>
                        <CardDescription className="text-xs font-medium text-zinc-400 mt-1">{t.lblPayoutConfigDesc}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handlePayoutSubmit} className="space-y-4 text-sm font-medium text-zinc-700">

                            <div className="flex flex-col gap-1.5">
                                <label className="text-zinc-600">{t.payoutMethod}</label>
                                <select
                                    value={payoutForm.default_method}
                                    onChange={(e) => setPayoutForm({ ...payoutForm, default_method: e.target.value })}
                                    className="bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 outline-none shadow-sm cursor-pointer font-bold text-zinc-800"
                                >
                                    <option value="wave">Wave</option>
                                    <option value="orange_money">Orange Money</option>
                                    <option value="mtn_momo">MTN Mobile Money</option>
                                    <option value="bank_transfer">Virement Bancaire (IBAN)</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-zinc-600">{t.payoutDetails}</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="N° de téléphone ou coordonnées de compte"
                                    value={payoutForm.account_identifier}
                                    onChange={(e) => setPayoutForm({ ...payoutForm, account_identifier: e.target.value })}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-zinc-400 font-semibold"
                                />
                            </div>

                            <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-4 flex gap-3 text-xs text-zinc-500 font-medium items-start">
                                <ShieldCheck className="h-5 w-5 text-[#1d9e4b] shrink-0 mt-0.5" />
                                <p>
                                    Ces configurations servent de modèle par défaut. Chaque demande de retrait fera l'objet d'un instantané de sécurité figé pour prémunir votre compte contre toute modification malveillante de dernière minute.
                                </p>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="bg-[#1d9e4b] hover:bg-[#167c3a] text-white rounded-xl text-xs font-bold h-10 shadow-sm gap-1.5"
                                    disabled={updatePayoutMutation.isPending}
                                >
                                    {updatePayoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {t.saveBtn}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}