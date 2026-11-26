import references from '../../shared/reference-image-contract.cjs';
import protocol from '../../shared/multimodal-image-protocol.cjs';
import { MediaApiError } from '../../../../shared/media-api.js';
import { getEffectiveParams, providerDefinition, validateParams, isSupportedSize, validateOpenAiImageApi } from './settings-model.js';
import { MULTIMODAL_COPY as COPY } from './copy.js';
import { formatOpenAiImageError } from './openai-image-errors.js';

export function openAiImageMetadata({ imageApi, responsesModel }, requestedOutputFormat) {
    return { imageApi, ...(imageApi === 'responses' ? { responsesModel } : {}),
        ...(requestedOutputFormat ? { requestedOutputFormat } : {}) };
}

export function validateMultimodalInput(provider, input) {
    providerDefinition(provider);
    for (const field of ['workflowPresetId', 'workflowMode', 'customWorkflow', 'seed']) {
        if (input[field] !== undefined) throw new MediaApiError('unsupported_field', { field });
    }
    for (const field of ['prompt', 'positivePrefix', 'negativePrompt']) {
        if (input[field] !== undefined && typeof input[field] !== 'string') throw new MediaApiError('invalid_request', { field });
    }
    if (typeof input.prompt !== 'string' || !input.prompt.trim()) throw new MediaApiError('invalid_request', { field: 'prompt', cause: new Error(COPY.missingPrompt) });
    if (input.overrideSize !== undefined && !isSupportedSize(provider, input.overrideSize)) throw new MediaApiError('invalid_request', { field: 'overrideSize' });
    if (input.characterPrompts !== undefined) {
        if (!Array.isArray(input.characterPrompts)) throw new MediaApiError('invalid_request', { field: 'characterPrompts' });
        for (const item of input.characterPrompts) {
            if (!item || typeof item !== 'object' || Array.isArray(item)) throw new MediaApiError('invalid_request', { field: 'characterPrompts' });
            for (const key of Object.keys(item)) {
                if (!['prompt', 'uc', 'name', 'center'].includes(key)) throw new MediaApiError('unsupported_field', { field: `characterPrompts.${key}` });
            }
            for (const key of ['prompt', 'uc', 'name']) {
                if (item[key] !== undefined && typeof item[key] !== 'string') throw new MediaApiError('invalid_request', { field: `characterPrompts.${key}` });
            }
        }
    }
    try { references.validateReferenceImages(input.referenceImages); }
    catch (cause) { throw new MediaApiError('invalid_request', { field: 'referenceImages', cause }); }
}

export function buildMultimodalRequest(provider, input) {
    validateMultimodalInput(provider, input);
    const params = validateParams(provider, input.params);
    const referenceImages = references.validateReferenceImages(input.referenceImages);
    if (input.positivePrefix || input.negativePrompt || input.characterPrompts?.length) {
        throw new TypeError(COPY.unadaptedInput);
    }
    const prompt = input.prompt.trim();
    if (provider === 'gemini') return { payload: {
        model: params.model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'], imageConfig: { aspectRatio: params.aspectRatio, imageSize: params.imageSize } },
    }, ...(referenceImages.length ? { referenceImages } : {}) };
    try { protocol.validateOpenAiImagePrompt(prompt); }
    catch (error) { throw formatOpenAiImageError(error); }
    return { payload: { model: params.model, prompt, size: params.size,
        quality: params.quality, background: params.background, output_format: params.outputFormat, n: 1 },
        ...(referenceImages.length ? { referenceImages } : {}),
    };
}

export function createGenerationRecipe(provider, settings, overrides = {}) {
    return {
        apiBaseUrl: settings.apiBaseUrl, apiKey: settings.apiKey, timeout: settings.timeout, delayMs: 1,
        ...(provider === 'openai' ? validateOpenAiImageApi(settings) : {}),
        params: getEffectiveParams(provider, settings, overrides.params || overrides.paramsOverride || {}),
        referenceImages: references.validateReferenceImages(overrides.referenceImages),
    };
}

export function compileMultimodalBatch(provider, scenePlan, recipe) {
    const tasks = Array.isArray(scenePlan) ? scenePlan : scenePlan?.tasks;
    if (!Array.isArray(tasks) || !tasks.length) throw new TypeError(COPY.invalidParameter('scenePlan'));
    if (!Number.isFinite(recipe.timeout) || recipe.timeout <= 0) throw new TypeError(COPY.invalidParameter('timeout'));
    const params = validateParams(provider, recipe.params);
    const context = { url: recipe.apiBaseUrl, key: recipe.apiKey, ...(provider === 'openai' ? validateOpenAiImageApi(recipe) : {}) };
    const artifacts = tasks.map(task => {
        if (task.chars?.length || task.characterPrompts?.length) throw new TypeError(COPY.unadaptedInput);
        const input = { prompt: task.scene, params, referenceImages: task.referenceImages ?? recipe.referenceImages };
        return { task, tags: input.prompt, promptData: { positive: input.prompt, negative: '', characterPrompts: [] },
            ...(provider === 'openai' ? { providerMetadata: openAiImageMetadata(context, params.outputFormat) } : {}),
            request: buildMultimodalRequest(provider, input) };
    });
    const delay = Math.max(1, recipe.delayMs || 0);
    return { provider, context, delay: { min: delay, max: delay },
        items: artifacts.map(artifact => ({ request: artifact.request, timeout: recipe.timeout })), artifacts };
}
export const compileGemini = (scenePlan, recipe) => compileMultimodalBatch('gemini', scenePlan, recipe);
export const compileOpenAi = (scenePlan, recipe) => compileMultimodalBatch('openai', scenePlan, recipe);
