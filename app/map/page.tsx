"use client"
import { useState } from 'react';
import useNativeWebBridge from '@/hooks/useNativeWebBridge';
import Map from '@/components/Map';
import { Marker } from '@react-google-maps/api';


export const defaultMapContainerStyle = {
  width: '100%',
  height: '80vh',
  borderRadius: '15px 0px 0px 15px',
};

export default function Home() {
  const [message, setMessage] = useState("waiting ..");
  const [center, _setCenter] = useState({ lat: 0, lng: 0 });

  const logMessage = ({ message }: FunctionMapArgs) => {
    setMessage(message)
  }

  const reportNativeError = ({ regarding, error }: FunctionMapArgs) => {
    alert(`Error raised regarding : ${regarding} > \n ${error}`)
  }
  const setLocation = ({ lat, lng }: FunctionMapArgs) => {
    _setCenter({ lat, lng })
  }

  const functionMap: FunctionMap = {
    logMessage,
    setLocation,
    reportNativeError
  }
  const { callBridgeFunction } = useNativeWebBridge(functionMap)
  
  const mapOnLoad = () => {
    callBridgeFunction('getLocation', {})
  }


  return (
    <div style={{ fontSize: '18px', width: '100%' }}>
      <Map center={center} onLoad={mapOnLoad}>
        <Marker position={center}></Marker>
      </Map>
      {/* <button onClick={() => { callBridgeFunction('logMessage', { message: "Hello from Web (Button)" }) }}>Send Message</button> */}
    </div>
  );
}
