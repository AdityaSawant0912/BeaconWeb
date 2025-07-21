// components/overlays/OverlayManager.tsx
import React from 'react';
import DetailsOverlay from '@/components/overlays/DetailsOverlay'; // Assuming this component exists
import FencesOverlay from '@/components/overlays/FencesOverlay'; // Assuming this component exists
import AddFenceOverlay from '@/components/overlays/AddFenceOverlay'; // Assuming this component exists
import { LatLngLiteral, GeoFence } from '@/types/map'; // Import types
import ShareOverlay from '@/components/overlays/defaults/ShareOverlay';

/**
 * Props interface for the OverlayManager component.
 */
interface OverlayManagerProps {
  activeOverlay: string;
  onClose: () => void; // Function to close any active overlay
  onAddFenceClick: () => void; // Function to switch to 'addFence' mode from 'fences'
  fences: GeoFence[]; // List of existing fences to pass to FencesOverlay
  onSaveFence: (name: string, paths: LatLngLiteral[], color: string) => void; // Function to save a new fence
  drawingPaths: LatLngLiteral[]; // Current paths for the polygon being drawn
  onRemoveLastPoint: () => void; // Function to remove the last point from drawing paths
}

/**
 * OverlayManager component is responsible for conditionally rendering the correct overlay
 * based on the `activeOverlay` prop. It acts as a central point for managing overlay visibility
 * and passing down necessary props and callbacks to each specific overlay component.
 * @param props - OverlayManagerProps containing the active overlay state and various handlers.
 */
export const OverlayManager: React.FC<OverlayManagerProps> = ({
  activeOverlay,
  onClose,
  onAddFenceClick,
  fences,
  onSaveFence,
  drawingPaths,
  onRemoveLastPoint,
}) => {
  return (
    <>
    
    {/* Render default Overlays */}
    <ShareOverlay />
    
      {/* Render DetailsOverlay if 'details' is the active overlay */}
      {activeOverlay === 'details' && (
        <DetailsOverlay onClose={onClose} />
      )}

      {/* Render FencesOverlay if 'fences' is the active overlay */}
      {activeOverlay === 'fences' && (
        <FencesOverlay
          fences={fences}
          onClose={onClose}
          onAddFenceClick={onAddFenceClick}
        />
      )}

      {/* Render AddFenceOverlay if 'addFence' is the active overlay */}
      {activeOverlay === 'addFence' && (
        <AddFenceOverlay
          onClose={() => {
            // When AddFenceOverlay is closed, also trigger the parent's onClose
            // The parent hook (useMapState) will handle clearing drawing paths.
            onClose();
          }}
          onSave={onSaveFence} // Pass the function to save the new fence
          drawingPaths={drawingPaths} // Pass the current points being drawn
          onRemoveLastPoint={onRemoveLastPoint} // Pass the function to remove the last point
        />
      )}
    </>
  );
};

