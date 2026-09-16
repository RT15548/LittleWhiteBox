import { formatErrorDetails } from '../../core/error-details.js';
import { formatMetricsLog } from './vector/retrieval/metrics.js';

// Owned by one recall run, never stored in chat metadata or configuration.
export function createRecallDiagnostics(chatId = '', type = 'normal') {
    return {
        chatId, type, startedAt: performance.now(), finishedAt: null,
        stage: 'prepare', reason: '', metrics: null, fallbacks: [],
    };
}

export function recordRecallFallback(diagnostics, stage, error) {
    diagnostics?.fallbacks.push({ stage, detail: formatErrorDetails(error, { includeStack: false }) });
}

export function formatRecallDiagnostics(diagnostics, { status, reason = '', error = null }) {
    const d = diagnostics;
    const outcome = status === 'success' && d.fallbacks.length ? 'degraded' : status;
    const labels = { success: '成功', degraded: '降级完成', empty: '空结果', failed: '失败', cancelled: '已取消' };
    const lines = [
        '[Recall Result] 本轮召回',
        `status: ${outcome} (${labels[outcome] || outcome})`,
        `chat: ${d.chatId || '-'} | type: ${d.type || 'normal'}`,
        `stage: ${d.stage}`,
        `elapsed: ${Math.max(0, Math.round((d.finishedAt ?? performance.now()) - d.startedAt))}ms`,
    ];
    if (reason || d.reason) lines.push(`reason: ${reason || d.reason}`);
    if (error) lines.push(`error: ${formatErrorDetails(error)}`);
    for (const fallback of d.fallbacks) lines.push(`fallback [${fallback.stage}]: ${fallback.detail}`);
    if (d.metrics) lines.push(formatMetricsLog(d.metrics, { complete: status === 'success' }));
    return lines.join('\n');
}

export function formatRecallReuseDiagnostics(diagnostics, memory) {
    return [
        '[Recall Reuse] 复用本轮记忆',
        `chat: ${diagnostics.chatId || '-'} | type: ${diagnostics.type || 'normal'}`,
        `来源楼层: ${memory.sourceIndex + 1}`,
        `elapsed: ${Math.max(0, Math.round((diagnostics.finishedAt ?? performance.now()) - diagnostics.startedAt))}ms`,
        '本次未执行召回、嵌入或重排。',
        '--- 来源召回报告（以下状态及耗时属于首次召回） ---',
        memory.report,
    ].join('\n');
}
