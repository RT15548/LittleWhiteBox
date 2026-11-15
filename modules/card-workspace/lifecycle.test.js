import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import db, { metaTable } from '../assistant/shared/session-db.js';
import { createCardLifecycle, watchCardLifecycle } from './lifecycle.js';
import { storeFiles, readFiles } from './workspace.js';
import { workspaceRepository } from '../assistant/shared/workspace-repository.js';
import { buildWorkspacePreconditions } from '../assistant/shared/workspace-preconditions.js';
import { upsertLocalSourceFile } from '../assistant/shared/local-workspace-kernel.js';
import { rootFor } from './paths.js';

const deferred = () => Promise.withResolvers();
const pathFor = avatar => rootFor(avatar) + 'design.md';
async function edit(avatar, content) {
    const args = { path: pathFor(avatar), content };
    return workspaceRepository.commitWorkspaceMutation({ name: 'Write', args,
        preconditions: buildWorkspacePreconditions('Write', args, (await workspaceRepository.readWorkspace()).localSources),
        execute: async sources => ({ result: { ok: true }, nextSources: upsertLocalSourceFile(sources, args.path, content).nextSources }) });
}

function fixture(options = {}) {
    const remote = new Map([['A.png', 'saved']]), notices = new Map();
    const read = async avatar => remote.get(avatar) ?? null;
    const write = async (avatar, content) => { if (content.trim()) remote.set(avatar, content); else remote.delete(avatar); };
    const dependencies = { read, write, readName: async avatar => avatar.replace('.png', ''), failed: (op, error, retry) => notices.set(op.id, { op, error, retry }),
        recovered: id => notices.delete(id), ...options };
    if (options.storage) {
        const { read, write } = options.storage;
        let registration = Promise.resolve();
        dependencies.storage = { read, update: transform => {
            const result = registration.then(async () => {
                const current = await read(), next = transform(current);
                if (next !== current) await write(next);
                return next;
            });
            registration = result.then(() => undefined, () => undefined);
            return result;
        } };
    }
    return { remote, notices, read, write, dependencies, lifecycle: createCardLifecycle(dependencies) };
}

// Acceptance contracts (all cost lost drafts or incorrect deletion):
// - In-flight saves/renames/deletes finish in host order, with drafts and baselines together.
// - A failed operation survives reload and can retry without overwriting either copy.
// - Failures for one card leave unrelated cards usable.
test('save, chained rename and delete serialize, moving the latest workspace drafts', async () => {
    await db.delete(); await db.open();
    try {
        const f = fixture(), started = deferred(), release = deferred();
        await storeFiles([{ path: pathFor('A.png'), content: 'saved' }, { path: rootFor('A.png') + 'description.md', content: 'body' },
            { path: 'local/notes.md', content: 'keep' }]);
        const saving = f.lifecycle.run(['A.png'], async () => { started.resolve(); await release.promise; await f.write('A.png', 'submitted'); });
        await started.promise;
        const first = f.lifecycle.rename('A.png', 'B.png');
        const second = f.lifecycle.rename('B.png', 'C.png');
        await edit('A.png', 'new draft while saving');
        release.resolve();
        await Promise.all([saving, first, second]);
        assert.deepEqual([...f.remote], [['C.png', 'submitted']]);
        const files = await readFiles(), design = files.find(file => file.path === pathFor('C.png'));
        assert.equal(design.content, 'new draft while saving');
        assert.equal(design.originalContent, 'saved');
        assert.ok(files.some(file => file.path === rootFor('C.png') + 'description.md'));
        assert.ok(!files.some(file => file.path.startsWith(rootFor('A.png')) || file.path.startsWith(rootFor('B.png'))));
        await f.lifecycle.delete('C.png');
        db.close(); await db.open();
        assert.deepEqual([...f.remote], []);
        assert.deepEqual((await readFiles()).map(file => file.path), ['local/notes.md']);
        assert.equal(await metaTable.count(), 0);
    } finally { await db.delete(); }
});

// Accepted host events must survive a reload even while waiting behind a save;
// journaling a later event must not move it ahead of an earlier save (lost data).
test('queued host events are durable before the execution lane is available', async () => {
    let operations = [];
    const recorded = deferred(), blocked = deferred(), entered = deferred();
    const storage = { read: async () => structuredClone(operations), write: async value => {
        operations = structuredClone(value);
        if (value.length === 2) recorded.resolve();
    } };
    const f = fixture({ storage, changeDirectory: async () => {}, changed: async () => {} });
    const saving = f.lifecycle.run(['A.png'], async () => { entered.resolve(); await blocked.promise; });
    await entered.promise;
    const rename = f.lifecycle.rename('A.png', 'B.png');
    const deletion = f.lifecycle.delete('B.png');
    try {
        const reached = await Promise.race([recorded.promise.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 100))]);
        assert.equal(reached, true);
        assert.deepEqual(operations.map(op => [op.from, op.to]), [['A.png', 'B.png'], ['B.png', undefined]]);
        const restoring = createCardLifecycle(f.dependencies).restore();
        assert.equal(f.remote.get('A.png'), 'saved');
        blocked.resolve();
        await Promise.all([saving, rename, deletion, restoring]);
        assert.equal(f.remote.size, 0);
        assert.equal(operations.length, 0);
    } finally { blocked.resolve(); await Promise.all([saving, rename, deletion]); }
});

test('an immediately queued rename cannot run ahead of an earlier save', async () => {
    let operations = [];
    const events = [];
    const f = fixture({ storage: { read: async () => structuredClone(operations), write: async value => { operations = structuredClone(value); } },
        changeDirectory: async () => {}, changed: async () => events.push('rename') });
    await Promise.all([f.lifecycle.run(['A.png'], () => { events.push('save'); return f.write('A.png', 'new'); }), f.lifecycle.rename('A.png', 'B.png')]);
    assert.deepEqual(events, ['save', 'rename']);
    assert.deepEqual([...f.remote], [['B.png', 'new']]);
});

test('durable later renames do not overtake a save between two renames', async () => {
    let operations = [];
    const f = fixture({ storage: { read: async () => structuredClone(operations), write: async value => { operations = structuredClone(value); } },
        changeDirectory: async () => {}, changed: async () => {} });
    await Promise.all([f.lifecycle.rename('A.png', 'B.png'), f.lifecycle.run(['B.png'], async () => {
        assert.equal(f.remote.get('B.png'), 'saved');
        assert.equal(f.remote.has('C.png'), false);
        await f.write('B.png', 'saved in between');
    }), f.lifecycle.rename('B.png', 'C.png')]);
    assert.deepEqual([...f.remote], [['C.png', 'saved in between']]);
});

test('a failed journal append keeps event order when the next append succeeds', async () => {
    let operations = [], fail = true;
    const f = fixture({ storage: { read: async () => structuredClone(operations), write: async value => {
        if (fail) { fail = false; throw new Error('storage failed'); }
        operations = structuredClone(value);
    } }, changeDirectory: async () => {}, changed: async () => {} });
    await assert.rejects(f.lifecycle.rename('A.png', 'B.png'));
    await f.lifecycle.rename('B.png', 'C.png');
    assert.deepEqual([...f.remote], [['C.png', 'saved']]);
    assert.equal(operations.length, 0);
    assert.equal(f.notices.size, 0);
});

test('opening after a failed journal append retries it before creating a new directory', async () => {
    let operations = [], fail = true;
    const f = fixture({ storage: { read: async () => structuredClone(operations), write: async value => {
        if (fail) throw new Error('storage failed');
        operations = structuredClone(value);
    } }, changeDirectory: async () => {}, changed: async () => {} });
    await assert.rejects(f.lifecycle.rename('A.png', 'B.png'));
    fail = false;
    await f.lifecycle.run(['B.png'], () => {
        assert.deepEqual([...f.remote], [['B.png', 'saved']]);
    });
    assert.equal(operations.length, 0);
    assert.equal(f.notices.size, 0);
});

// Restoring card work must not prevent the rest of the plugin from starting;
// a failed journal read remains visible and retryable (unrelated features stop).
test('watch registers immediately and failed startup recovery has a retry', async () => {
    const waiting = deferred(), handlers = new Map(), notices = [];
    let fail = true;
    const f = fixture({ storage: { read: async () => { await waiting.promise; if (fail) throw new Error('storage failed'); return []; }, write: async () => {} },
        restoreFailed: (error, retry) => notices.push({ error, retry }) });
    const restoring = watchCardLifecycle({ eventSource: { on: (name, handler) => handlers.set(name, handler) },
        eventTypes: { CHARACTER_RENAMED: 'rename', CHARACTER_DELETED: 'delete' } }, async () => {}, f.lifecycle, { postMessage() {} });
    assert.equal(handlers.size, 2);
    waiting.resolve();
    await restoring;
    assert.equal(notices.length, 1);
    fail = false;
    await notices[0].retry();
});

test('deleting during a rename upload cannot resurrect the design or working copy', async () => {
    await db.delete(); await db.open();
    try {
        const started = deferred(), release = deferred(), f = fixture();
        const lifecycle = createCardLifecycle({ ...f.dependencies, write: async (avatar, content) => {
            if (avatar === 'B.png' && content) { started.resolve(); await release.promise; }
            await f.write(avatar, content);
        } });
        await storeFiles([{ path: pathFor('A.png'), content: 'saved' }]);
        const rename = lifecycle.rename('A.png', 'B.png');
        await started.promise;
        const deletion = lifecycle.delete('B.png');
        release.resolve();
        await Promise.all([rename, deletion]);
        assert.equal(f.remote.size, 0);
        assert.equal((await readFiles()).length, 0);
    } finally { await db.delete(); }
});

test('failed rename and following delete recover across reload while unrelated cards remain writable', async () => {
    await db.delete(); await db.open();
    try {
        const f = fixture();
        const failing = createCardLifecycle({ ...f.dependencies, write: async () => { throw new Error('HTTP 500'); } });
        await storeFiles([{ path: pathFor('A.png'), content: 'saved' }]);
        await edit('A.png', 'unsaved draft');
        await assert.rejects(failing.rename('A.png', 'B.png'));
        await assert.rejects(failing.delete('B.png'));
        assert.equal(f.notices.size, 1);
        assert.equal(typeof [...f.notices.values()][0].retry, 'function');
        await failing.run(['other.png'], () => f.write('other.png', 'keep'));
        assert.equal((await readFiles())[0].content, 'unsaved draft');
        db.close(); await db.open();
        await createCardLifecycle(f.dependencies).restore();
        assert.deepEqual([...f.remote], [['other.png', 'keep']]);
        assert.equal((await readFiles()).length, 0);
        assert.equal(await metaTable.count(), 0);
        assert.equal(f.notices.size, 0);
    } finally { await db.delete(); }
});

test('partial rename retry preserves the moved draft and refuses a different destination', async () => {
    await db.delete(); await db.open();
    try {
        const f = fixture();
        let fail = true;
        const lifecycle = createCardLifecycle({ ...f.dependencies, write: async (avatar, content) => {
            if (avatar === 'A.png' && !content && fail) throw new Error('HTTP 500');
            await f.write(avatar, content);
        } });
        await storeFiles([{ path: pathFor('A.png'), content: 'saved' }]);
        await edit('A.png', 'draft');
        await assert.rejects(lifecycle.rename('A.png', 'B.png'));
        await edit('B.png', 'later draft');
        fail = false;
        await [...f.notices.values()][0].retry();
        assert.equal((await readFiles())[0].content, 'later draft');
        assert.equal((await readFiles())[0].originalContent, 'saved');
        f.remote.set('C.png', 'different');
        await assert.rejects(lifecycle.rename('B.png', 'C.png'));
        assert.equal(f.remote.get('C.png'), 'different');
        assert.equal((await readFiles())[0].content, 'later draft');
    } finally { await db.delete(); }
});

// The host name changes while other metadata drafts remain writable; explicit
// name disagreements and unfinished JSON remain intact (lost authored metadata).
test('rename rebases only the saved name and preserves other metadata edits', async () => {
    for (const draft of [{ name: 'A', creator: 'draft author' }, { name: 'My draft name', creator: 'draft author' }, '{unfinished']) {
        await db.delete(); await db.open();
        try {
            const path = rootFor('A.png') + 'card.json';
            const baseline = JSON.stringify({ name: 'A', creator: 'original author' });
            await storeFiles([{ path, content: baseline }]);
            const args = { path, content: typeof draft === 'string' ? draft : JSON.stringify(draft) };
            await workspaceRepository.commitWorkspaceMutation({ name: 'Write', args,
                preconditions: buildWorkspacePreconditions('Write', args, (await workspaceRepository.readWorkspace()).localSources),
                execute: async sources => ({ result: { ok: true }, nextSources: upsertLocalSourceFile(sources, path, args.content).nextSources }) });
            const f = fixture({ readName: async () => 'Actual B' });
            await f.lifecycle.rename('A.png', 'B1.png');
            const file = (await readFiles()).find(item => item.path === rootFor('B1.png') + 'card.json');
            if (typeof draft === 'object' && draft.name === 'A') {
                assert.deepEqual(JSON.parse(file.content), { name: 'Actual B', creator: 'draft author' });
                assert.deepEqual(JSON.parse(file.originalContent), { name: 'Actual B', creator: 'original author' });
            } else {
                assert.equal(file.content, args.content);
                assert.equal(file.originalContent, baseline);
            }
        } finally { await db.delete(); }
    }
});

test('journal appends during an older upload survive its completion and recover in order', async () => {
    let operations = [];
    const uploading = deferred(), release = deferred(), recorded = deferred();
    const storage = { read: async () => structuredClone(operations), write: async value => {
        operations = structuredClone(value);
        if (value.length === 2) recorded.resolve();
    } };
    const f = fixture({ storage, changeDirectory: async () => {}, changed: async () => {} });
    const lifecycle = createCardLifecycle({ ...f.dependencies, write: async (avatar, content) => {
        if (avatar === 'B.png' && content) { uploading.resolve(); await release.promise; }
        await f.write(avatar, content);
    } });
    const first = lifecycle.rename('A.png', 'B.png');
    await uploading.promise;
    const second = lifecycle.rename('B.png', 'C.png');
    await recorded.promise;
    release.resolve();
    await Promise.all([first, second]);
    assert.deepEqual([...f.remote], [['C.png', 'saved']]);
    assert.equal(operations.length, 0);
});

// Opening a second page must not replay a live rename. Its later deletion must
// remain final, while work on another card continues (resurrection / lost work).
test('another page restores and deletes behind a live rename without blocking unrelated cards', async () => {
    await db.delete(); await db.open();
    const uploading = deferred(), release = deferred(), f = fixture();
    const left = createCardLifecycle({ ...f.dependencies, write: async (avatar, content) => {
        if (avatar === 'B.png' && content) { uploading.resolve(); await release.promise; }
        await f.write(avatar, content);
    } });
    try {
        await storeFiles([{ path: pathFor('A.png'), content: 'saved' }]);
        const rename = left.rename('A.png', 'B.png');
        await uploading.promise;
        const right = createCardLifecycle(f.dependencies);
        const restore = right.restore(), deletion = right.delete('B.png');
        try {
            await right.run(['Other.png'], () => f.write('Other.png', 'independent'));
            assert.equal(f.remote.get('A.png'), 'saved');
            assert.equal(f.remote.get('Other.png'), 'independent');
        } finally { release.resolve(); }
        await Promise.all([rename, restore, deletion]);
        db.close(); await db.open();
        assert.deepEqual([...f.remote], [['Other.png', 'independent']]);
        assert.deepEqual(await readFiles(), []);
        assert.equal(await metaTable.count(), 0);
    } finally { release.resolve(); await db.delete(); }
});

test('cross-page recovery cannot overtake the save between two registered renames', async () => {
    await db.delete(); await db.open();
    const entered = deferred(), release = deferred(), f = fixture({ changeDirectory: async () => {}, changed: async () => {} });
    try {
        const saving = f.lifecycle.run(['A.png'], async () => { entered.resolve(); await release.promise; await f.write('A.png', 'first'); });
        await entered.promise;
        const first = f.lifecycle.rename('A.png', 'B.png');
        const middle = f.lifecycle.run(['B.png'], () => f.write('B.png', 'middle'));
        const second = f.lifecycle.rename('B.png', 'C.png');
        const restoring = createCardLifecycle(f.dependencies).restore();
        release.resolve();
        await Promise.all([saving, first, middle, second, restoring]);
        assert.deepEqual([...f.remote], [['C.png', 'middle']]);
        assert.equal(await metaTable.count(), 0);
    } finally { release.resolve(); await db.delete(); }
});
