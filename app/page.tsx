"use client"
import { useState } from 'react';
import useNativeWebBridge from '@/hooks/useNativeWebBridge';

export default function Home() {
  const [message, setMessage] = useState("waiting .."); 
  const logMessage = ({ message }: FunctionMapArgs) => {
    setMessage(message)
  }

  const functionMap: FunctionMap = {
    logMessage
  }
  const { callBridgeFunction } = useNativeWebBridge(functionMap)
  

  return (
    <div style={{ padding: '20px', fontSize: '18px' }}>
      <h2>Hello from WebView</h2>
      <p>{message}</p>
      <br />
      <button onClick={()=> {callBridgeFunction('logMessage', {message: "Hello from Web (Button)"})}}>Send Message</button>
    </div>
  );
}
