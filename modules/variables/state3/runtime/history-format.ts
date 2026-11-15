import type { History, Json } from '../types.js';

// Frozen format 2. Convert once when loading an existing chat; remove this
// adapter when support for those local test-line saves is retired.
export interface HistoryV2 {
    format: 2; roots: string[]; version: string; revision: number;
    checkpoints: { floor: number; revision: number; state: Json }[];
}
export function migrateHistoryV2(history: HistoryV2, hasOpeningReceipt: boolean): History {
    return { format: 3, roots: history.roots, version: history.version, revision: history.revision,
        checkpoints: history.checkpoints, openingMode: hasOpeningReceipt ? 'per-swipe' : 'common' };
}
