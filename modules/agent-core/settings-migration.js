import { AGENT_SETTINGS_CONFIG_VERSION } from './config.js';
import { DEFAULT_MODEL_LIST_AUTH } from './model-list-auth.js';

// Frozen settings v1: each named preset contained provider + modelConfigs[provider].
// Compatibility owner: saved Assistant settings (including pre-version records).
// Remove when v1 settings files are no longer accepted at the repository boundary.
const V1_CONNECTION_DEFAULTS = Object.freeze({
    'openai-compatible': { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', toolMode: 'tagged-json' },
    'openai-responses': { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4.1-mini' },
    'sillytavern-openai-compatible': { baseUrl: '', model: 'gpt-4o-mini', toolMode: 'tagged-json' },
    'sillytavern-claude': { baseUrl: '', model: 'claude-sonnet-4-0' },
    'sillytavern-google': { baseUrl: '', model: 'gemini-2.5-pro' },
    anthropic: { baseUrl: 'https://api.anthropic.com', model: 'claude-sonnet-4-0' },
    google: { baseUrl: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-2.5-pro' },
    'google-vertex': { baseUrl: '', model: 'gemini-3.8-flash' },
});

function upgradePresetV1(preset = {}, fallbackProvider = 'openai-compatible') {
    const { modelConfigs = {}, ...rest } = preset;
    const provider = preset.provider || fallbackProvider;
    const active = modelConfigs[provider] || {};
    return {
        ...rest, provider,
        apiKey: '', temperature: 1, maxTokens: 32000, sendTemperature: true,
        toolMode: 'native', reasoning: {}, sampling: {},
        modelListAuth: ['google', 'sillytavern-google'].includes(provider) ? 'x-goog-api-key' : 'x-api-key',
        ...V1_CONNECTION_DEFAULTS[provider],
        ...active,
        // These are extra fields, not alternative connection/model values.
        vertex: { authMode: 'relay', projectId: '', location: 'global', serviceAccountJson: '', streamFunctionCallArguments: true,
            ...modelConfigs['google-vertex']?.vertex },
    };
}

function upgradeSettingsV1(value) {
    const { modelConfigs, ...rest } = value;
    const name = value.currentPresetName || value.presetName || '默认';
    const presets = value.presets || (modelConfigs ? { [name]: value } : {});
    return {
        ...rest,
        configVersion: 2,
        presets: Object.fromEntries(Object.entries(presets).map(([key, preset]) => [key, upgradePresetV1(preset)])),
        ...(value.delegateConfig?.provider || value.delegateConfig?.modelConfigs
            ? { delegateConfig: upgradePresetV1(value.delegateConfig, presets[value.delegatePresetName || name]?.provider) } : {}),
    };
}

// Settings v1/v2 persisted native discovery defaults. Reset those existing
// presets once at the read/import boundary; v3 keeps subsequent manual choices.
// Remove with v1/v2 import support. No credentials or generation fields change.
export function upgradeAgentSettings(value = {}) {
    if (value.configVersion === AGENT_SETTINGS_CONFIG_VERSION) return value;
    const previous = value.configVersion === 2 ? value : upgradeSettingsV1(value);
    const resetDiscovery = preset => ({ ...preset, modelListAuth: DEFAULT_MODEL_LIST_AUTH });
    return {
        ...previous,
        configVersion: AGENT_SETTINGS_CONFIG_VERSION,
        presets: Object.fromEntries(Object.entries(previous.presets || {}).map(([name, preset]) => [name, resetDiscovery(preset)])),
        ...(previous.delegateConfig ? { delegateConfig: resetDiscovery(previous.delegateConfig) } : {}),
    };
}
