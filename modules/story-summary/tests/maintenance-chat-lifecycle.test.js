/* global Buffer */
import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';
import { entry } from './helpers/story-summary-entry.js';
import { maintenanceFixture } from './fixtures/memory-maintenance.js';
import { createMemoryChatDialog } from '../maintenance/chat-ui.js';
import { MEMORY_CHAT_MESSAGES as routes } from '../maintenance/chat-contract.js';
import { isTrustedMessage, postToIframe } from '../../../core/iframe-messaging.js';

// This boundary test joins the real host/save path, frame entrypoints and chat UI.
// Only the host API, confirmed metadata readback and derived-index storage are
// supplied externally, as in maintenance-scheduler.test.js; no runner is faked.
const root = fileURLToPath(new URL('../../../', import.meta.url));
const host = globalThis.__maintenanceChatLifecycleTest = {};
const shims = {
    'extensions.js': 'export const getContext=()=>globalThis.__maintenanceChatLifecycleTest.context;',
    'script.js': 'export let chat_metadata=globalThis.__maintenanceChatLifecycleTest.metadata; export function reload(){chat_metadata=globalThis.__maintenanceChatLifecycleTest.metadata;} export const getRequestHeaders=()=>({});',
    'modules/story-summary/data/store.js': 'export const getSummaryStore=()=>globalThis.__maintenanceChatLifecycleTest.metadata.extensions.LittleWhiteBox.storySummary;',
    'modules/story-summary/data/config.js': 'export const getSummaryPanelConfig=()=>globalThis.__maintenanceChatLifecycleTest.config;',
    'modules/story-summary/vector/storage/state-store.js': 'export const getStateAtoms=()=>globalThis.__maintenanceChatLifecycleTest.metadata.extensions.LittleWhiteBox.stateAtoms; export const getL0Index=()=>globalThis.__maintenanceChatLifecycleTest.metadata.extensions.LittleWhiteBox.l0Index; export const deleteStateVectorsByIds=async()=>{};',
    'modules/story-summary/vector/storage/chunk-store.js': 'export const deleteEventVectorsByIds=async()=>{};',
    'modules/story-summary/vector/runtime/runtime.js': 'export const clearRecallRuntime=async()=>{};',
    'modules/story-summary/maintenance/indexes.js': 'export const inspectMaintenanceIndexes=async()=>({status:"ready",events:[],atoms:[]}); export const repairMaintenanceIndexes=async()=>({status:"ready"});',
    'modules/story-summary/maintenance/runner.js': 'export {memoryRunId,runMemoryAgent} from "actual-maintenance-runner"; export const createSharedMemoryAgent=()=>globalThis.__maintenanceChatLifecycleTest.agent();',
    'modules/agent-core/settings-repository.js': 'export const loadSharedAgentSettings=async()=>({});',
    'modules/agent-core/browser-entry.js': 'export const setHostChatCompletionsRequestHeadersProvider=()=>{}; export const createAgentAdapter=()=>{};',
};
const bundled = await build({
    stdin: { resolveDir: root, contents: [
        "export * from './modules/story-summary/maintenance/host.js';",
        "export * from './modules/story-summary/data/summary-history.js';",
        "export {reload} from 'script.js';",
    ].join('\n') },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'maintenance-chat-lifecycle-boundaries', setup(api) {
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
after(() => { globalThis.fetch = originalFetch; delete globalThis.__maintenanceChatLifecycleTest; });
const deferred = () => {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
};

function harness(t) {
    const fixture = maintenanceFixture();
    Object.assign(host, { config: { memoryMaintenanceEnabled: false, textFilterRules: [] }, requests: [], writes: 0,
        afterSave: null, respond: async () => ({ text: 'fixture-answer' }),
        metadata: { extensions: { LittleWhiteBox: {
            storySummary: { json: fixture.json, lastSummarizedMesId: fixture.cutoff,
                summaryHistory: [mod.createSummaryBaseline(fixture.cutoff)] },
            stateAtoms: fixture.atoms, l0Index: fixture.l0Index,
        } } },
    });
    host.context = { ...fixture, characterId: 0, characters: [{ avatar: 'fixture.png', chat: fixture.chatId }],
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
    const parent = parseHTML('<html><body></body></html>');
    const mounted = [], pending = [];
    let current = null, bridge;
    const maintenance = mod.createMemoryMaintenanceHost({
        isEnabled: () => true, invalidateRecall() {}, refreshSummary() {}, changed() {},
        chatChanged: payload => bridge?.postToFrame({ type: routes.state, payload }),
    });
    bridge = entry(['handleFrameMessage', 'hideOverlay', 'postToFrame'], {
        memoryMaintenance: maintenance, document: parent.document, window: parent.window,
        isTrustedMessage, postToIframe, frameReady: false, pendingFrameMessages: [], overlayCreated: false,
        stopOverlayViewport: null, removeBackupManagerModal() {}, MESSAGE_EVENT: 'message', handleFrameMessageEvent() {},
        MODULE_ID: 'lifecycle-test', xbLog: { error() {} },
    });
    maintenance.start();
    function dispatch(binding, type, payload = {}) {
        const work = bridge.handleFrameMessage({ origin: 'https://fixture.invalid', source: binding.contentWindow,
            data: { source: 'LittleWhiteBox-StoryFrame', type, ...payload } });
        pending.push(work);
        return work;
    }
    function mount() {
        const overlay = parent.document.createElement('div');
        overlay.id = 'xiaobaix-story-summary-overlay';
        const iframe = parent.document.createElement('iframe');
        iframe.id = 'xiaobaix-story-summary-iframe';
        overlay.append(iframe);
        parent.document.body.append(overlay);
        const { document, window } = parseHTML('<html><body></body></html>');
        window.location = { origin: 'https://fixture.invalid' };
        window.matchMedia = () => ({ matches: false });
        window.innerHeight = 800;
        window.HTMLElement.prototype.getBoundingClientRect = () => ({ top: 0, bottom: 100, height: 100 });
        window.HTMLElement.prototype.showModal = function () { this.open = true; };
        window.HTMLElement.prototype.close = function () { this.open = false; this.dispatchEvent(new window.Event('close')); };
        Object.assign(globalThis, { document, window, ResizeObserver: class { observe() {} disconnect() {} } });
        const binding = { alive: true, iframe, ui: null, document, window };
        binding.contentWindow = { postMessage(message, origin) {
            assert.equal(origin, window.location.origin);
            if (binding.alive && message.type === routes.state) binding.ui.render(message.payload);
        } };
        Object.defineProperty(iframe, 'contentWindow', { value: binding.contentWindow });
        binding.ui = createMemoryChatDialog({ send: (type, payload) => {
            if (binding.alive) dispatch(binding, type, payload);
        } });
        binding.input = document.querySelector('textarea');
        binding.send = text => {
            binding.input.value = text;
            binding.input.dispatchEvent(new window.Event('input'));
            document.querySelector('[data-action="send"]').click();
        };
        binding.dispatch = (type, payload) => dispatch(binding, type, payload);
        bridge.frameReady = true;
        bridge.overlayCreated = true;
        current = binding;
        mounted.push(binding);
        binding.ui.open();
        return binding;
    }
    function closePanel() {
        bridge.hideOverlay();
        current.alive = false;
        assert.equal(parent.document.getElementById('xiaobaix-story-summary-iframe'), null);
        assert.equal(parent.document.getElementById('xiaobaix-story-summary-overlay'), null);
        assert.equal(bridge.frameReady, false);
    }
    t.after(async () => {
        maintenance.stop();
        await Promise.allSettled(pending);
        for (const binding of mounted) { binding.alive = false; binding.ui.dispose(); }
        delete globalThis.document; delete globalThis.window; delete globalThis.ResizeObserver;
    });
    return { maintenance, mount, closePanel, settle: () => Promise.all(pending),
        memory: () => host.metadata.extensions.LittleWhiteBox };
}

for (const closeDuring of ['model request', 'metadata save']) {
    test(`closing the entire frame during ${closeDuring} keeps one host task and restores its saved result on remount`, { timeout: 5000 }, async t => {
        const started = deferred(), release = deferred();
        t.after(() => release.resolve());
        const h = harness(t);
        host.respond = async () => {
            if (host.requests.length !== 1) return { text: 'fixture-saved-answer' };
            if (closeDuring === 'model request') { started.resolve(); await release.promise; }
            return { text: '', toolCalls: [{ id: 'edit', name: 'EditMemory', arguments: JSON.stringify({ edits: [
                { kind: 'edit', collection: 'facts', key: 'f-1', patch: { o: 'fixture-background-edit' } },
            ] }) }] };
        };
        if (closeDuring === 'metadata save') host.afterSave = async () => {
            host.afterSave = null;
            started.resolve();
            await release.promise;
        };
        const first = h.mount();
        first.send('fixture-background-question');
        await started.promise;
        assert.equal(h.maintenance.chat.snapshot().busy, true);
        h.closePanel();
        assert.equal(host.requests[0].signal.aborted, false);
        const requestCount = host.requests.length, writeCount = host.writes;
        const running = h.mount();
        await running.dispatch(routes.query);
        const runningTurn = running.document.querySelector('[data-turn-id]');
        assert.equal(running.document.querySelectorAll('[data-turn-id]').length, 1);
        assert.equal(runningTurn.dataset.status, 'running');
        assert.equal(runningTurn.querySelector('.memory-chat-question p').textContent, 'fixture-background-question');
        assert.equal(host.requests.length, requestCount);
        assert.equal(host.writes, writeCount);
        assert.equal(h.maintenance.chat.snapshot().busy, true);
        h.closePanel();
        assert.equal(host.requests[0].signal.aborted, false);
        release.resolve();
        await h.settle();
        const completed = h.maintenance.chat.snapshot();
        assert.equal(completed.busy, false);
        assert.equal(completed.turns.length, 1);
        assert.equal(completed.turns[0].status, 'completed');
        assert.equal(completed.turns[0].saved, 1);
        assert.equal(h.memory().storySummary.json.facts[0].o, 'fixture-background-edit');
        assert.equal(host.disk.extensions.LittleWhiteBox.storySummary.json.facts[0].o, 'fixture-background-edit');
        const writes = host.writes, requests = host.requests.length;
        const reopened = h.mount();
        await reopened.dispatch(routes.query);
        await h.settle();
        assert.notEqual(reopened.iframe, first.iframe);
        assert.equal(reopened.document.querySelectorAll('[data-turn-id]').length, 1);
        const restored = reopened.document.querySelector('[data-turn-id]');
        assert.equal(restored.dataset.status, 'completed');
        assert.equal(restored.querySelector('.memory-chat-question p').textContent, 'fixture-background-question');
        assert.equal(restored.querySelector('.memory-chat-reply > .memory-chat-answer').textContent, 'fixture-saved-answer');
        assert.equal(restored.querySelectorAll('.memory-chat-tools li[data-status="saved"]').length, 1);
        assert.equal(host.requests.length, 2);
        assert.equal(host.requests.length, requests);
        assert.equal(host.writes, writes);
        assert.equal(h.memory().storySummary.summaryHistory[0].maintenance.length, 2);
    });
}

for (const toolText of ['', ' \n\t']) {
    test(`${toolText ? 'a whitespace' : 'an empty'} tool-only response preserves the earlier reply after failure and reopening`, { timeout: 5000 }, async t => {
        const h = harness(t);
        const explanation = 'fixture-diagnostic-explanation';
        const observed = [];
        host.respond = async request => {
            if (host.requests.length === 3) {
                observed.push(h.maintenance.chat.snapshot().turns[0].answer);
                throw new Error('fixture-network-failure');
            }
            if (host.requests.length === 2) {
                request.onStreamProgress({ text: toolText });
                observed.push(h.maintenance.chat.snapshot().turns[0].answer);
            }
            return { text: host.requests.length === 1 ? explanation : toolText, toolCalls: [
                { id: `diagnostics-${host.requests.length}`, name: 'ReadMaintenance', arguments: '{}' },
            ] };
        };
        const first = h.mount();
        first.send('fixture-diagnostic-question');
        await h.settle();
        const state = h.maintenance.chat.snapshot();
        assert.equal(state.turns[0].status, 'failed');
        assert.equal(state.turns[0].answer, explanation);
        assert.deepEqual(observed, [explanation, explanation]);
        assert.equal(state.turns[0].tools.length, 2);
        assert.equal(first.document.querySelector('.memory-chat-reply > .memory-chat-answer').textContent, explanation);
        h.closePanel();
        const reopened = h.mount();
        await reopened.dispatch(routes.query);
        assert.equal(reopened.document.querySelector('[data-turn-id]').dataset.status, 'failed');
        assert.equal(reopened.document.querySelector('.memory-chat-reply > .memory-chat-answer').textContent, explanation);
        assert.equal(host.requests.length, 3);
        assert.equal(host.writes, 0);
    });
}

test('later visible stream snapshots and the final reply replace earlier text without duplication', { timeout: 5000 }, async t => {
    const h = harness(t);
    const observed = [];
    host.respond = async request => {
        if (host.requests.length === 1) return { text: 'fixture-earlier-explanation', toolCalls: [
            { id: 'diagnostics', name: 'ReadMaintenance', arguments: '{}' },
        ] };
        for (const text of ['', 'fixture-new', 'fixture-new-stream', '']) {
            request.onStreamProgress({ text });
            observed.push(h.maintenance.chat.snapshot().turns[0].answer);
        }
        return { text: 'fixture-final-answer' };
    };
    const frame = h.mount();
    frame.send('fixture-diagnostic-question');
    await h.settle();
    assert.deepEqual(observed, ['fixture-earlier-explanation', 'fixture-new', 'fixture-new-stream', 'fixture-new-stream']);
    const state = h.maintenance.chat.snapshot();
    assert.equal(state.turns[0].status, 'completed');
    assert.equal(state.turns[0].answer, 'fixture-final-answer');
    assert.equal(frame.document.querySelector('.memory-chat-reply > .memory-chat-answer').textContent, 'fixture-final-answer');
    assert.equal(host.requests.length, 2);
    assert.equal(host.writes, 0);
});

for (const bindingChange of ['character switch', 'same-chat reload']) {
    test(`a rejected command after ${bindingChange} cannot attach its error to the new session, while current errors remain visible`, { timeout: 5000 }, async t => {
        const h = harness(t);
        const old = h.mount();
        const oldIdentity = h.maintenance.chat.identity;
        h.closePanel();
        // Runtime ownership includes both the character and the page generation;
        // neither a shared filename nor an unchanged raw identity reowns errors.
        if (bindingChange === 'character switch') {
            host.context.characterId = 1;
            host.context.characters.push({ avatar: 'another-fixture.png', chat: host.context.chatId });
        }
        h.maintenance.reset();
        const reopened = h.mount();
        const nextIdentity = h.maintenance.chat.identity;
        assert.notEqual(nextIdentity, oldIdentity);
        await reopened.dispatch(routes.draft, { identity: oldIdentity, text: 'stale-draft' });
        await reopened.dispatch(routes.send, { identity: oldIdentity, text: 'stale-question' });
        let snapshot = h.maintenance.chat.snapshot();
        assert.equal(snapshot.draft, '');
        assert.equal(snapshot.turns.length, 0);
        assert.equal(Boolean(snapshot.error), false);
        assert.equal(host.requests.length, 0);
        assert.equal(host.writes, 0);
        await reopened.dispatch(routes.query);
        assert.equal(reopened.document.querySelector('.memory-chat-error').hidden, true);
        await reopened.dispatch(routes.draft, { identity: nextIdentity, text: 42 });
        snapshot = h.maintenance.chat.snapshot();
        assert.equal(snapshot.error.code, 'invalid_arguments');
        assert.equal(reopened.document.querySelector('.memory-chat-error').hidden, false);
        assert.equal(old.alive, false);
    });
}
