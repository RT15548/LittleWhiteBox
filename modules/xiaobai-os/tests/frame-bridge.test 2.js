import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createXiaobaiOsFrameBridge,
    XIAOBAI_OS_FRAME_SOURCE,
} from '../host/frame-bridge.js';

function createEventTarget(origin = 'https://example.test') {
    const listeners = new Map();
    return {
        location: { origin },
        addEventListener(type, listener) {
            if (!listeners.has(type)) listeners.set(type, new Set());
            listeners.get(type).add(listener);
        },
        removeEventListener(type, listener) {
            listeners.get(type)?.delete(listener);
        },
        emit(type, event = {}) {
            listeners.get(type)?.forEach(listener => listener(event));
        },
        listenerCount(type) {
            return listeners.get(type)?.size || 0;
        },
    };
}

test('accepts only the trusted origin, frame window and protocol source', () => {
    const previousWindow = globalThis.window;
    const windowTarget = createEventTarget();
    globalThis.window = windowTarget;
    const iframeTarget = { messages: [], postMessage(message, origin) { this.messages.push({ message, origin }); } };
    const iframeEvents = createEventTarget();
    const iframe = { ...iframeEvents, contentWindow: iframeTarget };
    let readyCount = 0;
    let messageCount = 0;
    const bridge = createXiaobaiOsFrameBridge({
        iframe,
        windowTarget,
        onReady: () => { readyCount += 1; },
        onMessage: () => { messageCount += 1; },
    });
    const ready = {
        data: { source: XIAOBAI_OS_FRAME_SOURCE, type: 'os/frame-ready' },
        origin: windowTarget.location.origin,
        source: iframeTarget,
    };

    try {
        assert.equal(bridge.post('os/init'), false);
        windowTarget.emit('message', { ...ready, origin: 'https://evil.test' });
        windowTarget.emit('message', { ...ready, source: {} });
        windowTarget.emit('message', { ...ready, data: { source: 'wrong', type: 'os/frame-ready' } });
        assert.equal(readyCount, 0);

        windowTarget.emit('message', ready);
        assert.equal(readyCount, 1);
        assert.equal(bridge.post('os/init', { theme: 'dark' }), true);
        assert.equal(iframeTarget.messages.length, 1);
        assert.equal(iframeTarget.messages[0].origin, windowTarget.location.origin);

        assert.equal(bridge.post('map/state', {}, '', { appId: 'map', activationToken: 'token-a' }), true);
        assert.equal(iframeTarget.messages[1].message.appId, 'map');
        assert.equal(iframeTarget.messages[1].message.activationToken, 'token-a');
        assert.notEqual(iframeTarget.messages[1].message.requestId, '');

        windowTarget.emit('message', {
            ...ready,
            data: { source: XIAOBAI_OS_FRAME_SOURCE, type: 'app/activate' },
        });
        assert.equal(messageCount, 1);

        iframe.emit('load');
        assert.equal(bridge.post('os/init'), false);
        bridge.dispose();
        assert.equal(windowTarget.listenerCount('message'), 0);
    } finally {
        globalThis.window = previousWindow;
    }
});
