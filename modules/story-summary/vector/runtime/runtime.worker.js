import {
    metaTable,
    chunksTable,
    chunkVectorsTable,
    eventVectorsTable,
    stateVectorsTable,
} from '../../data/db.js';
import {
    scoreAnchorsFromStateVectors,
    scoreEventsFromEventVectors,
    scoreL1FromRecords,
    toArrayBuffer,
    toFloat32,
} from './scoring.js';
import { diffuseFromSeeds } from '../retrieval/diffusion.js';

const MODULE_ID = 'recall-runtime-worker';

function safeWorkerStringify(value) {
    try {
        return JSON.stringify(value);
    } catch {
        try {
            return String(value);
        } catch {
            return '[unstringifiable]';
        }
    }
}

function compactStats(stats) {
    if (!stats) return 'none';
    const item = stats.stats || stats;
    if (!item || typeof item !== 'object') return safeWorkerStringify(item);
    return [
        `chat=${item.chatId || '-'}`,
        `status=${item.status || '-'}`,
        `ready=${item.ready ? 1 : 0}`,
        `warming=${item.warming ? 1 : 0}`,
        `meta=${item.meta ? 1 : 0}`,
        `floors=${item.chunkFloors ?? '-'}`,
        `chunks=${item.chunks ?? '-'}`,
        `l1v=${item.chunkVectors ?? '-'}`,
        `l2v=${item.eventVectors ?? '-'}`,
        `l0v=${item.stateVectors ?? '-'}`,
        `ver=${item.version ?? '-'}`,
        `err=${item.lastError || '-'}`,
    ].join(' ');
}

function compactMutation(mutation = {}) {
    if (!mutation || typeof mutation !== 'object') return 'unknown';
    const details = [`type=${mutation.type || 'unknown'}`];
    if (Number.isFinite(Number(mutation.floor))) details.push(`floor=${Number(mutation.floor)}`);
    if (Array.isArray(mutation.items)) details.push(`items=${mutation.items.length}`);
    if (Array.isArray(mutation.chunks)) details.push(`chunks=${mutation.chunks.length}`);
    if (Array.isArray(mutation.eventIds)) details.push(`eventIds=${mutation.eventIds.length}`);
    if (mutation.domain) details.push(`domain=${mutation.domain}`);
    if (mutation.meta && typeof mutation.meta === 'object') details.push(`metaKeys=${Object.keys(mutation.meta).length}`);
    return details.join(' ');
}

function logInfo(message, extra = '') {
    self.postMessage({
        type: '__log',
        payload: {
            level: 'info',
            moduleId: MODULE_ID,
            message: `${message}${extra ? ` ${extra}` : ''}`,
        },
    });
}

function logWarn(message, extra = '') {
    self.postMessage({
        type: '__log',
        payload: {
            level: 'warn',
            moduleId: MODULE_ID,
            message: `${message}${extra ? ` ${extra}` : ''}`,
        },
    });
}

function createEntry(chatId) {
    return {
        chatId,
        meta: null,
        chunksByFloor: new Map(),
        chunkVectorsById: new Map(),
        eventVectorsById: new Map(),
        stateVectorsById: new Map(),
        ready: false,
        warming: null,
        version: 0,
        status: 'cold',
        lastError: null,
        refreshedAt: 0,
    };
}

const entries = new Map();

function getEntry(chatId) {
    const key = String(chatId || '');
    if (!key) return null;
    let entry = entries.get(key);
    if (!entry) {
        entry = createEntry(key);
        entries.set(key, entry);
        logInfo('entry created', `chat=${key}`);
    }
    return entry;
}

function normalizeChunkRecord(record, chatId) {
    return {
        ...record,
        chatId,
        floor: Number(record?.floor),
        chunkIdx: Number(record?.chunkIdx || 0),
    };
}

function normalizeChunkVectorRecord(record) {
    const vector = toFloat32(record?.vector);
    if (!record?.chunkId || !vector?.length) return null;
    return {
        chunkId: record.chunkId,
        vector,
        fingerprint: record.fingerprint,
    };
}

function normalizeEventVectorRecord(record) {
    const vector = toFloat32(record?.vector);
    if (!record?.eventId || !vector?.length) return null;
    return {
        eventId: record.eventId,
        vector,
        fingerprint: record.fingerprint,
    };
}

function normalizeStateVectorRecord(record) {
    const vector = toFloat32(record?.vector);
    if (!record?.atomId || !vector?.length) return null;
    return {
        atomId: record.atomId,
        floor: record.floor,
        vector,
        rVector: record.rVector ? toFloat32(record.rVector) : null,
        fingerprint: record.fingerprint,
    };
}

function upsertChunks(entry, chunks = []) {
    for (const chunk of chunks || []) {
        const record = normalizeChunkRecord(chunk, entry.chatId);
        if (!Number.isInteger(record.floor) || !record.chunkId) continue;

        const list = entry.chunksByFloor.get(record.floor) || [];
        const next = list.filter((item) => item.chunkId !== record.chunkId);
        next.push(record);
        next.sort((a, b) => (a.chunkIdx || 0) - (b.chunkIdx || 0));
        entry.chunksByFloor.set(record.floor, next);
    }
}

function upsertChunkVectors(entry, items = []) {
    for (const item of items || []) {
        const record = normalizeChunkVectorRecord(item);
        if (record) entry.chunkVectorsById.set(record.chunkId, record);
    }
}

function upsertEventVectors(entry, items = []) {
    for (const item of items || []) {
        const record = normalizeEventVectorRecord(item);
        if (record) entry.eventVectorsById.set(record.eventId, record);
    }
}

function upsertStateVectors(entry, items = []) {
    for (const item of items || []) {
        const record = normalizeStateVectorRecord(item);
        if (record) entry.stateVectorsById.set(record.atomId, record);
    }
}

function exportEventVectorsByIds(entry, eventIds = []) {
    const out = [];
    for (const eventId of eventIds || []) {
        const item = entry?.eventVectorsById.get(eventId);
        if (!item) continue;
        out.push({
            ...item,
            vector: toArrayBuffer(item.vector),
        });
    }
    return out;
}

function deleteChunksFromFloor(entry, floor) {
    for (const [candidateFloor, chunks] of [...entry.chunksByFloor.entries()]) {
        if (candidateFloor < floor) continue;
        for (const chunk of chunks) {
            entry.chunkVectorsById.delete(chunk.chunkId);
        }
        entry.chunksByFloor.delete(candidateFloor);
    }
}

function deleteChunksAtFloor(entry, floor) {
    const chunks = entry.chunksByFloor.get(floor) || [];
    for (const chunk of chunks) {
        entry.chunkVectorsById.delete(chunk.chunkId);
    }
    entry.chunksByFloor.delete(floor);
}

function deleteStateVectorsFromFloor(entry, floor) {
    for (const [atomId, record] of [...entry.stateVectorsById.entries()]) {
        if (Number(record.floor) >= floor) entry.stateVectorsById.delete(atomId);
    }
}

function clearDomain(entry, domain = 'all') {
    if (domain === 'all' || domain === 'chunks') {
        entry.chunksByFloor.clear();
        entry.chunkVectorsById.clear();
    }
    if (domain === 'all' || domain === 'events') {
        entry.eventVectorsById.clear();
    }
    if (domain === 'all' || domain === 'state') {
        entry.stateVectorsById.clear();
    }
    if (domain === 'all') {
        entry.meta = null;
        entry.ready = false;
        entry.status = 'cold';
    }
}

function entryStats(entry) {
    if (!entry) return null;
    let chunks = 0;
    for (const list of entry.chunksByFloor.values()) chunks += list.length;
    return {
        backend: 'worker',
        owner: 'worker',
        chatId: entry.chatId,
        ready: entry.ready,
        warming: !!entry.warming,
        status: entry.status,
        lastError: entry.lastError,
        refreshedAt: entry.refreshedAt,
        version: entry.version,
        meta: !!entry.meta,
        chunkFloors: entry.chunksByFloor.size,
        chunks,
        chunkVectors: entry.chunkVectorsById.size,
        eventVectors: entry.eventVectorsById.size,
        stateVectors: entry.stateVectorsById.size,
    };
}

async function refresh(chatId, reason = 'manual') {
    const entry = getEntry(chatId);
    if (!entry) return null;
    if (entry.warming) {
        logInfo('refresh join in-flight', `chat=${entry.chatId} reason=${reason} before=${compactStats(entryStats(entry))}`);
        return entry.warming;
    }

    const startedVersion = entry.version;
    const before = entryStats(entry);
    entry.status = 'warming';
    entry.lastError = null;
    logInfo('refresh start', `chat=${entry.chatId} reason=${reason} before=${compactStats(before)}`);

    entry.warming = (async () => {
        const [
            meta,
            chunks,
            chunkVectors,
            eventVectors,
            stateVectors,
        ] = await Promise.all([
            metaTable.get(entry.chatId),
            chunksTable.where('chatId').equals(entry.chatId).toArray(),
            chunkVectorsTable.where('chatId').equals(entry.chatId).toArray(),
            eventVectorsTable.where('chatId').equals(entry.chatId).toArray(),
            stateVectorsTable.where('chatId').equals(entry.chatId).toArray(),
        ]);

        if (entry.version !== startedVersion) {
            entry.status = entry.ready ? 'ready' : 'stale-refresh-skipped';
            const stale = { ready: false, stale: true, reason, stats: entryStats(entry) };
            logWarn('refresh stale', `chat=${entry.chatId} reason=${reason} startedVersion=${startedVersion} currentVersion=${entry.version} after=${compactStats(stale)}`);
            return stale;
        }

        const next = createEntry(entry.chatId);
        next.version = entry.version;
        next.meta = meta || null;
        upsertChunks(next, chunks);
        upsertChunkVectors(next, chunkVectors);
        upsertEventVectors(next, eventVectors);
        upsertStateVectors(next, stateVectors);
        next.ready = true;
        next.status = 'ready';
        next.refreshedAt = Date.now();
        entries.set(entry.chatId, next);
        const success = { ready: true, stale: false, reason, stats: entryStats(next) };
        logInfo('refresh success', `chat=${entry.chatId} reason=${reason} after=${compactStats(success)}`);
        return success;
    })()
        .catch((error) => {
            entry.status = 'refresh failed';
            entry.lastError = error?.message || String(error);
            logWarn('refresh failed', `chat=${entry.chatId} reason=${reason} after=${compactStats(entryStats(entry))}`);
            throw error;
        })
        .finally(() => {
            const current = entries.get(entry.chatId);
            if (current === entry) entry.warming = null;
        });

    return entry.warming;
}

async function ensureReady(chatId) {
    const entry = getEntry(chatId);
    if (!entry) return null;
    if (entry.ready) return entry;
    logInfo('ensureReady trigger refresh', `chat=${entry.chatId} status=${entry.status} ready=${entry.ready ? 1 : 0}`);
    const result = await refresh(chatId, 'ensure-ready');
    if (!result?.ready) {
        logWarn('ensureReady retry', `chat=${entry.chatId} first=${compactStats(result)}`);
        await refresh(chatId, 'ensure-ready-retry');
    }
    return getEntry(chatId);
}

function applyMutation(chatId, mutation = {}) {
    const entry = getEntry(chatId);
    if (!entry) return null;
    const before = entryStats(entry);
    entry.version++;

    switch (mutation.type) {
        case 'meta':
            entry.meta = { ...(entry.meta || { chatId: entry.chatId }), ...(mutation.meta || {}) };
            break;
        case 'upsertChunks':
            upsertChunks(entry, mutation.chunks || []);
            break;
        case 'upsertChunkVectors':
            upsertChunkVectors(entry, mutation.items || []);
            break;
        case 'upsertEventVectors':
            upsertEventVectors(entry, mutation.items || []);
            break;
        case 'upsertStateVectors':
            upsertStateVectors(entry, mutation.items || []);
            break;
        case 'deleteChunksFromFloor':
            deleteChunksFromFloor(entry, Number(mutation.floor || 0));
            break;
        case 'deleteChunksAtFloor':
            deleteChunksAtFloor(entry, Number(mutation.floor || 0));
            break;
        case 'deleteStateVectorsFromFloor':
            deleteStateVectorsFromFloor(entry, Number(mutation.floor || 0));
            break;
        case 'deleteEventVectorsByIds':
            for (const eventId of mutation.eventIds || []) entry.eventVectorsById.delete(eventId);
            break;
        case 'clear':
            clearDomain(entry, mutation.domain || 'all');
            break;
        default:
            break;
    }

    if (entry.ready && entry.status !== 'warming') entry.status = 'ready';
    const after = entryStats(entry);
    logInfo('mutation applied', `chat=${entry.chatId} ${compactMutation(mutation)} before=${compactStats(before)} after=${compactStats(after)}`);
    return after;
}

async function scoreL1(chatId, floors = [], queryVector) {
    const entry = await ensureReady(chatId);
    const requestedFloors = (floors || []).map(Number).filter(Number.isInteger);
    const chunks = [];
    const chunkVectors = [];

    for (const floor of requestedFloors) {
        chunks.push(...(entry?.chunksByFloor.get(floor) || []));
    }
    for (const chunk of chunks) {
        const vec = entry?.chunkVectorsById.get(chunk.chunkId);
        if (vec) chunkVectors.push(vec);
    }

    const scored = scoreL1FromRecords(chunks, chunkVectors, queryVector);
    scored.stats.requestedFloors = requestedFloors.length;
    scored.stats.chunkCacheHits = requestedFloors.length;
    scored.stats.chunkCacheMisses = 0;
    scored.stats.vectorCacheHits = scored.stats.vectorHits;
    scored.stats.vectorCacheMisses = scored.stats.missingVectors;
    scored.stats.cacheWarm = true;
    scored.stats.backend = 'worker';
    scored.stats.cacheOwner = 'worker';
    return scored;
}

async function handle(type, payload = {}) {
    switch (type) {
        case 'ping':
            return { pong: true, backend: 'worker' };
        case 'refresh':
            return await refresh(payload.chatId, payload.reason);
        case 'applyMutation':
            return applyMutation(payload.chatId, payload.mutation);
        case 'retainOnly': {
            const keep = payload.chatId ? String(payload.chatId) : null;
            logInfo('retainOnly request', `keep=${keep || '*'}`);
            for (const key of [...entries.keys()]) {
                if (keep && key === keep) continue;
                entries.delete(key);
            }
            return [...entries.values()].map(entryStats);
        }
        case 'clear': {
            logInfo('clear request', `chat=${payload.chatId || '*'} domain=${payload.domain || 'all'}`);
            if (payload.chatId) {
                const entry = getEntry(payload.chatId);
                clearDomain(entry, payload.domain || 'all');
                logInfo('clear result', compactStats(entryStats(entry)));
            } else {
                entries.clear();
                logInfo('clear result', 'all entries removed');
            }
            return [...entries.values()].map(entryStats);
        }
        case 'getMeta': {
            const entry = await ensureReady(payload.chatId);
            return entry?.meta || null;
        }
        case 'getEventVectorsByIds': {
            const entry = await ensureReady(payload.chatId);
            return exportEventVectorsByIds(entry, payload.eventIds || []);
        }
        case 'scoreAnchors': {
            const entry = await ensureReady(payload.chatId);
            const scores = scoreAnchorsFromStateVectors([...(entry?.stateVectorsById.values() || [])], payload.queryVector);
            return { scores, stats: entryStats(entry) };
        }
        case 'scoreEvents': {
            const entry = await ensureReady(payload.chatId);
            const scores = scoreEventsFromEventVectors([...(entry?.eventVectorsById.values() || [])], payload.queryVector);
            return { scores, stats: entryStats(entry) };
        }
        case 'scoreL1':
            return await scoreL1(payload.chatId, payload.floors, payload.queryVector);
        case 'diffuseL0': {
            const entry = await ensureReady(payload.chatId);
            const metrics = { diffusion: {} };
            const diffused = diffuseFromSeeds(
                payload.seeds || [],
                payload.allAtoms || [],
                [...(entry?.stateVectorsById.values() || [])],
                payload.queryVector,
                metrics,
                { name1: payload.name1 || '' }
            );
            return { diffused, metrics: metrics.diffusion || {} };
        }
        case 'stats':
            return [...entries.values()].map(entryStats);
        default:
            throw new Error(`Unknown RecallRuntime worker request: ${type}`);
    }
}

self.onmessage = async (event) => {
    const { id, type, payload } = event.data || {};
    if (!id) return;
    try {
        const result = await handle(type, payload || {});
        self.postMessage({ id, ok: true, result });
    } catch (error) {
        self.postMessage({
            id,
            ok: false,
            error: error?.message || String(error),
        });
    }
};
