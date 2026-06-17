"use client";

import { motion } from "framer-motion";

export function BookingLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center"
            >
                <div className="relative mx-auto mb-6 h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-zinc-200" />

                    <div
                        className="
                            absolute inset-0
                            rounded-full
                            border-4
                            border-[#1d9e4b]
                            border-t-transparent
                            animate-spin
                        "
                    />
                </div>

                <h2 className="text-xl font-bold text-zinc-900">
                    Chargement de votre réservation...
                </h2>

                <p className="mt-2 text-zinc-500">
                    Veuillez patienter quelques instants.
                </p>
            </motion.div>
        </div>
    );
}