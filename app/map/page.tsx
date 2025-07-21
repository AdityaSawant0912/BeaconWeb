"use client"
import { useState, useCallback, useEffect } from 'react'; // Import useCallback
import useNativeWebBridge from '@/hooks/useNativeWebBridge';
import Map from '@/components/Map';
import { Marker, Polygon } from '@react-google-maps/api'; // Import Polygon
import isInWebView from "@/utils/isInWebView";
import BottomNavigation from '@/components/bottomNavigation';
import DetailsOverlay from '@/components/overlays/DetailsOverlay';
import FencesOverlay from '@/components/overlays/FencesOverlay';
import AddFenceOverlay from '@/components/overlays/AddFenceOverlay';
import React from 'react';
import { calculatePolygonCentroid } from '@/utils/mapUtils';

export const defaultMapContainerStyle = {
  width: '100%',
  height: '80vh',
  borderRadius: '15px 0px 0px 15px',
};



export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [message, setMessage] = useState("waiting ..");
  const [center, _setCenter] = useState<LatLngLiteral>({ lat: 0, lng: 0 }); // Use LatLngLiteral
  const [activeOverlay, setActiveOverlay] = useState<string>('');
  const [fences, setFences] = useState<GeoFence[]>([]);
  // New: State to hold the points for the polygon currently being drawn
  const [drawingPolygonPaths, setDrawingPolygonPaths] = useState<LatLngLiteral[]>([]);
  const [defaultMarkerIconOptions, setDefaultMarkerIconOptions] = useState<google.maps.MarkerOptions['icon'] | undefined>(undefined);

  const logMessage = useCallback(({ message }: FunctionMapArgs) => {
    setMessage(message)
  }, []);

  const reportNativeError = useCallback(({ regarding, error }: FunctionMapArgs) => {
    alert(`Error raised regarding : ${regarding} > \n ${error}`)
  }, []);

  const setLocation = useCallback(({ lat, lng }: FunctionMapArgs) => {
    _setCenter({ lat, lng })
  }, []);

  const functionMap: FunctionMap = {
    logMessage,
    setLocation,
    reportNativeError
  }
  const { callBridgeFunction } = useNativeWebBridge(functionMap)

  useEffect(() => {
    fetch("/api/fence", {
      method: "GET",
    }).then((data) => {
      return data.json()
    }).then((res) => {
      console.log(res);
      if (res.fences) {
        setFences(res.fences)
      }
    })
    return () => {

    };
  }, []);

  const mapOnLoad = useCallback(() => {
    setDefaultMarkerIconOptions({
      path: google.maps.SymbolPath.CIRCLE,
      scale: 5,
      fillColor: "blue",
      strokeColor: "blue",
      fillOpacity: 1,
    });
    if (isInWebView()) {
      callBridgeFunction('getLocation', {})
    } else {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      }, (e) => { console.log(e) }, {
        enableHighAccuracy: true,
      })
    }
  }, [callBridgeFunction, setLocation]);

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
  }, [activeOverlay, setLocation]);

  const handleOverlayToggle = useCallback((overlayName: string) => {
    setActiveOverlay(prevOverlay => {
      // If we are moving away from 'addFence', clear the temporary drawing paths
      if (prevOverlay === 'addFence' && overlayName !== 'addFence') {
        setDrawingPolygonPaths([]); // Clear drawing paths
      }
      return prevOverlay === overlayName ? '' : overlayName;
    });
  }, []);

  // New: Function to add a new polygon fence
  const addFence = useCallback((name: string, paths: LatLngLiteral[], color: string) => {
    const newFence: GeoFence = {
      id: Math.random().toString(36).substring(2, 9), // Simple unique ID
      name,
      paths,
      color,
    };
    setFences(prevFences => [...prevFences, newFence]);
    setActiveOverlay('fences'); // Go back to the fences list after adding
    fetch("/api/fence", {
      method: "POST",
      body: JSON.stringify({
        fence: newFence
      })
    }).then((data) => {
      return data.json()
    }).then((res) => {
      console.log(res.message)
    })
    setDrawingPolygonPaths([]); // Clear drawing paths after saving
  }, []);

  // New: Function to remove the last point when drawing a polygon
  const removeLastDrawingPoint = useCallback(() => {
    setDrawingPolygonPaths(prevPaths => prevPaths.slice(0, -1));
  }, []);

  return (
    <div className='flex flex-col h-screen w-screen relative'>
      <div className='flex-grow'>
        <Map center={center} onLoad={mapOnLoad} onClick={mapOnClick}>
          <Marker position={center} options={defaultMarkerIconOptions ? { icon: defaultMarkerIconOptions } : undefined}></Marker>
          {fences.map(fence => {
            const centroid = calculatePolygonCentroid(fence.paths); // Calculate centroid
            return (
              <React.Fragment key={fence.id}>
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
                {/* Add a Marker with the fence name at the centroid */}
                <Marker
                  position={centroid}
                  label={{
                    text: fence.name,
                    color: 'black', // Choose a color that contrasts with your polygon fill
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}
                  // Optional: Make the marker invisible (only label shows) or a small dot
                  options={{
                    icon: {
                      path: google.maps.SymbolPath.CIRCLE, // Use a simple circle path
                      scale: 0, // Make the circle invisible
                    },
                    // Disable clickability for the label marker if it's just for display
                    clickable: false,
                    draggable: false, // Prevent dragging the label
                  }}
                />
              </React.Fragment>
            );
          })}
          {/* Render the polygon being drawn */}
          {activeOverlay === 'addFence' && drawingPolygonPaths.length > 0 && (
            <>
              <Polygon
                paths={drawingPolygonPaths}
                options={{
                  strokeColor: '#0000FF', // Blue for drawing
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  fillColor: '#0000FF',
                  fillOpacity: 0.2,
                  geodesic: true,
                }}
              />
              {/* Show markers for each point being drawn */}
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
        </Map>
      </div>
      {activeOverlay === 'details' && (
        <DetailsOverlay onClose={() => setActiveOverlay('')} />
      )}
      {activeOverlay === 'fences' && (
        <FencesOverlay
          fences={fences}
          onClose={() => setActiveOverlay('')}
          onAddFenceClick={() => setActiveOverlay('addFence')}
        />
      )}
      {activeOverlay === 'addFence' && (
        <AddFenceOverlay
          onClose={() => {
            setActiveOverlay('');
            setDrawingPolygonPaths([]); // Clear paths if cancelling
          }}
          onSave={addFence}
          drawingPaths={drawingPolygonPaths} // Pass current drawing paths
          onRemoveLastPoint={removeLastDrawingPoint} // Pass function to remove last point
        />
      )}

      <div className='flex-none h-16'>
        <BottomNavigation activeOverlay={activeOverlay} onOverlayToggle={handleOverlayToggle} />
      </div>
    </div>
  );
}