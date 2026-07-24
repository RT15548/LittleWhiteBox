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

async function resetDb() {
    await db.delete();
    await db.open();
}

function createState() {
    return {
        assistantSessionId: '',
        messages: [],
        historySummary: '',
        archivedTurnCount: 0,
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
        mobileWorkspacePane: 'tree',
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
    assert.equal(state.historySummary, 'legacy summary');
    assert.equal(state.messages.length, 1);
    assert.equal(state.messages[0].content, 'hello');
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
