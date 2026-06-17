"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    MapPin,
    Star,
    Loader2,
    ArrowRight,
    Home,
    Sparkles,
    Compass,
    Sparkles as SparklesIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// --- TYPAGES ---
interface FavoriteProperty {
    id: string;
    slug: string;
    title: string;
    location: string;
    price_per_night: number;
    rating: number;
    review_count: number;
    cover_image_url: string;
}

// --- DICTIONNAIRE MULTI-LANGUE ---
const translations = {
    fr: {
        title: "Mes Favoris",
        subtitle: "Retrouvez rapidement les hébergements que vous avez mis de côté.",
        loading: "Chargement de vos favoris...",
        noFavorites: "Votre liste de favoris est encore vide.",
        exploreBtn: "Explorer les logements",
        night: "nuit",
        removedSuccess: "Logement retiré de vos favoris.",
        errorAction: "Une erreur est survenue.",
        viewDetails: "Voir les détails"
    },
    en: {
        title: "My Favorites",
        subtitle: "Quickly find the properties you have saved for later.",
        loading: "Loading your favorites...",
        noFavorites: "Your favorites list is currently empty.",
        exploreBtn: "Explore properties",
        night: "night",
        removedSuccess: "Property removed from your favorites.",
        errorAction: "An error occurred.",
        viewDetails: "View details"
    }
};

export default function CustomerFavoritesPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const locale = (params?.locale as "fr" | "en") || "fr";
    const t = translations[locale];

    const { data: favorites = [], isLoading } = useQuery<FavoriteProperty[]>({
        queryKey: ["customer-favorites-list"],
        queryFn: async () => {
            const response = await api.get("/customer/favorites");
            return response.data.data;
        },
    });

    const toggleFavoriteMutation = useMutation({
        mutationFn: async (propertyId: string) => {
            return await api.post(`/properties/${propertyId}/favorite`);
        },
        onSuccess: () => {
            toast.success(t.removedSuccess);
            queryClient.invalidateQueries({ queryKey: ["customer-favorites-list"] });
        },
        onError: () => {
            toast.error(t.errorAction);
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                >
                    <div className="w-16 h-16 border-4 border-[#1d9e4b] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-zinc-600">{t.loading}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
            <main className="max-w-6xl mx-auto py-8 px-6 space-y-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-[#f39c28]/10 p-3 rounded-xl">
                            <Heart className="h-6 w-6 text-[#f39c28]" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">
                                {t.title}
                            </h1>
                            <p className="text-zinc-500 font-medium mt-1">
                                {t.subtitle}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Favorites Grid */}
                <AnimatePresence mode="wait">
                    {favorites.length > 0 ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {favorites.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="rounded-3xl border-zinc-100 shadow-xl hover:shadow-2xl transition-all overflow-hidden bg-white group h-full">
                                        {/* Image */}
                                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                                            <img
                                                src={item.cover_image_url || "/images/placeholder-property.jpg"}
                                                alt={item.title}
                                                className="object-cover h-full w-full group-hover:scale-110 transition-transform duration-500"
                                            />
                                            {/* Favorite button */}
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => toggleFavoriteMutation.mutate(item.id)}
                                                disabled={toggleFavoriteMutation.isPending}
                                                className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg text-red-500 hover:bg-white hover:text-red-600 transition-all focus:outline-none"
                                            >
                                                <Heart className="h-5 w-5 fill-current" />
                                            </motion.button>
                                            {/* Rating badge */}
                                            {item.rating > 0 && (
                                                <div className="absolute top-4 left-4 flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-lg">
                                                    <Star className="h-4 w-4 text-[#f39c28] fill-[#f39c28]" />
                                                    <span className="font-bold text-sm text-zinc-900">{item.rating}</span>
                                                    <span className="text-xs text-zinc-500 font-medium">({item.review_count})</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                                                    <MapPin className="h-4 w-4 text-[#1d9e4b]" />
                                                    <span>{item.location}</span>
                                                </div>
                                                <h3 className="text-lg font-extrabold text-zinc-900 tracking-tight leading-snug group-hover:text-[#1d9e4b] transition-colors">
                                                    {item.title}
                                                </h3>
                                            </div>

                                            {/* Price & Action */}
                                            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-2xl font-extrabold text-[#1d9e4b]">
                                                        {item.price_per_night.toLocaleString()} FCFA
                                                    </p>
                                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide mt-0.5">
                                                        / {t.night}
                                                    </p>
                                                </div>

                                                <Button
                                                    onClick={() => router.push(`/${locale}/properties/${item.slug}`)}
                                                    variant="ghost"
                                                    className="rounded-xl font-bold text-sm h-10 text-zinc-700 hover:bg-zinc-50 group/btn gap-2 shadow-sm hover:shadow-md transition-all"
                                                >
                                                    <span>{t.viewDetails}</span>
                                                    <ArrowRight className="h-4 w-4 text-zinc-400 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center py-24 bg-white rounded-3xl border border-dashed border-zinc-200"
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-[#f39c28]/10 w-20 h-20 rounded-full flex items-center justify-center mb-6"
                            >
                                <Heart className="h-10 w-10 text-[#f39c28]" />
                            </motion.div>
                            <div className="space-y-3">
                                <p className="text-sm font-bold text-zinc-900">{t.noFavorites}</p>
                                <p className="text-xs text-zinc-400">Découvrez nos hébergements et ajoute vos favoris!</p>
                            </div>
                            <Button
                                onClick={() => router.push(`/${locale}/search`)}
                                className="bg-[#1d9e4b] hover:bg-[#167c3a] text-white rounded-xl text-sm font-bold h-11 px-6 shadow-lg shadow-[#1d9e4b]/30 mt-6"
                            >
                                <Compass className="h-4 w-4 mr-2" /> {t.exploreBtn}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}