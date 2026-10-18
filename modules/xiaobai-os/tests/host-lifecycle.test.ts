import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { parseHTML } from 'linkedom';
import { createXiaobaiOsLifecycle, type XiaobaiOsLifecycleOptions } from '../host/lifecycle.js';
import type { XiaobaiOsFrameBridgeOptions } from '../host/frame-bridge.js';

function harness(t: TestContext, options: XiaobaiOsLifecycleOptions = {}) {
    const { document, window } = parseHTML('<html><head></head><body><button id="send_but"></button></body></html>');
    // linkedom has no modal-dialog implementation; only lifecycle transitions are under test.
    const createElement = document.createElement.bind(document);
    t.mock.method(document, 'createElement', ((name: string) => {
        const element = createElement(name);
        if (name === 'dialog') {
            Object.assign(element, { showModal() {}, close() {} });
        }
        return element;
    }) as typeof document.createElement);
    let frameOptions: XiaobaiOsFrameBridgeOptions | undefined;
    const bridge = { post: () => true, isReady: () => true, dispose() {} };
    const lifecycle = createXiaobaiOsLifecycle({
        documentTarget: document as unknown as Document,
        windowTarget: window as unknown as Window,
        stylesheetHref: '/host.css', frameSrc: '/os.html',
        captureChatBinding: () => ({
            identityKey: 'chat-a', binding: { kind: 'character', ownerLocator: 'avatar.png', chatId: 'chat-a' }, reference: null,
        }),
        bridgeFactory: value => { frameOptions = value; return bridge; },
        ...options,
    });
    t.after(async () => { await lifecycle.cleanup(); });
    return { lifecycle, document, window, bridge, frameOptions: () => frameOptions };
}

test('a failing background start and failing error owner are observed without adding a dialog', async t => {
    const log = t.mock.method(console, 'error', () => undefined);
    const error = new Error('background start failed');
    const reportingError = new Error('owner failed');
    const h = harness(t, {
        appRuntime: { startBackground: async () => { throw error; } },
        onError: () => { throw reportingError; },
    });
    assert.equal(h.lifecycle.init(), true);
    await setImmediate();
    assert.deepEqual(log.mock.calls[0].arguments[1], { error, reportingError });
    assert.equal(h.document.querySelectorAll('dialog').length, 0);
    await h.lifecycle.cleanup();
    assert.equal(h.lifecycle.isInitialized(), false);
});

test('window close and global cleanup report failures while completing the remaining release steps', async t => {
    const failures: unknown[] = [];
    const closedError = new Error('window close failed');
    const cancelError = new Error('cancel failed');
    const stopError = new Error('stop failed');
    const calls: string[] = [];
    const h = harness(t, {
        onError: error => { failures.push(error); },
        appRuntime: {
            handleWindowClosed: async () => { calls.push('closed'); throw closedError; },
            cancelAll: async () => { calls.push('cancel'); throw cancelError; },
            stopBackground: async () => { calls.push('stop'); throw stopError; },
        },
    });
    h.lifecycle.init();
    assert.equal(h.lifecycle.open(), true);
    assert.ok(h.frameOptions());
    await h.lifecycle.closeWindow();
    assert.equal(h.lifecycle.isOpen(), false);
    assert.deepEqual(failures, [closedError]);
    await h.lifecycle.cleanup();
    assert.ok(calls.includes('cancel'));
    assert.ok(calls.includes('stop'));
    assert.ok(failures.includes(cancelError));
    assert.ok(failures.includes(stopError));
    assert.equal(h.document.querySelectorAll('dialog').length, 0);
    assert.equal(h.document.getElementById('xiaobaix-os-button'), null);
});

test('a failed window-open task is logged once and cannot publish a successful init snapshot', async t => {
    const error = new Error('window open failed');
    const failures: unknown[] = [];
    const h = harness(t, {
        onError: failure => { failures.push(failure); },
        appRuntime: { handleWindowOpened: async () => { throw error; } },
    });
    const post = t.mock.method(h.bridge, 'post', () => true);
    h.lifecycle.init();
    h.lifecycle.open();
    await h.frameOptions()?.onReady?.(h.bridge);
    await setImmediate();
    assert.deepEqual(failures, [error]);
    assert.equal(post.mock.callCount(), 1);
    // A failure response is still posted to the requester, never an init snapshot.
    assert.equal((post.mock.calls[0].arguments as unknown[])[0], 'os/error');
});
