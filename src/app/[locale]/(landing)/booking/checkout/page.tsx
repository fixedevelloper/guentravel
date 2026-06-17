'use client'

import React, { useState, useMemo } from "react";
import { BookingSidebar } from "../../../../../components/features/booking/BookingSidebar";
import { BookingContent } from "../../../../../components/features/booking/BookingContent";
import { BookingLayout } from "../../../../../components/features/booking/BookingLayout";
import { useBookingStore } from "../../../../../core/store/useBookingStore";
import { api } from "../../../../../core/api/axios-instance";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@/i18n/routing";
import { EmptyBooking } from "../../../../../components/features/booking/EmptyBooking";
import { BookingLoader } from "../../../../../components/features/booking/BookingLoader";

export default function BookingCheckoutPage() {
    const { selectedRooms, checkIn, checkOut, guests } = useBookingStore();
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState(1);
    const [authMode, setAuthMode] = useState<"login" | "register">("login");
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [authData, setAuthData] = useState({
        fullName: "",
        email: "",
        password: "",
    });
    // Éviter le crash si aucune chambre n'est sélectionnée
    const hasSelection = selectedRooms.length > 0;

    // Récupération de l'établissement via les données de la première chambre du store
    // (Puisque toutes les chambres sélectionnées appartiennent au même établissement)
    const { data: property, isLoading } = useQuery({
        queryKey: ["checkout-property", selectedRooms[0]?.id],
        queryFn: async () => {
            // Étape optionnelle si votre API a besoin de l'ID de la propriété :
            // Si vos IDs de chambres suffisent, vous pouvez ajuster l'endpoint.
            // Ici, on récupère les détails pour valider l'existence de la structure en DB.
            const roomRes = await api.get(`/rooms/${selectedRooms[0].id}`);
            const propertyId = roomRes.data.data.property_id;
            const propertyRes = await api.get(`/properties/${propertyId}`);
            return propertyRes.data.data;
        },
        enabled: hasSelection,
    });

    // Fonction de soumission finale vers Laravel
    const handleConfirmBooking = async () => {
        setIsProcessing(true);
        try {
            const payload = {
                check_in: checkIn ? checkIn.slice(0, 10) : null,
                check_out: checkOut ? checkOut.slice(0, 10) : null,
                adults: guests.adults,
                children: guests.children,
                payment_method: paymentMethod,
                auth: authData,
                auth_mode: authMode,
                // On formate le tableau des chambres pour votre FormRequest Laravel
                rooms: selectedRooms.map(room => ({
                    room_id: parseInt(room.id),
                    quantity: room.quantity
                }))
            };

            const response = await api.post("/bookings", payload);
            if (response.data.success) {
                router.push("/booking/confirmation");
            }
        } catch (error) {
            console.error("Erreur lors de la réservation", error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!hasSelection) {
        return <EmptyBooking />;
    }

    if (isLoading) {
        return <BookingLoader />;
    }

    return (
        <BookingLayout
            selectedRooms={selectedRooms}
            property={property}
            guests={guests}
            checkIn={checkIn}
            checkOut={checkOut}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <BookingContent
                    selectedRooms={selectedRooms}
                    guests={guests}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    authMode={authMode}
                    setAuthMode={setAuthMode}
                    authData={authData}
                    setAuthData={setAuthData}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    onConfirm={handleConfirmBooking}
                    isProcessing={isProcessing}
                />

                <BookingSidebar
                    selectedRooms={selectedRooms}
                    //property={property}
                    guests={guests}
                    checkIn={checkIn}
                    checkOut={checkOut}
                />
            </div>
        </BookingLayout>
    );
}