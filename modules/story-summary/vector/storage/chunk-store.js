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

async function writeMeta(chatId, updates) {
    const current = await metaTable.get(chatId);
    await metaTable.put({
        chatId,
        fingerprint: null,
        lastChunkFloor: -1,
        ...(current || {}),
        ...updates,
        updatedAt: Date.now(),
    });
}

export async function updateMeta(chatId, updates) {
    await db.transaction('rw', metaTable, () => writeMeta(chatId, updates));
    applyRecallRuntimeMutationBestEffort(chatId, {
        type: 'meta',
        meta: updates,
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// Chunks 表操作
// ═══════════════════════════════════════════════════════════════════════════

export function makeChunkRecords(chatId, chunks) {
    return chunks.map(chunk => ({
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
}

export async function saveChunks(chatId, chunks) {
    const records = makeChunkRecords(chatId, chunks);
    await chunksTable.bulkPut(records);
    applyRecallRuntimeMutationBestEffort(chatId, {
        type: 'upsertChunks',
        chunks: records,
    });
}

export async function getAllChunks(chatId) {
    return await chunksTable.where('chatId').equals(chatId).toArray();
}

export async function hasStoredChunksAfterFloor(chatId, floor, chatLength) {
    if (floor + 1 >= chatLength) return false;
    return await chunksTable.where('[chatId+floor]')
        .between([chatId, floor + 1], [chatId, chatLength], true, false)
        .count() > 0;
}

export async function getChunksByFloors(chatId, floors) {
    const chunks = await chunksTable
        .where('[chatId+floor]')
        .anyOf(floors.map(f => [chatId, f]))
        .toArray();
    return chunks;
}

/**
 * Atomically discard the affected L1 range and rewind its contiguous boundary.
 */
export async function deleteChunksFromFloor(chatId, fromFloor) {
    const result = await db.transaction('rw', chunksTable, chunkVectorsTable, metaTable, async () => {
        const keys = await chunksTable.where('[chatId+floor]')
            .between([chatId, fromFloor], [chatId, Infinity], true, true).primaryKeys();
        const meta = await metaTable.get(chatId);
        const previousFloor = meta?.lastChunkFloor ?? -1;
        const lastChunkFloor = meta ? Math.min(previousFloor, fromFloor - 1) : previousFloor;
        const boundaryChanged = lastChunkFloor !== previousFloor;
        if (keys.length) {
            await chunksTable.bulkDelete(keys);
            await chunkVectorsTable.bulkDelete(keys);
        }
        if (boundaryChanged) {
            await metaTable.put({ ...meta, lastChunkFloor, updatedAt: Date.now() });
        }
        return { deletedCount: keys.length, boundaryChanged, lastChunkFloor };
    });
    if (result.deletedCount || result.boundaryChanged) {
        applyRecallRuntimeMutationBestEffort(chatId, {
            type: 'deleteChunksFromFloor',
            floor: fromFloor,
        });
    }
    return result;
}

/**
 * 删除指定楼层的 chunk 和向量
 */
export async function deleteChunksAtFloor(chatId, floor) {
    const result = await db.transaction('rw', chunksTable, chunkVectorsTable, metaTable, async () => {
        const keys = await chunksTable.where('[chatId+floor]').equals([chatId, floor]).primaryKeys();
        const meta = await metaTable.get(chatId);
        const boundaryChanged = meta && meta.lastChunkFloor >= floor;
        if (keys.length) {
            await chunksTable.bulkDelete(keys);
            await chunkVectorsTable.bulkDelete(keys);
        }
        if (boundaryChanged) await metaTable.put({ ...meta, lastChunkFloor: floor - 1, updatedAt: Date.now() });
        return { deleted: keys.length, boundaryChanged };
    });
    if (result.deleted || result.boundaryChanged) applyRecallRuntimeMutationBestEffort(chatId, {
        type: 'deleteChunksAtFloor',
        floor,
    });
    return result.deleted;
}

export async function clearAllChunks(chatId) {
    await chunksTable.where('chatId').equals(chatId).delete();
    await chunkVectorsTable.where('chatId').equals(chatId).delete();
    await clearRecallRuntime(chatId, 'chunks');
}

// ═══════════════════════════════════════════════════════════════════════════
// ChunkVectors 表操作
// ═══════════════════════════════════════════════════════════════════════════

export function makeChunkVectorRecords(chatId, items, fingerprint) {
    let expectedDimensions = null;
    return items.map((item, index) => {
        const dims = assertFiniteVector(item.vector, `chunk vector ${index}`, expectedDimensions);
        expectedDimensions ??= dims;
        return {
            chatId,
            chunkId: item.chunkId,
            vector: float32ToBuffer(new Float32Array(item.vector)),
            dims,
            fingerprint,
            ...(item.sourceHash ? { sourceHash: item.sourceHash } : {}),
        };
    });
}

export async function saveChunkVectors(chatId, items, fingerprint) {
    const records = makeChunkVectorRecords(chatId, items, fingerprint);
    await chunkVectorsTable.bulkPut(records);
    applyRecallRuntimeMutationBestEffort(chatId, {
        type: 'upsertChunkVectors',
        items: records,
    });
}

// A watermark can precede already-restored chunks. Commit the entire incremental
// batch atomically so failure/cancellation restores overwritten records as well
// as removing new ones. Runtime invalidation must follow commit, not each write.
export async function saveIncrementalChunks(chatId, chunks, items, fingerprint, lastChunkFloor, assertCurrent) {
    const chunkRecords = makeChunkRecords(chatId, chunks);
    const updates = { lastChunkFloor, fingerprint };
    let vectorRecords;
    let code = 'vector_write_failed';
    try {
        vectorRecords = makeChunkVectorRecords(chatId, items, fingerprint);
        await db.transaction('rw', chunksTable, chunkVectorsTable, metaTable, async () => {
            assertCurrent();
            code = 'chunk_write_failed';
            await chunksTable.bulkPut(chunkRecords);
            assertCurrent();
            code = 'vector_write_failed';
            await chunkVectorsTable.bulkPut(vectorRecords);
            assertCurrent();
            code = 'metadata_write_failed';
            await writeMeta(chatId, updates);
            assertCurrent();
        });
    } catch (cause) {
        const error = new Error(cause.message, { cause });
        error.code = code;
        throw error;
    }
    applyRecallRuntimeMutationBestEffort(chatId, { type: 'upsertChunks', chunks: chunkRecords });
    applyRecallRuntimeMutationBestEffort(chatId, { type: 'upsertChunkVectors', items: vectorRecords });
    applyRecallRuntimeMutationBestEffort(chatId, { type: 'meta', meta: updates });
}

export async function getChunkVectorDescriptors(chatId) {
    const descriptors = [];
    await chunkVectorsTable.where('chatId').equals(chatId).each(record => {
        let valid = false;
        try {
            assertFiniteVector(bufferToFloat32(record.vector), 'stored chunk vector', record.dims);
            valid = true;
        } catch { /* 无效向量与缺失向量一样，需要补齐。 */ }
        descriptors.push({ chunkId: record.chunkId, fingerprint: record.fingerprint, valid });
    });
    return descriptors;
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

export function makeEventVectorRecords(chatId, items, fingerprint) {
    let expectedDimensions = null;
    return items.map((item, index) => {
        const dims = assertFiniteVector(item.vector, `event vector ${index}`, expectedDimensions);
        expectedDimensions ??= dims;
        return {
            chatId,
            eventId: item.eventId,
            vector: float32ToBuffer(new Float32Array(item.vector)),
            dims,
            fingerprint,
            ...(item.sourceHash ? { sourceHash: item.sourceHash } : {}),
        };
    });
}

export async function saveEventVectors(chatId, items, fingerprint) {
    const records = makeEventVectorRecords(chatId, items, fingerprint);
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

// Gap checks need identity/model only, not decoded vector payloads.
export async function getEventVectorDescriptors(chatId) {
    const descriptors = [];
    await eventVectorsTable.where('chatId').equals(chatId).each(record => {
        descriptors.push({ eventId: record.eventId, fingerprint: record.fingerprint });
    });
    return descriptors;
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
    // This database contains only chat-owned vector caches, including L0.
    await db.transaction('rw', db.tables, async () => {
        await Promise.all(db.tables.map(table => table.where('chatId').equals(chatId).delete()));
    });
    await clearRecallRuntime(chatId);
}

export { CHUNK_MAX_TOKENS };
