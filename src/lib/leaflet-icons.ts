// @ts-nocheck
// L'import de Leaflet ne doit plus être fait statiquement en haut si on veut être 100% sûr au build,
// ou alors on protège chaque exécution de fonction.

/**
 * Fix les icônes par défaut uniquement côté client
 */
export function fixLeafletIcons() {
    if (typeof window === "undefined") return;

    // Import dynamique au moment de l'exécution côté client
    const L = require("leaflet");

    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
        iconUrl:       "/leaflet/marker-icon.png",
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        shadowUrl:     "/leaflet/marker-shadow.png",
    });
}

/**
 * Icône personnalisée pour les hôtels
 */
export const hotelIcon = (selected = false) => {
    if (typeof window === "undefined") return null as any;
    const L = require("leaflet");

    return L.divIcon({
        className: "",
        html: `
            <div style="
                background: ${selected ? "#15a4e6" : "#1a1a1a"};
                color: white;
                padding: 4px 8px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.25);
                border: 2px solid ${selected ? "#0e8fd4" : "#333"};
                transform: translateX(-50%);
            ">
                🏨
            </div>
        `,
        iconAnchor: [0, 0],
    });
};

/**
 * Icône de prix
 */
export const priceIcon = (price: string, currency: string, selected = false) => {
    if (typeof window === "undefined") return null as any;
    const L = require("leaflet");

    return L.divIcon({
        className: "",
        html: `
            <div style="
                background: ${selected ? "#15a4e6" : "white"};
                color: ${selected ? "white" : "#1a1a1a"};
                padding: 4px 8px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 700;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                border: 2px solid ${selected ? "#0e8fd4" : "#e4e4e7"};
                transform: translateX(-50%);
                cursor: pointer;
            ">
                ${currency} ${Number(price).toLocaleString()}
            </div>
        `,
        iconAnchor: [0, 0],
    });
};