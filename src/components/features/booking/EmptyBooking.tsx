"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";

export function EmptyBooking() {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen flex items-center justify-center bg-zinc-50 px-6"
        >
            <div className="max-w-md text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
                    <FileText className="h-10 w-10 text-zinc-400" />
                </div>

                <h1 className="text-2xl font-extrabold text-zinc-900">
                    Aucune réservation en cours
                </h1>

                <p className="mt-3 text-zinc-500">
                    Vous n'avez sélectionné aucune chambre.
                    Retournez à l'accueil pour commencer votre réservation.
                </p>

                <Button
                    onClick={() => router.push("/")}
                    className="mt-8 bg-[#1d9e4b] hover:bg-[#167c3a]"
                >
                    Retour à l'accueil
                </Button>
            </div>
        </motion.div>
    );
}