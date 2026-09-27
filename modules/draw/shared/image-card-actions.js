import { getContext } from '../../../../../../extensions.js';
import { getCardPreview, getPreviewsBySlot, deletePreview, clearSlotSelection, setSlotSelection } from './gallery-cache.js';
import { generatePreparedChatImages } from './prepared-chat-images.js';
import { getSlotActivity } from './slot-activity.js';
import { getPendingImageJobSlots, discardPendingImageSlot } from './pending-image-jobs.js';
import { discardChatImagePlacement, commitChatImageRemoval, rollbackChatImageRemoval } from './chat-image-placement.js';
import { isMessageBeingEdited, renderPreviewsForMessage, syncRenderedMessageFromState, clearDrawSavedEntry, syncDrawSavedFromPreview } from './draw-common.js';
import { isSceneSlotAlive } from './scene-placement.js';
import { saveChatAndConfirm, withConfirmableChatMutation } from './confirmable-chat-save.js';
import { findImageJobDeliverySlot } from './image-job-delivery-target.js';
import { DRAW_SLOT_COPY, hasPreviewImage } from './image-record.js';

const redraws = new Map();

// A failed attempt remains editable, but must not strand the slot's older images.
// This action only changes selection; it never submits another drawing request.
export async function restoreImageCard(container) {
    try {
        const ctx = getContext();
        const messageId = Number(container.dataset.mesid);
        const message = ctx.chat[messageId];
        const slotId = container.dataset.slotId;
        const preview = (await getPreviewsBySlot(slotId)).find(hasPreviewImage);
        if (!preview) throw new Error(DRAW_SLOT_COPY.missingRecord);
        if (String(getContext().chatId) !== String(ctx.chatId) || ctx.chat[messageId] !== message
            || !isSceneSlotAlive(message?.mes, slotId)) throw new Error(DRAW_SLOT_COPY.sourceChanged);
        await setSlotSelection(slotId, preview.imgId);
        if (String(getContext().chatId) !== String(ctx.chatId) || ctx.chat[messageId] !== message) return false;
        if (preview.savedUrl) await syncDrawSavedFromPreview(messageId, preview);
        else await clearDrawSavedEntry(messageId, slotId);
        await renderPreviewsForMessage(messageId, { refreshSlotIds: [slotId] });
        return true;
    } catch (error) {
        console.error(DRAW_SLOT_COPY.restoreFailed, error);
        globalThis.toastr?.error(error.message, DRAW_SLOT_COPY.restoreFailed);
        return false;
    }
}

export function redrawImageCard(provider, container) {
    const slotId = container.dataset.slotId;
    if (redraws.has(slotId)) return redraws.get(slotId);
    if (getSlotActivity(slotId)) return Promise.resolve();
    const operation = redraw(provider, container).finally(() => redraws.delete(slotId));
    redraws.set(slotId, operation);
    return operation;
}

async function redraw(provider, container) {
    const slotId = container.dataset.slotId;
    const messageId = Number(container.dataset.mesid);
    const ctx = getContext();
    const message = ctx.chat[messageId];
    if (!message || !isSceneSlotAlive(message.mes, slotId)) throw new Error(DRAW_SLOT_COPY.sourceChanged);
    const sourceText = message.mes;
    const swipeIndex = message.swipe_id ?? 0;
    try {
        // A refresh drops runtime activity, not the submitted backend job. Do
        // not turn a journal read failure into permission for a paid resubmit.
        if ((await getPendingImageJobSlots()).has(slotId)) return;
        const record = await getCardPreview({ slotId, imgId: container.dataset.imgId });
        const tags = record?.tags ?? container.dataset.tags;
        if (!tags?.trim()) throw new Error(DRAW_SLOT_COPY.emptyTags);
        return await generatePreparedChatImages(provider, { ctx, message, messageId, sourceText, swipeIndex,
            tasks: [{ scene: tags, characterPrompts: record?.characterPrompts ?? [],
                negativePrompt: record?.negativePrompt ?? undefined,
                placement: { mode: 'existing', slotId } }] });
    } finally {
        if (String(getContext().chatId) === String(ctx.chatId)) await renderPreviewsForMessage(messageId, { refreshSlotIds: [slotId] });
    }
}

export async function removeChatImageSlot(container) {
    const ctx = getContext();
    const messageId = Number(container.dataset.mesid);
    const slotId = container.dataset.slotId;
    const message = ctx.chat[messageId];
    const swipeIndex = message?.swipe_id ?? 0;
    const isCurrentTarget = () => String(getContext().chatId) === String(ctx.chatId)
        && getContext().chat[messageId] === message && (message.swipe_id ?? 0) === swipeIndex;
    const assertRemovable = () => {
        if (!isCurrentTarget() || isMessageBeingEdited(messageId) || !isSceneSlotAlive(message.mes, slotId)) {
            throw new Error(DRAW_SLOT_COPY.sourceChanged);
        }
    };
    if (!message || !isSceneSlotAlive(message.mes, slotId)) throw new Error(DRAW_SLOT_COPY.sourceChanged);
    await withConfirmableChatMutation(ctx, async () => {
        assertRemovable();
        // Mark only this item, not its batch. This intent precedes cleanup and
        // survives refresh even if native persistence of the deletion fails.
        getSlotActivity(slotId)?.discard?.();
        discardChatImagePlacement(slotId);
        await discardPendingImageSlot(slotId);
        assertRemovable();
        const change = commitChatImageRemoval({ message, swipeIndex, slotId });
        try {
            await saveChatAndConfirm({ ctx, verify: persisted => !findImageJobDeliverySlot(persisted, slotId) });
        } catch (error) {
            if (error.saveAttempted === false && isCurrentTarget()) {
                rollbackChatImageRemoval(change);
            }
            throw error;
        }
        if (isCurrentTarget()) await clearDrawSavedEntry(messageId, slotId);
        for (const record of await getPreviewsBySlot(slotId)) await deletePreview(record.imgId);
        await clearSlotSelection(slotId);
        await syncRenderedMessageFromState(messageId, { chatId: ctx.chatId, expectedMessage: message });
    });
}
