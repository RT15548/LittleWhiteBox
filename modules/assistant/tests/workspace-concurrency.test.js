import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import Dexie from '../../../libs/dexie.mjs';
import { unzipSync, strFromU8 } from '../../../libs/fflate.mjs';
import { createWorkspaceRepository } from '../shared/workspace-repository.js';
import { buildWorkspacePreconditions, captureWorkspacePath } from '../shared/workspace-preconditions.js';
import { normalizeLocalSources, upsertLocalSourceFile, findLocalFileByPath } from '../shared/local-workspace-kernel.js';
import { createWorkspaceStore } from '../app-src/workspace/workspace-store.js';
import { createLocalSourcesToolRuntime } from '../shared/local-sources-tool-runtime.js';
import { createLocalSourcesManager } from '../app-src/workspace/local-sources.js';
import { createHostToolRequestController } from '../app-src/runtime/host-tool-requests.js';
import { closeAssistantWorkspace } from '../app-src/workspace/workspace-lifecycle.js';
import { loadWorkspaceHostTools } from './helpers/workspace-host.js';

// Acceptance contracts: UI writes cannot lose authored work; disjoint edits
// commute; overlapping edits/trees fail atomically; failed/conflicting saves
// preserve drafts; only committed/read paths advance the model's evidence.
// A failed/late save must not freeze unrelated work; canceling a model wait
// must not discard the user's save or dispatch a canceled write later.
// Conflict recovery must not send unrelated documents to the model (privacy /
// token cost); own pending/ack-lost writes must not create false conflicts;
// close must drain host writes, and a transient UI failure must be retryable.
// Repeated failed/lost receipts must retain the uncertain write and latest draft
// without false conflicts or changing originals (lost work / blocked saving).
// Every download must contain visible drafts, including deleted-file drafts,
// without saving/discarding them (an apparently successful backup could lose work).
const executeToolCall = await loadWorkspaceHostTools();
const fileA = 'local/story/a.md', fileB = 'local/story/b.md';
const initial = upsertLocalSourceFile(upsertLocalSourceFile([], fileA, 'A0').nextSources, fileB, 'B0').nextSources;
const content = (sources, path = fileA) => findLocalFileByPath(sources, path)?.file.content;

async function setup(t) {
    t.mock.method(console, 'info', () => {});
    const name = `workspace-contract-${crypto.randomUUID()}`;
    const a = new Dexie(name), b = new Dexie(name);
    for (const database of [a, b]) database.version(1).stores({ workspace: 'id' });
    await a.open(); await b.open();
    await a.table('workspace').put({ id: 'main', localSources: initial });
    t.after(async () => { b.close(); await a.delete(); });
    return { a, b, ra: createWorkspaceRepository(a), rb: createWorkspaceRepository(b) };
}

async function commit(repository, name, args, base = initial) {
    return repository.commitWorkspaceMutation({ name, args, preconditions: buildWorkspacePreconditions(name, args, base),
        execute: async localSources => {
            let nextSources = null;
            const result = await executeToolCall(name, args, { localSources, onLocalSourcesUpdated: sources => { nextSources = sources; } });
            return { result, nextSources };
        },
    });
}

test('old-window UI saves cannot overwrite new content; two connections retain disjoint edits', async t => {
    const { ra, rb } = await setup(t);
    const oldState = await rb.readWorkspace();
    const ui = createWorkspaceStore({ state: oldState, repository: rb });
    assert.equal((await commit(ra, 'Write', { path: fileA, content: 'A1' })).committed, true);
    oldState.viewerMode = 'original'; oldState.workspaceWidth = 600;
    assert.equal((await ui.persistWorkspaceUiState()).ok, true);
    assert.equal(content((await ra.readWorkspace()).localSources), 'A1');
    assert.equal((await commit(rb, 'Write', { path: fileB, content: 'B1' })).committed, true);
    const saved = await ra.readWorkspace();
    assert.equal(content(saved.localSources), 'A1'); assert.equal(content(saved.localSources, fileB), 'B1');
    assert.equal(saved.workspaceWidth, 600);
});

test('simultaneous writes to one path have exactly one winner', async t => {
    const { ra, rb } = await setup(t);
    const results = await Promise.all([commit(ra, 'Write', { path: fileA, content: 'left' }), commit(rb, 'Write', { path: fileA, content: 'right' })]);
    assert.equal(results.filter(result => result.committed).length, 1);
    const conflict = results.find(result => !result.committed);
    assert.equal(conflict.result.error, 'workspace_conflict');
    assert.ok(conflict.result.conflictPaths.includes(fileA));
});

test('creating different files beneath the same new parent does not conflict', async t => {
    const { ra, rb } = await setup(t);
    for (const [repo, path] of [[ra, 'local/new/x.md'], [rb, 'local/new/y.md']]) {
        assert.equal((await commit(repo, 'Write', { path, content: path })).committed, true);
    }
    const saved = (await ra.readWorkspace()).localSources;
    assert.equal(content(saved, 'local/new/x.md'), 'local/new/x.md');
    assert.equal(content(saved, 'local/new/y.md'), 'local/new/y.md');
});

test('directory delete/move/clear cannot erase a newly created child; file moves protect destination', async t => {
    const { ra, rb } = await setup(t);
    await commit(ra, 'Write', { path: 'local/story/new.md', content: 'new' });
    for (const [name, args] of [['Delete', { path: 'local/story/' }], ['Move', { fromPath: 'local/story/', toPath: 'local/archive/' }], ['Delete', { path: 'local/' }]]) {
        assert.equal((await commit(rb, name, args)).result.error, 'workspace_conflict');
    }
    await commit(ra, 'Write', { path: 'local/target.md', content: 'destination' }, (await ra.readWorkspace()).localSources);
    assert.equal((await commit(rb, 'Move', { fromPath: fileA, toPath: 'local/target.md', overwrite: true })).result.error, 'workspace_conflict');
    assert.equal(content((await ra.readWorkspace()).localSources, 'local/story/new.md'), 'new');
});

test('batch and patch conflicts or storage failures never partially commit', async t => {
    const { a, ra, rb } = await setup(t);
    await commit(ra, 'Write', { path: fileB, content: 'B1' });
    const batch = await commit(rb, 'BatchWriteFiles', { files: [{ path: fileA, content: 'changed' }, { path: fileB, content: 'changed' }] });
    assert.equal(batch.result.error, 'workspace_conflict');
    const patch = await commit(rb, 'apply_patch', { patchText: `*** Begin Patch\n*** Update File: ${fileA}\n@@\n-A0\n+A2\n*** Update File: ${fileB}\n@@\n-B0\n+B2\n*** End Patch` });
    assert.equal(patch.result.error, 'workspace_conflict');
    const before = await ra.readWorkspace();
    const failed = t.mock.method(a.table('workspace'), 'put', async () => { throw new Error('disk full'); });
    await assert.rejects(commit(ra, 'BatchWriteFiles', { files: [{ path: fileA, content: 'lost?' }, { path: fileB, content: 'lost?' }] }, before.localSources), /disk full/);
    failed.mock.restore();
    assert.deepEqual(await ra.readWorkspace(), before);
    const controller = new AbortController(); controller.abort();
    await assert.rejects(ra.commitWorkspaceMutation({ name: 'Write', args: { path: fileA }, preconditions: [], signal: controller.signal }), /tool_aborted/);
});

function editorWindow(t, repository, sources = initial, { beforeReceipt, timeout = 1000 } = {}) {
    const previous = globalThis.window;
    globalThis.window = { setTimeout, confirm: () => true };
    t.after(() => { globalThis.window = previous; });
    const state = { localSources: normalizeLocalSources(sources), workspaceDrafts: {}, runtime: {}, isWorkspaceOpen: true, selectedFilePath: fileA, viewerMode: 'current' };
    let cache = state.localSources;
    const runtime = createLocalSourcesToolRuntime({ repository, getLocalSources: () => cache, setLocalSources: value => { cache = value; }, normalizeLocalSourcesSnapshot: normalizeLocalSources, executeToolCall });
    const pending = new Map();
    const active = new Map();
    const controller = createHostToolRequestController({ state, pendingToolCalls: pending, createRequestId: () => crypto.randomUUID(), REQUEST_TIMEOUT_MS: timeout,
        flushBeforeToolCall: options => manager.flushPendingWorkspaceChanges(options),
        post: (type, payload) => {
            if (type === 'xb-assistant:tool-abort') { active.get(payload.requestId)?.abort(); return; }
            if (type !== 'xb-assistant:tool-call') return;
            let observations = [];
            let conflictSnapshot;
            const abort = new AbortController();
            active.set(payload.requestId, abort);
            void runtime.execute(payload.name, payload.arguments, { workspaceMeta: payload.workspaceMeta,
                signal: abort.signal,
                onWorkspaceObserved: value => { observations = value; },
                onWorkspaceConflict: value => { conflictSnapshot = value; },
                onLocalSourcesUpdated: value => { void manager.applyExternalLocalSources(value); },
            }).then(async result => {
                if (await beforeReceipt?.(payload, result) === false) return;
                pending.get(payload.requestId)?.resolve(result, observations, conflictSnapshot);
            }, error => pending.get(payload.requestId)?.reject(error)).finally(() => active.delete(payload.requestId));
        },
    });
    const manager = createLocalSourcesManager({ state, createRequestId: () => crypto.randomUUID(), persistWorkspaceUiState: async () => ({ ok: true }), callHostTool: controller.callHostTool });
    return { state, manager, controller, runtime, pending };
}

test('editor conflict retains latest typing across navigation and repeats conflict after a third edit', async t => {
    const { ra, rb } = await setup(t);
    const { state, manager } = editorWindow(t, rb);
    await commit(ra, 'Write', { path: fileA, content: 'other window' });
    manager.updateLocalFileContent(fileA, 'my draft');
    assert.equal(await manager.flushPendingWorkspaceChanges(), false);
    assert.equal(state.workspaceDrafts[fileA].status, 'conflict');
    manager.updateLocalFileContent(fileA, 'my latest draft');
    manager.selectWorkspaceFile(fileB); manager.selectWorkspaceFile(fileA);
    assert.equal(state.workspaceDrafts[fileA].content, 'my latest draft');
    assert.equal(await manager.flushPendingWorkspaceChanges(), false);
    await commit(ra, 'Write', { path: fileA, content: 'third version' }, (await ra.readWorkspace()).localSources);
    assert.equal(await manager.resolveEditorConflict(fileA, 'mine'), false);
    assert.equal(content((await ra.readWorkspace()).localSources), 'third version');
    assert.equal(await manager.resolveEditorConflict(fileA, 'mine'), true);
    assert.equal(content((await ra.readWorkspace()).localSources), 'my latest draft');
    assert.equal(await manager.flushPendingWorkspaceChanges(), true);
});

test('remote deletion keeps an accessible draft until explicit discard', async t => {
    const { ra, rb } = await setup(t);
    const { state, manager } = editorWindow(t, rb);
    await commit(ra, 'Delete', { path: fileA });
    manager.updateLocalFileContent(fileA, 'still here');
    assert.equal(await manager.flushPendingWorkspaceChanges(), false);
    assert.equal(manager.selectWorkspaceFile(fileA), true);
    manager.ensureWorkspaceSelection();
    assert.equal(state.selectedFilePath, fileA);
    assert.equal(state.mobileWorkspacePane, 'viewer');
    assert.equal(state.workspaceDrafts[fileA].content, 'still here');
    assert.equal(content((await ra.readWorkspace()).localSources), undefined);
    await manager.resolveEditorConflict(fileA, 'saved');
    assert.equal(state.workspaceDrafts[fileA], undefined);
    assert.equal(content((await ra.readWorkspace()).localSources), undefined);
});

test('failed editor save is not success; explicit retry saves the latest draft', async t => {
    const { b, rb } = await setup(t);
    const { state, manager } = editorWindow(t, rb);
    const failed = t.mock.method(b.table('workspace'), 'put', async () => { throw new Error('disk full'); });
    manager.updateLocalFileContent(fileA, 'draft1');
    assert.equal(await manager.flushPendingWorkspaceChanges(), false);
    assert.equal(state.workspaceDrafts[fileA].status, 'error');
    manager.updateLocalFileContent(fileA, 'draft2');
    failed.mock.restore();
    assert.equal(await manager.resolveEditorConflict(fileA, 'retry'), true);
    assert.equal(content((await rb.readWorkspace()).localSources), 'draft2');
});

test('model evidence advances only on its observed paths, not unrelated UI refreshes', async t => {
    const { ra, rb } = await setup(t);
    const { state, controller } = editorWindow(t, rb);
    state.activeRun = { id: 'run', toolRequestIds: new Set(), workspaceBaseline: normalizeLocalSources(initial) };
    await commit(ra, 'Write', { path: fileA, content: 'A1' });
    state.localSources = (await ra.readWorkspace()).localSources;
    assert.equal((await controller.callHostTool('Write', { path: fileA, content: 'unsafe' }, { runId: 'run' })).error, 'workspace_conflict');
    assert.equal((await controller.callHostTool('Write', { path: fileB, content: 'B1' }, { runId: 'run' })).ok, true);
    assert.equal(content(state.activeRun.workspaceBaseline), 'A0');
    assert.equal(content(state.activeRun.workspaceBaseline, fileB), 'B1');
    assert.deepEqual(captureWorkspacePath(state.activeRun.workspaceBaseline, fileB), captureWorkspacePath((await rb.readWorkspace()).localSources, fileB));
    const read = await controller.callHostTool('Read', { filePath: fileA, scope: 'local' }, { runId: 'run' });
    assert.notEqual(read.ok, false);
    assert.equal(content(state.activeRun.workspaceBaseline), 'A1');
    assert.equal((await controller.callHostTool('Write', { path: fileA, content: 'observed update' }, { runId: 'run' })).ok, true);
    await controller.callHostTool('Write', { path: fileA, content: 'UI update' });
    assert.equal(content(state.activeRun.workspaceBaseline), 'observed update');
});

test('typing while a save is in flight drains the latest draft before close can proceed', async t => {
    const { rb } = await setup(t);
    let entered, release;
    const started = new Promise(resolve => { entered = resolve; });
    const blocked = new Promise(resolve => { release = resolve; });
    const originalCommit = rb.commitWorkspaceMutation;
    let first = true;
    t.mock.method(rb, 'commitWorkspaceMutation', async operation => {
        if (first) { first = false; entered(); await blocked; }
        return originalCommit(operation);
    });
    const { state, manager } = editorWindow(t, rb);
    manager.updateLocalFileContent(fileA, 'first draft');
    const flushed = manager.flushPendingWorkspaceChanges();
    await started;
    manager.updateLocalFileContent(fileA, 'latest draft');
    assert.equal(manager.hasPendingWorkspaceChanges(), true);
    release();
    assert.equal(await flushed, true);
    assert.equal(content((await rb.readWorkspace()).localSources), 'latest draft');
    assert.equal(state.workspaceDrafts[fileA], undefined);
});

test('a remotely deleted file is recreated only after explicit user choice', async t => {
    const { ra, rb } = await setup(t);
    const { state, manager } = editorWindow(t, rb);
    await commit(ra, 'Delete', { path: fileA });
    manager.updateLocalFileContent(fileA, 'recreated draft');
    assert.equal(await manager.flushPendingWorkspaceChanges(), false);
    assert.equal(content((await ra.readWorkspace()).localSources), undefined);
    assert.equal(state.workspaceDrafts[fileA].content, 'recreated draft');
    assert.equal(await manager.resolveEditorConflict(fileA, 'mine'), true);
    assert.equal(content((await ra.readWorkspace()).localSources), 'recreated draft');
});

test('successful batch and patch apply against latest storage without losing unrelated files', async t => {
    const { ra, rb } = await setup(t);
    await commit(ra, 'Write', { path: 'local/unrelated.md', content: 'keep' });
    const batch = await commit(rb, 'BatchWriteFiles', { files: [{ path: fileA, content: 'A2' }, { path: fileB, content: 'B2' }] });
    assert.equal(batch.committed, true);
    const patch = await commit(rb, 'apply_patch', { patchText: `*** Begin Patch\n*** Update File: ${fileA}\n@@\n-A2\n+A3\n*** Update File: ${fileB}\n@@\n-B2\n+B3\n*** End Patch` }, batch.localSources);
    assert.equal(patch.committed, true);
    assert.equal(content(patch.localSources), 'A3');
    assert.equal(content(patch.localSources, fileB), 'B3');
    assert.equal(content(patch.localSources, 'local/unrelated.md'), 'keep');
});

for (const failure of ['conflict', 'error']) {
    test(`${failure} in one draft does not block reads or model/UI writes to other files`, async t => {
        const { b, ra, rb } = await setup(t);
        const { state, manager, controller } = editorWindow(t, rb);
        state.activeRun = { id: 'run', toolRequestIds: new Set(), workspaceBaseline: normalizeLocalSources(initial) };
        if (failure === 'conflict') await commit(ra, 'Write', { path: fileA, content: 'other version' });
        const failed = failure === 'error'
            ? t.mock.method(b.table('workspace'), 'put', async () => { throw new Error('disk full'); }) : null;
        manager.updateLocalFileContent(fileA, 'keep draft');
        assert.equal(await manager.flushPendingWorkspaceChanges(), false);
        failed?.mock.restore();
        assert.equal(state.workspaceDrafts[fileA].status, failure);
        assert.notEqual((await controller.callHostTool('Read', { filePath: fileA, scope: 'local' }, { runId: 'run' })).ok, false);
        assert.equal((await controller.callHostTool('Write', { path: fileB, content: 'B1' }, { runId: 'run' })).ok, true);
        assert.equal(await manager.deleteLocalPath(fileB), true);
        assert.equal(content((await rb.readWorkspace()).localSources, fileB), undefined);
        await assert.rejects(controller.callHostTool('Delete', { path: 'local/story/' }, { runId: 'run' }), /workspace_unsaved_changes/);
        assert.equal(state.workspaceDrafts[fileA].content, 'keep draft');
        assert.equal((await controller.callHostTool('CreateDirectory', { path: 'local/other/' }, { runId: 'run' })).ok, true);
    });
}

test('late save receipt does not block other files; canceling a related model wait leaves the latest draft saving', async t => {
    const { rb } = await setup(t);
    let entered, release;
    const started = new Promise(resolve => { entered = resolve; });
    const delayed = new Promise(resolve => { release = resolve; });
    let first = true;
    const { state, manager, controller } = editorWindow(t, rb, initial, {
        beforeReceipt: async payload => {
            if (first && payload.arguments.path === fileA) { first = false; entered(); await delayed; }
        },
    });
    t.after(release);
    manager.updateLocalFileContent(fileA, 'saved but receipt pending');
    const saving = manager.flushPendingWorkspaceChanges({ toolName: 'Write', args: { path: fileA } });
    await started;
    manager.updateLocalFileContent(fileA, 'latest typing');
    state.activeRun = { id: 'run', toolRequestIds: new Set(), workspaceBaseline: normalizeLocalSources(initial) };
    assert.notEqual((await controller.callHostTool('Read', { filePath: fileB, scope: 'local' }, { runId: 'run' })).ok, false);
    assert.equal((await controller.callHostTool('Write', { path: fileB, content: 'B1' }, { runId: 'run' })).ok, true);
    const abort = new AbortController();
    const waiting = controller.callHostTool('Delete', { path: fileA }, { runId: 'run', signal: abort.signal });
    abort.abort();
    await assert.rejects(waiting, /tool_aborted/);
    assert.equal(state.activeRun.toolRequestIds.size, 0);
    assert.equal(state.workspaceDrafts[fileA].content, 'latest typing');
    release();
    assert.equal(await saving, true);
    assert.equal(content((await rb.readWorkspace()).localSources), 'latest typing');
    assert.equal(content((await rb.readWorkspace()).localSources, fileB), 'B1');
    assert.equal(state.workspaceDrafts[fileA], undefined);
});

test('project and non-workspace tools are independent of a failed workspace database', async t => {
    const readWorkspace = t.mock.fn(async () => { throw new Error('workspace unavailable'); });
    const execute = t.mock.fn(async () => ({ ok: true }));
    const runtime = createLocalSourcesToolRuntime({ repository: { readWorkspace }, getLocalSources: () => initial,
        normalizeLocalSourcesSnapshot: normalizeLocalSources, executeToolCall: execute });
    for (const name of ['Read', 'Glob', 'Grep', 'GetSettings']) {
        assert.equal((await runtime.execute(name, { scope: 'project' })).ok, true);
    }
    assert.equal(readWorkspace.mock.callCount(), 0);
    await assert.rejects(runtime.execute('Read', { filePath: fileA, scope: 'local' }), /workspace unavailable/);
});

test('the existing tool deadline covers a save wait and never dispatches an expired mutation', async t => {
    let release;
    const waiting = new Promise(resolve => { release = resolve; });
    const post = t.mock.fn();
    const pending = new Map();
    const controller = createHostToolRequestController({ state: {}, pendingToolCalls: pending,
        createRequestId: () => 'waiting', REQUEST_TIMEOUT_MS: 10, post, flushBeforeToolCall: () => waiting });
    await assert.rejects(controller.callHostTool('Write', { path: fileA, content: 'expired' }, { runId: 'run' }), /tool_timeout/);
    assert.equal(pending.size, 0);
    release(true);
    await Promise.resolve();
    assert.equal(post.mock.callCount(), 0);
});

test('conflict recovery travels outside the model tool result, even with a large unrelated document', async t => {
    const { ra, rb } = await setup(t);
    const unrelated = 'private document '.repeat(32768);
    await commit(ra, 'Write', { path: 'local/unrelated.md', content: unrelated });
    await commit(ra, 'Write', { path: fileA, content: 'changed' });
    const { controller } = editorWindow(t, rb);
    let snapshot;
    const result = await controller.callHostTool('Write', { path: fileA, content: 'stale' }, {
        onWorkspaceConflict: value => { snapshot = value; },
    });
    assert.equal(result.error, 'workspace_conflict');
    assert.deepEqual(result.conflictPaths, [fileA]);
    assert.equal(content(snapshot, 'local/unrelated.md'), unrelated);
    assert.equal(JSON.stringify(result).includes(unrelated), false);
    assert.equal(Object.hasOwn(result, 'currentSnapshot'), false);
});

test('starting a run during own autosave captures the draft without waiting or self-conflicting', async t => {
    const { rb } = await setup(t);
    const { state, manager, controller } = editorWindow(t, rb);
    manager.updateLocalFileContent(fileA, 'user draft');
    state.activeRun = { id: 'run', toolRequestIds: new Set(), workspaceBaseline: manager.captureRunWorkspaceBaseline() };
    assert.equal(content(state.activeRun.workspaceBaseline), 'user draft');
    assert.equal((await controller.callHostTool('Write', { path: fileA, content: 'model revision' }, { runId: 'run' })).ok, true);
    assert.equal(content((await rb.readWorkspace()).localSources), 'model revision');
    assert.equal(state.workspaceDrafts[fileA], undefined);
});

test('a captured pending draft baseline still rejects later unobserved edits', async t => {
    const { rb } = await setup(t);
    const { state, manager, controller } = editorWindow(t, rb);
    manager.updateLocalFileContent(fileA, 'draft at run start');
    state.activeRun = { id: 'run', toolRequestIds: new Set(), workspaceBaseline: manager.captureRunWorkspaceBaseline() };
    await manager.flushPendingWorkspaceChanges();
    manager.updateLocalFileContent(fileA, 'later user edit');
    await manager.flushPendingWorkspaceChanges();
    assert.equal((await controller.callHostTool('Write', { path: fileA, content: 'stale model revision' }, { runId: 'run' })).error, 'workspace_conflict');
    assert.equal(content((await rb.readWorkspace()).localSources), 'later user edit');
});

for (const externalChange of [false, true]) {
    test(`lost save receipt retry ${externalChange ? 'protects subsequent external changes' : 'saves latest typing without a false conflict'}`, async t => {
        const { ra, rb } = await setup(t);
        let drop = true;
        const { state, manager, runtime } = editorWindow(t, rb, initial, { timeout: 150,
            beforeReceipt: () => { if (drop) { drop = false; return false; } },
        });
        manager.updateLocalFileContent(fileA, 'committed without receipt');
        assert.equal(await manager.flushPendingWorkspaceChanges(), false);
        assert.equal(state.workspaceDrafts[fileA].status, 'error');
        assert.equal(content((await rb.readWorkspace()).localSources), 'committed without receipt');
        // Recovery does not depend on the bounded host operation cache.
        runtime.clearLocalSources();
        if (externalChange) await commit(ra, 'Write', { path: fileA, content: 'other saved content' }, (await ra.readWorkspace()).localSources);
        manager.updateLocalFileContent(fileA, 'latest local draft');
        assert.equal(await manager.resolveEditorConflict(fileA, 'retry'), !externalChange);
        if (externalChange) {
            assert.equal(state.workspaceDrafts[fileA].status, 'conflict');
            assert.equal(state.workspaceDrafts[fileA].content, 'latest local draft');
            assert.equal(content((await rb.readWorkspace()).localSources), 'other saved content');
        } else {
            assert.equal(state.workspaceDrafts[fileA], undefined);
            assert.equal(content((await rb.readWorkspace()).localSources), 'latest local draft');
        }
    });
}

test('retry after a lost receipt cannot recreate a subsequently deleted file', async t => {
    const { ra, rb } = await setup(t);
    let drop = true;
    const { state, manager } = editorWindow(t, rb, initial, { timeout: 150,
        beforeReceipt: () => { if (drop) { drop = false; return false; } },
    });
    manager.updateLocalFileContent(fileA, 'committed without receipt');
    await manager.flushPendingWorkspaceChanges();
    await commit(ra, 'Delete', { path: fileA }, (await ra.readWorkspace()).localSources);
    assert.equal(await manager.resolveEditorConflict(fileA, 'retry'), false);
    assert.equal(state.workspaceDrafts[fileA].status, 'conflict');
    assert.equal(content((await rb.readWorkspace()).localSources), undefined);
});

test('lost receipt followed by repeated storage failures still retries the latest draft', async t => {
    const { rb } = await setup(t);
    let drop = true;
    const { state, manager } = editorWindow(t, rb, initial, { timeout: 150,
        beforeReceipt: () => { if (drop) { drop = false; return false; } },
    });
    manager.updateLocalFileContent(fileA, 'saved without receipt');
    assert.equal(await manager.flushPendingWorkspaceChanges(), false);
    const failed = t.mock.method(rb, 'commitWorkspaceMutation', async () => { throw new Error('temporary storage failure'); });
    for (const draft of ['retry draft', 'latest draft']) {
        manager.updateLocalFileContent(fileA, draft);
        assert.equal(await manager.resolveEditorConflict(fileA, 'retry'), false);
        assert.equal(state.workspaceDrafts[fileA].status, 'error');
        assert.equal(state.workspaceDrafts[fileA].content, draft);
    }
    failed.mock.restore();
    assert.equal(await manager.resolveEditorConflict(fileA, 'retry'), true);
    assert.equal(content((await rb.readWorkspace()).localSources), 'latest draft');
    assert.equal(state.workspaceDrafts[fileA], undefined);
});

test('failure saving newer typing after a confirmed retry retains the newest draft', async t => {
    const { b, rb } = await setup(t);
    let drop = true;
    const { state, manager } = editorWindow(t, rb, initial, { timeout: 150,
        beforeReceipt: () => { if (drop) { drop = false; return false; } },
    });
    manager.updateLocalFileContent(fileA, 'saved without receipt');
    assert.equal(await manager.flushPendingWorkspaceChanges(), false);
    manager.updateLocalFileContent(fileA, 'newer typing');
    const failed = t.mock.method(b.table('workspace'), 'put', async () => { throw new Error('temporary storage failure'); });
    assert.equal(await manager.resolveEditorConflict(fileA, 'retry'), false);
    assert.equal(content((await rb.readWorkspace()).localSources), 'saved without receipt');
    assert.equal(state.workspaceDrafts[fileA].content, 'newer typing');
    assert.equal(state.workspaceDrafts[fileA].status, 'error');
    manager.updateLocalFileContent(fileA, 'newest typing');
    failed.mock.restore();
    assert.equal(await manager.resolveEditorConflict(fileA, 'retry'), true);
    assert.equal(content((await rb.readWorkspace()).localSources), 'newest typing');
    assert.equal(state.workspaceDrafts[fileA], undefined);
});

test('repeated lost receipts for an explicitly recreated file do not rewrite its original content', async t => {
    const { ra, rb } = await setup(t);
    let drops = 2;
    const { state, manager } = editorWindow(t, rb, initial, { timeout: 150,
        beforeReceipt: (_payload, result) => { if (result.ok && drops > 0) { drops--; return false; } },
    });
    await commit(ra, 'Delete', { path: fileA });
    manager.updateLocalFileContent(fileA, 'recreated draft');
    assert.equal(await manager.flushPendingWorkspaceChanges(), false);
    assert.equal(await manager.resolveEditorConflict(fileA, 'mine'), false);
    const recreated = await rb.readWorkspace();
    assert.equal(findLocalFileByPath(recreated.localSources, fileA).file.originalContent, null);
    manager.updateLocalFileContent(fileA, 'latest typing');
    assert.equal(await manager.resolveEditorConflict(fileA, 'retry'), false);
    assert.equal(state.workspaceDrafts[fileA].status, 'error');
    assert.equal(state.workspaceDrafts[fileA].content, 'latest typing');
    assert.deepEqual(await rb.readWorkspace(), recreated);
    assert.equal(await manager.resolveEditorConflict(fileA, 'retry'), true);
    assert.equal(content((await rb.readWorkspace()).localSources), 'latest typing');
});

for (const deleted of [false, true]) {
    test(`downloads include ${deleted ? 'deleted-file' : 'failed-save'} drafts without changing storage or draft state`, async t => {
        const { b, ra, rb } = await setup(t);
        const { state, manager } = editorWindow(t, rb);
        if (deleted) await commit(ra, 'Delete', { path: 'local/story/' });
        const failed = deleted ? null : t.mock.method(b.table('workspace'), 'put', async () => { throw new Error('disk full'); });
        manager.updateLocalFileContent(fileA, 'latest A draft');
        manager.updateLocalFileContent(fileB, 'latest B draft');
        assert.equal(await manager.flushPendingWorkspaceChanges(), false);
        failed?.mock.restore();
        const saved = await rb.readWorkspace(), drafts = structuredClone(state.workspaceDrafts);
        const blobs = [];
        t.mock.method(URL, 'createObjectURL', blob => { blobs.push(blob); return 'blob:workspace-test'; });
        t.mock.method(URL, 'revokeObjectURL', () => {});
        const previousDocument = globalThis.document;
        globalThis.document = { createElement: () => ({ click() {} }), body: { appendChild() {}, removeChild() {} } };
        t.after(() => { globalThis.document = previousDocument; });
        assert.equal(manager.downloadAllLocalSources(), true);
        assert.equal(manager.downloadLocalFile(fileA), true);
        if (!deleted) assert.equal(manager.downloadLocalSource(initial[0].sourceId), true);
        const archive = unzipSync(new Uint8Array(await blobs[0].arrayBuffer()));
        assert.equal(strFromU8(archive[fileA]), 'latest A draft');
        assert.equal(strFromU8(archive[fileB]), 'latest B draft');
        assert.equal(await blobs[1].text(), 'latest A draft');
        if (!deleted) {
            const source = unzipSync(new Uint8Array(await blobs[2].arrayBuffer()));
            assert.equal(strFromU8(source['a.md']), 'latest A draft');
            assert.equal(strFromU8(source['b.md']), 'latest B draft');
        }
        assert.deepEqual(await rb.readWorkspace(), saved);
        assert.deepEqual(state.workspaceDrafts, drafts);
        assert.equal(manager.hasPendingWorkspaceChanges(), true);
    });
}

test('close waits for a canceled host mutation to leave the queue before removing the iframe', async t => {
    const { rb } = await setup(t);
    let enter, release;
    const started = new Promise(resolve => { enter = resolve; });
    const held = new Promise(resolve => { release = resolve; });
    t.after(release);
    const originalCommit = rb.commitWorkspaceMutation;
    t.mock.method(rb, 'commitWorkspaceMutation', async op => { enter(); await held; return originalCommit(op); });
    const { state, manager, controller, runtime, pending } = editorWindow(t, rb);
    const abort = new AbortController();
    state.activeRun = { id: 'run', controller: abort, toolRequestIds: new Set(), workspaceBaseline: initial };
    const request = controller.callHostTool('Write', { path: fileA, content: 'must not arrive after close' }, { runId: 'run', signal: abort.signal });
    const canceled = assert.rejects(request, /tool_aborted/);
    await started;
    let closed = false;
    const closing = closeAssistantWorkspace({ state, cancelRun: () => abort.abort(),
        flushEditorChanges: manager.flushPendingWorkspaceChanges, flushHostWrites: runtime.flush,
        workspaceStore: createWorkspaceStore({ state, repository: rb }), hasPendingChanges: manager.hasPendingWorkspaceChanges,
        close: () => { closed = true; }, render: () => {}, showToast: () => {}, describeError: String,
    });
    await canceled;
    assert.equal(pending.size, 0);
    assert.equal(closed, false);
    assert.equal(state.isClosingAssistant, true);
    release();
    assert.equal(await closing, true);
    assert.equal(closed, true);
    assert.equal(content((await rb.readWorkspace()).localSources), 'A0');
});

test('closing retries a failed UI-only save once using the latest UI state', async t => {
    const { b, rb } = await setup(t);
    const state = { viewerMode: 'original' };
    const workspaceStore = createWorkspaceStore({ state, repository: rb });
    const failed = t.mock.method(b.table('workspace'), 'put', async () => { throw new Error('temporary failure'); });
    assert.equal((await workspaceStore.persistWorkspaceUiState()).ok, false);
    let closed = false;
    const close = () => closeAssistantWorkspace({ state, cancelRun: () => {}, flushEditorChanges: async () => true,
        flushHostWrites: async () => {}, workspaceStore, hasPendingChanges: () => false,
        close: () => { closed = true; }, render: () => {}, showToast: () => {}, describeError: String,
    });
    assert.equal(await close(), false);
    assert.equal(failed.mock.callCount(), 2);
    assert.equal(state.isClosingAssistant, false);
    assert.equal(closed, false);
    failed.mock.restore();
    state.viewerMode = 'current';
    assert.equal(await close(), true);
    assert.equal(closed, true);
    assert.equal((await rb.readWorkspace()).viewerMode, 'current');
    assert.deepEqual((await rb.readWorkspace()).localSources, initial);
});

test('missing host flush acknowledgement keeps the assistant open and retryable', async () => {
    const state = {};
    let closed = false;
    assert.equal(await closeAssistantWorkspace({ state, cancelRun: () => {}, flushEditorChanges: async () => true,
        flushHostWrites: async () => { throw new Error('host_request_timeout'); },
        workspaceStore: { flushWorkspace: async () => ({ ok: true }) }, hasPendingChanges: () => false,
        close: () => { closed = true; }, render: () => {}, showToast: () => {}, describeError: String,
    }), false);
    assert.equal(closed, false);
    assert.equal(state.isClosingAssistant, false);
});
