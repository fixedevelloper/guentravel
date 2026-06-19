"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { z } from "zod";
import { toast } from "sonner";
import {
    Hotel,
    User,
    Mail,
    Lock,
    Phone,
    Building2,
    Eye,
    EyeOff,
    Loader2,
    ShieldCheck,
    ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
// --- SCHÉMA DE VALIDATION (ZOD) ---
const hostRegisterSchema = z.object({
    name: z.string().min(3, "Le nom complet ou raison sociale doit contenir au moins 3 caractères"),
    email: z.string().email("Adresse email invalide"),
    phone: z.string().min(8, "Numéro de téléphone invalide"),
    company_name: z.string().optional(), // Facultatif pour les particuliers
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"]
});

type HostRegisterFormData = z.infer<typeof hostRegisterSchema>;

// --- DICTIONNAIRE MULTI-LANGUE ---
const translations = {
    fr: {
        title: "Rejoignez Guen's Travel en tant qu'Hôte",
        subtitle: "Publiez vos résidences, gérez vos réservations et maximisez vos revenus en Afrique.",
        labelName: "Nom complet / Nom d'agence",
        labelEmail: "Adresse email professionnelle",
        labelPhone: "Numéro de téléphone (WhatsApp recommandé)",
        labelCompany: "Nom de l'entreprise / Structure (Optionnel)",
        labelPassword: "Mot de passe",
        labelConfirm: "Confirmer le mot de passe",
        agreeTerms: "En vous inscrivant, vous acceptez nos Conditions Générales Hôtes.",
        submitBtn: "Créer mon espace hébergeur",
        submitting: "Création de votre compte...",
        successMsg: "Votre compte hôte a été créé avec succès !",
        errorMsg: "Une erreur est survenue lors de l'inscription.",
        alreadyHaveAccount: "Vous avez déjà un compte hôte ?",
        loginBtn: "Se connecter",
        feature1Title: "Diffusion ciblée",
        feature1Desc: "Touchez une clientèle internationale et locale prête à réserver.",
        feature2Title: "Paiements sécurisés",
        feature2Desc: "Recevez vos versements directement par Mobile Money ou virement bancaire."
    },
    en: {
        title: "Join Guen's Travel as a Host",
        subtitle: "List your properties, manage your bookings, and maximize your revenue in Africa.",
        labelName: "Full Name / Agency Name",
        labelEmail: "Professional Email Address",
        labelPhone: "Phone Number (WhatsApp recommended)",
        labelCompany: "Company Name / Structure (Optional)",
        labelPassword: "Password",
        labelConfirm: "Confirm Password",
        agreeTerms: "By registering, you agree to our Host Terms & Conditions.",
        submitBtn: "Create my host account",
        submitting: "Creating your account...",
        successMsg: "Your host account has been created successfully!",
        errorMsg: "An error occurred during registration.",
        alreadyHaveAccount: "Already have a host account?",
        loginBtn: "Log in",
        feature1Title: "Targeted Exposure",
        feature1Desc: "Reach an international and local audience ready to book.",
        feature2Title: "Secure Payments",
        feature2Desc: "Receive payouts instantly via Mobile Money or bank transfer."
    }
};

export default function HostRegisterPage() {
    const params = useParams();
    const router = useRouter();
    const locale = (params?.locale as "fr" | "en") || "fr";
    const t = translations[locale];

    const [showPassword, setShowPassword] = useState(false);

    // --- INITIALISATION FORMULAIRE ---
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<HostRegisterFormData>({
        resolver: zodResolver(hostRegisterSchema),
    });

    // --- MUTATION : APPEL API LARAVEL VIA TANSTACK QUERY ---
    const hostRegisterMutation = useMutation({
        mutationFn: async (data: HostRegisterFormData) => {
            // Point d'entrée Laravel d'inscription des professionnels (rôle: host)
            return await api.post("/host/register", data);
        },
        onSuccess: () => {
            toast.success(t.successMsg);
            // Redirection immédiate vers le tableau de bord Hôte ou page d'accueil d'onboarding
            router.push(`/host/dashboard`);
        },
        onError: (error: any) => {
            const serverMessage = error.response?.data?.message || t.errorMsg;
            toast.error(serverMessage);
        }
    });

    const onSubmit = (data: HostRegisterFormData) => {
        hostRegisterMutation.mutate(data);
    };

    return (
        <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-12 bg-zinc-50/50">

            {/* PANNEAU DE GAUCHE : MARKETING & PROPOSITION DE VALEUR */}
            <div className="hidden lg:flex lg:col-span-5 bg-zinc-900 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#15a4e6]/20 to-transparent z-0" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-white">
                        <Hotel className="h-6 w-6 text-[#15a4e6]" />
                        <span className="text-xl font-black tracking-tight">Guen's <span className="text-[#7bcd4f]">Host</span></span>
                    </div>
                </div>

                <div className="space-y-6 relative z-10 max-w-sm">
                    <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
                        Rentabilisez vos logements vides dès aujourd'hui.
                    </h2>

                    <div className="space-y-4 pt-4 border-t border-zinc-800">
                        <div className="flex gap-3 items-start">
                            <div className="p-2 bg-zinc-800 border border-zinc-700 text-[#15a4e6] rounded-xl shrink-0">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">{t.feature1Title}</h4>
                                <p className="text-xs text-zinc-400 font-medium leading-relaxed mt-0.5">{t.feature1Desc}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <div className="p-2 bg-zinc-800 border border-zinc-700 text-[#7bcd4f] rounded-xl shrink-0">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">{t.feature2Title}</h4>
                                <p className="text-xs text-zinc-400 font-medium leading-relaxed mt-0.5">{t.feature2Desc}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-zinc-500 relative z-10 font-medium">
                    &copy; {new Date().getFullYear()} Guen's Travel S.A. Tous droits réservés.
                </p>
            </div>

            {/* PANNEAU DE DROITE : FORMULAIRE D'INSCRIPTION */}
            <div className="lg:col-span-7 flex items-center justify-center p-4 md:p-12">
                <Card className="w-full max-w-xl rounded-3xl border-zinc-200 shadow-sm bg-white overflow-hidden">
                    <CardContent className="p-6 md:p-10 space-y-6">

                        {/* EN-TÊTE FORMULAIRE */}
                        <div className="space-y-1.5">
                            <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight leading-tight">
                                {t.title}
                            </h1>
                            <p className="text-xs md:text-sm font-medium text-zinc-500">
                                {t.subtitle}
                            </p>
                        </div>

                        {/* FORMULAIRE DE TYPE GRILLE */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            {/* Nom Complet */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{t.labelName}</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Jean Dupont ou Agence Horizon"
                                        {...register("name")}
                                        className="block w-full rounded-xl border border-zinc-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-zinc-800 transition-all"
                                    />
                                </div>
                                {errors.name && <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.name.message}</p>}
                            </div>

                            {/* Email et Téléphone sur la même ligne si écran large */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{t.labelEmail}</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                                        <input
                                            type="email"
                                            placeholder="host@exemple.com"
                                            {...register("email")}
                                            className="block w-full rounded-xl border border-zinc-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-zinc-800 transition-all"
                                        />
                                    </div>
                                    {errors.email && <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.email.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{t.labelPhone}</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                                        <input
                                            type="tel"
                                            placeholder="+225 07 00 00 00 00"
                                            {...register("phone")}
                                            className="block w-full rounded-xl border border-zinc-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-zinc-800 transition-all"
                                        />
                                    </div>
                                    {errors.phone && <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.phone.message}</p>}
                                </div>
                            </div>

                            {/* Entreprise (Optionnel) */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{t.labelCompany}</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Ex: SCI Les Palmiers"
                                        {...register("company_name")}
                                        className="block w-full rounded-xl border border-zinc-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-zinc-800 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Mots de passe */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{t.labelPassword}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            {...register("password")}
                                            className="block w-full rounded-xl border border-zinc-300 pl-10 pr-10 py-2.5 text-sm outline-none focus:border-zinc-800 transition-all"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-zinc-400 hover:text-zinc-600">
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.password.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{t.labelConfirm}</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        {...register("confirm_password")}
                                        className="block w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-zinc-800 transition-all"
                                    />
                                    {errors.confirm_password && <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.confirm_password.message}</p>}
                                </div>
                            </div>

                            <p className="text-[11px] font-medium text-zinc-400 leading-normal">
                                {t.agreeTerms}
                            </p>

                            {/* Bouton de Soumission */}
                            <Button
                                type="submit"
                                className="w-full bg-[#15a4e6] hover:bg-[#167c3a] text-white rounded-xl text-xs font-bold h-11 shadow-sm gap-1.5 transition-all pt-1"
                                disabled={hostRegisterMutation.isPending}
                            >
                                {hostRegisterMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ArrowRight className="h-4 w-4" />
                                )}
                                {hostRegisterMutation.isPending ? t.submitting : t.submitBtn}
                            </Button>
                        </form>

                        {/* REDIRECTION VERS CONNEXION */}
                        <div className="pt-4 border-t border-zinc-100 text-center text-xs font-semibold text-zinc-500">
                            <span>{t.alreadyHaveAccount} </span>
                            <Link href="/host-portal/login" className="text-[#15a4e6] hover:underline font-bold">
                                {t.loginBtn}
                            </Link>
                        </div>

                    </CardContent>
                </Card>
            </div>

        </div>
    );
}