// Story Summary - single recall runtime data plane
//
// Browser path: a module Worker owns hot L0/L1/L2 vector data and scoring.
// Emergency path: a private main-thread backend with the same API. This is
// intentionally contained here so business modules do not depend on cache maps.

import {
    metaTable,
    chunksTable,
    chunkVectorsTable,
    eventVectorsTable,
    stateVectorsTable,
} from '../../data/db.js';
import { xbLog } from '../../../../core/debug-core.js';
import { createWorkerRpc } from './rpc.js';
import {
    scoreAnchorsFromStateVectors,
    scoreEventsFromEventVectors,
    scoreL1FromRecords,
    toArrayBuffer,
    toFloat32,
} from './scoring.js';
import { diffuseFromSeeds } from '../retrieval/diffusion.js';

const MODULE_ID = 'recall-runtime';
const WORKER_TIMEOUT_MS = 30000;

function safeRuntimeStringify(value) {
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
    if (!item || typeof item !== 'object') return safeRuntimeStringify(item);
    const fields = [
        `chat=${item.chatId || '-'}`,
        `backend=${item.backend || backendKind || '-'}`,
        `owner=${item.owner || '-'}`,
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
    ];
    return fields.join(' ');
}

function compactStatsList(statsList) {
    if (!Array.isArray(statsList) || !statsList.length) return '[]';
    return statsList.map((item) => `[${compactStats(item)}]`).join(' ');
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

function logRuntimeInfo(message, extra = null) {
    if (extra === null || extra === undefined || extra === '') {
        xbLog.info(MODULE_ID, message);
    } else {
        xbLog.info(MODULE_ID, `${message} ${typeof extra === 'string' ? extra : safeRuntimeStringify(extra)}`);
    }
}

function logRuntimeWarn(message, extra = null) {
    if (extra === null || extra === undefined || extra === '') {
        xbLog.warn(MODULE_ID, message);
    } else {
        xbLog.warn(MODULE_ID, `${message} ${typeof extra === 'string' ? extra : safeRuntimeStringify(extra)}`);
    }
}

function createEmptyStats(overrides = {}) {
    return {
        backend: 'uninitialized',
        owner: 'none',
        ready: false,
        warming: false,
        status: 'cold',
        lastError: null,
        chunks: 0,
        chunkVectors: 0,
        eventVectors: 0,
        stateVectors: 0,
        ...overrides,
    };
}

let backend = null;
let backendKind = 'uninitialized';
let backendInitPromise = null;
let lastStats = [];
let lastError = null;
const dirtyRefreshTimers = new Map();

function canUseWorker() {
    return typeof Worker !== 'undefined' && typeof URL !== 'undefined';
}

async function createWorkerBackend() {
    logRuntimeInfo('init worker backend start');
    const worker = new Worker(new URL('./runtime.worker.js', import.meta.url), {
        type: 'module',
        name: 'lwb-recall-runtime',
    });
    const rpc = createWorkerRpc(worker);
    await rpc.call('ping', {}, { timeoutMs: 5000 });
    logRuntimeInfo('init worker backend ready');

    return {
        kind: 'worker',
        async call(type, payload, options = {}) {
            return await rpc.call(type, payload, {
                timeoutMs: options.timeoutMs || WORKER_TIMEOUT_MS,
            });
        },
        terminate() {
            rpc.rejectAll(new Error('RecallRuntime worker terminated'));
            worker.terminate();
        },
    };
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
        status: 'cold',
        lastError: null,
        version: 0,
        refreshedAt: 0,
    };
}

function createMainBackend() {
    const entries = new Map();

    function getEntry(chatId) {
        const key = String(chatId || '');
        if (!key) return null;
        let entry = entries.get(key);
        if (!entry) {
            entry = createEntry(key);
            entries.set(key, entry);
            logRuntimeInfo('main backend entry created', `chat=${key}`);
        }
        return entry;
    }

    function upsertChunks(entry, chunks = []) {
        for (const chunk of chunks || []) {
            const floor = Number(chunk?.floor);
            if (!Number.isInteger(floor) || !chunk?.chunkId) continue;
            const record = { ...chunk, chatId: entry.chatId, floor };
            const list = entry.chunksByFloor.get(floor) || [];
            const next = list.filter((item) => item.chunkId !== record.chunkId);
            next.push(record);
            next.sort((a, b) => (a.chunkIdx || 0) - (b.chunkIdx || 0));
            entry.chunksByFloor.set(floor, next);
        }
    }

    function upsertChunkVectors(entry, items = []) {
        for (const item of items || []) {
            const vector = toFloat32(item?.vector);
            if (!item?.chunkId || !vector?.length) continue;
            entry.chunkVectorsById.set(item.chunkId, {
                chunkId: item.chunkId,
                vector,
                fingerprint: item.fingerprint,
            });
        }
    }

    function upsertEventVectors(entry, items = []) {
        for (const item of items || []) {
            const vector = toFloat32(item?.vector);
            if (!item?.eventId || !vector?.length) continue;
            entry.eventVectorsById.set(item.eventId, {
                eventId: item.eventId,
                vector,
                fingerprint: item.fingerprint,
            });
        }
    }

    function upsertStateVectors(entry, items = []) {
        for (const item of items || []) {
            const vector = toFloat32(item?.vector);
            if (!item?.atomId || !vector?.length) continue;
            entry.stateVectorsById.set(item.atomId, {
                atomId: item.atomId,
                floor: item.floor,
                vector,
                rVector: item.rVector ? toFloat32(item.rVector) : null,
                fingerprint: item.fingerprint,
            });
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

    function clearDomain(entry, domain = 'all') {
        if (domain === 'all' || domain === 'chunks') {
            entry.chunksByFloor.clear();
            entry.chunkVectorsById.clear();
        }
        if (domain === 'all' || domain === 'events') entry.eventVectorsById.clear();
        if (domain === 'all' || domain === 'state') entry.stateVectorsById.clear();
        if (domain === 'all') {
            entry.meta = null;
            entry.ready = false;
            entry.status = 'cold';
        }
    }

    function deleteChunksFromFloor(entry, floor) {
        for (const [candidateFloor, chunks] of [...entry.chunksByFloor.entries()]) {
            if (candidateFloor < floor) continue;
            chunks.forEach((chunk) => entry.chunkVectorsById.delete(chunk.chunkId));
            entry.chunksByFloor.delete(candidateFloor);
        }
    }

    function deleteChunksAtFloor(entry, floor) {
        const chunks = entry.chunksByFloor.get(floor) || [];
        chunks.forEach((chunk) => entry.chunkVectorsById.delete(chunk.chunkId));
        entry.chunksByFloor.delete(floor);
    }

    function deleteStateVectorsFromFloor(entry, floor) {
        for (const [atomId, record] of [...entry.stateVectorsById.entries()]) {
            if (Number(record.floor) >= floor) entry.stateVectorsById.delete(atomId);
        }
    }

    function stats(entry) {
        if (!entry) return null;
        let chunks = 0;
        for (const list of entry.chunksByFloor.values()) chunks += list.length;
        return createEmptyStats({
            backend: 'main-fallback',
            owner: 'runtime-main',
            chatId: entry.chatId,
            ready: entry.ready,
            warming: !!entry.warming,
            status: entry.status,
            lastError: entry.lastError,
            chunks,
            chunkFloors: entry.chunksByFloor.size,
            chunkVectors: entry.chunkVectorsById.size,
            eventVectors: entry.eventVectorsById.size,
            stateVectors: entry.stateVectorsById.size,
            refreshedAt: entry.refreshedAt,
            version: entry.version,
        });
    }

    async function refresh(chatId, reason = 'manual') {
        const entry = getEntry(chatId);
        if (!entry) return null;
        if (entry.warming) {
            logRuntimeInfo('main backend refresh join in-flight', `chat=${entry.chatId} reason=${reason} before=${compactStats(stats(entry))}`);
            return entry.warming;
        }

        const startedVersion = entry.version;
        const before = stats(entry);
        entry.status = 'warming';
        entry.lastError = null;
        logRuntimeInfo('main backend refresh start', `chat=${entry.chatId} reason=${reason} before=${compactStats(before)}`);

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
                const staleResult = { ready: false, stale: true, reason, stats: stats(entry) };
                logRuntimeWarn('main backend refresh stale', `chat=${entry.chatId} reason=${reason} startedVersion=${startedVersion} currentVersion=${entry.version} after=${compactStats(staleResult)}`);
                return staleResult;
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
            const success = { ready: true, stale: false, reason, stats: stats(next) };
            logRuntimeInfo('main backend refresh success', `chat=${entry.chatId} reason=${reason} after=${compactStats(success)}`);
            return success;
        })()
            .catch((error) => {
                entry.status = 'refresh failed';
                entry.lastError = error?.message || String(error);
                logRuntimeWarn('main backend refresh failed', `chat=${entry.chatId} reason=${reason} after=${compactStats(stats(entry))}`);
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
        logRuntimeInfo('main backend ensureReady trigger refresh', `chat=${entry.chatId} status=${entry.status} ready=${entry.ready ? 1 : 0}`);
        const result = await refresh(chatId, 'ensure-ready');
        if (!result?.ready) {
            logRuntimeWarn('main backend ensureReady retry', `chat=${entry.chatId} first=${compactStats(result)}`);
            await refresh(chatId, 'ensure-ready-retry');
        }
        return getEntry(chatId);
    }

    function applyMutation(chatId, mutation = {}) {
        const entry = getEntry(chatId);
        if (!entry) return null;
        const before = stats(entry);
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
        const after = stats(entry);
        logRuntimeInfo('main backend mutation applied', `chat=${entry.chatId} ${compactMutation(mutation)} before=${compactStats(before)} after=${compactStats(after)}`);
        return after;
    }

    return {
        kind: 'main-fallback',
        async call(type, payload = {}) {
            switch (type) {
                case 'ping':
                    return { pong: true, backend: 'main-fallback' };
                case 'refresh':
                    return await refresh(payload.chatId, payload.reason);
                case 'applyMutation':
                    return applyMutation(payload.chatId, payload.mutation);
                case 'retainOnly': {
                    const keep = payload.chatId ? String(payload.chatId) : null;
                    for (const key of [...entries.keys()]) {
                        if (keep && key === keep) continue;
                        entries.delete(key);
                    }
                    return [...entries.values()].map(stats);
                }
                case 'clear': {
                    if (payload.chatId) clearDomain(getEntry(payload.chatId), payload.domain || 'all');
                    else entries.clear();
                    return [...entries.values()].map(stats);
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
                    return {
                        scores: scoreAnchorsFromStateVectors([...(entry?.stateVectorsById.values() || [])], payload.queryVector),
                        stats: stats(entry),
                    };
                }
                case 'scoreEvents': {
                    const entry = await ensureReady(payload.chatId);
                    return {
                        scores: scoreEventsFromEventVectors([...(entry?.eventVectorsById.values() || [])], payload.queryVector),
                        stats: stats(entry),
                    };
                }
                case 'scoreL1': {
                    const entry = await ensureReady(payload.chatId);
                    const floors = (payload.floors || []).map(Number).filter(Number.isInteger);
                    const chunks = [];
                    const vectors = [];
                    for (const floor of floors) chunks.push(...(entry?.chunksByFloor.get(floor) || []));
                    for (const chunk of chunks) {
                        const vector = entry?.chunkVectorsById.get(chunk.chunkId);
                        if (vector) vectors.push(vector);
                    }
                    const scored = scoreL1FromRecords(chunks, vectors, payload.queryVector);
                    scored.stats.requestedFloors = floors.length;
                    scored.stats.chunkCacheHits = floors.length;
                    scored.stats.vectorCacheHits = scored.stats.vectorHits;
                    scored.stats.vectorCacheMisses = scored.stats.missingVectors;
                    scored.stats.backend = 'main-fallback';
                    scored.stats.cacheOwner = 'runtime-main';
                    return scored;
                }
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
                    return [...entries.values()].map(stats);
                default:
                    throw new Error(`Unknown RecallRuntime request: ${type}`);
            }
        },
        terminate() {},
    };
}

async function getBackend() {
    if (backend) return backend;
    if (backendInitPromise) return await backendInitPromise;

    backendInitPromise = (async () => {
        if (backend) return backend;

        if (canUseWorker()) {
            try {
                backend = await createWorkerBackend();
                backendKind = 'worker';
                lastError = null;
                logRuntimeInfo('backend selected', 'worker');
                return backend;
            } catch (error) {
                lastError = error?.message || String(error);
                console.warn(`[${MODULE_ID}] Worker 初始化失败，切换到 runtime 内部主线程兜底`, error);
                logRuntimeWarn('worker backend init failed', lastError);
            }
        } else {
            lastError = 'Worker unavailable in this environment';
            logRuntimeWarn('worker backend unavailable', lastError);
        }

        backend = createMainBackend();
        backendKind = 'main-fallback';
        logRuntimeInfo('backend selected', 'main-fallback');
        return backend;
    })();

    try {
        return await backendInitPromise;
    } finally {
        backendInitPromise = null;
    }
}

function rememberStats(stats) {
    if (Array.isArray(stats)) {
        if (stats.every((item) => item && (item.backend || item.owner || item.status))) {
            lastStats = stats;
        }
    } else if (stats?.stats) {
        const item = stats.stats;
        lastStats = lastStats.filter((s) => s.chatId !== item.chatId).concat(item);
    } else if (stats?.chatId) {
        lastStats = lastStats.filter((s) => s.chatId !== stats.chatId).concat(stats);
    }
    return stats;
}

async function callRuntime(type, payload = {}, options = {}) {
    const current = await getBackend();
    try {
        const result = await current.call(type, payload, options);
        rememberStats(result);
        return result;
    } catch (error) {
        lastError = error?.message || String(error);
        rememberStats(createEmptyStats({
            backend: backendKind,
            owner: backendKind === 'worker' ? 'worker' : 'runtime-main',
            status: 'request failed',
            lastError,
        }));
        throw error;
    }
}

export async function warmRecallRuntime(chatId, options = {}) {
    if (!chatId) return null;
    logRuntimeInfo('warm request', `chat=${chatId} reason=${options.reason || 'warm'}`);
    return await callRuntime('refresh', {
        chatId,
        reason: options.reason || 'warm',
    }, { timeoutMs: options.timeoutMs || WORKER_TIMEOUT_MS });
}

export async function refreshRecallRuntime(chatId, options = {}) {
    if (!chatId) return null;
    logRuntimeInfo('refresh request', `chat=${chatId} reason=${options.reason || 'refresh'}`);
    return await callRuntime('refresh', {
        chatId,
        reason: options.reason || 'refresh',
    }, { timeoutMs: options.timeoutMs || WORKER_TIMEOUT_MS });
}

export async function applyRecallRuntimeMutation(chatId, mutation = {}) {
    if (!chatId) return null;
    logRuntimeInfo('mutation request', `chat=${chatId} ${compactMutation(mutation)}`);
    return await callRuntime('applyMutation', { chatId, mutation }, { timeoutMs: 10000 });
}

export function applyRecallRuntimeMutationBestEffort(chatId, mutation = {}) {
    if (!chatId) return;
    applyRecallRuntimeMutation(chatId, mutation).catch((error) => {
        lastError = error?.message || String(error);
        markRecallRuntimeDirty(chatId, `mutation-failed:${mutation?.type || 'unknown'}`);
    });
}

export function markRecallRuntimeDirty(chatId, reason = 'dirty') {
    if (!chatId || dirtyRefreshTimers.has(chatId)) return;
    logRuntimeInfo('mark dirty scheduled', `chat=${chatId} reason=${reason}`);
    const timer = setTimeout(() => {
        dirtyRefreshTimers.delete(chatId);
        logRuntimeInfo('mark dirty firing refresh', `chat=${chatId} reason=${reason}`);
        refreshRecallRuntime(chatId, { reason }).catch((error) => {
            lastError = error?.message || String(error);
            rememberStats(createEmptyStats({
                backend: backendKind,
                owner: backendKind === 'worker' ? 'worker' : 'runtime-main',
                chatId,
                ready: false,
                status: 'refresh failed',
                lastError,
            }));
        });
    }, 1000);
    dirtyRefreshTimers.set(chatId, timer);
}

export async function clearRecallRuntime(chatId = null, domain = 'all') {
    logRuntimeInfo('clear request', `chat=${chatId || '*'} domain=${domain}`);
    if (chatId) {
        const timer = dirtyRefreshTimers.get(chatId);
        if (timer) clearTimeout(timer);
        dirtyRefreshTimers.delete(chatId);
    } else {
        for (const timer of dirtyRefreshTimers.values()) clearTimeout(timer);
        dirtyRefreshTimers.clear();
    }
    const result = await callRuntime('clear', { chatId, domain }, { timeoutMs: 10000 });
    logRuntimeInfo('clear result', compactStatsList(Array.isArray(result) ? result : lastStats));
    return result;
}

export async function retainRecallRuntimeOnly(chatId) {
    logRuntimeInfo('retainOnly request', `keep=${chatId || '*'}`);
    const result = await callRuntime('retainOnly', { chatId: chatId || null }, { timeoutMs: 10000 });
    logRuntimeInfo('retainOnly result', compactStatsList(Array.isArray(result) ? result : lastStats));
    return result;
}

export async function getRecallRuntimeMeta(chatId) {
    return await callRuntime('getMeta', { chatId }, { timeoutMs: WORKER_TIMEOUT_MS });
}

export async function getRecallRuntimeEventVectorsByIds(chatId, eventIds = []) {
    const records = await callRuntime('getEventVectorsByIds', { chatId, eventIds }, { timeoutMs: WORKER_TIMEOUT_MS });
    return (records || []).map((record) => ({
        ...record,
        vector: toFloat32(record.vector),
    }));
}

export async function scoreRecallRuntimeAnchors(chatId, queryVector) {
    return await callRuntime('scoreAnchors', { chatId, queryVector }, { timeoutMs: WORKER_TIMEOUT_MS });
}

export async function scoreRecallRuntimeEvents(chatId, queryVector) {
    return await callRuntime('scoreEvents', { chatId, queryVector }, { timeoutMs: WORKER_TIMEOUT_MS });
}

export async function scoreRecallRuntimeL1(chatId, floors, queryVector) {
    const response = await callRuntime('scoreL1', { chatId, floors, queryVector }, { timeoutMs: WORKER_TIMEOUT_MS });
    const result = new Map();
    for (const chunk of response?.result || []) {
        if (!result.has(chunk.floor)) result.set(chunk.floor, []);
        result.get(chunk.floor).push(chunk);
    }
    for (const [, chunks] of result) {
        chunks.sort((a, b) => b._cosineScore - a._cosineScore);
    }
    result._cosineTime = response?.stats?.totalTime || 0;
    result._stats = response?.stats || {};
    return result;
}

export async function diffuseRecallRuntimeL0(chatId, seeds, allAtoms, queryVector, options = {}) {
    return await callRuntime('diffuseL0', {
        chatId,
        seeds,
        allAtoms,
        queryVector,
        name1: options.name1 || '',
    }, { timeoutMs: WORKER_TIMEOUT_MS });
}

export function getRecallRuntimeStats() {
    if (!lastStats.length) {
        return [createEmptyStats({
            backend: backendKind,
            owner: backendKind === 'worker' ? 'worker' : (backendKind === 'main-fallback' ? 'runtime-main' : 'none'),
            lastError,
        })];
    }
    return lastStats.map((item) => ({
        ...item,
        backend: item.backend || backendKind,
        lastError: item.lastError || lastError,
    }));
}

export async function refreshRecallRuntimeStats() {
    const stats = await callRuntime('stats', {}, { timeoutMs: 10000 });
    return Array.isArray(stats) ? stats : getRecallRuntimeStats();
}
