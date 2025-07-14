export default function isInWebView() {
    return typeof window.ReactNativeWebView !== 'undefined';
}