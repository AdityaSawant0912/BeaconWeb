import { LatLngLiteral } from "@/types/map";

export const calculatePolygonCentroid = (paths: LatLngLiteral[]): LatLngLiteral => {
  if (paths.length === 0) {
    return { lat: 0, lng: 0 };
  }
  let latSum = 0;
  let lngSum = 0;
  for (const point of paths) {
    latSum += point.lat;
    lngSum += point.lng;
  }
  return {
    lat: latSum / paths.length,
    lng: lngSum / paths.length,
  };
};


export const defaultMapContainerStyle = {
  width: '100%',
  height: '100%',
};