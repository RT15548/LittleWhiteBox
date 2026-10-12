import { getContext } from '../../../../../../../../extensions.js';
import { chat_metadata } from '../../../../../../../../../script.js';
import { EXT_ID } from '../../../../../core/constants.js';
import { getTextFilterRules } from '../../../data/config.js';
import { refreshRecallRuntime } from '../../runtime/runtime.js';
import { invalidateLexicalIndex } from '../../retrieval/lexical-index.js';
import { buildSourceIndex, resolvePackageSources } from './sources.js';
import { decodePackage, encodePackage, validatePackage } from './codec.js';
import { packageError, packageWarning, PACKAGE_PROGRESS, CACHE_DIAGNOSTIC_LOG } from './messages.js';
import { readVectorCache, readVectorCacheSources, replaceVectorCache } from './repository.js';
import { buildCacheSourceManifest, inspectCacheSourceCoverage, vectorSourceRecord, isCacheConsistencyFailure } from '../cache-consistency.js';
import { summarizeL0Floors } from '../../pipeline/l0-floor-status.js';
import { getVectorWriteState, captureMaintenanceSnapshot, isMaintenanceSnapshotCurrent } from '../../runtime/maintenance-coordinator.js';
import { xbLog } from '../../../../../core/debug-core.js';

function readSources() {
    const memory = chat_metadata.extensions?.[EXT_ID];
    return {
        chat: (getContext()?.chat || []).map(message => ({ mes: message.mes, name: message.name, is_user: message.is_user })),
        atoms: memory?.stateAtoms || [],
        events: memory?.storySummary?.json?.events || [],
        filters: getTextFilterRules(),
    };
}

function captureOperation(options) {
    const chatId = options.targetChatId || getContext()?.chatId;
    if (!chatId) throw packageError('no_chat');
    const snapshot = structuredClone(readSources());
    const stamp = JSON.stringify(snapshot);
    const assertCurrent = () => {
        if (getContext()?.chatId !== chatId) throw packageError('chat_changed');
        if (options.signal?.aborted || options.isCurrent?.() === false) throw packageError('cancelled');
        if (JSON.stringify(readSources()) !== stamp) throw packageError('source_changed');
    };
    assertCurrent();
    return {
        chatId, snapshot, assertCurrent,
        totalFloors: snapshot.chat.length,
        l0: summarizeL0Floors(snapshot.chat, chat_metadata.extensions?.[EXT_ID]?.l0Index?.byFloor),
    };
}

function packageFromCache(cache, operation) {
    const data = buildCacheSourceManifest({
        ...cache,
        chunkVectors: cache.chunkVectors.map(vectorSourceRecord),
        stateVectors: cache.stateVectors.map(vectorSourceRecord),
        eventVectors: cache.eventVectors.map(vectorSourceRecord),
    }, { chatId: operation.chatId, sources: buildSourceIndex(operation.snapshot) });
    data.chunks.forEach((row, i) => { row.vector = new Float32Array(cache.chunkVectors[i].vector); });
    data.states.forEach((row, i) => {
        row.vector = new Float32Array(cache.stateVectors[i].vector);
        row.rVector = cache.stateVectors[i].rVector ? new Float32Array(cache.stateVectors[i].rVector) : null;
    });
    data.events.forEach((row, i) => { row.vector = new Float32Array(cache.eventVectors[i].vector); });
    validatePackage(data);
    return data;
}

function logCacheDiagnostic(diagnostic, error = null) {
    const level = diagnostic.code === 'valid' ? 'info' : 'warn';
    if (xbLog.isEnabled()) xbLog[level]('vector-package', CACHE_DIAGNOSTIC_LOG, diagnostic, error);
    else console[level](CACHE_DIAGNOSTIC_LOG, diagnostic, ...(error ? [error] : []));
}

function inspectCache(cache, operation, action, validate = packageFromCache) {
    const diagnostic = {
        action, capturedAt: Date.now(), chatId: operation.chatId,
        totalFloors: operation.totalFloors,
        l1Chunks: cache.chunks.length, l1Vectors: cache.chunkVectors.length,
        lastChunkFloor: cache.meta?.lastChunkFloor ?? -1,
        l0Vectors: cache.stateVectors.length, l2Vectors: cache.eventVectors.length,
        l0: operation.l0, writer: getVectorWriteState(),
    };
    try {
        const data = validate(cache, operation);
        diagnostic.code = 'valid';
        if (action !== 'automatic') logCacheDiagnostic(diagnostic);
        return { data, diagnostic };
    } catch (error) {
        Object.assign(diagnostic, { code: error.code || 'validation_failed', details: error.details ?? null });
        error.cacheDiagnostic = diagnostic;
        if (action !== 'automatic' || isCacheConsistencyFailure(error)) logCacheDiagnostic(diagnostic);
        return { error, diagnostic };
    }
}

// Normal chat lifecycle, not upload. No network, writes or binary vector copies.
// A stale/busy read is deferred; a storage failure is thrown to the scheduler's
// existing logged retry path, never mislabeled as a corrupt cache.
export async function checkVectorCacheConsistency(options = {}) {
    const chatId = options.targetChatId || getContext()?.chatId;
    const snapshot = captureMaintenanceSnapshot(chatId);
    if (!chatId || !snapshot || options.isCurrent?.() === false) return { status: 'deferred' };
    try {
        const operation = captureOperation({
            ...options,
            isCurrent: () => isMaintenanceSnapshotCurrent(snapshot) && options.isCurrent?.() !== false,
        });
        const cache = await readVectorCacheSources(chatId);
        operation.assertCurrent();
        const result = inspectCache(cache, operation, 'automatic', inspectCacheSourceCoverage);
        if (!result.error) return {
            status: result.data.missingChunkFloors.length ? 'incomplete' : 'consistent',
            missingChunkFloors: result.data.missingChunkFloors,
            diagnostic: result.diagnostic,
        };
        if (isCacheConsistencyFailure(result.error)) return { status: 'inconsistent', diagnostic: result.diagnostic };
        throw result.error;
    } catch (error) {
        if (['cancelled', 'chat_changed', 'source_changed'].includes(error.code)) return { status: 'deferred' };
        throw error;
    }
}

// Explicitly diagnostic: a read failure is recorded, not allowed to prevent the
// user's requested rebuild. No files, settings, cache or chat data are changed.
export async function recordVectorCacheDiagnostic(action, options = {}) {
    try {
        const operation = captureOperation(options);
        const cache = await readVectorCache(operation.chatId);
        operation.assertCurrent();
        return inspectCache(cache, operation, action).diagnostic;
    } catch (error) {
        const diagnostic = { action, capturedAt: Date.now(), code: error.code || 'diagnostic_read_failed' };
        logCacheDiagnostic(diagnostic, error);
        return diagnostic;
    }
}

function resultCounts(data) {
    return { chunkCount: data.chunks.length, eventCount: data.events.length, stateVectorCount: data.states.length };
}

export async function createVectorPackage(onProgress, options = {}) {
    const operation = captureOperation(options);
    onProgress?.(PACKAGE_PROGRESS.read);
    const cache = await readVectorCache(operation.chatId);
    operation.assertCurrent();
    onProgress?.(PACKAGE_PROGRESS.validate);
    const { data, error } = inspectCache(cache, operation, 'export');
    if (error) throw error;
    onProgress?.(PACKAGE_PROGRESS.pack);
    const bytes = encodePackage(data);
    operation.assertCurrent();
    return { bytes, chatId: operation.chatId, ...resultCounts(data) };
}

export async function restoreVectorPackage(bytes, onProgress, options = {}) {
    const operation = captureOperation(options);
    onProgress?.(PACKAGE_PROGRESS.validate);
    const data = decodePackage(bytes);
    if (data.chatId !== operation.chatId) throw packageError('source_mismatch', { kind: 'chat' });
    if (!data.chunks.length && !data.states.length && !data.events.length) {
        throw packageError(data.warningCodes.length ? 'legacy_unverifiable' : 'empty_cache');
    }
    const resolved = resolvePackageSources(data, buildSourceIndex(operation.snapshot));
    operation.assertCurrent();
    onProgress?.(PACKAGE_PROGRESS.write);
    await replaceVectorCache(operation.chatId, data, resolved, operation.assertCurrent);
    // Both invalidations are in-memory and do not change chat metadata.
    invalidateLexicalIndex();
    await refreshRecallRuntime(operation.chatId, { reason: 'vector-package-restored' });
    return { ...resultCounts(data), warnings: data.warningCodes.map(packageWarning), warningCodes: data.warningCodes };
}
