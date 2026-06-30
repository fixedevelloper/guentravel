import {useProperties} from "../core/hooks/useProperties";
import {useRoomOffers} from "../core/hooks/useRooms";
import {Button} from "./ui/button";
import React from "react";


export function OffersSection() {
    const { data: offers, isLoading, error } = useRoomOffers();

    if (isLoading) return null; // Ou skeleton

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center gap-3 mb-10">
                    <div className="h-10 w-1.5 bg-[#7bcd4f] rounded-full" />
                    <h2 className="text-3xl font-extrabold">Offres à durée limitée</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {offers?.map((offer:any) => (
                        <div key={offer.id} className="flex border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="w-1/3 bg-zinc-200 flex items-center justify-center">
                                {/* Image ici */}
                            </div>
                            <div className="p-6 flex flex-col justify-between">
                                <div>
                                    <span className="text-[#7bcd4f] font-bold text-xs uppercase tracking-widest">
                                        -20% de réduction
                                    </span>
                                    <h3 className="text-xl font-bold mt-1">{offer.name.fr}</h3>
                                    <p className="text-zinc-500 text-sm mt-2 line-clamp-2">{offer.description.fr}</p>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="font-bold text-[#15a4e6] text-lg">
                                        {offer.commission_rate} FCFA
                                    </span>
                                    <Button size="sm" className="bg-[#7bcd4f] hover:bg-[#d68910]">
                                        Réserver
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}