import { getContext } from '../../../../../../extensions.js';
import { parseChatImageTags } from './chat-message-image-markup.js';
import { readGeneratedImageForAdoption } from './generated-image-runtime.js';
import { getPreview, getPreviewsBySlot, getPreviewsForMessage, storePreview, updatePreviewRecord, clearPreviewPlacements,
    getSlotSelection, setSlotSelection } from './gallery-cache.js';
import { placePreparedImageSlots } from './prepared-image-placement.js';
import { captureImagePlacement, getImageChatIdentity } from './chat-image-persistence.js';
import { hashSceneSource } from './scene-source.js';
import { hashStableValue } from './generation-fingerprint.js';
import { createDrawImageSlotRegex } from './image-marker-syntax.js';
import { setActiveMessageText } from './scene-placement.js';
import { commitChatImagePlacement } from './chat-image-placement.js';
import { syncRenderedMessageFromState, renderPreviewsForMessage, isMessageBeingEdited } from './draw-common.js';
import { PreviewStatus, hasPreviewImage, DRAW_SLOT_ERRORS } from './image-record.js';

const admissions = new WeakMap();
const editing = new WeakMap();

export function releaseChatImageAdmission(message) {
    if (message) admissions.delete(message);
}

// The native editor has already changed message.mes when MESSAGE_EDITED fires.
// Cancel any old admission immediately, then revoke only the removed slots on
// this edited branch. A concurrent viewport refresh waits for this local edit.
export function withdrawEditedImagePlacements(ctx, messageId) {
    const message = ctx.chat?.[messageId];
    if (!message) return Promise.resolve();
    admissions.delete(message);
    const owner = getImageChatIdentity(ctx), swipeIndex = message.swipe_id ?? 0;
    const attached = new Set([...message.mes.matchAll(createDrawImageSlotRegex())].map(match => match[1]));
    const operation = (async () => {
        const records = await getPreviewsForMessage(String(ctx.chatId), messageId);
        await clearPreviewPlacements(owner, records.filter(record => record.placement?.owner === owner
            && record.placement.swipeIndex === swipeIndex && !attached.has(record.slotId)).map(record => record.slotId));
    })().then(() => { if (editing.get(message) === operation) editing.delete(message); });
    // Failed withdrawal must not give a viewport refresh permission to undo
    // the user's edit. A subsequent explicit edit retries this same boundary.
    editing.set(message, operation);
    return operation;
}

// Compatibility boundary for released 3.1.6-3.1.8 chat tags and mis-migrated
// legacy failures. Retire only when those user chats have been converted.
// No whole-chat version flag: unloaded floors/swipes have not been inspected.
export function adoptChatImageMessage(ctx, messageId) {
    const message = ctx.chat?.[messageId];
    if (!message || isMessageBeingEdited(messageId)) return Promise.resolve(false);
    if (editing.has(message)) return editing.get(message).then(() => adoptChatImageMessage(ctx, messageId));
    const source = message.mes, swipeIndex = message.swipe_id ?? 0;
    const previous = admissions.get(message);
    if (previous?.source === source && previous.swipeIndex === swipeIndex) return previous.operation.then(() => false, () => false);
    const entry = { source, swipeIndex, operation: null };
    entry.operation = recoverMessage(ctx, messageId, message, source, swipeIndex, entry).then(result => {
        // Only the source actually inspected may be marked complete. A user
        // edit during an IDB read belongs to the next admission.
        if (!result?.complete && admissions.get(message) === entry) admissions.delete(message);
        return result?.changed ?? false;
    });
    admissions.set(message, entry);
    return entry.operation;
}

async function recoverMessage(ctx, messageId, message, initialSource, swipeIndex, entry) {
    const chatId = String(ctx.chatId);
    const owner = getImageChatIdentity(ctx);
    let source = initialSource;
    const current = () => admissions.get(message) === entry && getContext().chat === ctx.chat && getImageChatIdentity(getContext()) === owner
        && ctx.chat[messageId] === message && message.mes === source
        && (message.swipe_id ?? 0) === swipeIndex && !isMessageBeingEdited(messageId);
    let changed = false;
    const restoredSlots = new Set();
    const repairedSlots = new Set();
    const records = (await getPreviewsForMessage(chatId, messageId)).filter(record => owner && record.placement?.owner === owner);
    if (!current()) return false;

    // A paid result whose text save failed reuses its original slot/attempt.
    // Match only this exact branch/source, never a merely similar earlier floor.
    for (let pass = 0; pass < records.length; pass++) {
        const sourceHash = hashSceneSource(source);
        const slots = new Map(records.filter(record => record.placement?.sourceHash === sourceHash
            && record.placement.swipeIndex === swipeIndex).map(record => [record.slotId, record]));
        if (!slots.size) break;
        const items = [...slots.values()].sort((a, b) => a.placement.order - b.placement.order);
        const next = placePreparedImageSlots(source, items.map(item => ({ placement: item.placement.task })), items);
        if (next === source) break;
        if (items.every(item => item.placement.task.mode === 'replace')) {
            commitChatImagePlacement({ message, swipeIndex, before: source, edits: items.map(item => ({
                ...item.placement.task, slotId: item.slotId, content: `[image:${item.slotId}]`,
            })) });
        } else setActiveMessageText(message, next);
        source = message.mes;
        entry.source = source;
        items.forEach(item => restoredSlots.add(item.slotId));
        changed = true;
    }

    const adoptCandidates = async (slotId, tags, placement) => {
        const candidates = await readGeneratedImageForAdoption({ prompt: tags });
        if (!current()) return [];
        const ids = [];
        for (const candidate of candidates) {
            const imgId = `img-legacy-${hashStableValue([slotId, candidate.cacheKey])}`;
            if (!await getPreview(imgId)) {
                if (!current()) return [];
                await storePreview({ imgId, slotId, chatId, messageId, placement,
                    characterName: message.name || '', tags, positive: tags, base64: candidate.base64,
                    status: PreviewStatus.SUCCESS });
            }
            ids.push(imgId);
        }
        if (!current()) return [];
        if (ids.length) {
            const selected = await getSlotSelection(slotId);
            if (!current()) return [];
            if (!selected || !hasPreviewImage(await getPreview(selected))) await setSlotSelection(slotId, ids[0]);
        }
        return ids;
    };

    // Repair already-migrated records even when xbDrawTagFormat was set early.
    // Only the released migration's frozen legacy failure is an ungenerated
    // input. Real failed/unknown provider attempts retain their truthful state.
    for (const match of source.matchAll(createDrawImageSlotRegex())) {
        const slotId = match[1];
        const previews = await getPreviewsBySlot(slotId);
        if (!current()) return false;
        for (const record of previews.filter(item => item.status === PreviewStatus.UNGENERATED
            || item.status === PreviewStatus.FAILED && item.errorType === DRAW_SLOT_ERRORS.legacy.label)) {
            if (record.status !== PreviewStatus.UNGENERATED) {
                await updatePreviewRecord(record.imgId, { status: PreviewStatus.UNGENERATED, errorType: null, errorMessage: null });
                changed = true;
                repairedSlots.add(slotId);
                // The input is usable even if the separate old-cache lookup
                // fails or is blocked by a still-open older tab.
                await renderPreviewsForMessage(messageId, { refreshSlotIds: [slotId] });
            }
            if (!current()) return false;
            if (!previews.some(hasPreviewImage) && (await adoptCandidates(slotId, record.tags)).length) {
                repairedSlots.add(slotId);
                changed = true;
            }
            if (!current()) return false;
        }
    }

    const edits = [];
    for (const [order, tag] of parseChatImageTags(source).entries()) {
        const slotId = `slot-legacy-${hashStableValue([owner, messageId, swipeIndex, source, tag.start])}`;
        const placement = captureImagePlacement(owner, source, swipeIndex, { ...tag, mode: 'replace' }, order);
        if ((await adoptCandidates(slotId, tag.tags, placement)).length) {
            edits.push({ ...tag, slotId, content: `[image:${slotId}]` });
        }
        if (!current()) return false;
    }
    if (edits.length) {
        commitChatImagePlacement({ message, swipeIndex, before: source, edits });
        source = message.mes;
        entry.source = source;
        edits.forEach(edit => restoredSlots.add(edit.slotId));
        changed = true;
    }
    if (restoredSlots.size) {
        await syncRenderedMessageFromState(messageId, { chatId, expectedMessage: message,
            insertedSlotIds: [...restoredSlots] });
    }
    if (repairedSlots.size && current()) await renderPreviewsForMessage(messageId, { refreshSlotIds: [...repairedSlots] });
    return { changed, complete: current() };
}
