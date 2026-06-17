/**
 * Interface représentant une Propriété/Établissement.
 * Doit correspondre à la structure JSON renvoyée par votre PropertyResource.
 */
import {Room} from "./room";

export interface Amenity {
    id: number;
    slug: string;
    name: {
        fr: string;
        en: string;
    };
    icon: string;
    category: 'property' | 'room';
}

export interface Property {
    id: string;
    uuid:string;
    type: string;
    name: {
        fr: string;
        en: string;
    };
    description: {
        fr: string;
        en: string;
    };
    location: {
        address_line_1: string;
        city: string;
        country_code: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    };
    pricing: {
        commission_rate: number;
    };
    price_range: {
        min: number;
        max: number;
    };
    media: {
        cover: string | null;
        gallery: string[];
    };
    rooms?: Room[];
    rooms_count?: number;
    created_at: string;
}

/**
 * Interface pour les paramètres de recherche venant de l'URL
 */
export interface PropertySearchParams {
    city?: string | null;
    guests?: number | null;
    rooms?: number | null;
    check_in?: string | null;
    check_out?: string | null;
    page?: number;
}
// Exemple avec Property
export type PropertyPaginatedResponse = PaginatedResponse<Property>;

// Exemple avec Room (si vous en créez une plus tard)
export type RoomPaginatedResponse = PaginatedResponse<Amenity>;
/**
 * Interface de réponse paginée (Laravel API)
 */
/**
 * Interface générique pour gérer les réponses paginées de Laravel.
 * T représente le type de l'objet contenu dans les données (ex: Property, Room).
 */
export interface PaginatedResponse<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}