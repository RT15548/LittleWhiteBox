import {
    DEFAULT_PRESET_NAME,
    buildDefaultPreset,
    cloneDefaultModelConfigs,
    normalizeAgentConfig,
    normalizeMaxTokens,
    normalizePresetName,
} from './config.js';
import { normalizeTavilyApiKey, normalizeTavilyBaseUrl } from './tavily-search.js';
import {
    resolveRuntimeReasoning,
} from './reasoning-capabilities.js';

export const AGENT_REQUEST_TIMEOUT_MS = 15 * 60 * 1000;

export const TOOL_MODE_OPTIONS = Object.freeze([
    { value: 'native', label: '原生 Tool Calling' },
    { value: 'tagged-json', label: 'Tagged JSON 兼容模式' },
]);

export const PROVIDER_OPTIONS = Object.freeze([
    { value: 'openai-responses', label: 'OpenAI Responses' },
    { value: 'openai-compatible', label: 'OpenAI 兼容' },
    { value: 'sillytavern-openai-compatible', label: '酒馆 OpenAI 兼容' },
    { value: 'sillytavern-claude', label: '酒馆 Claude' },
    { value: 'sillytavern-google', label: '酒馆 Google AI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'google', label: 'Google AI' },
]);

export function isSillyTavernProvider(provider = '') {
    return provider === 'sillytavern-openai-compatible'
        || provider === 'sillytavern-claude'
        || provider === 'sillytavern-google';
}

export function normalizeTemperature(value, fallback = 1) {
    const raw = typeof value === 'string' && !value.trim() ? fallback : value;
    const numeric = Number(raw);
    if (!Number.isFinite(numeric)) return normalizeTemperature(fallback, 1);
    return Math.max(0, Math.min(2, numeric));
}

export function shouldSendTemperature(providerConfig = {}) {
    return providerConfig.sendTemperature !== false;
}

export function resolveTemperature(providerConfig = {}) {
    return shouldSendTemperature(providerConfig)
        ? normalizeTemperature(providerConfig.temperature, 1)
        : undefined;
}

export function getProviderLabel(provider = '', labels = {}) {
    if (labels && typeof labels === 'object' && labels[provider]) {
        return labels[provider];
    }
    return PROVIDER_OPTIONS.find((item) => item.value === provider)?.label || provider || '未配置';
}

export function getToolModeLabel(providerConfig = {}) {
    const provider = String(providerConfig.provider || '').trim();
    if (provider === 'openai-compatible' || provider === 'sillytavern-openai-compatible') {
        return providerConfig.toolMode === 'tagged-json'
            ? 'Tagged JSON 兼容模式'
            : '原生 Tool Calling';
    }
    return 'Provider 原生工具';
}

export function resolveActiveProviderConfig(configValue = {}, options = {}) {
    const config = normalizeAgentConfig(configValue || {});
    if (options.role === 'delegate' && config.delegateConfig) {
        const provider = config.delegateConfig.provider || 'openai-compatible';
        const modelConfigs = config.delegateConfig.modelConfigs || cloneDefaultModelConfigs();
        const providerConfig = modelConfigs[provider] || cloneDefaultModelConfigs()[provider] || {};
        const context = {
            provider,
            baseUrl: String(providerConfig.baseUrl || ''),
            model: String(providerConfig.model || ''),
        };
        return {
            currentPresetName: String(config.delegatePresetName || config.currentPresetName || ''),
            provider,
            baseUrl: String(providerConfig.baseUrl || ''),
            model: String(providerConfig.model || ''),
            apiKey: String(providerConfig.apiKey || ''),
            tavilyApiKey: normalizeTavilyApiKey(config.tavilyApiKey),
            tavilyBaseUrl: normalizeTavilyBaseUrl(config.tavilyBaseUrl),
            temperature: resolveTemperature(providerConfig),
            sendTemperature: shouldSendTemperature(providerConfig),
            maxTokens: normalizeMaxTokens(providerConfig.maxTokens),
            timeoutMs: Number(options.timeoutMs) || AGENT_REQUEST_TIMEOUT_MS,
            toolMode: providerConfig.toolMode || 'native',
            reasoning: resolveRuntimeReasoning(context, providerConfig.reasoning),
        };
    }

    const requestedPresetName = normalizePresetName(
        options.presetName
            || (options.role === 'delegate' ? config.delegatePresetName : config.currentPresetName)
            || DEFAULT_PRESET_NAME,
    );
    const activePresetName = config.presets?.[requestedPresetName]
        ? requestedPresetName
        : (config.presets?.[config.currentPresetName] ? config.currentPresetName : DEFAULT_PRESET_NAME);
    const currentPreset = config.presets?.[activePresetName] || buildDefaultPreset();
    const provider = currentPreset.provider || config.provider || 'openai-compatible';
    const modelConfigs = currentPreset.modelConfigs || config.modelConfigs || cloneDefaultModelConfigs();
    const providerConfig = modelConfigs[provider] || cloneDefaultModelConfigs()[provider] || {};
    const context = {
        provider,
        baseUrl: String(providerConfig.baseUrl || ''),
        model: String(providerConfig.model || ''),
    };
    return {
        currentPresetName: String(activePresetName || ''),
        provider,
        baseUrl: String(providerConfig.baseUrl || ''),
        model: String(providerConfig.model || ''),
        apiKey: String(providerConfig.apiKey || ''),
        tavilyApiKey: normalizeTavilyApiKey(config.tavilyApiKey),
        tavilyBaseUrl: normalizeTavilyBaseUrl(config.tavilyBaseUrl),
        temperature: resolveTemperature(providerConfig),
        sendTemperature: shouldSendTemperature(providerConfig),
        maxTokens: normalizeMaxTokens(providerConfig.maxTokens),
        timeoutMs: Number(options.timeoutMs) || AGENT_REQUEST_TIMEOUT_MS,
        toolMode: providerConfig.toolMode || 'native',
        reasoning: resolveRuntimeReasoning(context, providerConfig.reasoning),
    };
}
