import { workspaceRepository } from '../../shared/workspace-repository.js';
import { normalizeWorkspaceUiState } from '../../shared/workspace-state.js';
import { describePersistenceError } from '../../shared/persistence-error.js';

export function createWorkspaceStore({ state, repository = workspaceRepository }) {
    let writeQueue = Promise.resolve({ ok: true });

    function persistWorkspaceUiState() {
        const snapshot = normalizeWorkspaceUiState(state);
        writeQueue = writeQueue.then(async () => {
            try {
                await repository.saveWorkspaceUiState(snapshot);
                return { ok: true };
            } catch (error) {
                return { ok: false, error: describePersistenceError(error) };
            }
        });
        return writeQueue;
    }

    async function restoreWorkspace() {
        await writeQueue;
        Object.assign(state, await repository.readWorkspace());
    }

    async function flushWorkspace() {
        const result = await writeQueue;
        // A user-requested flush retries a failed UI save once, with current UI
        // state. Successful saves need no extra write and there is no polling.
        return result.ok ? result : persistWorkspaceUiState();
    }

    return { persistWorkspaceUiState, restoreWorkspace, flushWorkspace };
}
