import { memoryRecords, memoryKey, sameMemory } from './domain.js';
import { summaryBatchChanges } from '../data/summary-undo.js';

export const overlaps = (a, b) => a.from <= b.to && b.from <= a.to;
export function unionRanges(ranges) {
    const result = [];
    for (const range of [...ranges].sort((a, b) => a.from - b.from || a.to - b.to)) {
        if (range.to < range.from) continue;
        const last = result.at(-1);
        if (last && range.from <= last.to + 1) last.to = Math.max(last.to, range.to);
        else result.push({ from: range.from, to: range.to });
    }
    return result;
}

export function subtractRanges(ranges, removed) {
    let result = unionRanges(ranges);
    for (const cut of unionRanges(removed)) result = result.flatMap(range => !overlaps(range, cut) ? [range] : [
        ...(range.from < cut.from ? [{ from: range.from, to: cut.from - 1 }] : []),
        ...(range.to > cut.to ? [{ from: cut.to + 1, to: range.to }] : []),
    ]);
    return result;
}

export function maintenanceRanges(history, cutoff) {
    const boundary = cutoff >= 0 ? [{ from: 1, to: cutoff + 1 }] : [];
    const claimed = history.flatMap(batch => (batch.maintenance || []).flatMap(receipt =>
        receipt.completion ? subtractRanges([receipt.completion], receipt.invalidated || []) : []));
    const pending = subtractRanges(boundary, claimed);
    return { from: 1, cutoff: cutoff + 1, completed: subtractRanges(boundary, pending), pending };
}

export const batchRange = batch => ({ from: batch.kind === 'batch' ? batch.previousEndMesId + 2 : 1, to: batch.endMesId + 1 });
export const baselineRange = (history, cutoff) => ({ from: 1, to: (history[0]?.endMesId ?? cutoff) + 1 });

/** The preceding batch supplies continuity, not another review assignment. */
export function maintenanceTask(history, cutoff) {
    const progress = maintenanceRanges(history, cutoff);
    const batches = history.map(batchRange);
    const preceding = batches.flatMap((range, index) => index > 0 && progress.pending.some(pending => overlaps(range, pending))
        ? [batches[index - 1]] : []);
    return { ...progress, contextRanges: subtractRanges(preceding, progress.pending) };
}

/** Summary responsibility spans a batch; an anchor's responsibility is one floor. */
export function selectMemoryRanges(records, ranges) {
    return ranges === undefined ? records : records.filter(record => ranges.some(range => overlaps(record.maintenanceRange, range)));
}

/** Latest generation responsibility, derived from inverse operations, not creation time. */
export function memoryOwnership(history, cutoff) {
    const updated = new Map();
    for (const batch of history) {
        if (batch.kind !== 'batch') continue;
        for (const change of summaryBatchChanges(batch.undo)) {
            const before = Array.isArray(change.before) ? change.before : change.before == null ? [] : [change.before];
            const after = Array.isArray(change.after) ? change.after : change.after == null ? [] : [change.after];
            const previous = new Map(before.map(value => [memoryKey(change.collection, value), value]));
            for (const value of after) {
                const key = memoryKey(change.collection, value);
                if (!sameMemory(value, previous.get(key))) updated.set(`${change.collection}:${key}`, batch);
            }
        }
    }
    return record => {
        if (record.collection === 'anchors') return { range: { from: record.value.floor + 1, to: record.value.floor + 1 } };
        const batch = updated.get(`${record.collection}:${record.key}`)
            || history.find(item => item.kind === 'batch' && item.endMesId === record.value?._addedAt);
        return { range: batch ? batchRange(batch) : baselineRange(history, cutoff), batch };
    };
}

/** Pure receipt update, shared by source invalidation and owned transaction drafts. */
export function invalidateReceiptCompletion(receipt, ranges) {
    if (!receipt.completion) return receipt;
    const affected = ranges.filter(range => range.from <= range.to && overlaps(range, receipt.completion)).map(range => ({
        from: Math.max(range.from, receipt.completion.from), to: Math.min(range.to, receipt.completion.to),
    }));
    if (!affected.length) return receipt;
    const invalidated = unionRanges([...(receipt.invalidated || []), ...affected]);
    return sameMemory(invalidated, receipt.invalidated || []) ? receipt : { ...receipt, invalidated };
}

/** Receipt-owned retirement; never a second progress store. */
export function invalidateCompletionRanges(history, ranges) {
    for (const batch of history) for (const receipt of batch.maintenance || []) {
        const next = invalidateReceiptCompletion(receipt, ranges);
        if (next !== receipt) receipt.invalidated = next.invalidated;
    }
}

/** Called only on the unified draft, before persistence. Agent writes retain their own completion. */
export function invalidateChangedMaintenance(previous, next, { maintenanceWrite = false } = {}) {
    const history = next.storySummary.summaryHistory || [], oldHistory = previous.storySummary.summaryHistory || [];
    const oldEnd = previous.storySummary.lastSummarizedMesId ?? -1, end = next.storySummary.lastSummarizedMesId ?? -1;
    if (!history.some(batch => batch.maintenance?.some(receipt => receipt.completion))) return;
    if (next.storySummary.sourceInvalidFromFloor != null) invalidateCompletionRanges(history, [
        { from: next.storySummary.sourceInvalidFromFloor + 1, to: end + 1 },
    ]);
    if (maintenanceWrite || end < oldEnd) return;
    const before = memoryRecords({ json: previous.storySummary.json || {}, atoms: previous.stateAtoms });
    const after = memoryRecords({ json: next.storySummary.json || {}, atoms: next.stateAtoms });
    const old = new Map(before.map(record => [`${record.collection}:${record.key}`, record]));
    const current = new Map(after.map(record => [`${record.collection}:${record.key}`, record]));
    const oldOwner = memoryOwnership(oldHistory, oldEnd), owner = memoryOwnership(history, end);
    const appended = history.filter(batch => batch.kind === 'batch' && batch.endMesId > oldEnd);
    const affected = [];
    for (const key of new Set([...old.keys(), ...current.keys()])) {
        const a = old.get(key), b = current.get(key);
        if (sameMemory(a?.value, b?.value)) continue;
        // A new generation owns its changes, including removals, at its new boundary.
        if ((b || a).collection !== 'anchors' && appended.length) affected.push(...appended.map(batchRange));
        else affected.push(b ? owner(b).range : oldOwner(a).range);
    }
    invalidateCompletionRanges(history, affected);
}
