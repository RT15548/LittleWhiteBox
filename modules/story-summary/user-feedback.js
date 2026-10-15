import { xbLog } from '../../core/debug-core.js';
import { SUMMARY_FEEDBACK_COPY } from './feedback-copy.js';

const MODULE_ID = 'story-summary-feedback';
const NOTICE_OPTIONS = Object.freeze({ timeOut: 12000, extendedTimeOut: 3000, closeButton: true, escapeHtml: true });
let embeddingToast = null;
let recallFailureToast = null;

// The foreground run owns its notice. Closing it does not restart it on the
// next retry, and cleanup never dismisses another run's or another feature's UI.
export function createRecallRetryNotice() {
    let toast = null;
    let shown = false;
    return {
        show() {
            if (shown) return;
            shown = true;
            toast = toastr.info(SUMMARY_FEEDBACK_COPY.recallRetrying, SUMMARY_FEEDBACK_COPY.title,
                { ...NOTICE_OPTIONS, timeOut: 0, extendedTimeOut: 0 });
        },
        clear() {
            if (!toast) return;
            toastr.clear(toast, { force: true });
            toast.finish();
            toast = null;
        },
    };
}

// An unknown save outcome is not evidence of failure. Keep diagnostics and
// on-demand status, but do not interrupt the chat with a speculative alert.
export function shouldNotifyMemoryFailure(error, state) {
    return state !== 'unconfirmed' && !error?.uncertain
        && !['metadata_unconfirmed', 'metadata_save_unconfirmed'].includes(error?.code);
}

export function notifySummaryStartupFailure(error, shouldNotify = true) {
    console.error(SUMMARY_FEEDBACK_COPY.startupFailed, error);
    xbLog.error(MODULE_ID, SUMMARY_FEEDBACK_COPY.startupFailed, error);
    if (shouldNotify) toastr.error(SUMMARY_FEEDBACK_COPY.startupFailed, SUMMARY_FEEDBACK_COPY.title, NOTICE_OPTIONS);
}

export function clearEmbeddingFailureNotice() {
    if (!embeddingToast) return;
    // Clear only our toast. Finish its hide animation before showing another
    // blocked-send receipt; never dismiss another feature's notification.
    toastr.clear(embeddingToast, { force: true });
    embeddingToast.finish();
    embeddingToast = null;
}

export function clearRecallFailureNotice() {
    clearEmbeddingFailureNotice();
    if (!recallFailureToast) return;
    toastr.clear(recallFailureToast, { force: true });
    recallFailureToast.finish();
    recallFailureToast = null;
}

export function notifyRecallFailure({ issueCode, notice }) {
    const embedding = issueCode === 'recall_embedding_failed';
    clearRecallFailureNotice();
    const options = { ...NOTICE_OPTIONS, preventDuplicates: false };
    if (embedding) {
        embeddingToast = toastr.warning(notice, SUMMARY_FEEDBACK_COPY.embeddingTitle, options);
    } else {
        recallFailureToast = toastr.warning(notice, SUMMARY_FEEDBACK_COPY.title, options);
    }
}

/** One receipt for a user-requested clear; a cancelled queued action returns false. */
export async function runClearWithFeedback({ kind, clear, refresh, isCurrent, getMemoryState }) {
    const copy = SUMMARY_FEEDBACK_COPY[kind];
    let cleared = false;
    try {
        if (!await clear()) return;
        cleared = true;
        if (!isCurrent()) return;
        await refresh();
        if (!isCurrent()) return;
        toastr.info(copy.success, SUMMARY_FEEDBACK_COPY.title);
    } catch (error) {
        const message = cleared ? copy.refreshFailed : copy.failed;
        console.error(message, error);
        xbLog.error(MODULE_ID, message, error);
        if (!isCurrent() || !shouldNotifyMemoryFailure(error, getMemoryState())) return;
        toastr[cleared ? 'warning' : 'error'](message, SUMMARY_FEEDBACK_COPY.title, NOTICE_OPTIONS);
    }
}
