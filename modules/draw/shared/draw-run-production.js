import { fetchImageBackendJobsStatus } from './backend-image-jobs.js';
import { publishDrawRunActivity } from './draw-run-activity.js';
import { hasDrawRunsCapability } from './draw-run-client.js';
import { submitDrawRun } from './draw-run-coordinator.js';
import { listActiveSwipeDrawRunMarkers } from './draw-run-markers.js';
import { listPendingImageJobs } from './pending-image-jobs.js';
import { isSceneSlotAlive } from './scene-placement.js';
import { hashSceneSource } from './scene-source.js';

export class DrawRunProductionError extends Error {
    constructor(message, code, { cause } = {}) {
        super(message, cause ? { cause } : undefined);
        this.name = 'DrawRunProductionError';
        this.code = code;
    }
}

const DRAW_RUN_PENDING_CODES = new Set([
    'DRAW_RUN_ALREADY_PENDING',
    'DRAW_RUN_IMAGE_JOB_PENDING',
]);
const DRAW_RUN_MAX_IMAGE_ITEMS = 20;

export function isDrawRunPendingError(error) {
    return DRAW_RUN_PENDING_CODES.has(String(error?.code || ''));
}

export function isDrawRunCancelledError(error) {
    return error?.name === 'AbortError'
        || error?.code === 'DRAW_RUN_CANCELLED'
        || error?.message === '已取消';
}

function userAbortError() {
    const error = new Error('已取消');
    error.name = 'AbortError';
    return error;
}

async function runBeforeMarker(task, signal) {
    try {
        return await task();
    } catch (error) {
        if (signal?.aborted) throw userAbortError();
        throw error;
    }
}

function emit(onStateChange, state, data = {}) {
    try {
        onStateChange?.(state, data);
    } catch (error) {
        console.warn('[Draw Run] 生产入口状态提示失败:', error);
    }
}

/**
 * Shared browser boundary for the three production providers. Provider-owned
 * prompt preparation and generation recipes stay injected here; this layer
 * only enforces capability, duplicate-target and reliable-submission rules.
 */
export async function submitProviderDrawRun({
    ctx,
    message,
    messageId,
    provider,
    signal,
    preparePlanner,
    createGenerationRecipe,
    automatic = false,
    getCurrentContext,
    syncActiveSwipe,
    isMessageBeingEdited,
    getHeaders = () => ctx?.getRequestHeaders?.() || {},
    statusLoader = fetchImageBackendJobsStatus,
    pendingJobsLoader = listPendingImageJobs,
    submit = submitDrawRun,
    onStateChange,
} = {}) {
    const normalizedProvider = String(provider || '').trim();
    if (!ctx || !message || !Number.isSafeInteger(messageId) || messageId < 0) {
        throw new DrawRunProductionError('当前楼层不可用，无法提交后台画图。', 'DRAW_RUN_TARGET_INVALID');
    }
    if (!normalizedProvider || typeof preparePlanner !== 'function'
        || typeof createGenerationRecipe !== 'function') {
        throw new TypeError('Draw Run 生产入口缺少 Provider 实现');
    }
    const targetSwipeIndex = Number.isInteger(message.swipe_id) ? message.swipe_id : 0;
    if (!Number.isSafeInteger(targetSwipeIndex) || targetSwipeIndex < 0) {
        throw new DrawRunProductionError('当前 swipe 不可用，无法提交后台画图。', 'DRAW_RUN_TARGET_INVALID');
    }
    const targetHash = hashSceneSource(String(message.mes ?? ''));
    // 排版替换以整条 swipe 为边界。用户即使在旧任务期间切换了 Provider，
    // 也不能再开第二批，否则后接管的一批会清理先接管批次的槽位。
    if (listActiveSwipeDrawRunMarkers(message).length > 0) {
        throw new DrawRunProductionError(
            '该楼层当前版本已有后台画图任务，请等待完成或先取消。',
            'DRAW_RUN_ALREADY_PENDING',
        );
    }
    if (typeof pendingJobsLoader !== 'function') {
        throw new TypeError('Draw Run 生产入口缺少后台图片日志读取器');
    }
    let pendingJobs;
    try {
        pendingJobs = await pendingJobsLoader();
    } catch (error) {
        throw new DrawRunProductionError(
            '暂时无法确认该楼层是否仍有后台图片任务，请稍后重试。',
            'DRAW_RUN_IMAGE_JOURNAL_UNAVAILABLE',
            { cause: error },
        );
    }
    const activeText = String(message.mes ?? '');
    const hasLiveImageJob = (Array.isArray(pendingJobs) ? pendingJobs : []).some(record => (
        record?.delivery?.mode === 'slots'
        && Array.isArray(record.items)
        && record.items.some(item => isSceneSlotAlive(activeText, item?.slotId))
    ));
    if (hasLiveImageJob) {
        throw new DrawRunProductionError(
            '该楼层当前版本仍有后台图片任务，请等待完成后再重新配图。',
            'DRAW_RUN_IMAGE_JOB_PENDING',
        );
    }

    emit(onStateChange, 'submitting', { label: '正在提交' });
    const status = await runBeforeMarker(() => statusLoader({ getHeaders, signal }), signal);
    if (signal?.aborted) {
        const error = new Error('已取消');
        error.name = 'AbortError';
        throw error;
    }
    if (status?.ready !== true) {
        throw new DrawRunProductionError(
            '后台画图服务不可用。请安装并启动当前 littlewhitebox-image-jobs，或关闭“后台任务”后使用浏览器流程。',
            'DRAW_RUN_BACKEND_UNAVAILABLE',
        );
    }
    if (!hasDrawRunsCapability(status)) {
        throw new DrawRunProductionError(
            '检测到旧版 littlewhitebox-image-jobs：缺少 draw-runs-v1。请更新后端插件并重启 SillyTavern；本次不会退回浏览器规划。',
            'DRAW_RUN_BACKEND_OUTDATED',
        );
    }

    const prepared = await runBeforeMarker(
        () => preparePlanner({ maxPlanImages: DRAW_RUN_MAX_IMAGE_ITEMS }),
        signal,
    );
    if (signal?.aborted) {
        const error = new Error('已取消');
        error.name = 'AbortError';
        throw error;
    }
    const generationRecipe = createGenerationRecipe(prepared);
    let result;
    try {
        result = await submit({
            ctx,
            getCurrentContext,
            message,
            messageId,
            targetSwipeIndex,
            targetHash,
            prepared,
            imageProvider: normalizedProvider,
            generationRecipe,
            automatic,
            syncActiveSwipe,
            isMessageBeingEdited,
            signal,
            onStateChange,
        });
    } catch (error) {
        // 可确认保存失败时 marker 可能已经落盘。唤醒恢复器，让它以持久化事实
        // 继续判定，而不是等用户切聊天或重新显示页面。
        if (error?.uncertain === true) {
            publishDrawRunActivity({
                provider: normalizedProvider,
                messageId,
                phase: 'uncertain',
                wakeRecovery: true,
            });
        }
        throw error;
    }
    publishDrawRunActivity({
        provider: normalizedProvider,
        messageId,
        phase: result.status,
        runId: result.runId,
        wakeRecovery: result.status === 'accepted' || result.status === 'uncertain',
    });
    return result;
}
