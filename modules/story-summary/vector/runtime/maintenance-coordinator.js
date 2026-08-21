// ═══════════════════════════════════════════════════════════════════════════
// 向量写入协调器
//
// 唯一的串行写队列。取消不再是"一刀切代际"，而是由任务自己声明作用域：
//
//   scope        | 配置切换 | 取消生成 | 切聊天/停用 | 卸载
//   -------------|----------|----------|-------------|------
//   embedding    | 取消     | 按操作取消 | 取消      | 取消
//   config       | 取消(被后一次切换取代) | 保留 | 保留 | 取消
//   consistency  | 保留     | 保留     | 保留        | 取消
//   io           | 排队完成 | 保留     | 保留        | 取消
//
// consistency（删除/swipe/rollback）与 io（导入/恢复/清理）不参与配置与生成
// 取消：它们修正的是正文与存储的一致性，被跳过后完整性检查不一定能发现。
//
// 表中"卸载"一列的准确含义见 shutdownVectorWriteCoordinator。
// ═══════════════════════════════════════════════════════════════════════════

export const VECTOR_WRITE_SCOPES = Object.freeze({
    EMBEDDING: 'embedding',
    CONFIG: 'config',
    CONSISTENCY: 'consistency',
    IO: 'io',
});

// 每个 scope 订阅哪些取消源。operation 级信号所有任务都订阅。
const SCOPE_CANCEL_SOURCES = Object.freeze({
    [VECTOR_WRITE_SCOPES.EMBEDDING]: Object.freeze(['lifecycle', 'config', 'embeddingBatch']),
    [VECTOR_WRITE_SCOPES.CONFIG]: Object.freeze(['lifecycle', 'config']),
    [VECTOR_WRITE_SCOPES.CONSISTENCY]: Object.freeze(['lifecycle']),
    [VECTOR_WRITE_SCOPES.IO]: Object.freeze(['lifecycle']),
});

let epoch = 0;
let configGeneration = 0;
let acceptingWrites = true;
let nextWriteId = 1;
let activeWrite = null;
let pendingWrites = 0;
let writeTail = Promise.resolve();

let lifecycleController = new AbortController();
let configController = new AbortController();
let embeddingBatchController = new AbortController();

const operationControllers = new Map();
const warningTimesByChannel = new Map();

function createAbortError(reason) {
    if (reason instanceof Error) return reason;
    const error = new Error(String(reason || 'Vector write cancelled'));
    error.name = 'AbortError';
    return error;
}

function abortController(controller, reason) {
    if (!controller || controller.signal.aborted) return;
    try {
        controller.abort(createAbortError(reason));
    } catch {
        controller.abort();
    }
}

function cancelSourceSignal(name) {
    if (name === 'lifecycle') return lifecycleController.signal;
    if (name === 'config') return configController.signal;
    return embeddingBatchController.signal;
}

function linkAbortSignals(signals) {
    const controller = new AbortController();
    const detachers = [];
    const abortWith = (reason) => {
        if (!controller.signal.aborted) abortController(controller, reason);
    };

    for (const signal of signals) {
        if (!signal) continue;
        if (signal.aborted) {
            abortWith(signal.reason);
            continue;
        }
        const onAbort = () => abortWith(signal.reason);
        signal.addEventListener('abort', onAbort, { once: true });
        detachers.push(() => signal.removeEventListener('abort', onAbort));
    }

    return {
        signal: controller.signal,
        dispose() {
            for (const detach of detachers) detach();
            detachers.length = 0;
        },
    };
}

function registerOperation(operationId, controller) {
    if (!operationId) return;
    let controllers = operationControllers.get(operationId);
    if (!controllers) {
        controllers = new Set();
        operationControllers.set(operationId, controllers);
    }
    controllers.add(controller);
}

function unregisterOperation(operationId, controller) {
    if (!operationId) return;
    const controllers = operationControllers.get(operationId);
    if (!controllers) return;
    controllers.delete(controller);
    if (!controllers.size) operationControllers.delete(operationId);
}

function warningMap(channel) {
    const key = String(channel || 'default');
    let map = warningTimesByChannel.get(key);
    if (!map) {
        map = new Map();
        warningTimesByChannel.set(key, map);
    }
    return map;
}

function enqueueVectorWrite({ chatId = '', kind = 'vector-write', scope, operationId = '' }, task) {
    const cancelSources = SCOPE_CANCEL_SOURCES[scope];
    const operationController = new AbortController();
    const link = linkAbortSignals([
        ...cancelSources.map(cancelSourceSignal),
        operationController.signal,
    ]);
    const descriptor = {
        id: nextWriteId++,
        chatId: String(chatId || ''),
        kind: String(kind || 'vector-write'),
        scope,
        operationId: String(operationId || ''),
        configGeneration,
    };

    registerOperation(descriptor.operationId, operationController);
    pendingWrites += 1;
    epoch += 1;

    const run = writeTail
        .then(async () => {
            pendingWrites -= 1;
            if (!acceptingWrites || link.signal.aborted) {
                epoch += 1;
                return undefined;
            }

            const session = { ...descriptor, signal: link.signal, startedAt: Date.now() };
            activeWrite = session;
            epoch += 1;
            try {
                return await task(session);
            } finally {
                if (activeWrite === session) activeWrite = null;
                epoch += 1;
            }
        })
        .finally(() => {
            unregisterOperation(descriptor.operationId, operationController);
            link.dispose();
        });

    writeTail = run.catch(() => {});
    return run;
}

export function runVectorWriteTask(options = {}, task) {
    if (typeof task !== 'function') throw new TypeError('Vector write task must be a function');
    if (!SCOPE_CANCEL_SOURCES[options.scope]) {
        throw new TypeError(`Vector write task requires a known scope, got: ${String(options.scope)}`);
    }
    if (!acceptingWrites) return Promise.resolve(undefined);
    return enqueueVectorWrite(options, task);
}

/**
 * 配置切换：作废旧配置下的 embedding 任务并中止正在运行的那个，然后排到队尾，
 * 等前面的一致性/IO 任务自然完成后再执行（关闭 Runtime、重排完整性检查）。
 */
export function runVectorConfigTransition({ reason = 'Vector configuration changed', ...options } = {}, task) {
    if (typeof task !== 'function') throw new TypeError('Vector config transition must be a function');
    if (!acceptingWrites) return Promise.resolve(undefined);

    const previousConfigController = configController;
    configGeneration += 1;
    configController = new AbortController();
    epoch += 1;
    abortController(previousConfigController, reason);

    return enqueueVectorWrite({
        ...options,
        scope: VECTOR_WRITE_SCOPES.CONFIG,
        kind: options.kind || 'vector-config-transition',
    }, task);
}

/** 取消单个操作（"取消生成向量"/"取消锚点生成"），不连坐其他任务。 */
export function cancelVectorWriteOperation(operationId, reason = 'Vector operation cancelled') {
    const controllers = operationControllers.get(String(operationId || ''));
    if (!controllers?.size) return false;
    const error = createAbortError(reason);
    for (const controller of [...controllers]) abortController(controller, error);
    epoch += 1;
    return true;
}

/** 取消全部 embedding 类写入（切聊天、当前聊天停用），一致性与 IO 任务不受影响。 */
export function cancelEmbeddingWriteTasks(reason = 'Embedding write cancelled') {
    const previous = embeddingBatchController;
    embeddingBatchController = new AbortController();
    epoch += 1;
    abortController(previous, reason);
}

export async function waitForVectorWrites() {
    await writeTail;
}

/**
 * 卸载：停止接收新任务 → 取消所有可取消的工作（消费 signal 的网络/embedding 调用
 * 会立刻中断）→ 排空仍在进行的本地写。
 *
 * 注意这不是"全部中止"：导入、清理、删除同步等任务是由多次 Dexie 写与元数据更新
 * 组成的复合本地写，没有跨步骤事务，中途 abort 会留下半完成状态，所以只能等它跑完。
 * 这些任务不做网络调用，等待时间有界。
 */
export async function shutdownVectorWriteCoordinator(reason = 'Vector writer shutdown') {
    if (acceptingWrites) {
        acceptingWrites = false;
        epoch += 1;
        abortController(lifecycleController, reason);
    }
    await writeTail;
}

export function resumeVectorWriteCoordinator() {
    if (acceptingWrites) return;
    lifecycleController = new AbortController();
    configController = new AbortController();
    embeddingBatchController = new AbortController();
    operationControllers.clear();
    acceptingWrites = true;
    epoch += 1;
}

export function isVectorWriteSessionCurrent(session) {
    return !!session
        && acceptingWrites
        && !!session.signal
        && !session.signal.aborted;
}

export function captureMaintenanceSnapshot(chatId) {
    if (activeWrite || pendingWrites) return null;
    return { chatId: String(chatId || ''), epoch, configGeneration };
}

export function isMaintenanceSnapshotCurrent(snapshot) {
    return !!snapshot
        && acceptingWrites
        && !activeWrite
        && pendingWrites === 0
        && snapshot.epoch === epoch
        && snapshot.configGeneration === configGeneration;
}

export function invalidateMaintenanceEpoch() {
    epoch += 1;
}

export function getVectorWriteState() {
    return {
        epoch,
        configGeneration,
        acceptingWrites,
        activeWrite: activeWrite ? {
            id: activeWrite.id,
            chatId: activeWrite.chatId,
            kind: activeWrite.kind,
            scope: activeWrite.scope,
            operationId: activeWrite.operationId,
            startedAt: activeWrite.startedAt,
        } : null,
        pendingWrites,
    };
}

export function claimWarningCooldown(channel, chatId, issueCode, cooldownMs, now = Date.now()) {
    const key = `${String(chatId || '')}\0${String(issueCode || 'unknown')}`;
    const map = warningMap(channel);
    const previous = Number(map.get(key));
    if (map.has(key) && now - previous < Math.max(0, Number(cooldownMs) || 0)) return false;
    map.set(key, now);
    return true;
}

export function clearWarningCooldowns(channel = null) {
    if (channel == null) warningTimesByChannel.clear();
    else warningTimesByChannel.delete(String(channel));
}

export function clearWarningCooldownsForChat(chatId) {
    const prefix = `${String(chatId || '')}\0`;
    for (const [channel, map] of warningTimesByChannel) {
        for (const key of map.keys()) {
            if (key.startsWith(prefix)) map.delete(key);
        }
        if (map.size === 0) warningTimesByChannel.delete(channel);
    }
}
