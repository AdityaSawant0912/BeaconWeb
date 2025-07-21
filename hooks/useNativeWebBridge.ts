"use client"

import { FunctionMapArgs, FunctionMap } from '@/types/map'; // Import types

import isInWebView from "@/utils/isInWebView";
import { useEffect } from "react";

export default function useNativeWebBridge(functionMap: FunctionMap) {

  function sendDataToNative(message: object) {
    if (!isInWebView()) return
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }

  function callBridgeFunction(functionName: string, args: FunctionMapArgs) {
    const message = {
      functionName,
      args
    }
    sendDataToNative(message)
  }

  useEffect(() => {

    type FunctionNameAndArgs = {
      functionName: string,
      args: FunctionMap
    }

    function handleEvent(message: Event) {
      const { data } = message as MessageEvent
      const { functionName, args }: FunctionNameAndArgs = JSON.parse(data)
      functionMap[functionName](args)
    }
    document.addEventListener("message", handleEvent);

    return () =>
      document.removeEventListener("message", handleEvent);
  }, [])


  return { callBridgeFunction }
}