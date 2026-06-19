"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, useAuth } from "@/core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, Eye, EyeOff, Mail, Lock, UserPlus } from "lucide-react";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

type FormData = z.infer<typeof loginSchema>;

export default function CustomerPortalLogin() {
    const t = useTranslations("Auth");
    const { login, isPending } = useAuth();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: FormData) => {
        try {
            await login(data);
            router.push("/customer-space/dashboard");
        } catch (e) {}
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 px-4">
            <div className="w-full max-w-md space-y-8 rounded-3xl border border-zinc-200/80 bg-white p-8 md:p-10 shadow-xl transition-all">

                <div className="space-y-3 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#7bcd4f]/10 mb-2">
                        <ShieldAlert className="w-8 h-8 text-[#7bcd4f]" />
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 md:text-3xl">
                        {t("title")}
                    </h1>
                    <p className="text-sm font-medium text-zinc-500 max-w-xs mx-auto leading-relaxed">
                        {t("subtitle")}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* EMAIL */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" /> {t("fields.email.label")}
                        </label>
                        <input
                            type="email"
                            {...register("email")}
                            className="block w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none transition-all focus:border-zinc-800"
                            placeholder={t("fields.email.placeholder")}
                        />
                        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                    </div>

                    {/* PASSWORD */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5" /> {t("fields.password.label")}
                            </label>
                            <a href="#" className="text-xs font-semibold text-zinc-500 hover:text-zinc-900">{t("fields.password.forgot")}</a>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("password")}
                                className="block w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none transition-all focus:border-zinc-800"
                                placeholder="••••••••••••"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-[#7bcd4f] hover:bg-[#15a4e6] py-6 rounded-xl text-sm font-bold text-white" disabled={isPending}>
                        {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("button.loading")}</> : t("button.submit")}
                    </Button>

                    <div className="text-center pt-2">
                        <p className="text-sm text-zinc-600 mb-3">{t("noAccount")}</p>
                        <Link href="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-[#7bcd4f] hover:text-[#15a4e6]">
                            <UserPlus className="w-4 h-4" /> {t("register")}
                        </Link>
                    </div>
                </form>

                <div className="text-center pt-2 border-t border-zinc-100">
                    <p className="text-xs text-zinc-400 font-medium flex items-center justify-center gap-1.5">
                        <ShieldAlert className="w-3 h-3" /> {t("securityNote")}
                    </p>
                </div>
            </div>
        </div>
    );
}