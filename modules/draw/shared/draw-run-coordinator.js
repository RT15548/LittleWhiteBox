import { saveChatAndConfirm } from './confirmable-chat-save.js';
import { createDrawRunId } from './draw-run-identifiers.js';
import { hashSceneSource, normalizeMessageSceneSourceText } from './scene-source.js';
import {
    createDrawRunMarker,
    persistedChatHasDrawRunMarker,
    removeDrawRunMarker,
    setDrawRunMarker,
} from './draw-run-markers.js';

export const DRAW_RUNS_ENDPOINT = '/api/plugins/littlewhitebox-image-jobs/v1/draw-runs';
export const SUBMISSION_UNCERTAINTY_WINDOW_MS = 120_000;

export class DrawRunSubmissionError extends Error {
    constructor(message, code, options = {}) {
        super(message, options.cause ? { cause: options.cause } : undefined);
        this.name = 'DrawRunSubmissionError';
        this.code = code;
        this.status = Number(options.status) || 0;
        this.uncertain = options.uncertain === true;
    }
}

function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
}

function emit(onStateChange, phase, detail = {}) {
    try {
        onStateChange?.(phase, {
            label: phase === 'submitting'
                ? '正在提交'
                : phase === 'accepted'
                    ? '后台已接管'
                    : phase === 'uncertain'
                        ? '正在确认后台任务'
                        : '提交失败',
            ...detail,
        });
    } catch (error) {
        console.warn('[Draw Run] 状态提示失败:', error);
    }
}

function sanitizePreparedAgent(agent) {
    const snapshot = cloneJson(agent || {});
    if (!snapshot.providerConfig || typeof snapshot.providerConfig !== 'object') {
        throw new TypeError('Scene Planner 缺少可提交的 Agent Provider 配置');
    }
    delete snapshot.providerConfig.tavilyApiKey;
    delete snapshot.providerConfig.tavilyBaseUrl;
    return snapshot;
}

export function createScenePlannerEnvelope({
    runId,
    imageProvider,
    prepared,
    generationRecipe,
} = {}) {
    const sourceHash = String(prepared?.planner?.validationContext?.sceneSource?.sourceHash || '');
    if (prepared?.version !== 1 || !sourceHash || !prepared.planner || !prepared.agent) {
        throw new TypeError('Scene Planner 预处理结果无法提交到后台');
    }
    return cloneJson({
        version: 1,
        runId,
        sourceHash,
        imageProvider: String(imageProvider || ''),
        planner: prepared.planner,
        agent: sanitizePreparedAgent(prepared.agent),
        generationRecipe,
    });
}

export function classifyMissingDrawRun(markerCreatedAt, now = Date.now()) {
    const age = Math.max(0, Number(now) - Number(markerCreatedAt));
    return age < SUBMISSION_UNCERTAINTY_WINDOW_MS ? 'wait' : 'clear';
}

async function parseResponse(response) {
    const text = await response.text().catch(() => '');
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch {
        return { error: text.slice(0, 500) };
    }
}

function getActiveSwipeIndex(message) {
    const index = Number.isInteger(message?.swipe_id) ? message.swipe_id : 0;
    if (!Number.isSafeInteger(index) || index < 0) {
        throw new DrawRunSubmissionError('当前 swipe 不可用，无法提交后台画图。', 'DRAW_RUN_TARGET_INVALID');
    }
    return index;
}

function assertSubmissionContext({ ctx, currentCtx, message, messageId, sourceHash, isMessageBeingEdited }) {
    if (!ctx || !message || !Number.isSafeInteger(messageId) || messageId < 0) {
        throw new DrawRunSubmissionError('当前楼层不可用，无法提交后台画图。', 'DRAW_RUN_TARGET_INVALID');
    }
    if (String(currentCtx?.chatId || '') !== String(ctx.chatId || '')
        || currentCtx?.chat?.[messageId] !== message) {
        throw new DrawRunSubmissionError('聊天或楼层已切换，未提交后台画图。', 'DRAW_RUN_TARGET_CHANGED');
    }
    const currentSourceHash = hashSceneSource(normalizeMessageSceneSourceText(message.mes));
    if (currentSourceHash !== sourceHash) {
        throw new DrawRunSubmissionError('楼层正文已变化，未提交后台画图。', 'DRAW_RUN_SOURCE_CHANGED');
    }
    if (isMessageBeingEdited(messageId) === true) {
        throw new DrawRunSubmissionError('请先结束楼层编辑，再提交后台画图。', 'DRAW_RUN_MESSAGE_EDITING');
    }
}

async function persistMarker({ ctx, runId, marker, saveAndConfirm, fetchImpl }) {
    await saveAndConfirm({
        ctx,
        fetchImpl,
        verify: persistedChat => persistedChatHasDrawRunMarker(persistedChat, runId, marker),
    });
}

export async function clearDrawRunMarkerAndConfirm({
    ctx,
    message,
    messageId,
    swipeIndex,
    runId,
    marker,
    syncActiveSwipe,
    saveAndConfirm,
    fetchImpl,
}) {
    const removed = removeDrawRunMarker({
        message,
        messageId,
        swipeIndex,
        runId,
        syncActiveSwipe,
    });
    if (!removed) return;
    try {
        await saveAndConfirm({
            ctx,
            fetchImpl,
            verify: persistedChat => !persistedChatHasDrawRunMarker(persistedChat, runId),
        });
    } catch (error) {
        setDrawRunMarker({
            message,
            messageId,
            swipeIndex,
            runId,
            marker,
            syncActiveSwipe,
        });
        throw error;
    }
}

async function querySubmittedRun({ fetchImpl, headers, runId, signal }) {
    const response = await fetchImpl(`${DRAW_RUNS_ENDPOINT}/${encodeURIComponent(runId)}`, {
        method: 'GET',
        headers,
        cache: 'no-store',
        signal,
    });
    const body = await parseResponse(response);
    return { response, body };
}

/**
 * Performs the reliable browser half of Draw Run submission. It deliberately
 * stops at HTTP 202; child adoption belongs to the recovery layer.
 */
export async function submitDrawRun({
    ctx,
    getCurrentContext,
    message,
    messageId,
    prepared,
    imageProvider,
    generationRecipe,
    runId: suppliedRunId,
    cryptoImpl = globalThis.crypto,
    syncActiveSwipe,
    isMessageBeingEdited,
    fetchImpl = globalThis.fetch,
    saveAndConfirm = saveChatAndConfirm,
    signal,
    now = Date.now,
    onStateChange,
} = {}) {
    if (typeof fetchImpl !== 'function') throw new TypeError('Draw Run 提交需要 fetch');
    if (typeof saveAndConfirm !== 'function') throw new TypeError('Draw Run 提交需要可确认保存');
    if (typeof getCurrentContext !== 'function') throw new TypeError('Draw Run 提交需要当前聊天上下文读取器');
    if (typeof isMessageBeingEdited !== 'function') throw new TypeError('Draw Run 提交需要楼层编辑状态读取器');
    const runId = suppliedRunId || createDrawRunId(cryptoImpl);
    const envelope = createScenePlannerEnvelope({ runId, imageProvider, prepared, generationRecipe });
    const marker = createDrawRunMarker({
        provider: envelope.imageProvider,
        sourceHash: envelope.sourceHash,
        createdAt: now(),
    });
    const currentCtx = getCurrentContext();
    const swipeIndex = getActiveSwipeIndex(message);
    assertSubmissionContext({
        ctx,
        currentCtx,
        message,
        messageId,
        sourceHash: envelope.sourceHash,
        isMessageBeingEdited,
    });
    emit(onStateChange, 'submitting', { runId });
    setDrawRunMarker({
        message,
        messageId,
        swipeIndex,
        runId,
        marker,
        syncActiveSwipe,
    });

    try {
        await persistMarker({ ctx, runId, marker, saveAndConfirm, fetchImpl });
    } catch (error) {
        emit(onStateChange, 'uncertain', { runId, reason: 'marker_save_uncertain' });
        throw new DrawRunSubmissionError(
            '后台画图标记未能确认写入，任务没有提交；请保留当前楼层并稍后重试。',
            'DRAW_RUN_MARKER_SAVE_UNCERTAIN',
            { cause: error, uncertain: true },
        );
    }

    let headers = null;
    let response;
    let body;
    try {
        if (typeof ctx.getRequestHeaders !== 'function') {
            throw new TypeError('当前酒馆上下文无法提供请求头');
        }
        headers = ctx.getRequestHeaders();
        response = await fetchImpl(DRAW_RUNS_ENDPOINT, {
            method: 'POST',
            headers,
            body: JSON.stringify(envelope),
            cache: 'no-store',
            signal,
        });
        body = await parseResponse(response);
    } catch (error) {
        if (headers) {
            try {
                const queried = await querySubmittedRun({ fetchImpl, headers, runId, signal });
                if (queried.response.ok && queried.body?.run?.id === runId) {
                    emit(onStateChange, 'accepted', { runId, run: queried.body.run, recovered: true });
                    return { status: 'accepted', runId, run: queried.body.run, recovered: true };
                }
            } catch {
                // Both requests are indeterminate; the persisted marker owns later reconciliation.
            }
        }
        emit(onStateChange, 'uncertain', { runId, reason: 'submission_response_lost' });
        return { status: 'uncertain', runId, marker };
    }

    if (response.status === 202 && body?.run?.id === runId) {
        emit(onStateChange, 'accepted', { runId, run: body.run });
        return { status: 'accepted', runId, run: body.run };
    }

    if (response.status >= 400 && response.status < 500) {
        try {
            await clearDrawRunMarkerAndConfirm({
                ctx,
                message,
                messageId,
                swipeIndex,
                runId,
                marker,
                syncActiveSwipe,
                saveAndConfirm,
                fetchImpl,
            });
        } catch (cleanupError) {
            emit(onStateChange, 'uncertain', { runId, reason: 'rejected_marker_cleanup_uncertain' });
            throw new DrawRunSubmissionError(
                body?.error || `后台拒绝了画图任务（HTTP ${response.status}），且提交标记清理结果不确定。`,
                body?.code || 'DRAW_RUN_REJECTED',
                { status: response.status, cause: cleanupError, uncertain: true },
            );
        }
        emit(onStateChange, 'failed', { runId, status: response.status });
        throw new DrawRunSubmissionError(
            body?.error || `后台拒绝了画图任务（HTTP ${response.status}）。`,
            body?.code || 'DRAW_RUN_REJECTED',
            { status: response.status },
        );
    }

    emit(onStateChange, 'uncertain', { runId, status: response.status });
    return { status: 'uncertain', runId, marker };
}

export async function reconcileMissingDrawRunMarker({
    marker,
    clear,
    now = Date.now,
} = {}) {
    if (classifyMissingDrawRun(marker?.createdAt, now()) === 'wait') return { action: 'wait' };
    await clear();
    return { action: 'cleared' };
}
