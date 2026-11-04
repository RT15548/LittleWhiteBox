import { getImageChatIdentity, imagePlacementSource } from './chat-image-persistence.js';
import { findDrawRunMarker, getDrawRunMarkerText, setDrawRunMarker, setDrawRunMarkerText } from './draw-run-markers.js';
import { isSceneSlotAlive, insertScenePlacementsPreservingSlots } from './scene-placement.js';
import { PendingJobState } from './pending-image-jobs.js';

// A submission receipt bridges a page close before the host autosaves. Existing
// markers win; only an unambiguous original branch may recover a missing marker.
export function restoreDrawRunTargets(ctx, records, { syncActiveSwipe, isEditing = () => false } = {}) {
    const owner = getImageChatIdentity(ctx);
    const changed = new Set();
    for (const record of records) {
        if (!record.submission || record.submission.owner !== owner) continue;
        const { marker, messageDate } = record.submission;
        let target = findDrawRunMarker(ctx.chat, record.originRunId);
        if (!target) {
            const candidates = [];
            for (const [messageId, message] of ctx.chat.entries()) {
                if (messageDate !== null && message.send_date !== messageDate) continue;
                for (const swipeIndex of [record.delivery.swipeIndex ?? 0]) {
                    const text = getDrawRunMarkerText({ message, swipeIndex });
                    if (typeof text !== 'string') continue;
                    if (record.items.some(item => isSceneSlotAlive(text, item.slotId))
                        || imagePlacementSource(text, { sourceHash: marker.targetHash, sourceLength: marker.sourceLength }) !== null) {
                        candidates.push({ message, messageId, swipeIndex, runId: record.originRunId, marker });
                    }
                }
            }
            if (candidates.length !== 1) continue;
            target = candidates[0];
        }
        if (isEditing(target.messageId)) continue;
        if (record.state === PendingJobState.ADOPTING && !findDrawRunMarker(ctx.chat, record.originRunId)) {
            setDrawRunMarker({ ...target, runId: record.originRunId, marker,
                syncActiveSwipe: () => syncActiveSwipe(target.messageId) });
            changed.add(target.messageId);
        }
        const text = getDrawRunMarkerText(target);
        const items = record.items.filter(item => item.placement && !item.discarded);
        if (!items.length || record.items.some(item => isSceneSlotAlive(text, item.slotId))) continue;
        const prefix = imagePlacementSource(text, items[0].placement);
        if (prefix === null) continue;
        setDrawRunMarkerText(target, insertScenePlacementsPreservingSlots(prefix,
            items.map(item => ({ placement: item.placement.task, content: `[image:${item.slotId}]` })), { block: true }) + text.slice(prefix.length));
        changed.add(target.messageId);
    }
    return changed;
}
