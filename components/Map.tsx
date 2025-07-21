import { GoogleMap } from "@react-google-maps/api";
import MapProvider from "@/providers/map-provider";

const defaultMapContainerStyle = {
    width: '100%',
    height: '100%',
};

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

export default function Map(props: any) {

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