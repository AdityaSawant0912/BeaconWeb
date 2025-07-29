// context/MapContext.tsx

import { createContext, useContext } from 'react';
import { LatLngLiteral } from '@/types/map'; // Assuming LatLngLiteral is from types/map

interface MapContextType {
  center: LatLngLiteral; // The current map center
  setCenter: (center: LatLngLiteral) => void;
  defaultMarkerIconOptions: google.maps.MarkerOptions['icon'] | undefined; // For the main marker
  mapOnLoad: (map: google.maps.Map) => void; // Callback for map loaded
  mapOnClick: (e: google.maps.MapMouseEvent) => void; // Callback for map clicked
  // No longer exposing setLocation or callBridgeFunction directly from MapContext,
  // as they come from NativeBridgeContext.
}

export const MapContext = createContext<MapContextType | undefined>(undefined);

export const useMapManager = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMapManager must be used within a MapProvider');
  }
  return context;
};