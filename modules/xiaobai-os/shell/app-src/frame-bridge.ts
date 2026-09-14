export const XIAOBAI_OS_FRAME_SOURCE = 'LittleWhiteBox-XiaobaiOS';

export interface FrameMessage<T = unknown> {
    source: typeof XIAOBAI_OS_FRAME_SOURCE;
    type: string;
    requestId?: string;
    appId?: string;
    activationToken?: string;
    payload?: T;
}

export interface FrameAppSession {
    appId: string;
    activationToken: string;
}

export class HostRequestError extends Error {
    readonly code: string;
    readonly phase: string;
    readonly retryable: boolean;
    readonly requiresAppRetry: boolean;

    constructor(payload: {
        error?: string;
        message?: string;
        phase?: string;
        retryable?: boolean;
        requiresAppRetry?: boolean;
    }) {
        super(payload.message || payload.error || 'host_request_failed');
        this.name = 'HostRequestError';
        this.code = payload.error || 'host_request_failed';
        this.phase = payload.phase || 'host';
        this.retryable = payload.retryable !== false;
        this.requiresAppRetry = payload.requiresAppRetry === true;
    }
}

interface PendingRequest {
    resolve: (payload: unknown) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
    session: FrameAppSession | null;
}

function createRequestId(): string {
    return `xiaobai-os-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createFrameBridge() {
    const pending = new Map<string, PendingRequest>();
    const subscribers = new Set<(message: FrameMessage) => void>();
    let listening = false;
    let appSession: FrameAppSession | null = null;

    function post(type: string, payload: unknown = {}, requestId = ''): void {
        const includeSession = appSession
            && type !== 'app/activate'
            && type !== 'app/retry'
            && type !== 'os/frame-ready'
            && type !== 'os/close';
        const outgoingRequestId = includeSession && !requestId ? createRequestId() : requestId;
        parent.postMessage({
            source: XIAOBAI_OS_FRAME_SOURCE,
            type,
            requestId: outgoingRequestId,
            ...(includeSession ? appSession : {}),
            payload,
        }, window.location.origin);
    }

    function settle(message: FrameMessage): boolean {
        const requestId = String(message.requestId || '');
        if (!requestId) {
            return false;
        }
        const request = pending.get(requestId);
        if (!request) {
            return false;
        }
        if (
            request.session
            && (message.appId !== request.session.appId || message.activationToken !== request.session.activationToken)
        ) {
            return false;
        }
        pending.delete(requestId);
        clearTimeout(request.timer);
        const payload = message.payload as {
            ok?: boolean;
            error?: string;
            message?: string;
            phase?: string;
            retryable?: boolean;
            requiresAppRetry?: boolean;
        } | undefined;
        if (payload?.ok === false) {
            request.reject(new HostRequestError(payload));
        } else {
            request.resolve(payload);
        }
        return true;
    }

    function handleMessage(event: MessageEvent<FrameMessage>): void {
        if (event.origin !== window.location.origin || event.source !== parent) {
            return;
        }
        if (event.data?.source !== XIAOBAI_OS_FRAME_SOURCE || typeof event.data.type !== 'string') {
            return;
        }
        if (settle(event.data)) {
            return;
        }
        subscribers.forEach(subscriber => subscriber(event.data));
    }

    function announceReady(): void {
        post('os/frame-ready');
    }

    function start(): void {
        if (listening) {
            return;
        }
        listening = true;
        // The host origin, parent window and protocol source are checked above.
        // eslint-disable-next-line no-restricted-syntax
        window.addEventListener('message', handleMessage);
        // The host resets its channel on iframe load. Post readiness after the
        // document loads so that reset precedes delivery of this queued message.
        if (document.readyState === 'complete') {
            announceReady();
        } else {
            window.addEventListener('load', announceReady, { once: true });
        }
    }

    function request(type: string, payload: unknown = {}, timeoutMs = 15_000): Promise<unknown> {
        const requestId = createRequestId();
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                pending.delete(requestId);
                reject(new Error('host_request_timeout'));
            }, timeoutMs);
            pending.set(requestId, { resolve, reject, timer, session: appSession ? { ...appSession } : null });
            post(type, payload, requestId);
        });
    }

    function setAppSession(session: FrameAppSession): void {
        appSession = Object.freeze({ ...session });
    }

    function clearAppSession(): void {
        const previous = appSession;
        appSession = null;
        if (!previous) { return; }
        for (const [requestId, request] of pending) {
            if (request.session?.activationToken !== previous.activationToken) { continue; }
            clearTimeout(request.timer);
            request.reject(new Error('app_inactive'));
            pending.delete(requestId);
        }
    }

    function getAppSession(): FrameAppSession | null {
        return appSession ? { ...appSession } : null;
    }

    function subscribe(subscriber: (message: FrameMessage) => void): () => void {
        subscribers.add(subscriber);
        return () => subscribers.delete(subscriber);
    }

    function dispose(): void {
        window.removeEventListener('load', announceReady);
        if (listening) {
            window.removeEventListener('message', handleMessage);
        }
        listening = false;
        subscribers.clear();
        pending.forEach(request => {
            clearTimeout(request.timer);
            request.reject(new Error('frame_bridge_disposed'));
        });
        pending.clear();
        appSession = null;
    }

    return Object.freeze({
        start,
        post,
        request,
        subscribe,
        setAppSession,
        clearAppSession,
        getAppSession,
        dispose,
    });
}

export type XiaobaiOsFrameBridge = ReturnType<typeof createFrameBridge>;
