import { removeWebSettings } from '../../agent-core/web/settings.js';
import { SERVER_PLUGIN_BASE } from '../../../shared/server-plugin/identity.js';
import { createConfirmableChatTarget } from './confirmable-chat-save.js';
import { createDrawRunId, deriveDrawRunChildJobId } from './draw-run-identifiers.js';
import { PAGE_FAREWELL_PREPARING_GRACE_MS, trackPageDrawRun, untrackPageDrawRun } from './page-farewell.js';
import { hashSceneSource, normalizeMessageSceneSourceText } from './scene-source.js';
import { createAdoptingPendingImageJob, forgetPendingImageJob, releasePendingImageJobLease } from './pending-image-jobs.js';
import { createDrawRunMarker, removeDrawRunMarker, setDrawRunAutomaticCompletion,
    setDrawRunMarker, listActiveSwipeDrawRunMarkers } from './draw-run-markers.js';

export const DRAW_RUNS_ENDPOINT = `${SERVER_PLUGIN_BASE}/v1/draw-runs`;
export const SUBMISSION_UNCERTAINTY_WINDOW_MS = 120_000;
export const DRAW_RUN_REQUEST_TIMEOUT_MS = 15_000;
const defaultJournal = { create: createAdoptingPendingImageJob, forget: forgetPendingImageJob, release: releasePendingImageJobLease };

export class DrawRunSubmissionError extends Error {
    constructor(message, code, options = {}) {
        super(message, options.cause ? { cause: options.cause } : undefined);
        this.name = 'DrawRunSubmissionError';
        this.code = code;
        this.status = Number(options.status) || 0;
        this.uncertain = options.uncertain === true;
    }
}

function emit(onStateChange, phase, detail = {}) {
    try {
        onStateChange?.(phase, { label: phase === 'submitting' ? '提交后台'
            : phase === 'accepted' ? '提交后台完成，可关闭页面'
                : phase === 'uncertain' ? '正在确认后台任务' : '提交失败', ...detail });
    } catch (error) { console.warn('[Draw Run] 状态提示失败:', error); }
}

export function createScenePlannerEnvelope({ runId, imageProvider, prepared, generationRecipe } = {}) {
    const sourceHash = String(prepared?.planner?.validationContext?.sceneSource?.sourceHash || '');
    if (prepared?.version !== 1 || !sourceHash || !prepared.planner || !prepared.agent?.providerConfig) {
        throw new TypeError('Scene Planner 预处理结果无法提交到后台');
    }
    const agent = structuredClone(prepared.agent);
    removeWebSettings(agent.providerConfig);
    delete agent.providerConfig.modelListAuth;
    return JSON.parse(JSON.stringify({ version: 1, runId, sourceHash, imageProvider: String(imageProvider || ''),
        planner: prepared.planner, agent, generationRecipe }));
}

export function classifyMissingDrawRun(markerCreatedAt, now = Date.now(), farewell = null) {
    if (farewell?.kind === 'run' && Number.isFinite(Number(farewell.at))) {
        return Number(now) - Number(farewell.at) < PAGE_FAREWELL_PREPARING_GRACE_MS ? 'wait' : 'clear';
    }
    return Math.max(0, Number(now) - Number(markerCreatedAt)) < SUBMISSION_UNCERTAINTY_WINDOW_MS ? 'wait' : 'clear';
}

// Removing a local marker is housekeeping, never permission to receive a paid
// image. The journal owns recovery until delivery and backend ACK are complete.
export function clearDrawRunMarker({ ctx, message, messageId, swipeIndex, runId, marker,
    syncActiveSwipe, completeAutomatic = false, requestSave = () => {} }) {
    if (completeAutomatic && marker?.automatic) setDrawRunAutomaticCompletion({
        message, messageId, swipeIndex, provider: marker.provider, completed: true, syncActiveSwipe,
    });
    removeDrawRunMarker({ message, messageId, swipeIndex, runId, syncActiveSwipe });
    requestSave(ctx);
}

async function requestWithTimeout(fetchImpl, url, options, signal, timeoutMs) {
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
    const timer = setTimeout(abort, timeoutMs);
    try {
        const response = await fetchImpl(url, { ...options, signal: controller.signal });
        const text = await response.text();
        let body;
        try { body = text ? JSON.parse(text) : {}; }
        catch { body = { error: text.slice(0, 500) }; }
        return { response, body };
    } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
}

export async function submitDrawRun({ ctx, getCurrentContext, message, messageId,
    targetSwipeIndex = message?.swipe_id ?? 0, targetHash, targetLength = String(message?.mes ?? '').length,
    prepared, imageProvider, generationRecipe, automatic = false, runId: suppliedRunId,
    cryptoImpl = globalThis.crypto, syncActiveSwipe, isMessageBeingEdited = () => false,
    fetchImpl = globalThis.fetch, journal = defaultJournal, owner, requestSave = () => {}, signal, now = Date.now,
    onStateChange, requestTimeoutMs = DRAW_RUN_REQUEST_TIMEOUT_MS, runtimeHeaders = {} } = {}) {
    const runId = suppliedRunId || createDrawRunId(cryptoImpl);
    const envelope = createScenePlannerEnvelope({ runId, imageProvider, prepared, generationRecipe });
    const marker = createDrawRunMarker({ provider: envelope.imageProvider, sourceHash: envelope.sourceHash,
        targetHash, sourceLength: targetLength, createdAt: now(), automatic });
    const assertTarget = () => {
        if (signal?.aborted) throw new DrawRunSubmissionError('已取消', 'DRAW_RUN_CANCELLED');
        const live = getCurrentContext();
        if (live?.chat !== ctx?.chat || live?.chat?.[messageId] !== message
            || (message.swipe_id ?? 0) !== targetSwipeIndex) {
            throw new DrawRunSubmissionError('聊天或楼层已切换，未提交后台画图。', 'DRAW_RUN_TARGET_CHANGED');
        }
        const prefix = String(message.mes ?? '').slice(0, targetLength);
        if (hashSceneSource(prefix) !== targetHash
            || hashSceneSource(normalizeMessageSceneSourceText(prefix)) !== envelope.sourceHash) {
            throw new DrawRunSubmissionError('原有正文已修改，未提交后台画图。', 'DRAW_RUN_SOURCE_CHANGED');
        }
        if (isMessageBeingEdited(messageId)) throw new DrawRunSubmissionError('请先结束楼层编辑。', 'DRAW_RUN_MESSAGE_EDITING');
    };
    assertTarget();
    if (listActiveSwipeDrawRunMarkers(message).length) {
        throw new DrawRunSubmissionError('该楼层已有后台画图任务。', 'DRAW_RUN_ALREADY_PENDING');
    }
    if (!owner) throw new DrawRunSubmissionError('当前聊天不可用。', 'DRAW_RUN_TARGET_INVALID');
    const headers = { ...ctx.getRequestHeaders(), ...runtimeHeaders };
    const target = { ctx, message, messageId, swipeIndex: targetSwipeIndex, runId, marker, syncActiveSwipe, requestSave };
    setDrawRunMarker(target);
    emit(onStateChange, 'submitting', { runId });
    let record;
    try {
        record = await journal.create({ jobId: deriveDrawRunChildJobId(runId), provider: imageProvider,
            originRunId: runId, sourceHash: envelope.sourceHash, chatTarget: createConfirmableChatTarget(ctx),
            submission: { owner, marker, messageDate: message.send_date ?? null },
            delivery: { mode: 'slots', chatId: String(ctx.chatId), messageId: String(messageId), swipeIndex: targetSwipeIndex, retainWithoutSlot: true },
            gallery: { chatId: String(ctx.chatId), messageId: String(messageId), characterName: message.name || '' }, items: [] });
        if (!record) throw new DrawRunSubmissionError('该楼层已有后台画图任务。', 'DRAW_RUN_ALREADY_PENDING');
        assertTarget();
    } catch (error) {
        clearDrawRunMarker(target);
        if (record) await journal.forget(record.jobId, record.leaseId);
        emit(onStateChange, 'failed', { runId, reason: error.code });
        throw error;
    }
    requestSave(ctx);
    trackPageDrawRun(runId);
    try {
        let response, body;
        try {
            ({ response, body } = await requestWithTimeout(fetchImpl, DRAW_RUNS_ENDPOINT, {
                method: 'POST', headers, body: JSON.stringify(envelope), cache: 'no-store',
            }, signal, requestTimeoutMs));
        } catch (submissionError) {
            // An uncertain POST is looked up, never resubmitted or repurchased.
            try {
                const queried = await requestWithTimeout(fetchImpl, `${DRAW_RUNS_ENDPOINT}/${encodeURIComponent(runId)}`,
                    { method: 'GET', headers, cache: 'no-store' }, undefined, requestTimeoutMs);
                if (queried.response.ok && queried.body?.run?.id === runId) {
                    emit(onStateChange, 'accepted', { runId, run: queried.body.run, recovered: true });
                    return { status: 'accepted', runId, run: queried.body.run, recovered: true };
                }
            } catch (error) { console.warn('[Draw Run] 任务查询暂不可用:', error); }
            console.warn('[Draw Run] 提交回执暂不可用:', submissionError);
            emit(onStateChange, 'uncertain', { runId, reason: 'submission_response_lost' });
            return { status: 'uncertain', runId, marker };
        }
        if (response.status === 202 && body?.run?.id === runId) {
            emit(onStateChange, 'accepted', { runId, run: body.run });
            return { status: 'accepted', runId, run: body.run };
        }
        if ((response.status >= 400 && response.status < 500)
            || (response.status >= 500 && body?.ok === false && body.code && body.error)) {
            clearDrawRunMarker(target);
            await journal.forget(record.jobId, record.leaseId);
            record = null;
            emit(onStateChange, 'failed', { runId, reason: body.code });
            throw new DrawRunSubmissionError(body.error || `后台拒绝了画图任务（HTTP ${response.status}）。`,
                body.code || 'DRAW_RUN_REJECTED', { status: response.status });
        }
        emit(onStateChange, 'uncertain', { runId, status: response.status });
        return { status: 'uncertain', runId, marker };
    } finally {
        untrackPageDrawRun(runId);
        if (record) await journal.release(record.jobId, record.leaseId);
    }
}

export async function reconcileMissingDrawRunMarker({ marker, farewell = null, clear, now = Date.now } = {}) {
    if (classifyMissingDrawRun(marker?.createdAt, now(), farewell) === 'wait') return { action: 'wait' };
    await clear();
    return { action: 'cleared' };
}
