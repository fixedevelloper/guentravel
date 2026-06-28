'use client';

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Header } from "../../../../../components/layout/Header";
import { Footer } from "../../../../../components/layout/Footer";
import { useHotelBookingStatusPolling } from "../../../../../core/hooks/useHotelBookingStatusPolling";

function WaitingPaymentContent() {
    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();

    // Récupère l'ID peu importe si le dossier Next.js s'appelle [id] ou [booking_id]
    const bookingId = (params?.id as string) || (params?.booking_id as string) || searchParams.get("booking_id") || searchParams.get("id");

    // Appel du hook de polling
    const { data: booking, isError } = useHotelBookingStatusPolling(bookingId);

    // Extraction et mise en correspondance stricte avec les réponses de HotelController
    // Valeur par défaut "PENDING_PAYMENT" en majuscules
    const currentStatus = booking?.booking_status || "PENDING_PAYMENT";
    const reference = booking?.pnr || "En cours";
    const errorMessage = booking?.message || "La transaction a été refusée, annulée ou a expiré.";

    // Sécurité si l'ID est introuvable au montage du composant ou si l'API renvoie un 404
    if (!bookingId || isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 text-zinc-900">
                <p className="text-red-500 font-semibold">Identifiant de réservation d'hôtel invalide ou introuvable.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 text-zinc-900 selection:bg-emerald-600/20">

            {/* ÉTAPE 1 : ATTENTE DE LA SAISIE DU CODE PIN */}
            {(currentStatus === "PENDING_PAYMENT" || currentStatus === "WAITING_PIN") && (
                <div className="max-w-md animate-fade-in">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-emerald-600 mb-6 mx-auto"></div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">En attente de votre validation PIN...</h2>
                    <p className="text-zinc-600 mt-3 text-sm leading-relaxed">
                        Un message de confirmation de débit (Push USSD) a été envoyé sur le téléphone renseigné.
                        Veuillez composer votre code secret sur votre mobile pour valider le règlement de votre chambre.
                    </p>
                    <div className="mt-6 text-xs text-zinc-500 bg-zinc-100 border border-zinc-200 rounded-xl p-3">
                        Ne fermez pas cette page. La validation de votre séjour sera automatique dès détection du paiement.
                    </div>
                </div>
            )}

            {/* ÉTAPE 2 : PAIEMENT REÇU, DISPATCH DU JOB VERS L'API HÔTEL */}
            {currentStatus === "PROCESSING" && (
                <div className="max-w-md animate-fade-in">
                    <div className="flex space-x-2 justify-center mb-6">
                        <div className="h-3 w-3 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-3 w-3 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-3 w-3 bg-emerald-500 rounded-full animate-bounce"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-emerald-600 tracking-tight">Paiement reçu avec succès !</h2>
                    <p className="text-zinc-600 mt-3 text-sm leading-relaxed">
                        Votre paiement a bien été capturé. Nous sécurisons actuellement vos chambres auprès du fournisseur d'hôtels et générons votre Voucher...
                    </p>
                </div>
            )}

            {/* ÉTAPE 3 : RÉSERVATION CONFIRMÉE */}
            {(currentStatus === "CONFIRMED" || currentStatus === "TICKETED") && (
                <div className="bg-white border border-zinc-200 p-8 rounded-3xl max-w-md shadow-xl animate-scale-up text-center">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-5 shadow-inner">
                        ✓
                    </div>

                    <h2 className="text-2xl font-bold text-emerald-600 tracking-tight">Séjour Confirmé !</h2>
                    <p className="text-zinc-600 mt-3 text-sm leading-relaxed">
                        Votre chambre a été bloquée avec succès. Les détails de votre réservation sont sécurisés sous le numéro de confirmation officiel :
                    </p>

                    <div className="mt-4 inline-block font-mono bg-zinc-50 px-5 py-2.5 rounded-xl text-xl text-zinc-800 font-black tracking-wider border border-zinc-200 shadow-sm">
                        {reference}
                    </div>

                    <hr className="my-6 border-zinc-100" />

                    <div className="text-left bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">Prochaines étapes</h4>
                        <p className="text-zinc-700 text-xs leading-relaxed">
                            🏨 **Votre Voucher est prêt :** Votre bon d'échange hôtelier ainsi que votre reçu de paiement électronique viennent de vous être envoyés par e-mail.
                        </p>
                        <p className="text-zinc-700 text-xs leading-relaxed">
                            🔐 **Espace Client :** Vos accès temporaires vous ont été transmis pour vous permettre de suivre votre dossier voyageur à tout moment.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/customer-space/dashboard')}
                        className="mt-6 w-full bg-zinc-900 hover:bg-zinc-800 transition-colors py-3 rounded-xl text-white font-semibold text-sm shadow-sm"
                    >
                        Accéder à mon espace hôtelier
                    </button>
                </div>
            )}

            {/* ÉTAPE 4 : ÉCHEC DE L'OPÉRATION */}
            {(currentStatus === "FAILED" || currentStatus === "PAYMENT_INITIATION_FAILED") && (
                <div className="bg-white border border-red-200 p-8 rounded-2xl max-w-md shadow-xl animate-scale-up">
                    <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                        ✕
                    </div>
                    <h2 className="text-2xl font-bold text-rose-600 tracking-tight">L'opération a échoué</h2>
                    <p className="text-zinc-600 mt-3 text-sm leading-relaxed">
                        {errorMessage}
                    </p>
                    <p className="text-xs text-zinc-400 mt-2">
                        Si un débit intempestif a eu lieu sur votre compte Mobile Money, notre système enclenchera automatiquement un protocole de remboursement sous peu.
                    </p>
                    <div className="flex flex-col gap-2 mt-6">
                        <button
                            onClick={() => router.push('/hotels/booking')}
                            className="w-full bg-zinc-900 hover:bg-zinc-800 transition-colors py-3 rounded-xl text-white font-semibold text-sm"
                        >
                            Réessayer la réservation
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full text-zinc-500 hover:text-zinc-800 transition-colors py-2 text-xs font-medium"
                        >
                            Retourner à l'accueil
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function WaitingPaymentPage() {
    return (
        <>
            <Header />
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 text-zinc-900">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-300 mb-4 mx-auto"></div>
                    <p className="text-sm text-zinc-500">Connexion sécurisée aux services de paiement...</p>
                </div>
            }>
                <WaitingPaymentContent />
            </Suspense>
            <Footer />
        </>
    );
}