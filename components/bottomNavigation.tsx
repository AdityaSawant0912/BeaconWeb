// components/bottomNavigation.tsx

import React from 'react';
import { useOverlayManager } from '@/context/OverlayContext'; // Import OverlayType
import { ExclusiveOverlays, OverlayType } from '@/types/enums';

const BottomNavigation: React.FC = () => {
  const { isOverlayActive, toggleOverlay } = useOverlayManager();

  return (
    <nav className='bg-gray-800 text-white flex justify-around items-center h-full'>
      <button
        onClick={() => toggleOverlay(ExclusiveOverlays.DETAILS, OverlayType.EXCLUSIVE)} // Toggle ExclusiveOverlays.DETAILS as an exclusive overlay
        className={`px-4 py-2 rounded ${isOverlayActive(ExclusiveOverlays.DETAILS) ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
      >
        Details
      </button>
      <button
        onClick={() => toggleOverlay(ExclusiveOverlays.FENCES, OverlayType.EXCLUSIVE)} // Toggle ExclusiveOverlays.FENCES as an exclusive overlay
        className={`px-4 py-2 rounded ${isOverlayActive(ExclusiveOverlays.FENCES) ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
      >
        Fences
      </button>
      <button
        onClick={() => toggleOverlay(ExclusiveOverlays.SETTINGS, OverlayType.EXCLUSIVE)} // Toggle ExclusiveOverlays.SETTINGS as an exclusive overlay
        className={`px-4 py-2 rounded ${isOverlayActive(ExclusiveOverlays.SETTINGS) ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
      >
        Settings
      </button>
    </nav>
  );
};

export default BottomNavigation;