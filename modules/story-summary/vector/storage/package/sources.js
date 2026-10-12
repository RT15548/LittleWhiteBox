import { inputDigest } from '../../utils/vector-input-digest.js';
import { chunkMessage } from '../../pipeline/chunk-text.js';
import { buildRAggregateText } from '../../pipeline/state-vector-input.js';
import { buildEventVectorText } from '../../pipeline/event-vector-input.js';
import { packageError } from './messages.js';

export function stateInputDigests(atom) {
    return {
        sourceHash: inputDigest('state', atom.semantic),
        relationHash: inputDigest('relation', buildRAggregateText(atom)),
    };
}

function indexRows(rows) {
    const index = new Map();
    for (const row of rows) {
        if (typeof row.id !== 'string' || !row.id || index.has(row.id)) throw packageError('source_mismatch');
        index.set(row.id, row);
    }
    return index;
}

// Read-only projection of the authoritative chat, never getSummaryStore or
// getStateAtoms: those getters can initialize/migrate persisted metadata.
// Packages use current chat inputs; daily maintenance supplies saved materials.
export function buildSourceIndex({ chat, atoms, events }, chunks = chat.flatMap((message, floor) => chunkMessage(floor, message))) {
    return {
        floorCount: chat.length,
        chunks: indexRows(chunks.map(chunk => ({ id: chunk.chunkId, sourceHash: inputDigest('chunk', chunk.text), chunk }))),
        states: indexRows(atoms.map(atom => ({ id: atom.atomId, floor: atom.floor, ...stateInputDigests(atom) }))),
        events: indexRows(events.map(event => ({ id: event.id, sourceHash: inputDigest('event', buildEventVectorText(event)) }))),
    };
}

export function resolvePackageSources(data, sources) {
    const chunks = data.chunks.map(row => {
        const source = sources.chunks.get(row.id);
        if (!source || source.sourceHash !== row.sourceHash || source.chunk.floor !== row.floor || source.chunk.chunkIdx !== row.index) {
            throw packageError('source_mismatch', { kind: 'chunk', id: row.id });
        }
        return source.chunk;
    });
    for (const row of data.states) {
        const source = sources.states.get(row.id);
        if (!source || source.floor !== row.floor || source.sourceHash !== row.sourceHash
            || (row.relationHash !== null && source.relationHash !== row.relationHash)
            || !Number.isInteger(row.floor) || row.floor < 0 || row.floor >= sources.floorCount) {
            throw packageError('source_mismatch', { kind: 'state', id: row.id });
        }
    }
    for (const row of data.events) {
        if (sources.events.get(row.id)?.sourceHash !== row.sourceHash) throw packageError('source_mismatch', { kind: 'event', id: row.id });
    }
    // Derive the contiguous L1 watermark; a package cannot declare absent floors
    // complete. Empty projected floors need no vectors.
    const importedIds = new Set(data.chunks.map(row => row.id));
    let firstMissingFloor = sources.floorCount;
    for (const [id, source] of sources.chunks) {
        if (!importedIds.has(id)) firstMissingFloor = Math.min(firstMissingFloor, source.chunk.floor);
    }
    return { chunks, lastChunkFloor: firstMissingFloor - 1 };
}
