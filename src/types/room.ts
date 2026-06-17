// src/types/amenity.ts

export interface Amenity {
    id: string;
    slug: string;
    // Les clés dépendent de vos locales (fr, en)
    name: {
        fr: string;
        en: string;
    };
    // Le nom de l'icône, utilisé pour mapper dynamiquement vers Lucide Icons
    icon: string;
    category: 'property' | 'room';
}

export interface Room {
    id: string;
    property_id: string;
    name: {
        fr: string;
        en: string;
    };
    description: {
        fr: string;
        en: string;
    };
    base_occupancy: number;
    max_occupancy: number;
    max_children: number;
    total_inventory: number;
    default_price_per_night: number;
    is_active: boolean;

    // Relations conditionnelles
    amenities?: Amenity[];
    images?: RoomImage[];
}

export interface RoomImage {
    id: number;
    url: string;
    thumbnail: string;
    mime_type: string;
    size: number;
}