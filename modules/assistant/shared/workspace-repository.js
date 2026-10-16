import db, { workspaceTable } from './session-db.js';
import { normalizeWorkspaceState, normalizeWorkspaceUiState, WORKSPACE_RECORD_ID } from './workspace-state.js';
import { normalizeLocalSources, validateLocalSourcesSnapshot } from './local-workspace-kernel.js';
import { applyWorkspaceObservations, findWorkspaceConflicts, reconcileEditorWriteRetry, WORKSPACE_CONFLICT } from './workspace-preconditions.js';

export function createWorkspaceRepository(database = db) {
    const table = database.table(workspaceTable.name);

    async function readWorkspace() {
        return normalizeWorkspaceState(await table.get(WORKSPACE_RECORD_ID));
    }

    async function saveWorkspaceUiState(value) {
        const ui = normalizeWorkspaceUiState(value);
        await database.transaction('rw', table, async () => {
            const current = await table.get(WORKSPACE_RECORD_ID);
            await table.put({ ...normalizeWorkspaceState(current), ...ui, id: WORKSPACE_RECORD_ID, updatedAt: Date.now() });
        });
    }

    async function commitWorkspaceMutation({ name, args, preconditions, execute, signal, retryContent }) {
        return database.transaction('rw', table, async () => {
            const current = normalizeWorkspaceState(await table.get(WORKSPACE_RECORD_ID));
            if (signal?.aborted) throw new Error('tool_aborted');
            let conflictPaths = findWorkspaceConflicts(name, args, preconditions, current.localSources);
            let replaySources = null;
            if (conflictPaths.length && name === 'Write' && typeof retryContent === 'string') {
                const reconciled = reconcileEditorWriteRetry(args.path ?? args.filePath, retryContent, preconditions, current.localSources);
                conflictPaths = findWorkspaceConflicts(name, args, reconciled, current.localSources);
                if (!conflictPaths.length && reconciled !== preconditions && args.content === retryContent) {
                    // Recreate the original receipt with the existing handler,
                    // without rewriting a confirmed file or its original content.
                    replaySources = applyWorkspaceObservations(current.localSources, preconditions);
                }
            }
            if (conflictPaths.length) return {
                result: { ok: false, error: WORKSPACE_CONFLICT, conflictPaths },
                conflictSnapshot: current.localSources,
                committed: false,
            };
            // Only the six local, computation-only mutation handlers run here.
            // No fetch, UI callback, or host message may run inside this transaction.
            const { result, nextSources } = await execute(replaySources ?? current.localSources);
            if (signal?.aborted) throw new Error('tool_aborted');
            if (result?.ok === false || nextSources === null) return { result, committed: false };
            if (replaySources) return { result, committed: true, localSources: current.localSources };
            const localSources = normalizeLocalSources(nextSources);
            const validation = validateLocalSourcesSnapshot(localSources);
            if (!validation.ok) throw new Error('workspace_invariant_failed');
            await table.put({ ...current, localSources, id: WORKSPACE_RECORD_ID, updatedAt: Date.now() });
            return { result, committed: true, localSources };
        });
    }

    return { readWorkspace, saveWorkspaceUiState, commitWorkspaceMutation };
}

export const workspaceRepository = createWorkspaceRepository();
