"use client";
import { SessionProvider } from "next-auth/react";
import { OverlayProvider } from "./OverlayProvider";
import { NativeBridgeProvider } from "./NativeBridgeProvider";
import MapProvider from "@/providers/map-provider";
import { SharePermissionsProvider } from "./SharePermissionProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NativeBridgeProvider>
        <SharePermissionsProvider>
          <MapProvider>
            <OverlayProvider>
              {children}
            </OverlayProvider>
          </MapProvider>
        </SharePermissionsProvider>
      </NativeBridgeProvider>
    </SessionProvider>);
}