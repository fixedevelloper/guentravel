"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import {
    Check,
    ChevronLeft,
    FileText,
    UserPlus,
    CreditCard,
    Heart,
} from "lucide-react";
import { motion } from "framer-motion";

interface SelectedRoom {
    id: string;
    name: string;
    price: number;
    quantity: number;
}


const steps = [
    {
        id: 1,
        label: "Récapitulatif",
        description: "Vérifiez votre sélection",
        icon: FileText,
    },
    {
        id: 2,
        label: "Identification",
        description: "Connexion ou inscription",
        icon: UserPlus,
    },
    {
        id: 3,
        label: "Paiement",
        description: "Finalisez votre réservation",
        icon: CreditCard,
    },
];

interface Props {
    children: React.ReactNode;
    selectedRooms: SelectedRoom[];
    property: any;
    guests: {
        adults: number;
        children: number;
    };
    currentStep: number;
    setCurrentStep: (step: number) => void;
    checkIn: string;
    checkOut: string;
}

export function BookingLayout({
                                  children,
                                  property,
                                  selectedRooms = [],
                                  guests,
                                  currentStep,
                                  checkIn,
                                  checkOut,
                              }: Props) {
    const router = useRouter();

    const totalGuests = (guests?.adults || 0) + (guests?.children || 0);

    // Génère une chaîne textuelle des chambres s'il n'y a pas de nom de propriété chargé
    const roomsSummary = selectedRooms.map(r => `${r.quantity}x ${r.name}`).join(", ");

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">

            {/* HEADER */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-b border-zinc-200 px-6 py-4"
            >
                <div className="max-w-6xl mx-auto flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        <Button
                            variant="ghost"
                            className="p-2 hover:bg-zinc-100"
                            onClick={() => router.back()}
                        >
                            <ChevronLeft className="h-5 w-5 text-zinc-600" />
                        </Button>

                        <div>
                            <h1 className="text-xl font-extrabold text-zinc-900">
                                Réservation
                            </h1>

                            <p className="text-sm text-zinc-500">
                                {property?.name?.fr ?? roomsSummary ?? ""}
                            </p>
                        </div>

                    </div>

                    <div className="flex items-center gap-2 bg-[#1d9e4b]/10 px-4 py-2 rounded-full">

                        <Heart className="h-4 w-4 text-[#1d9e4b] fill-[#1d9e4b]" />

                        <span className="font-bold text-[#1d9e4b]">
                            {totalGuests} voyageur{totalGuests > 1 ? "s" : ""}
                        </span>

                    </div>

                </div>
            </motion.header>

            {/* STEPPER */}
            <div className="max-w-6xl mx-auto px-6 pt-12">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="relative flex justify-between items-center">

                        {/* Ligne grise */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-200 -translate-y-1/2 z-0" />

                        {/* Progression */}
                        <div
                            className="absolute top-1/2 left-0 h-0.5 bg-[#1d9e4b] -translate-y-1/2 transition-all duration-500 z-0"
                            style={{
                                width: `${(
                                    (currentStep - 1) /
                                    (steps.length - 1)
                                ) * 100}%`,
                            }}
                        />

                        {steps.map((step) => {
                            const Icon = step.icon;

                            const isCompleted = currentStep > step.id;
                            const isActive = currentStep === step.id;

                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ scale: 0.9 }}
                                    animate={{
                                        scale: isActive ? 1.1 : 1,
                                    }}
                                    transition={{
                                        duration: 0.3,
                                    }}
                                    className="relative z-10 flex flex-col items-center"
                                >
                                    <div
                                        className={`
                                            w-14 h-14 rounded-full
                                            flex items-center justify-center
                                            border-2 shadow-lg
                                            transition-all duration-300

                                            ${
                                            isCompleted
                                                ? "bg-[#1d9e4b] border-[#1d9e4b] text-white"
                                                : isActive
                                                ? "bg-white border-[#1d9e4b] text-[#1d9e4b]"
                                                : "bg-white border-zinc-200 text-zinc-400"
                                        }
                                        `}
                                    >
                                        {isCompleted ? (
                                            <Check className="h-6 w-6" />
                                        ) : (
                                            <Icon className="h-6 w-6" />
                                        )}
                                    </div>

                                    <div className="text-center mt-3">

                                        <p
                                            className={`text-sm font-bold ${
                                                isActive
                                                    ? "text-zinc-900"
                                                    : "text-zinc-400"
                                            }`}
                                        >
                                            {step.label}
                                        </p>

                                        <p
                                            className={`text-xs mt-1 hidden md:block ${
                                                isActive
                                                    ? "text-zinc-600"
                                                    : "text-zinc-300"
                                            }`}
                                        >
                                            {step.description}
                                        </p>

                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* CONTENU */}
            <main className="max-w-6xl mx-auto py-12 px-6">
                {children}
            </main>
        </div>
    );
}