// components/bottomNavigation.tsx

import React from 'react';
import { useOverlayManager } from '@/context/OverlayContext'; // Import OverlayType
import { ExclusiveOverlays, OverlayType } from '@/types/enums';

const BottomNavigation: React.FC = () => {
  const { isOverlayActive, toggleOverlay } = useOverlayManager();

  return (
    <nav className='bg-gray-800 text-white flex justify-around items-center h-full'>
      <button
        onClick={() => toggleOverlay(ExclusiveOverlays.FENCES, OverlayType.EXCLUSIVE)} // Toggle ExclusiveOverlays.FENCES as an exclusive overlay
        className={`px-4 py-2 rounded ${isOverlayActive(ExclusiveOverlays.FENCES) ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
      >
        Fences
      </button>
      <button
        onClick={() => toggleOverlay(ExclusiveOverlays.BEACON_HUB, OverlayType.EXCLUSIVE)} // Toggle ExclusiveOverlays.BEACON_HUB as an exclusive overlay
        className={`px-4 py-2 rounded ${isOverlayActive(ExclusiveOverlays.BEACON_HUB) ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
      >
        Beacon Hub
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