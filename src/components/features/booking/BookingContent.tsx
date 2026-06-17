"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, ChevronRight, Shield, Smartphone, CreditCard, Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
// Importation fictive de vos hooks - Ajustez les chemins d'accès réels
import { useAuth } from "@/core/hooks/useAuth";
import { useRegister } from "@/core/hooks/useRegister";
import {formatDate} from "../../../lib/date";

type AuthData = {
    fullName: string;
    email: string;
    password: string;
};

interface SelectedRoom {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

type Props = {
    selectedRooms: SelectedRoom[];
    guests: {
        adults: number;
        children: number;
    };
    checkIn: string;
    checkOut: string;

    currentStep: number;
    setCurrentStep: (step: number) => void;

    authMode: "login" | "register";
    setAuthMode: (mode: "login" | "register") => void;

    authData: AuthData;
    setAuthData: React.Dispatch<React.SetStateAction<AuthData>>;

    paymentMethod: string | null;
    setPaymentMethod: (value: string) => void;

    onConfirm: () => void;
    isProcessing?: boolean;
};

export function BookingContent({
                                   selectedRooms,
                                   guests,
                                   checkIn,
                                   checkOut,
                                   currentStep,
                                   setCurrentStep,
                                   authMode,
                                   setAuthMode,
                                   authData,
                                   setAuthData,
                                   paymentMethod,
                                   setPaymentMethod,
                                   onConfirm,
                                   isProcessing = false,
                               }: Props) {

    const [authError, setAuthError] = useState<string | null>(null);

    // Initialisation de vos hooks d'authentification
    const loginMutation = useAuth(); // Ou useLogin() selon votre nommage
    const registerMutation = useRegister();

    const totalGuests = (guests?.adults || 0) + (guests?.children || 0);

    const totalNights = (() => {
        if (!checkIn || !checkOut) return 1;
        const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
        return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1);
    })();

    const baseTotal = selectedRooms.reduce(
        (acc, room) => acc + room.price * room.quantity * totalNights,
        0
    );

    const finalTotal = baseTotal > 0 ? baseTotal + 0 : 0;

    // Gestion de la soumission de l'authentification (Étape 2)
    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);

        try {
            if (authMode === "login") {
                // Utilisation directe de la promesse renvoyée par le hook
                await loginMutation.login({
                    email: authData.email,
                    password: authData.password
                });
                setCurrentStep(3); // On passe à l'étape suivante si résolu
            } else {
                await registerMutation.register({
                    name: authData.fullName,
                    email: authData.email,
                    password: authData.password
                });
                setCurrentStep(3); // On passe à l'étape suivante si résolu
            }
        } catch (error: any) {
            // Capture de l'erreur pour affichage local dans le formulaire
            setAuthError(
                error?.response?.data?.message ||
                "Une erreur est survenue lors de l'authentification."
            );
        }
    };

    const isAuthLoading = loginMutation.isPending || registerMutation.isPending;

    return (
        <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-zinc-100 shadow-2xl rounded-3xl p-8 md:p-10"
                >
                    {/* ETAPE 1 : Récapitulatif de la commande */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-3xl font-extrabold text-zinc-900">
                                    Vérifiez votre sélection
                                </h2>
                                <p className="text-zinc-500 mt-2">
                                    Assurez-vous que toutes les informations sont correctes.
                                </p>
                            </div>

                            <div className="bg-zinc-50 rounded-3xl p-6 space-y-5">
                                <div className="space-y-3">
                                    <h3 className="font-bold text-xl text-zinc-900">
                                        Hébergements sélectionnés
                                    </h3>

                                    <div className="divide-y divide-zinc-200/60">
                                        {selectedRooms.map((room) => (
                                            <div key={room.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                                                <div>
                                                    <p className="font-semibold text-zinc-800">{room.name}</p>
                                                    <p className="text-xs text-zinc-500">
                                                        Quantité : {room.quantity} × {room.price?.toLocaleString()} FCFA
                                                    </p>
                                                </div>
                                                <span className="font-bold text-zinc-700">
                                                    {(room.price * room.quantity * totalNights).toLocaleString()} FCFA
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 pt-2">
                                    <div className="bg-white rounded-2xl p-5 border border-zinc-200/80">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="h-5 w-5 text-[#1d9e4b]" />
                                            <span className="font-semibold text-zinc-800">Dates</span>
                                        </div>
                                        <p className="text-zinc-700 font-medium">{formatDate(checkIn)}</p>
                                        <p className="text-sm text-zinc-500">au {formatDate(checkOut)}</p>
                                    </div>

                                    <div className="bg-white rounded-2xl p-5 border border-zinc-200/80">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="h-5 w-5 text-[#1d9e4b]" />
                                            <span className="font-semibold text-zinc-800">Voyageurs</span>
                                        </div>
                                        <p className="text-zinc-700 font-medium">
                                            {totalGuests} voyageur{totalGuests > 1 ? "s" : ""}
                                        </p>
                                        <p className="text-sm text-zinc-500">
                                            {totalNights} nuit{totalNights > 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-[#1d9e4b] hover:bg-[#167c3a] py-6 rounded-xl font-bold"
                                onClick={() => setCurrentStep(2)}
                            >
                                Continuer
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    )}

                    {/* ETAPE 2 : Identification via hooks useAuth & useRegister */}
                    {currentStep === 2 && (
                        <form onSubmit={handleAuthSubmit} className="space-y-6">
                            <div>
                                <h2 className="text-3xl font-extrabold text-zinc-900">Identification</h2>
                                <p className="text-zinc-500 mt-2">Connectez-vous ou créez un compte pour poursuivre.</p>
                            </div>

                            <div className="flex border-b border-zinc-100">
                                <button
                                    type="button"
                                    className={`flex-1 pb-4 font-bold transition-all ${
                                        authMode === "login"
                                            ? "border-b-2 border-[#1d9e4b] text-[#1d9e4b]"
                                            : "text-zinc-400"
                                    }`}
                                    onClick={() => { setAuthMode("login"); setAuthError(null); }}
                                >
                                    Se connecter
                                </button>
                                <button
                                    type="button"
                                    className={`flex-1 pb-4 font-bold transition-all ${
                                        authMode === "register"
                                            ? "border-b-2 border-[#1d9e4b] text-[#1d9e4b]"
                                            : "text-zinc-400"
                                    }`}
                                    onClick={() => { setAuthMode("register"); setAuthError(null); }}
                                >
                                    Créer un compte
                                </button>
                            </div>

                            {/* Section d'affichage des erreurs d'API */}
                            {authError && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                                    {authError}
                                </div>
                            )}

                            <div className="space-y-4">
                                {authMode === "register" && (
                                    <input
                                        required
                                        className="w-full p-4 border rounded-xl bg-transparent outline-none focus:border-[#1d9e4b]"
                                        placeholder="Nom complet"
                                        value={authData.fullName}
                                        onChange={(e) => setAuthData((prev) => ({ ...prev, fullName: e.target.value }))}
                                    />
                                )}
                                <input
                                    required
                                    type="email"
                                    className="w-full p-4 border rounded-xl bg-transparent outline-none focus:border-[#1d9e4b]"
                                    placeholder="Adresse email"
                                    value={authData.email}
                                    onChange={(e) => setAuthData((prev) => ({ ...prev, email: e.target.value }))}
                                />
                                <input
                                    required
                                    type="password"
                                    className="w-full p-4 border rounded-xl bg-transparent outline-none focus:border-[#1d9e4b]"
                                    placeholder="Mot de passe"
                                    value={authData.password}
                                    onChange={(e) => setAuthData((prev) => ({ ...prev, password: e.target.value }))}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#1d9e4b] hover:bg-[#167c3a] py-6 rounded-xl font-bold flex justify-center items-center gap-2"
                                disabled={!authData.email || !authData.password || isAuthLoading}
                            >
                                {isAuthLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                                {authMode === "login" ? "Se connecter et continuer" : "Créer le compte et continuer"}
                            </Button>

                            <p className="text-center text-xs text-zinc-400 flex justify-center items-center gap-2">
                                <Shield className="h-4 w-4 text-[#1d9e4b]" />
                                Vos informations sont sécurisées.
                            </p>
                        </form>
                    )}

                    {/* ETAPE 3 : Sélection du paiement */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-3xl font-extrabold text-zinc-900">Paiement</h2>
                                <p className="text-zinc-500 mt-2">
                                    Total à régler : <strong className="text-[#1d9e4b] text-xl ml-1">{finalTotal.toLocaleString()} FCFA</strong>
                                </p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { id: "momo", icon: Smartphone, title: "Mobile Money (Orange / MTN)" },
                                    { id: "card", icon: CreditCard, title: "Carte bancaire (Visa / Mastercard)" },
                                    { id: "wallet", icon: Wallet, title: "Wallet BookIt" },
                                ].map((method) => {
                                    const Icon = method.icon;
                                    return (
                                        <div
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`p-5 border rounded-2xl cursor-pointer transition-all hover:border-[#1d9e4b]/60 ${
                                                paymentMethod === method.id
                                                    ? "border-[#1d9e4b] bg-green-50/60 shadow-sm"
                                                    : "border-zinc-200 bg-white"
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <Icon className={`h-6 w-6 ${paymentMethod === method.id ? "text-[#1d9e4b]" : "text-zinc-500"}`} />
                                                <span className="font-semibold text-zinc-800">{method.title}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <Button
                                className="w-full bg-[#1d9e4b] hover:bg-[#167c3a] py-6 rounded-xl font-bold text-lg shadow-md flex justify-center items-center gap-2"
                                disabled={!paymentMethod || isProcessing}
                                onClick={onConfirm}
                            >
                                {isProcessing && <Loader2 className="h-5 w-5 animate-spin" />}
                                {isProcessing ? "Traitement en cours..." : `Finaliser et payer ${finalTotal.toLocaleString()} FCFA`}
                            </Button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}