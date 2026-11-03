// Contracts: atomic domain edits/undo, evidence authority, persistence ordering and scheduler cost boundaries.
// Pure/session ports catch corruption and paid-trigger mistakes which retrieval tests do not exercise.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { editMemory, editMemoryBatch, restoreMaintenance, maintenanceImpact } from '../maintenance/domain.js';
import { createMemorySession } from '../maintenance/session.js';
import { projectMaintenanceReceipts } from '../maintenance/history.js';
import { upgradeSummaryHistory, appendMaintenanceReceipt, createSummaryBaseline } from '../data/summary-history.js';
import { buildSummaryUndo, applyExactSummaryHistoryUndo } from '../data/summary-undo.js';
import { commitMemorySession } from '../maintenance/commit.js';
import { createMemoryScheduler } from '../maintenance/scheduler.js';
import { createMetadataConfirmation } from '../data/metadata-confirmation.js';
import { EXT_ID } from '../../../core/constants.js';
import { maintenanceFixture, joinedEventPatch } from './fixtures/memory-maintenance.js';
import { memoryPolicy, SUMMARY_STANDARD } from '../data/memory-policy.js';
import { projectSummaryEvent } from '../data/events.js';
import { upgradeStoredEventMemoryRoles } from '../data/migrations/event-memory-role.js';

const data = () => { const fixture = maintenanceFixture(); return { json: fixture.json, atoms: fixture.atoms }; };
const merge = { kind: 'merge', collection: 'events', key: 'evt-1', removeIds: ['evt-2'], patch: joinedEventPatch };
const receiptFor = changes => ({ version: 2, id: 'receipt', runId: 'run', policy: memoryPolicy(),
    operations: [{ ...merge, changes }], coverage: { supplied: [], missingAnchors: [] } });

// Stored batches compare against this value; changing generation wording makes
// every existing record's writing standard unknown.
test('summary generation rules keep the recorded writing-standard fingerprint', () => {
    assert.equal(SUMMARY_STANDARD, 'c38678e33bf385a523b61c900de8a752926ebec689b0bac78b9756c855396513');
});

test('captured batched receipt migrates once without losing diffs, notes, supplied ranges or retirement', () => {
    // Captured from the previous session/runner/commit code, not constructed with the current receipt model.
    const receipt = JSON.parse(readFileSync(new URL('./fixtures/maintenance-receipt-v1.json', import.meta.url), 'utf8'));
    const history = [{ ...createSummaryBaseline(1), maintenance: [receipt] }];
    const upgraded = upgradeSummaryHistory(history);
    const current = upgraded.value[0].maintenance[0];
    assert.equal(upgraded.changed, true);
    assert.equal(upgradeSummaryHistory(upgraded.value).changed, false);
    assert.equal(current.version, 2);
    assert.equal(Object.hasOwn(current, 'completion'), false);
    assert.equal(Object.hasOwn(current, 'part'), false);
    assert.equal(Object.hasOwn(current, 'mode'), false);
    assert.deepEqual(current.operations, receipt.operations);
    assert.deepEqual(current.coverage.supplied, receipt.coverage.supplied);
    assert.equal(current.summary, receipt.summary);
    const change = current.operations[0].changes[0];
    assert.deepEqual(restoreMaintenance({ json: { facts: [change.after] }, atoms: [] }, [current]).json.facts, [change.before]);
    const corrupt = structuredClone(history);
    delete corrupt[0].maintenance[0].operations[0].changes[0].before;
    assert.throws(() => upgradeSummaryHistory(corrupt), { code: 'invalid_history' });
});

test('cross-batch merge preserves oldest identity, redirects causes, leaves independent episode and anchors intact', () => {
    const before = data();
    const result = editMemory(before, merge, 23);
    assert.equal(result.memory.json.events.length, 3);
    assert.equal(result.memory.json.events[0].id, 'evt-1');
    assert.deepEqual(result.memory.json.events.find(event => event.id === 'evt-4').causedBy, ['evt-1']);
    assert.deepEqual(result.memory.json.events.find(event => event.id === 'evt-3'), before.json.events[2]);
    assert.deepEqual(result.memory.atoms, before.atoms);
    assert.deepEqual(maintenanceImpact([{ changes: result.changes }]).eventIds, ['evt-1', 'evt-2', 'evt-4']);
    assert.deepEqual(restoreMaintenance(result.memory, [receiptFor(result.changes)]), before);
    assert.equal(before.json.events.length, 4);
});

test('merge selects the oldest identity regardless of model ordering; dangling causes are refused, a large cause union is kept', () => {
    const before = data();
    assert.deepEqual(editMemory(before, { ...merge, key: 'evt-2', removeIds: ['evt-1'] }, 23), editMemory(before, merge, 23));
    assert.throws(() => editMemory(before, { kind: 'delete', collection: 'events', key: 'evt-2' }, 23), { code: 'invalid_reference' });
    for (let i = 5; i <= 8; i++) before.json.events.push({ ...before.json.events[2], id: `evt-${i}` });
    before.json.events[0].causedBy = ['evt-5', 'evt-6'];
    before.json.events[1].causedBy = ['evt-7', 'evt-8'];
    const snapshot = structuredClone(before);
    assert.deepEqual(editMemory(before, merge, 23).memory.json.events[0].causedBy, ['evt-5', 'evt-6', 'evt-7', 'evt-8']);
    assert.deepEqual(before, snapshot);
    const resolved = editMemory(before, { ...merge, patch: { ...joinedEventPatch, causedBy: ['evt-5', 'evt-7'] } }, 23);
    assert.deepEqual(resolved.memory.json.events[0].causedBy, ['evt-5', 'evt-7']);
});

test('one rejected memory batch identifies independent dangling references, cycles and fact conflicts', () => {
    const before = data();
    before.json.characterAliases = [{ from: '实', to: '夏实', evidence: '', _addedAt: 19 },
        { from: '旅者', to: '旅人', evidence: '', _addedAt: 19 }];
    const snapshot = structuredClone(before);
    const edits = [
        { kind: 'edit', collection: 'events', key: 'evt-1', patch: { causedBy: ['missing-a'] } },
        { kind: 'edit', collection: 'events', key: 'evt-2', patch: { causedBy: ['missing-b'] } },
        { kind: 'edit', collection: 'events', key: 'evt-3', patch: { causedBy: ['evt-3'] } },
        { kind: 'edit', collection: 'facts', key: 'f-2', patch: { p: '回收原因' } },
        { kind: 'edit', collection: 'facts', key: 'f-4', patch: { p: '承诺' } },
        { kind: 'edit', collection: 'characterAliases', key: '实', patch: { to: '旅者' } },
        { kind: 'edit', collection: 'characterAliases', key: '旅者', patch: { to: '实' } },
    ];
    assert.throws(() => editMemoryBatch(before, edits, 23), error => {
        assert.deepEqual(error.rejected.map(issue => issue.code).sort(), [
            'invalid_reference', 'invalid_reference', 'invalid_reference', 'fact_conflict', 'fact_conflict', 'invalid_alias',
        ].sort());
        assert.deepEqual(error.rejected.filter(issue => issue.expected?.missing).map(issue => issue.expected.missing), ['missing-a', 'missing-b']);
        assert.deepEqual(error.unchecked, []);
        return true;
    });
    assert.deepEqual(before, snapshot);
});

test('name-based edit targets stay unambiguous inside an atomic batch', () => {
    const before = data(), snapshot = structuredClone(before);
    assert.throws(() => editMemoryBatch(before, [
        { kind: 'edit', collection: 'characters', key: '夏实', patch: { name: '旅人' } },
        { kind: 'delete', collection: 'characters', key: '旅人' },
    ], 23), { code: 'invalid_record' });
    assert.deepEqual(before, snapshot);
});

test('a rewritten event summary without a source marker keeps the span of the events it replaces', () => {
    const result = editMemory(data(), { ...merge, patch: { summary: '石缝里找回东西后两人和好。' } }, 23);
    assert.equal(result.completedMarker, '(#17-23)');
    assert.equal(result.memory.json.events[0].summary, '石缝里找回东西后两人和好。 (#17-23)');
    assert.throws(() => editMemory(data(), { kind: 'edit', collection: 'events', key: 'evt-1', patch: { summary: '越界 (#30)' } }, 23), { code: 'source_boundary' });
});

test('maintenance then batch undo restores the early episode, not a future ending or entire deletion', () => {
    const generated = data();
    const previous = structuredClone(generated.json);
    previous.events = previous.events.filter(event => event._addedAt === 19);
    const undo = buildSummaryUndo(previous, generated.json);
    const result = editMemory(generated, merge, 23);
    const history = [{ format: 2, kind: 'batch', endMesId: 23, previousEndMesId: 19, undo, maintenance: [receiptFor(result.changes)] }];
    const restored = applyExactSummaryHistoryUndo(result.memory.json, history, 19, 23, result.memory.atoms);
    assert.equal(restored.historyDiscontinuous, false);
    assert.deepEqual(restored.json, previous);
    assert.deepEqual(restored.atoms, generated.atoms);
});

test('ordered repeated maintenance also restores aliases and anchors; manual conflict refuses all', () => {
    const before = data();
    before.json.characterAliases = [{ from: '实', to: '药君', evidence: '旧记录', _addedAt: 19 }];
    const first = editMemory(before, { kind: 'edit', collection: 'characterAliases', key: '实', patch: { to: '夏实' } }, 23);
    const second = editMemory(first.memory, { kind: 'edit', collection: 'anchors', key: 'atom-1-0', patch: { semantic: '夏实听说自己可能因看到机密而被回收，但未经证实。', edges: [] } }, 23);
    assert.notEqual(second.memory.atoms[0].quality, before.atoms[0].quality);
    const receipts = [receiptFor(first.changes), receiptFor(second.changes)];
    assert.deepEqual(restoreMaintenance(second.memory, receipts), before);
    second.memory.atoms[0].semantic = '用户新编辑';
    assert.throws(() => restoreMaintenance(second.memory, receipts), { code: 'conflict' });
});

test('existing exact and boundary-only histories upgrade once; imported baseline does not fabricate undo', () => {
    const old = [{ endMesId: 19 }, { format: 1, endMesId: 23, previousEndMesId: 19, undo: buildSummaryUndo({}, {}) }];
    const upgraded = upgradeSummaryHistory(old);
    assert.equal(upgraded.changed, true);
    assert.equal(upgradeSummaryHistory(upgraded.value).changed, false);
    assert.equal(upgraded.value[0].kind, 'baseline');
    const store = { lastSummarizedMesId: 23, summaryHistory: [createSummaryBaseline(23)] };
    appendMaintenanceReceipt(store, receiptFor([]));
    assert.equal(store.summaryHistory[0].kind, 'baseline');
    assert.equal(applyExactSummaryHistoryUndo({}, store.summaryHistory, 19, 23).historyDiscontinuous, true);
    assert.equal(projectMaintenanceReceipts(store).items[0].counts.merges, 1);
});

function correctedSession() {
    const fixture = maintenanceFixture();
    const session = createMemorySession(fixture);
    session.initial();
    session.inputProvided();
    session.runTool('EditMemory', { edits: [{ kind: 'edit', collection: 'facts', key: 'f-1', patch: { o: '夏实听说可能与看到机密有关，未证实' } }] });
    return { session, fixture };
}

test('session accepts newly extracted anchors and later chat, but rejects edits to existing memory or another chat', () => {
    const { fixture, session } = correctedSession();
    const current = { ...fixture, atoms: [...fixture.atoms, { atomId: 'later', floor: 17 }], chat: [...fixture.chat, { mes: '继续' }] };
    assert.doesNotThrow(() => session.assertCurrent(current));
    assert.throws(() => session.assertCurrent({ ...current, chatId: 'other' }), { code: 'conflict' });
    current.json.facts[0].o = '手改';
    assert.throws(() => session.assertCurrent(current), { code: 'memory_updated' });
});

function commitPorts(fixture) {
    let state = { ...fixture, store: { json: fixture.json, lastSummarizedMesId: fixture.cutoff, summaryHistory: [createSummaryBaseline(fixture.cutoff)] } };
    const order = [];
    return {
        order,
        read: () => ({ ...state, json: state.store.json }),
        async commit(next, previous, impact, validate) {
            validate();
            state = { ...state, store: structuredClone(next.storySummary), atoms: structuredClone(next.stateAtoms), l0Index: structuredClone(next.l0Index) };
            order.push('commit');
        },
    };
}

test('maintenance constructs one atomic draft, preserves appended anchors and records coverage', async () => {
    const { fixture, session } = correctedSession();
    fixture.atoms.push({ atomId: 'new-extraction', floor: 17 });
    const ports = commitPorts(fixture);
    const result = await commitMemorySession(session, { calls: [], runId: 'run' }, ports);
    assert.deepEqual(ports.order, ['commit']);
    assert.equal(ports.read().atoms.at(-1).atomId, 'new-extraction');
    assert.equal(ports.read().store.summaryHistory[0].maintenance[0].id, result.receipt.id);
    assert.equal(result.receipt.coverage.supplied.length, 0);
});

test('maintenance rejects a changed source when the data commit validates after cache invalidation', async () => {
    const { fixture, session } = correctedSession();
    const ports = commitPorts(fixture);
    ports.commit = async (next, previous, impact, validate) => {
        ports.read().store.json.facts[0].o = 'manual';
        validate();
    };
    await assert.rejects(commitMemorySession(session, { calls: [], runId: 'run' }, ports), { code: 'memory_updated' });
    assert.equal(ports.read().store.json.facts[0].o, 'manual');
    assert.equal(ports.read().store.summaryHistory[0].maintenance.length, 0);
});

test('cancellation during confirmed persistence remains a saved result, not an uncommitted cancellation', async () => {
    const { fixture, session } = correctedSession();
    const ports = commitPorts(fixture);
    const controller = new AbortController();
    ports.commit = async () => controller.abort();
    const result = await commitMemorySession(session, { calls: [], runId: 'run' }, ports, controller.signal);
    assert.ok(result.receipt.id);
});

test('readback verification detects swallowed saves and retries only read failures', async () => {
    const context = { chatId: 'fixture', characterId: 0, characters: [{ name: '角色', chat: 'fixture', avatar: 'fixture.png' }] };
    let calls = 0;
    const fetcher = async (_url, options) => {
        calls++;
        assert.equal(JSON.parse(options.body).file_name, 'fixture');
        if (calls < 3) throw new Error('read network');
        return { ok: true, json: async () => [{ chat_metadata: { extensions: { [EXT_ID]: { storySummary: { value: 1 } } } } }] };
    };
    const confirm = createMetadataConfirmation(context, () => ({}), fetcher);
    await confirm({ storySummary: { value: 1 } });
    assert.equal(calls, 3);
    await assert.rejects(confirm({ storySummary: { value: 2 } }, { storySummary: { value: 1 } }), { code: 'metadata_not_saved', uncertain: false });
    await assert.rejects(confirm({ storySummary: { value: 2 } }), { uncertain: true });
});

test('scheduler is zero-call until trigger, queues new batches, and restart is idle', async () => {
    let enabled = false;
    const tasks = [];
    let resume;
    const scheduler = createMemoryScheduler({ enabled: () => enabled, run: async (task, signal) => {
        tasks.push(task);
        if (tasks.length === 1) await new Promise(resolve => { resume = resolve; });
        assert.equal(signal.aborted, false);
        return { receipt: { id: 'r' } };
    } });
    scheduler.submitted({ chatId: 'a', cutoff: 19, start: 0 });
    enabled = true;
    await Promise.resolve();
    assert.equal(tasks.length, 0);
    scheduler.submitted({ chatId: 'a', cutoff: 19, start: 0 });
    await Promise.resolve();
    scheduler.submitted({ chatId: 'a', cutoff: 39, start: 20 });
    assert.equal(scheduler.snapshot('a').cutoff, 20);
    resume();
    await scheduler.settled();
    assert.deepEqual(tasks.map(task => [task.start, task.cutoff]), [[0, 19], [20, 39]]);
    const restarted = createMemoryScheduler({ enabled: () => true, run: () => assert.fail('reload called model') });
    assert.equal(restarted.snapshot('a').status, 'idle');
});

test('new automatic batches coalesce only in the queue during thinking, saving or indexing', async () => {
    for (const phaseAtNotification of ['running', 'saving', 'indexing']) {
        const tasks = [];
        let resume;
        const scheduler = createMemoryScheduler({ enabled: () => true, run: async (task, signal, phase) => {
            tasks.push(task);
            phase(phaseAtNotification);
            if (tasks.length === 1) await new Promise(resolve => { resume = resolve; });
            assert.equal(signal.aborted, false);
            return {};
        } });
        scheduler.submitted({ chatId: 'a', start: 0, cutoff: 19 });
        await Promise.resolve();
        scheduler.submitted({ chatId: 'a', start: 20, cutoff: 39 });
        scheduler.submitted({ chatId: 'a', start: 40, cutoff: 59 });
        resume();
        await scheduler.settled();
        assert.deepEqual(tasks.map(task => [task.start, task.cutoff]), [[0, 19], [20, 59]]);
    }
});

test('alias corrections use the existing graph contract rather than creating identity cycles', () => {
    const before = data();
    before.json.characterAliases = [{ from: '甲', to: '乙', evidence: '', _addedAt: 1 }, { from: '乙', to: '丙', evidence: '', _addedAt: 1 }];
    assert.throws(() => editMemory(before, { kind: 'edit', collection: 'characterAliases', key: '乙', patch: { to: '甲' } }, 23), { code: 'invalid_alias' });
});

test('uncertain data commit reports receipt identity without claiming a successful maintenance', async () => {
    const { fixture, session } = correctedSession();
    const ports = commitPorts(fixture);
    ports.commit = async () => { throw Object.assign(new Error('unconfirmed'), { uncertain: true }); };
    await assert.rejects(commitMemorySession(session, { calls: [], runId: 'run' }, ports), error => error.uncertain && !!error.receiptId);
});

// Regressions from review: successful-tool fixtures missed failed tools batched with submission,
// load-time projection, HTTP browser capabilities and the pre-notification save window.

test('current-format reload preserves repeated maintenance and enclosing summary undo, but not actual edits', () => {
    const generated = data();
    delete generated.json.events[0].timeLabel;
    generated.json.events = generated.json.events.map(projectSummaryEvent);
    const previous = structuredClone(generated.json);
    previous.events = previous.events.filter(event => event._addedAt === 19);
    const first = editMemory(generated, { kind: 'edit', collection: 'events', key: 'evt-1', patch: { timeLabel: '当天' } }, 23);
    const second = editMemory(first.memory, merge, 23);
    const store = JSON.parse(JSON.stringify({ json: second.memory.json, summaryHistory: [{ format: 2, kind: 'batch',
        endMesId: 23, previousEndMesId: 19, undo: buildSummaryUndo(previous, generated.json),
        maintenance: [receiptFor(first.changes), receiptFor(second.changes)],
    }] }));
    upgradeStoredEventMemoryRoles(store);
    const receipts = store.summaryHistory[0].maintenance;
    assert.deepEqual(restoreMaintenance({ json: store.json, atoms: generated.atoms }, receipts), generated);
    const restored = applyExactSummaryHistoryUndo(store.json, store.summaryHistory, 19, 23, generated.atoms);
    assert.equal(restored.historyDiscontinuous, false);
    assert.deepEqual(restored.json, previous);
    store.json.events[0].participants.reverse();
    assert.throws(() => restoreMaintenance({ json: store.json, atoms: generated.atoms }, receipts), { code: 'conflict' });
});

test('conflict before the new summary save notification hands off scope without an immediate retry', async () => {
    const fixture = maintenanceFixture();
    let current = { ...fixture, cutoff: 19 };
    let completeOld;
    const tasks = [];
    const scheduler = createMemoryScheduler({ enabled: () => true, run: async task => {
        tasks.push(task);
        if (tasks.length === 1) {
            const session = createMemorySession(current);
            await new Promise(resolve => { completeOld = resolve; });
            session.assertCurrent(current);
        }
        return { receipt: { id: 'saved' } };
    } });
    scheduler.submitted({ chatId: fixture.chatId, start: 0, cutoff: 19 });
    await Promise.resolve();
    current = { ...current, cutoff: 23 };
    completeOld();
    await scheduler.settled();
    assert.equal(tasks.length, 1);
    assert.equal(scheduler.snapshot(fixture.chatId).code, 'conflict');
    scheduler.submitted({ chatId: fixture.chatId, start: 20, cutoff: 23 });
    await scheduler.settled();
    assert.deepEqual(tasks.map(task => [task.start, task.cutoff]), [[0, 19], [0, 23]]);
    scheduler.submitted({ chatId: fixture.chatId, start: 24, cutoff: 39 });
    await scheduler.settled();
    assert.equal(tasks[2].start, 24);
});

test('abandoned conflict scopes do not survive cancellation, another chat, restart or uncertain saves', async () => {
    for (const scenario of ['cancel', 'other-chat', 'restart', 'uncertain', 'transport']) {
        const tasks = [];
        const options = { enabled: () => true, run: async task => {
            tasks.push(task);
            if (tasks.length === 1) throw Object.assign(new Error('failed'), {
                code: scenario === 'transport' ? 'agent_failed' : 'conflict', uncertain: scenario === 'uncertain',
            });
            return { receipt: { id: 'saved' } };
        } };
        let scheduler = createMemoryScheduler(options);
        scheduler.submitted({ chatId: 'a', start: 0, cutoff: 19 });
        await scheduler.settled();
        if (scenario === 'cancel') scheduler.cancel();
        if (scenario === 'restart') scheduler = createMemoryScheduler(options);
        scheduler.submitted({ chatId: scenario === 'other-chat' ? 'b' : 'a', start: 20, cutoff: 39 });
        await scheduler.settled();
        assert.equal(tasks[1].start, 20, scenario);
    }
});

test('disabling maintenance cancels active work and discards pending triggers', async () => {
    let enabled = true;
    const tasks = [];
    const scheduler = createMemoryScheduler({ enabled: () => enabled, run: async (task, signal) => {
        tasks.push(task);
        await new Promise(resolve => signal.addEventListener('abort', resolve, { once: true }));
        return { status: 'cancelled' };
    } });
    scheduler.submitted({ chatId: 'chat', start: 0, cutoff: 19 });
    await Promise.resolve();
    scheduler.submitted({ chatId: 'chat', start: 20, cutoff: 23 });
    enabled = false;
    scheduler.cancel();
    scheduler.submitted({ chatId: 'chat', start: 24, cutoff: 39 });
    await scheduler.settled();
    assert.equal(tasks.length, 1);
    assert.equal(scheduler.snapshot('chat').status, 'cancelled');
});

test('regenerating the same cutoff queues a new run', async () => {
    const tasks = [];
    let resume;
    const scheduler = createMemoryScheduler({ enabled: () => true, run: async (task, signal) => {
        tasks.push(task);
        if (tasks.length === 1) await new Promise(resolve => { resume = resolve; });
        assert.equal(signal.aborted, false);
        return { status: 'completed' };
    } });
    scheduler.submitted({ chatId: 'chat', start: 0, cutoff: 23 });
    await Promise.resolve();
    scheduler.submitted({ chatId: 'chat', start: 20, cutoff: 23 });
    resume();
    await scheduler.settled();
    assert.deepEqual(tasks.map(task => [task.start, task.cutoff]), [[0, 23], [20, 23]]);
    assert.equal(scheduler.snapshot('chat').status, 'completed');
});

test('queued batches start after the current run returns, including after its request limit', async () => {
    for (const closed of [false, true]) {
        let resume;
        let calls = 0;
        const scheduler = createMemoryScheduler({ enabled: () => true, run: async () => {
            if (++calls === 1) {
                await new Promise(resolve => { resume = resolve; });
            }
            return { status: closed ? 'completed' : 'turn_limit' };
        } });
        scheduler.submitted({ chatId: 'a', start: 0, cutoff: 19 });
        await Promise.resolve();
        scheduler.submitted({ chatId: 'a', start: 20, cutoff: 39 });
        resume(); await scheduler.settled();
        assert.equal(calls, 2);
    }
});
