import {
    WORKSPACE_KERNEL_VERSION,
    WORKSPACE_SOURCES,
    buildWorkspaceOpMeta,
    isWorkspaceMutationTool,
    normalizeWorkspaceSource,
    simpleHashText,
} from './workspace-protocol.js';
import { getWorkspaceMutationPermissionError } from './workspace-mutation-policy.js';

export function createLocalSourcesToolRuntime(deps = {}) {
    const getLocalSources = typeof deps.getLocalSources === 'function'
        ? deps.getLocalSources
        : () => [];
    const setLocalSources = typeof deps.setLocalSources === 'function'
        ? deps.setLocalSources
        : () => {};
    const normalizeLocalSourcesSnapshot = typeof deps.normalizeLocalSourcesSnapshot === 'function'
        ? deps.normalizeLocalSourcesSnapshot
        : (localSources) => Array.isArray(localSources) ? localSources : [];
    const executeToolCall = typeof deps.executeToolCall === 'function'
        ? deps.executeToolCall
        : async () => {
            throw new Error('local_sources_tool_runtime_missing_executor');
        };
    const validateLocalSources = typeof deps.validateLocalSources === 'function'
        ? deps.validateLocalSources
        : () => ({ ok: true, errors: [] });

    let stateWriteQueue = Promise.resolve();
    let workspaceVersion = Number.isFinite(Number(deps.initialVersion)) ? Number(deps.initialVersion) : 0;
    let recentOpIds = new Map();

    function summarizeLocalSources(localSources) {
        const normalized = normalizeLocalSourcesSnapshot(localSources);
        const files = normalized.flatMap((source) => Array.isArray(source?.files) ? source.files : []);
        return {
            sourceCount: normalized.length,
            fileCount: files.length,
            samplePaths: files.slice(0, 6).map((file) => String(file?.publicPath || file?.path || '')).filter(Boolean),
            version: workspaceVersion,
        };
    }

    function buildSnapshotHash(localSources) {
        return simpleHashText(JSON.stringify(normalizeLocalSourcesSnapshot(localSources)));
    }

    function trimRecentOpIds() {
        const entries = Array.from(recentOpIds.entries());
        if (entries.length <= 64) return;
        entries
            .sort((left, right) => Number(left[1]?.seenAt || 0) - Number(right[1]?.seenAt || 0))
            .slice(0, Math.max(0, entries.length - 64))
            .forEach(([key]) => {
                recentOpIds.delete(key);
            });
    }

    function enqueueStateWrite(task) {
        const queued = stateWriteQueue.catch(() => {}).then(task);
        stateWriteQueue = queued.then(() => undefined, () => undefined);
        return queued;
    }

    function buildWorkspaceState() {
        const snapshot = normalizeLocalSourcesSnapshot(getLocalSources());
        return {
            version: workspaceVersion,
            kernelVersion: WORKSPACE_KERNEL_VERSION,
            snapshot,
            snapshotHash: buildSnapshotHash(snapshot),
        };
    }

    function validateAndSetLocalSources(nextSources, options = {}) {
        const normalizedSources = normalizeLocalSourcesSnapshot(nextSources);
        const validation = validateLocalSources(normalizedSources);
        if (validation?.ok === false) {
            const error = new Error('workspace_invariant_failed');
            error.validation = validation;
            throw error;
        }
        setLocalSources(normalizedSources);
        if (options.bumpVersion !== false) {
            workspaceVersion += 1;
        }
        console.info('[Assistant][LocalSourcesRuntime] syncLocalSources', summarizeLocalSources(normalizedSources));
        return normalizedSources;
    }

    function syncLocalSources(nextSources, options = {}) {
        return validateAndSetLocalSources(nextSources, {
            bumpVersion: options.bumpVersion !== false,
        });
    }

    async function hydrateLocalSources(nextSources) {
        return await enqueueStateWrite(() => validateAndSetLocalSources(nextSources, { bumpVersion: false }));
    }

    async function syncLocalSourcesQueued(nextSources) {
        return await hydrateLocalSources(nextSources);
    }

    function clearLocalSources() {
        console.info('[Assistant][LocalSourcesRuntime] clearLocalSources');
        setLocalSources([]);
        workspaceVersion = 0;
        recentOpIds = new Map();
    }

    function getSnapshot() {
        const snapshot = normalizeLocalSourcesSnapshot(getLocalSources());
        console.info('[Assistant][LocalSourcesRuntime] getSnapshot', summarizeLocalSources(snapshot));
        return snapshot;
    }

    function getWorkspaceState() {
        return buildWorkspaceState();
    }

    function buildStaleResult(meta = {}) {
        const state = buildWorkspaceState();
        return {
            ok: false,
            error: 'stale_workspace_version',
            workspaceVersion: state.version,
            kernelVersion: state.kernelVersion,
            currentSnapshot: state.snapshot,
            currentSnapshotHash: state.snapshotHash,
            source: normalizeWorkspaceSource(meta.source || WORKSPACE_SOURCES.TOOL),
            path: String(meta.path || '').trim(),
            opId: String(meta.opId || '').trim(),
        };
    }

    function rememberOpResult(meta = {}, result = null) {
        const opId = String(meta.opId || '').trim();
        if (!opId) return;
        recentOpIds.set(opId, {
            seenAt: Date.now(),
            result,
        });
        trimRecentOpIds();
    }

    async function execute(name, args, options = {}) {
        const run = async () => {
            if (options.signal?.aborted) {
                throw new Error('tool_aborted');
            }

            const mutation = isWorkspaceMutationTool(name);
            const effectiveLocalSources = getSnapshot();
            const workspaceMeta = buildWorkspaceOpMeta(options.workspaceMeta, {
                source: mutation ? WORKSPACE_SOURCES.TOOL : WORKSPACE_SOURCES.HYDRATE,
                baseVersion: workspaceVersion,
                path: typeof args?.path === 'string'
                    ? args.path
                    : (typeof args?.filePath === 'string'
                        ? args.filePath
                        : (typeof args?.fromPath === 'string' ? args.fromPath : '')),
            });

            console.info('[Assistant][LocalSourcesRuntime] execute:start', {
                toolName: String(name || ''),
                snapshot: summarizeLocalSources(effectiveLocalSources),
                workspaceMeta,
            });

            if (mutation && workspaceMeta.opId) {
                const cached = recentOpIds.get(workspaceMeta.opId);
                if (cached?.result) {
                    return cached.result;
                }
            }

            if (mutation) {
                const permissionError = getWorkspaceMutationPermissionError(name, workspaceMeta, args);
                if (permissionError) {
                    return {
                        ok: false,
                        error: permissionError,
                        workspaceVersion,
                        kernelVersion: WORKSPACE_KERNEL_VERSION,
                    };
                }
            }

            if (mutation && workspaceMeta.baseVersion !== workspaceVersion) {
                return buildStaleResult(workspaceMeta);
            }

            let updatedSources = null;
            const result = await executeToolCall(name, args, {
                ...options,
                localSources: effectiveLocalSources,
                workspaceMeta,
                workspaceVersion,
                kernelVersion: WORKSPACE_KERNEL_VERSION,
                onLocalSourcesUpdated: (nextSources) => {
                    updatedSources = normalizeLocalSourcesSnapshot(nextSources);
                },
            });

            let normalizedSources = effectiveLocalSources;
            let nextResult = result;
            if (mutation && result?.ok !== false && updatedSources) {
                normalizedSources = syncLocalSources(updatedSources, { bumpVersion: true });
                console.info('[Assistant][LocalSourcesRuntime] execute:onLocalSourcesUpdated', {
                    toolName: String(name || ''),
                    snapshot: summarizeLocalSources(normalizedSources),
                });
                options.onLocalSourcesUpdated?.(normalizedSources, buildWorkspaceState());
                nextResult = {
                    ...(result && typeof result === 'object' ? result : { ok: true }),
                    workspaceVersion,
                    kernelVersion: WORKSPACE_KERNEL_VERSION,
                };
            } else if (result && typeof result === 'object') {
                nextResult = {
                    ...result,
                    workspaceVersion,
                    kernelVersion: WORKSPACE_KERNEL_VERSION,
                };
            }

            if (mutation && workspaceMeta.opId) {
                rememberOpResult(workspaceMeta, nextResult);
            }
            return nextResult;
        };

        if (!isWorkspaceMutationTool(name)) {
            return await run();
        }

        return await enqueueStateWrite(run);
    }

    return {
        syncLocalSources,
        hydrateLocalSources,
        syncLocalSourcesQueued,
        clearLocalSources,
        getSnapshot,
        getWorkspaceState,
        execute,
    };
}
