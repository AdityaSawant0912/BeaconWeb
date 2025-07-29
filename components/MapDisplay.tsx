// components/MapDisplay.tsx

"use client";

import React from 'react';
import Map from './Map'; // Your wrapper around GoogleMap
import { useMapManager } from '@/context/MapContext'; // Consume the MapContext

interface MapDisplayProps {
  children?: React.ReactNode; // To render children like Polygons/Markers from Home
}

const MapDisplay: React.FC<MapDisplayProps> = ({ children }) => {
  const { center, mapOnLoad, mapOnClick } = useMapManager();

  return (
    <Map center={center} onLoad={mapOnLoad} onClick={mapOnClick}>
      {/* Primary marker (user's location) */}
      {children} {/* Render any polygons, drawing markers, etc., passed from Home */}
    </Map>
  );
};

export default MapDisplay;