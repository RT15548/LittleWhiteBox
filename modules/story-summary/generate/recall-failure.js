import { SUMMARY_FEEDBACK_COPY } from '../feedback-copy.js';
import { readEmbeddingFailure } from '../vector/llm/embedding-failure.js';

export const RECALL_TIMEOUT_MS = 30_000;
export const RECALL_TIMEOUT_REASONS = Object.freeze({
    host: 'host-wait-timeout',
    compute: 'recall-timeout',
});

const CANCELLATION_REASONS = Object.freeze({
    'message-edited': 'edited', 'history-changed': 'edited',
    'vector-config-changed': 'configuration', 'recall-config-reloaded': 'configuration',
    'recall-config-changed': 'configuration', 'evidence-visibility-changed': 'configuration',
    'character-aliases-edited': 'configuration',
    'summary-edited': 'memory', 'summary-cleared': 'memory', 'summary-rollback': 'memory',
    'memory-data-changed': 'memory', 'manual-summary-completed': 'memory', 'cache-cleared': 'memory',
});

export function recallCancellationNotice(reason) {
    const kind = CANCELLATION_REASONS[reason];
    return kind ? { issueCode: 'recall_interrupted', reason: kind, notice: SUMMARY_FEEDBACK_COPY.recallInterrupted[kind] } : null;
}

function embeddingFailureNotice(error) {
    const failure = readEmbeddingFailure(error);
    const status = failure?.status;
    let reason = 'unknown';
    if (failure?.kind === 'http') {
        if (status === 401 || status === 403) reason = 'credentials';
        else if (status === 429) reason = 'rate_limit';
        else if (status === 408) reason = 'request_timeout';
        else if (status >= 500 && status <= 599) reason = 'server';
        else reason = 'http';
    } else if (failure) {
        reason = failure.kind;
    } else if (error.code === 'RECALL_EMBEDDING_INVALID_RESPONSE') {
        reason = 'invalid_response';
    }
    const timeouts = (error.errors || []).flatMap((attemptError, index) => {
        const detail = readEmbeddingFailure(attemptError);
        return detail?.kind === 'timeout' && Number.isFinite(detail.timeoutMs)
            ? [{ attempt: index + 1, timeoutMs: detail.timeoutMs }]
            : [];
    });
    const copy = SUMMARY_FEEDBACK_COPY.embeddingRecallReasons;
    if (!Object.hasOwn(copy, reason)) reason = 'unknown';
    return {
        issueCode: 'recall_embedding_failed',
        reason,
        httpStatus: failure?.kind === 'http' ? status : null,
        timeouts,
        notice: SUMMARY_FEEDBACK_COPY.embeddingRecall(copy[reason](reason === 'timeout' ? timeouts : status)),
    };
}

/** Cancellation is not failure; report only the deadline that actually expired. */
export function recallFailureNotice(cancelReason, error, timeoutMs = RECALL_TIMEOUT_MS) {
    const seconds = timeoutMs / 1000;
    if (cancelReason === RECALL_TIMEOUT_REASONS.host) {
        return {
            issueCode: 'recall_host_wait_timeout',
            notice: SUMMARY_FEEDBACK_COPY.recallHostTimeout(seconds),
        };
    }
    if (cancelReason === RECALL_TIMEOUT_REASONS.compute) {
        return {
            issueCode: 'recall_timeout',
            notice: SUMMARY_FEEDBACK_COPY.recallComputeTimeout(seconds),
        };
    }
    if (cancelReason) return null;
    if (error?.code === 'MEMORY_SOURCE_UNSAFE') {
        return { issueCode: 'recall_source_unsafe', notice: SUMMARY_FEEDBACK_COPY.recallSourceUnsafe };
    }
    if (error?.code === 'MEMORY_SOURCE_CHANGED') {
        return { issueCode: 'recall_source_changed', notice: SUMMARY_FEEDBACK_COPY.recallInterrupted.edited };
    }
    if (error?.code === 'RECALL_EMBEDDING_FAILED' || error?.code === 'RECALL_EMBEDDING_INVALID_RESPONSE') {
        return embeddingFailureNotice(error);
    }
    return {
        issueCode: 'recall_failed',
        notice: SUMMARY_FEEDBACK_COPY.recallFailed,
    };
}
