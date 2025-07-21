export { }

declare global {
    interface Window {
        ReactNativeWebView: {
            postMessage: (message: string) => void,
            onMessage: (event) => void
        },
        chrome: Chrome,
        onMessageFromNative: (message: string) => void

    }
    interface Chrome {
        webview: WebView2;
    }
    type WebView2 = object
    interface WebViewMessage {
        data: object
    }
    type FunctionMap = {
        [key: string]: (args: FunctionMapArgs) => string | object | void;
    };
    type FunctionMapArgs = {
        [key: string]: value
    }
    // Define a type for a LatLng literal
    interface LatLngLiteral {
        lat: number;
        lng: number;
    }

    // Redefine GeoFence to use 'paths' for polygon vertices
    export interface GeoFence {
        id: string;
        name: string;
        paths: LatLngLiteral[]; // Array of coordinates for the polygon
        color: string;
    }
    var mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | mongoose | null } | undefined;
}