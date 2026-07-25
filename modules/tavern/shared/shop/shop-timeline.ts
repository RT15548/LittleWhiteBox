import db, {
    tavernSessionsTable,
    tavernShopStateVersionsTable,
} from '../session-db';
import {
    normalizeTavernShopAnchorOrder,
    normalizeTavernShopSessionId,
    throwTavernShopError,
    TAVERN_SHOP_CURRENT_MARKER,
    type TavernShopRestoreImpact,
    type TavernShopStateVersionRecord,
} from './shop-types';

type ShopRangeCollection<T> = {
    toArray(): Promise<T[]>;
};

type ShopRangeTable<T> = {
    where(index: string): {
        between(
            lower: unknown,
            upper: unknown,
            includeLower?: boolean,
            includeUpper?: boolean,
        ): ShopRangeCollection<T>;
    };
};

async function listFutureVersions(sessionId: string, targetFloor: number): Promise<TavernShopStateVersionRecord[]> {
    return await (tavernShopStateVersionsTable as unknown as ShopRangeTable<TavernShopStateVersionRecord>)
        .where('[sessionId+anchorOrder]')
        .between(
            [sessionId, targetFloor + 1],
            [sessionId, Number.MAX_SAFE_INTEGER],
            true,
            true,
        )
        .toArray();
}

function buildImpact(
    targetFloor: number,
    futureVersions: TavernShopStateVersionRecord[],
): TavernShopRestoreImpact {
    return {
        changed: futureVersions.length > 0,
        targetFloor,
        deletedVersionCount: futureVersions.length,
        affectedItemCount: new Set(futureVersions.map((version) => version.action.itemId)).size,
    };
}

export async function describeTavernShopRestoreImpact(
    value = '',
    targetValue = -1,
): Promise<TavernShopRestoreImpact> {
    const sessionId = normalizeTavernShopSessionId(value);
    const targetFloor = normalizeTavernShopAnchorOrder(targetValue);
    return await db.transaction(
        'r',
        tavernShopStateVersionsTable,
        async () => buildImpact(targetFloor, await listFutureVersions(sessionId, targetFloor)),
    );
}

/** Caller must include sessions and shopStateVersions in the active transaction. */
export async function restoreTavernShopToFloorInCurrentDbTransaction(input: {
    sessionId: string;
    targetFloor: number;
    touchSession?: boolean;
}): Promise<TavernShopRestoreImpact> {
    const sessionId = normalizeTavernShopSessionId(input.sessionId);
    const targetFloor = normalizeTavernShopAnchorOrder(input.targetFloor);
    const [session, allVersions, futureVersions] = await Promise.all([
        tavernSessionsTable.get(sessionId),
        tavernShopStateVersionsTable.where('sessionId').equals(sessionId).toArray(),
        listFutureVersions(sessionId, targetFloor),
    ]);
    if (!session) {throwTavernShopError('shop_session_missing', sessionId);}
    const impact = buildImpact(targetFloor, futureVersions);
    if (futureVersions.length) {
        await tavernShopStateVersionsTable.bulkDelete(
            futureVersions.map((version) => [version.sessionId, version.revision]),
        );
        const retained = allVersions
            .filter((version) => version.anchorOrder <= targetFloor)
            .sort((left, right) => left.revision - right.revision);
        for (const version of retained.filter((row) => !!row.currentMarker)) {
            await tavernShopStateVersionsTable.put({ ...version, currentMarker: undefined });
        }
        const latest = retained.at(-1);
        if (latest) {
            await tavernShopStateVersionsTable.put({ ...latest, currentMarker: TAVERN_SHOP_CURRENT_MARKER });
        }
    }
    if (impact.changed && input.touchSession !== false) {
        await tavernSessionsTable.update(sessionId, { updatedAt: Date.now() });
    }
    return impact;
}
