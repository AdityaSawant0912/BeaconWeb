// context/SharePermissionsContext.tsx
"use client"; // If using Next.js App Router and this is a client component

import { createContext, useContext} from 'react';
import { LatLngLiteral } from '@/types/map'; // Ensure this path is correct

// Define the interfaces here if they are not globally accessible or in a dedicated types file.
// If they are already in '@/types/sharing.ts', you can import them.
// For now, I'll include them directly for completeness.

// Assuming a structure for shared data:
export interface SharedUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  currentLocation?: LatLngLiteral;
  status?: string;
}

export interface OutgoingShareEntry {
  _id: string;
  viewer: SharedUser;
  status: string; // 'active', 'paused', etc.
}

export interface PendingRequestEntry {
  _id: string;
  requester: SharedUser;
  status: string; // 'pending_request'
}

export interface SentRequestEntry {
  _id: string;
  sharer: SharedUser;
  status: string; // 'pending_request'
}

// Define the shape of your context value, matching the return of your original hook
export interface SharePermissionsContextType {
  incomingLocations: SharedUser[];
  outgoingLocations: OutgoingShareEntry[];
  pendingRequests: PendingRequestEntry[];
  sentRequests: SentRequestEntry[];
  isLoadingPermissions: boolean;
  errorPermissions: string | null;
  fetchPermissions: () => Promise<void>;
  requestLocation: (sharerEmail: string) => Promise<boolean>;
  acceptRequest: (permissionId: string) => Promise<boolean>;
  declineRequest: (permissionId: string) => Promise<boolean>;
  stopSharing: (permissionId: string) => Promise<boolean>;
  resumeSharing: (permissionId: string) => Promise<boolean>;
  deleteRequest: (permissionId: string) => Promise<boolean>;
  isNativeSharingLocationActive: boolean;
}

// Create the Context
export const SharePermissionsContext = createContext<SharePermissionsContextType | undefined>(undefined);

// Custom hook to consume the context (this replaces your original useSharePermissions export)
export const useSharePermissions = () => {
  const context = useContext(SharePermissionsContext);
  if (context === undefined) {
    throw new Error('useSharePermissions must be used within a SharePermissionsProvider');
  }
  return context;
};