import {
    chunkMatchesTemporalCarrier,
    eventMatchesTemporalFloors,
    normalizeTimeText,
    parseEventRange,
} from './temporal-turn-carrier.js';

const DEFAULT_PARENT_LIMIT = 20;
const DEFAULT_CHILD_LIMIT = 60;
const DEFAULT_PACK_LIMIT = 24;

function uniqueBy(items, getId) {
    const seen = new Set();
    return (items || []).filter(item => {
        const id = getId(item);
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
    });
}

export function selectEventDetailParents(selectedDirect, options = {}) {
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

export function floorsForEventDetailParents(parents) {
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

export function selectEventDetailAdmission(scoredChunks, options = {}) {
    const limit = Number.isInteger(options.limit) && options.limit > 0
        ? options.limit
        : DEFAULT_CHILD_LIMIT;
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
            _detailFocusScore: row.focusScore,
            _detailTemporalExact: row.exact,
            _detailTemporalCarrier: row.temporal,
            _detailTemporalMarker: row.temporal ? marker : null,
        })),
        sourceCount: ranked.length,
        temporalCandidateCount: temporal.length,
        temporalReservedCount: temporalKept.length,
        temporalOverflowCount: Math.max(0, temporal.length - temporalKept.length),
    };
}

export function formatEventDetailDocument(chunk) {
    const speaker = chunk?.speaker || (chunk?.isUser ? '用户' : '角色');
    return `#${Number(chunk?.floor) + 1} [${speaker}] ${String(chunk?.text || '').trim()}`;
}

export function selectPackedEventDetails(rankedItems, options = {}) {
    const limit = Number.isInteger(options.limit) && options.limit > 0
        ? options.limit
        : DEFAULT_PACK_LIMIT;
    const budget = Math.max(0, Number(options.budget || 0));
    const costFor = typeof options.costFor === 'function' ? options.costFor : () => 0;
    const excludedIds = options.excludedIds instanceof Set ? options.excludedIds : new Set();
    const allRanked = uniqueBy(
        (rankedItems || []).filter(item => item?.chunkId && !excludedIds.has(item.chunkId)),
        item => item.chunkId,
    ).map((item, rankIndex) => ({
        item,
        rankIndex,
        cost: Math.max(0, Number(costFor(item) || 0)),
    }));
    const guarded = allRanked.find(row => row.item?._detailTemporalCarrier === true)
        || allRanked.find(row => row.item?._detailTemporalExact === true)
        || null;
    const ranked = allRanked.slice(0, limit);
    if (guarded && !ranked.includes(guarded) && ranked.length > 0) {
        ranked[ranked.length - 1] = guarded;
        ranked.sort((left, right) => left.rankIndex - right.rankIndex);
    }
    const selected = [];
    let used = 0;
    if (guarded && guarded.cost <= budget) {
        selected.push(guarded);
        used += guarded.cost;
    }
    for (const row of ranked) {
        if (row === guarded || used + row.cost > budget) continue;
        selected.push(row);
        used += row.cost;
    }
    selected.sort((left, right) => left.rankIndex - right.rankIndex);
    return {
        selected: selected.map(row => ({ ...row.item, _detailPromptCost: row.cost })),
        used,
        guardedChunkId: guarded?.item?.chunkId || null,
    };
}
