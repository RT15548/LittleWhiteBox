// 图片管理里“自动保存 / 按日期保存 / 打开文件夹”三个控件的事件绑定（SD、ComfyUI 共用；
// NovelAI 的页面在 iframe 里，经宿主消息处理，见 novel-draw-page.js）。
import { observeAsyncCallback } from '../../../shared/common/async-errors.js';
import { IMAGE_SAVE_COPY, setAutoSaveImages } from './image-save-core.js';

/**
 * @param {object} options
 * @param {object|null} options.autoSave 勾选框元素
 * @param {object|null} options.folder 勾选框元素
 * @param {object|null} options.openButton 按钮元素
 * @param {() => { autoSaveImages?: boolean, saveImagesByFolder?: boolean }} options.getSettings
 * @param {(mutator: (draft: object) => void) => Promise<boolean>} options.saveSettings 保存共享画图设置
 * @param {(state: string, text: string) => void} options.report 显示状态文字
 * @param {() => Promise<{ state: string, text: string }>} options.openFolder
 * @returns {() => void} 按当前设置重画两个勾选框
 */
export function bindImageSaveControls({ autoSave, folder, openButton, getSettings, saveSettings, report, openFolder }) {
    const toggles = [[autoSave, 'autoSaveImages'], [folder, 'saveImagesByFolder']];
    const sync = () => {
        for (const [input, key] of toggles) if (input) input.checked = getSettings()[key] === true;
    };
    for (const [input, key] of toggles) {
        input?.addEventListener('change', observeAsyncCallback(async () => {
            const next = input.checked === true;
            input.disabled = true;
            const ok = await saveSettings((draft) => { if (key === 'autoSaveImages') setAutoSaveImages(draft, next); else draft[key] = next; });
            report(ok ? 'success' : 'error', ok ? IMAGE_SAVE_COPY.saved : IMAGE_SAVE_COPY.saveFailed);
            sync();
            input.disabled = false;
        }, { source: import.meta.url, operation: 'saveImageSaveSetting' }));
    }
    openButton?.addEventListener('click', observeAsyncCallback(async () => {
        openButton.disabled = true;
        const { state, text } = await openFolder();
        report(state, text);
        openButton.disabled = false;
    }, { source: import.meta.url, operation: 'openImageFolder' }));
    return sync;
}
