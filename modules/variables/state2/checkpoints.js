export const CHECKPOINT_KEY = 'stateCkptV2';
export const CHECKPOINT_INTERVAL = 50;
// Bump when point content changes meaning; points of any other version are ignored and refilled.
const CHECKPOINT_VERSION = 4;

export function candidateFloors(lastFloor) {
    const latest = Math.floor((lastFloor + 1) / CHECKPOINT_INTERVAL) * CHECKPOINT_INTERVAL - 1;
    return [latest - CHECKPOINT_INTERVAL, latest].filter(floor => floor >= 0);
}

export function validCheckpoints(meta, digests, lastFloor) {
    const store = meta.extensions?.LittleWhiteBox?.[CHECKPOINT_KEY];
    if (store?.v !== CHECKPOINT_VERSION || !Array.isArray(store.points)) return [];
    return store.points.filter(point => Number.isInteger(point.floor) && point.floor >= 0
        && point.floor <= lastFloor && point.digest === digests[point.floor]);
}

export function checkpoint(floor, digest, variables, rules) {
    return { floor, digest, variables: structuredClone(variables), rules: structuredClone(rules) };
}

export function storeCheckpoints(meta, points) {
    meta.extensions ||= {};
    const ext = meta.extensions.LittleWhiteBox ||= {};
    ext[CHECKPOINT_KEY] = { v: CHECKPOINT_VERSION, points: points.sort((a, b) => a.floor - b.floor).slice(-2) };
}
