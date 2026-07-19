import { getLatestTavernAssistantOrder } from './session-db';

export const TAVERN_ACCEPTED_BASELINE_FLOOR = -1;

export async function resolveTavernAcceptedSnapshotFloor(
    sessionId = '',
    floorInput?: number,
): Promise<number> {
    const explicit = Number(floorInput);
    if (Number.isFinite(explicit)) {return Math.floor(explicit);}
    const latestOrder = await getLatestTavernAssistantOrder(sessionId);
    return latestOrder ?? TAVERN_ACCEPTED_BASELINE_FLOOR;
}
