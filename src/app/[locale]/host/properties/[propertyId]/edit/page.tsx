"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { ArrowLeft, ArrowRight, Building2, MapPin, Clock, ImagePlus, CheckCircle2, X, Sliders, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import { PAYS } from "../../../../../../i18n/countries";
import {useParams} from "next/navigation";

// ─── Configuration ───────────────────────────────────────────────────────────

const DEFAULT_CENTER = { lat: 4.0511, lng: 9.7679 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "320px", borderRadius: "16px" };
const TOTAL_STEPS = 5;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const STEPS = [
    { icon: Building2, label: "Infos" },
    { icon: MapPin,    label: "Lieu" },
    { icon: Clock,     label: "Règles" },
    { icon: Sliders,   label: "Équipements" },
    { icon: ImagePlus, label: "Photos" },
] as const;

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

const INITIAL_FORM: FormDataState = {
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
};

// ─── Schémas de validation par étape ──────────────────────────────────────────
// Seuls les champs marqués d'un astérisque dans le formulaire sont obligatoires,
// pour respecter le comportement déjà en place (région, pays, complément
// d'adresse et politique d'annulation restent optionnels).

const step1Schema = z.object({
    name: z.string().trim().min(3, "Le nom doit contenir au moins 3 caractères"),
    description: z.string().trim().min(10, "La description doit contenir au moins 10 caractères"),
    type: z.enum(["hotel", "resort", "villa", "apartment", "guest_house"]),
});

const step2Schema = z.object({
    city: z.string().trim().min(1, "La ville est requise"),
    address_line_1: z.string().trim().min(1, "L'adresse est requise"),
});

const step3Schema = z.object({
    check_in_after: z.string().regex(TIME_REGEX, "Heure de check-in invalide"),
    check_out_before: z.string().regex(TIME_REGEX, "Heure de check-out invalide"),
});

// ─── Component ───────────────────────────────────────────────────────────────

export default function EditPropertyPage() {
    const router  = useRouter();
    const params  = useParams();
    const id      = params?.propertyId as string | undefined;
    const locale  = (params?.locale as "fr" | "en") ?? "fr";

    const { data: amenities = [] } = useQuery({
        queryKey: ['amenities'],
        queryFn: async () => {
            const res = await api.get('/amenities');
            return res.data.data;
        }
    });

    const { isLoaded: isMapLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    });

    const [step, setStep]               = useState(1);
    const [errors, setErrors]           = useState<Record<string, string>>({});
    const [formData, setFormData]       = useState<FormDataState>(INITIAL_FORM);
    const [newImages, setNewImages]     = useState<File[]>([]);
    const [previews, setPreviews]       = useState<string[]>([]);
    const [serverCover, setServerCover] = useState<string | null>(null);
    const [serverGallery, setServerGallery] = useState<string[]>([]);

    const previewUrlsRef = useRef<string[]>([]);

    const { data: property, isLoading, isError } = useQuery({
        queryKey: ["host-property", id],
        queryFn: async () => {
            const res = await api.get(`/host/properties/${id}`);
            return res.data.data;
        },
        enabled: !!id,
        retry: 1,
        staleTime: 0,
    });

    useEffect(() => {
        if (isError) {
            toast.error("Impossible de récupérer cet établissement.");
            router.push("/host/properties");
        }
    }, [isError, router]);

    // Hydratation du formulaire incluant les équipements
    useEffect(() => {
        if (!property) return;

        const name = property.name?.[locale] ?? property.name?.en ?? property.name?.fr ?? "";
        const desc = property.description?.[locale] ?? property.description?.en ?? property.description?.fr ?? "";

        // Extraction sécurisée des slugs d'équipements existants
        const initialAmenities = Array.isArray(property.amenities)
            ? property.amenities.map((a: any) => typeof a === 'object' ? a.slug : a)
            : [];

        setFormData({
            name,
            description: desc,
            type:             property.type              ?? "hotel",
            country_code:     property.location?.country_code   ?? "CM",
            city:             property.location?.city           ?? "",
            state_province:   property.location?.state_province ?? "",
            address_line_1:   property.location?.address_line_1 ?? "",
            address_line_2:   property.location?.address_line_2 ?? "",
            postal_code:      property.location?.postal_code    ?? "",
            latitude:  Number(property.location?.coordinates?.lat) || DEFAULT_CENTER.lat,
            longitude: Number(property.location?.coordinates?.lng) || DEFAULT_CENTER.lng,
            check_in_after:    property.check_in_after?.substring(0, 5)    ?? "14:00",
            check_out_before:  property.check_out_before?.substring(0, 5)  ?? "12:00",
            cancellation_policy: property.cancellation_policy?.[locale] ?? property.cancellation_policy?.fr ?? "",
            amenities: initialAmenities
        });

        setServerCover(property.media?.cover   ?? null);
        setServerGallery(property.media?.gallery ?? []);
    }, [property, locale]);

    useEffect(() => {
        return () => {
            previewUrlsRef.current.forEach(URL.revokeObjectURL);
        };
    }, []);

    const mutation = useMutation({
        mutationFn: async (payload: globalThis.FormData) => {
            // Note : Laravel requiert souvent POST + _method=PUT pour le multi-part/form-data
            const res = await api.post(`/host/properties/${id}`, payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message ?? "Établissement mis à jour !");
            router.push("/host/properties");
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message ?? "Une erreur est survenue.";
            toast.error(msg);
        },
    });

    const clearError = useCallback((field: string) => {
        setErrors(prev => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        clearError(name);
    }, [clearError]);

    const handleCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const code     = e.target.value;
        const selected = PAYS.find(p => p.alpha2Code === code);
        setFormData(prev => ({
            ...prev,
            country_code: code,
            latitude:  selected?.latlng?.[0] ?? prev.latitude,
            longitude: selected?.latlng?.[1] ?? prev.longitude,
        }));
    }, []);

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        setFormData(prev => ({ ...prev, latitude: e.latLng!.lat(), longitude: e.latLng!.lng() }));
    }, []);

    const handleImageAdd = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files   = Array.from(e.target.files);
        const urls    = files.map(f => URL.createObjectURL(f));
        previewUrlsRef.current.push(...urls);
        setNewImages(prev => [...prev, ...files]);
        setPreviews(prev => [...prev, ...urls]);
        clearError("images");
        e.target.value = "";
    }, [clearError]);

    const handleImageRemove = useCallback((index: number) => {
        URL.revokeObjectURL(previews[index]);
        previewUrlsRef.current = previewUrlsRef.current.filter(u => u !== previews[index]);
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev  => prev.filter((_, i) => i !== index));
    }, [previews]);

    const handleServerCoverRemove  = useCallback(() => setServerCover(null), []);
    const handleServerGalleryRemove = useCallback((url: string) => {
        setServerGallery(prev => prev.filter(u => u !== url));
    }, []);

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

    // -------------------------------------------------------------------
    // Validation par étape via Zod
    // -------------------------------------------------------------------
    const validateStep = useCallback((s: number): boolean => {
        let schema: z.ZodSchema | null = null;

        switch (s) {
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
            case 5: {
                const hasMedia = !!serverCover || serverGallery.length > 0 || newImages.length > 0;
                if (!hasMedia) {
                    setErrors({ images: "Au moins une photo est requise pour enregistrer." });
                    toast.warning("Au moins une photo est requise pour enregistrer.");
                    return false;
                }
                setErrors({});
                return true;
            }
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
    }, [formData, serverCover, serverGallery, newImages]);

    const goToStep = useCallback((target: number) => {
        if (target <= step) { setStep(target); return; }
        // En avançant de plusieurs étapes d'un coup (clic direct sur un onglet
        // plus loin), on valide chaque étape intermédiaire qu'on saute,
        // pas seulement l'étape courante.
        for (let s = step; s < target; s++) {
            if (!validateStep(s)) { setStep(s); return; }
        }
        setStep(target);
    }, [step, validateStep]);

    const handleNext = useCallback(() => {
        if (validateStep(step)) setStep(p => Math.min(p + 1, TOTAL_STEPS));
    }, [step, validateStep]);

    const handleBack = useCallback(() => {
        setStep(p => Math.max(p - 1, 1));
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" && (e.target as HTMLElement).nodeName !== "TEXTAREA") {
            e.preventDefault();
        }
    }, []);

    // Traitement rigoureux des types FormData pour Laravel
    const handleSubmit = useCallback(() => {
        for (let s = 1; s <= TOTAL_STEPS; s++) {
            if (s === 4) continue; // étape équipements optionnelle
            if (!validateStep(s)) { setStep(s); return; }
        }

        const data = new globalThis.FormData();
        data.append("_method", "PUT");

        // Traitement individuel et sécurisé selon les types de champs
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'amenities') {
                (value as string[]).forEach((slug) => {
                    data.append("amenities[]", slug);
                });
            } else if (value !== undefined && value !== null) {
                data.append(key, String(value));
            }
        });

        newImages.forEach(img => data.append("images[]", img));
        data.append("remaining_server_cover",   serverCover ?? "");
        data.append("remaining_server_gallery", JSON.stringify(serverGallery));

        mutation.mutate(data);
    }, [formData, newImages, serverCover, serverGallery, validateStep, mutation]);

    if (isLoading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-zinc-400">
                <Loader2 className="h-7 w-7 animate-spin text-[#15a4e6]" />
                <p className="text-sm font-medium">Chargement de l'établissement…</p>
            </div>
        );
    }

    if (isError) return null;

    const hasImages = !!serverCover || serverGallery.length > 0 || previews.length > 0;
    const errorClass = (field: string) => (errors[field] ? "border-red-500 focus-visible:ring-red-500" : "");

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">

            {/* Header / Stepper Pills */}
            <div className="mb-8 flex items-center justify-between border-b border-zinc-200 pb-5">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Modifier l'établissement</h1>
                    <p className="text-sm text-zinc-400 mt-0.5">Étape {step} sur {TOTAL_STEPS}</p>
                </div>

                <nav className="flex items-center gap-1.5" aria-label="Étapes du formulaire">
                    {STEPS.map(({ icon: Icon, label }, i) => {
                        const s        = i + 1;
                        const active   = step === s;
                        const visited  = step > s;
                        return (
                            <React.Fragment key={s}>
                                {s > 1 && (
                                    <div className={`w-5 h-0.5 transition-colors ${visited || active ? "bg-[#15a4e6]" : "bg-zinc-200"}`} />
                                )}
                                <button
                                    type="button"
                                    onClick={() => goToStep(s)}
                                    aria-label={label}
                                    aria-current={active ? "step" : undefined}
                                    className={`p-2 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15a4e6] ${
                                        active  ? "bg-[#15a4e6] text-white shadow-sm" :
                                            visited ? "bg-emerald-50 text-[#15a4e6]" :
                                                "bg-zinc-100 text-zinc-400"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                </button>
                            </React.Fragment>
                        );
                    })}
                </nav>
            </div>

            {/* Form Container */}
            <div onKeyDown={handleKeyDown} className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">

                {/* Étape 1 : Infos générales */}
                {step === 1 && (
                    <fieldset className="space-y-4 animate-in fade-in duration-200 border-none p-0 m-0">
                        <legend className="text-lg font-bold text-zinc-800 mb-2">Informations générales</legend>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nom de l'établissement <span className="text-red-400">*</span></label>
                            <Input name="name" value={formData.name} onChange={handleChange} placeholder="Ex : Hôtel Le Wouri" className={errorClass("name")} />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Description <span className="text-red-400">*</span></label>
                            <Textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Décrivez l'ambiance, les équipements..." className={errorClass("description")} />
                            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Type de structure</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full h-10 px-3 border border-zinc-200 rounded-xl bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-[#15a4e6] transition">
                                <option value="hotel">Hôtel classique</option>
                                <option value="resort">Complexe touristique (Resort)</option>
                                <option value="villa">Complexe de villas</option>
                                <option value="apartment">Résidence d'appartements</option>
                                <option value="guest_house">Maison d'hôtes (Guest House)</option>
                            </select>
                        </div>
                    </fieldset>
                )}

                {/* Étape 2 : Localisation */}
                {step === 2 && (
                    <fieldset className="space-y-4 animate-in fade-in duration-200 border-none p-0 m-0">
                        <legend className="text-lg font-bold text-zinc-800 mb-2">Localisation</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Pays</label>
                                <select name="country_code" value={formData.country_code} onChange={handleCountryChange} className="w-full h-10 px-3 border border-zinc-200 rounded-xl bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-[#15a4e6] transition">
                                    {PAYS.map(p => (
                                        <option key={p.alpha2Code} value={p.alpha2Code}>{p.translations?.fr ?? p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Région / Province</label>
                                <Input name="state_province" value={formData.state_province} onChange={handleChange} placeholder="Ex : Littoral" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Ville <span className="text-red-400">*</span></label>
                                <Input name="city" value={formData.city} onChange={handleChange} placeholder="Ex : Douala" className={errorClass("city")} />
                                {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Adresse <span className="text-red-400">*</span></label>
                                <Input name="address_line_1" value={formData.address_line_1} onChange={handleChange} placeholder="Numéro et nom de rue" className={errorClass("address_line_1")} />
                                {errors.address_line_1 && <p className="text-xs text-red-500">{errors.address_line_1}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Complément d'adresse <span className="text-zinc-300 font-normal normal-case">(optionnel)</span></label>
                                <Input name="address_line_2" value={formData.address_line_2} onChange={handleChange} placeholder="Bâtiment, étage..." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Code postal <span className="text-zinc-300 font-normal normal-case">(optionnel)</span></label>
                                <Input name="postal_code" value={formData.postal_code} onChange={handleChange} placeholder="Ex : BP 1234" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Position sur la carte</label>
                            <p className="text-xs text-zinc-400">Cliquez pour ajuster précisément l'emplacement.</p>
                            <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                                {isMapLoaded ? (
                                    <GoogleMap
                                        mapContainerStyle={MAP_CONTAINER_STYLE}
                                        center={{ lat: formData.latitude, lng: formData.longitude }}
                                        zoom={13}
                                        onClick={onMapClick}
                                    >
                                        <MarkerF position={{ lat: formData.latitude, lng: formData.longitude }} />
                                    </GoogleMap>
                                ) : (
                                    <div className="h-[320px] bg-zinc-100 flex items-center justify-center gap-2 text-zinc-400 text-sm">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Chargement de la carte…
                                    </div>
                                )}
                            </div>
                        </div>
                    </fieldset>
                )}

                {/* Étape 3 : Règles & Horaires */}
                {step === 3 && (
                    <fieldset className="space-y-4 animate-in fade-in duration-200 border-none p-0 m-0">
                        <legend className="text-lg font-bold text-zinc-800 mb-2">Horaires & Politiques</legend>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Check-in à partir de <span className="text-red-400">*</span></label>
                                <Input type="time" name="check_in_after" value={formData.check_in_after} onChange={handleChange} className={errorClass("check_in_after")} />
                                {errors.check_in_after && <p className="text-xs text-red-500">{errors.check_in_after}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Check-out avant <span className="text-red-400">*</span></label>
                                <Input type="time" name="check_out_before" value={formData.check_out_before} onChange={handleChange} className={errorClass("check_out_before")} />
                                {errors.check_out_before && <p className="text-xs text-red-500">{errors.check_out_before}</p>}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Politique d'annulation</label>
                            <Textarea name="cancellation_policy" value={formData.cancellation_policy} onChange={handleChange} rows={4} placeholder="Ex : Annulation gratuite jusqu'à 48h..." />
                        </div>
                    </fieldset>
                )}

                {/* Étape 4 : Équipements */}
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

                {/* Étape 5 : Médias */}
                {step === 5 && (
                    <fieldset className="space-y-4 animate-in fade-in duration-200 border-none p-0 m-0">
                        <legend className="text-lg font-bold text-zinc-800 mb-2">Photos de l'établissement</legend>
                        <label className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2 text-center hover:border-[#15a4e6] hover:bg-emerald-50/30 transition-all cursor-pointer group ${errors.images ? "border-red-400" : "border-zinc-200"}`}>
                            <ImagePlus className="h-9 w-9 text-zinc-300 group-hover:text-[#15a4e6] transition-colors" />
                            <p className="text-sm font-semibold text-zinc-600 group-hover:text-zinc-800">Ajouter des photos</p>
                            <p className="text-xs text-zinc-400">JPG, PNG, WEBP — plusieurs fichiers acceptés</p>
                            <input type="file" multiple accept="image/*" onChange={handleImageAdd} className="sr-only" />
                        </label>

                        {!hasImages && (
                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
                                <AlertCircle className="h-4 w-4 shrink-0" /> Au moins une photo est requise pour enregistrer.
                            </div>
                        )}

                        {hasImages && (
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                {serverCover && (
                                    <ImageCard src={serverCover} badge="Couverture" badgeColor="bg-[#15a4e6]" onRemove={handleServerCoverRemove} />
                                )}
                                {serverGallery.map((url) => (
                                    <ImageCard key={url} src={url} onRemove={() => handleServerGalleryRemove(url)} />
                                ))}
                                {previews.map((src, i) => (
                                    <ImageCard key={src} src={src} badge={!serverCover && i === 0 ? "Nouvelle couverture" : undefined} badgeColor="bg-zinc-800/80" isDashed onRemove={() => handleImageRemove(i)} />
                                ))}
                            </div>
                        )}
                    </fieldset>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                    <Button type="button" variant="ghost" onClick={handleBack} disabled={step === 1} className="rounded-xl gap-1.5">
                        <ArrowLeft className="h-4 w-4" /> Retour
                    </Button>

                    {step < TOTAL_STEPS ? (
                        <Button type="button" onClick={handleNext} className="bg-[#15a4e6] hover:bg-[#15803c] rounded-xl gap-1.5">
                            Continuer <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button type="button" onClick={handleSubmit} disabled={mutation.isPending} className="bg-[#7bcd4f] hover:bg-[#d6841b] text-white rounded-xl gap-1.5 min-w-[200px]">
                            {mutation.isPending ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…</>
                            ) : (
                                <><CheckCircle2 className="h-4 w-4" /> Enregistrer les modifications</>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Sub-component: ImageCard ─────────────────────────────────────────────────

interface ImageCardProps {
    src: string;
    badge?: string;
    badgeColor?: string;
    isDashed?: boolean;
    onRemove: () => void;
}

function ImageCard({ src, badge, badgeColor = "bg-zinc-800/80", isDashed, onRemove }: ImageCardProps) {
    return (
        <div className={`relative aspect-square rounded-xl overflow-hidden shadow-sm border ${isDashed ? "border-dashed border-emerald-400" : "border-zinc-200"}`}>
            <img src={src} alt="" className="w-full h-full object-cover" />
            {badge && (
                <span className={`absolute bottom-0 inset-x-0 ${badgeColor} text-white text-[10px] py-1 text-center font-bold uppercase tracking-wider`}>
                    {badge}
                </span>
            )}
            <button
                type="button"
                onClick={onRemove}
                aria-label="Supprimer cette photo"
                className="absolute top-1.5 right-1.5 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}