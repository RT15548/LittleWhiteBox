import { getCardPreview, storePreview, updatePreviewRecord, setSlotSelection } from './gallery-cache.js';
import { materializeDrawSavedPreview, syncDrawSavedFromPreview } from './draw-common.js';
import { captureImageCardTarget, readImageCardTarget } from './image-card-target.js';
import { createImageIdentifiers } from './prepared-image-placement.js';
import { DRAW_SLOT_COPY, DRAW_SLOT_ERRORS, PreviewStatus } from './image-record.js';

export function getCharacterTagEditGroups(characterPrompts = []) {
    return (characterPrompts || []).flatMap((character, index) => {
        const name = character.name || `角色 ${index + 1}`;
        return [
            { label: name, value: character.prompt || '', type: 'char', index },
            { label: `${name} 负向`, value: character.uc || '', type: 'uc', index },
        ];
    });
}

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
    // 角色负向（uc）编辑框：面板里有才覆盖，没有就保持记录原值。
    // 放在角色 prompt 之后读，索引与 data-index 一一对应。
    const characterPrompts = Array.isArray(record?.characterPrompts)
        ? record.characterPrompts.map((character, index) => {
            const promptField = panel.querySelector(`textarea[data-type="char"][data-index="${index}"]`);
            const ucField = panel.querySelector(`textarea[data-type="uc"][data-index="${index}"]`);
            if (!promptField && !ucField) return character;
            return {
                ...character,
                ...(promptField ? { prompt: promptField.value.trim() } : {}),
                ...(ucField ? { uc: ucField.value.trim() } : {}),
            };
        }) : [];
    // 追加位（post_prompt）编辑框可选：面板里有就一起保存并交给 compile，没有就不动记录
    const postPromptField = panel.querySelector('textarea[data-type="post_prompt"]');
    const postPrompt = postPromptField ? postPromptField.value.trim() : undefined;
    const changes = {
        tags,
        characterPrompts,
        ...(postPromptField ? { postPrompt } : {}),
        ...compile(tags, characterPrompts, record, postPrompt),
    };
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
