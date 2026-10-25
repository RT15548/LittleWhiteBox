import { createTestModuleUrl } from './helpers/bundle-module.js';
// Host/scheduler acceptance: transient metadata saves retain triggers, while only
// a new confirmed summary can restart failed paid work. Exercise real sessions,
// runner, receipts and commit waits; replace only browser/API/index boundaries.
import assert from 'node:assert/strict';
import { after, afterEach, beforeEach, test } from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { setImmediate } from 'node:timers';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';
import { maintenanceFixture } from './fixtures/memory-maintenance.js';
import { createMemoryScheduler } from '../maintenance/scheduler.js';
import { createSummaryDiagnostics } from '../summary-diagnostics.js';
import { maintenanceRanges } from '../maintenance/ranges.js';
import { readMaintenanceDiagnostics } from '../maintenance/diagnostics.js';
import { getChatIdentity } from '../data/chat-identity.js';
import { entry } from './helpers/story-summary-entry.js';
import { hostSaveEntry } from './helpers/host-save-entry.js';

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
    'modules/story-summary/maintenance/runner.js': 'export {memoryRunId,estimateMemoryChatContext} from "actual-maintenance-runner"; import {runMemoryAgent as run} from "actual-maintenance-runner"; export const createSharedMemoryAgent=()=>globalThis.__maintenanceSchedulerTest.agent(); export const runMemoryAgent=async(...args)=>{const result=await run(...args); globalThis.__maintenanceSchedulerTest.onRunFinished?.(result); return result;};',
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
        "export * from './modules/story-summary/data/summary-import.js';",
        "export * from './modules/story-summary/vector/runtime/maintenance-coordinator.js';",
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
const mod = await import(await createTestModuleUrl(bundled.outputFiles[0].text));
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
        requests: [], writes: 0, files: [], confirmations: [], listeners: new Set(), afterSave: null, beforeReadback: null, onRunFinished: null,
        respond: async () => ({ text: 'Review finished.' }),
        metadata: { extensions: { LittleWhiteBox: {
            storySummary: { json: fixture.json, lastSummarizedMesId: fixture.cutoff,
                summaryHistory: [mod.createSummaryBaseline(fixture.cutoff)] },
            stateAtoms: fixture.atoms, l0Index: fixture.l0Index,
        } } },
    });
    host.initialMetadata = structuredClone(host.metadata);
    loadChatFile(createChatFile({ metadata: host.metadata }));
    globalThis.fetch = async (_url, request) => {
        const target = JSON.parse(request.body);
        const file = host.files.find(item => item.chatId === target.file_name && item.avatar === target.avatar_url);
        assert.ok(file);
        host.confirmations.push(target);
        await host.beforeReadback?.(file);
        return new Response(JSON.stringify([{ chat_metadata: file.disk }]));
    };
    host.agent = () => ({
        adapter: { chat: async request => { host.requests.push(request); return host.respond(request); } },
        config: { provider: 'openai', model: 'fixture', maxTokens: 1000 },
        countTokens: async () => ({ tokens: 100, source: 'test' }),
    });
    const diagnostics = createSummaryDiagnostics();
    host.maintenance = mod.createMemoryMaintenanceHost({
        readSummaryDiagnostics: args => diagnostics.read(getChatIdentity(host.context), args),
        isEnabled: () => host.enabled,
        invalidateRecall() {}, refreshSummary() {},
        changed: () => { for (const listener of host.listeners) listener(); },
    });
    host.maintenance.start();
});
afterEach(() => { host.maintenance.stop(); });

// Each host file owns its metadata and disk even after another chat is loaded.
// Readback resolves the captured host request target, not the current chat.
function createChatFile({ chatId = host.fixture.chatId, avatar = 'fixture.png', metadata = structuredClone(host.initialMetadata) } = {}) {
    const file = { chatId, avatar, metadata, disk: structuredClone(metadata) };
    host.files.push(file);
    return file;
}
function loadChatFile(file, reload = false) {
    if (reload) file.metadata = structuredClone(file.disk);
    const metadata = file.metadata;
    host.currentFile = file;
    host.metadata = metadata;
    host.context = { ...host.fixture, chatId: file.chatId, characterId: 0,
        characters: [{ name: '角色', chat: file.chatId, avatar: file.avatar }],
        saveMetadata: async () => {
            host.writes++;
            file.disk = structuredClone(metadata);
            await host.afterSave?.();
        },
    };
    mod.reload();
}
function switchLoadedChat(kind) {
    const previous = host.currentFile;
    if (kind === 'reload') loadChatFile(previous, true);
    else loadChatFile(createChatFile({ chatId: kind === 'chat' ? 'another-chat' : previous.chatId,
        avatar: kind === 'character' ? 'another-character.png' : previous.avatar }));
    host.maintenance.reset();
}

function submitted(start = 0) {
    mod.notifySummaryCommitted({ chatId: host.context.chatId, identity: getChatIdentity(host.context), start, cutoff: store().lastSummarizedMesId });
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

function chatRequest(text) {
    return { identity: host.maintenance.chat.snapshot().identity, ...(text === undefined ? {} : { text }) };
}

test('opening and drafting do not call the model; manual Q&A works with automatic maintenance disabled', options, async () => {
    host.config.memoryMaintenanceEnabled = false;
    const initial = host.maintenance.chat.snapshot();
    host.maintenance.chat.draft(chatRequest('检查上次维护'));
    assert.equal(host.maintenance.chat.snapshot().draft, '检查上次维护');
    assert.equal(host.requests.length, 0);
    assert.ok(initial.context.limit > initial.context.trigger);
    host.respond = async () => ({ text: '这次只回答问题。' });
    await host.maintenance.chat.send(chatRequest('检查上次维护'));
    const first = host.maintenance.chat.snapshot();
    assert.equal(first.turns[0].status, 'completed');
    assert.equal(host.writes, 0);
    await host.maintenance.chat.send(chatRequest('再解释一下'));
    assert.equal(host.requests.length, 2);
    assert.ok(host.requests[1].messages.some(message => message.content === '这次只回答问题。'));
    assert.equal(host.maintenance.chat.snapshot().turns.length, 2);
    assert.equal(host.writes, 0);
});

test('a manual diagnostic question can inspect missing summary history without trying to write', options, async () => {
    store().lastSummarizedMesId = -1;
    store().summaryHistory = [];
    host.respond = async () => host.requests.length === 1
        ? { text: '', toolCalls: [{ id: 'inspect', name: 'ReadMaintenance', arguments: '{}' }] }
        : { text: '还没有可维护的总结。' };
    await host.maintenance.chat.send(chatRequest('为什么没有维护？'));
    assert.equal(host.requests.length, 2);
    assert.deepEqual(host.requests[0].tools.map(tool => tool.function.name), ['ReadMaintenance']);
    const response = JSON.parse(host.requests[1].messages.find(message => message.role === 'tool').content);
    assert.equal(response.total, 0);
    assert.equal(host.writes, 0);
    assert.equal(host.maintenance.chat.snapshot().turns[0].status, 'completed');
});

test('manual edits keep the normal receipts and pending ranges; clearing chat does not undo memory', options, async () => {
    host.respond = async () => host.requests.length === 1
        ? { text: '', toolCalls: [{ id: 'edit', name: 'EditMemory', arguments: JSON.stringify({ edits: [
            { kind: 'edit', collection: 'facts', key: 'f-1', patch: { o: '人工指示修正' } },
        ] }) }] }
        : { text: '已修正指定记忆。' };
    await host.maintenance.chat.send(chatRequest('修改这一条记忆'));
    assert.equal(store().json.facts[0].o, '人工指示修正');
    const snapshot = host.maintenance.chat.snapshot();
    assert.equal(snapshot.turns[0].status, 'completed');
    assert.equal(snapshot.turns[0].saved, 1);
    assert.deepEqual(snapshot.ranges.pending, [{ from: 1, to: 24 }]);
    const saved = structuredClone(store());
    const writes = host.writes;
    await host.maintenance.chat.clear(chatRequest());
    assert.equal(host.maintenance.chat.snapshot().turns.length, 0);
    assert.deepEqual(store(), saved);
    assert.equal(host.writes, writes);
});

test('stopping a manual save wait cancels only that request, not the owning save', options, async t => {
    const saving = await holdSave(t);
    const run = host.maintenance.chat.send(chatRequest('检查维护状态'));
    await nextTurn();
    assert.equal(host.requests.length, 0);
    assert.equal(host.maintenance.chat.snapshot().busy, true);
    host.maintenance.chat.stop(chatRequest());
    await run;
    const stopped = host.maintenance.chat.snapshot();
    assert.equal(stopped.turns[0].status, 'cancelled');
    assert.equal(stopped.busy, false);
    assert.equal(mod.getMemoryCommitState(), 'saving');
    assert.equal(host.requests.length, 0);
    saving.release();
    await saving.saved;
    assert.equal(mod.getMemoryCommitState(), 'ready');
    assert.equal(host.writes, 1);
    assert.equal(store().updatedAt, 1);
    assert.deepEqual(host.currentFile.disk, host.metadata);
});

test('stopping during setup does not relabel an unconfirmed result as cancelled', options, async () => {
    const started = deferred(), release = deferred();
    host.agent = async () => {
        started.resolve();
        await release.promise;
        throw Object.assign(new Error('fixture persistence uncertainty'), { code: 'metadata_save_unconfirmed', uncertain: true });
    };
    const run = host.maintenance.chat.send(chatRequest('检查维护状态'));
    await started.promise;
    host.maintenance.chat.stop(chatRequest());
    release.resolve();
    await run;
    const result = host.maintenance.chat.snapshot();
    assert.equal(result.turns[0].status, 'unconfirmed');
    assert.equal(result.turns[0].error.code, 'metadata_save_unconfirmed');
    assert.equal(result.busy, false);
    assert.equal(host.requests.length, 0);
    assert.equal(host.writes, 0);
});

test('a queued question can cancel only itself while automatic work continues', options, async t => {
    const started = deferred(), release = deferred();
    t.after(() => release.resolve());
    host.respond = async () => { started.resolve(); await release.promise; return { text: '自动完成。' }; };
    submitted();
    await started.promise;
    const manual = host.maintenance.chat.send(chatRequest('稍后处理这条'));
    assert.equal(host.maintenance.chat.snapshot().turns[0].status, 'queued');
    host.maintenance.chat.stop(chatRequest());
    await manual;
    assert.equal(host.maintenance.chat.snapshot().turns[0].status, 'cancelled');
    assert.equal((await host.maintenance.results()).state.status, 'running');
    const finished = waitForStatus('partial');
    release.resolve();
    await finished;
    assert.equal(host.requests.length, 1);
});

test('takeover waits for automatic cancellation before starting the queued question', options, async () => {
    const started = deferred();
    let inFlight = 0, peak = 0;
    host.respond = async request => {
        inFlight++; peak = Math.max(peak, inFlight);
        try {
            if (host.requests.length === 1) {
                started.resolve();
                await new Promise((resolve, reject) => request.signal.addEventListener('abort', () => reject(request.signal.reason), { once: true }));
            }
            return { text: '收到人工问题。' };
        } finally { inFlight--; }
    };
    submitted();
    await started.promise;
    const manual = host.maintenance.chat.send(chatRequest('现在回答'));
    host.maintenance.chat.takeover(chatRequest());
    await manual;
    assert.equal(peak, 1);
    assert.equal(host.requests.length, 2);
    assert.equal(host.maintenance.chat.snapshot().turns[0].status, 'completed');
});

test('regeneration uses a fresh memory session and never replays previous saved tool calls', options, async () => {
    host.respond = async () => {
        if (host.requests.length === 1) return { text: '', toolCalls: [{ id: 'edit', name: 'EditMemory', arguments: JSON.stringify({ edits: [
            { kind: 'edit', collection: 'facts', key: 'f-1', patch: { o: '已经保存的成果' } },
        ] }) }] };
        return { text: '已完成。' };
    };
    await host.maintenance.chat.send(chatRequest('修正指定内容'));
    const writes = host.writes;
    await host.maintenance.chat.regenerate(chatRequest());
    assert.equal(host.maintenance.chat.snapshot().turns.length, 1);
    assert.equal(host.maintenance.chat.snapshot().turns[0].status, 'completed');
    assert.equal(store().json.facts[0].o, '已经保存的成果');
    assert.equal(host.writes, writes);
    assert.equal(host.requests.length, 3);
});

test('switching chat identity drops history and rejects stale commands even when filenames match', options, async () => {
    host.respond = async () => ({ text: '旧聊天回复' });
    const request = chatRequest('旧聊天问题');
    await host.maintenance.chat.send(request);
    host.context.characterId = 9;
    host.maintenance.reset();
    const next = host.maintenance.chat.snapshot();
    assert.notEqual(next.identity, request.identity);
    assert.deepEqual(next.turns, []);
    await assert.rejects(host.maintenance.chat.send(request), error => error.code === 'conflict');
    assert.equal(host.requests.length, 1);
});

test('reloading the same chat invalidates stale draft commands without calling the model', () => {
    const original = chatRequest('旧输入');
    host.maintenance.chat.draft(original);
    host.maintenance.reset();
    const next = host.maintenance.chat.snapshot();
    assert.notEqual(next.identity, original.identity);
    assert.equal(next.draft, '');
    assert.throws(() => host.maintenance.chat.draft(original), error => error.code === 'conflict');
    assert.equal(host.requests.length, 0);
});

test('automatic outcomes are isolated by character identity even when chat filenames match', options, async () => {
    const completed = waitForStatus('partial');
    submitted();
    await completed;
    host.context.characterId = 18;
    host.maintenance.reset();
    assert.equal((await host.maintenance.results()).state.status, 'idle');
    assert.equal(host.maintenance.chat.snapshot().automatic.status, 'idle');
});

for (const history of [{ corrupt: true }, [{ endMesId: 23, maintenance: [{ runId: 'broken', operations: [] }] }]]) {
    test('damaged history remains diagnosable without reading or writing untrusted progress', options, async () => {
        store().summaryInvalid = true;
        store().summaryHistory = structuredClone(history);
        const before = structuredClone(store());
        const initial = host.maintenance.chat.snapshot();
        assert.equal(initial.ranges, null);
        host.respond = async () => host.requests.length === 1
            ? { text: '', toolCalls: [{ id: 'diagnose', name: 'ReadMaintenance', arguments: '{}' }] }
            : { text: '历史结构损坏，不能确认维护进度。' };
        await host.maintenance.chat.send(chatRequest('检查维护状态'));
        const reply = JSON.parse(host.requests[1].messages.find(message => message.role === 'tool').content);
        assert.equal(reply.historyValid, false);
        assert.equal(reply.code, 'invalid_history');
        assert.equal(reply.total, null);
        assert.equal(host.writes, 0);
        assert.deepEqual(store(), before);
    });
}

test('retrying a setup failure keeps earlier successful conversation', options, async () => {
    host.respond = async () => ({ text: 'A-answer' });
    await host.maintenance.chat.send(chatRequest('A-question'));
    const createAgent = host.agent;
    host.agent = () => { throw Object.assign(new Error('configuration unavailable'), { code: 'not_configured' }); };
    await host.maintenance.chat.send(chatRequest('B-question'));
    assert.equal(host.maintenance.chat.snapshot().turns.at(-1).status, 'failed');
    host.agent = createAgent;
    await host.maintenance.chat.regenerate(chatRequest());
    assert.ok(host.requests.at(-1).messages.some(message => message.role === 'user' && message.content === 'A-question'));
    assert.ok(host.requests.at(-1).messages.some(message => message.role === 'assistant' && message.content === 'A-answer'));
});

test('clearing during failed setup finishes the clear and preserves newly typed input', options, async () => {
    const setup = deferred(), started = deferred();
    host.agent = async () => { started.resolve(); await setup.promise; throw Object.assign(new Error('configuration unavailable'), { code: 'not_configured' }); };
    const run = host.maintenance.chat.send(chatRequest('检查状态'));
    await started.promise;
    const clearing = host.maintenance.chat.clear(chatRequest());
    host.maintenance.chat.draft(chatRequest('下一条请求'));
    setup.resolve();
    await Promise.all([run, clearing]);
    const state = host.maintenance.chat.snapshot();
    assert.equal(state.turns.length, 0);
    assert.equal(state.busy, false);
    assert.equal(state.draft, '下一条请求');
    assert.equal(host.requests.length, 0);
});

test('disabling automatic work after a save records cancellation without losing the confirmed edit', options, async () => {
    const waiting = deferred();
    host.respond = async request => {
        if (host.requests.length === 1) return { text: '', toolCalls: [{ id: 'edit', name: 'EditMemory', arguments: JSON.stringify({ edits: [
            { kind: 'edit', collection: 'facts', key: 'f-1', patch: { o: '保留已确认的修改' } },
        ] }) }] };
        waiting.resolve();
        return new Promise((resolve, reject) => request.signal.addEventListener('abort', () => reject(request.signal.reason), { once: true }));
    };
    submitted();
    await waiting.promise;
    const finished = waitForStatus('cancelled');
    host.config.memoryMaintenanceEnabled = false;
    host.maintenance.cancelAutomatic();
    await finished;
    assert.equal(store().json.facts[0].o, '保留已确认的修改');
    assert.equal(store().summaryHistory[0].maintenance.at(-1).outcome.status, 'cancelled');
    assert.equal(host.requests.length, 2);
});

for (const kind of ['chat', 'character', 'reload']) {
    test(`switching ${kind} ignores the old provider's late write tools and queues the new question`, options, async t => {
        const started = deferred(), release = deferred();
        t.after(() => release.resolve());
        const previousMetadata = host.metadata, previousFile = host.currentFile;
        const previousMemory = structuredClone(previousMetadata), previousDisk = structuredClone(previousFile.disk);
        host.respond = async () => {
            if (host.requests.length === 1) {
                started.resolve();
                await release.promise; // This provider deliberately ignores the abort signal.
                return { text: '', toolCalls: [{ id: 'late-edit', name: 'EditMemory', arguments: JSON.stringify({ edits: [
                    { kind: 'edit', collection: 'facts', key: 'f-1', patch: { o: '不得执行的旧指令' } },
                ] }) }] };
            }
            return { text: '新聊天回复' };
        };
        const oldRequest = chatRequest('旧聊天问题');
        const oldRun = host.maintenance.chat.send(oldRequest);
        await started.promise;
        switchLoadedChat(kind);
        const newMemory = structuredClone(host.metadata), newDisk = structuredClone(host.currentFile.disk);
        const next = host.maintenance.chat.snapshot();
        assert.notEqual(next.identity, oldRequest.identity);
        assert.deepEqual(next.turns, []);
        assert.equal(host.requests[0].signal.aborted, true);
        const newRun = host.maintenance.chat.send(chatRequest('新聊天问题'));
        await nextTurn();
        assert.equal(host.requests.length, 1);
        assert.equal(host.maintenance.chat.snapshot().turns[0].status, 'queued');
        release.resolve();
        await Promise.all([oldRun, newRun]);
        const state = host.maintenance.chat.snapshot();
        assert.equal(host.requests.length, 2);
        assert.equal(state.turns.length, 1);
        assert.equal(state.turns[0].question, '新聊天问题');
        assert.equal(state.turns[0].answer, '新聊天回复');
        assert.equal(state.turns[0].status, 'completed');
        assert.deepEqual(previousMetadata, previousMemory);
        assert.deepEqual(previousFile.disk, previousDisk);
        assert.deepEqual(host.metadata, newMemory);
        assert.deepEqual(host.currentFile.disk, newDisk);
        assert.equal(host.writes, 0);
    });

    test(`switching ${kind} during the final save keeps the complete old transaction without further work`, options, async t => {
        // The one submitted transaction belongs to its original metadata owner,
        // including all staged edits and its outcome receipt.
        t.mock.method(console, 'warn', () => {});
        const confirming = deferred(), release = deferred();
        t.after(() => release.resolve());
        const previousMetadata = host.metadata, previousFile = host.currentFile;
        const untouchedFact = structuredClone(store().json.facts[1]);
        let finished;
        host.onRunFinished = result => { finished = result; };
        host.beforeReadback = async file => {
            assert.equal(file, previousFile);
            confirming.resolve();
            await release.promise;
        };
        host.respond = async () => host.requests.length > 1 ? { text: '两项修改已暂存。' } : ({ text: '', toolCalls: [
            { id: 'saved-edit', name: 'EditMemory', arguments: JSON.stringify({ edits: [
                { kind: 'edit', collection: 'facts', key: 'f-1', patch: { o: '切换前已保存的修改' } },
            ] }) },
            { id: 'second-edit', name: 'EditMemory', arguments: JSON.stringify({ edits: [
                { kind: 'edit', collection: 'facts', key: 'f-2', patch: { o: '同轮的第二项修改' } },
            ] }) },
        ] });
        const oldRun = host.maintenance.chat.send(chatRequest('修正两项记忆'));
        await confirming.promise;
        assert.equal(mod.getMemoryCommitState(), 'saving');
        assert.equal(host.writes, 1);
        const savedDisk = structuredClone(previousFile.disk);
        assert.equal(savedDisk.extensions.LittleWhiteBox.storySummary.json.facts[0].o, '切换前已保存的修改');
        assert.deepEqual(host.confirmations, [{ ch_name: '角色', file_name: previousFile.chatId, avatar_url: previousFile.avatar }]);
        host.beforeReadback = null;
        switchLoadedChat(kind);
        const nextMemory = structuredClone(host.metadata), nextDisk = structuredClone(host.currentFile.disk);
        assert.notEqual(host.metadata, previousMetadata);
        assert.equal(host.requests[0].signal.aborted, true);
        release.resolve();
        await oldRun;
        assert.equal(host.requests.length, 2);
        assert.equal(host.writes, 1);
        assert.equal(host.confirmations.length, 1);
        assert.equal(finished.saved, 2);
        assert.equal(finished.receipts.length, 1);
        assert.deepEqual(previousFile.disk, savedDisk);
        assert.equal(previousMetadata.extensions.LittleWhiteBox.storySummary.json.facts[0].o, '切换前已保存的修改');
        assert.deepEqual(previousMetadata.extensions.LittleWhiteBox.storySummary.json.facts[1], { ...untouchedFact, o: '同轮的第二项修改' });
        assert.deepEqual(host.metadata, nextMemory);
        assert.deepEqual(host.currentFile.disk, nextDisk);
        assert.equal(mod.getMemoryCommitState(), 'ready');
        assert.deepEqual(host.maintenance.chat.snapshot().turns, []);
        assert.equal(host.maintenance.chat.snapshot().error, '');
        assert.equal(host.maintenance.chat.snapshot().busy, false);
    });
}

test('a late committed-summary notification cannot be reassigned to a same-named new chat', options, async () => {
    const batch = { chatId: host.context.chatId, identity: getChatIdentity(host.context), start: 0, cutoff: store().lastSummarizedMesId };
    host.context.characterId = 21;
    host.maintenance.reset();
    mod.notifySummaryCommitted(batch);
    await nextTurn();
    assert.equal(host.requests.length, 0);
    assert.equal((await host.maintenance.results()).state.status, 'idle');
});

for (const mode of ['auto', 'chat']) test(`${mode} task recovers its timed-out final save in place without another write`, options, async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    t.mock.method(console, 'warn', () => {});
    const confirming = deferred(), release = deferred(), finished = deferred();
    t.after(() => release.resolve());
    host.onRunFinished = finished.resolve;
    host.beforeReadback = async () => { confirming.resolve(); await release.promise; };
    host.respond = async () => {
        const turn = host.requests.length;
        if (turn === 1) return { toolCalls: [{ id: 'edit', name: 'EditMemory', arguments: JSON.stringify({ edits: [
            { kind: 'edit', collection: 'facts', key: 'f-1', patch: { o: '等待核对的修改' } },
        ] }) }] };
        if (turn === 2) return { text: '本轮修改已暂存。' };
        if (turn === 3) {
            assert.equal(host.writes, 1);
            assert.equal(mod.getMemoryCommitState(), 'unconfirmed');
            host.beforeReadback = null;
            return { toolCalls: [{ id: 'check', name: 'RecoverMaintenanceSave', arguments: '{"action":"check"}' }] };
        }
        return { text: '保存已核对。' };
    };
    const manual = mode === 'chat' ? host.maintenance.chat.send(chatRequest('修正记忆')) : null;
    if (mode === 'auto') submitted();
    await confirming.promise;
    t.mock.timers.tick(6000);
    await nextTurn();
    assert.equal(host.requests.length, 2);
    assert.equal(mod.getMemoryCommitState(), 'saving');
    t.mock.timers.tick(54_000);
    const result = await finished.promise;
    await manual;
    assert.equal(result.status, mode === 'auto' ? 'partial' : 'completed');
    assert.equal(result.saved, 1);
    assert.equal(host.writes, 1);
    assert.equal(host.requests.length, 4);
    assert.equal(mod.getMemoryCommitState(), 'ready');
    assert.equal(store().json.facts[0].o, '等待核对的修改');
    assert.equal(store().summaryHistory[0].maintenance.length, 1);
    assert.equal(JSON.parse(result.messages.find(message => message.tool_call_id === 'check').content).state, 'confirmed');
});

test('a later diagnostic question can confirm an earlier pending save without creating a new task draft', options, async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    t.mock.method(console, 'warn', () => {});
    const confirming = deferred(), release = deferred();
    t.after(() => release.resolve());
    host.beforeReadback = async () => { confirming.resolve(); await release.promise; };
    const next = mod.readSummaryMemory(); next.storySummary.json.facts[0].o = '上一轮的修改';
    const saving = mod.commitSummaryMemory(host.context.chatId, next).catch(error => error);
    await confirming.promise;
    t.mock.timers.tick(60_000);
    assert.equal((await saving).code, 'metadata_save_unconfirmed');
    assert.equal(mod.getMemoryCommitState(), 'unconfirmed');
    host.beforeReadback = null;
    host.respond = async () => host.requests.length === 1
        ? { toolCalls: [{ id: 'inspect', name: 'ReadMaintenance', arguments: '{}' }] }
        : { text: '上一轮保存已核对。' };
    await host.maintenance.chat.send(chatRequest('检查上一轮有没有保存'));
    const state = host.maintenance.chat.snapshot();
    assert.equal(state.turns[0].status, 'completed');
    assert.equal(host.writes, 1);
    assert.equal(mod.getMemoryCommitState(), 'ready');
    const result = host.requests[1].messages.find(message => message.tool_call_id === 'inspect');
    assert.equal(JSON.parse(result.content).saveState.state, 'confirmed');
});

for (const alreadySettled of [false, true]) test(`task can retry a known-unsaved result confirmed by another reader (${alreadySettled ? 'settled' : 'concurrent'})`, options, async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    t.mock.method(console, 'warn', () => {});
    const confirming = deferred(), release = deferred();
    t.after(() => release.resolve());
    const saveMetadata = host.context.saveMetadata;
    host.context.saveMetadata = async () => { host.writes++; };
    host.beforeReadback = async () => { confirming.resolve(); await release.promise; };
    let externalCheck;
    host.respond = async () => {
        const turn = host.requests.length;
        if (turn === 1) return { toolCalls: [{ id: 'edit', name: 'EditMemory', arguments: JSON.stringify({ edits: [
            { kind: 'edit', collection: 'facts', key: 'f-1', patch: { o: '安全重试的修改' } },
        ] }) }] };
        if (turn === 2) return { text: '本轮修改已暂存。' };
        if (turn === 3) {
            host.beforeReadback = () => { setImmediate(() => t.mock.timers.tick(10_000)); };
            externalCheck = mod.waitForMemoryCommit().catch(error => error);
            if (alreadySettled) await externalCheck;
            return { toolCalls: [{ id: 'check', name: 'RecoverMaintenanceSave', arguments: '{"action":"check"}' }] };
        }
        if (turn === 4) {
            const checked = host.requests.at(-1).messages.find(message => message.tool_call_id === 'check');
            assert.equal(JSON.parse(checked.content).state, 'not_saved');
            host.beforeReadback = null;
            host.context.saveMetadata = saveMetadata;
            return { toolCalls: [{ id: 'retry', name: 'RecoverMaintenanceSave', arguments: '{"action":"retry"}' }] };
        }
        return { text: '修改已重新保存。' };
    };
    const running = host.maintenance.chat.send(chatRequest('修正记忆'));
    await confirming.promise;
    t.mock.timers.tick(60_000);
    await running;
    assert.equal((await externalCheck).code, 'metadata_not_saved');
    const state = host.maintenance.chat.snapshot();
    assert.equal(state.turns[0].status, 'completed');
    assert.equal(state.turns[0].saved, 1);
    assert.equal(host.writes, 2);
    assert.equal(mod.getMemoryCommitState(), 'ready');
    assert.equal(store().summaryHistory[0].maintenance.length, 1);
});

test('a post-commit phase callback failure retains confirmed saves and never opens retry recovery', options, async () => {
    const finished = deferred();
    host.onRunFinished = finished.resolve;
    const failPhase = () => {
        if (host.maintenance.chat.snapshot().automatic.status === 'indexing') throw new Error('fixture phase listener failure');
    };
    host.listeners.add(failPhase);
    host.respond = async () => host.requests.length === 1
        ? { toolCalls: [{ id: 'edit', name: 'EditMemory', arguments: JSON.stringify({ edits: [
            { kind: 'edit', collection: 'facts', key: 'f-1', patch: { o: '确认后的修改' } },
        ] }) }] } : { text: '本轮处理结果。' };
    submitted();
    const result = await finished.promise;
    host.listeners.delete(failPhase);
    assert.equal(result.saved, 1);
    assert.equal(result.staged, 0);
    assert.equal(result.error.code, 'memory_refresh_failed');
    assert.equal(host.writes, 1);
    assert.equal(host.requests.length, 2);
    assert.equal(mod.getMemoryCommitState(), 'ready');
    assert.equal(store().json.facts[0].o, '确认后的修改');
});

// Acceptance: replacement before submission cancels staged coverage, including
// when import wins the write queue after model completion. Cost: silent lost work.
for (const queued of [false, true]) test(`import cancels completion without reporting success (${queued ? 'queued save' : 'model waiting'})`, options, async t => {
    store().summaryHistory = [mod.createSummaryBatch(-1, 23, { version: 1 })];
    const modelWaiting = deferred(), reply = deferred(), releaseQueue = deferred(), queueHeld = deferred(), finished = deferred();
    t.after(() => { reply.resolve(); releaseQueue.resolve(); });
    host.onRunFinished = finished.resolve;
    host.respond = async () => {
        if (host.requests.length === 1) return { toolCalls: [{ id: 'done', name: 'CompleteMaintenance', arguments: '{"from":1,"to":24}' }] };
        modelWaiting.resolve();
        await reply.promise;
        return { text: 'Review finished.' };
    };
    const api = entry(['changeRecallData', 'importSummaryMemoryPackage'], {
        getContext: () => host.context, memoryMaintenance: host.maintenance,
        cancelEmbeddingWriteTasks: mod.cancelEmbeddingWriteTasks, cancelRecallAndClearPrompt() {},
        extractSummaryImportJson: () => structuredClone(host.fixture.json), getSummaryStore: store,
        readSummaryMemory: mod.readSummaryMemory, prepareImportedSummary: mod.prepareImportedSummary,
        commitSummaryMemory: mod.commitSummaryMemory,
        messageSources: { capture() { return {}; }, resolveRollback() {} },
        updateMeta: async () => {}, clearAllChunks: async () => {}, clearEventVectors: async () => {},
        clearStateVectors: async () => {}, invalidateLexicalIndex() {}, refreshEntityLexiconAndWarmup() {},
        scheduleLexicalWarmup() {}, clearHideState: async () => {}, sendFrameBaseData: async () => {},
        sendFrameFullData() {}, sendAnchorStatsToFrame: async () => {}, sendVectorStatsToFrame: async () => {},
    });
    const running = host.maintenance.chat.send(chatRequest('Review memory'));
    await modelWaiting.promise;
    const descriptor = { chatId: host.context.chatId, scope: mod.VECTOR_WRITE_SCOPES.IO };
    const held = queued ? mod.runVectorWriteTask({ ...descriptor, kind: 'fixture-hold' }, async () => {
        queueHeld.resolve(); await releaseQueue.promise;
    }) : null;
    if (queued) await queueHeld.promise;
    const imported = mod.runVectorWriteTask({ ...descriptor, kind: 'summary-import' }, () =>
        api.changeRecallData(host.context.chatId, () => api.importSummaryMemoryPackage('{}', host.context.chatId)));
    if (queued) {
        const enqueued = deferred();
        const unsubscribe = mod.observeVectorWrites(() => {
            if (mod.getVectorWriteState().pendingWrites === 2) enqueued.resolve();
        });
        t.after(unsubscribe);
        reply.resolve();
        await enqueued.promise;
        releaseQueue.resolve();
    } else {
        await imported;
        reply.resolve();
    }
    await Promise.all([held, imported, running]);
    const result = await finished.promise;
    assert.equal(result.status, 'cancelled');
    assert.equal(result.saved, 0);
    assert.equal(result.staged, 0);
    assert.equal(host.maintenance.chat.snapshot().turns[0].status, 'cancelled');
    assert.equal(host.writes, 1);
    assert.equal(store().summaryHistory.flatMap(batch => batch.maintenance || []).length, 0);
});

// Acceptance: switching cancels unsaved work, never mixes chats or buys another
// model call; a submitted/unknown save keeps its true status. Same-chat appends
// still save normally. Cost: lost work, false success, duplicate paid requests.
for (const version of ['1.14.0', '1.18.0']) for (const mode of ['auto', 'chat']) for (const scenario of [
    { name: 'chat switch before first poll', kind: 'chat' },
    { name: 'character switch behind save lock', kind: 'character', locked: true },
    { name: 'chat switch after submission', kind: 'chat', submitted: true },
    { name: 'same-chat append behind save lock', locked: true },
    { name: 'chat switch with unavailable readback', kind: 'chat', unknown: true },
]) test(`official ${version} ${mode}: ${scenario.name}`, options, async t => {
    t.mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'] });
    const entering = deferred(), written = deferred(), release = deferred(), readback = deferred(), finished = deferred();
    t.after(() => release.resolve());
    const oldFile = host.currentFile, oldDisk = structuredClone(oldFile.disk), writes = [];
    host.onRunFinished = finished.resolve;
    const { context: tavern, errors } = hostSaveEntry(version, {
        read: () => host.context, metadata: () => host.metadata,
        fetch: async (url, request) => {
            assert.equal(url, '/api/chats/save');
            const payload = JSON.parse(request.body);
            const file = host.files.find(item => item.chatId === payload.file_name && item.avatar === payload.avatar_url);
            assert.ok(file);
            writes.push(payload); host.writes++;
            file.disk = structuredClone(payload.chat[0].chat_metadata);
            written.resolve();
            if (scenario.submitted) await release.promise;
            return { ok: true };
        },
    });
    tavern.isChatSaving = Boolean(scenario.locked);
    host.context.saveMetadata = () => {
        const saving = tavern.saveMetadata();
        entering.resolve();
        return saving;
    };
    host.beforeReadback = async file => {
        assert.equal(file, oldFile);
        readback.resolve();
        if (scenario.unknown) throw new Error('fixture readback unavailable');
    };
    host.respond = async () => host.requests.length === 1 ? { toolCalls: [{ id: 'edit-before-switch', name: 'EditMemory', arguments: JSON.stringify({ edits: [
        { kind: 'edit', collection: 'facts', key: 'f-1', patch: { o: 'original-chat-only' } },
    ] }) }] } : { text: 'Review finished.' };
    const manual = mode === 'chat' ? host.maintenance.chat.send(chatRequest('Original question')) : null;
    if (mode === 'auto') submitted();
    await entering.promise;
    assert.equal(host.requests.length, 2);
    assert.equal(writes.length, 0);
    if (scenario.submitted) {
        t.mock.timers.tick(100);
        await written.promise;
    }
    let replacement;
    if (scenario.kind) {
        switchLoadedChat(scenario.kind);
        replacement = structuredClone(host.metadata);
        assert.equal(host.requests[0].signal.aborted, true);
        assert.deepEqual(host.maintenance.chat.snapshot().turns, []);
    } else host.context.chat.push({ role: 'user', mes: 'new floor while save is queued', is_user: true });
    if (scenario.locked) {
        t.mock.timers.tick(100);
        await nextTurn();
        assert.equal(writes.length, 0);
        tavern.isChatSaving = false;
    }
    if (scenario.submitted) release.resolve();
    else t.mock.timers.tick(100);
    await readback.promise;
    await nextTurn();
    if (scenario.kind && !scenario.submitted) t.mock.timers.tick(60_000);
    const result = await finished.promise;
    await manual;
    assert.deepEqual(errors, []);
    assert.equal(writes.length, 1);
    assert.equal(host.requests.length, 2);
    if (scenario.kind && !scenario.submitted) {
        assert.equal(result.error.code, scenario.unknown ? 'metadata_save_unconfirmed' : 'metadata_not_saved');
        assert.equal(result.status, scenario.unknown ? 'unconfirmed' : 'cancelled');
        assert.equal(result.saved, 0);
        assert.deepEqual(result.receipts, []);
        assert.deepEqual(oldFile.disk, oldDisk);
        assert.deepEqual(writes[0].chat[0].chat_metadata, replacement);
        if (!scenario.unknown) assert.equal(result.staged, 0);
    } else {
        assert.equal(result.saved, 1);
        assert.equal(result.staged, 0);
        assert.equal(oldFile.disk.extensions.LittleWhiteBox.storySummary.json.facts[0].o, 'original-chat-only');
        assert.equal(writes[0].file_name, oldFile.chatId);
        assert.equal(writes[0].avatar_url, oldFile.avatar);
        if (!scenario.kind) {
            assert.equal(result.status, mode === 'auto' ? 'partial' : 'completed');
            assert.deepEqual(writes[0].chat.slice(1), host.context.chat);
        }
    }
    if (scenario.kind) {
        assert.deepEqual(host.metadata, replacement);
        assert.deepEqual(host.currentFile.disk, replacement);
        assert.equal(mod.getMemoryCommitState(), 'ready');
        assert.deepEqual(host.maintenance.chat.snapshot().turns, []);
        assert.equal(host.maintenance.chat.snapshot().error, '');
        host.beforeReadback = null;
        host.respond = async request => {
            assert.equal(request.messages.some(message => message.tool_call_id === 'edit-before-switch'), false);
            assert.equal(request.tools.some(tool => tool.function.name === 'RecoverMaintenanceSave'), false);
            return { text: 'New chat answer.' };
        };
        await host.maintenance.chat.send(chatRequest('New question'));
        assert.equal(host.requests.length, 3);
        assert.equal(host.writes, 1);
        assert.equal(host.maintenance.chat.snapshot().turns[0].status, 'completed');
    }
});

test('saved failure diagnostics report the real provider error and do not invent missing source coverage', options, async () => {
    host.respond = async () => { throw Object.assign(new Error('fixture provider refusal'), { status: 401 }); };
    const failed = waitForStatus('failed');
    submitted();
    await failed;
    const diagnostics = readMaintenanceDiagnostics({ store: store(), state: {}, commitState: 'ready', enabled: true });
    assert.equal(diagnostics.runs[0].outcome.code, 'agent_auth');
    const detail = readMaintenanceDiagnostics({ store: store(), state: {}, commitState: 'ready', enabled: true }, { runId: diagnostics.runs[0].id });
    assert.equal(detail.calls[0].error.status, 401);
    assert.equal(detail.run.outcome.error.code, 'agent_auth');
    assert.deepEqual(store().summaryHistory[0].maintenance.at(-1).coverage.supplied, []);
});
