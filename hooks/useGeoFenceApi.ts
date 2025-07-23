// hooks/useGeoFenceApi.ts
import { useState, useEffect, useCallback } from 'react';
import { GeoFence, LatLngLiteral } from '@/types/map'; // Ensure LatLngLiteral is imported

/**
 * A custom React hook for managing GeoFence data, including fetching from and adding to an API.
 * It also handles the temporary state for drawing a new polygon fence on the map.
 * @returns An object containing:
 * - fences: The current list of saved GeoFences.
 * - addFence: Function to add a new fence (and clear drawing state).
 * - setFences: Setter for fences (for external updates if needed).
 * - drawingPolygonPaths: Array of LatLngLiteral for the polygon currently being drawn.
 * - addDrawingPoint: Function to add a new point to the drawing polygon.
 * - removeLastDrawingPoint: Function to remove the last point from the drawing polygon.
 */
export function useGeoFenceApi() {
  const [fences, setFences] = useState<GeoFence[]>([]);
  // --- NEW STATE: Local state for the polygon currently being drawn ---
  const [drawingPolygonPaths, setDrawingPolygonPaths] = useState<LatLngLiteral[]>([]);

  // Effect to fetch fences when the component mounts
  useEffect(() => {
    const fetchFences = async () => {
      try {
        const response = await fetch("/api/fence", {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const res = await response.json();
        console.log("Fetched fences:", res);
        if (res.fences) {
          setFences(res.fences);
        }
      } catch (error) {
        console.error("Failed to fetch fences:", error);
      }
    };

    fetchFences();
  }, []); // Empty dependency array ensures this runs only once on mount

  /**
   * Adds a new GeoFence to the state and sends it to the API.
   * This function also clears the temporary drawing paths after successful addition.
   * @param name - The name of the fence.
   * @param paths - An array of LatLngLiteral objects defining the polygon.
   * @param color - The color of the fence.
   * @returns The newly created GeoFence object, or null if the API call fails.
   */
  const addFence = useCallback(async (name: string, paths: LatLngLiteral[], color: string): Promise<GeoFence | null> => {
    const newFence: GeoFence = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      paths,
      color,
    };

    try {
      const response = await fetch("/api/fence", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fence: newFence }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      console.log("Fence added successfully:", res.message);

      setFences(prevFences => [...prevFences, newFence]);
      setDrawingPolygonPaths([]); // --- CRUCIAL: Clear drawing paths after saving ---
      return newFence;
    } catch (error) {
      console.error("Failed to add fence:", error);
      return null;
    }
  }, []); // Dependencies: setFences, setDrawingPolygonPaths

  // --- NEW CALLBACKS for managing drawing state ---

  /**
   * Adds a new point to the polygon currently being drawn.
   * This function is intended to be called when the user clicks on the map in 'add fence' mode.
   * @param location - The LatLngLiteral of the clicked point.
   */
  const addDrawingPoint = useCallback((location: LatLngLiteral) => {
    setDrawingPolygonPaths(prevPaths => [...prevPaths, location]);
  }, []); // Dependencies: setDrawingPolygonPaths

  /**
   * Removes the last point from the polygon currently being drawn.
   * Useful for "undo" functionality during drawing.
   */
  const removeLastDrawingPoint = useCallback(() => {
    setDrawingPolygonPaths(prevPaths => prevPaths.slice(0, -1));
  }, []); // Dependencies: setDrawingPolygonPaths
  
  /**
   * Removes the last point from the polygon currently being drawn.
   * Useful for "undo" functionality during drawing.
   */
  const removeDrawingPoints = useCallback(() => {
    setDrawingPolygonPaths([])
  }, []); // Dependencies: setDrawingPolygonPaths


  return {
    fences,
    addFence,
    setFences, // Still expose this for flexibility if needed externally
    drawingPolygonPaths, // Expose the current drawing paths
    addDrawingPoint, // Expose the function to add a point
    removeLastDrawingPoint, // Expose the function to remove a point
    removeDrawingPoints
  };
}