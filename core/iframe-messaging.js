export function getTrustedOrigin() {
    return window.location.origin;
}

export function getIframeTargetOrigin(iframe) {
    const sandbox = iframe?.getAttribute?.('sandbox') || '';
    if (sandbox && !sandbox.includes('allow-same-origin')) return 'null';
    return getTrustedOrigin();
}

export function postToIframe(iframe, payload, source, targetOrigin = null) {
    if (!iframe?.contentWindow) return false;
    const message = source ? { source, ...payload } : payload;
    const origin = targetOrigin || getTrustedOrigin();
    iframe.contentWindow.postMessage(message, origin);
    return true;
}

export function isTrustedIframeEvent(event, iframe) {
    return !!iframe && event.origin === getTrustedOrigin() && event.source === iframe.contentWindow;
}

export function isTrustedMessage(event, iframe, expectedSource) {
    if (!isTrustedIframeEvent(event, iframe)) return false;
    if (expectedSource && event?.data?.source !== expectedSource) return false;
    return true;
}
