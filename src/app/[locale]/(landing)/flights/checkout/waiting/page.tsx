'use client';

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "../../../../../../components/layout/Header";
import { Footer } from "../../../../../../components/layout/Footer";
import { useBookingStatusPolling } from "../../../../../../core/hooks/useBookingStatusPolling";

// 1. On isole la logique dépendante de useSearchParams dans un sous-composant
function WaitingPaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Récupération de l'ID depuis l'URL (?id=xxx)
    const bookingId = searchParams.get("id");

    // Exploitation du hook personnalisé
    const { data: booking, isError } = useBookingStatusPolling(bookingId);

    // Extraction des états réactifs basés sur la réponse de l'API
    const currentStatus = booking?.booking_status || "pending_payment";
    const pnr = booking?.pnr || "En cours";
    const errorMessage = booking?.message || "La transaction a été refusée, annulée ou a expiré.";

    // Sécurité visuelle si l'ID est corrompu ou absent de l'URL
    if (!bookingId || isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 text-zinc-900">
                <p className="text-red-500 font-semibold">Identifiant de réservation invalide ou introuvable.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 text-zinc-900 selection:bg-[#15a4e6]/20">

            {/* ÉTAPE 1 : ATTENTE DE LA SAISIE DU CODE PIN (pending_payment) */}
            {(currentStatus === "pending_payment" || currentStatus === "waiting_pin") && (
                <div className="max-w-md animate-fade-in">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-[#15a4e6] mb-6 mx-auto"></div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">En attente de votre validation PIN...</h2>
                    <p className="text-zinc-600 mt-3 text-sm leading-relaxed">
                        Un message de confirmation (Push USSD) a été envoyé sur votre téléphone.
                        Veuillez composer votre code secret pour valider le débit de votre compte mobile.
                    </p>
                    <div className="mt-6 text-xs text-zinc-500 bg-zinc-100 border border-zinc-200 rounded-xl p-3">
                        Ne fermez pas cette page. La redirection sera automatique après validation.
                    </div>
                </div>
            )}

            {/* ÉTAPE 2 : PAIEMENT REÇU, LE JOB EXÉCUTE L'AIRPRICE / COMMIT GDS (paid_pending_gds) */}
            {currentStatus === "paid_pending_gds" && (
                <div className="max-w-md animate-fade-in">
                    <div className="flex space-x-2 justify-center mb-6">
                        <div className="h-3 w-3 bg-[#7bcd4f] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-3 w-3 bg-[#7bcd4f] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-3 w-3 bg-[#7bcd4f] rounded-full animate-bounce"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-[#7bcd4f] tracking-tight">Paiement Reçu avec Succès !</h2>
                    <p className="text-zinc-600 mt-3 text-sm leading-relaxed">
                        Nous sécurisons actuellement vos places auprès de la compagnie aérienne et procédons à la génération de vos documents de voyage sur Travelport...
                    </p>
                </div>
            )}

            {/* ÉTAPE 3 : RÉSERVATION SÉCURISÉE SUR LE GDS */}
            {["ticketed", "hold", "paid_hold_forced"].includes(currentStatus) && (
                <div className="bg-white border border-zinc-200 p-8 rounded-3xl max-w-md shadow-xl animate-scale-up text-center">
                    <div className="w-16 h-16 bg-[#7bcd4f]/10 text-[#7bcd4f] rounded-full flex items-center justify-center text-3xl mx-auto mb-5 shadow-inner">
                        ✓
                    </div>

                    <h2 className="text-2xl font-bold text-[#7bcd4f] tracking-tight">Voyage Confirmé !</h2>
                    <p className="text-zinc-600 mt-3 text-sm leading-relaxed">
                        Votre dossier a été validé avec succès. Vos places sont sécurisées sous le code de réservation officiel :
                    </p>

                    <div className="mt-4 inline-block font-mono bg-zinc-50 px-5 py-2.5 rounded-xl text-2xl text-zinc-800 font-bold tracking-widest border border-zinc-200 shadow-sm">
                        {pnr}
                    </div>

                    <hr className="my-6 border-zinc-100" />

                    <div className="text-left bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#15a4e6]">Prochaines étapes</h4>
                        <p className="text-zinc-700 text-xs leading-relaxed">
                            📧 **Vérifiez votre boîte de réception :** Vos billets électroniques ainsi que votre facture détaillée viennent de vous être envoyés.
                        </p>
                        <p className="text-zinc-700 text-xs leading-relaxed">
                            🔐 **Informations de connexion :** Un second e-mail contenant vos identifiants temporaires et vos accès sécurisés vous a été transmis pour vous permettre de suivre ce vol à tout moment.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/customer-space/dashboard/')}
                        className="mt-6 w-full bg-[#15a4e6] hover:bg-[#1182b8] transition-colors py-3 rounded-xl text-white font-semibold text-sm shadow-sm"
                    >
                        Accéder à mon espace client
                    </button>
                </div>
            )}

            {/* ÉTAPE 4 : ÉCHEC DE L'OPÉRATION */}
            {["payment_failed", "gds_failed", "gds_failed_requires_refund", "initiation_failed"].includes(currentStatus) && (
                <div className="bg-white border border-red-200 p-8 rounded-2xl max-w-md shadow-xl animate-scale-up">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                        ✕
                    </div>
                    <h2 className="text-2xl font-bold text-red-500 tracking-tight">L'opération a échoué</h2>
                    <p className="text-zinc-600 mt-3 text-sm leading-relaxed">
                        {errorMessage}
                    </p>
                    <p className="text-xs text-zinc-400 mt-2">
                        Si votre compte a été débité par erreur, notre protocole automatique de remboursement s'enclenchera sous peu.
                    </p>
                    <div className="flex flex-col gap-2 mt-6">
                        <button
                            onClick={() => router.push('/flights/checkout')}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 transition-colors py-3 rounded-xl text-white font-semibold text-sm"
                        >
                            Réessayer avec un autre moyen
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

// 2. Le composant exporté par défaut enveloppe le tout dans un Suspense Boundary
export default function WaitingPaymentPage() {
    return (
        <>
            <Header />
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 text-zinc-900">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-300 mb-4 mx-auto"></div>
                    <p className="text-sm text-zinc-500">Initialisation de la session de paiement...</p>
                </div>
            }>
                <WaitingPaymentContent />
            </Suspense>
            <Footer />
        </>
    );
}