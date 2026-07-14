import test from 'node:test';
import assert from 'node:assert/strict';

import {
    useTavernRuntimeDisplayProjection,
    type TavernRuntimeDisplayRegexRequest,
} from '../app-src/features/chat-render/useTavernRuntimeDisplayProjection';

function request(key: string, text = key): TavernRuntimeDisplayRegexRequest {
    return {
        key,
        text,
        placement: 'aiOutput',
        options: { isMarkdown: true, depth: 0 },
    };
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
}

function fakeTimers() {
    let serial = 0;
    const timers = new Map<number, { callback: () => void; delay: number }>();
    return {
        setTimer(callback: () => void, delay: number) {
            serial += 1;
            timers.set(serial, { callback, delay });
            return serial as unknown as ReturnType<typeof setTimeout>;
        },
        clearTimer(timer: ReturnType<typeof setTimeout>) {
            timers.delete(timer as unknown as number);
        },
        runNext() {
            const entry = timers.entries().next().value as [number, { callback: () => void; delay: number }] | undefined;
            if (!entry) {return null;}
            timers.delete(entry[0]);
            entry[1].callback();
            return entry[1].delay;
        },
        get size() {
            return timers.size;
        },
    };
}

async function flushPromises() {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
}

test('runtime display projection keeps the existing 200ms latest-only throttle', async () => {
    const timers = fakeTimers();
    const resolvedKeys: string[] = [];
    const controller = useTavernRuntimeDisplayProjection({
        throttleMs: 200,
        setTimer: timers.setTimer,
        clearTimer: timers.clearTimer,
        resolveText: async (input) => {
            resolvedKeys.push(input.key);
            return `regex:${input.text}`;
        },
        projectText: (text) => ({ text, actionCheckEvents: [] }),
    });

    controller.setMessageInput(request('a'));
    controller.setMessageInput(request('b'));

    assert.equal(timers.size, 1);
    assert.equal(timers.runNext(), 200);
    await flushPromises();

    assert.deepEqual(resolvedKeys, ['b']);
    assert.equal(controller.messageProjection.value.text, 'regex:b');
});

test('runtime display projection serializes requests and never publishes a stale full-text result', async () => {
    const timers = fakeTimers();
    const runs = new Map<string, ReturnType<typeof deferred<string>>>();
    const started: string[] = [];
    const controller = useTavernRuntimeDisplayProjection({
        throttleMs: 200,
        setTimer: timers.setTimer,
        clearTimer: timers.clearTimer,
        resolveText: (input) => {
            started.push(input.key);
            const run = deferred<string>();
            runs.set(input.key, run);
            return run.promise;
        },
        projectText: (text) => ({ text, actionCheckEvents: [] }),
    });

    controller.setMessageInput(request('a'));
    timers.runNext();
    controller.setMessageInput(request('b'));
    runs.get('a')?.resolve('stale-a');
    await flushPromises();

    assert.deepEqual(started, ['a', 'b']);
    assert.equal(controller.messageProjection.value.text, '');

    runs.get('b')?.resolve('fresh-b');
    await flushPromises();
    assert.equal(controller.messageProjection.value.text, 'fresh-b');
});

test('clearing a live turn releases timers and ignores an already in-flight result', async () => {
    const timers = fakeTimers();
    const run = deferred<string>();
    const controller = useTavernRuntimeDisplayProjection({
        throttleMs: 200,
        setTimer: timers.setTimer,
        clearTimer: timers.clearTimer,
        resolveText: () => run.promise,
        projectText: (text) => ({ text, actionCheckEvents: [] }),
    });

    controller.setMessageInput(request('a'));
    timers.runNext();
    controller.clear();
    run.resolve('late-result');
    await flushPromises();

    assert.equal(timers.size, 0);
    assert.equal(controller.messageProjection.value.text, '');
    assert.deepEqual(controller.thoughtBlocks.value, []);
});

test('runtime regex failure preserves the latest raw display text without entering a history cache', async () => {
    const timers = fakeTimers();
    const errors: unknown[] = [];
    const controller = useTavernRuntimeDisplayProjection({
        throttleMs: 200,
        setTimer: timers.setTimer,
        clearTimer: timers.clearTimer,
        resolveText: async () => {
            throw new Error('regex failed');
        },
        projectText: (text) => ({ text, actionCheckEvents: [] }),
        onError: (error) => errors.push(error),
    });

    controller.setMessageInput(request('a', 'raw text'));
    timers.runNext();
    await flushPromises();

    assert.equal(errors.length, 1);
    assert.equal(controller.messageProjection.value.text, 'raw text');
});
