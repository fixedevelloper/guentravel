// types/hotel.ts

export interface OccupancyRoom {
    room_no:   number;
    adult:     number;
    child:     number;
    child_age: number[]; // Correspond bien au tableau d'entiers [0, 17]
}

export interface HotelSearchParams {
    checkin:      string; // Format YYYY-MM-DD
    checkout:     string; // Format YYYY-MM-DD
    latitude:     number;
    longitude:    number;
    nationality:  string; // Code ISO 2 lettres (ex: "FR")
    currency:     string; // Code ISO 3 lettres (ex: "EUR")
    city_name?:    string; // Optionnel : Passer en optionnel (?) car marqué 'sometimes' sur Laravel
    country_name?: string; // Optionnel : Idem
    radius?:       number; // Optionnel : Idem
    max_result?:   number; // Optionnel : Idem
    hotel_codes?:  string[]; // Optionnel : Idem
    occupancy:    OccupancyRoom[];
}

export interface HotelSearchStatus {
    session_id:    string | null;
    more_results:  boolean;
    next_token:    string | null;
    total_results: number;
}

export interface TripAdvisor {
    rating:  string | null;
    reviews: string | null;
}

export interface Hotel {
    hotel_id:      string;
    twx_hotel_id:  string;
    product_id:    string;
    token_id:      string;
    name:          string;
    rating:        number; // ex: 4 pour 4 étoiles
    property_type: string;
    fare_type:     string;
    total:         number; // Prix total du séjour
    currency:      string;
    city:          string;
    locality:      string;
    country:       string;
    address:       string;
    postal_code:   string | null;
    phone:         string | null;
    email:         string | null;
    latitude:      number;
    longitude:     number;
    distance:      { value: number; unit: string };
    thumbnail:     string | null;
    facilities:    string[];
    trip_advisor:  TripAdvisor;
}

export interface HotelSearchResponse {
    status: HotelSearchStatus;
    hotels: Hotel[];
}

export interface City {
    id:           number; // L'identifiant unique (api_id ou id BDD) utilisé pour la clé d'autocomplétion
    city_name:    string;
    country_name: string;
    latitude:     number;
    longitude:    number;
}

export interface CitiesResponse {
    success: boolean; // Ajouté pour correspondre à la réponse de votre contrôleur Laravel ['success' => true]
    cities: City[];
}
// types/hotel.ts

export interface CancellationRule {
    rules: string[];
}


export interface RoomRate {
    product_id:          string;
    token_id:            string;
    room_type:           string;
    description:         string;
    room_code:           string;
    fare_type:           string;
    rate_basis_id:       string;
    currency:            string;
    net_price:           number;
    board_type:          string;
    max_occupancy:       number;
    inventory_type:      string;
    cancellation_policy: string[];
    room_images:         string[];
    facilities:          string[];
}

export interface RoomRatesResponse {
    success:    boolean;
    session_id: string;
    hotel_id:   string;
    token_id:   string;
    room_rates: RoomRate[];
}

export interface RoomRatesParams {
    session_id: string;
    product_id: string;
    token_id:   string;
    hotel_id:   string;
}
// types/hotel.ts

export interface HotelImage {
    caption: string | null;
    url:     string;
}

export interface HotelDetails {
    hotel_id:    string;
    name:        string;
    address:     string;
    city:        string;
    postal_code: string | null;
    latitude:    number;
    longitude:   number;
    rating:      number;
    description: string | null;
    facilities:  string[];
    images:      HotelImage[];
}

export interface HotelDetailsParams {
    session_id: string;
    hotel_id:   string;
    product_id: string;
    token_id:   string;
}
// types/hotel.ts

export interface PaxInfo {
    title:      string;
    first_name: string;
    last_name:  string;
}

export interface BookingRoom {
    room_no:  number;
    adults:   PaxInfo[];
    children?: PaxInfo[];
}

export interface HotelBookParams {
    days:number;
    check_in:string;
    check_out:string;
    currency:string;
    net_price:number;
    payment_method:string;
    fare_type:string;
    hotel_id:string;
    booking_id?: string;
    session_id:     string;
    product_id:     string;
    token_id:       string;
    rate_basis_id:  string;
    client_ref:     string;
    customer_email: string;
    customer_phone: string;
    booking_note?:  string;
    rooms:          BookingRoom[];
}

export interface BookedRoom {
    name:        string;
    description: string;
    board_type:  string;
    guests:      string[];
}

export interface HotelBooking {
    booking_id: string;
    session_id: string;
    status:                    string;
    supplier_confirmation_num: string;
    reference_num:             number;
    client_ref_num:            string;
    product_id:                string;
    hotel_id:                  string;
    check_in:                  string;
    check_out:                 string;
    days:                      number;
    currency:                  string;
    net_price:                 number;
    fare_type:                 string;
    cancellation_policy:       string[];
    customer_email:            string;
    customer_phone:            string;
    rooms:                     BookedRoom[];
}