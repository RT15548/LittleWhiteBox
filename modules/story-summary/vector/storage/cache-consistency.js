import { packageError } from './package/messages.js';
import { buildSourceIndex, resolvePackageSources } from './package/sources.js';
import { collectChunkMaterials } from '../pipeline/chunk-materials.js';
import { makeChunkId } from './chunk-store.js';

// The automatic check needs identities and input digests, not embedding arrays.
// Export projects through the same boundary before attaching its binary payload.
export function vectorSourceRecord(record) {
    return {
        chunkId: record.chunkId, atomId: record.atomId, eventId: record.eventId,
        floor: record.floor, fingerprint: record.fingerprint, dims: record.dims,
        sourceHash: record.sourceHash, relationHash: record.relationHash,
        hasRelationVector: Boolean(record.rVector),
    };
}

function storedSource(record, fingerprint, layer) {
    if (record.fingerprint !== fingerprint) throw packageError('invalid_package', { field: 'fingerprint' });
    if (!record.sourceHash) throw packageError('incomplete_cache', { reason: 'missing_source_hash', layer });
    return { sourceHash: record.sourceHash };
}

function buildStoredSourceManifest(cache, { chatId, sources }) {
    const first = cache.chunkVectors[0] || cache.stateVectors[0] || cache.eventVectors[0];
    const fingerprint = first?.fingerprint;
    const data = {
        chatId, fingerprint, dims: first?.dims,
        chunks: cache.chunkVectors.map(record => {
            const chunk = sources.chunks.get(record.chunkId)?.chunk;
            if (!chunk) throw packageError('source_mismatch', { kind: 'chunk', id: record.chunkId });
            return { id: record.chunkId, floor: chunk.floor, index: chunk.chunkIdx, ...storedSource(record, fingerprint, 'l1') };
        }),
        states: cache.stateVectors.map(record => {
            if (record.hasRelationVector && !record.relationHash) throw packageError('incomplete_cache', { reason: 'missing_relation_hash', floor: record.floor });
            return {
                id: record.atomId, floor: record.floor, ...storedSource(record, fingerprint, 'l0'),
                relationHash: record.hasRelationVector ? record.relationHash : null,
            };
        }),
        events: cache.eventVectors.map(record => ({ id: record.eventId, ...storedSource(record, fingerprint, 'l2') })),
        warningCodes: [],
    };
    resolvePackageSources(data, sources);
    return data;
}

// Export still requires each stored vector to have its material. It may export
// a partial chat, but cannot ship an internally unpaired cache.
export function buildCacheSourceManifest(cache, operation) {
    if (!cache.chunkVectors.length && !cache.stateVectors.length && !cache.eventVectors.length) throw packageError('empty_cache');
    const cachedIds = new Set(cache.chunks.map(chunk => chunk.chunkId));
    if (cachedIds.size !== cache.chunkVectors.length) throw packageError('incomplete_cache', { reason: 'l1_count_mismatch' });
    if (cache.chunkVectors.some(record => !cachedIds.has(record.chunkId))) {
        throw packageError('incomplete_cache', { reason: 'l1_content_mismatch' });
    }
    // Packages omit L1 text, so import must be able to reconstruct every saved
    // input from current chat. This is not the daily cache-integrity contract.
    for (const chunk of cache.chunks) {
        const current = operation.sources.chunks.get(chunk.chunkId)?.chunk;
        if (!current || chunk.text !== current.text || chunk.floor !== current.floor || chunk.chunkIdx !== current.chunkIdx) {
            throw packageError('incomplete_cache', { reason: 'l1_content_mismatch', floor: chunk.floor });
        }
    }
    return buildStoredSourceManifest(cache, operation);
}

// Daily integrity is vector-to-saved-material, not saved-material-to-live-chat.
// Missing pairs share their material selection with automatic/manual gap repair.
export function inspectCacheSourceCoverage(cache, operation) {
    const { chat } = operation.snapshot;
    for (const chunk of cache.chunks) {
        if (!Number.isInteger(chunk.floor) || chunk.floor < 0 || chunk.floor >= chat.length
            || !Number.isInteger(chunk.chunkIdx) || chunk.chunkIdx < 0
            || chunk.chunkId !== makeChunkId(chunk.floor, chunk.chunkIdx)
            || typeof chunk.text !== 'string' || !chunk.text) {
            throw packageError('incomplete_cache', { reason: 'l1_content_mismatch', floor: chunk.floor });
        }
    }
    const materials = collectChunkMaterials(chat, cache.chunks, cache.chunkVectors);
    const sources = buildSourceIndex(operation.snapshot, materials);
    const cachedIds = new Set(cache.chunks.map(chunk => chunk.chunkId));
    const fingerprint = (cache.chunkVectors[0] || cache.stateVectors[0] || cache.eventVectors[0])?.fingerprint;
    // Daily usability and portable provenance are different contracts. Missing
    // digests do not prove corruption; a present digest must still match. Export
    // remains strict and never fabricates a digest for an existing vector.
    for (const [records, index, key, kind] of [
        [cache.chunkVectors, sources.chunks, 'chunkId', 'chunk'],
        [cache.stateVectors, sources.states, 'atomId', 'state'],
        [cache.eventVectors, sources.events, 'eventId', 'event'],
    ]) {
        for (const record of records) {
            if (record.fingerprint !== fingerprint) throw packageError('invalid_package', { field: 'fingerprint' });
            const source = index.get(record[key]);
            if (!source || (record.sourceHash && record.sourceHash !== source.sourceHash)
                || (kind === 'state' && (source.floor !== record.floor || !Number.isInteger(record.floor)
                    || record.floor < 0 || record.floor >= chat.length
                    || (record.hasRelationVector && record.relationHash && record.relationHash !== source.relationHash)))
                // An orphan's material may only be recovered from live prose
                // when the original vector actually proves that input.
                || (kind === 'chunk' && !cachedIds.has(record.chunkId) && !record.sourceHash)) {
                throw packageError('source_mismatch', { kind, id: record[key] });
            }
        }
    }
    const vectorIds = new Set(cache.chunkVectors.map(record => record.chunkId));
    const missingFloors = new Set();
    for (const [id, source] of sources.chunks) {
        if (!cachedIds.has(id) || !vectorIds.has(id)) missingFloors.add(source.chunk.floor);
    }
    return { missingChunkFloors: [...missingFloors].sort((a, b) => a - b) };
}

export function isCacheConsistencyFailure(error) {
    return ['incomplete_cache', 'source_mismatch', 'invalid_package'].includes(error?.code);
}
