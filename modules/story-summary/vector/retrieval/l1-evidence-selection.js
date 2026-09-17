import { toFloat32 } from '../runtime/scoring.js';
import { chunkMatchesTemporalCarrier, getTemporalProtectionLimit, parseEventRange,
    TEMPORAL_PROTECTION_POLICY } from './temporal-turn-carrier.js';

// Similarity is an eligibility floor; MMR only diversifies eligible passages.
export const L1_EVIDENCE_POLICY = Object.freeze({
    perLane: 3, shortlistPerSource: 32, minSimilarity: 0.50, lambda: 0.85, rrfK: 60,
});

function unitVector(value) {
    const vector = toFloat32(value);
    if (!vector?.length) return null;
    let norm = 0;
    for (const n of vector) {
        if (!Number.isFinite(n)) return null;
        norm += n * n;
    }
    if (!norm) return null;
    const scale = Math.sqrt(norm);
    const unit = new Float32Array(vector.length);
    for (let i = 0; i < vector.length; i++) unit[i] = vector[i] / scale;
    return unit;
}

function dot(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let score = 0;
    for (let i = 0; i < a.length; i++) score += a[i] * b[i];
    return score;
}

function ranked(rows, getScore) {
    return rows.sort((a, b) => getScore(b) - getScore(a)
        || a.chunk.floor - b.chunk.floor || a.chunk.chunkIdx - b.chunk.chunkIdx);
}

function prepareEvent(event, rows, temporalWinners) {
    const policy = L1_EVIDENCE_POLICY;
    const eventRows = ranked(rows.filter(row => row.eventScore >= policy.minSimilarity), row => row.eventScore);
    const queryRows = ranked(rows.filter(row => row.queryScore >= policy.minSimilarity), row => row.queryScore);
    const lexicalRows = ranked(rows.filter(row => row.lexicalScore > 0), row => row.lexicalScore);
    for (const source of [queryRows, lexicalRows]) {
        for (const [index, row] of source.entries()) {
            row.conversationScore += (policy.rrfK + 1) / (policy.rrfK + index + 1) / 2;
        }
    }
    const conversationRows = ranked(rows.filter(row => row.conversationScore > 0), row => row.conversationScore);
    const temporalRows = rows.filter(row => row.temporal).sort((a, b) => (
        b.conversationScore - a.conversationScore || b.queryScore - a.queryScore
        || a.chunk.floor - b.chunk.floor || a.chunk.chunkIdx - b.chunk.chunkIdx
    ));
    // Nominate by query relevance, before event-lane output can claim a floor.
    // Overlapping parents use the same winner; L2 order breaks owner ties.
    for (const row of temporalRows) {
        if (!temporalWinners.has(row.chunk.floor)) {
            temporalWinners.set(row.chunk.floor, row.chunk.chunkId);
        }
    }
    return { event, eventRows, conversationRows, lexicalRows, temporalRows, selected: [] };
}

function shortlist(sources, isAvailable) {
    const candidates = new Map();
    for (const source of sources) {
        let count = 0;
        for (const row of source) {
            if (!isAvailable(row)) continue;
            candidates.set(row.chunk.chunkId, row);
            if (++count >= L1_EVIDENCE_POLICY.shortlistPerSource) break;
        }
    }
    return [...candidates.values()];
}

async function pickForLane(selection, lane, round, selectedIds, isProtected, checkpoint, stats) {
    const available = row => !selectedIds.has(row.chunk.chunkId);
    const protectedAvailable = row => available(row) && isProtected(row);
    // Exact-time winners bypass the dense shortlist, not the protection caps.
    if (lane === 'conversation' && round === 0) {
        const winner = selection.temporalRows.find(protectedAvailable);
        if (winner) return winner;
    }
    const candidates = lane === 'event'
        ? shortlist([selection.eventRows], available)
        : [...new Map([
            ...shortlist([selection.conversationRows, selection.lexicalRows], available),
            ...shortlist([selection.temporalRows], protectedAvailable),
        ].map(row => [row.chunk.chunkId, row])).values()];
    let best = null;
    let bestScore = -Infinity;
    if (round > 0) stats.maxMmrCandidates = Math.max(stats.maxMmrCandidates, candidates.length);
    for (const [index, row] of candidates.entries()) {
        if (index % 32 === 0) await checkpoint();
        const relevance = lane === 'event' ? row.eventScore : row.conversationScore;
        let redundancy = 0;
        if (round > 0) {
            for (const other of selection.selected) {
                redundancy = Math.max(redundancy, dot(row.vector, other.vector));
                stats.mmrComparisons++;
            }
        }
        const score = L1_EVIDENCE_POLICY.lambda * relevance - (1 - L1_EVIDENCE_POLICY.lambda) * redundancy;
        if (score > bestScore) { best = row; bestScore = score; }
    }
    return best;
}

// Admission consumes this order as rank. Rotate only after selection so lane
// scheduling cannot change MMR, shared-chunk ownership or temporal winners.
function orderForAdmission(items) {
    const batchSize = 5;
    const event = items.filter(item => item.evidenceLane === 'event');
    const conversation = items.filter(item => item.evidenceLane === 'conversation');
    const ordered = [];
    for (let start = 0; start < Math.max(event.length, conversation.length); start += batchSize) {
        ordered.push(...event.slice(start, start + batchSize), ...conversation.slice(start, start + batchSize));
    }
    return ordered;
}

/** Small owned L1 sets using runtime-resident vectors. No API or storage writes. */
export async function selectL1Evidence(parents, data, options = {}) {
    const query = unitVector(options.queryVector);
    const lexical = new Map((options.lexicalScores || []).map(item => [item.chunkId, Number(item.score) || 0]));
    const cache = new Map();
    const visitedFloors = new Set();
    const selectedIds = new Set();
    const parentIds = new Set();
    const temporalWinners = new Map();
    const items = [];
    const selections = [];
    const stats = { parents: 0, floors: 0, sourceCandidates: 0, vectorHits: 0, missingVectors: 0,
        missingEventVectors: 0, eventItems: 0, conversationItems: 0, lexicalItems: 0,
        temporalCandidates: 0, temporalFloorWinners: 0, temporalProtectedCandidates: 0,
        maxMmrCandidates: 0, mmrComparisons: 0 };
    const check = () => {
        options.signal?.throwIfAborted();
        if (options.isCurrent && !options.isCurrent()) throw new DOMException('Recall session released', 'AbortError');
    };
    let sliceStarted = performance.now();
    const checkpoint = async () => {
        if (performance.now() - sliceStarted >= 8) {
            await new Promise(resolve => setTimeout(resolve, 0));
            sliceStarted = performance.now();
        }
        check();
    };
    let scanned = 0;
    for (const parent of parents || []) {
        check();
        const event = parent?.event;
        const range = parseEventRange(event?.summary);
        if (!event?.id || parentIds.has(event.id) || !range || range.end < range.start) continue;
        parentIds.add(event.id);
        stats.parents++;
        const eventVector = unitVector(data.eventVectorsById.get(event.id)?.vector);
        if (!eventVector || (query && eventVector.length !== query.length)) stats.missingEventVectors++;
        const rows = [];
        // Existing floors only: a wide range cannot allocate synthetic floors.
        for (const [floor, chunks] of data.chunksByFloor) {
            if (floor < range.start || floor > range.end) continue;
            visitedFloors.add(floor);
            for (const chunk of chunks) {
                if (!String(chunk.text || '').trim()) continue;
                if (!cache.has(chunk.chunkId)) {
                    const vector = unitVector(data.chunkVectorsById.get(chunk.chunkId)?.vector);
                    const usable = vector && (!query || vector.length === query.length) ? vector : null;
                    stats[usable ? 'vectorHits' : 'missingVectors']++;
                    const temporal = chunkMatchesTemporalCarrier(chunk, options.temporalCarrier);
                    if (temporal) stats.temporalCandidates++;
                    cache.set(chunk.chunkId, { chunk, vector: usable,
                        queryScore: dot(query, usable), lexicalScore: lexical.get(chunk.chunkId) || 0, temporal });
                }
                const cached = cache.get(chunk.chunkId);
                rows.push({ ...cached, eventScore: dot(eventVector, cached.vector), conversationScore: 0 });
                if (++scanned % 32 === 0) {
                    await checkpoint();
                }
            }
        }
        selections.push(prepareEvent(event, rows, temporalWinners));
    }
    const temporalCap = getTemporalProtectionLimit(stats.parents * L1_EVIDENCE_POLICY.perLane * 2,
        TEMPORAL_PROTECTION_POLICY.maxCandidateShare);
    const isProtected = row => temporalWinners.get(row.chunk.floor) === row.chunk.chunkId
        && stats.temporalProtectedCandidates < temporalCap;
    // Selection itself rotates: an owner's later choices cannot pre-claim a
    // source needed by the next owner's first choice. Chunk IDs, not text,
    // identify sources (different speakers/turns may say identical words).
    for (let round = 0; round < L1_EVIDENCE_POLICY.perLane; round++) {
        for (const lane of ['event', 'conversation']) {
            for (const selection of selections) {
                const row = await pickForLane(selection, lane, round, selectedIds, isProtected, checkpoint, stats);
                if (!row) continue;
                const temporal = isProtected(row);
                if (temporal) stats.temporalProtectedCandidates++;
                selectedIds.add(row.chunk.chunkId);
                selection.selected.push(row);
                items.push({ ...row.chunk, ownerEventId: selection.event.id, evidenceLane: lane,
                    eventScore: row.eventScore, queryScore: row.queryScore, lexicalScore: row.lexicalScore,
                    _directEvidenceTemporalMatch: row.temporal,
                    _directEvidenceTemporalCarrier: temporal,
                    _directEvidencePassedMinScore: row.eventScore >= L1_EVIDENCE_POLICY.minSimilarity
                        || row.queryScore >= L1_EVIDENCE_POLICY.minSimilarity || row.lexicalScore > 0 });
            }
        }
    }
    stats.temporalFloorWinners = temporalWinners.size;
    stats.floors = visitedFloors.size;
    stats.sourceCandidates = cache.size;
    stats.eventItems = items.filter(item => item.evidenceLane === 'event').length;
    stats.conversationItems = items.length - stats.eventItems;
    stats.lexicalItems = items.filter(item => item.lexicalScore > 0).length;
    stats.candidates = stats.relevantItems = items.length;
    check();
    return { items: orderForAdmission(items), stats,
        status: stats.missingVectors || stats.missingEventVectors ? 'partial-vectors' : 'applied' };
}
