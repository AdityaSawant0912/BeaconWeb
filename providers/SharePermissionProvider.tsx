import { OutgoingShareEntry, PendingRequestEntry, SentRequestEntry, SharedUser, SharePermissionsContext } from '@/context/SharePermissionsContext';
import React, {  useState, useEffect, useCallback, ReactNode, useMemo } from 'react';

// Create the Provider Component
interface SharePermissionsProviderProps {
  children: ReactNode;
}

export const SharePermissionsProvider: React.FC<SharePermissionsProviderProps> = ({ children }) => {
  // All the state and logic from your original useSharePermissions hook
  const [incomingLocations, setIncomingLocations] = useState<SharedUser[]>([]);
  const [outgoingLocations, setOutgoingLocations] = useState<OutgoingShareEntry[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequestEntry[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequestEntry[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [errorPermissions, setErrorPermissions] = useState<string | null>(null);
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
    const anyActiveShares = outgoingLocations.some(
      (entry) => entry.status === 'active'
    );

    // This is the crucial check to avoid unnecessary state updates and re-renders
    if (anyActiveShares !== isNativeSharingLocationActive) {
      setIsNativeSharingLocationActive(anyActiveShares);
    }
  }, [outgoingLocations, isNativeSharingLocationActive]); // Depend on both to ensure logic re-runs if either changes, though `outgoingLocations` is the primary trigger.

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

      fetchPermissions(); // Re-fetch all permissions to update the lists

      return true;
    } catch (error) {
      console.error("Failed to send location request:", error);
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      setErrorPermissions(errorMessage || "Failed to send request.");
      return false;
    }
  }, [fetchPermissions]);

  const acceptRequest = useCallback(async (permissionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sharepermission/${permissionId}/accept`, {
        method: 'PUT',
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || 'Failed to accept request');

      setPendingRequests(prev => prev.filter(req => req._id !== permissionId));
      fetchPermissions();
      return true;
    } catch (error) {
      console.error("Failed to accept request:", error);
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      setErrorPermissions(errorMessage || "Failed to accept request.");
      return false;
    }
  }, [fetchPermissions]);

  const declineRequest = useCallback(async (permissionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sharepermission/${permissionId}/decline`, {
        method: 'PUT',
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || 'Failed to decline request');

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

  const stopSharing = useCallback(async (permissionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sharepermission/${permissionId}/stop`, {
        method: 'PUT',
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || 'Failed to stop sharing');

      setOutgoingLocations(prev =>
        prev.map(share =>
          share._id === permissionId ? { ...share, status: 'paused' } : share
        )
      );
      fetchPermissions();
      return true;
    } catch (error) {
      console.error("Failed to stop sharing:", error);
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      setErrorPermissions(errorMessage || "Failed to stop sharing.");
      return false;
    }
  }, [fetchPermissions]);

  const resumeSharing = useCallback(async (permissionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sharepermission/${permissionId}/resume`, {
        method: 'PUT',
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || 'Failed to resume sharing');

      setOutgoingLocations(prev =>
        prev.map(share =>
          share._id === permissionId ? { ...share, status: 'active' } : share
        )
      );
      fetchPermissions();
      return true;
    } catch (error) {
      console.error("Failed to resume sharing:", error);
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      setErrorPermissions(errorMessage || "Failed to resume sharing.");
      return false;
    }
  }, [fetchPermissions]);

  const deleteRequest = useCallback(async (permissionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sharepermission?id=${permissionId}`, {
        method: 'DELETE',
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || 'Failed to delete sharing');

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

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({
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
    isNativeSharingLocationActive,
  }), [
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
    isNativeSharingLocationActive,
  ]);

  return (
    <SharePermissionsContext.Provider value={contextValue}>
      {children}
    </SharePermissionsContext.Provider>
  );
};