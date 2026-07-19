import type {
    TavernManagerMemorySnapshotRecord,
    TavernManagerRunRecord,
    TavernManagerStateSnapshotRecord,
    TavernStructuredStatePatchRecord,
} from './session-db';

export interface TavernManagerSnapshotIntegrityInput {
    runs?: TavernManagerRunRecord[];
    memorySnapshots?: TavernManagerMemorySnapshotRecord[];
    stateSnapshots?: TavernManagerStateSnapshotRecord[];
    statePatches?: TavernStructuredStatePatchRecord[];
}

function snapshotContainsUnacceptedWrite(
    snapshot: { managerRunId: string; afterHash?: string; rollbackStatus?: string },
    terminalRunIds: Set<string>,
): boolean {
    const runId = String(snapshot.managerRunId || '').trim();
    if (!runId || terminalRunIds.has(runId) || !String(snapshot.afterHash || '').trim()) {return false;}
    return !['rolled_back', 'skipped'].includes(String(snapshot.rollbackStatus || ''));
}

export function findUnacceptedTavernManagerMutationRunIds(
    input: TavernManagerSnapshotIntegrityInput = {},
): string[] {
    const runs = Array.isArray(input.runs) ? input.runs : [];
    const terminalRunIds = new Set(runs
        .filter((run) => ['completed', 'rolled_back'].includes(String(run.status || '')))
        .map((run) => String(run.id || ''))
        .filter(Boolean));
    const unsettled = new Set(runs
        .filter((run) => String(run.status || '') === 'running')
        .map((run) => String(run.id || ''))
        .filter(Boolean));

    for (const snapshot of input.memorySnapshots || []) {
        if (snapshotContainsUnacceptedWrite(snapshot, terminalRunIds)) {unsettled.add(snapshot.managerRunId);}
    }
    for (const snapshot of input.stateSnapshots || []) {
        if (snapshotContainsUnacceptedWrite(snapshot, terminalRunIds)) {unsettled.add(snapshot.managerRunId);}
    }
    for (const patch of input.statePatches || []) {
        const runId = String(patch.managerRunId || '').trim();
        if (!runId || terminalRunIds.has(runId) || String(patch.status || 'active') === 'rolled_back') {continue;}
        unsettled.add(runId);
    }
    return [...unsettled];
}

export function assertTavernManagerSnapshotStable(
    input: TavernManagerSnapshotIntegrityInput = {},
    error = 'manager_snapshot_unaccepted_writes',
): void {
    const runIds = findUnacceptedTavernManagerMutationRunIds(input);
    if (runIds.length) {throw new Error(`${error}:${runIds.join(',')}`);}
}
