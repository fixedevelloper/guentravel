"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/routing";
import { api } from "@/core/api/axios-instance";
import {
    ArrowLeft,
    Save,
    Loader2,
    Bed,
    ImagePlus,
    X,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// Ajusté par rapport à la structure réelle Spatie Media Library de ton API
interface ServerImage {
    id: number;
    original_url: string;
}

export default function EditRoomPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const currentLocale = useLocale();

    const { propertyId, roomId } = params;

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        base_occupancy: "2",
        max_occupancy: "2",
        max_children: "0",
        total_inventory: "1",
        default_price_per_night: "",
        is_active: true,
    });

    // Gestion des images
    const [existingImages, setExistingImages] = useState<ServerImage[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

    // 1. Récupération des données actuelles de la chambre
    const { data: roomDetails, isLoading } = useQuery({
        queryKey: ["room-details", roomId],
        queryFn: async () => {
            const response = await api.get(`/host/rooms/${roomId}`);
            return response.data?.data;
        },
    });

    useEffect(() => {
        if (roomDetails) {
            setFormData({
                name: roomDetails.name[currentLocale] || roomDetails.name["en"] || roomDetails.name["fr"] || "",
                description: roomDetails.description[currentLocale] || roomDetails.description["en"] || roomDetails.description["fr"] || "",
                base_occupancy: roomDetails.base_occupancy.toString(),
                max_occupancy: roomDetails.max_occupancy.toString(),
                max_children: roomDetails.max_children.toString(),
                total_inventory: roomDetails.total_inventory.toString(),
                default_price_per_night: roomDetails.default_price_per_night,
                is_active: !!roomDetails.is_active,
            });

            // Mapping direct sur la clé 'media' renvoyée par Spatie Media Library
            if (roomDetails.media) {
                setExistingImages(roomDetails.media);
            }
        }
    }, [roomDetails, currentLocale]);

    // 2. Mutation de mise à jour avec support FormData
    const updateRoomMutation = useMutation({
        mutationFn: async (payload: FormData) => {
            // Astuce pour contourner les limitations de PHP avec le verbe PUT et FormData
            payload.append("_method", "PUT");
            const response = await api.post(`/host/rooms/${roomId}`, payload, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Chambre modifiée !");
            queryClient.invalidateQueries({ queryKey: ["property-rooms", propertyId] });
            router.push(`/host/properties/${propertyId}/rooms`);
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Erreur lors de la modification.";
            toast.error(msg);
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Gestion des nouvelles images chargées
    const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewImages(prev => [...prev, ...files]);
            setNewImagePreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
        }
    };

    // Supprimer une image existante sur le serveur
    const removeExistingImage = (id: number) => {
        setExistingImages(prev => prev.filter(img => img.id !== id));
        setDeletedImageIds(prev => [...prev, id]);
    };

    // Supprimer une image locale en cours d'ajout
    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (step === 1) {
            setStep(2);
            return;
        }

        if (existingImages.length === 0 && newImages.length === 0) {
            toast.warning("La chambre doit posséder au moins une photo.");
            return;
        }

        const data = new FormData();

        // Données textuelles et numériques
        Object.entries(formData).forEach(([key, value]) => data.append(key, value.toString()));

        // Injection des nouveaux fichiers binaires
        newImages.forEach(img => data.append("images[]", img));

        // Transmission des identifiants des médias Spatie à supprimer
        deletedImageIds.forEach(id => data.append("deleted_images[]", id.toString()));

        updateRoomMutation.mutate(data);
    };

    if (isLoading) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-zinc-500">
                <Loader2 className="h-6 w-6 animate-spin text-[#15a4e6]" />
                <span className="text-xs font-medium">Récupération des paramètres...</span>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
            {/* EN-TÊTE */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={`/host/properties/${propertyId}/rooms`}>
                        <Button variant="ghost" size="icon" className="rounded-xl border border-zinc-200 h-9 w-9">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-black text-zinc-900 tracking-tight">Modifier la chambre</h1>
                        <p className="text-xs text-zinc-500">Edition en langue : <span className="uppercase font-bold text-[#15a4e6]">{currentLocale}</span></p>
                    </div>
                </div>
            </div>

            {/* PROGRESSION / ACCÈS DIRECT AUX ÉTAPES */}
            <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-1 rounded-xl border border-zinc-200/60">
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${step === 1 ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}
                >
                    <Bed className="h-3.5 w-3.5" />
                    <span>1. Caractéristiques</span>
                </button>
                <button
                    type="button"
                    onClick={() => setStep(2)}
                    className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${step === 2 ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}
                >
                    <ImagePlus className="h-3.5 w-3.5" />
                    <span>2. Photos</span>
                </button>
            </div>

            {/* FORMULAIRE UNIQUE MULTI-ÉTAPES */}
            <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">

                {/* ÉTAPE 1 : CONFIGURATION TECHNIQUE & PRIX */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in-50 duration-200">
                        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                            <div>
                                <span className="text-xs font-bold text-zinc-700 block">Statut de visibilité</span>
                                <span className="text-[11px] text-zinc-400">Rendre ce type de chambre ouvert aux clients.</span>
                            </div>
                            <Switch
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nom de la chambre ({currentLocale})</label>
                            <Input name="name" value={formData.name} onChange={handleChange} required />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Description des aménagements ({currentLocale})</label>
                            <Textarea name="description" value={formData.description} onChange={handleChange} rows={4} required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Capacité de base</label>
                                <Input type="number" name="base_occupancy" value={formData.base_occupancy} onChange={handleChange} min="1" required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Capacité maximale</label>
                                <Input type="number" name="max_occupancy" value={formData.max_occupancy} onChange={handleChange} min="1" required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Enfants max</label>
                                <Input type="number" name="max_children" value={formData.max_children} onChange={handleChange} min="0" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nombre de chambres (Inventaire)</label>
                                <Input type="number" name="total_inventory" value={formData.total_inventory} onChange={handleChange} min="1" required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Prix par nuit par défaut (€)</label>
                                <Input type="number" name="default_price_per_night" value={formData.default_price_per_night} onChange={handleChange} min="0" required />
                            </div>
                        </div>
                    </div>
                )}

                {/* ÉTAPE 2 : GESTION HYBRIDE DES PHOTOS */}
                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in-50 duration-200">
                        <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-8 text-center hover:border-[#15a4e6] transition-all relative bg-zinc-50/50">
                            <input type="file" multiple accept="image/*" onChange={handleNewImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                            <ImagePlus className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-zinc-700">Ajouter de nouvelles photos</p>
                        </div>

                        {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                            <div className="space-y-2 mt-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Galerie active de la chambre</h4>
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">

                                    {/* Modification ici pour utiliser img.original_url */}
                                    {existingImages.map((img) => (
                                        <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 shadow-sm group">
                                            <img src={img.original_url} alt="Server" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full hover:bg-red-500 transition-colors">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Nouvelles images locales en attente d'upload */}
                                    {newImagePreviews.map((src, i) => (
                                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-dashed border-emerald-300 shadow-sm animate-in zoom-in-95">
                                            <img src={src} alt="New preview" className="w-full h-full object-cover opacity-80" />
                                            <span className="absolute bottom-1 left-1 bg-emerald-500 text-[8px] text-white font-bold px-1 py-0.5 rounded">Nouveau</span>
                                            <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full hover:bg-red-500 transition-colors">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* CONTROLES DE BAS DE PAGE */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStep(1)}
                        disabled={step === 1}
                        className="rounded-xl text-xs font-bold"
                    >
                        Retour
                    </Button>

                    {step === 1 ? (
                        <Button type="submit" className="bg-[#15a4e6] hover:bg-[#15803c] rounded-xl text-xs font-bold gap-1">
                            Suivant : Galerie <ChevronRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            disabled={updateRoomMutation.isPending}
                            className="bg-[#7bcd4f] hover:bg-[#d6841b] text-white rounded-xl text-xs font-bold gap-1.5"
                        >
                            {updateRoomMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Sauvegarder les modifications
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}