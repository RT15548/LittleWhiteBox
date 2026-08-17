import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import {
    GENERATE_INTERCEPTOR_ORDER,
    registerGenerateInterceptor,
    unregisterGenerateInterceptor,
} from '../../../shared/common/generate-interceptor.js';

const registeredIds = new Set();

function deferred() {
    let resolve;
    const promise = new Promise(resolvePromise => {
        resolve = resolvePromise;
    });
    return { promise, resolve };
}

function register(id, handler, order) {
    registeredIds.add(id);
    registerGenerateInterceptor(id, handler, order);
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

test('dispatcher uses explicit module order instead of initialization order', async () => {
    const calls = [];
    register('ena-planner', () => calls.push('ena'), GENERATE_INTERCEPTOR_ORDER.ENA_PLANNER);
    register('story-summary', () => calls.push('story'), GENERATE_INTERCEPTOR_ORDER.STORY_SUMMARY);
    register('draw', () => calls.push('draw'), GENERATE_INTERCEPTOR_ORDER.DRAW);

    await globalThis.xiaobaixGenerateInterceptor([], 0, () => {}, 'normal');
    assert.deepEqual(calls, ['draw', 'story', 'ena']);
});

test('dispatcher exposes fresh per-run results to later handlers', async () => {
    const seenResults = [];
    const seenMaps = [];
    register('producer', () => ({ text: 'shared recall' }));
    register('consumer', (_chat, _size, _abort, _type, runContext) => {
        seenResults.push(runContext.results.get('producer'));
        seenMaps.push(runContext.results);
        assert.equal(runContext.results.has('consumer'), false);
    });

    await globalThis.xiaobaixGenerateInterceptor([], 0, () => {}, 'normal');
    await globalThis.xiaobaixGenerateInterceptor([], 0, () => {}, 'normal');

    assert.deepEqual(seenResults, [
        { text: 'shared recall' },
        { text: 'shared recall' },
    ]);
    assert.notEqual(seenMaps[0], seenMaps[1]);
});

test('a new dispatch immediately aborts the previous overlapping run', async () => {
    const firstStarted = deferred();
    const firstAbortCalls = [];
    let firstSignal = null;
    let calls = 0;
    register('test-overlap', async (_chat, _size, _abort, _type, runContext) => {
        calls++;
        if (calls !== 1) return;
        firstSignal = runContext.signal;
        firstStarted.resolve();
        await new Promise(resolve => {
            runContext.signal.addEventListener('abort', resolve, { once: true });
        });
    });

    const firstRun = globalThis.xiaobaixGenerateInterceptor(
        [],
        0,
        value => firstAbortCalls.push(value),
        'normal',
    );
    await firstStarted.promise;

    const secondRun = globalThis.xiaobaixGenerateInterceptor([], 0, () => {}, 'normal');
    assert.equal(firstSignal.aborted, true);
    assert.deepEqual(firstAbortCalls, [true]);

    await Promise.all([firstRun, secondRun]);
    assert.equal(calls, 2);
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

test('any abort call stops remaining handlers', async () => {
    const calls = [];
    const abortCalls = [];
    register('test-abort-false-a', (_chat, _size, abort) => {
        calls.push('a');
        abort(false);
    });
    register('test-abort-false-b', () => calls.push('b'));

    await globalThis.xiaobaixGenerateInterceptor([], 0, value => abortCalls.push(value), 'normal');
    assert.deepEqual(calls, ['a']);
    assert.deepEqual(abortCalls, [false]);
});

test('a running handler can abort its dispatch through runContext', async () => {
    const calls = [];
    const abortCalls = [];
    register('test-context-abort-a', (_chat, _size, _abort, _type, runContext) => {
        calls.push('a');
        assert.equal(runContext.signal.aborted, false);
        runContext.abort(true);
        assert.equal(runContext.signal.aborted, true);
    });
    register('test-context-abort-b', () => calls.push('b'));

    await globalThis.xiaobaixGenerateInterceptor([], 0, value => abortCalls.push(value), 'normal');
    assert.deepEqual(calls, ['a']);
    assert.deepEqual(abortCalls, [true]);
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
