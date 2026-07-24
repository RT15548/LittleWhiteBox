import Dexie from '../../../../../libs/dexie.mjs';
import { onScopeDispose, watch, type Ref, type ShallowRef } from 'vue';
import db, {
    getTavernManagerRun,
    listTavernManagerRunSummaries,
    tavernManagerRunsTable,
    type TavernManagerRunRecord,
} from '../../../shared/session-db';
import { isTavernManagerRunLiveStatus } from '../../../shared/manager-run-liveness';
import {
    findNewlyTerminalTavernManagerRunIds,
    mergeTavernManagerRunHistory,
    projectTavernManagerRunListItem,
    projectTavernManagerProgress,
    tavernManagerRunVersion,
    type TavernManagerProgressProjection,
    type TavernManagerRunVersion,
} from './manager-run-sync';

interface DexieLiveQuerySubscription {
    unsubscribe(): void;
}

interface DexieLiveQueryObservable<T> {
    subscribe(observer: {
        next(value: T): void;
        error?(error: unknown): void;
    }): DexieLiveQuerySubscription;
}

const runLiveQuery = (Dexie as unknown as {
    liveQuery<T>(querier: () => T | Promise<T>): DexieLiveQueryObservable<T>;
}).liveQuery;

interface ManagerRunRangeCollection<T> {
    reverse(): ManagerRunRangeCollection<T>;
    limit(count: number): ManagerRunRangeCollection<T>;
    toArray(): Promise<T[]>;
    primaryKeys(): Promise<unknown[]>;
    keys(): Promise<unknown[]>;
}

interface ManagerRunRangeTable<T> {
    where(index: string): {
        between(lower: unknown, upper: unknown, includeLower?: boolean, includeUpper?: boolean): ManagerRunRangeCollection<T>;
    };
}

interface TavernManagerRunSyncSnapshot {
    sessionId: string;
    activeRuns: TavernManagerRunRecord[];
    recentRuns: TavernManagerRunVersion[];
}

interface TavernManagerRunSyncOptions {
    selectedSessionId: Ref<string>;
    managerRuns: ShallowRef<TavernManagerRunRecord[]>;
    managerStatusClock: Ref<number>;
    refreshSettledDomains: (sessionId: string, run: TavernManagerRunRecord) => Promise<void>;
    kickWorker: (sessionId: string) => void;
    onTerminalRefreshFailure?: (run: TavernManagerRunRecord, error: unknown) => void;
    settledLimit?: number;
}

interface TerminalRefreshPending {
    run: TavernManagerRunRecord;
    version: string;
    retryIndex: number;
    running: boolean;
    timer: number | null;
}

const RECENT_MANAGER_RUN_KEY_LIMIT = 24;
const TERMINAL_REFRESH_RETRY_DELAYS_MS = [1000, 3000, 8000] as const;
const TERMINAL_MANAGER_RUN_STATUSES = [
    'completed',
    'failed',
    'cancelled',
    'superseded',
] as const satisfies ReadonlyArray<TavernManagerRunRecord['status']>;

function normalizeSessionId(value = ''): string {
    return String(value || '').trim();
}

function compareActiveRuns(left: TavernManagerRunRecord, right: TavernManagerRunRecord): number {
    if (left.status !== right.status) {return left.status === 'running' ? -1 : 1;}
    return Number(left.assistantOrder) - Number(right.assistantOrder)
        || Number(left.createdAt) - Number(right.createdAt)
        || String(left.id).localeCompare(String(right.id));
}

async function readManagerRunSyncSnapshot(sessionId: string): Promise<TavernManagerRunSyncSnapshot> {
    const table = tavernManagerRunsTable as unknown as ManagerRunRangeTable<TavernManagerRunRecord>;
    const statusRange = (status: 'queued' | 'running') => table
        .where('[sessionId+status+updatedAt]')
        .between(
            [sessionId, status, 0],
            [sessionId, status, Number.MAX_SAFE_INTEGER],
            true,
            true,
        )
        .toArray();
    return await db.transaction('r', tavernManagerRunsTable, async () => {
        const recentRange = () => table
            .where('[sessionId+updatedAt]')
            .between([sessionId, 0], [sessionId, Number.MAX_SAFE_INTEGER], true, true)
            .reverse()
            .limit(RECENT_MANAGER_RUN_KEY_LIMIT);
        const terminalStatusKeys = (status: typeof TERMINAL_MANAGER_RUN_STATUSES[number]) => table
            .where('[sessionId+status+updatedAt]')
            .between(
                [sessionId, status, 0],
                [sessionId, status, Number.MAX_SAFE_INTEGER],
                true,
                true,
            )
            .reverse()
            .limit(RECENT_MANAGER_RUN_KEY_LIMIT)
            .primaryKeys();
        const [queued, running, recentPrimaryKeys, recentIndexKeys, ...terminalKeyGroups] = await Promise.all([
            statusRange('queued'),
            statusRange('running'),
            recentRange().primaryKeys(),
            recentRange().keys(),
            ...TERMINAL_MANAGER_RUN_STATUSES.map(terminalStatusKeys),
        ]);
        const statusById = new Map<string, TavernManagerRunRecord['status']>();
        [...queued, ...running].forEach((run) => statusById.set(run.id, run.status));
        TERMINAL_MANAGER_RUN_STATUSES.forEach((status, index) => {
            (terminalKeyGroups[index] || []).forEach((key) => statusById.set(String(key || ''), status));
        });
        const recentRuns = recentPrimaryKeys.map((key, index) => {
            const id = String(key || '');
            const status = statusById.get(id);
            const indexKey = recentIndexKeys[index];
            const updatedAt = Array.isArray(indexKey) ? Number(indexKey[1]) || 0 : 0;
            return id && status ? { id, status, updatedAt } : null;
        }).filter((run): run is TavernManagerRunVersion => !!run);
        return {
            sessionId,
            activeRuns: [...running, ...queued].sort(compareActiveRuns),
            recentRuns,
        };
    });
}

export function useTavernManagerRunSync(options: TavernManagerRunSyncOptions) {
    const settledLimit = Math.max(1, Math.floor(Number(options.settledLimit) || 18));
    let subscription: DexieLiveQuerySubscription | null = null;
    let subscriptionGeneration = 0;
    let subscriptionQueue = Promise.resolve();
    let observedActiveIds = new Set<string>();
    let observedRecentVersions = new Map<string, string>();
    let historyHydratedSessionId = '';
    let historyRefreshSerial = 0;
    let fallbackRefreshRunning = false;
    let clockTimer: number | null = null;
    const terminalRefreshDone = new Map<string, string>();
    const terminalRefreshPending = new Map<string, TerminalRefreshPending>();

    function currentSessionId(): string {
        return normalizeSessionId(options.selectedSessionId.value);
    }

    function clearTerminalRefreshState(runId = ''): void {
        const id = String(runId || '').trim();
        if (!id) {return;}
        terminalRefreshDone.delete(id);
        const pending = terminalRefreshPending.get(id);
        if (pending?.timer !== null) {window.clearTimeout(pending.timer);}
        terminalRefreshPending.delete(id);
    }

    function clearAllTerminalRefreshState(): void {
        terminalRefreshPending.forEach((pending) => {
            if (pending.timer !== null) {window.clearTimeout(pending.timer);}
        });
        terminalRefreshPending.clear();
        terminalRefreshDone.clear();
    }

    function applyRun(run: TavernManagerRunRecord): TavernManagerRunRecord | null {
        if (!run?.id || run.sessionId !== currentSessionId()) {return null;}
        const projected = projectTavernManagerRunListItem(run);
        options.managerRuns.value = mergeTavernManagerRunHistory(
            options.managerRuns.value,
            [projected],
            settledLimit,
        );
        return options.managerRuns.value.find((item) => item.id === run.id) || null;
    }

    function runTerminalRefresh(runId: string): void {
        const pending = terminalRefreshPending.get(runId);
        if (!pending || pending.running || pending.run.sessionId !== currentSessionId()) {return;}
        pending.running = true;
        pending.timer = null;
        void options.refreshSettledDomains(pending.run.sessionId, pending.run)
            .then(() => {
                if (terminalRefreshPending.get(runId) !== pending) {return;}
                terminalRefreshPending.delete(runId);
                terminalRefreshDone.set(runId, pending.version);
            })
            .catch((error) => {
                if (terminalRefreshPending.get(runId) !== pending) {return;}
                const delay = TERMINAL_REFRESH_RETRY_DELAYS_MS[pending.retryIndex];
                if (delay === undefined) {
                    terminalRefreshPending.delete(runId);
                    options.onTerminalRefreshFailure?.(pending.run, error);
                    return;
                }
                pending.retryIndex += 1;
                pending.timer = window.setTimeout(() => runTerminalRefresh(runId), delay);
            })
            .finally(() => {
                if (terminalRefreshPending.get(runId) === pending) {pending.running = false;}
            });
    }

    function queueTerminalRefresh(run: TavernManagerRunRecord): void {
        const version = tavernManagerRunVersion(run);
        if (terminalRefreshDone.get(run.id) === version) {return;}
        const existing = terminalRefreshPending.get(run.id);
        if (existing?.version === version) {
            existing.run = run;
            return;
        }
        if (existing?.timer !== null) {window.clearTimeout(existing.timer);}
        const pending: TerminalRefreshPending = {
            run,
            version,
            retryIndex: 0,
            running: false,
            timer: null,
        };
        terminalRefreshPending.set(run.id, pending);
        runTerminalRefresh(run.id);
    }

    function acceptSavedRun(sessionId: string, run: TavernManagerRunRecord): void {
        const id = normalizeSessionId(sessionId);
        if (!id || id !== currentSessionId() || run.sessionId !== id) {return;}
        const applied = applyRun(run);
        if (!applied) {return;}
        if (isTavernManagerRunLiveStatus(applied.status)) {
            clearTerminalRefreshState(applied.id);
            return;
        }
        queueTerminalRefresh(applied);
    }

    function acceptProgress(progress: TavernManagerProgressProjection): void {
        if (progress.sessionId !== currentSessionId()) {return;}
        const existing = options.managerRuns.value.find((run) => run.id === progress.runId);
        const projected = projectTavernManagerProgress(existing, progress);
        if (!projected) {return;}
        options.managerRuns.value = mergeTavernManagerRunHistory(
            options.managerRuns.value,
            [projected],
            settledLimit,
        );
    }

    async function applySnapshot(snapshot: TavernManagerRunSyncSnapshot, initial: boolean, generation: number): Promise<void> {
        if (generation !== subscriptionGeneration || snapshot.sessionId !== currentSessionId()) {return;}
        const nextActiveIds = new Set(snapshot.activeRuns.map((run) => run.id));
        const nextRecentVersions = new Map(snapshot.recentRuns.map((run) => [
            run.id,
            tavernManagerRunVersion(run),
        ]));
        const disappearedActiveIds = [...observedActiveIds].filter((runId) => !nextActiveIds.has(runId));
        const terminalIds = findNewlyTerminalTavernManagerRunIds({
            initial,
            previousActiveIds: observedActiveIds,
            previousRecentVersions: observedRecentVersions,
            activeIds: nextActiveIds,
            recentRuns: snapshot.recentRuns,
        });
        const shouldKickWorker = snapshot.activeRuns.some((run) => (
            initial || !observedActiveIds.has(run.id)
        )) || (disappearedActiveIds.length > 0 && snapshot.activeRuns.some((run) => run.status === 'queued'));
        snapshot.activeRuns.forEach((run) => acceptSavedRun(snapshot.sessionId, run));
        if (shouldKickWorker) {options.kickWorker(snapshot.sessionId);}
        if (terminalIds.length) {
            const terminalRuns = await Promise.all(terminalIds.map((runId) => getTavernManagerRun(runId)));
            if (generation !== subscriptionGeneration || snapshot.sessionId !== currentSessionId()) {return;}
            terminalRuns.forEach((run) => {
                if (run && !isTavernManagerRunLiveStatus(run.status)) {
                    acceptSavedRun(snapshot.sessionId, run);
                }
            });
        }
        observedActiveIds = nextActiveIds;
        observedRecentVersions = nextRecentVersions;
    }

    function stopSubscription(): void {
        subscriptionGeneration += 1;
        subscription?.unsubscribe();
        subscription = null;
        subscriptionQueue = Promise.resolve();
        observedActiveIds = new Set<string>();
        observedRecentVersions = new Map<string, string>();
        historyHydratedSessionId = '';
        historyRefreshSerial += 1;
        clearAllTerminalRefreshState();
    }

    function startSubscription(value = ''): void {
        stopSubscription();
        const sessionId = normalizeSessionId(value);
        options.managerRuns.value = [];
        if (!sessionId) {return;}
        const generation = subscriptionGeneration;
        let initial = true;
        subscription = runLiveQuery(() => readManagerRunSyncSnapshot(sessionId)).subscribe({
            next: (snapshot) => {
                const isInitial = initial;
                initial = false;
                subscriptionQueue = subscriptionQueue
                    .then(() => applySnapshot(snapshot, isInitial, generation))
                    .catch((error) => {
                        console.warn('[LittleWhiteBox/tavern] manager run live sync failed', error);
                    });
            },
            error: (error) => console.warn('[LittleWhiteBox/tavern] manager run live query failed', error),
        });
    }

    async function hydrate(sessionId = currentSessionId()): Promise<void> {
        const id = normalizeSessionId(sessionId);
        const requestSerial = ++historyRefreshSerial;
        if (!id) {
            options.managerRuns.value = [];
            return;
        }
        const runs = await listTavernManagerRunSummaries(id, { settledLimit });
        if (requestSerial !== historyRefreshSerial || id !== currentSessionId()) {return;}
        options.managerRuns.value = mergeTavernManagerRunHistory(
            options.managerRuns.value.filter((run) => isTavernManagerRunLiveStatus(run.status)),
            runs,
            settledLimit,
        );
        runs.forEach((run) => {
            if (isTavernManagerRunLiveStatus(run.status)) {clearTerminalRefreshState(run.id);}
        });
        historyHydratedSessionId = id;
        observedActiveIds = new Set([
            ...observedActiveIds,
            ...runs.filter((run) => isTavernManagerRunLiveStatus(run.status)).map((run) => run.id),
        ]);
        runs.forEach((run) => observedRecentVersions.set(run.id, tavernManagerRunVersion(run)));
        if (runs.some((run) => isTavernManagerRunLiveStatus(run.status))) {options.kickWorker(id);}
    }

    async function reconcileHistory(): Promise<void> {
        const id = currentSessionId();
        if (!id || fallbackRefreshRunning) {return;}
        fallbackRefreshRunning = true;
        try {
            const generation = subscriptionGeneration;
            const snapshot = await readManagerRunSyncSnapshot(id);
            if (id !== currentSessionId()) {return;}
            const useAsBaseline = historyHydratedSessionId !== id && !options.managerRuns.value.length;
            await applySnapshot(snapshot, useAsBaseline, generation);
        } catch (error) {
            console.warn('[LittleWhiteBox/tavern] manager run fallback sync failed', error);
        } finally {
            fallbackRefreshRunning = false;
        }
    }

    function syncClockTimer(active: boolean): void {
        if (!active) {
            if (clockTimer !== null) {window.clearInterval(clockTimer);}
            clockTimer = null;
            return;
        }
        options.managerStatusClock.value = Date.now();
        if (clockTimer !== null) {return;}
        clockTimer = window.setInterval(() => {
            options.managerStatusClock.value = Date.now();
        }, 1000);
    }

    function handleVisibilityFallback(): void {
        if (document.visibilityState === 'hidden') {return;}
        void reconcileHistory();
    }

    watch(options.selectedSessionId, startSubscription, { immediate: true });
    watch(
        () => options.managerRuns.value.some((run) => isTavernManagerRunLiveStatus(run.status)),
        syncClockTimer,
        { immediate: true },
    );
    window.addEventListener('focus', handleVisibilityFallback);
    window.addEventListener('pageshow', handleVisibilityFallback);
    document.addEventListener('visibilitychange', handleVisibilityFallback);
    onScopeDispose(() => {
        stopSubscription();
        syncClockTimer(false);
        window.removeEventListener('focus', handleVisibilityFallback);
        window.removeEventListener('pageshow', handleVisibilityFallback);
        document.removeEventListener('visibilitychange', handleVisibilityFallback);
    });

    return {
        acceptProgress,
        acceptSavedRun,
        hydrate,
        reconcileHistory,
    };
}
