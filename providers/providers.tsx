"use client";
import { SessionProvider } from "next-auth/react";
import { OverlayProvider } from "./OverlayProvider";
import { NativeBridgeProvider } from "./NativeBridgeProvider";
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
        {children}
      </NativeBridgeProvider>
    </SessionProvider>);
}

export function OuterMapProviders({ children }: { children: React.ReactNode }) {


  return (
    <SharePermissionsProvider>
      <GeoFenceProvider>
        <OverlayProvider>
          {children}
        </OverlayProvider>
      </GeoFenceProvider>
    </SharePermissionsProvider>
  )
}

export function MapProviders({ children }: { children: React.ReactNode }) {
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

