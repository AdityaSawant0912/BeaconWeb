// types/map.d.ts
import { PopulatedUserSubset } from './sharing'

/**
 * Represents a latitude and longitude pair.
 */
export interface LatLngLiteral {
  lat: number;
  lng: number;
}

/**
 * Represents a geographical fence (polygon).
 */
export interface GeoFence {
  _id: string;
  name: string;
  paths: LatLngLiteral[];
  color: string;
}

export interface IncomingGeoFence {
  sharerUser: PopulatedUserSubset
  fences: GeoFence[];
}

