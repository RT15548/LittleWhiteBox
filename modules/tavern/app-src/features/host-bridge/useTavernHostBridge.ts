const SOURCE_APP = 'xb-tavern-app';
const SOURCE_HOST = 'xb-tavern-host';

interface PendingHostRequest {
    resolve: (value: Record<string, unknown>) => void;
    reject: (error: Error) => void;
    type: string;
    abort?: () => void;
    signal?: AbortSignal;
}

export type TavernHostMessageData = {
    source?: string;
    type?: string;
    payload?: Record<string, unknown>;
    [key: string]: unknown;
};

export type TavernHostMessageHandler = (data: TavernHostMessageData) => boolean | void;

export interface TavernHostBridgeOptions {
    onHostRequestResolved?: (type: string) => void;
}

function clonePostMessagePayload<T>(value: T): T {
    const seen = new WeakSet<object>();
    try {
        return JSON.parse(JSON.stringify(value, (_key, item) => {
            if (typeof item === 'bigint') {return String(item);}
            if (typeof item === 'function' || typeof item === 'symbol') {return undefined;}
            if (!item || typeof item !== 'object') {return item;}
            if (seen.has(item)) {return undefined;}
            seen.add(item);
            return item;
        })) as T;
    } catch {
        return {} as T;
    }
}

function createAbortError() {
    try {
        return new DOMException('request_aborted', 'AbortError') as unknown as Error;
    } catch {
        return new Error('request_aborted');
    }
}

export function useTavernHostBridge(options: TavernHostBridgeOptions = {}) {
    const pendingHostRequests = new Map<string, PendingHostRequest>();
    const messageHandlers: TavernHostMessageHandler[] = [];
    let mounted = false;

    function postToHost(type: string, payload: Record<string, unknown> = {}) {
        const safePayload = clonePostMessagePayload(payload);
        window.parent?.postMessage({ source: SOURCE_APP, type, payload: safePayload }, window.location.origin);
    }

    function reportStartupProgress(percent: number, action: string) {
        postToHost('xb-tavern:startup-progress', { percent, action });
    }

    function createHostRequestId(prefix = 'host') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function requestHost(type: string, payload: Record<string, unknown> = {}, requestOptions: { signal?: AbortSignal; requestId?: string } = {}) {
        const requestId = String(requestOptions.requestId || '').trim() || createHostRequestId();
        if (requestOptions.signal?.aborted) {
            return Promise.reject(createAbortError());
        }
        postToHost(type, { ...payload, requestId });
        return new Promise<Record<string, unknown>>((resolve, reject) => {
            const cleanup = () => {
                const pending = pendingHostRequests.get(requestId);
                if (pending?.abort && requestOptions.signal) {
                    requestOptions.signal.removeEventListener('abort', pending.abort);
                }
                pendingHostRequests.delete(requestId);
            };
            const abort = () => {
                cleanup();
                postToHost('xb-tavern:cancel-request', { requestId });
                reject(createAbortError());
            };
            if (requestOptions.signal) {
                requestOptions.signal.addEventListener('abort', abort, { once: true });
            }
            pendingHostRequests.set(requestId, {
                resolve,
                reject,
                type,
                abort: requestOptions.signal ? abort : undefined,
                signal: requestOptions.signal,
            });
        });
    }

    function resolveHostRequest(payload: Record<string, unknown> = {}) {
        const requestId = String(payload.requestId || '');
        const pending = pendingHostRequests.get(requestId);
        if (!pending) {return;}
        if (pending.abort && pending.signal) {
            pending.signal.removeEventListener('abort', pending.abort);
        }
        pendingHostRequests.delete(requestId);
        if (payload.ok === false) {
            const errorText = String(payload.error || 'host_request_failed');
            const error = new Error(`${pending.type}: ${errorText}`);
            const errorStack = String(payload.errorStack || '');
            if (errorStack) {
                error.stack = `${error.message}\n${errorStack}`;
            }
            console.error('[小白酒馆] host request failed', {
                type: pending.type,
                error: errorText,
                errorName: String(payload.errorName || ''),
                errorStack,
            });
            pending.reject(error);
            return;
        }
        pending.resolve(payload);
        options.onHostRequestResolved?.(pending.type);
    }

    function addMessageHandler(handler: TavernHostMessageHandler) {
        messageHandlers.push(handler);
        return () => {
            const index = messageHandlers.indexOf(handler);
            if (index >= 0) {
                messageHandlers.splice(index, 1);
            }
        };
    }

    function onHostMessage(event: MessageEvent) {
        if (event.origin !== window.location.origin) {return;}
        const data = event.data || {};
        if (data.source !== SOURCE_HOST) {return;}
        if (data.type === 'xb-tavern:host-result') {
            resolveHostRequest(data.payload || {});
            return;
        }
        for (const handler of messageHandlers) {
            if (handler(data)) {return;}
        }
    }

    function mount() {
        if (mounted) {return;}
        mounted = true;
        // onHostMessage validates origin and message source before accepting payloads.
        // eslint-disable-next-line no-restricted-syntax
        window.addEventListener('message', onHostMessage);
    }

    function dispose(error: Error = new Error('tavern_host_bridge_disposed')) {
        if (mounted) {
            window.removeEventListener('message', onHostMessage);
            mounted = false;
        }
        pendingHostRequests.forEach((request) => {
            if (request.abort && request.signal) {
                request.signal.removeEventListener('abort', request.abort);
            }
            request.reject(error);
        });
        pendingHostRequests.clear();
        messageHandlers.length = 0;
    }

    return {
        addMessageHandler,
        createHostRequestId,
        dispose,
        mount,
        postToHost,
        reportStartupProgress,
        requestHost,
    };
}
