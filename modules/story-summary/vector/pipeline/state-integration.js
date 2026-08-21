// ============================================================================
// state-integration.js - L0 状态层集成
// Phase 1: 批量 LLM 提取（只存文本）
// Phase 2: 统一向量化（提取完成后）
// ============================================================================

import { getContext } from '../../../../../../../extensions.js';
import { xbLog } from '../../../../core/debug-core.js';
import {
    saveStateAtoms,
    saveStateVectors,
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
import { getVectorConfig } from '../../data/config.js';
import { getEngineFingerprint } from '../utils/embedder.js';
import { filterText } from '../utils/text-filter.js';

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
        return { extracted: 0, total: 0, pending: 0, empty: 0, fail: 0 };
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

    return {
        extracted: ok + empty,
        total,
        pending,
        empty,
        fail
    };
}

// ============================================================================
// 增量提取 - Phase 1 提取文本，Phase 2 统一向量化
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
    if (!chatId || !chat?.length) return { built: 0, failed: 0, cancelled: false };
    const isTargetChatActive = () => getContext()?.chatId === chatId;
    let targetStale = !isTargetChatActive();
    if (targetStale) return { built: 0, failed: 0, cancelled: true, stale: true };

    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) return { built: 0, failed: 0, cancelled: false };

    if (isCancelled()) {
        return { built: 0, failed: 0, cancelled: true, stale: false };
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
        return { built: 0, failed: 0, cancelled: false };
    }

    const concurrency = Math.max(1, Math.min(50, Number(vectorCfg?.l0Concurrency) || DEFAULT_CONCURRENCY));

    xbLog.info(MODULE_ID, `增量 L0 提取：pending=${pendingPairs.length}, concurrency=${concurrency}`);

    let completed = 0;
    let failed = 0;
    const total = pendingPairs.length;
    let builtAtoms = 0;
    let active = 0;
    let peakActive = 0;
    const tStart = performance.now();

    // ★ Phase 1: 收集所有新提取的 atoms（不向量化）
    const allNewAtoms = [];
    // floor -> atoms 数量。只有 StateVector 提交成功后，这些楼层才会落库并标 ok。
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
                // 这里只收集，不落库也不标 ok：atoms 要等 Phase 2 的 StateVector 提交成功
                // 之后才一起提交。否则取消或向量化失败会留下"有 atom、标 ok、无向量"的
                // 死楼层，重试时又被 tryQueueFloor 当作已完成跳过，永久缺向量。
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

            setL0FloorStatus(floor, {
                status: 'fail',
                attempts: (prev?.attempts || 0) + 1,
                reason: String(e?.message || e).replace(/\s+/g, ' ').slice(0, 120),
            });
            failed++;
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
        xbLog.info(MODULE_ID, `L0 pool done completed=${completed}/${total} failed=${failed} peakActive=${peakActive} elapsedMs=${elapsed}`);
    }

    // ★ Phase 2: 统一向量化所有新提取的 atoms
    let committed = allNewAtoms.length === 0;
    if (allNewAtoms.length > 0 && !isCancelled() && !targetStale && isTargetChatActive()) {
        onProgress?.(`向量化 L0: 0/${allNewAtoms.length}`, 0, allNewAtoms.length);
        ({ committed } = await vectorizeAtoms(chatId, allNewAtoms, (current, total) => {
            onProgress?.(`向量化 L0: ${current}/${total}`, current, total);
        }, {
            vectorConfig: vectorCfg,
            signal,
            shouldCancel,
        }));
    }

    targetStale ||= !isTargetChatActive();
    const aborted = isCancelled() || targetStale;

    // ★ Phase 3: 提交。向量真正落库才认账并标 ok；向量化失败标 fail，让 getAnchorStats
    // 与上层维护看得见并重试。
    // aborted 时一个字都不写：saveStateAtoms/setL0FloorStatus 直写当前 chat_metadata，
    // 切聊天后再写会污染新聊天。此时 atoms 和楼层状态都没落，下次回来原样重跑；
    // atomId 由 floor+idx 决定，重跑会覆盖同一批 StateVector，幂等。
    if (pendingFloors.size > 0 && !aborted) {
        // 外层 incrementalExtractAtoms 已经开了 L0 metadata batch，这里直接写即可，
        // 由它在 endL0MetadataBatch 时统一落盘。
        if (committed) {
            saveStateAtoms(allNewAtoms);
            for (const [floor, count] of pendingFloors) {
                setL0FloorStatus(floor, { status: 'ok', atoms: count });
                builtAtoms += count;
            }
        } else {
            for (const floor of pendingFloors.keys()) {
                const prev = getL0FloorStatus(floor);
                setL0FloorStatus(floor, {
                    status: 'fail',
                    attempts: (prev?.attempts || 0) + 1,
                    reason: 'vectorize_failed',
                });
                failed++;
            }
        }
    }

    xbLog.info(MODULE_ID, `L0 ${aborted ? '已取消' : '完成'}：atoms=${builtAtoms}, completed=${completed}/${total}, failed=${failed}`);
    return { built: builtAtoms, failed, cancelled: aborted, stale: targetStale };
}

// ============================================================================
// 向量化（支持进度回调）
// ============================================================================

/**
 * 向量化 atoms 并整批提交。
 * 提交是全有或全无：任何一批 embed 失败都不写 StateVector，避免出现"部分楼层有向量"
 * 的中间态。返回 { committed } 让调用方决定这些楼层标 ok 还是 fail。
 */
async function vectorizeAtoms(chatId, atoms, onProgress, options = {}) {
    if (!atoms?.length) return { committed: true };

    const {
        vectorConfig = getVectorConfig(),
        signal = null,
        shouldCancel = null,
    } = options;
    const vectorCfg = vectorConfig;
    const isCancelled = () => (
        signal?.aborted
        || shouldCancel?.() === true
    );
    if (!vectorCfg?.enabled) return { committed: false };

    const semanticTexts = atoms.map(a => a.semantic);
    const rTexts = atoms.map(a => buildRAggregateText(a));
    const fingerprint = getEngineFingerprint(vectorCfg);
    const batchSize = 20;

    try {
        const allVectors = [];

        for (let i = 0; i < semanticTexts.length; i += batchSize) {
            if (isCancelled()) return { committed: false };

            const semBatch = semanticTexts.slice(i, i + batchSize);
            const rBatch = rTexts.slice(i, i + batchSize);
            const payload = semBatch.concat(rBatch);
            const vectors = await embed(payload, {
                apiConfig: vectorCfg.embeddingApi,
                timeout: 30000,
                signal,
            });
            if (isCancelled()) return { committed: false };
            const split = semBatch.length;
            const expectedVectorCount = split * 2;
            if (
                !Array.isArray(vectors)
                || vectors.length < expectedVectorCount
                || vectors.slice(0, expectedVectorCount).some(vector => !vector?.length)
            ) {
                throw new Error(`invalid embedding response: expect>=${expectedVectorCount} non-empty vectors, got=${vectors?.length || 0}`);
            }
            const semVectors = vectors.slice(0, split);
            const rVectors = vectors.slice(split, split + split);

            for (let j = 0; j < split; j++) {
                allVectors.push({
                    vector: semVectors[j],
                    rVector: rVectors[j] || semVectors[j],
                });
            }

            onProgress?.(allVectors.length, semanticTexts.length);
        }

        if (isCancelled()) return { committed: false };

        const items = atoms.slice(0, allVectors.length).map((a, i) => ({
            atomId: a.atomId,
            floor: a.floor,
            vector: allVectors[i].vector,
            rVector: allVectors[i].rVector,
        }));

        if (isCancelled()) return { committed: false };
        await saveStateVectors(chatId, items, fingerprint);
        xbLog.info(MODULE_ID, `L0 向量化完成: ${items.length} 条`);
        return { committed: true };
    } catch (e) {
        // 请求内部超时同样抛 AbortError，但那是失败：必须让调用方标 fail 并重试，
        // 不能当取消放过，否则这些楼层会永久没有 StateVector。
        if (isCancelled()) return { committed: false };
        xbLog.error(MODULE_ID, 'L0 向量化失败', e);
        return { committed: false };
    }
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
