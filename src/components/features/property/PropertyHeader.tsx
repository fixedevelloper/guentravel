"use client";

import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";

interface PropertyHeaderProps {
    name: string;
    rating?: number;
    city: string;
    countryCode: string;
    address: string;
}

export function PropertyHeader({ name, rating, city, countryCode, address }: PropertyHeaderProps) {
    return (
        <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
        >
            <div className="flex items-start gap-4 mb-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 leading-tight">
                    {name}
                </h1>
                <div className="flex items-center gap-1 bg-[#f39c28] text-white px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 fill-white" />
                    <span className="font-bold">9.{rating || 4}</span>
                    <span className="text-xs ml-1">Excellent</span>
                </div>
            </div>
            <p className="flex items-center gap-2 text-zinc-500 text-lg">
                <MapPin size={20} className="text-[#1d9e4b]" />
                {city}, {countryCode}
                <span className="ml-2 text-sm bg-zinc-100 px-3 py-1 rounded-full">
                    📍 {address}
                </span>
            </p>
        </motion.header>
    );
}