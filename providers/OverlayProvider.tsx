// providers/OverlayProvider.tsx

"use client";

import React, { useState, useCallback, useMemo, ReactNode } from 'react';
import { OverlayContext } from '../context/OverlayContext'; // Import OverlayType
import { DefaultOverlays, ExclusiveOverlays, OverlayType } from '@/types/enums';

export interface OverlayProviderProps {
  children: ReactNode;
}


// Define your default (persistent) overlays.
// These will stay on unless explicitly turned off.
// Example: A map legend, a real-time status bar, etc.
const DEFAULT_OVERLAYS: string[] = Object.values(DefaultOverlays); // Example: 'statusBar' could be a default overlay

// Define your exclusive (one-at-a-time) overlays.
// Activating one of these will deactivate all others in this list.
// Example: Details, Fences, AddFence, Share, Settings.
const EXCLUSIVE_OVERLAYS: string[] = Object.values(ExclusiveOverlays);

export const OverlayProvider: React.FC<OverlayProviderProps> = ({ children }) => {
  // activeOverlays state will now be a record (object)
  // Initialize default overlays to true if they should be on by default
  const [activeOverlays, setActiveOverlays] = useState<Record<DefaultOverlays | ExclusiveOverlays, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    DEFAULT_OVERLAYS.forEach(name => {
      initialState[name] = true; // Set default overlays to true initially
    });
    EXCLUSIVE_OVERLAYS.forEach(name => {
      initialState[name] = false; // Set exclusive overlays to false initially
    });
    return initialState;
  });

  // Function to explicitly set an overlay's state
  const setActiveOverlay = useCallback((overlayName: DefaultOverlays | ExclusiveOverlays, type: OverlayType, isActive: boolean) => {
    setActiveOverlays(prev => {
      const newState = { ...prev };

      if (type === OverlayType.EXCLUSIVE) {
        // If an exclusive overlay is being activated, turn off all other exclusive overlays
        if (isActive) {
          EXCLUSIVE_OVERLAYS.forEach(name => {
            if (name !== overlayName) {
              newState[name as DefaultOverlays | ExclusiveOverlays] = false;
            }
          });
          newState[overlayName] = true;
        } else {
          // If an exclusive overlay is being deactivated, just turn it off
          newState[overlayName] = false;
        }
      } else if (type === OverlayType.DEFAULT) {
        // Default overlays can be toggled independently
        newState[overlayName] = isActive;
      }
      return newState;
    });
  }, []); // No dependencies needed for setActiveOverlays as it uses internal constants

  // Function to toggle an overlay's state
  const toggleOverlay = useCallback((overlayName: DefaultOverlays | ExclusiveOverlays, type: OverlayType) => {
    setActiveOverlays(prev => {
      const newState = { ...prev };
      const currentlyActive = prev[overlayName];

      if (type === OverlayType.EXCLUSIVE) {
        // If exclusive and currently active, turn it off.
        // If exclusive and currently inactive, turn it on and turn off others.
        if (currentlyActive) {
          newState[overlayName] = false; // Turn off the active one
        } else {
          EXCLUSIVE_OVERLAYS.forEach(name => {
            if (name !== overlayName) {
              newState[name as DefaultOverlays | ExclusiveOverlays] = false; // Turn off other exclusive overlays
            }
          });
          newState[overlayName] = true; // Turn on the new one
        }
      } else if (type === OverlayType.DEFAULT) {
        // Default overlays just toggle their own state
        newState[overlayName] = !currentlyActive;
      }
      return newState;
    });
  }, []); // No dependencies needed

  // Helper to check if an overlay is active
  const isOverlayActive = useCallback((overlayName: DefaultOverlays | ExclusiveOverlays): boolean => {
    return activeOverlays[overlayName] || false; // Return false if undefined
  }, [activeOverlays]); // Depends on activeOverlays state

  // The value that will be provided to consumers
  const contextValue = useMemo(() => ({
    activeOverlays,
    setActiveOverlay,
    toggleOverlay,
    isOverlayActive,
  }), [activeOverlays, setActiveOverlay, toggleOverlay, isOverlayActive]);

  return (
    <OverlayContext.Provider value={contextValue}>
      {children}
    </OverlayContext.Provider>
  );
};