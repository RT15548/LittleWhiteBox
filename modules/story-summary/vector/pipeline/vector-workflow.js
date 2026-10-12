function getL0FailureCount(result) {
    return Math.max(0, Number(result?.llmFailed ?? result?.failed ?? 0) || 0);
}

/**
 * L1/L2 先独立补向量；L0 保持原来的提取事实、为成功事实补向量流程。
 * 各层分别记录成败，只有取消会阻止后续阶段，不以 L0 完整性限制 L1/L2。
 */
export async function runVectorMaintenance({ buildChunks, repairEvents, extract, vectorize, inspect, isCancelled = () => false }) {
    if ([buildChunks, repairEvents, extract, vectorize, inspect].some(stage => typeof stage !== 'function')) {
        throw new TypeError('Vector maintenance requires chunk, event, extract, vectorize, and inspect stages');
    }

    const cancelledResult = (chunkResult = null, l0Result = null, eventResult = null) => ({
        chunkResult,
        eventResult,
        l0Result,
        l0VectorResult: null,
        l0Status: null,
        llmFailed: getL0FailureCount(l0Result),
        cancelled: true,
    });
    if (isCancelled()) return cancelledResult();
    const chunkResult = await buildChunks();
    if (isCancelled() || chunkResult?.status === 'cancelled' || chunkResult?.cancelled) return cancelledResult(chunkResult);

    const eventResult = await repairEvents();
    if (isCancelled() || eventResult?.cancelled) return cancelledResult(chunkResult, null, eventResult);

    const l0Result = await extract();
    if (isCancelled() || l0Result?.cancelled) {
        return cancelledResult(chunkResult, l0Result, eventResult);
    }

    const l0VectorResult = await vectorize(l0Result)
        || { success: true, status: 'up_to_date', vectorized: 0 };
    const l0Status = await inspect();
    const llmFailed = getL0FailureCount(l0Result);
    const cancelled = isCancelled() || Boolean(l0VectorResult?.cancelled);

    return {
        chunkResult,
        eventResult,
        l0Result,
        l0VectorResult,
        l0Status,
        llmFailed,
        cancelled,
    };
}
