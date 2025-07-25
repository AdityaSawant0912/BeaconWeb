import { GoogleMap } from "@react-google-maps/api";
import MapProvider from "@/providers/map-provider";
import { defaultMapContainerStyle } from "@/utils/mapUtils";

const mapStyles = [
    {
        featureType: "poi.business",
        stylers: [{ visibility: "off" }],
    },
    {
        featureType: "transit",
        elementType: "labels.icon",
        stylers: [{ visibility: "off" }],
    },
];

const defaultZoom = 18;
const defaultCenter = { lat: 0, lng: 0 }
const defaultMapOptions = {
    zoomControl: true,
    tilt: 0,
    gestureHandling: 'auto',
    fullscreenControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    scaleControl: false,
    cameraControl: false,
    mapStyles: mapStyles

};

interface MapProps {
    options?: typeof defaultMapOptions;
    center?: typeof defaultCenter;
    zoom?: number;
    onLoad?: (map: google.maps.Map) => void;
    children?: React.ReactNode;
    onClick?: (e: google.maps.MapMouseEvent) => void;
}

export default function Map(props: MapProps) {

    const {
        options = defaultMapOptions,
        center = defaultCenter,
        zoom = defaultZoom,
        onLoad,
        children,
        onClick
    } = props

    return (
        <MapProvider>
            <GoogleMap  mapContainerStyle={defaultMapContainerStyle} options={options} center={center} zoom={zoom} onLoad={onLoad} onClick={onClick}>
                {children}
            </GoogleMap>
        </MapProvider>
    )
}