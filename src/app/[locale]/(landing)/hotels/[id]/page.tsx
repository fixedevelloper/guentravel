import { HotelDetailsClient } from "./HotelDetailsClient";
import React from "react";

interface Props {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ token?: string; product?: string; session?: string }>;
}

export default async function HotelDetailsPage(props: Props) {
    // Résolution des promises pour Next.js 15+
    const params = await props.params;
    const searchParams = await props.searchParams;

    return (
        <HotelDetailsClient
            hotelId={params.id}
            tokenId={searchParams.token ?? ""}
            productId={searchParams.product ?? ""}
            sessionId={searchParams.session ?? ""}
        />
    );
}