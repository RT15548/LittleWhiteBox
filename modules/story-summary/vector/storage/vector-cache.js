// Story Summary - in-memory vector hot cache
// DB remains authoritative; this cache only accelerates active-session reads.

import {
    metaTable,
    chunksTable,
    chunkVectorsTable,
    eventVectorsTable,
} from '../../data/db.js';
import { stateVectorsTable } from '../../data/db.js';

function toArrayBuffer(value) {
    if (!value) return null;
    if (value instanceof ArrayBuffer) return value;
    if (ArrayBuffer.isView(value)) {
        return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
    }
    if (Array.isArray(value)) {
        return new Float32Array(value).buffer;
    }
    return null;
}

function toFloat32(value) {
    if (!value) return null;
    if (value instanceof Float32Array) return value;
    if (value instanceof ArrayBuffer) return new Float32Array(value);
    if (ArrayBuffer.isView(value)) {
        return new Float32Array(value.buffer, value.byteOffset, value.byteLength / 4);
    }
    if (Array.isArray(value)) return new Float32Array(value);
    return null;
}

function createEntry() {
    return {
        fingerprint: null,
        lastChunkFloor: -1,
        warming: null,
        chunksByFloor: new Map(),
        chunkVectorsById: new Map(),
        eventVectorsById: new Map(),
        stateVectorsById: new Map(),
        loadedChunkFloors: new Set(),
        loadedChunkVectorIds: new Set(),
        loadedAllChunks: false,
        loadedAllChunkVectors: false,
        loadedAllEventVectors: false,
        loadedAllStateVectors: false,
        version: 0,
    };
}

const caches = new Map();
const invalidationTokens = new Map();

function getEntry(chatId) {
    if (!chatId) return null;
    let entry = caches.get(chatId);
    if (!entry) {
        entry = createEntry();
        entry.version = invalidationTokens.get(chatId) || 0;
        caches.set(chatId, entry);
    }
    return entry;
}

function peekEntry(chatId) {
    if (!chatId) return null;
    return caches.get(chatId) || null;
}

function getInvalidationToken(chatId) {
    return invalidationTokens.get(chatId) || 0;
}

function bumpInvalidationToken(chatId) {
    if (!chatId) return 0;
    const next = getInvalidationToken(chatId) + 1;
    invalidationTokens.set(chatId, next);
    const entry = caches.get(chatId);
    if (entry) entry.version = next;
    return next;
}

export function setCachedMeta(chatId, meta = {}) {
    const entry = getEntry(chatId);
    if (!entry) return;
    if ('fingerprint' in meta) entry.fingerprint = meta.fingerprint ?? null;
    if ('lastChunkFloor' in meta) entry.lastChunkFloor = meta.lastChunkFloor ?? -1;
}

export async function warmVectorCache(chatId) {
    const entry = getEntry(chatId);
    if (!entry) return null;
    if (entry.warming) return entry.warming;
    const startedAtVersion = getInvalidationToken(chatId);

    entry.warming = (async () => {
        const [meta, chunks, chunkVectors, eventVectors, stateVectors] = await Promise.all([
            metaTable.get(chatId),
            chunksTable.where('chatId').equals(chatId).toArray(),
            chunkVectorsTable.where('chatId').equals(chatId).toArray(),
            eventVectorsTable.where('chatId').equals(chatId).toArray(),
            stateVectorsTable.where('chatId').equals(chatId).toArray(),
        ]);

        // If DB-backed data changed while the warmup was reading, do not
        // repopulate the cache with an older snapshot.
        if (getInvalidationToken(chatId) !== startedAtVersion) {
            return getVectorCacheStats(chatId);
        }

        if (meta) setCachedMeta(chatId, meta);
        upsertCachedChunks(chatId, chunks, { markLoaded: true });
        upsertCachedChunkVectors(chatId, chunkVectors, { markLoaded: true });
        upsertCachedEventVectors(chatId, eventVectors);
        upsertCachedStateVectors(chatId, stateVectors);

        entry.loadedAllChunks = true;
        entry.loadedAllChunkVectors = true;
        entry.loadedAllEventVectors = true;
        entry.loadedAllStateVectors = true;

        return getVectorCacheStats(chatId);
    })().finally(() => {
        entry.warming = null;
    });

    return entry.warming;
}

export function getCachedChunksByFloors(chatId, floors = []) {
    const entry = getEntry(chatId);
    const records = [];
    const missingFloors = [];
    if (!entry) return { records, missingFloors: floors, hitCount: 0, missCount: floors.length, warm: false };

    for (const floor of floors) {
        if (entry.chunksByFloor.has(floor)) {
            records.push(...entry.chunksByFloor.get(floor));
            continue;
        }
        if (entry.loadedAllChunks || entry.loadedChunkFloors.has(floor)) {
            continue;
        }
        missingFloors.push(floor);
    }

    return {
        records,
        missingFloors,
        hitCount: floors.length - missingFloors.length,
        missCount: missingFloors.length,
        warm: missingFloors.length === 0,
    };
}

export function getCachedChunkVectorsByIds(chatId, chunkIds = []) {
    const entry = getEntry(chatId);
    const records = [];
    const missingIds = [];
    if (!entry) return { records, missingIds: chunkIds, hitCount: 0, missCount: chunkIds.length, warm: false };

    for (const chunkId of chunkIds) {
        if (entry.chunkVectorsById.has(chunkId)) {
            records.push(entry.chunkVectorsById.get(chunkId));
            continue;
        }
        if (entry.loadedAllChunkVectors || entry.loadedChunkVectorIds.has(chunkId)) {
            continue;
        }
        missingIds.push(chunkId);
    }

    return {
        records,
        missingIds,
        hitCount: chunkIds.length - missingIds.length,
        missCount: missingIds.length,
        warm: missingIds.length === 0,
    };
}

export function getCachedEventVectors(chatId) {
    const entry = getEntry(chatId);
    if (!entry || !entry.loadedAllEventVectors) return null;
    return [...entry.eventVectorsById.values()].map((record) => ({
        ...record,
        vector: toFloat32(record.vector),
    }));
}

export function getCachedStateVectors(chatId) {
    const entry = getEntry(chatId);
    if (!entry || !entry.loadedAllStateVectors) return null;
    return [...entry.stateVectorsById.values()].map((record) => ({
        ...record,
        vector: toFloat32(record.vector),
        rVector: record.rVector ? toFloat32(record.rVector) : null,
    }));
}

export function upsertCachedChunks(chatId, chunks = [], options = {}) {
    const entry = getEntry(chatId);
    if (!entry || !chunks?.length) return;

    for (const chunk of chunks) {
        const floor = Number(chunk.floor);
        if (!Number.isInteger(floor)) continue;
        const record = { ...chunk, chatId };
        const list = entry.chunksByFloor.get(floor) || [];
        const next = list.filter((item) => item.chunkId !== record.chunkId);
        next.push(record);
        next.sort((a, b) => (a.chunkIdx ?? 0) - (b.chunkIdx ?? 0));
        entry.chunksByFloor.set(floor, next);
        if (options.markLoaded !== false) entry.loadedChunkFloors.add(floor);
    }
}

export function upsertCachedChunkVectors(chatId, items = [], options = {}) {
    const entry = getEntry(chatId);
    if (!entry || !items?.length) return;

    for (const item of items) {
        if (!item?.chunkId) continue;
        const raw = toArrayBuffer(item.vector);
        if (!raw) continue;
        entry.chunkVectorsById.set(item.chunkId, {
            chunkId: item.chunkId,
            vector: raw,
            fingerprint: item.fingerprint,
        });
        if (options.markLoaded !== false) entry.loadedChunkVectorIds.add(item.chunkId);
    }
}

export function upsertCachedEventVectors(chatId, items = []) {
    const entry = getEntry(chatId);
    if (!entry || !items?.length) return;

    for (const item of items) {
        if (!item?.eventId) continue;
        const raw = toArrayBuffer(item.vector);
        if (!raw) continue;
        entry.eventVectorsById.set(item.eventId, {
            eventId: item.eventId,
            vector: raw,
            fingerprint: item.fingerprint,
        });
    }
}

export function upsertCachedStateVectors(chatId, items = []) {
    const entry = getEntry(chatId);
    if (!entry || !items?.length) return;

    for (const item of items) {
        if (!item?.atomId) continue;
        const raw = toArrayBuffer(item.vector);
        if (!raw) continue;
        entry.stateVectorsById.set(item.atomId, {
            atomId: item.atomId,
            floor: item.floor,
            vector: raw,
            rVector: toArrayBuffer(item.rVector),
            fingerprint: item.fingerprint,
        });
    }
}

export function markCachedChunkFloorsLoaded(chatId, floors = []) {
    const entry = getEntry(chatId);
    if (!entry) return;
    floors.forEach((floor) => entry.loadedChunkFloors.add(floor));
}

export function markCachedChunkVectorIdsLoaded(chatId, chunkIds = []) {
    const entry = getEntry(chatId);
    if (!entry) return;
    chunkIds.forEach((chunkId) => entry.loadedChunkVectorIds.add(chunkId));
}

export function markCachedEventVectorsLoaded(chatId) {
    const entry = getEntry(chatId);
    if (!entry) return;
    entry.loadedAllEventVectors = true;
}

export function markCachedStateVectorsLoaded(chatId) {
    const entry = getEntry(chatId);
    if (!entry) return;
    entry.loadedAllStateVectors = true;
}

export function deleteCachedChunksFromFloor(chatId, floor) {
    bumpInvalidationToken(chatId);
    const entry = peekEntry(chatId);
    if (!entry) return;
    for (const [candidateFloor, chunks] of [...entry.chunksByFloor.entries()]) {
        if (candidateFloor < floor) continue;
        chunks.forEach((chunk) => {
            entry.chunkVectorsById.delete(chunk.chunkId);
            entry.loadedChunkVectorIds.delete(chunk.chunkId);
        });
        entry.chunksByFloor.delete(candidateFloor);
        entry.loadedChunkFloors.delete(candidateFloor);
    }
}

export function deleteCachedChunksAtFloor(chatId, floor) {
    bumpInvalidationToken(chatId);
    const entry = peekEntry(chatId);
    if (!entry) return;
    const chunks = entry.chunksByFloor.get(floor) || [];
    chunks.forEach((chunk) => {
        entry.chunkVectorsById.delete(chunk.chunkId);
        entry.loadedChunkVectorIds.delete(chunk.chunkId);
    });
    entry.chunksByFloor.delete(floor);
    entry.loadedChunkFloors.delete(floor);
}

export function deleteCachedStateVectorsFromFloor(chatId, floor) {
    bumpInvalidationToken(chatId);
    const entry = peekEntry(chatId);
    if (!entry) return;
    for (const [atomId, record] of [...entry.stateVectorsById.entries()]) {
        if (record.floor >= floor) entry.stateVectorsById.delete(atomId);
    }
}

export function deleteCachedEventVectorsByIds(chatId, eventIds = []) {
    bumpInvalidationToken(chatId);
    const entry = peekEntry(chatId);
    if (!entry) return;
    eventIds.forEach((eventId) => entry.eventVectorsById.delete(eventId));
}

export function clearVectorCache(chatId, domain = 'all') {
    if (!chatId) return;
    bumpInvalidationToken(chatId);
    if (domain === 'all') {
        caches.delete(chatId);
        return;
    }

    const entry = peekEntry(chatId);
    if (!entry) return;

    if (domain === 'chunks') {
        entry.chunksByFloor.clear();
        entry.chunkVectorsById.clear();
        entry.loadedChunkFloors.clear();
        entry.loadedChunkVectorIds.clear();
        entry.loadedAllChunks = false;
        entry.loadedAllChunkVectors = false;
    }
    if (domain === 'events') {
        entry.eventVectorsById.clear();
        entry.loadedAllEventVectors = false;
    }
    if (domain === 'state') {
        entry.stateVectorsById.clear();
        entry.loadedAllStateVectors = false;
    }
}

export function retainVectorCacheOnly(chatId) {
    const keep = chatId ? String(chatId) : null;
    for (const key of [...caches.keys()]) {
        if (keep && key === keep) continue;
        clearVectorCache(key);
    }
}

export function clearAllVectorCaches() {
    for (const key of [...caches.keys()]) {
        clearVectorCache(key);
    }
}

export function getVectorCacheStats(chatId) {
    const entry = peekEntry(chatId);
    if (!entry) return null;
    let chunkCount = 0;
    for (const chunks of entry.chunksByFloor.values()) {
        chunkCount += chunks.length;
    }
    return {
        fingerprint: entry.fingerprint,
        lastChunkFloor: entry.lastChunkFloor,
        chunkFloors: entry.chunksByFloor.size,
        chunks: chunkCount,
        chunkVectors: entry.chunkVectorsById.size,
        eventVectors: entry.eventVectorsById.size,
        stateVectors: entry.stateVectorsById.size,
        loadedAllChunks: entry.loadedAllChunks,
        loadedAllChunkVectors: entry.loadedAllChunkVectors,
        loadedAllEventVectors: entry.loadedAllEventVectors,
        loadedAllStateVectors: entry.loadedAllStateVectors,
        warming: !!entry.warming,
        version: entry.version,
    };
}

export function getAllVectorCacheStats() {
    return [...caches.keys()].map((chatId) => ({
        chatId,
        ...getVectorCacheStats(chatId),
    }));
}
