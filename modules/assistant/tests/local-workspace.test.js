import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDiffRows } from '../app-src/local-workspace-diff.js';
import { buildWorkspaceTree, collectDirectoryExpansionKeys } from '../app-src/local-workspace-tree.js';
import {
    createLocalSourcesManager,
    normalizeLocalSources,
    summarizeLocalSources,
} from '../app-src/local-sources.js';

function createSources() {
    return normalizeLocalSources([
        {
            sourceId: 'source-a',
            label: 'alpha',
            files: [
                {
                    path: 'local/alpha/src/a.js',
                    relativePath: 'src/a.js',
                    name: 'a.js',
                    content: 'console.log(1);',
                    originalContent: 'console.log(1);',
                },
                {
                    path: 'local/alpha/src/b.js',
                    relativePath: 'src/b.js',
                    name: 'b.js',
                    content: 'console.log(2);',
                    originalContent: 'console.log(old);',
                },
                {
                    path: 'local/alpha/README.md',
                    relativePath: 'README.md',
                    name: 'README.md',
                    content: '# alpha',
                    originalContent: '# alpha',
                },
            ],
        },
        {
            sourceId: 'source-b',
            label: 'beta',
            files: [
                {
                    path: 'local/beta/index.js',
                    relativePath: 'index.js',
                    name: 'index.js',
                    content: 'export default 1;',
                    originalContent: null,
                },
            ],
        },
    ]);
}

function isModifiedFile(file) {
    if (!file) return false;
    if (file.originalContent === null) return true;
    return String(file.content || '') !== String(file.originalContent || '');
}

async function withMockWindow(overrides, fn) {
    const previousWindow = globalThis.window;
    globalThis.window = {
        setTimeout,
        clearTimeout,
        prompt: () => null,
        confirm: () => false,
        ...overrides,
    };
    try {
        return await fn();
    } finally {
        globalThis.window = previousWindow;
    }
}

test('normalizeLocalSources preserves originalContent variants', () => {
    const sources = normalizeLocalSources([
        {
            sourceId: 'x',
            label: 'x',
            files: [
                {
                    path: 'local/x/a.js',
                    relativePath: 'a.js',
                    name: 'a.js',
                    content: 'A',
                },
                {
                    path: 'local/x/b.js',
                    relativePath: 'b.js',
                    name: 'b.js',
                    content: 'B',
                    originalContent: null,
                },
                {
                    path: 'local/x/c.js',
                    relativePath: 'c.js',
                    name: 'c.js',
                    content: 'C',
                    originalContent: 'OLD',
                },
            ],
        },
    ]);

    assert.equal(sources[0].files[0].originalContent, 'A');
    assert.equal(sources[0].files[1].originalContent, null);
    assert.equal(sources[0].files[2].originalContent, 'OLD');
});

test('summarizeLocalSources counts modified files', () => {
    const summary = summarizeLocalSources(createSources());
    assert.equal(summary.sourceCount, 2);
    assert.equal(summary.fileCount, 4);
    assert.equal(summary.modifiedFileCount, 2);
});

test('local sources manager exposes workspace summary and opens first modified file', () => {
    const state = {
        localSources: createSources(),
        isWorkspaceOpen: false,
        selectedSourceId: 'all',
        selectedFilePath: '',
        selectedTreePath: '',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        treeExpandedKeys: [],
        workspaceWidth: 520,
    };
    let persistCalls = 0;
    let renderCalls = 0;

    const manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: () => {},
        render: () => {
            renderCalls += 1;
        },
        persistSession: () => {
            persistCalls += 1;
            return { ok: true };
        },
        post: () => {},
    });

    const summary = manager.getWorkspaceSummary();
    assert.equal(summary.sourceCount, 2);
    assert.equal(summary.fileCount, 4);
    assert.equal(summary.modifiedFileCount, 2);

    const opened = manager.openFirstModifiedFile();
    assert.equal(opened, true);
    assert.equal(state.isWorkspaceOpen, true);
    assert.equal(state.selectedFilePath, 'local/alpha/src/b.js');
    assert.equal(state.selectedTreePath, 'local/alpha/src/b.js');
    assert.equal(state.selectedSourceId, 'source-a');
    assert.equal(state.viewerMode, 'diff');
    assert.equal(renderCalls, 1);
    assert.equal(persistCalls, 1);
});

test('local sources manager opens directory paths inside workspace', () => {
    const state = {
        localSources: createSources(),
        isWorkspaceOpen: false,
        selectedSourceId: 'all',
        selectedFilePath: '',
        selectedTreePath: '',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        treeExpandedKeys: [],
        workspaceWidth: 520,
    };

    const manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: () => {},
        render: () => {},
        persistSession: () => ({ ok: true }),
        post: () => {},
    });

    const opened = manager.openWorkspace('local/alpha/src/');
    assert.equal(opened, true);
    assert.equal(state.isWorkspaceOpen, true);
    assert.equal(state.selectedSourceId, 'source-a');
    assert.equal(state.selectedFilePath, 'local/alpha/src/a.js');
    assert.equal(state.selectedTreePath, 'local/alpha/src/');
    assert(state.treeExpandedKeys.includes('source:source-a'));
    assert(state.treeExpandedKeys.includes('source:source-a/dir:src'));
});

test('local sources manager can create a new file from workspace actions', async () => {
    const state = {
        localSources: createSources(),
        isWorkspaceOpen: true,
        selectedSourceId: 'source-a',
        selectedFilePath: 'local/alpha/src/a.js',
        selectedTreePath: 'local/alpha/src/',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        treeExpandedKeys: [],
        workspaceWidth: 520,
    };

    const manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: () => {},
        render: () => {},
        persistSession: () => ({ ok: true }),
        post: () => {},
    });

    await withMockWindow({
        prompt: () => 'local/alpha/src/new-file.txt',
    }, async () => {
        const created = await manager.createLocalFileAt('local/alpha/src/');
        assert.equal(created, true);
    });

    const createdFile = state.localSources
        .find((source) => source.label === 'alpha')
        ?.files.find((file) => file.path === 'local/alpha/src/new-file.txt');
    assert(createdFile);
    assert.equal(createdFile.originalContent, null);
    assert.equal(state.selectedFilePath, 'local/alpha/src/new-file.txt');
    assert.equal(state.viewerMode, 'diff');
});

test('local sources manager can rename a directory from workspace actions', async () => {
    const state = {
        localSources: createSources(),
        isWorkspaceOpen: true,
        selectedSourceId: 'source-a',
        selectedFilePath: 'local/alpha/src/a.js',
        selectedTreePath: 'local/alpha/src/',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        treeExpandedKeys: [],
        workspaceWidth: 520,
    };

    const manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: () => {},
        render: () => {},
        persistSession: () => ({ ok: true }),
        post: () => {},
    });

    await withMockWindow({
        prompt: () => 'local/alpha/app/',
    }, async () => {
        const renamed = await manager.renameLocalPath('local/alpha/src/');
        assert.equal(renamed, true);
    });

    const alphaSource = state.localSources.find((source) => source.label === 'alpha');
    assert(alphaSource.files.some((file) => file.path === 'local/alpha/app/a.js'));
    assert(alphaSource.files.some((file) => file.path === 'local/alpha/app/b.js'));
    assert.equal(state.selectedTreePath, 'local/alpha/app/');
});

test('local sources manager can delete a directory from workspace actions', async () => {
    const state = {
        localSources: createSources(),
        isWorkspaceOpen: true,
        selectedSourceId: 'source-a',
        selectedFilePath: 'local/alpha/src/a.js',
        selectedTreePath: 'local/alpha/src/',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        treeExpandedKeys: [],
        workspaceWidth: 520,
    };

    const manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: () => {},
        render: () => {},
        persistSession: () => ({ ok: true }),
        post: () => {},
    });

    await withMockWindow({
        confirm: () => true,
    }, async () => {
        const deleted = await manager.deleteLocalPath('local/alpha/src/');
        assert.equal(deleted, true);
    });

    const alphaSource = state.localSources.find((source) => source.label === 'alpha');
    assert(alphaSource);
    assert.deepEqual(alphaSource.files.map((file) => file.path), ['local/alpha/README.md']);
});

test('buildWorkspaceTree returns sorted tree for all sources', () => {
    const tree = buildWorkspaceTree(createSources(), {
        selectedSourceId: 'all',
        searchQuery: '',
        modifiedOnly: false,
        isModifiedFile,
    });

    assert.equal(tree.nodes.length, 2);
    assert.equal(tree.nodes[0].label, 'alpha');
    assert.equal(tree.nodes[1].label, 'beta');
    assert.deepEqual(
        tree.nodes[0].children.map((node) => `${node.type}:${node.label}`),
        ['dir:src', 'file:README.md'],
    );
    assert.equal(tree.visiblePaths.length, 4);
});

test('buildWorkspaceTree supports source filter, search and modifiedOnly', () => {
    const sources = createSources();

    const sourceFiltered = buildWorkspaceTree(sources, {
        selectedSourceId: 'source-a',
        searchQuery: '',
        modifiedOnly: false,
        isModifiedFile,
    });
    assert.deepEqual(sourceFiltered.nodes.map((node) => node.label), ['src', 'README.md']);

    const searched = buildWorkspaceTree(sources, {
        selectedSourceId: 'all',
        searchQuery: 'b.js',
        modifiedOnly: false,
        isModifiedFile,
    });
    assert.equal(searched.visiblePaths.length, 1);
    assert.equal(searched.visiblePaths[0], 'local/alpha/src/b.js');

    const modifiedOnly = buildWorkspaceTree(sources, {
        selectedSourceId: 'all',
        searchQuery: '',
        modifiedOnly: true,
        isModifiedFile,
    });
    assert.deepEqual(
        modifiedOnly.visiblePaths.sort(),
        ['local/alpha/src/b.js', 'local/beta/index.js'],
    );
});

test('collectDirectoryExpansionKeys walks nested directories', () => {
    const tree = buildWorkspaceTree(createSources(), {
        selectedSourceId: 'all',
        searchQuery: '',
        modifiedOnly: false,
        isModifiedFile,
    });
    const keys = Array.from(collectDirectoryExpansionKeys(tree.nodes)).sort();
    assert(keys.includes('source:source-a'));
    assert(keys.includes('source:source-a/dir:src'));
    assert(keys.includes('source:source-b'));
});

test('buildDiffRows handles unchanged, add, remove and mixed rows', () => {
    assert.deepEqual(
        buildDiffRows('a', 'a'),
        [{ kind: 'context', leftLineNumber: 1, rightLineNumber: 1, text: 'a' }],
    );

    const addRows = buildDiffRows('a', 'a\nb');
    assert.equal(addRows.at(-1)?.kind, 'add');
    assert.equal(addRows.at(-1)?.text, 'b');

    const removeRows = buildDiffRows('a\nb', 'a');
    assert.equal(removeRows.at(-1)?.kind, 'remove');
    assert.equal(removeRows.at(-1)?.text, 'b');

    const mixedRows = buildDiffRows('one\ntwo\nthree', 'one\nTHREE');
    assert(mixedRows.some((row) => row.kind === 'remove' && row.text === 'two'));
    assert(mixedRows.some((row) => row.kind === 'remove' && row.text === 'three'));
    assert(mixedRows.some((row) => row.kind === 'add' && row.text === 'THREE'));
});

test('buildDiffRows degrades gracefully for large files', () => {
    const left = Array.from({ length: 600 }, (_, index) => `before-${index + 1}`).join('\n');
    const right = Array.from({ length: 600 }, (_, index) => `after-${index + 1}`).join('\n');
    const rows = buildDiffRows(left, right);

    assert.equal(rows[0]?.kind, 'context');
    assert.match(rows[0]?.text || '', /Diff 已降级显示/);
    assert(rows.some((row) => row.kind === 'remove'));
    assert(rows.some((row) => row.kind === 'add'));
    assert.match(rows.at(-1)?.text || '', /其余内容已省略/);
});
