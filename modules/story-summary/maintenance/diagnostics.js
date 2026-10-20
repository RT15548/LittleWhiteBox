import { projectMaintenanceReceipts } from './history.js';
import { maintenanceRanges } from './ranges.js';
import { requireMemory } from './errors.js';

const summary = run => ({
    id: run.runId, createdAt: run.createdAt, start: run.start, cutoff: run.cutoff,
    outcome: run.outcome, summary: run.summary, completed: run.completed, counts: run.counts,
    callCount: run.calls?.length || 0,
});

/** Both the dashboard and model diagnostics project the same confirmed receipts. */
export function readMaintenanceDiagnostics({ store, state, commitState, enabled }, { runId, offset = 0, limit = 10 } = {}) {
    requireMemory(Number.isInteger(offset) && offset >= 0 && Number.isInteger(limit) && limit >= 1 && limit <= 20, 'invalid_arguments');
    requireMemory(runId === undefined || typeof runId === 'string', 'invalid_arguments');
    const history = store?.summaryHistory || [];
    if (store?.summaryInvalid) {
        return { automatic: state, automaticEnabled: enabled, persistence: commitState,
            historyValid: false, code: 'invalid_history', ranges: null, runs: [], total: null, next: null };
    }
    const result = { automatic: state, automaticEnabled: enabled, persistence: commitState,
        historyValid: !store?.summaryInvalid,
        ranges: maintenanceRanges(history, store?.lastSummarizedMesId ?? -1) };
    if (!runId) {
        const page = projectMaintenanceReceipts(store, offset, limit);
        return { ...result, total: page.total, next: page.next, runs: page.items.map(summary) };
    }
    const all = projectMaintenanceReceipts(store, 0, history.reduce((count, batch) => count + (batch.maintenance?.length || 0), 0));
    const run = all.items.find(item => item.runId === runId);
    requireMemory(run, 'record_missing', '', 'runId');
    const calls = run.calls || [], total = Math.max(calls.length, run.operations.length);
    return { ...result, run: summary(run), calls: calls.slice(offset, offset + limit),
        operations: run.operations.slice(offset, offset + limit),
        totals: { calls: calls.length, operations: run.operations.length }, next: offset + limit < total ? offset + limit : null };
}
