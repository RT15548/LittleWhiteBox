import { getRequestHeaders } from '../../../../../../../script.js';
import {
    AGENT_SETTINGS_CONFIG_VERSION,
    normalizeAgentSettings,
    normalizeJsApiPermission,
    normalizePresetName,
} from '../../agent-core/config.js';
import { AssistantStorage } from '../../../core/server-storage.js';

const SERVER_FILE_KEY = 'settings';

let settingsCache = null;

export async function loadEbookAgentConfig() {
    try {
        const saved = await AssistantStorage.get(SERVER_FILE_KEY, null);
        settingsCache = normalizeAgentSettings(saved || {});
    } catch {
        settingsCache = normalizeAgentSettings({});
    }
    return settingsCache;
}

export async function saveEbookAgentConfig(patch = {}, options = {}) {
    const silent = options.silent !== false;
    let current = null;
    try {
        current = await AssistantStorage.get(SERVER_FILE_KEY, null);
    } catch {
        current = null;
    }
    const normalizedCurrent = normalizeAgentSettings(current || {});
    const next = normalizeAgentSettings({
        ...normalizedCurrent,
        workspaceFileName: normalizedCurrent.workspaceFileName || '',
        jsApiPermission: normalizeJsApiPermission(patch.jsApiPermission ?? normalizedCurrent.jsApiPermission),
        tavilyApiKey: patch.tavilyApiKey ?? normalizedCurrent.tavilyApiKey,
        tavilyBaseUrl: patch.tavilyBaseUrl ?? normalizedCurrent.tavilyBaseUrl,
        currentPresetName: normalizePresetName(patch.currentPresetName || normalizedCurrent.currentPresetName),
        delegatePresetName: normalizePresetName(patch.delegatePresetName || normalizedCurrent.delegatePresetName || patch.currentPresetName || normalizedCurrent.currentPresetName),
        delegateConfig: patch.delegateConfig && typeof patch.delegateConfig === 'object'
            ? patch.delegateConfig
            : normalizedCurrent.delegateConfig,
        delegateConfigured: typeof patch.delegateConfigured === 'boolean'
            ? patch.delegateConfigured
            : normalizedCurrent.delegateConfigured,
        presets: patch.presets && typeof patch.presets === 'object'
            ? patch.presets
            : normalizedCurrent.presets,
        updatedAt: Date.now(),
        configVersion: AGENT_SETTINGS_CONFIG_VERSION,
    });

    settingsCache = next;

    try {
        const data = await AssistantStorage.load();
        data[SERVER_FILE_KEY] = next;
        AssistantStorage._dirtyVersion = (AssistantStorage._dirtyVersion || 0) + 1;
        await AssistantStorage.saveNow({ silent });
        return { ok: true, config: next };
    } catch (error) {
        return {
            ok: false,
            config: next,
            error: error instanceof Error ? error.message : String(error || 'unknown_error'),
        };
    }
}

export async function buildEbookFrameConfig() {
    const config = await loadEbookAgentConfig();
    return {
        config,
        hostRequestHeaders: getRequestHeaders?.() || {},
    };
}
