"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useRouter, Link } from "@/i18n/routing";
import { useRegister } from "../../../../core/hooks/useRegister";

// Définition du schéma avec des clés de traduction pour les messages d'erreur si nécessaire
const registerSchema = z.object({
    name: z.string().min(2, "Name too short"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password too short"),
});

type FormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const t = useTranslations("RegisterCustomer");
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    // Correction ici : distinction entre le hook d'auth et le registre du formulaire
    const { register: registerUser, isPending } = useRegister();

    const {
        register: formRegister,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<FormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: FormData) => {
        await registerUser(data);
        router.push("/customer-space/dashboard");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 px-4">
            <div className="w-full max-w-md space-y-8 rounded-3xl border border-zinc-200/80 bg-white p-8 md:p-10 shadow-xl transition-all">

                <div className="space-y-3 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#15a4e6]/10 mb-2">
                        <User className="w-8 h-8 text-[#15a4e6]" />
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 md:text-3xl">
                        {t("title")}
                    </h1>
                    <p className="text-sm font-medium text-zinc-500 max-w-xs mx-auto leading-relaxed">
                        {t("subtitle")}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Nom Complet */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" /> {t("fields.name")}
                        </label>
                        <input
                            {...formRegister("name")}
                            className={`block w-full rounded-xl border px-4 py-3 text-sm shadow-sm outline-none transition-all ${errors.name ? "border-red-400" : "border-zinc-300"}`}
                            placeholder="Jean Dupont"
                        />
                        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" /> {t("fields.email")}
                        </label>
                        <input
                            {...formRegister("email")}
                            type="email"
                            className={`block w-full rounded-xl border px-4 py-3 text-sm shadow-sm outline-none transition-all ${errors.email ? "border-red-400" : "border-zinc-300"}`}
                            placeholder="email@example.com"
                        />
                        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                    </div>

                    {/* Mot de passe */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" /> {t("fields.password")}
                        </label>
                        <div className="relative">
                            <input
                                {...formRegister("password")}
                                type={showPassword ? "text" : "password"}
                                className={`block w-full rounded-xl border px-4 py-3 text-sm shadow-sm outline-none transition-all ${errors.password ? "border-red-400" : "border-zinc-300"}`}
                                placeholder="••••••••"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
                    </div>

                    <Button type="submit" className="w-full bg-[#15a4e6] hover:bg-[#198a3e] py-6 rounded-xl font-bold text-white" disabled={isPending || isSubmitting}>
                        {isPending || isSubmitting ? <Loader2 className="animate-spin" /> : <>{t("submit")} <ArrowRight className="ml-2 h-4 w-4" /></>}
                    </Button>
                </form>

                <div className="text-center pt-2 border-t border-zinc-100">
                    <p className="text-sm text-zinc-600">
                        {t("hasAccount")} <Link href="/login" className="text-[#15a4e6] font-semibold hover:underline">{t("login")}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}