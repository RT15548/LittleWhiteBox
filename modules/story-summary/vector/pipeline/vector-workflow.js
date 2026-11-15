function getL0FailureCount(result) {
    return Math.max(0, Number(result?.llmFailed ?? result?.failed ?? 0) || 0);
}

/**
 * L1/L2 先独立补向量；L0 保持原来的提取事实、为成功事实补向量流程。
 * 各层保留已完成结果；任一阶段失败即停止本轮，避免继续向同一服务付费试错。
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
    const stoppedResult = (chunkResult, eventResult = null, l0Result = null) => ({
        chunkResult, eventResult, l0Result, l0VectorResult: null, l0Status: null,
        llmFailed: getL0FailureCount(l0Result), cancelled: false,
    });
    if (isCancelled()) return cancelledResult();
    const chunkResult = await buildChunks();
    if (isCancelled() || chunkResult?.status === 'cancelled' || chunkResult?.cancelled) return cancelledResult(chunkResult);
    if (chunkResult?.success === false) return stoppedResult(chunkResult);

    const eventResult = await repairEvents();
    if (isCancelled() || eventResult?.cancelled) return cancelledResult(chunkResult, null, eventResult);
    if (eventResult?.success === false) return stoppedResult(chunkResult, eventResult);

    const l0Result = await extract();
    if (isCancelled() || l0Result?.cancelled) {
        return cancelledResult(chunkResult, l0Result, eventResult);
    }

    if (getL0FailureCount(l0Result) > 0) return stoppedResult(chunkResult, eventResult, l0Result);

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
