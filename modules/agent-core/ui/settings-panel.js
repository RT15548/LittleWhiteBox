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
    normalizeMaxTokens,
    normalizeModelConfigs,
    normalizePermissionMode,
    normalizePresetName,
} from '../config.js';
import {
    AGENT_REQUEST_TIMEOUT_MS,
    TOOL_MODE_OPTIONS,
    getProviderLabel,
    isSillyTavernProvider,
    normalizeTemperature,
    shouldSendTemperature,
} from '../provider-resolution.js';
import {
    getReasoningEffortOptions,
    getReasoningModeOptions,
    resolveReasoningCapability,
    resolveRuntimeReasoning,
} from '../reasoning-capabilities.js';
import {
    normalizeReasoningConfig,
} from '../reasoning-config.js';
import { WEB_PROVIDERS, normalizeWebSettings } from '../web/settings.js';
import { bindWebSettingsGuide, readWebSettingsForm, syncWebSettingsForm } from './web-settings.js';
import { buildPresetListRowsMarkup, syncPresetListControls } from './settings-markup.js';
import { resolveAgentAuth } from '../provider-auth.js';
import { MODEL_LIST_AUTH_OPTIONS, normalizeModelListAuth, supportsModelListAuth } from '../model-list-auth.js';
import { normalizeSampling } from '../sampling.js';
import { readSamplingForm, syncSamplingForm, bindSamplingSettings, validateSamplingForm } from './sampling-settings.js';

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
        item.disabled = option.disabled === true;
        select.appendChild(item);
    });
}

function buildReasoningDraftFields(provider = '', providerConfig = {}) {
    const reasoning = normalizeReasoningConfig(providerConfig.reasoning);
    const capability = resolveReasoningCapability({
        provider,
        baseUrl: providerConfig.baseUrl,
        model: providerConfig.model,
    });
    const fields = {
        reasoningMode: reasoning.mode,
        reasoningEffort: '',
        reasoningBudgetTokens: undefined,
    };
    if (capability.intensity.kind === 'effort') {
        fields.reasoningEffort = capability.intensity.values.includes(reasoning.effort)
            ? reasoning.effort
            : capability.intensity.defaultValue;
    } else if (capability.intensity.kind === 'budget') {
        const budgetTokens = reasoning.budgetTokens;
        const validAuto = capability.intensity.allowAuto && budgetTokens === -1;
        const validRange = Number.isInteger(budgetTokens)
            && budgetTokens >= capability.intensity.min
            && budgetTokens <= capability.intensity.max;
        fields.reasoningBudgetTokens = validAuto || validRange
            ? budgetTokens
            : capability.intensity.defaultValue;
    }
    return fields;
}

function normalizeReasoningDraft(source = {}) {
    return normalizeReasoningConfig(source);
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

function isToolModeProvider(provider = '') {
    return provider === 'openai-compatible' || provider === 'sillytavern-openai-compatible';
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
    const keyQuery = apiKey ? `?key=${encodeURIComponent(apiKey)}` : '';
    return uniqueUrls([
        `${normalized}/models${keyQuery}`,
        `${normalized}/models`,
        `${root}/v1beta/models${keyQuery}`,
        `${root}/v1beta/models`,
        `${root}/models${keyQuery}`,
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

    candidates: for (const url of urls) {
        for (const requestOptions of requestOptionsList) {
            const result = await fetchJsonWithDiagnostics(url, requestOptions);
            if (!result.ok) {
                lastFailure = result;
                if (result.status === 401 || result.status === 403) break candidates;
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

async function pullAnthropicModels(baseUrl, providerConfig, options = {}) {
    const authProvider = normalizeModelListAuth(providerConfig.modelListAuth) === 'bearer' ? 'openai-compatible' : 'anthropic';
    return await tryCandidateFetches({
        urls: buildAnthropicCandidateUrls(baseUrl),
        requestOptionsList: [{
            headers: {
                ...resolveAgentAuth(authProvider, providerConfig.apiKey).headers,
                'anthropic-version': '2023-06-01',
                Accept: 'application/json',
            },
            signal: options.signal,
        }],
        extractModels: extractAnthropicModels,
        providerLabel: 'Anthropic',
    });
}

async function pullSillyTavernClaudeModels(providerConfig, options = {}) {
    const auth = resolveAgentAuth('anthropic', providerConfig.apiKey);
    const customBaseUrl = normalizeBaseUrl(providerConfig.baseUrl || '');
    const baseUrl = normalizeBaseUrl(
        customBaseUrl || HOST_CHAT_COMPLETIONS_DEFAULT_REVERSE_PROXY[HOST_CHAT_COMPLETIONS_SOURCE_CLAUDE],
    );

    if (baseUrl && (auth.apiKey || customBaseUrl)) {
        try {
            return await pullAnthropicModels(baseUrl, providerConfig, options);
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

export async function pullModelsForProvider(providerConfig, options = {}) {
    const provider = providerConfig.provider;
    const baseUrl = normalizeBaseUrl(providerConfig.baseUrl || '');
    const auth = resolveAgentAuth(provider, providerConfig.apiKey);
    const { apiKey } = auth;

    if (provider === 'sillytavern-claude') {
        return filterModels(await pullSillyTavernClaudeModels(providerConfig, options));
    }

    if (isSillyTavernProvider(provider)) {
        return filterModels(await fetchHostChatCompletionsModels(
            providerConfig,
            getSillyTavernChatCompletionSource(provider),
            { signal: options.signal },
        ));
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
                        ...auth.headers,
                    },
                    signal: options.signal,
                },
                ...(apiKey ? [{
                    headers: {
                        Accept: 'application/json',
                        ...resolveAgentAuth('openai-compatible', apiKey).headers,
                    },
                    signal: options.signal,
                }] : []),
            ],
            extractModels: extractGoogleModels,
            providerLabel: 'Google AI',
        });
    }

    if (supportsModelListAuth(provider)) {
        return await pullAnthropicModels(baseUrl, providerConfig, options);
    }

    return await tryCandidateFetches({
        urls: buildOpenAICandidateUrls(baseUrl),
        requestOptionsList: [{
            headers: {
                ...auth.headers,
                Accept: 'application/json',
            },
            signal: options.signal,
        }],
        extractModels: extractOpenAIModels,
        providerLabel: provider === 'openai-responses' ? 'OpenAI Responses' : 'OpenAI-Compatible',
    });
}

function defaultDescribeError(error) {
    return error instanceof Error ? error.message : String(error || 'unknown_error');
}

// 预设表（对象，键 = 预设名）的纯变换：都返回新对象并按给定顺序重建键，
// 因为落盘后的顺序就是对象的键顺序（normalizeAgentConfig 的 presetNames = Object.keys）。
function reorderRecord(record, names) {
    const next = {};
    names.forEach((name) => {
        if (Object.hasOwn(record, name)) next[name] = record[name];
    });
    Object.keys(record).forEach((name) => {
        if (!Object.hasOwn(next, name)) next[name] = record[name];
    });
    return next;
}

function renameRecordKey(record, from, to) {
    const next = {};
    Object.entries(record).forEach(([key, value]) => {
        next[key === from ? to : key] = value;
    });
    return next;
}

function omitRecordKey(record, omitted) {
    const next = {};
    Object.entries(record).forEach(([key, value]) => {
        if (key !== omitted) next[key] = value;
    });
    return next;
}

function insertRecordAfter(record, afterKey, key, value) {
    const next = {};
    Object.entries(record).forEach(([entryKey, entryValue]) => {
        next[entryKey] = entryValue;
        if (entryKey === afterKey) next[key] = value;
    });
    return next;
}

function clonePlain(value) {
    return value && typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
}

function pickCopyName(baseName, takenNames) {
    const first = `${baseName} 副本`;
    if (!takenNames.includes(first)) return first;
    for (let index = 2; ; index += 1) {
        const candidate = `${first} ${index}`;
        if (!takenNames.includes(candidate)) return candidate;
    }
}

export function createAgentSettingsPanel(deps = {}) {
    const {
        state,
        render,
        showToast,
        createRequestId = (prefix = 'req') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        saveConfig,
        pullModels = pullModelsForProvider,
        describeError = defaultDescribeError,
        getRuntimeSummaryText,
        // 预设区布局：默认是下拉框 + 图标按钮；'list' 是可排序的预设列表（opt-in，需配套 markup 的 presetLayout: 'list'）。
        presetLayout = 'select',
        // 列表布局的交互件（拖拽排序 / 行菜单 / 自动滚动）由宿主注入，agent-core 不依赖具体页面的共享模块：
        // { createSortableList, createMenuController, moveStep, autoScroll }
        presetListKit = null,
    } = deps;
    const isListLayout = presetLayout === 'list';

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

    function resolveExistingPresetName(presetName, fallbackName, presets = state.config?.presets || {}) {
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
        const reasoningFields = buildReasoningDraftFields(delegateProvider, delegateProviderConfig);
        return {
            delegatePresetName: normalizedPresetName,
            delegateProvider,
            delegateModelConfigs,
            delegateBaseUrl: String(delegateProviderConfig.baseUrl || ''),
            delegateModel: String(delegateProviderConfig.model || ''),
            delegateApiKey: String(delegateProviderConfig.apiKey || ''),
            delegateModelListAuth: normalizeModelListAuth(delegateProviderConfig.modelListAuth),
            delegateTemperature: normalizeTemperature(delegateProviderConfig.temperature, 1),
            delegateMaxTokens: normalizeMaxTokens(delegateProviderConfig.maxTokens),
            delegateSendTemperature: shouldSendTemperature(delegateProviderConfig),
            delegateReasoningMode: reasoningFields.reasoningMode,
            delegateReasoningEffort: reasoningFields.reasoningEffort,
            delegateReasoningBudgetTokens: reasoningFields.reasoningBudgetTokens,
            delegateToolMode: delegateProviderConfig.toolMode || 'native',
            delegateSampling: normalizeSampling(delegateProviderConfig.sampling),
        };
    }

    function buildProviderDraftFields(provider = 'openai-compatible', modelConfigs = {}) {
        const normalizedConfigs = normalizeModelConfigs(modelConfigs || {});
        const providerConfig = normalizedConfigs[provider] || {};
        const reasoningFields = buildReasoningDraftFields(provider, providerConfig);
        return {
            baseUrl: String(providerConfig.baseUrl || ''),
            model: String(providerConfig.model || ''),
            apiKey: String(providerConfig.apiKey || ''),
            modelListAuth: normalizeModelListAuth(providerConfig.modelListAuth),
            temperature: normalizeTemperature(providerConfig.temperature, 1),
            maxTokens: normalizeMaxTokens(providerConfig.maxTokens),
            sendTemperature: shouldSendTemperature(providerConfig),
            ...reasoningFields,
            toolMode: providerConfig.toolMode || 'native',
            sampling: normalizeSampling(providerConfig.sampling),
        };
    }

    function buildDelegateProviderDraftFields(provider = 'openai-compatible', modelConfigs = {}) {
        const normalizedConfigs = normalizeModelConfigs(modelConfigs || {});
        const providerConfig = normalizedConfigs[provider] || {};
        const reasoningFields = buildReasoningDraftFields(provider, providerConfig);
        return {
            delegateBaseUrl: String(providerConfig.baseUrl || ''),
            delegateModel: String(providerConfig.model || ''),
            delegateApiKey: String(providerConfig.apiKey || ''),
            delegateModelListAuth: normalizeModelListAuth(providerConfig.modelListAuth),
            delegateTemperature: normalizeTemperature(providerConfig.temperature, 1),
            delegateMaxTokens: normalizeMaxTokens(providerConfig.maxTokens),
            delegateSendTemperature: shouldSendTemperature(providerConfig),
            delegateReasoningMode: reasoningFields.reasoningMode,
            delegateReasoningEffort: reasoningFields.reasoningEffort,
            delegateReasoningBudgetTokens: reasoningFields.reasoningBudgetTokens,
            delegateToolMode: providerConfig.toolMode || 'native',
            delegateSampling: normalizeSampling(providerConfig.sampling),
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
            ...normalizeWebSettings(sourceConfig),
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

    function readDraftFromForm(root, providerOverrides = {}) {
        const draft = ensureConfigDraft();
        const provider = providerOverrides.provider
            || root.querySelector('#xb-assistant-provider')?.value
            || draft.provider
            || 'openai-compatible';
        const delegateProvider = providerOverrides.delegateProvider
            || root.querySelector('#xb-assistant-delegate-provider')?.value
            || draft.delegateProvider
            || 'openai-compatible';
        const baseUrl = root.querySelector('#xb-assistant-base-url')?.value.trim() || '';
        const model = root.querySelector('#xb-assistant-model')?.value.trim() || '';
        const delegateBaseUrl = root.querySelector('#xb-assistant-delegate-base-url')?.value.trim()
            ?? draft.delegateBaseUrl
            ?? '';
        const delegateModel = root.querySelector('#xb-assistant-delegate-model')?.value.trim()
            ?? draft.delegateModel
            ?? '';
        const reasoning = normalizeReasoningDraft({
            mode: root.querySelector('#xb-assistant-reasoning-mode')?.value || draft.reasoningMode,
            effort: root.querySelector('#xb-assistant-reasoning-effort')?.value || draft.reasoningEffort,
            budgetTokens: root.querySelector('#xb-assistant-reasoning-budget')?.value
                ?? draft.reasoningBudgetTokens,
        });
        const delegateReasoning = normalizeReasoningDraft({
            mode: root.querySelector('#xb-assistant-delegate-reasoning-mode')?.value
                || draft.delegateReasoningMode,
            effort: root.querySelector('#xb-assistant-delegate-reasoning-effort')?.value
                || draft.delegateReasoningEffort,
            budgetTokens: root.querySelector('#xb-assistant-delegate-reasoning-budget')?.value
                ?? draft.delegateReasoningBudgetTokens,
        });
        const providerConfig = {
            baseUrl,
            model,
            apiKey: root.querySelector('#xb-assistant-api-key')?.value.trim() || '',
            ...(supportsModelListAuth(provider) ? { modelListAuth: normalizeModelListAuth(
                root.querySelector('#xb-assistant-model-list-auth')?.value ?? draft.modelListAuth,
            ) } : {}),
            temperature: normalizeTemperature(root.querySelector('#xb-assistant-temperature')?.value, draft.temperature ?? 1),
            maxTokens: normalizeMaxTokens(root.querySelector('#xb-assistant-max-tokens')?.value, draft.maxTokens),
            sendTemperature: root.querySelector('#xb-assistant-send-temperature')?.checked ?? Boolean(draft.sendTemperature ?? true),
            reasoning,
            toolMode: isToolModeProvider(provider)
                ? (root.querySelector('#xb-assistant-tool-mode')?.value || draft.toolMode || 'native')
                : undefined,
            sampling: readSamplingForm(root, provider, draft.sampling),
        };
        const delegateProviderConfig = {
            baseUrl: delegateBaseUrl,
            model: delegateModel,
            apiKey: root.querySelector('#xb-assistant-delegate-api-key')?.value.trim() ?? draft.delegateApiKey ?? '',
            ...(supportsModelListAuth(delegateProvider) ? { modelListAuth: normalizeModelListAuth(
                root.querySelector('#xb-assistant-delegate-model-list-auth')?.value ?? draft.delegateModelListAuth,
            ) } : {}),
            temperature: normalizeTemperature(root.querySelector('#xb-assistant-delegate-temperature')?.value, draft.delegateTemperature ?? 1),
            maxTokens: normalizeMaxTokens(root.querySelector('#xb-assistant-delegate-max-tokens')?.value, draft.delegateMaxTokens),
            sendTemperature: root.querySelector('#xb-assistant-delegate-send-temperature')?.checked ?? Boolean(draft.delegateSendTemperature ?? true),
            reasoning: delegateReasoning,
            toolMode: isToolModeProvider(delegateProvider)
                ? (root.querySelector('#xb-assistant-delegate-tool-mode')?.value || draft.delegateToolMode || 'native')
                : undefined,
            sampling: readSamplingForm(root, delegateProvider, draft.delegateSampling, 'delegate'),
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
            modelListAuth: providerConfig.modelListAuth,
            temperature: providerConfig.temperature,
            maxTokens: providerConfig.maxTokens,
            sendTemperature: providerConfig.sendTemperature,
            reasoningMode: providerConfig.reasoning.mode,
            reasoningEffort: providerConfig.reasoning.effort || '',
            reasoningBudgetTokens: providerConfig.reasoning.budgetTokens,
            toolMode: providerConfig.toolMode || draft.toolMode || 'native',
            sampling: providerConfig.sampling,
            ...readWebSettingsForm(root, draft),
            permissionMode: normalizePermissionMode(root.querySelector('#xb-assistant-permission-mode')?.value || draft.permissionMode),
            jsApiPermission: normalizeJsApiPermission(root.querySelector('#xb-assistant-jsapi-permission')?.value || draft.jsApiPermission),
            delegatePresetName: resolveExistingPresetName(root.querySelector('#xb-assistant-delegate-preset-select')?.value || draft.delegatePresetName, draft.currentPresetName),
            delegateProvider,
            delegateModelConfigs,
            delegateBaseUrl: delegateProviderConfig.baseUrl,
            delegateModel: delegateProviderConfig.model,
            delegateApiKey: delegateProviderConfig.apiKey,
            delegateModelListAuth: delegateProviderConfig.modelListAuth,
            delegateTemperature: delegateProviderConfig.temperature,
            delegateMaxTokens: delegateProviderConfig.maxTokens,
            delegateSendTemperature: delegateProviderConfig.sendTemperature,
            delegateReasoningMode: delegateProviderConfig.reasoning.mode,
            delegateReasoningEffort: delegateProviderConfig.reasoning.effort || '',
            delegateReasoningBudgetTokens: delegateProviderConfig.reasoning.budgetTokens,
            delegateToolMode: delegateProviderConfig.toolMode || draft.delegateToolMode || 'native',
            delegateSampling: delegateProviderConfig.sampling,
        };
    }

    function syncConfigDraft(root, providerOverrides = {}) {
        state.configDraft = readDraftFromForm(root, providerOverrides);
        state.configDirty = true;
        return state.configDraft;
    }

    function buildProviderConfigFromDraft(draft = ensureConfigDraft()) {
        return {
            baseUrl: String(draft.baseUrl || ''),
            model: String(draft.model || ''),
            apiKey: String(draft.apiKey || ''),
            ...(supportsModelListAuth(draft.provider) ? { modelListAuth: normalizeModelListAuth(draft.modelListAuth) } : {}),
            temperature: normalizeTemperature(draft.temperature, 1),
            maxTokens: normalizeMaxTokens(draft.maxTokens),
            sendTemperature: Boolean(draft.sendTemperature ?? true),
            reasoning: normalizeReasoningConfig({
                mode: draft.reasoningMode,
                effort: draft.reasoningEffort,
                budgetTokens: draft.reasoningBudgetTokens,
            }),
            toolMode: isToolModeProvider(draft.provider)
                ? (draft.toolMode || 'native')
                : undefined,
            sampling: normalizeSampling(draft.sampling),
        };
    }

    function buildDelegateProviderConfigFromDraft(draft = ensureConfigDraft()) {
        return {
            baseUrl: String(draft.delegateBaseUrl || ''),
            model: String(draft.delegateModel || ''),
            apiKey: String(draft.delegateApiKey || ''),
            ...(supportsModelListAuth(draft.delegateProvider) ? { modelListAuth: normalizeModelListAuth(draft.delegateModelListAuth) } : {}),
            temperature: normalizeTemperature(draft.delegateTemperature, 1),
            maxTokens: normalizeMaxTokens(draft.delegateMaxTokens),
            sendTemperature: Boolean(draft.delegateSendTemperature ?? true),
            reasoning: normalizeReasoningConfig({
                mode: draft.delegateReasoningMode,
                effort: draft.delegateReasoningEffort,
                budgetTokens: draft.delegateReasoningBudgetTokens,
            }),
            toolMode: isToolModeProvider(draft.delegateProvider)
                ? (draft.delegateToolMode || 'native')
                : undefined,
            sampling: normalizeSampling(draft.delegateSampling),
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
            ...(supportsModelListAuth(draft.provider) ? { modelListAuth: normalizeModelListAuth(draft.modelListAuth) } : {}),
            ...normalizeWebSettings(draft),
            temperature: draft.sendTemperature === false ? undefined : normalizeTemperature(draft.temperature, 1),
            sendTemperature: Boolean(draft.sendTemperature ?? true),
            maxTokens: normalizeMaxTokens(draft.maxTokens),
            timeoutMs: AGENT_REQUEST_TIMEOUT_MS,
            toolMode: draft.toolMode || 'native',
            sampling: normalizeSampling(draft.sampling),
            reasoning: resolveRuntimeReasoning({
                provider: draft.provider,
                baseUrl: draft.baseUrl,
                model: draft.model,
                maxTokens: normalizeMaxTokens(draft.maxTokens),
            }, {
                mode: draft.reasoningMode,
                effort: draft.reasoningEffort,
                budgetTokens: draft.reasoningBudgetTokens,
            }),
        };
    }

    function buildDelegateRuntimeProviderConfigFromDraft(draft = ensureConfigDraft()) {
        return {
            provider: draft.delegateProvider || 'openai-compatible',
            baseUrl: draft.delegateBaseUrl || '',
            model: draft.delegateModel || '',
            apiKey: draft.delegateApiKey || '',
            ...(supportsModelListAuth(draft.delegateProvider) ? { modelListAuth: normalizeModelListAuth(draft.delegateModelListAuth) } : {}),
            ...normalizeWebSettings(draft),
            temperature: draft.delegateSendTemperature === false ? undefined : normalizeTemperature(draft.delegateTemperature, 1),
            sendTemperature: Boolean(draft.delegateSendTemperature ?? true),
            maxTokens: normalizeMaxTokens(draft.delegateMaxTokens),
            timeoutMs: AGENT_REQUEST_TIMEOUT_MS,
            toolMode: draft.delegateToolMode || 'native',
            sampling: normalizeSampling(draft.delegateSampling),
            reasoning: resolveRuntimeReasoning({
                provider: draft.delegateProvider,
                baseUrl: draft.delegateBaseUrl,
                model: draft.delegateModel,
                maxTokens: normalizeMaxTokens(draft.delegateMaxTokens),
            }, {
                mode: draft.delegateReasoningMode,
                effort: draft.delegateReasoningEffort,
                budgetTokens: draft.delegateReasoningBudgetTokens,
            }),
        };
    }

    function getConfigReasoningErrors(config = {}) {
        const errors = [];
        Object.entries(config.presets || {}).forEach(([name, preset]) => {
            const provider = preset?.provider || 'openai-compatible';
            const providerConfig = preset?.modelConfigs?.[provider] || {};
            const runtime = resolveRuntimeReasoning({
                provider,
                baseUrl: providerConfig.baseUrl,
                model: providerConfig.model,
                maxTokens: normalizeMaxTokens(providerConfig.maxTokens),
            }, providerConfig.reasoning);
            if (runtime.valid === false) {
                errors.push(`预设“${name}”：${runtime.error}`);
            }
        });

        const delegateProvider = config.delegateConfig?.provider || 'openai-compatible';
        const delegateProviderConfig = config.delegateConfig?.modelConfigs?.[delegateProvider] || {};
        const delegateRuntime = resolveRuntimeReasoning({
            provider: delegateProvider,
            baseUrl: delegateProviderConfig.baseUrl,
            model: delegateProviderConfig.model,
            maxTokens: normalizeMaxTokens(delegateProviderConfig.maxTokens),
        }, delegateProviderConfig.reasoning);
        if (delegateRuntime.valid === false) {
            errors.push(`分身模型：${delegateRuntime.error}`);
        }
        return errors;
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

    function syncReasoningControls(root, scope = 'main') {
        const draft = ensureConfigDraft();
        const delegate = scope === 'delegate';
        const prefix = delegate ? '#xb-assistant-delegate-reasoning' : '#xb-assistant-reasoning';
        const provider = delegate ? draft.delegateProvider : draft.provider;
        const baseUrl = delegate ? draft.delegateBaseUrl : draft.baseUrl;
        const model = delegate ? draft.delegateModel : draft.model;
        const source = {
            mode: delegate ? draft.delegateReasoningMode : draft.reasoningMode,
            effort: delegate ? draft.delegateReasoningEffort : draft.reasoningEffort,
            budgetTokens: delegate
                ? draft.delegateReasoningBudgetTokens
                : draft.reasoningBudgetTokens,
        };
        const capability = resolveReasoningCapability({ provider, baseUrl, model });
        const fields = buildReasoningDraftFields(provider, {
            baseUrl,
            model,
            reasoning: source,
        });
        const mode = fields.reasoningMode;
        const effort = fields.reasoningEffort;
        const budgetTokens = fields.reasoningBudgetTokens;
        const modeSelect = root.querySelector(`${prefix}-mode`);
        const capabilityText = root.querySelector(`${prefix}-capability`);
        const effortWrap = root.querySelector(`${prefix}-effort-wrap`);
        const effortSelect = root.querySelector(`${prefix}-effort`);
        const budgetWrap = root.querySelector(`${prefix}-budget-wrap`);
        const budgetInput = root.querySelector(`${prefix}-budget`);

        if (modeSelect) {
            refillSelect(modeSelect, getReasoningModeOptions(capability));
            modeSelect.value = mode;
        }
        if (capabilityText) {
            capabilityText.textContent = capability.unsupportedReason
                || `能力配置：${capability.profileId}`;
        }
        if (effortSelect) {
            refillSelect(effortSelect, getReasoningEffortOptions(capability));
            effortSelect.value = effort;
        }
        if (effortWrap) {
            effortWrap.style.display = mode === 'on'
                && capability.intensity.kind === 'effort' ? '' : 'none';
        }
        if (budgetInput && capability.intensity.kind === 'budget') {
            budgetInput.min = capability.intensity.allowAuto
                ? '-1'
                : String(capability.intensity.min);
            budgetInput.max = String(capability.intensity.max);
            budgetInput.value = String(budgetTokens);
        }
        if (budgetWrap) {
            budgetWrap.style.display = mode === 'on'
                && capability.intensity.kind === 'budget' ? '' : 'none';
        }
    }

    function syncRuntimeText(root) {
        const runtimeEl = root.querySelector('#xb-assistant-runtime');
        if (!runtimeEl) return;
        const draft = ensureConfigDraft();
        const isDelegatePage = state.configPage === 'delegate';
        const provider = isDelegatePage ? draft.delegateProvider : draft.provider;
        const runtimeDraft = isDelegatePage
            ? { ...draft, currentPresetName: '分身', provider }
            : draft;
        runtimeEl.textContent = buildRuntimeText(
            runtimeDraft,
            provider || 'openai-compatible',
            isDelegatePage ? 'delegate' : 'main',
        );
    }

    function syncModelListAuthControls(root, provider, value, scope = 'main') {
        const prefix = scope === 'delegate' ? '#xb-assistant-delegate' : '#xb-assistant';
        const wrap = root.querySelector(`${prefix}-model-list-auth-wrap`);
        const select = root.querySelector(`${prefix}-model-list-auth`);
        if (wrap) wrap.style.display = supportsModelListAuth(provider) ? '' : 'none';
        if (select) {
            refillSelect(select, MODEL_LIST_AUTH_OPTIONS);
            select.value = normalizeModelListAuth(value);
        }
    }

    function syncConfigToForm(root) {
        if (!state.config) return;
        syncConfigPage(root);
        const draft = ensureConfigDraft();
        const provider = draft.provider || 'openai-compatible';
        const pulledModels = getProviderModels(provider);
        const delegateProvider = draft.delegateProvider || 'openai-compatible';
        const delegatePulledModels = getProviderModels(delegateProvider, 'delegate');
        const providerSelect = root.querySelector('#xb-assistant-provider');
        const baseUrlInput = root.querySelector('#xb-assistant-base-url');
        const modelInput = root.querySelector('#xb-assistant-model');
        const apiKeyInput = root.querySelector('#xb-assistant-api-key');
        const toolModeWrap = root.querySelector('#xb-assistant-tool-mode-wrap');
        const toolModeSelect = root.querySelector('#xb-assistant-tool-mode');
        const permissionModeSelect = root.querySelector('#xb-assistant-permission-mode');
        const jsApiPermissionSelect = root.querySelector('#xb-assistant-jsapi-permission');
        const pulledSelect = root.querySelector('#xb-assistant-model-pulled');
        const maxTokensInput = root.querySelector('#xb-assistant-max-tokens');
        const presetSelect = root.querySelector('#xb-assistant-preset-select');
        const presetNameInput = root.querySelector('#xb-assistant-preset-name');
        const delegatePresetSelect = root.querySelector('#xb-assistant-delegate-preset-select');
        const delegateProviderSelect = root.querySelector('#xb-assistant-delegate-provider');
        const delegateBaseUrlInput = root.querySelector('#xb-assistant-delegate-base-url');
        const delegateModelInput = root.querySelector('#xb-assistant-delegate-model');
        const delegateApiKeyInput = root.querySelector('#xb-assistant-delegate-api-key');
        const delegatePulledSelect = root.querySelector('#xb-assistant-delegate-model-pulled');
        const delegateMaxTokensInput = root.querySelector('#xb-assistant-delegate-max-tokens');
        const delegateToolModeWrap = root.querySelector('#xb-assistant-delegate-tool-mode-wrap');
        const delegateToolModeSelect = root.querySelector('#xb-assistant-delegate-tool-mode');
        if ((!presetSelect && !(isListLayout && root.querySelector('#xb-assistant-preset-list'))) || !presetNameInput) return;
        const presetOptions = (state.config.presetNames || []).map((name) => ({ value: name, label: name }));

        if (presetSelect) {
            refillSelect(
                presetSelect,
                presetOptions,
            );
            presetSelect.value = draft.currentPresetName || state.config.currentPresetName || DEFAULT_PRESET_NAME;
        }
        if (isListLayout) syncPresetList(root);
        if (delegatePresetSelect) {
            refillSelect(delegatePresetSelect, presetOptions);
            delegatePresetSelect.value = resolveExistingPresetName(draft.delegatePresetName, draft.currentPresetName);
        }
        presetNameInput.value = draft.presetDraftName || draft.currentPresetName || DEFAULT_PRESET_NAME;
        if (providerSelect) providerSelect.value = provider;
        if (baseUrlInput) baseUrlInput.value = draft.baseUrl || '';
        if (modelInput) modelInput.value = draft.model || '';
        if (apiKeyInput) apiKeyInput.value = draft.apiKey || '';
        syncModelListAuthControls(root, provider, draft.modelListAuth);
        if (maxTokensInput) maxTokensInput.value = String(normalizeMaxTokens(draft.maxTokens));
        syncWebSettingsForm(root, draft);
        if (toolModeWrap) toolModeWrap.style.display = isToolModeProvider(provider) ? '' : 'none';
        if (toolModeSelect) {
            refillSelect(toolModeSelect, TOOL_MODE_OPTIONS);
            toolModeSelect.value = draft.toolMode || 'native';
        }
        if (permissionModeSelect) {
            refillSelect(permissionModeSelect, AGENT_PERMISSION_MODE_OPTIONS);
            permissionModeSelect.value = normalizePermissionMode(draft.permissionMode);
        }
        if (jsApiPermissionSelect) {
            refillSelect(jsApiPermissionSelect, AGENT_JSAPI_PERMISSION_OPTIONS);
            jsApiPermissionSelect.value = normalizeJsApiPermission(draft.jsApiPermission);
        }
        syncReasoningControls(root);
        if (pulledSelect) {
            refillSelect(pulledSelect, pulledModels.map((model) => ({ value: model, label: model })), '手动填写');
            pulledSelect.value = pulledModels.includes(draft.model) ? draft.model : '';
        }
        if (delegateProviderSelect) delegateProviderSelect.value = delegateProvider;
        if (delegateBaseUrlInput) delegateBaseUrlInput.value = draft.delegateBaseUrl || '';
        if (delegateModelInput) delegateModelInput.value = draft.delegateModel || '';
        if (delegateApiKeyInput) delegateApiKeyInput.value = draft.delegateApiKey || '';
        syncModelListAuthControls(root, delegateProvider, draft.delegateModelListAuth, 'delegate');
        if (delegateMaxTokensInput) delegateMaxTokensInput.value = String(normalizeMaxTokens(draft.delegateMaxTokens));
        if (delegateToolModeWrap) {
            delegateToolModeWrap.style.display = isToolModeProvider(delegateProvider) ? '' : 'none';
        }
        if (delegateToolModeSelect) {
            refillSelect(delegateToolModeSelect, TOOL_MODE_OPTIONS);
            delegateToolModeSelect.value = draft.delegateToolMode || 'native';
        }
        syncReasoningControls(root, 'delegate');
        if (delegatePulledSelect) {
            refillSelect(delegatePulledSelect, delegatePulledModels.map((model) => ({ value: model, label: model })), '手动填写');
            delegatePulledSelect.value = delegatePulledModels.includes(draft.delegateModel) ? draft.delegateModel : '';
        }
        syncInlinePullStatus(root, '#xb-assistant-model-pull-status', getPullState(provider));
        syncInlinePullStatus(root, '#xb-assistant-delegate-model-pull-status', getPullState(delegateProvider, 'delegate'));

        syncSamplingForm(root, draft);
        syncSamplingForm(root, {
            provider: draft.delegateProvider, temperature: draft.delegateTemperature,
            sendTemperature: draft.delegateSendTemperature, sampling: draft.delegateSampling,
        }, 'delegate');

        syncRuntimeText(root);
    }

    // ── 预设列表布局（opt-in：presetLayout: 'list'）──────────────────────────
    // 行级操作（排序 / 重命名 / 复制 / 删除）只改“已保存”的预设表，不把表单草稿写进配置，也不重置表单。
    // 切换预设时 state.config 会掺进草稿里的全局项（见 buildSelectionConfig），所以另存一份“已保存基线”，
    // 行操作的落盘内容以基线为准；基线靠引用识别：state.config 被外部（保存 / 刷新）换掉就重新取。
    let presetBaseline = null;
    let presetOwned = null;
    let presetMenu = null;
    let presetSortable = null;
    const presetListOffs = [];

    function getSavedConfig() {
        if (!presetBaseline || state.config !== presetOwned) {
            presetBaseline = state.config;
            presetOwned = null;
        }
        return presetBaseline;
    }

    // 面板自己改写 state.config 的唯一入口：先把外部换进来的基线记下，再覆盖。
    function commitPanelConfig(next, { saved = false } = {}) {
        if (isListLayout) getSavedConfig();
        state.config = next;
        if (!isListLayout) return;
        presetOwned = next;
        if (saved) presetBaseline = next;
    }

    function getPresetNames(config = state.config) {
        return Array.isArray(config?.presetNames) && config.presetNames.length
            ? config.presetNames.map(String)
            : Object.keys(config?.presets || {});
    }

    function getSelectedPresetName(names) {
        const candidates = [state.configDraft?.currentPresetName, state.config?.currentPresetName];
        return candidates.find(name => names.includes(name)) ?? names[0] ?? '';
    }

    function syncPresetList(root) {
        const list = root?.querySelector?.('#xb-assistant-preset-list');
        if (!list || !state.config) return;
        const names = getPresetNames();
        const selectedName = getSelectedPresetName(names);
        const isBusy = state.configSave?.status === 'saving';
        const canDeletePreset = names.length > 1;
        const rows = Array.from(list.querySelectorAll('[data-preset-item]'));
        if (rows.length !== names.length || rows.some((row, index) => row.dataset.presetName !== names[index])) {
            presetMenu?.close(); // 整体重绘会换掉所有行，已打开的菜单随之失效
            // eslint-disable-next-line no-unsanitized/property -- First-party markup escapes preset names before rendering.
            list.innerHTML = buildPresetListRowsMarkup({ names, selectedName, isBusy, canDeletePreset });
            return;
        }
        // 顺序没变只改高亮，不重绘：被点的按钮留在原处，键盘焦点不丢。
        rows.forEach((row) => {
            const selected = row.dataset.presetName === selectedName;
            row.classList.toggle('is-selected', selected);
            const nameButton = row.querySelector('.xb-assistant-preset-name');
            if (selected) nameButton?.setAttribute('aria-current', 'true');
            else nameButton?.removeAttribute('aria-current');
        });
        syncPresetListControls(root, { isBusy, canDeletePreset });
    }

    function guardPresetBusy() {
        if (state.configSave?.status !== 'saving') return false;
        showToast?.('正在保存，请稍后再试');
        return true;
    }

    function confirmAction(message) {
        return typeof window !== 'undefined' && typeof window.confirm === 'function'
            ? window.confirm(message)
            : true;
    }

    /**
     * 行级操作的统一落盘：transform 变换预设表，remap 修正指向被改名 / 删除预设的名字。
     * 落盘内容 = 已保存基线 + 变换结果（不含表单草稿）；本地 state.config 同步乐观更新，保存失败则回滚。
     * selectName：被删的恰是选中行时，顺势切到邻居（沿用切换预设的草稿语义）。
     */
    function commitPresetChange(root, { transform, remap = name => name, requestPrefix, selectName = '' }) {
        const saved = getSavedConfig();
        const previous = {
            config: state.config,
            baseline: presetBaseline,
            owned: presetOwned,
            draft: state.configDraft,
        };
        const remapNames = (config, presets) => ({
            ...config,
            presets,
            currentPresetName: remap(config.currentPresetName),
            delegatePresetName: remap(config.delegatePresetName),
        });
        const nextSaved = normalizeAgentConfig(remapNames(saved, transform(saved.presets)));
        let nextLocal = normalizeAgentConfig(remapNames(state.config, transform(state.config.presets)));
        const draft = state.configDraft;
        let changedDraftNames = [];
        if (selectName) {
            const synced = syncConfigDraft(root);
            nextLocal = buildSelectionConfig(synced, selectName, nextLocal);
            state.configDraft = buildDraftFromPreset(selectName, nextLocal.presets[selectName], nextLocal);
            requestConfigFormSync();
        } else if (draft) {
            const patch = {
                currentPresetName: remap(draft.currentPresetName),
                presetDraftName: remap(draft.presetDraftName),
                delegatePresetName: remap(draft.delegatePresetName),
            };
            // 只有名字真的被改了才换草稿对象（排序 / 复制不碰草稿）
            changedDraftNames = Object.keys(patch).filter(key => patch[key] !== draft[key]);
            if (changedDraftNames.length) {
                state.configDraft = { ...draft, ...patch };
                const nameInput = root.querySelector('#xb-assistant-preset-name');
                if (nameInput && patch.presetDraftName !== draft.presetDraftName) {
                    nameInput.value = patch.presetDraftName;
                }
            }
        }
        const nextDraft = state.configDraft;
        presetBaseline = nextSaved;
        state.config = nextLocal;
        presetOwned = nextLocal;
        syncPresetList(root);
        if (selectName) render?.();

        const revert = () => {
            if (state.config !== nextLocal) return; // 期间已被外部刷新换掉，以外部为准
            state.config = previous.config;
            presetBaseline = previous.baseline;
            presetOwned = previous.owned;
            if (state.configDraft === nextDraft) state.configDraft = previous.draft;
            else if (state.configDraft && changedDraftNames.length) {
                // 保存期间仍可编辑参数：只回滚本次改动的名字，不覆盖新草稿。
                const names = Object.fromEntries(changedDraftNames
                    .filter(key => state.configDraft[key] === nextDraft[key])
                    .map(key => [key, previous.draft[key]]));
                state.configDraft = { ...state.configDraft, ...names };
            }
            const nameInput = root.querySelector('#xb-assistant-preset-name');
            if (changedDraftNames.includes('presetDraftName') && nameInput?.value === nextDraft.presetDraftName) {
                nameInput.value = previous.draft.presetDraftName;
            }
            if (selectName) requestConfigFormSync();
            syncPresetList(root);
            if (selectName) render?.();
        };
        if (typeof saveConfig !== 'function') return;
        let result;
        try {
            result = saveConfig({
                requestId: createRequestId(requestPrefix),
                config: nextSaved,
                payload: buildConfigSavePayload(nextSaved),
                // 宿主保存成功后不要清掉表单草稿：行操作不该顺带丢掉未保存的编辑
                preserveDraft: true,
            });
        } catch (error) {
            revert();
            showToast?.(describeError(error));
            return;
        }
        Promise.resolve(result).then((outcome) => {
            if (outcome && outcome.ok === false) revert();
        }).catch((error) => {
            revert();
            showToast?.(describeError(error));
        });
    }

    function reorderPresets(root, orderedNames) {
        if (guardPresetBusy()) return;
        const current = getPresetNames();
        const requested = (Array.isArray(orderedNames) ? orderedNames.map(String) : [])
            .filter((name, index, all) => current.includes(name) && all.indexOf(name) === index);
        const next = [...requested, ...current.filter(name => !requested.includes(name))];
        if (next.every((name, index) => name === current[index])) return;
        // 纯数字样的键名会被 JS 固定排在对象最前，自定义顺序存不住：直接拒绝，免得界面和落盘不一致。
        const probe = Object.keys(reorderRecord(state.config.presets, next));
        if (probe.some((name, index) => name !== next[index])) {
            showToast?.('名称为纯数字的预设会固定排在最前，无法调整到这个顺序');
            return;
        }
        commitPresetChange(root, {
            transform: presets => reorderRecord(presets, next),
            requestPrefix: 'reorder-preset',
        });
    }

    function duplicatePresetRow(root, name) {
        if (guardPresetBusy()) return;
        if (!getSavedConfig().presets?.[name]) {
            showToast?.('找不到要复制的预设');
            return;
        }
        const copyName = pickCopyName(name, getPresetNames());
        commitPresetChange(root, {
            // 以该行“已保存”的内容为准，插在原行之后
            transform: presets => insertRecordAfter(presets, name, copyName, clonePlain(presets[name])),
            requestPrefix: 'duplicate-preset',
        });
    }

    function renamePresetRow(root, name) {
        if (guardPresetBusy()) return;
        const nextName = promptForPresetName('输入预设名称：', name);
        if (!nextName) {
            showToast?.('预设名称不能为空');
            return;
        }
        if (nextName === name) return;
        if (getPresetNames().includes(nextName)) {
            showToast?.(`已存在同名预设“${nextName}”`);
            return;
        }
        commitPresetChange(root, {
            transform: presets => renameRecordKey(presets, name, nextName),
            remap: current => (current === name ? nextName : current),
            requestPrefix: 'rename-preset',
        });
    }

    function deletePresetRow(root, name) {
        const names = getPresetNames();
        if (names.length <= 1) {
            showToast?.('至少要保留一套预设');
            return;
        }
        if (guardPresetBusy()) return;
        if (!confirmAction(`确定删除预设“${name}”？`)) return;
        const rest = names.filter(item => item !== name);
        const neighbor = rest[Math.min(Math.max(names.indexOf(name), 0), rest.length - 1)];
        commitPresetChange(root, {
            transform: presets => omitRecordKey(presets, name),
            remap: current => (current === name ? neighbor : current),
            selectName: getSelectedPresetName(names) === name ? neighbor : '',
            requestPrefix: 'delete-preset',
        });
    }

    function getPresetMenu(doc) {
        presetMenu ||= presetListKit?.createMenuController?.({ document: doc }) || null;
        return presetMenu;
    }

    function bindPresetList(root) {
        const list = root.querySelector('#xb-assistant-preset-list');
        if (!list) return;
        presetListOffs.splice(0).forEach(off => off());
        presetSortable?.destroy?.();
        presetSortable = null;
        const doc = root.ownerDocument || globalThis.document;
        const onClick = (event) => {
            const trigger = event.target?.closest?.('[data-preset-action]');
            if (!trigger || !list.contains(trigger) || trigger.hasAttribute('disabled')) return;
            const name = trigger.closest('[data-preset-item]')?.dataset?.presetName;
            if (!name) return;
            const action = trigger.dataset.presetAction;
            if (action === 'menu') {
                getPresetMenu(doc)?.toggle(trigger);
                return;
            }
            presetMenu?.close();
            if (action === 'select') {
                // 再点已选中的一行不重填表单，免得冲掉未保存的编辑
                if (name === getSelectedPresetName(getPresetNames())) return;
                switchPreset(root, name);
                syncPresetList(root);
            } else if (action === 'rename') renamePresetRow(root, name);
            else if (action === 'duplicate') duplicatePresetRow(root, name);
            else if (action === 'delete') deletePresetRow(root, name);
        };
        list.addEventListener('click', onClick);
        presetListOffs.push(() => list.removeEventListener('click', onClick));
        if (typeof presetListKit?.createSortableList === 'function') {
            presetSortable = presetListKit.createSortableList({
                container: list,
                rowSelector: '[data-preset-item]',
                handleSelector: '[data-preset-drag]',
                getId: row => row.dataset.presetName,
                onReorder: names => reorderPresets(root, names),
                moveStep: presetListKit.moveStep,
                autoScroll: event => presetListKit.autoScroll?.(list, event),
                draggingClass: 'is-dragging',
                beforeClass: 'is-drop-before',
                afterClass: 'is-drop-after',
                bodyClass: 'xb-preset-sorting',
                document: doc,
            });
        }
    }

    function destroy() {
        presetListOffs.splice(0).forEach(off => off());
        presetSortable?.destroy?.();
        presetSortable = null;
        presetMenu?.destroy?.();
        presetMenu = null;
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
            ...normalizeWebSettings(config),
            currentPresetName: config?.currentPresetName || DEFAULT_PRESET_NAME,
            delegatePresetName: config?.delegatePresetName || config?.currentPresetName || DEFAULT_PRESET_NAME,
            delegateConfig: config?.delegateConfig || {},
            delegateConfigured: config?.delegateConfigured === true,
            presets: config?.presets || {},
        };
    }

    function validateAndSaveConfig(nextConfig, options = {}) {
        const normalizedConfig = normalizeAgentConfig(nextConfig);
        const reasoningErrors = getConfigReasoningErrors(normalizedConfig);
        if (reasoningErrors.length) {
            showToast?.(reasoningErrors[0]);
            return false;
        }

        commitPanelConfig(normalizedConfig, { saved: true });
        const presetName = normalizePresetName(
            options.presetName || normalizedConfig.currentPresetName || DEFAULT_PRESET_NAME,
        );
        const preset = normalizedConfig.presets?.[presetName] || buildDefaultPreset();
        state.configDraft = buildDraftFromPreset(presetName, preset, normalizedConfig);
        requestConfigFormSync();
        postSaveConfig({
            requestId: createRequestId(options.requestPrefix || 'save-config'),
            config: normalizedConfig,
            payload: buildConfigSavePayload(normalizedConfig),
        });
        return true;
    }

    function saveConfigFromForm(root, options = {}) {
        if (!validateSamplingForm(root)) return;
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
        const nextConfig = {
            ...state.config,
            jsApiPermission: normalizeJsApiPermission(draft.jsApiPermission),
            ...normalizeWebSettings(draft),
            currentPresetName: nextPresetName,
            delegatePresetName: resolveExistingPresetName(draft.delegatePresetName, nextPresetName),
            delegateConfig: buildDelegateConfigFromDraft(draft),
            delegateConfigured: options.configureDelegate === true || state.config?.delegateConfigured === true,
            presets: nextPresets,
        };
        validateAndSaveConfig(nextConfig, {
            presetName: nextPresetName,
            requestPrefix: options.requestPrefix,
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
        if (!validateSamplingForm(root)) return;
        const draft = syncConfigDraft(root);
        const nextPresetName = promptForPresetName('输入新预设名称：', `${draft.currentPresetName || DEFAULT_PRESET_NAME} 副本`);
        if (!nextPresetName) {
            showToast?.('预设名称不能为空');
            return;
        }
        const presetNameInput = root.querySelector('#xb-assistant-preset-name');
        if (!presetNameInput) return;
        presetNameInput.value = nextPresetName;
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
        const presetNameInput = root.querySelector('#xb-assistant-preset-name');
        if (!presetNameInput) return;
        presetNameInput.value = nextPresetName;
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
        const nextConfig = {
            ...state.config,
            jsApiPermission: normalizeJsApiPermission(draft.jsApiPermission),
            ...normalizeWebSettings(draft),
            currentPresetName: nextPresetName,
            delegatePresetName: resolveExistingPresetName(draft.delegatePresetName, nextPresetName),
            delegateConfig: buildDelegateConfigFromDraft(draft),
            presets: nextPresets,
        };
        if (validateAndSaveConfig(nextConfig, {
            presetName: nextPresetName,
            requestPrefix: 'delete-preset',
        })) {
            render?.();
        }
    }

    // 切换预设时把草稿里的全局项（Web 设置 / JS 权限 / 分身）带进 state.config，预设内容则换成目标预设的已保存内容。
    function buildSelectionConfig(draft, nextPresetName, baseConfig = state.config) {
        return normalizeAgentConfig({
            ...baseConfig,
            ...normalizeWebSettings(draft),
            jsApiPermission: normalizeJsApiPermission(draft.jsApiPermission),
            currentPresetName: nextPresetName,
            delegatePresetName: resolveExistingPresetName(draft.delegatePresetName, nextPresetName, baseConfig.presets),
            delegateConfig: buildDelegateConfigFromDraft(draft),
        });
    }

    function switchPreset(root, rawName) {
        const nextPresetName = normalizePresetName(rawName);
        const nextPreset = (state.config?.presets || {})[nextPresetName] || buildDefaultPreset();
        const draft = syncConfigDraft(root);
        commitPanelConfig(buildSelectionConfig(draft, nextPresetName));
        state.configDraft = buildDraftFromPreset(nextPresetName, nextPreset, state.config);
        requestConfigFormSync();
        render?.();
    }

    function bindSettingsPanelEvents(root) {
        if (!root?.querySelector?.('#xb-assistant-provider')) return;

        root.querySelector('#xb-assistant-provider')?.addEventListener('change', (event) => {
            const nextProvider = event.currentTarget.value;
            const previousProvider = ensureConfigDraft().provider;
            const draft = syncConfigDraft(root, { provider: previousProvider });
            state.configDraft = {
                ...draft,
                provider: nextProvider,
                ...buildProviderDraftFields(nextProvider, draft.modelConfigs),
            };
            requestConfigFormSync();
            render?.();
        });

        root.querySelector('#xb-assistant-preset-select')?.addEventListener('change', (event) => {
            switchPreset(root, event.currentTarget.value);
        });

        if (isListLayout) bindPresetList(root);

        root.querySelector('#xb-assistant-preset-name')?.addEventListener('input', () => {
            syncPresetDraftName(root);
        });

        root.querySelector('#xb-assistant-base-url')?.addEventListener('input', () => {
            syncConfigDraft(root);
            syncReasoningControls(root);
            syncRuntimeText(root);
        });

        root.querySelector('#xb-assistant-model')?.addEventListener('input', () => {
            syncConfigDraft(root);
            syncReasoningControls(root);
            syncRuntimeText(root);
        });

        root.querySelector('#xb-assistant-api-key')?.addEventListener('input', () => {
            syncConfigDraft(root);
        });

        for (const prefix of ['#xb-assistant', '#xb-assistant-delegate']) {
            root.querySelector(`${prefix}-model-list-auth`)?.addEventListener('change', () => {
                syncConfigDraft(root);
            });
        }

        root.querySelector('#xb-assistant-max-tokens')?.addEventListener('input', () => {
            syncConfigDraft(root);
        });

        bindWebSettingsGuide(root);
        root.querySelector('#xb-assistant-web-provider')?.addEventListener('change', () => {
            const draft = syncConfigDraft(root);
            syncWebSettingsForm(root, draft);
        });
        for (const { id } of WEB_PROVIDERS) {
            root.querySelector(`#xb-assistant-${id}-api-key`)?.addEventListener('input', () => syncConfigDraft(root));
            bindInputVisibilityToggle(root, `#xb-assistant-toggle-${id}-key`, `#xb-assistant-${id}-api-key`);
        }

        root.querySelector('#xb-assistant-model-pulled')?.addEventListener('change', (event) => {
            const value = event.currentTarget.value;
            if (!value) return;
            const modelInput = root.querySelector('#xb-assistant-model');
            if (modelInput) modelInput.value = value;
            syncConfigDraft(root);
            syncReasoningControls(root);
            syncRuntimeText(root);
        });

        bindInputVisibilityToggle(root, '#xb-assistant-toggle-key', '#xb-assistant-api-key');

        root.querySelector('#xb-assistant-delegate-provider')?.addEventListener('change', (event) => {
            const nextProvider = event.currentTarget.value;
            const previousProvider = ensureConfigDraft().delegateProvider;
            const draft = syncConfigDraft(root, { delegateProvider: previousProvider });
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
            syncReasoningControls(root, 'delegate');
            syncRuntimeText(root);
        });

        root.querySelector('#xb-assistant-delegate-model')?.addEventListener('input', () => {
            syncConfigDraft(root);
            syncReasoningControls(root, 'delegate');
            syncRuntimeText(root);
        });

        root.querySelector('#xb-assistant-delegate-api-key')?.addEventListener('input', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-delegate-max-tokens')?.addEventListener('input', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-delegate-model-pulled')?.addEventListener('change', (event) => {
            const value = event.currentTarget.value;
            if (!value) return;
            const modelInput = root.querySelector('#xb-assistant-delegate-model');
            if (modelInput) modelInput.value = value;
            syncConfigDraft(root);
            syncReasoningControls(root, 'delegate');
            syncRuntimeText(root);
        });

        bindInputVisibilityToggle(root, '#xb-assistant-delegate-toggle-key', '#xb-assistant-delegate-api-key');

        root.querySelector('#xb-assistant-reasoning-mode')?.addEventListener('change', () => {
            syncConfigDraft(root);
            syncReasoningControls(root);
            syncRuntimeText(root);
        });

        root.querySelector('#xb-assistant-reasoning-effort')?.addEventListener('change', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-reasoning-budget')?.addEventListener('input', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-tool-mode')?.addEventListener('change', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-delegate-reasoning-mode')?.addEventListener('change', () => {
            syncConfigDraft(root);
            syncReasoningControls(root, 'delegate');
            syncRuntimeText(root);
        });

        root.querySelector('#xb-assistant-delegate-reasoning-effort')?.addEventListener('change', () => {
            syncConfigDraft(root);
        });

        root.querySelector('#xb-assistant-delegate-reasoning-budget')?.addEventListener('input', () => {
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

        root.querySelector('#xb-assistant-pull-models')?.addEventListener('click', async () => {
            syncConfigDraft(root);
            requestConfigFormSync();
            const providerConfig = getActiveProviderConfig();
            setPullState(providerConfig.provider, { status: 'loading', message: '正在拉取模型列表…' });
            render?.();
            try {
                const models = await pullModels(providerConfig);
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
                const models = await pullModels(providerConfig);
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

        root.querySelector('#xb-assistant-save')?.addEventListener('click', () => {
            saveConfigFromForm(root);
        });

        root.querySelector('#xb-assistant-delegate-save')?.addEventListener('click', () => {
            saveConfigFromForm(root, {
                requestPrefix: 'save-delegate-config',
                configureDelegate: true,
            });
        });

        bindSamplingSettings(root, () => syncConfigDraft(root));

        root.querySelector('#xb-assistant-delete-preset')?.addEventListener('click', () => {
            deleteCurrentPreset(root);
        });
    }

    return {
        getActiveProviderConfig,
        getActiveProviderConfigFromForm(root, options = {}) {
            state.configDraft = readDraftFromForm(root);
            return getActiveProviderConfig(options);
        },
        syncConfigToForm,
        syncPresetList,
        bindSettingsPanelEvents,
        destroy,
    };
}
