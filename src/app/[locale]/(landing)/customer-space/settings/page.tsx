"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { useParams } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Lock,
    Bell,
    ShieldAlert,
    Loader2,
    Eye,
    EyeOff,
    Smartphone,
    Mail,
    Trash2,
    CheckCircle2,
    Shield,
    Key,
    Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// --- SCHÉMA DE VALIDATION DE MOT DE PASSE (ZOD) ---
const passwordSchema = z.object({
    current_password: z.string().min(1, "Le mot de passe actuel est requis"),
    new_password: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
    confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Les nouveaux mots de passe ne correspondent pas",
    path: ["confirm_password"]
});

type PasswordFormData = z.infer<typeof passwordSchema>;

// --- DICTIONNAIRE MULTI-LANGUE ---
const translations = {
    fr: {
        title: "Paramètres & Sécurité",
        subtitle: "Ajustez la sécurité de votre compte et configurez vos alertes de voyage.",
        securityCard: "Changer de mot de passe",
        securityDesc: "Nous vous recommandons d'utiliser un mot de passe unique que vous n'utilisez nulle part ailleurs.",
        currentPassword: "Mot de passe actuel",
        newPassword: "Nouveau mot de passe",
        confirmPassword: "Confirmer le nouveau mot de passe",
        savePassword: "Mettre à jour le mot de passe",
        notificationsCard: "Préférences de notifications",
        notificationsDesc: "Choisissez comment vous souhaitez recevoir vos confirmations de réservation et reçus.",
        notifEmail: "Notifications par Email",
        notifEmailDesc: "Recevoir vos reçus de paiement et contrats de location.",
        notifSms: "Notifications par SMS / WhatsApp",
        notifSmsDesc: "Alertes instantanées en cas de modification de séjour par l'hôte.",
        savePrefs: "Enregistrer les préférences",
        dangerZone: "Zone de danger",
        deleteAccount: "Supprimer mon compte définitivement",
        deleteDesc: "Cette action est irréversible. Toutes vos réservations et historiques de factures seront anonymisés.",
        updating: "Mise à jour...",
        successPassword: "Mot de passe modifié avec succès !",
        successPrefs: "Préférences enregistrées !"
    },
    en: {
        title: "Settings & Security",
        subtitle: "Adjust your account security and configure your travel alerts.",
        securityCard: "Change Password",
        securityDesc: "We recommend using a unique password that you do not use anywhere else.",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmPassword: "Confirm New Password",
        savePassword: "Update Password",
        notificationsCard: "Notification Preferences",
        notificationsDesc: "Choose how you want to receive your booking confirmations and receipts.",
        notifEmail: "Email Notifications",
        notifEmailDesc: "Receive payment receipts and rental agreements.",
        notifSms: "SMS / WhatsApp Notifications",
        notifSmsDesc: "Instant alerts in case of stay modification by the host.",
        savePrefs: "Save Preferences",
        dangerZone: "Danger Zone",
        deleteAccount: "Permanently Delete My Account",
        deleteDesc: "This action is irreversible. All your bookings and invoice history will be anonymized.",
        updating: "Updating...",
        successPassword: "Password updated successfully!",
        successPrefs: "Preferences saved!"
    }
};

export default function CustomerSettingsPage() {
    const params = useParams();
    const locale = (params?.locale as "fr" | "en") || "fr";
    const t = translations[locale];

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [emailNotif, setEmailNotif] = useState(true);
    const [smsNotif, setSmsNotif] = useState(false);
    const [isSavingPrefs, setIsSavingPrefs] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
    });

    const changePasswordMutation = useMutation({
        mutationFn: async (data: PasswordFormData) => {
            return await api.put("/customer/settings/password", data);
        },
        onSuccess: () => {
            toast.success(t.successPassword);
            reset();
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.message || "Erreur de mise à jour";
            toast.error(errorMsg);
        }
    });

    const handleSavePreferences = async () => {
        setIsSavingPrefs(true);
        try {
            await api.put("/customer/settings/preferences", { email_notifications: emailNotif, sms_notifications: smsNotif });
            toast.success(t.successPrefs);
        } catch {
            toast.error("Une erreur est survenue.");
        } finally {
            setIsSavingPrefs(false);
        }
    };

    const onSubmitPassword = (data: PasswordFormData) => {
        changePasswordMutation.mutate(data);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
            <main className="max-w-4xl mx-auto py-8 px-6 space-y-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">
                        {t.title}
                    </h1>
                    <p className="text-zinc-500 font-medium">
                        {t.subtitle}
                    </p>
                </motion.div>

                <div className="grid gap-6">

                    {/* Security / Password */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="rounded-3xl border-zinc-100 shadow-xl bg-white overflow-hidden">
                            <CardHeader className="border-b border-zinc-100 pb-6 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#15a4e6]/10 p-3 rounded-xl">
                                        <Lock className="h-5 w-5 text-[#15a4e6]" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-extrabold text-zinc-900">
                                            {t.securityCard}
                                        </CardTitle>
                                        <p className="text-sm text-zinc-500 mt-1">
                                            {t.securityDesc}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 py-6">
                                <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-6">

                                    {/* Current Password */}
                                    <motion.div
                                        className="space-y-2"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
                                            <Key className="h-3 w-3 text-[#15a4e6]" />
                                            {t.currentPassword}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showCurrent ? "text" : "password"}
                                                {...register("current_password")}
                                                className="block w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-[#15a4e6] focus:ring-2 focus:ring-[#15a4e6]/20 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrent(!showCurrent)}
                                                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600"
                                            >
                                                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <AnimatePresence>
                                            {errors.current_password && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    className="text-xs font-semibold text-red-600 flex items-center gap-1"
                                                >
                                                    <ShieldAlert className="h-3 w-3" /> {errors.current_password.message}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    {/* New Password */}
                                    <motion.div
                                        className="grid gap-4 sm:grid-cols-2"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
                                                <Key className="h-3 w-3 text-[#15a4e6]" />
                                                {t.newPassword}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showNew ? "text" : "password"}
                                                    {...register("new_password")}
                                                    className="block w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-[#15a4e6] focus:ring-2 focus:ring-[#15a4e6]/20 transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNew(!showNew)}
                                                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600"
                                                >
                                                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <AnimatePresence>
                                                {errors.new_password && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -5 }}
                                                        className="text-xs font-semibold text-red-600 flex items-center gap-1"
                                                    >
                                                        <ShieldAlert className="h-3 w-3" /> {errors.new_password.message}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
                                                <CheckCircle2 className="h-3 w-3 text-[#15a4e6]" />
                                                {t.confirmPassword}
                                            </label>
                                            <input
                                                type={showNew ? "text" : "password"}
                                                {...register("confirm_password")}
                                                className="block w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-[#15a4e6] focus:ring-2 focus:ring-[#15a4e6]/20 transition-all"
                                            />
                                            <AnimatePresence>
                                                {errors.confirm_password && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -5 }}
                                                        className="text-xs font-semibold text-red-600 flex items-center gap-1"
                                                    >
                                                        <ShieldAlert className="h-3 w-3" /> {errors.confirm_password.message}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="flex justify-end"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <Button
                                            type="submit"
                                            className="bg-[#15a4e6] hover:bg-[#167c3a] font-bold rounded-xl text-sm py-4 px-6 shadow-lg shadow-[#15a4e6]/30 transition-all hover:shadow-[#15a4e6]/50 disabled:bg-zinc-200 disabled:cursor-not-allowed"
                                            disabled={changePasswordMutation.isPending}
                                        >
                                            {changePasswordMutation.isPending ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    {t.updating}
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="h-4 w-4 mr-2" />
                                                    {t.savePassword}
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Notifications */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="rounded-3xl border-zinc-100 shadow-xl bg-white overflow-hidden">
                            <CardHeader className="border-b border-zinc-100 pb-6 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#15a4e6]/10 p-3 rounded-xl">
                                        <Bell className="h-5 w-5 text-[#15a4e6]" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-extrabold text-zinc-900">
                                            {t.notificationsCard}
                                        </CardTitle>
                                        <p className="text-sm text-zinc-500 mt-1">
                                            {t.notificationsDesc}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 py-6 space-y-6">

                                {/* Email */}
                                <motion.div
                                    className="flex items-start justify-between gap-4 p-4 bg-zinc-50 rounded-2xl"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="flex gap-3 items-start">
                                        <div className="p-2 bg-white border border-zinc-100 rounded-xl text-zinc-400 shrink-0">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <h4 className="text-sm font-bold text-zinc-900">{t.notifEmail}</h4>
                                            <p className="text-xs text-zinc-500 leading-normal">{t.notifEmailDesc}</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={emailNotif}
                                            onChange={(e) => setEmailNotif(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#15a4e6]"></div>
                                    </label>
                                </motion.div>

                                {/* SMS */}
                                <motion.div
                                    className="flex items-start justify-between gap-4 p-4 bg-zinc-50 rounded-2xl"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <div className="flex gap-3 items-start">
                                        <div className="p-2 bg-white border border-zinc-100 rounded-xl text-zinc-400 shrink-0">
                                            <Smartphone className="h-4 w-4" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <h4 className="text-sm font-bold text-zinc-900">{t.notifSms}</h4>
                                            <p className="text-xs text-zinc-500 leading-normal">{t.notifSmsDesc}</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={smsNotif}
                                            onChange={(e) => setSmsNotif(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#15a4e6]"></div>
                                    </label>
                                </motion.div>

                                <motion.div
                                    className="flex justify-end pt-2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Button
                                        onClick={handleSavePreferences}
                                        className="bg-[#15a4e6] hover:bg-[#167c3a] font-bold rounded-xl text-sm py-4 px-6 shadow-lg shadow-[#15a4e6]/30 disabled:bg-zinc-200 disabled:cursor-not-allowed"
                                        disabled={isSavingPrefs}
                                    >
                                        {isSavingPrefs ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                {t.updating}
                                            </>
                                        ) : (
                                            <>
                                                <Bell className="h-4 w-4 mr-2" />
                                                {t.savePrefs}
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Danger Zone */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="rounded-3xl border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-2">
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-red-100 border border-red-200 rounded-2xl text-red-600 shrink-0 shadow-lg">
                                    <ShieldAlert className="h-6 w-6" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">
                                        {t.dangerZone}
                                        <ShieldAlert className="h-4 w-4 text-red-600" />
                                    </h4>
                                    <p className="text-xs text-zinc-600 font-medium max-w-md leading-relaxed">
                                        {t.deleteDesc}
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="rounded-xl font-bold text-sm border-red-300 text-red-600 bg-white hover:bg-red-50 hover:text-red-700 py-4 px-6 shadow-lg shrink-0 gap-2"
                                onClick={() => {
                                    if (confirm("Êtes-vous absolument sûr ? Cette action est définitive.")) {
                                        toast.info("Demande de suppression prise en compte.");
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4" /> {t.deleteAccount}
                            </Button>
                        </Card>
                    </motion.div>

                </div>
            </main>
        </div>
    );
}