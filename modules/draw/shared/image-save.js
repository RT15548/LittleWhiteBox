// 生成图片保存到酒馆的唯一出口：手动保存、自动保存、画廊保存都经过这里，文件夹规则才会一致。
// 规则与降级见 image-save-core.js；插件契约见 server-plugin/littlewhitebox-server/README.md。
import { getContext } from '../../../../../../extensions.js';
import { saveBase64AsFile } from '../../../../../../utils.js';
import { fetchImageBackendJobsStatus } from './backend-image-jobs.js';
import { getSharedDrawSettings } from './draw-settings.js';
import { createImageSaver } from './image-save-core.js';

const getHeaders = () => getContext().getRequestHeaders();

const saver = createImageSaver({
    saveBase64AsFile,
    fetchImpl: (url, options) => globalThis.fetch(url, options),
    getHeaders,
    getStatus: () => fetchImageBackendJobsStatus({ getHeaders }),
    getSettings: getSharedDrawSettings,
    warn: text => globalThis.toastr?.warning(text),
});

/** 当前聊天对应的角色名（群聊为群 id），与酒馆上传时用作文件夹的名字一致。 */
export function getImageFolderName() {
    const ctx = getContext();
    if (ctx.groupId) return String(ctx.groups?.[ctx.groupId]?.id ?? 'group');
    return String(ctx.characters?.[ctx.characterId]?.name || 'character');
}

/** 保存一张图，返回保存后的路径（与 saveBase64AsFile 同形）。 */
export const saveImageToServer = saver.save;

/** 点“打开文件夹”：返回 { state, text }，由各页面显示在自己的状态位置。 */
export async function openImageFolder() {
    try {
        return await saver.openFolder();
    } catch (error) {
        console.warn('[ImageSave] 打开文件夹失败:', error);
        return { state: 'error', text: `打开文件夹失败：${error?.message || error}` };
    }
}
