import { activeMaintenanceChanges } from './domain.js';
import { subtractRanges, unionRanges } from './ranges.js';

// A read projection, not another persisted status. Keep original receipts for audit.
export function projectMaintenanceResult(receipts, outcome) {
    const original = receipts.flatMap(receipt => receipt.operations);
    const operations = original.flatMap(operation => {
        const changes = activeMaintenanceChanges([operation]);
        return changes.length ? [{ ...operation, changes }] : [];
    });
    const completed = unionRanges(receipts.flatMap(receipt => receipt.completion
        ? subtractRanges([receipt.completion], receipt.invalidated || []) : []));
    const retired = original.some(operation => operation.changes.some(change => change.retired))
        || receipts.some(receipt => receipt.invalidated?.length);
    if (retired && ['completed', 'partial'].includes(outcome?.status)) {
        outcome = { ...outcome, status: operations.length || completed.length ? 'partially_superseded' : 'superseded' };
    }
    return { operations, completed, outcome };
}
