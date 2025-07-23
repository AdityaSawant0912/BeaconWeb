// context/OverlayContext.tsx

import { createContext, useContext } from 'react';
import { OverlayType, DefaultOverlays, ExclusiveOverlays } from '@/types/enums';

// Define the shape of the context value
interface OverlayContextType {
  activeOverlays: Record<DefaultOverlays | ExclusiveOverlays, boolean>; // Now an object
  // Function to explicitly set an overlay's state.
  // We need to know its type to apply the correct logic.
  setActiveOverlay: (overlayName: DefaultOverlays | ExclusiveOverlays, type: OverlayType, isActive: boolean) => void;
  // Function to toggle an overlay's state.
  // We need to know its type for proper toggling logic.
  toggleOverlay: (overlayName: DefaultOverlays | ExclusiveOverlays, type: OverlayType) => void;
  // A helper to quickly check if an overlay is active
  isOverlayActive: (overlayName: DefaultOverlays | ExclusiveOverlays) => boolean;
}

// Create the context with a default undefined value
export const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

// Custom hook to consume the OverlayContext
export const useOverlayManager = () => {
  const context = useContext(OverlayContext);
  if (context === undefined) {
    throw new Error('useOverlayManager must be used within an OverlayProvider');
  }
  return context;
};
