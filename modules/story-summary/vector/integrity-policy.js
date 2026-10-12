import { SUMMARY_FEEDBACK_COPY } from '../feedback-copy.js';

export const L1_GAP_WARNING_THRESHOLD = 5;
export const L0_GAP_WARNING_THRESHOLD = 5;

export function buildVectorIntegrityIssues({
    fingerprintMismatch = false,
    chunkFloorGap = 0,
    incompleteL0FloorCount = 0,
    missingEventVectorCount = 0,
    cacheInconsistent = false,
} = {}) {
    const issues = [];
    const copy = SUMMARY_FEEDBACK_COPY.vectorIntegrity;
    if (fingerprintMismatch) {
        issues.push({ code: 'fingerprint_mismatch', action: 'rebuild', message: copy.fingerprintMismatch });
    }
    if (cacheInconsistent) {
        issues.push({ code: 'cache_inconsistent', action: 'rebuild', message: copy.cacheInconsistent });
    }

    const gap = Math.max(0, Math.trunc(Number(chunkFloorGap) || 0));
    if (gap >= L1_GAP_WARNING_THRESHOLD) {
        issues.push({ code: 'l1_gap', action: 'fill', message: copy.l1Gap(gap) });
    }

    const l0Gap = Math.max(0, Math.trunc(Number(incompleteL0FloorCount) || 0));
    if (l0Gap >= L0_GAP_WARNING_THRESHOLD) {
        issues.push({ code: 'l0_gap', action: 'fill', message: copy.l0Gap(l0Gap) });
    }

    const missingEvents = Math.max(0, Math.trunc(Number(missingEventVectorCount) || 0));
    if (missingEvents > 0) {
        issues.push({ code: 'event_vectors_missing', action: 'fill', message: copy.eventsMissing(missingEvents) });
    }
    return issues;
}
