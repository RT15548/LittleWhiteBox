import Dexie from '../../../../../libs/dexie.mjs';
import { onScopeDispose, watch, type Ref } from 'vue';
import { TAVERN_PLAYER_ACCOUNT_ID } from '../../../shared/economy/economy-types';
import db, {
    tavernBankStateVersionsTable,
    tavernBankActivitiesTable,
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernSessionsTable,
    tavernShopStateVersionsTable,
    tavernTaskBoardsTable,
    tavernTaskVersionsTable,
} from '../../../shared/session-db';
import { TAVERN_TASK_CURRENT_MARKER } from '../../../shared/tasks/task-types';
import { TAVERN_SHOP_CURRENT_MARKER } from '../../../shared/shop/shop-types';
import { TAVERN_BANK_CURRENT_MARKER } from '../../../shared/bank/bank-types';

interface TavernPhoneDomainSyncOptions {
    selectedSessionId: Ref<string>;
    onTasksChanged: () => void | Promise<void>;
    onEconomyChanged: () => void | Promise<void>;
    onShopChanged: () => void | Promise<void>;
    onBankChanged: () => void | Promise<void>;
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

interface LatestBankActivityCollection {
    reverse(): LatestBankActivityCollection;
    first(): Promise<{ id: string; createdAt: number } | undefined>;
}

interface LatestBankActivityTable {
    where(index: string): {
        between(lower: unknown, upper: unknown, includeLower?: boolean, includeUpper?: boolean): LatestBankActivityCollection;
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

async function bankDomainFingerprint(sessionId: string): Promise<string> {
    return await db.transaction('r', tavernSessionsTable, tavernBankStateVersionsTable, tavernBankActivitiesTable, async () => {
        const [session, rows, latestActivity] = await Promise.all([
            tavernSessionsTable.get(sessionId),
            tavernBankStateVersionsTable
                .where('[sessionId+currentMarker]')
                .equals([sessionId, TAVERN_BANK_CURRENT_MARKER])
                .toArray(),
            (tavernBankActivitiesTable as unknown as LatestBankActivityTable)
                .where('[sessionId+createdAt]')
                .between([sessionId, 0], [sessionId, Number.MAX_SAFE_INTEGER], true, true)
                .reverse()
                .first(),
        ]);
        const current = rows[0];
        return JSON.stringify([
            session?.id ? 1 : 0,
            Number(session?.state?.turn) || 0,
            current?.revision || 0,
            current?.versionId || '',
            latestActivity?.createdAt ?? -1,
            latestActivity?.id || '',
        ]);
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

export function useTavernPhoneDomainSync(options: TavernPhoneDomainSyncOptions): void {
    let subscriptions: DexieLiveQuerySubscription[] = [];
    let generation = 0;
    const scheduleTaskRefresh = createRefreshScheduler('Task', options.onTasksChanged);
    const scheduleEconomyRefresh = createRefreshScheduler('Economy', options.onEconomyChanged);
    const scheduleShopRefresh = createRefreshScheduler('Shop', options.onShopChanged);
    const scheduleBankRefresh = createRefreshScheduler('Bank', options.onBankChanged);

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
        let bankFingerprint: string | null = null;
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
                next: (nextFingerprint) => {
                    if (currentGeneration !== generation) {return;}
                    if (bankFingerprint === null) {
                        bankFingerprint = nextFingerprint;
                        return;
                    }
                    if (nextFingerprint === bankFingerprint) {return;}
                    bankFingerprint = nextFingerprint;
                    scheduleBankRefresh();
                },
                error: (error) => console.warn('[LittleWhiteBox/tavern] Bank domain sync failed', error),
            }),
        ];
    }

    watch(options.selectedSessionId, startSubscriptions, { immediate: true });
    onScopeDispose(stopSubscriptions);
}
