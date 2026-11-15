// ═══════════════════════════════════════════════════════════════════════════
// Story Summary - Chunk Builder
// 标准 RAG chunking: ~200 tokens per chunk
// ═══════════════════════════════════════════════════════════════════════════

import { getContext } from '../../../../../../../extensions.js';
import { getChatIdentity } from '../../data/chat-identity.js';
import {
    getMeta,
    updateMeta,
    saveChunks,
    saveChunkVectors,
    saveIncrementalChunks,
    clearAllChunks,
    deleteChunksFromFloor,
    deleteChunksAtFloor,
} from '../storage/chunk-store.js';
import { getEngineFingerprint } from '../utils/embedder.js';
import { embedForStorage, acknowledgeStoredEmbeddings } from '../runtime/embedding-receipts.js';
import { getEmbeddingFailureDetails } from '../llm/embedding-failure.js';
import { xbLog } from '../../../../core/debug-core.js';
import { chunkMessage } from './chunk-text.js';
import { inputDigest } from '../utils/vector-input-digest.js';
import { createAbortError } from '../../../../shared/common/abort-utils.js';
import { trackVectorActivity } from '../runtime/vector-activity.js';

const MODULE_ID = 'chunk-builder';
const INCREMENTAL_EMBED_BATCH_SIZE = 20;

// ═══════════════════════════════════════════════════════════════════════════
// 构建状态
// ═══════════════════════════════════════════════════════════════════════════

export async function getChunkBuildStatus() {
    const { chat, chatId } = getContext();
    if (!chatId) {
        return { totalFloors: 0, builtFloors: 0, pending: 0 };
    }

    const meta = await getMeta(chatId);
    const totalFloors = chat?.length || 0;
    const builtFloors = meta.lastChunkFloor + 1;

    return {
        totalFloors,
        builtFloors,
        lastChunkFloor: meta.lastChunkFloor,
        pending: Math.max(0, totalFloors - builtFloors),
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// 全量构建
// ═══════════════════════════════════════════════════════════════════════════

export async function buildAllChunks(options = {}) {
    const { onProgress, shouldCancel, vectorConfig, signal = null } = options;
    const isCancelled = () => signal?.aborted || shouldCancel?.() === true
        || getChatIdentity(getContext()) !== identity;

    const context = getContext();
    const { chat, chatId } = context;
    const identity = getChatIdentity(context);
    if (!identity || !chatId || !chat?.length) {
        return { built: 0, errors: 0 };
    }

    const fingerprint = getEngineFingerprint(vectorConfig);

    await clearAllChunks(chatId);
    await updateMeta(chatId, { lastChunkFloor: -1, fingerprint });

    const allChunks = [];
    for (let floor = 0; floor < chat.length; floor++) {
        const chunks = chunkMessage(floor, chat[floor]);
        allChunks.push(...chunks);
    }

    if (allChunks.length === 0) {
        return { built: 0, errors: 0 };
    }

    xbLog.info(MODULE_ID, `开始构建 ${allChunks.length} 个 chunks（${chat.length} 层楼）`);

    await saveChunks(chatId, allChunks);

    const texts = allChunks.map(c => c.text);
    const batchSize = 20;

    let completed = 0;
    let errors = 0;
    for (let i = 0; i < texts.length; i += batchSize) {
        if (isCancelled()) break;
        const batch = texts.slice(i, i + batchSize);
        let vectors;
        try {
            vectors = await embedForStorage(batch, vectorConfig, { chatId: identity, signal });
        } catch (error) {
            if (isCancelled()) break;
            xbLog.error(MODULE_ID, `批次 ${i}/${texts.length} 向量化失败`, error);
            errors++;
            break;
        }
        if (isCancelled()) break;
        const vectorItems = allChunks.slice(i, i + batch.length).map((chunk, index) => ({
            chunkId: chunk.chunkId, vector: vectors[index], sourceHash: inputDigest('chunk', batch[index]),
        }));
        await saveChunkVectors(chatId, vectorItems, fingerprint);
        acknowledgeStoredEmbeddings(batch, vectorConfig, { chatId: identity });
        completed += batch.length;
        onProgress?.(completed, texts.length);
    }

    if (isCancelled()) return { built: completed, errors };
    if (!errors) await updateMeta(chatId, { lastChunkFloor: chat.length - 1 });

    xbLog.info(MODULE_ID, `构建完成：${completed} 个向量，${errors} 个错误`);

    return { built: completed, errors };
}

// ═══════════════════════════════════════════════════════════════════════════
// 增量构建
// ═══════════════════════════════════════════════════════════════════════════

export async function buildIncrementalChunks(options = {}) {
    return trackVectorActivity({ chatId: options.targetChatId || getContext()?.chatId, phase: 'l1-vectorization', api: options.vectorConfig?.embeddingApi, unit: 'chunks' },
        activity => buildIncrementalChunksInner(options, activity));
}

async function buildIncrementalChunksInner(options, activity) {
    const {
        vectorConfig,
        targetChatId = '',
        chatSnapshot = null,
        signal = null,
        shouldCancel = null,
        commit = task => task(),
    } = options;
    const isCancelled = () => signal?.aborted || shouldCancel?.() === true
        || getChatIdentity(getContext()) !== identity;
    const cancelledResult = (startFloor = null, endFloor = null) => ({
        success: false,
        status: 'cancelled',
        code: 'vector_config_changed',
        built: 0,
        startFloor,
        endFloor,
    });

    const context = getContext();
    const identity = getChatIdentity(context);
    const chat = Array.isArray(chatSnapshot) ? chatSnapshot : context.chat;
    const chatId = targetChatId || context.chatId;
    if (!identity || !chatId || !chat?.length) {
        return { success: false, status: 'failed', code: 'no_active_chat', built: 0 };
    }

    const meta = await getMeta(chatId);
    const fingerprint = getEngineFingerprint(vectorConfig);

    if (meta.fingerprint && meta.fingerprint !== fingerprint) {
        xbLog.warn(MODULE_ID, '引擎指纹不匹配，跳过增量构建');
        return { success: false, status: 'failed', code: 'fingerprint_mismatch', built: 0 };
    }

    const startFloor = meta.lastChunkFloor + 1;
    const endFloor = chat.length - 1;
    if (isCancelled()) return cancelledResult(startFloor, endFloor);
    if (startFloor > endFloor) {
        return { success: true, status: 'up_to_date', built: 0, startFloor, endFloor };
    }

    xbLog.info(MODULE_ID, `增量构建 ${startFloor} - ${endFloor} 层`);

    const newChunks = [];
    for (let floor = startFloor; floor <= endFloor; floor++) {
        const chunks = chunkMessage(floor, chat[floor]);
        newChunks.push(...chunks);
    }

    const texts = newChunks.map(c => c.text);
    activity.update({ total: texts.length, state: 'embedding' });

    const failedResult = (code, error, details = {}) => ({
        success: false,
        status: 'failed',
        code,
        built: 0,
        startFloor,
        endFloor,
        error,
        ...details,
    });

    const vectors = [];
    try {
        for (let i = 0; i < texts.length; i += INCREMENTAL_EMBED_BATCH_SIZE) {
            if (isCancelled()) return cancelledResult(startFloor, endFloor);

            const batch = texts.slice(i, i + INCREMENTAL_EMBED_BATCH_SIZE);
            activity.update({ activeUnits: batch.length, state: 'embedding' });
            const batchVectors = await embedForStorage(batch, vectorConfig, { chatId: identity, signal });
            if (isCancelled()) return cancelledResult(startFloor, endFloor);
            vectors.push(...batchVectors);
            activity.update({ completed: vectors.length, activeUnits: 0 });
        }
    } catch (error) {
        if (isCancelled()) return cancelledResult(startFloor, endFloor);
        const { code, httpStatus } = getEmbeddingFailureDetails(error);
        xbLog.error(MODULE_ID, `增量向量化失败 code=${code}${httpStatus ? ` http=${httpStatus}` : ''}`, error);
        return failedResult(code, error, { httpStatus });
    }

    const vectorItems = newChunks.map((chunk, idx) => ({
        chunkId: chunk.chunkId,
        vector: vectors[idx],
        sourceHash: inputDigest('chunk', texts[idx]),
    }));

    try {
        activity.update({ state: 'saving' });
        await commit(() => saveIncrementalChunks(chatId, newChunks, vectorItems, fingerprint, endFloor, () => {
            if (isCancelled()) throw createAbortError();
        }));
    } catch (error) {
        if (isCancelled()) return cancelledResult(startFloor, endFloor);
        xbLog.error(MODULE_ID, '增量 L1 写入失败', error);
        return failedResult(error.code, error.cause);
    }

    acknowledgeStoredEmbeddings(texts, vectorConfig, { chatId: identity });
    if (newChunks.length === 0) return { success: true, status: 'empty', built: 0, startFloor, endFloor };
    return { success: true, status: 'built', built: vectorItems.length, startFloor, endFloor, chunks: newChunks };
}


// ═══════════════════════════════════════════════════════════════════════════
// L1 同步（消息变化时调用）
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 消息删除后同步：删除 floor >= newLength 的 chunk
 */
export async function syncOnMessageDeleted(chatId, newLength) {
    if (!chatId || newLength < 0) return;

    const result = await deleteChunksFromFloor(chatId, newLength);
    if (result.deletedCount || result.boundaryChanged) {
        xbLog.info(MODULE_ID, `消息删除同步：删除 floor >= ${newLength}`);
    }
    return result;
}

/**
 * swipe 后同步：删除最后楼层的 chunk（等待后续重建）
 */
export async function syncOnMessageSwiped(chatId, lastFloor) {
    if (!chatId || lastFloor < 0) return;

    await deleteChunksAtFloor(chatId, lastFloor);
    const meta = await getMeta(chatId);
    await updateMeta(chatId, { lastChunkFloor: Math.min(meta.lastChunkFloor, lastFloor - 1) });

    xbLog.info(MODULE_ID, `swipe 同步：删除 floor ${lastFloor}`);
}
