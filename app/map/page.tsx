// pages/index.tsx (or app/page.tsx)

"use client";

import React, { useCallback } from 'react';

// --- General UI Components ---
import BottomNavigation from '@/components/bottomNavigation';
import DetailsOverlay from '@/components/overlays/DetailsOverlay';
import FencesOverlay from '@/components/overlays/FencesOverlay';
import AddFenceOverlay from '@/components/overlays/AddFenceOverlay';
import ShareOverlay from '@/components/overlays/defaults/ShareOverlay';

// --- Map-related Components & Utilities ---
import MapDisplay from '@/components/MapDisplay';
import { Polygon, Marker } from '@react-google-maps/api';
import { calculatePolygonCentroid } from '@/utils/mapUtils';

// --- Contexts & Hooks ---
import { useOverlayManager } from '@/context/OverlayContext';
import { MapProvider } from '@/providers/MapProvider';
// NEW: Import the drawing-related states and functions from useGeoFenceApi
import { useGeoFenceApi } from '@/hooks/useGeoFenceApi';

// --- Types & Enums ---
import { LatLngLiteral } from '@/types/map'; // Keep LatLngLiteral for polygon rendering
import { DefaultOverlays, ExclusiveOverlays, OverlayType } from '@/types/enums';


export const defaultMapContainerStyle = {
  width: '100%',
  height: '80vh',
  borderRadius: '15px 0px 0px 15px',
};


export default function Home() {
  // --- Consume Contexts ---
  const { isOverlayActive, setActiveOverlay } = useOverlayManager();
  // NEW: Consume drawing-related state/functions from useGeoFenceApi
  const { fences, addFence, drawingPolygonPaths, addDrawingPoint, removeLastDrawingPoint, removeDrawingPoints } = useGeoFenceApi();

  // --- Callbacks for Overlay Interactions ---
  // The handleAddFence is largely simplified here
  const handleAddFenceAndOverlayUpdate = useCallback(async (name: string, paths: LatLngLiteral[], color: string) => {
    // addFence from useGeoFenceApi now handles clearing drawingPolygonPaths internally
    await addFence(name, paths, color);
    setActiveOverlay(ExclusiveOverlays.FENCES, OverlayType.EXCLUSIVE, true); // Navigate to fences list
  }, [addFence, setActiveOverlay]);

  // --- Determine Overlay Modes for MapProvider and UI Rendering ---
  const isAddFenceMode = isOverlayActive(ExclusiveOverlays.ADD_FENCE);


  return (
    <div className='flex flex-col h-screen w-screen relative'>
      <div className='flex-grow'>
        <MapProvider
          isAddFenceOverlayActive={isAddFenceMode}
          // Pass addDrawingPoint directly to MapProvider
          onMapClickForDrawing={addDrawingPoint}
        >
          <MapDisplay>
            {/* Render existing fences (polygons and their labels) */}
            {fences.map(fence => {
              const centroid = calculatePolygonCentroid(fence.paths);
              return (
                <React.Fragment key={fence.id}>
                  <Polygon
                    paths={fence.paths}
                    options={{
                      strokeColor: fence.color,
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                      fillColor: fence.color,
                      fillOpacity: 0.35,
                      geodesic: true,
                    }}
                  />
                  <Marker
                    position={centroid}
                    label={{
                      text: fence.name,
                      color: 'black',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}
                    options={{
                      icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 0,
                      },
                      clickable: false,
                      draggable: false,
                    }}
                  />
                </React.Fragment>
              );
            })}

            {/* Render the polygon currently being drawn and its point markers,
                only when in 'addFence' mode and points exist */}
            {isAddFenceMode && drawingPolygonPaths.length > 0 && (
              <>
                <Polygon
                  paths={drawingPolygonPaths}
                  options={{
                    strokeColor: '#0000FF',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#0000FF',
                    fillOpacity: 0.2,
                    geodesic: true,
                  }}
                />
                {drawingPolygonPaths.map((point, index) => (
                  <Marker
                    key={`drawing-point-${index}`}
                    position={point}
                    options={{
                      icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#0000FF',
                        fillOpacity: 1,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 1,
                      },
                      label: {
                        text: `${index + 1}`,
                        color: 'white',
                        fontSize: '10px'
                      }
                    }}
                  />
                ))}
              </>
            )}
          </MapDisplay>
        </MapProvider>
      </div>

      {/* --- Overlay UI - Conditionally Rendered based on OverlayContext --- */}
      {isOverlayActive(DefaultOverlays.SHARE) && (
        <ShareOverlay />
      )}

      {isOverlayActive(ExclusiveOverlays.DETAILS) && (
        <DetailsOverlay onClose={() => setActiveOverlay(ExclusiveOverlays.DETAILS, OverlayType.EXCLUSIVE, false)} />
      )}
      {isOverlayActive(ExclusiveOverlays.FENCES) && (
        <FencesOverlay
          fences={fences}
          onClose={() => setActiveOverlay(ExclusiveOverlays.FENCES, OverlayType.EXCLUSIVE, false)}
          onAddFenceClick={() => setActiveOverlay(ExclusiveOverlays.ADD_FENCE, OverlayType.EXCLUSIVE, true)}
        />
      )}
      {isOverlayActive(ExclusiveOverlays.ADD_FENCE) && (
        <AddFenceOverlay
          onClose={() => {
            setActiveOverlay(ExclusiveOverlays.ADD_FENCE, OverlayType.EXCLUSIVE, false);
            removeDrawingPoints()
          }}
          onSave={handleAddFenceAndOverlayUpdate} // Use the new combined handler
          drawingPaths={drawingPolygonPaths} // Pass drawing state from useGeoFenceApi
          onRemoveLastPoint={removeLastDrawingPoint} // Pass remove point from useGeoFenceApi
        />
      )}

      <div className='flex-none h-16'>
        <BottomNavigation />
      </div>
    </div>
  );
}