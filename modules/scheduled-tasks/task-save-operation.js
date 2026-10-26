import { runWithAbortDeadline, throwIfSignalAborted } from '../../shared/common/abort-utils.js';
import { observeBackgroundTask } from '../../shared/common/async-errors.js';
import { TASK_SAVE_COPY } from './task-save-copy.js';

// Each editor save or independent permission-record write owns its own deadline.
const SAVE_TIMEOUT_MS = 5000;
const saveAttempts = new WeakMap();
export const TASK_SAVE_ERROR = Object.freeze({
    FAILED: 'TASK_SAVE_FAILED',
    UNCONFIRMED: 'TASK_SAVE_UNCONFIRMED',
    PARTIAL: 'TASK_SAVE_PARTIAL',
    HTTP: 'TASK_SAVE_HTTP_FAILURE',
});

// The deadline can reject before an inner request catches its abort. Record the
// uncertain write synchronously so the outer boundary can report it truthfully.
export function markTaskSaveUnconfirmed(signal, message) {
    const attempt = saveAttempts.get(signal);
    if (attempt) attempt.unconfirmed = message;
}

export function markTaskSaveConfirmed(signal) {
    const attempt = saveAttempts.get(signal);
    if (attempt) { attempt.confirmed = true; attempt.unconfirmed = null; }
}

export function taskSaveUnconfirmed(message, cause) {
    const error = new Error(message, { cause });
    error.code = TASK_SAVE_ERROR.UNCONFIRMED;
    return error;
}

// Optional preference writes start after the entire editor attempt settles, so
// they cannot queue ahead of source cleanup during a cross-scope migration.
export function afterTaskSave(signal, followUp) {
    const attempt = saveAttempts.get(signal);
    if (attempt) attempt.followUps.push(followUp);
    else followUp();
}

export function runTaskSave(save) {
    const attempt = { unconfirmed: null, followUps: [] };
    let signal;
    return runWithAbortDeadline(currentSignal => {
        signal = currentSignal;
        saveAttempts.set(signal, attempt);
        return save(signal);
    }, { timeoutMs: SAVE_TIMEOUT_MS, timeoutMessage: TASK_SAVE_COPY.timeout(SAVE_TIMEOUT_MS / 1000) })
        .catch(cause => {
            if (attempt.confirmed) {
                const error = new Error(TASK_SAVE_COPY.savedButIncomplete, { cause });
                error.code = TASK_SAVE_ERROR.PARTIAL;
                throw error;
            }
            if (attempt.unconfirmed && cause?.code !== TASK_SAVE_ERROR.UNCONFIRMED) {
                throw taskSaveUnconfirmed(attempt.unconfirmed, cause);
            }
            throw cause;
        })
        .finally(() => {
            if (signal) saveAttempts.delete(signal);
            for (const followUp of attempt.followUps) {
                observeBackgroundTask(Promise.resolve().then(followUp), { source: import.meta.url, operation: 'afterTaskSave' });
            }
        });
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
