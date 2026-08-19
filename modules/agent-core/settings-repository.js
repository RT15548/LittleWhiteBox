import {
    AGENT_SETTINGS_CONFIG_VERSION,
    normalizeAgentSettings,
    normalizeJsApiPermission,
    normalizePresetName,
} from './config.js';

export const SHARED_AGENT_SETTINGS_KEY = 'settings';
export const SHARED_AGENT_SETTINGS_CHANGED_EVENT = 'xiaobaix:agent-config-changed';

let assistantStoragePromise = null;
// This queue serializes callers that share this JavaScript realm. Cross-realm
// writers still require the revision check below (or a future host-owned writer).
let saveQueue = Promise.resolve();

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

function getEventTarget(eventTarget) {
    return eventTarget || globalThis.window || null;
}

export function publishSharedAgentSettingsChanged(detail = {}, options = {}) {
    const eventTarget = getEventTarget(options.eventTarget);
    const CustomEventClass = eventTarget?.CustomEvent || globalThis.CustomEvent;
    if (!eventTarget?.dispatchEvent || typeof CustomEventClass !== 'function') return false;
    eventTarget.dispatchEvent(new CustomEventClass(SHARED_AGENT_SETTINGS_CHANGED_EVENT, {
        detail: {
            source: String(detail.source || 'unknown'),
            updatedAt: Number(detail.updatedAt) || 0,
        },
    }));
    return true;
}

export function subscribeSharedAgentSettingsChanged(listener, options = {}) {
    const eventTarget = getEventTarget(options.eventTarget);
    if (!eventTarget?.addEventListener || typeof listener !== 'function') return () => {};
    const handleChange = (event) => listener(event?.detail || {});
    eventTarget.addEventListener(SHARED_AGENT_SETTINGS_CHANGED_EVENT, handleChange);
    return () => eventTarget.removeEventListener?.(SHARED_AGENT_SETTINGS_CHANGED_EVENT, handleChange);
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
        enabled: typeof patch.enabled === 'boolean' ? patch.enabled : normalizedCurrent.enabled,
        workspaceFileName: patch.workspaceFileName ?? normalizedCurrent.workspaceFileName,
        jsApiPermission: normalizeJsApiPermission(patch.jsApiPermission ?? normalizedCurrent.jsApiPermission),
        tavilyApiKey: patch.tavilyApiKey ?? normalizedCurrent.tavilyApiKey,
        tavilyBaseUrl: patch.tavilyBaseUrl ?? normalizedCurrent.tavilyBaseUrl,
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

async function performSharedAgentSettingsSave(patch = {}, options = {}) {
    const storage = await resolveStorage(options.storage);
    const normalizeOptions = options.normalizeOptions || {};
    let current;
    try {
        current = await readSettingsValue(storage);
    } catch (error) {
        return {
            ok: false,
            conflict: false,
            config: null,
            error: `共享 Agent API 配置读取失败：${describeError(error)}`,
        };
    }
    const normalizedCurrent = normalizeAgentSettings(current || {}, normalizeOptions);
    const expectedUpdatedAt = Number(patch.expectedUpdatedAt);
    if (Number.isFinite(expectedUpdatedAt)
        && expectedUpdatedAt >= 0
        && expectedUpdatedAt !== Number(normalizedCurrent.updatedAt || 0)) {
        return {
            ok: false,
            conflict: true,
            config: normalizedCurrent,
            error: '共享 Agent API 配置已在其他页面更新，请重新载入后再保存。',
        };
    }

    const next = mergeSharedAgentSettings(normalizedCurrent, patch, options);
    try {
        if (typeof storage.setAndSave !== 'function') {
            throw new Error('共享 Agent 设置存储不支持原子保存');
        }
        const saved = await storage.setAndSave(SHARED_AGENT_SETTINGS_KEY, next, {
            silent: options.silent !== false,
        });
        if (saved !== true) throw new Error('共享 Agent API 配置保存失败');
        publishSharedAgentSettingsChanged({
            source: options.source,
            updatedAt: next.updatedAt,
        }, options);
        return { ok: true, conflict: false, config: next };
    } catch (error) {
        return {
            ok: false,
            conflict: false,
            config: normalizedCurrent,
            error: describeError(error),
        };
    }
}

export function saveSharedAgentSettings(patch = {}, options = {}) {
    const task = saveQueue.then(() => performSharedAgentSettingsSave(patch, options));
    saveQueue = task.then(() => undefined, () => undefined);
    return task;
}

export function resetSharedAgentSettingsRepositoryForTests() {
    assistantStoragePromise = null;
    saveQueue = Promise.resolve();
}
