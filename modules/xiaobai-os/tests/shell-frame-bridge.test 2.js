import assert from 'node:assert/strict';
import test from 'node:test';

import { createFrameBridge, FrameRequestError, XIAOBAI_OS_FRAME_SOURCE } from '../shell/app-src/frame-bridge.js';

function createShell(t, readyState = 'loading') {
    const previous = new Map(['window', 'document', 'parent'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    const windowTarget = new EventTarget();
    windowTarget.location = { origin: 'https://example.test' };
    const documentTarget = { readyState };
    const messages = [];
    Object.assign(globalThis, {
        window: windowTarget,
        document: documentTarget,
        // Mirror the browser's structured-clone boundary, not a direct method call.
        parent: { postMessage: (message, origin) => messages.push({ message: structuredClone(message), origin }) },
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

test('a request that cannot be sent has no delivery or orphaned timeout', async t => {
    const shell = createShell(t);
    const cancelled = [];
    const clear = globalThis.clearTimeout;
    t.mock.method(globalThis, 'clearTimeout', timer => { cancelled.push(timer); clear(timer); });
    await assert.rejects(shell.bridge.request('learning/explain', { selection: new Proxy({}, {}) }), error => {
        assert.ok(error instanceof FrameRequestError);
        assert.equal(error.code, 'host_request_not_sent');
        assert.equal(error.cause.name, 'DataCloneError');
        return true;
    });
    assert.equal(shell.messages.length, 0);
    assert.equal(cancelled.length, 1);
    shell.bridge.dispose();
    assert.equal(cancelled.length, 1); // Failed sends were removed from the pending map too.
});

test('a delivered request without acknowledgement is unknown, not safe to resend', async t => {
    const shell = createShell(t);
    await assert.rejects(shell.bridge.request('learning/talk', { message: 'Hello' }, 1), error => {
        assert.ok(error instanceof FrameRequestError);
        assert.equal(error.code, 'host_request_timeout');
        return true;
    });
    assert.equal(shell.messages.length, 1);
});
