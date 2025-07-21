// src/components/overlays/FencesOverlay.tsx (or .jsx)
import React from 'react';


interface FencesOverlayProps {
  fences: GeoFence[];
  onClose: () => void;
  onAddFenceClick: () => void;
}

const FencesOverlay: React.FC<FencesOverlayProps> = ({ fences, onClose, onAddFenceClick }) => {
  return (
    <div className="absolute bottom-16 left-0 right-0 bg-white p-4 shadow-lg rounded-t-lg z-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Fences (Polygons)</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          X
        </button>
      </div>

      <button
        onClick={onAddFenceClick}
        className="bg-teal-500 text-white px-4 py-2 rounded-md mb-4 w-full flex items-center justify-center space-x-2"
      >
        <span>Add Polygon Fence</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {fences.length === 0 ? (
        <p className="text-gray-600 text-center">No polygon fences added yet.</p>
      ) : (
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {fences.map(fence => (
            <div key={fence.id} className="border border-gray-200 p-3 rounded-md flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{fence.name}</h3>
                <p className="text-sm text-gray-600">Points: {fence.paths.length}</p>
              </div>
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: fence.color }}
                title={`Color: ${fence.color}`}
              ></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FencesOverlay;