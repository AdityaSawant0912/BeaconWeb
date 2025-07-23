// context/NativeBridgeContext.tsx

import { createContext, useContext } from 'react';
// Import LatLngLiteral from map, and others from bridge
import { LatLngLiteral } from '@/types/map';
import { CallNativeFunctionArgs } from '@/types/bridge'; // Updated import

// Define the shape of the Native Bridge Context
interface NativeBridgeContextType {
  center: LatLngLiteral;
  setLocation: (location: LatLngLiteral) => void;
  callBridgeFunction: (functionName: string, args: CallNativeFunctionArgs) => void;
  logMessage: (message: string) => void;
  reportNativeError: (regarding: string, error: string) => void;
}

// Create the context
export const NativeBridgeContext = createContext<NativeBridgeContextType | undefined>(undefined);

// Custom hook to consume the NativeBridgeContext
export const useNativeBridge = () => {
  const context = useContext(NativeBridgeContext);
  if (context === undefined) {
    throw new Error('useNativeBridge must be used within a NativeBridgeProvider');
  }
  return context;
};

