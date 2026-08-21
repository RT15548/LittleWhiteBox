function defaultAbortError() {
    const error = new Error('已取消');
    error.name = 'AbortError';
    return error;
}

function defaultWaitForCooldown(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

function normalizeCooldown(value) {
    const duration = Number(value);
    return Number.isFinite(duration) && duration > 0 ? duration : 0;
}

/**
 * 创建供应商级串行图片请求队列。
 *
 * 请求结果会立即交还调用者，但下一个供应商请求必须等待本体冷却结束；
 * 消费者取消只能撤销自己的排队请求，不能跳过已经开始的安全冷却。
 * batchKey 是单次批量生成的临时身份，仅用于区分“同批冷却”和“其他任务排队”。
 */
export function createSerialImageRequestQueue({
    createAbortError = defaultAbortError,
    getCooldownMs = () => 0,
    waitForCooldown = defaultWaitForCooldown,
} = {}) {
    const pending = [];
    let active = null;
    let sequence = 0;

    function notify(callback, payload) {
        try {
            callback?.(payload);
        } catch (error) {
            console.error('[DrawRequestQueue] 状态回调失败:', error);
        }
    }

    function detachAbort(item) {
        if (item.abortHandler && item.signal) {
            item.signal.removeEventListener('abort', item.abortHandler);
            item.abortHandler = null;
        }
    }

    function notifyQueued() {
        pending.forEach((item, index) => {
            const ahead = (active ? 1 : 0) + index;
            const waitingForOwnCooldown = index === 0
                && active?.phase === 'cooldown'
                && item.batchKey !== undefined
                && item.batchKey === active.batchKey;
            if (waitingForOwnCooldown) {
                const remaining = active.cooldownUntil - Date.now();
                if (item.queuePhase === 'queued' && remaining > 0) {
                    item.queuePhase = 'cooldown';
                    notify(item.onCooldown, { duration: remaining });
                }
                return;
            }
            if (ahead > 0) {
                item.queuePhase = 'queued';
                notify(item.onQueued, { ahead, position: ahead + 1 });
            }
        });
    }

    function pump() {
        if (active || pending.length === 0) return;

        const item = pending.shift();
        active = item;
        item.phase = 'running';
        item.queuePhase = null;
        detachAbort(item);
        notifyQueued();

        void (async () => {
            let result;
            let error = null;
            let started = false;
            try {
                if (item.signal?.aborted) throw createAbortError();
                started = true;
                notify(item.onStart);
                result = await item.run();
            } catch (caught) {
                error = caught;
            }

            const cooldown = started ? normalizeCooldown(getCooldownMs()) : 0;
            if (cooldown > 0) {
                item.phase = 'cooldown';
                item.cooldownUntil = Date.now() + cooldown;
                notify(item.onCooldown, { duration: cooldown });
            }

            if (error) item.reject(error);
            else item.resolve(result);

            if (cooldown > 0) await waitForCooldown(cooldown);

            if (active === item) {
                item.phase = 'complete';
                item.cooldownUntil = 0;
                active = null;
            }
            notifyQueued();
            pump();
        })();
    }

    function enqueue(run, { signal, batchKey, onQueued, onStart, onCooldown } = {}) {
        return new Promise((resolve, reject) => {
            if (signal?.aborted) {
                reject(createAbortError());
                return;
            }

            const item = {
                id: ++sequence,
                run,
                signal,
                batchKey,
                onQueued,
                onStart,
                onCooldown,
                resolve,
                reject,
                abortHandler: null,
                phase: 'pending',
                queuePhase: null,
                cooldownUntil: 0,
            };

            item.abortHandler = () => {
                if (active === item) return;
                const index = pending.indexOf(item);
                if (index < 0) return;
                pending.splice(index, 1);
                detachAbort(item);
                item.phase = 'cancelled';
                item.queuePhase = null;
                notifyQueued();
                reject(createAbortError());
            };
            signal?.addEventListener('abort', item.abortHandler, { once: true });

            pending.push(item);
            notifyQueued();
            pump();
        });
    }

    function clear() {
        const queued = pending.splice(0);
        queued.forEach((item) => {
            detachAbort(item);
            item.phase = 'cancelled';
            item.queuePhase = null;
            item.reject(createAbortError());
        });
    }

    return {
        clear,
        enqueue,
    };
}
