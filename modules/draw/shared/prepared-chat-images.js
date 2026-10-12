import { getContext } from '../../../../../../extensions.js';
import { uuidv4 } from '../../../../../../utils.js';
import { storePreview, deletePreview, setSlotSelection, clearSlotSelection } from './gallery-cache.js';
import { createPlaceholder, renderPreviewsForMessage, syncRenderedMessageFromState,
    isMessageBeingEdited, classifyError, clearDrawSavedEntry, materializeDrawSavedPreview } from './draw-common.js';
import { withConfirmableChatMutation, saveChatAndConfirm } from './confirmable-chat-save.js';
import { setActiveMessageText, insertScenePlacementsPreservingSlots, isSceneSlotAlive } from './scene-placement.js';
import { findImageJobDeliverySlot } from './image-job-delivery-target.js';
import { executePreparedSlots } from './prepared-slot-executor.js';
import { setSlotActivity, clearSlotActivity } from './slot-activity.js';
import { DRAW_SLOT_COPY } from './image-record.js';
import { commitChatImagePlacement, restoreChatImagePlacements } from './chat-image-placement.js';

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
    completed.catch(failed);
    return { prepared, completed };
}

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
            placement: task.placement, content: createPlaceholder(ids[index].slotId),
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
        result = result.slice(0, edit.start) + createPlaceholder(edit.slotId) + result.slice(edit.end);
        lastStart = edit.start;
    }
    return result;
}

// The two input adapters supply already compiled metadata and the same provider
// batch runner. This is the only owner of pre-request chat placement for them.
export async function submitPreparedChatImages({ ctx, message, messageId, sourceText,
    tasks, metadata, backend, run, signal, onStateChange, onPlacement, nativeMessage = false, onPrepared, placementSource,
    swipeIndex = message.swipe_id ?? 0 }) {
    const chatId = String(ctx.chatId);
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
        delivery: { mode: 'slots', chatId, messageId: String(messageId), swipeIndex,
            ...(nativeMessage ? { retainWithoutSlot: true } : {}) },
    }));
    const resolveTarget = slotId => {
        const live = getContext();
        // A local request may finish after navigating away. Its original message
        // remains the delivery target; never write into the newly opened chat.
        if (String(live.chatId) === chatId) {
            const target = findImageJobDeliverySlot(live.chat, slotId);
            return !nativeMessage || target?.message === message ? target : null;
        }
        const original = findImageJobDeliverySlot([message], slotId);
        return original ? { ...original, messageId } : null;
    };
    const render = async (changedSlots = items.map(item => item.slotId)) => {
        if (String(getContext().chatId) !== chatId) return;
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
        if (nativeMessage && String(live.chatId) === chatId && liveId >= 0 && !placementSource?.invalid
            && (message.swipe_id ?? 0) === swipeIndex) restoreChatImagePlacements(message);
        if (String(live.chatId) !== chatId || liveId < 0
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
            if (target && String(getContext().chatId) === chatId) await clearDrawSavedEntry(target.messageId, slotId);
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
        } : () => withConfirmableChatMutation(ctx, async () => {
            validateSource();
            // Manual tags use the same synchronous text/card handoff as native
            // tags. Persistence still gates transport, not the visible card.
            if (replacesTags) placeTags();
            else if (!existingSlots) setActiveMessageText(message, plannedText);
            // This save has no precondition: it confirms placement or reports
            // uncertainty. Never restore raw tags over a possibly persisted slot.
            // Confirm slot identities because floor/swipe indices may move.
            await saveChatAndConfirm({ ctx, verify: persisted =>
                items.every(item => findImageJobDeliverySlot(persisted, item.slotId)) });
            // Source changes still revoke placement. A cancellation after the
            // save keeps the provider's existing unsubmitted-abort settlement.
            try { assertSource(plannedText); }
            catch (error) {
                error.placementsCommitted = true;
                throw error;
            }
            const liveId = getContext().chat.indexOf(message);
            try {
                // Tags already own their card; redraws do not change the text.
                // Only newly inserted scene placements require host formatting.
                if (existingSlots || plannedText === sourceText) await render();
                else await syncRenderedMessageFromState(liveId, { chatId, expectedMessage: message,
                    insertedSlotIds: ids.map(item => item.slotId) });
                onPlacement?.();
            } catch (error) { console.error(DRAW_SLOT_COPY.renderFailed, error); }
            return true;
        }),
    });
}
