import test from 'node:test';
import assert from 'node:assert/strict';
import { createCardAssetActions } from './asset-actions.js';
import { ASSET_FIELD, assetCommands, assetWorkspacePath, compileAssetTask, summarizeAssetBlob } from './asset-task.js';
import { describeCardWorkspaceFiles } from './display.js';
import { rootFor } from './files.js';
import { serializeItemDocument } from './item-document.js';
import { upsertLocalSourceFile } from '../assistant/shared/local-workspace-kernel.js';
import { buildWorkspaceTree } from '../assistant/app-src/workspace/local-workspace-tree.js';

const root = rootFor('asset-contract.png');
const loader = (id, assets, name = id) => ({ id, name, commands: assetCommands(id), x: { [ASSET_FIELD]: assets } });
const document = (path, task) => ({ path: root + `tasks/${path}.md`, content: serializeItemDocument('tasks', task) });
const makeAsset = (key = 'portrait', bytes = 'image') => summarizeAssetBlob(key, new Blob([bytes], { type: 'image/png' }));

// Listing remains useful when any task document is malformed, even if its
// frontmatter is too broken to determine whether it contains image settings.
test('asset list reports every corrupt task alongside usable image tasks', async () => {
    const asset = await makeAsset();
    const files = [
        document('broken-assets', loader('bad', [{ ...asset, digest: 'broken' }])),
        { path: root + 'tasks/broken-ordinary.md', content: '---\n{"id":\n---\n/echo ordinary' },
        document('good', loader('good', [asset])),
        document('ordinary', { id: 'ordinary', name: 'ordinary', commands: '/echo okay' }),
    ];
    let sources = upsertLocalSourceFile([], root + 'card.json', '{}').nextSources;
    for (const file of files) sources = upsertLocalSourceFile(sources, file.path, file.content).nextSources;
    const run = createCardAssetActions({ repository: { readWorkspace: async () => ({ localSources: sources }) } });
    const list = taskPath => run({ action: 'list', rootPath: root, ...(taskPath ? { taskPath } : {}) }, 'asset-contract.png');
    const result = await list();
    assert.equal(result.ok, false);
    assert.equal(result.status, 'partial');
    assert.deepEqual(result.tasks.map(task => [task.taskPath, task.runtime.taskId, task.assets]), [[files[2].path, 'good', [asset]]]);
    assert.deepEqual(result.errors.map(error => error.taskPath), files.slice(0, 2).map(file => file.path));
    assert.ok(result.errors.every(error => typeof error.error === 'string' && error.error.length));
    const failed = await list(files[1].path);
    assert.equal(failed.status, 'failed');
    assert.equal(failed.ok, false);
    assert.deepEqual(failed.tasks, []);
    assert.equal(failed.errors[0].taskPath, files[1].path);
    for (const file of files.slice(2)) {
        const clean = await list(file.path);
        assert.equal(clean.status, 'success');
        assert.equal(clean.ok, true);
        assert.deepEqual(clean.errors, []);
    }
});

test('compile identifies missing new and changed draft bytes but reuses unchanged saved entries', async () => {
    const asset = await makeAsset(), changed = await makeAsset('portrait', 'replacement');
    const saved = { ...asset, base64: btoa('image') }, previous = loader('portraits', [saved]);
    const target = { root, id: 'portraits' };
    const reads = [];
    const missing = async path => { reads.push(path); throw new Error('local_file_not_found'); };
    const unchanged = await compileAssetTask(target, previous, loader('portraits', [asset]), missing);
    assert.equal(unchanged.x[ASSET_FIELD][0], saved);
    assert.deepEqual(reads, []);
    for (const [before, selected] of [[null, asset], [previous, changed]]) {
        await assert.rejects(compileAssetTask(target, before, loader('portraits', [selected]), missing), error => {
            assert.equal(error.code, 'CARD_ASSET_IMAGE_UNAVAILABLE');
            assert.equal(error.key, selected.key);
            assert.equal(error.path, assetWorkspacePath(root, selected));
            assert.equal(error.recovery, 'reselect');
            return true;
        });
    }
    await assert.rejects(compileAssetTask(target, null, loader('portraits', [asset]), async () => { throw new Error('workspace_image_blob_not_found'); }), { code: 'CARD_ASSET_IMAGE_UNAVAILABLE' });
    const storageError = new Error('storage_offline');
    await assert.rejects(compileAssetTask(target, null, loader('portraits', [asset]), async () => { throw storageError; }), error => error === storageError);
});

test('image associations derive many keys and task identities without changing hashed files', async () => {
    const asset = await makeAsset(), alias = { ...asset, key: 'smile' };
    const first = document('first', loader('first', [asset, alias], 'Portraits'));
    const second = document('second', loader('second', [asset], 'Expressions'));
    const path = assetWorkspacePath(root, asset);
    const image = { kind: 'image', path, name: path.split('/').at(-1), relativePath: path.slice('local/'.length), blobId: 'fixture', mimeType: asset.mime, sizeBytes: asset.size };
    const foreign = { ...document('foreign', loader('foreign', [asset])), path: rootFor('other.png') + 'tasks/foreign.md' };
    const files = [first, second, foreign, image], baseline = structuredClone(files);
    const initial = describeCardWorkspaceFiles(files).get(path);
    assert.equal(initial.kind, 'image');
    assert.deepEqual(initial.assetReferences, [
        { key: asset.key, taskPath: first.path, taskId: 'first', taskName: 'Portraits' },
        { key: alias.key, taskPath: first.path, taskId: 'first', taskName: 'Portraits' },
        { key: asset.key, taskPath: second.path, taskId: 'second', taskName: 'Expressions' },
    ]);
    assert.deepEqual(files, baseline);
    assert.notEqual(initial.label, image.name);
    const tree = buildWorkspaceTree([{ sourceId: 'local', rootPath: 'local/', label: 'local', files: files.map(file => ({ ...file, relativePath: file.path.slice('local/'.length) })) }], { searchQuery: alias.key });
    assert.ok(tree.visiblePaths.includes(image.path));
    first.originalContent = first.content;
    first.content = serializeItemDocument('tasks', loader('first', [asset], 'Renamed portraits'));
    const renamed = describeCardWorkspaceFiles(files).get(path);
    assert.equal(renamed.assetReferences.length, 2);
    assert.equal(renamed.assetReferences[0].taskName, 'Renamed portraits');
    assert.notEqual(renamed.title, initial.title);
    first.content = serializeItemDocument('tasks', loader('first', []));
    const removed = describeCardWorkspaceFiles([first, image]);
    assert.equal(removed.has(image.path), false);
    first.content = 'incomplete frontmatter';
    assert.equal(describeCardWorkspaceFiles([first, image]).has(image.path), false);
});
