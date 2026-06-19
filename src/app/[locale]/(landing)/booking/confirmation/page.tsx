"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useBookingStore } from "@/core/store/useBookingStore";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, Printer } from "lucide-react";
import { motion } from "framer-motion";

export default function BookingConfirmationPage() {
    const { reset } = useBookingStore();
    const router = useRouter();

    // Nettoyer le store une fois la réservation confirmée
    useEffect(() => {
        return () => reset();
    }, [reset]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen flex items-center justify-center p-6 bg-zinc-50"
        >
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-zinc-100 text-center max-w-lg w-full">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-10 w-10 text-[#15a4e6]" />
                </div>
                <h1 className="text-3xl font-extrabold text-zinc-900 mb-2">Réservation confirmée !</h1>
                <p className="text-zinc-500 mb-8">Un email de confirmation vous a été envoyé avec tous les détails de votre séjour.</p>

                <div className="flex gap-4">
                    <Button onClick={() => router.push('/')} className="flex-1 bg-[#15a4e6] hover:bg-[#167c3a] py-6">
                        <Home className="mr-2 h-4 w-4" /> Retour accueil
                    </Button>
                    <Button variant="outline" className="flex-1 py-6">
                        <Printer className="mr-2 h-4 w-4" /> Imprimer
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}