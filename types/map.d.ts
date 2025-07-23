// types/map.d.ts

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
  id: string;
  name: string;
  paths: LatLngLiteral[];
  color: string;
}

