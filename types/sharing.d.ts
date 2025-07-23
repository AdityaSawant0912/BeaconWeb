// types/sharing.d.ts (or types/sharing.ts)

import { ISharePermission } from '@/models/SharePermission'; // Your Mongoose model interface
import { LatLngLiteral } from './map'; // Assuming LatLngLiteral is in types/map.d.ts

// 1. Define the shape of a populated User (subset of IUser, based on .populate select)
export interface PopulatedUserSubset {
  _id: string; // When populated, it becomes the user's _id (often stringified in API response)
  name: string;
  email: string;
  image?: string;
  // If you store lastKnownLocation directly on User model, add it here:
  // lastKnownLocation?: LatLngLiteral;
}

// 2. Define the SharePermission interface after population
//    Use Omit to remove the original sharerId/viewerId before adding the populated version
export interface PopulatedIncomingSharePermission extends Omit<ISharePermission, 'sharerId'> {
  sharerId: PopulatedUserSubset; // This is the populated User object
}

export interface PopulatedOutgoingSharePermission extends Omit<ISharePermission, 'viewerId'> {
  viewerId: PopulatedUserSubset; // This is the populated User object
}

export interface PopulatedPendingRequestSharePermission extends Omit<ISharePermission, 'viewerId'> {
  viewerId: PopulatedUserSubset; // This is the populated User object (the requester)
}

export interface PopulatedSentRequestSharePermission extends Omit<ISharePermission, 'sharerId'> {
  sharerId: PopulatedUserSubset; // This is the populated User object (the requester)
}


// 3. Define the final output types for the frontend (as used in useSharePermissions hook)
export interface IncomingLocationItem {
  _id: string; // SharePermission ID
  sharerId: string; // The sharer's User ID
  name: string;
  email: string;
  image?: string;
  currentLocation: LatLngLiteral | null; // Latest location for this user
  status: 'active' | 'pending_request' | 'rejected' | 'paused'; // Status of the permission
}

export interface OutgoingShareEntry {
  _id: string; // SharePermission ID
  viewerId: string; // The viewer's User ID
  name: string; // Viewer's name
  email: string;
  image?: string;
  status: 'active' | 'pending_request' | 'rejected' | 'paused';
}

export interface PendingRequestEntry {
  _id: string; // SharePermission ID
  requesterId: string; // The requester's User ID
  name: string; // Requester's name
  email: string;
  image?: string;
  status: 'active' | 'pending_request' | 'rejected' | 'paused';
}