import db, {
    tavernSessionsTable,
    tavernTaskBoardsTable,
    tavernTaskVersionsTable,
} from '../session-db';
import {
    TAVERN_TASK_CURRENT_MARKER,
    normalizeTavernTaskAnchorOrder,
    throwTavernTaskError,
    type TavernTaskRestoreImpact,
    type TavernTaskVersionRecord,
} from './task-types';

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

/** Caller must include sessions, taskBoards and taskVersions in the active transaction. */
export async function restoreTavernTasksToFloorInCurrentDbTransaction(input: {
    sessionId: string;
    targetFloor: number;
    touchSession?: boolean;
}): Promise<TavernTaskRestoreImpact> {
    const sessionId = normalizeSessionId(input.sessionId);
    const targetFloor = normalizeTavernTaskAnchorOrder(input.targetFloor);
    const [session, board, allVersions, futureVersions] = await Promise.all([
        tavernSessionsTable.get(sessionId),
        tavernTaskBoardsTable.get(sessionId),
        tavernTaskVersionsTable.where('sessionId').equals(sessionId).toArray(),
        listFutureVersions(sessionId, targetFloor),
    ]);
    if (!session) {throwTavernTaskError('task_session_missing', sessionId);}
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
    const nextBoardEpoch = Math.max(1, Math.floor(Number(session.taskBoardEpoch) || 1)) + 1;
    if (clearedBoard) {
        await tavernTaskBoardsTable.delete(sessionId);
    } else if (board) {
        await tavernTaskBoardsTable.put({ ...board, epoch: nextBoardEpoch });
    }
    await tavernSessionsTable.update(sessionId, { taskBoardEpoch: nextBoardEpoch });
    const impact: TavernTaskRestoreImpact = {
        // Advancing the epoch changes the task-domain CAS state even when there
        // was no board row or task version to remove.
        changed: true,
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
