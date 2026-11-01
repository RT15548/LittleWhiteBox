import { isRetryableEmbeddingFailure, readEmbeddingFailure } from '../llm/embedding-failure.js';

export const QUERY_EMBEDDING_RETRY_DELAY_MS = 1000;

// Foreground retries stay within the caller's generation and cancellation scope.
// Background maintenance keeps its existing backoff.
export function canRetryRecallEmbedding(error) {
    const failure = readEmbeddingFailure(error);
    return isRetryableEmbeddingFailure(error)
        && !(failure?.kind === 'http' && Number(failure.status) === 429);
}
