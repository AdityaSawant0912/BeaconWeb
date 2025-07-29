// context/MapContext.ts

import { LatLngLiteral } from '@/types/map';
import { createContext, useContext } from 'react';

interface MapContextType {
  center: LatLngLiteral; // This will continue to represent the actual center prop of the map
  setCenter: React.Dispatch<React.SetStateAction<LatLngLiteral>>; // Allows setting the center directly (e.g., for initial load)
  defaultMarkerIconOptions: google.maps.MarkerOptions['icon'] | undefined;
  mapOnLoad: (mapInstance: google.maps.Map) => void;
  mapOnClick: (e: google.maps.MapMouseEvent) => void;
  // NEW: Generic function to pan the map to any location
  panToLocation: (location: LatLngLiteral, zoom?: number) => void;
  // If you still need a dedicated "recenter on user" button that specifically uses currentUserCenter
  // you might re-introduce a specific `recenterOnUser` that internally calls `panToLocation(currentUserCenter)`.
  // For now, let's keep it generic.
}

export const MapContext = createContext<MapContextType | undefined>(undefined);

export const useMapManager = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMapManager must be used within a MapProvider');
  }
  return context;
};