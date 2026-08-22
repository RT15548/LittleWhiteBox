import test from 'node:test';
import assert from 'node:assert/strict';

import { useTavernHostBridge } from '../app-src/features/host-bridge/useTavernHostBridge';

test('Tavern host requests time out and ignore late host results', async () => {
    const originalWindow = globalThis.window;
    const listeners = new Map<string, EventListener>();
    const posts: Array<Record<string, unknown>> = [];
    const fakeWindow = {
        location: { origin: 'https://tavern.test' },
        parent: {
            postMessage(message: Record<string, unknown>) {
                posts.push(message);
            },
        },
        addEventListener(type: string, listener: EventListener) {
            listeners.set(type, listener);
        },
        removeEventListener(type: string) {
            listeners.delete(type);
        },
    };
    Object.defineProperty(globalThis, 'window', { configurable: true, value: fakeWindow });
    const bridge = useTavernHostBridge();
    bridge.mount();

    try {
        await assert.rejects(
            bridge.requestHost('xb-tavern:get-host-request-headers', {}, {
                requestId: 'headers-request',
                timeoutMs: 5,
            }),
            /host_request_timeout/,
        );
        assert.equal(posts.length, 1);

        assert.doesNotThrow(() => listeners.get('message')?.({
            origin: 'https://tavern.test',
            data: {
                source: 'xb-tavern-host',
                type: 'xb-tavern:host-result',
                payload: { requestId: 'headers-request', ok: true },
            },
        } as unknown as Event));
    } finally {
        bridge.dispose();
        Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
    }
});
