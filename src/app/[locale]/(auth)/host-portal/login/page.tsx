"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, useAuth } from "@/core/hooks/useAuth";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { z } from "zod";
import {
    Hotel,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    ShieldCheck,
    ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
type FormData = z.infer<typeof loginSchema>;

// --- DICTIONNAIRE MULTI-LANGUE INTÉGRÉ ---
const translations = {
    fr: {
        title: "Espace Partenaire Guen's Travel",
        subtitle: "Connectez-vous pour gérer vos établissements, suivre vos réservations et piloter vos retraits.",
        labelEmail: "Adresse email professionnelle",
        labelPassword: "Mot de passe",
        submitBtn: "Accéder à mon espace",
        submitting: "Connexion au tableau de bord...",
        noAccount: "Vous n'avez pas encore de compte hôte ?",
        registerBtn: "Créer un compte",
        sidebarTitle: "Pilotez votre activité en toute simplicité.",
        feature1Title: "Gestion centralisée",
        feature1Desc: "Suivez vos plannings de réservations, vos nuitées et vos taux d'occupation sur un seul écran.",
        feature2Title: "Suivi des revenus",
        feature2Desc: "Visualisez votre portefeuille en temps réel et demandez vos virements instantanément."
    },
    en: {
        title: "Guen's Travel Partner Space",
        subtitle: "Log in to manage your properties, track your bookings, and control your payouts.",
        labelEmail: "Professional email address",
        labelPassword: "Password",
        submitBtn: "Access my dashboard",
        submitting: "Connecting to dashboard...",
        noAccount: "Don't have a host account yet?",
        registerBtn: "Create an account",
        sidebarTitle: "Manage your business with ease.",
        feature1Title: "Centralized Management",
        feature1Desc: "Track your booking schedules, nights booked, and occupancy rates on a single screen.",
        feature2Title: "Revenue Tracking",
        feature2Desc: "View your wallet balance in real time and request instant payouts."
    }
};

export default function HostPortalLogin() {
    const { login, isPending } = useAuth();
    const params = useParams();
    const locale = (params?.locale as "fr" | "en") || "fr";
    const t = translations[locale];
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: FormData) => {
        try {
            await login(data);
            router.push("/host/dashboard");
        } catch (e) {
            // L'erreur est gérée globalement par l'intercepteur ou le bloc onError du hook useAuth
        }
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
                        {t.sidebarTitle}
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

            {/* PANNEAU DE DROITE : FORMULAIRE DE CONNEXION */}
            <div className="lg:col-span-7 flex items-center justify-center p-4 md:p-12">
                <Card className="w-full max-w-md rounded-3xl border-zinc-200 shadow-sm bg-white overflow-hidden">
                    <CardContent className="p-6 md:p-10 space-y-6">

                        {/* EN-TÊTE DU FORMULAIRE */}
                        <div className="space-y-1.5">
                            <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight leading-tight">
                                {t.title}
                            </h1>
                            <p className="text-xs md:text-sm font-medium text-zinc-500">
                                {t.subtitle}
                            </p>
                        </div>

                        {/* FORMULAIRE */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            {/* Identifiant Email */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{t.labelEmail}</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                                    <input
                                        type="email"
                                        placeholder="nom@hotel.com"
                                        {...register("email")}
                                        className="block w-full rounded-xl border border-zinc-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-zinc-800 transition-all shadow-sm"
                                    />
                                </div>
                                {errors.email && <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.email.message}</p>}
                            </div>

                            {/* Mot de passe */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{t.labelPassword}</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        {...register("password")}
                                        className="block w-full rounded-xl border border-zinc-300 pl-10 pr-10 py-2.5 text-sm outline-none focus:border-zinc-800 transition-all shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.password.message}</p>}
                            </div>

                            {/* Bouton de Soumission */}
                            <Button
                                type="submit"
                                className="w-full bg-[#15a4e6] hover:bg-[#167c3a] text-white rounded-xl text-xs font-bold h-11 shadow-sm gap-1.5 transition-all pt-1 mt-2"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ArrowRight className="h-4 w-4" />
                                )}
                                {isPending ? t.submitting : t.submitBtn}
                            </Button>
                        </form>

                        {/* REDIRECTION VERS L'INSCRIPTION HÔTE */}
                        <div className="pt-4 border-t border-zinc-100 text-center text-xs font-semibold text-zinc-500">
                            <span>{t.noAccount} </span>
                            <Link href="/host-portal/register" className="text-[#15a4e6] hover:underline font-bold">
                                {t.registerBtn}
                            </Link>
                        </div>

                    </CardContent>
                </Card>
            </div>

        </div>
    );
}