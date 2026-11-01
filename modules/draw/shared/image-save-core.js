// 生成图片保存到酒馆的规则：什么时候用后端插件、插件不在时怎么办、怎么“打开文件夹”。
// 本文件不依赖酒馆模块（便于单测），酒馆接线见 image-save.js。
import { SERVER_PLUGIN_BASE } from '../../../shared/server-plugin/identity.js';

export const IMAGE_SAVE_CAPABILITY = 'image-save-v1';
export const OPEN_FOLDER_CAPABILITY = 'open-folder-v1';
const STATUS_TTL_MS = 60_000;
const STATUS_FAILURE_TTL_MS = 10_000;
const WARN_INTERVAL_MS = 30_000;

export const IMAGE_SAVE_COPY = Object.freeze({
    autoLabel: '自动保存新生成的图片',
    autoHint: '新生成的图片自动保存到酒馆',
    folderLabel: '图片按日期保存',
    folderHint: '保存目录改为“角色名/年_月_日”，须安装 littlewhitebox-server 插件',
    openFolder: '打开文件夹',
    saved: '已保存',
    saveFailed: '保存失败，请重试',
    dateSaveInactive: '未检测到 littlewhitebox-server 插件，按日期保存未生效',
    autoSaveFailed: '自动保存图片失败，图片仍在图库里，可手动保存',
    opened: '已打开图片目录',
    openNeedsPlugin: '打开文件夹需要安装 littlewhitebox-server 插件',
    openNotLocal: '酒馆不在本机，无法直接打开',
    openFailed: '系统没能打开文件夹',
});

export function formatFolderDate(date) {
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}_${pad(date.getMonth() + 1)}_${pad(date.getDate())}`;
}

/** 切换“自动保存新生成的图片”：只在开关真的变化时记下开启时刻，关闭则清零。 */
export function setAutoSaveImages(draft, enabled, now = Date.now()) {
    if (draft.autoSaveImages === enabled) return;
    draft.autoSaveImages = enabled;
    draft.autoSaveImagesSince = enabled ? now : 0;
}

/** 按日期保存的文件夹（用户图片目录下的逐级名字）：角色名/年_月_日（如 苍玄界/2026_11_01，下划线格式 YYYY_MM_DD）。 */
export function dateFolder(charName, date) {
    return [charName, formatFolderDate(date)];
}

/**
 * @param {object} deps
 * @param {(base64: string, folder: string, name: string, ext: string) => Promise<string>} deps.saveBase64AsFile 酒馆自带上传
 * @param {typeof fetch} deps.fetchImpl
 * @param {() => Record<string, string>} deps.getHeaders
 * @param {() => Promise<{ ready: boolean, capabilities?: string[] }>} deps.getStatus 插件 /status
 * @param {() => { saveImagesByFolder?: boolean }} deps.getSettings
 */
export function createImageSaver({ saveBase64AsFile, fetchImpl, getHeaders, getStatus, getSettings,
    now = Date.now, warn = () => {} }) {
    let cached = null;
    let lastWarnAt = -Infinity;

    async function capabilities() {
        if (cached && cached.expires > now()) return cached.set;
        const status = await getStatus().catch(() => ({ ready: false }));
        const set = new Set(status?.ready ? status.capabilities : []);
        cached = { set, expires: now() + (status?.ready ? STATUS_TTL_MS : STATUS_FAILURE_TTL_MS) };
        return set;
    }

    async function post(route, body) {
        const response = await fetchImpl(`${SERVER_PLUGIN_BASE}${route}`, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify(body),
        });
        return { response, data: await response.json().catch(() => null) };
    }

    // 按日期保存没生效时不丢图：照常存到默认文件夹（角色名），只做限频提示。
    function saveToDefaultFolder({ base64, charName, fileName, format }) {
        if (now() - lastWarnAt >= WARN_INTERVAL_MS) { lastWarnAt = now(); warn(IMAGE_SAVE_COPY.dateSaveInactive); }
        return saveBase64AsFile(base64, charName, fileName, format);
    }

    return {
        /** 保存一张图，返回与酒馆上传接口同形的路径。未开“按日期保存”时与直接调用 saveBase64AsFile 完全一致。 */
        async save({ base64, charName, fileName, format }) {
            if (getSettings().saveImagesByFolder !== true) return saveBase64AsFile(base64, charName, fileName, format);
            if (!(await capabilities()).has(IMAGE_SAVE_CAPABILITY)) return saveToDefaultFolder({ base64, charName, fileName, format });
            const { response, data } = await post('/v1/images/save', {
                image: base64, format, filename: String(fileName).replace(/\./g, '_'), folder: dateFolder(charName, new Date(now())),
            });
            if (response.ok && data?.path) return data.path;
            if (response.status !== 404) throw new Error(data?.error || `HTTP ${response.status}`);
            // 插件被降级或移除：丢掉探测缓存，这一张照常存到默认文件夹，不让保存失败。
            cached = null;
            return saveToDefaultFolder({ base64, charName, fileName, format });
        },

        /** 在酒馆所在机器上打开图片根目录（user/images）；返回 { state, text } 供页面显示。 */
        async openFolder() {
            if (!(await capabilities()).has(OPEN_FOLDER_CAPABILITY)) return { state: 'error', text: IMAGE_SAVE_COPY.openNeedsPlugin };
            const { data } = await post('/v1/images/open-folder', {});
            if (data?.ok) return { state: 'success', text: IMAGE_SAVE_COPY.opened };
            return { state: 'error', text: data?.code === 'not_local' ? IMAGE_SAVE_COPY.openNotLocal : IMAGE_SAVE_COPY.openFailed };
        },
    };
}
