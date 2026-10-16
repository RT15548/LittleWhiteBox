import { uuidv4 } from '../../../../../../utils.js';
import { insertScenePlacementsPreservingSlots, isSceneSlotAlive } from './scene-placement.js';
import { DRAW_SLOT_COPY } from './image-record.js';

export function createImageIdentifiers() {
    const id = uuidv4();
    return { slotId: `slot-${id}`, imgId: `img-${id}` };
}

export function placePreparedImageSlots(source, tasks, ids) {
    if (tasks.every(task => task.placement?.mode === 'existing')) {
        if (ids.some(item => !isSceneSlotAlive(source, item.slotId))) throw new Error(DRAW_SLOT_COPY.sourceChanged);
        return source;
    }
    if (!tasks.some(task => task.placement?.mode === 'replace')) {
        return insertScenePlacementsPreservingSlots(source, tasks.map((task, index) => ({
            placement: task.placement, content: `[image:${ids[index].slotId}]`,
        })), { block: true });
    }
    let result = source;
    let lastStart = source.length;
    const edits = tasks.map((task, index) => ({ ...task.placement, slotId: ids[index].slotId }))
        .sort((a, b) => b.start - a.start);
    for (const edit of edits) {
        if (edit.mode !== 'replace' || !Number.isInteger(edit.start) || !Number.isInteger(edit.end)
            || edit.start < 0 || edit.end > lastStart || edit.end <= edit.start
            || source.slice(edit.start, edit.end) !== edit.marker) throw new Error(DRAW_SLOT_COPY.sourceChanged);
        result = result.slice(0, edit.start) + `[image:${edit.slotId}]` + result.slice(edit.end);
        lastStart = edit.start;
    }
    return result;
}
