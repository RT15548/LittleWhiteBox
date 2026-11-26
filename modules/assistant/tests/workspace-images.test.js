import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { parseHTML } from 'linkedom';
import { unzipSync, strFromU8 } from '../../../libs/fflate.mjs';
import db, { workspaceImageBlobsTable, workspaceTable } from '../shared/session-db.js';
import { workspaceRepository } from '../shared/workspace-repository.js';
import { readWorkspaceImage, readWorkspaceImageById, observeWorkspaceImagePaths, writeWorkspaceImages, workspaceImageObservations } from '../shared/workspace-images.js';
import { buildWorkspacePreconditions, applyWorkspaceObservations, captureWorkspacePath, findWorkspaceConflicts } from '../shared/workspace-preconditions.js';
import { flattenLocalSourceFiles, moveLocalSourcePath, normalizeLocalSources, removeLocalSourcePath, upsertLocalSourceFile } from '../shared/local-workspace-kernel.js';
import { createLocalSourcesToolRuntime } from '../shared/local-sources-tool-runtime.js';
import { createLocalSourcesManager } from '../app-src/workspace/local-sources.js';
import { renderWorkspace } from '../app-src/workspace/local-workspace-ui.js';

// A real tiny PNG; assertions compare bytes, not how the storage layer encodes them.
const pngBytes = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jG40AAAAASUVORK5CYII=', 'base64'));
const png = () => new Blob([pngBytes], { type: 'image/png' });
const bytes = async blob => new Uint8Array(await blob.arrayBuffer());

async function reset(t) {
    await db.delete();
    await db.open();
    t.after(() => db.delete());
}

async function commitPathChange(name, args, before, change) {
    return workspaceRepository.commitWorkspaceMutation({
        name, args, preconditions: buildWorkspacePreconditions(name, args, before),
        execute: sources => ({ result: { ok: true }, nextSources: change(sources).nextSources }),
    });
}

async function sources() {
    return (await workspaceRepository.readWorkspace()).localSources;
}

test('image metadata stays byte-free; moving a directory preserves immutable bytes and deleting frees them', async t => {
    await reset(t);
    const fromPath = 'local/gallery/trip.md/', toPath = 'local/archive/2026/';
    const path = `${fromPath}photo.png`;
    const [created] = await writeWorkspaceImages([{ path, blob: png() }]);
    db.close();
    await db.open();
    const reopened = await sources();
    const [file] = flattenLocalSourceFiles(reopened);
    assert.equal(file.kind, 'image');
    assert.equal(file.mimeType, 'image/png');
    assert.equal(file.sizeBytes, pngBytes.length);
    assert.equal(file.blobId, created.blobId);
    for (const key of ['blob', 'content', 'originalContent']) assert.equal(Object.hasOwn(file, key), false);
    const observations = workspaceImageObservations([created]);
    const stalePath = fromPath.slice(0, -1), unrelated = 'local/gallery/unrelated.md';
    const stale = upsertLocalSourceFile(upsertLocalSourceFile([], unrelated, 'Leave untouched').nextSources, stalePath, 'Used to be a file').nextSources;
    const runBaseline = applyWorkspaceObservations(stale, observations);
    assert.deepEqual(captureWorkspacePath(runBaseline, stalePath), { kind: 'directory' });
    assert.deepEqual(captureWorkspacePath(runBaseline, unrelated), captureWorkspacePath(stale, unrelated));
    assert.deepEqual(captureWorkspacePath(runBaseline, path), observations.find(item => item.path === path).expected);
    assert.deepEqual(await bytes((await readWorkspaceImage(path)).blob), pngBytes);

    for (const [name, args] of [
        ['Move', { fromPath: path, toPath: 'local/renamed.png' }],
        ['Delete', { path }],
    ]) {
        const preconditions = buildWorkspacePreconditions(name, args, runBaseline);
        assert.deepEqual(findWorkspaceConflicts(name, args, preconditions, reopened), []);
    }

    assert.equal((await commitPathChange('Move', { fromPath, toPath }, reopened,
        current => moveLocalSourcePath(current, fromPath, toPath))).committed, true);
    await assert.rejects(readWorkspaceImage(path), /local_file_not_found/);
    const moved = await readWorkspaceImage(`${toPath}photo.png`);
    assert.equal(moved.file.blobId, file.blobId);
    assert.deepEqual(await bytes(moved.blob), pngBytes);
    assert.equal(await workspaceImageBlobsTable.count(), 1);
    const dir = 'local/archive/';
    assert.equal((await commitPathChange('Delete', { path: dir }, await sources(),
        current => removeLocalSourcePath(current, dir))).committed, true);
    await assert.rejects(readWorkspaceImageById(file.blobId), /workspace_image_blob_not_found/);
    assert.equal(await workspaceImageBlobsTable.count(), 0);
});

test('preflights reject collisions and a conflicting or failed image batch leaves no partial bytes', async t => {
    await reset(t);
    const firstPath = 'local/gallery/first.png', secondPath = 'local/gallery/second.png';
    const entries = [firstPath, secondPath].map(path => ({ path, blob: png() }));
    await assert.rejects(observeWorkspaceImagePaths([firstPath, `${firstPath}/nested.png`]), /local_parent_path_blocked/);
    await assert.rejects(observeWorkspaceImagePaths([firstPath, firstPath]), /local_destination_exists/);
    const preconditions = await observeWorkspaceImagePaths([firstPath, secondPath]);
    await writeWorkspaceImages([entries[1]]);
    await assert.rejects(observeWorkspaceImagePaths([secondPath]), /local_destination_exists/);
    await assert.rejects(observeWorkspaceImagePaths([`${secondPath}/nested.png`]), /local_parent_path_blocked/);
    await assert.rejects(writeWorkspaceImages(entries, { preconditions }), error => {
        assert.equal(error.message, 'workspace_conflict');
        assert.deepEqual(error.conflictPaths, [secondPath]);
        return true;
    });
    await assert.rejects(readWorkspaceImage(firstPath), /local_file_not_found/);

    const fail = () => { throw new Error('injected row write failure'); };
    workspaceTable.hook('updating', fail);
    try { await assert.rejects(writeWorkspaceImages([entries[0]]), /injected row write failure/); }
    finally { workspaceTable.hook('updating').unsubscribe(fail); }
    assert.equal(await workspaceImageBlobsTable.count(), 1);
    assert.deepEqual(flattenLocalSourceFiles(await sources()).map(file => file.path), [secondPath]);
    const abort = new AbortController();
    abort.abort();
    await assert.rejects(writeWorkspaceImages([entries[0]], { signal: abort.signal }), /tool_aborted/);
    assert.equal(await workspaceImageBlobsTable.count(), 1);
});

test('directory import commits images with text; archive and preview read the original image bytes', async t => {
    await reset(t);
    const previousDocument = globalThis.document, previousWindow = globalThis.window;
    const dom = parseHTML('<body></body>');
    globalThis.document = dom.document;
    globalThis.window = { setTimeout, matchMedia: () => ({ matches: false }) };
    t.after(() => { globalThis.document = previousDocument; globalThis.window = previousWindow; });
    t.mock.method(console, 'info', () => {});
    let cache = [];
    const state = { localSources: [], runtime: {}, workspaceDrafts: {}, treeExpandedKeys: [] };
    const host = createLocalSourcesToolRuntime({
        repository: workspaceRepository, normalizeLocalSourcesSnapshot: normalizeLocalSources,
        setLocalSources: value => { cache = value; }, getLocalSources: () => cache,
        executeToolCall: (name, args, { localSources }) => {
            assert.equal(name, 'Grep');
            return { paths: flattenLocalSourceFiles(localSources).map(file => file.path) };
        },
    });
    const imageViews = [];
    const manager = createLocalSourcesManager({
        state, createRequestId: () => 'import', persistWorkspaceUiState: async () => {},
        onWorkspaceImagesChanged: () => { imageViews.push(flattenLocalSourceFiles(state.localSources).filter(file => file.kind === 'image').map(file => file.path)); },
        callHostTool: (name, args, options) => host.execute(name, structuredClone(args), {
            ...options, onLocalSourcesUpdated: next => manager.applyExternalLocalSources(next),
        }),
    });
    const image = new File([pngBytes], 'picture.png', { type: 'image/png' });
    const text = new File(['readable'], 'note.md', { type: 'text/plain' });
    Object.defineProperty(image, 'webkitRelativePath', { value: 'demo/photos/picture.png' });
    Object.defineProperty(text, 'webkitRelativePath', { value: 'demo/note.md' });
    assert.equal(await manager.appendLocalSourceFiles([image, text], { mode: 'directory' }), true);
    assert.deepEqual((await host.execute('Grep', { scope: 'local' })).paths, ['local/demo/note.md']);
    const path = 'local/demo/photos/picture.png';
    const { file } = await readWorkspaceImage(path);
    const downloaded = [];
    t.mock.method(URL, 'createObjectURL', blob => { downloaded.push(blob); return `blob:workspace-${downloaded.length}`; });
    const revoked = [];
    t.mock.method(URL, 'revokeObjectURL', url => { revoked.push(url); });
    assert.equal(await manager.downloadAllLocalSources(), true);
    assert.equal(await manager.downloadLocalFile(path), true);
    const archive = unzipSync(await bytes(downloaded[0]));
    assert.deepEqual(archive[path], pngBytes);
    assert.equal(strFromU8(archive['local/demo/note.md']), 'readable');
    assert.deepEqual(await bytes(downloaded[1]), pngBytes);

    const nav = document.createElement('div'), viewer = document.createElement('div');
    let previewReady;
    const previewUrlCreated = new Promise(resolve => { previewReady = resolve; });
    t.mock.method(URL, 'createObjectURL', previewBlob => { previewReady(previewBlob); return 'blob:workspace-preview'; });
    const options = { selectedMatch: { source: (await sources())[0], file }, manageFiles: true };
    renderWorkspace({ nav, viewer }, options);
    assert.deepEqual(await bytes(await previewUrlCreated), pngBytes);
    assert.equal(viewer.querySelector('[data-workspace-editor]'), null);
    const img = viewer.querySelector('img');
    img.onload();
    assert.equal(img.hidden, false);
    assert.equal(img.getAttribute('src'), 'blob:workspace-preview');
    renderWorkspace({ nav, viewer }, { ...options, showViewer: false });
    assert.equal(viewer.querySelector('img'), null);
    assert.ok(revoked.includes('blob:workspace-preview'));
    assert.deepEqual(imageViews.at(-1), [path]);
    const fromPath = 'local/demo/', toPath = 'local/renamed/';
    await manager.applyExternalDirectoryChange({ fromPath, toPath, localSources: moveLocalSourcePath(state.localSources, fromPath, toPath).nextSources });
    assert.deepEqual(imageViews.at(-1), ['local/renamed/photos/picture.png']);
    await manager.applyExternalLocalSources([]);
    assert.deepEqual(imageViews.at(-1), []);
});
