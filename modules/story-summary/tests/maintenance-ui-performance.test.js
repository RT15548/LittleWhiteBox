import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMemoryChatController, MEMORY_CHAT_PAGE_SIZE, MEMORY_CHAT_TOOL_LIMIT, MEMORY_CHAT_CONTEXT_DELAY_MS } from '../maintenance/chat-controller.js';
import { createMemoryChatContextEstimator } from '../maintenance/conversation.js';
import { readMaintenanceStatus, readMaintenanceDiagnostics, createMaintenanceStatusReader } from '../maintenance/diagnostics.js';
import { projectMaintenanceReceipts } from '../maintenance/history.js';
import { memoryChatErrorText } from '../maintenance/chat-copy.js';

const receipt = id => ({ version: 2, id: `receipt-${id}`, runId: `run-${id}`, cutoff: 10000,
    operations: [{ kind: 'edit', collection: 'facts', changes: [{ collection: 'facts', key: String(id), before: { o: 'before' }, after: { o: 'after' } }] }],
    coverage: { supplied: [], missingAnchors: [] }, calls: [{ turn: 1, stage: 'finished' }], outcome: { status: 'completed' } });

function controllerFixture(t, execute = async () => ({ status: 'completed', summary: 'fixture reply', messages: [] })) {
    let identity = 'chat-a', previews = 0;
    const scheduler = { cancelInteraction() {}, takeover() {},
        interact: (task, run) => run(task, new AbortController().signal, () => {}) };
    const chat = createMemoryChatController({ identity: () => identity, chatId: () => identity,
        scheduler, execute, status: () => ({ automatic: { status: 'idle' }, ranges: { cutoff: 0, completed: [], pending: [] } }),
        previewTask: () => { previews++; return null; }, changed() {} });
    t.after(() => chat.reset({ preview: false }));
    return { chat, request: text => ({ identity: chat.identity, text }), previews: () => previews,
        switch: next => { identity = next; } };
}

// Guard projection boundaries with inaccessible large payloads instead of brittle
// wall-clock thresholds. A status refresh must never even inspect these bodies.
test('live status reads completion ranges without touching memory or receipt payloads', () => {
    const row = { id: 'r', runId: 'run', completion: { from: 1, to: 5 } };
    for (const key of ['operations', 'calls', 'coverage']) Object.defineProperty(row, key, { get() { throw new Error(`unexpected ${key} read`); } });
    const store = { lastSummarizedMesId: 9999, summaryHistory: [{ maintenance: [row] }] };
    Object.defineProperty(store, 'json', { get() { throw new Error('unexpected memory read'); } });
    const result = readMaintenanceStatus({ store, state: { status: 'running' }, commitState: 'ready', enabled: true });
    assert.deepEqual(result.ranges.pending, [{ from: 6, to: 10000 }]);
    result.ranges.completed[0].to = 9;
    assert.equal(row.completion.to, 5);
});

test('live range cache skips receipt scans until publication or source state changes', () => {
    let reads = 0;
    const row = { get completion() { reads++; return { from: 1, to: 5 }; } };
    const store = { updatedAt: 1, lastSummarizedMesId: 9, summaryHistory: [{ maintenance: [row] }] };
    const current = { store, state: { status: 'running' }, commitState: 'ready', enabled: true };
    const read = createMaintenanceStatusReader();
    const first = read(current), firstReads = reads;
    assert.ok(firstReads > 0);
    for (let index = 0; index < 100; index++) read({ ...current, store: { ...store }, state: { status: 'saving', progress: { calls: index } } });
    assert.equal(reads, firstReads);
    first.ranges.completed[0].to = 999;
    assert.equal(read(current).ranges.completed[0].to, 5);
    store.summaryHistory = [{ maintenance: [row, { completion: { from: 6, to: 7 } }] }];
    assert.deepEqual(read(current).ranges.pending, [{ from: 8, to: 10 }]);
    assert.ok(reads > firstReads);
    store.lastSummarizedMesId = 19;
    assert.deepEqual(read(current).ranges.pending, [{ from: 8, to: 20 }]);
    store.summaryInvalid = true;
    assert.equal(read(current).ranges, null);
    store.summaryInvalid = false;
    store.summaryHistory[0].maintenance[1].invalidated = [{ from: 6, to: 7 }];
    store.updatedAt++;
    assert.deepEqual(read(current).ranges.pending, [{ from: 6, to: 20 }]);
});

test('history pages inspect only selected runs and return detached data', () => {
    const rows = Array.from({ length: 1000 }, (_, index) => receipt(index));
    for (const row of rows.slice(0, -2)) {
        Object.defineProperty(row, 'operations', { get() { throw new Error('off-page operation body was accessed'); } });
        Object.defineProperty(row, 'calls', { get() { throw new Error('off-page call body was accessed'); } });
    }
    const store = { summaryHistory: [{ maintenance: rows }] };
    const page = projectMaintenanceReceipts(store, 0, 2);
    assert.equal(page.total, 1000);
    assert.equal(page.next, 2);
    assert.deepEqual(page.items.map(run => run.id), ['run-999', 'run-998']);
    page.items[0].operations[0].changes[0].after.o = 'external mutation';
    assert.equal(rows.at(-1).operations[0].changes[0].after.o, 'after');
    const current = { store, state: {}, commitState: 'ready', enabled: true };
    const list = readMaintenanceDiagnostics(current, { limit: 1 });
    assert.equal(list.runs.length, 1);
    assert.equal(Object.hasOwn(list.runs[0], 'operations'), false);
    const detail = readMaintenanceDiagnostics(current, { runId: 'run-998', limit: 1 });
    detail.calls[0].stage = 'external mutation';
    detail.operations[0].changes[0].before.o = 'external mutation';
    assert.equal(rows[998].calls[0].stage, 'finished');
    assert.equal(rows[998].operations[0].changes[0].before.o, 'before');
});

test('context estimates are deferred and draft bursts measure only after the debounce', t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const h = controllerFixture(t);
    assert.equal(h.chat.snapshot().context.status, 'loading');
    assert.equal(h.chat.snapshot().context.used, null);
    for (let index = 0; index < 30; index++) h.chat.draft(h.request(`fixture-${index}`));
    assert.equal(h.previews(), 0);
    t.mock.timers.tick(MEMORY_CHAT_CONTEXT_DELAY_MS - 1);
    assert.equal(h.previews(), 0);
    t.mock.timers.tick(1);
    assert.equal(h.previews(), 1);
    assert.equal(h.chat.snapshot().context.status, 'ready');
    assert.ok(h.chat.snapshot().context.used > 0);
    h.switch('chat-b');
    assert.equal(h.chat.snapshot().context.status, 'loading');
    assert.equal(h.chat.snapshot().draft, '');
});

test('changing only a draft does not revisit provider history payloads', () => {
    let reads = 0;
    const history = [{ role: 'assistant', get content() { reads++; return 'fixture history '.repeat(1000); } }];
    const estimate = createMemoryChatContextEstimator();
    const first = estimate({ history, question: 'one' });
    const measuredReads = reads;
    assert.ok(measuredReads > 0);
    const next = estimate({ history, question: 'a substantially longer fixture question' });
    assert.equal(reads, measuredReads);
    assert.equal(next.sections.history, first.sections.history);
    assert.ok(next.used > first.used);
    estimate({ history: [...history], question: 'one' });
    assert.ok(reads > measuredReads);
});

test('UI turns retain bounded tool metadata while the execution history retains full protocol', async t => {
    const protocol = [{ role: 'assistant', content: '', tool_calls: [{ id: 'tool-1', function: { name: 'ReadMemory', arguments: '{"fixture":"private-arguments"}' } }] },
        { role: 'tool', tool_call_id: 'tool-1', content: '{"fixture":"private-result"}' }];
    let calls = 0;
    const h = controllerFixture(t, async (_task, options) => {
        if (calls++) assert.equal(options.history, protocol);
        const tool = { name: 'ReadMemory', response: { status: 'completed', get body() { throw new Error('UI read a raw result'); } },
            get arguments() { throw new Error('UI read raw arguments'); } };
        options.onCall({ call: { kind: 'maintenance' }, result: { text: 'visible reply' }, tools: Array.from({ length: 50 }, () => tool) });
        return { status: 'completed', summary: '', messages: protocol };
    });
    await h.chat.send(h.request('fixture question'));
    const first = h.chat.snapshot();
    assert.equal(first.turns[0].toolCount, 50);
    assert.equal(first.turns[0].tools.length, MEMORY_CHAT_TOOL_LIMIT);
    assert.deepEqual(Object.keys(first.turns[0].tools[0]).sort(), ['name', 'status']);
    assert.equal(first.turns[0].answer, 'visible reply');
    assert.equal(JSON.stringify(first).includes('private-result'), false);
    await h.chat.send(h.request('fixture followup'));
    assert.equal(calls, 2);
});

test('staged progress and unknown save checks are never reported as completed saves', async t => {
    let stagedSnapshot;
    const h = controllerFixture(t, async (_task, options) => {
        options.onProgress({ action: 'editing', saved: 0, staged: 3 });
        options.onCall({ call: { kind: 'maintenance' }, tools: [{ name: 'RecoverMaintenanceSave', response: { state: 'unknown' } }] });
        stagedSnapshot = h.chat.snapshot();
        return { status: 'unconfirmed', staged: 3, saved: 0, messages: [] };
    });
    await h.chat.send(h.request('fixture edit'));
    assert.equal(stagedSnapshot.turns[0].staged, 3);
    assert.equal(stagedSnapshot.turns[0].saved, 0);
    assert.equal(stagedSnapshot.turns[0].tools[0].status, 'unknown');
    assert.equal(h.chat.snapshot().turns[0].staged, 3);
});

test('chat pages and live deltas are bounded, identity-scoped and independent of model history', async t => {
    const h = controllerFixture(t);
    for (let index = 0; index < 45; index++) await h.chat.send(h.request(`fixture question ${index}`));
    const latest = h.chat.query();
    assert.equal(latest.turns.length, MEMORY_CHAT_PAGE_SIZE);
    assert.equal(latest.page.total, 45);
    assert.equal(latest.page.older, 20);
    assert.deepEqual(latest.turns.map(turn => turn.id), Array.from({ length: 20 }, (_, index) => String(26 + index)));
    assert.equal(h.chat.liveSnapshot().turns.length, 20);
    assert.equal(h.chat.liveSnapshot().turns.length, 0);
    const older = h.chat.query({ ...h.request(), offset: 20 });
    assert.deepEqual(older.turns.map(turn => turn.id), Array.from({ length: 20 }, (_, index) => String(6 + index)));
    assert.equal(older.page.newer, 0);
    const last = h.chat.query({ ...h.request(), offset: 40 });
    assert.equal(last.turns.length, 5);
    assert.equal(last.page.older, null);
    assert.throws(() => h.chat.query({ identity: 'stale', offset: 0 }), { code: 'conflict' });
    const oldIdentity = h.chat.identity;
    h.switch('chat-b');
    assert.throws(() => h.chat.query({ identity: oldIdentity, offset: 20 }), { code: 'conflict' });
    assert.equal(h.chat.snapshot().page.total, 0);
});

test('save uncertainty is explained without echoing internal codes or raw failure messages', () => {
    const message = 'fixture private transport detail';
    for (const code of ['metadata_save_unconfirmed', 'memory_refresh_failed']) {
        const shown = memoryChatErrorText({ code, message });
        assert.ok(shown);
        assert.equal(shown.includes(code), false);
        assert.equal(shown.includes(message), false);
    }
});
