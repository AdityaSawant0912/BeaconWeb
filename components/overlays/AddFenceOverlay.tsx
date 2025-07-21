// src/components/overlays/AddFenceOverlay.tsx (or .jsx)
import React, { useState, useEffect } from 'react';
import { GeoFence } from '@/app/page'; // For LatLngLiteral definition if needed, or define locally

interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface AddFenceOverlayProps {
  onClose: () => void;
  onSave: (name: string, paths: LatLngLiteral[], color: string) => void;
  drawingPaths: LatLngLiteral[]; // The points currently being drawn
  onRemoveLastPoint: () => void; // Function to remove the last point
}

const AddFenceOverlay: React.FC<AddFenceOverlayProps> = ({ onClose, onSave, drawingPaths, onRemoveLastPoint }) => {
  const [fenceName, setFenceName] = useState('');
  const [fenceColor, setFenceColor] = useState('#FF0000'); // Default color (red)

  const handleSave = () => {
    if (fenceName.trim() === '') {
      alert('Please enter a fence name.');
      return;
    }
    // A polygon typically needs at least 3 points to be valid
    if (drawingPaths.length < 3) {
      alert('Please select at least 3 points on the map to form a polygon.');
      return;
    }
    onSave(fenceName, drawingPaths, fenceColor);
  };

  // Predefined color options
  const colorOptions = [
    { name: 'Red', hex: '#FF0000' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Green', hex: '#00FF00' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Purple', hex: '#800080' },
  ];

  return (
    <div className="absolute bottom-16 left-0 right-0 bg-white p-4 shadow-lg rounded-t-lg z-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Add New Polygon Fence</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          X
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="fenceName" className="block text-sm font-medium text-gray-700">
          Fence Name & Color Code
        </label>
        <div className='flex flex-row justify-center items-center gap-3 mt-1'>
          <input
            type="text"
            id="fenceName"
            className=" block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={fenceName}
            onChange={(e) => setFenceName(e.target.value)}
            placeholder="e.g., Office Building Perimeter"
          />
          <input
            type="color"
            id="fenceColor"
            value={fenceColor}
            onChange={(e) => setFenceColor(e.target.value)}
            className="w-11 h-11 border-gray-300 cursor-pointer"
            title="Custom Color"
          />
        </div>
      </div>

     

      <div className="mb-4">
        <p className="block text-sm font-medium text-gray-700">
          Polygon Points:
        </p>
        <p className="mt-1 text-sm text-gray-600">
          {drawingPaths.length > 0
            ? `Selected ${drawingPaths.length} points.`
            : 'Click on the map to add points for your polygon.'}
          {drawingPaths.length < 3 && (
            <span className="text-red-600 ml-2"> (Minimum 3 points needed)</span>
          )}
        </p>
        {drawingPaths.length > 0 && (
          <button
            onClick={onRemoveLastPoint}
            className="mt-2 bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-400"
          >
            Remove Last Point
          </button>
        )}
      </div>

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded-md w-full disabled:opacity-50"
        disabled={fenceName.trim() === '' || drawingPaths.length < 3}
      >
        Save Polygon Fence
      </button>
    </div>
  );
};

export default AddFenceOverlay;