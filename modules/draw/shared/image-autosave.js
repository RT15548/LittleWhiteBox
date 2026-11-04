// “自动保存新生成的图片”：图片刚送达图库或楼层后，开了开关就把它存进酒馆，效果同手动点“保存”。
// 只处理开关打开之后生成的新图，从不扫描旧缓存：开关本身不触发任何保存，只有各处“送达之后”的调用才会走到这里。
// 三家画图的楼层配图、文本配图和后台接回都在各自送达之后调用；已保存的图（有 savedUrl）不会重复保存。
import { getPreview, getSlotSelection, savePreviewImage } from './gallery-cache.js';
import { renderPreviewsForMessage, syncDrawSavedFromPreview } from './draw-common.js';
import { getSharedDrawSettings } from './draw-settings.js';
import { IMAGE_SAVE_COPY } from './image-save-core.js';

const FILE_PREFIX = Object.freeze({ novelai: 'novel', 'sd-webui': 'sd', sdwebui: 'sd', comfyui: 'comfy' });
const WARN_INTERVAL_MS = 30_000;
let lastWarnAt = 0;

/** 与各家手动保存同名的文件名前缀（novel_ / sd_ / comfy_）。 */
export const imageFilePrefix = provider => FILE_PREFIX[provider] || 'draw';

function warnOnce() {
    if (Date.now() - lastWarnAt < WARN_INTERVAL_MS) return;
    lastWarnAt = Date.now();
    globalThis.toastr?.warning(IMAGE_SAVE_COPY.autoSaveFailed);
}

// 保存成功后，让楼层里的这张图改用已保存的文件，并把“已保存”写回聊天（与手动保存相同）。
// 仅当这张图仍是该槽位正在显示的那张、且仍在原来的聊天里才写；失败只记日志，不算保存失败。
async function syncChatSavedEntry({ imgId, slotId, savedUrl, chatTarget }) {
    try {
        const saved = await getPreview(imgId);
        if (await getSlotSelection(slotId) !== imgId) return;
        const target = chatTarget();
        if (!target) return;
        await syncDrawSavedFromPreview(target.messageId, saved, { slotId, savedUrl });
        if (chatTarget()?.messageId === target.messageId) {
            await renderPreviewsForMessage(target.messageId, { refreshSlotIds: [slotId] });
        }
    } catch (error) {
        console.warn('[ImageAutoSave] 同步楼层的已保存状态失败:', error);
    }
}

/**
 * @param {object} options
 * @param {string} options.imgId
 * @param {string} options.slotId
 * @param {string} options.filePrefix 见 imageFilePrefix
 * @param {number} [options.generatedAt] 这张图的生成（任务提交）时刻，早于开启开关的时刻就不保存；默认就是现在
 * @param {() => ({ messageId: number } | null)} [options.chatTarget] 保存完成后再取：这张图所在的聊天楼层，没有则不写聊天
 * @returns {Promise<boolean>} 本次是否保存了图片；任何失败都不会抛出，不影响出图流程。
 */
export async function autoSaveDeliveredImage({ imgId, slotId, filePrefix, generatedAt = Date.now(), chatTarget = () => null }) {
    const { autoSaveImages, autoSaveImagesSince } = getSharedDrawSettings();
    if (autoSaveImages !== true || generatedAt < autoSaveImagesSince) return false;
    try {
        const preview = await getPreview(imgId);
        if (!preview?.base64 || preview.savedUrl) return false;
        const current = getSharedDrawSettings();
        if (current.autoSaveImages !== true || generatedAt < current.autoSaveImagesSince) return false;
        const savedUrl = await savePreviewImage(imgId, filePrefix);
        await syncChatSavedEntry({ imgId, slotId, savedUrl, chatTarget });
        return true;
    } catch (error) {
        console.warn('[ImageAutoSave] 自动保存失败:', error);
        warnOnce();
        return false;
    }
}
