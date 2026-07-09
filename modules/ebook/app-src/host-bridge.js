import { setHostChatCompletionsRequestHeadersProvider } from '../../../shared/host-llm/chat-completions/client.js';
import {
    EBOOK_APP_SOURCE,
    EBOOK_HOST_REQUEST_TIMEOUT_MS,
    EBOOK_HOST_SOURCE,
} from './constants.js';

function createRequestId(prefix = 'req') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEbookHostBridge(options = {}) {
    const appSource = options.appSource || EBOOK_APP_SOURCE;
    const hostSource = options.hostSource || EBOOK_HOST_SOURCE;
    const timeoutMs = Number(options.timeoutMs) || EBOOK_HOST_REQUEST_TIMEOUT_MS;
    const pendingRequests = new Map();
    let stopListening = null;

    function postToHost(type, payload = {}) {
        parent.postMessage({
            source: appSource,
            type,
            payload,
        }, window.location.origin);
    }

    function requestHost(type, payload = {}, requestOptions = {}) {
        const requestId = createRequestId('host');
        postToHost(type, { ...payload, requestId });
        return new Promise((resolve, reject) => {
            const requestTimeoutMs = Number(requestOptions.timeoutMs) || timeoutMs;
            const signal = requestOptions.signal;
            let settled = false;
            const timer = setTimeout(() => {
                settled = true;
                pendingRequests.delete(requestId);
                signal?.removeEventListener?.('abort', abortRequest);
                reject(new Error('host_request_timeout'));
            }, requestTimeoutMs);
            const settle = (callback, value) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                signal?.removeEventListener?.('abort', abortRequest);
                pendingRequests.delete(requestId);
                callback(value);
            };
            const abortRequest = () => {
                postToHost('xb-ebook:cancel-request', { requestId });
                settle(reject, new Error('已取消'));
            };
            pendingRequests.set(requestId, {
                resolve: (value) => settle(resolve, value),
                reject: (error) => settle(reject, error),
                timer,
            });
            if (signal?.aborted) {
                abortRequest();
            } else {
                signal?.addEventListener?.('abort', abortRequest, { once: true });
            }
        });
    }

    function resolveHostRequest(payload = {}) {
        const requestId = String(payload?.requestId || '');
        const pending = pendingRequests.get(requestId);
        if (!pending) return;
        if (payload?.ok === false) {
            pending.reject(new Error(payload?.error || 'host_request_failed'));
        } else {
            pending.resolve(payload);
        }
    }

    function start(handlers = {}) {
        if (stopListening) return stopListening;
        const onConfig = typeof handlers.onConfig === 'function' ? handlers.onConfig : null;
        const onOpenSettings = typeof handlers.onOpenSettings === 'function' ? handlers.onOpenSettings : null;
        const onDrawProgress = typeof handlers.onDrawProgress === 'function' ? handlers.onDrawProgress : null;
        const onTtsState = typeof handlers.onTtsState === 'function' ? handlers.onTtsState : null;
        const handleMessage = (event) => {
            if (event.origin !== window.location.origin || event.source !== parent) return;
            const data = event.data || {};
            if (data.source !== hostSource) return;
            if (data.type === 'xb-ebook:config') {
                const hostRequestHeaders = data.payload?.hostRequestHeaders && typeof data.payload.hostRequestHeaders === 'object'
                    ? data.payload.hostRequestHeaders
                    : {};
                setHostChatCompletionsRequestHeadersProvider(async () => {
                    try {
                        const result = await requestHost('xb-ebook:get-host-request-headers', {}, { timeoutMs: 5000 });
                        return result?.hostRequestHeaders && typeof result.hostRequestHeaders === 'object'
                            ? result.hostRequestHeaders
                            : hostRequestHeaders;
                    } catch {
                        return hostRequestHeaders;
                    }
                });
                onConfig?.(data.payload || {});
                return;
            }
            if (data.type === 'xb-ebook:open-settings') {
                onOpenSettings?.();
                return;
            }
            if (data.type === 'xb-ebook:host-result') {
                resolveHostRequest(data.payload || {});
                return;
            }
            if (data.type === 'xb-ebook:draw-progress') {
                onDrawProgress?.(data.payload || {});
                return;
            }
            if (data.type === 'xb-ebook:tts-state') {
                onTtsState?.(data.payload || {});
            }
        };

        // The host origin/source are checked before handling messages.
        // eslint-disable-next-line no-restricted-syntax
        window.addEventListener('message', handleMessage);
        stopListening = () => {
            window.removeEventListener('message', handleMessage);
            stopListening = null;
        };
        return stopListening;
    }

    function dispose() {
        stopListening?.();
        pendingRequests.forEach((pending) => {
            clearTimeout(pending.timer);
            pending.reject(new Error('ebook_host_bridge_disposed'));
        });
        pendingRequests.clear();
    }

    return {
        postToHost,
        requestHost,
        start,
        dispose,
    };
}
