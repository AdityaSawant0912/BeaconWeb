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

    // Redefine GeoFence to use 'paths' for polygon vertices
    export interface GeoFence {
        id: string;
        name: string;
        paths: LatLngLiteral[]; // Array of coordinates for the polygon
        color: string;
    }
    var mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | mongoose | null } | undefined;
}