import { getContext } from '../../../../../../extensions.js';
import { getCardPreview, getPreviewsBySlot, deletePreview, clearSlotSelection, setSlotSelection } from './gallery-cache.js';
import { captureImageCardTarget, readImageCardTarget } from './image-card-target.js';
import { generatePreparedChatImages } from './prepared-chat-images.js';
import { getSlotActivity } from './slot-activity.js';
import { getPendingImageJobSlots, discardPendingImageSlot } from './pending-image-jobs.js';
import { discardChatImagePlacement, commitChatImageRemoval } from './chat-image-placement.js';
import { isMessageBeingEdited, renderPreviewsForMessage, removeDrawSavedEntry, clearDrawSavedEntry, syncDrawSavedFromPreview, getDrawSavedPreview } from './draw-common.js';
import { withdrawEditedImagePlacements } from './chat-image-tag-migration.js';
import { getImageChatIdentity } from './chat-image-persistence.js';
import { isSceneSlotAlive } from './scene-placement.js';
import { saveChatAndConfirm, withConfirmableChatMutation } from './confirmable-chat-save.js';
import { findImageJobDeliverySlot } from './image-job-delivery-target.js';
import { DRAW_SLOT_COPY, hasPreviewImage } from './image-record.js';
import { withDrawActionFeedback } from './draw-action-feedback.js';

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
    // 整楼重生在收集阶段（逐格 await 读取记录）还没占住各格子，这里按它在入口处认领的格子拦截，避免重复计费。
    const floor = getFloorRedraw(container, slotId);
    if (floor) {
        // 认领只表示“可能被整楼重生提交”。整楼结束后这一格若被跳过（认领已释放：没有 TAG、有后台任务等），
        // 就按单张重新生成处理，而不是白白等一轮什么都不做；已提交的格子则不会重复提交。
        // 整楼操作自己的异常已经由整楼发起处提示（见 retryFloorFailedImageCards）：这里对它保持静默，
        // 否则点击单张的入口会再弹一次同样的错误。
        return floor.operation.then(
            () => (floor.claims.has(slotId) ? undefined : redrawImageCard(provider, container)),
            (caughtError) => { console.warn({ source: import.meta.url, operation: "redrawImageCard" }, caughtError); },
        );
    }
    if (getSlotActivity(slotId)) {
        globalThis.toastr?.info?.(DRAW_SLOT_COPY.slotBusy);
        return renderPreviewsForMessage(Number(container.dataset.mesid), { refreshSlotIds: [slotId] });
    }
    const operation = redraw(provider, container).finally(() => redraws.delete(slotId));
    redraws.set(slotId, operation);
    return operation;
}

// 重生本楼失败项：把当前楼层（当前 swipe）上所有显示“失败 / 结果未知”卡片的图片，作为同一批任务重新提交。
// 沿用各张图保存的场景、角色和追加词，套用当前绘图参数，不重新规划；每张图与单张“重新生成”一样进入生成状态，
// 请求仍由 Provider 的串行队列依次执行。已在生成、已在排队或有后台任务的格子会被跳过。
const FLOOR_REDRAW_PREFIX = 'floor-failed:';
// 进行中的整楼重生认领了哪些格子（整楼键 → 格子集合）。在收集阶段第一个 await 之前就登记候选格子，
// 所以 `redraws.set(slotId, batch)` 之前的窗口里，对这些格子的单张“重新生成”也会被识别；
// 候选格子一旦确定被跳过就立刻从集合里释放，只有真正提交的格子保持认领。
// 值是 { claims, settled }：整楼批次一结束（settled）认领就不再拦截——此后整楼只剩收尾重绘，
// 这段时间里对该格的单张点击要走正常的单张重绘，而不是被已经完成的整楼操作吞掉。
const floorClaims = new Map();

function floorRedrawKey(container) {
    return `${FLOOR_REDRAW_PREFIX}${getContext().chatId}:${Number(container.dataset.mesid)}`;
}

function getFloorRedraw(container, slotId) {
    const key = floorRedrawKey(container);
    const floor = floorClaims.get(key);
    const operation = redraws.get(key);
    return floor && !floor.settled && floor.claims.has(slotId) && operation ? { claims: floor.claims, operation } : undefined;
}

export function collectFailedImageCards(container) {
    const messageId = Number(container.dataset.mesid);
    const root = container.closest('.mes_text')
        || document.querySelector(`.mes[mesid="${messageId}"] .mes_text`);
    return [...(root?.querySelectorAll('.xb-nd-img[data-state="failed"]') || [])];
}

export function redrawFloorFailedImageCards(provider, container) {
    const messageId = Number(container.dataset.mesid);
    const floorKey = floorRedrawKey(container);
    if (redraws.has(floorKey)) return redraws.get(floorKey);
    const floor = { claims: new Set(), settled: false };
    floorClaims.set(floorKey, floor);
    // redrawFloorFailed 在第一个 await 之前同步登记 claims；operation 随后立刻写入 redraws，
    // 期间没有其它代码可以插入，所以 claims 一出现就能对应到进行中的操作。
    const operation = redrawFloorFailed(provider, container, messageId, floor).finally(() => {
        redraws.delete(floorKey);
        floorClaims.delete(floorKey);
    });
    redraws.set(floorKey, operation);
    return operation;
}

// 面向按钮的入口：负责提示与错误，三个 Provider 共用。
export async function retryFloorFailedImageCards(provider, container) {
    // 同一楼层已有整楼重生在进行：本次点击只是并入同一个操作，结果和错误提示由第一次点击负责，不重复弹提示。
    const joining = redraws.has(floorRedrawKey(container));
    try {
        const result = await withDrawActionFeedback(container, () => redrawFloorFailedImageCards(provider, container));
        if (joining || !result) return;
        if (result.submitted === 0) globalThis.toastr?.info?.('本楼层没有可重新生成的失败图片');
        else if (result.skipped > 0) {
            globalThis.toastr?.info?.(`已重新生成 ${result.submitted} 张，另有 ${result.skipped} 张正在处理中已跳过`);
        }
    } catch (error) {
        if (joining) return;
        console.error(DRAW_SLOT_COPY.redrawFailed, error);
        globalThis.toastr?.error?.(error.message);
    }
}

async function redrawFloorFailed(provider, container, messageId, floor = { claims: new Set(), settled: false }) {
    const { claims } = floor;
    const ctx = getContext();
    const message = ctx.chat[messageId];
    if (!message) throw new Error(DRAW_SLOT_COPY.sourceChanged);
    const sourceText = message.mes;
    const swipeIndex = message.swipe_id ?? 0;
    const candidates = collectFailedImageCards(container)
        .filter(card => isSceneSlotAlive(sourceText, card.dataset.slotId));
    candidates.forEach(card => claims.add(card.dataset.slotId));
    const slotIds = [];
    try {
        // 与单张重画一致：读不到后台任务日志时不当作“可以重新计费”。
        const pendingSlots = await getPendingImageJobSlots();
        const tasks = [];
        let skipped = 0;
        for (const card of candidates) {
            const slotId = card.dataset.slotId;
            if (redraws.has(slotId) || getSlotActivity(slotId) || pendingSlots.has(slotId)) { claims.delete(slotId); skipped += 1; continue; }
            const imgId = card.dataset.imgId;
            let record = await getCardPreview({ slotId, imgId });
            // 与单张重画一致：缓存里没有这个版本时，用聊天里保存的记录兜底。
            if (!record && imgId) {
                const saved = getDrawSavedPreview(message, slotId, messageId, String(ctx.chatId));
                if (saved?.imgId === imgId) record = saved;
            }
            const tags = record?.tags ?? card.dataset.tags;
            if (!tags?.trim()) { claims.delete(slotId); skipped += 1; continue; }
            slotIds.push(slotId);
            // 不传历史合成负向：编译时使用当前全局负向与本图已保存的角色 uc。
            tasks.push({ scene: tags, title: record?.title ?? '', characterPrompts: record?.characterPrompts ?? [],
                orientation: record?.orientation ?? null,
                ...(provider === 'novelai' ? { sourceImage: record } : {}),
                post_prompt: record?.postPrompt ?? '',
                placement: { mode: 'existing', slotId } });
        }
        if (!tasks.length) return { submitted: 0, skipped };
        // 提交期间占住这些格子，避免对其中某一张再点“重新生成”造成重复计费。
        const batch = generatePreparedChatImages(provider, { ctx, message, messageId, sourceText, swipeIndex, tasks });
        slotIds.forEach(slotId => redraws.set(slotId, batch));
        try { await batch; } finally { slotIds.forEach(slotId => redraws.get(slotId) === batch && redraws.delete(slotId)); }
        return { submitted: tasks.length, skipped };
    } finally {
        // 批次（或失败）已经收场、各格子的占位也已释放；下面只剩收尾重绘，认领到此为止。
        floor.settled = true;
        if (slotIds.length && String(getContext().chatId) === String(ctx.chatId)) {
            await renderPreviewsForMessage(messageId, { refreshSlotIds: slotIds });
        }
    }
}

async function redraw(provider, container) {
    const target = captureImageCardTarget(container);
    const { slotId, messageId, ctx, message, swipeIndex } = target;
    if (!message || !isSceneSlotAlive(message.mes, slotId)) throw new Error(DRAW_SLOT_COPY.sourceChanged);
    const sourceText = message.mes;
    try {
        // A refresh drops runtime activity, not the submitted backend job. Do
        // not turn a journal read failure into permission for a paid resubmit.
        if ((await getPendingImageJobSlots()).has(slotId)) {
            globalThis.toastr?.info?.(DRAW_SLOT_COPY.slotBusy);
            return;
        }
        const record = await readImageCardTarget(target);
        target.assertCurrent();
        const tags = record?.tags ?? container.dataset.tags;
        if (!tags?.trim()) throw new Error(DRAW_SLOT_COPY.emptyTags);
        return await generatePreparedChatImages(provider, { ctx, message, messageId, sourceText, swipeIndex,
            tasks: [{ scene: tags, title: record?.title ?? container.dataset.title ?? '', characterPrompts: record?.characterPrompts ?? [],
                orientation: record?.orientation ?? null,
                ...(provider === 'novelai' ? { sourceImage: record } : {}),
                post_prompt: record?.postPrompt ?? '',
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
    const identity = getImageChatIdentity(ctx);
    const isCurrentTarget = () => getImageChatIdentity(getContext()) === identity
        && getContext().chat[messageId] === message && (message.swipe_id ?? 0) === swipeIndex;
    if (!message || !isCurrentTarget() || isMessageBeingEdited(messageId) || !isSceneSlotAlive(message.mes, slotId)) {
        throw new Error(DRAW_SLOT_COPY.removeTargetChanged);
    }
    // Acknowledgement is the removal itself, before the first storage/lock/network
    // await. In-flight renders compare the changed source and cannot repaint it.
    getSlotActivity(slotId)?.discard?.();
    discardChatImagePlacement(slotId);
    commitChatImageRemoval({ message, swipeIndex, slotId });
    removeDrawSavedEntry(message, slotId);
    const withdrawal = withdrawEditedImagePlacements(ctx, messageId);
    container.remove();

    try {
        await Promise.all([withdrawal, discardPendingImageSlot(slotId)]);
    } catch (cause) {
        throw new Error(DRAW_SLOT_COPY.removeLocalSaveFailed, { cause });
    }
    try {
        await withConfirmableChatMutation(ctx, async () => {
            const assertSaveTarget = () => {
                if (!isCurrentTarget() || findImageJobDeliverySlot(ctx.chat, slotId)) {
                    throw new Error(DRAW_SLOT_COPY.removeTargetChanged);
                }
            };
            assertSaveTarget();
            await saveChatAndConfirm({ ctx: { ...ctx, saveChat: () => {
                // Web Locks may wait too: never let a late deletion save B's chat.
                assertSaveTarget();
                return ctx.saveChat();
            } }, verify: persisted => !findImageJobDeliverySlot(persisted, slotId) });
        });
    } catch (cause) {
        // Keep local removal and all image records. Never silently roll back the
        // visible action or delete paid data when only the chat save is uncertain.
        throw new Error(DRAW_SLOT_COPY.removeSaveFailed, { cause });
    }
    try {
        for (const record of await getPreviewsBySlot(slotId)) await deletePreview(record.imgId);
        await clearSlotSelection(slotId);
    } catch (cause) {
        throw new Error(DRAW_SLOT_COPY.removeCleanupFailed, { cause });
    }
}
