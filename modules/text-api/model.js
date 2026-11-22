import { PROVIDER_OPTIONS } from '../agent-core/provider-resolution.js';
import { DEFAULT_MODEL_LIST_AUTH } from '../agent-core/model-list-auth.js';
import { normalizeVertexConfig } from '../agent-core/vertex-config.js';
import { TEXT_API_COPY as COPY } from './copy.js';

export const TEXT_API_SETTINGS_KEY = 'textApiPresets';
export const TEXT_API_VERSION = 3;
export const TEXT_API_FEATURES = Object.freeze(['summary', 'planner', 'outline']);
export const HOST_BINDING = '@host';
export const HOST_PROVIDER = 'sillytavern-current';
export const DEFAULT_REQUEST_TIMEOUT_SEC = 180;
export const MIN_REQUEST_TIMEOUT_SEC = 30;
export const MAX_REQUEST_TIMEOUT_SEC = 3600;

export function normalizeRequestTimeoutSec(value) {
    return Number.isFinite(value)
        ? Math.max(MIN_REQUEST_TIMEOUT_SEC, Math.min(MAX_REQUEST_TIMEOUT_SEC, Math.trunc(value)))
        : DEFAULT_REQUEST_TIMEOUT_SEC;
}

// Only local options belong to this built-in preset; SillyTavern owns its connection.
export function hostPresetOptions({ requestTimeoutSec = DEFAULT_REQUEST_TIMEOUT_SEC } = {}) {
    return { requestTimeoutSec };
}

export function createPreset(id, name, input = {}) {
    return {
        id, name, provider: input.provider ?? HOST_PROVIDER,
        requestTimeoutSec: input.requestTimeoutSec ?? DEFAULT_REQUEST_TIMEOUT_SEC,
        baseUrl: input.baseUrl ?? '', apiKey: input.apiKey ?? '', model: input.model ?? '',
        vertex: normalizeVertexConfig(input.vertex),
        prefixMode: input.prefixMode ?? 'auto', customPrefix: input.customPrefix ?? '',
        stream: input.stream ?? true, temperature: input.temperature ?? null,
        maxTokens: input.maxTokens ?? null, sampling: structuredClone(input.sampling ?? {}),
        reasoning: structuredClone(input.reasoning ?? {}), modelListAuth: input.modelListAuth ?? DEFAULT_MODEL_LIST_AUTH,
    };
}

export function assertPreset(preset) {
    const providers = [HOST_PROVIDER, ...PROVIDER_OPTIONS.map(option => option.value)];
    if (!preset || !providers.includes(preset.provider) || preset.requestTimeoutSec !== normalizeRequestTimeoutSec(preset.requestTimeoutSec)
        || !['baseUrl', 'apiKey', 'model', 'customPrefix'].every(key => typeof preset[key] === 'string')
        || !['auto', 'custom'].includes(preset.prefixMode)
        || typeof preset.stream !== 'boolean'
        || [preset.temperature, preset.maxTokens].some(value => value != null && !Number.isFinite(value))
        || (preset.maxTokens != null && (!Number.isInteger(preset.maxTokens) || preset.maxTokens <= 0))
        || Object.values(preset.sampling || {}).some(entry => entry?.enabled && !Number.isFinite(entry.value))) {
        throw new Error(COPY.invalid);
    }
    return preset;
}

export function assertSettings(value) {
    if (value?.version !== TEXT_API_VERSION || !Array.isArray(value.presets) || !value.presets.length
        || !value.bindings || new Set(value.presets.map(preset => preset.id)).size !== value.presets.length
        || value.presets.some(preset => !preset.id || !preset.name)) throw new Error(COPY.invalid);
    for (const preset of value.presets) assertPreset(preset);
    if (!value.hostPreset || value.hostPreset.requestTimeoutSec !== normalizeRequestTimeoutSec(value.hostPreset.requestTimeoutSec)) throw new Error(COPY.invalid);
    for (const feature of TEXT_API_FEATURES) {
        const id = value.bindings[feature];
        if (id != null && id !== HOST_BINDING && !value.presets.some(preset => preset.id === id)) throw new Error(COPY.invalid);
    }
    return structuredClone(value);
}

export function resolvePreset(settings, id) {
    if (id === HOST_BINDING) return createPreset(HOST_BINDING, COPY.host, hostPresetOptions(settings.hostPreset));
    const preset = settings.presets.find(item => item.id === id);
    if (!preset) throw new Error(COPY.unset);
    return structuredClone(preset);
}

export function resolveFeaturePreset(settings, feature) {
    return resolvePreset(settings, settings.bindings[feature]);
}

export function applyPresetAction(settings, feature, action) {
    if (!TEXT_API_FEATURES.includes(feature)) throw new Error(COPY.invalid);
    const next = assertSettings(settings);
    const index = next.presets.findIndex(preset => preset.id === action.id);
    if (action.type === 'select') {
        if (index === -1) throw new Error(COPY.missing);
        next.bindings[feature] = action.id; return next;
    }
    if (action.type === 'select-host') { next.bindings[feature] = HOST_BINDING; return next; }
    if (action.type === 'save' && action.id === HOST_BINDING) {
        next.hostPreset = hostPresetOptions(action.preset);
        next.bindings[feature] = HOST_BINDING;
        return assertSettings(next);
    }
    if (action.type === 'save' || action.type === 'add' || action.type === 'rename') {
        const name = String(action.type === 'save' ? next.presets[index]?.name ?? '' : action.name ?? action.preset?.name ?? '').trim();
        if (!name) throw new Error(COPY.emptyName);
        if (next.presets.some(preset => preset.name === name && preset.id !== action.id)) throw new Error(COPY.duplicate);
        if (action.type === 'add') {
            if (index !== -1) throw new Error(COPY.duplicate);
            const afterIndex = next.presets.findIndex(preset => preset.id === action.afterId);
            next.presets.splice(afterIndex === -1 ? next.presets.length : afterIndex + 1, 0, createPreset(action.id, name, action.preset));
            next.bindings[feature] = action.id;
        } else {
            if (index === -1) throw new Error(COPY.missing);
            if (action.type === 'rename') next.presets[index].name = name;
            else {
                next.presets[index] = createPreset(action.id, name, action.preset);
                next.bindings[feature] = action.id;
            }
        }
    } else if (action.type === 'delete') {
        if (index === -1) throw new Error(COPY.missing);
        if (next.presets.length === 1) throw new Error(COPY.last);
        next.presets.splice(index, 1);
        const replacement = next.presets[Math.min(index, next.presets.length - 1)].id;
        for (const key of TEXT_API_FEATURES) if (next.bindings[key] === action.id) next.bindings[key] = replacement;
    } else throw new Error(COPY.invalid);
    return assertSettings(next);
}
