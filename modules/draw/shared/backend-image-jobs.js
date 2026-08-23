const JOBS_ENDPOINT = '/api/plugins/littlewhitebox-image-jobs/v1/jobs';
const STATUS_ENDPOINT = '/api/plugins/littlewhitebox-image-jobs/status';
const DEFAULT_REQUEST_TIMEOUT = 15_000;
const DEFAULT_MAX_CONSECUTIVE_RETRIES = 6;
const DEFAULT_MAX_RETRY_DELAY = 10_000;

export const IMAGE_BATCH_JOBS_CAPABILITY = 'image-batch-jobs-v1';

const forcedDetachSignals = new WeakSet();

export class ImageBackendJobsError extends Error {
    constructor(message, { status = 0, code = 'backend_job_error', retriable = false, cause } = {}) {
        super(message);
        this.name = 'ImageBackendJobsError';
        this.status = status;
        this.code = code;
        this.retriable = retriable;
        if (cause !== undefined) this.cause = cause;
    }
}

function isTerminalJob(job) {
    return job?.state === 'completed' || job?.state === 'cancelled';
}

// 后端任务的生命周期独立于浏览器：重试耗尽、响应无法解析、页面被销毁都只说明本地链路断了，
// 任务很可能还在跑，取消或删除会毁掉唯一一份结果。唯一能确定任务已经消失的信号是 404
// job_not_found（被 TTL 回收或从未创建成功），只有那时才允许调用方作废本地恢复记录。
function isDetachedError(error) {
    return error?.code !== 'job_not_found';
}

async function readErrorResponse(response) {
    const data = await response.json().catch(() => null);
    return {
        message: String(data?.error?.message || data?.error || `HTTP ${response.status}`),
        code: typeof data?.code === 'string' ? data.code : '',
    };
}

function createResponseError(response, errorResponse) {
    return new ImageBackendJobsError(errorResponse.message, {
        status: response.status,
        code: response.status === 404 ? 'job_not_found' : errorResponse.code || 'backend_job_http_error',
        retriable: response.status === 408 || response.status >= 500,
    });
}

async function safeNotify(callback, ...args) {
    try {
        await callback?.(...args);
    } catch (error) {
        console.error('[ImageJobs] 后端任务状态回调失败:', error);
    }
}

function createAbortError() {
    const error = new Error('The operation was aborted');
    error.name = 'AbortError';
    return error;
}

function createDetachedError(jobId) {
    const error = new ImageBackendJobsError('前端已停止监控，后台任务继续运行', {
        code: 'backend_job_detached',
    });
    error.detached = true;
    error.jobId = jobId;
    return error;
}

// 后端 item error 是 { code, status?, message } 的纯对象。转成 Error 时必须保留 status/code，
// 否则前端只能靠 message 猜分类，401/429 这类正文没写数字的错误会退化成“未知错误”。
export function createBackendItemError(item) {
    // alreadyDelivered 的项是成功事实（早先已交付并 ACK），调用方必须从画廊恢复而不是报错。
    if (item?.alreadyDelivered === true) return null;
    if (item?.state === 'cancelled') {
        return new ImageBackendJobsError('已取消', { code: 'cancelled' });
    }
    const raw = item?.error || null;
    if (raw?.code === 'timeout') {
        return new ImageBackendJobsError(raw.message || '请求超时', { code: 'timeout' });
    }
    return new ImageBackendJobsError(String(raw?.message || '后端生图失败'), {
        status: Number.isInteger(raw?.status) ? raw.status : 0,
        code: String(raw?.code || 'backend_item_failed'),
    });
}

export async function readImageBlobBase64(blob) {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = String(reader.result || '').split(',')[1] || '';
            if (!base64) reject(new Error('图片结果为空'));
            else resolve(base64);
        };
        reader.onerror = () => reject(reader.error || new Error('图片读取失败'));
        reader.readAsDataURL(blob);
    });
}

export async function readImageBackendResultBase64(response) {
    try {
        return await readImageBlobBase64(await response.blob());
    } catch (error) {
        if (error instanceof ImageBackendJobsError) throw error;
        throw new ImageBackendJobsError('后端图片结果读取中断', {
            code: 'backend_result_interrupted',
            retriable: true,
            cause: error,
        });
    }
}

export function reportImageBackendJobState(onStateChange, state, data = {}) {
    if (data.abortRequested) return onStateChange?.('cancelling', data);
    if (state === 'reconnecting') return onStateChange?.('reconnecting', data);
    if (state !== 'status') return;
    const job = data.job;
    const running = job.items.find(item => item.state === 'running');
    const queued = job.items.find(item => item.state === 'queued');
    if (job.state === 'running' && running) {
        onStateChange?.('progress', { current: running.index + 1, total: job.total });
    } else if (job.state === 'cooldown') {
        onStateChange?.('cooldown', {
            duration: Math.max(0, Number(job.cooldownUntil || 0) - Date.now()),
            cooldownUntil: job.cooldownUntil,
            nextIndex: (queued?.index ?? 0) + 1,
            total: job.total,
        });
    } else if (job.state === 'queued') {
        onStateChange?.('queued', {
            current: (queued?.index ?? 0) + 1,
            total: job.total,
            ahead: job.queueAhead,
            position: Number(job.queueAhead || 0) + 1,
        });
    }
}

export function hasImageBackendJobsCapability(status) {
    return status?.ready === true
        && Array.isArray(status.capabilities)
        && status.capabilities.includes(IMAGE_BATCH_JOBS_CAPABILITY);
}

export function createImageBackendJobMonitorRegistry({ active: initiallyActive = true } = {}) {
    const controllers = new Set();
    let active = initiallyActive;
    let generation = 0;
    return {
        activate() {
            active = true;
        },
        captureGeneration() {
            return generation;
        },
        createScope(lifecycleSignal, expectedGeneration = generation) {
            const controller = new AbortController();
            const detach = () => controller.abort();
            lifecycleSignal?.addEventListener('abort', detach, { once: true });
            if (lifecycleSignal?.aborted) detach();
            if (!active || expectedGeneration !== generation) detach();
            controllers.add(controller);
            return {
                signal: controller.signal,
                dispose() {
                    lifecycleSignal?.removeEventListener('abort', detach);
                    controllers.delete(controller);
                },
            };
        },
        detachAll() {
            for (const controller of controllers) {
                forcedDetachSignals.add(controller.signal);
                controller.abort();
            }
            controllers.clear();
        },
        deactivate() {
            active = false;
            generation++;
            this.detachAll();
        },
    };
}

export async function fetchImageBackendJobsStatus({
    fetchImpl = globalThis.fetch,
    getHeaders = () => ({}),
    signal,
    timeout = 5000,
} = {}) {
    if (signal?.aborted) throw createAbortError();
    const controller = new AbortController();
    const forwardAbort = () => controller.abort();
    const timer = setTimeout(() => controller.abort(), timeout);
    signal?.addEventListener('abort', forwardAbort, { once: true });
    try {
        const response = await fetchImpl(STATUS_ENDPOINT, {
            method: 'GET',
            headers: getHeaders(),
            signal: controller.signal,
        });
        if (!response.ok) return { ready: false };
        const data = await response.json().catch(() => null);
        return data?.ok === true
            ? { ready: true, version: String(data.version || ''), capabilities: Array.isArray(data.capabilities) ? data.capabilities.map(String) : [] }
            : { ready: false };
    } catch (error) {
        if (signal?.aborted) throw error;
        return { ready: false };
    } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', forwardAbort);
    }
}

export function createImageBackendJobsClient({
    fetchImpl = globalThis.fetch,
    getHeaders = () => ({}),
    documentRef = globalThis.document,
    pollInterval = 1000,
    requestTimeout = DEFAULT_REQUEST_TIMEOUT,
    maxConsecutiveRetries = DEFAULT_MAX_CONSECUTIVE_RETRIES,
    maxRetryDelay = DEFAULT_MAX_RETRY_DELAY,
    createRequestId = () => globalThis.crypto?.randomUUID?.()
        || `job-${Date.now()}-${Math.random().toString(36).slice(2)}`,
} = {}) {
    if (typeof fetchImpl !== 'function') throw new TypeError('fetchImpl is required');
    const retryLimit = Math.max(0, Math.floor(Number(maxConsecutiveRetries) || 0));

    function retryDelay(attempt) {
        return Math.min(Math.max(1, pollInterval) * (2 ** Math.max(0, attempt - 1)), maxRetryDelay);
    }

    function createConnectionError(message, error) {
        return new ImageBackendJobsError(message, {
            code: 'backend_job_unreachable',
            retriable: true,
            cause: error,
        });
    }

    function createRetryExhaustedError(error) {
        return new ImageBackendJobsError('后端图片任务服务持续不可用，请检查连接后重试', {
            status: error.status,
            code: 'backend_job_retry_exhausted',
            cause: error,
        });
    }

    function warnOnFirstRetry(attempt, error) {
        if (attempt === 1) console.warn('[ImageJobs] 后端任务连接中断，正在重试:', error);
    }

    function waitForRetry(duration, ...signals) {
        return new Promise((resolve) => {
            let timer;
            const finish = () => {
                clearTimeout(timer);
                signals.forEach(signal => signal?.removeEventListener('abort', finish));
                resolve();
            };
            timer = setTimeout(finish, duration);
            signals.forEach(signal => signal?.addEventListener('abort', finish, { once: true }));
            if (signals.some(signal => signal?.aborted)) finish();
        });
    }

    function createRequestScope(...externalSignals) {
        const signals = externalSignals.flat().filter(Boolean);
        const controller = new AbortController();
        const forwardAbort = () => controller.abort();
        signals.forEach(signal => signal.addEventListener('abort', forwardAbort, { once: true }));
        if (signals.some(signal => signal.aborted)) forwardAbort();
        const timer = setTimeout(() => controller.abort(), requestTimeout);
        return {
            signal: controller.signal,
            dispose: () => {
                clearTimeout(timer);
                signals.forEach(signal => signal.removeEventListener('abort', forwardAbort));
            },
        };
    }

    async function requestJson(path, { method = 'GET', body, signal, signals = [] } = {}) {
        const headers = getHeaders();
        const serializedBody = body === undefined ? undefined : JSON.stringify(body);
        const scope = createRequestScope(signal, signals);
        try {
            const response = await fetchImpl(path, {
                method,
                headers,
                ...(serializedBody === undefined ? {} : { body: serializedBody }),
                signal: scope.signal,
            });
            if (!response.ok) throw createResponseError(response, await readErrorResponse(response));
            let data;
            try {
                data = await response.json();
            } catch (error) {
                // 响应头已到但正文中断（代理重置、后端重启）与"200 但正文不是 JSON"在浏览器里
                // 无法区分，两者都按可重试的连接故障处理；重试次数有上限，不会无限循环。
                throw createConnectionError('后端图片任务响应读取中断', error);
            }
            if (!data || data.ok !== true) {
                throw new ImageBackendJobsError('后端图片任务响应无效');
            }
            return data;
        } catch (error) {
            if (error instanceof ImageBackendJobsError) throw error;
            throw createConnectionError('无法连接后端图片任务服务', error);
        } finally {
            scope.dispose();
        }
    }

    async function createJob(request, { signals = [] } = {}) {
        const data = await requestJson(JOBS_ENDPOINT, { method: 'POST', body: request, signals });
        if (!data.job?.id) throw new ImageBackendJobsError('后端未返回任务 ID');
        return data.job;
    }

    async function listJobs() {
        const data = await requestJson(JOBS_ENDPOINT);
        return Array.isArray(data.jobs) ? data.jobs : [];
    }

    async function getJob(jobId, { signal } = {}) {
        const data = await requestJson(`${JOBS_ENDPOINT}/${encodeURIComponent(jobId)}`, { signal });
        if (!data.job || !Array.isArray(data.job.items)) {
            throw new ImageBackendJobsError('后端图片任务状态无效');
        }
        return data.job;
    }

    async function getResult(jobId, index, { signal } = {}) {
        const headers = getHeaders();
        const scope = createRequestScope(signal);
        let keepScope = false;
        try {
            const response = await fetchImpl(`${JOBS_ENDPOINT}/${encodeURIComponent(jobId)}/results/${index}`, {
                method: 'GET',
                headers,
                signal: scope.signal,
            });
            if (response.ok) {
                keepScope = true;
                return { state: 'ready', response, release: scope.dispose };
            }
            const data = await response.json().catch(() => null);
            if (response.status === 409 || response.status === 410) {
                return { state: String(data?.state || 'unavailable'), error: data?.error || null };
            }
            throw createResponseError(response, {
                message: String(data?.error || `HTTP ${response.status}`),
                code: typeof data?.code === 'string' ? data.code : '',
            });
        } catch (error) {
            if (error instanceof ImageBackendJobsError) throw error;
            throw createConnectionError('无法获取后端图片任务结果', error);
        } finally {
            if (!keepScope) scope.dispose();
        }
    }

    async function acknowledgeResult(jobId, index, { signal } = {}) {
        return requestJson(`${JOBS_ENDPOINT}/${encodeURIComponent(jobId)}/results/${index}`, { method: 'DELETE', signal });
    }

    async function cancelJob(jobId) {
        const data = await requestJson(`${JOBS_ENDPOINT}/${encodeURIComponent(jobId)}/cancel`, { method: 'POST' });
        return data.job;
    }

    async function deleteJob(jobId, { signal } = {}) {
        return requestJson(`${JOBS_ENDPOINT}/${encodeURIComponent(jobId)}`, { method: 'DELETE', signal });
    }

    async function monitorJob(jobId, {
        signal,
        cancelSignal = signal,
        detachSignal,
        beforeIrreversible,
        beforeCancel = beforeIrreversible,
        onStateChange,
        onItemReady,
        onItemSettled,
        cancelAlreadySent = false,
    } = {}) {
        const delivered = new Set();
        const acknowledged = new Set();
        const settled = new Set();
        // 交付给调用方但故意不 ACK 的结果：调用方没能把图片落库，后端副本是唯一剩下的一份，
        // 必须留给 TTL 而不是被 ACK 或 deleteJob 释放。
        const preserved = new Set();
        const deliveryErrors = new Map();
        let abortRequested = cancelSignal?.aborted === true;
        let detachRequested = detachSignal?.aborted === true;
        let cancelSent = cancelAlreadySent;
        let wakePoll = null;
        let wakePending = false;
        let consecutiveFailures = 0;
        let nextPollDelay = pollInterval;
        const wake = () => {
            wakePending = true;
            wakePoll?.();
        };
        const requestCancel = () => {
            abortRequested = true;
            wake();
        };
        const requestDetach = () => {
            detachRequested = true;
            wake();
        };
        const onVisibilityChange = () => {
            if (documentRef?.visibilityState === 'visible') wake();
        };
        const notifyItemSettled = async (details) => {
            try {
                await onItemSettled?.(details);
                return true;
            } catch (error) {
                deliveryErrors.set(details.index, error);
                console.error('[ImageJobs] 图片失败状态写入失败:', error);
                return false;
            }
        };
        cancelSignal?.addEventListener('abort', requestCancel, { once: true });
        detachSignal?.addEventListener('abort', requestDetach, { once: true });
        documentRef?.addEventListener?.('visibilitychange', onVisibilityChange);

        try {
            while (true) {
                try {
                    if (detachRequested && forcedDetachSignals.has(detachSignal)) {
                        throw createDetachedError(jobId);
                    }
                    if (abortRequested && !cancelSent) {
                        await beforeCancel?.();
                        try {
                            await cancelJob(jobId);
                            cancelSent = true;
                        } catch (error) {
                            if (error?.code === 'job_not_found') {
                                return {
                                    job: { id: jobId, state: 'cancelled', items: [] },
                                    abortRequested: true,
                                    deliveryErrors,
                                    preserved,
                                };
                            }
                            throw error;
                        }
                    }
                    if (detachRequested && !abortRequested) throw createDetachedError(jobId);

                    const activeDetachSignal = abortRequested ? undefined : detachSignal;
                    const job = await getJob(jobId, { signal: activeDetachSignal });
                    await safeNotify(onStateChange, 'status', { job, abortRequested });

                    for (const item of job.items) {
                        if (item.state === 'ready') {
                            if (!delivered.has(item.index)) {
                                const result = await getResult(jobId, item.index, { signal: activeDetachSignal });
                                if (result.state !== 'ready') continue;
                                try {
                                    await onItemReady?.({
                                        index: item.index,
                                        kind: item.kind,
                                        response: result.response,
                                        job,
                                    });
                                    delivered.add(item.index);
                                } catch (error) {
                                    if (error instanceof ImageBackendJobsError && error.retriable) throw error;
                                    if (error?.preserveBackendResult === true) {
                                        deliveryErrors.set(item.index, error);
                                        delivered.add(item.index);
                                        settled.add(item.index);
                                        preserved.add(item.index);
                                        continue;
                                    }
                                    const discardResult = error?.discardBackendResult === true;
                                    if (!discardResult) deliveryErrors.set(item.index, error);
                                    const failurePersisted = await notifyItemSettled({
                                        index: item.index,
                                        state: 'failed',
                                        error,
                                        kind: item.kind,
                                        source: 'frontend',
                                    });
                                    delivered.add(item.index);
                                    if (!discardResult || !onItemSettled || !failurePersisted) {
                                        settled.add(item.index);
                                        preserved.add(item.index);
                                    }
                                } finally {
                                    result.release();
                                }
                            }
                            if (delivered.has(item.index) && !settled.has(item.index) && !acknowledged.has(item.index)) {
                                await beforeIrreversible?.();
                                try {
                                    await acknowledgeResult(jobId, item.index, { signal: activeDetachSignal });
                                } catch (error) {
                                    // 图片已经交付给调用方，确认失败不应让整批任务失败；
                                    // 可重试错误仍交给外层重试，其余记日志后按已确认处理。
                                    if (error instanceof ImageBackendJobsError && error.retriable) throw error;
                                    console.warn(`[ImageJobs] 后端任务 ${jobId} 第 ${item.index + 1} 张结果确认失败，图片已交付:`, error);
                                }
                                acknowledged.add(item.index);
                                settled.add(item.index);
                            }
                            continue;
                        }

                        if (item.state === 'consumed' && delivered.has(item.index)) {
                            acknowledged.add(item.index);
                            settled.add(item.index);
                            continue;
                        }

                        if (['failed', 'cancelled', 'consumed'].includes(item.state) && !settled.has(item.index)) {
                            settled.add(item.index);
                            await notifyItemSettled({
                                index: item.index,
                                state: item.state,
                                error: item.error || null,
                                kind: item.kind,
                                source: 'backend',
                                // consumed 而本次监控又没交付过，说明这张图早先已经成功交付并确认过
                                // （例如接回之前就 ACK 完了）。它是成功事实，绝不能当失败处理。
                                alreadyDelivered: item.state === 'consumed',
                            });
                        }
                    }

                    if (isTerminalJob(job) && job.items.every(item => settled.has(item.index))) {
                        return { job, abortRequested, deliveryErrors, preserved };
                    }
                    consecutiveFailures = 0;
                    nextPollDelay = pollInterval;
                } catch (error) {
                    if (detachRequested && (!abortRequested || forcedDetachSignals.has(detachSignal))) {
                        throw createDetachedError(jobId);
                    }
                    if (!(error instanceof ImageBackendJobsError) || !error.retriable) throw error;
                    consecutiveFailures++;
                    if (consecutiveFailures > retryLimit) throw createRetryExhaustedError(error);
                    warnOnFirstRetry(consecutiveFailures, error);
                    nextPollDelay = retryDelay(consecutiveFailures);
                    await safeNotify(onStateChange, 'reconnecting', { error, abortRequested });
                }

                if (wakePending) {
                    wakePending = false;
                    continue;
                }
                await new Promise((resolve) => {
                    const finish = () => {
                        clearTimeout(timer);
                        wakePoll = null;
                        wakePending = false;
                        resolve();
                    };
                    const timer = setTimeout(finish, nextPollDelay);
                    wakePoll = finish;
                    if (wakePending) finish();
                });
            }
        } finally {
            cancelSignal?.removeEventListener('abort', requestCancel);
            detachSignal?.removeEventListener('abort', requestDetach);
            documentRef?.removeEventListener?.('visibilitychange', onVisibilityChange);
            wakePoll?.();
        }
    }

    function markDetached(error, detached) {
        if (error && typeof error === 'object') error.detached = detached === true;
        return error;
    }

    // 接管一个已经存在的后端任务：首次提交后由 runJob 调用，重连恢复时由调用方按持久化的
    // jobId 直接调用。两条路径共用同一套交付、确认与终态清理逻辑。
    async function attachJob(jobId, options = {}) {
        let result;
        try {
            result = await monitorJob(jobId, options);
        } catch (error) {
            if (error && typeof error === 'object') error.jobId = jobId;
            if (markDetached(error, isDetachedError(error)).detached) {
                await safeNotify(options.onStateChange, 'detached', { error, jobId });
            }
            throw error;
        }
        // 终态 job 的清理由这里统一负责，调用方不得自行 deleteJob：
        // 只要还有结果因为调用方落库失败而被刻意保留，就必须留给后端 TTL 回收。
        const pendingIndexes = new Set([...result.preserved, ...result.deliveryErrors.keys()]);
        if (pendingIndexes.size > 0) {
            console.warn(`[ImageJobs] 后端任务 ${jobId} 有 ${pendingIndexes.size} 张结果未能落库，保留后端副本等待 TTL 回收`);
        } else {
            await options.beforeIrreversible?.();
            await deleteJob(jobId).catch((error) => {
                console.warn(`[ImageJobs] 后端终态任务 ${jobId} 清理失败，将等待 TTL 回收:`, error);
            });
        }
        return result;
    }

    async function runJob(request, options = {}) {
        const cancelSignal = options.cancelSignal || options.signal;
        const detachSignal = options.detachSignal;
        if (detachSignal?.aborted && forcedDetachSignals.has(detachSignal)) {
            throw createDetachedError(options.requestId || '');
        }
        if (cancelSignal?.aborted) throw createAbortError();
        if (detachSignal?.aborted) throw createDetachedError(options.requestId || '');
        // requestId 就是后端的 jobId，需要重连接回的调用方必须自己生成并先落盘再调用，
        // 否则「后端已创建、本地还没记录」的窗口会让整批结果失去归属。
        const createPayload = {
            ...request,
            requestId: options.requestId || createRequestId(),
        };
        let job;
        let createUncertain = false;
        let cancelAlreadySent = false;
        let consecutiveFailures = 0;
        while (!job) {
            if (detachSignal?.aborted && forcedDetachSignals.has(detachSignal)) {
                const detached = createDetachedError(createPayload.requestId);
                await safeNotify(options.onStateChange, 'detached', { error: detached, jobId: detached.jobId });
                throw detached;
            }
            if (createUncertain && cancelSignal?.aborted) {
                try {
                    await options.beforeCancel?.();
                    job = await cancelJob(createPayload.requestId);
                    cancelAlreadySent = true;
                    break;
                } catch (error) {
                    if (error instanceof ImageBackendJobsError && error.code === 'job_not_found') {
                        const uncertain = createDetachedError(createPayload.requestId);
                        await safeNotify(options.onStateChange, 'detached', { error: uncertain, jobId: uncertain.jobId });
                        throw uncertain;
                    }
                    if (!(error instanceof ImageBackendJobsError) || !error.retriable) {
                        markDetached(error, true);
                        if (error && typeof error === 'object') error.jobId = createPayload.requestId;
                        await safeNotify(options.onStateChange, 'detached', { error, jobId: createPayload.requestId });
                        throw error;
                    }
                    consecutiveFailures++;
                    if (consecutiveFailures > retryLimit) {
                        const exhausted = markDetached(createRetryExhaustedError(error), true);
                        exhausted.jobId = createPayload.requestId;
                        await safeNotify(options.onStateChange, 'detached', { error: exhausted, jobId: exhausted.jobId });
                        throw exhausted;
                    }
                    warnOnFirstRetry(consecutiveFailures, error);
                    await safeNotify(options.onStateChange, 'reconnecting', { error, abortRequested: true });
                    // 此处 options.signal 必然已 abort，传入会让等待立即返回、退避失效。
                    await waitForRetry(retryDelay(consecutiveFailures));
                    continue;
                }
            }
            if (detachSignal?.aborted && !cancelSignal?.aborted) {
                const detached = createDetachedError(createPayload.requestId);
                await safeNotify(options.onStateChange, 'detached', { error: detached, jobId: detached.jobId });
                throw detached;
            }
            try {
                await options.beforeIrreversible?.();
                job = await createJob(createPayload, { signals: [cancelSignal, detachSignal] });
            } catch (error) {
                if (!(error instanceof ImageBackendJobsError) || !error.retriable) throw error;
                // 提交请求已发出但结果未知，后端可能已经建好任务，之后只能按 requestId 查证。
                createUncertain = true;
                consecutiveFailures++;
                if (consecutiveFailures > retryLimit) {
                    const exhausted = markDetached(createRetryExhaustedError(error), true);
                    exhausted.jobId = createPayload.requestId;
                    await safeNotify(options.onStateChange, 'detached', { error: exhausted, jobId: exhausted.jobId });
                    throw exhausted;
                }
                warnOnFirstRetry(consecutiveFailures, error);
                await safeNotify(options.onStateChange, 'reconnecting', {
                    error,
                    abortRequested: cancelSignal?.aborted === true,
                });
                await waitForRetry(retryDelay(consecutiveFailures), cancelSignal, detachSignal);
            }
        }
        await safeNotify(options.onStateChange, 'created', { job });
        return attachJob(job.id, { ...options, cancelSignal, detachSignal, cancelAlreadySent });
    }

    return {
        acknowledgeResult,
        attachJob,
        cancelJob,
        createJob,
        deleteJob,
        getJob,
        getResult,
        listJobs,
        monitorJob,
        runJob,
    };
}
