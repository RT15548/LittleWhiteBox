const EFFORT_LABELS = Object.freeze({
    min: '最小',
    low: '低',
    medium: '中',
    high: '高',
    max: '最大',
});

const DEFAULT_CAPABILITY = Object.freeze({
    efforts: Object.freeze(['min', 'low', 'medium', 'high', 'max']),
    includeOutput: false,
});

const PROVIDER_CAPABILITIES = Object.freeze({
    'openai-responses': Object.freeze({
        efforts: Object.freeze(['min', 'low', 'medium', 'high', 'max']),
        includeOutput: true,
    }),
    'openai-compatible': DEFAULT_CAPABILITY,
    'sillytavern-openai-compatible': Object.freeze({
        efforts: Object.freeze(['min', 'low', 'medium', 'high', 'max']),
        includeOutput: false,
    }),
    'sillytavern-claude': Object.freeze({
        efforts: Object.freeze(['min', 'low', 'medium', 'high', 'max']),
        includeOutput: true,
    }),
    'sillytavern-google': Object.freeze({
        efforts: Object.freeze(['min', 'low', 'medium', 'high', 'max']),
        includeOutput: true,
    }),
    anthropic: Object.freeze({
        efforts: Object.freeze(['low', 'medium', 'high', 'max']),
        includeOutput: true,
    }),
    google: Object.freeze({
        efforts: Object.freeze(['min', 'low', 'medium', 'high']),
        includeOutput: true,
    }),
});

export function getReasoningCapability(provider = '') {
    return PROVIDER_CAPABILITIES[String(provider || '').trim()] || DEFAULT_CAPABILITY;
}

export function getReasoningEffortOptions(provider = '') {
    return getReasoningCapability(provider).efforts.map((value) => ({
        value,
        label: EFFORT_LABELS[value],
    }));
}

export function normalizeReasoningEffort(value = '', provider = '') {
    const alias = value === 'minimal' ? 'min' : (value === 'xhigh' ? 'max' : value);
    const efforts = getReasoningCapability(provider).efforts;
    return efforts.includes(alias) ? alias : 'medium';
}

export function mapReasoningEffortForProvider(provider = '', value = '') {
    const normalizedProvider = String(provider || '').trim();
    const effort = normalizeReasoningEffort(value, normalizedProvider);
    if (normalizedProvider === 'openai-responses' || normalizedProvider === 'openai-compatible') {
        if (effort === 'min') return 'minimal';
        if (effort === 'max') return 'xhigh';
    }
    if (normalizedProvider === 'google' && effort === 'min') return 'minimal';
    return effort;
}

export function normalizeReasoningIncludeOutput(value, provider = '') {
    return getReasoningCapability(provider).includeOutput && value !== false;
}

export function resolveRuntimeReasoning(provider = '', source = {}) {
    const requestedEffort = normalizeReasoningEffort(source.reasoningEffort, provider);
    const enabled = source.reasoningEnabled === true;
    return {
        reasoningEnabled: enabled,
        reasoningRequestedEffort: requestedEffort,
        reasoningEffort: mapReasoningEffortForProvider(provider, requestedEffort),
        reasoningIncludeOutput: enabled && normalizeReasoningIncludeOutput(
            source.reasoningIncludeOutput,
            provider,
        ),
    };
}
