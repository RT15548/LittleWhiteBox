// ═══════════════════════════════════════════════════════════════════════════
// Story Summary - Chunk Builder
// 标准 RAG chunking: ~200 tokens per chunk
// ═══════════════════════════════════════════════════════════════════════════

import { getContext } from '../../../../../../../extensions.js';
import {
    getMeta,
    updateMeta,
    saveChunks,
    saveChunkVectors,
    clearAllChunks,
    deleteChunksFromFloor,
    deleteChunksAtFloor,
    makeChunkId,
    hashText,
    CHUNK_MAX_TOKENS,
} from '../storage/chunk-store.js';
import { embed, getEngineFingerprint } from '../utils/embedder.js';
import {
    createInvalidEmbeddingResponseError,
    getEmbeddingFailureDetails,
    isRetryableEmbeddingFailure,
} from '../llm/embedding-failure.js';
import { xbLog } from '../../../../core/debug-core.js';
import { filterText } from '../utils/text-filter.js';

const MODULE_ID = 'chunk-builder';
const INCREMENTAL_EMBED_BATCH_SIZE = 20;
const INCREMENTAL_EMBED_MAX_ATTEMPTS = 3;
const INCREMENTAL_EMBED_RETRY_DELAY_MS = 60000;

// ═══════════════════════════════════════════════════════════════════════════
// Token 估算
// ═══════════════════════════════════════════════════════════════════════════

function estimateTokens(text) {
    if (!text) return 0;
    const chinese = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const other = text.length - chinese;
    return Math.ceil(chinese + other / 4);
}

function splitSentences(text) {
    if (!text) return [];
    const parts = text.split(/(?<=[。！？\n])|(?<=[.!?]\s)/);
    return parts.map(s => s.trim()).filter(s => s.length > 0);
}

// ═══════════════════════════════════════════════════════════════════════════
// Chunk 切分
// ═══════════════════════════════════════════════════════════════════════════

export function chunkMessage(floor, message, maxTokens = CHUNK_MAX_TOKENS) {
    const text = message.mes || '';
    const speaker = message.name || (message.is_user ? '用户' : '角色');
    const isUser = !!message.is_user;

    // 1. 应用用户自定义过滤规则
    // 2. 移除 TTS 标记（硬编码）
    // 3. 移除 <state> 标签（硬编码，L0 已单独存储）
    const cleanText = filterText(text)
        .replace(/\[tts:[^\]]*\]/gi, '')
        .replace(/<state>[\s\S]*?<\/state>/gi, '')
        .trim();

    if (!cleanText) return [];

    const totalTokens = estimateTokens(cleanText);

    if (totalTokens <= maxTokens) {
        return [{
            chunkId: makeChunkId(floor, 0),
            floor,
            chunkIdx: 0,
            speaker,
            isUser,
            text: cleanText,
            textHash: hashText(cleanText),
        }];
    }

    const sentences = splitSentences(cleanText);
    const chunks = [];
    let currentSentences = [];
    let currentTokens = 0;

    for (const sent of sentences) {
        const sentTokens = estimateTokens(sent);

        if (sentTokens > maxTokens) {
            if (currentSentences.length > 0) {
                const chunkText = currentSentences.join('');
                chunks.push({
                    chunkId: makeChunkId(floor, chunks.length),
                    floor,
                    chunkIdx: chunks.length,
                    speaker,
                    isUser,
                    text: chunkText,
                    textHash: hashText(chunkText),
                });
                currentSentences = [];
                currentTokens = 0;
            }

            const sliceSize = maxTokens * 2;
            for (let i = 0; i < sent.length; i += sliceSize) {
                const slice = sent.slice(i, i + sliceSize);
                chunks.push({
                    chunkId: makeChunkId(floor, chunks.length),
                    floor,
                    chunkIdx: chunks.length,
                    speaker,
                    isUser,
                    text: slice,
                    textHash: hashText(slice),
                });
            }
            continue;
        }

        if (currentTokens + sentTokens > maxTokens && currentSentences.length > 0) {
            const chunkText = currentSentences.join('');
            chunks.push({
                chunkId: makeChunkId(floor, chunks.length),
                floor,
                chunkIdx: chunks.length,
                speaker,
                isUser,
                text: chunkText,
                textHash: hashText(chunkText),
            });
            currentSentences = [];
            currentTokens = 0;
        }

        currentSentences.push(sent);
        currentTokens += sentTokens;
    }

    if (currentSentences.length > 0) {
        const chunkText = currentSentences.join('');
        chunks.push({
            chunkId: makeChunkId(floor, chunks.length),
            floor,
            chunkIdx: chunks.length,
            speaker,
            isUser,
            text: chunkText,
            textHash: hashText(chunkText),
        });
    }

    return chunks;
}

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
    const isCancelled = () => signal?.aborted || shouldCancel?.() === true;

    const { chat, chatId } = getContext();
    if (!chatId || !chat?.length) {
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
    const allVectors = [];

    for (let i = 0; i < texts.length; i += batchSize) {
        if (isCancelled()) break;

        const batch = texts.slice(i, i + batchSize);

        try {
            const vectors = await embed(batch, vectorConfig, { signal });
            if (isCancelled()) break;
            allVectors.push(...vectors);
            completed += batch.length;
            onProgress?.(completed, texts.length);
        } catch (e) {
            xbLog.error(MODULE_ID, `批次 ${i}/${texts.length} 向量化失败`, e);
            allVectors.push(...batch.map(() => null));
            errors++;
        }
    }

    if (isCancelled()) {
        return { built: completed, errors };
    }

    const vectorItems = allChunks
        .map((chunk, idx) => allVectors[idx] ? { chunkId: chunk.chunkId, vector: allVectors[idx] } : null)
        .filter(Boolean);

    if (vectorItems.length > 0) {
        if (isCancelled()) return { built: completed, errors };
        await saveChunkVectors(chatId, vectorItems, fingerprint);
    }

    if (isCancelled()) return { built: completed, errors };
    await updateMeta(chatId, { lastChunkFloor: chat.length - 1 });

    xbLog.info(MODULE_ID, `构建完成：${vectorItems.length} 个向量，${errors} 个错误`);

    return { built: vectorItems.length, errors };
}

// ═══════════════════════════════════════════════════════════════════════════
// 增量构建
// ═══════════════════════════════════════════════════════════════════════════

export async function buildIncrementalChunks(options = {}) {
    const {
        vectorConfig,
        targetChatId = '',
        chatSnapshot = null,
        signal = null,
        shouldCancel = null,
        onRetry = null,
    } = options;
    const isCancelled = () => signal?.aborted || shouldCancel?.() === true;
    const cancelledResult = (startFloor = null, endFloor = null) => ({
        success: false,
        status: 'cancelled',
        code: 'vector_config_changed',
        built: 0,
        startFloor,
        endFloor,
    });

    const context = getContext();
    const chat = Array.isArray(chatSnapshot) ? chatSnapshot : context.chat;
    const chatId = targetChatId || context.chatId;
    if (!chatId || !chat?.length) {
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

    if (newChunks.length === 0) {
        await updateMeta(chatId, { lastChunkFloor: endFloor, fingerprint });
        return { success: true, status: 'empty', built: 0, startFloor, endFloor };
    }

    const texts = newChunks.map(c => c.text);

    const rollback = async () => {
        try {
            await deleteChunksFromFloor(chatId, startFloor);
            return null;
        } catch (rollbackError) {
            xbLog.warn(MODULE_ID, '增量构建失败后的片段回滚失败', rollbackError);
            return rollbackError;
        }
    };
    const failedResult = async (code, error, details = {}) => ({
        success: false,
        status: 'failed',
        code,
        built: 0,
        startFloor,
        endFloor,
        error,
        ...details,
        rollbackError: await rollback(),
    });
    const cancelledAfterWrite = async () => {
        await rollback();
        return cancelledResult(startFloor, endFloor);
    };

    const vectors = [];
    try {
        for (let i = 0; i < texts.length; i += INCREMENTAL_EMBED_BATCH_SIZE) {
            if (isCancelled()) return cancelledResult(startFloor, endFloor);

            const batch = texts.slice(i, i + INCREMENTAL_EMBED_BATCH_SIZE);
            let batchVectors = null;

            for (let attempt = 1; attempt <= INCREMENTAL_EMBED_MAX_ATTEMPTS; attempt++) {
                try {
                    const result = await embed(batch, vectorConfig, { signal });
                    if (isCancelled()) return cancelledResult(startFloor, endFloor);
                    if (
                        !Array.isArray(result)
                        || result.length < batch.length
                        || result.slice(0, batch.length).some(vector => !vector?.length)
                    ) {
                        throw createInvalidEmbeddingResponseError(batch.length, result?.length || 0);
                    }
                    batchVectors = result.slice(0, batch.length);
                    break;
                } catch (error) {
                    if (isCancelled()) return cancelledResult(startFloor, endFloor);
                    if (
                        attempt >= INCREMENTAL_EMBED_MAX_ATTEMPTS
                        || !isRetryableEmbeddingFailure(error)
                    ) throw error;

                    xbLog.warn(
                        MODULE_ID,
                        `增量向量批次 ${Math.floor(i / INCREMENTAL_EMBED_BATCH_SIZE) + 1}/${Math.ceil(texts.length / INCREMENTAL_EMBED_BATCH_SIZE)} 第 ${attempt} 次失败，60 秒后重试`,
                        error,
                    );
                    const batchIndex = Math.floor(i / INCREMENTAL_EMBED_BATCH_SIZE) + 1;
                    const batchCount = Math.ceil(texts.length / INCREMENTAL_EMBED_BATCH_SIZE);
                    for (let waited = 0; waited < INCREMENTAL_EMBED_RETRY_DELAY_MS; waited += 1000) {
                        if (isCancelled()) return cancelledResult(startFloor, endFloor);
                        onRetry?.({
                            batchIndex,
                            batchCount,
                            attempt,
                            secondsRemaining: Math.ceil((INCREMENTAL_EMBED_RETRY_DELAY_MS - waited) / 1000),
                        });
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }

            vectors.push(...batchVectors);
        }
    } catch (error) {
        const { code, httpStatus } = getEmbeddingFailureDetails(error);
        xbLog.error(MODULE_ID, `增量向量化失败 code=${code}${httpStatus ? ` http=${httpStatus}` : ''}`, error);
        return await failedResult(code, error, { httpStatus });
    }

    const vectorItems = newChunks.map((chunk, idx) => ({
        chunkId: chunk.chunkId,
        vector: vectors[idx],
    }));

    try {
        await saveChunks(chatId, newChunks);
    } catch (error) {
        xbLog.error(MODULE_ID, '增量 L1 chunk 写入失败', error);
        return await failedResult('chunk_write_failed', error);
    }
    if (isCancelled()) return await cancelledAfterWrite();

    try {
        await saveChunkVectors(chatId, vectorItems, fingerprint);
    } catch (error) {
        xbLog.error(MODULE_ID, '增量 L1 向量写入失败', error);
        return await failedResult('vector_write_failed', error);
    }
    if (isCancelled()) return await cancelledAfterWrite();

    try {
        await updateMeta(chatId, { lastChunkFloor: endFloor, fingerprint });
    } catch (error) {
        xbLog.error(MODULE_ID, '增量 L1 元数据写入失败', error);
        return await failedResult('metadata_write_failed', error);
    }

    return { success: true, status: 'built', built: vectorItems.length, startFloor, endFloor };
}


// ═══════════════════════════════════════════════════════════════════════════
// L1 同步（消息变化时调用）
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 消息删除后同步：删除 floor >= newLength 的 chunk
 */
export async function syncOnMessageDeleted(chatId, newLength) {
    if (!chatId || newLength < 0) return;

    await deleteChunksFromFloor(chatId, newLength);
    const meta = await getMeta(chatId);
    await updateMeta(chatId, { lastChunkFloor: Math.min(meta.lastChunkFloor, newLength - 1) });

    xbLog.info(MODULE_ID, `消息删除同步：删除 floor >= ${newLength}`);
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
