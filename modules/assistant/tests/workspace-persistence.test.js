import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import Dexie from '../../../libs/dexie.mjs';
import db, { sessionsTable, messagesTable, metaTable, plansTable, workspaceTable } from '../shared/session-db.js';
import { createSessionStore } from '../app-src/state/session-store.js';
import { createWorkspaceStore } from '../app-src/workspace/workspace-store.js';
import { normalizeWorkspaceState, WORKSPACE_RECORD_ID } from '../shared/workspace-state.js';
import { createLocalSourcesManager } from '../app-src/workspace/local-sources.js';
import { removeLocalSourcePath } from '../shared/local-workspace-kernel.js';
import { workspaceRepository } from '../shared/workspace-repository.js';

// Acceptance contracts (all failures can lose user-created work):
// - Upgrade moves the current stored files, originals and empty directories intact, or rolls back.
// - Clearing a conversation cannot delete/overwrite the workspace, including after a reload.
// - Failed clear keeps messages, plans and the session pointer together; no false success.
// - User-initiated workspace deletion persists and never resurrects an old session copy.
// - Failed reads/writes do not replace the last saved workspace with empty data.

// Captured using the pre-split v2 createSessionStore.persistSession(), with
// synthetic authored files; only session ID/timestamps were made deterministic.
// v1 and v2 used this same workspace payload; v2 adds the current-session pointer.
const fixture = JSON.parse(await readFile(new URL('./fixtures/session-workspace-v2.json', import.meta.url), 'utf8'));

function stores(state = { messages: [], historySummary: '', assistantSessionId: '', localSources: [] }) {
    return { state, chat: createSessionStore({
        state, createRequestId: () => 'restored-tool',
        normalizeAttachments: value => value || [], normalizeThoughtBlocks: value => value || [],
        getActiveContextMessages: () => state.messages,
    }), workspace: createWorkspaceStore({ state }) };
}

async function reload() {
    await db.open();
    const next = stores();
    await Promise.all([next.chat.restoreSession(), next.workspace.restoreWorkspace()]);
    return next;
}

async function seedOld(version) {
    await db.delete();
    const old = new Dexie(db.name);
    old.version(1).stores({ sessions: 'id, updatedAt', messages: '[sessionId+order], sessionId' });
    if (version === 2) old.version(2).stores({
        sessions: 'id, updatedAt', messages: '[sessionId+order], sessionId', meta: 'key',
        plans: '[sessionId+id], sessionId, status, owner, priority, updatedAt, completedAt',
    });
    const sessionId = version === 1 ? 'default' : 'asst-session-current';
    await old.table('sessions').put({ ...structuredClone(fixture), id: sessionId });
    await old.table('messages').put({ sessionId, order: 0, role: 'user', content: 'Keep the story' });
    if (version === 2) {
        await old.table('meta').put({ key: 'currentSessionId', value: sessionId });
        await old.table('plans').put({ sessionId, id: 'plan', title: 'old plan' });
        await old.table('sessions').put({ id: 'default', localSources: [] });
    }
    old.close();
    return sessionId;
}

for (const version of [1, 2]) {
    test(`v${version} upgrade retains authored work through clear and cold reopen`, async () => {
        const oldId = await seedOld(version);
        await db.open();
        assert.deepEqual((await workspaceTable.get(WORKSPACE_RECORD_ID)).localSources, fixture.localSources);
        assert.equal(Object.hasOwn(await sessionsTable.get(oldId), 'localSources'), false);
        const { state, chat } = await reload();
        assert.deepEqual(state.localSources, fixture.localSources);
        assert.equal(state.messages[0].content, 'Keep the story');
        assert.equal(state.selectedFilePath, fixture.selectedFilePath);
        const before = await workspaceTable.toArray();
        assert.equal((await chat.clearSession()).ok, true);
        assert.deepEqual(state.localSources, fixture.localSources);
        assert.deepEqual(await workspaceTable.toArray(), before);
        assert.deepEqual(state.messages, []);
        assert.equal(await plansTable.where('sessionId').equals(oldId).count(), 0);
        db.close();
        await db.open();
        const restored = await reload();
        assert.deepEqual(restored.state.localSources, fixture.localSources);
        assert.deepEqual(restored.state.messages, []);
        assert.equal(restored.state.historySummary, '');
        assert.notEqual(restored.state.assistantSessionId, oldId);
        restored.state.messages = [{ role: 'user', content: 'Continue editing' }];
        await restored.chat.persistSession();
        assert.equal(Object.hasOwn(await sessionsTable.get(restored.state.assistantSessionId), 'localSources'), false);
        assert.deepEqual(await workspaceTable.toArray(), before);
    });
}

test('failed workspace migration rolls back the original session and retries intact', async () => {
    const id = await seedOld(2);
    const fail = () => { throw new Error('injected upgrade failure'); };
    workspaceTable.hook('creating', fail);
    try { await assert.rejects(db.open(), /injected upgrade failure/); }
    finally { workspaceTable.hook('creating').unsubscribe(fail); db.close(); }
    const old = new Dexie(db.name);
    await old.open();
    assert.equal(old.verno, 2);
    assert.deepEqual((await old.table('sessions').get(id)).localSources, fixture.localSources);
    old.close();
    await db.open();
    assert.deepEqual((await reload()).state.localSources, fixture.localSources);
});

test('failed conversation clear rolls back messages, plans and pointer, without touching files', async t => {
    const id = await seedOld(2);
    const { state, chat } = await reload();
    const before = structuredClone(state), workspaceBefore = await workspaceTable.toArray();
    t.mock.method(console, 'error', () => {});
    const failedPut = t.mock.method(metaTable, 'put', async () => { throw new Error('injected pointer failure'); });
    assert.equal((await chat.clearSession()).ok, false);
    assert.deepEqual(state, before);
    assert.equal(await messagesTable.where('sessionId').equals(id).count(), 1);
    assert.equal(await plansTable.where('sessionId').equals(id).count(), 1);
    assert.equal((await metaTable.get('currentSessionId')).value, id);
    assert.deepEqual(await workspaceTable.toArray(), workspaceBefore);
    failedPut.mock.restore();
    assert.equal((await chat.clearSession()).ok, true);
});

test('workspace writes queued around conversation clear remain independent and ordered', async () => {
    await db.delete(); await db.open();
    const { state, chat, workspace } = await reload();
    Object.assign(state, normalizeWorkspaceState(fixture));
    await workspaceTable.put({ ...normalizeWorkspaceState(fixture), id: WORKSPACE_RECORD_ID });
    state.messages = [{ role: 'user', content: 'old conversation' }];
    await chat.persistSession();
    const first = workspace.persistWorkspaceUiState();
    const clear = chat.clearSession();
    state.localSources[0].files[0].content = 'Unsaved stale snapshot must not be written';
    state.workspaceWidth = 600;
    const latest = workspace.persistWorkspaceUiState();
    for (const result of await Promise.all([first, clear, latest])) assert.equal(result.ok, true);
    const fresh = await reload();
    assert.equal(fresh.state.localSources[0].files[0].content, fixture.localSources[0].files[0].content);
    assert.equal(fresh.state.workspaceWidth, 600);
    assert.deepEqual(fresh.state.messages, []);
});

test('explicit file and workspace deletion persist without reviving migrated content', async t => {
    await seedOld(2);
    const { state, workspace, chat } = await reload();
    t.mock.method(console, 'info', () => {});
    const previousWindow = globalThis.window;
    globalThis.window = { confirm: () => true, setTimeout };
    t.after(() => { globalThis.window = previousWindow; });
    const manager = createLocalSourcesManager({
        state, createRequestId: () => 'delete', persistWorkspaceUiState: workspace.persistWorkspaceUiState,
        callHostTool: async (_name, { path }) => {
            const next = path === 'local/' ? [] : removeLocalSourcePath(state.localSources, path).nextSources;
            await workspaceTable.update(WORKSPACE_RECORD_ID, { localSources: next });
            await manager.applyExternalLocalSources(next);
            return { ok: true };
        },
    });
    await manager.deleteLocalPath('local/story/new.md');
    assert.equal((await reload()).state.localSources[0].files.length, 1);
    await manager.clearLocalSources();
    assert.equal((await chat.clearSession()).ok, true);
    db.close(); await db.open();
    assert.deepEqual((await reload()).state.localSources, []);
});

test('workspace read/write failures do not silently replace saved work', async t => {
    await seedOld(2);
    const { state, workspace } = await reload();
    const before = await workspaceTable.toArray();
    const failedPut = t.mock.method(workspaceRepository, 'saveWorkspaceUiState', async () => { throw new Error('injected storage failure'); });
    state.localSources = [];
    assert.equal((await workspace.persistWorkspaceUiState()).ok, false);
    assert.equal((await workspace.flushWorkspace()).ok, false);
    assert.deepEqual(await workspaceTable.toArray(), before);
    failedPut.mock.restore();
    assert.equal((await workspace.persistWorkspaceUiState()).ok, true);
    assert.deepEqual((await reload()).state.localSources, fixture.localSources);
    t.mock.method(workspaceRepository, 'readWorkspace', async () => { throw new Error('injected read failure'); });
    const pending = stores({ localSources: structuredClone(fixture.localSources) });
    await assert.rejects(pending.workspace.restoreWorkspace(), /injected read failure/);
    assert.deepEqual(pending.state.localSources, fixture.localSources);
});
