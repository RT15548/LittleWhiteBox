import assert from 'node:assert/strict';
import test from 'node:test';
import { executePreparedSlots } from '../prepared-slot-executor.js';
import { DRAW_SLOT_ERRORS } from '../image-record.js';
import { createImageRequestAttempt, imageHttpFailure, ImageRequestOutcome } from '../image-request-outcome.js';

function harness(overrides = {}) {
    const records = new Map(), selected = new Map(), activity = new Map(), order = [];
    const items = ['a', 'b'].map(id => ({ slotId: id, imgId: `img-${id}`, tags: 'same',
        chatId: 'chat', messageId: 0, characterPrompts: [], delivery: { mode: 'slots' } }));
    const options = { items, backend: false,
        store: async record => { order.push(`store:${record.status}`); records.set(record.imgId, record); },
        remove: async id => { order.push('remove'); records.delete(id);
            for (const [slot, img] of selected) if (img === id) selected.delete(slot); },
        select: async (slot, img) => { order.push('select'); selected.set(slot, img); },
        commit: async () => { order.push('commit'); return true; },
        resolveTarget: () => ({ messageId: 0 }), render: async () => {},
        activity: (slot, state) => state ? activity.set(slot, state) : activity.delete(slot),
        classifyError: error => ({ label: 'failed', desc: String(error) }),
        run: async callbacks => { for (const index of items.keys()) {
            await callbacks.onItemStarting({ index }); order.push('request');
            await callbacks.onItemReady({ index, base64: 'YWJj' });
            await callbacks.onItemSettled({ index, state: 'ready' });
        } }, ...overrides,
    };
    return { records, selected, activity, order, options, execute: () => executePreparedSlots(options) };
}

test('backend delivery receipt precedes slot release and blocks release when it cannot persist', async () => {
    for (const rejectReceipt of [false, true]) {
        const h = harness({ backend: true });
        h.options.run = async callbacks => {
            await callbacks.recoverable.commitPlacements();
            const delivery = callbacks.onItemReady({ index: 0, base64: 'YWJj', commitDelivery: async () => {
                assert.equal(h.activity.has('a'), true);
                assert.equal(h.selected.get('a'), 'img-a');
                if (rejectReceipt) throw new Error('receipt quota');
            } });
            if (rejectReceipt) {
                await assert.rejects(delivery, error => error.preserveBackendResult === true);
                assert.equal(h.activity.has('a'), true);
                throw Object.assign(new Error('retain for recovery'), { detached: true });
            }
            await delivery;
            assert.equal(h.activity.has('a'), false);
            assert.equal(h.activity.has('b'), true);
            await callbacks.onItemReady({ index: 1, base64: 'YWJj' });
        };
        if (rejectReceipt) await assert.rejects(h.execute(), error => error.detached === true);
        else await h.execute();
        assert.equal(h.records.get('img-a').status, 'success');
    }
});

test('cancellation cannot erase an unknown submitted outcome or a delivered success', async () => {
    const controller = new AbortController();
    const h = harness({ signal: controller.signal, run: async callbacks => {
        await callbacks.onItemStarting({ index: 0 });
        await callbacks.onItemReady({ index: 0, base64: 'YWJj' });
        await callbacks.onItemStarting({ index: 1 });
        controller.abort();
        await callbacks.onItemSettled({ index: 1, state: 'failed', error: Object.assign(new Error('lost response'),
            { imageRequestOutcome: ImageRequestOutcome.UNKNOWN }) });
    } });
    const result = await h.execute();
    assert.equal(h.records.get('img-a').status, 'success');
    assert.equal(h.records.get('img-b').status, 'unknown');
    assert.equal(result.success, 1);
});

for (const scenario of ['preflight', 'rejected', 'truncated-json', 'decode', 'proxy-timeout']) {
    test(`direct request ${scenario} preserves submission certainty without retrying`, async () => {
        let requests = 0;
        const h = harness({ run: async callbacks => {
            await callbacks.onItemStarting({ index: 0 });
            const attempt = createImageRequestAttempt();
            if (scenario !== 'preflight') { attempt.submit(); requests++; }
            let error = scenario === 'truncated-json' ? new SyntaxError('incomplete JSON') : new Error(scenario);
            if (scenario === 'rejected') error = imageHttpFailure(error, 401);
            if (scenario === 'proxy-timeout') error = imageHttpFailure(error, 504);
            await callbacks.onItemSettled({ index: 0, state: 'failed', error: attempt.failure(error) });
            await callbacks.onItemSettled({ index: 1, state: 'failed', error: Object.assign(new Error('unsubmitted'),
                { imageRequestOutcome: ImageRequestOutcome.NOT_SUBMITTED }) });
        } });
        const result = await h.execute();
        assert.equal(h.records.get('img-a').status, ['preflight', 'rejected'].includes(scenario) ? 'failed' : 'unknown');
        assert.equal(h.records.get('img-b').status, 'failed');
        assert.equal(requests, scenario === 'preflight' ? 0 : 1);
        assert.equal(result.success, 0);
        assert.equal(result.results.length, 2);
    });
}

test('inputs persist before placement; one batch requests only after confirmed placement', async () => {
    const h = harness();
    const result = await h.execute();
    assert.deepEqual(h.order.slice(0, 5), ['store:pending', 'store:pending', 'commit', 'store:unknown', 'request']);
    assert.equal(result.success, 2);
    assert.equal(h.records.size, 2);
    assert.equal(h.selected.size, 2);
    assert.equal(h.activity.size, 0);
    assert.deepEqual(h.records.get('img-a').characterPrompts, []);
});

for (const backend of [false, true]) test(`queued siblings do not inherit the running card state (${backend ? 'backend' : 'direct'})`, async () => {
    const h = harness({ backend, run: async callbacks => {
        if (backend) await callbacks.recoverable.commitPlacements();
        callbacks.onStateChange('progress', { current: 1, total: 2 });
        if (!backend) await callbacks.onItemStarting({ index: 0 });
        assert.equal(h.activity.get('a').phase, 'generating');
        assert.equal(h.activity.get('b').phase, 'queued');
        await callbacks.onItemReady({ index: 0, base64: 'YWJj' });
        callbacks.onStateChange('queued', { current: 2, total: 2 });
        assert.equal(h.activity.has('a'), false);
        assert.equal(h.activity.get('b').phase, 'queued');
        await callbacks.onItemReady({ index: 1, base64: 'YWJj' });
    } });
    assert.equal((await h.execute()).success, 2);
});

for (const uncertain of [false, true]) test(`save ${uncertain ? 'uncertainty retains' : 'rejection removes'} staged records without requesting`, async () => {
    const error = Object.assign(new Error('save'), { uncertain });
    const h = harness({ commit: async () => { throw error; }, run: () => assert.fail('request forbidden') });
    await assert.rejects(h.execute(), e => uncertain
        ? e.code === DRAW_SLOT_ERRORS.placement.code && e.cause === error && e.uncertain !== true
        : e === error);
    assert.equal(h.records.size, uncertain ? 2 : 0);
    if (uncertain) for (const record of h.records.values()) assert.equal(record.status, 'failed');
    assert.equal(h.activity.size, 0);
});

test('backend placement uncertainty retains its journal-owned recovery state', async () => {
    const error = Object.assign(new Error('save'), { uncertain: true });
    const h = harness({ backend: true, commit: async () => { throw error; },
        run: async callbacks => {
            await callbacks.recoverable.commitPlacements();
            assert.fail('submission must wait for confirmed placement');
        } });
    await assert.rejects(h.execute(), e => e === error);
    assert.equal(h.records.size, 2);
    for (const record of h.records.values()) assert.equal(record.status, 'pending');
    assert.equal(h.activity.size, 0);
});

test('partial initial storage failure rolls back without saving or requesting', async () => {
    const h = harness();
    const store = h.options.store;
    h.options.store = async record => { if (record.slotId === 'b') throw new Error('quota'); await store(record); };
    await assert.rejects(h.execute());
    assert.equal(h.records.size, 0);
    assert.equal(h.order.includes('commit'), false);
});

test('backend journal controls placement before its one submission', async () => {
    const h = harness({ backend: true });
    h.options.run = async callbacks => {
        h.order.push('journal');
        await callbacks.recoverable.commitPlacements();
        await callbacks.recoverable.commitPlacements();
        h.order.push('request');
        await callbacks.onItemReady({ index: 0, base64: 'YWJj' });
        await callbacks.onItemSettled({ index: 1, state: 'failed', error: new Error('provider') });
    };
    const result = await h.execute();
    assert.deepEqual(h.order.slice(0, 5), ['store:pending', 'store:pending', 'journal', 'commit', 'request']);
    assert.equal(result.success, 1);
    assert.equal(h.records.get('img-b').status, 'failed');
});

test('lost connection to backend preserves pending input for its original task', async () => {
    const h = harness({ backend: true, run: async callbacks => {
        await callbacks.recoverable.commitPlacements();
        throw Object.assign(new Error('offline'), { detached: true });
    } });
    await assert.rejects(h.execute());
    assert.equal(h.records.get('img-a').status, 'pending');
    assert.equal(h.activity.size, 0);
});

test('delivery failure never acknowledges success or overwrites a retained result with provider failure', async () => {
    const h = harness();
    const store = h.options.store;
    h.options.store = async record => { if (record.status === 'success') throw new Error('quota'); await store(record); };
    await assert.rejects(h.execute(), error => error.preserveBackendResult === true);
    assert.equal(h.records.get('img-a').status, 'unknown');
    assert.equal(h.selected.size, 0);
});

test('deletion racing with selection removes both image and selection', async () => {
    let alive = true;
    const h = harness({ resolveTarget: () => alive ? { messageId: 0 } : null });
    const select = h.options.select;
    h.options.select = async (...args) => { await select(...args); alive = false; };
    const result = await h.execute();
    assert.equal(result.success, 0);
    assert.equal(h.records.size, 0);
    assert.equal(h.selected.size, 0);
});

test('backend ownership lost during storage cannot select or acknowledge the old delivery', async () => {
    const h = harness({ backend: true });
    const ownershipLost = Object.assign(new Error('lease changed'), { code: 'PENDING_JOB_LEASE_LOST' });
    let owned = true;
    const store = h.options.store;
    h.options.store = async record => {
        await store(record);
        if (record.status === 'success') owned = false;
    };
    h.options.run = async callbacks => {
        await callbacks.recoverable.commitPlacements();
        await callbacks.onItemReady({ index: 0, base64: 'YWJj',
            guard: async () => { if (!owned) throw ownershipLost; } });
    };
    await assert.rejects(h.execute(), error => error === ownershipLost && error.preserveBackendResult);
    assert.equal(h.selected.size, 0);
    assert.equal(h.records.get('img-a').status, 'success');
    assert.equal(h.records.get('img-b').status, 'pending');
    assert.equal(h.activity.size, 0);
});

test('render failure reports separately and does not cause regeneration or failed delivery', async () => {
    let reports = 0;
    const h = harness({ render: async () => { throw new Error('DOM'); }, onRenderError: () => { reports++; } });
    assert.equal((await h.execute()).success, 2);
    assert.ok(reports > 0);
    assert.equal(h.order.filter(item => item === 'request').length, 2);
});

test('native readiness and submission are independent of a stalled renderer', async () => {
    let ready = false, requested = false, release;
    const rendering = new Promise(resolve => { release = resolve; });
    const h = harness({ nativeMessage: true, onPrepared: () => { ready = true; }, render: () => rendering,
        run: async () => { requested = true; release(); } });
    await h.execute();
    assert.equal(ready, true); assert.equal(requested, true);
});

test('direct transport marks only started items uncertain and does not resubmit a network failure', async () => {
    const h = harness({ classifyError: () => ({ code: 'network' }) });
    let calls = 0;
    h.options.run = async callbacks => {
        assert.equal(h.records.get('img-a').status, 'pending');
        await callbacks.onItemStarting({ index: 0 }); calls++;
        assert.equal(h.records.get('img-a').status, 'unknown');
        assert.equal(h.records.get('img-b').status, 'pending');
        await callbacks.onItemSettled({ index: 0, state: 'failed', error: new Error('network') });
        await callbacks.onItemStarting({ index: 1 }); calls++;
        await callbacks.onItemReady({ index: 1, base64: 'YWJj' });
    };
    const result = await h.execute();
    assert.equal(h.records.get('img-a').status, 'unknown'); assert.equal(calls, 2);
    assert.equal(result.results.length, 2); assert.equal(result.success, 1);
});
