import assert from 'node:assert/strict';
import test from 'node:test';
import { createSerialImageRequestQueue } from '../../draw/shared/serial-image-request-queue.js';

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<T>((nextResolve, nextReject) => {
        resolve = nextResolve;
        reject = nextReject;
    });
    return { promise, reject, resolve };
}

async function waitFor(predicate: () => boolean): Promise<void> {
    for (let index = 0; index < 40; index += 1) {
        if (predicate()) { return; }
        await new Promise<void>((resolve) => setImmediate(resolve));
    }
    assert.fail('condition_not_reached');
}

test('provider queue returns the completed image immediately but blocks the next request until cooldown ends', async () => {
    const firstRun = deferred<string>();
    const firstCooldown = deferred<void>();
    const cooldowns: number[] = [];
    const starts: string[] = [];
    let active = 0;
    let maxActive = 0;
    const queue = createSerialImageRequestQueue({
        getCooldownMs: () => 17500,
        waitForCooldown: async (duration: number) => {
            cooldowns.push(duration);
            if (cooldowns.length === 1) { await firstCooldown.promise; }
        },
    });

    const first = queue.enqueue(async () => {
        starts.push('first');
        active += 1;
        maxActive = Math.max(maxActive, active);
        try {
            return await firstRun.promise;
        } finally {
            active -= 1;
        }
    });
    const second = queue.enqueue(async () => {
        starts.push('second');
        active += 1;
        maxActive = Math.max(maxActive, active);
        active -= 1;
        return 'second-image';
    });

    firstRun.resolve('first-image');
    assert.equal(await first, 'first-image');
    await waitFor(() => cooldowns.length === 1);
    assert.deepEqual(starts, ['first']);
    assert.deepEqual(cooldowns, [17500]);

    firstCooldown.resolve();
    assert.equal(await second, 'second-image');
    assert.deepEqual(starts, ['first', 'second']);
    assert.equal(maxActive, 1);
});

test('aborting a completed consumer cannot skip the provider safety cooldown', async () => {
    const cooldownGate = deferred<void>();
    const firstController = new AbortController();
    const starts: string[] = [];
    let cooldownStarted = false;
    const queue = createSerialImageRequestQueue({
        getCooldownMs: () => 30000,
        waitForCooldown: async () => {
            cooldownStarted = true;
            await cooldownGate.promise;
        },
    });

    const first = queue.enqueue(async () => {
        starts.push('first');
        return 'first-image';
    }, { signal: firstController.signal });
    const second = queue.enqueue(async () => {
        starts.push('second');
        return 'second-image';
    });

    assert.equal(await first, 'first-image');
    await waitFor(() => cooldownStarted);
    firstController.abort();
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.deepEqual(starts, ['first']);

    cooldownGate.resolve();
    assert.equal(await second, 'second-image');
    assert.deepEqual(starts, ['first', 'second']);
});

test('the next image in one batch keeps the cooldown state instead of becoming queued', async () => {
    const cooldownGate = deferred<void>();
    const batch = {};
    const firstStates: string[] = [];
    const secondStates: string[] = [];
    const queue = createSerialImageRequestQueue({
        getCooldownMs: () => 12000,
        waitForCooldown: async () => cooldownGate.promise,
    });

    const first = queue.enqueue(async () => 'first-image', {
        batchKey: batch,
        onCooldown: () => firstStates.push('cooldown'),
    });
    assert.equal(await first, 'first-image');

    const second = queue.enqueue(async () => 'second-image', {
        batchKey: batch,
        onCooldown: () => secondStates.push('cooldown'),
        onQueued: () => secondStates.push('queued'),
        onStart: () => secondStates.push('start'),
    });
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.deepEqual(firstStates, ['cooldown']);
    assert.deepEqual(secondStates, []);

    cooldownGate.resolve();
    assert.equal(await second, 'second-image');
    assert.deepEqual(secondStates, ['start', 'cooldown']);
});

test('a request from another batch is still reported as queued during cooldown', async () => {
    const cooldownGate = deferred<void>();
    const queuedStates: Array<{ ahead: number; position: number }> = [];
    const queue = createSerialImageRequestQueue({
        getCooldownMs: () => 12000,
        waitForCooldown: async () => cooldownGate.promise,
    });

    const first = queue.enqueue(async () => 'first-image', { batchKey: {} });
    assert.equal(await first, 'first-image');

    const second = queue.enqueue(async () => 'second-image', {
        batchKey: {},
        onQueued: (state) => queuedStates.push(state),
    });
    await waitFor(() => queuedStates.length > 0);
    assert.deepEqual(queuedStates[0], { ahead: 1, position: 2 });

    cooldownGate.resolve();
    assert.equal(await second, 'second-image');
});

test('a same-batch request returns from queued to the remaining cooldown when an interposed request is cancelled', async () => {
    const cooldownGate = deferred<void>();
    const interposedController = new AbortController();
    const batchA = {};
    const states: Array<{ phase: string; duration?: number }> = [];
    const queue = createSerialImageRequestQueue({
        getCooldownMs: () => 1000,
        waitForCooldown: async () => cooldownGate.promise,
    });

    const first = queue.enqueue(async () => 'a1-image', { batchKey: batchA });
    assert.equal(await first, 'a1-image');

    const interposed = queue.enqueue(async () => 'b1-image', {
        batchKey: {},
        signal: interposedController.signal,
    });
    const interposedRejection = assert.rejects(interposed, { name: 'AbortError' });
    const second = queue.enqueue(async () => 'a2-image', {
        batchKey: batchA,
        onQueued: () => states.push({ phase: 'queued' }),
        onCooldown: ({ duration }) => states.push({ phase: 'cooldown', duration }),
    });
    await waitFor(() => states.length === 1);
    await new Promise<void>((resolve) => setTimeout(resolve, 20));

    interposedController.abort();
    await interposedRejection;
    await waitFor(() => states.length === 2);

    assert.equal(states[0]?.phase, 'queued');
    assert.equal(states[1]?.phase, 'cooldown');
    assert.ok((states[1]?.duration ?? 0) > 0);
    assert.ok((states[1]?.duration ?? 1000) < 1000);

    cooldownGate.resolve();
    assert.equal(await second, 'a2-image');
});

test('aborting a queued consumer removes only that request', async () => {
    const firstRun = deferred<string>();
    const controller = new AbortController();
    const starts: string[] = [];
    const queue = createSerialImageRequestQueue({ getCooldownMs: () => 0 });

    const first = queue.enqueue(async () => {
        starts.push('first');
        return await firstRun.promise;
    });
    const cancelled = queue.enqueue(async () => {
        starts.push('cancelled');
        return 'cancelled-image';
    }, { signal: controller.signal });
    const third = queue.enqueue(async () => {
        starts.push('third');
        return 'third-image';
    });

    controller.abort();
    await assert.rejects(cancelled, { name: 'AbortError' });
    firstRun.resolve('first-image');
    assert.equal(await first, 'first-image');
    assert.equal(await third, 'third-image');
    assert.deepEqual(starts, ['first', 'third']);
});
