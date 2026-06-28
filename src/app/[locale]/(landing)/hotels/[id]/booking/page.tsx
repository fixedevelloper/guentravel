import { HotelBookingClient } from "./HotelBookingClient";
import React from "react";

interface Props {
    params:       { id: string };
    searchParams: {
        token?:         string;
        product?:       string;
        session?:       string;
        rate_basis_id?: string;
        rooms?:         string; // JSON stringifié
    };
}

export default function HotelBookingPage({ params, searchParams }: Props) {

    return (
        <HotelBookingClient
            rateBasisId={searchParams.rate_basis_id ?? ""}
        />
    );
}