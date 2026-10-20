import { projectMaintenanceReceipts, projectMaintenanceRun } from './history.js';
import { maintenanceRanges } from './ranges.js';
import { requireMemory } from './errors.js';

const summary = run => ({
    id: run.runId, createdAt: run.createdAt, start: run.start, cutoff: run.cutoff,
    outcome: run.outcome, summary: run.summary, completed: run.completed, counts: run.counts,
    callCount: run.calls?.length || 0,
});

/** Live status needs only completion ranges, never a projection of receipt bodies. */
export function readMaintenanceStatus({ store, state, commitState, enabled }) {
    return { automatic: structuredClone(state), automaticEnabled: enabled, persistence: commitState,
        historyValid: !store?.summaryInvalid,
        ...(store?.summaryInvalid ? { code: 'invalid_history', ranges: null }
            : { ranges: maintenanceRanges(store?.summaryHistory || [], store?.lastSummarizedMesId ?? -1) }) };
}

/**
 * Published collections are replaced on commit. Keep only derived ranges between
 * progress frames; loading/invalidation changes also invalidate their scalar keys.
 */
export function createMaintenanceStatusReader() {
    let history, cutoff, invalid, updatedAt, cached, revision = 0;
    return current => {
        const store = current.store;
        if (!cached || history !== store?.summaryHistory || cutoff !== store?.lastSummarizedMesId
            || invalid !== store?.summaryInvalid || updatedAt !== store?.updatedAt) {
            cached = readMaintenanceStatus({ ...current, state: null });
            revision++;
            history = store?.summaryHistory; cutoff = store?.lastSummarizedMesId;
            invalid = store?.summaryInvalid; updatedAt = store?.updatedAt;
        }
        return { ...cached, revision, automatic: structuredClone(current.state), automaticEnabled: current.enabled,
            persistence: current.commitState, ranges: structuredClone(cached.ranges) };
    };
}

/** Both the dashboard and model diagnostics project the same confirmed receipts. */
export function readMaintenanceDiagnostics(current, { runId, offset = 0, limit = 10 } = {}) {
    requireMemory(Number.isInteger(offset) && offset >= 0 && Number.isInteger(limit) && limit >= 1 && limit <= 20, 'invalid_arguments');
    requireMemory(runId === undefined || typeof runId === 'string', 'invalid_arguments');
    const result = readMaintenanceStatus(current);
    if (!result.historyValid) return { ...result, runs: [], total: null, next: null };
    if (!runId) {
        const page = projectMaintenanceReceipts(current.store, offset, limit, summary);
        return { ...result, total: page.total, next: page.next, runs: page.items };
    }
    const detail = projectMaintenanceRun(current.store, runId, run => {
        const calls = run.calls || [], total = Math.max(calls.length, run.operations.length);
        return { run: summary(run), calls: calls.slice(offset, offset + limit), operations: run.operations.slice(offset, offset + limit),
            totals: { calls: calls.length, operations: run.operations.length }, next: offset + limit < total ? offset + limit : null };
    });
    requireMemory(detail, 'record_missing', '', 'runId');
    return { ...result, ...detail };
}
