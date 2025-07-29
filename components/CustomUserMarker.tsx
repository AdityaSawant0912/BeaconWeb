// components/CustomUserMarker.tsx
import React from 'react';
import { OverlayView } from '@react-google-maps/api';

interface CustomUserMarkerProps {
    position: google.maps.LatLngLiteral;
    userName: string;
    userImage?: string; // Optional user image URL
    isCurrentUser?: boolean; // To differentiate styling for current user if needed
}

const CustomUserMarker: React.FC<CustomUserMarkerProps> = ({ position, userName, userImage, isCurrentUser }) => {
    const getPixelPositionOffset = (width: number, height: number) => ({
        x: -(width / 2),
        y: -height, // Position the marker "above" the coordinates
    });

    return (
        <OverlayView
            position={position}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} // Or OVERLAY_LAYER
            getPixelPositionOffset={getPixelPositionOffset}
        >
            <div className={`flex flex-col items-center justify-center p-1 rounded-lg shadow-md  text-white`}>
                {userImage && (
                    // Replace with your actual Image component or img tag
                    // For simplicity, using a plain img tag here.
                    // If using next/image, import it and use accordingly.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={userImage}
                        alt={userName}
                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                )}
                {!userImage && (
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-gray-700 font-bold text-lg">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                )}
                <span className="mt-1 px-2 py-0.5 text-xs font-semibold whitespace-nowrap rounded-md bg-gray-800/70 bg-opacity-60 text-white">
                    {isCurrentUser ? "You" : userName}
                </span>
            </div>
        </OverlayView>
    );
};

export default CustomUserMarker;