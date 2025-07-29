// components/CustomUserMarker.tsx
import React from 'react';
import { OverlayView, OverlayViewFadingTransition } from '@react-google-maps/api';

interface CustomUserMarkerProps {
  position: google.maps.LatLngLiteral;
  userName: string;
  userImage?: string; // Optional user image URL
  isCurrentUser?: boolean; // To differentiate styling for current user if needed
}

const CustomUserMarker: React.FC<CustomUserMarkerProps> = ({ position, userName, userImage, isCurrentUser }) => {
  // Adjusted getPixelPositionOffset to center the entire div
  const getPixelPositionOffset = (width: number, height: number) => ({
    x: -(width / 2),
    y: -(height / 2), // Center vertically as well
  });

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} // Or OVERLAY_LAYER
      getPixelPositionOffset={getPixelPositionOffset}
    >
      {/* Remove the isCurrentUser bg-color here as it will be applied to the inner circle/square */}
      <div className={`flex flex-col items-center justify-center p-1 rounded-lg shadow-md text-white`} style={{
          transform: 'translate(-50%, -50%)',
      }}>
        {userImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={userImage}
            alt={userName}
            className="w-10 h-10 rounded-full border-2 border-white object-cover"
            // Adding a background color to the image if needed, for instance if image fails to load
            style={{ backgroundColor: isCurrentUser ? '#3B82F6' : '#22C55E' }} // blue-500 or green-500
          />
        ) : (
          <div className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-lg`}
               style={{ backgroundColor: isCurrentUser ? '#3B82F6' : '#22C55E' }}> {/* blue-500 or green-500 */}
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="mt-1 px-2 py-0.5 text-xs font-semibold whitespace-nowrap rounded-md bg-gray-800/70 text-white">
          {isCurrentUser ? "You" : userName}
        </span>
      </div>
    </OverlayView>
  );
};

export default CustomUserMarker;