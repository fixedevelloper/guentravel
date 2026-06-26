'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CreditCard, Lock } from 'lucide-react'

const RESERVATION_HOLD_FEE = 5000

type Props = {
    bookingType: 'now' | 'hold'
    setBookingType: (value: 'now' | 'hold') => void
    paymentMethod: 'momo' | 'om' | 'wave' | 'card'
    setPaymentMethod: (value: 'momo' | 'om' | 'wave' | 'card') => void
    momoOperator: 'momo' | 'om'
    setMomoOperator: (value: 'momo' | 'om') => void
    momoPhone: string
    setMomoPhone: (value: string) => void
    finalTotalPrice: number
    onBack: () => void
    onSubmit: () => void
    isCheckoutPending: boolean
}

export function CheckoutStepPayment({
                                        bookingType,
                                        setBookingType,
                                        paymentMethod,
                                        setPaymentMethod,
                                        momoOperator,
                                        setMomoOperator,
                                        momoPhone,
                                        setMomoPhone,
                                        finalTotalPrice,
                                        onBack,
                                        onSubmit,
                                        isCheckoutPending,
                                    }: Props) {
    return (
        <motion.div
            key="step3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
        >
            <Card className="border-zinc-200 shadow-sm">
                <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                        Type de règlement
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                    <RadioGroup
                        defaultValue="now"
                        onValueChange={(val) => setBookingType(val as 'now' | 'hold')}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <label
                            className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                                bookingType === 'now'
                                    ? 'border-[#15a4e6] bg-emerald-50/10 shadow-sm'
                                    : 'border-zinc-200'
                            }`}
                        >
                            <RadioGroupItem value="now" id="paynow" className="mt-1" />
                            <div>
                <span className="font-bold text-sm block text-zinc-900">
                  Payer la totalité maintenant
                </span>
                                <span className="text-xs text-zinc-400 block mt-1">
                  Votre billet électronique est mis et envoyé instantanément par e-mail.
                </span>
                            </div>
                        </label>

                        <label
                            className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                                bookingType === 'hold'
                                    ? 'border-[#15a4e6] bg-amber-50/10 shadow-sm'
                                    : 'border-zinc-200'
                            }`}
                        >
                            <RadioGroupItem value="hold" id="payhold" className="mt-1" />
                            <div>
                <span className="font-bold text-sm block text-amber-600">
                  Bloquer ce tarif
                </span>
                                <span className="text-xs text-zinc-500 block mt-1">
                  Vous payez seulement les frais de réservation de {RESERVATION_HOLD_FEE.toLocaleString()} XAF.
                </span>
                            </div>
                        </label>
                    </RadioGroup>
                </CardContent>
            </Card>

            <Card className="border-zinc-200 shadow-sm">
                <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-[#15a4e6]" />
                        Méthode de Paiement Sécurisée
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    <RadioGroup
                        defaultValue="momo"
                        onValueChange={(val) => setPaymentMethod(val as 'momo' | 'om' | 'wave' | 'card')}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <label
                            className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                                paymentMethod === 'momo'
                                    ? 'border-[#15a4e6] bg-emerald-50/10 shadow-sm'
                                    : 'border-zinc-200'
                            }`}
                        >
                            <RadioGroupItem value="momo" id="momo" />
                            <div>
                <span className="font-bold text-sm block text-zinc-900">
                  Mobile Money MTN / Orange
                </span>
                                <span className="text-xs text-zinc-400 block mt-1">Débit via USSD</span>
                            </div>
                        </label>

                        <label
                            className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                                paymentMethod === 'card'
                                    ? 'border-[#15a4e6] bg-emerald-50/10 shadow-sm'
                                    : 'border-zinc-200'
                            }`}
                        >
                            <RadioGroupItem value="card" id="card" />
                            <div>
                <span className="font-bold text-sm block text-zinc-900">
                  Carte Bancaire Visa Mastercard
                </span>
                                <span className="text-xs text-zinc-400 block mt-1">3D Secure</span>
                            </div>
                        </label>
                    </RadioGroup>

                    {paymentMethod === 'momo' && (
                        <div className="p-4 bg-zinc-50 rounded-xl border space-y-4">
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setMomoOperator('momo')}
                                    className={`px-4 py-2 rounded-lg font-bold text-xs border uppercase transition-all ${
                                        momoOperator === 'momo'
                                            ? 'bg-amber-400 border-amber-500 text-zinc-900'
                                            : 'bg-white text-zinc-500'
                                    }`}
                                >
                                    MTN MoMo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMomoOperator('om')}
                                    className={`px-4 py-2 rounded-lg font-bold text-xs border uppercase transition-all ${
                                        momoOperator === 'om'
                                            ? 'bg-orange-500 border-orange-600 text-white'
                                            : 'bg-white text-zinc-500'
                                    }`}
                                >
                                    Orange Money
                                </button>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                                    <Lock className="h-3.5 w-3.5 text-zinc-400" />
                                    Numéro de téléphone payeur
                                </Label>
                                <Input
                                    value={momoPhone}
                                    onChange={(e) => setMomoPhone(e.target.value)}
                                    placeholder="6xx xxx xxx"
                                    maxLength={9}
                                />
                                <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-1">
                                    Vous validerez le débit sur votre téléphone.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-between items-center pt-4">
                <Button variant="outline" onClick={onBack} disabled={isCheckoutPending} className="h-12 px-6 rounded-xl text-zinc-600">
                    Retour
                </Button>
                <Button
                    onClick={onSubmit}
                    disabled={isCheckoutPending}
                    className="bg-[#15a4e6] hover:bg-[#167f3c] text-white font-bold px-10 h-12 rounded-xl shadow-md flex items-center gap-2"
                >
                    Confirmer et Régler {finalTotalPrice.toLocaleString()} XAF
                </Button>
            </div>
        </motion.div>
    )
}