// components/UserLocationAvatars.tsx (formerly ShareOverlay.js)

"use client";

import React, { useState, useCallback } from 'react';
import Icon from "@/components/Icon"; // Assuming your Icon component

import { useSession } from "next-auth/react"; // For current user
import { useNativeBridge } from '@/context/NativeBridgeContext'; // For centering map
import { useOverlayManager } from '@/context/OverlayContext'; // For opening overlays
import { useSharePermissions } from '@/hooks/useSharePermissions'; // For incomingLocations data

import { ExclusiveOverlays } from "@/types/enums"; // For overlay names
import { LatLngLiteral } from '@/types/map'; // Assuming SharedUser type is available (or define it)
import { OverlayType } from '@/types/enums';

interface UserLocationAvatarsProps {
    // Callback to open BeaconHubOverlay with potential highlight
    onOpenBeaconHub: (userId?: string, tab?: 'incoming' | 'outgoing' | 'pending') => void;
}

const UserLocationAvatars: React.FC<UserLocationAvatarsProps> = ({ onOpenBeaconHub }) => {
    const { data: session } = useSession();
    const { setLocation } = useNativeBridge(); // To center map
    const { setActiveOverlay, toggleOverlay } = useOverlayManager(); // To activate overlays
    const { incomingLocations, isLoadingPermissions, errorPermissions, fetchPermissions } = useSharePermissions(); // Get incoming locations

    const [activeUserPanelId, setActiveUserPanelId] = useState<string | null>(null); // To control action buttons for a specific user

    // Re-fetch permissions if session changes or other triggers (optional, already done by useSharePermissions useEffect)
    // useEffect(() => {
    //   if (session?.user?.id) {
    //     fetchPermissions();
    //   }
    // }, [session?.user?.id, fetchPermissions]);


    const handleAvatarClick = useCallback((userId: string, userLocation?: LatLngLiteral) => {
        // Toggle the action buttons for this user
        setActiveUserPanelId(prevId => (prevId === userId ? null : userId));

        // Auto-center map if a location is available and it's the current active user
        // if (userLocation && activeUserPanelId !== userId) { // If panel opens or changes, center map
        //     setLocation(userLocation);
        // }
    }, [activeUserPanelId, setLocation]);

    const handleCenterMapClicked = useCallback((location: LatLngLiteral) => {
        setLocation(location);
        setActiveUserPanelId(null); // Hide action buttons after action
    }, [setLocation]);

    const handleOpenBeaconHubClicked = useCallback((userId: string) => {
        onOpenBeaconHub(userId, 'incoming'); // Pass userId and set initial tab to 'incoming'
        setActiveUserPanelId(null); // Hide action buttons after action
    }, [onOpenBeaconHub]);

    const handleRequestLocationClicked = useCallback(() => {
        setActiveUserPanelId(null); // Hide any open action panels
        setActiveOverlay(ExclusiveOverlays.ADD_PERMISSION, OverlayType.EXCLUSIVE, true);
    }, [setActiveOverlay]);

    const _currentUsersLocation = useNativeBridge().center

    if (!session) {
        return null; // Don't render if no session
    }

    // Combine current user with incoming for display in the stack
    const usersToDisplay = [
        ...(session.user ? [{
            _id: session.user.id || 'current_user',
            name: session.user.name || 'You',
            image: session.user.image || '',
            currentLocation: _currentUsersLocation// Current user's location from native bridge
        }] : []), // Add current user first
        ...(incomingLocations || []) // Add users sharing with you
    ];

    return (
        // Positioning and styling for the top-left floating group
        <div className={`absolute top-16 p-1.5 bg-white/30 backdrop-blur-sm shadow-xl z-20 left-4 rounded-2xl flex flex-col gap-1.5`}>
            {usersToDisplay.map(user => (
                <div key={user._id} className="relative flex items-center">
                    {/* User Avatar Button (ShareButton equivalent) */}
                    <button
                        className={`w-10 h-10 rounded-full border-2 ${activeUserPanelId === user._id ? 'border-blue-500' : (user._id === 'current_user' ? 'border-green-500' : 'border-red-500')} overflow-hidden shadow-md flex items-center justify-center bg-gray-200`}
                        title={user.name}
                        onClick={() => handleAvatarClick(user._id, user.currentLocation)}
                    >
                        {user.image ? (
                            <img src={user.image} alt={user.name} width={40} height={40} className="rounded-full object-cover" />
                        ) : (
                            <span className="text-xs text-gray-500">{user.name.charAt(0)}</span>
                        )}
                    </button>

                    {/* Action Buttons (slide out to the right) */}
                    {activeUserPanelId === user._id && (
                        <div className="absolute left-full ml-2 flex space-x-2 bg-white/50 backdrop-blur-sm p-1 rounded-full shadow-md transition-all duration-300 ease-in-out">
                            {user.currentLocation && (
                                <button
                                    onClick={() => handleCenterMapClicked(user.currentLocation!)}
                                    className="p-2 bg-blue-500 text-white rounded-full text-xs shadow-md hover:bg-blue-600 transition-colors"
                                    title="Center Map"
                                >
                                    <Icon name="map" size="16px" /> {/* Assuming 'map' icon exists */}
                                </button>
                            )}
                            {user._id !== 'current_user' && ( // Don't show Beacon Hub icon for self-avatar if it's redundant
                                <button
                                    onClick={() => handleOpenBeaconHubClicked(user._id)}
                                    className="p-2 bg-purple-500 text-white rounded-full text-xs shadow-md hover:bg-purple-600 transition-colors"
                                    title="Open Beacon Hub"
                                >
                                    <Icon name="cog" size="16px" /> {/* Assuming 'users' or 'hub' icon exists */}
                                </button>
                            )}
                            {/* Add more specific actions if needed */}
                        </div>
                    )}
                </div>
            ))}

            {/* The floating Plus button to request location */}
            <button
                onClick={handleRequestLocationClicked}
                className="w-10 h-10 rounded-full bg-gray-900/30 text-white shadow-md flex items-center justify-center text-3xl"
                title="Request Location from new user"
            >
                <Icon name="plus" size={'20px'} />
            </button>
        </div>
    );
};

export default UserLocationAvatars;