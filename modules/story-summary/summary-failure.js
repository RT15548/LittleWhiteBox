import { SUMMARY_FEEDBACK_COPY as COPY } from './feedback-copy.js';
import { memorySaveError } from './data/memory-copy.js';

const MEMORY_FAILURES = new Set([
    'metadata_saving', 'source_boundary_invalid', 'summary_history_invalid', 'history_discontinuous',
    'metadata_source_changed', 'memory_cache_invalidation_failed', 'metadata_draft_conflict',
    'summary_chat_changed_before_save', 'metadata_not_saved', 'metadata_unconfirmed',
    'metadata_save_unconfirmed', 'metadata_save_conflict', 'metadata_incomplete_draft',
    'summary_metadata_save_unavailable', 'metadata_target_unavailable',
]);

/**
 * Model requests already redact the configured key at the text-api boundary.
 * Display only the error message, never request objects, headers or stack traces.
 */
export function summaryFailureReason(error) {
    const reasons = [], visited = new Set();
    // Wrappers identify the failed operation; causes explain why it failed.
    // Walk only these scalar fields, never serialize attached provider objects.
    for (let current = error; current != null && !visited.has(current); current = current?.cause) {
        visited.add(current);
        const code = typeof current === 'string' ? current : current?.code;
        const message = typeof current?.message === 'string' ? current.message : typeof current === 'string' ? current : '';
        let reason = message;
        if (Object.hasOwn(COPY.summaryFailureReasons, code)) reason = COPY.summaryFailureReasons[code];
        else if (MEMORY_FAILURES.has(code) || current?.uncertain) {
            reason = memorySaveError(current);
            if (message && message !== code) reason += `\n${message}`;
        }
        if (Number.isFinite(current?.status)) reason += ` (HTTP ${current.status})`;
        if (reason && !reasons.includes(reason)) reasons.push(reason);
    }
    return (reasons.join('\n') || COPY.summaryFailureReasons.unknown)
        .replace(/(Bearer\s+)[^\s"']+/giu, '$1[redacted]')
        .replace(/((?:api[_-]?key|key|access_token|authorization)["']?\s*[:=]\s*["']?)[^\s"'&,}]+/giu, '$1[redacted]');
}
