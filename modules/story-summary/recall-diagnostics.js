import { formatErrorDetails } from '../../core/error-details.js';
import { formatMetricsLog } from './vector/retrieval/metrics.js';

const MAX_OBSERVATIONS = 256;
const isReleaseReceipt = event => event.phase === 'release-start' || event.phase === 'release-end';

// Owned by one recall run, never stored in chat metadata or configuration.
export function createRecallDiagnostics(chatId = '', type = 'normal') {
    let stage = 'prepare';
    const diagnostics = {
        chatId, type, startedAt: performance.now(), finishedAt: null,
        reason: '', metrics: null, fallbacks: [], observations: [],
        backend: null, index: null,
        get stage() { return stage; },
        set stage(value) {
            if (stage === value || diagnostics.finishedAt !== null) return;
            stage = value;
            recordRecallObservation(diagnostics, 'recall', { phase: value });
        },
    };
    return diagnostics;
}

// A small per-run timeline: no message text, vectors, or configuration snapshots.
// Parallel index preparation records its own events without replacing the foreground stage.
export function recordRecallObservation(diagnostics, channel, event) {
    if (!diagnostics?.observations || (diagnostics.finishedAt !== null
        && !['host', 'preparation'].includes(channel) && !(channel === 'runtime' && isReleaseReceipt(event)))) return;
    const entry = { at: Math.max(0, Math.round(performance.now() - diagnostics.startedAt)), channel, phase: event.phase };
    for (const key of ['backend', 'reused', 'mode', 'documentCount']) {
        if (event[key] !== undefined) entry[key] = event[key];
    }
    if (event.error) entry.error = formatErrorDetails(event.error, { includeStack: false });
    diagnostics.observations.push(entry);
    if (diagnostics.observations.length > MAX_OBSERVATIONS) diagnostics.observations.shift();
}

export function recordRecallRuntimeProgress(diagnostics, event) {
    if (!diagnostics || (diagnostics.finishedAt !== null && !isReleaseReceipt(event))) return;
    recordRecallObservation(diagnostics, 'runtime', event);
    if (event.phase === 'backend-ready') {
        diagnostics.backend = event.backend;
        if (event.backend === 'main-fallback' && !diagnostics.fallbacks.some(item => item.stage === 'runtime-backend')) {
            recordRecallFallback(diagnostics, 'runtime-backend', event.error);
        }
    } else if (event.phase === 'worker-start') {
        diagnostics.stage = 'worker-start';
    } else if (event.phase === 'load-start') {
        diagnostics.stage = event.backend === 'main-fallback' ? 'main-load' : 'worker-load';
    }
}

export function recordRecallIndexProgress(diagnostics, event) {
    if (!diagnostics || diagnostics.finishedAt !== null) return;
    recordRecallObservation(diagnostics, 'index', event);
    diagnostics.index = { phase: event.phase, mode: event.mode };
}

export function recallProgressStage(diagnostics) {
    const { stage, backend, index } = diagnostics;
    if (stage === 'round1-retrieval' || stage === 'round2-retrieval') {
        if (backend === 'worker') return 'worker-retrieval';
        if (backend === 'main-fallback') return 'main-retrieval';
    }
    if (stage === 'index-wait') {
        if (index?.phase === 'build') return 'index-build';
        if (index?.phase === 'update') return 'index-update';
    }
    return stage;
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
    if (d.backend) lines.push(`backend: ${d.backend}`);
    if (reason || d.reason) lines.push(`reason: ${reason || d.reason}`);
    if (error) lines.push(`error: ${formatErrorDetails(error)}`);
    for (const fallback of d.fallbacks) lines.push(`fallback [${fallback.stage}]: ${fallback.detail}`);
    for (const { at, channel, phase, ...detail } of d.observations || []) {
        lines.push(`+${at}ms [${channel}] ${phase}${Object.keys(detail).length ? ` ${JSON.stringify(detail)}` : ''}`);
    }
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
