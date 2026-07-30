import Dexie from '../../../../../libs/dexie.mjs';
import { onScopeDispose, watch, type Ref } from 'vue';
import { TAVERN_PLAYER_ACCOUNT_ID } from '../../../shared/economy/economy-types';
import db, {
    tavernBankStateVersionsTable,
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernPetActionsTable,
    tavernPetCompanionTable,
    tavernSessionsTable,
    tavernShopStateVersionsTable,
    tavernTaskBoardsTable,
    tavernTaskVersionsTable,
} from '../../../shared/session-db';
import { TAVERN_TASK_CURRENT_MARKER } from '../../../shared/tasks/task-types';
import { TAVERN_SHOP_CURRENT_MARKER } from '../../../shared/shop/shop-types';
import {
    TAVERN_BANK_CURRENT_MARKER,
    type TavernBankStateVersionRecord,
} from '../../../shared/bank/bank-types';
import {
    TAVERN_PET_COMPANION_ID,
    type TavernPetActionRecord,
} from '../../../shared/pet/pet-types';

interface TavernPhoneDomainSyncOptions {
    selectedSessionId: Ref<string>;
    onTasksChanged: () => void | Promise<void>;
    onEconomyChanged: () => void | Promise<void>;
    onShopChanged: () => void | Promise<void>;
    onBankChanged: (change: TavernBankDomainChange) => void | Promise<void>;
    onPetChanged: (change: TavernPetDomainChange) => void | Promise<void>;
}

export interface TavernBankDomainChange {
    sessionId: string;
    settledPositionIds: string[];
}

export interface TavernPetDomainChange {
    journalIds: string[];
}

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

interface LatestLedgerCollection {
    reverse(): LatestLedgerCollection;
    first(): Promise<{ id: string; ledgerOrder: number } | undefined>;
}

interface LatestLedgerTable {
    where(index: string): {
        between(lower: unknown, upper: unknown, includeLower?: boolean, includeUpper?: boolean): LatestLedgerCollection;
    };
}

interface BankVersionRangeTable {
    where(index: string): {
        between(
            lower: unknown,
            upper: unknown,
            includeLower?: boolean,
            includeUpper?: boolean,
        ): { toArray(): Promise<TavernBankStateVersionRecord[]> };
    };
}

function normalizeSessionId(value = ''): string {
    return String(value || '').trim();
}

async function taskDomainFingerprint(sessionId: string): Promise<string> {
    return await db.transaction('r', tavernSessionsTable, tavernTaskBoardsTable, tavernTaskVersionsTable, async () => {
        const [session, board, currentTasks] = await Promise.all([
            tavernSessionsTable.get(sessionId),
            tavernTaskBoardsTable.get(sessionId),
            tavernTaskVersionsTable
                .where('[sessionId+currentMarker]')
                .equals([sessionId, TAVERN_TASK_CURRENT_MARKER])
                .toArray(),
        ]);
        const versions = currentTasks
            .map((task) => `${task.taskId}:${task.revision}:${task.versionId}`)
            .sort();
        return JSON.stringify([
            session?.id ? 1 : 0,
            Number(session?.taskBoardEpoch) || 1,
            board?.generationId || '',
            Number(board?.revision) || 0,
            Number(board?.epoch) || 0,
            versions,
        ]);
    });
}

async function economyDomainFingerprint(sessionId: string): Promise<string> {
    return await db.transaction('r', tavernEconomyAccountsTable, tavernEconomyTransactionsTable, async () => {
        const [player, transactionCount, latest] = await Promise.all([
            tavernEconomyAccountsTable.get([sessionId, TAVERN_PLAYER_ACCOUNT_ID]),
            tavernEconomyTransactionsTable.where('sessionId').equals(sessionId).count(),
            (tavernEconomyTransactionsTable as unknown as LatestLedgerTable)
                .where('[sessionId+ledgerOrder]')
                .between([sessionId, 0], [sessionId, Number.MAX_SAFE_INTEGER], true, true)
                .reverse()
                .first(),
        ]);
        return JSON.stringify([
            player?.balance ?? null,
            transactionCount,
            latest?.ledgerOrder ?? -1,
            latest?.id || '',
        ]);
    });
}

async function shopDomainFingerprint(sessionId: string): Promise<string> {
    return await db.transaction('r', tavernSessionsTable, tavernShopStateVersionsTable, async () => {
        const [session, rows] = await Promise.all([
            tavernSessionsTable.get(sessionId),
            tavernShopStateVersionsTable
                .where('[sessionId+currentMarker]')
                .equals([sessionId, TAVERN_SHOP_CURRENT_MARKER])
                .toArray(),
        ]);
        const current = rows[0];
        return JSON.stringify([
            session?.id ? 1 : 0,
            Number(session?.state?.turn) || 0,
            current?.revision || 0,
            current?.versionId || '',
        ]);
    });
}

interface TavernBankDomainSnapshot {
    fingerprint: string;
    revision: number;
    versionId: string;
}

async function bankDomainFingerprint(sessionId: string): Promise<TavernBankDomainSnapshot> {
    return await db.transaction('r', tavernSessionsTable, tavernBankStateVersionsTable, async () => {
        const [session, rows] = await Promise.all([
            tavernSessionsTable.get(sessionId),
            tavernBankStateVersionsTable
                .where('[sessionId+currentMarker]')
                .equals([sessionId, TAVERN_BANK_CURRENT_MARKER])
                .toArray(),
        ]);
        const current = rows[0];
        const revision = current?.revision || 0;
        const versionId = current?.versionId || '';
        return {
            fingerprint: JSON.stringify([
                session?.id ? 1 : 0,
                Number(session?.state?.turn) || 0,
                revision,
                versionId,
            ]),
            revision,
            versionId,
        };
    });
}

interface TavernPetDomainSnapshot {
    fingerprint: string;
    revision: number;
    versionId: string;
}

async function petDomainFingerprint(): Promise<TavernPetDomainSnapshot> {
    return await db.transaction(
        'r',
        tavernPetCompanionTable,
        async () => {
            const current = await tavernPetCompanionTable.get(TAVERN_PET_COMPANION_ID);
            const revision = Number(current?.revision) || 0;
            const versionId = current?.versionId || '';
            return {
                fingerprint: JSON.stringify([
                    revision,
                    versionId,
                ]),
                revision,
                versionId,
            };
        },
    );
}

async function bankSettledPositionIdsBetween(input: {
    sessionId: string;
    previousRevision: number;
    previousVersionId: string;
    nextRevision: number;
}): Promise<string[]> {
    if (input.nextRevision <= input.previousRevision) {return [];}
    if (input.previousRevision === 0 && input.nextRevision !== 1) {return [];}
    return await db.transaction('r', tavernBankStateVersionsTable, async () => {
        if (input.previousRevision > 0) {
            const previous = await tavernBankStateVersionsTable.get([input.sessionId, input.previousRevision]);
            if (!previous || previous.versionId !== input.previousVersionId) {return [];}
        }
        const rows = await (tavernBankStateVersionsTable as unknown as BankVersionRangeTable)
            .where('[sessionId+revision]')
            .between(
                [input.sessionId, input.previousRevision + 1],
                [input.sessionId, input.nextRevision],
                true,
                true,
            )
            .toArray();
        return [...new Set(rows.flatMap((row) => row.action.settledPositionIds || []))];
    });
}

async function petJournalIdsBetween(input: {
    previousRevision: number;
    nextRevision: number;
}): Promise<string[]> {
    if (input.nextRevision <= input.previousRevision) {return [];}
    if (input.previousRevision === 0 && input.nextRevision !== 1) {return [];}
    return await db.transaction('r', tavernPetActionsTable, async () => {
        const revisions = Array.from(
            { length: input.nextRevision - input.previousRevision },
            (_, index) => input.previousRevision + index + 1,
        );
        const rows = await Promise.all(revisions.map(async (revision) => (
            await tavernPetActionsTable.where('revision').equals(revision).first()
        )));
        const ordered = rows.filter((row): row is TavernPetActionRecord => Boolean(row));
        const expectedCount = input.nextRevision - input.previousRevision;
        if (ordered.length !== expectedCount
            || ordered.some((row, index) => row.revision !== input.previousRevision + index + 1)
        ) {
            return [];
        }
        return [...new Set(ordered.flatMap((row) => row.activityId ? [row.activityId] : []))];
    });
}

function createRefreshScheduler(
    label: 'Task' | 'Economy' | 'Shop' | 'Bank',
    callback: () => void | Promise<void>,
) {
    let running = false;
    let requested = false;
    return () => {
        requested = true;
        if (running) {return;}
        running = true;
        void (async () => {
            try {
                while (requested) {
                    requested = false;
                    try {
                        await callback();
                    } catch (error) {
                        console.warn(`[LittleWhiteBox/tavern] ${label} domain refresh failed`, error);
                    }
                }
            } finally {
                running = false;
            }
        })();
    };
}

function createBankRefreshScheduler(
    callback: (change: TavernBankDomainChange) => void | Promise<void>,
) {
    let running = false;
    let pendingSessionId = '';
    const pendingPositionIds = new Set<string>();
    return (change: TavernBankDomainChange) => {
        if (pendingSessionId && pendingSessionId !== change.sessionId) {
            pendingPositionIds.clear();
        }
        pendingSessionId = change.sessionId;
        change.settledPositionIds.forEach((positionId) => pendingPositionIds.add(positionId));
        if (running) {return;}
        running = true;
        void (async () => {
            try {
                while (pendingSessionId) {
                    const next: TavernBankDomainChange = {
                        sessionId: pendingSessionId,
                        settledPositionIds: [...pendingPositionIds],
                    };
                    pendingSessionId = '';
                    pendingPositionIds.clear();
                    try {
                        await callback(next);
                    } catch (error) {
                        console.warn('[LittleWhiteBox/tavern] Bank domain refresh failed', error);
                    }
                }
            } finally {
                running = false;
            }
        })();
    };
}

function createPetRefreshScheduler(
    callback: (change: TavernPetDomainChange) => void | Promise<void>,
) {
    let running = false;
    let requested = false;
    const pendingJournalIds = new Set<string>();
    return (change: TavernPetDomainChange) => {
        change.journalIds.forEach((journalId) => pendingJournalIds.add(journalId));
        requested = true;
        if (running) {return;}
        running = true;
        void (async () => {
            try {
                while (requested) {
                    requested = false;
                    const next: TavernPetDomainChange = {
                        journalIds: [...pendingJournalIds],
                    };
                    pendingJournalIds.clear();
                    try {
                        await callback(next);
                    } catch (error) {
                        console.warn('[LittleWhiteBox/tavern] Pet domain refresh failed', error);
                    }
                }
            } finally {
                running = false;
            }
        })();
    };
}

export function useTavernPhoneDomainSync(options: TavernPhoneDomainSyncOptions): void {
    let subscriptions: DexieLiveQuerySubscription[] = [];
    let generation = 0;
    const scheduleTaskRefresh = createRefreshScheduler('Task', options.onTasksChanged);
    const scheduleEconomyRefresh = createRefreshScheduler('Economy', options.onEconomyChanged);
    const scheduleShopRefresh = createRefreshScheduler('Shop', options.onShopChanged);
    const scheduleBankRefresh = createBankRefreshScheduler(options.onBankChanged);
    const schedulePetRefresh = createPetRefreshScheduler(options.onPetChanged);

    function stopSubscriptions(): void {
        generation += 1;
        subscriptions.forEach((subscription) => subscription.unsubscribe());
        subscriptions = [];
    }

    function startSubscriptions(value = ''): void {
        stopSubscriptions();
        const sessionId = normalizeSessionId(value);
        if (!sessionId) {return;}
        const currentGeneration = generation;
        let taskFingerprint: string | null = null;
        let economyFingerprint: string | null = null;
        let shopFingerprint: string | null = null;
        let bankSnapshot: TavernBankDomainSnapshot | null = null;
        let petSnapshot: TavernPetDomainSnapshot | null = null;
        let bankChangeQueue = Promise.resolve();
        let petChangeQueue = Promise.resolve();
        subscriptions = [
            runLiveQuery(() => taskDomainFingerprint(sessionId)).subscribe({
                next: (nextFingerprint) => {
                    if (currentGeneration !== generation) {return;}
                    if (taskFingerprint === null) {
                        taskFingerprint = nextFingerprint;
                        return;
                    }
                    if (nextFingerprint === taskFingerprint) {return;}
                    taskFingerprint = nextFingerprint;
                    scheduleTaskRefresh();
                },
                error: (error) => console.warn('[LittleWhiteBox/tavern] Task domain sync failed', error),
            }),
            runLiveQuery(() => economyDomainFingerprint(sessionId)).subscribe({
                next: (nextFingerprint) => {
                    if (currentGeneration !== generation) {return;}
                    if (economyFingerprint === null) {
                        economyFingerprint = nextFingerprint;
                        return;
                    }
                    if (nextFingerprint === economyFingerprint) {return;}
                    economyFingerprint = nextFingerprint;
                    scheduleEconomyRefresh();
                },
                error: (error) => console.warn('[LittleWhiteBox/tavern] Economy domain sync failed', error),
            }),
            runLiveQuery(() => shopDomainFingerprint(sessionId)).subscribe({
                next: (nextFingerprint) => {
                    if (currentGeneration !== generation) {return;}
                    if (shopFingerprint === null) {
                        shopFingerprint = nextFingerprint;
                        return;
                    }
                    if (nextFingerprint === shopFingerprint) {return;}
                    shopFingerprint = nextFingerprint;
                    scheduleShopRefresh();
                },
                error: (error) => console.warn('[LittleWhiteBox/tavern] Shop domain sync failed', error),
            }),
            runLiveQuery(() => bankDomainFingerprint(sessionId)).subscribe({
                next: (nextSnapshot) => {
                    if (currentGeneration !== generation) {return;}
                    const previousSnapshot = bankSnapshot;
                    bankSnapshot = nextSnapshot;
                    if (!previousSnapshot || nextSnapshot.fingerprint === previousSnapshot.fingerprint) {return;}
                    bankChangeQueue = bankChangeQueue
                        .then(async () => {
                            const settledPositionIds = await bankSettledPositionIdsBetween({
                                sessionId,
                                previousRevision: previousSnapshot.revision,
                                previousVersionId: previousSnapshot.versionId,
                                nextRevision: nextSnapshot.revision,
                            });
                            if (currentGeneration !== generation) {return;}
                            scheduleBankRefresh({ sessionId, settledPositionIds });
                        })
                        .catch((error) => {
                            console.warn('[LittleWhiteBox/tavern] Bank settlement sync failed', error);
                        });
                },
                error: (error) => console.warn('[LittleWhiteBox/tavern] Bank domain sync failed', error),
            }),
            runLiveQuery(() => petDomainFingerprint()).subscribe({
                next: (nextSnapshot) => {
                    if (currentGeneration !== generation) {return;}
                    const previousSnapshot = petSnapshot;
                    petSnapshot = nextSnapshot;
                    if (!previousSnapshot || nextSnapshot.fingerprint === previousSnapshot.fingerprint) {return;}
                    petChangeQueue = petChangeQueue
                        .then(async () => {
                            const journalIds = await petJournalIdsBetween({
                                previousRevision: previousSnapshot.revision,
                                nextRevision: nextSnapshot.revision,
                            });
                            if (currentGeneration !== generation) {return;}
                            schedulePetRefresh({ journalIds });
                        })
                        .catch((error) => {
                            console.warn('[LittleWhiteBox/tavern] Pet journal sync failed', error);
                        });
                },
                error: (error) => console.warn('[LittleWhiteBox/tavern] Pet domain sync failed', error),
            }),
        ];
    }

    watch(options.selectedSessionId, startSubscriptions, { immediate: true });
    onScopeDispose(stopSubscriptions);
}
