const DRAW_RUN_UI_STATES = new Set(['submitting', 'accepted', 'uncertain', 'cancelling']);

const ANALYSIS_STAGES = new Set([
    'planning',
    'prompt',
    'config',
    'request',
    'correction',
    'parse',
]);
const REATTACH_STAGES = new Set(['reattaching', 'delivering', 'dispatched']);

export function formatDrawRunProgress(detail = {}) {
    const run = detail.run && typeof detail.run === 'object' ? detail.run : null;
    const stage = String(detail.stage || run?.progress?.stage || run?.state || '').toLowerCase();
    if (stage === 'queued') return '排队';
    if (ANALYSIS_STAGES.has(stage)) return '分析中';
    if (REATTACH_STAGES.has(stage)) return '接回中';
    if (stage === 'compiling') return '准备中';
    if (stage === 'reconnecting') return '重连';
    if (stage === 'cooldown') return '等待中';

    const current = Number(detail.current);
    const total = Number(detail.total);
    if (Number.isInteger(current) && current > 0 && Number.isInteger(total) && total > 0) {
        return `${current}/${total}`;
    }
    return '生成中';
}

export function matchesDrawRunActivityDetail(detail = {}, { messageId, provider } = {}) {
    return (!detail.provider || detail.provider === provider)
        && (detail.messageId === undefined || Number(detail.messageId) === Number(messageId));
}

export function hasDrawRunProgressDetail(detail = {}) {
    return Boolean(
        (detail.run && typeof detail.run === 'object')
        || String(detail.stage || '').trim()
        || (Number.isInteger(Number(detail.current)) && Number.isInteger(Number(detail.total))),
    );
}

export function resolveDrawRunUiState({
    currentState,
    pending,
    detail = {},
    messageId,
    provider,
} = {}) {
    // submitting 是本页在 marker 写入前持有的临时态。共享恢复器此时看到
    // “没有 marker”并不能证明提交结束，不能把仍在预处理的按钮误重置为空闲。
    if (!pending && currentState === 'submitting') return currentState;
    if (!pending) return DRAW_RUN_UI_STATES.has(currentState) ? 'idle' : currentState;
    const matches = matchesDrawRunActivityDetail(detail, { messageId, provider });
    if (matches && detail.phase === 'cancelling') return 'cancelling';
    if (matches && detail.phase === 'cancel_failed') return 'accepted';
    if (currentState === 'cancelling') return 'cancelling';
    if (matches && detail.phase === 'uncertain') return 'uncertain';
    if (currentState === 'uncertain' && detail.phase === 'reconciled') return currentState;
    if (matches && ['accepted', 'active'].includes(detail.phase)) return 'accepted';
    // marker 只证明提交意图已经落盘，不证明 POST 已到达后台。刷新后的面板
    // 必须先显示“确认中”，直到恢复器实际发现 run，才能承诺“后台已接管”。
    return currentState === 'accepted' ? 'accepted' : 'uncertain';
}
