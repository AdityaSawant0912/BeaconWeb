// providers/NativeBridgeProvider.tsx

"use client";

import React, { useState, useCallback, useMemo, ReactNode } from 'react';
import { NativeBridgeContext } from '../context/NativeBridgeContext'; // Correct relative path
import useNativeWebBridge from '@/hooks/useNativeWebBridge'; // Your existing hook
import { LatLngLiteral } from '@/types/map'; // Only LatLngLiteral from types/map
import { NativeFunctionMap, NativeBridgeIncomingArgs, NativeLocationArgs, NativeErrorArgs, NativeMessageArgs } from '@/types/bridge'; // All bridge-related types

interface NativeBridgeProviderProps {
  children: ReactNode;
}

export const NativeBridgeProvider: React.FC<NativeBridgeProviderProps> = ({ children }) => {
  // --- This is the central source for map center (location) ---
  const [center, setCenterState] = useState<LatLngLiteral>({ lat: 0, lng: 0 });

  // --- Callbacks to be invoked by the Native Bridge ---
  const logMessage = useCallback((args: NativeBridgeIncomingArgs) => {
    const messageArgs = args as NativeMessageArgs;
    console.log("Native Log:", messageArgs.message);
  }, []);

  const reportNativeError = useCallback((args: NativeBridgeIncomingArgs) => {
    const errorArgs = args as NativeErrorArgs;
    alert(`Native Error: Regarding: ${errorArgs.regarding} > ${errorArgs.error}`);
  }, []);

  // This setLocation updates the 'center' state managed *within this provider*
  const setLocation = useCallback((args: NativeBridgeIncomingArgs) => {
    const locationArgs = args as NativeLocationArgs;
    setCenterState({ lat: locationArgs.lat, lng: locationArgs.lng });
  }, []);

  // --- Map of functions for useNativeWebBridge ---
  const functionMap: NativeFunctionMap = useMemo(() => ({
    logMessage,
    setLocation, // This setLocation is registered with the bridge
    reportNativeError,
  }), [logMessage, setLocation, reportNativeError]);

  // --- Initialize your existing Native Web Bridge Hook ---
  // This hook sets up the listeners and provides the function to call native
  const { callBridgeFunction } = useNativeWebBridge(functionMap);

  // Memoize the context value that will be provided to consumers
  const contextValue = useMemo(() => ({
    center, // The central map center
    setLocation: (location: LatLngLiteral) => setLocation(location as NativeLocationArgs), // Exposed setLocation that updates central 'center'
    callBridgeFunction, // Exposed function to call native
    logMessage: (message: string) => logMessage({ message } as NativeMessageArgs), // Exposed simplified logMessage
    reportNativeError: (regarding: string, error: string) => reportNativeError({ regarding, error } as NativeErrorArgs), // Exposed simplified reportNativeError
    setCenterState: setCenterState
  }), [center, setLocation, callBridgeFunction, logMessage, reportNativeError]);

  return (
    <NativeBridgeContext.Provider value={contextValue}>
      {children}
    </NativeBridgeContext.Provider>
  );
};