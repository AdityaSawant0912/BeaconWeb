"use client"

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

    function handleEvent(message: Event) {
      const {data} = message as MessageEvent
      const {functionName, args} = JSON.parse(data)
      functionMap[functionName](args)
    }
    document.addEventListener("message", handleEvent);

    return () =>
      document.removeEventListener("message", handleEvent);
  }, [])


  return { callBridgeFunction }
}