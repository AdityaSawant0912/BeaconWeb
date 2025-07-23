"use client";
import { SessionProvider } from "next-auth/react";
import { OverlayProvider } from "./OverlayProvider";
import { NativeBridgeProvider } from "./NativeBridgeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NativeBridgeProvider>
        <OverlayProvider>
          {children}
        </OverlayProvider>
      </NativeBridgeProvider>
    </SessionProvider>);
}