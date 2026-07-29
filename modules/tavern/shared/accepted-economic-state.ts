import db, {
    tavernBankActivitiesTable,
    tavernBankStateVersionsTable,
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernSessionsTable,
    tavernShopStateVersionsTable,
    tavernTaskBoardsTable,
    tavernTaskVersionsTable,
    tavernMessagesTable,
    tavernPetActivitiesTable,
    tavernPetStateVersionsTable,
    truncateTavernMessagesAndReplaceSessionStateInCurrentDbTransaction,
    updateTavernMessageInCurrentDbTransaction,
    type TavernMessageRecord,
    type TavernSessionState,
} from './session-db';
import {
    describeTavernBankRestoreImpact,
    restoreTavernBankToFloorInCurrentDbTransaction,
} from './bank/bank-timeline';
import type {
    TavernBankRestoreImpact,
} from './bank/bank-types';
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
import {
    describeTavernPetRestoreImpact,
    restoreTavernPetToFloorInCurrentDbTransaction,
} from './pet/pet-timeline';
import type { TavernPetRestoreImpact } from './pet/pet-types';

export interface TavernAcceptedEconomicRestoreImpact {
    tasks: TavernTaskRestoreImpact;
    shop: TavernShopRestoreImpact;
    bank: TavernBankRestoreImpact;
    pet: TavernPetRestoreImpact;
    economy: TavernEconomyRestoreImpact;
}

export interface TavernAcceptedEconomicRestoreResult {
    tasks: TavernTaskRestoreImpact;
    shop: TavernShopRestoreImpact;
    bank: TavernBankRestoreImpact;
    pet: TavernPetRestoreImpact;
    economy: TavernEconomyRestoreResult;
}

type TavernAcceptedMessagePatch = Partial<Pick<TavernMessageRecord,
    | 'content'
    | 'error'
    | 'thoughts'
    | 'runtimeEvents'
    | 'contextSnapshot'
    | 'buildSnapshot'
    | 'chatPresetId'
    | 'chatPresetName'
    | 'presetId'
    | 'presetName'
    | 'requestSnapshot'
    | 'provider'
    | 'model'
    | 'finishReason'
    | 'runtimeStateSnapshot'
>>;

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
    const [tasks, shop, bank, pet, economy] = await Promise.all([
        describeTavernTasksRestoreImpact(sessionId, targetFloor),
        describeTavernShopRestoreImpact(sessionId, targetFloor),
        describeTavernBankRestoreImpact(sessionId, targetFloor),
        describeTavernPetRestoreImpact(sessionId, targetFloor),
        describeTavernEconomyRestoreImpact(sessionId, targetFloor),
    ]);
    return { tasks, shop, bank, pet, economy };
}

/**
 * The accepted-history rollback entrypoint for every economy-related domain.
 * Task state, shop inventory, Bank state and all ledger facts after the same floor are
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
        tavernBankStateVersionsTable,
        tavernBankActivitiesTable,
        tavernPetStateVersionsTable,
        tavernPetActivitiesTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => restoreTavernAcceptedEconomicStateToFloorInCurrentDbTransaction({
            sessionId,
            targetFloor,
            touchSession: true,
        }),
    );
}

/** Caller must include every accepted economic table and sessions in the active transaction. */
export async function restoreTavernAcceptedEconomicStateToFloorInCurrentDbTransaction(input: {
    sessionId: string;
    targetFloor: number;
    touchSession?: boolean;
}): Promise<TavernAcceptedEconomicRestoreResult> {
    const sessionId = normalizeSessionId(input.sessionId);
    const targetFloor = normalizeTargetFloor(input.targetFloor);
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
    const bank = await restoreTavernBankToFloorInCurrentDbTransaction({
        sessionId,
        targetFloor,
        touchSession: false,
    });
    const pet = await restoreTavernPetToFloorInCurrentDbTransaction({
        sessionId,
        targetFloor,
        touchSession: false,
    });
    const economy = await restoreTavernEconomyToFloorInCurrentDbTransaction(
        sessionId,
        targetFloor,
        { touchSessionOnChange: false },
    );
    if (input.touchSession !== false && (tasks.changed || shop.changed || bank.changed || pet.changed || economy.changed)) {
        await tavernSessionsTable.update(sessionId, { updatedAt: Date.now() });
    }
    return { tasks, shop, bank, pet, economy };
}

/**
 * Changes one story message and removes every later economic fact atomically.
 * Cross-tab Bank/Shop/Task writers therefore serialize entirely before or
 * after the accepted timeline change; none can land in the former gap.
 */
export async function updateTavernMessageAndRestoreAcceptedEconomicState(input: {
    sessionId: string;
    order: number;
    patch: TavernAcceptedMessagePatch;
    incrementTimelineRevision?: boolean;
}): Promise<{
    message: TavernMessageRecord | null;
    economic: TavernAcceptedEconomicRestoreResult | null;
}> {
    const sessionId = normalizeSessionId(input.sessionId);
    const order = Number(input.order);
    if (!Number.isSafeInteger(order) || order < 0) {return { message: null, economic: null };}
    return await db.transaction(
        'rw',
        tavernMessagesTable,
        tavernSessionsTable,
        tavernTaskBoardsTable,
        tavernTaskVersionsTable,
        tavernShopStateVersionsTable,
        tavernBankStateVersionsTable,
        tavernBankActivitiesTable,
        tavernPetStateVersionsTable,
        tavernPetActivitiesTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => {
            const message = await updateTavernMessageInCurrentDbTransaction(
                sessionId,
                order,
                input.patch,
                { incrementTimelineRevision: input.incrementTimelineRevision },
            );
            if (!message) {return { message: null, economic: null };}
            const economic = await restoreTavernAcceptedEconomicStateToFloorInCurrentDbTransaction({
                sessionId,
                targetFloor: order - 1,
                touchSession: false,
            });
            return { message, economic };
        },
    );
}

/** Atomically truncates story messages, replaces session state and restores economic facts. */
export async function truncateTavernMessagesAndRestoreAcceptedEconomicState(input: {
    sessionId: string;
    fromOrder: number;
    state: Partial<TavernSessionState>;
}): Promise<{
    deleted: number;
    session: Awaited<ReturnType<typeof truncateTavernMessagesAndReplaceSessionStateInCurrentDbTransaction>>['session'];
    economic: TavernAcceptedEconomicRestoreResult | null;
}> {
    const sessionId = normalizeSessionId(input.sessionId);
    const fromOrder = Math.max(0, Math.floor(Number(input.fromOrder) || 0));
    return await db.transaction(
        'rw',
        tavernMessagesTable,
        tavernSessionsTable,
        tavernTaskBoardsTable,
        tavernTaskVersionsTable,
        tavernShopStateVersionsTable,
        tavernBankStateVersionsTable,
        tavernBankActivitiesTable,
        tavernPetStateVersionsTable,
        tavernPetActivitiesTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => {
            const mutation = await truncateTavernMessagesAndReplaceSessionStateInCurrentDbTransaction(
                sessionId,
                fromOrder,
                input.state,
            );
            if (!mutation.session || mutation.deleted === 0) {
                return { ...mutation, economic: null };
            }
            const economic = await restoreTavernAcceptedEconomicStateToFloorInCurrentDbTransaction({
                sessionId,
                targetFloor: fromOrder - 1,
                touchSession: false,
            });
            return { ...mutation, economic };
        },
    );
}
