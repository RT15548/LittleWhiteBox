import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as tick } from 'node:timers/promises';
import { createSerialImageRequestQueue } from '../serial-image-request-queue.js';

// Contract: floors submitted earlier finish all their images before a later floor starts,
// and a batch's images never interleave with another batch. Providers enqueue a whole
// floor's requests at once, so ordering must not depend on how fast a result is delivered.
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('batches keep submission order and each batch stays contiguous', async () => {
    const queue = createSerialImageRequestQueue({ getCooldownMs: () => 1 });
    const order = [];
    const keys = { A: {}, B: {}, C: {} };
    const label = new Map(Object.entries(keys).map(([name, key]) => [key, name]));
    const run = (key, count) => (async () => {
        for (let index = 0; index < count; index++) {
            await queue.enqueue(async () => { order.push(`${label.get(key)}${index + 1}`); }, { batchKey: key });
        }
    })();
    await Promise.all([run(keys.A, 3), run(keys.B, 3), run(keys.C, 2)]);
    assert.deepEqual(order, ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2']);
});

test('a running request is never interrupted and requests without a batch keep arrival order', async () => {
    const queue = createSerialImageRequestQueue({ getCooldownMs: () => 1 });
    const order = [];
    let release;
    const first = queue.enqueue(() => new Promise(resolve => { release = resolve; }).then(() => order.push('A1')), { batchKey: 'A' });
    await tick();
    const publicOne = queue.enqueue(async () => { order.push('public1'); }, { scope: 'public' });
    const b1 = queue.enqueue(async () => { order.push('B1'); }, { batchKey: 'B' });
    const a2 = queue.enqueue(async () => { order.push('A2'); }, { batchKey: 'A' });
    const publicTwo = queue.enqueue(async () => { order.push('public2'); }, { scope: 'public' });
    release();
    await Promise.all([first, publicOne, b1, a2, publicTwo]);
    assert.deepEqual(order, ['A1', 'A2', 'public1', 'B1', 'public2']);
});

test('a batch that arrives later queues behind every pending batch even when a new request has the same key', async () => {
    const queue = createSerialImageRequestQueue({ getCooldownMs: () => 1 });
    const order = [];
    let release;
    const hold = queue.enqueue(() => new Promise(resolve => { release = resolve; }), { batchKey: 'X' });
    await tick();
    const b1 = queue.enqueue(async () => { order.push('B1'); }, { batchKey: 'B' });
    const c1 = queue.enqueue(async () => { order.push('C1'); }, { batchKey: 'C' });
    const b2 = queue.enqueue(async () => { order.push('B2'); }, { batchKey: 'B' });
    release();
    await Promise.all([hold, b1, c1, b2]);
    assert.deepEqual(order, ['B1', 'B2', 'C1']);
});

// Providers submit a whole floor at once and only read the results in order afterwards,
// so a slow delivery (storage, render) between two images cannot reorder the floors.
test('floors submitted one after another run floor by floor, even when delivery is slow', async () => {
    const queue = createSerialImageRequestQueue({ getCooldownMs: () => 0 });
    const order = [];
    const submitFloor = (name, count) => {
        const key = {};
        return Array.from({ length: count }, (_, index) => queue.enqueue(async () => { order.push(`${name}${index + 1}`); }, { batchKey: key }));
    };
    const runs = [];
    for (const [name, count] of [['A', 3], ['B', 2], ['C', 2]]) {
        const queued = submitFloor(name, count);
        runs.push((async () => { for (const promise of queued) await promise; await wait(20); })());
        await wait(2);
    }
    await Promise.all(runs);
    assert.deepEqual(order, ['A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'C2']);
});

test('floors with one image each run in submission order', async () => {
    const queue = createSerialImageRequestQueue({ getCooldownMs: () => 0 });
    const order = [];
    const runs = [['A', 1], ['B', 1], ['C', 1]].map(([name, count]) => (async () => {
        const key = {};
        for (let index = 0; index < count; index++) {
            await queue.enqueue(async () => { order.push(`${name}${index + 1}`); }, { batchKey: key });
        }
    })());
    await Promise.all(runs);
    assert.deepEqual(order, ['A1', 'B1', 'C1']);
});

test('a cancelled batch does not stall later batches', async () => {
    const queue = createSerialImageRequestQueue({ getCooldownMs: () => 0 });
    const order = [];
    const controller = new AbortController();
    let release;
    const a1 = queue.enqueue(() => new Promise((resolve) => { release = resolve; }).then(() => order.push('A1')),
        { batchKey: 'A', signal: controller.signal });
    const a2 = queue.enqueue(async () => { order.push('A2'); }, { batchKey: 'A', signal: controller.signal });
    const b1 = queue.enqueue(async () => { order.push('B1'); }, { batchKey: 'B' });
    // a2 还在排队时取消：它只能撤销自己，不能占住后面的楼层。
    controller.abort();
    await assert.rejects(a2);
    release();
    await a1;
    await b1;
    assert.deepEqual(order, ['A1', 'B1']);
});
