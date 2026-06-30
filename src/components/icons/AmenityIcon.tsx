import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Amenity } from "../../types/property";
import React from "react";
export interface AmenityIconProps {
    amenity: Amenity;
    className?: string;
    size?: number;
}

// Déplacé hors du composant pour éviter de le recréer à chaque rendu
const ICON_MAP: Record<string, LucideIcon> = {
    "wifi": LucideIcons.Wifi,
    "air-conditioning": LucideIcons.Wind,
    "pool": LucideIcons.Gem, // "Diamonds" n'existe pas dans Lucide, Gem est plus proche
    "parking": LucideIcons.Car,
    "tv": LucideIcons.Tv,
    "safe": LucideIcons.ShieldCheck,
    "minibar": LucideIcons.Wine,
    "hairdryer": LucideIcons.Fan,
    "shower": LucideIcons.Droplets, // Remplacé "Burp" (non existant)
    "bathtub": LucideIcons.Circle,
    "desk": LucideIcons.Table,
    "balcony": LucideIcons.Square,
    "garden": LucideIcons.TreePine,
    "terrace": LucideIcons.SquareDivide,
    "heating": LucideIcons.ThermometerSun,
    "breakfast": LucideIcons.Coffee,
    "restaurant": LucideIcons.Utensils,
    "bar": LucideIcons.Wine,
    "kitchen": LucideIcons.ChefHat,
    "coffee-maker": LucideIcons.Coffee,
    "refrigerator": LucideIcons.Refrigerator, // Lucide possède désormais Refrigerator
    "double-bed": LucideIcons.Bed,
    "single-bed": LucideIcons.BedDouble,
    "queen-bed": LucideIcons.BedDouble,
    "king-bed": LucideIcons.BedDouble,
};

export function AmenityIcon({ amenity, className = "h-5 w-5", size = 20 }: AmenityIconProps) {
    // Sélectionne l'icône dans la map ou utilise Circle par défaut
    const IconComponent = ICON_MAP[amenity.icon] ?? LucideIcons.Circle;

    return <IconComponent className={className} size={size} />;
}