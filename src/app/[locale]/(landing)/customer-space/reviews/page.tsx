"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
    Star,
    MessageSquare,
    Loader2,
    Calendar,
    Send,
    CheckCircle2,
    AlertCircle,
    History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- TYPAGES ---
interface Review {
    id: string;
    property_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface PendingReview {
    booking_id: string;
    property_name: string;
    check_out: string;
}

interface ReviewsDashboardData {
    published: Review[];
    pending: PendingReview[];
}

// --- DICTIONNAIRE MULTI-LANGUE ---
const translations = {
    fr: {
        title: "Mes Avis & Retours",
        subtitle: "Partagez votre expérience sur vos séjours et consultez vos notes publiées.",
        tabPending: "À rédiger",
        tabPublished: "Mes avis publiés",
        loading: "Chargement de vos avis...",
        noPending: "Félicitations, vous êtes à jour ! Aucun avis en attente.",
        noPublished: "Vous n'avez pas encore publié d'avis.",
        ratingLabel: "Note globale",
        commentLabel: "Votre commentaire",
        commentPlaceholder: "Racontez-nous votre séjour (accueil, propreté, emplacement...)",
        submitBtn: "Publier l'avis",
        submitting: "Publication...",
        successMsg: "Merci ! Votre avis a été publié avec succès.",
        errorMsg: "Impossible de publier l'avis pour le moment.",
        stayedIn: "Séjour terminé le",
        publishedOn: "Publié le"
    },
    en: {
        title: "My Reviews & Feedback",
        subtitle: "Share your experience about your stays and view your published ratings.",
        tabPending: "Pending Reviews",
        tabPublished: "Published Reviews",
        loading: "Loading your reviews...",
        noPending: "Congratulations, you're all caught up! No pending reviews.",
        noPublished: "You haven't published any reviews yet.",
        ratingLabel: "Overall Rating",
        commentLabel: "Your comment",
        commentPlaceholder: "Tell us about your stay (hospitality, cleanliness, location...)",
        submitBtn: "Publish Review",
        submitting: "Publishing...",
        successMsg: "Thank you! Your review has been successfully published.",
        errorMsg: "Could not publish your review at this time.",
        stayedIn: "Stay completed on",
        publishedOn: "Published on"
    }
};

export default function CustomerReviewsPage() {
    const params = useParams();
    const queryClient = useQueryClient();
    const locale = (params?.locale as "fr" | "en") || "fr";
    const t = translations[locale];

    // États pour le mini-formulaire d'insertion d'avis dynamique
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState<string>("");
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);

    // --- RÉCUPÉRATION DES AVIS ---
    const { data: dashboardData, isLoading } = useQuery<ReviewsDashboardData>({
        queryKey: ["customer-reviews-data"],
        queryFn: async () => {
            const response = await api.get("/customer/reviews"); // Endpoint Laravel dédié
            return response.data.data;
        },
    });

    // --- MUTATION POUR SOUMETTRE UN AVIS ---
    const submitReviewMutation = useMutation({
        mutationFn: async (payload: { booking_id: string; rating: number; comment: string }) => {
            return await api.post("/customer/reviews", payload);
        },
        onSuccess: () => {
            toast.success(t.successMsg);
            setSelectedBookingId(null);
            setComment("");
            setRating(5);
            // Re-fetch automatique des listes
            queryClient.invalidateQueries({ queryKey: ["customer-reviews-data"] });
        },
        onError: () => {
            toast.error(t.errorMsg);
        }
    });

    const handlePublish = (bookingId: string) => {
        if (!comment.trim()) return;
        submitReviewMutation.mutate({
            booking_id: bookingId,
            rating,
            comment
        });
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1d9e4b] mx-auto" />
                    <p className="text-sm font-semibold text-zinc-500">{t.loading}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 lg:p-10 max-w-4xl mx-auto space-y-8">

            {/* EN-TÊTE DE PAGE */}
            <div className="space-y-2">
                <h1 className="text-2xl font-black text-zinc-900 md:text-3xl tracking-tight flex items-center gap-2">
                    {t.title}
                </h1>
                <p className="text-sm font-medium text-zinc-500">
                    {t.subtitle}
                </p>
            </div>

            {/* SYSTÈME D'ONGLETS SVELTE */}
            <Tabs defaultValue="pending" className="w-full space-y-6">
                <TabsList className="bg-zinc-100 p-1 rounded-xl h-11 border border-zinc-200/50 max-w-xs grid grid-cols-2">
                    <TabsTrigger value="pending" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        {t.tabPending} ({dashboardData?.pending.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="published" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        {t.tabPublished} ({dashboardData?.published.length || 0})
                    </TabsTrigger>
                </TabsList>

                {/* ONGLET 1 : AVIS À RÉDIGER */}
                <TabsContent value="pending" className="space-y-4 outline-none">
                    {dashboardData?.pending && dashboardData.pending.length > 0 ? (
                        dashboardData.pending.map((item) => (
                            <Card key={item.booking_id} className="rounded-3xl border-zinc-200 shadow-sm bg-white overflow-hidden transition-all">
                                <CardContent className="p-6 md:p-8 space-y-5">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-extrabold text-zinc-900 tracking-tight leading-tight">
                                                {item.property_name}
                                            </h3>
                                            <p className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" /> {t.stayedIn} {item.check_out}
                                            </p>
                                        </div>
                                        {selectedBookingId !== item.booking_id && (
                                            <Button
                                                className="bg-[#1d9e4b] hover:bg-[#167c3a] text-white rounded-xl text-xs font-bold h-9 shadow-sm"
                                                onClick={() => setSelectedBookingId(item.booking_id)}
                                            >
                                                <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Écrire un avis
                                            </Button>
                                        )}
                                    </div>

                                    {/* FORMULAIRE INLINE ACCORDION */}
                                    {selectedBookingId === item.booking_id && (
                                        <div className="pt-4 border-t border-zinc-100 space-y-4 animate-in fade-in-50 duration-200">

                                            {/* Sélection des étoiles interactives */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t.ratingLabel}</label>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            className="transition-transform active:scale-95 focus:outline-none"
                                                            onClick={() => setRating(star)}
                                                            onMouseEnter={() => setHoveredRating(star)}
                                                            onMouseLeave={() => setHoveredRating(null)}
                                                        >
                                                            <Star
                                                                className={`h-6 w-6 ${(hoveredRating ?? rating) >= star ? "text-[#f39c28] fill-[#f39c28]" : "text-zinc-200"}`}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Zone de texte du commentaire */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t.commentLabel}</label>
                                                <textarea
                                                    rows={3}
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    placeholder={t.commentPlaceholder}
                                                    className="block w-full rounded-xl border border-zinc-300 p-3.5 text-sm shadow-sm outline-none focus:border-zinc-800 transition-all resize-none"
                                                />
                                            </div>

                                            {/* Boutons d'action du formulaire */}
                                            <div className="flex items-center justify-end gap-2 pt-1">
                                                <Button
                                                    variant="ghost"
                                                    className="rounded-xl text-xs font-bold h-9 text-zinc-500"
                                                    onClick={() => setSelectedBookingId(null)}
                                                >
                                                    Annuler
                                                </Button>
                                                <Button
                                                    className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold h-9 px-4 gap-1.5 shadow-sm"
                                                    onClick={() => handlePublish(item.booking_id)}
                                                    disabled={submitReviewMutation.isPending || !comment.trim()}
                                                >
                                                    {submitReviewMutation.isPending ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Send className="h-3.5 w-3.5" />
                                                    )}
                                                    {t.submitBtn}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-zinc-200 p-8">
                            <CheckCircle2 className="h-7 w-7 text-[#1d9e4b] mx-auto mb-2" />
                            <p className="text-sm font-medium text-zinc-400">{t.noPending}</p>
                        </div>
                    )}
                </TabsContent>

                {/* ONGLET 2 : HISTORIQUE DES AVIS PUBLIÉS */}
                <TabsContent value="published" className="space-y-4 outline-none">
                    {dashboardData?.published && dashboardData.published.length > 0 ? (
                        dashboardData.published.map((review) => (
                            <Card key={review.id} className="rounded-3xl border-zinc-200 shadow-sm bg-white overflow-hidden">
                                <CardContent className="p-6 md:p-8 space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="text-base font-extrabold text-zinc-900 tracking-tight">
                                            {review.property_name}
                                        </h3>

                                        {/* Affichage des étoiles statiques */}
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-4 w-4 ${review.rating >= star ? "text-[#f39c28] fill-[#f39c28]" : "text-zinc-100"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Contenu textuel de l'avis */}
                                    <p className="text-sm font-medium text-zinc-600 bg-zinc-50 border border-zinc-100 p-4 rounded-xl leading-relaxed italic">
                                        &ldquo;{review.comment}&rdquo;
                                    </p>

                                    <p className="text-[11px] text-zinc-400 font-bold flex items-center gap-1 pt-1">
                                        <History className="h-3.5 w-3.5" /> {t.publishedOn} {review.created_at}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-zinc-200 p-8">
                            <AlertCircle className="h-7 w-7 text-zinc-300 mx-auto mb-2" />
                            <p className="text-sm font-medium text-zinc-400">{t.noPublished}</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

        </div>
    );
}