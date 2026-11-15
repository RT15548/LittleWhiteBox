import { SUMMARY_FEEDBACK_COPY } from '../feedback-copy.js';
import { classifyVectorRecoveryFailure } from './integrity-recovery.js';

export const L1_GAP_WARNING_THRESHOLD = 5;
export const L0_GAP_WARNING_THRESHOLD = 5;

export function buildVectorIntegrityIssues({
    fingerprintMismatch = false,
    chunkFloorGap = 0,
    incompleteL0AnchorFloorCount = 0,
    missingL0VectorFloorCount = 0,
    missingEventVectorCount = 0,
    cacheInconsistent = false,
    cacheRepairable = false,
    cacheSourceInvalid = false,
    recoveryFailures = [],
} = {}) {
    const issues = [];
    const copy = SUMMARY_FEEDBACK_COPY.vectorIntegrity;
    // Invalid memory is not invalid derived data. Re-embedding the same source
    // cannot repair it, so never prescribe a paid cache rebuild here.
    if (cacheSourceInvalid) return [{ code: 'memory_source_invalid', action: 'restore_memory', message: copy.sourceInvalid }];
    if (fingerprintMismatch) {
        issues.push({ code: 'fingerprint_mismatch', action: 'rebuild', message: copy.fingerprintMismatch });
    }
    const gap = Math.max(0, Math.trunc(Number(chunkFloorGap) || 0));
    const vectorGap = Math.max(0, Math.trunc(Number(missingL0VectorFloorCount) || 0));
    const missingEvents = Math.max(0, Math.trunc(Number(missingEventVectorCount) || 0));
    const failures = fingerprintMismatch ? [] : recoveryFailures.filter(({ phase, result }) =>
        result.code === 'metadata_write_failed' || cacheInconsistent
        || (phase === 'all' && gap + vectorGap + missingEvents > 0)
        || (phase === 'L1' && gap > 0) || (phase === 'L0' && vectorGap > 0) || (phase === 'L2' && missingEvents > 0));
    for (const { result } of failures) {
        const failure = classifyVectorRecoveryFailure(result);
        if (!issues.some(issue => issue.code === 'recovery_failed' && issue.reason === failure.reason)) {
            issues.push({ code: 'recovery_failed', action: 'resolve_recovery', ...failure, message: copy.recoveryFailure(failure) });
        }
    }
    if (cacheInconsistent && (!cacheRepairable || !failures.length)) {
        issues.push({ code: 'cache_inconsistent', action: cacheRepairable ? 'fill' : 'rebuild', message: copy.cacheInconsistent });
    }
    if (gap >= L1_GAP_WARNING_THRESHOLD && !failures.some(failure => failure.phase === 'L1')) {
        issues.push({ code: 'l1_gap', action: 'fill', message: copy.l1Gap(gap) });
    }
    const anchorGap = Math.max(0, Math.trunc(Number(incompleteL0AnchorFloorCount) || 0));
    if (anchorGap >= L0_GAP_WARNING_THRESHOLD) {
        issues.push({ code: 'l0_gap', action: 'extract', message: copy.l0Gap(anchorGap) });
    }
    if (vectorGap >= L0_GAP_WARNING_THRESHOLD && !failures.some(failure => failure.phase === 'L0')) {
        issues.push({ code: 'l0_vectors_missing', action: 'fill', message: copy.l0VectorsMissing(vectorGap) });
    }
    if (missingEvents > 0 && !failures.some(failure => failure.phase === 'L2')) {
        issues.push({ code: 'event_vectors_missing', action: 'fill', message: copy.eventsMissing(missingEvents) });
    }
    return issues;
}
