export const DEFAULT_PROVIDER = 'openai-compatible';
export const DEFAULT_PRESET_NAME = '默认';

export const DEFAULT_MODEL_CONFIGS = {
    'openai-responses': {
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4.1-mini',
        apiKey: '',
        temperature: 0.2,
    },
    'openai-compatible': {
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
        apiKey: '',
        temperature: 0.2,
        toolMode: 'native',
    },
    anthropic: {
        baseUrl: 'https://api.anthropic.com/v1',
        model: 'claude-sonnet-4-0',
        apiKey: '',
        temperature: 0.2,
    },
    google: {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        model: 'gemini-2.5-pro',
        apiKey: '',
        temperature: 0.2,
    },
};

export function cloneDefaultModelConfigs() {
    return JSON.parse(JSON.stringify(DEFAULT_MODEL_CONFIGS));
}

export function buildDefaultPreset() {
    return {
        provider: DEFAULT_PROVIDER,
        modelConfigs: cloneDefaultModelConfigs(),
    };
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

export function normalizeAssistantSettings(saved = {}, options = {}) {
    const {
        defaultWorkspaceFileName = '',
        normalizeWorkspaceName = (value) => String(value || ''),
    } = options;
    const legacyPresetName = normalizePresetName(saved.currentPresetName || saved.presetName || DEFAULT_PRESET_NAME);
    const presets = normalizePresets(saved, legacyPresetName);
    const currentPresetName = resolveCurrentPresetName(presets, saved.currentPresetName);

    return {
        enabled: !!saved.enabled,
        workspaceFileName: normalizeWorkspaceName(saved.workspaceFileName || defaultWorkspaceFileName),
        currentPresetName,
        presets,
        updatedAt: Number(saved.updatedAt) || 0,
        configVersion: Number(saved.configVersion) || 0,
    };
}

export function normalizeAssistantConfig(config = {}) {
    const legacyPresetName = normalizePresetName(config.currentPresetName || config.presetDraftName || DEFAULT_PRESET_NAME);
    const presets = normalizePresets(config, legacyPresetName);
    const currentPresetName = resolveCurrentPresetName(presets, config.currentPresetName);
    const currentPreset = presets[currentPresetName] || buildDefaultPreset();

    return {
        workspaceFileName: String(config.workspaceFileName || ''),
        currentPresetName,
        presetDraftName: normalizePresetName(config.presetDraftName || currentPresetName),
        presetNames: Object.keys(presets),
        presets,
        provider: currentPreset.provider,
        modelConfigs: currentPreset.modelConfigs,
    };
}
