import { isTavernManagerRunLiveStatus } from '../../../shared/manager-run-liveness';
import {
    projectTavernManagerRunSummary,
    type TavernManagerRunRecord,
} from '../../../shared/session-db';

export interface TavernManagerProgressProjection {
    sessionId: string;
    runId: string;
    activityAt: number;
    tools: unknown;
}

export interface TavernManagerRunVersion {
    id: string;
    status: TavernManagerRunRecord['status'];
    updatedAt: number;
}

export function projectTavernManagerRunListItem(run: TavernManagerRunRecord): TavernManagerRunRecord {
    return projectTavernManagerRunSummary(run);
}

export function tavernManagerRunVersion(
    run: Pick<TavernManagerRunRecord, 'id' | 'status' | 'updatedAt'>,
): string {
    return `${String(run.id || '')}:${String(run.status || '')}:${Number(run.updatedAt) || 0}`;
}

export function shouldReconcileTavernManagerRun(
    run: Pick<TavernManagerRunRecord, 'status'> | null | undefined,
): boolean {
    return !!run && isTavernManagerRunLiveStatus(run.status);
}

export function findNewlyTerminalTavernManagerRunIds(input: {
    initial: boolean;
    previousActiveIds: Iterable<string>;
    previousRecentVersions: Iterable<[string, string]>;
    activeIds: Iterable<string>;
    recentRuns: TavernManagerRunVersion[];
}): string[] {
    if (input.initial) {return [];}
    const previousActiveIds = new Set(input.previousActiveIds);
    const previousRecentVersions = new Map(input.previousRecentVersions);
    const activeIds = new Set(input.activeIds);
    return [...new Set([
        ...[...previousActiveIds].filter((runId) => !activeIds.has(runId)),
        ...input.recentRuns.filter((run) => (
            !activeIds.has(run.id)
            && previousRecentVersions.get(run.id) !== tavernManagerRunVersion(run)
        )).map((run) => (
            run.id
        )),
    ])];
}

export function mergePersistedTavernManagerRunProjection(
    current: TavernManagerRunRecord,
    persisted: TavernManagerRunRecord,
): TavernManagerRunRecord {
    if (current.id !== persisted.id || current.sessionId !== persisted.sessionId) {return persisted;}
    const currentUpdatedAt = Number(current.updatedAt) || 0;
    const persistedUpdatedAt = Number(persisted.updatedAt) || 0;
    const currentLive = shouldReconcileTavernManagerRun(current);
    const persistedLive = shouldReconcileTavernManagerRun(persisted);
    if (currentUpdatedAt > persistedUpdatedAt) {
        if (currentLive && persistedLive) {
            return {
                ...current,
                leaseOwnerId: current.leaseOwnerId || persisted.leaseOwnerId,
                leaseExpiresAt: Math.max(
                    Number(current.leaseExpiresAt) || 0,
                    Number(persisted.leaseExpiresAt) || 0,
                ),
            };
        }
        return current;
    }
    if (currentUpdatedAt === persistedUpdatedAt && !currentLive && persistedLive) {return current;}
    const canKeepLiveTrace = (
        current.status === 'running'
        && persisted.status === 'running'
        && current.toolTrace !== undefined
    );
    if (!canKeepLiveTrace) {return persisted;}
    return {
        ...persisted,
        updatedAt: Math.max(Number(persisted.updatedAt) || 0, Number(current.updatedAt) || 0),
        toolTrace: current.toolTrace,
    };
}

function compareManagerRunsNewestFirst(left: TavernManagerRunRecord, right: TavernManagerRunRecord): number {
    const updatedAtDelta = Number(right.updatedAt) - Number(left.updatedAt);
    if (updatedAtDelta) {return updatedAtDelta;}
    if (left.id === right.id) {return 0;}
    return left.id < right.id ? 1 : -1;
}

export function mergeTavernManagerRunHistory(
    currentRuns: TavernManagerRunRecord[] = [],
    incomingRuns: TavernManagerRunRecord[] = [],
    settledLimit = 18,
): TavernManagerRunRecord[] {
    const selected = new Map<string, TavernManagerRunRecord>();
    currentRuns.forEach((run) => {
        if (run?.id) {selected.set(run.id, run);}
    });
    incomingRuns.forEach((run) => {
        if (!run?.id) {return;}
        const current = selected.get(run.id);
        selected.set(run.id, current
            ? mergePersistedTavernManagerRunProjection(current, run)
            : run);
    });
    const allRuns = [...selected.values()];
    const activeRuns = allRuns
        .filter((run) => shouldReconcileTavernManagerRun(run))
        .sort(compareManagerRunsNewestFirst);
    const settledRuns = allRuns
        .filter((run) => !shouldReconcileTavernManagerRun(run))
        .sort(compareManagerRunsNewestFirst)
        .slice(0, Math.max(0, Math.floor(Number(settledLimit) || 0)));
    return [...activeRuns, ...settledRuns].sort(compareManagerRunsNewestFirst);
}

export function projectTavernManagerProgress(
    current: TavernManagerRunRecord | null | undefined,
    progress: TavernManagerProgressProjection,
): TavernManagerRunRecord | null {
    if (
        !current
        || current.id !== progress.runId
        || current.sessionId !== progress.sessionId
        || !shouldReconcileTavernManagerRun(current)
    ) {return null;}
    return {
        ...current,
        status: 'running',
        updatedAt: Math.max(Number(current.updatedAt) || 0, Number(progress.activityAt) || 0),
        toolTrace: progress.tools,
    };
}
