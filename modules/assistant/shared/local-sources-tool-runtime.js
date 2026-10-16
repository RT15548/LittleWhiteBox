import {
    WORKSPACE_KERNEL_VERSION,
    WORKSPACE_SOURCES,
    buildWorkspaceOpMeta,
    isWorkspaceMutationTool,
} from './workspace-protocol.js';
import { getWorkspaceMutationPermissionError } from './workspace-mutation-policy.js';
import { captureWorkspacePath, workspaceMutationScopes } from './workspace-preconditions.js';
import { LOOKUP_SCOPE_LOCAL, normalizeLookupScope } from './lookup-scope.js';

export function createLocalSourcesToolRuntime(deps) {
    const { getLocalSources, setLocalSources, normalizeLocalSourcesSnapshot, executeToolCall, repository } = deps;
    let stateWriteQueue = Promise.resolve();
    let workspaceVersion = 0;
    const recentOpIds = new Map();

    function enqueueStateWrite(task) {
        const queued = stateWriteQueue.then(task, task);
        stateWriteQueue = queued.then(() => undefined, () => undefined);
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

            let result;
            if (mutation) {
                const saved = await repository.commitWorkspaceMutation({
                    name, args, preconditions: meta.preconditions, signal: options.signal,
                    retryContent: meta.source === WORKSPACE_SOURCES.EDITOR ? meta.retryContent : undefined,
                    execute: async localSources => {
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
                result = await executeToolCall(name, args, { ...options, localSources, workspaceMeta: meta });
                const path = String(result?.path || '').replace(/\/+$/, '');
                if (name === 'Read' && result?.ok !== false && (path === 'local' || path.startsWith('local/'))) {
                    options.onWorkspaceObserved?.([{ path, scope: 'entry', expected: captureWorkspacePath(localSources, path) }]);
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
