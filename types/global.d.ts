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
    var mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | mongoose | null } | undefined;
    
    type APIError = unknown
}