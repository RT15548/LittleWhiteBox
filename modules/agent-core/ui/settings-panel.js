import {
    HOST_CHAT_COMPLETIONS_SOURCE_CLAUDE,
    HOST_CHAT_COMPLETIONS_SOURCE_MAKERSUITE,
    HOST_CHAT_COMPLETIONS_SOURCE_OPENAI,
    HOST_CHAT_COMPLETIONS_DEFAULT_REVERSE_PROXY,
    fetchHostChatCompletionsModels,
} from '../../../shared/host-llm/chat-completions/client.js';
import {
    AGENT_JSAPI_PERMISSION_OPTIONS,
    AGENT_PERMISSION_MODE_OPTIONS,
    DEFAULT_PRESET_NAME,
    buildDefaultPreset,
    normalizeAgentConfig,
    normalizeJsApiPermission,
    normalizeModelConfigs,
    normalizePermissionMode,
    normalizePresetName,
} from '../config.js';
import {
    AGENT_REQUEST_TIMEOUT_MS,
    REASONING_EFFORT_OPTIONS,
    TOOL_MODE_OPTIONS,
    getProviderLabel,
    normalizeReasoningEffort,
    normalizeTemperature,
    shouldSendTemperature,
} from '../provider-config.js';
import { DEFAULT_TAVILY_BASE_URL, normalizeTavilyBaseUrl } from '../tavily-search.js';

const MODEL_FILTERS = {
    chat: {
        exclude: [
            'embedding', 'embed', 'rerank', 'reranker', 'tts', 'speech', 'audio',
            'whisper', 'transcription', 'stt', 'image', 'sdxl', 'flux', 'moderation',
        ],
    },
};
const SILLYTAVERN_CLAUDE_FALLBACK_MODELS = Object.freeze([
    'claude-opus-4-7',
    'claude-opus-4-6',
    'claude-opus-4-5',
    'claude-opus-4-5-20251101',
    'claude-sonnet-4-6',
    'claude-sonnet-4-5',
    'claude-sonnet-4-5-20250929',
    'claude-opus-4-1',
    'claude-opus-4-1-20250805',
    'claude-opus-4-0',
    'claude-opus-4-20250514',
    'claude-sonnet-4-0',
    'claude-sonnet-4-20250514',
]);

function refillSelect(select, options, placeholderLabel = '') {
    select.replaceChildren();
    if (placeholderLabel) {
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = placeholderLabel;
        select.appendChild(placeholder);
    }
    options.forEach((option) => {
        const item = document.createElement('option');
        item.value = option.value;
        item.textContent = option.label;
        select.appendChild(item);
    });
}

function filterModels(models = []) {
    const normalized = [...new Set(models.filter(Boolean).map((model) => String(model).trim()).filter(Boolean))];
    const rule = MODEL_FILTERS.chat;
    const filtered = normalized.filter((modelId) => {
        const lower = modelId.toLowerCase();
        return !rule.exclude.some((keyword) => lower.includes(keyword));
    });
    return filtered.length ? filtered : normalized;
}

function normalizeConfigPage(value = '') {
    return value === 'delegate' ? 'delegate' : 'main';
}

function normalizeBaseUrl(rawBaseUrl) {
    return String(rawBaseUrl || '').trim().replace(/\/+$/, '');
}

function isSillyTavernProvider(provider = '') {
    return provider === 'sillytavern-openai-compatible'
        || provider === 'sillytavern-claude'
        || provider === 'sillytavern-google';
}

function isToolModeProvider(provider = '') {
    return provider === 'openai-compatible' || provider === 'sillytavern-openai-compatible';
}

function isAnthropicProvider(provider = '') {
    return provider === 'anthropic' || provider === 'sillytavern-claude';
}

function getSillyTavernChatCompletionSource(provider = '') {
    if (provider === 'sillytavern-claude') return HOST_CHAT_COMPLETIONS_SOURCE_CLAUDE;
    if (provider === 'sillytavern-google') return HOST_CHAT_COMPLETIONS_SOURCE_MAKERSUITE;
    return HOST_CHAT_COMPLETIONS_SOURCE_OPENAI;
}

function uniqueUrls(urls = []) {
    return [...new Set(urls.filter(Boolean).map((url) => String(url).trim()).filter(Boolean))];
}

function buildOpenAICandidateUrls(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return [];
    if (normalized.endsWith('/v1')) {
        const root = normalized.slice(0, -3);
        return uniqueUrls([
            `${normalized}/models`,
            `${root}/v1/models`,
            `${root}/models`,
        ]);
    }
    return uniqueUrls([
        `${normalized}/v1/models`,
        `${normalized}/models`,
    ]);
}

function buildAnthropicCandidateUrls(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return [];
    if (normalized.endsWith('/v1')) {
        const root = normalized.slice(0, -3);
        return uniqueUrls([
            `${normalized}/models`,
            `${root}/v1/models`,
            `${root}/models`,
        ]);
    }
    return uniqueUrls([
        `${normalized}/v1/models`,
        `${normalized}/models`,
    ]);
}

function buildGoogleCandidateUrls(baseUrl, apiKey) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return [];
    const root = normalized.endsWith('/v1beta') ? normalized.slice(0, -7) : normalized;
    return uniqueUrls([
        `${normalized}/models?key=${encodeURIComponent(apiKey)}`,
        `${normalized}/models`,
        `${root}/v1beta/models?key=${encodeURIComponent(apiKey)}`,
        `${root}/v1beta/models`,
        `${root}/models?key=${encodeURIComponent(apiKey)}`,
        `${root}/models`,
    ]);
}

function extractErrorSnippet(payload, rawText) {
    const candidates = [
        payload?.error?.message,
        payload?.message,
        payload?.detail,
        payload?.details,
        payload?.error,
    ];
    const found = candidates.find((item) => typeof item === 'string' && item.trim());
    if (found) return found.trim();
    return String(rawText || '').trim().slice(0, 160);
}

async function fetchJsonWithDiagnostics(url, options = {}) {
    const response = await fetch(url, options);
    const rawText = await response.text();
    let data = null;
    let parseError = null;

    try {
        data = rawText ? JSON.parse(rawText) : {};
    } catch (error) {
        parseError = error;
    }

    return {
        ok: response.ok,
        status: response.status,
        url,
        data,
        rawText,
        parseError,
        errorSnippet: extractErrorSnippet(data, rawText),
    };
}

function extractOpenAIModels(data) {
    return filterModels((data?.data || []).map((item) => String(item?.id || '').trim()).filter(Boolean));
}

function extractAnthropicModels(data) {
    return filterModels((data?.data || []).map((item) => String(item?.id || '').trim()).filter(Boolean));
}

function extractGoogleModels(data) {
    return filterModels(
        ((data?.models || data?.data || []).map((item) => String(item?.id || item?.name || '')))
            .map((item) => item.split('/').pop() || '')
            .filter(Boolean),
    );
}

async function tryCandidateFetches({ urls, requestOptionsList, extractModels, providerLabel }) {
    let lastFailure = null;

    for (const url of urls) {
        for (const requestOptions of requestOptionsList) {
            const result = await fetchJsonWithDiagnostics(url, requestOptions);
            if (!result.ok) {
                lastFailure = result;
                continue;
            }
            if (result.parseError) {
                lastFailure = {
                    ...result,
                    errorSnippet: '返回的不是 JSON',
                };
                continue;
            }
            const models = extractModels(result.data);
            if (models.length) {
                return models;
            }
            lastFailure = {
                ...result,
                errorSnippet: '返回成功，但模型列表为空',
            };
        }
    }

    if (lastFailure) {
        const suffix = lastFailure.url ? ` (${lastFailure.url})` : '';
        const detail = lastFailure.errorSnippet ? `：${lastFailure.errorSnippet}` : '';
        throw new Error(`${providerLabel} 拉取模型失败：${lastFailure.status || 'unknown'}${detail}${suffix}`);
    }

    throw new Error(`${providerLabel} 拉取模型失败：未获取到模型列表。`);
}

async function pullSillyTavernClaudeModels(providerConfig) {
    const apiKey = String(providerConfig.apiKey || '').trim();
    const customBaseUrl = normalizeBaseUrl(providerConfig.baseUrl || '');
    const baseUrl = normalizeBaseUrl(
        customBaseUrl || HOST_CHAT_COMPLETIONS_DEFAULT_REVERSE_PROXY[HOST_CHAT_COMPLETIONS_SOURCE_CLAUDE],
    );

    if (apiKey && baseUrl) {
        try {
            return await tryCandidateFetches({
                urls: buildAnthropicCandidateUrls(baseUrl),
                requestOptionsList: [{
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        Accept: 'application/json',
                    },
                }],
                extractModels: extractAnthropicModels,
                providerLabel: 'Anthropic',
            });
        } catch (error) {
            if (customBaseUrl) {
                throw error;
            }
            // SillyTavern does not expose Claude model listing through /status.
            // Browser-side official Anthropic fetches may also be blocked by CORS, so keep the config page usable.
        }
    }

    return [...SILLYTAVERN_CLAUDE_FALLBACK_MODELS];
}

export async function pullModelsForProvider(providerConfig) {
    const provider = providerConfig.provider;
    const baseUrl = normalizeBaseUrl(providerConfig.baseUrl || '');
    const apiKey = String(providerConfig.apiKey || '').trim();

    if (provider === 'sillytavern-claude') {
        return filterModels(await pullSillyTavernClaudeModels(providerConfig));
    }

    if (isSillyTavernProvider(provider)) {
        return filterModels(await fetchHostChatCompletionsModels(
            providerConfig,
            getSillyTavernChatCompletionSource(provider),
        ));
    }

    if (!apiKey) {
        throw new Error('请先填写 API Key。');
    }
    if (!baseUrl) {
        throw new Error('请先填写 Base URL。');
    }

    if (provider === 'google') {
        return await tryCandidateFetches({
            urls: buildGoogleCandidateUrls(baseUrl, apiKey),
            requestOptionsList: [
                {
                    headers: {
                        Accept: 'application/json',
                        'x-goog-api-key': apiKey,
                    },
                },
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${apiKey}`,
                    },
                },
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            ],
            extractModels: extractGoogleModels,
            providerLabel: 'Google AI',
        });
    }

    if (isAnthropicProvider(provider)) {
        return await tryCandidateFetches({
            urls: buildAnthropicCandidateUrls(baseUrl),
            requestOptionsList: [{
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    Accept: 'application/json',
                },
            }],
            extractModels: extractAnthropicModels,
            providerLabel: 'Anthropic',
        });
    }

    return await tryCandidateFetches({
        urls: buildOpenAICandidateUrls(baseUrl),
        requestOptionsList: [{
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: 'application/json',
            },
        }],
        extractModels: extractOpenAIModels,
        providerLabel: provider === 'openai-responses' ? 'OpenAI Responses' : 'OpenAI-Compatible',
    });
}

function defaultDescribeError(error) {
    return error instanceof Error ? error.message : String(error || 'unknown_error');
}

export function createAgentSettingsPanel(deps = {}) {
    const {
        state,
        render,
        showToast,
        createRequestId = (prefix = 'req') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        saveConfig,
        describeError = defaultDescribeError,
        getRuntimeSummaryText,
    } = deps;

    function requestConfigFormSync() {
        state.configFormSyncPending = true;
    }

    function getProviderStateKey(provider, scope = 'main') {
        const normalizedProvider = String(provider || '').trim() || 'openai-compatible';
        return scope === 'delegate' ? `delegate:${normalizedProvider}` : normalizedProvider;
    }

    function getPullState(provider, scope = 'main') {
        return state.pullStateByProvider?.[getProviderStateKey(provider, scope)] || { status: 'idle', message: '' };
    }

    function setPullState(provider, nextState, scope = 'main') {
        state.pullStateByProvider = {
            ...(state.pullStateByProvider || {}),
            [getProviderStateKey(provider, scope)]: nextState,
        };
    }

    function setProviderModels(provider, models, scope = 'main') {
        state.modelOptionsByProvider = {
            ...(state.modelOptionsByProvider || {}),
            [getProviderStateKey(provider, scope)]: Array.isArray(models) ? models : [],
        };
    }

    function getProviderModels(provider, scope = 'main') {
        const key = getProviderStateKey(provider, scope);
        return Array.isArray(state.modelOptionsByProvider?.[key]) ? state.modelOptionsByProvider[key] : [];
    }

    function resolveExistingPresetName(presetName, fallbackName) {
        const presets = state.config?.presets || {};
        const normalizedName = normalizePresetName(presetName || fallbackName || DEFAULT_PRESET_NAME);
        if (presets[normalizedName]) return normalizedName;
        if (fallbackName && presets[fallbackName]) return fallbackName;
        return Object.keys(presets)[0] || DEFAULT_PRESET_NAME;
    }

    function buildDelegateDraftFromPreset(presetName, preset) {
        const normalizedPresetName = resolveExistingPresetName(presetName, DEFAULT_PRESET_NAME);
        const sourcePreset = preset && typeof preset === 'object' ? preset : buildDefaultPreset();
        const delegateProvider = sourcePreset.provider || 'openai-compatible';
        const delegateModelConfigs = normalizeModelConfigs(sourcePreset.modelConfigs || {});
        const delegateProviderConfig = delegateModelConfigs[delegateProvider] || {};
        return {
            delegatePresetName: normalizedPresetName,
            delegateProvider,
            delegateModelConfigs,
            delegateBaseUrl: String(delegateProviderConfig.baseUrl || ''),
            delegateModel: String(delegateProviderConfig.model || ''),
            delegateApiKey: String(delegateProviderConfig.apiKey || ''),
            delegateTemperature: normalizeTemperature(delegateProviderConfig.temperature, 0.2),
            delegateSendTemperature: shouldSendTemperature(delegateProviderConfig),
            delegateReasoningEnabled: Boolean(delegateProviderConfig.reasoningEnabled),
            delegateReasoningEffort: normalizeReasoningEffort(delegateProviderConfig.reasoningEffort),
            delegateToolMode: delegateProviderConfig.toolMode || 'native',
        };
    }

    function buildProviderDraftFields(provider = 'openai-compatible', modelConfigs = {}) {
        const normalizedConfigs = normalizeModelConfigs(modelConfigs || {});
        const providerConfig = normalizedConfigs[provider] || {};
        return {
            baseUrl: String(providerConfig.baseUrl || ''),
            model: String(providerConfig.model || ''),
            apiKey: String(providerConfig.apiKey || ''),
            temperature: normalizeTemperature(providerConfig.temperature, 0.2),
            sendTemperature: shouldSendTemperature(providerConfig),
            reasoningEnabled: Boolean(providerConfig.reasoningEnabled),
            reasoningEffort: normalizeReasoningEffort(providerConfig.reasoningEffort),
            toolMode: providerConfig.toolMode || 'native',
        };
    }

    function buildDelegateProviderDraftFields(provider = 'openai-compatible', modelConfigs = {}) {
        const normalizedConfigs = normalizeModelConfigs(modelConfigs || {});
        const providerConfig = normalizedConfigs[provider] || {};
        return {
            delegateBaseUrl: String(providerConfig.baseUrl || ''),
            delegateModel: String(providerConfig.model || ''),
            delegateApiKey: String(providerConfig.apiKey || ''),
            delegateTemperature: normalizeTemperature(providerConfig.temperature, 0.2),
            delegateSendTemperature: shouldSendTemperature(providerConfig),
            delegateReasoningEnabled: Boolean(providerConfig.reasoningEnabled),
            delegateReasoningEffort: normalizeReasoningEffort(providerConfig.reasoningEffort),
            delegateToolMode: providerConfig.toolMode || 'native',
        };
    }

    function buildDraftFromPreset(presetName, preset, sourceConfig = state.config) {
        const normalizedPresetName = normalizePresetName(presetName || DEFAULT_PRESET_NAME);
        const sourcePreset = preset && typeof preset === 'object' ? preset : buildDefaultPreset();
        const provider = sourcePreset.provider || 'openai-compatible';
        const modelConfigs = normalizeModelConfigs(sourcePreset.modelConfigs || {});
        const providerDraftFields = buildProviderDraftFields(provider, modelConfigs);
        const delegatePresetName = resolveExistingPresetName(sourceConfig?.delegatePresetName, normalizedPresetName);
        const delegateSource = sourceConfig?.delegateConfig && typeof sourceConfig.delegateConfig === 'object'
            ? sourceConfig.delegateConfig
            : ((sourceConfig?.presets || {})[delegatePresetName] || sourcePreset);
        const delegateDraft = buildDelegateDraftFromPreset(delegatePresetName, delegateSource);
        return {
            currentPresetName: normalizedPresetName,
            presetDraftName: normalizedPresetName,
            provider,
            modelConfigs,
            ...providerDraftFields,
            tavilyApiKey: String(sourceConfig?.tavilyApiKey || ''),
            tavilyBaseUrl: normalizeTavilyBaseUrl(sourceConfig?.tavilyBaseUrl || DEFAULT_TAVILY_BASE_URL),
            permissionMode: normalizePermissionMode(sourcePreset.permissionMode),
            jsApiPermission: normalizeJsApiPermission(sourceConfig?.jsApiPermission),
            ...delegateDraft,
        };
    }

    function ensureConfigDraft() {
        if (state.configDraft) return state.configDraft;
        const currentPresetName = normalizePresetName(state.config?.currentPresetName || DEFAULT_PRESET_NAME);
        const currentPreset = (state.config?.presets || {})[currentPresetName] || buildDefaultPreset();
        state.configDraft = buildDraftFromPreset(currentPresetName, currentPreset);
        return state.configDraft;
    }

    function readDraftFromForm(root) {
        const draft = ensureConfigDraft();
        const provider = root.querySelector('#xb-assistant-provider')?.value || draft.provider || 'openai-compatible';
        const delegateProvider = root.querySelector('#xb-assistant-delegate-provider')?.value || draft.delegateProvider || 'openai-compatible';
        const providerConfig = {
            baseUrl: root.querySelector('#xb-assistant-base-url')?.value.trim() || '',
            model: root.querySelector('#xb-assistant-model')?.value.trim() || '',
            apiKey: root.querySelector('#xb-assistant-api-key')?.value.trim() || '',
            temperature: normalizeTemperature(root.querySelector('#xb-assistant-temperature')?.value, draft.temperature ?? 0.2),
            sendTemperature: root.querySelector('#xb-assistant-send-temperature')?.checked ?? Boolean(draft.sendTemperature ?? true),
            reasoningEnabled: root.querySelector('#xb-assistant-reasoning-enabled')?.checked || false,
            reasoningEffort: normalizeReasoningEffort(root.querySelector('#xb-assistant-reasoning-effort')?.value),
            toolMode: isToolModeProvider(provider)
                ? (root.querySelector('#xb-assistant-tool-mode')?.value || draft.toolMode || 'native')
                : undefined,
        };
        const delegateProviderConfig = {
            baseUrl: root.querySelector('#xb-assistant-delegate-base-url')?.value.trim() ?? draft.delegateBaseUrl ?? '',
            model: root.querySelector('#xb-assistant-delegate-model')?.value.trim() ?? draft.delegateModel ?? '',
            apiKey: root.querySelector('#xb-assistant-delegate-api-key')?.value.trim() ?? draft.delegateApiKey ?? '',
            temperature: normalizeTemperature(root.querySelector('#xb-assistant-delegate-temperature')?.value, draft.delegateTemperature ?? 0.2),
            sendTemperature: root.querySelector('#xb-assistant-delegate-send-temperature')?.checked ?? Boolean(draft.delegateSendTemperature ?? true),
            reasoningEnabled: root.querySelector('#xb-assistant-delegate-reasoning-enabled')?.checked ?? Boolean(draft.delegateReasoningEnabled),
            reasoningEffort: normalizeReasoningEffort(root.querySelector('#xb-assistant-delegate-reasoning-effort')?.value || draft.delegateReasoningEffort),
            toolMode: isToolModeProvider(delegateProvider)
                ? (root.querySelector('#xb-assistant-delegate-tool-mode')?.value || draft.delegateToolMode || 'native')
                : undefined,
        };
        const modelConfigs = {
            ...normalizeModelConfigs(draft.modelConfigs || {}),
            [provider]: {
                ...(normalizeModelConfigs(draft.modelConfigs || {})[provider] || {}),
                ...providerConfig,
            },
        };
        const delegateModelConfigs = {
            ...normalizeModelConfigs(draft.delegateModelConfigs || {}),
            [delegateProvider]: {
                ...(normalizeModelConfigs(draft.delegateModelConfigs || {})[delegateProvider] || {}),
                ...delegateProviderConfig,
            },
        };
        return {
            ...draft,
            currentPresetName: draft.currentPresetName,
            presetDraftName: normalizePresetName(root.querySelector('#xb-assistant-preset-name')?.value),
            provider,
            modelConfigs,
            baseUrl: providerConfig.baseUrl,
            model: providerConfig.model,
            apiKey: providerConfig.apiKey,
            temperature: providerConfig.temperature,
            sendTemperature: providerConfig.sendTemperature,
            reasoningEnabled: providerConfig.reasoningEnabled,
            reasoningEffort: providerConfig.reasoningEffort,
            toolMode: providerConfig.toolMode || draft.toolMode || 'native',
            tavilyApiKey: root.querySelector('#xb-assistant-tavily-api-key')?.value.trim() || '',
            tavilyBaseUrl: normalizeTavilyBaseUrl(draft.tavilyBaseUrl || DEFAULT_TAVILY_BASE_URL),
            permissionMode: normalizePermissionMode(root.querySelector('#xb-assistant-permission-mode')?.value || draft.permissionMode),
            jsApiPermission: normalizeJsApiPermission(root.querySelector('#xb-assistant-jsapi-permission')?.value || draft.jsApiPermission),
            delegatePresetName: resolveExistingPresetName(root.querySelector('#xb-assistant-delegate-preset-select')?.value || draft.delegatePresetName, draft.currentPresetName),
            delegateProvider,
            delegateModelConfigs,
            delegateBaseUrl: delegateProviderConfig.baseUrl,
            delegateModel: delegateProviderConfig.model,
            delegateApiKey: delegateProviderConfig.apiKey,
            delegateTemperature: delegateProviderConfig.temperature,
            delegateSendTemperature: delegateProviderConfig.sendTemperature,
            delegateReasoningEnabled: delegateProviderConfig.reasoningEnabled,
            delegateReasoningEffort: delegateProviderConfig.reasoningEffort,
            delegateToolMode: delegateProviderConfig.toolMode || draft.delegateToolMode || 'native',
        };
    }

    function syncConfigDraft(root) {
        state.configDraft = readDraftFromForm(root);
        return state.configDraft;
    }

    function resolveRuntimeMaxTokens(draft = ensureConfigDraft()) {
        if (isAnthropicProvider(draft.provider)) {
            return 32000;
        }
        return null;
    }

    function buildProviderConfigFromDraft(draft = ensureConfigDraft()) {
        return {
            baseUrl: String(draft.baseUrl || ''),
            model: String(draft.model || ''),
            apiKey: String(draft.apiKey || ''),
            temperature: normalizeTemperature(draft.temperature, 0.2),
            sendTemperature: Boolean(draft.sendTemperature ?? true),
            reasoningEnabled: Boolean(draft.reasoningEnabled),
            reasoningEffort: normalizeReasoningEffort(draft.reasoningEffort),
            toolMode: isToolModeProvider(draft.provider)
                ? (draft.toolMode || 'native')
                : undefined,
        };
    }

    function buildDelegateProviderConfigFromDraft(draft = ensureConfigDraft()) {
        return {
            baseUrl: String(draft.delegateBaseUrl || ''),
            model: String(draft.delegateModel || ''),
            apiKey: String(draft.delegateApiKey || ''),
            temperature: normalizeTemperature(draft.delegateTemperature, 0.2),
            sendTemperature: Boolean(draft.delegateSendTemperature ?? true),
            reasoningEnabled: Boolean(draft.delegateReasoningEnabled),
            reasoningEffort: normalizeReasoningEffort(draft.delegateReasoningEffort),
            toolMode: isToolModeProvider(draft.delegateProvider)
                ? (draft.delegateToolMode || 'native')
                : undefined,
        };
    }

    function buildDelegateConfigFromDraft(draft = ensureConfigDraft()) {
        const provider = draft.delegateProvider || 'openai-compatible';
        const modelConfigs = normalizeModelConfigs(draft.delegateModelConfigs || {});
        return {
            provider,
            modelConfigs: {
                ...modelConfigs,
                [provider]: {
                    ...(modelConfigs[provider] || {}),
                    ...buildDelegateProviderConfigFromDraft(draft),
                },
            },
        };
    }

    function buildRuntimeProviderConfigFromDraft(draft = ensureConfigDraft()) {
        return {
            provider: draft.provider || 'openai-compatible',
            baseUrl: draft.baseUrl || '',
            model: draft.model || '',
            apiKey: draft.apiKey || '',
            tavilyApiKey: draft.tavilyApiKey || '',
            tavilyBaseUrl: normalizeTavilyBaseUrl(draft.tavilyBaseUrl || DEFAULT_TAVILY_BASE_URL),
            temperature: draft.sendTemperature === false ? undefined : normalizeTemperature(draft.temperature, 0.2),
            sendTemperature: Boolean(draft.sendTemperature ?? true),
            maxTokens: resolveRuntimeMaxTokens(draft),
            timeoutMs: AGENT_REQUEST_TIMEOUT_MS,
            toolMode: draft.toolMode || 'native',
            reasoningEnabled: Boolean(draft.reasoningEnabled),
            reasoningEffort: normalizeReasoningEffort(draft.reasoningEffort),
        };
    }

    function buildDelegateRuntimeProviderConfigFromDraft(draft = ensureConfigDraft()) {
        return {
            provider: draft.delegateProvider || 'openai-compatible',
            baseUrl: draft.delegateBaseUrl || '',
            model: draft.delegateModel || '',
            apiKey: draft.delegateApiKey || '',
            tavilyApiKey: draft.tavilyApiKey || '',
            tavilyBaseUrl: normalizeTavilyBaseUrl(draft.tavilyBaseUrl || DEFAULT_TAVILY_BASE_URL),
            temperature: draft.delegateSendTemperature === false ? undefined : normalizeTemperature(draft.delegateTemperature, 0.2),
            sendTemperature: Boolean(draft.delegateSendTemperature ?? true),
            maxTokens: isAnthropicProvider(draft.delegateProvider) ? 32000 : null,
            timeoutMs: AGENT_REQUEST_TIMEOUT_MS,
            toolMode: draft.delegateToolMode || 'native',
            reasoningEnabled: Boolean(draft.delegateReasoningEnabled),
            reasoningEffort: normalizeReasoningEffort(draft.delegateReasoningEffort),
        };
    }

    function getActiveProviderConfig(options = {}) {
        const draft = options.role === 'delegate'
            ? ensureConfigDraft()
            : ensureConfigDraft();
        return options.role === 'delegate'
            ? buildDelegateRuntimeProviderConfigFromDraft(draft)
            : buildRuntimeProviderConfigFromDraft(draft);
    }

    function syncPresetDraftName(root) {
        ensureConfigDraft();
        state.configDraft = {
            ...state.configDraft,
            presetDraftName: normalizePresetName(root.querySelector('#xb-assistant-preset-name')?.value),
        };
    }

    function buildRuntimeText(draft = ensureConfigDraft(), provider = draft.provider || 'openai-compatible', scope = 'main') {
        const pullState = getPullState(provider, scope);
        if (typeof getRuntimeSummaryText === 'function') {
            return getRuntimeSummaryText({
                state,
                draft,
                provider,
                pullState,
                providerLabel: getProviderLabel(provider),
            });
        }
        return `预设「${draft.currentPresetName || DEFAULT_PRESET_NAME}」 · ${getProviderLabel(provider)}`;
    }

    function syncInlinePullStatus(root, selector, pullState) {
        const node = root?.querySelector?.(selector);
        if (!node) return;
        const status = String(pullState?.status || 'idle');
        const message = String(pullState?.message || '').trim();
        node.textContent = message;
        node.hidden = !message;
        node.classList.toggle('is-loading', status === 'loading');
        node.classList.toggle('is-success', status === 'success');
        node.classList.toggle('is-error', status === 'error');
    }

    function syncConfigPage(root) {
        if (!root) return;
        const page = normalizeConfigPage(state.configPage);
        state.configPage = page;
        root.querySelectorAll('[data-config-page]').forEach((button) => {
            const isActive = normalizeConfigPage(button?.dataset?.configPage) === page;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        root.querySelectorAll('[data-config-page-panel]').forEach((panel) => {
            const isActive = normalizeConfigPage(panel?.dataset?.configPagePanel) === page;
            panel.toggleAttribute('hidden', !isActive);
        });
        root.querySelector('#xb-assistant-delete-preset')?.toggleAttribute('hidden', page === 'delegate');
    }

    function syncConfigToForm(root) {
        if (!state.config) return;
        syncConfigPage(root);
        const draft = ensureConfigDraft();
        const provider = draft.provider || 'openai-compatible';
        const pulledModels = getProviderModels(provider);
        const delegateProvider = draft.delegateProvider || 'openai-compatible';
        const delegatePulledModels = getProviderModels(delegateProvider, 'delegate');
        const toolModeWrap = root.querySelector('#xb-assistant-tool-mode-wrap');
        const toolModeSelect = root.querySelector('#xb-assistant-tool-mode');
        const reasoningEnabledInput = root.querySelector('#xb-assistant-reasoning-enabled');
        const reasoningEffortWrap = root.querySelector('#xb-assistant-reasoning-effort-wrap');
        const reasoningEffortSelect = root.querySelector('#xb-assistant-reasoning-effort');
        const permissionModeSelect = root.querySelector('#xb-assistant-permission-mode');
        const jsApiPermissionSelect = root.querySelector('#xb-assistant-jsapi-permission');
        const pulledSelect = root.querySelector('#xb-assistant-model-pulled');
        const presetSelect = root.querySelector('#xb-assistant-preset-select');
        const presetNameInput = root.querySelector('#xb-assistant-preset-name');
        const delegatePresetSelect = root.querySelector('#xb-assistant-delegate-preset-select');
        const delegateProviderSelect = root.querySelector('#xb-assistant-delegate-provider');
        const delegateBaseUrlInput = root.querySelector('#xb-assistant-delegate-base-url');
        const delegateModelInput = root.querySelector('#xb-assistant-delegate-model');
        const delegateApiKeyInput = root.querySelector('#xb-assistant-delegate-api-key');
        const tavilyApiKeyInput = root.querySelector('#xb-assistant-tavily-api-key');
        const delegatePulledSelect = root.querySelector('#xb-assistant-delegate-model-pulled');
        const delegateToolModeWrap = root.querySelector('#xb-assistant-delegate-tool-mode-wrap');
        const delegateToolModeSelect = root.querySelector('#xb-assistant-delegate-tool-mode');
        const delegateReasoningEnabledInput = root.querySelector('#xb-assistant-delegate-reasoning-enabled');
        const delegateReasoningEffortWrap = root.querySelector('#xb-assistant-delegate-reasoning-effort-wrap');
        const delegateReasoningEffortSelect = root.querySelector('#xb-assistant-delegate-reasoning-effort');
        if (!presetSelect || !presetNameInput) return;
        const presetOptions = (state.config.presetNames || []).map((name) => ({ value: name, label: name }));

        refillSelect(
            presetSelect,
            presetOptions,
        );
        presetSelect.value = draft.currentPresetName || state.config.currentPresetName || DEFAULT_PRESET_NAME;
        if (delegatePresetSelect) {
            refillSelect(delegatePresetSelect, presetOptions);
            delegatePresetSelect.value = resolveExistingPresetName(draft.delegatePresetName, draft.currentPresetName);
        }
        presetNameInput.value = draft.presetDraftName || draft.currentPresetName || DEFAULT_PRESET_NAME;
        root.querySelector('#xb-assistant-provider').value = provider;
        root.querySelector('#xb-assistant-base-url').value = draft.baseUrl || '';
        root.querySelector('#xb-assistant-model').value = draft.model || '';
        root.querySelector('#xb-assistant-api-key').value = draft.apiKey || '';
        root.querySelector('#xb-assistant-temperature').value = String(normalizeTemperature(draft.temperature, 0.2));
        root.querySelector('#xb-assistant-send-temperature').checked = Boolean(draft.sendTemperature ?? true);
        if (tavilyApiKeyInput) tavilyApiKeyInput.value = draft.tavilyApiKey || '';
        toolModeWrap.style.display = isToolModeProvider(provider) ? '' : 'none';
        refillSelect(toolModeSelect, TOOL_MODE_OPTIONS);
        toolModeSelect.value = draft.toolMode || 'native';
        if (permissionModeSelect) {
            refillSelect(permissionModeSelect, AGENT_PERMISSION_MODE_OPTIONS);
            permissionModeSelect.value = normalizePermissionMode(draft.permissionMode);
        }
        if (jsApiPermissionSelect) {
            refillSelect(jsApiPermissionSelect, AGENT_JSAPI_PERMISSION_OPTIONS);
            jsApiPermissionSelect.value = normalizeJsApiPermission(draft.jsApiPermission);
        }
        refillSelect(reasoningEffortSelect, REASONING_EFFORT_OPTIONS);
        reasoningEnabledInput.checked = Boolean(draft.reasoningEnabled);
        reasoningEffortSelect.value = normalizeReasoningEffort(draft.reasoningEffort);
        reasoningEffortWrap.style.display = reasoningEnabledInput.checked ? '' : 'none';
        refillSelect(pulledSelect, pulledModels.map((model) => ({ value: model, label: model })), '手动填写');
        pulledSelect.value = pulledModels.includes(draft.model) ? draft.model : '';
        if (delegateProviderSelect) delegateProviderSelect.value = delegateProvider;
        if (delegateBaseUrlInput) delegateBaseUrlInput.value = draft.delegateBaseUrl || '';
        if (delegateModelInput) delegateModelInput.value = draft.delegateModel || '';
        if (delegateApiKeyInput) delegateApiKeyInput.value = draft.delegateApiKey || '';
        const delegateTemperatureInput = root.querySelector('#xb-assistant-delegate-temperature');
        const delegateSendTemperatureInput = root.querySelector('#xb-assistant-delegate-send-temperature');
        if (delegateTemperatureInput) delegateTemperatureInput.value = String(normalizeTemperature(draft.delegateTemperature, 0.2));
        if (delegateSendTemperatureInput) delegateSendTemperatureInput.checked = Boolean(draft.delegateSendTemperature ?? true);
        if (delegateToolModeWrap) {
            delegateToolModeWrap.style.display = isToolModeProvider(delegateProvider) ? '' : 'none';
        }
        if (delegateToolModeSelect) {
            refillSelect(delegateToolModeSelect, TOOL_MODE_OPTIONS);
            delegateToolModeSelect.value = draft.delegateToolMode || 'native';
        }
        if (delegateReasoningEffortSelect) {
            refillSelect(delegateReasoningEffortSelect, REASONING_EFFORT_OPTIONS);
            delegateReasoningEffortSelect.value = normalizeReasoningEffort(draft.delegateReasoningEffort);
        }
        if (delegateReasoningEnabledInput) {
            delegateReasoningEnabledInput.checked = Boolean(draft.delegateReasoningEnabled);
        }
        if (delegateReasoningEffortWrap) {
            delegateReasoningEffortWrap.style.display = draft.delegateReasoningEnabled ? '' : 'none';
        }
        if (delegatePulledSelect) {
            refillSelect(delegatePulledSelect, delegatePulledModels.map((model) => ({ value: model, label: model })), '手动填写');
            delegatePulledSelect.value = delegatePulledModels.includes(draft.delegateModel) ? draft.delegateModel : '';
        }
        syncInlinePullStatus(root, '#xb-assistant-model-pull-status', getPullState(provider));
        syncInlinePullStatus(root, '#xb-assistant-delegate-model-pull-status', getPullState(delegateProvider, 'delegate'));

        const runtimeEl = root.querySelector('#xb-assistant-runtime');
        if (runtimeEl) {
            const isDelegatePage = state.configPage === 'delegate';
            const runtimeDraft = isDelegatePage
                ? { ...draft, currentPresetName: '分身', provider: delegateProvider }
                : draft;
            runtimeEl.textContent = buildRuntimeText(runtimeDraft, isDelegatePage ? delegateProvider : provider, isDelegatePage ? 'delegate' : 'main');
        }
    }

    function postSaveConfig(payload) {
        if (typeof saveConfig !== 'function') return;
        const result = saveConfig(payload);
        if (result && typeof result.catch === 'function') {
            result.catch((error) => {
                showToast?.(describeError(error));
            });
        }
    }

    function bindInputVisibilityToggle(root, buttonSelector, inputSelector) {
        root.querySelector(buttonSelector)?.addEventListener('click', () => {
            const input = root.querySelector(inputSelector);
            if (!input) return;
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    }

    function buildConfigSavePayload(config) {
        return {
            workspaceFileName: config?.workspaceFileName || '',
            jsApiPermission: normalizeJsApiPermission(config?.jsApiPermission),
            tavilyApiKey: String(config?.tavilyApiKey || ''),
            tavilyBaseUrl: normalizeTavilyBaseUrl(config?.tavilyBaseUrl || DEFAULT_TAVILY_BASE_URL),
            currentPresetName: config?.currentPresetName || DEFAULT_PRESET_NAME,
            delegatePresetName: config?.delegatePresetName || config?.currentPresetName || DEFAULT_PRESET_NAME,
            delegateConfig: config?.delegateConfig || {},
            presets: config?.presets || {},
        };
    }

    function saveConfigFromForm(root, options = {}) {
        const draft = syncConfigDraft(root);
        const nextPresetName = normalizePresetName(options.presetName || draft.presetDraftName);
        const currentPresetName = normalizePresetName(draft.currentPresetName || state.config?.currentPresetName || DEFAULT_PRESET_NAME);
        const currentPreset = (state.config?.presets || {})[currentPresetName] || buildDefaultPreset();
        const draftModelConfigs = normalizeModelConfigs(draft.modelConfigs || currentPreset.modelConfigs || {});
        const nextPreset = {
            ...currentPreset,
            provider: draft.provider,
            permissionMode: normalizePermissionMode(draft.permissionMode),
            modelConfigs: {
                ...draftModelConfigs,
                [draft.provider]: {
                    ...(draftModelConfigs[draft.provider] || {}),
                    ...buildProviderConfigFromDraft(draft),
                },
            },
        };
        const nextPresets = { ...(state.config?.presets || {}) };
        if (options.renameCurrentPreset && nextPresetName !== currentPresetName) {
            delete nextPresets[currentPresetName];
        }
        nextPresets[nextPresetName] = nextPreset;
        state.config = normalizeAgentConfig({
            ...state.config,
            jsApiPermission: normalizeJsApiPermission(draft.jsApiPermission),
            tavilyApiKey: String(draft.tavilyApiKey || ''),
            tavilyBaseUrl: normalizeTavilyBaseUrl(draft.tavilyBaseUrl || DEFAULT_TAVILY_BASE_URL),
            currentPresetName: nextPresetName,
            delegatePresetName: resolveExistingPresetName(draft.delegatePresetName, nextPresetName),
            delegateConfig: buildDelegateConfigFromDraft(draft),
            presets: nextPresets,
        });
        state.configDraft = buildDraftFromPreset(nextPresetName, nextPreset, state.config);
        requestConfigFormSync();
        postSaveConfig({
            requestId: createRequestId(options.requestPrefix || 'save-config'),
            config: state.config,
            payload: buildConfigSavePayload(state.config),
        });
    }

    function promptForPresetName(message, fallback = '') {
        const current = normalizePresetName(fallback || DEFAULT_PRESET_NAME);
        const next = typeof window !== 'undefined' && typeof window.prompt === 'function'
            ? window.prompt(message, current)
            : current;
        if (next === null) {return '';}
        return normalizePresetName(next);
    }

    function createPresetFromForm(root) {
        const draft = syncConfigDraft(root);
        const nextPresetName = promptForPresetName('输入新预设名称：', `${draft.currentPresetName || DEFAULT_PRESET_NAME} 副本`);
        if (!nextPresetName) {
            showToast?.('预设名称不能为空');
            return;
        }
        root.querySelector('#xb-assistant-preset-name').value = nextPresetName;
        saveConfigFromForm(root, {
            presetName: nextPresetName,
            requestPrefix: 'create-preset',
        });
    }

    function renameCurrentPreset(root) {
        const draft = syncConfigDraft(root);
        const currentPresetName = normalizePresetName(draft.currentPresetName || state.config?.currentPresetName || DEFAULT_PRESET_NAME);
        const nextPresetName = promptForPresetName('输入预设名称：', draft.presetDraftName || currentPresetName);
        if (!nextPresetName) {
            showToast?.('预设名称不能为空');
            return;
        }
        if (nextPresetName === currentPresetName) {return;}
        root.querySelector('#xb-assistant-preset-name').value = nextPresetName;
        saveConfigFromForm(root, {
            presetName: nextPresetName,
            renameCurrentPreset: true,
            requestPrefix: 'rename-preset',
        });
    }

    function deleteCurrentPreset(root) {
        const presetNames = Object.keys(state.config?.presets || {});
        if (presetNames.length <= 1) {
            showToast?.('至少要保留一套预设');
            return;
        }

        const draft = syncConfigDraft(root);
        const currentPresetName = normalizePresetName(state.configDraft?.currentPresetName || state.config?.currentPresetName || DEFAULT_PRESET_NAME);
        const nextPresets = { ...(state.config?.presets || {}) };
        delete nextPresets[currentPresetName];
        const nextPresetName = Object.keys(nextPresets)[0] || DEFAULT_PRESET_NAME;
        const nextPreset = nextPresets[nextPresetName] || buildDefaultPreset();

        state.config = normalizeAgentConfig({
            ...state.config,
            jsApiPermission: normalizeJsApiPermission(draft.jsApiPermission),
            tavilyApiKey: String(draft.tavilyApiKey || state.config?.tavilyApiKey || ''),
            tavilyBaseUrl: normalizeTavilyBaseUrl(draft.tavilyBaseUrl || state.config?.tavilyBaseUrl || DEFAULT_TAVILY_BASE_URL),
            currentPresetName: nextPresetName,
            delegatePresetName: resolveExistingPresetName(draft.delegatePresetName, nextPresetName),
            delegateConfig: buildDelegateConfigFromDraft(draft),
            presets: nextPresets,
        });
        state.configDraft = buildDraftFromPreset(nextPresetName, nextPreset, state.config);
        requestConfigFormSync();
        postSaveConfig({
            requestId: createRequestId('delete-preset'),
            config: state.config,
            payload: buildConfigSavePayload(state.config),
        });
        render?.();
    }

    function bindSettingsPanelEvents(root) {
        if (!root?.querySelector?.('#xb-assistant-provider')) return;

        root.querySelector('#xb-assistant-provider').addEventListener('change', (event) => {
            const nextProvider = event.currentTarget.value;
            const draft = syncConfigDraft(root);
            state.configDraft = {
                ...draft,
                provider: nextProvider,
                ...buildProviderDraftFields(nextProvider, draft.modelConfigs),
            };
            requestConfigFormSync();
            render?.();
        });

        root.querySelector('#xb-assistant-preset-select').addEventListener('change', (event) => {
            const nextPresetName = normalizePresetName(event.currentTarget.value);
            const nextPreset = (state.config?.presets || {})[nextPresetName] || buildDefaultPreset();
            const draft = syncConfigDraft(root);
            state.config = normalizeAgentConfig({
                ...state.config,
                jsApiPermission: normalizeJsApiPermission(draft.jsApiPermission),
                currentPresetName: nextPresetName,
                delegatePresetName: resolveExistingPresetName(draft.delegatePresetName, nextPresetName),
                delegateConfig: buildDelegateConfigFromDraft(draft),
            });
            state.configDraft = buildDraftFromPreset(nextPresetName, nextPreset, state.config);
            requestConfigFormSync();
            render?.();
        });

        root.querySelector('#xb-assistant-preset-name')?.addEventListener('input', () => {
            syncPresetDraftName(root);
        });

        root.querySelector('#xb-assistant-base-url').addEventListener('input', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-model').addEventListener('input', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-api-key').addEventListener('input', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-temperature')?.addEventListener('input', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-send-temperature')?.addEventListener('change', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-tavily-api-key')?.addEventListener('input', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-model-pulled').addEventListener('change', (event) => {
            const value = event.currentTarget.value;
            if (!value) return;
            root.querySelector('#xb-assistant-model').value = value;
            syncConfigDraft(root);
        });

        bindInputVisibilityToggle(root, '#xb-assistant-toggle-key', '#xb-assistant-api-key');
        bindInputVisibilityToggle(root, '#xb-assistant-toggle-tavily-key', '#xb-assistant-tavily-api-key');

        root.querySelector('#xb-assistant-delegate-provider')?.addEventListener('change', (event) => {
            const draft = syncConfigDraft(root);
            const nextProvider = event.currentTarget.value;
            state.configDraft = {
                ...draft,
                delegateProvider: nextProvider,
                ...buildDelegateProviderDraftFields(nextProvider, draft.delegateModelConfigs),
            };
            requestConfigFormSync();
            render?.();
        });

        root.querySelector('#xb-assistant-delegate-base-url')?.addEventListener('input', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-delegate-model')?.addEventListener('input', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-delegate-api-key')?.addEventListener('input', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-delegate-temperature')?.addEventListener('input', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-delegate-send-temperature')?.addEventListener('change', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-delegate-model-pulled')?.addEventListener('change', (event) => {
            const value = event.currentTarget.value;
            if (!value) return;
            const modelInput = root.querySelector('#xb-assistant-delegate-model');
            if (modelInput) modelInput.value = value;
            syncConfigDraft(root);
        });

        bindInputVisibilityToggle(root, '#xb-assistant-delegate-toggle-key', '#xb-assistant-delegate-api-key');

        root.querySelector('#xb-assistant-reasoning-enabled').addEventListener('change', () => {
            syncConfigDraft(root);
            requestConfigFormSync();
            render?.();
        });

        root.querySelector('#xb-assistant-reasoning-effort').addEventListener('change', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-tool-mode').addEventListener('change', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-delegate-reasoning-enabled')?.addEventListener('change', () => {
            syncConfigDraft(root);
            requestConfigFormSync();
            render?.();
        });

        root.querySelector('#xb-assistant-delegate-reasoning-effort')?.addEventListener('change', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-delegate-tool-mode')?.addEventListener('change', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-permission-mode')?.addEventListener('change', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-jsapi-permission')?.addEventListener('change', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-delegate-preset-select')?.addEventListener('change', (event) => {
            const nextPresetName = resolveExistingPresetName(
                event.currentTarget?.value,
                state.configDraft?.currentPresetName || state.config?.currentPresetName || DEFAULT_PRESET_NAME,
            );
            const nextPreset = (state.config?.presets || {})[nextPresetName] || buildDefaultPreset();
            const draft = syncConfigDraft(root);
            state.configDraft = {
                ...draft,
                ...buildDelegateDraftFromPreset(nextPresetName, nextPreset),
            };
            requestConfigFormSync();
            render?.();
        });

        root.querySelectorAll('[data-config-page]').forEach((button) => {
            button.addEventListener('click', (event) => {
                syncConfigDraft(root);
                state.configPage = normalizeConfigPage(event.currentTarget?.dataset?.configPage);
                syncConfigPage(root);
                syncConfigToForm(root);
            });
        });

        root.querySelector('#xb-assistant-pull-models').addEventListener('click', async () => {
            syncConfigDraft(root);
            requestConfigFormSync();
            const providerConfig = getActiveProviderConfig();
            setPullState(providerConfig.provider, { status: 'loading', message: '正在拉取模型列表…' });
            render?.();
            try {
                const models = await pullModelsForProvider(providerConfig);
                setProviderModels(providerConfig.provider, models);
                setPullState(providerConfig.provider, {
                    status: 'success',
                    message: `已拉取 ${models.length} 个模型`,
                });
            } catch (error) {
                setProviderModels(providerConfig.provider, []);
                setPullState(providerConfig.provider, {
                    status: 'error',
                    message: describeError(error),
                });
            }
            requestConfigFormSync();
            render?.();
        });

        root.querySelector('#xb-assistant-delegate-pull-models')?.addEventListener('click', async () => {
            syncConfigDraft(root);
            requestConfigFormSync();
            const providerConfig = getActiveProviderConfig({ role: 'delegate' });
            setPullState(providerConfig.provider, { status: 'loading', message: '正在拉取模型列表…' }, 'delegate');
            render?.();
            try {
                const models = await pullModelsForProvider(providerConfig);
                setProviderModels(providerConfig.provider, models, 'delegate');
                setPullState(providerConfig.provider, {
                    status: 'success',
                    message: `已拉取 ${models.length} 个模型`,
                }, 'delegate');
            } catch (error) {
                setProviderModels(providerConfig.provider, [], 'delegate');
                setPullState(providerConfig.provider, {
                    status: 'error',
                    message: describeError(error),
                }, 'delegate');
            }
            requestConfigFormSync();
            render?.();
        });

        root.querySelector('#xb-assistant-new-preset')?.addEventListener('click', () => {
            createPresetFromForm(root);
        });

        root.querySelector('#xb-assistant-rename-preset')?.addEventListener('click', () => {
            renameCurrentPreset(root);
        });

        root.querySelector('#xb-assistant-save').addEventListener('click', () => {
            saveConfigFromForm(root);
        });

        root.querySelector('#xb-assistant-delegate-save')?.addEventListener('click', () => {
            saveConfigFromForm(root, { requestPrefix: 'save-delegate-config' });
        });

        root.querySelector('#xb-assistant-delete-preset').addEventListener('click', () => {
            deleteCurrentPreset(root);
        });
    }

    return {
        getActiveProviderConfig,
        syncConfigToForm,
        bindSettingsPanelEvents,
    };
}
