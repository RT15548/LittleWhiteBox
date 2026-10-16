import { getContext } from '../../../../../../extensions.js';
import { getCurrentUserHandle } from '../../../../../../user.js';
import { getChatIdentity } from './chat-identity.js';
import { hashSceneSource } from './scene-source.js';
import { findImageJobDeliverySlot } from './image-job-delivery-target.js';
import { saveChatAndConfirm, withConfirmableChatMutation } from './confirmable-chat-save.js';
import { clearPreviewPlacements } from './gallery-cache.js';
import { DRAW_SLOT_COPY } from './image-record.js';

export function getImageChatIdentity(ctx) {
    const chat = getChatIdentity(ctx);
    return chat === null ? null : JSON.stringify([getCurrentUserHandle(), chat]);
}

// The gallery attempt owns only the still-unconfirmed attachment. Its owner and
// original order survive restart; confirmation/removal deletes this fact only.
export function captureImagePlacement(owner, source, swipeIndex, task, order) {
    return owner ? { owner, sourceHash: hashSceneSource(source), swipeIndex, task: { ...task }, order } : null;
}

const saves = new Map();
export function saveChatImagePlacements(ctx, slotIds) {
    const owner = getImageChatIdentity(ctx);
    if (!owner) return Promise.resolve(false);
    let state = saves.get(owner);
    if (!state) { state = { pending: new Set(), operation: null }; saves.set(owner, state); }
    slotIds.forEach(id => state.pending.add(id));
    if (state.operation) return state.operation;
    const current = () => getContext().chat === ctx.chat && getImageChatIdentity(getContext()) === owner;
    state.operation = (async () => {
        while (state.pending.size) {
            const ids = [...state.pending];
            state.pending.clear();
            // The host reuses its chat array across navigation. Identity, not
            // that mutable array, owns the queue and every subsequent write.
            if (!current()) return false;
            try {
                const saved = await withConfirmableChatMutation(ctx, async () => {
                    if (!current()) return false;
                    const alive = ids.filter(id => findImageJobDeliverySlot(ctx.chat, id));
                    if (!alive.length) return true;
                    await saveChatAndConfirm({ ctx: { ...ctx, saveChat: () => {
                        // Runs after the Web Lock wait, immediately at host I/O.
                        if (!current()) throw new Error(DRAW_SLOT_COPY.sourceChanged);
                        return ctx.saveChat();
                    } }, verify: persisted => alive.every(id => findImageJobDeliverySlot(persisted, id)) });
                    await clearPreviewPlacements(owner, alive);
                    return true;
                });
                if (!saved) return false;
            } catch (error) {
                console.error(DRAW_SLOT_COPY.attachmentSaveFailed, error);
                globalThis.toastr?.warning?.(DRAW_SLOT_COPY.attachmentSaveFailed);
                return false;
            }
        }
        return true;
    })().finally(() => { saves.delete(owner); });
    return state.operation;
}
