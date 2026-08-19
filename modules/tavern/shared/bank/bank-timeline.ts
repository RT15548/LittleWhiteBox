import db, {
    tavernBankActivitiesTable,
    tavernBankStateVersionsTable,
    tavernSessionsTable,
} from '../session-db';
import {
    TAVERN_BANK_CURRENT_MARKER,
    throwTavernBankError,
    type TavernBankActivityRecord,
    type TavernBankRestoreImpact,
    type TavernBankStateVersionRecord,
} from './bank-types';

type BankRangeCollection<T> = {
    toArray(): Promise<T[]>;
};

type BankRangeTable<T> = {
    where(index: string): {
        between(lower: unknown, upper: unknown, includeLower?: boolean, includeUpper?: boolean): BankRangeCollection<T>;
    };
};

function normalizeSessionId(value = ''): string {
    const sessionId = String(value || '').trim();
    if (!sessionId) {throwTavernBankError('bank_session_required');}
    return sessionId;
}

function normalizeTargetFloor(value: unknown): number {
    const targetFloor = Number(value);
    if (!Number.isSafeInteger(targetFloor) || targetFloor < -1) {
        throwTavernBankError('bank_anchor_order_invalid', String(value));
    }
    return targetFloor;
}

async function listFutureVersions(sessionId: string, targetFloor: number): Promise<TavernBankStateVersionRecord[]> {
    return await (tavernBankStateVersionsTable as unknown as BankRangeTable<TavernBankStateVersionRecord>)
        .where('[sessionId+anchorOrder]')
        .between([sessionId, targetFloor + 1], [sessionId, Number.MAX_SAFE_INTEGER], true, true)
        .toArray();
}

async function listFutureActivities(sessionId: string, targetFloor: number): Promise<TavernBankActivityRecord[]> {
    return await (tavernBankActivitiesTable as unknown as BankRangeTable<TavernBankActivityRecord>)
        .where('[sessionId+anchorOrder]')
        .between([sessionId, targetFloor + 1], [sessionId, Number.MAX_SAFE_INTEGER], true, true)
        .toArray();
}

function actionSubjectIds(version: TavernBankStateVersionRecord): string[] {
    const action = version.action;
    const ids = [...action.settledPositionIds];
    if ('positionId' in action) {ids.push(action.positionId);}
    if ('gameId' in action) {ids.push(action.gameId);}
    return ids;
}

function canonicalJson(value: unknown): string {
    return JSON.stringify(value ?? null, (_key, entry) => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {return entry;}
        return Object.fromEntries(Object.entries(entry as Record<string, unknown>).sort(([left], [right]) => (
            left.localeCompare(right)
        )));
    });
}

function currentVersion(versions: readonly TavernBankStateVersionRecord[]): TavernBankStateVersionRecord | null {
    return versions.find((version) => version.currentMarker === TAVERN_BANK_CURRENT_MARKER)
        || [...versions].sort((left, right) => left.revision - right.revision).at(-1)
        || null;
}

function targetVersion(
    versions: readonly TavernBankStateVersionRecord[],
    targetFloor: number,
): TavernBankStateVersionRecord | null {
    return versions
        .filter((version) => version.anchorOrder <= targetFloor)
        .sort((left, right) => left.revision - right.revision)
        .at(-1)
        || null;
}

function buildImpact(
    targetFloor: number,
    futureVersions: TavernBankStateVersionRecord[],
    futureActivities: TavernBankActivityRecord[],
    current: TavernBankStateVersionRecord | null,
    target: TavernBankStateVersionRecord | null,
): TavernBankRestoreImpact {
    return {
        changed: futureVersions.length > 0 || futureActivities.length > 0,
        targetFloor,
        deletedVersionCount: futureVersions.length,
        deletedActivityCount: futureActivities.length,
        affectedPositionCount: new Set([
            ...futureVersions.flatMap(actionSubjectIds),
            ...futureActivities.map((activity) => activity.sourceId),
        ]).size,
        activeGameAffected: canonicalJson(current?.state.activeGame) !== canonicalJson(target?.state.activeGame),
    };
}

export async function describeTavernBankRestoreImpact(value = '', targetValue = -1): Promise<TavernBankRestoreImpact> {
    const sessionId = normalizeSessionId(value);
    const targetFloor = normalizeTargetFloor(targetValue);
    return await db.transaction('r', tavernBankStateVersionsTable, tavernBankActivitiesTable, async () => {
        const [versions, futureVersions, futureActivities] = await Promise.all([
            tavernBankStateVersionsTable.where('sessionId').equals(sessionId).toArray(),
            listFutureVersions(sessionId, targetFloor),
            listFutureActivities(sessionId, targetFloor),
        ]);
        return buildImpact(
            targetFloor,
            futureVersions,
            futureActivities,
            currentVersion(versions),
            targetVersion(versions, targetFloor),
        );
    });
}

/** Caller must include sessions, bankStateVersions and bankActivities in the active transaction. */
export async function restoreTavernBankToFloorInCurrentDbTransaction(input: {
    sessionId: string;
    targetFloor: number;
    touchSession?: boolean;
}): Promise<TavernBankRestoreImpact> {
    const sessionId = normalizeSessionId(input.sessionId);
    const targetFloor = normalizeTargetFloor(input.targetFloor);
    const [session, allVersions, futureVersions, futureActivities] = await Promise.all([
        tavernSessionsTable.get(sessionId),
        tavernBankStateVersionsTable.where('sessionId').equals(sessionId).toArray(),
        listFutureVersions(sessionId, targetFloor),
        listFutureActivities(sessionId, targetFloor),
    ]);
    if (!session) {throwTavernBankError('bank_session_missing', sessionId);}
    const impact = buildImpact(
        targetFloor,
        futureVersions,
        futureActivities,
        currentVersion(allVersions),
        targetVersion(allVersions, targetFloor),
    );
    if (futureVersions.length) {
        await tavernBankStateVersionsTable.bulkDelete(futureVersions.map((version) => [version.sessionId, version.revision]));
        const retained = allVersions
            .filter((version) => version.anchorOrder <= targetFloor)
            .sort((left, right) => left.revision - right.revision);
        for (const version of retained.filter((version) => version.currentMarker)) {
            const previous = { ...version };
            delete previous.currentMarker;
            await tavernBankStateVersionsTable.put(previous);
        }
        const latest = retained.at(-1);
        if (latest) {await tavernBankStateVersionsTable.put({ ...latest, currentMarker: TAVERN_BANK_CURRENT_MARKER });}
    }
    if (futureActivities.length) {
        await tavernBankActivitiesTable.bulkDelete(futureActivities.map((activity) => [activity.sessionId, activity.id]));
    }
    if (impact.changed && input.touchSession !== false) {
        await tavernSessionsTable.update(sessionId, { updatedAt: Date.now() });
    }
    return impact;
}
