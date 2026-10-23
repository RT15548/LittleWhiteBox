import { getDefaultApiPrefix, hasExplicitApiVersion, resolveApiBaseUrl } from '../../shared/common/openai-url-utils.js';
import { extractModelListIds } from '../../shared/common/model-list.js';
import {
 HOST_CHAT_COMPLETIONS_SOURCE_CLAUDE, HOST_CHAT_COMPLETIONS_SOURCE_MAKERSUITE,
 HOST_CHAT_COMPLETIONS_SOURCE_OPENAI, HOST_CHAT_COMPLETIONS_DEFAULT_REVERSE_PROXY,
 fetchHostChatCompletionsModels,
} from '../../shared/host-llm/chat-completions/client.js';
import { isSillyTavernProvider } from './provider-resolution.js';
import { resolveAgentAuth } from './provider-auth.js';
import { normalizeModelListAuth } from './model-list-auth.js';

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


function filterModels(models = []) {
    const normalized = [...new Set(models.filter(Boolean).map((model) => String(model).trim()).filter(Boolean))];
    const rule = MODEL_FILTERS.chat;
    const filtered = normalized.filter((modelId) => {
        const lower = modelId.toLowerCase();
        return !rule.exclude.some((keyword) => lower.includes(keyword));
    });
    return filtered.length ? filtered : normalized;
}
function normalizeBaseUrl(rawBaseUrl) {
    return String(rawBaseUrl || '').trim().replace(/\/+$/, '');
}


function getSillyTavernChatCompletionSource(provider = '') {
    if (provider === 'sillytavern-claude') return HOST_CHAT_COMPLETIONS_SOURCE_CLAUDE;
    if (provider === 'sillytavern-google') return HOST_CHAT_COMPLETIONS_SOURCE_MAKERSUITE;
    return HOST_CHAT_COMPLETIONS_SOURCE_OPENAI;
}

function uniqueUrls(urls = []) {
    return [...new Set(urls.filter(Boolean).map((url) => String(url).trim()).filter(Boolean))];
}

function buildVersionedCandidateUrls(baseUrl, prefix, exact) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return [];
    if (exact || hasExplicitApiVersion(normalized)) return [`${normalized}/models`];
    return uniqueUrls([`${normalized}${prefix}/models`, `${normalized}/models`]);
}

// Discovery defaults are independent of generation. Explicit versions and
// caller-resolved custom prefixes remain authoritative at the URL boundary.
export function getModelListApiPrefix(providerConfig) {
    const nativeGoogle = ['google', 'sillytavern-google'].includes(providerConfig.provider)
        && normalizeModelListAuth(providerConfig.modelListAuth, providerConfig.provider) !== 'bearer';
    return getDefaultApiPrefix(nativeGoogle ? 'google' : 'openai');
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
    return filterModels(extractModelListIds(data));
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
        const safeUrl = lastFailure.url?.replace(/([?&]key=)[^&]*/g, '$1[redacted]');
        const suffix = safeUrl ? ` (${safeUrl})` : '';
        const detail = lastFailure.errorSnippet ? `：${lastFailure.errorSnippet}` : '';
        throw Object.assign(new Error(`${providerLabel} 拉取模型失败：${lastFailure.status || 'unknown'}${detail}${suffix}`), {
            status: lastFailure.status,
        });
    }
    throw new Error(`${providerLabel} 拉取模型失败：未获取到模型列表。`);
}

async function pullAnthropicModels(baseUrl, providerConfig, options = {}) {
    const authProvider = normalizeModelListAuth(providerConfig.modelListAuth) === 'bearer' ? 'openai-compatible' : 'anthropic';
    return await tryCandidateFetches({
        urls: buildVersionedCandidateUrls(baseUrl, '/v1', options.baseUrlResolved),
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
                // Some relays expose model discovery only through their OpenAI
                // endpoint. Keep discovery behind the host proxy; generation
                // continues to use the selected Claude adapter and credentials.
                if (!options.signal?.aborted && error?.name !== 'AbortError'
                    && (error instanceof TypeError || [404, 405, 501].includes(error?.status))) {
                    return filterModels(await fetchHostChatCompletionsModels(
                        {
                            ...providerConfig,
                            baseUrl: options.baseUrlResolved ? customBaseUrl : resolveApiBaseUrl(customBaseUrl, '/v1'),
                        },
                        HOST_CHAT_COMPLETIONS_SOURCE_OPENAI,
                        { signal: options.signal },
                    ));
                }
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

    if (provider === 'sillytavern-claude') {
        return filterModels(await pullSillyTavernClaudeModels(providerConfig, options));
    }

    const googleBearer = provider === 'sillytavern-google'
        && normalizeModelListAuth(providerConfig.modelListAuth, provider) === 'bearer';
    if (!baseUrl && (!isSillyTavernProvider(provider) || googleBearer)) {
        throw new Error('请先填写 Base URL。');
    }

    if (isSillyTavernProvider(provider)) {
        return filterModels(await fetchHostChatCompletionsModels(
            googleBearer ? {
                ...providerConfig,
                baseUrl: options.baseUrlResolved ? baseUrl : resolveApiBaseUrl(baseUrl, getModelListApiPrefix(providerConfig)),
            } : providerConfig,
            googleBearer ? HOST_CHAT_COMPLETIONS_SOURCE_OPENAI : getSillyTavernChatCompletionSource(provider),
            { signal: options.signal },
        ));
    }

    if (provider === 'google') {
        const bearer = normalizeModelListAuth(providerConfig.modelListAuth, provider) === 'bearer';
        const listAuth = bearer ? resolveAgentAuth('openai-compatible', providerConfig.apiKey) : auth;
        return await tryCandidateFetches({
            urls: buildVersionedCandidateUrls(baseUrl, getModelListApiPrefix(providerConfig), options.baseUrlResolved)
                .map(url => !bearer && auth.apiKey ? `${url}?key=${encodeURIComponent(auth.apiKey)}` : url),
            requestOptionsList: [
                {
                    headers: {
                        Accept: 'application/json',
                        ...listAuth.headers,
                    },
                    signal: options.signal,
                },
            ],
            extractModels: extractGoogleModels,
            providerLabel: 'Google AI',
        });
    }

    if (provider === 'anthropic') {
        return await pullAnthropicModels(baseUrl, providerConfig, options);
    }

    return await tryCandidateFetches({
        urls: buildVersionedCandidateUrls(baseUrl, '/v1', options.baseUrlResolved),
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
