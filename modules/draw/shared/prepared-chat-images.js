import { getContext } from '../../../../../../extensions.js';
import { storePreview, deletePreview, setSlotSelection, clearSlotSelection } from './gallery-cache.js';
import { createPlaceholder, renderPreviewsForMessage, syncRenderedMessageFromState,
    isMessageBeingEdited, classifyError, clearDrawSavedEntry, materializeDrawSavedPreview } from './draw-common.js';
import { setActiveMessageText, isSceneSlotAlive } from './scene-placement.js';
import { createImageIdentifiers, placePreparedImageSlots } from './prepared-image-placement.js';
import { captureImagePlacement, getImageChatIdentity } from './chat-image-persistence.js';
import { findImageJobDeliverySlot } from './image-job-delivery-target.js';
import { executePreparedSlots } from './prepared-slot-executor.js';
import { setSlotActivity, clearSlotActivity } from './slot-activity.js';
import { DRAW_SLOT_COPY } from './image-record.js';
import { commitChatImagePlacement, restoreChatImagePlacements } from './chat-image-placement.js';
import { observeBackgroundTask } from '../../../shared/common/async-errors.js';


const providers = new Map();

export function registerPreparedImageProvider(provider, execute) {
    providers.set(provider, execute);
    return () => { if (providers.get(provider) === execute) providers.delete(provider); };
}

export function generatePreparedChatImages(provider, input) {
    const execute = providers.get(provider);
    if (!execute) throw new Error(DRAW_SLOT_COPY.unavailable);
    return execute(input);
}

// The host awaits only local preparation. The same provider/floor job continues
// to own completion and cancellation; no second queue or detached task identity.
export function prepareNativeChatImages(provider, input) {
    let ready, failed;
    const prepared = new Promise((resolve, reject) => { ready = resolve; failed = reject; });
    const completed = Promise.resolve().then(() => generatePreparedChatImages(provider, {
        ...input, nativeMessage: true, onPrepared: ready,
    }));
    observeBackgroundTask(completed.catch(failed), { source: import.meta.url, operation: "prepareNativeChatImages" });
    return { prepared, completed };
}

// The two input adapters supply already compiled metadata and the same provider
// batch runner. This is the only owner of pre-request chat placement for them.
export async function submitPreparedChatImages({ ctx, message, messageId, sourceText,
    tasks, metadata, backend, run, signal, onStateChange, onPlacement, nativeMessage = false, onPrepared, placementSource,
    swipeIndex = message.swipe_id ?? 0 }) {
    const chatId = String(ctx.chatId);
    const chatIdentity = getImageChatIdentity(ctx);
    const ids = tasks.map(task => ({ ...createImageIdentifiers(),
        ...(task.placement?.mode === 'existing' ? { slotId: task.placement.slotId } : {}) }));
    // Rerolls own an existing slot and captured input, not a frozen text edit.
    const existingSlots = tasks.length > 0 && tasks.every(task => task.placement?.mode === 'existing');
    const plannedText = nativeMessage || existingSlots ? null : placePreparedImageSlots(sourceText, tasks, ids);
    const replacesTags = tasks.every(task => task.placement?.mode === 'replace');
    const placeTags = () => commitChatImagePlacement({ message, swipeIndex, before: message.mes,
        edits: tasks.map((task, index) => ({ ...task.placement, slotId: ids[index].slotId,
            content: createPlaceholder(ids[index].slotId) })), owner: placementSource });
    const owner = {};
    const items = metadata.map((data, index) => ({ ...data, ...ids[index], messageId,
        chatId, characterName: message.name || '',
        placement: existingSlots ? null : captureImagePlacement(chatIdentity, sourceText, swipeIndex, tasks[index].placement, index),
        delivery: { mode: 'slots', chatId, messageId: String(messageId), swipeIndex,
            // A provider result is already paid work. If chat persistence or
            // navigation fails after transport, keep the gallery record so the
            // user can attach/retry it instead of silently discarding it.
            retainWithoutSlot: true },
    }));
    const resolveTarget = slotId => {
        const live = getContext();
        // A local request may finish after navigating away. Its original message
        // remains the delivery target; never write into the newly opened chat.
        if (getImageChatIdentity(live) === chatIdentity) {
            const target = findImageJobDeliverySlot(live.chat, slotId);
            return !nativeMessage || target?.message === message ? target : null;
        }
        const original = findImageJobDeliverySlot([message], slotId);
        return original ? { ...original, messageId } : null;
    };
    const render = async (changedSlots = items.map(item => item.slotId)) => {
        if (getImageChatIdentity(getContext()) !== chatIdentity) return;
        const byMessage = new Map();
        for (const item of items) {
            if (!changedSlots.includes(item.slotId)) continue;
            const target = resolveTarget(item.slotId);
            if (!target?.isActiveSwipe) continue;
            const slots = byMessage.get(target.messageId) || [];
            slots.push(item.slotId);
            byMessage.set(target.messageId, slots);
        }
        for (const [id, refreshSlotIds] of byMessage) await renderPreviewsForMessage(id, { refreshSlotIds });
    };
    const assertSource = (expectedText = sourceText) => {
        const live = getContext();
        const liveId = live.chat?.indexOf(message) ?? -1;
        if (nativeMessage && getImageChatIdentity(live) === chatIdentity && liveId >= 0 && !placementSource?.invalid
            && (message.swipe_id ?? 0) === swipeIndex) restoreChatImagePlacements(message);
        if (getImageChatIdentity(live) !== chatIdentity || liveId < 0
            || (message.swipe_id ?? 0) !== swipeIndex || placementSource?.invalid
            || !(existingSlots ? ids.every(item => isSceneSlotAlive(message.mes, item.slotId))
                : nativeMessage ? message.mes.startsWith(placementSource?.sourceText ?? sourceText) : message.mes === expectedText)
            || isMessageBeingEdited(liveId)) throw new Error(DRAW_SLOT_COPY.sourceChanged);
    };
    const validateSource = () => {
        assertSource();
        signal?.throwIfAborted();
    };
    for (const task of tasks) if (task.placement?.mode === 'existing') {
        validateSource();
        await materializeDrawSavedPreview(message, task.placement.slotId, { messageId, chatId });
        validateSource();
    }
    return executePreparedSlots({ items, backend, nativeMessage, onPrepared,
        store: storePreview, remove: deletePreview, clearSelection: clearSlotSelection,
        select: async (slotId, imgId) => {
            await setSlotSelection(slotId, imgId);
            const target = resolveTarget(slotId);
            if (target && getImageChatIdentity(getContext()) === chatIdentity) await clearDrawSavedEntry(target.messageId, slotId);
        }, resolveTarget, render, run, signal, onStateChange, classifyError,
        activity: (slotId, state) => state
            ? setSlotActivity(slotId, { ...state, owner }) : clearSlotActivity(slotId, owner),
        commit: nativeMessage ? () => {
            // MESSAGE_RECEIVED is inside the host's own save boundary. No extra
            // chat I/O here, and no await between ownership check and mutation.
            validateSource();
            placeTags();
            const liveId = getContext().chat.indexOf(message);
            // This is a committed text edit, not a progress refresh. Mounted
            // tag views already own their cards; otherwise format this edit once.
            void syncRenderedMessageFromState(liveId, { chatId, expectedMessage: message,
                insertedSlotIds: ids.map(item => item.slotId) }).catch(error => console.error(DRAW_SLOT_COPY.renderFailed, error));
            onPlacement?.();
            return true;
        } : () => {
            validateSource();
            // Existing-slot redraws already have a durable chat target. They
            // must not be blocked by a redundant save/readback round trip.
            if (existingSlots) {
                onPlacement?.();
                return true;
            }
            // Manual tags use the same synchronous text/card handoff as native
            // tags. The host's own autosave persists this edit.
            if (replacesTags) placeTags();
            else setActiveMessageText(message, plannedText);
            const liveId = getContext().chat.indexOf(message);
            void syncRenderedMessageFromState(liveId, { chatId, expectedMessage: message,
                insertedSlotIds: ids.map(item => item.slotId) }).catch(error => console.error(DRAW_SLOT_COPY.renderFailed, error));
            onPlacement?.();
            return true;
        },
    });
}
