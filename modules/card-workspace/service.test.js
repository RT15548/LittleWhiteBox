import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import db from '../assistant/shared/session-db.js';
import * as workspace from './workspace.js';
import * as files from './files.js';
import { equalText } from './comparison.js';
import { COPY } from './copy.js';
import { createCardLifecycle } from './lifecycle.js';
import { workspaceRepository } from '../assistant/shared/workspace-repository.js';
import { buildWorkspacePreconditions } from '../assistant/shared/workspace-preconditions.js';
import { upsertLocalSourceFile } from '../assistant/shared/local-workspace-kernel.js';

const root = files.rootFor('fixture.png'), path = root + files.DESIGN_FILE;
async function edit(content) {
    const args = { path, content };
    await workspaceRepository.commitWorkspaceMutation({ name: 'Write', args,
        preconditions: buildWorkspacePreconditions('Write', args, (await workspaceRepository.readWorkspace()).localSources),
        execute: async sources => ({ result: { ok: true }, nextSources: upsertLocalSourceFile(sources, path, content).nextSources }) });
}
function harness(readDesign) {
    const source = readFileSync(new URL('./service.js', import.meta.url), 'utf8').replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
    return runInNewContext(source + '\nrunCardFiles', { ...workspace, ...files, equalText, COPY, Set,
        currentCard: () => ({ avatar: 'fixture.png', name: 'fixture' }),
        readCharacter: async () => ({ data: {} }), linkedBooks: () => [], readDesign,
        cardFileDirectory: value => value, cardLifecycle: createCardLifecycle() });
}

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
