import { resolveModelFamily } from '../../shared/host-llm/model-family.js';

// Extra sampling settings belong to each provider configuration, alongside temperature.
export const SAMPLING_PARAMETERS = Object.freeze([
    { key: 'topP', label: 'Top P', value: 1, min: 0, max: 1, step: 0.05 },
    { key: 'topK', label: 'Top K', value: 40, min: 1, step: 1 },
    { key: 'frequencyPenalty', label: '频率惩罚', value: 0, min: -2, max: 2, step: 0.1 },
    { key: 'presencePenalty', label: '存在惩罚', value: 0, min: -2, max: 2, step: 0.1 },
    { key: 'repetitionPenalty', label: '重复惩罚', value: 1, min: 0, step: 0.05 },
]);

const OPENAI_FIELDS = { topP: 'top_p', topK: 'top_k', frequencyPenalty: 'frequency_penalty', presencePenalty: 'presence_penalty' };
const CLAUDE_FIELDS = { topP: 'top_p', topK: 'top_k' };
// Host adapters use SillyTavern's input names, not the upstream SDK's names.
// Only fields forwarded by the host are offered on those routes.
const PROVIDER_FIELDS = {
    'openai-compatible': { ...OPENAI_FIELDS, repetitionPenalty: 'repetition_penalty' },
    'openai-responses': { topP: 'top_p' },
    'sillytavern-openai-compatible': OPENAI_FIELDS,
    anthropic: CLAUDE_FIELDS,
    'sillytavern-claude': CLAUDE_FIELDS,
    google: { topP: 'topP', topK: 'topK', frequencyPenalty: 'frequencyPenalty', presencePenalty: 'presencePenalty' },
    'sillytavern-google': { topP: 'top_p', topK: 'top_k' },
};

export function samplingParametersFor(provider) {
    const fields = PROVIDER_FIELDS[provider] || {};
    return SAMPLING_PARAMETERS.filter(parameter => Object.hasOwn(fields, parameter.key));
}

export function normalizeSampling(sampling = {}) {
    const result = {};
    for (const parameter of SAMPLING_PARAMETERS) {
        const entry = sampling?.[parameter.key];
        if (!entry) continue;
        const value = Number(entry.value);
        result[parameter.key] = {
            enabled: entry.enabled === true,
            value: entry.value !== '' && Number.isFinite(value) ? value : parameter.value,
        };
    }
    return result;
}

// Claude's sampling restrictions belong to the request, never to the saved preset.
// https://platform.claude.com/docs/en/build-with-claude/thinking#feature-compatibility
const CLAUDE_FIXED_SAMPLING_MODELS = new Set([
    'claude-opus-4-7', 'claude-opus-4-8', 'claude-opus-5', 'claude-opus-5-5',
    'claude-sonnet-5', 'claude-sonnet-5-5', 'claude-haiku-5-5',
    'claude-fable-5', 'claude-fable-5-1', 'claude-mythos-5', 'claude-mythos-5-1', 'claude-mythos-preview',
]);

export function buildSamplingParameters(provider, sampling, context = {}) {
    const normalized = normalizeSampling(sampling);
    const parameters = Object.fromEntries(samplingParametersFor(provider)
        .filter(parameter => normalized[parameter.key]?.enabled)
        .map(parameter => [PROVIDER_FIELDS[provider][parameter.key], normalized[parameter.key].value]));
    if ((provider !== 'anthropic' && provider !== 'sillytavern-claude')
        || resolveModelFamily(context.model) !== 'claude') return parameters;
    const model = String(context.model || '').toLowerCase().replaceAll('.', '-')
        .match(/\bclaude-(?:opus|sonnet|haiku|fable|mythos)-(?:preview|\d+(?:-\d{1,2})?)(?=$|[-:/@])/)?.[0];
    if (CLAUDE_FIXED_SAMPLING_MODELS.has(model)) return {};
    if (context.reasoning?.mode === 'on') {
        delete parameters.top_k;
        if (parameters.top_p < 0.95 || parameters.top_p > 1) delete parameters.top_p;
    }
    return parameters;
}
