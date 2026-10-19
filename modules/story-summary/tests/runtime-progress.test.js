import assert from 'node:assert/strict';
import { after, afterEach, beforeEach, test } from 'node:test';
import 'fake-indexeddb/auto';
import { db, metaTable, chunksTable, chunkVectorsTable, eventVectorsTable, stateVectorsTable } from '../data/db.js';
import * as runtime from '../vector/runtime/runtime.js';
import { maintenanceFixture } from './fixtures/memory-maintenance.js';

// Execute the original runtime/RPC against controlled Worker and IndexedDB
// boundaries. Observers must not alter selection, deadlines, leases or data.
const fixture = maintenanceFixture();
const originalWorker = globalThis.Worker;
const vector = () => new Float32Array([1, 0]).buffer;
const phases = events => events.map(event => event.phase);
const deferred = () => {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
};

class ControlledWorker {
    static instances = [];
    requests = [];
    waiters = [];
    terminated = 0;
    constructor() { ControlledWorker.instances.push(this); }
    postMessage(request) {
        const index = this.waiters.findIndex(item => item.type === request.type);
        if (index < 0) this.requests.push(request);
        else this.waiters.splice(index, 1)[0].resolve(request);
    }
    take(type) {
        const index = this.requests.findIndex(item => item.type === type);
        if (index >= 0) return Promise.resolve(this.requests.splice(index, 1)[0]);
        return new Promise(resolve => this.waiters.push({ type, resolve }));
    }
    reply(request, result) { this.onmessage({ data: { id: request.id, ok: true, result } }); }
    fail(request, error) { this.onmessage({ data: { id: request.id, ok: false, error: error.message } }); }
    terminate() { this.terminated++; }
}

function workerLease(request) {
    return {
        chatId: request.payload.chatId, leaseId: `lease-${request.id}`, ready: true,
        startedAt: Date.now(), expiresAt: Date.now() + 120000,
        stats: { chatId: request.payload.chatId, backend: 'worker', ready: true, activeSessions: 1 },
    };
}

beforeEach(async () => {
    globalThis.Worker = undefined;
    ControlledWorker.instances = [];
    for (const table of db.tables) await table.clear();
    const chatId = fixture.chatId;
    await Promise.all([
        metaTable.put({ chatId, lastChunkFloor: fixture.cutoff }),
        chunksTable.put({ chatId, chunkId: 'c-1', floor: 1, chunkIdx: 0, text: fixture.chat[1].mes }),
        chunkVectorsTable.put({ chatId, chunkId: 'c-1', vector: vector() }),
        eventVectorsTable.put({ chatId, eventId: fixture.json.events[0].id, vector: vector() }),
        stateVectorsTable.put({ chatId, atomId: fixture.atoms[0].atomId, floor: 1, vector: vector() }),
    ]);
});
afterEach(async () => {
    await runtime.shutdownRecallRuntime();
    globalThis.Worker = originalWorker;
});
after(() => db.close());

test('cold worker callers and a concurrent join observe startup before loading; warm calls reuse', async () => {
    globalThis.Worker = ControlledWorker;
    const firstEvents = [], joinEvents = [], warmEvents = [];
    const controller = new AbortController();
    controller.abort();
    const first = runtime.beginRecallRuntimeSession(fixture.chatId, {
        onProgress: event => firstEvents.push(event), signal: controller.signal,
    });
    const joined = runtime.beginRecallRuntimeSession(fixture.chatId, { onProgress: event => joinEvents.push(event) });
    assert.equal(ControlledWorker.instances.length, 1);
    const worker = ControlledWorker.instances[0];
    assert.deepEqual(firstEvents, [{ phase: 'worker-start', backend: 'worker', reused: false }]);
    assert.deepEqual(joinEvents, firstEvents);
    assert.deepEqual(worker.requests.map(item => item.type), ['ping']);
    worker.reply(await worker.take('ping'), { pong: true });
    const firstRequest = await worker.take('beginSession');
    const joinedRequest = await worker.take('beginSession');
    assert.deepEqual(phases(firstEvents), ['worker-start', 'backend-ready', 'load-start']);
    assert.deepEqual(phases(joinEvents), phases(firstEvents));
    worker.reply(firstRequest, workerLease(firstRequest));
    worker.reply(joinedRequest, workerLease(joinedRequest));
    const leases = await Promise.all([first, joined]);
    assert.equal(leases[0].ready, true); // beginSession intentionally does not forward signal.
    const warm = runtime.beginRecallRuntimeSession(fixture.chatId, { onProgress: event => warmEvents.push(event) });
    const warmRequest = await worker.take('beginSession');
    worker.reply(warmRequest, workerLease(warmRequest));
    leases.push(await warm);
    assert.deepEqual(phases(warmEvents), ['backend-ready', 'load-start', 'load-end']);
    assert.ok(warmEvents.every(event => event.backend === 'worker' && event.reused));
    for (const events of [firstEvents, joinEvents]) {
        assert.deepEqual(phases(events), ['worker-start', 'backend-ready', 'load-start', 'load-end']);
        assert.ok(events.every(event => event.backend === 'worker' && !event.reused));
    }
    for (const event of [...firstEvents, ...joinEvents, ...warmEvents]) {
        assert.equal(Object.isFrozen(event), true);
        assert.equal(Object.getPrototypeOf(event), Object.prototype);
        assert.deepEqual(Object.keys(event).sort(), ['backend', 'phase', 'reused']);
    }
    await assert.rejects(runtime.getRecallRuntimeMeta(fixture.chatId, { signal: controller.signal }), { name: 'AbortError' });
    assert.deepEqual(worker.requests, []); // Primitive cancellation still stops the RPC.
    for (const lease of leases) {
        const events = [];
        const ending = runtime.endRecallRuntimeSession(lease, { onProgress: event => events.push(event) });
        const request = await worker.take('endSession');
        assert.deepEqual(phases(events), ['backend-ready', 'release-start']);
        worker.reply(request, { chatId: fixture.chatId, backend: 'worker', activeSessions: 0 });
        await ending;
        assert.deepEqual(phases(events), ['backend-ready', 'release-start', 'release-end']);
    }
});

test('worker failure reports its actual error and main loading finishes only after the DB resolves', async t => {
    globalThis.Worker = ControlledWorker;
    t.mock.method(console, 'warn', () => {});
    const events = [], entered = deferred(), data = deferred();
    t.mock.method(metaTable, 'get', () => { entered.resolve(); return data.promise; });
    const beginning = runtime.beginRecallRuntimeSession(fixture.chatId, { onProgress: event => events.push(event) });
    const worker = ControlledWorker.instances[0];
    const failure = new Error('worker-startup-test-failure');
    worker.fail(await worker.take('ping'), failure);
    await entered.promise;
    assert.equal(worker.terminated, 1);
    assert.deepEqual(phases(events), ['worker-start', 'worker-failed', 'backend-ready', 'load-start']);
    assert.deepEqual(events[1], { phase: 'worker-failed', backend: 'worker', reused: false, error: failure.message });
    assert.deepEqual(events[2], { phase: 'backend-ready', backend: 'main-fallback', reused: false, error: failure.message });
    data.resolve({ chatId: fixture.chatId, lastChunkFloor: fixture.cutoff });
    const lease = await beginning;
    assert.deepEqual(events.at(-1), { phase: 'load-end', backend: 'main-fallback', reused: false });
    assert.equal(lease.stats.chunkVectors, 1);
    assert.equal(lease.stats.eventVectors, 1);
    assert.equal(lease.stats.stateVectors, 1);
    const reused = [];
    const sibling = await runtime.beginRecallRuntimeSession(fixture.chatId, { onProgress: event => reused.push(event) });
    assert.deepEqual(reused[0], { phase: 'backend-ready', backend: 'main-fallback', reused: true, error: failure.message });
    assert.deepEqual(phases(reused), ['backend-ready', 'load-start', 'load-end']);
    assert.equal(metaTable.get.mock.callCount(), 1);
    assert.equal((await runtime.endRecallRuntimeSession(lease)).activeSessions, 1);
    assert.equal((await runtime.endRecallRuntimeSession(sibling)).chunkVectors, 0);
    assert.deepEqual(await runtime.refreshRecallRuntimeStats(), []);
    assert.equal(await chunkVectorsTable.count(), 1); // Release never deletes persisted data.
});

test('unavailable Worker reports the stored fallback error and leaves main sessions functional', async () => {
    const events = [];
    const lease = await runtime.beginRecallRuntimeSession(fixture.chatId, { onProgress: event => events.push(event) });
    const lastError = runtime.getRecallRuntimeStats()[0].lastError;
    assert.equal(typeof lastError, 'string');
    assert.ok(lastError.length > 0);
    assert.deepEqual(phases(events), ['worker-start', 'worker-failed', 'backend-ready', 'load-start', 'load-end']);
    assert.equal(events[1].error, lastError);
    assert.equal(events[2].error, lastError);
    assert.equal(lease.stats.backend, 'main-fallback');
    assert.equal(lease.ready, true);
    await runtime.endRecallRuntimeSession(lease);
});

test('worker ping still waits 5000ms before timeout cleanup and fallback', async t => {
    globalThis.Worker = ControlledWorker;
    t.mock.method(console, 'warn', () => {});
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const events = [];
    const beginning = runtime.beginRecallRuntimeSession(fixture.chatId, { onProgress: event => events.push(event) });
    const worker = ControlledWorker.instances[0];
    await worker.take('ping');
    t.mock.timers.tick(4999);
    await Promise.resolve();
    assert.deepEqual(phases(events), ['worker-start']);
    assert.equal(worker.terminated, 0);
    t.mock.timers.tick(1);
    const lease = await beginning;
    assert.equal(worker.terminated, 1);
    assert.equal(lease.stats.backend, 'main-fallback');
    assert.deepEqual(phases(events), ['worker-start', 'worker-failed', 'backend-ready', 'load-start', 'load-end']);
    assert.equal(events[1].error, runtime.getRecallRuntimeStats()[0].lastError);
    await runtime.endRecallRuntimeSession(lease);
});

for (const backend of ['worker', 'main-fallback']) for (const asynchronous of [false, true]) {
    test(`observer ${asynchronous ? 'rejections' : 'throws'} do not change ${backend} results or release`, async t => {
        globalThis.Worker = ControlledWorker;
        t.mock.method(console, 'warn', () => {});
        const events = [];
        const onProgress = event => {
            events.push(event);
            const error = new Error('observer-test-failure');
            if (asynchronous) return Promise.reject(error);
            throw error;
        };
        const beginning = runtime.beginRecallRuntimeSession(fixture.chatId, { onProgress });
        const worker = ControlledWorker.instances[0];
        const ping = await worker.take('ping');
        if (backend === 'worker') {
            worker.reply(ping, { pong: true });
            const request = await worker.take('beginSession');
            worker.reply(request, workerLease(request));
        } else {
            worker.fail(ping, new Error('worker-startup-test-failure'));
        }
        const lease = await beginning;
        assert.equal(lease.ready, true);
        assert.equal(lease.stats.backend, backend);
        const ending = runtime.endRecallRuntimeSession(lease, { onProgress });
        if (backend === 'worker') worker.reply(await worker.take('endSession'), { chatId: fixture.chatId, backend, activeSessions: 0 });
        assert.equal((await ending).activeSessions, 0);
        assert.equal(events.at(-1).phase, 'release-end');
        assert.ok(events.some(event => event.phase === 'load-end'));
        assert.equal(worker.terminated, backend === 'worker' ? 0 : 1);
        if (backend === 'main-fallback') assert.deepEqual(await runtime.refreshRecallRuntimeStats(), []);
        const count = events.length;
        await runtime.endRecallRuntimeSession(lease, { onProgress });
        assert.equal(events.length, count); // Forgotten leases do not perform another release.
        await runtime.shutdownRecallRuntime();
        assert.equal(worker.terminated, 1);
    });
}

test('failed worker load and release report operation errors without selecting fallback', async () => {
    globalThis.Worker = ControlledWorker;
    const events = [], onProgress = event => events.push(event);
    const beginning = runtime.beginRecallRuntimeSession(fixture.chatId, { onProgress });
    const worker = ControlledWorker.instances[0];
    worker.reply(await worker.take('ping'), { pong: true });
    const failure = new Error('worker-operation-test-failure');
    const rejected = assert.rejects(beginning, { message: failure.message });
    worker.fail(await worker.take('beginSession'), failure);
    await rejected;
    assert.deepEqual(events.at(-1), { phase: 'load-end', backend: 'worker', reused: false, error: failure.message });
    assert.equal(worker.terminated, 0);
    const retry = runtime.beginRecallRuntimeSession(fixture.chatId);
    const request = await worker.take('beginSession');
    worker.reply(request, workerLease(request));
    const lease = await retry;
    const ending = runtime.endRecallRuntimeSession(lease, { onProgress });
    const releaseRejected = assert.rejects(ending, { message: failure.message });
    worker.fail(await worker.take('endSession'), failure);
    await releaseRejected;
    assert.deepEqual(events.at(-1), { phase: 'release-end', backend: 'worker', reused: true, error: failure.message });
    const count = events.length;
    await runtime.endRecallRuntimeSession(lease, { onProgress });
    assert.equal(events.length, count);
    assert.deepEqual(worker.requests, []);
    assert.equal(ControlledWorker.instances.length, 1);
});

test('DB load failure is preserved and leases are cleaned even when progress observers throw', async t => {
    const failure = new Error('db-load-test-failure');
    t.mock.method(metaTable, 'get', () => Promise.reject(failure));
    const events = [];
    await assert.rejects(runtime.beginRecallRuntimeSession(fixture.chatId, { onProgress: event => {
        events.push(event);
        throw new Error('observer-test-failure');
    } }), error => error === failure);
    assert.deepEqual(events.at(-1), { phase: 'load-end', backend: 'main-fallback', reused: false, error: failure.message });
    assert.deepEqual(await runtime.refreshRecallRuntimeStats(), []);
    assert.equal(await chunkVectorsTable.count(), 1);
    metaTable.get.mock.restore();
    const reused = [];
    const lease = await runtime.beginRecallRuntimeSession(fixture.chatId, { onProgress: event => reused.push(event) });
    assert.equal(lease.stats.activeSessions, 1);
    assert.deepEqual(reused[0], { phase: 'backend-ready', backend: 'main-fallback', reused: true, error: failure.message });
    await runtime.endRecallRuntimeSession(lease);
});
