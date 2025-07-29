// providers/MapProvider.tsx

"use client";

import React, { useState, useCallback, ReactNode, useMemo, useRef, useEffect } from 'react';
import { MapContext } from '../context/MapContext';
import isInWebView from "@/utils/isInWebView";
import { LatLngLiteral } from '@/types/map';
import { useNativeBridge } from '@/context/NativeBridgeContext';
import { useJsApiLoader } from '@react-google-maps/api';

interface MapProviderProps {
  children: ReactNode;
  isAddFenceOverlayActive: boolean;
  onMapClickForDrawing: (location: LatLngLiteral) => void;
}

export const MapProvider: React.FC<MapProviderProps> = ({ children, isAddFenceOverlayActive, onMapClickForDrawing }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API as string,
    libraries: ['drawing', 'geometry'],
  });

  const { center: currentUserCenter, setLocation, callBridgeFunction } = useNativeBridge();
  // `mapCenterState` will now primarily be controlled by `panToLocation` or initial load
  const [mapCenterState, setMapCenterState] = useState<LatLngLiteral>(currentUserCenter || { lat: 0, lng: 0 });
  const [defaultMarkerIconOptions, setDefaultMarkerIconOptions] = useState<google.maps.MarkerOptions['icon'] | undefined>(undefined);

  const mapRef = useRef<google.maps.Map | null>(null);

  // NEW: Generic panToLocation function
  const panToLocation = useCallback((location: LatLngLiteral, zoom?: number) => {
    if (mapRef.current) {
      mapRef.current.panTo(location);
      if (zoom !== undefined) {
        mapRef.current.setZoom(zoom);
      }
      setMapCenterState(location); // Keep mapCenterState in sync for the GoogleMap prop
    } else {
    }
  }, []); // No dependencies for panToLocation itself, as mapRef.current is stable

  const mapOnLoad = useCallback((mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance;
    setDefaultMarkerIconOptions({
      path: google.maps.SymbolPath.CIRCLE,
      scale: 5,
      fillColor: "blue",
      strokeColor: "blue",
      fillOpacity: 1,
    });

    // Initial load logic: Prioritize current user's location
    if (currentUserCenter && currentUserCenter.lat !== 0 && currentUserCenter.lng !== 0) {
      panToLocation(currentUserCenter, 18); // Pan to user on load
    }

    if (isInWebView()) {
      callBridgeFunction('getLocation', {});
    } else {
      navigator.geolocation.getCurrentPosition((pos) => {
        const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(userLoc); // Update native bridge context
        // After getting user's real-time location, pan to it
        panToLocation(userLoc, 18);
      }, (e) => { console.log("Geolocation error:", e); }, {
        enableHighAccuracy: true,
      });
    }
  }, [callBridgeFunction, setLocation, currentUserCenter, panToLocation]); // Add panToLocation to dependencies

  // Effect to trigger panning if currentUserCenter updates after initial load (e.g., location permission granted later)
  useEffect(() => {
    if (isLoaded && currentUserCenter && currentUserCenter.lat !== 0 && currentUserCenter.lng !== 0 && mapRef.current) {
      // Only pan if the map's current center is significantly different
      const currentMapCenter = mapRef.current.getCenter();
      if (!currentMapCenter ||
          (Math.abs(currentMapCenter.lat() - currentUserCenter.lat) > 0.00001 || // Use a small epsilon for float comparison
           Math.abs(currentMapCenter.lng() - currentUserCenter.lng) > 0.00001)) {
        panToLocation(currentUserCenter, 18); // Use generic panToLocation
      }
    }
  }, [currentUserCenter, panToLocation, isLoaded]);

  const mapOnClick = useCallback((e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();

    if (lat !== undefined && lng !== undefined) {
      const clickedLocation = { lat, lng };
      if (isAddFenceOverlayActive) {
        onMapClickForDrawing(clickedLocation);
      }
    }
  }, [isAddFenceOverlayActive, onMapClickForDrawing]);

  const contextValue = useMemo(() => ({
    center: mapCenterState, // This is the state that the GoogleMap component listens to
    setCenter: setMapCenterState, // Still provide this if direct state manipulation is desired elsewhere
    defaultMarkerIconOptions,
    mapOnLoad,
    mapOnClick,
    panToLocation, // Expose the generic pan function
  }), [mapCenterState, defaultMarkerIconOptions, mapOnLoad, mapOnClick, panToLocation]);

  if (loadError) return (<p>Encountered error while loading google maps</p>);
  if (!isLoaded) return <p>Map Script is loading ...</p>;

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
};