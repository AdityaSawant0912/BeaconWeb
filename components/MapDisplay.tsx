// components/MapDisplay.tsx
import React from 'react';
import { Marker, Polygon } from '@react-google-maps/api';
import Map from '@/components/Map'; // Assuming this is your wrapper for GoogleMap component
import { LatLngLiteral, GeoFence } from '@/types/map'; // Import types
import { calculatePolygonCentroid } from '@/utils/mapUtils'; // Import utilities

/**
 * Props interface for the MapDisplay component.
 */
interface MapDisplayProps {
  center: LatLngLiteral;
  fences: GeoFence[];
  drawingPolygonPaths: LatLngLiteral[];
  activeOverlay: string;
  defaultMarkerIconOptions: google.maps.MarkerOptions['icon'] | undefined;
  onLoad: () => void;
  onClick: (e: google.maps.MapMouseEvent) => void;
}

/**
 * MapDisplay component is responsible for rendering the Google Map and all its elements,
 * including the current location marker, existing geo-fences, and the polygon being drawn.
 * It receives all necessary data and event handlers as props from its parent.
 * @param props - MapDisplayProps containing map state and event handlers.
 */
export const MapDisplay: React.FC<MapDisplayProps> = ({
  center,
  fences,
  drawingPolygonPaths,
  activeOverlay,
  defaultMarkerIconOptions,
  onLoad,
  onClick,
}) => {
  return (
    <Map center={center} onLoad={onLoad} onClick={onClick}>
      {/* Marker for the current location or clicked center */}
      <Marker
        position={center}
        options={defaultMarkerIconOptions ? { icon: defaultMarkerIconOptions } : undefined}
      />

      {/* Render existing geo-fences as Polygons and add a label marker at their centroid */}
      {fences.map(fence => {
        const centroid = calculatePolygonCentroid(fence.paths); // Calculate centroid for label placement
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
            {/* Marker with the fence name at its calculated centroid */}
            <Marker
              position={centroid}
              label={{
                text: fence.name,
                color: 'black', // Text color for the label
                fontWeight: 'bold',
                fontSize: '14px',
              }}
              options={{
                // Make the marker icon invisible, only the label will show
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 },
                clickable: false, // Prevent interaction with the label marker
                draggable: false, // Prevent dragging the label
              }}
            />
          </React.Fragment>
        );
      })}

      {/* Render the polygon currently being drawn if in 'addFence' mode and points exist */}
      {activeOverlay === 'addFence' && drawingPolygonPaths.length > 0 && (
        <>
          <Polygon
            paths={drawingPolygonPaths}
            options={{
              strokeColor: '#0000FF', // Blue color for drawing
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#0000FF',
              fillOpacity: 0.2,
              geodesic: true,
            }}
          />
          {/* Show markers for each point being drawn with an index label */}
          {drawingPolygonPaths.map((point, index) => (
            <Marker
              key={`drawing-point-${index}`} // Unique key for each drawing point marker
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
                  text: `${index + 1}`, // Label with the point number
                  color: 'white',
                  fontSize: '10px'
                }
              }}
            />
          ))}
        </>
      )}
    </Map>
  );
};

