import {
    chunkMatchesTemporalCarrier,
    getTemporalProtectionLimit,
    matchingEventTemporalFloors,
    normalizeTimeText,
    parseEventRange,
    selectTemporalFloorWinners,
    TEMPORAL_PROTECTION_POLICY,
} from './temporal-turn-carrier.js';

const DEFAULT_PARENT_LIMIT = 20;
const DEFAULT_CANDIDATE_LIMIT = 60;

function uniqueBy(items, getId) {
    const seen = new Set();
    return (items || []).filter(item => {
        const id = getId(item);
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
    });
}

export function selectDirectEvidenceParents(selectedDirect, options = {}) {
    const limit = Number.isInteger(options.limit) && options.limit > 0
        ? options.limit
        : DEFAULT_PARENT_LIMIT;
    const maxExtraTemporalParents = Number.isInteger(options.maxExtraTemporalParents)
        && options.maxExtraTemporalParents >= 0
        ? options.maxExtraTemporalParents
        : TEMPORAL_PROTECTION_POLICY.maxExtraDirectEvidenceParents;
    const temporalFloors = [...new Set((options.temporalFloors || []).filter(Number.isInteger))];
    const source = uniqueBy(
        (selectedDirect || []).filter(item => item?.event?.id && item?.event?.summary),
        item => item.event.id,
    );
    const selected = source.slice(0, limit);
    const selectedIds = new Set(selected.map(item => item.event.id));
    const temporalWinners = selectTemporalFloorWinners(
        source,
        item => matchingEventTemporalFloors(item.event, temporalFloors),
    );
    let addedTemporalParents = 0;
    for (const item of temporalWinners) {
        // A winner already present in the ordinary top-N still owns its floors;
        // never promote a runner-up merely to fill the extra-parent allowance.
        if (selectedIds.has(item.event.id)) continue;
        if (addedTemporalParents >= maxExtraTemporalParents) break;
        selected.push(item);
        selectedIds.add(item.event.id);
        addedTemporalParents++;
    }
    return selected;
}

export function floorsForDirectEvidenceParents(parents) {
    const floors = new Set();
    for (const parent of parents || []) {
        const range = parseEventRange(parent?.event?.summary);
        if (!range) continue;
        for (let floor = range.start; floor <= range.end; floor++) floors.add(floor);
    }
    return [...floors].sort((left, right) => left - right);
}

function exactTimeMatch(text, marker) {
    return !!marker && normalizeTimeText(text).includes(normalizeTimeText(marker));
}

export function selectDirectEvidenceAdmission(scoredChunks, options = {}) {
    const limit = Number.isInteger(options.limit) && options.limit > 0
        ? options.limit
        : DEFAULT_CANDIDATE_LIMIT;
    const maxTemporalCandidateShare = Number.isFinite(Number(options.maxTemporalCandidateShare))
        ? Number(options.maxTemporalCandidateShare)
        : TEMPORAL_PROTECTION_POLICY.maxCandidateShare;
    const marker = options.timeMarker || null;
    const temporalCarrier = options.temporalCarrier || null;
    const ranked = uniqueBy(
        (scoredChunks || []).filter(chunk => chunk?.chunkId && chunk?._vectorPresent !== false
            && String(chunk?.text || '').trim()),
        chunk => chunk.chunkId,
    ).map((chunk, sourceIndex) => ({
        chunk,
        sourceIndex,
        focusScore: Number(chunk?._cosineScore || 0),
        exact: exactTimeMatch(chunk?.text, marker),
        temporal: temporalCarrier
            ? chunkMatchesTemporalCarrier(chunk, temporalCarrier)
            : exactTimeMatch(chunk?.text, marker),
    })).sort((left, right) => (
        right.focusScore - left.focusScore || left.sourceIndex - right.sourceIndex
    ));

    const temporal = ranked.filter(row => row.temporal);
    const temporalWinners = selectTemporalFloorWinners(
        temporal,
        row => Number.isInteger(Number(row.chunk.floor)) ? [Number(row.chunk.floor)] : [],
    );
    const temporalProtectionCap = getTemporalProtectionLimit(limit, maxTemporalCandidateShare);
    const temporalProtected = temporalWinners.slice(0, temporalProtectionCap);
    const temporalIds = new Set(temporalProtected.map(row => row.chunk.chunkId));
    const temporalProtectedFloors = new Set(temporalProtected.map(row => Number(row.chunk.floor)));
    const selected = ranked.slice(0, limit);
    const selectedIds = new Set(selected.map(row => row.chunk.chunkId));
    let temporalForcedCount = 0;
    for (const row of temporalProtected) {
        const chunkId = row.chunk.chunkId;
        if (selectedIds.has(chunkId)) continue;
        let replaceIndex = selected.length - 1;
        while (replaceIndex >= 0 && temporalIds.has(selected[replaceIndex].chunk.chunkId)) replaceIndex--;
        if (replaceIndex < 0) break;
        selectedIds.delete(selected[replaceIndex].chunk.chunkId);
        selected[replaceIndex] = row;
        selectedIds.add(chunkId);
        temporalForcedCount++;
    }
    selected.sort((left, right) => (
        right.focusScore - left.focusScore || left.sourceIndex - right.sourceIndex
    ));

    return {
        candidates: selected.map(row => ({
            ...row.chunk,
            _directEvidenceFocusScore: row.focusScore,
            _directEvidenceTemporalExact: row.exact,
            _directEvidenceTemporalCarrier: temporalIds.has(row.chunk.chunkId),
            _directEvidenceTemporalMatch: row.temporal,
            _directEvidenceTemporalProtectionFloor: row.temporal
                && temporalProtectedFloors.has(Number(row.chunk.floor))
                ? Number(row.chunk.floor)
                : null,
            _directEvidenceTemporalMarker: temporalIds.has(row.chunk.chunkId) ? marker : null,
        })),
        sourceCount: ranked.length,
        temporalCandidateCount: temporal.length,
        temporalFloorWinnerCount: temporalWinners.length,
        temporalProtectionCap,
        temporalProtectedCount: temporalProtected.length,
        temporalForcedCount,
        temporalOverflowCount: Math.max(0, temporalWinners.length - temporalProtected.length),
        temporalSameFloorNonWinnerCount: Math.max(0, temporal.length - temporalWinners.length),
    };
}

export function formatDirectEvidenceDocument(chunk) {
    const speaker = chunk?.speaker || (chunk?.isUser ? '用户' : '角色');
    return `#${Number(chunk?.floor) + 1} [${speaker}] ${String(chunk?.text || '').trim()}`;
}
