export const L1_GAP_WARNING_THRESHOLD = 5;

export function buildVectorIntegrityIssues({
    fingerprintMismatch = false,
    chunkFloorGap = 0,
    missingEventVectorCount = 0,
} = {}) {
    const issues = [];
    if (fingerprintMismatch) {
        issues.push({ code: 'fingerprint_mismatch', message: '向量引擎/模型已变更' });
    }

    const gap = Math.max(0, Math.trunc(Number(chunkFloorGap) || 0));
    if (gap >= L1_GAP_WARNING_THRESHOLD) {
        issues.push({ code: 'l1_gap', message: `${gap} 层片段未向量化` });
    }

    const missingEvents = Math.max(0, Math.trunc(Number(missingEventVectorCount) || 0));
    if (missingEvents > 0) {
        issues.push({ code: 'event_vectors_missing', message: `${missingEvents} 个事件未向量化` });
    }
    return issues;
}
