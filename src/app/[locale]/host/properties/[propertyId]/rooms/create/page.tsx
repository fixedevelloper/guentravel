"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/core/api/axios-instance";
import { ArrowLeft, CheckCircle2, ImagePlus, X, Bed, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";

// ---------------------------------------------------------------------------
// Validation schemas — one per step, so each "Suivant" click only checks
// the fields that are actually visible/editable on that step.
// ---------------------------------------------------------------------------
const step1Schema = z
    .object({
        name: z.string().trim().min(3, "Le nom doit contenir au moins 3 caractères"),
        description: z.string().trim().min(10, "La description doit contenir au moins 10 caractères"),
        default_price_per_night: z.coerce
            .number()
            .positive("Le prix doit être supérieur à 0"),
        bed_type: z.enum(["double", "king"]),
        bed_quantity: z.coerce.number().int().min(1, "Au moins 1 lit"),
        superficie: z.coerce.number().positive("La superficie doit être supérieure à 0"),
        is_smoking: z.enum(["true", "false"]),
        base_occupancy: z.coerce.number().int().min(1, "Au moins 1 personne"),
        max_occupancy: z.coerce.number().int().min(1, "Au moins 1 personne"),
        max_children: z.coerce.number().int().min(0),
        total_inventory: z.coerce.number().int().min(1, "Au moins 1 chambre disponible"),
    })
    .refine((d) => d.max_occupancy >= d.base_occupancy, {
        message: "L'occupation max. doit être ≥ à l'occupation de base",
        path: ["max_occupancy"],
    });

const step2Schema = z.object({
    amenities: z.array(z.string()).min(1, "Sélectionnez au moins un équipement"),
});

type RoomFormData = {
    name: string;
    description: string;
    bed_type: string;
    bed_quantity: string;
    superficie: string;
    is_smoking: string;
    base_occupancy: string;
    max_occupancy: string;
    max_children: string;
    total_inventory: string;
    default_price_per_night: string;
    amenities: string[];
};

const MAX_IMAGES = 10;
const MAX_SIZE_MB = 5;

export default function CreateRoomPage() {
    const params = useParams();
    const router = useRouter();
    const propertyId = params.propertyId;
    const locale = useLocale() as "fr" | "en" | "es";

    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<RoomFormData>({
        name: "",
        description: "",
        bed_type: "double",
        bed_quantity: "1",
        superficie: "20",
        is_smoking: "false",
        base_occupancy: "2",
        max_occupancy: "2",
        max_children: "1",
        total_inventory: "1",
        default_price_per_night: "",
        amenities: [],
    });

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const { data: amenities = [] } = useQuery({
        queryKey: ["amenities-room"],
        queryFn: async () => (await api.get("/amenities/room")).data.data,
    });

    const mutation = useMutation({
        mutationFn: (data: FormData) =>
            api.post(`/host/properties/${propertyId}/rooms`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            }),
        onSuccess: () => {
            toast.success("Chambre enregistrée avec succès !");
            router.push(`/host/properties/${propertyId}/rooms`);
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Erreur technique."),
    });

    // -------------------------------------------------------------------
    // Field helpers
    // -------------------------------------------------------------------
    const clearError = (field: string) => {
        if (!errors[field]) return;
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        clearError(name);
    };

    const toggleAmenity = (slug: string) => {
        setFormData((prev) => {
            const isSelected = prev.amenities.includes(slug);
            return {
                ...prev,
                amenities: isSelected ? prev.amenities.filter((s) => s !== slug) : [...prev.amenities, slug],
            };
        });
        clearError("amenities");
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        const validFiles: File[] = [];

        files.forEach((f) => {
            if (!f.type.startsWith("image/")) {
                toast.error(`${f.name} n'est pas une image valide.`);
                return;
            }
            if (f.size > MAX_SIZE_MB * 1024 * 1024) {
                toast.error(`${f.name} dépasse ${MAX_SIZE_MB} Mo.`);
                return;
            }
            validFiles.push(f);
        });

        setSelectedImages((prev) => {
            const combined = [...prev, ...validFiles];
            if (combined.length > MAX_IMAGES) toast.warning(`Maximum ${MAX_IMAGES} photos autorisées.`);
            return combined.slice(0, MAX_IMAGES);
        });
        setImagePreviews((prev) => [...prev, ...validFiles.map((f) => URL.createObjectURL(f))].slice(0, MAX_IMAGES));

        clearError("images");
        e.target.value = ""; // allow re-selecting the same file later
    };

    const removeImage = (index: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    // -------------------------------------------------------------------
    // Per-step validation
    // -------------------------------------------------------------------
    const validateStep = (currentStep: number): boolean => {
        if (currentStep === 1) {
            const result = step1Schema.safeParse(formData);
            if (!result.success) {
                const fieldErrors: Record<string, string> = {};
                result.error.issues.forEach((issue) => {
                    fieldErrors[String(issue.path[0])] = issue.message;
                });
                setErrors(fieldErrors);
                toast.error("Veuillez corriger les champs en rouge.");
                return false;
            }
            setErrors({});
            return true;
        }

        if (currentStep === 2) {
            const result = step2Schema.safeParse({ amenities: formData.amenities });
            if (!result.success) {
                setErrors({ amenities: result.error.issues[0].message });
                toast.error(result.error.issues[0].message);
                return false;
            }
            setErrors({});
            return true;
        }

        if (currentStep === 3) {
            if (selectedImages.length === 0) {
                setErrors({ images: "Ajoutez au moins une photo." });
                toast.warning("Ajoutez au moins une photo.");
                return false;
            }
            setErrors({});
            return true;
        }

        return true;
    };

    const goNext = () => {
        if (validateStep(step)) setStep((s) => Math.min(3, s + 1));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        for (let s = 1; s <= 3; s++) {
            if (!validateStep(s)) {
                setStep(s);
                return;
            }
        }

        const data = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
            if (k === "amenities") return;
            data.append(k, v as string);
        });
        formData.amenities.forEach((a) => data.append("amenities[]", a));
        selectedImages.forEach((img) => data.append("images[]", img));

        mutation.mutate(data);
    };

    const fieldClass = (name: string) => `w-full border rounded-md p-2 text-sm ${errors[name] ? "border-red-500" : ""}`;

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <Link
                href={`/host/properties/${propertyId}/rooms`}
                className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6"
            >
                <ArrowLeft className="w-4 h-4" /> Retour aux chambres
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold">Ajouter une chambre</h1>
                <p className="text-zinc-500 text-sm">Étape {step} sur 3</p>
            </div>

            <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                    <React.Fragment key={s}>
                        <div
                            className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-medium ${
                                step === s
                                    ? "bg-[#1d9e4b] text-white"
                                    : step > s
                                    ? "bg-[#1d9e4b]/10 text-[#1d9e4b]"
                                    : "bg-zinc-100 text-zinc-400"
                            }`}
                        >
                            {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                        </div>
                        {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? "bg-[#1d9e4b]" : "bg-zinc-200"}`} />}
                    </React.Fragment>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Input
                                    name="name"
                                    placeholder="Nom de la chambre"
                                    onChange={handleChange}
                                    value={formData.name}
                                    className={errors.name ? "border-red-500" : ""}
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <Input
                                    name="default_price_per_night"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Prix par nuit (€)"
                                    onChange={handleChange}
                                    value={formData.default_price_per_night}
                                    className={errors.default_price_per_night ? "border-red-500" : ""}
                                />
                                {errors.default_price_per_night && (
                                    <p className="text-xs text-red-500 mt-1">{errors.default_price_per_night}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Textarea
                                name="description"
                                placeholder="Description..."
                                onChange={handleChange}
                                value={formData.description}
                                className={errors.description ? "border-red-500" : ""}
                            />
                            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
                                    <Bed className="w-3 h-3" /> Type de lit
                                </label>
                                <select name="bed_type" value={formData.bed_type} onChange={handleChange} className={fieldClass("bed_type")}>
                                    <option value="double">Lit Double</option>
                                    <option value="king">Lit King</option>
                                </select>
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    min="1"
                                    name="bed_quantity"
                                    placeholder="Nb lits"
                                    onChange={handleChange}
                                    value={formData.bed_quantity}
                                    className={errors.bed_quantity ? "border-red-500" : ""}
                                />
                                {errors.bed_quantity && <p className="text-xs text-red-500 mt-1">{errors.bed_quantity}</p>}
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    min="1"
                                    name="superficie"
                                    placeholder="Superficie (m²)"
                                    onChange={handleChange}
                                    value={formData.superficie}
                                    className={errors.superficie ? "border-red-500" : ""}
                                />
                                {errors.superficie && <p className="text-xs text-red-500 mt-1">{errors.superficie}</p>}
                            </div>
                            <div>
                                <select name="is_smoking" value={formData.is_smoking} onChange={handleChange} className={fieldClass("is_smoking")}>
                                    <option value="false">Non-fumeur</option>
                                    <option value="true">Fumeur</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <Input
                                    type="number"
                                    min="1"
                                    name="base_occupancy"
                                    placeholder="Occupation de base"
                                    onChange={handleChange}
                                    value={formData.base_occupancy}
                                    className={errors.base_occupancy ? "border-red-500" : ""}
                                />
                                {errors.base_occupancy && <p className="text-xs text-red-500 mt-1">{errors.base_occupancy}</p>}
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    min="1"
                                    name="max_occupancy"
                                    placeholder="Occupation max"
                                    onChange={handleChange}
                                    value={formData.max_occupancy}
                                    className={errors.max_occupancy ? "border-red-500" : ""}
                                />
                                {errors.max_occupancy && <p className="text-xs text-red-500 mt-1">{errors.max_occupancy}</p>}
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    min="0"
                                    name="max_children"
                                    placeholder="Enfants max"
                                    onChange={handleChange}
                                    value={formData.max_children}
                                    className={errors.max_children ? "border-red-500" : ""}
                                />
                                {errors.max_children && <p className="text-xs text-red-500 mt-1">{errors.max_children}</p>}
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    min="1"
                                    name="total_inventory"
                                    placeholder="Nb chambres"
                                    onChange={handleChange}
                                    value={formData.total_inventory}
                                    className={errors.total_inventory ? "border-red-500" : ""}
                                />
                                {errors.total_inventory && <p className="text-xs text-red-500 mt-1">{errors.total_inventory}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <Settings className="w-4 h-4" /> Sélectionnez les équipements disponibles
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {amenities.map((item: any) => (
                                <button
                                    key={item.slug}
                                    type="button"
                                    onClick={() => toggleAmenity(item.slug)}
                                    className={`p-4 rounded-xl border text-left transition-all ${
                                        formData.amenities.includes(item.slug)
                                            ? "border-[#1d9e4b] bg-[#1d9e4b]/5"
                                            : "border-zinc-200 hover:border-zinc-300"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                formData.amenities.includes(item.slug) ? "bg-[#1d9e4b] text-white" : "bg-zinc-100 text-zinc-500"
                                            }`}
                                        >
                                            {typeof item.icon === "string" ? <span className="text-xs">{item.icon}</span> : item.icon}
                                        </div>
                                        <span className="text-sm font-medium text-zinc-700">{item.name[locale] || item.name.fr}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {errors.amenities && <p className="text-xs text-red-500">{errors.amenities}</p>}
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" id="imgs" />
                        <label
                            htmlFor="imgs"
                            className={`block border-2 border-dashed p-10 text-center cursor-pointer hover:bg-zinc-50 ${
                                errors.images ? "border-red-400" : ""
                            }`}
                        >
                            <ImagePlus className="mx-auto mb-2 text-zinc-400" /> Cliquez pour ajouter les photos
                            <p className="text-xs text-zinc-400 mt-1">
                                {MAX_IMAGES} photos max, {MAX_SIZE_MB} Mo par image
                            </p>
                        </label>
                        {errors.images && <p className="text-xs text-red-500">{errors.images}</p>}
                        <div className="grid grid-cols-4 gap-2">
                            {imagePreviews.map((src, i) => (
                                <div key={i} className="relative group">
                                    <img src={src} className="h-24 w-full object-cover rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(i)}
                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-between pt-6 border-t">
                    <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
                        Retour
                    </Button>
                    {step < 3 ? (
                        <Button type="button" onClick={goNext}>
                            Suivant
                        </Button>
                    ) : (
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}