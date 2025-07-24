// providers/MapProvider.tsx

"use client";

import React, { useState, useCallback, ReactNode, useMemo } from 'react';
import { MapContext } from '../context/MapContext';
import isInWebView from "@/utils/isInWebView";
import { LatLngLiteral } from '@/types/map';
import { useNativeBridge } from '@/context/NativeBridgeContext';

interface MapProviderProps {
  children: ReactNode;
  isAddFenceOverlayActive: boolean;
  onMapClickForDrawing: (location: LatLngLiteral) => void; // This prop's value comes from useGeoFenceApi now
}

export const MapProvider: React.FC<MapProviderProps> = ({ children, isAddFenceOverlayActive, onMapClickForDrawing }) => {
  const { center, setLocation, callBridgeFunction } = useNativeBridge();

  const [defaultMarkerIconOptions, setDefaultMarkerIconOptions] = useState<google.maps.MarkerOptions['icon'] | undefined>(undefined);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mapOnLoad = useCallback((map: google.maps.Map) => {
    setDefaultMarkerIconOptions({
      path: google.maps.SymbolPath.CIRCLE,
      scale: 5,
      fillColor: "blue",
      strokeColor: "blue",
      fillOpacity: 1,
    });
    if (isInWebView()) {
      callBridgeFunction('getLocation', {});
    } else {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }, (e) => { console.log(e); }, {
        enableHighAccuracy: true,
      });
    }
  }, [callBridgeFunction, setLocation]);

  const mapOnClick = useCallback((e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();

    if (lat !== undefined && lng !== undefined) {
      const clickedLocation = { lat, lng };

      if (isAddFenceOverlayActive) {
        // Call the addDrawingPoint function provided by useGeoFenceApi (via Home)
        onMapClickForDrawing(clickedLocation);
      } else {
        // setLocation(clickedLocation);
      }
    }
  }, [isAddFenceOverlayActive, onMapClickForDrawing]); // Add onMapClickForDrawing as dependency

  const contextValue = useMemo(() => ({
    center,
    defaultMarkerIconOptions,
    mapOnLoad,
    mapOnClick,
  }), [center, defaultMarkerIconOptions, mapOnLoad, mapOnClick]);

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
};