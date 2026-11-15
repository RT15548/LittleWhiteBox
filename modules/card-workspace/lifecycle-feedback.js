import { COPY } from './copy.js';
import { LIFECYCLE_JOURNAL_KEY } from './lifecycle-journal.js';

const notices = new Map();

export function clearLifecycleFailure(id) {
    const notice = notices.get(id);
    if (notice) toastr.clear(notice, { force: true });
    notices.delete(id);
}

export function showLifecycleFailure(operation, error, retry) {
    showFailure(operation.id, COPY.lifecyclePending(operation.from, operation.to), error, retry,
        operation.recordingFailed ? COPY.lifecycleRecordRetry : COPY.lifecycleRetry);
}

export function showLifecycleRestoreFailure(error, retry) {
    showFailure(LIFECYCLE_JOURNAL_KEY, COPY.lifecycleRestoreFailed, error, retry);
}

function showFailure(id, message, error, retry, retryMessage = COPY.lifecycleRetry) {
    clearLifecycleFailure(id);
    const notice = toastr.error(`${message}\n${retryMessage}\n${error.message}`,
        COPY.designTitle, { timeOut: 0, extendedTimeOut: 0, closeButton: false, tapToDismiss: false, escapeHtml: true,
            onclick: async () => {
                clearLifecycleFailure(id);
                try { await retry(); } catch (failure) {
                    // The lifecycle owner has displayed the next failure and retry.
                    console.error('[LittleWhiteBox]', failure);
                }
            } });
    notices.set(id, notice);
}
