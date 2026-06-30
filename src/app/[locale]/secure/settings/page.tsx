"use client";

import React, { useEffect, useState } from "react";
import { Settings, Save, Percent, CreditCard, Mail, ShieldAlert, Loader2, CheckCircle2, Globe } from "lucide-react";
import { api } from "../../../../core/api/axios-instance";

interface SystemSettings {
    site_name: string;
    contact_email: string;
    default_commission_rate: string | number;
    service_fee_flights: string | number;
    currency_default: string;
    maintenance_mode: boolean;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<SystemSettings>({
        site_name: "",
        contact_email: "",
        default_commission_rate: 0,
        service_fee_flights: 0,
        currency_default: "EUR",
        maintenance_mode: false,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get("/admin/settings");
                if (res.data) setSettings(res.data);
            } catch (err) {
                console.error("Erreur de récupération des paramètres", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setSettings((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setStatusMessage(null);
        try {
            const res = await api.put("/admin/settings", settings);
            setStatusMessage({ type: "success", text: res.data?.message ?? "Configurations enregistrées." });
        } catch (err) {
            console.error("Erreur d'enregistrement", err);
            setStatusMessage({ type: "error", text: "Impossible de mettre à jour les paramètres système." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#15a4e6]" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Paramètres du Système</h1>
                <p className="text-sm text-zinc-500">Ajustez les règles d'affaires globales, frais de service et configurations de Guen's Travel.</p>
            </div>

            {statusMessage && (
                <div className={`p-4 rounded-lg flex items-center gap-2 text-sm font-medium ${
                    statusMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
                }`}>
                    {statusMessage.type === "success" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    <span>{statusMessage.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Section 1 : Configuration Générale */}
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-zinc-400" /> Profil de l'application
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Nom du Site</label>
                            <input
                                type="text"
                                name="site_name"
                                value={settings.site_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Email de Contact Client</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                <input
                                    type="email"
                                    name="contact_email"
                                    value={settings.contact_email}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2 : Configuration Financière */}
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-zinc-400" /> Règles Financières & Commissions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Taux Comm. Hôtels par défaut</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    name="default_commission_rate"
                                    value={settings.default_commission_rate}
                                    onChange={handleChange}
                                    className="w-full pr-8 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400 transition-colors"
                                />
                                <Percent className="absolute right-3 top-3 h-3.5 w-3.5 text-zinc-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Frais de Service fixes (Vols)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    name="service_fee_flights"
                                    value={settings.service_fee_flights}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400 transition-colors"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-zinc-400 font-bold">{settings.currency_default}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Devise Principale</label>
                            <select
                                name="currency_default"
                                value={settings.currency_default}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400 transition-colors cursor-pointer"
                            >
                                <option value="EUR">Euro (€)</option>
                                <option value="USD">Dollar ($)</option>
                                <option value="XAF">Franc CFA (FCFA)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 3 : Maintenance de la Plateforme */}
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-zinc-400" /> Statut du Système
                    </h2>
                    <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                        <div className="space-y-0.5">
                            <div className="text-sm font-semibold text-zinc-800">Mode Maintenance</div>
                            <div className="text-xs text-zinc-400 max-w-md">Si activé, l'accès public sera suspendu et affichera une page d'attente pour vos voyageurs. L'espace admin reste accessible.</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="maintenance_mode"
                                checked={settings.maintenance_mode}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                    </div>
                </div>

                {/* Actions de validation */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#15a4e6] hover:bg-[#1393cf] text-white rounded-xl text-sm font-medium shadow-sm disabled:opacity-50 transition-colors"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Enregistrer les modifications
                    </button>
                </div>
            </form>
        </div>
    );
}