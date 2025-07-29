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
  status?: string;
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
// Represents an entry in 'Pending Requests'
interface SentRequestEntry {
  _id: string; // ID of the SharePermission document
  sharer: SharedUser; // The user who requested your location
  status: string; // 'pending_request'
}


export function useSharePermissions() {
  const [incomingLocations, setIncomingLocations] = useState<SharedUser[]>([]);
  const [outgoingLocations, setOutgoingLocations] = useState<OutgoingShareEntry[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequestEntry[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequestEntry[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [errorPermissions, setErrorPermissions] = useState<string | null>(null);

  // NEW STATE: To track if native background location sharing should be active
  const [isNativeSharingLocationActive, setIsNativeSharingLocationActive] = useState(false);


  const fetchPermissions = useCallback(async () => {
    setIsLoadingPermissions(true);
    setErrorPermissions(null);
    try {
      const response = await fetch('/api/sharepermission', { method: 'GET' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched share permissions:", data);

      setIncomingLocations(data.incoming || []);
      setOutgoingLocations(data.outgoing || []);
      setPendingRequests(data.pending || []);
      setSentRequests(data.sent || []);

    } catch (error) {
      console.error("Failed to fetch share permissions:", error);
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      setErrorPermissions(errorMessage || "Failed to load share permissions.");
    } finally {
      setIsLoadingPermissions(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // NEW useEffect: Listen to outgoingLocations to update native sharing status
  useEffect(() => {
    // Check if there's at least one active outgoing location share
    const anyActiveShares = outgoingLocations.some(
      (entry) => entry.status === 'active'
    );

    // Update the state
    if (anyActiveShares !== isNativeSharingLocationActive) {
      console.log(`[useSharePermissions] Updating native sharing status: ${anyActiveShares ? 'Active' : 'Paused'}`);
      setIsNativeSharingLocationActive(anyActiveShares);
    }
  }, [outgoingLocations, isNativeSharingLocationActive]); // Dependency on outgoingLocations and its own state


  /**
   * Sends a request to another user to share their location with the current user.
   * This is the logic from your old AddPermissonOverlay's handleSave.
   * @param sharerEmail - The email of the user whose location is being requested.
   * @returns true if the request was sent successfully, false otherwise.
   */
  const requestLocation = useCallback(async (sharerEmail: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/sharing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sharerEmail: sharerEmail })
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.message || `HTTP error! status: ${response.status}`);
      }

      console.log("Location request sent:", res.message);
      fetchPermissions(); // Re-fetch all permissions to update the lists

      return true;
    } catch (error) {
      console.error("Failed to send location request:", error);
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      setErrorPermissions(errorMessage || "Failed to send request.");
      return false;
    }
  }, [fetchPermissions]);

  /**
   * Accepts a pending location request.
   * @param permissionId - The ID of the SharePermission document.
   */
  const acceptRequest = useCallback(async (permissionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sharepermission/${permissionId}/accept`, {
        method: 'PUT',
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || 'Failed to accept request');

      // Optimistic update: move from pending to outgoing (as you become the sharer)
      setPendingRequests(prev => prev.filter(req => req._id !== permissionId));
      // Assuming res.acceptedPermission contains the newly created outgoing permission details
      // You might need to adjust this based on your API's actual response
      // For now, rely on refetch for full accuracy
      fetchPermissions();
      return true;
    } catch (error) {
      console.error("Failed to accept request:", error);
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      setErrorPermissions(errorMessage || "Failed to accept request.");
      return false;
    }
  }, [fetchPermissions]); // Added fetchPermissions as dependency

  /**
   * Declines a pending location request.
   * @param permissionId - The ID of the SharePermission document.
   */
  const declineRequest = useCallback(async (permissionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sharepermission/${permissionId}/decline`, {
        method: 'PUT',
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || 'Failed to decline request');

      // Optimistic update: remove from pending
      setPendingRequests(prev => prev.filter(req => req._id !== permissionId));
      fetchPermissions();
      return true;
    } catch (error) {
      console.error("Failed to decline request:", error);
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      setErrorPermissions(errorMessage || "Failed to decline request.");
      return false;
    }
  }, [fetchPermissions]);

  /**
   * Stops sharing location with a specific viewer (sets status to 'paused' or removes).
   * @param permissionId - The ID of the SharePermission document.
   */
  const stopSharing = useCallback(async (permissionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sharepermission/${permissionId}/stop`, {
        method: 'PUT',
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || 'Failed to stop sharing');

      // Optimistic update: Find the entry and update its status to 'paused'
      setOutgoingLocations(prev =>
        prev.map(share =>
          share._id === permissionId ? { ...share, status: 'paused' } : share
        )
      );
      fetchPermissions(); // Re-fetch to confirm status and update all lists
      return true;
    } catch (error) {
      console.error("Failed to stop sharing:", error);
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      setErrorPermissions(errorMessage || "Failed to stop sharing.");
      return false;
    }
  }, [fetchPermissions]);

  /**
   * Resumes sharing location with a specific viewer (sets status to 'active').
   * @param permissionId - The ID of the SharePermission document.
   */
  const resumeSharing = useCallback(async (permissionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sharepermission/${permissionId}/resume`, {
        method: 'PUT',
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || 'Failed to resume sharing');

      // Optimistic update: Find the entry and update its status to 'active'
      setOutgoingLocations(prev =>
        prev.map(share =>
          share._id === permissionId ? { ...share, status: 'active' } : share
        )
      );
      fetchPermissions(); // Re-fetch to confirm status and update all lists
      return true;
    } catch (error) {
      console.error("Failed to resume sharing:", error);
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      setErrorPermissions(errorMessage || "Failed to resume sharing.");
      return false;
    }
  }, [fetchPermissions]);

  /**
   * Deletes sharing location with a specific viewer.
   * @param permissionId - The ID of the SharePermission document.
   */
  const deleteRequest = useCallback(async (permissionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sharepermission?id=${permissionId}`, {
        method: 'DELETE',
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || 'Failed to delete sharing');

      // Optimistic update: remove from sent requests
      setSentRequests(prev => prev.filter(share => share._id !== permissionId));
      fetchPermissions();
      return true;
    } catch (error) {
      console.error("Failed to delete sharing:", error);
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      setErrorPermissions(errorMessage || "Failed to delete sharing.");
      return false;
    }
  }, [fetchPermissions]);


  return {
    incomingLocations,
    outgoingLocations,
    pendingRequests,
    sentRequests,
    isLoadingPermissions,
    errorPermissions,
    fetchPermissions,
    requestLocation,
    acceptRequest,
    declineRequest,
    stopSharing,
    resumeSharing,
    deleteRequest,
    isNativeSharingLocationActive, // EXPOSED: The new state
  };
}