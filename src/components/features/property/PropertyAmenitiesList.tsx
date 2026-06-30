"use client";

import { motion } from "framer-motion";
import { AmenityIcon } from "@/components/icons/AmenityIcon";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Amenity} from "../../../types/property";
import React from "react";



interface PropertyAmenitiesListProps {
    amenities: Amenity[];
}

export function PropertyAmenitiesList({ amenities = [] }: PropertyAmenitiesListProps) {
    const propertyAmenities = amenities.filter(a => a.category === 'property');

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <h2 className="text-3xl font-extrabold mb-6 text-zinc-900">Services de l'établissement</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {propertyAmenities.slice(0, 6).map((amenity, index) => (
                    <div key={amenity.id || index} className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl">
                        <AmenityIcon amenity={amenity} className="h-6 w-6 text-[#15a4e6]" />
                        <span className="text-zinc-700 font-medium">{amenity.name.fr}</span>
                    </div>
                ))}
            </div>

            {propertyAmenities.length > 6 && (
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="mt-4 text-[#15a4e6] font-semibold hover:underline">
                            Voir tous les services ({propertyAmenities.length})
                        </button>
                    </DialogTrigger>
                    {/* Passage à max-w-6xl et max-h-[90vh] pour plus d'espace */}
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="text-2xl font-bold">Tous les services</DialogTitle>
                        </DialogHeader>

                        {/* Grille responsive : 1 colonne mobile, 2 tablettes, 3 desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {propertyAmenities.map((amenity) => (
                                <div key={amenity.id} className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100 hover:bg-zinc-100 transition-colors">
                                    <AmenityIcon amenity={amenity} className="h-6 w-6 text-[#15a4e6]" />
                                    <span className="text-zinc-700 font-medium">{amenity.name.fr}</span>
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </motion.section>
    );
}