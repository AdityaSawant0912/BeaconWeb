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

/**
 * Arguments structure for functions passed via the native web bridge.
 */
export interface FunctionMapArgs {
  message?: string;
  regarding?: string;
  error?: string;
  lat?: number;
  lng?: number;
}



/**
 * Map of functions exposed to the native web bridge.
 */
// export interface FunctionMap {
//   logMessage: (args: FunctionMapArgs) => void;
//   setLocation: (args: FunctionMapArgs) => void;
//   reportNativeError: (args: FunctionMapArgs) => void;
// }

export interface FunctionMap  {
  [key: string]: (args: FunctionMapArgs) => string | object | void;
};