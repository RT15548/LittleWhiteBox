import {
    extractFullTimeMarker,
    findExactTimeFloors,
    getTemporalProtectionLimit,
    matchingEventTemporalFloors,
    selectTemporalFloorWinners,
    TEMPORAL_PROTECTION_POLICY,
} from './temporal-turn-carrier.js';

export const EVENT_RERANK_CANDIDATE_MAX = 60;

function emptyTemporalStats(candidates, tail) {
    return {
        candidates,
        tail,
        exactTimeMarker: '',
        exactTimeFloorCount: 0,
        exactTimeCandidateCount: 0,
        exactTimeWinnerCount: 0,
        exactTimeReservedCount: 0,
        exactTimeOverflowCount: 0,
        exactTimeForcedCount: 0,
    };
}

/**
 * Bound already-recalled L2 events for cross-encoder reranking.
 * `item.similarity` is the authoritative score produced by the current
 * recall run; this stage must not score the full event store again.
 */
export function selectEventRerankCandidates(source, options = {}) {
    const input = Array.isArray(source) ? source : [];
    const eligible = input.filter(item => item?.event?.id && item?.event?.summary);
    if (eligible.length <= EVENT_RERANK_CANDIDATE_MAX) {
        const candidateSet = new Set(eligible);
        return emptyTemporalStats(
            eligible,
            input.filter(item => !candidateSet.has(item)),
        );
    }

    const exactTimeMarker = extractFullTimeMarker(options.temporalQuery) || '';
    const exactTimeFloors = findExactTimeFloors(options.chat, exactTimeMarker);
    const ranked = eligible
        .map((item, sourceIndex) => ({
            item,
            sourceIndex,
            score: Number.isFinite(item?.similarity)
                ? item.similarity
                : Number.NEGATIVE_INFINITY,
            exactTimeFloors: matchingEventTemporalFloors(item.event, exactTimeFloors),
        }))
        .sort((left, right) => right.score - left.score || left.sourceIndex - right.sourceIndex);
    const selected = ranked.slice(0, EVENT_RERANK_CANDIDATE_MAX);
    const selectedIds = new Set(selected.map(row => row.item.event.id));
    const exactTimeRows = ranked.filter(row => row.exactTimeFloors.length > 0);
    const exactTimeWinners = selectTemporalFloorWinners(
        exactTimeRows,
        row => row.exactTimeFloors,
    );
    const exactTimeReserveCap = Math.min(
        TEMPORAL_PROTECTION_POLICY.maxProtectedEvents,
        getTemporalProtectionLimit(
            EVENT_RERANK_CANDIDATE_MAX,
            TEMPORAL_PROTECTION_POLICY.maxCandidateShare,
        ),
    );
    const exactTimeProtected = exactTimeWinners.slice(0, exactTimeReserveCap);
    const exactTimeIds = new Set(exactTimeProtected.map(row => row.item.event.id));
    let exactTimeForcedCount = 0;

    for (const row of exactTimeProtected) {
        if (selectedIds.has(row.item.event.id)) continue;
        let replaceIndex = selected.length - 1;
        while (replaceIndex >= 0 && exactTimeIds.has(selected[replaceIndex].item.event.id)) {
            replaceIndex--;
        }
        if (replaceIndex < 0) break;
        selectedIds.delete(selected[replaceIndex].item.event.id);
        selected[replaceIndex] = row;
        selectedIds.add(row.item.event.id);
        exactTimeForcedCount++;
    }

    selected.sort((left, right) => right.score - left.score || left.sourceIndex - right.sourceIndex);
    const candidates = selected.map(row => row.item);
    const candidateSet = new Set(candidates);
    return {
        candidates,
        tail: input.filter(item => !candidateSet.has(item)),
        exactTimeMarker,
        exactTimeFloorCount: exactTimeFloors.length,
        exactTimeCandidateCount: exactTimeRows.length,
        exactTimeWinnerCount: exactTimeWinners.length,
        exactTimeReservedCount: exactTimeProtected.length,
        exactTimeOverflowCount: Math.max(0, exactTimeWinners.length - exactTimeProtected.length),
        exactTimeForcedCount,
    };
}
