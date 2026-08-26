import {
    saveChatAndConfirm,
    withConfirmableChatMutation,
} from './confirmable-chat-save.js';
import { createDrawRunId } from './draw-run-identifiers.js';
import {
    PAGE_FAREWELL_PREPARING_GRACE_MS,
    trackPageDrawRun,
    untrackPageDrawRun,
} from './page-farewell.js';
import { hashSceneSource, normalizeMessageSceneSourceText } from './scene-source.js';
import {
    createDrawRunMarker,
    getDrawRunMarkerText,
    getDrawRunAutomaticCompletion,
    persistedChatHasDrawRunAutomaticCompletion,
    persistedChatHasDrawRunMarker,
    persistedDrawRunTargetMatches,
    removeDrawRunMarker,
    setDrawRunAutomaticCompletion,
    setDrawRunMarker,
    listActiveSwipeDrawRunMarkers,
} from './draw-run-markers.js';

export const DRAW_RUNS_ENDPOINT = '/api/plugins/littlewhitebox-image-jobs/v1/draw-runs';
export const SUBMISSION_UNCERTAINTY_WINDOW_MS = 120_000;
export const DRAW_RUN_REQUEST_TIMEOUT_MS = 15_000;

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

function throwIfSubmissionAborted(signal) {
    if (!signal?.aborted) return;
    throw new DrawRunSubmissionError('已取消', 'DRAW_RUN_CANCELLED');
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

export function classifyMissingDrawRun(markerCreatedAt, now = Date.now(), farewell = null) {
    if (farewell?.kind === 'run' && Number.isFinite(Number(farewell.at))) {
        return Number(now) - Number(farewell.at) < PAGE_FAREWELL_PREPARING_GRACE_MS
            ? 'wait'
            : 'clear';
    }
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

function assertSubmissionContext({
    ctx,
    currentCtx,
    message,
    messageId,
    targetSwipeIndex,
    sourceHash,
    targetHash,
    isMessageBeingEdited,
}) {
    if (!ctx || !message || !Number.isSafeInteger(messageId) || messageId < 0) {
        throw new DrawRunSubmissionError('当前楼层不可用，无法提交后台画图。', 'DRAW_RUN_TARGET_INVALID');
    }
    if (String(currentCtx?.chatId || '') !== String(ctx.chatId || '')
        || currentCtx?.chat?.[messageId] !== message) {
        throw new DrawRunSubmissionError('聊天或楼层已切换，未提交后台画图。', 'DRAW_RUN_TARGET_CHANGED');
    }
    if (getActiveSwipeIndex(message) !== targetSwipeIndex) {
        throw new DrawRunSubmissionError('当前 swipe 已切换，未提交后台画图。', 'DRAW_RUN_TARGET_CHANGED');
    }
    const currentSourceHash = hashSceneSource(normalizeMessageSceneSourceText(message.mes));
    if (currentSourceHash !== sourceHash) {
        throw new DrawRunSubmissionError('楼层正文已变化，未提交后台画图。', 'DRAW_RUN_SOURCE_CHANGED');
    }
    if (hashSceneSource(String(message.mes ?? '')) !== targetHash) {
        throw new DrawRunSubmissionError('楼层内容已变化，未提交后台画图。', 'DRAW_RUN_TARGET_CHANGED');
    }
    if (isMessageBeingEdited(messageId) === true) {
        throw new DrawRunSubmissionError('请先结束楼层编辑，再提交后台画图。', 'DRAW_RUN_MESSAGE_EDITING');
    }
}

async function persistMarker({ ctx, runId, marker, saveAndConfirm, fetchImpl }) {
    // 首次提交的事实源是用户正在操作的活 ctx.chat。不能用整份持久化聊天做写前条件：
    // ST 的防抖保存和运行时内存归一化都可能让两份数据合法不同。目标楼层精确校验
    // 已在写 marker 前完成；这里只以保存后读回 marker 作为能否 POST Draw Run 的闸门。
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
    completeAutomatic = false,
}) {
    return withConfirmableChatMutation(ctx, async () => {
        const expectedText = getDrawRunMarkerText({ message, swipeIndex });
        const shouldCompleteAutomatic = completeAutomatic === true && marker?.automatic === true;
        const automaticWasComplete = shouldCompleteAutomatic
            ? getDrawRunAutomaticCompletion(message, swipeIndex, marker.provider)
            : false;
        const restoreAutomaticCompletion = () => {
            if (!shouldCompleteAutomatic || automaticWasComplete) return;
            setDrawRunAutomaticCompletion({
                message,
                messageId,
                swipeIndex,
                provider: marker.provider,
                completed: false,
                syncActiveSwipe,
            });
        };
        let removed = false;
        try {
            if (shouldCompleteAutomatic) {
                setDrawRunAutomaticCompletion({
                    message,
                    messageId,
                    swipeIndex,
                    provider: marker.provider,
                    completed: true,
                    syncActiveSwipe,
                });
            }
            removed = removeDrawRunMarker({
                message,
                messageId,
                swipeIndex,
                runId,
                syncActiveSwipe,
            });
        } catch (error) {
            restoreAutomaticCompletion();
            throw error;
        }
        if (!removed) {
            restoreAutomaticCompletion();
            return;
        }
        try {
            await saveAndConfirm({
                ctx,
                fetchImpl,
                precondition: persistedChat => persistedDrawRunTargetMatches(
                    persistedChat,
                    runId,
                    expectedText,
                    marker,
                ),
                verify: persistedChat => !persistedChatHasDrawRunMarker(persistedChat, runId)
                    && (!shouldCompleteAutomatic || persistedChatHasDrawRunAutomaticCompletion(
                        persistedChat,
                        { messageId, swipeIndex, provider: marker.provider },
                    )),
            });
        } catch (error) {
            // 无论保存是否已经尝试，本页都必须恢复 marker：保存结果不确定时，
            // 后续恢复器会读回持久化聊天，区分「远端已删」与「仍需再次删除」。
            // 否则本页只剩 journal，面对远端仍在的 marker 将永远失去删除入口。
            // auto_done 只有读回确认后才是本页事实；若远端其实已经写入，恢复器
            // 会在确认 marker 已消失时把该事实重新同步回来。
            restoreAutomaticCompletion();
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
    });
}

async function requestWithTimeout(fetchImpl, url, options, signal, timeoutMs) {
    const controller = new AbortController();
    const forwardAbort = () => controller.abort();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    signal?.addEventListener('abort', forwardAbort, { once: true });
    if (signal?.aborted) controller.abort();
    try {
        const response = await fetchImpl(url, { ...options, signal: controller.signal });
        const body = await parseResponse(response);
        return { response, body };
    } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', forwardAbort);
    }
}

async function querySubmittedRun({ fetchImpl, headers, runId, signal, timeoutMs }) {
    return requestWithTimeout(fetchImpl, `${DRAW_RUNS_ENDPOINT}/${encodeURIComponent(runId)}`, {
        method: 'GET',
        headers,
        cache: 'no-store',
    }, signal, timeoutMs);
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
    targetSwipeIndex,
    targetHash,
    prepared,
    imageProvider,
    generationRecipe,
    automatic = false,
    runId: suppliedRunId,
    cryptoImpl = globalThis.crypto,
    syncActiveSwipe,
    isMessageBeingEdited,
    fetchImpl = globalThis.fetch,
    saveAndConfirm = saveChatAndConfirm,
    signal,
    now = Date.now,
    onStateChange,
    requestTimeoutMs = DRAW_RUN_REQUEST_TIMEOUT_MS,
} = {}) {
    if (typeof fetchImpl !== 'function') throw new TypeError('Draw Run 提交需要 fetch');
    if (typeof saveAndConfirm !== 'function') throw new TypeError('Draw Run 提交需要可确认保存');
    if (typeof getCurrentContext !== 'function') throw new TypeError('Draw Run 提交需要当前聊天上下文读取器');
    if (typeof isMessageBeingEdited !== 'function') throw new TypeError('Draw Run 提交需要楼层编辑状态读取器');
    const frozenSwipeIndex = targetSwipeIndex === undefined
        ? getActiveSwipeIndex(message)
        : targetSwipeIndex;
    if (!Number.isSafeInteger(frozenSwipeIndex) || frozenSwipeIndex < 0) {
        throw new TypeError('Draw Run 提交缺少点击时的活动 swipe');
    }
    if (!String(targetHash || '').trim()) throw new TypeError('Draw Run 提交缺少目标楼层快照');
    if (!Number.isFinite(requestTimeoutMs) || requestTimeoutMs <= 0) {
        throw new TypeError('Draw Run 请求超时必须是正数');
    }
    throwIfSubmissionAborted(signal);
    const runId = suppliedRunId || createDrawRunId(cryptoImpl);
    const envelope = createScenePlannerEnvelope({ runId, imageProvider, prepared, generationRecipe });
    const marker = createDrawRunMarker({
        provider: envelope.imageProvider,
        sourceHash: envelope.sourceHash,
        targetHash,
        createdAt: now(),
        automatic,
    });
    const currentCtx = getCurrentContext();
    const swipeIndex = frozenSwipeIndex;
    assertSubmissionContext({
        ctx,
        currentCtx,
        message,
        messageId,
        targetSwipeIndex: frozenSwipeIndex,
        sourceHash: envelope.sourceHash,
        targetHash,
        isMessageBeingEdited,
    });
    if (listActiveSwipeDrawRunMarkers(message).length > 0) {
        throw new DrawRunSubmissionError(
            '该楼层当前版本已有后台画图任务，请等待完成或先取消。',
            'DRAW_RUN_ALREADY_PENDING',
        );
    }
    emit(onStateChange, 'submitting', { runId });
    try {
        await withConfirmableChatMutation(ctx, async () => {
            // Planner 预处理和锁等待都是异步窗口。持久化前重新确认点击时的
            // 聊天、楼层、swipe 与正文目标仍未变化。
            throwIfSubmissionAborted(signal);
            assertSubmissionContext({
                ctx,
                currentCtx: getCurrentContext(),
                message,
                messageId,
                targetSwipeIndex: frozenSwipeIndex,
                sourceHash: envelope.sourceHash,
                targetHash,
                isMessageBeingEdited,
            });
            if (listActiveSwipeDrawRunMarkers(message).length > 0) {
                throw new DrawRunSubmissionError(
                    '该楼层当前版本已有后台画图任务，请等待完成或先取消。',
                    'DRAW_RUN_ALREADY_PENDING',
                );
            }
            setDrawRunMarker({
                message,
                messageId,
                swipeIndex,
                runId,
                marker,
                syncActiveSwipe,
            });
            await persistMarker({
                ctx,
                runId,
                marker,
                saveAndConfirm,
                fetchImpl,
            });
        });
    } catch (error) {
        if (error instanceof DrawRunSubmissionError) {
            emit(onStateChange, 'failed', { runId, reason: error.code });
            throw error;
        }
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
        trackPageDrawRun(runId);
        ({ response, body } = await requestWithTimeout(fetchImpl, DRAW_RUNS_ENDPOINT, {
            method: 'POST',
            headers,
            body: JSON.stringify(envelope),
            cache: 'no-store',
        }, signal, requestTimeoutMs));
    } catch {
        try {
            if (headers) {
                try {
                    const queried = await querySubmittedRun({
                        fetchImpl,
                        headers,
                        runId,
                        signal,
                        timeoutMs: requestTimeoutMs,
                    });
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
        } finally {
            // 查询完成前 POST 的结果仍不确定；页面若在这段时间退出，必须留下 run 遗言。
            untrackPageDrawRun(runId);
        }
    }
    untrackPageDrawRun(runId);

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
    farewell = null,
    clear,
    now = Date.now,
} = {}) {
    if (classifyMissingDrawRun(marker?.createdAt, now(), farewell) === 'wait') return { action: 'wait' };
    await clear();
    return { action: 'cleared' };
}
