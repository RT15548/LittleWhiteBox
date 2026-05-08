import test from 'node:test';
import assert from 'node:assert/strict';

import { parseApplyPatch } from '../shared/apply-patch.js';
import { runPatchValidationAndApply } from '../shared/apply-patch-execution.js';
import { normalizeLocalDirectoryPath } from '../shared/local-workspace-kernel.js';
import { createLocalSourcesToolRuntime } from '../shared/local-sources-tool-runtime.js';
import { INTERNAL_WORKSPACE_TOOL_NAMES } from '../shared/workspace-protocol.js';

function createState(files = {}) {
    return Object.entries(files).map(([path, content]) => ({
        publicPath: path,
        content,
        originalContent: content,
    })).sort((left, right) => left.publicPath.localeCompare(right.publicPath, 'en'));
}

function cloneState(state = []) {
    return state.map((file) => ({ ...file }));
}

function normalizeTestPath(rawPath = '') {
    const normalized = String(rawPath || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
    if (!normalized.startsWith('local/') || normalized.endsWith('/') || normalized.includes('..')) return '';
    return normalized;
}

function getPathError(rawPath = '') {
    return normalizeTestPath(rawPath) ? '' : 'local_path_required';
}

function findFile(state = [], publicPath = '') {
    return cloneState(state).find((file) => file.publicPath === publicPath) || null;
}

function writeFile(state = [], publicPath = '', content = '') {
    const normalizedPath = normalizeTestPath(publicPath);
    if (!normalizedPath) {
        throw new Error(getPathError(publicPath));
    }
    const nextFile = {
        publicPath: normalizedPath,
        content: String(content || ''),
        originalContent: findFile(state, normalizedPath)?.originalContent ?? null,
    };
    const withoutExisting = cloneState(state).filter((file) => file.publicPath !== normalizedPath);
    withoutExisting.push(nextFile);
    withoutExisting.sort((left, right) => left.publicPath.localeCompare(right.publicPath, 'en'));
    return {
        nextState: withoutExisting,
        file: nextFile,
    };
}

function createAdapter() {
    return {
        cloneState,
        normalizePath: normalizeTestPath,
        getPathError,
        findFile,
        addFile: writeFile,
        removeFile: () => {
            throw new Error('not_implemented');
        },
        moveFile: () => {
            throw new Error('not_implemented');
        },
        writeFile,
    };
}

function createDeferred() {
    let resolve = null;
    let reject = null;
    const promise = new Promise((nextResolve, nextReject) => {
        resolve = nextResolve;
        reject = nextReject;
    });
    return { promise, resolve, reject };
}

test('local sources tool runtime keeps write apply_patch and read on the same host snapshot', async () => {
    let currentState = createState({});
    const runtime = createLocalSourcesToolRuntime({
        getLocalSources: () => currentState,
        setLocalSources: (nextSources) => {
            currentState = cloneState(nextSources);
        },
        normalizeLocalSourcesSnapshot: cloneState,
        executeToolCall: async (name, args, options = {}) => {
            if (name === 'Write') {
                const update = writeFile(options.localSources, args.path, args.content);
                options.onLocalSourcesUpdated?.(update.nextState);
                return {
                    ok: true,
                    path: update.file.publicPath,
                    mode: 'create',
                };
            }

            if (name === 'apply_patch') {
                const parsed = parseApplyPatch(args.patchText);
                const result = runPatchValidationAndApply(parsed, options.localSources, createAdapter());
                options.onLocalSourcesUpdated?.(result.nextState);
                return {
                    ok: result.ok,
                    phase: result.phase,
                    changes: result.changes,
                };
            }

            if (name === 'Read') {
                const entry = findFile(options.localSources, args.filePath);
                if (!entry) {
                    throw new Error('local_file_not_found');
                }
                return {
                    ok: true,
                    path: entry.publicPath,
                    content: entry.content,
                };
            }

            throw new Error(`unsupported_tool:${name}`);
        },
    });

    runtime.syncLocalSources([]);

    const writeResult = await runtime.execute('Write', {
        path: 'local/patch_retest.txt',
        content: 'one\ntwo\nthree\n',
    });
    assert.equal(writeResult.ok, true);
    assert.equal(findFile(runtime.getSnapshot(), 'local/patch_retest.txt')?.content, 'one\ntwo\nthree\n');

    const patchResult = await runtime.execute('apply_patch', {
        patchText: [
            '*** Begin Patch',
            '*** Update File: local/patch_retest.txt',
            '@@',
            '-one',
            '+ONE',
            ' two',
            ' three',
            '*** End Patch',
        ].join('\n'),
    });
    assert.equal(patchResult.ok, true);

    const readResult = await runtime.execute('Read', {
        filePath: 'local/patch_retest.txt',
    });
    assert.equal(readResult.ok, true);
    assert.equal(readResult.content, 'ONE\ntwo\nthree\n');
});

test('local sources tool runtime applies explicit sync snapshots before later tool calls', async () => {
    let currentState = createState({});
    const runtime = createLocalSourcesToolRuntime({
        getLocalSources: () => currentState,
        setLocalSources: (nextSources) => {
            currentState = cloneState(nextSources);
        },
        normalizeLocalSourcesSnapshot: cloneState,
        executeToolCall: async (_name, _args, options = {}) => ({
            ok: true,
            snapshotSize: Array.isArray(options.localSources) ? options.localSources.length : -1,
        }),
    });

    runtime.syncLocalSources(createState({
        'local/demo.txt': 'demo\n',
    }));

    const result = await runtime.execute('Read', { filePath: 'local/demo.txt' });
    assert.equal(result.ok, true);
    assert.equal(result.snapshotSize, 1);
});

test('normalizeLocalDirectoryPath accepts local workspace root', () => {
    assert.equal(normalizeLocalDirectoryPath('local/'), 'local/');
    assert.equal(normalizeLocalDirectoryPath('local'), 'local/');
});

test('local sources tool runtime serializes workspace mutation tools against the latest host snapshot', async () => {
    let currentState = createState({});
    const firstStarted = createDeferred();
    const releaseFirst = createDeferred();
    const snapshotsSeen = [];
    const runtime = createLocalSourcesToolRuntime({
        getLocalSources: () => currentState,
        setLocalSources: (nextSources) => {
            currentState = cloneState(nextSources);
        },
        normalizeLocalSourcesSnapshot: cloneState,
        isMutationTool: (name) => ['Write', 'apply_patch', 'Delete', 'Move'].includes(name),
        executeToolCall: async (name, args, options = {}) => {
            if (name !== 'Write') {
                throw new Error(`unsupported_tool:${name}`);
            }
            snapshotsSeen.push({
                path: args.path,
                files: cloneState(options.localSources).map((file) => file.publicPath),
            });
            if (args.path === 'local/first.txt') {
                firstStarted.resolve();
                await releaseFirst.promise;
            }
            const update = writeFile(options.localSources, args.path, args.content);
            options.onLocalSourcesUpdated?.(update.nextState);
            return {
                ok: true,
                path: update.file.publicPath,
            };
        },
    });

    const firstWrite = runtime.execute('Write', {
        path: 'local/first.txt',
        content: 'first\n',
    });
    await firstStarted.promise;

    const secondWrite = runtime.execute('Write', {
        path: 'local/second.txt',
        content: 'second\n',
    });

    await Promise.resolve();
    assert.equal(snapshotsSeen.length, 1);

    releaseFirst.resolve();
    await Promise.all([firstWrite, secondWrite]);

    assert.equal(snapshotsSeen.length, 2);
    assert.deepEqual(snapshotsSeen[0], {
        path: 'local/first.txt',
        files: [],
    });
    assert.deepEqual(snapshotsSeen[1], {
        path: 'local/second.txt',
        files: ['local/first.txt'],
    });
    assert.deepEqual(
        runtime.getSnapshot().map((file) => file.publicPath),
        ['local/first.txt', 'local/second.txt'],
    );
});

test('local sources tool runtime does not execute an aborted queued mutation', async () => {
    let currentState = createState({});
    const firstStarted = createDeferred();
    const releaseFirst = createDeferred();
    const executedPaths = [];
    const runtime = createLocalSourcesToolRuntime({
        getLocalSources: () => currentState,
        setLocalSources: (nextSources) => {
            currentState = cloneState(nextSources);
        },
        normalizeLocalSourcesSnapshot: cloneState,
        isMutationTool: (name) => ['Write', 'apply_patch', 'Delete', 'Move'].includes(name),
        executeToolCall: async (name, args, options = {}) => {
            if (name !== 'Write') {
                throw new Error(`unsupported_tool:${name}`);
            }
            executedPaths.push(args.path);
            if (args.path === 'local/first.txt') {
                firstStarted.resolve();
                await releaseFirst.promise;
            }
            const update = writeFile(options.localSources, args.path, args.content);
            options.onLocalSourcesUpdated?.(update.nextState);
            return {
                ok: true,
                path: update.file.publicPath,
            };
        },
    });

    const firstWrite = runtime.execute('Write', {
        path: 'local/first.txt',
        content: 'first\n',
    });
    await firstStarted.promise;

    const controller = new AbortController();
    const secondWrite = runtime.execute('Write', {
        path: 'local/second.txt',
        content: 'second\n',
    }, {
        signal: controller.signal,
    });
    controller.abort();

    releaseFirst.resolve();

    await firstWrite;
    await assert.rejects(secondWrite, /tool_aborted/);
    assert.deepEqual(executedPaths, ['local/first.txt']);
    assert.deepEqual(
        runtime.getSnapshot().map((file) => file.publicPath),
        ['local/first.txt'],
    );
});

test('local sources sync queued waits for in-flight workspace mutations', async () => {
    let currentState = createState({});
    const firstStarted = createDeferred();
    const releaseFirst = createDeferred();
    const runtime = createLocalSourcesToolRuntime({
        getLocalSources: () => currentState,
        setLocalSources: (nextSources) => {
            currentState = cloneState(nextSources);
        },
        normalizeLocalSourcesSnapshot: cloneState,
        isMutationTool: (name) => ['Write', 'apply_patch', 'Delete', 'Move'].includes(name),
        executeToolCall: async (name, args, options = {}) => {
            if (name !== 'Write') {
                throw new Error(`unsupported_tool:${name}`);
            }
            if (args.path === 'local/tool.txt') {
                firstStarted.resolve();
                await releaseFirst.promise;
            }
            const update = writeFile(options.localSources, args.path, args.content);
            options.onLocalSourcesUpdated?.(update.nextState);
            return {
                ok: true,
                path: update.file.publicPath,
            };
        },
    });

    const writePromise = runtime.execute('Write', {
        path: 'local/tool.txt',
        content: 'tool\n',
    });
    await firstStarted.promise;

    const syncPromise = runtime.syncLocalSourcesQueued(createState({
        'local/manual.txt': 'manual\n',
    }));

    await Promise.resolve();
    assert.deepEqual(runtime.getSnapshot(), []);

    releaseFirst.resolve();

    await writePromise;
    await syncPromise;
    assert.deepEqual(
        runtime.getSnapshot().map((file) => file.publicPath),
        ['local/manual.txt'],
    );
});

test('local sources tool runtime rejects editor mutation tools outside editor write permissions', async () => {
    let currentState = createState({
        'local/demo.txt': 'demo\n',
    });
    let executeCalls = 0;
    const runtime = createLocalSourcesToolRuntime({
        getLocalSources: () => currentState,
        setLocalSources: (nextSources) => {
            currentState = cloneState(nextSources);
        },
        normalizeLocalSourcesSnapshot: cloneState,
        executeToolCall: async () => {
            executeCalls += 1;
            return { ok: true };
        },
    });

    const deniedDelete = await runtime.execute('Delete', {
        path: 'local/demo.txt',
    }, {
        workspaceMeta: {
            source: 'editor',
            baseVersion: 0,
            path: 'local/demo.txt',
        },
    });
    assert.equal(deniedDelete.ok, false);
    assert.equal(deniedDelete.error, 'workspace_source_permission_denied');

    const deniedWrite = await runtime.execute('Write', {
        path: 'local/demo.txt',
        content: 'next\n',
    }, {
        workspaceMeta: {
            source: 'editor',
            baseVersion: 0,
            path: 'local/other.txt',
        },
    });
    assert.equal(deniedWrite.ok, false);
    assert.equal(deniedWrite.error, 'workspace_source_permission_denied');
    assert.equal(executeCalls, 0);
});

test('local sources tool runtime accepts Write filePath alias for editor permissions', async () => {
    let currentState = createState({
        'local/demo.txt': 'old\n',
    });
    let executeCalls = 0;
    const runtime = createLocalSourcesToolRuntime({
        getLocalSources: () => currentState,
        setLocalSources: (nextSources) => {
            currentState = cloneState(nextSources);
        },
        normalizeLocalSourcesSnapshot: cloneState,
        executeToolCall: async () => {
            executeCalls += 1;
            return { ok: true };
        },
    });

    const result = await runtime.execute('Write', {
        filePath: 'local/demo.txt',
        content: 'next\n',
    }, {
        workspaceMeta: {
            source: 'editor',
            baseVersion: 0,
            path: 'local/demo.txt',
        },
    });

    assert.equal(result.ok, true);
    assert.equal(executeCalls, 1);
});

test('local sources tool runtime applies editor batch writes through the normal mutation pipeline', async () => {
    let currentState = createState({
        'local/demo.txt': 'old\n',
    });

    const runtime = createLocalSourcesToolRuntime({
        getLocalSources: () => currentState,
        setLocalSources: (nextSources) => {
            currentState = cloneState(nextSources);
        },
        normalizeLocalSourcesSnapshot: cloneState,
        executeToolCall: async (name, args, options = {}) => {
            if (name === INTERNAL_WORKSPACE_TOOL_NAMES.BATCH_WRITE_FILES) {
                let nextState = cloneState(options.localSources);
                (args.files || []).forEach((entry) => {
                    const update = writeFile(nextState, entry.path, entry.content);
                    nextState = update.nextState;
                });
                options.onLocalSourcesUpdated?.(nextState);
                return { ok: true, fileCount: args.files.length };
            }
            throw new Error(`unsupported_tool:${name}`);
        },
    });

    const result = await runtime.execute(INTERNAL_WORKSPACE_TOOL_NAMES.BATCH_WRITE_FILES, {
        files: [
            {
                path: 'local/demo.txt',
                content: 'host-new\n',
            },
            {
                path: 'local/other.txt',
                content: 'saved-on-unload\n',
            },
        ],
    }, {
        workspaceMeta: {
            source: 'editor',
            baseVersion: 0,
            path: 'local/demo.txt',
        },
    });

    assert.equal(result.ok, true);
    assert.equal(findFile(runtime.getSnapshot(), 'local/demo.txt')?.content, 'host-new\n');
    assert.equal(findFile(runtime.getSnapshot(), 'local/other.txt')?.content, 'saved-on-unload\n');
});
