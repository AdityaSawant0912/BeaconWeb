// src/components/overlays/FencesOverlay.tsx (or .jsx)
import React from 'react';
import Icon from "@/components/Icon";
import { GeoFence } from '@/types/map';

interface FencesOverlayProps {
  fences: GeoFence[];
  onClose: () => void;
  onAddFenceClick: () => void;
  deleteFence: (id: string) => void
}

const FencesOverlay: React.FC<FencesOverlayProps> = ({ fences, onClose, onAddFenceClick, deleteFence }) => {


  return (
    <div className="absolute bottom-16 left-0 right-0 bg-white p-4 shadow-lg rounded-t-lg z-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Fences</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <Icon name='close' size={'25px'} />
        </button>
      </div>

      <button
        onClick={onAddFenceClick}
        className="bg-teal-500 text-white px-4 py-2 rounded-md mb-4 w-full flex items-center justify-center space-x-2"
      >
        <span>Add Fence</span>
        <Icon name='plus' size={'20px'} />
      </button>

      {fences.length === 0 ? (
        <p className="text-gray-600 text-center">No fences added yet.</p>
      ) : (
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {fences.map(fence => (
            <div key={fence._id} className="border border-gray-200 p-3 rounded-md flex justify-between items-center">
              <div className='flex flex-row justify-center items-center gap-2'>
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: fence.color }}
                  title={`Color: ${fence.color}`}
                ></div>
                <h3 className="font-semibold text-lg">{fence.name}</h3>
                {/* <p className="text-sm text-gray-600">Points: {fence.paths.length}</p> */}
              </div>

              <button
                className="rounded-full"
                onClick={() => deleteFence(fence._id)}
              >
                <Icon name='delete' color='red' size={30} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FencesOverlay;