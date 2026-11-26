import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalSourcesManager } from '../app-src/workspace/local-sources.js';
import { WORKSPACE_COPY } from '../app-src/workspace/workspace-copy.js';
import { flattenLocalSourceFiles, normalizeLocalSources, upsertLocalSourceFile } from '../shared/local-workspace-kernel.js';
import { createLocalSourcesToolRuntime } from '../shared/local-sources-tool-runtime.js';
import db, { workspaceImageBlobsTable } from '../shared/session-db.js';
import { workspaceRepository } from '../shared/workspace-repository.js';

const path = 'local/demo/note.md';
const initial = upsertLocalSourceFile([], path, 'saved').nextSources;
const operations = {
    import: manager => manager.appendLocalSourceFiles([new File(['new'], 'new.md')]),
    rename: manager => manager.renameLocalPath(path),
    delete: manager => manager.deleteLocalPath(path),
    clear: manager => manager.clearLocalSources(),
    remove: manager => manager.removeLocalSource(initial[0].sourceId),
};

function setup(t, deps = {}) {
    const previous = globalThis.window;
    globalThis.window = { setTimeout, confirm: () => true, prompt: () => 'demo/renamed.md', matchMedia: () => ({ matches: false }) };
    t.after(() => { globalThis.window = previous; });
    t.mock.method(console, 'info', () => {});
    const state = { localSources: structuredClone(initial), workspaceDrafts: {}, runtime: {}, treeExpandedKeys: [] };
    const toasts = [], progress = [];
    const manager = createLocalSourcesManager({
        state, createRequestId: () => 'workspace-ux', persistWorkspaceUiState: async () => {},
        showToast: value => toasts.push(value), setImportProgress: value => progress.push(value),
        ...deps,
    });
    return { manager, state, toasts, progress };
}

// UI failures must use the shared translator, retain structured validation,
// and leave authoritative files untouched. Copy itself is not a contract.
for (const [name, run] of Object.entries(operations)) {
    test(`${name} uses the shared error description without mutating files`, async t => {
        const validation = { errors: ['file_directory_conflict:local/demo'] };
        const translated = 'translated-workspace-failure';
        const described = [];
        const { manager, state, toasts } = setup(t, {
            describeError: error => { described.push(error); return translated; },
            callHostTool: async () => ({ ok: false, error: 'workspace_invariant_failed', validation }),
        });
        await run(manager);
        assert.equal(described.length, 1);
        assert.equal(described[0].message, 'workspace_invariant_failed');
        assert.deepEqual(described[0].validation, validation);
        assert.equal(toasts.length, 1);
        assert.ok(toasts[0].includes(translated));
        assert.deepEqual(state.localSources, initial);
        assert.equal(manager.hasPendingWorkspaceChanges(), false);
    });

    test(`${name} conflict refreshes the snapshot and notifies exactly once`, async t => {
        const changed = upsertLocalSourceFile(initial, path, 'another window').nextSources;
        const { manager, state, toasts } = setup(t, {
            describeError: () => assert.fail('Conflict already has dedicated feedback'),
            callHostTool: async (_name, _args, options) => {
                options.onWorkspaceConflict(changed);
                return { ok: false, error: 'workspace_conflict' };
            },
        });
        await run(manager);
        assert.equal(toasts.length, 1);
        assert.deepEqual(state.localSources, changed);
        assert.equal(manager.hasPendingWorkspaceChanges(), false);
    });

    for (const synchronous of [false, true]) {
        test(`${name} translates ${synchronous ? 'synchronous' : 'asynchronous'} host failures without raw details`, async t => {
            const raw = 'private_storage_failure:/internal/path';
            const fail = () => { throw new Error(raw); };
            const { manager, state, toasts } = setup(t, {
                describeError: (error, fallback) => fallback ?? error.message,
                callHostTool: synchronous ? fail : async () => fail(),
            });
            await run(manager);
            assert.equal(toasts.length, 1);
            assert.equal(toasts[0].includes(raw), false);
            assert.deepEqual(state.localSources, initial);
            assert.equal(manager.hasPendingWorkspaceChanges(), false);
        });
    }
}

test('workspace feedback trusts the explicit translator result even when it matches the original message', async t => {
    const description = 'recognized-description';
    const { manager, toasts } = setup(t, {
        describeError: (error, fallback) => {
            assert.equal(fallback, WORKSPACE_COPY.operationFailedUnknown);
            return error.message;
        },
        callHostTool: async () => ({ ok: false, error: description }),
    });
    assert.equal(await manager.deleteLocalPath(path), false);
    assert.equal(toasts.length, 1);
    assert.ok(toasts[0].includes(description));
});

function rejectedFiles() {
    return [
        { file: new File([], 'empty.png', { type: 'image/png' }), reason: 'empty_image' },
        { file: new File(['image'], 'mismatch.jpeg', { type: 'image/png' }), reason: 'image_mime_mismatch' },
        { file: new File(['image'], 'unsupported.bmp', { type: 'image/bmp' }), reason: 'unsupported_format' },
    ];
}

function assertRejections(toast, rejected) {
    for (const { file, reason } of rejected) {
        // Reference semantic reason keys rather than freeze Chinese wording.
        const name = file.webkitRelativePath || file.name;
        assert.ok(toast.includes(WORKSPACE_COPY.importRejected(name, WORKSPACE_COPY.importRejectionReasons[reason])));
    }
}

test('mixed directory import reports each rejection while committing accepted text and images together', async t => {
    await db.delete();
    await db.open();
    t.after(() => db.delete());
    let cache = [];
    const host = createLocalSourcesToolRuntime({
        repository: workspaceRepository, normalizeLocalSourcesSnapshot: normalizeLocalSources,
        setLocalSources: value => { cache = value; }, getLocalSources: () => cache,
    });
    const calls = [];
    const { manager, state, toasts, progress } = setup(t, {
        callHostTool: (name, args, options) => {
            calls.push({ name, args, options });
            return host.execute(name, args, { ...options, onLocalSourcesUpdated: next => manager.applyExternalLocalSources(next) });
        },
    });
    state.localSources = [];
    const rejected = rejectedFiles();
    // Metadata-only acceptance is intentional; this task must not decode bytes.
    const image = new File(['not decoded'], 'accepted.png', { type: 'image/png' });
    const noMime = new File(['unspecified MIME'], 'accepted.jpg');
    const text = new File([], 'empty-text.md');
    const files = [...rejected.map(item => item.file), image, noMime, text];
    files.forEach(file => Object.defineProperty(file, 'webkitRelativePath', { value: `folder/nested/${file.name}` }));
    assert.equal(await manager.appendLocalSourceFiles(files, { mode: 'directory' }), true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, 'BatchWriteFiles');
    assert.equal(calls[0].args.files.length, 3);
    assert.ok(calls[0].options.workspaceMeta.preconditions.length > 0);
    const saved = flattenLocalSourceFiles((await workspaceRepository.readWorkspace()).localSources);
    assert.deepEqual(saved.map(file => file.name).sort(), ['accepted.jpg', 'accepted.png', 'empty-text.md']);
    assert.equal(saved.filter(file => file.kind === 'image').length, 2);
    assert.equal(await workspaceImageBlobsTable.count(), 2);
    assert.equal(toasts.length, 1);
    assertRejections(toasts[0], rejected);
    assert.equal(progress.at(-1).active, false);
});

test('an entirely rejected import identifies every file without a host write', async t => {
    const { manager, state, toasts, progress } = setup(t, {
        callHostTool: () => assert.fail('Rejected files must not be submitted'),
    });
    const rejected = rejectedFiles();
    assert.equal(await manager.appendLocalSourceFiles(rejected.map(item => item.file)), false);
    assert.equal(toasts.length, 1);
    assertRejections(toasts[0], rejected);
    assert.deepEqual(state.localSources, initial);
    assert.equal(progress.at(-1).active, false);
});

test('file read errors report a safe failure and do not submit a partially read batch', async t => {
    const raw = 'file_reader_internal_error';
    const file = new File(['unreadable'], 'bad.md');
    t.mock.method(file, 'stream', () => { throw new Error(raw); });
    const { manager, state, toasts, progress } = setup(t, {
        describeError: (error, fallback) => fallback ?? error.message,
        callHostTool: () => assert.fail('Incomplete batch must not be submitted'),
    });
    assert.equal(await manager.appendLocalSourceFiles([new File(['good'], 'good.md'), file]), false);
    assert.equal(toasts.length, 1);
    assert.equal(toasts[0].includes(raw), false);
    assert.deepEqual(state.localSources, initial);
    assert.equal(progress.at(-1).active, false);
});

test('a delete blocked by a failed draft save retains the draft and reports one actionable failure', async t => {
    const calls = [];
    const { manager, state, toasts } = setup(t, {
        callHostTool: async name => { calls.push(name); return { ok: false, error: 'storage_failed' }; },
    });
    manager.updateLocalFileContent(path, 'unsaved draft');
    assert.equal(await manager.deleteLocalPath(path), false);
    assert.deepEqual(calls, ['Write']);
    assert.equal(state.workspaceDrafts[path].content, 'unsaved draft');
    assert.equal(state.workspaceDrafts[path].status, 'error');
    assert.equal(toasts.length, 1);
    assert.equal(toasts[0].includes('workspace_unsaved_changes'), false);
    assert.deepEqual(state.localSources, initial);
});
