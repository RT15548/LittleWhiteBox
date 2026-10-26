import { runWithAbortDeadline, throwIfSignalAborted } from '../../shared/common/abort-utils.js';
import { TASK_SAVE_COPY } from './task-save-copy.js';

// One editor attempt owns one deadline, including queued work and confirmation.
const SAVE_TIMEOUT_MS = 5000;

export function runTaskSave(save) {
    return runWithAbortDeadline(save, { timeoutMs: SAVE_TIMEOUT_MS, timeoutMessage: TASK_SAVE_COPY.timeout(SAVE_TIMEOUT_MS / 1000) });
}

// Host helpers do not all accept AbortSignal. Stop waiting and, crucially, stop
// the caller's next stage even if an already-issued host request finishes late.
export async function waitTaskSave(operation, signal) {
    throwIfSignalAborted(signal);
    if (!signal) return await operation();
    let onAbort;
    try {
        return await Promise.race([
            Promise.resolve().then(() => {
                throwIfSignalAborted(signal);
                return operation(signal);
            }).then(value => {
                throwIfSignalAborted(signal);
                return value;
            }),
            new Promise((_, reject) => {
                onAbort = () => reject(signal.reason);
                signal.addEventListener('abort', onAbort, { once: true });
            }),
        ]);
    } finally {
        signal.removeEventListener('abort', onAbort);
    }
}
