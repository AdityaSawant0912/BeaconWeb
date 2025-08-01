"use client"

import { MapProviders, OuterMapProviders } from "@/providers/providers";

export default function MapPageLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <OuterMapProviders>
            <MapProviders>
                {children}
            </MapProviders>
        </OuterMapProviders>
    )
}