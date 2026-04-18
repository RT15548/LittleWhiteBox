const MODEL_FILTERS = {
    chat: {
        exclude: [
            'embedding', 'embed', 'rerank', 'reranker', 'tts', 'speech', 'audio',
            'whisper', 'transcription', 'stt', 'image', 'sdxl', 'flux', 'moderation',
        ],
    },
};

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

function normalizeBaseUrl(rawBaseUrl) {
    return String(rawBaseUrl || '').trim().replace(/\/+$/, '');
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

async function pullModelsForProvider(providerConfig) {
    const provider = providerConfig.provider;
    const baseUrl = normalizeBaseUrl(providerConfig.baseUrl || '');
    const apiKey = String(providerConfig.apiKey || '').trim();

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

    if (provider === 'anthropic') {
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

export function createSettingsPanel(deps) {
    const {
        state,
        post,
        render,
        showToast,
        beginConfigSave,
        requestConfigFormSync,
        describeError,
        getPullState,
        setPullState,
        setProviderModels,
        getProviderModels,
        getProviderLabel,
        normalizeReasoningEffort,
        normalizeAssistantConfig,
        normalizePresetName,
        buildDefaultPreset,
        cloneDefaultModelConfigs,
        createRequestId,
        defaultPresetName,
        requestTimeoutMs,
        toolModeOptions,
        reasoningEffortOptions,
    } = deps;

    function getActiveProviderConfig() {
        const config = state.config || {};
        const provider = config.provider || 'openai-compatible';
        const providerConfig = (config.modelConfigs || {})[provider] || {};
        return {
            provider,
            baseUrl: providerConfig.baseUrl || '',
            model: providerConfig.model || '',
            apiKey: providerConfig.apiKey || '',
            temperature: Number(providerConfig.temperature ?? 0.2),
            maxTokens: null,
            timeoutMs: requestTimeoutMs,
            toolMode: providerConfig.toolMode || 'native',
            reasoningEnabled: Boolean(providerConfig.reasoningEnabled),
            reasoningEffort: normalizeReasoningEffort(providerConfig.reasoningEffort),
        };
    }

    function collectProviderDraft(root, provider) {
        return {
            baseUrl: root.querySelector('#xb-assistant-base-url').value.trim(),
            model: root.querySelector('#xb-assistant-model').value.trim(),
            apiKey: root.querySelector('#xb-assistant-api-key').value.trim(),
            temperature: Number(((state.config?.modelConfigs || {})[provider] || {}).temperature ?? 0.2),
            reasoningEnabled: root.querySelector('#xb-assistant-reasoning-enabled')?.checked || false,
            reasoningEffort: normalizeReasoningEffort(root.querySelector('#xb-assistant-reasoning-effort')?.value),
            toolMode: provider === 'openai-compatible'
                ? (root.querySelector('#xb-assistant-tool-mode')?.value || 'native')
                : undefined,
        };
    }

    function syncPresetDraftName(root) {
        if (!state.config) return;
        state.config.presetDraftName = normalizePresetName(root.querySelector('#xb-assistant-preset-name')?.value);
    }

    function syncCurrentProviderDraft(root, options = {}) {
        if (!state.config) return;
        syncPresetDraftName(root);
        const provider = options.providerOverride || root.querySelector('#xb-assistant-provider').value;
        const currentPresetName = normalizePresetName(state.config.currentPresetName);
        state.config = {
            ...normalizeAssistantConfig({
                ...state.config,
                currentPresetName,
                presetDraftName: state.config.presetDraftName,
                presets: {
                    ...(state.config.presets || {}),
                    [currentPresetName]: {
                        ...((state.config.presets || {})[currentPresetName] || buildDefaultPreset()),
                        provider,
                        modelConfigs: {
                            ...(((state.config.presets || {})[currentPresetName] || {}).modelConfigs || cloneDefaultModelConfigs()),
                            [provider]: {
                                ...((((state.config.presets || {})[currentPresetName] || {}).modelConfigs || cloneDefaultModelConfigs())[provider] || {}),
                                ...collectProviderDraft(root, provider),
                            },
                        },
                    },
                },
            }),
            provider,
        };
    }

    function syncConfigToForm(root) {
        if (!state.config) return;
        const provider = state.config.provider || 'openai-compatible';
        const providerConfig = (state.config.modelConfigs || {})[provider] || {};
        const pulledModels = getProviderModels(provider);
        const toolModeWrap = root.querySelector('#xb-assistant-tool-mode-wrap');
        const toolModeSelect = root.querySelector('#xb-assistant-tool-mode');
        const reasoningEnabledInput = root.querySelector('#xb-assistant-reasoning-enabled');
        const reasoningEffortWrap = root.querySelector('#xb-assistant-reasoning-effort-wrap');
        const reasoningEffortSelect = root.querySelector('#xb-assistant-reasoning-effort');
        const pulledSelect = root.querySelector('#xb-assistant-model-pulled');
        const presetSelect = root.querySelector('#xb-assistant-preset-select');
        const presetNameInput = root.querySelector('#xb-assistant-preset-name');

        refillSelect(
            presetSelect,
            (state.config.presetNames || []).map((name) => ({ value: name, label: name })),
        );
        presetSelect.value = state.config.currentPresetName || defaultPresetName;
        presetNameInput.value = state.config.presetDraftName || state.config.currentPresetName || defaultPresetName;
        root.querySelector('#xb-assistant-provider').value = provider;
        root.querySelector('#xb-assistant-base-url').value = providerConfig.baseUrl || '';
        root.querySelector('#xb-assistant-model').value = providerConfig.model || '';
        root.querySelector('#xb-assistant-api-key').value = providerConfig.apiKey || '';
        toolModeWrap.style.display = provider === 'openai-compatible' ? '' : 'none';
        refillSelect(toolModeSelect, toolModeOptions);
        toolModeSelect.value = providerConfig.toolMode || 'native';
        refillSelect(reasoningEffortSelect, reasoningEffortOptions);
        reasoningEnabledInput.checked = Boolean(providerConfig.reasoningEnabled);
        reasoningEffortSelect.value = normalizeReasoningEffort(providerConfig.reasoningEffort);
        reasoningEffortWrap.style.display = reasoningEnabledInput.checked ? '' : 'none';
        refillSelect(pulledSelect, pulledModels.map((model) => ({ value: model, label: model })), '手动填写');

        const runtimeEl = root.querySelector('#xb-assistant-runtime');
        const pullState = getPullState(provider);
        runtimeEl.textContent = state.runtime
            ? `预设「${state.config.currentPresetName || defaultPresetName}」 · ${getProviderLabel(provider)} · 已索引 ${state.runtime.indexedFileCount || 0} 个前端源码文件${pullState.message ? ` · ${pullState.message}` : ''}`
            : (pullState.message || '');
    }

    function saveConfigFromForm(root) {
        syncCurrentProviderDraft(root);
        const nextPresetName = normalizePresetName(root.querySelector('#xb-assistant-preset-name')?.value);
        const currentPresetName = normalizePresetName(state.config?.currentPresetName || defaultPresetName);
        const existingPreset = (state.config?.presets || {})[nextPresetName];
        if (nextPresetName !== currentPresetName && existingPreset) {
            showToast(`预设「${nextPresetName}」已存在，请从下拉切换到它；如果要新建，请换个名字。`);
            render();
            return;
        }
        const currentPreset = (state.config?.presets || {})[currentPresetName] || buildDefaultPreset();
        const nextPresets = {
            ...(state.config?.presets || {}),
            [nextPresetName]: currentPreset,
        };
        state.config = normalizeAssistantConfig({
            ...state.config,
            currentPresetName: nextPresetName,
            presetDraftName: nextPresetName,
            presets: nextPresets,
        });
        requestConfigFormSync();
        const requestId = createRequestId('save-config');
        beginConfigSave(requestId);
        post('xb-assistant:save-config', {
            requestId,
            workspaceFileName: state.config?.workspaceFileName || '',
            currentPresetName: state.config?.currentPresetName || defaultPresetName,
            presets: state.config?.presets || {},
        });
    }

    function deleteCurrentPreset(root) {
        syncCurrentProviderDraft(root);
        const presetNames = Object.keys(state.config?.presets || {});
        if (presetNames.length <= 1) {
            showToast('至少要保留一套预设');
            return;
        }

        const currentPresetName = normalizePresetName(state.config?.currentPresetName || defaultPresetName);
        const nextPresets = { ...(state.config?.presets || {}) };
        delete nextPresets[currentPresetName];
        const nextPresetName = Object.keys(nextPresets)[0] || defaultPresetName;

        state.config = normalizeAssistantConfig({
            ...state.config,
            currentPresetName: nextPresetName,
            presetDraftName: nextPresetName,
            presets: nextPresets,
        });
        requestConfigFormSync();
        const requestId = createRequestId('delete-preset');
        beginConfigSave(requestId);

        post('xb-assistant:save-config', {
            requestId,
            workspaceFileName: state.config?.workspaceFileName || '',
            currentPresetName: state.config?.currentPresetName || defaultPresetName,
            presets: state.config?.presets || {},
        });

        render();
    }

    function bindSettingsPanelEvents(root) {
        root.querySelector('#xb-assistant-provider').addEventListener('change', (event) => {
            const previousProvider = state.config?.provider || 'openai-compatible';
            const nextProvider = event.currentTarget.value;
            syncCurrentProviderDraft(root, { providerOverride: previousProvider });
            const currentPresetName = normalizePresetName(state.config?.currentPresetName || defaultPresetName);
            state.config = normalizeAssistantConfig({
                ...state.config,
                currentPresetName,
                presetDraftName: state.config?.presetDraftName || currentPresetName,
                presets: {
                    ...(state.config?.presets || {}),
                    [currentPresetName]: {
                        ...((state.config?.presets || {})[currentPresetName] || buildDefaultPreset()),
                        provider: nextProvider,
                    },
                },
            });
            requestConfigFormSync();
            render();
        });

        root.querySelector('#xb-assistant-preset-select').addEventListener('change', (event) => {
            syncCurrentProviderDraft(root);
            const nextPresetName = normalizePresetName(event.currentTarget.value);
            const nextPreset = (state.config?.presets || {})[nextPresetName] || buildDefaultPreset();
            state.config = normalizeAssistantConfig({
                ...state.config,
                currentPresetName: nextPresetName,
                presetDraftName: nextPresetName,
                provider: nextPreset.provider,
                modelConfigs: nextPreset.modelConfigs,
            });
            requestConfigFormSync();
            render();
        });

        root.querySelector('#xb-assistant-preset-name').addEventListener('input', () => {
            syncPresetDraftName(root);
        });

        root.querySelector('#xb-assistant-base-url').addEventListener('input', () => {
            syncCurrentProviderDraft(root);
        });

        root.querySelector('#xb-assistant-model').addEventListener('input', () => {
            syncCurrentProviderDraft(root);
        });

        root.querySelector('#xb-assistant-api-key').addEventListener('input', () => {
            syncCurrentProviderDraft(root);
        });

        root.querySelector('#xb-assistant-model-pulled').addEventListener('change', (event) => {
            const value = event.currentTarget.value;
            if (!value) return;
            root.querySelector('#xb-assistant-model').value = value;
            syncCurrentProviderDraft(root);
        });

        root.querySelector('#xb-assistant-toggle-key').addEventListener('click', () => {
            const keyInput = root.querySelector('#xb-assistant-api-key');
            keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
            render();
        });

        root.querySelector('#xb-assistant-reasoning-enabled').addEventListener('change', () => {
            syncCurrentProviderDraft(root);
            requestConfigFormSync();
            render();
        });

        root.querySelector('#xb-assistant-reasoning-effort').addEventListener('change', () => {
            syncCurrentProviderDraft(root);
        });

        root.querySelector('#xb-assistant-pull-models').addEventListener('click', async () => {
            syncCurrentProviderDraft(root);
            requestConfigFormSync();
            const providerConfig = getActiveProviderConfig();
            setPullState(providerConfig.provider, { status: 'loading', message: '正在拉取模型列表…' });
            render();
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
            render();
        });

        root.querySelector('#xb-assistant-save').addEventListener('click', () => {
            saveConfigFromForm(root);
        });

        root.querySelector('#xb-assistant-delete-preset').addEventListener('click', () => {
            deleteCurrentPreset(root);
        });
    }

    return {
        getActiveProviderConfig,
        syncCurrentProviderDraft,
        syncConfigToForm,
        bindSettingsPanelEvents,
    };
}
