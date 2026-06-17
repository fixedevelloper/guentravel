import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "Guen's Travel - FinTech & Hosting",
    description: "Plateforme de gestion hôtelière et financière intégrée."
};

export default function RootLayout({
                                       children
                                   }: {
    children: React.ReactNode;
}) {
    return children;
}