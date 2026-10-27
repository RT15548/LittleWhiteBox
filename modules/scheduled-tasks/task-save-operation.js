import { runWithAbortDeadline, throwIfSignalAborted, mergeAbortSignals } from '../../shared/common/abort-utils.js';

export const TASK_SAVE_ERROR = Object.freeze({
    FAILED: 'TASK_SAVE_FAILED',
    HTTP: 'TASK_SAVE_HTTP_FAILURE',
});

// The editor owns the entire operation, not a five-second transaction. Each
// transport has its own deadline, leaving recovery a fresh chance to finish.
export function runTaskSave(save) {
    return Promise.resolve().then(() => save(new AbortController().signal));
}

export function taskSaveDeadline(operation, signal) {
    return runWithAbortDeadline(deadline => {
        const combined = mergeAbortSignals(signal, deadline);
        return waitTaskSave(() => operation(combined), combined);
    }, { timeoutMs: 5000, timeoutMessage: 'Task save request timed out' });
}

export async function saveWithRecovery(write, recover) {
    try {
        return await write();
    } catch (error) {
        if (error?.code === TASK_SAVE_ERROR.HTTP || error?.code === 'STORAGE_HTTP_FAILURE') throw error;
        try {
            if (await recover()) return;
        } catch (recoveryError) {
            console.warn({ source: import.meta.url, operation: 'recoverTaskSave' }, recoveryError);
        }
        throw error;
    }
}

export function taskSaveRejected(detail) {
    const error = new Error(detail);
    error.code = TASK_SAVE_ERROR.HTTP;
    return error;
}

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
