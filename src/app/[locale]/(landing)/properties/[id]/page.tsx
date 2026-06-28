"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { useBookingStore } from "../../../../../core/store/useBookingStore";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PropertyBreadcrumbs } from "../../../../../components/features/property/PropertyBreadcrumbs";
import { PropertyGallery } from "../../../../../components/features/property/PropertyGallery";
import { PropertyHeader } from "../../../../../components/features/property/PropertyHeader";
import { PropertyAmenitiesList } from "../../../../../components/features/property/PropertyAmenitiesList";
import { PropertyRoomCard } from "../../../../../components/features/property/PropertyRoomCard";
import { PropertyContactInfo } from "../../../../../components/features/property/PropertyContactInfo";
import { PropertyBookingWidget } from "../../../../../components/features/property/PropertyBookingWidget";

export default function PropertyDetailsPage() {
    const { id } = useParams() as { id: string };
    const { selectedRooms, checkIn, checkOut, setBooking, guests } = useBookingStore();
    const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);
    const router = useRouter();

    const { data: p, isLoading } = useQuery({
        queryKey: ["property", id],
        queryFn: async () => (await api.get(`/properties/${id}`)).data.data
    });

    // Calcul du nombre de nuits
    const nights = useMemo(() => {
        if (!checkIn || !checkOut) return 1;
        const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
        return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }, [checkIn, checkOut]);

    // Hydratation des données pour le Widget (nom, prix, qt)
    const widgetRooms = useMemo(() => {
        if (!p?.rooms) return [];
        return selectedRooms.map((sel) => {
            const roomData = p.rooms.find((r: any) => String(r.id) === String(sel.id));

            // On extrait le nom peu importe si c'est un objet de trad ou un string direct
            const extractedName = roomData?.name && typeof roomData.name === "object"
                ? roomData.name.fr
                : roomData?.name;

            // On prend la première clé de prix disponible
            const extractedPrice = roomData?.price ?? roomData?.default_price_per_night ?? 0;

            return {
                id: sel.id,
                name: extractedName || `Chambre #${sel.id}`,
                price: Number(extractedPrice),
                quantity: sel.quantity
            };
        });
    }, [selectedRooms, p?.rooms]);

    // Gestion du changement de quantité de chambres
    const handleQuantityChange = (room: any, quantity: number) => {
        let newRooms = [...selectedRooms];
        const index = newRooms.findIndex((r) => r.id === room.id.toString());

        if (quantity <= 0) {
            newRooms = newRooms.filter((r) => r.id !== room.id.toString());
        } else if (index > -1) {
            // Si la chambre existe déjà, on met à jour uniquement sa quantité
            newRooms[index] = {
                ...newRooms[index],
                quantity: quantity
            };
        } else {
            // ICI : On ajoute le nom et le prix lors du premier ajout !
            newRooms.push({
                id: room.id.toString(),
                name: room.name?.fr || room.name || "Chambre",
                // Ajuste la clé du prix selon ton API (price ou default_price_per_night)
                price: room.price ?? room.default_price_per_night ?? 0,
                quantity
            });
        }

        setBooking({ selectedRooms: newRooms });
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-zinc-500 font-medium">Chargement de votre établissement...</div>;
    if (!p) return <div className="min-h-screen flex items-center justify-center text-zinc-500 font-medium">Établissement introuvable</div>;

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Fil d'Ariane & En-tête principal */}
                <PropertyBreadcrumbs city={p.location.city} propertyName={p.name.fr} />
                <PropertyHeader name={p.name.fr} rating={p.rating} city={p.location.city} countryCode={p.location.country_code} address={p.location.address} />

                {/* Galerie Médias */}
                <PropertyGallery cover={p.media.cover} images={p.media.gallery} altText={p.name.fr} />

                {/* Grille principale : Détails (Gauche) + Widget de réservation fixe (Droite) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">

                    {/* COLONNE GAUCHE : Contenu informatif */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Section Description */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-extrabold text-zinc-900">À propos de cet établissement</h2>
                            <div className="text-zinc-600 leading-relaxed text-base">
                                {/* On suppose que p.description est un objet { fr: "..." } */}
                                <p>{p.description?.fr || "Aucune description disponible pour cet établissement."}</p>
                            </div>
                        </section>
                        {/* Section Description & Équipements */}
                        <section className="border-b border-zinc-100 pb-10">
                            <PropertyAmenitiesList amenities={p.amenities} />
                        </section>

                        {/* Section Configuration des Chambres */}
                        <section className="border-b border-zinc-100 pb-10">
                            <h2 className="text-2xl font-extrabold mb-2 text-zinc-900">Chambres disponibles</h2>
                            <p className="text-sm text-zinc-500 mb-8">Sélectionnez vos hébergements et ajustez les quantités selon vos besoins.</p>
                            <div className="space-y-6">
                                {p.rooms?.map((room: any) => (
                                    <PropertyRoomCard
                                        key={room.id}
                                        room={room}
                                        quantity={selectedRooms.find(r => r.id === room.id.toString())?.quantity || 0}
                                        onUpdateQuantity={(q: number) => handleQuantityChange(room, q)}
                                        isExpanded={expandedRoomId === room.id.toString()}
                                        onToggleExpand={() => setExpandedRoomId(expandedRoomId === room.id.toString() ? null : room.id.toString())}
                                    />
                                ))}
                            </div>
                        </section>
                        {/* Section : Politiques, Accessibilité & Avis */}
                        <section className="space-y-12">

                            {/* 1. Politiques & Frais */}
                            <div className="border-b border-zinc-100 pb-10">
                                <h2 className="text-2xl font-extrabold mb-6 text-zinc-900">Frais & Politiques</h2>
                                <div className="prose prose-zinc max-w-none text-zinc-600 text-sm">
                                    <p className="font-semibold mb-2">Politiques d'annulation</p>
                                    <p className="mb-6">{p.cancellation_policy.fr || "Non spécifié"}</p>
                                    <p className="font-semibold mb-2">Frais additionnels</p>
                                    <p>{p.fees?.cleaning_fee ? `Frais de ménage : ${p.fees.cleaning_fee}€` : "Aucun frais de ménage"}</p>
                                </div>
                            </div>

                            {/* 2. Accessibilité */}
                            <div className="border-b border-zinc-100 pb-10">
                                <h2 className="text-2xl font-extrabold mb-6 text-zinc-900">Accessibilité</h2>
                                <div className="flex flex-wrap gap-3">
                                    {p.accessibility?.length > 0 ? p.accessibility.map((acc: any, i: number) => (
                                        <span key={i} className="px-4 py-2 bg-zinc-100 rounded-full text-sm font-medium text-zinc-800">
                    {typeof acc === "object" ? acc.name.fr : acc}
                </span>
                                    )) : <p className="text-zinc-500 text-sm">Aucune information spécifique sur l'accessibilité.</p>}
                                </div>
                            </div>

                            {/* 3. Avis (Reviews) */}
                            <div className="pb-10">
                                <h2 className="text-2xl font-extrabold mb-6 text-zinc-900 flex items-center gap-3">
                                    Avis des clients
                                    <span className="text-lg bg-zinc-900 text-white px-3 py-1 rounded-md">{p.rating}</span>
                                </h2>
                                <div className="space-y-8">
                                    {p.reviews?.length > 0 ? p.reviews.map((review: any) => (
                                        <div key={review.id} className="border-l-2 border-zinc-200 pl-6">
                                            <p className="font-bold text-zinc-900">{review.user_name}</p>
                                            <p className="text-sm text-zinc-500 mb-2">{new Date(review.created_at).toLocaleDateString()}</p>
                                            <p className="text-zinc-700 italic">"{review.comment}"</p>
                                        </div>
                                    )) : <p className="text-zinc-500">Aucun avis pour le moment.</p>}
                                </div>
                            </div>

                        </section>
                        {/* Section Contact & Localisation */}
                        <section className="pt-2">
                            <h2 className="text-2xl font-extrabold mb-6 text-zinc-900">Contact & Support</h2>
                            <PropertyContactInfo
                                phone={p.phone}
                                website={p.website}
                             city={p.city}/>
                        </section>
                    </div>

                    {/* COLONNE DROITE : Widget de Réservation Réactif */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28">
                            <PropertyBookingWidget
                                selectedRooms={widgetRooms}
                                date={{ from: checkIn ? new Date(checkIn) : undefined, to: checkOut ? new Date(checkOut) : undefined }}
                                setDate={(range) => setBooking({ checkIn: range?.from?.toISOString(), checkOut: range?.to?.toISOString() })}

                                // On transforme l'objet unique "guests" en un tableau à un seul élément
                                roomsConfig={[{
                                    adults: guests?.adults ?? 2,
                                    children: guests?.children ?? 0,
                                    child_ages: []
                                }]}
                                // Lors de la mise à jour, on extrait le premier élément pour le réenregistrer en objet dans le store
                                setRoomsConfig={(newRooms) => setBooking({
                                    guests: {
                                        adults: newRooms[0].adults,
                                        children: newRooms[0].children
                                    }
                                })}

                                checkIn={checkIn}
                                checkOut={checkOut}
                                nights={nights}
                                onSubmit={() => {
                                    router.push('/booking/checkout')
                                }}
                            />
                        </div>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}