// pages/index.tsx
"use client"
import BottomNavigation from '@/components/bottomNavigation';
import React from 'react';
import { useMapState } from '@/hooks/useMapState'; // Import the new custom hook
import { MapDisplay } from '@/components/MapDisplay'; // Import the new MapDisplay component
import { OverlayManager } from '@/components/overlays/OverlayManager'; // Import the new OverlayManager component

/**
 * The main Home component for the map application.
 * This component orchestrates the map display, overlays, and bottom navigation.
 * It leverages custom hooks to manage state and logic, promoting a cleaner and more modular structure.
 */
export default function Home() {
  // Destructure state and functions from the useMapState custom hook
  const {
    center,
    activeOverlay,
    fences,
    drawingPolygonPaths,
    defaultMarkerIconOptions,
    setActiveOverlay, // Exposed to allow OverlayManager to directly set activeOverlay
    mapOnLoad,
    mapOnClick,
    handleOverlayToggle,
    addFence,
    removeLastDrawingPoint,
  } = useMapState();

  return (
    <div className='flex flex-col h-screen w-screen relative'>
      {/* Main map display area, takes up flexible height */}
      <div className='flex-grow'>
        <MapDisplay
          center={center}
          fences={fences}
          drawingPolygonPaths={drawingPolygonPaths}
          activeOverlay={activeOverlay}
          defaultMarkerIconOptions={defaultMarkerIconOptions}
          onLoad={mapOnLoad}
          onClick={mapOnClick}
        />
      </div>

      {/* Overlay management component, conditionally renders different overlays */}
      <OverlayManager
        activeOverlay={activeOverlay}
        onClose={() => setActiveOverlay('')} // Function to close any active overlay
        onAddFenceClick={() => setActiveOverlay('addFence')} // Function to switch to 'addFence' mode
        fences={fences} // Pass fences data to the manager
        onSaveFence={addFence} // Pass the addFence function to the manager
        drawingPaths={drawingPolygonPaths} // Pass drawing paths to the manager
        onRemoveLastPoint={removeLastDrawingPoint} // Pass function to remove last drawing point
      />

      {/* Bottom navigation bar, fixed height */}
      <div className='flex-none h-16'>
        <BottomNavigation activeOverlay={activeOverlay} onOverlayToggle={handleOverlayToggle} />
      </div>
    </div>
  );
}

