"use client";
import React from "react";
export default function GlobalError({
                                        error,
                                        reset,
                                    }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
        <body>
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h2>Quelque chose s'est mal passé</h2>
            <button onClick={() => reset()}>Réessayer</button>
        </div>
        </body>
        </html>
    );
}