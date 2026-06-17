"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { eachDayOfInterval, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Save, Lock, AlertCircle } from "lucide-react";

import { api } from "@/core/api/axios-instance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GuenGridCalendar } from "@/components/calendar/GuenGridCalendar";

export default function RoomCalendarPage() {
    const { roomId } = useParams();
    const queryClient = useQueryClient();

    // États locaux
    const [selectedRange, setSelectedRange] = useState<{from: Date, to: Date} | null>(null);
    const [newPrice, setNewPrice] = useState("");
    const [isBlocked, setIsBlocked] = useState(false);

    // Récupération
    const { data: calendarData = [] } = useQuery({
        queryKey: ["room-calendar", roomId],
        queryFn: async () => (await api.get(`/host/rooms/${roomId}/calendar`)).data
    });

    // Transformation pour la Grille
    const formattedData = useMemo(() => calendarData.map((item: any) => ({
        date: item.date.split('T')[0],
        price: parseFloat(item.price_actual),
        inventory: 1 - item.rooms_booked,
        total: 1,
        is_blocked: item.is_blocked,
        has_booking: item.rooms_booked > 0
    })), [calendarData]);

    // Mutation
    const updateMutation = useMutation({
        mutationFn: (data: any) => api.post(`/host/rooms/${roomId}/calendar/bulk-update`, data),
        onSuccess: () => {
            toast.success("Calendrier mis à jour");
            queryClient.invalidateQueries({ queryKey: ["room-calendar"] });
            setSelectedRange(null);
        }
    });



    const handleBulkUpdate = () => {
        if (!selectedRange?.from || !selectedRange?.to) {
            return toast.error("Veuillez sélectionner une période valide");
        }

        // 1. Générer le tableau de dates à partir de la plage sélectionnée
        const dates = eachDayOfInterval({
            start: selectedRange.from,
            end: selectedRange.to
        }).map(date => format(date, 'yyyy-MM-dd'));

        // 2. Vérification de sécurité finale (Double check côté client)
        const hasConflict = dates.some(dateStr => {
            const entry = calendarData.find((d: { date: string }) => d.date === dateStr);
            return entry?.has_booking === true;
        });

        if (hasConflict) {
            return toast.error("La sélection contient des dates déjà réservées.");
        }

        // 3. Exécution de la mutation
        updateMutation.mutate({
            dates,
            price: parseFloat(newPrice || "0"),
            is_blocked: isBlocked
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <header>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion du calendrier</h1>
                    <p className="text-sm text-gray-500">Sélectionnez les dates sur la grille pour modifier les tarifs ou bloquer des périodes.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Grille principale */}
                    <div className="lg:col-span-3">
                        <GuenGridCalendar
                            data={formattedData}
                            onSelectRange={setSelectedRange}
                        />
                    </div>

                    {/* Panneau latéral */}
                    <Card className="h-fit border-0 shadow-sm sticky top-6">
                        <CardHeader><CardTitle className="text-lg">Action rapide</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nouveau prix (€)</Label>
                                <Input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
                            </div>

                            <label className="flex items-center gap-2 text-sm cursor-pointer p-2 hover:bg-gray-50 rounded-md">
                                <input type="checkbox" checked={isBlocked} onChange={(e) => setIsBlocked(e.target.checked)} />
                                <Lock className="h-4 w-4" /> Bloquer ces dates
                            </label>

                            <Button
                                onClick={handleBulkUpdate}
                                className="w-full bg-green-600"
                                disabled={!selectedRange || updateMutation.isPending}
                            >
                                <Save className="mr-2 h-4 w-4" /> Appliquer
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}