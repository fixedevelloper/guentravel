"use client";

import { motion } from "framer-motion";
import { ChevronDown, Heart, Share2 } from "lucide-react";
import { useState } from "react";

interface PropertyBreadcrumbsProps {
    city: string;
    propertyName: string;
}

export function PropertyBreadcrumbs({ city, propertyName }: PropertyBreadcrumbsProps) {
    const [isLiked, setIsLiked] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
            aria-label="Breadcrumb"
        >
            <nav className="flex items-center gap-2 text-sm text-zinc-500">
                <span>Hébergements</span>
                <ChevronDown className="h-4 w-4 rotate-[-90deg] text-zinc-400" />
                <span className="font-semibold text-zinc-900">{city}</span>
                <ChevronDown className="h-4 w-4 rotate-[-90deg] text-zinc-400" />
                <span className="font-semibold text-zinc-900 truncate max-w-[200px]">
                    {propertyName}
                </span>
            </nav>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                    aria-label={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                    <Heart
                        className={`h-5 w-5 transition-colors ${
                            isLiked ? "fill-[#1d9e4b] text-[#1d9e4b]" : "text-zinc-600"
                        }`}
                    />
                </button>
                <button
                    className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                    aria-label="Partager l'établissement"
                >
                    <Share2 className="h-5 w-5 text-zinc-600" />
                </button>
            </div>
        </motion.div>
    );
}