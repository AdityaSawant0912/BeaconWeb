// hooks/useGeoFenceApi.ts
import { useState, useEffect, useCallback } from 'react';
import { GeoFence, LatLngLiteral } from '@/types/map';

/**
 * A custom React hook for managing GeoFence data, including fetching from and adding to an API.
 * It handles the state for the list of fences and provides functions to interact with the fence API.
 * @returns An object containing the current list of fences, a function to add a new fence,
 * and a setter for fences (useful for external updates if needed).
 */
export function useGeoFenceApi() {
  const [fences, setFences] = useState<GeoFence[]>([]);

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
   * @param name - The name of the fence.
   * @param paths - An array of LatLngLiteral objects defining the polygon.
   * @param color - The color of the fence.
   * @returns The newly created GeoFence object, or null if the API call fails.
   */
  const addFence = useCallback(async (name: string, paths: LatLngLiteral[], color: string): Promise<GeoFence | null> => {
    // Generate a simple unique ID for the new fence
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

      // Optimistically update the local state with the new fence
      setFences(prevFences => [...prevFences, newFence]);
      return newFence;
    } catch (error) {
      console.error("Failed to add fence:", error);
      return null; // Indicate failure
    }
  }, []); // No dependencies as it uses state setter directly and newFence is created inside

  return { fences, addFence, setFences };
}

