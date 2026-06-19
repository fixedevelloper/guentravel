"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { ArrowLeft, ArrowRight, Building2, MapPin, Clock, ImagePlus, CheckCircle2, X, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import { PAYS } from "../../../../../i18n/countries";

const DEFAULT_CENTER = { lat: 4.0511, lng: 9.7679 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "320px", borderRadius: "16px" };
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

interface FormDataState {
    name: string;
    description: string;
    type: string;
    country_code: string;
    city: string;
    state_province: string;
    address_line_1: string;
    address_line_2: string;
    postal_code: string;
    latitude: number;
    longitude: number;
    check_in_after: string;
    check_out_before: string;
    cancellation_policy: string;
    amenities: string[];
}

// ---------------------------------------------------------------------------
// Schémas de validation — un par étape, pour ne contrôler que les champs
// réellement visibles/édités à l'étape en cours.
// ---------------------------------------------------------------------------
const step1Schema = z.object({
    name: z.string().trim().min(3, "Le nom de l'établissement doit contenir au moins 3 caractères"),
    description: z.string().trim().min(10, "La description doit contenir au moins 10 caractères"),
    type: z.enum(["hotel", "resort", "villa", "apartment", "guest_house"]),
});

const step2Schema = z.object({
    country_code: z
        .string()
        .refine((val) => PAYS.some((p) => p.alpha2Code === val), "Sélectionnez un pays valide"),
    state_province: z.string().trim().min(1, "La région ou province est requise"),
    city: z.string().trim().min(1, "La ville est requise"),
    address_line_1: z.string().trim().min(1, "L'adresse (Ligne 1) est requise"),
    address_line_2: z.string().optional(),
    postal_code: z.string().optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
});

const step3Schema = z.object({
    check_in_after: z.string().regex(TIME_REGEX, "Heure de check-in invalide"),
    check_out_before: z.string().regex(TIME_REGEX, "Heure de check-out invalide"),
    cancellation_policy: z.string().optional(),
});

export default function CreatePropertyPage() {
    const t = useTranslations("host.properties.create");
    const locale = useLocale() as "fr" | "en";
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { data: amenities = [] } = useQuery({
        queryKey: ['amenities'],
        queryFn: async () => {
            const res = await api.get('/amenities');
            return res.data.data;
        }
    });

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
    });

    const [formData, setFormData] = useState<FormDataState>({
        name: "",
        description: "",
        type: "hotel",
        country_code: "CM",
        city: "",
        state_province: "",
        address_line_1: "",
        address_line_2: "",
        postal_code: "",
        latitude: DEFAULT_CENTER.lat,
        longitude: DEFAULT_CENTER.lng,
        check_in_after: "14:00",
        check_out_before: "12:00",
        cancellation_policy: "",
        amenities: []
    });

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const createPropertyMutation = useMutation({
        mutationFn: async (payload: FormData) => {
            const response = await api.post("/host/properties", payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Établissement créé avec succès !");
            router.push("/host/properties");
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Erreur lors de la sauvegarde.";
            toast.error(msg);
        }
    });

    const clearError = (field: string) => {
        if (!errors[field]) return;
        setErrors(prev => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const toggleAmenity = (slug: string) => {
        setFormData(prev => {
            const isSelected = prev.amenities.includes(slug);
            return {
                ...prev,
                amenities: isSelected
                    ? prev.amenities.filter(s => s !== slug)
                    : [...prev.amenities, slug]
            };
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        clearError(name);
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const selected = PAYS.find(p => p.alpha2Code === code);
        setFormData(prev => ({
            ...prev,
            country_code: code,
            latitude: selected?.latlng ? selected.latlng[0] : prev.latitude,
            longitude: selected?.latlng ? selected.latlng[1] : prev.longitude
        }));
        clearError("country_code");
    };

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            setFormData(prev => ({ ...prev, latitude: e.latLng!.lat(), longitude: e.latLng!.lng() }));
        }
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedImages(prev => [...prev, ...files]);
            setImagePreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
            clearError("images");
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // -------------------------------------------------------------------
    // Validation par étape via Zod
    // -------------------------------------------------------------------
    const validateCurrentStep = (currentStep: number = step): boolean => {
        let schema: z.ZodSchema | null = null;

        switch (currentStep) {
            case 1:
                schema = step1Schema;
                break;
            case 2:
                schema = step2Schema;
                break;
            case 3:
                schema = step3Schema;
                break;
            case 4:
                // Étape équipements : optionnelle, aucune validation requise.
                setErrors({});
                return true;
            case 5:
                if (selectedImages.length === 0) {
                    setErrors({ images: "Ajoutez au moins une photo pour votre établissement." });
                    toast.warning("Ajoutez au moins une photo pour votre établissement.");
                    return false;
                }
                setErrors({});
                return true;
            default:
                return true;
        }

        const result = schema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach(issue => {
                fieldErrors[String(issue.path[0])] = issue.message;
            });
            setErrors(fieldErrors);
            toast.error(result.error.issues[0].message);
            return false;
        }

        setErrors({});
        return true;
    };

    const handleNextStep = () => {
        if (validateCurrentStep()) {
            setStep(p => Math.min(p + 1, 5));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        for (let s = 1; s <= 5; s++) {
            if (!validateCurrentStep(s)) {
                setStep(s);
                return;
            }
        }

        const data = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'amenities') {
                (value as string[]).forEach((slug) => {
                    data.append("amenities[]", slug);
                });
            } else if (value !== undefined && value !== null) {
                data.append(key, value.toString());
            }
        });

        selectedImages.forEach(img => data.append("images[]", img));

        createPropertyMutation.mutate(data);
    };

    const errorClass = (field: string) => (errors[field] ? "border-red-500 focus-visible:ring-red-500" : "");

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            {/* Multi-step Header bar */}
            <div className="mb-8 flex items-center justify-between border-b border-zinc-200 pb-5">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Créer un établissement</h1>
                    <p className="text-sm text-zinc-500">Étape {step} sur 5</p>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => step > 1 && setStep(1)} className={`p-2 rounded-xl transition-all ${step === 1 ? "bg-[#15a4e6] text-white" : "bg-zinc-100 text-zinc-400"}`}><Building2 className="h-4 w-4" /></button>
                    <div className={`w-4 h-0.5 ${step >= 2 ? "bg-[#15a4e6]" : "bg-zinc-200"}`} />

                    <button type="button" onClick={() => step > 2 && setStep(2)} className={`p-2 rounded-xl transition-all ${step === 2 ? "bg-[#15a4e6] text-white" : "bg-zinc-100 text-zinc-400"}`}><MapPin className="h-4 w-4" /></button>
                    <div className={`w-4 h-0.5 ${step >= 3 ? "bg-[#15a4e6]" : "bg-zinc-200"}`} />

                    <button type="button" onClick={() => step > 3 && setStep(3)} className={`p-2 rounded-xl transition-all ${step === 3 ? "bg-[#15a4e6] text-white" : "bg-zinc-100 text-zinc-400"}`}><Clock className="h-4 w-4" /></button>
                    <div className={`w-4 h-0.5 ${step >= 4 ? "bg-[#15a4e6]" : "bg-zinc-200"}`} />

                    <button type="button" onClick={() => step > 4 && setStep(4)} className={`p-2 rounded-xl transition-all ${step === 4 ? "bg-[#15a4e6] text-white" : "bg-zinc-100 text-zinc-400"}`}><Sliders className="h-4 w-4" /></button>
                    <div className={`w-4 h-0.5 ${step === 5 ? "bg-[#15a4e6]" : "bg-zinc-200"}`} />

                    <button type="button" onClick={() => step > 5 && setStep(5)} className={`p-2 rounded-xl transition-all ${step === 5 ? "bg-[#15a4e6] text-white" : "bg-zinc-100 text-zinc-400"}`}><ImagePlus className="h-4 w-4" /></button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">

                {/* ÉTAPE 1 : PROFIL DE L'ÉTABLISSEMENT */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        <h3 className="text-lg font-bold text-zinc-800">Informations Générales</h3>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nom de l'établissement</label>
                            <Input name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Grand Hôtel Star" className={errorClass("name")} />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Description</label>
                            <Textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Décrivez votre établissement en quelques mots..." className={errorClass("description")} />
                            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Type de structure hôtelière</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full h-10 px-3 border border-zinc-200 rounded-xl bg-white text-sm outline-none font-medium">
                                <option value="hotel">Hôtel Classique</option>
                                <option value="resort">Complexe Touristique (Resort)</option>
                                <option value="villa">Complexes de Villas</option>
                                <option value="apartment">Résidence d'Appartements</option>
                                <option value="guest_house">Maison d'Hôtes (Guest House)</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* ÉTAPE 2 : ADRESSE & LOCALISATION MAPS */}
                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        <h3 className="text-lg font-bold text-zinc-800">Localisation précise</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Pays</label>
                                <select name="country_code" value={formData.country_code} onChange={handleCountryChange} className="w-full h-10 px-3 border border-zinc-200 rounded-xl bg-white text-sm outline-none font-medium">
                                    {PAYS.map(p => (
                                        <option key={p.alpha2Code} value={p.alpha2Code}>{p.translations?.fr || p.name}</option>
                                    ))}
                                </select>
                                {errors.country_code && <p className="text-xs text-red-500">{errors.country_code}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Région / Province</label>
                                <Input name="state_province" value={formData.state_province} onChange={handleChange} placeholder="Ex: Littoral" className={errorClass("state_province")} />
                                {errors.state_province && <p className="text-xs text-red-500">{errors.state_province}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Ville</label>
                                <Input name="city" value={formData.city} onChange={handleChange} placeholder="Ex: Douala" className={errorClass("city")} />
                                {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Adresse Ligne 1</label>
                                <Input name="address_line_1" value={formData.address_line_1} onChange={handleChange} placeholder="Rue, Quartier, Face à..." className={errorClass("address_line_1")} />
                                {errors.address_line_1 && <p className="text-xs text-red-500">{errors.address_line_1}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Adresse Ligne 2 (Optionnel)</label>
                                <Input name="address_line_2" value={formData.address_line_2} onChange={handleChange} placeholder="Étage, Numéro de porte..." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Code Postal (Optionnel)</label>
                                <Input name="postal_code" value={formData.postal_code} onChange={handleChange} placeholder="Ex: BP 1234" />
                            </div>
                        </div>

                        <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                            {isLoaded ? (
                                <GoogleMap mapContainerStyle={MAP_CONTAINER_STYLE} center={{ lat: formData.latitude, lng: formData.longitude }} zoom={13} onClick={onMapClick}>
                                    <MarkerF position={{ lat: formData.latitude, lng: formData.longitude }} />
                                </GoogleMap>
                            ) : <div className="h-[320px] bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm">Chargement de la carte...</div>}
                        </div>
                    </div>
                )}

                {/* ÉTAPE 3 : RÈGLEMENTATIONS HÔTELIÈRES */}
                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        <h3 className="text-lg font-bold text-zinc-800">Horaires & Politiques</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Check-in (Après)</label>
                                <Input type="time" name="check_in_after" value={formData.check_in_after} onChange={handleChange} className={errorClass("check_in_after")} />
                                {errors.check_in_after && <p className="text-xs text-red-500">{errors.check_in_after}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Check-out (Avant)</label>
                                <Input type="time" name="check_out_before" value={formData.check_out_before} onChange={handleChange} className={errorClass("check_out_before")} />
                                {errors.check_out_before && <p className="text-xs text-red-500">{errors.check_out_before}</p>}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Politique d'annulation</label>
                            <Textarea name="cancellation_policy" value={formData.cancellation_policy} onChange={handleChange} placeholder="Ex: Annulation gratuite jusqu'à 24h avant l'arrivée..." rows={3} />
                        </div>
                    </div>
                )}

                {/* ÉTAPE 4 : ÉQUIPEMENTS */}
                {step === 4 && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                        <h3 className="text-lg font-bold text-zinc-800">Équipements & Services</h3>
                        <p className="text-sm text-zinc-500">Sélectionnez les équipements disponibles dans votre établissement.</p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {amenities.map((item: any) => (
                                <button
                                    key={item.slug}
                                    type="button"
                                    onClick={() => toggleAmenity(item.slug)}
                                    className={`p-4 rounded-xl border text-left transition-all ${
                                        formData.amenities?.includes(item.slug)
                                            ? "border-[#15a4e6] bg-[#15a4e6]/5"
                                            : "border-zinc-200 hover:border-zinc-300"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.amenities?.includes(item.slug) ? "bg-[#15a4e6] text-white" : "bg-zinc-100 text-zinc-500"}`}>
                                            {typeof item.icon === 'string' ? <span className="text-xs">{item.icon}</span> : item.icon}
                                        </div>
                                        <span className="text-sm font-medium text-zinc-700">
                                            {item.name[locale] || item.name.fr}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ÉTAPE 5 : MÉDIAS (COVER & GALLERY) */}
                {step === 5 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        <h3 className="text-lg font-bold text-zinc-800">Photos officielles</h3>
                        <div className={`border-2 border-dashed rounded-xl p-8 text-center hover:border-[#15a4e6] transition-all relative bg-zinc-50/50 ${errors.images ? "border-red-400" : "border-zinc-200"}`}>
                            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                            <ImagePlus className="h-10 w-10 text-zinc-400 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-zinc-700">Glissez les photos ici</p>
                            <span className="text-xs text-zinc-400 block mt-1">La première image servira de couverture principale.</span>
                        </div>
                        {errors.images && <p className="text-xs text-red-500">{errors.images}</p>}

                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                                {imagePreviews.map((src, i) => (
                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 group shadow-sm">
                                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                        {i === 0 && <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[10px] py-1 text-center font-bold uppercase tracking-wider">Couverture</span>}
                                        <button type="button" onClick={() => removeImage(i)} className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-full hover:bg-red-500 transition-colors">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* CONTRÔLES DU STEPPER */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                    <Button type="button" variant="ghost" onClick={() => setStep(p => Math.max(p - 1, 1))} disabled={step === 1} className="rounded-xl">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
                    </Button>

                    {step < 5 ? (
                        <Button type="button" onClick={handleNextStep} className="bg-[#15a4e6] hover:bg-[#15803c] rounded-xl">
                            Continuer <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button type="submit" disabled={createPropertyMutation.isPending} className="bg-[#7bcd4f] hover:bg-[#d6841b] text-white rounded-xl">
                            {createPropertyMutation.isPending ? <span className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Enregistrer l'établissement
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}