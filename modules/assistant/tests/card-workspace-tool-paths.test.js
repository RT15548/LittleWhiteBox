import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import Dexie from '../../../libs/dexie.mjs';
import { createIdentifier } from '../../../shared/common/identifier.js';
import { rootFor, readableCardWorkspacePath as readable, storedCardWorkspacePath as stored } from '../../card-workspace/paths.js';
import { locateFile } from '../../card-workspace/files.js';
import { state3JsApiNamespace } from '../../variables/state3/skill/public-api.js';
import { callReadableWorkspaceTool } from '../shared/workspace-tool-paths.js';
import { createWorkspaceRepository } from '../shared/workspace-repository.js';
import { buildWorkspacePreconditions } from '../shared/workspace-preconditions.js';
import { createLocalSourcesToolRuntime } from '../shared/local-sources-tool-runtime.js';
import { createHostToolRequestController } from '../app-src/runtime/host-tool-requests.js';
import { normalizeLocalSources, upsertLocalSourceFile, flattenLocalSourceFiles } from '../shared/local-workspace-kernel.js';
import { loadWorkspaceHostTools } from './helpers/workspace-host.js';

// Contracts (wrong-file writes / lost work): readable and old encoded names
// address the same stored file; distinct names never alias. All file operations
// keep content exact and conflict checks on stored keys; saves survive reopen.
// Draft trials must receive unchanged variable data, not decoded state paths.
test('card paths round-trip without aliases; unrelated workspace percent names stay literal', () => {
    const names = ['作者测试.png', 'Alice Smith.png', '艾琳😀.png', '100%.png', 'A B.png', 'A%20B.png', 'a/b.png', 'a\\b.png', 'a\nb.png'];
    const paths = names.map(name => rootFor(name) + 'system_prompt.md');
    assert.equal(new Set(paths.map(readable)).size, names.length);
    for (const path of paths) {
        assert.equal(stored(readable(path)), path);
        assert.equal(stored(path), path);
        assert.equal(readable(readable(path)), readable(path));
    }
    assert.equal(readable(paths[0]), 'local/cards/作者测试.png/system_prompt.md');
    assert.equal(readable(paths[1]), 'local/cards/Alice Smith.png/system_prompt.md');
    assert.equal(stored('local/notes/A%20B.md'), 'local/notes/A%20B.md');
    for (const folder of ['world_book', 'tasks', 'regex']) {
        const suffix = folder === 'world_book' ? '/' + encodeURIComponent('条目') + '.md' : '.md';
        const path = rootFor(names[0]) + folder + '/' + encodeURIComponent('规则/100% 测试') + suffix;
        assert.equal(stored(readable(path)), path);
        assert.equal(locateFile(stored(readable(path))).avatar, names[0]);
    }
});

test('readable file tools share stored conflict targets and persist only the intended edits', async t => {
    t.mock.method(console, 'info', () => {});
    const db = new Dexie(`card-path-contract-${createIdentifier()}`);
    db.version(1).stores({ workspace: 'id', workspaceImageBlobs: 'id' });
    await db.open();
    t.after(async () => db.delete());
    const repository = createWorkspaceRepository(db), executeHost = await loadWorkspaceHostTools();
    const raw = rootFor('作者测试.png') + 'system_prompt.md', path = readable(raw);
    const englishRaw = rootFor('Alice Smith.png') + 'system_prompt.md';
    const unchanged = `Literal reference: ${raw}`;
    let cache = upsertLocalSourceFile(upsertLocalSourceFile([], raw, unchanged).nextSources, englishRaw, 'English').nextSources;
    await db.table('workspace').put({ id: 'main', localSources: cache });
    const state = { localSources: cache, runtime: {}, activeRun: { id: 'run', toolRequestIds: new Set(), workspaceBaseline: structuredClone(cache) } };
    const pending = new Map(), posted = [];
    const host = createLocalSourcesToolRuntime({ repository, getLocalSources: () => cache, setLocalSources: value => { cache = value; }, normalizeLocalSourcesSnapshot: normalizeLocalSources, executeToolCall: executeHost });
    const controller = createHostToolRequestController({ state, pendingToolCalls: pending, createRequestId: () => createIdentifier(), REQUEST_TIMEOUT_MS: 10000,
        describeError: error => error.message, post: (type, payload) => {
            if (type !== 'xb-assistant:tool-call') return;
            posted.push(payload);
            let observations;
            void host.execute(payload.name, payload.arguments, { workspaceMeta: payload.workspaceMeta, onWorkspaceObserved: value => { observations = value; } })
                .then(result => pending.get(payload.requestId)?.resolve(result, observations), error => pending.get(payload.requestId)?.reject(error));
        },
    });
    const call = (name, args) => callReadableWorkspaceTool(name, args, converted => controller.callHostTool(name, converted, { runId: 'run' }));
    const listing = await call('LS', { scope: 'local', path: 'local/cards/' });
    assert.ok(listing.items.some(item => item.publicPath === readable(rootFor('作者测试.png'))));
    const directory = await call('Read', { scope: 'local', filePath: 'local/cards/' });
    assert.ok(directory.content.split('\n').includes('作者测试.png/'));
    assert.equal((await call('Read', { scope: 'local', filePath: path })).content.includes(unchanged), true);
    for (const pattern of ['**/作者*/system_prompt.md', '**/Alice */system_prompt.md']) {
        const found = await call('Glob', { scope: 'local', pattern });
        assert.equal(found.total, 1);
        assert.equal(found.items[0].publicPath, pattern.includes('Alice') ? readable(englishRaw) : path);
        assert.equal(found.items[0].relativePath.includes('%E4'), false);
    }
    const grep = await call('Grep', { scope: 'local', pattern: 'Literal', include: '**/作者*/*.md' });
    assert.equal(grep.items[0].path, path);
    assert.equal(grep.items[0].text, unchanged);
    const patch = { files: [{ path, edits: [{ oldString: unchanged, newString: `${unchanged}\n正文不转换 ${raw}` }] }] };
    assert.equal((await call('apply_patch', patch)).ok, true);
    assert.equal(posted.at(-1).workspaceMeta.preconditions.some(item => item.path === raw && item.expected.kind === 'file'), true);
    const before = flattenLocalSourceFiles(cache);
    assert.equal(before.find(item => item.path === raw).content, `${unchanged}\n正文不转换 ${raw}`);
    assert.equal(before.find(item => item.path === englishRaw).content, 'English');
    // A newer editor save must not be overwritten by an older model view.
    const args = { path: raw, content: 'newer editor' };
    await host.execute('Write', args, { workspaceMeta: { preconditions: buildWorkspacePreconditions('Write', args, cache) } });
    const conflict = await call('Write', { filePath: path, content: 'stale model' });
    assert.equal(conflict.error, 'workspace_conflict');
    assert.ok(conflict.conflictPaths.includes(path));
    assert.equal(flattenLocalSourceFiles(cache).find(item => item.path === raw).content, 'newer editor');
    await call('Read', { scope: 'local', filePath: raw }); // old encoded input also refreshes the correct baseline
    assert.equal((await call('Write', { filePath: path, content: 'confirmed edit' })).path, path);
    const created = readable(rootFor('作者测试.png')) + 'tasks/初始化.js';
    await call('Write', { filePath: created, content: unchanged });
    const renamed = created.replace('初始化', '重新初始化');
    await call('Move', { fromPath: created, toPath: renamed });
    assert.equal(flattenLocalSourceFiles(cache).find(item => item.path === stored(renamed)).content, unchanged);
    await call('Delete', { path: renamed });
    const receipt = await callReadableWorkspaceTool('CardFiles', { action: 'save', paths: [path] }, async args => {
        assert.deepEqual(args.paths, [raw]);
        assert.equal(locateFile(args.paths[0]).avatar, '作者测试.png');
        return { ok: true, results: args.paths.map(path => ({ path, saved: true })) };
    });
    assert.equal(receipt.results[0].path, path);
    db.close(); await db.open();
    const reopened = flattenLocalSourceFiles((await repository.readWorkspace()).localSources);
    assert.equal(reopened.find(item => item.path === raw).content, 'confirmed edit');
    assert.equal(reopened.find(item => item.path === englishRaw).content, 'English');
    assert.equal(reopened.length, 2);
});

test('V3 assistant draft paths convert without touching draft content or variable paths', async () => {
    const root = rootFor('作者测试.png'), file = root + 'variables/definition.json';
    const draft = { root, name: '作者测试', avatar: '作者测试.png', paths: [file], files: [{ path: file, content: '{"path":"literal%20"}' }] };
    const input = [{ op: 'set', path: ['literal%20'], value: 1 }];
    const api = state3JsApiNamespace({ openDraft: async () => draft,
        checkDraft: (received, operations) => { assert.deepEqual(received, draft); assert.strictEqual(operations, input); return { ok: true }; },
        saveCardDraft: received => { assert.deepEqual(received, draft); return { ok: true, results: [{ path: file, saved: true }] }; },
    });
    const opened = await api.openDraft();
    assert.equal(opened.root, 'local/cards/作者测试.png/');
    assert.equal(opened.files[0].content, draft.files[0].content);
    assert.equal((await api.checkDraft(opened, input)).ok, true);
    assert.equal((await api.saveCardDraft(opened)).results[0].path, readable(file));
});
