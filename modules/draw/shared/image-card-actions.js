import { drawNotify } from './draw-toast.js';
import { getContext } from '../../../../../../extensions.js';
import { getCardPreview, deleteImageVersion, getPreviewsBySlot, getSlotSelection, getOtherImageVersions, deletePreview, clearSlotSelection, setSlotSelection } from './gallery-cache.js';
import { captureImageCardTarget, readImageCardTarget } from './image-card-target.js';
import { generatePreparedChatImages, withPreparedImageJob } from './prepared-chat-images.js';
import { getSlotActivity } from './slot-activity.js';
import { getPendingImageJobSlots, discardPendingImageSlot } from './pending-image-jobs.js';
import { discardChatImagePlacement, commitChatImageRemoval } from './chat-image-placement.js';
import { isMessageBeingEdited, renderPreviewsForMessage, removeDrawSavedEntry, clearDrawSavedEntry, getDrawSavedEntry, syncDrawSavedFromPreview, getDrawSavedPreview } from './draw-common.js';
import { withdrawEditedImagePlacements } from './chat-image-tag-migration.js';
import { getImageChatIdentity } from './chat-image-persistence.js';
import { createConfirmableChatTarget, readSavedChatBranch } from './confirmable-chat-save.js';
import { isSceneSlotAlive } from './scene-placement.js';
import { DRAW_SLOT_COPY, PreviewStatus, hasPreviewImage } from './image-record.js';
import { withDrawActionFeedback } from './draw-action-feedback.js';
import { observeBackgroundTask } from '../../../shared/common/async-errors.js';
import { drawMessageViewport } from './draw-message-viewport.js';

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
        drawNotify.error(error.message, DRAW_SLOT_COPY.restoreFailed);
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
        drawNotify.info(DRAW_SLOT_COPY.slotBusy);
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
    const root = drawMessageViewport.contentForCard(container) || container.closest('.mes_text')
        || document.querySelector(`.mes[mesid="${messageId}"] .mes_text`);
    return [...(root?.querySelectorAll('.xb-nd-img[data-state="failed"]') || [])];
}

const floorTurns = new Map();

export function redrawFloorFailedImageCards(provider, container, sequential = true) {
    const messageId = Number(container.dataset.mesid);
    const floorKey = floorRedrawKey(container);
    if (redraws.has(floorKey)) return redraws.get(floorKey);
    const floor = { claims: new Set(), settled: false };
    floorClaims.set(floorKey, floor);
    // redrawFloorFailed 在第一个 await 之前同步登记 claims；operation 随后立刻写入 redraws，
    // 期间没有其它代码可以插入，所以 claims 一出现就能对应到进行中的操作。
    const previous = sequential ? floorTurns.get(provider) : null;
    const operation = redrawFloorFailed(provider, container, messageId, floor, previous, sequential).finally(() => {
        redraws.delete(floorKey);
        floorClaims.delete(floorKey);
    });
    if (sequential) {
        // Cancelling B releases its button immediately; C still waits for A.
        const turn = Promise.all([previous, operation.then(() => {}, () => {})]).then(() => {
            if (floorTurns.get(provider) === turn) floorTurns.delete(provider);
        });
        floorTurns.set(provider, turn);
    }
    redraws.set(floorKey, operation);
    return operation;
}

// 面向按钮的入口：负责提示与错误，三个 Provider 共用。
export async function retryFloorFailedImageCards(provider, container, sequential) {
    // 同一楼层已有整楼重生在进行：本次点击只是并入同一个操作，结果和错误提示由第一次点击负责，不重复弹提示。
    const joining = redraws.has(floorRedrawKey(container));
    try {
        const result = await withDrawActionFeedback(container, () => redrawFloorFailedImageCards(provider, container, sequential));
        if (joining || !result) return;
        if (result.submitted === 0) drawNotify.info('本楼层没有可重新生成的失败图片');
        else if (result.skipped > 0) {
            drawNotify.info(`已重新生成 ${result.submitted} 张，另有 ${result.skipped} 张正在处理中已跳过`);
        }
    } catch (error) {
        if (joining) return;
        console.error(DRAW_SLOT_COPY.redrawFailed, error);
        drawNotify.error(error.message);
    }
}

async function redrawFloorFailed(provider, container, messageId, floor, previous, sequential) {
    const { claims } = floor;
    const ctx = getContext();
    const message = ctx.chat[messageId];
    if (!message) throw new Error(DRAW_SLOT_COPY.sourceChanged);
    const sourceText = message.mes;
    const swipeIndex = message.swipe_id ?? 0;
    const candidates = new Map(collectFailedImageCards(container)
        .filter(card => isSceneSlotAlive(sourceText, card.dataset.slotId))
        .map(card => [card.dataset.slotId, card.dataset.imgId || '']));
    for (const id of candidates.keys()) claims.add(id);
    const slotIds = [];
    try {
        const input = { ctx, message, messageId, sourceText, swipeIndex };
        return sequential ? await withPreparedImageJob(provider, { ...input, floorRedraw: true }, prepare)
            : await prepare(input, ready => generatePreparedChatImages(provider, ready));
    } finally {
        floor.settled = true;
        if (slotIds.length && String(getContext().chatId) === String(ctx.chatId)) {
            const repaint = renderPreviewsForMessage(messageId, { refreshSlotIds: slotIds });
            if (sequential) observeBackgroundTask(repaint, { source: import.meta.url, operation: 'refreshRedrawnFloor' });
            else await repaint;
        }
    }

    async function prepare(owned, execute) {
        const signal = owned.job?.controller.signal;
        if (previous && signal && !signal.aborted) {
            let wake;
            const cancelled = new Promise(resolve => { wake = resolve; });
            signal.addEventListener('abort', wake, { once: true });
            try { await Promise.race([previous, cancelled]); }
            finally { signal.removeEventListener('abort', wake); }
        } else if (previous && !signal) await previous;
        const finishWithoutSending = () => owned.onStateChange?.('success', { total: 0, success: 0, aborted: true });
        if (signal?.aborted) { finishWithoutSending(); return; }
        if (getContext().chat[messageId] !== message || (message.swipe_id ?? 0) !== swipeIndex) throw new Error(DRAW_SLOT_COPY.sourceChanged);
        // 与单张重画一致：读不到后台任务日志时不当作“可以重新计费”。
        const pendingSlots = await getPendingImageJobSlots();
        const tasks = [];
        const liveCards = collectFailedImageCards(container);
        for (const card of liveCards) {
            const slotId = card.dataset.slotId;
            const imgId = card.dataset.imgId || '';
            if (candidates.get(slotId) !== imgId || redraws.has(slotId) || getSlotActivity(slotId) || pendingSlots.has(slotId)) continue;
            const selected = await getSlotSelection(slotId);
            if (selected && selected !== imgId) continue;
            let record = await getCardPreview({ slotId, imgId });
            // 与单张重画一致：缓存里没有这个版本时，用聊天里保存的记录兜底。
            if (!record && imgId) {
                const saved = getDrawSavedPreview(message, slotId, messageId, String(ctx.chatId));
                if (saved?.imgId === imgId) record = saved;
            }
            const tags = record?.tags ?? card.dataset.tags;
            if (!tags?.trim() || hasPreviewImage(record)) continue;
            // 不传历史合成负向：编译时使用当前全局负向与本图已保存的角色 uc。
            tasks.push({ scene: tags, title: record?.title ?? '', characterPrompts: record?.characterPrompts ?? [],
                chars: record?.continuityChars ?? [],
                orientation: record?.orientation ?? null,
                ...(provider === 'novelai' ? { sourceImage: record } : {}),
                post_prompt: record?.postPrompt ?? '',
                placement: { mode: 'existing', slotId } });
        }
        // The last asynchronous lookup may also have replaced an earlier card.
        const current = new Map(collectFailedImageCards(container).map(card => [card.dataset.slotId, card.dataset.imgId || '']));
        const ready = tasks.filter(({ placement: { slotId } }) => current.get(slotId) === candidates.get(slotId)
            && isSceneSlotAlive(message.mes, slotId));
        slotIds.push(...ready.map(task => task.placement.slotId));
        for (const id of candidates.keys()) if (!slotIds.includes(id)) claims.delete(id);
        const skipped = candidates.size - ready.length;
        if (signal?.aborted) { finishWithoutSending(); return; }
        if (!ready.length) { finishWithoutSending(); return { submitted: 0, skipped }; }
        // 提交期间占住这些格子，避免对其中某一张再点“重新生成”造成重复计费。
        if (owned.job) owned.job.total = ready.length;
        const batch = Promise.resolve(execute({ ...owned, tasks: ready }));
        slotIds.forEach(slotId => redraws.set(slotId, batch));
        try { await batch; } finally { slotIds.forEach(slotId => redraws.get(slotId) === batch && redraws.delete(slotId)); }
        return { submitted: ready.length, skipped };
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
            drawNotify.info(DRAW_SLOT_COPY.slotBusy);
            return;
        }
        const record = await readImageCardTarget(target);
        target.assertCurrent();
        const tags = record?.tags ?? container.dataset.tags;
        if (!tags?.trim()) throw new Error(DRAW_SLOT_COPY.emptyTags);
        return await generatePreparedChatImages(provider, { ctx, message, messageId, sourceText, swipeIndex,
            tasks: [{ scene: tags, title: record?.title ?? container.dataset.title ?? '', characterPrompts: record?.characterPrompts ?? [],
                orientation: record?.orientation ?? null,
                // 供应商侧成功后回写画面记忆（上镜锚点）需要规划时的原始角色快照
                chars: Array.isArray(record?.continuityChars) ? record.continuityChars : [],
                ...(provider === 'novelai' ? { sourceImage: record } : {}),
                post_prompt: record?.postPrompt ?? '',
                placement: { mode: 'existing', slotId } }] });
    } finally {
        if (String(getContext().chatId) === String(ctx.chatId)) await renderPreviewsForMessage(messageId, { refreshSlotIds: [slotId] });
    }
}

export function deleteCardImageVersion(container) {
    return deleteImageVersion(captureImageCardTarget(container));
}

export async function deleteImageFromCard(container) {
    if (!globalThis.confirm(DRAW_SLOT_COPY.deleteImageConfirm)) return;
    try { await deleteCardImageVersion(container); }
    catch (error) { drawNotify.error(error.message); }
}

// 移除同层：本楼层（当前 swipe）上所有“失败 / 不可用”的图位，逐个走与单张“移除”相同的流程。
// 跳过三类：正在绘制 / 有后台任务 / 被整楼重生占用的图位；还有更早成功版本的图位（移除会连旧图一起删，
// 这类请用卡片上的“返回已有图片”或单张“移除”）。已成功的图不受影响。
const FLOOR_REMOVE_PREFIX = 'floor-remove:';

export function removeFloorFailedImageCards(container, { confirmRemoval = message => globalThis.confirm(message) } = {}) {
    const key = `${FLOOR_REMOVE_PREFIX}${getContext().chatId}:${Number(container.dataset.mesid)}`;
    if (redraws.has(key)) return redraws.get(key);
    const claimed = [];
    // 槽位占用令牌：先于第一次占位创建；别处点“重新生成”会并入它，等这次移除结束。
    let finish;
    const token = new Promise((resolve) => { finish = resolve; });
    const operation = removeFloorFailed(container, confirmRemoval, claimed, token).catch((error) => {
        console.error(DRAW_SLOT_COPY.removeFailed, error);
        drawNotify.error(error.message);
        return { removed: 0, skipped: 0, failed: 1 };
    }).finally(() => {
        for (const slotId of claimed) if (redraws.get(slotId) === token) redraws.delete(slotId);
        if (redraws.get(key) === operation) redraws.delete(key);
        finish();
    });
    redraws.set(key, operation);
    return operation;
}

async function removeFloorFailed(container, confirmRemoval, claimed, token) {
    const ctx = getContext();
    const messageId = Number(container.dataset.mesid);
    const message = ctx.chat?.[messageId];
    const identity = getImageChatIdentity(ctx);
    const swipe = message?.swipe_id ?? 0;
    const isCurrent = () => getImageChatIdentity(getContext()) === identity && getContext().chat?.[messageId] === message
        && (message?.swipe_id ?? 0) === swipe && !isMessageBeingEdited(messageId);
    if (!message || !isCurrent()) {
        drawNotify.error(DRAW_SLOT_COPY.removeTargetChanged);
        return { removed: 0, skipped: 0, failed: 0 };
    }
    const floorClaim = floorClaims.get(floorRedrawKey(container));
    const cards = collectFailedImageCards(container).filter(card => isSceneSlotAlive(message.mes, card.dataset.slotId));
    // 第一个 await 之前同步占位：之后另一处点“重新生成”会并入这次占用，不会提交付费请求再被丢弃。
    const removable = [];
    let unknown = 0;
    let skipped = 0;
    for (const card of cards) {
        const slotId = card.dataset.slotId;
        if (redraws.has(slotId) || getSlotActivity(slotId) || floorClaim?.claims.has(slotId)) { skipped += 1; continue; }
        redraws.set(slotId, token);
        claimed.push(slotId);
        removable.push(card);
    }
    const release = (card) => {
        const slotId = card.dataset.slotId;
        if (redraws.get(slotId) === token) redraws.delete(slotId);
        claimed.splice(claimed.indexOf(slotId), 1);
        removable.splice(removable.indexOf(card), 1);
        skipped += 1;
    };
    const pendingSlots = await getPendingImageJobSlots();
    for (const card of [...removable]) {
        const slotId = card.dataset.slotId;
        const older = getDrawSavedEntry(message, slotId) || (await getOtherImageVersions(slotId)).length;
        if (pendingSlots.has(slotId) || older) release(card);
        else if ((await getCardPreview({ slotId, imgId: card.dataset.imgId }))?.status === PreviewStatus.UNKNOWN) unknown++;
    }
    if (!isCurrent()) throw new Error(DRAW_SLOT_COPY.removeTargetChanged);
    if (!removable.length) {
        drawNotify.info(skipped ? DRAW_SLOT_COPY.removeFloorBusy : DRAW_SLOT_COPY.removeFloorNone);
        return { removed: 0, skipped, failed: 0 };
    }
    if (!confirmRemoval(DRAW_SLOT_COPY.removeFloorConfirm(removable.length, unknown, skipped))) return { removed: 0, skipped, failed: 0, cancelled: true };
    let removed = 0;
    let failed = 0;
    let firstError = '';
    const removedSlots = [];
    const saveTarget = createConfirmableChatTarget(ctx);
    for (const card of removable) {
        // 槽位已被本操作占住，唯一可能变忙的是外部写入的活动状态：忙就跳过，不走 removeChatImageSlot 里的 discard。
        const slotId = card.dataset.slotId;
        const pending = await getPendingImageJobSlots();
        const versions = await getOtherImageVersions(slotId);
        if (!isCurrent()) { failed += 1; firstError ||= DRAW_SLOT_COPY.removeTargetChanged; break; }
        if (getSlotActivity(slotId) || pending.has(slotId) || versions.length || getDrawSavedEntry(message, slotId)) { skipped += 1; continue; }
        try { await withdrawChatImageSlot(card).withdrawal; removedSlots.push(slotId); }
        catch (error) {
            failed += 1;
            console.error(DRAW_SLOT_COPY.removeFailed, error);
            firstError ||= error.message;
        }
    }
    if (removedSlots.length) {
        try {
            if (!isCurrent()) throw new Error(DRAW_SLOT_COPY.removeTargetChanged);
            await ctx.saveChat();
            // Both hosts can resolve saveChat after a failed save. Keep the redraw inputs
            // until the original chat actually contains the removal.
            const savedText = (await readSavedChatBranch(saveTarget, ctx.getRequestHeaders(), messageId, swipe))?.mes;
            if (typeof savedText !== 'string' || removedSlots.some(id => isSceneSlotAlive(savedText, id))) throw new Error(DRAW_SLOT_COPY.removeSaveFailed);
            for (const id of removedSlots) {
                if (!isCurrent()) throw new Error(DRAW_SLOT_COPY.removeTargetChanged);
                await deleteSlotRecords(id, true);
                removed++;
            }
        } catch (error) { failed += removedSlots.length - removed; firstError ||= error.message; }
    }
    if (failed) drawNotify.error(`${DRAW_SLOT_COPY.removeFailed}：${firstError}`);
    else if (removed || skipped) drawNotify.success(DRAW_SLOT_COPY.removeFloorResult(removed, skipped));
    return { removed, skipped, failed };
}
function withdrawChatImageSlot(container) {
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
    return { slotId, withdrawal };
}

async function deleteSlotRecords(slotId, failedOnly) {
    for (const record of await getPreviewsBySlot(slotId)) await deletePreview(record.imgId, { failedOnly });
    if (!failedOnly) await clearSlotSelection(slotId);
}

export async function removeChatImageSlot(container) {
    const { slotId, withdrawal } = withdrawChatImageSlot(container);
    // 正文里的图位由酒馆自动保存带走；这里只清本地记录。保存前刷新最多留一张找不到图的卡，可以再移除一次。
    try {
        await Promise.all([withdrawal, discardPendingImageSlot(slotId)]);
        await deleteSlotRecords(slotId, false);
    } catch (cause) {
        throw new Error(DRAW_SLOT_COPY.removeCleanupFailed, { cause });
    }
}
