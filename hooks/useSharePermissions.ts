// hooks/useSharePermissions.ts

import { useState, useEffect, useCallback } from 'react';
import { LatLngLiteral } from '@/types/map'; // Ensure these types are correct

// Assuming a structure for shared data:
// These interfaces should be defined in a dedicated types file, e.g., '@/types/sharing.ts'
interface SharedUser {
  _id: string; // User ID from MongoDB (or just 'id')
  name: string;
  email: string;
  image?: string;
  currentLocation?: LatLngLiteral; // Last known location, if available
}

// Represents an entry in 'Outgoing Locations'
interface OutgoingShareEntry {
  _id: string; // ID of the SharePermission document
  viewer: SharedUser; // The user you are sharing with
  status: string; // 'active', 'paused', etc.
}

// Represents an entry in 'Pending Requests'
interface PendingRequestEntry {
  _id: string; // ID of the SharePermission document
  requester: SharedUser; // The user who requested your location
  status: string; // 'pending_request'
}


export function useSharePermissions() {
  const [incomingLocations, setIncomingLocations] = useState<SharedUser[]>([]);
  const [outgoingLocations, setOutgoingLocations] = useState<OutgoingShareEntry[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequestEntry[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false); // Renamed to avoid clash with GeoFenceApi's isLoading
  const [errorPermissions, setErrorPermissions] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setIsLoadingPermissions(true);
    setErrorPermissions(null);
    try {
      // API endpoint to fetch all related permissions for the current user
      const response = await fetch('/api/sharepermission', { method: 'GET' }); // Corrected typo here to 'sharepermission'
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched share permissions:", data);

      // Assuming the API returns an object like:
      // { incoming: SharedUser[], outgoing: OutgoingShareEntry[], pending: PendingRequestEntry[] }
      setIncomingLocations(data.incoming || []);
      setOutgoingLocations(data.outgoing || []);
      setPendingRequests(data.pending || []);

    } catch (err) {
      console.error("Failed to fetch share permissions:", err);
      setErrorPermissions(err?.message || "Failed to load share permissions.");
    } finally {
      setIsLoadingPermissions(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
    // Consider polling or WebSockets here for real-time updates if needed
  }, [fetchPermissions]);


  /**
   * Sends a request to another user to share their location with the current user.
   * This is the logic from your old AddPermissonOverlay's handleSave.
   * @param sharerEmail - The email of the user whose location is being requested.
   * @returns true if the request was sent successfully, false otherwise.
   */
  const requestLocation = useCallback(async (sharerEmail: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/sharing', { // This endpoint for sending request
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sharerEmail: sharerEmail }) // Ensure backend expects sharerEmail
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.message || `HTTP error! status: ${response.status}`);
      }

      console.log("Location request sent:", res.message);
      // Assuming the backend returns the new pending request or success status
      // You might need to refetch permissions or optimistically add to pendingRequests here
      fetchPermissions(); // Re-fetch all permissions to update the lists

      return true;
    } catch (error: any) {
      console.error("Failed to send location request:", error);
      setErrorPermissions(error.message || "Failed to send request.");
      return false;
    }
  }, [fetchPermissions]); // fetchPermissions is a dependency here

  /**
   * Accepts a pending location request.
   * @param permissionId - The ID of the SharePermission document.
   */
  const acceptRequest = useCallback(async (permissionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sharepermission/${permissionId}/accept`, { // Example API endpoint
        method: 'PUT',
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || 'Failed to accept request');
      
      // Optimistic update: move from pending to incoming
      setPendingRequests(prev => prev.filter(req => req._id !== permissionId));
      setIncomingLocations(prev => [...prev, res.acceptedPermission.sharer]); // Assuming API returns the accepted permission with sharer details
      return true;
    } catch (error: any) {
      console.error("Failed to accept request:", error);
      setErrorPermissions(error.message || "Failed to accept request.");
      return false;
    }
  }, []);

  /**
   * Declines a pending location request.
   * @param permissionId - The ID of the SharePermission document.
   */
  const declineRequest = useCallback(async (permissionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sharepermission/${permissionId}/decline`, { // Example API endpoint
        method: 'PUT', // Or DELETE depending on your API design
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || 'Failed to decline request');
      
      // Optimistic update: remove from pending
      setPendingRequests(prev => prev.filter(req => req._id !== permissionId));
      return true;
    } catch (error: any) {
      console.error("Failed to decline request:", error);
      setErrorPermissions(error.message || "Failed to decline request.");
      return false;
    }
  }, []);

  /**
   * Stops sharing location with a specific viewer.
   * @param permissionId - The ID of the SharePermission document.
   */
  const stopSharing = useCallback(async (permissionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sharepermission/${permissionId}/stop`, { // Example API endpoint
        method: 'PUT', // Or DELETE
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || 'Failed to stop sharing');
      
      // Optimistic update: remove from outgoing
      setOutgoingLocations(prev => prev.filter(share => share._id !== permissionId));
      return true;
    } catch (error: any) {
      console.error("Failed to stop sharing:", error);
      setErrorPermissions(error.message || "Failed to stop sharing.");
      return false;
    }
  }, []);


  return {
    incomingLocations,
    outgoingLocations,
    pendingRequests,
    isLoadingPermissions,
    errorPermissions,
    fetchPermissions,
    requestLocation, // Exposed
    acceptRequest,
    declineRequest,
    stopSharing,
  };
}