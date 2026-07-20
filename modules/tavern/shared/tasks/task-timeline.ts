import db, {
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernSessionsTable,
    tavernTaskBoardsTable,
    tavernTaskVersionsTable,
} from '../session-db';
import {
    describeTavernEconomyRestoreImpact,
    restoreTavernEconomyToFloorInCurrentDbTransaction,
} from '../economy/economy-timeline';
import type {
    TavernEconomyRestoreImpact,
    TavernEconomyRestoreResult,
} from '../economy/economy-types';
import {
    TAVERN_TASK_CURRENT_MARKER,
    normalizeTavernTaskAnchorOrder,
    throwTavernTaskError,
    type TavernTaskRestoreImpact,
    type TavernTaskVersionRecord,
} from './task-types';

export interface TavernTasksAndEconomyRestoreImpact {
    tasks: TavernTaskRestoreImpact;
    economy: TavernEconomyRestoreImpact;
}

export interface TavernTasksAndEconomyRestoreResult {
    tasks: TavernTaskRestoreImpact;
    economy: TavernEconomyRestoreResult;
}

type TaskRangeCollection<T> = {
    toArray(): Promise<T[]>;
};

type TaskRangeTable<T> = {
    where(index: string): {
        between(
            lower: unknown,
            upper: unknown,
            includeLower?: boolean,
            includeUpper?: boolean,
        ): TaskRangeCollection<T>;
    };
};

function normalizeSessionId(value = ''): string {
    const sessionId = String(value || '').trim();
    if (!sessionId) {throwTavernTaskError('task_session_required');}
    return sessionId;
}

async function listFutureVersions(sessionId: string, targetFloor: number): Promise<TavernTaskVersionRecord[]> {
    return await (tavernTaskVersionsTable as unknown as TaskRangeTable<TavernTaskVersionRecord>)
        .where('[sessionId+anchorOrder]')
        .between(
            [sessionId, targetFloor + 1],
            [sessionId, Number.MAX_SAFE_INTEGER],
            true,
            true,
        )
        .toArray();
}

export async function describeTavernTasksRestoreImpact(
    value = '',
    targetValue = -1,
): Promise<TavernTaskRestoreImpact> {
    const sessionId = normalizeSessionId(value);
    const targetFloor = normalizeTavernTaskAnchorOrder(targetValue);
    return await db.transaction(
        'r',
        tavernTaskBoardsTable,
        tavernTaskVersionsTable,
        async () => {
            const [board, futureVersions] = await Promise.all([
                tavernTaskBoardsTable.get(sessionId),
                listFutureVersions(sessionId, targetFloor),
            ]);
            const clearedBoard = !!board && board.anchorOrder > targetFloor;
            return {
                changed: clearedBoard || futureVersions.length > 0,
                targetFloor,
                deletedVersionCount: futureVersions.length,
                affectedTaskCount: new Set(futureVersions.map((version) => version.taskId)).size,
                clearedBoard,
            };
        },
    );
}

export async function describeTavernTasksAndEconomyRestoreImpact(
    value = '',
    targetValue = -1,
): Promise<TavernTasksAndEconomyRestoreImpact> {
    const sessionId = normalizeSessionId(value);
    const targetFloor = normalizeTavernTaskAnchorOrder(targetValue);
    const [tasks, economy] = await Promise.all([
        describeTavernTasksRestoreImpact(sessionId, targetFloor),
        describeTavernEconomyRestoreImpact(sessionId, targetFloor),
    ]);
    return { tasks, economy };
}

async function restoreTavernTasksToFloorInCurrentDbTransaction(input: {
    sessionId: string;
    targetFloor: number;
    touchSession?: boolean;
}): Promise<TavernTaskRestoreImpact> {
    const sessionId = normalizeSessionId(input.sessionId);
    const targetFloor = normalizeTavernTaskAnchorOrder(input.targetFloor);
    if (!await tavernSessionsTable.get(sessionId)) {throwTavernTaskError('task_session_missing', sessionId);}
    const [board, allVersions, futureVersions] = await Promise.all([
        tavernTaskBoardsTable.get(sessionId),
        tavernTaskVersionsTable.where('sessionId').equals(sessionId).toArray(),
        listFutureVersions(sessionId, targetFloor),
    ]);
    const clearedBoard = !!board && board.anchorOrder > targetFloor;
    const affectedTaskIds = new Set(futureVersions.map((version) => version.taskId));
    if (futureVersions.length) {
        await tavernTaskVersionsTable.bulkDelete(
            futureVersions.map((version) => [version.sessionId, version.taskId, version.revision]),
        );
        for (const taskId of affectedTaskIds) {
            const retained = allVersions
                .filter((version) => version.taskId === taskId && version.anchorOrder <= targetFloor)
                .sort((left, right) => left.revision - right.revision);
            for (const version of retained.filter((row) => !!row.currentMarker)) {
                await tavernTaskVersionsTable.put({ ...version, currentMarker: undefined });
            }
            const latest = retained.at(-1);
            if (latest) {
                await tavernTaskVersionsTable.put({ ...latest, currentMarker: TAVERN_TASK_CURRENT_MARKER });
            }
        }
    }
    if (clearedBoard) {await tavernTaskBoardsTable.delete(sessionId);}
    const impact: TavernTaskRestoreImpact = {
        changed: clearedBoard || futureVersions.length > 0,
        targetFloor,
        deletedVersionCount: futureVersions.length,
        affectedTaskCount: affectedTaskIds.size,
        clearedBoard,
    };
    if (impact.changed && input.touchSession !== false) {
        await tavernSessionsTable.update(sessionId, { updatedAt: Date.now() });
    }
    return impact;
}

/**
 * The accepted-history rollback entrypoint. Task state and all ledger facts
 * after the same floor are removed inside one IndexedDB transaction.
 */
export async function restoreTavernTasksAndEconomyToFloor(
    value = '',
    targetValue = -1,
): Promise<TavernTasksAndEconomyRestoreResult> {
    const sessionId = normalizeSessionId(value);
    const targetFloor = normalizeTavernTaskAnchorOrder(targetValue);
    return await db.transaction(
        'rw',
        tavernSessionsTable,
        tavernTaskBoardsTable,
        tavernTaskVersionsTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => {
            const tasks = await restoreTavernTasksToFloorInCurrentDbTransaction({
                sessionId,
                targetFloor,
                touchSession: false,
            });
            const economy = await restoreTavernEconomyToFloorInCurrentDbTransaction(
                sessionId,
                targetFloor,
                { touchSessionOnChange: false },
            );
            if (tasks.changed || economy.changed) {
                await tavernSessionsTable.update(sessionId, { updatedAt: Date.now() });
            }
            return { tasks, economy };
        },
    );
}
