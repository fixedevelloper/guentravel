"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, useAuth } from "@/core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import React from "react";

type FormData = z.infer<typeof loginSchema>;

export default function HostPortalLogin() {
    const { login, isPending } = useAuth(); // Assurez-vous que login gère le asynchrone / ou utilisez loginAsync si c'est du React Query
    const router = useRouter();

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
            router.push("/secure/");
        } catch (e) {
            // L'erreur est gérée globalement par l'intercepteur ou le bloc onError du hook useAuth
            console.error("Échec de la connexion :", e);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
            <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">

                {/* En-tête */}
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                        Espace Admin Guen's Travel
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Connectez-vous pour gérer votre espace administrateur.
                    </p>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Email */}
                    <div>
                        <label className="text-sm font-medium text-zinc-700">
                            Adresse Email Professionnelle
                        </label>
                        <input
                            type="email"
                            {...register("email")}
                            disabled={isPending}
                            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none disabled:opacity-50"
                            placeholder="nom@hotel.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Mot de passe */}
                    <div>
                        <label className="text-sm font-medium text-zinc-700">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            {...register("password")}
                            disabled={isPending}
                            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none disabled:opacity-50"
                            placeholder="••••••••"
                        />
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Bouton de soumission */}
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Connexion au tableau de bord...
                            </>
                        ) : (
                            "Accéder à mon espace"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}