import { normalizeWebApiKey, normalizeWebBaseUrl, normalizeWebSettings } from './web/settings.js';
import { normalizeReasoningConfig } from './reasoning-config.js';
import { normalizeSampling } from './sampling.js';
import { normalizeAgentApiKey } from './provider-auth.js';
import { DEFAULT_MODEL_LIST_AUTH } from './model-list-auth.js';
import { normalizeVertexConfig } from './vertex-config.js';

export const DEFAULT_PROVIDER = 'openai-compatible';
export const DEFAULT_PRESET_NAME = '默认';
export const DEFAULT_PERMISSION_MODE = 'default';
export const DEFAULT_JSAPI_PERMISSION = 'deny';
export const AGENT_PERMISSION_MODE_LABEL = '执行权限';
export const AGENT_JSAPI_PERMISSION_LABEL = 'JavaScript API 权限';
export const DEFAULT_MAX_TOKENS = 32000;
export const AGENT_SETTINGS_CONFIG_VERSION = 3;
export const AGENT_PERMISSION_MODE_OPTIONS = Object.freeze([
    { value: 'default', label: '默认权限' },
    { value: 'full', label: '完全权限' },
]);
export const AGENT_JSAPI_PERMISSION_OPTIONS = Object.freeze([
    { value: 'deny', label: '禁止' },
    { value: 'allow', label: '允许' },
]);

export function buildDefaultPreset() {
    return normalizeAgentPreset();
}

export function buildDefaultDelegateConfig(sourcePreset = buildDefaultPreset()) {
    const preset = sourcePreset && typeof sourcePreset === 'object' ? sourcePreset : buildDefaultPreset();
    const config = normalizeAgentPreset(preset);
    delete config.permissionMode;
    return config;
}

export function normalizePermissionMode(value) {
    return value === 'full' ? 'full' : DEFAULT_PERMISSION_MODE;
}

export function normalizeJsApiPermission(value) {
    return value === 'allow' ? 'allow' : DEFAULT_JSAPI_PERMISSION;
}

export function normalizeMaxTokens(value, fallback = DEFAULT_MAX_TOKENS) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) {
        const fallbackNumeric = Number(fallback);
        return Number.isFinite(fallbackNumeric) && fallbackNumeric > 0
            ? Math.floor(fallbackNumeric)
            : DEFAULT_MAX_TOKENS;
    }
    return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(numeric));
}

export function normalizePresetName(value) {
    const normalized = String(value || '').trim();
    return normalized || DEFAULT_PRESET_NAME;
}

// A preset owns one complete set of fields. Provider selection never supplies
// replacement values; adapters project only the fields their protocol accepts.
export function normalizeAgentPreset(source = {}) {
    return {
        provider: normalizeProvider(source.provider),
        baseUrl: String(source.baseUrl ?? 'https://api.openai.com/v1'),
        model: String(source.model ?? 'gpt-4o-mini'),
        apiKey: normalizeAgentApiKey(source.apiKey),
        vertex: normalizeVertexConfig(source.vertex),
        modelListAuth: String(source.modelListAuth ?? DEFAULT_MODEL_LIST_AUTH),
        temperature: source.temperature ?? 1,
        maxTokens: normalizeMaxTokens(source.maxTokens),
        sendTemperature: source.sendTemperature !== false,
        toolMode: String(source.toolMode ?? 'tagged-json'),
        reasoning: normalizeReasoningConfig(source.reasoning),
        sampling: normalizeSampling(source.sampling),
        permissionMode: normalizePermissionMode(source.permissionMode),
    };
}

function normalizeProvider(provider) {
    return typeof provider === 'string' && provider.trim() ? provider : DEFAULT_PROVIDER;
}

function buildPresetSource(input = {}, legacyPresetName) {
    if (input && typeof input.presets === 'object' && input.presets) {
        return input.presets;
    }
    if (input?.provider) {
        return {
            [legacyPresetName]: input,
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
        presets[name] = normalizeAgentPreset(rawPreset);
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
    return buildDefaultDelegateConfig({ ...fallback, ...source });
}

function resolveDelegateConfigured(input = {}, presets = {}, currentPresetName = DEFAULT_PRESET_NAME, delegatePresetName = currentPresetName) {
    if (input?.delegateConfigured === false) {
        return false;
    }
    if (delegatePresetName !== currentPresetName) {
        return true;
    }

    const source = input?.delegateConfig;
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
        return false;
    }
    const hasExplicitSource = Object.keys(source).length > 0;
    if (!hasExplicitSource) return false;
    if (input?.delegateConfigured === true) return true;

    const currentPreset = presets[currentPresetName] || buildDefaultPreset();
    const inheritedConfig = buildDefaultDelegateConfig(currentPreset);
    const explicitConfig = normalizeDelegateConfig(source, currentPreset);
    return JSON.stringify(explicitConfig) !== JSON.stringify(inheritedConfig);
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
        return normalizeWebBaseUrl(input.tavilyBaseUrl);
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
        if (normalizeRaw(value)) return normalizeWebBaseUrl(value);
    }

    if (normalizeRaw(input?.delegateConfig?.tavilyBaseUrl)) {
        return normalizeWebBaseUrl(input.delegateConfig.tavilyBaseUrl);
    }
    return normalizeWebBaseUrl();
}

function resolveGlobalTavilySettings(input = {}, legacyPresetName, currentPresetName) {
    return {
        tavilyApiKey: resolveLegacyTavilyValue(input, legacyPresetName, currentPresetName, 'tavilyApiKey', normalizeWebApiKey),
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
    const delegateConfigured = resolveDelegateConfigured(saved, presets, currentPresetName, delegatePresetName);
    const webSettings = normalizeWebSettings(saved, resolveGlobalTavilySettings(saved, legacyPresetName, currentPresetName));

    return {
        workspaceFileName: normalizeWorkspaceName(saved.workspaceFileName || defaultWorkspaceFileName),
        jsApiPermission: normalizeJsApiPermission(saved.jsApiPermission),
        currentPresetName,
        delegatePresetName,
        delegateConfig,
        delegateConfigured,
        presets,
        ...webSettings,
        updatedAt: Number(saved.updatedAt) || 0,
        configVersion: AGENT_SETTINGS_CONFIG_VERSION,
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
    const delegateConfigured = resolveDelegateConfigured(config, presets, currentPresetName, delegatePresetName);
    const webSettings = normalizeWebSettings(config, resolveGlobalTavilySettings(config, legacyPresetName, currentPresetName));

    return {
        ...currentPreset,
        configVersion: AGENT_SETTINGS_CONFIG_VERSION,
        workspaceFileName: String(config.workspaceFileName || ''),
        updatedAt: Number(config.updatedAt) || 0,
        jsApiPermission: normalizeJsApiPermission(config.jsApiPermission),
        currentPresetName,
        delegatePresetName,
        delegateConfig,
        delegateConfigured,
        presetDraftName: normalizePresetName(config.presetDraftName || currentPresetName),
        presetNames: Object.keys(presets),
        presets,
        ...webSettings,
    };
}

export const normalizeAssistantSettings = normalizeAgentSettings;
export const normalizeAssistantConfig = normalizeAgentConfig;
