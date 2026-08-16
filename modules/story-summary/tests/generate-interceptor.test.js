import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import {
    registerGenerateInterceptor,
    unregisterGenerateInterceptor,
} from '../../../shared/common/generate-interceptor.js';

const registeredIds = new Set();

function register(id, handler) {
    registeredIds.add(id);
    registerGenerateInterceptor(id, handler);
}

afterEach(() => {
    for (const id of registeredIds) unregisterGenerateInterceptor(id);
    registeredIds.clear();
});

test('dispatcher awaits handlers in registration order', async () => {
    const calls = [];
    register('test-order-a', async () => {
        calls.push('a:start');
        await Promise.resolve();
        calls.push('a:end');
    });
    register('test-order-b', () => calls.push('b'));

    await globalThis.xiaobaixGenerateInterceptor([], 0, () => {}, 'normal');
    assert.deepEqual(calls, ['a:start', 'a:end', 'b']);
});

test('dispatcher isolates a failed handler', async () => {
    const calls = [];
    register('test-error-a', () => {
        throw new Error('expected test failure');
    });
    register('test-error-b', () => calls.push('b'));

    await globalThis.xiaobaixGenerateInterceptor([], 0, () => {}, 'normal');
    assert.deepEqual(calls, ['b']);
});

test('abort true is sticky and stops remaining handlers', async () => {
    const calls = [];
    const abortCalls = [];
    register('test-abort-a', (_chat, _size, abort) => {
        calls.push('a');
        abort(true);
        abort(false);
    });
    register('test-abort-b', () => calls.push('b'));

    await globalThis.xiaobaixGenerateInterceptor([], 0, value => abortCalls.push(value), 'normal');
    assert.deepEqual(calls, ['a']);
    assert.deepEqual(abortCalls, [true]);
});

test('abort false preserves host semantics and does not short-circuit', async () => {
    const calls = [];
    const abortCalls = [];
    register('test-abort-false-a', (_chat, _size, abort) => {
        calls.push('a');
        abort(false);
    });
    register('test-abort-false-b', () => calls.push('b'));

    await globalThis.xiaobaixGenerateInterceptor([], 0, value => abortCalls.push(value), 'normal');
    assert.deepEqual(calls, ['a', 'b']);
    assert.deepEqual(abortCalls, [false]);
});

test('dispatcher forwards continue type unchanged', async () => {
    const types = [];
    register('test-continue', (_chat, _size, _abort, type) => types.push(type));

    await globalThis.xiaobaixGenerateInterceptor([], 0, () => {}, 'continue');
    assert.deepEqual(types, ['continue']);
});

test('unregistering the final handler removes the global entry', () => {
    register('test-cleanup', () => {});
    unregisterGenerateInterceptor('test-cleanup');
    registeredIds.delete('test-cleanup');

    assert.equal(globalThis.xiaobaixGenerateInterceptor, undefined);
});
