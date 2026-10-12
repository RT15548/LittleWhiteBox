import { matchesDrawRunActivityTarget } from './draw-run-activity.js';
import { DRAW_CAPSULE_COPY, formatPlannerRetryProgress } from './draw-capsule-copy.js';

const DRAW_RUN_UI_STATES = new Set(['submitting', 'accepted', 'uncertain', 'cancelling']);
const DRAW_RUN_COMPLETION_TARGET_STATES = new Set(['idle', 'accepted', 'uncertain', 'cancelling']);

const ANALYSIS_STAGES = new Set([
    'planning',
    'prompt',
    'config',
    'request',
    'correction',
    'parse',
]);
const REATTACH_STAGES = new Set(['reattaching', 'delivering', 'dispatched']);

function getDrawRunProgressStage(detail) {
    const run = detail.run && typeof detail.run === 'object' ? detail.run : null;
    return String(detail.stage || run?.progress?.stage || run?.state || '').toLowerCase();
}

export function getDrawRunProgressIcon(detail = {}) {
    const phase = getDrawRunProgressPhase(detail);
    return phase === 'analysis' || phase === 'retry' ? '⏳' : '🎨';
}

export function getDrawRunProgressPhase(detail = {}) {
    const stage = getDrawRunProgressStage(detail);
    if (stage === 'queued') return 'queued';
    // 重试包括退避和随后实际执行的规划请求；底层 request / parse 阶段不覆盖轮次信息。
    if (stage === 'retry' || (ANALYSIS_STAGES.has(stage) && (detail.retry ?? detail.run?.progress?.retry))) return 'retry';
    if (ANALYSIS_STAGES.has(stage)) return 'analysis';
    if (REATTACH_STAGES.has(stage)) return 'reattaching';
    if (stage === 'compiling') return 'preparing';
    if (stage === 'reconnecting') return 'reconnecting';
    if (stage === 'cooldown') return 'cooldown';
    return 'generating';
}

export function formatDrawRunProgress(detail = {}) {
    const phase = getDrawRunProgressPhase(detail);
    if (phase === 'retry') {
        const retry = detail.retry ?? detail.run?.progress?.retry;
        return formatPlannerRetryProgress(retry?.current, retry?.total);
    }
    if (phase !== 'generating') return DRAW_CAPSULE_COPY[phase];
    const current = Number(detail.current);
    const total = Number(detail.total);
    if (Number.isInteger(current) && current > 0 && Number.isInteger(total) && total > 0) {
        return `${current}/${total}`;
    }
    return DRAW_CAPSULE_COPY.generating;
}

export function matchesDrawRunActivityDetail(detail = {}, target = {}) {
    return matchesDrawRunActivityTarget(detail, target);
}

export function hasDrawRunProgressDetail(detail = {}) {
    return Boolean(
        (detail.run && typeof detail.run === 'object')
        || String(detail.stage || '').trim()
        || (Number.isInteger(Number(detail.current)) && Number.isInteger(Number(detail.total))),
    );
}

export function resolveDrawRunActivityDetail({
    detail = {},
    pending = false,
    chatId,
    messageId,
    swipeIndex,
    provider,
    runId,
} = {}) {
    const target = { chatId, messageId, swipeIndex, provider, runId };
    if (matchesDrawRunActivityDetail(detail || {}, target)
        && !(pending && detail.phase === 'completed')) return detail;
    return {};
}

// Providers share this precedence: a failed cancellation is actionable, not
// evidence that an accepted backend task is still being cancelled.
export function resolveDrawRunPendingDetail(detail, pendingState, target) {
    const progress = pendingState.backendAccepted && !hasDrawRunProgressDetail(detail)
        ? { ...detail, stage: 'reattaching' } : detail;
    if (['cancelling', 'cancel_failed'].includes(detail.phase)) return progress;
    if (pendingState.cancelling) return { ...progress, ...target, phase: 'cancelling' };
    if (pendingState.backendAccepted) return { ...progress, ...target, phase: 'active' };
    return progress;
}

// Optimistic feedback belongs to the clicked view. A failed journal read/write
// may leave no durable event to recover it; restore only this still-current UI.
export async function runDrawCancellationAction({ cancel, isCurrent, getState, setState }) {
    const previous = getState();
    try {
        const operation = cancel();
        if (isCurrent()) setState('cancelling');
        return await operation;
    } catch (error) {
        if (isCurrent() && getState() === 'cancelling') setState(previous);
        throw error;
    }
}

export function resolveDrawRunUiState({
    currentState,
    pending,
    detail = {},
    chatId,
    messageId,
    swipeIndex,
    provider,
    runId,
} = {}) {
    const matches = matchesDrawRunActivityDetail(detail, {
        chatId,
        messageId,
        swipeIndex,
        provider,
        runId,
    });
    if (!pending && matches && detail.phase === 'completed'
        && DRAW_RUN_COMPLETION_TARGET_STATES.has(currentState)) {
        const success = Math.max(0, Number(detail.success) || 0);
        const total = Math.max(0, Number(detail.total) || 0);
        if (detail.aborted === true && success === 0) return 'idle';
        return total > 0 && success >= total ? 'success' : 'partial';
    }
    // submitting 是本页在 marker 写入前持有的临时态。共享恢复器此时看到
    // “没有 marker”并不能证明提交结束，不能把仍在预处理的按钮误重置为空闲。
    if (!pending && currentState === 'submitting') return currentState;
    if (!pending) return DRAW_RUN_UI_STATES.has(currentState) ? 'idle' : currentState;
    if (matches && detail.phase === 'cancelling') return 'cancelling';
    if (matches && detail.phase === 'cancel_failed') return 'accepted';
    if (currentState === 'cancelling') return 'cancelling';
    if (matches && detail.phase === 'uncertain') return 'uncertain';
    if (currentState === 'uncertain' && detail.phase === 'reconciled') return currentState;
    if (matches && ['accepted', 'active'].includes(detail.phase)) return 'accepted';
    // marker 只证明提交意图已经落盘，不证明 POST 已到达后台。刷新后的面板
    // 必须先显示“确认中”，直到恢复器实际发现 run，才能承诺“提交后台完成”。
    return currentState === 'accepted' ? 'accepted' : 'uncertain';
}
