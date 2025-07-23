// components/overlays/BeaconHubOverlay.tsx (formerly DetailsOverlay.tsx)

"use client";

import React, { useState, useEffect } from 'react';
import { useOverlayManager } from '@/context/OverlayContext';
import { useSharePermissions } from '@/hooks/useSharePermissions';
import { useNativeBridge } from '@/context/NativeBridgeContext'; // For setLocation
import { ExclusiveOverlays } from '@/types/enums'; // For RequestLocation overlay trigger
import { LatLngLiteral } from '@/types/map'; // For location type
import Icon from '@/components/Icon'; // For action icons
import { OverlayType } from '@/types/enums';

interface BeaconHubOverlayProps {
  onClose: () => void;
  initialTab?: 'incoming' | 'outgoing' | 'pending';
  highlightUserId?: string; // User ID to highlight in the list
}

const BeaconHubOverlay: React.FC<BeaconHubOverlayProps> = ({ onClose, initialTab, highlightUserId }) => {
  const { setActiveOverlay } = useOverlayManager();
  const { setLocation } = useNativeBridge(); // Use setLocation for map centering
  const {
    incomingLocations,
    outgoingLocations,
    pendingRequests,
    isLoadingPermissions,
    errorPermissions,
    acceptRequest,
    declineRequest,
    stopSharing,
  } = useSharePermissions();

  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'pending'>(initialTab || 'incoming');

  // Effect to set initial tab and scroll to highlighted user
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
    if (highlightUserId) {
      // Logic to scroll to the highlighted user (requires refs, more advanced UI)
      // For now, just ensuring the correct tab is active.
      // You'd typically need a ref for the list item and scrollIntoView()
      console.log(`Attempting to highlight user ${highlightUserId} in ${initialTab || 'incoming'} tab.`);
    }
  }, [initialTab, highlightUserId]);

  const handleCenterMap = (location: LatLngLiteral) => {
    setLocation(location);
    onClose(); // Close the Beacon Hub after centering the map
  };

  const handleOpenRequestLocation = () => {
    setActiveOverlay(ExclusiveOverlays.ADD_PERMISSION, OverlayType.EXCLUSIVE, true);
  };

  if (isLoadingPermissions) return <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-20">Loading Connections...</div>;
  if (errorPermissions) return <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-20 text-red-600">{errorPermissions}</div>;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white p-4 shadow-lg rounded-t-lg z-20 h-2/3 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Beacon Hub</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <Icon name='close' size={'25px'} />
        </button>
      </div>

      {/* Top section: Current User Avatar & Request Location Button (Simplified for BeaconHub) */}
      <div className="flex justify-end items-center mb-4"> {/* Align to right */}
        <button
          onClick={handleOpenRequestLocation}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <span>+ Request Location</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`flex-1 py-2 text-center ${activeTab === 'incoming' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
          onClick={() => setActiveTab('incoming')}
        >
          Incoming Beacons ({incomingLocations.length})
        </button>
        <button
          className={`flex-1 py-2 text-center ${activeTab === 'outgoing' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
          onClick={() => setActiveTab('outgoing')}
        >
          Outgoing Beacons ({outgoingLocations.length})
        </button>
        <button
          className={`flex-1 py-2 text-center ${activeTab === 'pending' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests ({pendingRequests.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-grow overflow-y-auto">
        {activeTab === 'incoming' && (
          <div>
            {incomingLocations.length === 0 ? (
              <p className="text-gray-600 text-center mt-4">No one is sharing with you.</p>
            ) : (
              <ul className="space-y-3">
                {incomingLocations.map(user => (
                  <li key={user._id} className={`flex items-center justify-between p-2 border rounded-md ${highlightUserId === user._id ? 'bg-yellow-100 border-yellow-500' : 'border-gray-200'}`}>
                    <div className="flex items-center space-x-3">
                      <img src={user.image || '/path/to/default-user.png'} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      <span>{user.name}</span>
                    </div>
                    <div className="flex space-x-2">
                        {user.currentLocation && (
                        <button
                            onClick={() => handleCenterMap(user.currentLocation as LatLngLiteral)}
                            className="p-1 bg-green-500 text-white rounded-full text-xs hover:bg-green-600"
                            title="Center Map"
                        >
                            <Icon name="map" size="16px" />
                        </button>
                        )}
                        {/* Add more options like "Stop Viewing" if needed */}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {activeTab === 'outgoing' && (
          <div>
            {outgoingLocations.length === 0 ? (
              <p className="text-gray-600 text-center mt-4">You are not sharing with anyone.</p>
            ) : (
              <ul className="space-y-3">
                {outgoingLocations.map(share => (
                  <li key={share._id} className="flex items-center justify-between p-2 border rounded-md border-gray-200">
                    <div className="flex items-center space-x-3">
                      <img src={share.viewer.image || '/path/to/default-user.png'} alt={share.viewer.name} className="w-8 h-8 rounded-full object-cover" />
                      <span>{share.viewer.name}</span>
                    </div>
                    <button
                      onClick={() => stopSharing(share._id)}
                      className="p-1 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      title="Stop Sharing"
                    >
                      <Icon name="pause" size="16px" /> {/* Assuming 'pause' or 'stop' icon */}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {activeTab === 'pending' && (
          <div>
            {pendingRequests.length === 0 ? (
              <p className="text-gray-600 text-center mt-4">No pending requests.</p>
            ) : (
              <ul className="space-y-3">
                {pendingRequests.map(request => (
                  <li key={request._id} className="flex items-center justify-between p-2 border rounded-md border-gray-200">
                    <div className="flex items-center space-x-3">
                      <img src={request.requester.image || '/path/to/default-user.png'} alt={request.requester.name} className="w-8 h-8 rounded-full object-cover" />
                      <span>{request.requester.name}</span>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => acceptRequest(request._id)}
                        className="p-1 bg-green-500 text-white rounded-full text-xs hover:bg-green-600"
                        title="Accept"
                      >
                        <Icon name="check" size="16px" />
                      </button>
                      <button
                        onClick={() => declineRequest(request._id)}
                        className="p-1 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                        title="Decline"
                      >
                        <Icon name="close" size="16px" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BeaconHubOverlay;