function getL0FailureCount(result) {
    return Math.max(0, Number(result?.llmFailed ?? result?.failed ?? 0) || 0);
}

/**
 * 锚点准备阶段的唯一顺序：先提交 L0 事实，再为所有已成功事实补向量。L0 部分失败
 * 不得跳过成功锚点的向量化，但只有两阶段都完整时才允许继续构建 L1。
 */
export async function runAnchorPreparation({ extract, vectorize, inspect, isCancelled = () => false }) {
    if (typeof extract !== 'function' || typeof vectorize !== 'function' || typeof inspect !== 'function') {
        throw new TypeError('Anchor preparation requires extract, vectorize, and inspect stages');
    }

    const l0Result = await extract();
    if (isCancelled() || l0Result?.cancelled) {
        return {
            l0Result,
            l0VectorResult: null,
            l0Status: null,
            llmFailed: getL0FailureCount(l0Result),
            cancelled: true,
            canBuildL1: false,
        };
    }

    const l0VectorResult = await vectorize(l0Result)
        || { success: true, status: 'up_to_date', vectorized: 0 };
    const l0Status = await inspect();
    const llmFailed = getL0FailureCount(l0Result);
    const cancelled = isCancelled() || Boolean(l0VectorResult?.cancelled);
    const incompleteFloors = Math.max(0, Number(l0Status?.incomplete) || 0);

    return {
        l0Result,
        l0VectorResult,
        l0Status,
        llmFailed,
        cancelled,
        canBuildL1: !cancelled
            && llmFailed === 0
            && incompleteFloors === 0
            && l0VectorResult.success === true,
    };
}
