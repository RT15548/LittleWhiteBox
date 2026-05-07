import { NovelDrawStorage } from "../../../core/server-storage.js";

// 历史兼容：共享画图设置仍存放在 LittleWhiteBox_NovelDraw.json/settings。
// 不改文件名，避免迁移用户数据；这里仅抽出 provider-neutral 字段读写。
const SERVER_FILE_KEY = 'settings';

const DEFAULT_SHARED_DRAW_SETTINGS = {
    llmApi: { provider: 'st', url: '', key: '', model: '', modelCache: [] },
    useStream: false,
    useWorldInfo: false,
    advancedMode: false,
    timeout: 120000,
    characterTags: [],
    messageFilterRules: [],
    worldbooks: { enabled: false, uploadedBooks: [], keywordFilterMode: 'auto' },
    paramsPresets: [],
    selectedParamsPresetId: null,
    disablePrefill: false,
};

let settingsCache = null;
let settingsLoaded = false;

function cloneSettingsObject(obj) {
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
}

function normalizeCharacterOutfits(outfits = []) {
    return (Array.isArray(outfits) ? outfits : [])
        .map(outfit => ({
            name: String(outfit?.name || '').trim(),
            tags: String(outfit?.tags || '').trim(),
        }))
        .filter(outfit => outfit.name || outfit.tags);
}

function normalizeSharedDrawSettings(saved = {}) {
    const merged = {
        ...saved,
        llmApi: { ...DEFAULT_SHARED_DRAW_SETTINGS.llmApi, ...(saved.llmApi || {}) },
        worldbooks: { ...DEFAULT_SHARED_DRAW_SETTINGS.worldbooks, ...(saved.worldbooks || {}) },
    };

    if (!Array.isArray(merged.worldbooks.uploadedBooks)) merged.worldbooks.uploadedBooks = [];
    if (!Array.isArray(merged.paramsPresets)) merged.paramsPresets = [];
    if (!Array.isArray(merged.messageFilterRules)) merged.messageFilterRules = [];
    merged.messageFilterRules = merged.messageFilterRules
        .filter(rule => rule && typeof rule === 'object')
        .map(rule => ({ start: String(rule.start || ''), end: String(rule.end || '') }));

    merged.characterTags = (merged.characterTags || []).map(char => ({
        id: char.id || `char-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: char.name || '',
        aliases: Array.isArray(char.aliases) ? char.aliases : [],
        type: char.type || 'girl',
        appearance: char.appearance || char.tags || '',
        negativeTags: char.negativeTags || '',
        danbooruTag: char.danbooruTag || '',
        outfits: normalizeCharacterOutfits(char.outfits || char.costumes || char.clothes || []),
    }));

    return { ...DEFAULT_SHARED_DRAW_SETTINGS, ...merged };
}

export async function loadSharedDrawSettings() {
    if (settingsLoaded && settingsCache) return settingsCache;

    try {
        const saved = await NovelDrawStorage.get(SERVER_FILE_KEY, null);
        settingsCache = normalizeSharedDrawSettings(saved || {});
    } catch (error) {
        console.error('[DrawSettings] 加载共享画图设置失败:', error);
        settingsCache = normalizeSharedDrawSettings({});
    }

    settingsLoaded = true;
    return settingsCache;
}

export function getSharedDrawSettings() {
    if (!settingsCache) {
        settingsCache = normalizeSharedDrawSettings({});
    }
    return settingsCache;
}

export async function updateSharedDrawSettingsPersistent(mutator, okText = '已保存', options = {}) {
    const { notify = false, silent = true } = options;
    const current = await loadSharedDrawSettings();
    const draft = cloneSettingsObject(current);

    if (typeof mutator === 'function') {
        await mutator(draft);
    }

    const next = normalizeSharedDrawSettings(draft);
    next.updatedAt = Date.now();

    try {
        const ok = await NovelDrawStorage.setAndSave(SERVER_FILE_KEY, next, { silent });
        if (ok !== false) {
            settingsCache = next;
            if (notify && window.toastr) toastr.success(okText);
            return true;
        }
        if (notify && window.toastr) toastr.error('保存失败');
        return false;
    } catch (error) {
        console.error('[DrawSettings] 保存共享画图设置失败:', error);
        if (notify && window.toastr) toastr.error(`保存失败：${error?.message || '网络异常'}`);
        return false;
    }
}

export function getActiveSharedParamsPreset() {
    const settings = getSharedDrawSettings();
    return settings.paramsPresets.find(p => p.id === settings.selectedParamsPresetId)
        || settings.paramsPresets[0]
        || { maxImages: 0, maxCharactersPerImage: 0 };
}
