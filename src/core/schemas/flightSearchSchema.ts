import { z } from "zod";

export const flightSearchSchema = z.object({
    origin: z
        .string()
        .min(3, "Le code IATA doit comporter 3 lettres")
        .max(3, "Le code IATA doit comporter 3 lettres")
        .transform((val) => val.toUpperCase()),
    destination: z
        .string()
        .min(3, "Le code IATA doit comporter 3 lettres")
        .max(3, "Le code IATA doit comporter 3 lettres")
        .transform((val) => val.toUpperCase()),
    departure_date: z.string().refine((date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(date) >= today;
    }, { message: "La date ne peut pas être dans le passé" }),
    adults: z.coerce.number().min(1, "Au moins 1 passager adulte requis"),
});

export type FlightSearchFormValues = z.infer<typeof flightSearchSchema>;