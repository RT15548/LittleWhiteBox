'use strict';

const { normalizeImageApi, normalizeImageApiContext, postImageApi, decodeImageResult } = require('../image-api.js');
const { protocols: { openai }, readOpenAiImageApi, readOpenAiImageOutputFormat, validateOpenAiImagePrompt, OPENAI_IMAGE_CODES } = require('../../../shared/multimodal-image-protocol.cjs');

const SETTINGS = Object.freeze({
    size: value => typeof value === 'string' && /^(?:auto|[1-9]\d*x[1-9]\d*)$/.test(value),
    quality: value => ['auto', 'low', 'medium', 'high', 'xhigh', 'max'].includes(value),
    background: value => ['auto', 'opaque', 'transparent'].includes(value),
    n: value => Number.isInteger(value) && value >= 1 && value <= 10,
});

function normalizePayload(payload, context) {
    const model = typeof payload.model === 'string' && payload.model.trim();
    if (!model) throw new Error('payload.model is required');
    validateOpenAiImagePrompt(payload.prompt);
    const normalized = { model, prompt: payload.prompt };
    for (const [key, value] of Object.entries(payload)) {
        if (key === 'model' || key === 'prompt' || key === 'output_format') continue;
        if (!Object.hasOwn(SETTINGS, key) || !SETTINGS[key](value)) throw new Error(`payload.${key} is not supported or is invalid`);
        normalized[key] = value;
    }
    normalized.output_format = readOpenAiImageOutputFormat(payload.output_format, normalized.background);
    if (context.imageApi === 'responses' && normalized.n !== undefined && normalized.n !== 1) {
        throw new Error('payload.n must be 1 with Responses');
    }
    return normalized;
}

function normalize(context, items, helpers) {
    return normalizeImageApi(context, items, helpers, normalizePayload, config => ({
        ...normalizeImageApiContext(config), ...readOpenAiImageApi(config),
    }));
}

async function execute({ context, item, signal }) {
    try {
        const { url, ...request } = openai.request(context, item.request);
        const { values, incomplete } = await postImageApi(url, { ...request, signal,
            onConnectionLost: () => Object.assign(new Error(), { code: OPENAI_IMAGE_CODES.connectionLost }),
            readResult: (response, readJson) => openai.readResult(response, context, item.request.payload, readJson),
            httpError: (response, readJson) => openai.httpError(response, context, readJson),
        });
        return await decodeImageResult(values, { providerName: 'OpenAI GPT Image', resultMode: item.request.resultMode, incomplete, signal });
    } catch (error) {
        const { formatOpenAiImageError } = await import('../../../providers/multimodal/openai-image-errors.js');
        throw formatOpenAiImageError(error, item.request.referenceImages?.length);
    }
}

module.exports = { execute, normalize };
