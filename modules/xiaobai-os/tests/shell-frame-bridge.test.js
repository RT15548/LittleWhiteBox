import assert from 'node:assert/strict';
import test from 'node:test';

import { createFrameBridge, XIAOBAI_OS_FRAME_SOURCE } from '../shell/app-src/frame-bridge.js';

function createShell(t, readyState = 'loading') {
    const previous = new Map(['window', 'document', 'parent'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    const windowTarget = new EventTarget();
    windowTarget.location = { origin: 'https://example.test' };
    const documentTarget = { readyState };
    const messages = [];
    Object.assign(globalThis, {
        window: windowTarget,
        document: documentTarget,
        parent: { postMessage: (message, origin) => messages.push({ message, origin }) },
    });
    const bridge = createFrameBridge();
    t.after(() => {
        bridge.dispose();
        for (const [key, descriptor] of previous) {
            if (descriptor) { Object.defineProperty(globalThis, key, descriptor); }
            else { delete globalThis[key]; }
        }
    });
    return {
        bridge,
        messages,
        finishLoading() {
            documentTarget.readyState = 'complete';
            windowTarget.dispatchEvent(new Event('load'));
        },
    };
}

// The parent resets its channel on iframe load. Announcing readiness before
// that event leaves an initialized desktop whose application requests time out.
for (const readyState of ['loading', 'interactive']) {
    test(`a shell in the ${readyState} state announces readiness only after load`, t => {
        const shell = createShell(t, readyState);
        shell.bridge.start();
        shell.bridge.start();
        assert.deepEqual(shell.messages, []);

        shell.finishLoading();
        assert.deepEqual(shell.messages, [{
            message: { source: XIAOBAI_OS_FRAME_SOURCE, type: 'os/frame-ready', requestId: '', payload: {} },
            origin: 'https://example.test',
        }]);
        shell.bridge.start();
        shell.finishLoading();
        assert.equal(shell.messages.length, 1);
    });
}

test('a shell started after load still announces readiness once', t => {
    const shell = createShell(t, 'complete');
    shell.bridge.start();
    shell.bridge.start();
    assert.equal(shell.messages.length, 1);
    assert.equal(shell.messages[0].message.type, 'os/frame-ready');
});

test('disposing during loading prevents a late readiness announcement', t => {
    const shell = createShell(t);
    shell.bridge.start();
    shell.bridge.dispose();
    shell.finishLoading();
    assert.deepEqual(shell.messages, []);
});
