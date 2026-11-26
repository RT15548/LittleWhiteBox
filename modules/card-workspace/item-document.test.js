import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import Dexie from '../../libs/dexie.mjs';
import { migrateCardDocuments } from './migrations/named-documents.js';
import { flattenLocalSourceFiles, upsertLocalSourceFile } from '../assistant/shared/local-workspace-kernel.js';
import { cardFiles, locateFile } from './files.js';
import { cardFileDirectory } from './display.js';
import { serializeItemDocument, parseItemDocument, itemDocumentValue, resolveItemTarget, itemDocumentPath } from './item-document.js';
import { readableCardWorkspacePath, storedCardWorkspacePath } from './paths.js';
import { itemEditorProjection } from './editor.js';
import { COPY } from './copy.js';
import { createLocalSourcesManager } from '../assistant/app-src/workspace/local-sources.js';

// Acceptance: authors can copy a complete worldbook example without adding missing delimiters.
// Execute the documented file as input; prose and formatting outside the file are not asserted.
test('complete worldbook examples are accepted verbatim and preserve their saved fields', async () => {
    const document = await readFile(new URL('./skill/references/prompt-organization.md', import.meta.url), 'utf8');
    const examples = [...document.matchAll(/```markdown\r?\n([\s\S]*?)```/g)].map(match => match[1]);
    assert.ok(examples.length > 0);
    for (const content of examples) {
        const parsed = parseItemDocument('world', content);
        const saved = itemDocumentValue('world', content);
        assert.equal(saved.uid, parsed.id);
        assert.equal(saved.comment, parsed.name);
        assert.equal(saved.content, parsed.body);
        assert.ok(saved.content.trim());
        for (const [key, value] of Object.entries(parsed.settings)) assert.deepEqual(saved[key], value);
        assert.deepEqual(itemDocumentValue('world', serializeItemDocument('world', saved)), saved);
    }
});

// Acceptance: one named document per item preserves body, settings and identity,
// including same-name items and separators (wrong-target writes / lost data).
test('named documents round-trip full items and keep duplicate names independently addressable', () => {
    const names = ['港口/规则', '港口/规则', 'a%20b', 'a b', 'a..b', 'x\\y', '换行\n名称', '😀'];
    const entries = names.map((comment, uid) => ({ uid, comment, key: ['港口'], content: `---\n正文 ${uid}\n`, x: { keep: true } }));
    const files = cardFiles('测试.png', {}, [['世界/书', { entries: Object.fromEntries(entries.map(item => [item.uid, item])) }]])
        .filter(file => locateFile(file.path)?.kind === 'world');
    assert.equal(files.length, entries.length);
    assert.equal(new Set(files.map(file => file.path)).size, files.length);
    assert.deepEqual(cardFileDirectory(files).map(file => file.name), names.map(name => name.trim()));
    for (const file of files) {
        assert.equal(storedCardWorkspacePath(readableCardWorkspacePath(file.path)), file.path);
        const target = resolveItemTarget(locateFile(file.path), file);
        assert.deepEqual(itemDocumentValue('world', file.content), entries[target.id]);
        const modified = serializeItemDocument('world', { ...entries[target.id], uid: target.id + 100 });
        assert.throws(() => resolveItemTarget(target, { content: modified, originalContent: file.content }), { message: COPY.identity });
    }
});

// Acceptance: v3 -> v4 keeps saved baselines and unsaved drafts through reopen,
// including incomplete JSON; the two old files become one (lost author work).
test('database upgrade combines split drafts once and preserves unfinished settings verbatim', async () => {
    const name = 'named-documents-upgrade', old = new Dexie(name);
    old.version(3).stores({ workspace: 'id' });
    await old.open();
    const root = 'local/cards/fixture.png/';
    let sources = [];
    const add = (path, content, originalContent = content) => { sources = upsertLocalSourceFile(sources, root + path, content, { originalContent }).nextSources; };
    add('world_book/book/31.json', '{"comment":"交易规则","constant":true}', '{"comment":"交易规则","constant":false}');
    add('world_book/book/31.md', 'edited body\n---\n', 'saved body');
    add('tasks/init.json', '{"name":"初始化",', '{"name":"初始化","interval":1}');
    add('tasks/init.js', 'unfinished(', 'saved()');
    add('description.md', 'unrelated draft', 'original');
    await old.table('workspace').put({ id: 'main', localSources: sources, selectedFilePath: root + 'world_book/book/31.md' });
    old.close();
    const upgraded = new Dexie(name);
    upgraded.version(3).stores({ workspace: 'id' });
    upgraded.version(4).stores({ workspace: 'id' }).upgrade(migrateCardDocuments);
    try {
        await upgraded.open();
        const workspace = await upgraded.table('workspace').get('main'), files = flattenLocalSourceFiles(workspace.localSources);
        assert.equal(files.length, 3);
        const world = files.find(file => locateFile(file.path)?.kind === 'world');
        assert.equal(workspace.selectedFilePath, world.path);
        assert.equal(parseItemDocument('world', world.content).body, 'edited body\n---\n');
        assert.equal(parseItemDocument('world', world.originalContent).body, 'saved body');
        assert.equal(parseItemDocument('world', world.content).settings.constant, true);
        assert.equal(parseItemDocument('world', world.originalContent).settings.constant, false);
        const task = files.find(file => locateFile(file.path)?.kind === 'tasks');
        assert.ok(task.content.includes('{"name":"初始化",'));
        assert.ok(task.content.endsWith('unfinished('));
        assert.equal(parseItemDocument('tasks', task.originalContent).body, 'saved()');
        assert.throws(() => parseItemDocument('tasks', task.content));
        upgraded.close(); await upgraded.open();
        assert.deepEqual(await upgraded.table('workspace').get('main'), workspace);
    } finally { await upgraded.delete(); }
});

// Acceptance: switching body/settings and selecting text must operate on the
// same full document without changing the other part or misquoting it to AI.
test('editor projections preserve the other part and map selection to the full document', t => {
    const previousWindow = globalThis.window;
    globalThis.window = { setTimeout: () => 0 };
    t.after(() => { if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow; });
    const file = { path: itemDocumentPath('local/cards/a.png/tasks/', '每日任务'), content: serializeItemDocument('tasks', { id: 'day', name: '每日任务', interval: 1, commands: 'line 1\nline 2' }) };
    const state = { localSources: upsertLocalSourceFile([], file.path, file.content).nextSources, selectedFilePath: file.path, viewerMode: 'current' };
    let editorOptions;
    const manager = createLocalSourcesManager({ state, persistWorkspaceUiState: () => {}, renderWorkspaceUi: (_container, options) => { editorOptions = options; } });
    for (const mode of ['settings', 'source', 'current']) {
        manager.renderWorkspace({});
        editorOptions.onSetViewerMode(mode);
        manager.ensureWorkspaceSelection();
        assert.equal(state.viewerMode, mode);
    }
    const body = itemEditorProjection(file, 'current');
    file.content = body.update('changed\nline 2');
    const settings = itemEditorProjection(file, 'settings');
    file.content = settings.update(settings.value.replace('"interval": 1', '"interval": 3'));
    assert.equal(parseItemDocument('tasks', file.content).body, 'changed\nline 2');
    assert.equal(parseItemDocument('tasks', file.content).settings.interval, 3);
    for (const mode of ['current', 'settings']) {
        const projection = itemEditorProjection(file, mode);
        const selection = projection.selection({ value: projection.value, selectionStart: 0, selectionEnd: 5, lineStart: 1, lineEnd: 1 });
        assert.equal(selection.value.slice(selection.selectionStart, selection.selectionEnd), projection.value.slice(0, 5));
    }
    file.content = itemEditorProjection(file, 'settings').update('{ unfinished');
    assert.equal(itemEditorProjection(file, 'current').value, 'changed\nline 2');
    assert.throws(() => parseItemDocument('tasks', file.content));
});
