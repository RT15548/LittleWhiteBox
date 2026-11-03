import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDiffRows } from '../app-src/workspace/local-workspace-diff.js';
import { buildWorkspaceTree, collectDirectoryExpansionKeys } from '../app-src/workspace/local-workspace-tree.js';
import {
    buildLocalSourcesArchiveEntries,
    createLocalSourcesManager,
    normalizeLocalSources,
    summarizeLocalSources,
} from '../app-src/workspace/local-sources.js';
import {
    moveLocalPathInSources,
    removeLocalPathFromSources,
    upsertLocalDirectoryInSources,
    upsertLocalFileInSources,
} from '../shared/local-workspace-kernel.js';

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

function ensureWorkspaceRuntime(state, version = 0) {
    state.runtime = state.runtime && typeof state.runtime === 'object' ? state.runtime : {};
    state.runtime.workspace = {
        version: Number.isFinite(Number(state.runtime.workspace?.version))
            ? Number(state.runtime.workspace.version)
            : version,
        kernelVersion: '2026.04.24-v3',
    };
}

function applyHostMutationToSources(localSources, name, args = {}) {
    if (name === 'Write') {
        return upsertLocalFileInSources(localSources, args.path, args.content).nextSources;
    }
    if (name === 'CreateDirectory') {
        return upsertLocalDirectoryInSources(localSources, args.path).nextSources;
    }
    if (name === 'Move') {
        return moveLocalPathInSources(localSources, args.fromPath, args.toPath, {
            overwrite: !!args.overwrite,
        }).nextSources;
    }
    if (name === 'Delete') {
        return removeLocalPathFromSources(localSources, args.path).nextSources;
    }
    if (name === 'BatchWriteFiles') {
        return (Array.isArray(args.files) ? args.files : []).reduce((nextSources, entry) => (
            upsertLocalFileInSources(nextSources, entry.path, entry.content).nextSources
        ), localSources);
    }
    return null;
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
    assert.equal(state.selectedSourceId, 'all');
    assert.equal(state.viewerMode, 'diff');
    assert.equal(renderCalls, 1);
    assert.equal(persistCalls, 1);
});

test('local sources manager notifies workspace selection changes when switching files', () => {
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
    let selectionChangeCalls = 0;

    const manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: () => {},
        render: () => {},
        renderWorkspaceOnly: () => {},
        persistSession: () => ({ ok: true }),
        onWorkspaceSelectionChanged: () => {
            selectionChangeCalls += 1;
        },
        post: () => {},
    });

    const opened = manager.openWorkspace('local/alpha/src/a.js');
    assert.equal(opened, true);
    assert.equal(selectionChangeCalls, 1);
    assert.equal(state.selectedFilePath, 'local/alpha/src/a.js');
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
    assert.equal(state.selectedSourceId, 'all');
    assert.equal(state.selectedFilePath, '');
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
    ensureWorkspaceRuntime(state);
    let manager = null;

    manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: () => {},
        render: () => {},
        persistSession: () => ({ ok: true }),
        callHostTool: async (name, args) => {
            const nextSources = applyHostMutationToSources(state.localSources, name, args);
            if (nextSources) {
                await manager.applyExternalLocalSources(nextSources);
            }
            return {
                ok: true,
                workspaceVersion: state.runtime.workspace.version + 1,
            };
        },
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

test('local sources manager creates a new file next to the selected file by default', async () => {
    const state = {
        localSources: createSources(),
        isWorkspaceOpen: true,
        selectedSourceId: 'all',
        selectedFilePath: 'local/alpha/src/a.js',
        selectedTreePath: 'local/alpha/src/a.js',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        treeExpandedKeys: [],
        workspaceWidth: 520,
    };
    ensureWorkspaceRuntime(state);
    let promptDefault = '';
    let manager = null;

    manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: () => {},
        render: () => {},
        persistSession: () => ({ ok: true }),
        callHostTool: async (name, args) => {
            const nextSources = applyHostMutationToSources(state.localSources, name, args);
            if (nextSources) {
                await manager.applyExternalLocalSources(nextSources);
            }
            return {
                ok: true,
                workspaceVersion: state.runtime.workspace.version + 1,
            };
        },
    });

    await withMockWindow({
        prompt: (_message, defaultValue) => {
            promptDefault = String(defaultValue || '');
            return 'local/alpha/src/created-next-to-file.txt';
        },
    }, async () => {
        const created = await manager.createLocalFileAt('local/alpha/src/a.js');
        assert.equal(created, true);
    });

    assert.equal(promptDefault, 'alpha/src/new-file.txt');
    assert.equal(state.selectedFilePath, 'local/alpha/src/created-next-to-file.txt');
});

test('local sources manager can create a new file directly under local root', async () => {
    const state = {
        localSources: [],
        isWorkspaceOpen: true,
        selectedSourceId: 'all',
        selectedFilePath: '',
        selectedTreePath: '',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        treeExpandedKeys: [],
        workspaceWidth: 520,
    };
    ensureWorkspaceRuntime(state);
    let manager = null;

    manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: () => {},
        render: () => {},
        persistSession: () => ({ ok: true }),
        callHostTool: async (name, args) => {
            const nextSources = applyHostMutationToSources(state.localSources, name, args);
            if (nextSources) {
                await manager.applyExternalLocalSources(nextSources);
            }
            return {
                ok: true,
                workspaceVersion: state.runtime.workspace.version + 1,
            };
        },
    });

    let promptDefault = '';
    await withMockWindow({
        prompt: (_message, defaultValue) => {
            promptDefault = String(defaultValue || '');
            return 'workspace_test.txt';
        },
    }, async () => {
        const created = await manager.createLocalFileAt('local/');
        assert.equal(created, true);
    });

    assert.equal(promptDefault, 'new-file.txt');
    assert.equal(state.localSources.length, 1);
    assert.equal(state.localSources[0].rootPath, 'local/');
    assert.equal(state.localSources[0].files[0].path, 'local/workspace_test.txt');
    assert.equal(state.localSources[0].files[0].relativePath, 'workspace_test.txt');
    assert.equal(state.selectedFilePath, 'local/workspace_test.txt');
    assert.equal(state.viewerMode, 'diff');
});

test('buildWorkspaceTree flattens local root children into the visible root', () => {
    const sources = normalizeLocalSources([
        {
            sourceId: 'root',
            label: 'local',
            rootPath: 'local/',
            files: [
                {
                    path: 'local/a.txt',
                    relativePath: 'a.txt',
                    name: 'a.txt',
                    content: 'A',
                    originalContent: 'A',
                },
                {
                    path: 'local/new-file.txt',
                    relativePath: 'new-file.txt',
                    name: 'new-file.txt',
                    content: 'B',
                    originalContent: 'B',
                },
                {
                    path: 'local/test/demo.txt',
                    relativePath: 'test/demo.txt',
                    name: 'demo.txt',
                    content: 'C',
                    originalContent: 'C',
                },
            ],
        },
    ]);

    const tree = buildWorkspaceTree(sources, { isModifiedFile });
    assert.deepEqual(tree.nodes.map((node) => node.label), ['test', 'a.txt', 'new-file.txt']);
    assert.equal(tree.nodes[0].type, 'dir');
    assert.equal(tree.nodes[1].type, 'file');
    assert.equal(tree.nodes[2].type, 'file');
});

test('buildLocalSourcesArchiveEntries preserves real workspace paths in zip entries', () => {
    const sources = normalizeLocalSources([
        {
            sourceId: 'root',
            label: 'local',
            rootPath: 'local/',
            directories: ['docs'],
            files: [
                {
                    path: 'local/a.txt',
                    relativePath: 'a.txt',
                    name: 'a.txt',
                    content: 'A',
                    originalContent: 'A',
                },
            ],
        },
        {
            sourceId: 'alpha',
            label: 'alpha',
            rootPath: 'local/alpha/',
            directories: ['src'],
            files: [
                {
                    path: 'local/alpha/src/index.js',
                    relativePath: 'src/index.js',
                    name: 'index.js',
                    content: 'export default 1;',
                    originalContent: 'export default 1;',
                },
            ],
        },
    ]);

    const entries = buildLocalSourcesArchiveEntries(sources);
    assert.deepEqual(
        Object.keys(entries).sort(),
        [
            'local/a.txt',
            'local/alpha/src/',
            'local/alpha/src/index.js',
            'local/docs/',
        ],
    );
});

test('local sources manager can update workspace file content through host mutations', async () => {
    await withMockWindow({}, async () => {
        const state = {
            localSources: createSources(),
            isWorkspaceOpen: true,
            selectedSourceId: 'all',
            selectedFilePath: 'local/alpha/src/a.js',
            selectedTreePath: 'local/alpha/src/a.js',
            fileSearchQuery: '',
            showModifiedOnly: false,
            viewerMode: 'current',
            treeExpandedKeys: [],
            workspaceWidth: 520,
        };
        ensureWorkspaceRuntime(state);
        let manager = null;

        manager = createLocalSourcesManager({
            state,
            createRequestId: () => 'req-test',
            showToast: () => {},
            render: () => {},
            persistSession: () => ({ ok: true }),
            callHostTool: async (name, args) => {
                const nextSources = applyHostMutationToSources(state.localSources, name, args);
                if (nextSources) {
                    await manager.applyExternalLocalSources(nextSources);
                }
                return {
                    ok: true,
                    workspaceVersion: state.runtime.workspace.version + 1,
                };
            },
        });

        const updated = manager.updateLocalFileContent('local/alpha/src/a.js', 'console.log("edited")\n', { flush: true, render: false });
        assert.equal(updated, true);
        await manager.flushPendingWorkspaceChanges();

        const alphaSource = state.localSources.find((source) => source.label === 'alpha');
        const file = alphaSource?.files.find((item) => item.path === 'local/alpha/src/a.js');
        assert(file);
        assert.equal(file.content, 'console.log("edited")\n');
        assert.equal(file.originalContent, 'console.log(1);');
    });
});

test('local sources manager reports persist failures for authoritative editor updates', async () => {
    await withMockWindow({}, async () => {
        const toasts = [];
        const state = {
            localSources: createSources(),
            isWorkspaceOpen: true,
            selectedSourceId: 'all',
            selectedFilePath: 'local/alpha/src/a.js',
            selectedTreePath: 'local/alpha/src/a.js',
            fileSearchQuery: '',
            showModifiedOnly: false,
            viewerMode: 'current',
            treeExpandedKeys: [],
            workspaceWidth: 520,
        };
        ensureWorkspaceRuntime(state);
        let manager = null;

        manager = createLocalSourcesManager({
            state,
            createRequestId: () => 'req-test',
            showToast: (message) => {
                toasts.push(String(message || ''));
            },
            render: () => {},
            persistSession: async () => ({ ok: false, error: 'save_failed' }),
            callHostTool: async (name, args) => {
                const nextSources = applyHostMutationToSources(state.localSources, name, args);
                if (nextSources) {
                    await manager.applyExternalLocalSources(nextSources);
                }
                return {
                    ok: true,
                    workspaceVersion: state.runtime.workspace.version + 1,
                };
            },
        });

        const updated = manager.updateLocalFileContent('local/alpha/src/a.js', 'console.log("edited")\n', { flush: true, render: false });
        assert.equal(updated, true);
        await new Promise((resolve) => setTimeout(resolve, 0));
        assert.equal(toasts.length, 1);
        assert.match(toasts[0], /save_failed/);
    });
});

test('local sources manager skips full rerender for authoritative updates while the current editor is actively typing', async () => {
    await withMockWindow({}, async () => {
        let renderCalls = 0;
        let persistCalls = 0;
        const state = {
            localSources: createSources(),
            isWorkspaceOpen: true,
            selectedSourceId: 'all',
            selectedFilePath: 'local/alpha/src/a.js',
            selectedTreePath: 'local/alpha/src/a.js',
            fileSearchQuery: '',
            showModifiedOnly: false,
            viewerMode: 'current',
            treeExpandedKeys: [],
            workspaceWidth: 520,
        };
        ensureWorkspaceRuntime(state);

        const manager = createLocalSourcesManager({
            state,
            createRequestId: () => 'req-test',
            showToast: () => {},
            render: () => {
                renderCalls += 1;
            },
            persistSession: async () => {
                persistCalls += 1;
                return { ok: true };
            },
            callHostTool: async () => ({ ok: true }),
        });

        const updated = manager.updateLocalFileContent('local/alpha/src/a.js', 'console.log("ime safe")\n', { flush: false, render: false });
        assert.equal(updated, true);

        const nextSources = applyHostMutationToSources(state.localSources, 'Write', {
            path: 'local/alpha/src/a.js',
            content: 'console.log("ime safe")\n',
        });
        await manager.applyExternalLocalSources(nextSources);

        assert.equal(renderCalls, 0);
        assert.equal(persistCalls, 1);
        const syncedFile = state.localSources
            .flatMap((source) => source.files || [])
            .find((file) => file.path === 'local/alpha/src/a.js');
        assert(syncedFile);
        assert.equal(syncedFile.content, 'console.log("ime safe")\n');
    });
});

test('local sources manager flushes pending editor changes before closing workspace', async () => {
    await withMockWindow({}, async () => {
        let persistCalls = 0;
        const calls = [];
        const state = {
            localSources: createSources(),
            isWorkspaceOpen: true,
            selectedSourceId: 'all',
            selectedFilePath: 'local/alpha/src/a.js',
            selectedTreePath: 'local/alpha/src/a.js',
            fileSearchQuery: '',
            showModifiedOnly: false,
            viewerMode: 'current',
            treeExpandedKeys: [],
            workspaceWidth: 520,
        };
        ensureWorkspaceRuntime(state);
        let manager = null;

        manager = createLocalSourcesManager({
            state,
            createRequestId: () => 'req-test',
            showToast: () => {},
            render: () => {},
            persistSession: async () => {
                persistCalls += 1;
                return { ok: true };
            },
            callHostTool: async (name, args, options = {}) => {
                calls.push({ name, args, options });
                const nextSources = applyHostMutationToSources(state.localSources, name, args);
                if (nextSources) {
                    await manager.applyExternalLocalSources(nextSources);
                }
                return {
                    ok: true,
                    workspaceVersion: state.runtime.workspace.version + 1,
                };
            },
        });

        const updated = manager.updateLocalFileContent('local/alpha/src/a.js', 'console.log("edited")\n', { flush: false, render: false });
        assert.equal(updated, true);
        manager.closeWorkspace();

        await new Promise((resolve) => setTimeout(resolve, 0));

        assert.equal(persistCalls >= 1, true);
        assert.equal(state.isWorkspaceOpen, false);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].name, 'Write');
        const syncedFile = state.localSources
            .flatMap((source) => source.files || [])
            .find((file) => file.path === 'local/alpha/src/a.js');
        assert(syncedFile);
        assert.equal(syncedFile.content, 'console.log("edited")\n');
    });
});

test('local sources manager exposes flushPendingWorkspaceChanges for pending editor updates', async () => {
    await withMockWindow({}, async () => {
        let persistCalls = 0;
        const calls = [];
        const state = {
            localSources: createSources(),
            isWorkspaceOpen: true,
            selectedSourceId: 'all',
            selectedFilePath: 'local/alpha/src/a.js',
            selectedTreePath: 'local/alpha/src/a.js',
            fileSearchQuery: '',
            showModifiedOnly: false,
            viewerMode: 'current',
            treeExpandedKeys: [],
            workspaceWidth: 520,
        };
        ensureWorkspaceRuntime(state);
        let manager = null;

        manager = createLocalSourcesManager({
            state,
            createRequestId: () => 'req-test',
            showToast: () => {},
            render: () => {},
            persistSession: async () => {
                persistCalls += 1;
                return { ok: true };
            },
            callHostTool: async (name, args, options = {}) => {
                calls.push({ name, args, options });
                const nextSources = applyHostMutationToSources(state.localSources, name, args);
                if (nextSources) {
                    await manager.applyExternalLocalSources(nextSources);
                }
                return {
                    ok: true,
                    workspaceVersion: state.runtime.workspace.version + 1,
                };
            },
        });

        const updated = manager.updateLocalFileContent('local/alpha/src/a.js', 'console.log("edited twice")\n', { flush: false, render: false });
        assert.equal(updated, true);

        const flushed = await manager.flushPendingWorkspaceChanges();
        assert.equal(flushed, true);
        assert.equal(persistCalls, 1);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].name, 'Write');
        const syncedFile = state.localSources
            .flatMap((source) => source.files || [])
            .find((file) => file.path === 'local/alpha/src/a.js');
        assert(syncedFile);
        assert.equal(syncedFile.content, 'console.log("edited twice")\n');
    });
});

test('local sources manager can create an empty directory inside workspace', async () => {
    const state = {
        localSources: createSources(),
        isWorkspaceOpen: true,
        selectedSourceId: 'all',
        selectedFilePath: '',
        selectedTreePath: 'local/alpha/',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        treeExpandedKeys: [],
        workspaceWidth: 520,
    };
    ensureWorkspaceRuntime(state);
    let manager = null;

    manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: () => {},
        render: () => {},
        persistSession: () => ({ ok: true }),
        callHostTool: async (name, args) => {
            const nextSources = applyHostMutationToSources(state.localSources, name, args);
            if (nextSources) {
                await manager.applyExternalLocalSources(nextSources);
            }
            return {
                ok: true,
                workspaceVersion: state.runtime.workspace.version + 1,
            };
        },
    });

    await withMockWindow({
        prompt: () => 'local/alpha/docs/api/',
    }, async () => {
        const created = await manager.createLocalDirectoryAt('local/alpha/');
        assert.equal(created, true);
    });

    const alphaSource = state.localSources.find((source) => source.label === 'alpha');
    assert(alphaSource);
    assert(alphaSource.directories.includes('docs'));
    assert(alphaSource.directories.includes('docs/api'));
    assert.equal(state.selectedTreePath, 'local/alpha/docs/api/');
    assert.equal(state.selectedSourceId, 'all');
});

test('local sources manager creates a new directory next to the selected file by default', async () => {
    const state = {
        localSources: createSources(),
        runtime: {
            workspace: {
                version: 5,
                kernelVersion: '2026.04.24-v3',
            },
        },
        isWorkspaceOpen: true,
        selectedSourceId: 'all',
        selectedFilePath: 'local/alpha/src/a.js',
        selectedTreePath: 'local/alpha/src/a.js',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        treeExpandedKeys: [],
        workspaceWidth: 520,
    };
    let promptDefault = '';
    let manager = null;

    manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: () => {},
        render: () => {},
        persistSession: () => ({ ok: true }),
        callHostTool: async (name, args) => {
            const nextSources = applyHostMutationToSources(state.localSources, name, args);
            if (nextSources) {
                await manager.applyExternalLocalSources(nextSources);
            }
            return {
                ok: true,
                workspaceVersion: state.runtime.workspace.version + 1,
            };
        },
    });

    await withMockWindow({
        prompt: (_message, defaultValue) => {
            promptDefault = String(defaultValue || '');
            return 'local/alpha/src/new-folder/';
        },
    }, async () => {
        const created = await manager.createLocalDirectoryAt('local/alpha/src/a.js');
        assert.equal(created, true);
    });

    assert.equal(promptDefault, 'alpha/src/new-folder/');
    assert.equal(state.selectedTreePath, 'local/alpha/src/new-folder/');
});

test('local sources manager falls back to local directory apply when host create directory succeeds without an update push', async () => {
    const state = {
        localSources: createSources(),
        runtime: {
            workspace: {
                version: 5,
                kernelVersion: '2026.04.24-v3',
            },
        },
        isWorkspaceOpen: true,
        selectedSourceId: 'all',
        selectedFilePath: '',
        selectedTreePath: 'local/alpha/',
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
        callHostTool: async () => ({
            ok: true,
            workspaceVersion: state.runtime.workspace.version + 1,
        }),
    });

    await withMockWindow({
        prompt: () => 'local/alpha/docs/api/',
    }, async () => {
        const created = await manager.createLocalDirectoryAt('local/alpha/');
        assert.equal(created, true);
    });

    const alphaSource = state.localSources.find((source) => source.label === 'alpha');
    assert(alphaSource);
    assert(alphaSource.directories.includes('docs'));
    assert(alphaSource.directories.includes('docs/api'));
    assert.equal(state.selectedTreePath, 'local/alpha/docs/api/');
});

test('local sources manager surfaces host create directory errors', async () => {
    const toasts = [];
    const state = {
        localSources: createSources(),
        runtime: {
            workspace: {
                version: 5,
                kernelVersion: '2026.04.24-v3',
            },
        },
        isWorkspaceOpen: true,
        selectedSourceId: 'all',
        selectedFilePath: '',
        selectedTreePath: 'local/alpha/',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        treeExpandedKeys: [],
        workspaceWidth: 520,
    };

    const manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: (message) => {
            toasts.push(String(message || ''));
        },
        render: () => {},
        persistSession: () => ({ ok: true }),
        callHostTool: async () => {
            throw new Error('workspace_create_directory_failed');
        },
    });

    await withMockWindow({
        prompt: () => 'local/alpha/docs/api/',
    }, async () => {
        const created = await manager.createLocalDirectoryAt('local/alpha/');
        assert.equal(created, false);
    });

    assert.equal(toasts.includes('新建目录失败：workspace_create_directory_failed'), true);
});

test('local sources manager removes workspace root through host tool', async () => {
    const calls = [];
    const state = {
        localSources: createSources(),
        runtime: {
            workspace: {
                version: 3,
                kernelVersion: '2026.04.24-v3',
            },
        },
        isWorkspaceOpen: true,
        selectedSourceId: 'all',
        selectedFilePath: 'local/alpha/src/a.js',
        selectedTreePath: 'local/alpha/',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        treeExpandedKeys: [],
        workspaceWidth: 520,
    };
    const toasts = [];

    const manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: (message) => {
            toasts.push(String(message || ''));
        },
        render: () => {},
        persistSession: () => ({ ok: true }),
        post: () => {},
        callHostTool: async (name, args, options = {}) => {
            calls.push({ name, args, options });
            return { ok: true, workspaceVersion: 4 };
        },
    });

    await manager.removeLocalSource('source-a');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, 'Delete');
    assert.deepEqual(calls[0].args, { path: 'local/alpha/' });
    assert.equal(calls[0].options.workspaceMeta.path, 'local/alpha/');
    assert.equal(toasts.includes('已移除工作区根'), true);
});

test('local sources manager imports files through host writes', async () => {
    await withMockWindow({}, async () => {
        const calls = [];
        const state = {
            localSources: [],
            runtime: {
                workspace: {
                    version: 5,
                    kernelVersion: '2026.04.24-v3',
                },
            },
            isWorkspaceOpen: true,
            selectedSourceId: 'all',
            selectedFilePath: '',
            selectedTreePath: 'local/',
            fileSearchQuery: '',
            showModifiedOnly: false,
            viewerMode: 'current',
            treeExpandedKeys: [],
            workspaceWidth: 520,
        };

        const manager = createLocalSourcesManager({
            state,
            createRequestId: (() => {
                let counter = 0;
                return () => `req-${++counter}`;
            })(),
            showToast: () => {},
            setImportProgress: () => {},
            render: () => {},
            persistSession: () => ({ ok: true }),
            post: () => {},
            callHostTool: async (name, args, options = {}) => {
                calls.push({ name, args, options });
                return { ok: true, workspaceVersion: 6 };
            },
        });

        const imported = await manager.appendLocalSourceFiles([{
            name: 'hello.js',
            size: 18,
            webkitRelativePath: 'demo/hello.js',
            text: async () => 'console.log("hi")\n',
        }], { mode: 'directory' });

        assert.equal(imported, true);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].name, 'BatchWriteFiles');
        assert.deepEqual(calls[0].args, {
            files: [{
                path: 'local/demo/hello.js',
                content: 'console.log("hi")\n',
            }],
        });
    });
});

test('local sources manager batches multi-file imports into one host mutation', async () => {
    await withMockWindow({}, async () => {
        const calls = [];
        const state = {
            localSources: [],
            runtime: {
                workspace: {
                    version: 5,
                    kernelVersion: '2026.04.24-v3',
                },
            },
            isWorkspaceOpen: true,
            selectedSourceId: 'all',
            selectedFilePath: '',
            selectedTreePath: 'local/',
            fileSearchQuery: '',
            showModifiedOnly: false,
            viewerMode: 'current',
            treeExpandedKeys: [],
            workspaceWidth: 520,
        };

        const manager = createLocalSourcesManager({
            state,
            createRequestId: (() => {
                let counter = 0;
                return () => `req-${++counter}`;
            })(),
            showToast: () => {},
            setImportProgress: () => {},
            render: () => {},
            persistSession: () => ({ ok: true }),
            post: () => {},
            callHostTool: async (name, args, options = {}) => {
                calls.push({ name, args, options });
                return { ok: true, workspaceVersion: 6 };
            },
        });

        const imported = await manager.appendLocalSourceFiles([
            {
                name: 'a.js',
                size: 4,
                webkitRelativePath: 'demo/a.js',
                text: async () => 'A();',
            },
            {
                name: 'b.md',
                size: 5,
                webkitRelativePath: 'demo/docs/b.md',
                text: async () => '# B\n',
            },
        ], { mode: 'directory' });

        assert.equal(imported, true);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].name, 'BatchWriteFiles');
        assert.deepEqual(calls[0].args, {
            files: [
                {
                    path: 'local/demo/a.js',
                    content: 'A();',
                },
                {
                    path: 'local/demo/docs/b.md',
                    content: '# B\n',
                },
            ],
        });
    });
});

test('local sources manager reports clear failure from host mutation', async () => {
    const toasts = [];
    const state = {
        localSources: createSources(),
        runtime: {
            workspace: {
                version: 5,
                kernelVersion: '2026.04.24-v3',
            },
        },
        isWorkspaceOpen: true,
        selectedSourceId: 'all',
        selectedFilePath: 'local/alpha/src/a.js',
        selectedTreePath: 'local/alpha/src/a.js',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        treeExpandedKeys: [],
        workspaceWidth: 520,
    };

    const manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: (message) => {
            toasts.push(String(message || ''));
        },
        render: () => {},
        persistSession: () => ({ ok: true }),
        post: () => {},
        callHostTool: async () => ({ ok: false, error: 'workspace_delete_failed' }),
    });

    await withMockWindow({
        confirm: () => true,
    }, async () => {
        const cleared = await manager.clearLocalSources();
        assert.equal(cleared, false);
    });
    assert.equal(state.localSources.length > 0, true);
    assert.equal(toasts.includes('清空失败：workspace_delete_failed'), true);
});

test('clearLocalSources clears the workspace after confirmation and shows success feedback', async () => {
    const toasts = [];
    const state = {
        localSources: createSources(),
        runtime: {
            workspace: {
                version: 5,
                kernelVersion: '2026.04.24-v3',
            },
        },
        isWorkspaceOpen: true,
        selectedSourceId: 'all',
        selectedFilePath: 'local/alpha/src/a.js',
        selectedTreePath: 'local/alpha/src/a.js',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        treeExpandedKeys: [],
        workspaceWidth: 520,
    };
    let manager = null;

    manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: (message) => {
            toasts.push(String(message || ''));
        },
        render: () => {},
        persistSession: () => ({ ok: true }),
        post: () => {},
        callHostTool: async (name, args) => {
            const nextSources = applyHostMutationToSources(state.localSources, name, args);
            if (nextSources) {
                await manager.applyExternalLocalSources(nextSources);
            }
            return {
                ok: true,
                workspaceVersion: state.runtime.workspace.version + 1,
            };
        },
    });

    await withMockWindow({
        confirm: () => true,
    }, async () => {
        const cleared = await manager.clearLocalSources();
        assert.equal(cleared, true);
    });

    assert.equal(state.localSources.length, 0);
    assert.equal(state.selectedFilePath, '');
    assert.equal(state.selectedTreePath, 'local/');
    assert.equal(toasts.includes('已清空工作区'), true);
});

test('clearLocalSources falls back to an empty workspace when host delete succeeds without an update push', async () => {
    const toasts = [];
    const state = {
        localSources: createSources(),
        runtime: {
            workspace: {
                version: 5,
                kernelVersion: '2026.04.24-v3',
            },
        },
        isWorkspaceOpen: true,
        selectedSourceId: 'all',
        selectedFilePath: 'local/alpha/src/a.js',
        selectedTreePath: 'local/alpha/src/a.js',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        treeExpandedKeys: [],
        workspaceWidth: 520,
    };

    const manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: (message) => {
            toasts.push(String(message || ''));
        },
        render: () => {},
        persistSession: () => ({ ok: true }),
        post: () => {},
        callHostTool: async () => ({
            ok: true,
            workspaceVersion: state.runtime.workspace.version + 1,
        }),
    });

    await withMockWindow({
        confirm: () => true,
    }, async () => {
        const cleared = await manager.clearLocalSources();
        assert.equal(cleared, true);
    });

    assert.equal(state.localSources.length, 0);
    assert.equal(state.selectedFilePath, '');
    assert.equal(state.selectedTreePath, 'local/');
    assert.equal(toasts.includes('已清空工作区'), true);
});

test('clearLocalSources surfaces rejected host delete calls', async () => {
    const toasts = [];
    const state = {
        localSources: createSources(),
        runtime: {
            workspace: {
                version: 5,
                kernelVersion: '2026.04.24-v3',
            },
        },
        isWorkspaceOpen: true,
        selectedSourceId: 'all',
        selectedFilePath: 'local/alpha/src/a.js',
        selectedTreePath: 'local/alpha/src/a.js',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        treeExpandedKeys: [],
        workspaceWidth: 520,
    };

    const manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: (message) => {
            toasts.push(String(message || ''));
        },
        render: () => {},
        persistSession: () => ({ ok: true }),
        post: () => {},
        callHostTool: async () => {
            throw new Error('workspace_delete_failed');
        },
    });

    await withMockWindow({
        confirm: () => true,
    }, async () => {
        const cleared = await manager.clearLocalSources();
        assert.equal(cleared, false);
    });

    assert.equal(state.localSources.length > 0, true);
    assert.equal(toasts.includes('清空失败：workspace_delete_failed'), true);
});

test('flushPendingWorkspaceChanges returns false when host write fails', async () => {
    await withMockWindow({}, async () => {
        const toasts = [];
        const state = {
            localSources: createSources(),
            runtime: {
                workspace: {
                    version: 5,
                    kernelVersion: '2026.04.24-v3',
                },
            },
            isWorkspaceOpen: true,
            selectedSourceId: 'all',
            selectedFilePath: 'local/alpha/src/a.js',
            selectedTreePath: 'local/alpha/src/a.js',
            fileSearchQuery: '',
            showModifiedOnly: false,
            viewerMode: 'current',
            treeExpandedKeys: [],
            workspaceWidth: 520,
        };

        const manager = createLocalSourcesManager({
            state,
            createRequestId: () => 'req-test',
            showToast: (message) => {
                toasts.push(String(message || ''));
            },
            render: () => {},
            persistSession: async () => ({ ok: true }),
            post: () => {},
            callHostTool: async () => ({ ok: false, error: 'workspace_write_failed' }),
        });

        const updated = manager.updateLocalFileContent('local/alpha/src/a.js', 'console.log("broken")\n', {
            flush: false,
            render: false,
        });
        assert.equal(updated, true);

        const flushed = await manager.flushPendingWorkspaceChanges();
        assert.equal(flushed, false);
        assert.equal(toasts.includes('保存失败：workspace_write_failed'), true);
    });
});

test('beforeunload posts pending workspace writes through the host mutation pipeline', async () => {
    await withMockWindow({}, async () => {
        const posts = [];
        const state = {
            localSources: createSources(),
            workspaceDrafts: {},
            runtime: {
                workspace: {
                    version: 5,
                    kernelVersion: '2026.04.24-v3',
                },
            },
            isWorkspaceOpen: true,
            selectedSourceId: 'all',
            selectedFilePath: 'local/alpha/src/a.js',
            selectedTreePath: 'local/alpha/src/a.js',
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
            persistSession: async () => ({ ok: true }),
            callHostTool: async () => ({ ok: true, workspaceVersion: 6 }),
            postHostToolCallWithoutResponse: (name, args, options = {}) => {
                posts.push({ name, args, options });
            },
        });

        const updated = manager.updateLocalFileContent('local/alpha/src/a.js', 'console.log("unload")\n', {
            flush: false,
            render: false,
        });
        assert.equal(updated, true);

        const posted = manager.postPendingWorkspaceWritesForUnload();
        assert.equal(posted, true);
        assert.equal(posts.length, 1);
        assert.equal(posts[0].name, 'BatchWriteFiles');
        assert.deepEqual(posts[0].args, {
            files: [
                {
                    path: 'local/alpha/src/a.js',
                    content: 'console.log("unload")\n',
                },
            ],
        });
        assert.equal(posts[0].options.workspaceMeta.source, 'editor');
    });
});

test('applyExternalLocalSources prunes drafts and pending writes for removed paths', async () => {
    await withMockWindow({}, async () => {
        const calls = [];
        const state = {
            localSources: createSources(),
            workspaceDrafts: {},
            runtime: {
                workspace: {
                    version: 5,
                    kernelVersion: '2026.04.24-v3',
                },
            },
            isWorkspaceOpen: true,
            selectedSourceId: 'all',
            selectedFilePath: 'local/beta/index.js',
            selectedTreePath: 'local/beta/index.js',
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
            persistSession: async () => ({ ok: true }),
            post: () => {},
            callHostTool: async (name, args) => {
                calls.push({ name, args });
                return { ok: true, workspaceVersion: 6 };
            },
        });

        const updated = manager.updateLocalFileContent('local/beta/index.js', 'queued change\n', {
            flush: false,
            render: false,
        });
        assert.equal(updated, true);

        await manager.applyExternalLocalSources(normalizeLocalSources([
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
                ],
            },
        ]));

        await new Promise((resolve) => setTimeout(resolve, 30));

        assert.equal(state.workspaceDrafts['local/beta/index.js'], undefined);
        assert.equal(calls.length, 0);
    });
});

test('local sources manager can open the local root directory', () => {
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
    }

    const manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: () => {},
        render: () => {},
        persistSession: () => ({ ok: true }),
        post: () => {},
    });

    const opened = manager.openWorkspace('local/');
    assert.equal(opened, true);
    assert.equal(state.isWorkspaceOpen, true);
    assert.equal(state.selectedTreePath, 'local/');
    assert.equal(state.selectedFilePath, '');
    assert(state.treeExpandedKeys.includes('source:source-a'));
    assert(state.treeExpandedKeys.includes('source:source-b'));
});

test('local sources manager tracks mobile workspace pane for file and tree navigation', () => {
    const state = {
        localSources: createSources(),
        isWorkspaceOpen: true,
        selectedSourceId: 'all',
        selectedFilePath: '',
        selectedTreePath: 'local/',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        mobileWorkspacePane: 'tree',
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

    const openedFile = manager.openWorkspace('local/alpha/src/a.js');
    assert.equal(openedFile, true);
    assert.equal(state.mobileWorkspacePane, 'viewer');

    const openedDir = manager.openWorkspace('local/alpha/');
    assert.equal(openedDir, true);
    assert.equal(state.mobileWorkspacePane, 'tree');

    manager.setMobileWorkspacePane('viewer', { render: false, persist: false });
    assert.equal(state.mobileWorkspacePane, 'viewer');
    manager.setMobileWorkspacePane('tree', { render: false, persist: false });
    assert.equal(state.mobileWorkspacePane, 'tree');
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
    ensureWorkspaceRuntime(state);
    let manager = null;

    manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: () => {},
        render: () => {},
        persistSession: () => ({ ok: true }),
        callHostTool: async (name, args) => {
            const nextSources = applyHostMutationToSources(state.localSources, name, args);
            if (nextSources) {
                await manager.applyExternalLocalSources(nextSources);
            }
            return {
                ok: true,
                workspaceVersion: state.runtime.workspace.version + 1,
            };
        },
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

test('local sources manager rejects moving a directory onto an existing directory', async () => {
    const toasts = [];
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
    ensureWorkspaceRuntime(state);

    const manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: (message) => {
            toasts.push(String(message || ''));
        },
        render: () => {},
        persistSession: () => ({ ok: true }),
        callHostTool: async () => ({ ok: false, error: 'local_destination_exists' }),
    });

    await withMockWindow({
        prompt: () => 'local/beta/',
    }, async () => {
        const renamed = await manager.renameLocalPath('local/alpha/src/');
        assert.equal(renamed, false);
    });

    const alphaSource = state.localSources.find((source) => source.label === 'alpha');
    assert(alphaSource?.files.some((file) => file.path === 'local/alpha/src/a.js'));
    assert(alphaSource?.files.some((file) => file.path === 'local/alpha/src/b.js'));
    assert.equal(toasts.includes('目标路径已存在，请换一个路径'), true);
});

test('local sources manager rejects moving a directory onto an existing file path', async () => {
    const toasts = [];
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
    ensureWorkspaceRuntime(state);

    const manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: (message) => {
            toasts.push(String(message || ''));
        },
        render: () => {},
        persistSession: () => ({ ok: true }),
        callHostTool: async () => ({ ok: false, error: 'local_destination_exists' }),
    });

    await withMockWindow({
        prompt: () => 'local/beta/index.js',
    }, async () => {
        const renamed = await manager.renameLocalPath('local/alpha/src/');
        assert.equal(renamed, false);
    });

    const alphaSource = state.localSources.find((source) => source.label === 'alpha');
    const betaSource = state.localSources.find((source) => source.label === 'beta');
    assert(alphaSource?.files.some((file) => file.path === 'local/alpha/src/a.js'));
    assert(alphaSource?.files.some((file) => file.path === 'local/alpha/src/b.js'));
    assert(betaSource?.files.some((file) => file.path === 'local/beta/index.js'));
    assert.equal(toasts.includes('目标路径已存在，请换一个路径'), true);
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
    ensureWorkspaceRuntime(state);
    let manager = null;

    manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: () => {},
        render: () => {},
        persistSession: () => ({ ok: true }),
        callHostTool: async (name, args) => {
            const nextSources = applyHostMutationToSources(state.localSources, name, args);
            if (nextSources) {
                await manager.applyExternalLocalSources(nextSources);
            }
            return {
                ok: true,
                workspaceVersion: state.runtime.workspace.version + 1,
            };
        },
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
    assert.equal(alphaSource.directories.includes('src'), false);
});

test('local sources manager removes a workspace root directory completely', async () => {
    const state = {
        localSources: normalizeLocalSources([
            {
                sourceId: 'source-a',
                label: 'alpha',
                rootPath: 'local/alpha/',
                files: [
                    {
                        path: 'local/alpha/src/a.js',
                        relativePath: 'src/a.js',
                        name: 'a.js',
                        content: 'console.log(1);',
                        originalContent: 'console.log(1);',
                    },
                ],
                directories: ['src', 'src/nested', 'empty-only'],
            },
            {
                sourceId: 'source-b',
                label: 'beta',
                rootPath: 'local/beta/',
                files: [
                    {
                        path: 'local/beta/index.js',
                        relativePath: 'index.js',
                        name: 'index.js',
                        content: 'export default 1;',
                        originalContent: 'export default 1;',
                    },
                ],
            },
        ]),
        isWorkspaceOpen: true,
        selectedSourceId: 'all',
        selectedFilePath: 'local/alpha/src/a.js',
        selectedTreePath: 'local/alpha/',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        treeExpandedKeys: [],
        workspaceWidth: 520,
    };
    ensureWorkspaceRuntime(state);
    let manager = null;

    manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: () => {},
        render: () => {},
        persistSession: () => ({ ok: true }),
        callHostTool: async (name, args) => {
            const nextSources = applyHostMutationToSources(state.localSources, name, args);
            if (nextSources) {
                await manager.applyExternalLocalSources(nextSources);
            }
            return {
                ok: true,
                workspaceVersion: state.runtime.workspace.version + 1,
            };
        },
    });

    await withMockWindow({
        confirm: () => true,
    }, async () => {
        const deleted = await manager.deleteLocalPath('local/alpha/');
        assert.equal(deleted, true);
    });

    assert.equal(state.localSources.some((source) => source.rootPath === 'local/alpha/'), false);
    assert.equal(state.localSources.some((source) => source.rootPath === 'local/beta/'), true);
});

test('local sources manager move removes source directory shells', async () => {
    const state = {
        localSources: normalizeLocalSources([
            {
                sourceId: 'source-a',
                label: 'alpha',
                rootPath: 'local/alpha/',
                files: [
                    {
                        path: 'local/alpha/src/nested/a.js',
                        relativePath: 'src/nested/a.js',
                        name: 'a.js',
                        content: 'console.log(1);',
                        originalContent: 'console.log(1);',
                    },
                    {
                        path: 'local/alpha/README.md',
                        relativePath: 'README.md',
                        name: 'README.md',
                        content: '# alpha',
                        originalContent: '# alpha',
                    },
                ],
                directories: ['src', 'src/nested', 'src/empty-leaf'],
            },
        ]),
        isWorkspaceOpen: true,
        selectedSourceId: 'all',
        selectedFilePath: 'local/alpha/src/nested/a.js',
        selectedTreePath: 'local/alpha/src/',
        fileSearchQuery: '',
        showModifiedOnly: false,
        viewerMode: 'current',
        treeExpandedKeys: [],
        workspaceWidth: 520,
    };
    ensureWorkspaceRuntime(state);
    let manager = null;

    manager = createLocalSourcesManager({
        state,
        createRequestId: () => 'req-test',
        showToast: () => {},
        render: () => {},
        persistSession: () => ({ ok: true }),
        callHostTool: async (name, args) => {
            const nextSources = applyHostMutationToSources(state.localSources, name, args);
            if (nextSources) {
                await manager.applyExternalLocalSources(nextSources);
            }
            return {
                ok: true,
                workspaceVersion: state.runtime.workspace.version + 1,
            };
        },
    });

    await withMockWindow({
        prompt: () => 'local/alpha/app/',
    }, async () => {
        const renamed = await manager.renameLocalPath('local/alpha/src/');
        assert.equal(renamed, true);
    });

    const alphaSource = state.localSources.find((source) => source.rootPath === 'local/alpha/');
    assert(alphaSource);
    assert.equal(alphaSource.directories.includes('src'), false);
    assert.equal(alphaSource.directories.includes('src/nested'), false);
    assert.equal(alphaSource.directories.includes('src/empty-leaf'), false);
    assert.equal(alphaSource.directories.includes('app'), true);
    assert.equal(alphaSource.directories.includes('app/nested'), true);
    assert.equal(alphaSource.directories.includes('app/empty-leaf'), true);
});

test('moveLocalPathInSources moves a file into an existing directory', () => {
    const sources = normalizeLocalSources([{
        sourceId: 'source-a',
        label: 'alpha',
        rootPath: 'local/alpha/',
        files: [
            {
                path: 'local/alpha/from.txt',
                relativePath: 'from.txt',
                name: 'from.txt',
                content: 'FROM',
                originalContent: 'FROM',
            },
            {
                path: 'local/alpha/target/existing.txt',
                relativePath: 'target/existing.txt',
                name: 'existing.txt',
                content: 'EXISTING',
                originalContent: 'EXISTING',
            },
        ],
        directories: ['target'],
    }]);

    const movedToSlashPath = moveLocalPathInSources(sources, 'local/alpha/from.txt', 'local/alpha/target/');
    assert.equal(movedToSlashPath.mode, 'file');
    assert.equal(movedToSlashPath.fromPath, 'local/alpha/from.txt');
    assert.equal(movedToSlashPath.toPath, 'local/alpha/target/from.txt');
    assert.equal(movedToSlashPath.movedFiles.length, 1);
    assert.equal(movedToSlashPath.movedFiles[0]?.path, 'local/alpha/target/from.txt');

    const movedToBareDirectory = moveLocalPathInSources(sources, 'local/alpha/from.txt', 'local/alpha/target');
    assert.equal(movedToBareDirectory.toPath, 'local/alpha/target/from.txt');
    assert.equal(movedToBareDirectory.movedFiles[0]?.path, 'local/alpha/target/from.txt');
});

test('moveLocalPathInSources treats file and directory self-moves as no-op', () => {
    const sources = createSources();

    const fileMove = moveLocalPathInSources(sources, 'local/alpha/src/a.js', 'local/alpha/src/a.js');
    assert.equal(fileMove.noOp, true);
    assert.equal(fileMove.mode, 'file');
    assert.equal(fileMove.movedFiles.length, 0);
    assert.deepEqual(fileMove.nextSources, sources);

    const dirMove = moveLocalPathInSources(sources, 'local/alpha/src/', 'local/alpha/src/');
    assert.equal(dirMove.noOp, true);
    assert.equal(dirMove.mode, 'directory');
    assert.equal(dirMove.movedFiles.length, 0);
    assert.equal(dirMove.fromPath, 'local/alpha/src/');
    assert.equal(dirMove.toPath, 'local/alpha/src/');
    assert.deepEqual(dirMove.nextSources, sources);
});

test('moveLocalPathInSources reports missing source path with source-specific error', () => {
    assert.throws(
        () => moveLocalPathInSources(createSources(), 'local/alpha/missing.txt', 'local/alpha/next.txt'),
        /local_source_not_found/,
    );
});

test('upsert local paths reject parents blocked by files with explicit error', () => {
    const sources = normalizeLocalSources([{
        sourceId: 'source-a',
        label: 'alpha',
        rootPath: 'local/alpha/',
        files: [
            {
                path: 'local/alpha/blocked.txt',
                relativePath: 'blocked.txt',
                name: 'blocked.txt',
                content: 'BLOCK',
                originalContent: 'BLOCK',
            },
        ],
    }]);

    assert.throws(
        () => upsertLocalFileInSources(sources, 'local/alpha/blocked.txt/child.txt', 'CHILD'),
        /local_parent_path_blocked/,
    );
    assert.throws(
        () => upsertLocalDirectoryInSources(sources, 'local/alpha/blocked.txt/child/'),
        /local_parent_path_blocked/,
    );
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
    assert.deepEqual(sourceFiltered.nodes.map((node) => node.label), ['alpha']);
    assert.deepEqual(
        sourceFiltered.nodes[0].children.map((node) => `${node.type}:${node.label}`),
        ['dir:src', 'file:README.md'],
    );

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
