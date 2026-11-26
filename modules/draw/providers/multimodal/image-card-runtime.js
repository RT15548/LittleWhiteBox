import { getContext } from '../../../../../../../extensions.js';
import { observeAsyncCallback } from '../../../../shared/common/async-errors.js';
import { getImageChatIdentity } from '../../shared/chat-image-persistence.js';
import { isSceneSlotAlive } from '../../shared/scene-placement.js';
import { drawNotify } from '../../shared/draw-toast.js';
import { bindImageCardEvents } from '../../shared/image-card-events.js';
import { toggleImageCardControls } from '../../shared/image-card-controls.js';
import { captureImageCardTarget, readImageCardTarget } from '../../shared/image-card-target.js';
import {
    deleteImageFromCard, redrawImageCard, removeChatImageSlot, removeFloorFailedImageCards, restoreImageCard, retryFloorFailedImageCards,
} from '../../shared/image-card-actions.js';
import { getCharacterTagEditGroups, persistCardTagEdits, readCardTagEditor } from '../../shared/card-tag-editor.js';
import { withDrawActionFeedback } from '../../shared/draw-action-feedback.js';
import { getPreview, getPreviewsBySlot, openGallery, savePreviewImage, setSlotSelection } from '../../shared/gallery-cache.js';
import { imageFilePrefix } from '../../shared/image-autosave.js';
import { IMAGE_SAVE_COPY } from '../../shared/image-save-core.js';
import { DRAW_SLOT_COPY, hasPreviewImage } from '../../shared/image-record.js';
import {
    appendTagEditGroup, clearDrawSavedEntry, renderPreviewsForMessage, showDrawTagEditor, syncDrawSavedFromPreview,
} from '../../shared/draw-common.js';

export function bindMultimodalImageCards(provider) {
    const redraw = container => withDrawActionFeedback(container, () => redrawImageCard(provider, container));
    const closeMenu = container => container.querySelector('.xb-nd-menu-wrap')?.classList.remove('open');
    const refresh = (id, slotId) => renderPreviewsForMessage(id, { refreshSlotIds: [slotId] });
    async function syncSelected(target, selected) {
        const { slotId, ctx, message, swipeIndex } = target;
        const live = getContext();
        const id = live.chat?.indexOf(message) ?? -1;
        if (id < 0 || getImageChatIdentity(live) !== getImageChatIdentity(ctx)
            || (message.swipe_id ?? 0) !== swipeIndex || !isSceneSlotAlive(message.mes, slotId)) return;
        if (selected.savedUrl) await syncDrawSavedFromPreview(id, selected, { slotId });
        else await clearDrawSavedEntry(id, slotId);
        if (getContext().chat?.[id] === message) await refresh(id, slotId);
    }
    async function changeVersion(container, delta) {
        const target = captureImageCardTarget(container);
        const versions = (await getPreviewsBySlot(target.slotId)).filter(hasPreviewImage);
        target.assertCurrent();
        const index = versions.findIndex(item => item.imgId === target.imgId);
        if (delta < 0 && index === 0) return redraw(container);
        const next = versions[index + delta];
        if (index < 0 || !next) return;
        await setSlotSelection(target.slotId, next.imgId);
        await syncSelected(target, next);
    }
    async function showEditor(container) {
        const panel = container.querySelector('.xb-nd-edit');
        if (!panel) return;
        const record = await readCardTagEditor(container);
        const input = panel.querySelector('textarea');
        if (input) input.value = record?.tags ?? container.dataset.tags ?? '';
        for (const node of panel.querySelectorAll('[data-multimodal-tag-fields]')) node.remove();
        const groups = getCharacterTagEditGroups(record?.characterPrompts);
        if (groups.length) {
            const scroll = container.ownerDocument.createElement('div');
            scroll.className = 'xb-nd-edit-scroll';
            scroll.dataset.multimodalTagFields = '';
            for (const group of groups) appendTagEditGroup(scroll, group);
            input?.after(scroll);
        }
        showDrawTagEditor(panel);
    }
    function closeEditor(container) {
        const panel = container.querySelector('.xb-nd-edit');
        if (panel) panel.style.display = 'none';
    }
    async function saveTags(container) {
        const { notice } = await persistCardTagEdits(container, tags => ({ positive: tags }));
        // Editing stores a draft, never invokes either API; save-and-retry
        // uses the same registered direct-adaptation path as all card actions.
        closeEditor(container);
        drawNotify.success(notice);
    }
    async function saveImage(container) {
        const target = captureImageCardTarget(container);
        const record = await readImageCardTarget(target);
        if (!record || record.savedUrl) return;
        const url = await savePreviewImage(record.imgId, imageFilePrefix(provider));
        if (!url) throw new Error(IMAGE_SAVE_COPY.saveFailed);
        if (container.dataset.imgId === record.imgId) await syncSelected(target, { ...record, savedUrl: url });
        drawNotify.success(IMAGE_SAVE_COPY.saved);
    }
    const actions = new Map(Object.entries({
        'toggle-controls': toggleImageCardControls,
        'toggle-menu': container => container.querySelector('.xb-nd-menu-wrap')?.classList.toggle('open'),
        'open-gallery': async container => {
            const target = captureImageCardTarget(container);
            const { slotId, messageId, imgId } = target;
            await openGallery(slotId, messageId, {
                onUse: observeAsyncCallback((_sid, _id, selected) => syncSelected(target, selected), { source: import.meta.url, operation: 'selectGalleryVersion' }),
                onSave: observeAsyncCallback(async savedId => {
                    const selected = await getPreview(savedId);
                    if (selected) await syncSelected(target, selected);
                }, { source: import.meta.url, operation: 'saveGalleryVersion' }),
            }, imgId);
        },
        'nav-prev': container => changeVersion(container, 1),
        'nav-next': container => changeVersion(container, -1),
        'refresh-image': redraw, 'retry-image': redraw,
        'retry-floor-failed': container => retryFloorFailedImageCards(provider, container, false),
        'delete-image': deleteImageFromCard, 'restore-image': restoreImageCard,
        'edit-tags': showEditor, 'cancel-edit': closeEditor, 'save-tags': saveTags,
        'save-tags-retry': container => withDrawActionFeedback(container, async () => {
            await saveTags(container);
            await redrawImageCard(provider, container);
        }),
        'save-image': saveImage,
        'remove-placeholder': container => globalThis.confirm(DRAW_SLOT_COPY.removeConfirm) && removeChatImageSlot(container),
        'remove-floor-failed': removeFloorFailedImageCards,
    }));
    const click = observeAsyncCallback(async event => {
        const target = event.target;
        const container = target?.closest?.('.xb-nd-img');
        const action = target?.closest?.('[data-action]')?.dataset.action;
        const handler = actions.get(action);
        const menu = container?.querySelector('.xb-nd-menu-wrap');
        for (const open of target?.ownerDocument?.querySelectorAll('.xb-nd-menu-wrap.open') || []) {
            if (open !== menu) open.classList.remove('open');
        }
        if (!container || !handler) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (action !== 'toggle-menu' && action !== 'toggle-controls') closeMenu(container);
        try { await handler(container); }
        catch (error) { drawNotify.error(error.message); }
    }, { source: import.meta.url, operation: 'drawImageCardClick' });
    return bindImageCardEvents([['click', click, { capture: true }]]);
}
