import { getContext } from '../../../../../../extensions.js';
import { getCardPreview } from './gallery-cache.js';
import { getDrawSavedPreview } from './draw-common.js';
import { isSceneSlotAlive } from './scene-placement.js';
import { DRAW_SLOT_COPY } from './image-record.js';

// An action belongs to the version on the card, not the gallery's display
// fallback. Capture before the first await; a later projection cannot retarget it.
export function captureImageCardTarget(container) {
    const ctx = getContext();
    const chatId = String(ctx.chatId);
    const messageId = Number(container.dataset.mesid);
    const message = ctx.chat[messageId];
    const slotId = container.dataset.slotId;
    const imgId = container.dataset.imgId || '';
    const swipeIndex = message?.swipe_id ?? 0;
    const assertCurrent = (createdImgId) => {
        const current = getContext();
        if (String(current.chatId) !== chatId || current.chat[messageId] !== message
            || (message?.swipe_id ?? 0) !== swipeIndex || !isSceneSlotAlive(message?.mes, slotId)
            || !container.isConnected || container.dataset.slotId !== slotId
            || Number(container.dataset.mesid) !== messageId) throw new Error(DRAW_SLOT_COPY.sourceChanged);
        const mountedId = container.dataset.imgId || '';
        // A first save may already have projected its own newly persisted
        // record. This never admits another version for an existing target.
        if (mountedId !== imgId && !(!imgId && createdImgId && mountedId === createdImgId)) {
            throw new Error(DRAW_SLOT_COPY.editTargetChanged);
        }
    };
    // Capturing is read-only. Redraw must check journal occupancy before
    // validating a stale view: an existing purchase is a no-op, not a new action.
    return { ctx, message, messageId, slotId, imgId, swipeIndex, assertCurrent };
}

export async function readImageCardTarget(target) {
    target.assertCurrent();
    const record = await getCardPreview(target);
    target.assertCurrent();
    if (record || !target.imgId) return record;
    const saved = getDrawSavedPreview(target.message, target.slotId, target.messageId, String(target.ctx.chatId));
    if (saved?.imgId === target.imgId) return saved;
    throw new Error(DRAW_SLOT_COPY.missingRecord);
}
