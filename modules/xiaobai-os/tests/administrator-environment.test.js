import assert from 'node:assert/strict';
import test from 'node:test';
import { createAdministratorEnvironmentReader } from '../apps/administrator/host/environment.js';
import { createAdministratorChatReader } from '../apps/administrator/host/chat-reader.js';
import { createAdministratorToolExecutor } from '../apps/administrator/agent/tool-executor.js';
import { OS_INSPECT } from '../apps/administrator/agent/os-tools.js';
import { TOOLS_LOAD } from '../apps/administrator/agent/tool-loader.js';
import { createAppModuleRegistry } from '../kernel/app-registry.js';
import { createMaintenanceRegistry } from '../capabilities/maintenance/registry.js';
import { createMaintenanceRunner } from '../capabilities/maintenance/runner.js';
import { createManagementRegistry } from '../capabilities/management/index.js';
import { createHostAppCatalog, XIAOBAI_OS_HOST_APP_IDS } from '../host/app-catalog.js';
import { xiaobaiOsApps } from '../shell/app-catalog.js';
import { MANAGEMENT_READ_CHARS } from '../capabilities/management/read-page.js';
import { administratorHarness, settled, COMMON_TOOL_NAMES } from './administrator-harness.js';

const forbidden = () => assert.fail('inspection must not invoke a write, recovery, subscription or model request');
const idle = () => ({ state: 'idle', mode: null, message: '', reason: '', lastRunAt: null });
function fixture() {
    const state = {
        identity: 'inspection-chat', generating: false,
        apps: xiaobaiOsApps.map(app => ({ ...app, privateData: { secret: 'private-app-content' } })),
        statuses: Object.fromEntries(xiaobaiOsApps.map(app => [app.id, { state: 'ready' }])),
        maintenance: ['map', 'tasks', 'world'].map(id => ({ id, automaticEnabled: true, status: idle() })),
        chat: { state: 'ready', hasPendingCommit: false }, user: { state: 'ready', hasPendingCommit: false },
    };
    const files = key => ({ getFileState: () => state[key].state, hasPendingCommit: () => state[key].hasPendingCommit,
        retryPending: forbidden, adoptServerState: forbidden, subscribeFileState: forbidden });
    const sources = {
        captureIdentity: () => state.identity,
        descriptors: () => state.apps, appStatus: id => state.statuses[id],
        maintenance: identity => { assert.equal(identity, state.identity); return state.maintenance; },
        mainChatGenerating: () => state.generating, chatFile: files('chat'), userFile: files('user'),
    };
    const readEnvironment = createAdministratorEnvironmentReader(sources);
    return { state, sources, readEnvironment };
}

async function executorFixture(registry = createManagementRegistry()) {
    const h = fixture(), abort = new AbortController(), operations = [];
    const messages = [{ mes: 'original story', swipe_id: 0 }];
    const reader = createAdministratorChatReader(() => ({ identityKey: h.state.identity, messages, playerName: 'Player', assistantName: 'Narrator' }), () => abort.signal);
    const executor = await createAdministratorToolExecutor({ registry, reader, readEnvironment: h.readEnvironment, operations,
        guard: forbidden, onChange() {}, saveReceipts: forbidden });
    let sequence = 0;
    return { ...h, abort, messages, reader, operations, executor,
        call: (args = {}) => executor.execute(OS_INSPECT, args, String(++sequence), sequence) };
}

test('environment catalog follows the registered APPs and exposes only structured load failures', async () => {
    const h = fixture();
    const registry = createAppModuleRegistry(createHostAppCatalog(h.state.apps.map(descriptor => ({
        descriptor, capabilities: [], async install() {
            if (descriptor.id === 'world') { throw Object.assign(new Error('private URL/key/stack'), { code: 'private-code', retryable: false }); }
            return {};
        },
    }))), { createStore: forbidden, hasCapability: forbidden, requireCapability: forbidden, files: h.sources.chatFile });
    h.sources.descriptors = registry.descriptors; h.sources.appStatus = registry.status;
    const before = h.readEnvironment(h.state.identity);
    assert.ok(before.apps.every(app => app.load.state === 'loading'));
    await registry.installAll();
    const snapshot = h.readEnvironment(h.state.identity);
    assert.deepEqual(snapshot.apps.map(app => app.id), XIAOBAI_OS_HOST_APP_IDS);
    assert.equal(snapshot.apps.length, 13);
    for (const app of snapshot.apps) {
        const descriptor = registry.descriptors().find(item => item.id === app.id);
        assert.deepEqual(Object.keys(app).sort(), ['description', 'id', 'load', 'name']);
        assert.equal(app.name, descriptor.name); assert.equal(app.description, descriptor.description);
        assert.ok(app.description.trim().length > 0);
    }
    assert.deepEqual(snapshot.apps.find(app => app.id === 'world').load, { state: 'failed', phase: 'install', retryable: false });
    assert.deepEqual(snapshot.apps.find(app => app.id === 'wallet').load, { state: 'ready' });
    assert.ok(JSON.stringify(snapshot).length < MANAGEMENT_READ_CHARS);
    assert.ok(snapshot.observedAt >= before.observedAt);
    await registry.dispose();
});

test('maintenance projection keeps switches, ongoing work, outcomes and existing reason categories independent', () => {
    const h = fixture();
    const scenarios = [
        { automaticEnabled: false, status: idle() },
        { automaticEnabled: true, status: { state: 'running', mode: 'automatic', message: '', reason: '', lastRunAt: 11 } },
        { automaticEnabled: true, status: { state: 'idle', mode: 'automatic', message: 'skipped', reason: 'no-work', lastRunAt: null } },
        { automaticEnabled: true, status: { state: 'idle', mode: 'manual', message: 'partial', reason: 'tool-errors-unresolved', lastRunAt: 12 } },
        { automaticEnabled: false, status: { state: 'error', mode: 'automatic', message: 'failed', reason: 'save-unconfirmed', lastRunAt: 12 } },
        { automaticEnabled: true, status: { state: 'error', mode: 'rebuild', message: 'failed', reason: 'provider-auth', lastRunAt: null } },
    ];
    for (const scenario of scenarios) {
        h.state.maintenance = [{ id: 'map', ...scenario }];
        assert.deepEqual(h.readEnvironment(h.state.identity).maintenance, [{ id: 'map', automaticEnabled: scenario.automaticEnabled,
            state: scenario.status.state, mode: scenario.status.mode, outcome: scenario.status.message || null,
            reason: scenario.status.reason || null, lastProcessedAt: scenario.status.lastRunAt }]);
    }
});

test('a new maintenance runner has no observation record, and inspecting it starts no work', () => {
    const h = fixture();
    const registry = createMaintenanceRegistry([{ id: 'map', isEnabled: () => false, createSession: forbidden }]);
    const runner = createMaintenanceRunner({ registry, gateway: { loadConfig: forbidden, openSession: forbidden },
        captureSurface: forbidden, isGenerationActive: forbidden, schedule: forbidden });
    h.sources.maintenance = identity => registry.participants.map(participant => ({ id: participant.id,
        automaticEnabled: participant.isEnabled('automatic'), status: runner.getStatus(participant.id, identity) }));
    assert.deepEqual(h.readEnvironment(h.state.identity).maintenance, [{ id: 'map', automaticEnabled: false, state: 'idle',
        mode: null, outcome: null, reason: null, lastProcessedAt: null }]);
});

test('chat and user storage are sampled independently without attempting recovery', () => {
    const h = fixture();
    for (const state of ['loading', 'saving', 'unconfirmed', 'conflict', 'failed', 'ready']) {
        for (const key of ['chat', 'user']) {
            h.state.chat = { state: 'ready', hasPendingCommit: false };
            h.state.user = { state: 'ready', hasPendingCommit: false };
            h.state[key] = { state, hasPendingCommit: state !== 'ready' };
            h.state.generating = !h.state.generating;
            const snapshot = h.readEnvironment(h.state.identity);
            assert.deepEqual(snapshot.storage, { chat: h.state.chat, user: h.state.user });
            assert.equal(snapshot.mainChatGenerating, h.state.generating);
        }
    }
});

test('inspection is fresh within one run and does not depend on stale story evidence', async () => {
    const h = await executorFixture();
    await h.reader.read({ from: 0 }); h.messages[0].mes = 'edited story';
    assert.equal(h.reader.isCurrent(), false);
    const first = await h.call();
    h.state.user = { state: 'unconfirmed', hasPendingCommit: true }; h.state.generating = true;
    const second = await h.call();
    assert.equal(first.status, 'read'); assert.equal(second.status, 'read');
    assert.equal(first.data.storage.user.state, 'ready');
    assert.deepEqual(second.data.storage.user, h.state.user); assert.equal(second.data.mainChatGenerating, true);
    assert.deepEqual(first.receipt, h.operations[0]); assert.deepEqual(second.receipt, h.operations[1]);
    assert.equal(h.executor.data.environment.data.mainChatGenerating, false);
    assert.equal(h.operations.every(operation => operation.appId === 'administrator' && operation.status === 'read'), true);
});

test('inspection accepts no selectors and terminates on chat switch or cancellation', async () => {
    const h = await executorFixture();
    for (const args of [{ app: 'wallet' }, { chat: 'other' }, { repair: true }, [], null]) {
        assert.equal((await h.call(args)).status, 'failed');
    }
    assert.equal(h.operations.length, 0);
    h.state.identity = 'another-chat';
    await assert.rejects(h.call(), { message: 'administrator_context_changed' });
    const cancelled = await executorFixture(); cancelled.abort.abort();
    await assert.rejects(cancelled.call(), { name: 'AbortError' });
    const during = await executorFixture();
    during.sources.mainChatGenerating = () => { during.state.identity = 'another-chat'; return true; };
    await assert.rejects(during.call(), { message: 'administrator_context_changed' });
});

test('initial record failures preserve the catalog; environment failures remain sanitized and independent', async () => {
    const registry = createManagementRegistry();
    registry.register({ id: 'world', label: 'World', prompt: '', tools: [], async open() { throw Object.assign(new Error('record read failed'), { code: 'storage_read_failed' }); }, confirmPending: forbidden });
    const h = await executorFixture(registry);
    assert.deepEqual(h.executor.data.readErrors.map(error => ({ id: error.id, code: error.code })), [{ id: 'world', code: 'storage_read_failed' }]);
    assert.deepEqual(h.executor.data.apps.map(app => app.id), ['world']);
    assert.deepEqual(h.executor.data.environment.data.apps.find(app => app.id === 'wallet').load, { state: 'ready' });
    h.sources.userFile.getFileState = () => { throw new Error('private-storage-location'); };
    const result = await h.call();
    assert.equal(result.ok, false); assert.equal(result.status, 'failed');
    assert.equal(result.code, 'administrator_environment_unavailable'); assert.equal(result.data, undefined);
    assert.equal(result.receipt.status, 'failed');
    const initial = await createAdministratorToolExecutor({ registry, reader: h.reader, readEnvironment: h.readEnvironment, operations: [],
        guard: forbidden, onChange() {}, saveReceipts: forbidden });
    assert.deepEqual(initial.data.environment, { ok: false, status: 'failed', code: 'administrator_environment_unavailable' });
    assert.equal((await initial.execute('ChatRead', { from: 0 }, 'story-read', 0)).status, 'read');
});

test('real request and idle context meter share reference projection; inspection is saved only as tool history, not frame data', async () => {
    const h = await administratorHarness();
    await h.runtime.prepareContext();
    const before = h.runtime.context();
    const initial = structuredClone(h.state.environment), originalPartitions = structuredClone(h.state.persisted.partitions);
    let round = 0, result;
    h.state.generate = async request => {
        if (++round === 1) {
            assert.deepEqual(JSON.parse(request.messages[0].content.split('\n').slice(1).join('\n')).environment, { ok: true, status: 'read', data: initial });
            assert.deepEqual(request.tools.map(tool => tool.function.name), COMMON_TOOL_NAMES);
            assert.equal(h.runtime.context().rules, before.rules); assert.equal(h.runtime.context().tools, before.tools);
            h.state.environment = { ...initial, observedAt: 2, mainChatGenerating: true, storage: { ...initial.storage, user: { state: 'unconfirmed', hasPendingCommit: true } } };
            return { toolCalls: [{ id: 'inspect-call', name: OS_INSPECT, arguments: '{}' }] };
        }
        result = JSON.parse(request.messages.find(message => message.role === 'tool' && message.toolName === OS_INSPECT).content);
        assert.deepEqual(result.data, h.state.environment);
        return { text: 'Inspection complete.' };
    };
    await h.request('send', { text: 'Inspect OS status.' }); await settled(h.runtime);
    assert.equal(round, 2); assert.equal(h.conversation.read().turns[0].status, 'finished');
    assert.ok(h.state.environmentReads.every(identity => identity === 'admin-test'));
    const history = h.state.persisted.partitions.administrator.turns[0].toolMessages;
    assert.deepEqual(JSON.parse(history.find(message => message.role === 'tool' && message.toolName === OS_INSPECT).content), result);
    for (const write of h.state.writes) {
        const partitions = { ...write.candidate.partitions }; delete partitions.administrator;
        assert.deepEqual(partitions, originalPartitions);
    }
    assert.equal(JSON.stringify(h.pushed).includes(JSON.stringify(h.state.environment)), false);
});

test('OSInspect adds only read authority to the actual management tool surface', async () => {
    const h = await administratorHarness();
    const existingTools = (await Promise.all(h.registry.list().map(participant => participant.open()))).flatMap(session => session.tools);
    const abort = new AbortController();
    const executor = await createAdministratorToolExecutor({ registry: h.registry, reader: createAdministratorChatReader(h.capture, () => abort.signal),
        readEnvironment: h.readEnvironment, operations: [], guard: forbidden, onChange() {}, saveReceipts: forbidden });
    const existingNames = new Set(existingTools.map(tool => tool.definition.function.name));
    await executor.execute(TOOLS_LOAD, { apps: h.registry.list().map(app => app.id) }, 'load', 0);
    assert.deepEqual(executor.getTools().filter(tool => existingNames.has(tool.function.name)), existingTools.map(tool => tool.definition));
    assert.deepEqual(executor.getTools().filter(tool => !existingNames.has(tool.function.name)).map(tool => tool.function.name).sort(), [TOOLS_LOAD, 'ChatRead', 'ChatSearch', OS_INSPECT, 'ToolResultRead'].sort());
    for (const name of ['WalletRead', 'TasksReopen', 'OSRepair']) {
        assert.equal((await executor.execute(name, {}, name, 0)).status, 'failed');
    }
});
