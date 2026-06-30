// types/admin.ts
export interface DashboardKpi {
    value:   number;
    change?: number;
    hotels?: number;
    flights?: number;
}

export interface DashboardKpis {
    total_bookings:   DashboardKpi;
    total_revenue:    DashboardKpi;
    pending_bookings: DashboardKpi;
    total_users:      DashboardKpi;
}

export interface RevenueChartPoint {
    date:    string;
    hotels:  number;
    flights: number;
    revenue: number;
}

export interface RecentBookingItem {
    id:          number;
    type:        "hotel" | "flight";
    contact:     string;
    amount:      number;
    currency:    string;
    status:      string;
    created_at:  string;
    pnr?:        string;
}

export interface BookingByType {
    type:  "hotels" | "flights";
    count: number;
}

export interface TopProperty {
    hotel_id:        string;
    name:            string;
    bookings_count:  number;
    revenue:         number;
}

export interface StatusBreakdown {
    status: string;
    count:  number;
}

export interface DashboardData {
    kpis:             DashboardKpis;
    revenue_chart:    RevenueChartPoint[];
    bookings_by_type: BookingByType[];
    recent_bookings:  RecentBookingItem[];
    top_properties:   TopProperty[];
    status_breakdown: StatusBreakdown[];
}