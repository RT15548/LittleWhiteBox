import { WORKSPACE_COPY } from './workspace-copy.js';

// Only the exit journey waits for the host mutation queue. Normal chat and
// unrelated tools never pass through this barrier.
export async function closeAssistantWorkspace({ state, cancelRun, flushEditorChanges,
    flushHostWrites, workspaceStore, hasPendingChanges, close, render, showToast, describeError }) {
    if (state.isClosingAssistant) return false;
    state.isClosingAssistant = true;
    render();
    let closed = false;
    try {
        cancelRun();
        if (!await flushEditorChanges()) {
            showToast(WORKSPACE_COPY.pendingBeforeClose);
            return false;
        }
        await flushHostWrites();
        const saved = await workspaceStore.flushWorkspace();
        if (!saved.ok) {
            showToast(WORKSPACE_COPY.saveFailed(saved.error));
            return false;
        }
        if (hasPendingChanges()) {
            showToast(WORKSPACE_COPY.pendingBeforeClose);
            return false;
        }
        close();
        closed = true;
        return true;
    } catch (error) {
        showToast(WORKSPACE_COPY.saveFailed(describeError(error)));
        return false;
    } finally {
        if (!closed) {
            state.isClosingAssistant = false;
            render();
        }
    }
}
