import { TEXT_API_COPY } from './copy.js';
import { createPreset, HOST_BINDING, HOST_PROVIDER, TEXT_API_VERSION } from './model.js';

// Compatibility: the three deployed per-feature API records. Only upgrade/import
// calls this conversion; current settings never carry these field names.
const channels = { st: HOST_PROVIDER, openai: 'sillytavern-openai-compatible', custom: 'sillytavern-openai-compatible',
    google: 'sillytavern-google', gemini: 'sillytavern-google', claude: 'sillytavern-claude', anthropic: 'sillytavern-claude' };
function migrateProvider(channel) {
    if (!channels[channel]) throw new Error(TEXT_API_COPY.invalid);
    return channels[channel];
}
const samplingKeys = { top_p: 'topP', top_k: 'topK', presence_penalty: 'presencePenalty', frequency_penalty: 'frequencyPenalty' };
const present = value => value !== undefined && value !== null && value !== '';
const numeric = value => present(value) ? Number(value) : null;

function samplingFromLegacy(source, { skipZeroTopK = false } = {}) {
    return Object.fromEntries(Object.entries(samplingKeys)
        .filter(([key]) => present(source[key]) && !(skipZeroTopK && key === 'top_k' && Number(source[key]) === 0))
        .map(([key, name]) => [name, { enabled: true, value: Number(source[key]) }]));
}

export function migrateLegacySettings({ summary = {}, planner = {}, outline = {} }) {
    const api = summary.api || {};
    const gen = summary.gen || {};
    const presets = [createPreset('summary-default', '默认1', {
        provider: migrateProvider(api.provider || 'st'), baseUrl: api.url, apiKey: api.key, model: api.model,
        stream: summary.trigger?.useStream, maxTokens: numeric(gen.max_tokens), temperature: numeric(gen.temperature), sampling: samplingFromLegacy(gen),
    })];
    const bindings = { summary: presets[0].id, planner: null, outline: HOST_BINDING };
    const planning = planner.api || {};
    if (['baseUrl', 'apiKey', 'model', 'customPrefix'].some(key => String(planning[key] || '').trim())
        || (planning.channel && planning.channel !== 'openai')
        || ['max_tokens', 'presence_penalty', 'frequency_penalty'].some(key => present(planning[key]))
        || (present(planning.temperature) && Number(planning.temperature) !== 1)
        || (present(planning.top_p) && Number(planning.top_p) !== 1)
        || (present(planning.top_k) && Number(planning.top_k) !== 0)) {
        const preset = createPreset('planner-default', '默认2', {
            provider: migrateProvider(planning.channel || 'openai'), baseUrl: planning.baseUrl, apiKey: planning.apiKey,
            model: planning.model, prefixMode: planning.prefixMode, customPrefix: planning.customPrefix,
            stream: planning.stream, temperature: numeric(planning.temperature), maxTokens: numeric(planning.max_tokens),
            sampling: samplingFromLegacy(planning, { skipZeroTopK: true }),
        });
        presets.push(preset); bindings.planner = preset.id;
    }
    const global = outline.globalSettings || {};
    if (['apiUrl', 'apiKey', 'model'].some(key => String(global[key] || '').trim())) {
        const preset = createPreset('outline-default', '默认3', {
            provider: global.apiUrl?.trim() ? channels.openai : HOST_PROVIDER,
            baseUrl: global.apiUrl, apiKey: global.apiKey, model: global.model,
            stream: outline.commSettings?.stream ?? false,
        });
        presets.push(preset); bindings.outline = preset.id;
    }
    return { version: TEXT_API_VERSION, presets, bindings };
}

export function withoutLegacySummaryApi(config) {
    const next = structuredClone(config);
    delete next.api; delete next.gen;
    if (next.trigger) delete next.trigger.useStream;
    return next;
}
export function withoutLegacyPlannerApi(config) {
    const next = structuredClone(config); delete next.api; return next;
}
export function withoutLegacyOutlineApi(config) {
    const next = structuredClone(config);
    if (next.globalSettings) for (const key of ['apiUrl', 'apiKey', 'model']) delete next.globalSettings[key];
    if (next.commSettings) delete next.commSettings.stream;
    return next;
}
