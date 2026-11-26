import { MULTIMODAL_COPY as COPY } from './copy.js';
import { normalizeMaxImagesOverride } from '../../shared/max-images-override.js';
import { normalizeLayout } from '../../shared/scene-planner-layout.js';
import { NATURAL_PROMPT_DEFAULTS } from './prompts.js';
import protocol from '../../shared/multimodal-image-protocol.cjs';
import { formatOpenAiImageError } from './openai-image-errors.js';

export const PROVIDERS = Object.freeze({
    gemini: Object.freeze({ label: 'Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1', model: 'gemini-nano-banana-2.1' }),
    openai: Object.freeze({ label: 'GPT Image', baseUrl: 'https://api.openai.com/v1', model: 'gpt-image-2.6-flare' }),
});
export const GEMINI_ASPECT_RATIOS = Object.freeze(['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9']);
export const GEMINI_IMAGE_SIZES = Object.freeze(['1K', '2K', '4K']);
export const OPENAI_SIZES = Object.freeze(['auto', '1024x1024', '1536x1024', '1024x1536']);
export const OPENAI_QUALITIES = Object.freeze(['auto', 'low', 'medium', 'high']);
export const OPENAI_BACKGROUNDS = Object.freeze(['auto', 'opaque', 'transparent']);
export const OPENAI_OUTPUT_FORMATS = protocol.OPENAI_IMAGE_OUTPUT_FORMATS;
const API_FIELDS = Object.freeze(['apiBaseUrl', 'apiKey', 'timeout', 'sendMode']);
const OPENAI_API_FIELDS = Object.freeze([...API_FIELDS, 'imageApi', 'responsesModel']);
export const apiFieldsFor = provider => provider === 'openai' ? OPENAI_API_FIELDS : API_FIELDS;
const DEFAULT_SEND_MODE = 'frontend';

export function providerDefinition(provider) {
    if (!Object.hasOwn(PROVIDERS, provider)) throw new TypeError(COPY.unknownProvider);
    return PROVIDERS[provider];
}
export function defaultParams(provider) {
    const { model } = providerDefinition(provider);
    return provider === 'gemini' ? { model, aspectRatio: '1:1', imageSize: '1K' }
        : { model, size: 'auto', quality: 'auto', background: 'auto', outputFormat: protocol.readOpenAiImageOutputFormat() };
}
export function createDefaultSettings(provider) {
    const config = { apiBaseUrl: providerDefinition(provider).baseUrl, apiKey: '', timeout: 180000, sendMode: DEFAULT_SEND_MODE,
        ...(provider === 'openai' ? protocol.readOpenAiImageApi() : {}) };
    return { ...config,
        apiPresets: [{ id: 'default', name: COPY.defaultPreset, config: { ...config } }], activeApiPresetId: 'default',
        paramsPresets: [{ id: 'default', name: COPY.defaultPreset, positivePrefix: '', params: defaultParams(provider), maxImages: 1 }],
        selectedParamsPresetId: 'default', mode: 'manual',
        showFloatingButton: true, showFloorButton: true, overrideSize: 'default', overrideMaxImages: null,
        promptPresets: [{ id: 'default', name: COPY.defaultPreset, ...NATURAL_PROMPT_DEFAULTS }], selectedPromptPresetId: 'default',
    };
}
export function getActiveParamsPreset(settings) {
    const preset = settings.paramsPresets.find(item => item.id === settings.selectedParamsPresetId);
    if (!preset) throw new TypeError(COPY.missingPreset);
    return preset;
}
export function validateParams(provider, params) {
    const defaults = defaultParams(provider);
    if (!params || typeof params !== 'object' || Array.isArray(params)) throw new TypeError(COPY.invalidParameter('params'));
    for (const [key, value] of Object.entries(params)) {
        if (!Object.hasOwn(defaults, key)) throw new TypeError(COPY.unsupportedField(`params.${key}`));
        if (typeof value !== 'string') throw new TypeError(COPY.invalidParameter(`params.${key}`));
    }
    if (!params.model?.trim()) throw new TypeError(COPY.missingModel);
    const fields = provider === 'gemini'
        ? { aspectRatio: GEMINI_ASPECT_RATIOS, imageSize: GEMINI_IMAGE_SIZES }
        : { size: OPENAI_SIZES, quality: OPENAI_QUALITIES, background: OPENAI_BACKGROUNDS };
    for (const [key, choices] of Object.entries(fields)) {
        if (!choices.includes(params[key])) throw new TypeError(COPY.invalidParameter(`params.${key}`));
    }
    const normalized = { ...params, model: params.model.trim() };
    if (provider === 'openai') {
        try { return { ...normalized, outputFormat: protocol.readOpenAiImageOutputFormat(params.outputFormat, params.background) }; }
        catch (error) { throw formatOpenAiImageError(error); }
    }
    return normalized;
}
export function getSizeOptions(provider) {
    providerDefinition(provider);
    return [{ value: 'default', label: COPY.followPreset }, ...(provider === 'gemini' ? GEMINI_ASPECT_RATIOS : OPENAI_SIZES)
        .map(value => ({ value, label: value === 'auto' ? COPY.autoValue : value }))];
}
export function isSupportedSize(provider, value) {
    return getSizeOptions(provider).some(option => option.value === value);
}
export function getEffectiveParams(provider, settings, overrides = {}) {
    const overrideSize = settings.overrideSize ?? 'default';
    if (!isSupportedSize(provider, overrideSize)) throw new TypeError(COPY.invalidParameter('overrideSize'));
    const size = overrideSize === 'default' ? {} : { [provider === 'gemini' ? 'aspectRatio' : 'size']: overrideSize };
    return validateParams(provider, { ...getActiveParamsPreset(settings).params, ...size, ...overrides });
}
export function validateOpenAiImageApi(config) {
    try { return protocol.readOpenAiImageApi(config); }
    catch (error) {
        if (error.code === protocol.OPENAI_IMAGE_CODES.invalidApi) error.message = COPY.invalidImageApi;
        if (error.code === protocol.OPENAI_IMAGE_CODES.missingModel) error.message = COPY.missingResponsesModel;
        throw error;
    }
}

export function validateConnection(provider, config) {
    let url;
    try { url = new URL(config.apiBaseUrl); } catch { throw new TypeError(COPY.invalidUrl); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new TypeError(COPY.invalidUrl);
    if (typeof config.apiKey !== 'string') throw new TypeError(COPY.invalidParameter('apiKey'));
    if (!Number.isInteger(config.timeout) || config.timeout < 10000 || config.timeout > 600000) throw new TypeError(COPY.invalidParameter('timeout'));
    const { sendMode = DEFAULT_SEND_MODE } = config;
    if (!['frontend', 'backend'].includes(sendMode)) throw new TypeError(COPY.sendModeInvalid);
    const imageConnection = provider === 'openai' ? {
        ...validateOpenAiImageApi(config), responsesModel: typeof config.responsesModel === 'string' ? config.responsesModel.trim() : '',
    } : {};
    return { apiBaseUrl: url.href.replace(/\/+$/, ''), apiKey: config.apiKey.trim(), timeout: config.timeout, sendMode, ...imageConnection };
}
function validatePresetList(list, selected) {
    if (!Array.isArray(list) || !list.length || !list.some(item => item.id === selected)) throw new TypeError(COPY.missingPreset);
    const ids = new Set(), names = new Set();
    for (const item of list) {
        if (!item || typeof item.id !== 'string' || !item.id || ids.has(item.id)) throw new TypeError(COPY.invalidSettings);
        if (typeof item.name !== 'string' || !item.name.trim()) throw new TypeError(COPY.presetNameRequired);
        if (names.has(item.name.trim().toLowerCase())) throw new TypeError(COPY.duplicateName);
        ids.add(item.id); names.add(item.name.trim().toLowerCase());
    }
}
export function normalizeSettings(provider, saved) {
    if (saved === null || saved === undefined) return createDefaultSettings(provider);
    if (typeof saved !== 'object' || Array.isArray(saved)) throw new TypeError(COPY.invalidSettings);
    validatePresetList(saved.apiPresets, saved.activeApiPresetId);
    validatePresetList(saved.paramsPresets, saved.selectedParamsPresetId);
    validatePresetList(saved.promptPresets, saved.selectedPromptPresetId);
    if (!['manual', 'auto'].includes(saved.mode) || !isSupportedSize(provider, saved.overrideSize)) throw new TypeError(COPY.invalidSettings);
    for (const key of ['showFloatingButton', 'showFloorButton']) {
        if (typeof saved[key] !== 'boolean') throw new TypeError(COPY.invalidParameter(key));
    }
    if (saved.overrideMaxImages !== null && normalizeMaxImagesOverride(saved.overrideMaxImages) !== saved.overrideMaxImages) throw new TypeError(COPY.invalidParameter('overrideMaxImages'));
    const apiPresets = saved.apiPresets.map(item => ({ id: item.id, name: item.name.trim(), config: validateConnection(provider, item.config) }));
    return { ...apiPresets.find(item => item.id === saved.activeApiPresetId).config,
        apiPresets,
        activeApiPresetId: saved.activeApiPresetId,
        paramsPresets: saved.paramsPresets.map(item => {
            if (typeof item.positivePrefix !== 'string' || normalizeMaxImagesOverride(item.maxImages) !== item.maxImages || item.maxImages === null) throw new TypeError(COPY.invalidSettings);
            return { id: item.id, name: item.name.trim(), positivePrefix: item.positivePrefix, params: validateParams(provider, item.params), maxImages: item.maxImages };
        }), selectedParamsPresetId: saved.selectedParamsPresetId, mode: saved.mode,
        showFloatingButton: saved.showFloatingButton, showFloorButton: saved.showFloorButton,
        overrideSize: saved.overrideSize, overrideMaxImages: saved.overrideMaxImages,
        promptPresets: saved.promptPresets.map(item => {
            const prompt = { id: item.id, name: item.name.trim() };
            for (const field of Object.keys(NATURAL_PROMPT_DEFAULTS)) {
                if (typeof item[field] !== 'string') throw new TypeError(COPY.invalidParameter(field));
                prompt[field] = item[field];
            }
            if (item.layout !== undefined) prompt.layout = normalizeLayout(item.layout).layout;
            return prompt;
        }), selectedPromptPresetId: saved.selectedPromptPresetId,
    };
}
