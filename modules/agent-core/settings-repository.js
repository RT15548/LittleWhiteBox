import { normalizeWebSettings } from './web/settings.js';
import {
    AGENT_SETTINGS_CONFIG_VERSION,
    normalizeAgentSettings,
    normalizeJsApiPermission,
    normalizePresetName,
} from './config.js';

export const SHARED_AGENT_SETTINGS_KEY = 'settings';

let assistantStoragePromise = null;

function describeError(error) {
    return error instanceof Error ? error.message : String(error || 'unknown_error');
}

async function resolveStorage(storage) {
    if (storage) return storage;
    assistantStoragePromise ||= import('../../core/server-storage.js')
        .then((storageModule) => storageModule.AssistantStorage)
        .catch((error) => {
            assistantStoragePromise = null;
            throw error;
        });
    return await assistantStoragePromise;
}

async function readSettingsValue(storage) {
    if (typeof storage?.getStrict === 'function') {
        return await storage.getStrict(SHARED_AGENT_SETTINGS_KEY, null);
    }
    return await storage.get(SHARED_AGENT_SETTINGS_KEY, null);
}

export function mergeSharedAgentSettings(current = {}, patch = {}, options = {}) {
    const normalizeOptions = options.normalizeOptions || {};
    const normalizedCurrent = normalizeAgentSettings(current || {}, normalizeOptions);
    const requestedUpdatedAt = Number(options.now?.() ?? Date.now());
    const updatedAt = Math.max(
        Number.isFinite(requestedUpdatedAt) ? requestedUpdatedAt : 0,
        Number(normalizedCurrent.updatedAt || 0) + 1,
    );
    return normalizeAgentSettings({
        ...normalizedCurrent,
        workspaceFileName: patch.workspaceFileName ?? normalizedCurrent.workspaceFileName,
        jsApiPermission: normalizeJsApiPermission(patch.jsApiPermission ?? normalizedCurrent.jsApiPermission),
        ...normalizeWebSettings(patch, normalizedCurrent),
        currentPresetName: normalizePresetName(patch.currentPresetName || normalizedCurrent.currentPresetName),
        delegatePresetName: normalizePresetName(
            patch.delegatePresetName
            || normalizedCurrent.delegatePresetName
            || patch.currentPresetName
            || normalizedCurrent.currentPresetName,
        ),
        delegateConfig: patch.delegateConfig && typeof patch.delegateConfig === 'object'
            ? patch.delegateConfig
            : normalizedCurrent.delegateConfig,
        delegateConfigured: typeof patch.delegateConfigured === 'boolean'
            ? patch.delegateConfigured
            : normalizedCurrent.delegateConfigured,
        presets: patch.presets && typeof patch.presets === 'object'
            ? patch.presets
            : normalizedCurrent.presets,
        updatedAt,
        configVersion: AGENT_SETTINGS_CONFIG_VERSION,
    }, normalizeOptions);
}

export async function loadSharedAgentSettings(options = {}) {
    const storage = await resolveStorage(options.storage);
    const saved = await readSettingsValue(storage);
    return normalizeAgentSettings(saved || {}, options.normalizeOptions || {});
}

export async function loadSharedAgentSettingsResult(options = {}) {
    try {
        return {
            ok: true,
            config: await loadSharedAgentSettings(options),
            error: '',
        };
    } catch (error) {
        return {
            ok: false,
            config: null,
            error: `共享 Agent API 配置读取失败：${describeError(error)}`,
        };
    }
}

export async function saveSharedAgentSettings(patch = {}, options = {}) {
    const storage = await resolveStorage(options.storage);
    const normalizeOptions = options.normalizeOptions || {};
    let current;
    try {
        current = await readSettingsValue(storage);
    } catch (error) {
        return {
            ok: false,
            config: null,
            error: `共享 Agent API 配置读取失败：${describeError(error)}`,
        };
    }
    const normalizedCurrent = normalizeAgentSettings(current || {}, normalizeOptions);
    const next = mergeSharedAgentSettings(normalizedCurrent, patch, options);
    try {
        if (typeof storage.setAndSave !== 'function') {
            throw new Error('共享 Agent 设置存储不支持原子保存');
        }
        const saved = await storage.setAndSave(SHARED_AGENT_SETTINGS_KEY, next, {
            silent: options.silent !== false,
        });
        if (saved !== true) throw new Error('共享 Agent API 配置保存失败');
        return { ok: true, config: next };
    } catch (error) {
        return {
            ok: false,
            config: normalizedCurrent,
            error: describeError(error),
        };
    }
}

export function resetSharedAgentSettingsRepositoryForTests() {
    assistantStoragePromise = null;
}
