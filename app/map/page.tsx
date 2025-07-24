// pages/index.tsx (or app/page.tsx)

"use client";

import React, { useCallback, useState, useEffect } from 'react';

// --- General UI Components ---
import BottomNavigation from '@/components/bottomNavigation';
import DetailsOverlay from '@/components/overlays/DetailsOverlay';
import FencesOverlay from '@/components/overlays/FencesOverlay';
import AddFenceOverlay from '@/components/overlays/AddFenceOverlay';
import UserLocationAvatars from '@/components/overlays/UserLocationAvatars';
import BeaconHubOverlay from '@/components/overlays/BeaconHubOverlay';
import RequestLocationOverlay from '@/components/overlays/RequestLocationOverlay';

// --- Map-related Components & Utilities ---
import MapDisplay from '@/components/MapDisplay';
import { Polygon, Marker } from '@react-google-maps/api';
import { calculatePolygonCentroid } from '@/utils/mapUtils';

// --- Contexts & Hooks ---
import { useOverlayManager } from '@/context/OverlayContext';
import { MapProvider } from '@/providers/MapProvider';
import { useGeoFenceApi } from '@/hooks/useGeoFenceApi';

// NEW: Import useNativeBridge hook
import { useNativeBridge } from '@/context/NativeBridgeContext'; // Assuming this hook exists in your context file

// --- Types & Enums ---
import { LatLngLiteral } from '@/types/map';
import { DefaultOverlays, ExclusiveOverlays, OverlayType } from '@/types/enums';
import { NativeArgs } from '@/types/bridge';
import { useSession } from 'next-auth/react';

export default function Home() {
  // --- Consume Contexts ---
  const { isOverlayActive, setActiveOverlay } = useOverlayManager();
  const { fences, addFence, drawingPolygonPaths, addDrawingPoint, removeLastDrawingPoint, removeDrawingPoints, deleteFence } = useGeoFenceApi();
  const { data: session, status } = useSession();
  // NEW: Consume NativeBridgeContext to access native communication functions
  const {
    center, // Current map center from native (can be ignored if MapDisplay handles its own center)
    logMessage: logMessageToNative,
    callBridgeFunction,
  } = useNativeBridge();

  // State to pass to BeaconHubOverlay for highlighting
  const [highlightedBeaconUserId, setHighlightedBeaconUserId] = useState<string | undefined>(undefined);
  const [initialBeaconHubTab, setInitialBeaconHubTab] = useState<'incoming' | 'outgoing' | 'pending' | undefined>(undefined);

  // --- Example State for Location Sharing Control ---
  const [isLocationSharingActive, setIsLocationSharingActive] = useState(false);
  const [locationPingInterval, setLocationPingInterval] = useState<number>(30); // Default 30 mins

  // Callback to open BeaconHubOverlay and set highlight/tab
  const openBeaconHub = useCallback((userId?: string, tab: 'incoming' | 'outgoing' | 'pending' = 'incoming') => {
    setHighlightedBeaconUserId(userId);
    setInitialBeaconHubTab(tab);
    setActiveOverlay(ExclusiveOverlays.BEACON_HUB, OverlayType.EXCLUSIVE, true);
  }, [setActiveOverlay]);

  // --- Callbacks for Overlay Interactions ---
  const handleAddFenceAndOverlayUpdate = useCallback(async (name: string, paths: LatLngLiteral[], color: string) => {
    await addFence(name, paths, color);
    setActiveOverlay(ExclusiveOverlays.FENCES, OverlayType.EXCLUSIVE, true);
  }, [addFence, setActiveOverlay]);

  // --- Determine Overlay Modes for MapProvider and UI Rendering ---
  const isAddFenceMode = isOverlayActive(ExclusiveOverlays.ADD_FENCE);

  // --- NEW: Handlers for Native Bridge Functions ---

  // Example handler for saving auth tokens (would typically be called from a login component)
  const handleLoginSuccess = useCallback((authToken: string, refreshToken?: string) => {
    // This function would be called by your login flow in the web app
    callBridgeFunction('saveAuthToken', { authToken, refreshToken } as NativeArgs)
    logMessageToNative("Web app successfully sent auth tokens to native.");
    // You might then proceed to hide login UI, show main map, etc.
  }, [callBridgeFunction, logMessageToNative]);

  // Handler for toggling background location sharing
  const handleToggleLocationSharing = useCallback(() => {
    if (isLocationSharingActive) {
      // Pause sharing
      callBridgeFunction('controlLocationSharing', { status: 'paused', interval: locationPingInterval } as NativeArgs)
      setIsLocationSharingActive(false);
      logMessageToNative("Web app requested native to pause location sharing.");
    } else {
      // Resume sharing
      callBridgeFunction('controlLocationSharing', { status: 'resumed', interval: locationPingInterval } as NativeArgs)
      setIsLocationSharingActive(true);
      logMessageToNative(`Web app requested native to resume location sharing at ${locationPingInterval} min intervals.`);
    }
  }, [isLocationSharingActive, callBridgeFunction, locationPingInterval, logMessageToNative]);

  // Handler for changing the ping interval
  const handleChangeInterval = useCallback((newInterval: number) => {
    setLocationPingInterval(newInterval);
    if (isLocationSharingActive) {
      // If already active, update with new interval immediately
      callBridgeFunction('controlLocationSharing', { status: 'resumed', interval: newInterval } as NativeArgs)
      logMessageToNative(`Web app requested native to update location sharing interval to ${newInterval} mins.`);
    }
  }, [isLocationSharingActive, callBridgeFunction, logMessageToNative]);

  // Handler for requesting current location (e.g., for a "Find Me" button)
  const handleGetMyCurrentLocation = useCallback(() => {
    callBridgeFunction('getLocation', {} as NativeArgs)
    logMessageToNative("Web app requested native for current foreground location.");
  }, [callBridgeFunction, logMessageToNative]);

  useEffect(() => {
    console.log(session);

    // callBridgeFunction('saveAuthToken', {authToken, refreshToken} as NativeArgs)
  })

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      console.log("Session authenticated, sending access token to native.");
      // Ensure you pass the accessToken and optionally refreshToken if you decide to include it later
      callBridgeFunction('saveAuthToken', {authToken: session.accessToken, refreshToken: ''} as NativeArgs)
      logMessageToNative("Web app successfully sent access token to native.");
    } else if (status === 'unauthenticated') {
      console.log("Session unauthenticated, no tokens to send or potentially clear.");
      // Optional: Call saveAuthToken("", "") to clear tokens on native if user logs out
    }
  }, [session, status, logMessageToNative, callBridgeFunction]);

  return (
    <div className='flex flex-col h-screen w-screen relative'>
      <div className='flex-grow'>
        <MapProvider
          isAddFenceOverlayActive={isAddFenceMode}
          onMapClickForDrawing={addDrawingPoint}
        >
          <MapDisplay>
            {/* Render existing fences (polygons and their labels) */}
            {fences.map(fence => {
              const centroid = calculatePolygonCentroid(fence.paths);
              return (
                <React.Fragment key={fence._id}>
                  <Polygon
                    paths={fence.paths}
                    options={{
                      strokeColor: fence.color,
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                      fillColor: fence.color,
                      fillOpacity: 0.35,
                      geodesic: true,
                    }}
                  />
                  <Marker
                    position={centroid}
                    label={{
                      text: fence.name,
                      color: 'black',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}
                    options={{
                      icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 0,
                      },
                      clickable: false,
                      draggable: false,
                    }}
                  />
                </React.Fragment>
              );
            })}

            {/* Render the polygon currently being drawn and its point markers,
                            only when in 'addFence' mode and points exist */}
            {isAddFenceMode && drawingPolygonPaths.length > 0 && (
              <>
                <Polygon
                  paths={drawingPolygonPaths}
                  options={{
                    strokeColor: '#0000FF',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#0000FF',
                    fillOpacity: 0.2,
                    geodesic: true,
                  }}
                />
                {drawingPolygonPaths.map((point, index) => (
                  <Marker
                    key={`drawing-point-${index}`}
                    position={point}
                    options={{
                      icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#0000FF',
                        fillOpacity: 1,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 1,
                      },
                      label: {
                        text: `${index + 1}`,
                        color: 'white',
                        fontSize: '10px'
                      }
                    }}
                  />
                ))}
              </>
            )}
          </MapDisplay>
        </MapProvider>
      </div>

      {/* --- Overlay UI - Conditionally Rendered based on OverlayContext --- */}
      {isOverlayActive(DefaultOverlays.SHARE) && (
        <UserLocationAvatars onOpenBeaconHub={openBeaconHub} />
      )}

      {isOverlayActive(ExclusiveOverlays.BEACON_HUB) && (
        <BeaconHubOverlay
          onClose={() => setActiveOverlay(ExclusiveOverlays.BEACON_HUB, OverlayType.EXCLUSIVE, false)}
          initialTab={initialBeaconHubTab}
          highlightUserId={highlightedBeaconUserId}
        />
      )}

      {isOverlayActive(ExclusiveOverlays.DETAILS) && (
        <DetailsOverlay onClose={() => setActiveOverlay(ExclusiveOverlays.DETAILS, OverlayType.EXCLUSIVE, false)} />
      )}
      {isOverlayActive(ExclusiveOverlays.FENCES) && (
        <FencesOverlay
          fences={fences}
          onClose={() => setActiveOverlay(ExclusiveOverlays.FENCES, OverlayType.EXCLUSIVE, false)}
          onAddFenceClick={() => setActiveOverlay(ExclusiveOverlays.ADD_FENCE, OverlayType.EXCLUSIVE, true)}
          deleteFence={deleteFence}
        />
      )}
      {isOverlayActive(ExclusiveOverlays.ADD_FENCE) && (
        <AddFenceOverlay
          onClose={() => {
            setActiveOverlay(ExclusiveOverlays.ADD_FENCE, OverlayType.EXCLUSIVE, false);
            removeDrawingPoints();
          }}
          onSave={handleAddFenceAndOverlayUpdate}
          drawingPaths={drawingPolygonPaths}
          onRemoveLastPoint={removeLastDrawingPoint}
        />
      )}

      {isOverlayActive(ExclusiveOverlays.ADD_PERMISSION) && (
        <RequestLocationOverlay
          onClose={() => setActiveOverlay(ExclusiveOverlays.ADD_PERMISSION, OverlayType.EXCLUSIVE, false)}
        />
      )}

      {/* NEW: Placeholder UI for testing Native Bridge Functions */}
      <div className="absolute top-45 left-4 bg-white p-2 rounded shadow-md z-50">
        <h3 className="font-bold mb-2">Native Controls (Web)</h3>
        <button
          onClick={() => handleLoginSuccess("your_mock_auth_token_123", "your_mock_refresh_token_xyz")}
          className="bg-blue-500 text-white px-3 py-1 rounded mb-2 mr-2"
        >
          Mock Login (Send Auth)
        </button>
        <button
          onClick={handleGetMyCurrentLocation}
          className="bg-purple-500 text-white px-3 py-1 rounded mb-2"
        >
          Get My Current Location
        </button>
        <div className="flex items-center mb-2">
          <button
            onClick={handleToggleLocationSharing}
            className={`px-3 py-1 rounded ${isLocationSharingActive ? 'bg-red-500' : 'bg-green-500'} text-white mr-2`}
          >
            {isLocationSharingActive ? 'Pause Sharing' : 'Start Sharing'}
          </button>
          <input
            type="number"
            value={locationPingInterval}
            onChange={(e) => handleChangeInterval(parseInt(e.target.value) || 10)}
            min="10"
            max="60"
            step="10"
            className="w-20 border rounded px-2 py-1 text-center"
          />
          <span className="ml-2 text-sm">min interval</span>
        </div>
        <p className="text-xs">Sharing Status: {isLocationSharingActive ? 'Active' : 'Paused'}</p>
        <p className="text-xs">Current Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}</p>
      </div>


      <div className='flex-none h-16'>
        <BottomNavigation />
      </div>
    </div>
  );
}