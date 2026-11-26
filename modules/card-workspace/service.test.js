import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import db from '../assistant/shared/session-db.js';
import * as workspace from './workspace.js';
import * as files from './files.js';
import * as documents from './item-document.js';
import { equalText } from './comparison.js';
import { COPY } from './copy.js';
import { SET_CARD_AVATAR_ACTION } from './assistant-contract.js';
import { cardFileDirectory } from './display.js';
import { ASSET_FIELD } from './asset-task.js';
import { createCardLifecycle } from './lifecycle.js';
import { workspaceRepository } from '../assistant/shared/workspace-repository.js';
import { applyWorkspaceObservations, buildWorkspacePreconditions, findWorkspaceConflicts } from '../assistant/shared/workspace-preconditions.js';
import { createLocalSourceRecord, flattenLocalSourceFiles, normalizeLocalSourceFile, upsertLocalSourceFile } from '../assistant/shared/local-workspace-kernel.js';

const root = files.rootFor('fixture.png'), path = root + files.DESIGN_FILE;
async function edit(content) {
    const args = { path, content };
    await workspaceRepository.commitWorkspaceMutation({ name: 'Write', args,
        preconditions: buildWorkspacePreconditions('Write', args, (await workspaceRepository.readWorkspace()).localSources),
        execute: async sources => ({ result: { ok: true }, nextSources: upsertLocalSourceFile(sources, path, content).nextSources }) });
}
function harness(readDesign, saveFile, data = {}) {
    const source = readFileSync(new URL('./service.js', import.meta.url), 'utf8').replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
    return runInNewContext(source + '\nrunCardFiles', { ...workspace, ...files, ...documents, equalText, COPY, Set, SET_CARD_AVATAR_ACTION,
        saveFile, flattenLocalSourceFiles, normalizeLocalSourceFile,
        currentCard: () => ({ avatar: 'fixture.png', name: 'fixture' }),
        readCharacter: async () => ({ data }), linkedBooks: () => [], readDesign,
        cardFileDirectory, cardLifecycle: createCardLifecycle() });
}

test('first open and reopening a damaged card identify its file and key without exporting the bad payload', async () => {
    await db.delete(); await db.open();
    try {
        const damaged = { key: 'banner', mime: 'image/png', size: 1, base64: 'private-payload' };
        const run = harness(async () => '', null, { description: 'valid', extensions: { 'xiaobaix-tasks': { tasks: [
            { id: 'fixture', name: 'images', commands: '', x: { [ASSET_FIELD]: [damaged] } },
        ] } } });
        for (const reused of [false, true]) {
            const result = await run({ action: 'open' });
            assert.equal(result.reused, reused);
            assert.equal(result.warnings[0].path, root + 'tasks/images.md');
            assert.ok(result.warnings[0].message.includes('banner'));
            const local = await workspace.readFiles();
            assert.equal(local.find(file => file.path.endsWith('/description.md')).content, 'valid');
            assert.ok(!JSON.stringify(local).includes(damaged.base64));
        }
    } finally { await db.delete(); }
});

// A committed tool save permits the next edit without Read; an unseen human draft stays protected.
for (const timing of ['none', 'before', 'during', 'after']) test('same-run CardFiles receipt; editor change: ' + timing, async () => {
    await db.delete(); await db.open();
    try {
        const regex = root + 'regex/rule.md', renamed = root + 'regex/updated.md';
        const document = (name, body) => documents.serializeItemDocument('regex', { id: '1', scriptName: name, replaceString: body });
        await workspace.storeFiles([{ path, content: 'A' }, { path: regex, content: document('rule', 'A') }]);
        await edit('B');
        let baseline = (await workspaceRepository.readWorkspace()).localSources;
        if (timing === 'before') await edit('D');
        const run = harness(null, async (target, file) => {
            if (timing === 'during' && file.path === path) await edit('D');
            return { content: target.kind === 'regex' ? document('updated', 'A') : file.content };
        });
        const result = await run({ action: 'save', paths: [path, regex, root + 'missing.md'] }, {
            onWorkspaceObserved: changes => { baseline = applyWorkspaceObservations(baseline, changes); },
        });
        assert.deepEqual(Array.from(result.results, r => r.saved).sort(), [false, true, true]);
        if (timing === 'after') await edit('D');
        const actual = (await workspaceRepository.readWorkspace()).localSources;
        function conflicts(target) {
            const args = { files: [{ path: target, edits: [{ oldString: 'B', newString: 'C' }] }] };
            return findWorkspaceConflicts('apply_patch', args, buildWorkspacePreconditions('apply_patch', args, baseline), actual);
        }
        assert.deepEqual(conflicts(path), timing === 'none' ? [] : [path]);
        assert.deepEqual(conflicts(renamed), []);
        assert.deepEqual(conflicts(regex), []);
        assert.equal((await workspace.readFiles()).find(f => f.path === path).content, timing === 'none' ? 'B' : 'D');
    } finally { await db.delete(); }
});

test('batched saves advance only known drafts, respecting occupied names and earlier renames', () => {
    const dir = root + 'regex/';
    const file = (name, content) => normalizeLocalSourceFile({ path: dir + name, content, originalContent: null });
    const a = file('a.md', 'A'), b = file('b.md', 'B'), c = file('c.md', 'C');
    const base = [createLocalSourceRecord({ sourceId: 'cards', rootPath: 'local/cards/',
        files: [a, b, c], directories: [dir.slice('local/cards/'.length) + 'occupied.md'] })];
    const receipt = (old, saved) => ({ path: saved.path, scope: 'entry', submitted: old, expected: { kind: 'file', file: saved } });
    const renamed = file('free.md', 'saved B'), reused = file('b.md', 'saved A');
    const updated = { ...c, originalContent: c.content, originalGroupHash: 'saved' };
    const result = applyWorkspaceObservations(base, [
        receipt(a, file('occupied.md', 'blocked by directory')), receipt(a, file('b.md', 'blocked by file')),
        receipt(b, renamed), receipt(a, reused), receipt({ ...renamed, content: 'unseen' }, file('free.md', 'unseen')),
        receipt(c, updated),
    ]);
    const byPath = files => Object.fromEntries(files.map(f => [f.path, f]));
    assert.deepEqual(byPath(result[0].files), byPath([renamed, reused, updated]));
    assert.deepEqual(byPath(base[0].files), byPath([a, b, c]));
});

// Acceptance contracts (cost: invisible draft overwrite or stale design decisions):
// - Opening updates a clean design, preserves a draft, and reports remote conflicts.
// - A create/edit during a remote read is never adopted as permission to overwrite.
test('reopening refreshes clean designs and preserves dirty drafts and their baselines', async () => {
    await db.delete(); await db.open();
    try {
        let remote = 'v1', reads = 0;
        const run = harness(async () => { reads++; return remote; });
        await run({ action: 'open' });
        remote = 'v2';
        await run({ action: 'open' });
        assert.equal((await workspace.readFiles()).find(file => file.path === path).content, 'v2');
        await edit('draft');
        await run({ action: 'open' });
        remote = 'v3';
        const reopened = await run({ action: 'open' });
        assert.equal(reopened.warnings[0].message, COPY.designDraftConflict);
        assert.ok(reopened.files.some(file => file.path === root + 'description.md'));
        const draft = (await workspace.readFiles()).find(file => file.path === path);
        assert.equal(draft.content, 'draft');
        assert.equal(draft.originalContent, 'v2');
        assert.equal(reads, 4);
        remote = null;
        assert.equal((await run({ action: 'open' })).warnings[0].message, COPY.designDraftConflict);
        await workspace.storeFiles([{ path, content: 'v2' }]);
        await run({ action: 'open' });
        assert.equal((await workspace.readFiles()).find(file => file.path === path).content, '');
    } finally { await db.delete(); }
});

test('initial import and existing-folder design reads never overwrite concurrent editor work', async () => {
    for (const existing of [false, true]) {
        await db.delete(); await db.open();
        try {
            if (existing) await workspace.storeFiles([{ path: root + 'description.md', content: 'kept' }]);
            const started = Promise.withResolvers(), release = Promise.withResolvers();
            const run = harness(async () => { started.resolve(); await release.promise; return 'server'; });
            const opening = run({ action: 'open' });
            await started.promise;
            await edit('created during read');
            release.resolve();
            await assert.rejects(opening, { message: COPY.designWorkspaceChanged });
            db.close(); await db.open();
            const draft = (await workspace.readFiles()).find(file => file.path === path);
            assert.equal(draft.content, 'created during read');
            assert.equal(draft.originalContent, null);
        } finally { await db.delete(); }
    }
});
