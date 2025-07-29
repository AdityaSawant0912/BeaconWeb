import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { GeoFence, IncomingGeoFence, LatLngLiteral } from '@/types/map';
import { GeoFenceContext, GeoFenceContextType } from '@/context/GeoFenceContext';
// Create the GeoFence Provider component
interface GeoFenceProviderProps {
  children: ReactNode;
}

export const GeoFenceProvider: React.FC<GeoFenceProviderProps> = ({ children }) => {
  const [fences, setFences] = useState<GeoFence[]>([]);
  const [incomingFences, setIncomingFences] = useState<IncomingGeoFence[]>([]);
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
          setIncomingFences(res.incomingFences);
        }
      } catch (error) {
        console.error("Failed to fetch fences:", error);
      }
    };

    fetchFences();
  }, []);

  const addFence = useCallback(async (name: string, paths: LatLngLiteral[], color: string): Promise<GeoFence | null> => {
    const fenceDataToSend = {
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
        body: JSON.stringify({ fence: fenceDataToSend }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      console.log("Fence added successfully:", res.message);

      const createdFence: GeoFence = res.fence;
      setFences(prevFences => [...prevFences, createdFence]);
      setDrawingPolygonPaths([]); // Clear drawing paths after saving
      return createdFence;
    } catch (error) {
      console.error("Failed to add fence:", error);
      return null;
    }
  }, []);

  const deleteFence = useCallback(async (_id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/fence?id=${_id}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      console.log("Fence deleted successfully:", res.message);

      setFences(prevFences => prevFences.filter(fence => fence._id !== _id));
      return true;
    } catch (error) {
      console.error("Failed to delete fence:", error);
      return false;
    }
  }, []);

  const addDrawingPoint = useCallback((location: LatLngLiteral) => {
    setDrawingPolygonPaths(prevPaths => [...prevPaths, location]);
  }, []);

  const removeLastDrawingPoint = useCallback(() => {
    setDrawingPolygonPaths(prevPaths => prevPaths.slice(0, -1));
  }, []);

  const removeDrawingPoints = useCallback(() => {
    setDrawingPolygonPaths([]);
  }, []);

  // The value that will be supplied to any components consuming this context
  const contextValue: GeoFenceContextType = {
    fences,
    incomingFences,
    drawingPolygonPaths,
    setFences,
    addFence,
    deleteFence,
    addDrawingPoint,
    removeLastDrawingPoint,
    removeDrawingPoints,
  };

  return (
    <GeoFenceContext.Provider value={contextValue}>
      {children}
    </GeoFenceContext.Provider>
  );
};