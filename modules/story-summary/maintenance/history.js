import { MEMORY_COLLECTIONS, maintenanceImpact } from './domain.js';
import { requireMemory } from './errors.js';
import { isMemoryPolicy } from '../data/memory-policy.js';
import { subtractRanges, unionRanges } from './ranges.js';

export function validateMaintenanceReceipt(receipt) {
    requireMemory(receipt?.version === 2 && typeof receipt.id === 'string' && typeof receipt.runId === 'string'
        && Array.isArray(receipt.operations) && Array.isArray(receipt.coverage?.supplied)
        && Array.isArray(receipt.coverage?.missingAnchors), 'invalid_history');
    requireMemory(isMemoryPolicy(receipt.policy), 'invalid_history');
    if (receipt.outcome) requireMemory(['completed', 'partial', 'cancelled', 'failed', 'turn_limit', 'input_limit', 'interrupted'].includes(receipt.outcome.status), 'invalid_history');
    if (receipt.completion) {
        const validRange = range => Number.isInteger(range?.from) && Number.isInteger(range?.to)
            && range.from >= 1 && range.to >= range.from && range.to <= receipt.cutoff;
        requireMemory(validRange(receipt.completion) && receipt.operations.length === 0 && !receipt.outcome, 'invalid_history');
        requireMemory(receipt.invalidated === undefined || (Array.isArray(receipt.invalidated) && receipt.invalidated.every(range =>
            validRange(range) && range.from >= receipt.completion.from && range.to <= receipt.completion.to)), 'invalid_history');
    } else requireMemory(receipt.invalidated === undefined, 'invalid_history');
    for (const operation of receipt.operations) {
        requireMemory(['edit', 'delete', 'merge'].includes(operation.kind) && Array.isArray(operation.changes), 'invalid_history');
        for (const change of operation.changes) {
            requireMemory(MEMORY_COLLECTIONS.includes(change.collection) && typeof change.key === 'string'
                && Number.isInteger(change.index) && Object.hasOwn(change, 'before') && Object.hasOwn(change, 'after'), 'invalid_history');
            if (change.retired) requireMemory(change.collection === 'anchors'
                && ['source_changed', 'anchors_cleared'].includes(change.retired.reason) && Number.isFinite(change.retired.at), 'invalid_history');
        }
    }
    return receipt;
}

/** Load-only cleanup of retained receipts: v1 batch metadata and the former mode field. Remove after these files migrate. */
export function upgradeMaintenanceReceipt(receipt) {
    const current = { ...receipt };
    delete current.mode;
    if (current.version === 2) return validateMaintenanceReceipt(current);
    requireMemory(receipt?.version === 1 && Array.isArray(receipt.coverage?.scope)
        && Array.isArray(receipt.coverage?.targets) && Array.isArray(receipt.coverage?.unfinished), 'invalid_history');
    const { coverage, calls, ...kept } = current;
    delete kept.part;
    delete kept.completion;
    return validateMaintenanceReceipt({ ...kept, version: 2,
        coverage: { supplied: coverage.supplied, missingAnchors: coverage.missingAnchors },
        ...(calls ? { calls: calls.map(({ package: _package, ...call }) => call) } : {}) });
}

export function maintenanceHistoryImpact(store) {
    return maintenanceImpact((store?.summaryHistory || []).flatMap(batch => batch.maintenance || []).flatMap(receipt => receipt.operations));
}

export function projectMaintenanceReceipts(store, offset = 0, limit = 10) {
    const all = (store?.summaryHistory || []).flatMap(batch => batch.maintenance || []).reverse();
    const groups = new Map();
    for (const receipt of all) {
        const group = groups.get(receipt.runId) || [];
        group.push(receipt); groups.set(receipt.runId, group);
    }
    const runs = [...groups].map(([runId, receipts]) => {
        const latest = receipts[0], operations = [...receipts].reverse().flatMap(receipt => receipt.operations);
        return { ...latest, id: runId, receiptId: latest.id, receiptIds: receipts.map(receipt => receipt.id),
            // A run's report is its concluding reply, never the notes attached to edits.
            operations, summary: receipts.find(receipt => receipt.outcome)?.summary || '',
            completed: unionRanges(receipts.flatMap(receipt => receipt.completion ? subtractRanges([receipt.completion], receipt.invalidated || []) : [])),
            outcome: latest.outcome || { status: 'interrupted' },
            coverage: {
                supplied: [...new Map(receipts.flatMap(receipt => receipt.coverage.supplied).map(item => [JSON.stringify(item), item])).values()],
                missingAnchors: [...new Map(receipts.flatMap(receipt => receipt.coverage.missingAnchors).map(item => [item.floor, item])).values()] },
            counts: {
                summary: operations.filter(operation => operation.kind !== 'merge' && maintenanceImpact([operation]).summary).length,
                anchors: operations.filter(operation => operation.changes.some(change => change.collection === 'anchors')).length,
                merges: operations.filter(operation => operation.kind === 'merge').length,
            } };
    });
    return { total: runs.length, runIds: runs.map(run => run.id),
        next: offset + limit < runs.length ? offset + limit : null, items: runs.slice(offset, offset + limit) };
}
