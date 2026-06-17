"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bed, Users, Check, ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";
import { AmenityIcon } from "@/components/icons/AmenityIcon";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
interface RoomCardProps {
    room: any;
    quantity: number; // Quantité sélectionnée pour cette chambre
    isExpanded: boolean;
    onUpdateQuantity: (q: number) => void;
    onToggleExpand: (e: React.MouseEvent) => void;
}

export function PropertyRoomCard({
                                     room,
                                     quantity,
                                     isExpanded,
                                     onUpdateQuantity,
                                     onToggleExpand
                                 }: RoomCardProps) {

    // Empêcher la propagation du clic sur les boutons de quantité pour éviter de toggler l'expand
    const handleQtyChange = (e: React.MouseEvent, val: number) => {
        e.stopPropagation();
        onUpdateQuantity(Math.max(0, val));
    };
    const amenities = room.amenities || [];
    const showModal = amenities.length > 15;
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`border-2 rounded-3xl transition-all ${
                quantity > 0 ? "border-[#1d9e4b] bg-green-50 shadow-md" : "border-zinc-200 bg-white"
            }`}
        >
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h3 className="text-2xl font-extrabold text-zinc-900 mb-2">{room.name.fr}</h3>
                        <p className="text-zinc-500 mb-4">{room.description.fr}</p>
                        {/* Infos chambre */}
                        <div className="flex gap-6 text-sm text-zinc-600">
                            <span className="flex items-center gap-2"><Users className="h-5 w-5 text-[#1d9e4b]" /> {room.max_occupancy} pers.</span>
                            <span className="flex items-center gap-2"><Check className="h-5 w-5 text-[#1d9e4b]" /> {room.total_inventory} dispo.</span>
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-2xl font-extrabold text-[#1d9e4b]">{room.default_price_per_night.toLocaleString()} FCFA</p>

                        {/* Sélecteur de quantité */}
                        <div className="flex items-center gap-3 bg-white border rounded-lg p-1">
                            <button onClick={(e) => handleQtyChange(e, quantity - 1)} className="p-1 hover:bg-zinc-100 rounded"><Minus className="h-4 w-4" /></button>
                            <span className="font-bold w-6 text-center">{quantity}</span>
                            <button onClick={(e) => handleQtyChange(e, quantity + 1)} className="p-1 hover:bg-zinc-100 rounded"><Plus className="h-4 w-4" /></button>
                        </div>
                    </div>
                </div>

                {/* Section services (inchangée) */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="border-t pt-6 mt-6 overflow-hidden">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold">Services dans cette chambre</h4>
                                {showModal && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button className="text-[#1d9e4b] font-semibold text-sm hover:underline">
                                                Voir tout ({amenities.length})
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Tous les services de {room.name.fr}</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                                {amenities.map((amenity: any) => (
                                                    <div key={amenity.id} className="flex items-center gap-3 p-3 border rounded-xl">
                                                        <AmenityIcon amenity={amenity} className="h-5 w-5 text-[#1d9e4b]" />
                                                        <span className="text-sm">{amenity.name.fr}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {amenities.slice(0, 15).map((amenity: any) => (
                                    <div key={amenity.id} className="flex items-center gap-3 p-3 bg-white border rounded-xl">
                                        <AmenityIcon amenity={amenity} className="h-5 w-5 text-[#1d9e4b]" />
                                        <span className="text-sm">{amenity.name.fr}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button onClick={onToggleExpand} className="mt-4 flex items-center gap-2 text-[#1d9e4b] font-semibold hover:underline">
                    {isExpanded ? <><ChevronUp className="h-4 w-4" /> Masquer</> : <><ChevronDown className="h-4 w-4" /> Voir services</>}
                </button>
            </div>
        </motion.div>
    );
}