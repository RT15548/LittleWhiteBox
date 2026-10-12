import { embed } from '../utils/embedder.js';
import { throwIfSignalAborted, waitForAbortableDelay } from '../../../../shared/common/abort-utils.js';
import { SUMMARY_FEEDBACK_COPY } from '../../feedback-copy.js';
import { observeVectorActivity } from '../runtime/vector-activity.js';
import { QUERY_EMBEDDING_TIMEOUT_MS, QUERY_EMBEDDING_RETRY_DELAY_MS, canRetryRecallEmbedding } from './query-embedding-policy.js';

// Foreground query policy only; background batch retry policy is independent.
export async function embedRecallQuery(texts, vectorConfig, options = {}) {
    const activity = observeVectorActivity(vectorConfig?.embeddingApi);
    try {
        const request = () => requestQueryVectors(texts, vectorConfig, options);
        return await (options.withQueryEmbedding ? options.withQueryEmbedding(request) : request());
    } finally {
        const trace = activity.finish();
        options.onActivity?.(trace);
    }
}

async function requestQueryVectors(texts, vectorConfig, { signal, onFailure, stage = 'round1-embed' }) {
    for (let attempt = 1; ; attempt++) {
        throwIfSignalAborted(signal);
        const startedAt = performance.now();
        try {
            const vectors = await embed(texts, vectorConfig, { timeout: QUERY_EMBEDDING_TIMEOUT_MS, signal });
            throwIfSignalAborted(signal);
            return vectors;
        } catch (cause) {
            throwIfSignalAborted(signal);
            onFailure?.({ attempt, error: cause, elapsedMs: Math.round(performance.now() - startedAt) });
            if (!canRetryRecallEmbedding(cause)) {
                const error = new globalThis.AggregateError([cause], SUMMARY_FEEDBACK_COPY.recallEmbeddingRequestFailed, { cause });
                error.code = 'RECALL_EMBEDDING_FAILED';
                error.stage = stage;
                throw error;
            }
        }
        await waitForAbortableDelay(QUERY_EMBEDDING_RETRY_DELAY_MS, signal);
    }
}
