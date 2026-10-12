// 共享画图设置与 NovelAI Provider 设置共用现行 settings 根对象；此模块只拥有通用字段。
import { normalizeGroupPresetState } from './character-group-presets.js';
import { normalizeCharacterLibrary } from './character-library.js';
import { normalizePlannerRetry } from './planner-retry.js';

const SERVER_FILE_KEY = 'settings';
export const DEFAULT_SHARED_GALLERY_CACHE_DAYS = 3;

const DEFAULT_SHARED_DRAW_SETTINGS = {
    cacheDays: DEFAULT_SHARED_GALLERY_CACHE_DAYS,
    useWorldInfo: false,
    timeout: 120000,
    plannerMaxRetries: 3,
    characterTags: [],
    characterGroups: [],
    characterGroupPresets: [],
    characterGroupPresetApplied: null,
    danbooruLocalDB: false,
    messageFilterRules: [],
    worldbooks: { enabled: false, uploadedBooks: [], keywordFilterMode: 'auto' },
    updatedAt: 0,
};

const NOVEL_DRAW_PROVIDER_SETTING_KEYS = new Set([
    'configVersion',
    'mode',
    'apiKey',
    'apiBaseUrl',
    'sendMode',
    'useImageBackendJobs',
    'insecureTLS',
    'selectedParamsPresetId',
    'paramsPresets',
    'requestDelay',
    'autoLearnCharacters',
    'autoLearnMode',
    'autoLearnGroupId',
    'overrideSize',
    'showFloorButton',
    'showFloatingButton',
    'advancedMode',
    'promptPresets',
    'selectedPromptPresetId',
    '_promptTemplateVersion',
]);

let settingsCache = null;
let settingsLoaded = false;
let storagePromise = null;

async function getStorage() {
    storagePromise ||= import('../../../core/server-storage.js')
        .then((module) => module.NovelDrawStorage);
    return storagePromise;
}

function cloneSettingsObject(obj) {
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
}

export function normalizeSharedCacheDays(value, fallback = DEFAULT_SHARED_GALLERY_CACHE_DAYS) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(30, Math.max(1, Math.round(number)));
}

export function normalizeSharedDrawSettings(saved = {}) {
    const source = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    const rawWorldbooks = source.worldbooks && typeof source.worldbooks === 'object'
        && !Array.isArray(source.worldbooks)
        ? source.worldbooks
        : {};
    const messageFilterRules = (Array.isArray(source.messageFilterRules) ? source.messageFilterRules : [])
        .filter(rule => rule && typeof rule === 'object')
        .map(rule => ({ start: String(rule.start || ''), end: String(rule.end || '') }));
    const characterLibrary = normalizeCharacterLibrary({
        characters: source.characterTags,
        groups: source.characterGroups,
    });
    // 预设里指向已删除分组的键在这里清理；applied 记录指向不存在的预设时置空。
    const groupPresetState = normalizeGroupPresetState({
        presets: source.characterGroupPresets,
        applied: source.characterGroupPresetApplied,
    }, { groupIds: characterLibrary.groups.map(group => group.id) });
    const timeout = Number(source.timeout);

    return {
        cacheDays: normalizeSharedCacheDays(source.cacheDays),
        useWorldInfo: source.useWorldInfo === true,
        timeout: Number.isFinite(timeout) && timeout > 0
            ? Math.min(600000, Math.max(10000, Math.floor(timeout)))
            : DEFAULT_SHARED_DRAW_SETTINGS.timeout,
        plannerMaxRetries: normalizePlannerRetry({ maxRetries: source.plannerMaxRetries }).maxRetries,
        characterTags: characterLibrary.characters,
        characterGroups: characterLibrary.groups,
        characterGroupPresets: groupPresetState.presets,
        characterGroupPresetApplied: groupPresetState.applied,
        danbooruLocalDB: source.danbooruLocalDB === true,
        messageFilterRules,
        worldbooks: {
            enabled: rawWorldbooks.enabled === true,
            uploadedBooks: Array.isArray(rawWorldbooks.uploadedBooks) ? rawWorldbooks.uploadedBooks : [],
            keywordFilterMode: rawWorldbooks.keywordFilterMode === 'all_active' ? 'all_active' : 'auto',
        },
        updatedAt: Number(source.updatedAt) || 0,
    };
}

function pickNovelDrawProviderSettings(value) {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    return Object.fromEntries(
        Object.entries(source).filter(([key]) => NOVEL_DRAW_PROVIDER_SETTING_KEYS.has(key)),
    );
}

export function mergeSharedDrawSettingsIntoStorageRoot(storageValue, sharedSettings) {
    return {
        ...pickNovelDrawProviderSettings(storageValue),
        ...normalizeSharedDrawSettings(sharedSettings),
    };
}

export function mergeNovelDrawProviderSettingsIntoStorageRoot(storageValue, providerSettings) {
    return {
        ...pickNovelDrawProviderSettings(providerSettings),
        ...normalizeSharedDrawSettings(storageValue),
    };
}

export async function loadSharedDrawSettings() {
    if (settingsLoaded && settingsCache) return settingsCache;

    try {
        const storage = await getStorage();
        const saved = await storage.getStrict(SERVER_FILE_KEY, null);
        settingsCache = normalizeSharedDrawSettings(saved || {});
    } catch (error) {
        console.error('[DrawSettings] 加载共享画图设置失败:', error);
        settingsCache = null;
        settingsLoaded = false;
        if (window.toastr) toastr.error('无法读取共享画图配置，已禁止保存，请稍后重试');
        throw error;
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
    if (!settingsLoaded || !settingsCache) {
        console.error('[DrawSettings] 配置尚未成功加载，拒绝保存');
        if (window.toastr) toastr.error('共享画图配置尚未成功加载，已禁止保存');
        return false;
    }
    const previous = cloneSettingsObject(settingsCache);

    try {
        const storage = await getStorage();
        const ok = await storage.updateAndSave(async (storageRoot) => {
            const saved = storageRoot[SERVER_FILE_KEY];
            const current = normalizeSharedDrawSettings(saved || settingsCache);
            const draft = cloneSettingsObject(current);
            if (typeof mutator === 'function') {
                await mutator(draft);
            }
            const next = normalizeSharedDrawSettings(draft);
            next.updatedAt = Date.now();
            settingsCache = next;
            storageRoot[SERVER_FILE_KEY] = mergeSharedDrawSettingsIntoStorageRoot(saved, next);
        }, { silent });
        if (ok !== false) {
            if (notify && window.toastr) toastr.success(okText);
            return true;
        }
        if (notify && window.toastr) toastr.error('保存失败');
        settingsCache = previous;
        return false;
    } catch (error) {
        console.error('[DrawSettings] 保存共享画图设置失败:', error);
        settingsCache = previous;
        if (notify && window.toastr) toastr.error(`保存失败：${error?.message || '网络异常'}`);
        return false;
    }
}
