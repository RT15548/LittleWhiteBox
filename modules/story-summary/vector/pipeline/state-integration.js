// ============================================================================
// state-integration.js - L0 状态层集成
// Phase 1: 批量 LLM 提取（只存文本）
// Phase 2: 统一向量化（提取完成后）
// ============================================================================

import { getContext } from '../../../../../../../extensions.js';
import { saveMetadataDebounced } from '../../../../../../../extensions.js';
import { xbLog } from '../../../../core/debug-core.js';
import {
    saveStateAtoms,
    saveStateVectors,
    deleteStateAtomsFromFloor,
    deleteStateVectorsFromFloor,
    getStateAtoms,
    clearStateAtoms,
    clearStateVectors,
    getL0FloorStatus,
    setL0FloorStatus,
    clearL0Index,
    deleteL0IndexFromFloor,
} from '../storage/state-store.js';
import { embed } from '../llm/siliconflow.js';
import { extractAtomsForRound, cancelBatchExtraction } from '../llm/atom-extraction.js';
import { getVectorConfig } from '../../data/config.js';
import { getEngineFingerprint } from '../utils/embedder.js';
import { filterText } from '../utils/text-filter.js';

const MODULE_ID = 'state-integration';

// ★ 并发配置
const CONCURRENCY = 50;
const STAGGER_DELAY = 15;
const DEBUG_CONCURRENCY = true;
const R_AGG_MAX_CHARS = 256;

let initialized = false;
let extractionCancelled = false;

export function cancelL0Extraction() {
    extractionCancelled = true;
    cancelBatchExtraction();
}

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

    for (const f of aiFloors) {
        const s = getL0FloorStatus(f);
        if (!s) continue;
        if (s.status === 'ok') ok++;
        else if (s.status === 'empty') empty++;
        else if (s.status === 'fail') fail++;
    }

    const total = aiFloors.length;
    const processed = ok + empty + fail;
    const pending = Math.max(0, total - processed);

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
    const { maxFloors = Infinity } = options;
    if (!chatId || !chat?.length) return { built: 0 };

    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) return { built: 0 };

    // ★ 重置取消标志
    extractionCancelled = false;

    const pendingPairs = [];

    for (let i = 0; i < chat.length; i++) {
        const msg = chat[i];
        if (!msg || msg.is_user) continue;

        const st = getL0FloorStatus(i);
        // ★ 只跳过 ok 和 empty，fail 的可以重试
        if (st?.status === 'ok' || st?.status === 'empty') {
            continue;
        }

        const userMsg = (i > 0 && chat[i - 1]?.is_user) ? chat[i - 1] : null;
        const inputText = buildL0InputText(userMsg, msg);

        if (!inputText) {
            setL0FloorStatus(i, { status: 'empty', reason: 'filtered_empty', atoms: 0 });
            continue;
        }

        pendingPairs.push({ userMsg, aiMsg: msg, aiFloor: i });
    }

    // 限制单次提取楼层数（自动触发时使用）
    if (pendingPairs.length > maxFloors) {
        pendingPairs.length = maxFloors;
    }

    if (!pendingPairs.length) {
        onProgress?.('已全部提取', 0, 0);
        return { built: 0 };
    }

    xbLog.info(MODULE_ID, `增量 L0 提取：pending=${pendingPairs.length}, concurrency=${CONCURRENCY}`);

    let completed = 0;
    let failed = 0;
    const total = pendingPairs.length;
    let builtAtoms = 0;
    let active = 0;
    let peakActive = 0;
    const tStart = performance.now();

    // ★ Phase 1: 收集所有新提取的 atoms（不向量化）
    const allNewAtoms = [];

    // ★ 30 并发批次处理
        // 并发池处理（保持固定并发度）
    const poolSize = Math.min(CONCURRENCY, pendingPairs.length);
    let nextIndex = 0;
    let started = 0;
    const runWorker = async (workerId) => {
        while (true) {
            if (extractionCancelled) return;
            const idx = nextIndex++;
            if (idx >= pendingPairs.length) return;

            const pair = pendingPairs[idx];
            const stagger = started++;
            if (STAGGER_DELAY > 0) {
                await new Promise(r => setTimeout(r, stagger * STAGGER_DELAY));
            }

            if (extractionCancelled) return;

            const floor = pair.aiFloor;
            const prev = getL0FloorStatus(floor);

            active++;
            if (active > peakActive) peakActive = active;
            if (DEBUG_CONCURRENCY && (idx % 10 === 0)) {
                xbLog.info(MODULE_ID, `L0 pool start idx=${idx} active=${active} peak=${peakActive} worker=${workerId}`);
            }

            try {
                const atoms = await extractAtomsForRound(pair.userMsg, pair.aiMsg, floor, { timeout: 20000 });

                if (extractionCancelled) return;

                if (atoms == null) {
                    throw new Error('llm_failed');
                }

                if (!atoms.length) {
                    setL0FloorStatus(floor, { status: 'empty', reason: 'llm_empty', atoms: 0 });
                } else {
                    atoms.forEach(a => a.chatId = chatId);
                    saveStateAtoms(atoms);
                    // Phase 1: 只收集，不向量化
                    allNewAtoms.push(...atoms);

                    setL0FloorStatus(floor, { status: 'ok', atoms: atoms.length });
                    builtAtoms += atoms.length;
                }
            } catch (e) {
                if (extractionCancelled) return;

                setL0FloorStatus(floor, {
                    status: 'fail',
                    attempts: (prev?.attempts || 0) + 1,
                    reason: String(e?.message || e).replace(/\s+/g, ' ').slice(0, 120),
                });
                failed++;
            } finally {
                active--;
                if (!extractionCancelled) {
                    completed++;
                    onProgress?.(`提取: ${completed}/${total}`, completed, total);
                }
                if (DEBUG_CONCURRENCY && (completed % 25 === 0 || completed === total)) {
                    const elapsed = Math.max(1, Math.round(performance.now() - tStart));
                    xbLog.info(MODULE_ID, `L0 pool progress=${completed}/${total} active=${active} peak=${peakActive} elapsedMs=${elapsed}`);
                }
            }
        }
    };

    await Promise.all(Array.from({ length: poolSize }, (_, i) => runWorker(i)));
    if (DEBUG_CONCURRENCY) {
        const elapsed = Math.max(1, Math.round(performance.now() - tStart));
        xbLog.info(MODULE_ID, `L0 pool done completed=${completed}/${total} failed=${failed} peakActive=${peakActive} elapsedMs=${elapsed}`);
    }

    try {
        saveMetadataDebounced?.();
    } catch { }

    // ★ Phase 2: 统一向量化所有新提取的 atoms
    if (allNewAtoms.length > 0 && !extractionCancelled) {
        onProgress?.(`向量化 L0: 0/${allNewAtoms.length}`, 0, allNewAtoms.length);
        await vectorizeAtoms(chatId, allNewAtoms, (current, total) => {
            onProgress?.(`向量化 L0: ${current}/${total}`, current, total);
        });
    }

    xbLog.info(MODULE_ID, `L0 ${extractionCancelled ? '已取消' : '完成'}：atoms=${builtAtoms}, completed=${completed}/${total}, failed=${failed}`);
    return { built: builtAtoms };
}

// ============================================================================
// 向量化（支持进度回调）
// ============================================================================

async function vectorizeAtoms(chatId, atoms, onProgress) {
    if (!atoms?.length) return;

    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) return;

    const semanticTexts = atoms.map(a => a.semantic);
    const rTexts = atoms.map(a => buildRAggregateText(a));
    const fingerprint = getEngineFingerprint(vectorCfg);
    const batchSize = 20;

    try {
        const allVectors = [];

        for (let i = 0; i < semanticTexts.length; i += batchSize) {
            if (extractionCancelled) break;

            const semBatch = semanticTexts.slice(i, i + batchSize);
            const rBatch = rTexts.slice(i, i + batchSize);
            const payload = semBatch.concat(rBatch);
            const vectors = await embed(payload, { timeout: 30000 });
            const split = semBatch.length;
            if (!Array.isArray(vectors) || vectors.length < split * 2) {
                throw new Error(`embed length mismatch: expect>=${split * 2}, got=${vectors?.length || 0}`);
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

        if (extractionCancelled) return;

        const items = atoms.slice(0, allVectors.length).map((a, i) => ({
            atomId: a.atomId,
            floor: a.floor,
            vector: allVectors[i].vector,
            rVector: allVectors[i].rVector,
        }));

        await saveStateVectors(chatId, items, fingerprint);
        xbLog.info(MODULE_ID, `L0 向量化完成: ${items.length} 条`);
    } catch (e) {
        xbLog.error(MODULE_ID, 'L0 向量化失败', e);
    }
}

// ============================================================================
// 清空
// ============================================================================

export async function clearAllAtomsAndVectors(chatId) {
    clearStateAtoms();
    clearL0Index();
    if (chatId) {
        await clearStateVectors(chatId);
    }

    // ★ 立即保存
    try {
        saveMetadataDebounced?.();
    } catch { }

    xbLog.info(MODULE_ID, '已清空所有记忆锚点');
}

// ============================================================================
// 实时增量（AI 消息后触发）- 保持不变
// ============================================================================

let extractionQueue = [];
let isProcessing = false;

export async function extractAndStoreAtomsForRound(aiFloor, aiMessage, userMessage, onComplete) {
    const { chatId } = getContext();
    if (!chatId) return;

    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) return;

    extractionQueue.push({ aiFloor, aiMessage, userMessage, chatId, onComplete });
    processQueue();
}

async function processQueue() {
    if (isProcessing || extractionQueue.length === 0) return;
    isProcessing = true;

    while (extractionQueue.length > 0) {
        const { aiFloor, aiMessage, userMessage, chatId, onComplete } = extractionQueue.shift();

        try {
            const atoms = await extractAtomsForRound(userMessage, aiMessage, aiFloor, { timeout: 12000 });

            if (!atoms?.length) {
                xbLog.info(MODULE_ID, `floor ${aiFloor}: 无有效 atoms`);
                onComplete?.({ floor: aiFloor, atomCount: 0 });
                continue;
            }

            atoms.forEach(a => a.chatId = chatId);
            saveStateAtoms(atoms);

            // 单楼实时处理：立即向量化
            await vectorizeAtomsSimple(chatId, atoms);

            xbLog.info(MODULE_ID, `floor ${aiFloor}: ${atoms.length} atoms 已存储`);
            onComplete?.({ floor: aiFloor, atomCount: atoms.length });
        } catch (e) {
            xbLog.error(MODULE_ID, `floor ${aiFloor} 处理失败`, e);
            onComplete?.({ floor: aiFloor, atomCount: 0, error: e });
        }
    }

    isProcessing = false;
}

// 简单向量化（无进度回调，用于单楼实时处理）
async function vectorizeAtomsSimple(chatId, atoms) {
    if (!atoms?.length) return;

    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) return;

    const semanticTexts = atoms.map(a => a.semantic);
    const rTexts = atoms.map(a => buildRAggregateText(a));
    const fingerprint = getEngineFingerprint(vectorCfg);

    try {
        const vectors = await embed(semanticTexts.concat(rTexts), { timeout: 30000 });
        const split = semanticTexts.length;
        if (!Array.isArray(vectors) || vectors.length < split * 2) {
            throw new Error(`embed length mismatch: expect>=${split * 2}, got=${vectors?.length || 0}`);
        }
        const semVectors = vectors.slice(0, split);
        const rVectors = vectors.slice(split, split + split);

        const items = atoms.map((a, i) => ({
            atomId: a.atomId,
            floor: a.floor,
            vector: semVectors[i],
            rVector: rVectors[i] || semVectors[i],
        }));

        await saveStateVectors(chatId, items, fingerprint);
    } catch (e) {
        xbLog.error(MODULE_ID, 'L0 向量化失败', e);
    }
}

// ============================================================================
// 回滚钩子
// ============================================================================

async function handleStateRollback(floor) {
    xbLog.info(MODULE_ID, `收到回滚请求: floor >= ${floor}`);

    const { chatId } = getContext();

    deleteStateAtomsFromFloor(floor);
    deleteL0IndexFromFloor(floor);

    if (chatId) {
        await deleteStateVectorsFromFloor(chatId, floor);
    }
}

// ============================================================================
// 兼容旧接口
// ============================================================================

export async function batchExtractAndStoreAtoms(chatId, chat, onProgress) {
    if (!chatId || !chat?.length) return { built: 0 };

    const vectorCfg = getVectorConfig();
    if (!vectorCfg?.enabled) return { built: 0 };

    xbLog.info(MODULE_ID, `开始批量 L0 提取: ${chat.length} 条消息`);

    clearStateAtoms();
    clearL0Index();
    await clearStateVectors(chatId);

    return await incrementalExtractAtoms(chatId, chat, onProgress);
}

export async function rebuildStateVectors(chatId, vectorCfg) {
    if (!chatId || !vectorCfg?.enabled) return { built: 0 };

    const atoms = getStateAtoms();
    if (!atoms.length) return { built: 0 };

    xbLog.info(MODULE_ID, `重建 L0 向量: ${atoms.length} 条 atom`);

    await clearStateVectors(chatId);
    await vectorizeAtomsSimple(chatId, atoms);

    return { built: atoms.length };
}
