/* global Buffer */
// Host/scheduler acceptance: transient metadata saves retain triggers, while only
// a new confirmed summary can restart failed paid work. Exercise real sessions,
// runner, receipts and commit waits; replace only browser/API/index boundaries.
import assert from 'node:assert/strict';
import { after, afterEach, beforeEach, test } from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';
import { maintenanceFixture } from './fixtures/memory-maintenance.js';
import { createMemoryScheduler } from '../maintenance/scheduler.js';
import { maintenanceRanges } from '../maintenance/ranges.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const host = globalThis.__maintenanceSchedulerTest = {};
const shims = {
    'extensions.js': 'export const getContext=()=>globalThis.__maintenanceSchedulerTest.context;',
    'script.js': 'export let chat_metadata=globalThis.__maintenanceSchedulerTest.metadata; export function reload(){chat_metadata=globalThis.__maintenanceSchedulerTest.metadata;} export const getRequestHeaders=()=>({});',
    'modules/story-summary/data/store.js': 'export const getSummaryStore=()=>globalThis.__maintenanceSchedulerTest.metadata.extensions.LittleWhiteBox.storySummary;',
    'modules/story-summary/data/config.js': 'export const getSummaryPanelConfig=()=>globalThis.__maintenanceSchedulerTest.config;',
    'modules/story-summary/vector/storage/state-store.js': 'export const getStateAtoms=()=>globalThis.__maintenanceSchedulerTest.metadata.extensions.LittleWhiteBox.stateAtoms; export const getL0Index=()=>globalThis.__maintenanceSchedulerTest.metadata.extensions.LittleWhiteBox.l0Index; export const deleteStateVectorsByIds=async()=>{};',
    'modules/story-summary/vector/storage/chunk-store.js': 'export const deleteEventVectorsByIds=async()=>{};',
    'modules/story-summary/vector/runtime/runtime.js': 'export const clearRecallRuntime=async()=>{};',
    'modules/story-summary/maintenance/indexes.js': 'export const inspectMaintenanceIndexes=async()=>({status:"ready",events:[],atoms:[]}); export const repairMaintenanceIndexes=async()=>({status:"ready"});',
    'modules/story-summary/maintenance/runner.js': 'import {runMemoryAgent as run} from "actual-maintenance-runner"; export const createSharedMemoryAgent=()=>globalThis.__maintenanceSchedulerTest.agent(); export const runMemoryAgent=async(...args)=>{const result=await run(...args); globalThis.__maintenanceSchedulerTest.onRunFinished?.(result); return result;};',
    'modules/agent-core/settings-repository.js': 'export const loadSharedAgentSettings=async()=>({});',
    'modules/agent-core/browser-entry.js': 'export const setHostChatCompletionsRequestHeadersProvider=()=>{}; export const createAgentAdapter=()=>{};',
};
const bundled = await build({
    stdin: { resolveDir: root, contents: [
        "export * from './modules/story-summary/maintenance/host.js';",
        "export * from './modules/story-summary/maintenance/notification.js';",
        "export * from './modules/story-summary/data/memory-commit.js';",
        "export * from './modules/story-summary/data/summary-history.js';",
        "export * from './modules/story-summary/data/summary-undo.js';",
        "export {reload} from 'script.js';",
    ].join('\n') },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'maintenance-host-boundaries', setup(api) {
        api.onResolve({ filter: /^actual-maintenance-runner$/ }, () => ({ path: path.join(root, 'modules/story-summary/maintenance/runner.js') }));
        api.onResolve({ filter: /.*/ }, args => {
            const relative = path.relative(root, path.resolve(args.resolveDir, args.path)).replaceAll('\\', '/');
            const key = Object.hasOwn(shims, relative) ? relative : path.basename(args.path);
            return Object.hasOwn(shims, key) ? { path: key, namespace: 'host' } : null;
        });
        api.onLoad({ filter: /.*/, namespace: 'host' }, args => ({ contents: shims[args.path], resolveDir: root }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Generated local test bundle, never external code.
const mod = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const originalFetch = globalThis.fetch;
after(() => { globalThis.fetch = originalFetch; delete globalThis.__maintenanceSchedulerTest; });
const memory = () => host.metadata.extensions.LittleWhiteBox;
const store = () => memory().storySummary;
const deferred = () => {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
};

beforeEach(() => {
    const fixture = maintenanceFixture();
    Object.assign(host, { fixture, enabled: true, config: { memoryMaintenanceEnabled: true, textFilterRules: [] },
        requests: [], writes: 0, listeners: new Set(), afterSave: null, onRunFinished: null,
        respond: async () => ({ text: 'Review finished.' }),
        metadata: { extensions: { LittleWhiteBox: {
            storySummary: { json: fixture.json, lastSummarizedMesId: fixture.cutoff,
                summaryHistory: [mod.createSummaryBaseline(fixture.cutoff)] },
            stateAtoms: fixture.atoms, l0Index: fixture.l0Index,
        } } },
    });
    host.context = { ...fixture, characterId: 0, characters: [{ name: '角色', chat: fixture.chatId, avatar: 'fixture.png' }],
        saveMetadata: async () => {
            host.writes++;
            host.disk = structuredClone(host.metadata);
            await host.afterSave?.();
        },
    };
    host.disk = structuredClone(host.metadata);
    globalThis.fetch = async () => new Response(JSON.stringify([{ chat_metadata: host.disk }]));
    host.agent = () => ({
        adapter: { chat: async request => { host.requests.push(request); return host.respond(request); } },
        config: { provider: 'openai', model: 'fixture', maxTokens: 1000 },
        countTokens: async () => ({ tokens: 100, source: 'test' }),
    });
    mod.reload();
    host.maintenance = mod.createMemoryMaintenanceHost({
        isEnabled: () => host.enabled,
        invalidateRecall() {}, refreshSummary() {},
        changed: () => { for (const listener of host.listeners) listener(); },
    });
    host.maintenance.start();
});
afterEach(() => { host.maintenance.stop(); });

function submitted(start = 0) {
    mod.notifySummaryCommitted({ chatId: host.context.chatId, start, cutoff: store().lastSummarizedMesId });
}
function waitForStatus(status) {
    return new Promise((resolve, reject) => {
        const inspect = async () => {
            try {
                const result = await host.maintenance.results();
                if (result.state.status === status) { host.listeners.delete(inspect); resolve(result); }
            } catch (error) { host.listeners.delete(inspect); reject(error); }
        };
        host.listeners.add(inspect);
        inspect().catch(reject);
    });
}
async function holdSave(t) {
    const started = deferred(), release = deferred();
    host.afterSave = () => { started.resolve(); return release.promise; };
    const next = mod.readSummaryMemory();
    next.storySummary.updatedAt = 1;
    const saved = mod.commitSummaryMemory(host.context.chatId, next);
    t.after(async () => { release.resolve(); await saved; });
    await started.promise;
    return { saved, release: () => { host.afterSave = null; release.resolve(); } };
}
async function appendSummary() {
    const next = mod.readSummaryMemory();
    const oldCutoff = next.storySummary.lastSummarizedMesId;
    const cutoff = oldCutoff + 2;
    next.storySummary.summaryHistory.push(mod.createSummaryBatch(oldCutoff, cutoff,
        mod.buildSummaryUndo(next.storySummary.json, next.storySummary.json)));
    next.storySummary.lastSummarizedMesId = cutoff;
    host.context.chat.push({ mes: '继续旅程', is_user: true }, { mes: '两人继续前进', is_user: false });
    await mod.commitSummaryMemory(host.context.chatId, next);
    submitted(oldCutoff + 1);
}

const options = { timeout: 5000 };
test('a summary submitted during saving waits and runs exactly once after confirmation', options, async t => {
    const saving = await holdSave(t);
    const finished = waitForStatus('partial');
    submitted();
    await nextTurn();
    assert.equal(mod.getMemoryCommitState(), 'saving');
    assert.equal(host.requests.length, 0);
    assert.equal((await host.maintenance.results()).state.status, 'running');
    saving.release();
    await saving.saved;
    const result = await finished;
    assert.equal(host.requests.length, 1);
    assert.deepEqual(result.ranges.pending, [{ from: 1, to: 24 }]);
    await nextTurn();
    assert.equal(host.requests.length, 1);
});

test('a writer starting between readiness and resumption does not consume the trigger', options, async t => {
    const finished = waitForStatus('partial');
    submitted();
    // Drain starts first; this writer acquires metadata before the initial
    // asynchronous readiness check resumes in the next microtask.
    const saving = await Promise.resolve().then(() => holdSave(t));
    await nextTurn();
    assert.equal(host.requests.length, 0);
    assert.equal((await host.maintenance.results()).state.status, 'running');
    saving.release();
    await saving.saved;
    await finished;
    assert.equal(host.requests.length, 1);
});

for (const disabled of ['feature/chat', 'maintenance']) {
    test(`disabled ${disabled} makes no model or metadata call`, options, async () => {
        if (disabled === 'feature/chat') host.enabled = false;
        else host.config.memoryMaintenanceEnabled = false;
        submitted();
        await nextTurn();
        assert.equal(host.requests.length, 0);
        assert.equal(host.writes, 0);
        assert.equal((await host.maintenance.results()).state.status, 'idle');
    });
}

test('disabling an accepted task before it drains prevents a model call', async () => {
    let enabled = true, requests = 0;
    const observed = [];
    const scheduler = createMemoryScheduler({ enabled: () => enabled,
        run: async () => { requests++; return { status: 'completed' }; },
        changed: () => observed.push(scheduler.snapshot('chat').status),
    });
    scheduler.submitted({ chatId: 'chat', start: 0, cutoff: 2 });
    enabled = false;
    await scheduler.settled();
    assert.equal(requests, 0);
    assert.equal(observed.at(-1), 'idle');
});

test('disabling while waiting for a save prevents a model call when it settles', options, async t => {
    const saving = await holdSave(t);
    submitted();
    await nextTurn();
    const finished = waitForStatus('failed');
    host.config.memoryMaintenanceEnabled = false;
    saving.release();
    await saving.saved;
    await finished;
    assert.equal(host.requests.length, 0);
    assert.equal(host.writes, 1);
});

test('cancelling a save wait settles immediately without cancelling the owning save', options, async t => {
    const saving = await holdSave(t);
    submitted();
    await nextTurn();
    const cancelled = waitForStatus('cancelled');
    host.maintenance.cancel();
    await cancelled;
    assert.equal(mod.getMemoryCommitState(), 'saving');
    assert.equal(host.requests.length, 0);
    saving.release();
    await saving.saved;
    await nextTurn();
    assert.equal(host.requests.length, 0);
    assert.equal(host.writes, 1);
});

test('cancelling a source-read save wait stops without another model request or receipt', options, async t => {
    const blocked = deferred();
    host.respond = async () => {
        const saving = await holdSave(t);
        blocked.resolve(saving);
        return { text: '', toolCalls: [{ id: 'source', name: 'ReadSource', arguments: JSON.stringify({ floor: 2 }) }] };
    };
    submitted();
    const saving = await blocked.promise;
    await nextTurn();
    const cancelled = waitForStatus('cancelled');
    host.maintenance.cancel();
    await cancelled;
    assert.equal(mod.getMemoryCommitState(), 'saving');
    assert.equal(host.requests.length, 1);
    assert.equal(host.writes, 1);
    saving.release();
    await saving.saved;
    await nextTurn();
    assert.equal(host.requests.length, 1);
    assert.equal(store().summaryHistory[0].maintenance.length, 0);
});

test('an API failure is not retried until a new summary carries all remaining ranges', options, async () => {
    host.respond = async () => {
        if (host.requests.length === 1) return { text: '', toolCalls: [{ id: 'done', name: 'CompleteMaintenance', arguments: JSON.stringify({ from: 1, to: 6 }) }] };
        throw Object.assign(new Error('provider refused'), { status: 401 });
    };
    const failed = waitForStatus('failed');
    submitted();
    const first = await failed;
    assert.equal(host.requests.length, 2);
    assert.equal(first.state.code, 'agent_auth');
    assert.deepEqual(first.ranges.pending, [{ from: 7, to: 24 }]);
    await nextTurn();
    assert.equal(host.requests.length, 2);
    host.respond = async () => ({ text: 'The new review ended normally.' });
    const finished = waitForStatus('partial');
    await appendSummary();
    await finished;
    assert.equal(host.requests.length, 3);
    const opening = JSON.parse(host.requests.at(-1).messages[0].content);
    assert.deepEqual(opening.task.completed, [{ from: 1, to: 6 }]);
    assert.deepEqual(opening.task.pending, [{ from: 7, to: 26 }]);
    await nextTurn();
    assert.equal(host.requests.length, 3);
});

test('a new summary through floor 410 retains the old 141–390 gap after floor 140 completed', () => {
    const history = [mod.createSummaryBaseline(139),
        mod.createSummaryBatch(139, 389, mod.buildSummaryUndo({}, {}))];
    // This pure projection only consumes the receipts' completion ranges.
    history[0].maintenance.push({ completion: { from: 1, to: 140 } });
    assert.deepEqual(maintenanceRanges(history, 389).pending, [{ from: 141, to: 390 }]);
    history.push(mod.createSummaryBatch(389, 409, mod.buildSummaryUndo({}, {})));
    const next = maintenanceRanges(history, 409);
    assert.deepEqual(next.completed, [{ from: 1, to: 140 }]);
    assert.deepEqual(next.pending, [{ from: 141, to: 410 }]);
});

test('a new summary in the same chat queues behind the active run and retains old gaps', options, async t => {
    const active = deferred(), release = deferred();
    t.after(() => release.resolve());
    host.respond = async () => {
        if (host.requests.length === 1) { active.resolve(); await release.promise; }
        return { text: 'No completion was declared.' };
    };
    submitted();
    await active.promise;
    await appendSummary();
    assert.equal(host.requests.length, 1);
    const finished = waitForStatus('partial');
    release.resolve();
    await finished;
    assert.equal(host.requests.length, 2);
    assert.deepEqual(JSON.parse(host.requests[1].messages[0].content).task.pending, [{ from: 1, to: 26 }]);
});

test('changed source with unchanged L2 starts and does not hide running status', options, async t => {
    const active = deferred(), release = deferred();
    t.after(() => release.resolve());
    host.context.chat = host.context.chat.map((message, index) => index === 1 ? { ...message, mes: '最新正文' } : message);
    store().sourceInvalidFromFloor = 1;
    mod.noteInvalidMemorySource(1);
    host.respond = async () => { active.resolve(); await release.promise; return { text: 'Reviewed current memory.' }; };
    submitted();
    await active.promise;
    assert.equal((await host.maintenance.results()).state.status, 'running');
    const finished = waitForStatus('partial');
    release.resolve();
    await finished;
    assert.equal(host.requests.length, 1);
});

for (const invalid of ['flagged history', 'missing history', 'missing boundary']) {
    test(`${invalid} cannot start a model call or write maintenance`, options, async () => {
        if (invalid === 'flagged history') store().summaryInvalid = true;
        else if (invalid === 'missing history') store().summaryHistory = [];
        else store().lastSummarizedMesId = -1;
        const failed = waitForStatus(invalid === 'flagged history' ? 'history_invalid' : 'failed');
        submitted();
        await failed;
        await nextTurn();
        assert.equal(host.requests.length, 0);
        assert.equal(host.writes, 0);
    });
}

for (const invalid of ['changed chat', 'damaged history', 'deleted memory', 'replaced history', 'replaced store']) {
    test(`${invalid} after model input cannot write an edit or final receipt`, options, async t => {
        // These intentional write conflicts are asserted below; do not print the
        // generated bundle's data URL in the coordinator's diagnostic log.
        t.mock.method(console, 'warn', () => {});
        host.respond = async () => {
            if (invalid === 'changed chat') host.context.chatId = 'another-chat';
            else if (invalid === 'damaged history') store().summaryInvalid = true;
            else if (invalid === 'deleted memory') { store().json = {}; store().lastSummarizedMesId = -1; store().summaryHistory = []; }
            else if (invalid === 'replaced store') memory().storySummary = structuredClone(store());
            else {
                store().summaryHistory = [mod.createSummaryBaseline(19),
                    mod.createSummaryBatch(19, 23, mod.buildSummaryUndo(store().json, store().json))];
            }
            return { text: '', toolCalls: [{ id: 'edit', name: 'EditMemory', arguments: JSON.stringify({ edits: [
                { kind: 'edit', collection: 'facts', key: 'f-1', patch: { o: '不得保存的改动' } },
            ] }) }] };
        };
        const finished = deferred();
        host.onRunFinished = finished.resolve;
        submitted();
        assert.equal((await finished.promise).status, 'failed');
        assert.equal(host.requests.length, 1);
        assert.equal(host.writes, 0);
        assert.notEqual(store().json?.facts?.[0]?.o, '不得保存的改动');
    });
}
