import { currentHistorySummary } from '../app-src/state/compaction-history.js';
import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';

const { createSessionStore } = await import('../app-src/state/session-store.js');
const {
    default: db,
    messagesTable,
    plansTable,
    sessionsTable,
} = await import('../shared/session-db.js');
const { createPlanLedger } = await import('../../agent-core/plan-ledger.js');
const { buildProviderMessagesFromHistory } = await import('../../agent-core/runtime/protocol.js');
const { settleAssistantRunFailure } = await import('../app-src/runtime/run-failure.js');
const { createResponseDelivery } = await import('../plugins/delivery/protocol.js');

// Contract (changed history / lost prompt cache): reopening preserves the actual
// sampled assistant text and its paired tool results, without sampling again.
test('delivery preparation reopens as the same provider messages after a database reconnect', async t => {
    await resetDb();
    const state = createState(), store = createStore(state);
    await store.restoreSession();
    let sample = 0.05;
    t.mock.method(Math, 'random', () => sample);
    const delivery = createResponseDelivery({ enabled: true }, { provider: 'google' });
    state.messages = [{ role: 'user', content: 'First question.' }];
    for (const { name, content } of delivery.createPrelude()) {
        const id = `prelude-${name}`;
        state.messages.push({ role: 'assistant', content, toolCalls: [{ id, name, arguments: '{}' }] },
            { role: 'tool', toolCallId: id, toolName: name, content: JSON.stringify(delivery.execute(name)) });
    }
    const before = buildProviderMessagesFromHistory(state.messages);
    assert.equal((await store.persistSession()).ok, true);
    sample = 0.95;
    db.close(); await db.open();
    const restored = createState();
    await createStore(restored).restoreSession();
    assert.deepEqual(buildProviderMessagesFromHistory(restored.messages), before);
    assert.notEqual(createResponseDelivery({ enabled: true }, { provider: 'google' }).createPrelude()[0].content, restored.messages[1].content);
    assert.deepEqual(buildProviderMessagesFromHistory(restored.messages), before);
});

// Acceptance: reopening must preserve failed/interrupted replies without reclassifying them as successful.
test('session reload preserves failure notices and interrupted prose', async () => {
    await resetDb();
    const state = createState(), store = createStore(state);
    await store.restoreSession();
    state.messages = [{ role: 'user', content: 'question' }, { role: 'assistant', content: 'real answer' }];
    for (let i = 0; i < 2; i++) {
        state.messages.push({ role: 'user', content: `retry ${i}` },
            { role: 'assistant', content: 'partial', streaming: true });
        settleAssistantRunFailure({ messages: state.messages, notice: 'failure',
            pushMessage: message => state.messages.push(message), persistSession() {} });
    }
    await store.persistSession();
    const restored = createState();
    await createStore(restored).restoreSession();
    assert.deepEqual(restored.messages.filter(m => m.role === 'assistant').map(m => [m.content, !!m.error]),
        [['real answer', false], ['partial', true], ['failure', true], ['partial', true], ['failure', true]]);
});

async function resetDb() {
    await db.delete();
    await db.open();
}

function createState() {
    return {
        assistantSessionId: '',
        messages: [],
        compactions: [],
        sidebarCollapsed: true,
        localSources: [],
        isWorkspaceOpen: false,
        workspaceWidth: 520,
        workspacePanelMode: 'workspace',
        selectedSourceId: 'all',
        selectedFilePath: '',
        selectedTreePath: '',
        selectedSkillFilePath: '',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        treeExpandedKeys: [],
        skillTreeExpandedKeys: [],
    };
}

function createStore(state) {
    return createSessionStore({
        state,
        createRequestId: () => 'tool-restored',
        normalizeAttachments: (attachments) => Array.isArray(attachments) ? attachments : [],
        normalizeThoughtBlocks: (thoughts) => Array.isArray(thoughts) ? thoughts : [],
        getActiveContextMessages: () => state.messages,
    });
}

test('session store keeps legacy default session on first restore', async () => {
    await resetDb();
    await sessionsTable.put({
        id: 'default',
        updatedAt: 1,
        historySummary: 'legacy summary',
    });
    await messagesTable.put({
        sessionId: 'default',
        order: 0,
        role: 'user',
        content: 'hello',
        attachments: [],
        thoughts: [],
    });

    const state = createState();
    const store = createStore(state);
    await store.restoreSession();

    assert.equal(state.assistantSessionId, 'default');
    assert.equal(currentHistorySummary(state), 'legacy summary');
    await store.persistSession();
    assert.equal(Object.hasOwn(await sessionsTable.get('default'), 'historySummary'), false);
    assert.equal(state.messages.length, 1);
    assert.equal(state.messages[0].content, 'hello');
});

// Contract: reopening restores each historical disclosure at its own position and only the
// latest successful memory is model context. Clearing the chat deletes both (private history).
test('two compactions and a failed attempt survive reopening without reviving an in-progress operation', async () => {
    await resetDb();
    const state = createState();
    const store = createStore(state);
    await store.restoreSession();
    state.compactions = [{ before: 2000, after: 900, summary: 'first' }, { before: 2100, after: 800, summary: 'second' }, { error: 'offline' }];
    state.compactionPending = true;
    state.messages = [{ role: 'user', content: 'start' }, { role: 'assistant', content: 'middle', compactionEpoch: 1 },
        { role: 'user', content: 'continue', compactionEpoch: 2 }];
    await store.persistSession();
    const restored = createState();
    const next = createStore(restored);
    await next.restoreSession();
    assert.deepEqual(restored.compactions, state.compactions);
    assert.deepEqual(restored.messages.map(m => m.compactionEpoch || 0), [0, 1, 2]);
    assert.equal(currentHistorySummary(restored), 'second');
    assert.equal(restored.compactionPending, false);
    await next.clearSession();
    await next.restoreSession();
    assert.equal(currentHistorySummary(restored), '');
    assert.deepEqual(restored.compactions, []);
});

test('session store always restores API settings as collapsed', async () => {
    await resetDb();
    await sessionsTable.put({
        id: 'default',
        updatedAt: 1,
        historySummary: 'legacy summary',
        sidebarCollapsed: false,
    });

    const state = createState();
    const store = createStore(state);
    await store.restoreSession();

    assert.equal(state.sidebarCollapsed, true);
});

test('session store keeps the explicit empty Google provider tool id across reload', async () => {
    await resetDb();
    const state = createState();
    const store = createStore(state);
    await store.restoreSession();
    state.messages = [{
        role: 'assistant',
        content: '',
        toolCalls: [{
            id: 'google-tool-1-1',
            name: 'Read',
            arguments: '{"path":"memory/state.md"}',
            providerId: '',
        }],
    }];
    await store.persistSession();

    const restoredState = createState();
    const restoredStore = createStore(restoredState);
    await restoredStore.restoreSession();
    const restoredToolCall = restoredState.messages[0]?.toolCalls?.[0];
    assert.equal(restoredToolCall?.providerId, '');
    assert.equal(Object.prototype.hasOwnProperty.call(restoredToolCall || {}, 'providerId'), true);
});

test('clearSession rotates assistantSessionId and clears old plans', async () => {
    await resetDb();
    const state = createState();
    const store = createStore(state);
    const ledger = createPlanLedger({
        createId: () => 'plan-old',
        now: () => 100,
        plansTable,
    });

    await store.restoreSession();
    const oldSessionId = state.assistantSessionId;
    state.messages = [{ role: 'user', content: 'keep until clear' }];
    await store.persistSession();
    await ledger.createPlan(oldSessionId, { title: 'old plan' });

    const result = await store.clearSession();
    assert.equal(result.ok, true);
    assert.notEqual(state.assistantSessionId, oldSessionId);
    assert.equal(await messagesTable.where('sessionId').equals(oldSessionId).count(), 0);

    const oldPlans = await ledger.listPlans(oldSessionId);
    assert.equal(oldPlans.count, 0);
});

test('session store keeps explicit Google provider ids through restore and replay', async () => {
    await resetDb();
    const state = createState();
    const store = createStore(state);
    await store.restoreSession();

    state.messages = [
        { role: 'user', content: '读取两个文件。' },
        {
            role: 'assistant',
            content: '',
            toolCalls: [
                {
                    id: 'google-tool-1-1',
                    name: 'Read',
                    arguments: '{"path":"a.md"}',
                    providerId: '',
                },
                {
                    id: 'legacy-local-id',
                    name: 'Read',
                    arguments: '{"path":"legacy.md"}',
                },
            ],
        },
        { role: 'tool', toolCallId: 'google-tool-1-1', toolName: 'Read', content: '{"ok":true}' },
    ];
    await store.persistSession();

    const stored = await messagesTable.where('sessionId').equals(state.assistantSessionId).toArray();
    const storedCalls = stored[1]?.toolCalls || [];
    assert.equal(Object.prototype.hasOwnProperty.call(storedCalls[0], 'providerId'), true);
    assert.equal(storedCalls[0]?.providerId, '');
    assert.equal(Object.prototype.hasOwnProperty.call(storedCalls[1], 'providerId'), false);

    state.messages = [];
    await store.restoreSession();
    const replay = buildProviderMessagesFromHistory(state.messages);
    const replayCalls = replay[1]?.tool_calls || [];

    assert.equal(Object.prototype.hasOwnProperty.call(replayCalls[0], 'providerToolCallId'), true);
    assert.equal(replayCalls[0]?.providerToolCallId, '');
    assert.equal(Object.prototype.hasOwnProperty.call(replayCalls[1], 'providerToolCallId'), false);
});
