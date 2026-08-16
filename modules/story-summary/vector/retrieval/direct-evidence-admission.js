import {
    chunkMatchesTemporalCarrier,
    eventMatchesTemporalFloors,
    normalizeTimeText,
    parseEventRange,
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
    const temporalFloors = [...new Set((options.temporalFloors || []).filter(Number.isInteger))];
    const source = uniqueBy(
        (selectedDirect || []).filter(item => item?.event?.id && item?.event?.summary),
        item => item.event.id,
    );
    const selected = source.slice(0, limit);
    const selectedIds = new Set(selected.map(item => item.event.id));
    for (const item of source) {
        if (!eventMatchesTemporalFloors(item.event, temporalFloors) || selectedIds.has(item.event.id)) continue;
        selected.push(item);
        selectedIds.add(item.event.id);
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
    const temporalKept = temporal.slice(0, limit);
    const temporalIds = new Set(temporalKept.map(row => row.chunk.chunkId));
    const selected = ranked.slice(0, limit);
    const selectedIds = new Set(selected.map(row => row.chunk.chunkId));
    for (const row of temporalKept) {
        const chunkId = row.chunk.chunkId;
        if (selectedIds.has(chunkId)) continue;
        let replaceIndex = selected.length - 1;
        while (replaceIndex >= 0 && temporalIds.has(selected[replaceIndex].chunk.chunkId)) replaceIndex--;
        if (replaceIndex < 0) break;
        selectedIds.delete(selected[replaceIndex].chunk.chunkId);
        selected[replaceIndex] = row;
        selectedIds.add(chunkId);
    }
    selected.sort((left, right) => (
        right.focusScore - left.focusScore || left.sourceIndex - right.sourceIndex
    ));

    return {
        candidates: selected.map(row => ({
            ...row.chunk,
            _directEvidenceFocusScore: row.focusScore,
            _directEvidenceTemporalExact: row.exact,
            _directEvidenceTemporalCarrier: row.temporal,
            _directEvidenceTemporalMarker: row.temporal ? marker : null,
        })),
        sourceCount: ranked.length,
        temporalCandidateCount: temporal.length,
        temporalReservedCount: temporalKept.length,
        temporalOverflowCount: Math.max(0, temporal.length - temporalKept.length),
    };
}

export function formatDirectEvidenceDocument(chunk) {
    const speaker = chunk?.speaker || (chunk?.isUser ? '用户' : '角色');
    return `#${Number(chunk?.floor) + 1} [${speaker}] ${String(chunk?.text || '').trim()}`;
}
