// components/MapDisplay.tsx

"use client";

import React from 'react';
import { GoogleMap } from "@react-google-maps/api";
import { DEFAULT_USER_ZOOM, defaultMapContainerStyle } from "@/utils/mapUtils";
import { useMapManager } from '@/context/MapContext'; // Consume the MapContext

const mapStyles = [
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
];

const defaultMapOptions = {
  zoomControl: true,
  tilt: 0,
  gestureHandling: 'auto',
  fullscreenControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  scaleControl: false,
  cameraControl: false,
  mapStyles: mapStyles

};

interface MapDisplayProps {
  children?: React.ReactNode; // To render children like Polygons/Markers from Home
}

const MapDisplay: React.FC<MapDisplayProps> = ({ children }) => {
  const { center, mapOnLoad, mapOnClick } = useMapManager();

  return (

    <GoogleMap mapContainerStyle={defaultMapContainerStyle} options={defaultMapOptions} center={center} zoom={DEFAULT_USER_ZOOM} onLoad={mapOnLoad} onClick={mapOnClick}>
      {children}
    </GoogleMap>

  );
};

export default MapDisplay;