import { throwIfSignalAborted } from '../../../shared/common/abort-utils.js';

// One invocation belongs to exactly one host Generate, including query retries.
export async function runRequiredRecall({ coordinator, run, commit, abort, onProgress, onFailure }) {
    let completed = false;
    try {
        onProgress?.(run.diagnostics);
        const outcome = await coordinator.waitForOutcome(run);
        if (!outcome.ok) throw outcome.error;
        const value = await commit(outcome.value, run.controller.signal);
        throwIfSignalAborted(run.controller.signal);
        completed = true;
        return { ok: true, value };
    } catch (error) {
        await onFailure?.(error);
        return { ok: false };
    } finally {
        // Detach before aborting the dispatch: a real failure must not be
        // overwritten by a second, synthetic "dispatch cancelled" report.
        coordinator.finish(run);
        if (!completed) abort(true);
    }
}
