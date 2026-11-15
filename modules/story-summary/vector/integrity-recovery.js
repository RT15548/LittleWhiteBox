import { readEmbeddingFailure, getEmbeddingFailureDetails } from './llm/embedding-failure.js';

// Display thresholds never decide whether derived data needs recovery.
// One scan selects one bounded pass; the caller rechecks with all repairs off.
export function planVectorRecovery({ readOnly = false, fingerprintMismatch = false,
    cacheCheck, l0Status, missingEventCount = 0, metadataFailure = false,
    allowChunkRepair = true, allowStateRepair = true, allowEventRepair = true }) {
    if (readOnly || fingerprintMismatch || cacheCheck.sourceInvalid || cacheCheck.status === 'deferred') return [];
    if (cacheCheck.status === 'inconsistent' && !cacheCheck.repairable) return [];
    const stale = cacheCheck.status === 'inconsistent' && cacheCheck.repairable;
    const layers = [];
    if (allowChunkRepair && (metadataFailure || stale || cacheCheck.status === 'incomplete')) layers.push('L1');
    if (allowStateRepair && (stale || (l0Status.success && (l0Status.missing > 0 || l0Status.obsoleteCount > 0)))) layers.push('L0');
    if (allowEventRepair && (stale || missingEventCount > 0)) layers.push('L2');
    return layers;
}

export function mergeVectorRecoveryFailures(previous, layers, failures) {
    const untouched = (previous || []).filter(failure => failure.phase !== 'all' && !layers.includes(failure.phase));
    return [...untouched, ...failures];
}

// Preserve the actual failed boundary. A failed API or storage operation is
// not evidence that healthy cached vectors should be rebuilt.
export function classifyVectorRecoveryFailure(result) {
    const embedded = readEmbeddingFailure(result.error);
    const { code, httpStatus } = embedded ? getEmbeddingFailureDetails(result.error)
        : { code: result.code || result.error?.code, httpStatus: result.httpStatus };
    let reason = 'unknown';
    if (code === 'fingerprint_mismatch') reason = 'model_changed';
    else if (code === 'source_invalid') reason = 'source_invalid';
    else if (code === 'embedding_config_missing') reason = 'credentials';
    else if (code === 'embedding_url_invalid') reason = 'endpoint';
    else if (code === 'embedding_http_failed') {
        reason = httpStatus === 401 || httpStatus === 403 ? 'credentials'
            : httpStatus === 429 ? 'quota'
                : httpStatus >= 500 ? 'service' : 'request';
    } else if (code === 'embedding_timeout') reason = 'timeout';
    else if (code === 'embedding_network_failed') reason = 'network';
    else if (code === 'embedding_outcome_unknown') reason = 'outcome_unknown';
    else if (code === 'invalid_embedding_response') reason = 'response';
    else if (code === 'embedding_receipt_storage_failed') reason = 'request_record';
    else if (['index_read_failed', 'chunk_read_failed', 'state_vector_read_failed', 'event_vector_read_failed',
        'state_vector_write_failed', 'event_vector_write_failed', 'chunk_write_failed',
        'vector_write_failed', 'metadata_write_failed'].includes(code)) reason = 'storage';
    return { reason, ...(httpStatus ? { httpStatus } : {}) };
}
