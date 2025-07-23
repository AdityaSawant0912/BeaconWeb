// hooks/useNativeWebBridge.ts

"use client"

// Import types from the new bridge types file
import { NativeFunctionMap, IncomingNativeBridgeMessage, CallNativeFunctionArgs } from '@/types/bridge';
import isInWebView from "@/utils/isInWebView";
import { useEffect } from "react";

export default function useNativeWebBridge(functionMap: NativeFunctionMap) {

  function sendDataToNative(message: object) {
    if (!isInWebView()) return;
    // Ensure window.ReactNativeWebView exists before calling postMessage
    if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    } else {
      console.warn("ReactNativeWebView.postMessage is not available. Are you in a WebView?");
    }
  }

  function callBridgeFunction(functionName: string, args: CallNativeFunctionArgs) {
    const message = {
      functionName,
      args
    };
    sendDataToNative(message);
  }

  useEffect(() => {
    function handleEvent(message: Event) {
      const { data } = message as MessageEvent;
      try {
        const { functionName, args }: IncomingNativeBridgeMessage = JSON.parse(data);
        if (functionMap[functionName]) {
          functionMap[functionName](args);
        } else {
          console.warn(`Native bridge function '${functionName}' not found in functionMap.`);
        }
      } catch (error) {
        console.error("Failed to parse native bridge message:", error, "Raw data:", data);
      }
    }
    document.addEventListener("message", handleEvent);

    return () =>
      document.removeEventListener("message", handleEvent);
  }, [functionMap]); // functionMap is a dependency because its contents (callbacks) can change

  return { callBridgeFunction };
}