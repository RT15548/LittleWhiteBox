import { getCardPreview, storePreview, updatePreviewRecord, setSlotSelection } from './gallery-cache.js';
import { materializeDrawSavedPreview, syncDrawSavedFromPreview } from './draw-common.js';
import { captureImageCardTarget, readImageCardTarget } from './image-card-target.js';
import { createImageIdentifiers } from './prepared-chat-images.js';
import { DRAW_SLOT_COPY, DRAW_SLOT_ERRORS, PreviewStatus } from './image-record.js';

export async function readCardTagEditor(container) {
    const target = captureImageCardTarget(container);
    const panel = container.querySelector('.xb-nd-edit');
    const record = await readImageCardTarget(target);
    target.assertCurrent();
    if (panel !== container.querySelector('.xb-nd-edit')) throw new Error(DRAW_SLOT_COPY.editTargetChanged);
    panel.dataset.imgId = target.imgId;
    return record;
}

// The same editor persists successful images and attempts that have no image yet.
export async function persistCardTagEdits(container, compile) {
    const target = captureImageCardTarget(container);
    const { slotId, messageId, ctx, message, imgId } = target;
    const panel = container.querySelector('.xb-nd-edit');
    const input = panel?.querySelector('textarea[data-type="scene"]') || panel?.querySelector('textarea');
    const tags = input?.value.trim();
    if (!tags) throw new Error(DRAW_SLOT_COPY.emptyTags);
    const assertEditorTarget = (createdImgId) => {
        target.assertCurrent(createdImgId);
        if (panel !== container.querySelector('.xb-nd-edit')
            || panel.dataset.imgId !== undefined && panel.dataset.imgId !== imgId) {
            throw new Error(DRAW_SLOT_COPY.editTargetChanged);
        }
    };
    assertEditorTarget();
    let record = await getCardPreview(target);
    assertEditorTarget();
    if (!record && imgId) record = await materializeDrawSavedPreview(message, slotId, {
        messageId, chatId: String(ctx.chatId), expectedImgId: imgId,
    });
    assertEditorTarget();
    const characterPrompts = Array.isArray(record?.characterPrompts)
        ? record.characterPrompts.map((character, index) => {
            const field = panel.querySelector(`textarea[data-type="char"][data-index="${index}"]`);
            return field ? { ...character, prompt: field.value.trim() } : character;
        }) : [];
    const changes = { tags, characterPrompts, ...compile(tags, characterPrompts, record) };
    let createdImgId;
    if (!record) {
        const newId = createImageIdentifiers().imgId;
        record = { imgId: newId, slotId, messageId, chatId: String(ctx.chatId), characterName: message.name || '', ...changes,
            savedUrl: null, status: PreviewStatus.FAILED,
            errorType: DRAW_SLOT_ERRORS.interrupted.label, errorMessage: DRAW_SLOT_ERRORS.interrupted.desc };
        await storePreview(record);
        createdImgId = newId;
        assertEditorTarget(createdImgId);
        await setSlotSelection(slotId, newId);
    } else {
        record = await updatePreviewRecord(record.imgId, changes);
    }
    assertEditorTarget(createdImgId);
    if (record.savedUrl) {
        await syncDrawSavedFromPreview(messageId, record);
    }
    // Do not project edits before persistence has actually succeeded.
    assertEditorTarget(createdImgId);
    container.dataset.imgId = record.imgId;
    container.dataset.tags = record.tags;
    container.dataset.positive = record.positive || '';
    panel.dataset.imgId = record.imgId;
    return record;
}
