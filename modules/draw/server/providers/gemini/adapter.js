'use strict';

const { protocols: { gemini } } = require('../../../shared/multimodal-image-protocol.cjs');
const {
    isObject, normalizeImageApi, postImageApi, imageResultError, decodeImageResult,
} = require('../image-api.js');

const MODEL_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function normalizePayload(payload) {
    const model = typeof payload.model === 'string' && payload.model.trim();
    if (!model || !MODEL_ID.test(model)) throw new Error('payload.model must be a Gemini model ID');
    if (!Array.isArray(payload.contents) || payload.contents.length !== 1) throw new Error('payload.contents must contain one user turn');
    const [content] = payload.contents;
    if (!isObject(content) || (content.role !== undefined && content.role !== 'user') || !Array.isArray(content.parts)) {
        throw new Error('payload.contents must contain a user turn with parts');
    }
    if (!content.parts.length) throw new Error('payload.contents must contain a non-empty text prompt');
    const parts = Array.from(content.parts, (part) => {
        if (!isObject(part) || Object.keys(part).length !== 1 || typeof part.text !== 'string' || !part.text.trim()) {
            throw new Error('payload.contents parts must contain only non-empty text; submit referenceImages separately');
        }
        return { text: part.text };
    });
    const generationConfig = payload.generationConfig;
    if (!isObject(generationConfig) || !Array.isArray(generationConfig.responseModalities)
        || !generationConfig.responseModalities.includes('IMAGE')
        || generationConfig.responseModalities.some(value => value !== 'TEXT' && value !== 'IMAGE')) {
        throw new Error('payload.generationConfig.responseModalities must request IMAGE with optional TEXT');
    }
    const { aspectRatio, imageSize } = generationConfig.imageConfig ?? {};
    if (typeof aspectRatio !== 'string' || !/^\d+:\d+$/.test(aspectRatio) || typeof imageSize !== 'string' || !imageSize.trim()) {
        throw new Error('payload.generationConfig.imageConfig must specify aspectRatio and imageSize');
    }
    return { model, contents: [{ role: 'user', parts }], generationConfig: {
        responseModalities: [...generationConfig.responseModalities], imageConfig: { aspectRatio, imageSize },
    } };
}

function normalize(context, items, helpers) {
    return normalizeImageApi(context, items, helpers, normalizePayload);
}

async function execute({ context, item, signal }) {
    const { url, ...request } = gemini.request(context, item.request);
    const data = await postImageApi(url, { ...request, signal, providerName: 'Gemini', errorReason: gemini.errorReason });
    const { values, incomplete, reason, code } = gemini.result(data);
    return decodeImageResult(values, {
        providerName: 'Gemini', resultMode: item.request.resultMode, signal, incomplete,
        missingError: reason ? imageResultError(`Gemini did not return an image (${reason})`, code) : undefined,
    });
}

module.exports = { execute, normalize };
