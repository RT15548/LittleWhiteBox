import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import { runInNewContext } from 'node:vm';
import { COPY } from './copy.js';
import { equalJson, equalText } from './comparison.js';
import { CARD_FIELDS, TEXT_FIELDS, cardFiles, locateFile, projectCard, projectItem, json } from './files.js';
import { ITEM_KINDS, itemDocumentValue, serializeItemDocument, parseItemDocument } from './item-document.js';
import { rebaseCardName } from './rename.js';
import db from '../assistant/shared/session-db.js';
import { workspaceRepository } from '../assistant/shared/workspace-repository.js';
import { readWorkspaceImage, readWorkspaceImageById, writeWorkspaceImages } from '../assistant/shared/workspace-images.js';
import { applyWorkspaceObservations, buildWorkspacePreconditions, captureWorkspacePath, findWorkspaceConflicts } from '../assistant/shared/workspace-preconditions.js';
import { removeLocalSourcePath } from '../assistant/shared/local-workspace-kernel.js';
import { ASSET_FIELD, assetCommands, assetRuntime, assetWorkspacePath, compileAssetTask, summarizeAssetBlob } from './asset-task.js';
import { createCardAssetActions } from './asset-actions.js';
import { changeCardDirectory, readFiles, storeFiles, storeItemReceipt } from './workspace.js';
import { rootFor } from './files.js';

// C1: newline representation and JSON key order cannot block unchanged content;
// real text/array/value changes still conflict (lost edits / false save failures).
function harness() {
    const card = { name: 'fixture', avatar: 'fixture.png', data: { extensions: { regex_scripts: [{ id: 'one', scriptName: 'one', replaceString: 'old' }] } } };
    let book = { entries: { 1: { uid: 1, content: 'old', comment: 'one' } } }, writes = 0, design = null;
    const ctx = { characters: [card], characterId: 0, eventSource: { emit: async () => {} }, eventTypes: {} };
    const reversed = obj => Object.fromEntries(Object.entries(obj).reverse());
    const source = readFileSync(new URL('./host.js', import.meta.url), 'utf8').replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
    const api = runInNewContext(source + '\n({assertUnchanged,saveFile,readTarget})', {
        COPY, equalJson, equalText, CARD_FIELDS, projectCard, projectItem, json, structuredClone, ITEM_KINDS, itemDocumentValue,
        compileAssetTask, readWorkspaceImage,
        saveCharacterTask: async ({ previous, task }) => {
            const tasks = card.data.extensions['xiaobaix-tasks'].tasks;
            const index = tasks.findIndex(item => item.id === task.id);
            assert.deepEqual(tasks[index] ?? null, previous);
            if (index < 0) tasks.push(structuredClone(task)); else tasks[index] = structuredClone(task);
            writes++;
        },
        variableCardHost: () => ({}), getContext: () => ctx, getRequestHeaders: () => ({}), readDesign: async () => design,
        writeDesign: async (avatar, content) => { writes++; design = content.trim() ? content : null; },
        DOMPurify: { sanitize: v => v }, select_selected_character() {}, allowScopedScripts() {},
        newWorldInfoEntryTemplate: {}, originalWIDataKeyMap: {}, setWIOriginalDataValue() {},
        worldInfoCache: new Map(), updateWorldInfoList: async () => {},
        fetch: async (url, options) => {
            const body = JSON.parse(options.body);
            if (url === '/api/characters/merge-attributes') {
                writes++;
                Object.assign(card.data, body.data);
                if (body.data.extensions?.regex_scripts) card.data.extensions.regex_scripts = body.data.extensions.regex_scripts.map(reversed);
            }
            else if (url === '/api/worldinfo/edit') { writes++; book = body.data; book.entries[1] = reversed(book.entries[1]); }
            return { ok: true, json: async () => structuredClone(url.includes('worldinfo') ? book : card) };
        },
    });
    return { ...api, writes: () => writes, book: () => book, card: () => card };
}

test('C1: only line-ending representation is ignored; JSON settings retain semantic conflict checks', () => {
    const { assertUnchanged } = harness();
    assert.equal(assertUnchanged({ originalContent: 'a\nb\n', content: 'A\nb\n' }, 'a\r\nb\r\n'), true);
    assert.equal(assertUnchanged({ originalContent: 'old', content: 'a\nb' }, 'a\r\nb'), false);
    for (const changed of ['a\nc\n', 'a \nb\n', 'a\nb', 'a\n\nb\n']) {
        assert.throws(() => assertUnchanged({ originalContent: 'a\nb\n', content: 'A\nb\n' }, changed), { message: COPY.conflict });
    }
    assert.equal(assertUnchanged({ originalContent: '{"a":1,"b":2}', content: '{"a":3,"b":2}' }, '{"b":2,"a":1}', true), true);
    assert.equal(equalJson({ a: [1, 2] }, { a: [2, 1] }), false);
});

// Acceptance: clearing a saved design elsewhere must not let an old draft
// silently restore it; a genuinely new design can still be saved (lost work).
test('design saves distinguish a new document from a remotely cleared baseline', async () => {
    const host = harness(), target = { avatar: 'fixture.png', kind: 'design' };
    await assert.rejects(host.saveFile(target, { originalContent: 'previous', content: 'draft' }), { message: COPY.conflict });
    assert.equal(host.writes(), 0);
    assert.equal((await host.saveFile(target, { content: 'new' })).content, 'new');
    assert.equal((await host.saveFile(target, { originalContent: 'new', content: '  \n' })).content, '');
    assert.equal((await host.saveFile(target, { originalContent: '', content: 'next' })).content, 'next');
});

test('metadata rebased after a host rename can save unrelated edits without reverting the name', async () => {
    const host = harness();
    host.card().data.name = 'Old';
    const originalContent = json(projectCard(host.card().data));
    const file = { originalContent, content: JSON.stringify({ ...JSON.parse(originalContent), creator: 'new author' }) };
    host.card().data.name = 'New';
    await host.saveFile({ avatar: 'fixture.png', kind: 'card' }, rebaseCardName(file, 'New'));
    assert.equal(host.card().data.name, 'New');
    assert.equal(host.card().data.creator, 'new author');
});

test('C1: regex and worldbook saves confirm equal JSON despite reordered response keys', async () => {
    const host = harness();
    for (const target of [{ avatar: 'fixture.png', kind: 'regex', id: 'one' },
        { avatar: 'fixture.png', kind: 'world', id: 1, book: 'fixture' }]) {
        const value = target.kind === 'world' ? host.book().entries[1] : host.card().data.extensions.regex_scripts[0];
        const originalContent = projectItem(target, value), bodyField = ITEM_KINDS[target.kind].body;
        const result = await host.saveFile(target, { content: projectItem(target, { ...value, [bodyField]: 'new' }), originalContent });
        assert.equal(parseItemDocument(target.kind, result.content).body, 'new');
    }
    assert.equal(host.writes(), 2);
});

// Acceptance: opening a card preserves empty field/greeting baselines so they
// can be filled and saved; concurrent host edits still conflict (lost author work).
test('empty and populated card fields retain writable baselines without overwriting host edits', async () => {
    for (const initial of [undefined, null, '', 'existing text']) {
        const host = harness(), data = host.card().data;
        const keys = [...TEXT_FIELDS, 'first_mes'];
        for (const key of keys) if (initial !== undefined) data[key] = initial;
        data.alternate_greetings = ['keep alternate', ''];
        const files = cardFiles('fixture.png', data, []);
        for (const key of keys) {
            const relative = key === 'first_mes' ? 'message/0.md' : `${key}.md`;
            const file = files.find(item => item.path.endsWith(`/${relative}`));
            assert.ok(file, relative);
            assert.equal(file.content, initial || '');
            const edit = { ...file, originalContent: file.content, content: `filled ${key}` };
            const target = locateFile(file.path);
            assert.equal((await host.saveFile(target, edit)).content, edit.content);
            assert.equal(data[key], edit.content);
            const writes = host.writes();
            assert.equal((await host.saveFile(target, edit)).unchanged, true);
            data[key] = 'edited in host';
            await assert.rejects(host.saveFile(target, edit), { message: COPY.conflict });
            assert.equal(data[key], 'edited in host');
            assert.equal(host.writes(), writes);
        }
        assert.deepEqual(data.alternate_greetings, ['keep alternate', '']);
    }
});

// Activation warnings must not induce edits to a valid route; unchanged saves retain the warning (incorrect card changes).
test('worldbook saves and unchanged saves report missing standard activation settings', async () => {
    const host = harness();
    const target = { avatar: 'fixture.png', kind: 'world', id: 1, book: 'fixture' };
    const originalContent = projectItem(target, host.book().entries[1]);
    const content = projectItem(target, { ...host.book().entries[1], content: 'new' });
    assert.equal((await host.saveFile(target, { content, originalContent })).missingActivationConfig, true);
    const unchanged = await host.saveFile(target, { content, originalContent: content });
    assert.equal(unchanged.unchanged, true);
    assert.equal(unchanged.missingActivationConfig, true);
    let saved = content;
    for (const route of [{ key: ['港口'] }, { constant: true }, { disable: true }, { vectorized: true }]) {
        const result = await host.saveFile(target, { content: serializeItemDocument('world', { ...itemDocumentValue('world', saved), ...route }), originalContent: saved });
        assert.equal(result.missingActivationConfig, undefined, JSON.stringify(route));
        saved = (await host.saveFile(target, { content: serializeItemDocument('world', { ...itemDocumentValue('world', result.content), key: [], constant: false, disable: false, vectorized: false }), originalContent: result.content })).content;
    }
});

test('worldbook activation decorators suppress the configuration warning only when recognized by the host', async () => {
    for (const [content, warning] of [['@@activate\nAlways active', undefined], ['@@unknown\n@@@activate\nFallback', undefined],
        ['Body\n@@activate', true], ['@@@activate\nNo fallback', true], ['@@activate_extra\nUnknown', true]]) {
        const host = harness();
        const target = { avatar: 'fixture.png', kind: 'world', id: 1, book: 'fixture' };
        const result = await host.saveFile(target, { content: projectItem(target, { ...host.book().entries[1], content }), originalContent: projectItem(target, host.book().entries[1]) });
        assert.equal(result.missingActivationConfig, warning, content);
        assert.equal((await host.saveFile(target, { content: result.content, originalContent: result.content })).missingActivationConfig, warning);
    }
});

const png64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jR+8AAAAASUVORK5CYII=';
const gif64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const imageBlob = (data, type) => new Blob([Buffer.from(data, 'base64')], { type });
async function deletePath(path) {
    const name = 'Delete', args = { path };
    const { localSources } = await workspaceRepository.readWorkspace();
    const result = await workspaceRepository.commitWorkspaceMutation({ name, args,
        preconditions: buildWorkspacePreconditions(name, args, localSources),
        execute: sources => ({ result: { ok: true }, nextSources: removeLocalSourcePath(sources, path).nextSources }) });
    assert.equal(result.committed, true);
}

test('draft image survives rename and deleted source; portability, raw retention and save conflicts', async () => {
    await db.delete(); await db.open();
    try {
        const host = harness(), card = host.card(), avatar = card.avatar;
        const oldAvatar = 'old.png', oldRoot = rootFor(oldAvatar), root = rootFor(avatar);
        const taskPath = root + 'tasks/Street.md', oldTaskPath = oldRoot + 'tasks/Street.md';
        const source = 'local/art/clear.png', replacement = 'local/art/rain.gif';
        const png = imageBlob(png64, 'image/png'), gif = imageBlob(gif64, 'image/gif');
        const unrelated = { id: 'unrelated', name: 'Script', commands: '/echo unchanged', x: { author: true } };
        card.data.extensions['xiaobaix-tasks'] = { tasks: [unrelated] };
        const tasks = card.data.extensions['xiaobaix-tasks'].tasks;
        const run = createCardAssetActions({ repository: workspaceRepository, readCharacter: async () => card });
        const act = (action, fields = {}, key = 'street-clear', options) => run({ action, rootPath: root, taskPath, key, ...fields }, avatar, options);
        const snapshot = async () => (await workspaceRepository.readWorkspace()).localSources;
        const assertDeleteObserved = async (path, before, batches) => {
            assert.equal(batches.length, 1);
            const baseline = applyWorkspaceObservations(before, batches[0]);
            const args = { path };
            assert.deepEqual(findWorkspaceConflicts('Delete', args, buildWorkspacePreconditions('Delete', args, baseline), await snapshot()), []);
        };
        const observeRead = async () => {
            const batches = [];
            const current = await snapshot();
            const parent = root + 'assets';
            const before = captureWorkspacePath(current, parent).kind === 'directory'
                ? removeLocalSourcePath(current, `${parent}/`).nextSources : current;
            const result = await act('read', {}, 'street-clear', { onWorkspaceObserved: batch => batches.push(batch) });
            await assertDeleteObserved(result.images[0].path, before, batches);
            return result;
        };
        await storeFiles(cardFiles(oldAvatar, card.data, []));
        await writeWorkspaceImages([{ path: source, blob: png }, { path: replacement, blob: gif }]);
        const setBatches = [];
        const beforeFirstSet = await snapshot();
        const first = await run({ action: 'set', rootPath: oldRoot, taskPath: oldTaskPath, key: 'street-clear', sourcePath: source }, oldAvatar,
            { onWorkspaceObserved: batch => setBatches.push(batch) });
        assert.equal(host.writes(), 0);
        assert.equal(first.draft, true);
        assert.equal(first.requiresWriteback, true);
        assert.equal(first.unchanged, false);
        const pinned = await readWorkspaceImage(assetWorkspacePath(oldRoot, first.asset));
        await assertDeleteObserved(pinned.file.path, beforeFirstSet, setBatches);
        await assertDeleteObserved(oldTaskPath, beforeFirstSet, setBatches);
        await deletePath(source);
        await changeCardDirectory(oldAvatar, avatar);
        db.close(); await db.open();
        const file = async () => (await readFiles()).find(file => file.path === taskPath);
        const draft = await file(), target = { ...locateFile(taskPath), id: first.runtime.taskId };
        assert.equal(draft.originalContent, null);
        assert.equal(draft.content.includes(png64), false);
        assert.equal(draft.content.includes(oldRoot), false);
        assert.equal((await observeRead()).images[0].blobId, pinned.file.blobId);
        const receipt = await host.saveFile(target, draft);
        await storeItemReceipt(draft, receipt.content, 'tasks');
        assert.equal(tasks[1].x[ASSET_FIELD][0].base64, png64);
        assert.equal(receipt.content.includes(png64), false);
        assert.deepEqual(tasks[0], unrelated);
        assert.equal((await host.saveFile(target, await file())).unchanged, true);

        // Clean card import with no author images. List stays text-only; viewing
        // materializes saved bytes, which can be deleted again before saving.
        tasks[1].x.authorNote = { keep: true };
        await changeCardDirectory(avatar);
        await assert.rejects(readWorkspaceImageById(pinned.file.blobId));
        await storeFiles(cardFiles(avatar, JSON.parse(JSON.stringify(card.data)), []));
        const reopened = await file();
        for (const text of [reopened.content, reopened.originalContent, receipt.content]) {
            assert.deepEqual(itemDocumentValue('tasks', text).x[ASSET_FIELD], [first.asset]);
            assert.equal(text.includes(png64), false);
        }
        assert.deepEqual((await act('list')).tasks[0].assets, [first.asset]);
        const view = await observeRead();
        const restored = await readWorkspaceImageById(view.images[0].blobId);
        assert.deepEqual(new Uint8Array(await restored.arrayBuffer()), new Uint8Array(await png.arrayBuffer()));
        await deletePath(view.images[0].path);
        const changed = await act('set', { sourcePath: replacement });
        assert.equal(changed.unchanged, false);
        assert.equal(changed.runtime.taskId, first.runtime.taskId);
        assert.deepEqual((await act('list')).tasks[0].assets, [changed.asset]);
        // Refresh removes this test draft; first saved image still has no copy.
        await storeFiles([{ path: taskPath, content: projectItem(target, tasks[1]) }]);
        const rainy = await act('set', { sourcePath: replacement }, 'street-rain');
        const secondDraft = await file();
        const secondReceipt = await host.saveFile(target, secondDraft);
        await storeItemReceipt(secondDraft, secondReceipt.content, 'tasks');
        assert.deepEqual(tasks[1].x.authorNote, { keep: true });
        assert.deepEqual(tasks[1].x[ASSET_FIELD].map(entry => entry.base64), [png64, gif64]);
        assert.equal(secondReceipt.content.includes(gif64), false);
        const unchangedSet = await act('set', { sourcePath: replacement }, 'street-rain');
        const beforeRemove = host.writes();
        const removed = await act('remove', {}, 'street-rain');
        const unchangedRemove = await act('remove', {}, 'street-rain');
        assert.equal(host.writes(), beforeRemove);
        assert.equal(removed.unchanged, false);
        for (const result of [unchangedSet, removed, unchangedRemove]) {
            assert.equal(result.draft, true);
            assert.equal(result.requiresWriteback, true);
            assert.equal(result.taskPath, taskPath);
        }
        assert.equal(unchangedSet.unchanged, true);
        assert.equal(unchangedRemove.unchanged, true);
        const dirty = await file();
        const remote = { ...rainy.asset, key: 'street-clear', base64: gif64 };
        tasks[1].x[ASSET_FIELD][0] = remote;
        const writes = host.writes();
        await assert.rejects(host.saveFile(target, dirty), { message: COPY.conflict });
        assert.equal(host.writes(), writes);
        const savedRefresh = await host.readTarget(target);
        assert.equal(savedRefresh.includes(gif64), false);
        assert.deepEqual(itemDocumentValue('tasks', savedRefresh).x[ASSET_FIELD].map(asset => asset.digest), [remote.digest, rainy.asset.digest]);
        await storeFiles([{ path: taskPath, content: savedRefresh }]);
        await act('remove', {}, 'street-rain');
        await host.saveFile(target, await file());
        assert.deepEqual(tasks[1].x[ASSET_FIELD], [remote]);
        assert.deepEqual(tasks[0], unrelated);
    } finally { await db.delete(); }
});

test('an editor transaction winning during set cannot be clobbered or leave a pinned orphan', async () => {
    await db.delete(); await db.open();
    try {
        const avatar = 'editor.png', root = rootFor(avatar), taskPath = root + 'tasks/Art.md', sourcePath = 'local/art/edit.png';
        await storeFiles(cardFiles(avatar, {}, []));
        const png = imageBlob(png64, 'image/png');
        await writeWorkspaceImages([{ path: sourcePath, blob: png }]);
        const started = Promise.withResolvers(), release = Promise.withResolvers();
        const repository = { ...workspaceRepository, readWorkspaceImage: async path => {
            const result = await readWorkspaceImage(path); started.resolve(); await release.promise; return result;
        } };
        const run = createCardAssetActions({ repository });
        const setting = run({ action: 'set', rootPath: root, taskPath, key: 'scene', sourcePath }, avatar);
        await started.promise;
        const human = serializeItemDocument('tasks', { id: 'editor', name: 'Art', commands: '/echo keep editor' });
        await storeFiles([{ path: taskPath, content: human }]);
        release.resolve();
        await assert.rejects(setting, { message: 'workspace_conflict' });
        const owned = assetWorkspacePath(root, await summarizeAssetBlob('scene', png));
        await assert.rejects(readWorkspaceImage(owned), { message: 'local_file_not_found' });
        assert.equal((await readFiles()).find(file => file.path === taskPath).content, human);
    } finally { await db.delete(); }
});

test('writing other keys preserves damaged card bytes, and only explicit replacement or removal drops them', async () => {
    const host = harness(), data = host.card().data, id = 'art', target = { avatar: 'fixture.png', kind: 'tasks', root: rootFor('fixture.png'), id };
    const good = { ...await summarizeAssetBlob('good', imageBlob(png64, 'image/png')), base64: png64 };
    const damaged = { ...good, key: 'bad', base64: 'broken=!payload' }, noKey = { base64: 'private-data' };
    const tasks = [{ id, name: id, commands: assetCommands(id), x: { [ASSET_FIELD]: [noKey, damaged, good] } }];
    data.extensions['xiaobaix-tasks'] = { tasks };
    const originalContent = projectItem(target, tasks[0]);
    assert.ok(!originalContent.includes(noKey.base64) && !originalContent.includes(damaged.base64));
    const draft = itemDocumentValue('tasks', originalContent);
    const refs = draft.x[ASSET_FIELD];
    refs.splice(2, 1);
    let saved = await host.saveFile(target, { originalContent, content: serializeItemDocument('tasks', draft) });
    assert.deepEqual(tasks[0].x[ASSET_FIELD], [noKey, damaged]);
    const current = itemDocumentValue('tasks', saved.content);
    current.x[ASSET_FIELD].splice(0, 1);
    const other = { ...damaged, base64: 'someone-else-edited' };
    tasks[0].x[ASSET_FIELD][1] = other;
    await assert.rejects(host.saveFile(target, { originalContent: saved.content, content: serializeItemDocument('tasks', current) }), { message: COPY.conflict });
    tasks[0].x[ASSET_FIELD][1] = damaged;
    saved = await host.saveFile(target, { originalContent: saved.content, content: serializeItemDocument('tasks', current) });
    assert.deepEqual(tasks[0].x[ASSET_FIELD], [damaged]);
    const replacement = { ...good }; delete replacement.base64; replacement.key = 'bad';
    current.x[ASSET_FIELD] = [replacement];
    const compiled = await compileAssetTask(target, tasks[0], current, async () => ({ blob: imageBlob(png64, 'image/png') }));
    assert.deepEqual(compiled.x[ASSET_FIELD], [{ ...good, key: 'bad' }]);
});

// A player must still see the healthy pictures on both sides of a damaged record.
test('exported card isolates damaged image entries and identifies each without disclosing its bytes', async () => {
    const id = 'mixed-art', good = { ...await summarizeAssetBlob('portrait', imageBlob(png64, 'image/png')), base64: png64 };
    const invalid = { ...good, key: 'broken', base64: 'private-invalid!bytes' };
    const assets = [good, null, invalid, { ...good, key: 'background' }];
    const task = { id, commands: assetCommands(id), x: { [ASSET_FIELD]: assets } };
    const card = JSON.parse(JSON.stringify({ data: { extensions: { 'xiaobaix-tasks': { tasks: [task] } } } }));
    const window = new EventTarget(), warnings = [];
    let dispose;
    const saved = card.data.extensions['xiaobaix-tasks'].tasks[0];
    runInNewContext(saved.commands.split('\n').slice(1, -1).join('\n'), {
        SillyTavern: { getContext: () => ({ characters: [card], characterId: 0 }) }, window, URL, Blob, atob, CustomEvent,
        onCleanup: callback => { dispose = callback; }, console: { warn: (...args) => warnings.push(args) },
    });
    try {
        const api = window.LittleWhiteBoxCardAssets[id];
        for (const key of ['portrait', 'broken', 'background', 'broken']) {
            const url = api.url(key);
            if (key === 'broken') assert.equal(url, undefined);
            else assert.deepEqual(Buffer.from(await (await fetch(url)).arrayBuffer()), Buffer.from(png64, 'base64'));
        }
        const locations = warnings.map(([, location]) => location).filter(location => location?.taskId === id);
        assert.ok(locations.some(location => location.position === 2));
        assert.equal(locations.filter(location => location.key === 'broken').length, 1);
        assert.ok(!JSON.stringify(warnings).includes(invalid.base64));
        assert.deepEqual(saved.x[ASSET_FIELD], assets);
    } finally { dispose(); }
});

test('documented condition renderer restores visuals and the exported loader revokes only its own URLs', async () => {
    const id = 'street-scenes', runtime = assetRuntime(id), events = [], cleanup = [], made = [], revoked = [];
    const entry = async (key, base64, mime) => ({ ...await summarizeAssetBlob(key, imageBlob(base64, mime)), base64 });
    const assets = [await entry('street-clear', png64, 'image/png'), await entry('street-rain', gif64, 'image/gif')];
    const characters = [null, { data: { extensions: { 'xiaobaix-tasks': { tasks: [{ id: 'wrong-task' }, { id, x: { [ASSET_FIELD]: assets } }] } } } }];
    let state = '{"weather":"clear"}';
    const SillyTavern = { getContext: () => ({ characters, characterId: 1, variables: { local: { get: key => key === 'travel' ? state : null } } }) };
    const window = { SillyTavern, dispatchEvent: event => events.push(event) };
    const URLApi = { createObjectURL(blob) { made.push(blob); return `blob:fixture-${made.length}`; }, revokeObjectURL: value => revoked.push(value) };
    const start = () => runInNewContext(`(() => { ${assetCommands(id).split('\n').slice(1, -1).join('\n')} })()`,
        { SillyTavern, window, URL: URLApi, Blob, atob, CustomEvent, onCleanup: fn => cleanup.push(fn) });
    const doc = readFileSync(new URL('./skill/frontend/portable-images.md', import.meta.url), 'utf8');
    const render = runInNewContext(doc.match(/```js\r?\n([\s\S]*?)```/)[1] + '\nrender');
    const image = { setAttribute: (name, value) => { image[name] = value; }, removeAttribute: name => { delete image[name]; } };
    const api = () => runInNewContext(runtime.reference, { window });
    render(window, image);
    assert.equal(image.hidden, true);
    start();
    const first = api();
    assert.equal(events[0].type, runtime.readyEvent);
    assert.equal(events[0].detail.taskId, id);
    assert.equal(made.length, 0);
    assert.equal(first.get('street-clear').size, assets[0].size);
    assert.equal(first.get('street-clear').base64, undefined);
    render(window, image);
    const clear = image.src;
    state = { weather: 'rain' }; render(window, image);
    const rain = image.src;
    assert.notEqual(clear, rain);
    state = '{"weather":"clear"}'; render(window, image);
    assert.equal(image.src, clear);
    assert.equal(made.length, 2);
    assert.equal(made[1].type, 'image/gif');
    start();
    const second = api();
    cleanup[0]();
    assert.equal(api(), second);
    assert.equal(first.url('street-clear'), undefined);
    assert.deepEqual(revoked, [clear, rain]);
    render(window, image);
    const reentered = image.src;
    assert.notEqual(reentered, clear);
    cleanup[1]();
    assert.deepEqual(revoked, [clear, rain, reentered]);
    assert.equal(api(), undefined);
    render(window, image);
    assert.equal(image.src, undefined);
    assert.equal(image.hidden, true);
});
