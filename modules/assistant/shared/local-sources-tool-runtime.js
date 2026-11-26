import {
    INTERNAL_WORKSPACE_TOOL_NAMES,
    WORKSPACE_KERNEL_VERSION,
    WORKSPACE_SOURCES,
    buildWorkspaceOpMeta,
    isWorkspaceMutationTool,
} from './workspace-protocol.js';
import { getWorkspaceMutationPermissionError } from './workspace-mutation-policy.js';
import { captureWorkspacePath, workspaceMutationScopes } from './workspace-preconditions.js';
import { LOOKUP_SCOPE_LOCAL, normalizeLookupScope } from './lookup-scope.js';
import { stageWorkspaceImageBatch, workspaceImageObservations } from './workspace-images.js';

const MISSING_READ_ERRORS = new Set(['local_file_not_found', 'directory_not_found']);

export function createLocalSourcesToolRuntime(deps) {
    const { getLocalSources, setLocalSources, normalizeLocalSourcesSnapshot, executeToolCall, repository } = deps;
    let stateWriteQueue = Promise.resolve();
    let workspaceVersion = 0;
    const recentOpIds = new Map();

    function enqueueStateWrite(task) {
        const queued = stateWriteQueue.then(task, task);
        stateWriteQueue = queued.then(() => undefined, (caughtError) => { console.warn({ source: import.meta.url, operation: "enqueueStateWrite" }, caughtError); });
        return queued;
    }

    function getSnapshot() {
        return normalizeLocalSourcesSnapshot(getLocalSources());
    }

    function getWorkspaceState() {
        return { version: workspaceVersion, kernelVersion: WORKSPACE_KERNEL_VERSION, snapshot: getSnapshot() };
    }

    function hydrateLocalSources(sources) {
        // Hydration is the window's observed snapshot, never a database write.
        return enqueueStateWrite(() => setLocalSources(normalizeLocalSourcesSnapshot(sources)));
    }

    function clearLocalSources() {
        setLocalSources([]);
        workspaceVersion = 0;
        recentOpIds.clear();
    }

    async function execute(name, args, options = {}) {
        const mutation = isWorkspaceMutationTool(name);
        const run = async () => {
            if (options.signal?.aborted) throw new Error('tool_aborted');
            const meta = buildWorkspaceOpMeta(options.workspaceMeta, {
                source: mutation ? WORKSPACE_SOURCES.TOOL : WORKSPACE_SOURCES.HYDRATE,
            });
            const permissionError = getWorkspaceMutationPermissionError(name, meta, args);
            if (permissionError) return { ok: false, error: permissionError };
            if (mutation && meta.opId && recentOpIds.has(meta.opId)) return recentOpIds.get(meta.opId);

            const binaryImport = name === INTERNAL_WORKSPACE_TOOL_NAMES.BATCH_WRITE_FILES
                && Array.isArray(args.files) && args.files.some(file => file && Object.hasOwn(file, 'blob'));
            if (binaryImport && meta.source !== WORKSPACE_SOURCES.UI_ACTION) {
                return { ok: false, error: 'workspace_source_permission_denied' };
            }
            let result;
            if (mutation) {
                const saved = await repository.commitWorkspaceMutation({
                    name, args, preconditions: meta.preconditions, signal: options.signal,
                    retryContent: meta.source === WORKSPACE_SOURCES.EDITOR ? meta.retryContent : undefined,
                    execute: async localSources => {
                        if (binaryImport) {
                            const staged = stageWorkspaceImageBatch(localSources, args.files);
                            return {
                                ...staged,
                                result: { ok: true, mode: 'batch_write', fileCount: staged.files.length, paths: staged.files.map(file => file.path) },
                            };
                        }
                        let nextSources = null;
                        const result = await executeToolCall(name, args, {
                            ...options, localSources, workspaceMeta: meta,
                            onLocalSourcesUpdated: value => { nextSources = value; },
                        });
                        return { result, nextSources };
                    },
                });
                result = saved.result;
                if (saved.conflictSnapshot) options.onWorkspaceConflict?.(saved.conflictSnapshot);
                if (saved.committed) {
                    setLocalSources(saved.localSources);
                    workspaceVersion += 1;
                    options.onLocalSourcesUpdated?.(saved.localSources, getWorkspaceState());
                    options.onWorkspaceObserved?.(workspaceMutationScopes(name, args).map(item => ({
                        ...item, expected: captureWorkspacePath(saved.localSources, item.path, item.scope),
                    })));
                }
            } else {
                const readsWorkspace = ['Read', 'Glob', 'Grep'].includes(name)
                    && normalizeLookupScope(args?.scope) === LOOKUP_SCOPE_LOCAL;
                const localSources = readsWorkspace ? (await repository.readWorkspace()).localSources : getSnapshot();
                const lookupSources = name === 'Grep' ? localSources.map(source => ({
                    ...source, files: source.files.filter(file => file.kind !== 'image'),
                })) : localSources;
                result = await executeToolCall(name, args, { ...options, localSources: lookupSources, workspaceMeta: meta });
                const path = String(result?.path || '').replace(/\/+$/, '');
                if (name === 'Read' && (path === 'local' || path.startsWith('local/'))) {
                    if (result?.ok !== false) {
                        const expected = captureWorkspacePath(localSources, path);
                        const observations = expected.file?.kind === 'image'
                            ? workspaceImageObservations([expected.file]) : [{ path, scope: 'entry', expected }];
                        options.onWorkspaceObserved?.(observations);
                    } else if (MISSING_READ_ERRORS.has(result.error)) {
                        // Missing ancestors may need recreating too. A parent file's contents
                        // were not returned by this failed read and must remain unobserved.
                        const parts = path.split('/');
                        options.onWorkspaceObserved?.(parts.map((_, index) => parts.slice(0, index + 1).join('/'))
                            .map(item => ({ path: item, scope: 'entry', expected: captureWorkspacePath(localSources, item) }))
                            .filter(item => item.expected.kind !== 'file'));
                    }
                }
            }
            const nextResult = result && typeof result === 'object'
                ? { ...result, workspaceVersion, kernelVersion: WORKSPACE_KERNEL_VERSION }
                : result;
            if (mutation && meta.opId && result?.ok !== false) {
                recentOpIds.set(meta.opId, nextResult);
                if (recentOpIds.size > 64) recentOpIds.delete(recentOpIds.keys().next().value);
            }
            return nextResult;
        };
        return mutation ? enqueueStateWrite(run) : run();
    }

    return { hydrateLocalSources, clearLocalSources, getSnapshot, getWorkspaceState, execute, flush: () => stateWriteQueue };
}
