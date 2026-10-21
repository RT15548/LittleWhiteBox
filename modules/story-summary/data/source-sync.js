import { rollbackSummaryIfNeeded } from './store.js';
import { retireSummaryMemorySources } from './memory-commit.js';
import { deleteChunksAtFloor, deleteChunksFromFloor } from '../vector/storage/chunk-store.js';

// Source retirement belongs to the consistency writer, not completion/UI events.
// Ordinary prose edits keep canonical L2; deletion/swipe retain their undo policy.
export function retainSourceChange(tracker, context, { kind = 'observed', floor = null } = {}) {
    tracker.retain(context, { kind, floor });
    const change = tracker.inspect(context);
    if (change) retireSummaryMemorySources(context.chatId, {
        fromFloor: change.rollbackFromFloor == null ? change.fromFloor : Math.min(change.fromFloor ?? Infinity, change.rollbackFromFloor),
        floors: change.anchorFloors,
    });
    return change;
}

export function synchronizeSourceCaches(tracker, context, {
    kind = 'observed', floor = null, isCurrent = () => true, getCurrentContext = () => context,
} = {}) {
    if (!isCurrent()) return Promise.resolve({ status: 'stale' });
    retainSourceChange(tracker, context, { kind, floor });
    return tracker.synchronize(context, change => rollbackSummaryIfNeeded({
        ...(Number.isFinite(change.rollbackFromFloor) ? { changedFromFloor: change.rollbackFromFloor } : {}),
        ...(change.fromFloor === null ? { invalidateFloors: change.anchorFloors } : { invalidateFromFloor: change.fromFloor }),
        invalidateSourceCache: async () => {
            if (change.fromFloor !== null) await deleteChunksFromFloor(context.chatId, change.fromFloor);
            else for (const editedFloor of change.editedFloors) await deleteChunksAtFloor(context.chatId, editedFloor);
        },
    }), () => isCurrent() ? getCurrentContext() : null);
}
