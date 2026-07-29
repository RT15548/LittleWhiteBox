import db, {
    tavernPetActivitiesTable,
    tavernPetStateVersionsTable,
    tavernSessionsTable,
} from '../session-db';
import {
    TAVERN_PET_CURRENT_MARKER,
    type TavernPetActivityRecord,
    type TavernPetRestoreImpact,
    type TavernPetStateVersionRecord,
    throwTavernPetError,
} from './pet-types';

type PetTimelineRangeCollection<T> = {
    toArray(): Promise<T[]>;
};

type PetTimelineRangeTable<T> = {
    where(index: string): {
        between(
            lower: unknown,
            upper: unknown,
            includeLower?: boolean,
            includeUpper?: boolean,
        ): PetTimelineRangeCollection<T>;
    };
};

function normalizeSessionId(value = ''): string {
    const sessionId = String(value || '').trim();
    if (!sessionId) {throwTavernPetError('pet_session_required');}
    return sessionId;
}

function normalizeTargetFloor(value: unknown): number {
    const targetFloor = Number(value);
    if (!Number.isSafeInteger(targetFloor) || targetFloor < -1) {
        throwTavernPetError('pet_anchor_order_invalid', String(value));
    }
    return targetFloor;
}

async function listFutureVersions(
    sessionId: string,
    targetFloor: number,
): Promise<TavernPetStateVersionRecord[]> {
    return await (tavernPetStateVersionsTable as unknown as PetTimelineRangeTable<TavernPetStateVersionRecord>)
        .where('[sessionId+anchorOrder]')
        .between(
            [sessionId, targetFloor + 1],
            [sessionId, Number.MAX_SAFE_INTEGER],
            true,
            true,
        )
        .toArray();
}

async function listFutureActivities(
    sessionId: string,
    targetFloor: number,
): Promise<TavernPetActivityRecord[]> {
    return await (tavernPetActivitiesTable as unknown as PetTimelineRangeTable<TavernPetActivityRecord>)
        .where('[sessionId+anchorOrder]')
        .between(
            [sessionId, targetFloor + 1],
            [sessionId, Number.MAX_SAFE_INTEGER],
            true,
            true,
        )
        .toArray();
}

function currentVersion(
    versions: readonly TavernPetStateVersionRecord[],
): TavernPetStateVersionRecord | null {
    return versions.find((version) => version.currentMarker === TAVERN_PET_CURRENT_MARKER)
        || [...versions].sort((left, right) => left.revision - right.revision).at(-1)
        || null;
}

function targetVersion(
    versions: readonly TavernPetStateVersionRecord[],
    targetFloor: number,
): TavernPetStateVersionRecord | null {
    return versions
        .filter((version) => version.anchorOrder <= targetFloor)
        .sort((left, right) => left.revision - right.revision)
        .at(-1)
        || null;
}

function pendingRequestId(version: TavernPetStateVersionRecord | null): string {
    return version?.state.pendingEvolution?.requestId || '';
}

function buildImpact(
    targetFloor: number,
    futureVersions: TavernPetStateVersionRecord[],
    futureActivities: TavernPetActivityRecord[],
    current: TavernPetStateVersionRecord | null,
    target: TavernPetStateVersionRecord | null,
): TavernPetRestoreImpact {
    return {
        changed: futureVersions.length > 0 || futureActivities.length > 0,
        targetFloor,
        deletedVersionCount: futureVersions.length,
        deletedActivityCount: futureActivities.length,
        phaseChanged: current?.state.phase !== target?.state.phase,
        personaChanged: current?.state.personaId !== target?.state.personaId,
        pendingEvolutionChanged: pendingRequestId(current) !== pendingRequestId(target),
        coinDelta: futureActivities.reduce((sum, activity) => sum + activity.coinDelta, 0),
    };
}

export async function describeTavernPetRestoreImpact(
    value = '',
    targetValue = -1,
): Promise<TavernPetRestoreImpact> {
    const sessionId = normalizeSessionId(value);
    const targetFloor = normalizeTargetFloor(targetValue);
    return await db.transaction(
        'r',
        tavernPetStateVersionsTable,
        tavernPetActivitiesTable,
        async () => {
            const [versions, futureVersions, futureActivities] = await Promise.all([
                tavernPetStateVersionsTable.where('sessionId').equals(sessionId).toArray(),
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
        },
    );
}

/** Caller must include sessions and both Pet tables in the active transaction. */
export async function restoreTavernPetToFloorInCurrentDbTransaction(input: {
    sessionId: string;
    targetFloor: number;
    touchSession?: boolean;
}): Promise<TavernPetRestoreImpact> {
    const sessionId = normalizeSessionId(input.sessionId);
    const targetFloor = normalizeTargetFloor(input.targetFloor);
    const [session, allVersions, futureVersions, futureActivities] = await Promise.all([
        tavernSessionsTable.get(sessionId),
        tavernPetStateVersionsTable.where('sessionId').equals(sessionId).toArray(),
        listFutureVersions(sessionId, targetFloor),
        listFutureActivities(sessionId, targetFloor),
    ]);
    if (!session) {throwTavernPetError('pet_session_missing', sessionId);}
    const impact = buildImpact(
        targetFloor,
        futureVersions,
        futureActivities,
        currentVersion(allVersions),
        targetVersion(allVersions, targetFloor),
    );
    if (futureVersions.length) {
        await tavernPetStateVersionsTable.bulkDelete(
            futureVersions.map((version) => [version.sessionId, version.revision]),
        );
        const retained = allVersions
            .filter((version) => version.anchorOrder <= targetFloor)
            .sort((left, right) => left.revision - right.revision);
        for (const version of retained.filter((version) => version.currentMarker)) {
            const historical = { ...version };
            delete historical.currentMarker;
            await tavernPetStateVersionsTable.put(historical);
        }
        const latest = retained.at(-1);
        if (latest) {
            await tavernPetStateVersionsTable.put({
                ...latest,
                currentMarker: TAVERN_PET_CURRENT_MARKER,
            });
        }
    }
    if (futureActivities.length) {
        await tavernPetActivitiesTable.bulkDelete(
            futureActivities.map((activity) => [activity.sessionId, activity.id]),
        );
    }
    if (impact.changed && input.touchSession !== false) {
        await tavernSessionsTable.update(sessionId, { updatedAt: Date.now() });
    }
    return impact;
}
