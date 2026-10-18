import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { createXiaobaiOsFrameBridge, XIAOBAI_OS_FRAME_SOURCE, type XiaobaiOsFrameBridgeOptions } from '../host/frame-bridge.js';

function harness(t: TestContext, callbacks: Partial<XiaobaiOsFrameBridgeOptions> = {}) {
    const target = Object.assign(new EventTarget(), { location: { origin: 'http://host.test' } });
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
    Object.defineProperty(globalThis, 'window', { configurable: true, value: target });
    t.after(() => {
        if (previous) { Object.defineProperty(globalThis, 'window', previous); }
        else { Reflect.deleteProperty(globalThis, 'window'); }
    });
    const contentWindow = { postMessage() {} };
    const iframe = Object.assign(new EventTarget(), { contentWindow }) as unknown as HTMLIFrameElement;
    const bridge = createXiaobaiOsFrameBridge({ ...callbacks, iframe, windowTarget: target as unknown as Window });
    t.after(() => bridge.dispose());
    return {
        bridge,
        send(type: string, overrides: Record<string, unknown> = {}) {
            target.dispatchEvent(Object.assign(new Event('message'), {
                origin: target.location.origin, source: contentWindow,
                data: { source: XIAOBAI_OS_FRAME_SOURCE, type }, ...overrides,
            }));
        },
    };
}

test('frame callbacks log sync throws and async rejections instead of leaving rejected event tasks', async t => {
    const log = t.mock.method(console, 'error', () => undefined);
    const readyError = new Error('ready failed');
    const messageError = new Error('message failed');
    const h = harness(t, {
        onReady: () => { throw readyError; },
        onMessage: async () => { throw messageError; },
    });
    h.send('os/frame-ready');
    await setImmediate();
    h.send('app/request');
    await setImmediate();
    assert.deepEqual(log.mock.calls.map(call => call.arguments[1]), [readyError, messageError]);
});

test('untrusted, premature and disposed frame messages never invoke callbacks or report failures', async t => {
    const log = t.mock.method(console, 'error', () => undefined);
    const calls: string[] = [];
    const h = harness(t, {
        onReady: () => { calls.push('ready'); },
        onMessage: message => { calls.push(message.type); },
    });
    h.send('app/request');
    h.send('os/frame-ready', { origin: 'http://elsewhere.test' });
    h.send('os/frame-ready', { source: {} });
    h.send('os/frame-ready', { data: { source: 'wrong-channel', type: 'os/frame-ready' } });
    assert.equal(h.bridge.isReady(), false);
    h.send('os/frame-ready');
    h.send('app/accepted');
    h.bridge.dispose();
    h.send('app/late');
    await setImmediate();
    assert.deepEqual(calls, ['ready', 'app/accepted']);
    assert.equal(log.mock.callCount(), 0);
});
