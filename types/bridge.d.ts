// types/bridge.d.ts

// Define LatLngLiteral here if it's primarily used by the bridge for location,
// otherwise keep it in types/map.d.ts if it's a general map concept.
// For now, assuming it's a general map concept and keeping it in types/map.d.ts,
// but if bridge is the *only* source of LatLngLiteral, it could live here.

// Arguments shape for 'setLocation' from native
export interface NativeLocationArgs {
  lat: number;
  lng: number;
}

// Arguments shape for 'reportNativeError' from native
export interface NativeErrorArgs {
  regarding: string;
  error: string;
}

// Arguments shape for 'logMessage' from native
export interface NativeMessageArgs {
  message: string;
}

// Union type for all possible argument shapes received from native
export type NativeBridgeIncomingArgs = NativeLocationArgs | NativeErrorArgs | NativeMessageArgs | Record<string, any>;

// Type for the JavaScript functions that will be called by the native bridge
export type NativeBridgeCallback = (args: NativeBridgeIncomingArgs) => void;

// Type for the map of functions registered with useNativeWebBridge
export type NativeFunctionMap = {
  [functionName: string]: NativeBridgeCallback;
};

// Type for the message structure sent from native to webview
export interface IncomingNativeBridgeMessage {
  functionName: string;
  args: NativeBridgeIncomingArgs;
}

// Type for arguments when calling a native function from web (e.g., getLocation)
// This should be broader as arguments can be anything
export type CallNativeFunctionArgs = Record<string, any>;

// Extend the Window interface to include ReactNativeWebView for WebView communication
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

// New: Arguments for Web -> Native functions
export interface NativeAuthArgs {
    authToken: string;
    refreshToken?: string;
}

export interface NativeControlLocationArgs {
    status: 'paused' | 'resumed';
    interval?: number; // In minutes
}


// Interface for functions Native calls on Web (i.e., passed to useNativeWebBridge from WebViewScreen)
export interface NativeFunctionMap {
    logMessage: (args: NativeMessageArgs) => void;
    setLocation: (args: NativeLocationArgs) => void;
    reportNativeError: (args: NativeErrorArgs) => void;
    // Add any other functions Native calls on Web here
}

// Interface for functions Web calls on Native (i.e., exposed via NativeBridgeContext)
export interface WebBridgeCallableFunctions {
    center: LatLngLiteral;
    logMessage: (message: string) => void;
    reportNativeError: (regarding: string, error: string) => void;
    saveAuthToken: (authToken: string, refreshToken?: string) => void;
    controlLocationSharing: (status: 'paused' | 'resumed', interval?: number) => void;
    setCenterState: React.Dispatch<React.SetStateAction<LatLngLiteral>>; // If you want to allow direct state updates
    getNativeLocation: () => void;
}