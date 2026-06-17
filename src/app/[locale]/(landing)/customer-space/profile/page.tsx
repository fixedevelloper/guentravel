"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { useParams } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import {User, Mail, Phone, ShieldCheck, Loader2, Save, XCircle, Info} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
// --- SCHÉMA DE VALIDATION ZOD ---
const profileSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères / Name must be at least 2 characters"),
    email: z.string().email("Format d'email invalide / Invalid email format"),
    phone: z.string().min(8, "Numéro de téléphone invalide / Invalid phone number").optional().or(z.string().length(0)),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// --- DICTIONNAIRE MULTI-LANGUE ---
const translations = {
    fr: {
        title: "Mon Profil",
        subtitle: "Gérez vos informations personnelles et vos coordonnées.",
        personalInfo: "Informations personnelles",
        nameLabel: "Nom complet",
        emailLabel: "Adresse email",
        phoneLabel: "Numéro de téléphone (WhatsApp)",
        phonePlaceholder: "Ex: +225 07 00 00 00 00",
        saveBtn: "Sauvegarder les modifications",
        saving: "Enregistrement en cours...",
        successMsg: "Profil mis à jour avec succès !",
        errorMsg: "Une erreur est survenue lors de la mise à jour.",
        loading: "Chargement de votre profil...",
        securityNotice: "Sécurité du compte",
        securityDesc: "Votre adresse email sert d'identifiant unique. Pour la modifier, veuillez contacter notre support technique."
    },
    en: {
        title: "My Profile",
        subtitle: "Manage your personal information and contact details.",
        personalInfo: "Personal Information",
        nameLabel: "Full Name",
        emailLabel: "Email Address",
        phoneLabel: "Phone Number (WhatsApp)",
        phonePlaceholder: "E.g., +234 80 000 0000",
        saveBtn: "Save Changes",
        saving: "Saving changes...",
        successMsg: "Profile updated successfully!",
        errorMsg: "An error occurred during the update.",
        loading: "Loading your profile...",
        securityNotice: "Account Security",
        securityDesc: "Your email address serves as a unique identifier. To change it, please contact our support team."
    }
};

export default function CustomerProfilePage() {
    const params = useParams();
    const queryClient = useQueryClient();
    const locale = (params?.locale as "fr" | "en") || "fr";
    const t = translations[locale];

    // --- CONFIGURATION SOUCHETTE REACT HOOK FORM ---
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    });

    // --- RÉCUPÉRATION DES DONNÉES DE L'UTILISATEUR ---
    const { isLoading } = useQuery({
        queryKey: ["customer-profile-data"],
        queryFn: async () => {
            const response = await api.get("/me"); // Endpoint Laravel configuré dans votre AuthProvider
            const userData = response.data.user || response.data.data;

            // Injection des données de la DB directement dans le formulaire
            reset({
                name: userData.name || "",
                email: userData.email || "",
                phone: userData.phone || "",
            });
            return userData;
        },
    });

    // --- MUTATION POUR ENREGISTRER LES MODIFICATIONS ---
    const updateProfileMutation = useMutation({
        mutationFn: async (data: ProfileFormData) => {
            return await api.put("/customer/profile/update", data); // À créer dans votre ProfileController Laravel
        },
        onSuccess: () => {
            toast.success(t.successMsg);
            // Invalider le cache pour forcer React Query à rafraîchir les données partout
            queryClient.invalidateQueries({ queryKey: ["customer-profile-data"] });
        },
        onError: (error: any) => {
            const backendError = error.response?.data?.message || t.errorMsg;
            toast.error(backendError);
        }
    });

    const onSubmit = (data: ProfileFormData) => {
        updateProfileMutation.mutate(data);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1d9e4b] mx-auto" />
                    <p className="text-sm font-semibold text-zinc-500">{t.loading}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 lg:p-10 max-w-3xl mx-auto space-y-8">

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
                {/* Formulaire */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="rounded-3xl border-zinc-100 shadow-xl bg-white overflow-hidden">
                        <CardHeader className="border-b border-zinc-100 pb-6 px-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#1d9e4b]/10 p-3 rounded-xl">
                                    <User className="h-5 w-5 text-[#1d9e4b]" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-extrabold text-zinc-900">
                                        {t.personalInfo}
                                    </CardTitle>
                                    <p className="text-sm text-zinc-500 mt-1">
                                        Modifiez vos informations personnelles
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="px-6 py-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                                {/* Nom complet */}
                                <motion.div
                                    className="space-y-2"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                                        {t.nameLabel}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            {...register("name")}
                                            className={`block w-full rounded-xl border pl-10 pr-4 py-3 text-sm shadow-sm outline-none transition-all duration-200
                                        ${errors.name ? "border-red-400 bg-red-50/50" : "border-zinc-200 focus:border-[#1d9e4b] focus:ring-2 focus:ring-[#1d9e4b]/20"}`}
                                        />
                                        <User className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                                    </div>
                                    {errors.name && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-xs font-semibold text-red-600 flex items-center gap-1"
                                        >
                                            <XCircle className="h-3 w-3" /> {errors.name.message}
                                        </motion.p>
                                    )}
                                </motion.div>

                                {/* Email (désactivé) */}
                                <motion.div
                                    className="space-y-2 opacity-60"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
                                        {t.emailLabel}
                                        <ShieldCheck className="h-3 w-3 text-[#1d9e4b]" />
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            {...register("email")}
                                            disabled
                                            className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-3 text-sm text-zinc-500 cursor-not-allowed outline-none"
                                        />
                                        <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                                    </div>
                                    <p className="text-xs text-zinc-400 flex items-center gap-1">
                                        <Info className="h-3 w-3" /> Email non modifiable pour sécurité
                                    </p>
                                </motion.div>

                                {/* Téléphone */}
                                <motion.div
                                    className="space-y-2"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                                        {t.phoneLabel}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            {...register("phone")}
                                            placeholder={t.phonePlaceholder}
                                            className={`block w-full rounded-xl border pl-10 pr-4 py-3 text-sm shadow-sm outline-none transition-all duration-200
                                        ${errors.phone ? "border-red-400 bg-red-50/50" : "border-zinc-200 focus:border-[#1d9e4b] focus:ring-2 focus:ring-[#1d9e4b]/20"}`}
                                        />
                                        <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                                    </div>
                                    {errors.phone && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-xs font-semibold text-red-600 flex items-center gap-1"
                                        >
                                            <XCircle className="h-3 w-3" /> {errors.phone.message}
                                        </motion.p>
                                    )}
                                </motion.div>

                                {/* Bouton submit */}
                                <motion.div
                                    className="pt-4 flex justify-end"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Button
                                        type="submit"
                                        className="bg-[#1d9e4b] hover:bg-[#167c3a] font-bold rounded-xl text-sm py-4 px-6 shadow-lg shadow-[#1d9e4b]/30 transition-all hover:shadow-[#1d9e4b]/50 active:scale-[0.98] disabled:bg-zinc-200 disabled:cursor-not-allowed"
                                        disabled={updateProfileMutation.isPending}
                                    >
                                        {updateProfileMutation.isPending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                {t.saving}
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                {t.saveBtn}
                                            </>
                                        )}
                                    </Button>
                                </motion.div>

                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Banner sécurité */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="rounded-3xl border-zinc-100 shadow-lg bg-gradient-to-br from-[#1d9e4b]/5 to-[#1d9e4b]/10 p-6 flex gap-4 items-start border border-[#1d9e4b]/20">
                        <div className="p-3 bg-[#1d9e4b]/10 rounded-2xl shrink-0">
                            <ShieldCheck className="h-6 w-6 text-[#1d9e4b]" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">
                                {t.securityNotice}
                                <ShieldCheck className="h-4 w-4 text-[#1d9e4b]" />
                            </h4>
                            <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                                {t.securityDesc}
                            </p>
                        </div>
                    </Card>
                </motion.div>
            </div>

        </div>
    );
}