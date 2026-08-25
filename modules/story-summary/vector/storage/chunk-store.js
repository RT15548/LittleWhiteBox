// ═══════════════════════════════════════════════════════════════════════════
// Story Summary - Chunk Store (L1/L2 storage)
// ═══════════════════════════════════════════════════════════════════════════

import {
    db,
    metaTable,
    chunksTable,
    chunkVectorsTable,
    eventVectorsTable,
    CHUNK_MAX_TOKENS,
} from '../../data/db.js';
import {
    applyRecallRuntimeMutationBestEffort,
    clearRecallRuntime,
} from '../runtime/runtime.js';
import { assertFiniteVector } from './vector-validation.js';

// ═══════════════════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════════════════

export function float32ToBuffer(arr) {
    return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
}

export function bufferToFloat32(buffer) {
    return new Float32Array(buffer);
}

export function makeChunkId(floor, chunkIdx) {
    return `c-${floor}-${chunkIdx}`;
}

export function hashText(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }
    return hash.toString(36);
}

// ═══════════════════════════════════════════════════════════════════════════
// Meta 表操作
// ═══════════════════════════════════════════════════════════════════════════

export async function getMeta(chatId) {
    return await metaTable.get(chatId) || {
        chatId,
        fingerprint: null,
        lastChunkFloor: -1,
        updatedAt: 0,
    };
}

export async function updateMeta(chatId, updates) {
    await db.transaction('rw', metaTable, async () => {
        const current = await metaTable.get(chatId);
        await metaTable.put({
            chatId,
            fingerprint: null,
            lastChunkFloor: -1,
            ...(current || {}),
            ...updates,
            updatedAt: Date.now(),
        });
    });
    applyRecallRuntimeMutationBestEffort(chatId, {
        type: 'meta',
        meta: updates,
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// Chunks 表操作
// ═══════════════════════════════════════════════════════════════════════════

export async function saveChunks(chatId, chunks) {
    const records = chunks.map(chunk => ({
        chatId,
        chunkId: chunk.chunkId,
        floor: chunk.floor,
        chunkIdx: chunk.chunkIdx,
        speaker: chunk.speaker,
        isUser: chunk.isUser,
        text: chunk.text,
        textHash: chunk.textHash,
        createdAt: Date.now(),
    }));
    await chunksTable.bulkPut(records);
    applyRecallRuntimeMutationBestEffort(chatId, {
        type: 'upsertChunks',
        chunks: records,
    });
}

export async function getAllChunks(chatId) {
    return await chunksTable.where('chatId').equals(chatId).toArray();
}

export async function getChunksByFloors(chatId, floors) {
    const chunks = await chunksTable
        .where('[chatId+floor]')
        .anyOf(floors.map(f => [chatId, f]))
        .toArray();
    return chunks;
}

/**
 * 删除指定楼层及之后的所有 chunk 和向量
 */
export async function deleteChunksFromFloor(chatId, fromFloor) {
    const chunks = await chunksTable
        .where('chatId')
        .equals(chatId)
        .filter(c => c.floor >= fromFloor)
        .toArray();

    const chunkIds = chunks.map(c => c.chunkId);

    await chunksTable
        .where('chatId')
        .equals(chatId)
        .filter(c => c.floor >= fromFloor)
        .delete();

    for (const chunkId of chunkIds) {
        await chunkVectorsTable.delete([chatId, chunkId]);
    }
    applyRecallRuntimeMutationBestEffort(chatId, {
        type: 'deleteChunksFromFloor',
        floor: fromFloor,
    });
}

/**
 * 删除指定楼层的 chunk 和向量
 */
export async function deleteChunksAtFloor(chatId, floor) {
    const chunks = await chunksTable
        .where('[chatId+floor]')
        .equals([chatId, floor])
        .toArray();

    const chunkIds = chunks.map(c => c.chunkId);

    await chunksTable.where('[chatId+floor]').equals([chatId, floor]).delete();

    for (const chunkId of chunkIds) {
        await chunkVectorsTable.delete([chatId, chunkId]);
    }
    applyRecallRuntimeMutationBestEffort(chatId, {
        type: 'deleteChunksAtFloor',
        floor,
    });
}

export async function clearAllChunks(chatId) {
    await chunksTable.where('chatId').equals(chatId).delete();
    await chunkVectorsTable.where('chatId').equals(chatId).delete();
    await clearRecallRuntime(chatId, 'chunks');
}

// ═══════════════════════════════════════════════════════════════════════════
// ChunkVectors 表操作
// ═══════════════════════════════════════════════════════════════════════════

export async function saveChunkVectors(chatId, items, fingerprint) {
    let expectedDimensions = null;
    const records = items.map((item, index) => {
        const dims = assertFiniteVector(item.vector, `chunk vector ${index}`, expectedDimensions);
        expectedDimensions ??= dims;
        return {
            chatId,
            chunkId: item.chunkId,
            vector: float32ToBuffer(new Float32Array(item.vector)),
            dims,
            fingerprint,
        };
    });
    await chunkVectorsTable.bulkPut(records);
    applyRecallRuntimeMutationBestEffort(chatId, {
        type: 'upsertChunkVectors',
        items: records,
    });
}

export async function getAllChunkVectors(chatId) {
    const records = await chunkVectorsTable.where('chatId').equals(chatId).toArray();
    return records.map(r => ({
        ...r,
        vector: bufferToFloat32(r.vector),
    }));
}

export async function getChunkVectorsByIds(chatId, chunkIds, options = {}) {
    if (!chatId || !chunkIds?.length) return [];
    const { decode = true } = options;

    const records = await chunkVectorsTable
        .where('[chatId+chunkId]')
        .anyOf(chunkIds.map(id => [chatId, id]))
        .toArray();

    if (!decode) {
        return records.map(r => ({
            chunkId: r.chunkId,
            vector: r.vector,
        }));
    }

    return records.map(r => ({
        chunkId: r.chunkId,
        vector: bufferToFloat32(r.vector),
    }));
}

// ═══════════════════════════════════════════════════════════════════════════
// EventVectors 表操作
// ═══════════════════════════════════════════════════════════════════════════

export async function saveEventVectors(chatId, items, fingerprint) {
    let expectedDimensions = null;
    const records = items.map((item, index) => {
        const dims = assertFiniteVector(item.vector, `event vector ${index}`, expectedDimensions);
        expectedDimensions ??= dims;
        return {
            chatId,
            eventId: item.eventId,
            vector: float32ToBuffer(new Float32Array(item.vector)),
            dims,
            fingerprint,
        };
    });
    await eventVectorsTable.bulkPut(records);
    applyRecallRuntimeMutationBestEffort(chatId, {
        type: 'upsertEventVectors',
        items: records,
    });
}

export async function getAllEventVectors(chatId) {
    const records = await eventVectorsTable.where('chatId').equals(chatId).toArray();
    return records.map(r => ({
        ...r,
        vector: bufferToFloat32(r.vector),
    }));
}

export async function clearEventVectors(chatId) {
    await eventVectorsTable.where('chatId').equals(chatId).delete();
    await clearRecallRuntime(chatId, 'events');
}

/**
 * 按 ID 列表删除 event 向量
 */
export async function deleteEventVectorsByIds(chatId, eventIds) {
    for (const eventId of eventIds) {
        await eventVectorsTable.delete([chatId, eventId]);
    }
    applyRecallRuntimeMutationBestEffort(chatId, {
        type: 'deleteEventVectorsByIds',
        eventIds,
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 统计与工具
// ═══════════════════════════════════════════════════════════════════════════

export async function getStorageStats(chatId) {
    const [meta, chunkCount, chunkVectorCount, eventCount] = await Promise.all([
        getMeta(chatId),
        chunksTable.where('chatId').equals(chatId).count(),
        chunkVectorsTable.where('chatId').equals(chatId).count(),
        eventVectorsTable.where('chatId').equals(chatId).count(),
    ]);

    return {
        fingerprint: meta.fingerprint,
        lastChunkFloor: meta.lastChunkFloor,
        chunks: chunkCount,
        chunkVectors: chunkVectorCount,
        eventVectors: eventCount,
    };
}

export async function clearChatData(chatId) {
    await Promise.all([
        metaTable.delete(chatId),
        chunksTable.where('chatId').equals(chatId).delete(),
        chunkVectorsTable.where('chatId').equals(chatId).delete(),
        eventVectorsTable.where('chatId').equals(chatId).delete(),
    ]);
    await clearRecallRuntime(chatId);
}

export { CHUNK_MAX_TOKENS };
