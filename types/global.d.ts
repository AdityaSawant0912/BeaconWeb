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
        [key: string]: (args: FunctionMapArgs) => string | object | void ;
    };
    type FunctionMapArgs = {
        [key: string]: value
    }
}