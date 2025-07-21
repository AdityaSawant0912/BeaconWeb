// hooks/useMapState.ts
import { useState, useCallback } from 'react';
import useNativeWebBridge from './useNativeWebBridge'; // Assuming this path for the native bridge hook
import isInWebView from "@/utils/isInWebView"; // Assuming this path for webview utility
import { LatLngLiteral, FunctionMapArgs, FunctionMap } from '@/types/map'; // Import types
import { useGeoFenceApi } from './useGeoFenceApi'; // Import the new GeoFence API hook

/**
 * A custom React hook that encapsulates all map-related state and logic for the Home component.
 * This includes map center, active overlays, drawing polygon paths, marker options,
 * and interactions with native bridge and geo-fence API.
 * @returns An object containing various state variables and handler functions for the map.
 */
export function useMapState() {
    const [center, setCenter] = useState<LatLngLiteral>({ lat: 0, lng: 0 });
    const [activeOverlay, setActiveOverlay] = useState<string>('');
    const [drawingPolygonPaths, setDrawingPolygonPaths] = useState<LatLngLiteral[]>([]);
    const [defaultMarkerIconOptions, setDefaultMarkerIconOptions] = useState<google.maps.MarkerOptions['icon'] | undefined>(undefined);

    // Use the new custom hook for GeoFence API interactions
    const { fences, addFence: addFenceApi } = useGeoFenceApi();

    // Callback for logging messages from the native bridge
    const logMessage = useCallback(({ message }: FunctionMapArgs) => {
        console.log("Native Message:", message);
    }, []);

    // Callback for reporting errors from the native bridge
    const reportNativeError = useCallback(({ regarding, error }: FunctionMapArgs) => {
        // In a production app, consider using a more user-friendly notification system (e.g., toast, modal)
        // instead of alert for better UX.
        console.error(`Error raised regarding : ${regarding} > \n ${error}`);
    }, []);

    // Callback to set the map's center location
    const setLocation = useCallback((location: FunctionMapArgs) => {
        setCenter(location as LatLngLiteral);
    }, []);

    // Map of functions exposed to the native web bridge
    const functionMap: FunctionMap = {
        logMessage,
        setLocation,
        reportNativeError
    };
    const { callBridgeFunction } = useNativeWebBridge(functionMap);

    /**
     * Callback executed when the Google Map component loads.
     * Initializes default marker icon options and attempts to get the user's current location.
     */
    const mapOnLoad = useCallback(() => {
        setDefaultMarkerIconOptions({
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: "blue",
            strokeColor: "blue",
            fillOpacity: 1,
        });

        // Check if running inside a WebView to use native bridge for location
        if (isInWebView()) {
            callBridgeFunction('getLocation', {});
        } else {
            // Fallback for web browser: use Geolocation API
            navigator.geolocation.getCurrentPosition((pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            }, (e) => {
                console.error("Geolocation error:", e);
            }, {
                enableHighAccuracy: true, // Request high accuracy location
            });
        }
    }, [callBridgeFunction, setLocation]); // Dependencies for useCallback

    /**
     * Callback executed when the map is clicked.
     * Adds points to the drawing polygon if in 'addFence' mode, otherwise updates the center marker.
     * @param e - The Google Maps MapMouseEvent object.
     */
    const mapOnClick = useCallback((e: google.maps.MapMouseEvent) => {
        const lat = e.latLng?.lat();
        const lng = e.latLng?.lng();

        if (lat !== undefined && lng !== undefined) {
            const clickedLocation = { lat, lng };

            if (activeOverlay === 'addFence') {
                // If in addFence mode, add the clicked point to the drawing polygon
                setDrawingPolygonPaths(prevPaths => [...prevPaths, clickedLocation]);
            } else {
                // Existing behavior for general map clicks (updates center marker)
                setLocation(clickedLocation);
            }
        }
    }, [activeOverlay, setLocation]); // Dependencies for useCallback

    /**
     * Toggles the active overlay state.
     * Clears drawing paths if transitioning away from 'addFence' mode.
     * @param overlayName - The name of the overlay to toggle.
     */
    const handleOverlayToggle = useCallback((overlayName: string) => {
        setActiveOverlay(prevOverlay => {
            // If we are moving away from 'addFence', clear the temporary drawing paths
            if (prevOverlay === 'addFence' && overlayName !== 'addFence') {
                setDrawingPolygonPaths([]); // Clear drawing paths
            }
            return prevOverlay === overlayName ? '' : overlayName; // Toggle logic
        });
    }, []); // No dependencies as it uses state setter directly

    /**
     * Adds a new fence by calling the useGeoFenceApi hook's addFence function.
     * Resets drawing paths and navigates to the fences overlay upon successful addition.
     * @param name - The name of the fence.
     * @param paths - The polygon paths for the fence.
     * @param color - The color of the fence.
     */
    const addFence = useCallback(async (name: string, paths: LatLngLiteral[], color: string) => {
        const newFence = await addFenceApi(name, paths, color); // Call the API hook's addFence
        if (newFence) {
            setActiveOverlay('fences'); // Go back to the fences list after adding
            setDrawingPolygonPaths([]); // Clear drawing paths after saving
        }
    }, [addFenceApi]); // Dependency on addFenceApi from useGeoFenceApi

    /**
     * Removes the last point from the currently drawing polygon paths.
     */
    const removeLastDrawingPoint = useCallback(() => {
        setDrawingPolygonPaths(prevPaths => prevPaths.slice(0, -1));
    }, []); // No dependencies as it uses state setter directly

    return {
        center,
        activeOverlay,
        fences, // Fences are managed by useGeoFenceApi and exposed here
        drawingPolygonPaths,
        defaultMarkerIconOptions,
        // Functions to update state or trigger actions
        setLocation, // Exposed for external use if needed (e.g., by native bridge)
        setActiveOverlay,
        setDrawingPolygonPaths,
        mapOnLoad,
        mapOnClick,
        handleOverlayToggle,
        addFence, // The combined addFence function
        removeLastDrawingPoint,
    };
}

