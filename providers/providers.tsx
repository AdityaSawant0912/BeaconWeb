"use client";
import { SessionProvider } from "next-auth/react";
import { OverlayProvider } from "./OverlayProvider";
import { NativeBridgeProvider } from "./NativeBridgeProvider";
import GoogleMapProvider from "@/providers/map-provider";
import { SharePermissionsProvider } from "./SharePermissionProvider";
import { GeoFenceProvider } from "./GeoFenceProvider";
import { MapProvider } from '@/providers/MapProvider';
import { ExclusiveOverlays } from "@/types/enums";
import { useOverlayManager } from "@/context/OverlayContext";
import { useGeoFence } from "@/context/GeoFenceContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NativeBridgeProvider>
        <SharePermissionsProvider>
          <GeoFenceProvider>
            <GoogleMapProvider>
              <OverlayProvider>
                {children}
              </OverlayProvider>
            </GoogleMapProvider>
          </GeoFenceProvider>
        </SharePermissionsProvider>
      </NativeBridgeProvider>
    </SessionProvider>);
}

export function InnerProviders({ children }: { children: React.ReactNode }) {

  const { addDrawingPoint } = useGeoFence()

  const { isOverlayActive } = useOverlayManager();
  const isAddFenceMode = isOverlayActive(ExclusiveOverlays.ADD_FENCE);
  return (
      <MapProvider
        isAddFenceOverlayActive={isAddFenceMode}
        onMapClickForDrawing={addDrawingPoint}>
        {children}
      </MapProvider>
  )
}