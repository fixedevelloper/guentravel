'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from 'lucide-react'
import {Passenger} from "../../../../../core/store/useCartStore";

type Props = {
    passengers: Passenger[]
    contactInfo: { email: string; phone: string }
    // 🔥 Correction de la signature pour s'aligner sur l'action Zustand
    updatePassenger: (index: number, fields: Partial<Passenger>) => void
    updateContactInfo: (fields: Partial<{ email: string; phone: string }>) => void
    onNext: () => void
}

export function CheckoutStepPassenger({
                                          passengers,
                                          contactInfo,
                                          updatePassenger,
                                          updateContactInfo,
                                          onNext,
                                      }: Props) {
    return (
        <motion.div
            key="step1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4 text-left"
        >
            {passengers.map((passenger, index) => (
                <Card key={index} className="border-zinc-200 shadow-sm">
                    <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                            <User className="h-4 w-4 text-[#15a4e6]" />
                            Informations Voyageur {index + 1}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Civilité</Label>
                            <select
                                value={passenger.civility}
                                // 🔥 Correction : passe un objet partiel
                                onChange={(e) => updatePassenger(index, { civility: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#15a4e6]"
                            >
                                <option value="MR">MR</option>
                                <option value="MRS">MRS</option>
                                <option value="MS">MS</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Prénoms comme sur le passeport</Label>
                            <Input
                                value={passenger.first_name || ''} // Utilise la clé snake_case du store
                                onChange={(e) => updatePassenger(index, { first_name: e.target.value })}
                                placeholder="Ex: Lorenzo"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Noms</Label>
                            <Input
                                value={passenger.last_name || ''} // Utilise la clé snake_case du store
                                onChange={(e) => updatePassenger(index, { last_name: e.target.value })}
                                placeholder="Ex: Creativ"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Date de naissance</Label>
                            <Input
                                type="date"
                                value={passenger.birth_date || ''} // Utilise la clé snake_case du store
                                onChange={(e) => updatePassenger(index, { birth_date: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Numéro de Passeport</Label>
                            <Input
                                value={passenger.passport_number || ''} // Utilise la clé snake_case du store
                                onChange={(e) => updatePassenger(index, { passport_number: e.target.value })}
                                placeholder="N° de passeport obligatoire"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Date expiration du Passeport</Label>
                            <Input
                                type='date'
                                value={passenger.passport_expiry || ''} // Utilise la clé snake_case du store
                                onChange={(e) => updatePassenger(index, { passport_expiry: e.target.value })}
                                placeholder="N° de passeport obligatoire"
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Card className="border-zinc-200 shadow-sm">
                <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                        Coordonnées de Contact
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Adresse Email</Label>
                        <Input
                            type="email"
                            value={contactInfo.email}
                            onChange={(e) => updateContactInfo({ email: e.target.value })}
                            placeholder="lorenzo@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Téléphone portable</Label>
                        <Input
                            type="tel"
                            value={contactInfo.phone}
                            onChange={(e) => updateContactInfo({ phone: e.target.value })}
                            placeholder="237 6xx xxx xxx"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end pt-2">
                <Button
                    onClick={onNext}
                    className="bg-[#15a4e6] hover:bg-[#167f3c] text-white font-bold px-8 h-12 rounded-xl"
                >
                    Continuer vers les options
                </Button>
            </div>
        </motion.div>
    )
}