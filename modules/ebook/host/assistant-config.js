import { getRequestHeaders } from '../../../../../../../script.js';
import {
    loadSharedAgentSettings,
    saveSharedAgentSettings,
} from '../../agent-core/settings-repository.js';
import { AssistantStorage } from '../../../core/server-storage.js';

let settingsCache = null;

export async function loadEbookAgentConfig() {
    settingsCache = await loadSharedAgentSettings({ storage: AssistantStorage });
    return settingsCache;
}

export async function saveEbookAgentConfig(patch = {}, options = {}) {
    const result = await saveSharedAgentSettings(patch, {
        storage: AssistantStorage,
        silent: options.silent !== false,
        source: 'ebook',
    });
    if ((result.ok || result.conflict) && result.config) {
        settingsCache = result.config;
    }
    return result;
}

export async function buildEbookFrameConfig() {
    let config = settingsCache;
    let configLoadError = '';
    try {
        config = await loadEbookAgentConfig();
    } catch (error) {
        configLoadError = `共享 Agent API 配置读取失败：${error instanceof Error ? error.message : String(error || 'unknown_error')}`;
    }
    return {
        config,
        configLoadError,
        hostRequestHeaders: getRequestHeaders?.() || {},
    };
}
