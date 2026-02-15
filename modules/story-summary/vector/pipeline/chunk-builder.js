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
import { xbLog } from '../../../../core/debug-core.js';
import { filterText } from '../utils/text-filter.js';
import { extractAndStoreAtomsForRound } from './state-integration.js';
import {
    deleteStateAtomsFromFloor,
    deleteStateVectorsFromFloor,
    deleteL0IndexFromFloor,
} from '../storage/state-store.js';

const MODULE_ID = 'chunk-builder';

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
    const { onProgress, shouldCancel, vectorConfig } = options;

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
        if (shouldCancel?.()) break;

        const batch = texts.slice(i, i + batchSize);

        try {
            const vectors = await embed(batch, vectorConfig);
            allVectors.push(...vectors);
            completed += batch.length;
            onProgress?.(completed, texts.length);
        } catch (e) {
            xbLog.error(MODULE_ID, `批次 ${i}/${texts.length} 向量化失败`, e);
            allVectors.push(...batch.map(() => null));
            errors++;
        }
    }

    if (shouldCancel?.()) {
        return { built: completed, errors };
    }

    const vectorItems = allChunks
        .map((chunk, idx) => allVectors[idx] ? { chunkId: chunk.chunkId, vector: allVectors[idx] } : null)
        .filter(Boolean);

    if (vectorItems.length > 0) {
        await saveChunkVectors(chatId, vectorItems, fingerprint);
    }

    await updateMeta(chatId, { lastChunkFloor: chat.length - 1 });

    xbLog.info(MODULE_ID, `构建完成：${vectorItems.length} 个向量，${errors} 个错误`);

    return { built: vectorItems.length, errors };
}

// ═══════════════════════════════════════════════════════════════════════════
// 增量构建
// ═══════════════════════════════════════════════════════════════════════════

export async function buildIncrementalChunks(options = {}) {
    const { vectorConfig } = options;

    const { chat, chatId } = getContext();
    if (!chatId || !chat?.length) {
        return { built: 0 };
    }

    const meta = await getMeta(chatId);
    const fingerprint = getEngineFingerprint(vectorConfig);

    if (meta.fingerprint && meta.fingerprint !== fingerprint) {
        xbLog.warn(MODULE_ID, '引擎指纹不匹配，跳过增量构建');
        return { built: 0 };
    }

    const startFloor = meta.lastChunkFloor + 1;
    if (startFloor >= chat.length) {
        return { built: 0 };
    }

    xbLog.info(MODULE_ID, `增量构建 ${startFloor} - ${chat.length - 1} 层`);

    const newChunks = [];
    for (let floor = startFloor; floor < chat.length; floor++) {
        const chunks = chunkMessage(floor, chat[floor]);
        newChunks.push(...chunks);
    }

    if (newChunks.length === 0) {
        await updateMeta(chatId, { lastChunkFloor: chat.length - 1 });
        return { built: 0 };
    }

    await saveChunks(chatId, newChunks);

    const texts = newChunks.map(c => c.text);

    try {
        const vectors = await embed(texts, vectorConfig);
        const vectorItems = newChunks.map((chunk, idx) => ({
            chunkId: chunk.chunkId,
            vector: vectors[idx],
        }));
        await saveChunkVectors(chatId, vectorItems, fingerprint);
        await updateMeta(chatId, { lastChunkFloor: chat.length - 1 });

        return { built: vectorItems.length };
    } catch (e) {
        xbLog.error(MODULE_ID, '增量向量化失败', e);
        return { built: 0 };
    }
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
    await updateMeta(chatId, { lastChunkFloor: newLength - 1 });

    xbLog.info(MODULE_ID, `消息删除同步：删除 floor >= ${newLength}`);
}

/**
 * swipe 后同步：删除最后楼层的 chunk（等待后续重建）
 */
export async function syncOnMessageSwiped(chatId, lastFloor) {
    if (!chatId || lastFloor < 0) return;

    await deleteChunksAtFloor(chatId, lastFloor);
    await updateMeta(chatId, { lastChunkFloor: lastFloor - 1 });

    xbLog.info(MODULE_ID, `swipe 同步：删除 floor ${lastFloor}`);
}

/**
 * 新消息后同步：删除 + 重建最后楼层
 */
export async function syncOnMessageReceived(chatId, lastFloor, message, vectorConfig, onL0Complete) {
    if (!chatId || lastFloor < 0 || !message) return { built: 0, chunks: [] };
    if (!vectorConfig?.enabled) return { built: 0, chunks: [] };

    // 删除该楼层旧的
    await deleteChunksAtFloor(chatId, lastFloor);

    // 重建
    const chunks = chunkMessage(lastFloor, message);
    if (chunks.length === 0) return { built: 0, chunks: [] };

    await saveChunks(chatId, chunks);

    // 向量化
    const fingerprint = getEngineFingerprint(vectorConfig);
    const texts = chunks.map(c => c.text);

    let vectorized = false;
    try {
        const vectors = await embed(texts, vectorConfig);
        const items = chunks.map((c, i) => ({ chunkId: c.chunkId, vector: vectors[i] }));
        await saveChunkVectors(chatId, items, fingerprint);
        await updateMeta(chatId, { lastChunkFloor: lastFloor });

        vectorized = true;
        xbLog.info(MODULE_ID, `消息同步：重建 floor ${lastFloor}，${chunks.length} 个 chunk`);
    } catch (e) {
        xbLog.error(MODULE_ID, `消息同步失败：floor ${lastFloor}`, e);
    }
    // L0 配对提取（仅 AI 消息触发）
    if (!message.is_user) {
        const { chat } = getContext();
        const userFloor = lastFloor - 1;
        const userMessage = (userFloor >= 0 && chat[userFloor]?.is_user) ? chat[userFloor] : null;

        // L0 先删后建（与 L1 deleteChunksAtFloor 对称）
        // regenerate / swipe 后新消息覆盖旧楼时，清理旧 atoms
        deleteStateAtomsFromFloor(lastFloor);
        deleteL0IndexFromFloor(lastFloor);
        await deleteStateVectorsFromFloor(chatId, lastFloor);

        try {
            await extractAndStoreAtomsForRound(lastFloor, message, userMessage, onL0Complete);
        } catch (e) {
            xbLog.warn(MODULE_ID, `Atom 提取失败: floor ${lastFloor}`, e);
        }
    }

    return { built: vectorized ? chunks.length : 0, chunks };
}
