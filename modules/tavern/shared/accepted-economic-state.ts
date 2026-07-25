import db, {
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernSessionsTable,
    tavernShopStateVersionsTable,
    tavernTaskBoardsTable,
    tavernTaskVersionsTable,
} from './session-db';
import {
    describeTavernEconomyRestoreImpact,
    restoreTavernEconomyToFloorInCurrentDbTransaction,
} from './economy/economy-timeline';
import type {
    TavernEconomyRestoreImpact,
    TavernEconomyRestoreResult,
} from './economy/economy-types';
import {
    describeTavernTasksRestoreImpact,
    restoreTavernTasksToFloorInCurrentDbTransaction,
} from './tasks/task-timeline';
import {
    type TavernTaskRestoreImpact,
} from './tasks/task-types';
import {
    describeTavernShopRestoreImpact,
    restoreTavernShopToFloorInCurrentDbTransaction,
} from './shop/shop-timeline';
import type {
    TavernShopRestoreImpact,
} from './shop/shop-types';

export interface TavernAcceptedEconomicRestoreImpact {
    tasks: TavernTaskRestoreImpact;
    shop: TavernShopRestoreImpact;
    economy: TavernEconomyRestoreImpact;
}

export interface TavernAcceptedEconomicRestoreResult {
    tasks: TavernTaskRestoreImpact;
    shop: TavernShopRestoreImpact;
    economy: TavernEconomyRestoreResult;
}

function normalizeSessionId(value = ''): string {
    const sessionId = String(value || '').trim();
    if (!sessionId) {throw new Error('accepted_economic_session_required');}
    return sessionId;
}

function normalizeTargetFloor(value: unknown): number {
    const targetFloor = Number(value);
    if (!Number.isSafeInteger(targetFloor) || targetFloor < -1) {
        throw new Error(`accepted_economic_floor_invalid:${String(value)}`);
    }
    return targetFloor;
}

export async function describeTavernAcceptedEconomicRestoreImpact(
    value = '',
    targetValue = -1,
): Promise<TavernAcceptedEconomicRestoreImpact> {
    const sessionId = normalizeSessionId(value);
    const targetFloor = normalizeTargetFloor(targetValue);
    const [tasks, shop, economy] = await Promise.all([
        describeTavernTasksRestoreImpact(sessionId, targetFloor),
        describeTavernShopRestoreImpact(sessionId, targetFloor),
        describeTavernEconomyRestoreImpact(sessionId, targetFloor),
    ]);
    return { tasks, shop, economy };
}

/**
 * The accepted-history rollback entrypoint for every economy-related domain.
 * Task state, shop inventory and all ledger facts after the same floor are
 * removed inside one IndexedDB transaction; any mid-way failure rolls every
 * domain back together.
 */
export async function restoreTavernAcceptedEconomicStateToFloor(
    value = '',
    targetValue = -1,
): Promise<TavernAcceptedEconomicRestoreResult> {
    const sessionId = normalizeSessionId(value);
    const targetFloor = normalizeTargetFloor(targetValue);
    return await db.transaction(
        'rw',
        tavernSessionsTable,
        tavernTaskBoardsTable,
        tavernTaskVersionsTable,
        tavernShopStateVersionsTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => {
            const tasks = await restoreTavernTasksToFloorInCurrentDbTransaction({
                sessionId,
                targetFloor,
                touchSession: false,
            });
            const shop = await restoreTavernShopToFloorInCurrentDbTransaction({
                sessionId,
                targetFloor,
                touchSession: false,
            });
            const economy = await restoreTavernEconomyToFloorInCurrentDbTransaction(
                sessionId,
                targetFloor,
                { touchSessionOnChange: false },
            );
            if (tasks.changed || shop.changed || economy.changed) {
                await tavernSessionsTable.update(sessionId, { updatedAt: Date.now() });
            }
            return { tasks, shop, economy };
        },
    );
}
