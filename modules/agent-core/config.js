import {
    DEFAULT_TAVILY_BASE_URL,
    normalizeTavilyApiKey,
    normalizeTavilyBaseUrl,
} from './tavily-search.js';

export const DEFAULT_PROVIDER = 'openai-compatible';
export const DEFAULT_PRESET_NAME = '默认';
export const DEFAULT_PERMISSION_MODE = 'default';
export const DEFAULT_JSAPI_PERMISSION = 'deny';
export const AGENT_SETTINGS_CONFIG_VERSION = 1;
export const AGENT_PERMISSION_MODE_OPTIONS = Object.freeze([
    { value: 'default', label: '默认权限' },
    { value: 'full', label: '完全权限' },
]);
export const AGENT_JSAPI_PERMISSION_OPTIONS = Object.freeze([
    { value: 'deny', label: '禁止' },
    { value: 'allow', label: '允许' },
]);

export const DEFAULT_MODEL_CONFIGS = {
    'openai-responses': {
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4.1-mini',
        apiKey: '',
        temperature: 0.2,
        sendTemperature: true,
    },
    'openai-compatible': {
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
        apiKey: '',
        temperature: 0.2,
        sendTemperature: true,
        toolMode: 'native',
    },
    'sillytavern-openai-compatible': {
        baseUrl: '',
        model: 'gpt-4o-mini',
        apiKey: '',
        temperature: 0.2,
        sendTemperature: true,
        toolMode: 'native',
    },
    'sillytavern-claude': {
        baseUrl: '',
        model: 'claude-sonnet-4-0',
        apiKey: '',
        temperature: 0.2,
        sendTemperature: true,
    },
    'sillytavern-google': {
        baseUrl: '',
        model: 'gemini-2.5-pro',
        apiKey: '',
        temperature: 0.2,
        sendTemperature: true,
    },
    anthropic: {
        baseUrl: 'https://api.anthropic.com',
        model: 'claude-sonnet-4-0',
        apiKey: '',
        temperature: 0.2,
        sendTemperature: true,
    },
    google: {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        model: 'gemini-2.5-pro',
        apiKey: '',
        temperature: 0.2,
        sendTemperature: true,
    },
};

export function cloneDefaultModelConfigs() {
    return JSON.parse(JSON.stringify(DEFAULT_MODEL_CONFIGS));
}

export function buildDefaultPreset() {
    return {
        provider: DEFAULT_PROVIDER,
        modelConfigs: cloneDefaultModelConfigs(),
        permissionMode: DEFAULT_PERMISSION_MODE,
    };
}

export function buildDefaultDelegateConfig(sourcePreset = buildDefaultPreset()) {
    const preset = sourcePreset && typeof sourcePreset === 'object' ? sourcePreset : buildDefaultPreset();
    return {
        provider: normalizeProvider(preset.provider),
        modelConfigs: normalizeModelConfigs(preset.modelConfigs || {}),
    };
}

export function normalizePermissionMode(value) {
    return value === 'full' ? 'full' : DEFAULT_PERMISSION_MODE;
}

export function normalizeJsApiPermission(value) {
    return value === 'allow' ? 'allow' : DEFAULT_JSAPI_PERMISSION;
}

export function normalizePresetName(value) {
    const normalized = String(value || '').trim();
    return normalized || DEFAULT_PRESET_NAME;
}

export function normalizeModelConfigs(modelConfigs = {}) {
    const next = cloneDefaultModelConfigs();
    Object.keys(DEFAULT_MODEL_CONFIGS).forEach((provider) => {
        next[provider] = {
            ...DEFAULT_MODEL_CONFIGS[provider],
            ...((modelConfigs && typeof modelConfigs[provider] === 'object') ? modelConfigs[provider] : {}),
        };
    });
    return next;
}

function normalizeProvider(provider) {
    return typeof provider === 'string' && provider.trim() ? provider : DEFAULT_PROVIDER;
}

function buildPresetSource(input = {}, legacyPresetName) {
    if (input && typeof input.presets === 'object' && input.presets) {
        return input.presets;
    }
    if (input?.modelConfigs) {
        return {
            [legacyPresetName]: {
                provider: input.provider || DEFAULT_PROVIDER,
                modelConfigs: input.modelConfigs,
                permissionMode: input.permissionMode,
            },
        };
    }
    return {};
}

function normalizePresets(input = {}, legacyPresetName) {
    const presets = {};
    const presetSource = buildPresetSource(input, legacyPresetName);

    Object.entries(presetSource).forEach(([rawName, rawPreset]) => {
        if (!rawPreset || typeof rawPreset !== 'object') return;
        const name = normalizePresetName(rawName);
        presets[name] = {
            provider: normalizeProvider(rawPreset.provider),
            modelConfigs: normalizeModelConfigs(rawPreset.modelConfigs || {}),
            permissionMode: normalizePermissionMode(rawPreset.permissionMode),
        };
    });

    if (!Object.keys(presets).length) {
        presets[DEFAULT_PRESET_NAME] = buildDefaultPreset();
    }

    return presets;
}

function resolveCurrentPresetName(presets, requestedName) {
    const normalizedName = normalizePresetName(requestedName);
    return presets[normalizedName] ? normalizedName : Object.keys(presets)[0];
}

function resolveDelegatePresetName(presets, requestedName, fallbackName) {
    const normalizedName = normalizePresetName(requestedName || fallbackName);
    if (presets[normalizedName]) return normalizedName;
    if (presets[fallbackName]) return fallbackName;
    return Object.keys(presets)[0];
}

function normalizeDelegateConfig(input = {}, fallbackPreset = buildDefaultPreset()) {
    const fallback = buildDefaultDelegateConfig(fallbackPreset);
    const source = input && typeof input === 'object' ? input : {};
    return {
        provider: normalizeProvider(source.provider || fallback.provider),
        modelConfigs: normalizeModelConfigs(source.modelConfigs || fallback.modelConfigs),
    };
}

function resolveLegacyTavilyValue(input = {}, legacyPresetName, currentPresetName, fieldName, normalizeValue) {
    const direct = normalizeValue(input?.[fieldName]);
    if (direct) return direct;

    const presetSource = buildPresetSource(input, legacyPresetName);
    const checkedPresetNames = [
        currentPresetName,
        legacyPresetName,
        input?.currentPresetName,
        input?.delegatePresetName,
        ...Object.keys(presetSource || {}),
    ].map(normalizePresetName);
    const seen = new Set();
    for (const presetName of checkedPresetNames) {
        if (seen.has(presetName)) continue;
        seen.add(presetName);
        const value = normalizeValue(presetSource?.[presetName]?.[fieldName]);
        if (value) return value;
    }

    return normalizeValue(input?.delegateConfig?.[fieldName]);
}

function resolveLegacyTavilyBaseUrl(input = {}, legacyPresetName, currentPresetName) {
    const normalizeRaw = (value) => String(value || '').trim();
    if (normalizeRaw(input?.tavilyBaseUrl)) {
        return normalizeTavilyBaseUrl(input.tavilyBaseUrl);
    }

    const presetSource = buildPresetSource(input, legacyPresetName);
    const checkedPresetNames = [
        currentPresetName,
        legacyPresetName,
        input?.currentPresetName,
        input?.delegatePresetName,
        ...Object.keys(presetSource || {}),
    ].map(normalizePresetName);
    const seen = new Set();
    for (const presetName of checkedPresetNames) {
        if (seen.has(presetName)) continue;
        seen.add(presetName);
        const value = presetSource?.[presetName]?.tavilyBaseUrl;
        if (normalizeRaw(value)) return normalizeTavilyBaseUrl(value);
    }

    if (normalizeRaw(input?.delegateConfig?.tavilyBaseUrl)) {
        return normalizeTavilyBaseUrl(input.delegateConfig.tavilyBaseUrl);
    }
    return DEFAULT_TAVILY_BASE_URL;
}

function resolveGlobalTavilySettings(input = {}, legacyPresetName, currentPresetName) {
    return {
        tavilyApiKey: resolveLegacyTavilyValue(input, legacyPresetName, currentPresetName, 'tavilyApiKey', normalizeTavilyApiKey),
        tavilyBaseUrl: resolveLegacyTavilyBaseUrl(input, legacyPresetName, currentPresetName),
    };
}

export function normalizeAgentSettings(saved = {}, options = {}) {
    const {
        defaultWorkspaceFileName = '',
        normalizeWorkspaceName = (value) => String(value || ''),
    } = options;
    const legacyPresetName = normalizePresetName(saved.currentPresetName || saved.presetName || DEFAULT_PRESET_NAME);
    const presets = normalizePresets(saved, legacyPresetName);
    const currentPresetName = resolveCurrentPresetName(presets, saved.currentPresetName);
    const delegatePresetName = resolveDelegatePresetName(presets, saved.delegatePresetName, currentPresetName);
    const delegateFallbackPreset = presets[delegatePresetName] || presets[currentPresetName] || buildDefaultPreset();
    const delegateConfig = normalizeDelegateConfig(saved.delegateConfig, delegateFallbackPreset);
    const tavilySettings = resolveGlobalTavilySettings(saved, legacyPresetName, currentPresetName);

    return {
        enabled: !!saved.enabled,
        workspaceFileName: normalizeWorkspaceName(saved.workspaceFileName || defaultWorkspaceFileName),
        jsApiPermission: normalizeJsApiPermission(saved.jsApiPermission),
        currentPresetName,
        delegatePresetName,
        delegateConfig,
        presets,
        tavilyApiKey: tavilySettings.tavilyApiKey,
        tavilyBaseUrl: tavilySettings.tavilyBaseUrl,
        updatedAt: Number(saved.updatedAt) || 0,
        configVersion: Number(saved.configVersion) || 0,
    };
}

export function normalizeAgentConfig(config = {}) {
    const legacyPresetName = normalizePresetName(config.currentPresetName || config.presetDraftName || DEFAULT_PRESET_NAME);
    const presets = normalizePresets(config, legacyPresetName);
    const currentPresetName = resolveCurrentPresetName(presets, config.currentPresetName);
    const delegatePresetName = resolveDelegatePresetName(presets, config.delegatePresetName, currentPresetName);
    const currentPreset = presets[currentPresetName] || buildDefaultPreset();
    const delegateFallbackPreset = presets[delegatePresetName] || currentPreset;
    const delegateConfig = normalizeDelegateConfig(config.delegateConfig, delegateFallbackPreset);
    const tavilySettings = resolveGlobalTavilySettings(config, legacyPresetName, currentPresetName);

    return {
        workspaceFileName: String(config.workspaceFileName || ''),
        jsApiPermission: normalizeJsApiPermission(config.jsApiPermission),
        currentPresetName,
        delegatePresetName,
        delegateConfig,
        presetDraftName: normalizePresetName(config.presetDraftName || currentPresetName),
        presetNames: Object.keys(presets),
        presets,
        provider: currentPreset.provider,
        modelConfigs: currentPreset.modelConfigs,
        permissionMode: normalizePermissionMode(currentPreset.permissionMode),
        tavilyApiKey: tavilySettings.tavilyApiKey,
        tavilyBaseUrl: tavilySettings.tavilyBaseUrl,
    };
}

export const normalizeAssistantSettings = normalizeAgentSettings;
export const normalizeAssistantConfig = normalizeAgentConfig;
