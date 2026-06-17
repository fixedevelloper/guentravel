"use client";

import { motion } from "framer-motion";

interface PropertyGalleryProps {
    cover: string;
    images: string[];
    altText: string;
}

export function PropertyGallery({ cover, images = [], altText }: PropertyGalleryProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-3xl overflow-hidden mb-10"
        >
            <div className="md:col-span-2 md:row-span-2 h-96 md:h-[500px] bg-zinc-100 rounded-2xl overflow-hidden relative group">
                {cover && (
                    <img
                        src={cover}
                        alt={altText}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                )}
                <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-full font-semibold text-sm">
                    📸 Vue principale
                </div>
            </div>
            {images.slice(0, 3).map((img:any, idx:number) => (
                <div key={idx} className="h-48 md:h-[242px] bg-zinc-100 rounded-2xl overflow-hidden relative group">
                    <img
                        src={img}
                        alt={`${altText} - vue ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
            ))}
            {images.length > 3 && (
                <button className="h-48 md:h-[242px] bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-bold hover:bg-zinc-800 transition-colors">
                    <span>+ {images.length - 3} photos</span>
                </button>
            )}
        </motion.div>
    );
}