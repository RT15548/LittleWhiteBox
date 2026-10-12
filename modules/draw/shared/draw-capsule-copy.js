// Capsules have room for an icon and a two-character status. Details stay
// outside; numeric progress keeps its own formatting across providers.
export const DRAW_CAPSULE_COPY = Object.freeze({
    submitting: '提交',
    uncertain: '确认',
    unknown: '未知',
    queued: '排队',
    analysis: '分析',
    correction: '纠错',
    retry: '重试',
    reattaching: '接回',
    preparing: '准备',
    reconnecting: '重连',
    cooldown: '等待',
    generating: '生成',
    cancelling: '取消',
    legacy: '兼容',
    error: '失败',
});

/**
 * Agent 请求失败后的重试：有“第几次 / 共几次”就显示 `重2/3`，否则只显示“重试”。
 * 胶囊只有 74px，扣掉图标和边距后放不下 `重试1/3`（会被省略号截成 `重试1…`），所以带次数时压成单字“重”。
 */
export function formatPlannerRetryProgress(current, total) {
    const attempt = Number(current);
    const limit = Number(total);
    return Number.isInteger(attempt) && attempt > 0 && Number.isInteger(limit) && limit >= attempt
        ? `${DRAW_CAPSULE_COPY.retry.slice(0, 1)}${attempt}/${limit}`
        : DRAW_CAPSULE_COPY.retry;
}

export function toScenePlannerProgress(diagnostic = {}) {
    const progress = diagnostic?.progress;
    const phase = progress?.phase;
    if (phase === 'retry') {
        // 重试阶段带上“第几次 / 共几次”，界面据此显示 `重1/3`。
        // 放在专属的 retry 字段里，而不是顶层 current/total：楼层状态会把同楼层各任务的 current/total 求和覆盖到顶层
        // （图片张数），多任务时顶层数字就不再是“第几次重试”。
        const current = Number(progress.current);
        const total = Number(progress.total);
        return Number.isInteger(current) && current > 0 && Number.isInteger(total) && total >= current
            ? { phase, retry: { current, total } }
            : { phase };
    }
    return { phase: phase === 'correction' ? 'correction' : 'analysis' };
}

/** 入参是 toScenePlannerProgress 的投影（可能被楼层状态合并过）：重试次数只认 retry 字段，不读会被求和覆盖的顶层 current/total。 */
export function formatScenePlannerProgress(progress = {}) {
    if (progress?.phase === 'retry') return formatPlannerRetryProgress(progress.retry?.current, progress.retry?.total);
    return DRAW_CAPSULE_COPY[progress?.phase === 'correction' ? 'correction' : 'analysis'];
}
