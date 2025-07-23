// components/MapDisplay.tsx

"use client";

import React from 'react';
import { Marker } from '@react-google-maps/api'; // Only import what's needed for this component
import Map from './Map'; // Your wrapper around GoogleMap
import { useMapManager } from '@/context/MapContext'; // Consume the MapContext

interface MapDisplayProps {
  children?: React.ReactNode; // To render children like Polygons/Markers from Home
}

const MapDisplay: React.FC<MapDisplayProps> = ({ children }) => {
  const { center, defaultMarkerIconOptions, mapOnLoad, mapOnClick } = useMapManager();

  return (
    <Map center={center} onLoad={mapOnLoad} onClick={mapOnClick}>
      {/* Primary marker (user's location) */}
      <Marker
        position={center}
        options={defaultMarkerIconOptions ? { icon: defaultMarkerIconOptions } : undefined}
      />
      {children} {/* Render any polygons, drawing markers, etc., passed from Home */}
    </Map>
  );
};

export default MapDisplay;