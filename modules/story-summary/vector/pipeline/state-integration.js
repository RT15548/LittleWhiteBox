// ============================================================================
// state-integration.js - L0 状态层集成
// StateAtoms 是 LLM 提取的事实数据；StateVectors 是可独立重建的派生数据。
// ============================================================================

import { getContext } from '../../../../../../../extensions.js';
import { xbLog } from '../../../../core/debug-core.js';
import {
    saveStateAtoms,
    saveStateVectors,
    getStateAtoms,
    getStateVectorDescriptors,
    deleteStateAtomsFromFloor,
    deleteStateVectorsFromFloor,
    clearStateAtoms,
    clearStateVectors,
    getL0FloorStatus,
    setL0FloorStatus,
    clearL0Index,
    deleteL0IndexFromFloor,
    beginL0MetadataBatch,
    endL0MetadataBatch,
    flushL0MetadataSave,
} from '../storage/state-store.js';
import { embed } from '../llm/siliconflow.js';
import { extractAtomsForRound } from '../llm/atom-extraction.js';
import { getL0FailureDetails } from '../llm/l0-retry-policy.js';
import {
    createInvalidEmbeddingResponseError,
    getEmbeddingFailureDetails,
} from '../llm/embedding-failure.js';
import { getVectorConfig } from '../../data/config.js';
import { getEngineFingerprint } from '../utils/embedder.js';
import { filterText } from '../utils/text-filter.js';
import { getMeta } from '../storage/chunk-store.js';
import {
    canRepairStateVectors,
    selectMissingStateVectorAtoms,
} from './state-vector-policy.js';

const MODULE_ID = 'state-integration';

// ★ 并发配置
const DEFAULT_CONCURRENCY = 10;
const STAGGER_DELAY = 15;
const DEBUG_CONCURRENCY = true;
const R_AGG_MAX_CHARS = 256;
// 单个楼层跨会话的累计失败上限。达到后视为终态，不再入队重试。
const L0_FLOOR_MAX_ATTEMPTS = 3;

let initialized = false;

// ============================================================================
// 初始化
// ============================================================================

export function initStateIntegration() {
    if (initialized) return;
    initialized = true;
    globalThis.LWB_StateRollbackHook = handleStateRollback;
    xbLog.info(MODULE_ID, 'L0 状态层集成已初始化');
}

// ============================================================================
// 统计
// ============================================================================

export async function getAnchorStats() {
    const { chat } = getContext();
    if (!chat?.length) {
        return { extracted: 0, total: 0, pending: 0, incomplete: 0, empty: 0, fail: 0, terminalFail: 0 };
    }

    // 统计 AI 楼层
    const aiFloors = [];
    for (let i = 0; i < chat.length; i++) {
        if (!chat[i]?.is_user) aiFloors.push(i);
    }

    let ok = 0;
    let empty = 0;
    let fail = 0;
    let retriableFail = 0;

    for (const f of aiFloors) {
        const s = getL0FloorStatus(f);
        if (!s) continue;
        if (s.status === 'ok') ok++;
        else if (s.status === 'empty') empty++;
        else if (s.status === 'fail') {
            fail++;
            if ((s.attempts || 0) < L0_FLOOR_MAX_ATTEMPTS) retriableFail++;
        }
    }

    const total = aiFloors.length;
    // 未处理楼层 + 还会被重试的 fail = 真实待办。fail 必须算进来，否则上层会误以为
    // L0 已经做完；但已达尝试上限的 fail 是终态、不再入队，算进去会让统计永远停在"没做完"。
    const pending = Math.max(0, total - ok - empty - (fail - retriableFail));
    const incomplete = Math.max(0, total - ok - empty);

    return {
        extracted: ok + empty,
        total,
        pending,
        incomplete,
        empty,
        fail,
        terminalFail: fail - retriableFail,
    };
}

// ============================================================================
// 增量提取：只负责 LLM 与 StateAtoms，不以 StateVector 成败决定锚点结果。
// ============================================================================

function buildL0InputText(userMessage, aiMessage) {
    const parts = [];
    const userName = userMessage?.name || '用户';
    const aiName = aiMessage?.name || '角色';

    if (userMessage?.mes?.trim()) {
        parts.push(`【用户：${userName}】\n${filterText(userMessage.mes).trim()}`);
    }
    if (aiMessage?.mes?.trim()) {
        parts.push(`【角色：${aiName}】\n${filterText(aiMessage.mes).trim()}`);
    }

    return parts.join('\n\n---\n\n').trim();
}

function buildRAggregateText(atom) {
    const uniq = new Set();
    for (const edge of (atom?.edges || [])) {
        const r = String(edge?.r || '').trim();
        if (!r) continue;
        uniq.add(r);
    }
    const joined = [...uniq].join(' ; ');
    if (!joined) return String(atom?.semantic || '').trim();
    return joined.length > R_AGG_MAX_CHARS ? joined.slice(0, R_AGG_MAX_CHARS) : joined;
}

export async function incrementalExtractAtoms(chatId, chat, onProgress, options = {}) {
    beginL0MetadataBatch('incrementalExtractAtoms');
    try {
        return await incrementalExtractAtomsInner(chatId, chat, onProgress, options);
    } finally {
        endL0MetadataBatch('incrementalExtractAtoms');
    }
}

async function incrementalExtractAtomsInner(chatId, chat, onProgress, options = {}) {
    const {
        maxFloors = Infinity,
        // 用户显式触发时忽略楼层失败上限：后台会放弃的终态楼层，手动操作必须能重试，
        // 否则一次网络故障就能让整个聊天的 L0 永久瘫痪且无恢复入口。
        retryFailedFloors = false,
        preferredFloors = [],
        signal = null,
        shouldCancel = null,
    } = options;
    const isCancelled = () => (
        signal?.aborted
        || shouldCancel?.() === true
    );
    if (!chatId || !chat?.length) {
        return { built: 0, failed: 0, llmFailed: 0, vectorFailed: 0, cancelled: false };
    }
    const isTargetChatActive = () => getContext()?.chatId === chatId;
    let targetStale = !isTargetChatActive();
    if (targetStale) {
        return { built: 0, failed: 0, llmFailed: 0, vectorFailed: 0, cancelled: true, stale: true };
    }

    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) {
        return { built: 0, failed: 0, llmFailed: 0, vectorFailed: 0, cancelled: false };
    }

    if (isCancelled()) {
        return { built: 0, failed: 0, llmFailed: 0, vectorFailed: 0, cancelled: true, stale: false };
    }

    const pendingPairs = [];
    const queuedFloors = new Set();

    const tryQueueFloor = (i) => {
        const msg = chat[i];
        if (!msg || msg.is_user || queuedFloors.has(i)) return;

        const st = getL0FloorStatus(i);
        // ★ 只跳过 ok 和 empty，fail 的可以重试
        // 但 fail 不能无限重试：上层维护现在会因 failed>0 退避重排，若某楼层永远失败
        // （例如 LLM 对该内容始终拒答），就会变成永不停止的后台 LLM 调用。
        // 达到上限的楼层进入终态，下一轮不再入队，退避循环随之自然结束。
        if (st?.status === 'ok' || st?.status === 'empty') {
            return;
        }
        if (st?.status === 'fail' && !retryFailedFloors && (st.attempts || 0) >= L0_FLOOR_MAX_ATTEMPTS) {
            return;
        }

        const userMsg = (i > 0 && chat[i - 1]?.is_user) ? chat[i - 1] : null;
        const inputText = buildL0InputText(userMsg, msg);

        if (!inputText) {
            setL0FloorStatus(i, { status: 'empty', reason: 'filtered_empty', atoms: 0 });
            return;
        }

        pendingPairs.push({ userMsg, aiMsg: msg, aiFloor: i });
        queuedFloors.add(i);
    };

    for (const rawFloor of preferredFloors) {
        const floor = Number(rawFloor);
        if (!Number.isFinite(floor) || floor < 0 || floor >= chat.length) continue;
        tryQueueFloor(floor);
    }

    for (let i = 0; i < chat.length; i++) {
        tryQueueFloor(i);
    }

    // 限制单次提取楼层数（自动触发时使用）
    if (pendingPairs.length > maxFloors) {
        pendingPairs.length = maxFloors;
    }

    if (!pendingPairs.length) {
        onProgress?.('已全部提取', 0, 0);
        return { built: 0, failed: 0, llmFailed: 0, vectorFailed: 0, cancelled: false };
    }

    const concurrency = Math.max(1, Math.min(50, Number(vectorCfg?.l0Concurrency) || DEFAULT_CONCURRENCY));

    xbLog.info(MODULE_ID, `增量 L0 提取：pending=${pendingPairs.length}, concurrency=${concurrency}`);

    let completed = 0;
    let llmFailed = 0;
    let firstFailure = null;
    const total = pendingPairs.length;
    let builtAtoms = 0;
    let active = 0;
    let peakActive = 0;
    const tStart = performance.now();

    // 收集本轮成功提取的 atoms，全部 LLM 结束后统一提交到当前聊天 metadata。
    const allNewAtoms = [];
    // floor -> atoms 数量。楼层 ok 只代表 LLM 提取完成，与派生向量无关。
    const pendingFloors = new Map();

    // ★ 通用处理单个 pair 的逻辑（复用于正常模式和降速模式）
    const processPair = async (pair, idx, workerId) => {
        const floor = pair.aiFloor;
        const prev = getL0FloorStatus(floor);

        active++;
        if (active > peakActive) peakActive = active;
        if (DEBUG_CONCURRENCY && (idx % 10 === 0)) {
            xbLog.info(MODULE_ID, `L0 pool start idx=${idx} active=${active} peak=${peakActive} worker=${workerId}`);
        }

        try {
            const atoms = await extractAtomsForRound(pair.userMsg, pair.aiMsg, floor, {
                timeout: 60000,
                signal,
                shouldCancel,
            });

            if (isCancelled()) return;
            if (!isTargetChatActive()) {
                targetStale = true;
                return;
            }

            if (atoms == null) {
                throw new Error('llm_failed');
            }

            if (!atoms.length) {
                if (isCancelled()) return;
                setL0FloorStatus(floor, { status: 'empty', reason: 'llm_empty', atoms: 0 });
            } else {
                if (isCancelled()) return;
                atoms.forEach(a => a.chatId = chatId);
                allNewAtoms.push(...atoms);
                pendingFloors.set(floor, atoms.length);
            }
        } catch (e) {
            // 请求内部超时也抛 AbortError，但那是失败：必须记 fail 计入 attempts，不能当取消放过。
            if (isCancelled()) return;
            if (!isTargetChatActive()) {
                targetStale = true;
                return;
            }

            const failure = getL0FailureDetails(e);
            firstFailure ||= failure;
            setL0FloorStatus(floor, {
                status: 'fail',
                attempts: (prev?.attempts || 0) + 1,
                reason: failure.httpStatus ? `${failure.code}:http_${failure.httpStatus}` : failure.code,
            });
            llmFailed++;
        } finally {
            active--;
            if (!isCancelled() && !targetStale) {
                completed++;
                onProgress?.(`提取: ${completed}/${total}`, completed, total);
            }
            if (DEBUG_CONCURRENCY && (completed % 25 === 0 || completed === total)) {
                const elapsed = Math.max(1, Math.round(performance.now() - tStart));
                xbLog.info(MODULE_ID, `L0 pool progress=${completed}/${total} active=${active} peak=${peakActive} elapsedMs=${elapsed}`);
            }
        }
    };

    // ★ 并发池处理（保持固定并发度）
    const poolSize = Math.min(concurrency, pendingPairs.length);
    let nextIndex = 0;
    let started = 0;
    const runWorker = async (workerId) => {
        while (true) {
            if (isCancelled()) return;
            const idx = nextIndex++;
            if (idx >= pendingPairs.length) return;

            const pair = pendingPairs[idx];
            const stagger = started++;
            if (STAGGER_DELAY > 0) {
                await new Promise(r => setTimeout(r, stagger * STAGGER_DELAY));
            }

            if (isCancelled()) return;

            await processPair(pair, idx, workerId);
        }
    };

    await Promise.all(Array.from({ length: poolSize }, (_, i) => runWorker(i)));
    if (DEBUG_CONCURRENCY) {
        const elapsed = Math.max(1, Math.round(performance.now() - tStart));
        xbLog.info(MODULE_ID, `L0 pool done completed=${completed}/${total} failed=${llmFailed} peakActive=${peakActive} elapsedMs=${elapsed}`);
    }

    targetStale ||= !isTargetChatActive();
    const aborted = isCancelled() || targetStale;

    // StateAtoms 是 LLM 阶段的事实成果。只要目标聊天仍有效，就先提交事实并将楼层标为 ok；
    // StateVector 是可重建派生数据，不能反过来决定这批锚点是否成功。
    // 切聊天后不能写 chat_metadata，因此 stale/cancelled 时不提交尚未落下的成功结果。
    if (pendingFloors.size > 0 && !aborted) {
        saveStateAtoms(allNewAtoms);
        for (const [floor, count] of pendingFloors) {
            setL0FloorStatus(floor, { status: 'ok', atoms: count });
            builtAtoms += count;
        }
    }

    xbLog.info(MODULE_ID, `L0 ${aborted ? '已取消' : '完成'}：atoms=${builtAtoms}, completed=${completed}/${total}, llmFailed=${llmFailed}`);
    return {
        built: builtAtoms,
        failed: llmFailed,
        llmFailed,
        vectorFailed: 0,
        failureCode: firstFailure?.code || null,
        httpStatus: firstFailure?.httpStatus || null,
        cancelled: aborted,
        stale: targetStale,
    };
}

// ============================================================================
// StateVector 派生数据维护
// ============================================================================

async function collectL0VectorBuildState(chatId, options = {}) {
    const {
        vectorConfig = getVectorConfig(),
    } = options;
    if (!chatId || getContext()?.chatId !== chatId) {
        return { success: false, missing: 0, total: 0, code: 'stale_chat', stale: true };
    }
    if (!vectorConfig?.enabled) {
        return { success: false, missing: 0, total: 0, code: 'disabled' };
    }

    const fingerprint = getEngineFingerprint(vectorConfig);
    const atoms = [...getStateAtoms()];
    const [stateVectors, meta] = await Promise.all([
        getStateVectorDescriptors(chatId),
        getMeta(chatId),
    ]);
    if (getContext()?.chatId !== chatId) {
        return { success: false, missing: 0, total: atoms.length, code: 'stale_chat', stale: true };
    }
    if (!canRepairStateVectors(meta?.fingerprint, fingerprint)) {
        return {
            success: false,
            missing: 0,
            total: atoms.length,
            code: 'fingerprint_mismatch',
            fingerprintMismatch: true,
        };
    }

    const missingAtoms = selectMissingStateVectorAtoms(atoms, stateVectors, fingerprint);
    return {
        success: true,
        missing: missingAtoms.length,
        missingFloors: new Set(missingAtoms
            .map(atom => Number(atom?.floor))
            .filter(Number.isFinite)).size,
        total: atoms.length,
        fingerprint,
        missingAtoms,
    };
}

export async function getL0VectorBuildStatus(chatId, options = {}) {
    const status = { ...await collectL0VectorBuildState(chatId, options) };
    delete status.missingAtoms;
    return status;
}

/**
 * 仅补齐缺失或无效的 StateVector。StateAtoms 是唯一事实来源；本函数不会修改锚点或
 * 楼层提取状态。所有 Embedding 批次成功后才整批写库，失败时下轮仍可从事实数据重建。
 */
export async function vectorizeMissingStateAtoms(chatId, onProgress, options = {}) {
    const {
        vectorConfig = getVectorConfig(),
        signal = null,
        shouldCancel = null,
    } = options;
    const isCancelled = () => signal?.aborted || shouldCancel?.() === true;
    const cancelledResult = () => ({
        success: false,
        status: 'cancelled',
        vectorized: 0,
        failed: 0,
        vectorFailed: 0,
        code: 'cancelled',
        cancelled: true,
    });
    if (isCancelled()) return cancelledResult();

    let status;
    try {
        status = await collectL0VectorBuildState(chatId, { vectorConfig });
    } catch (error) {
        xbLog.error(MODULE_ID, '读取 L0 向量状态失败', error);
        return {
            success: false,
            status: 'failed',
            vectorized: 0,
            failed: 0,
            vectorFailed: 0,
            code: 'state_vector_read_failed',
            error,
        };
    }
    if (isCancelled()) return cancelledResult();
    if (!status.success) {
        return {
            ...status,
            status: 'failed',
            vectorized: 0,
            failed: 0,
            vectorFailed: 0,
        };
    }

    const atoms = status.missingAtoms;
    if (!atoms.length) {
        return {
            success: true,
            status: 'up_to_date',
            vectorized: 0,
            failed: 0,
            vectorFailed: 0,
        };
    }

    const fingerprint = status.fingerprint;
    const batchSize = 20;
    const allItems = [];

    try {
        onProgress?.(0, atoms.length);
        for (let i = 0; i < atoms.length; i += batchSize) {
            if (isCancelled()) return cancelledResult();

            const atomBatch = atoms.slice(i, i + batchSize);
            const semBatch = atomBatch.map(atom => atom.semantic);
            const rBatch = atomBatch.map(buildRAggregateText);
            const payload = semBatch.concat(rBatch);
            const vectors = await embed(payload, {
                apiConfig: vectorConfig.embeddingApi,
                timeout: 30000,
                signal,
            });
            if (isCancelled()) return cancelledResult();
            const split = semBatch.length;
            const expectedVectorCount = split * 2;
            if (
                !Array.isArray(vectors)
                || vectors.length < expectedVectorCount
                || vectors.slice(0, expectedVectorCount).some(vector => !vector?.length)
            ) {
                throw createInvalidEmbeddingResponseError(expectedVectorCount, vectors?.length || 0);
            }
            const semVectors = vectors.slice(0, split);
            const rVectors = vectors.slice(split, split + split);

            for (let j = 0; j < split; j++) {
                const atom = atomBatch[j];
                allItems.push({
                    atomId: atom.atomId,
                    floor: atom.floor,
                    vector: semVectors[j],
                    rVector: rVectors[j] || semVectors[j],
                });
            }

            onProgress?.(allItems.length, atoms.length);
        }

        if (isCancelled()) return cancelledResult();
        if (
            getContext()?.chatId !== chatId
            || getEngineFingerprint(getVectorConfig()) !== fingerprint
        ) return cancelledResult();
    } catch (error) {
        if (isCancelled()) return cancelledResult();
        const failure = getEmbeddingFailureDetails(error);
        xbLog.error(MODULE_ID, `L0 Embedding 失败: ${failure.code}`, error);
        return {
            success: false,
            status: 'failed',
            vectorized: 0,
            failed: atoms.length,
            vectorFailed: atoms.length,
            code: failure.code,
            httpStatus: failure.httpStatus,
            error,
        };
    }

    try {
        if (isCancelled()) return cancelledResult();
        await saveStateVectors(chatId, allItems, fingerprint);
    } catch (error) {
        if (isCancelled()) return cancelledResult();
        xbLog.error(MODULE_ID, 'L0 StateVector 写入失败', error);
        return {
            success: false,
            status: 'failed',
            vectorized: 0,
            failed: atoms.length,
            vectorFailed: atoms.length,
            code: 'state_vector_write_failed',
            error,
        };
    }

    xbLog.info(MODULE_ID, `L0 向量补齐完成: ${allItems.length} 条`);
    return {
        success: true,
        status: 'built',
        vectorized: allItems.length,
        failed: 0,
        vectorFailed: 0,
    };
}

// ============================================================================
// 清空
// ============================================================================

export async function clearAllAtomsAndVectors(chatId) {
    beginL0MetadataBatch('clearAllAtomsAndVectors');
    try {
        clearStateAtoms();
        clearL0Index();
        if (chatId) {
            await clearStateVectors(chatId);
        }
    } finally {
        endL0MetadataBatch('clearAllAtomsAndVectors');
    }

    flushL0MetadataSave('clearAllAtomsAndVectors');

    xbLog.info(MODULE_ID, '已清空所有记忆锚点');
}

// ============================================================================
// 回滚钩子
// ============================================================================

async function handleStateRollback(floor) {
    xbLog.info(MODULE_ID, `收到回滚请求: floor >= ${floor}`);

    const { chatId } = getContext();

    beginL0MetadataBatch('stateRollback');
    try {
        deleteStateAtomsFromFloor(floor);
        deleteL0IndexFromFloor(floor);

        if (chatId) {
            await deleteStateVectorsFromFloor(chatId, floor);
        }
    } finally {
        endL0MetadataBatch('stateRollback');
    }
}
