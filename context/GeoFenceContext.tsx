// context/GeoFenceContext.tsx
"use client";

import React, { createContext, useContext } from 'react';
import { GeoFence, IncomingGeoFence, LatLngLiteral } from '@/types/map'; // Ensure these types are correctly imported

// Define the shape of the context value
export interface GeoFenceContextType {
  fences: GeoFence[];
  incomingFences: IncomingGeoFence[];
  drawingPolygonPaths: LatLngLiteral[];
  setFences: React.Dispatch<React.SetStateAction<GeoFence[]>>;
  addFence: (name: string, paths: LatLngLiteral[], color: string) => Promise<GeoFence | null>;
  deleteFence: (_id: string) => Promise<boolean>;
  addDrawingPoint: (location: LatLngLiteral) => void;
  removeLastDrawingPoint: () => void;
  removeDrawingPoints: () => void;
}

// Create the context with an initial undefined value
export const GeoFenceContext = createContext<GeoFenceContextType | undefined>(undefined);


export const useGeoFence = () => {
  const context = useContext(GeoFenceContext);
  if (context === undefined) {
    throw new Error('useGeoFence must be used within a GeoFenceProvider');
  }
  return context;
};