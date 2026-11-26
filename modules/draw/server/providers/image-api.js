'use strict';

const {
    createUpstreamError, detectImageMime, readErrorText, readJsonResponse,
} = require('./upstream.js');
const { base64Size, validateReferenceImages } = require('../../shared/reference-image-contract.cjs');
const { upstreamReason } = require('../../shared/multimodal-image-protocol.cjs');

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeImageApiContext(context, { urlField = 'context.url', keyField = 'context.key' } = {}) {
    const rawUrl = typeof context?.url === 'string' ? context.url.trim() : '';
    let url;
    try { url = new URL(rawUrl); }
    catch (error) { if (error.code !== 'ERR_INVALID_URL') throw error; }
    if (!url || !['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
        throw new Error(`${urlField} must be a complete HTTP(S) base URL without credentials, query parameters, or a fragment`);
    }
    const key = typeof context?.key === 'string' ? context.key.trim() : '';
    if (!/^[!-~]+$/.test(key)) throw new Error(`${keyField} is required and must not contain whitespace`);
    return { url: url.href, key };
}

function normalizeImageApi(context, items, { parseTimeout }, normalizePayload, normalizeContext = normalizeImageApiContext) {
    const normalizedContext = normalizeContext(context);
    const normalized = [];
    for (let index = 0; index < items.length; index++) {
        const source = items[index];
        const path = `items[${index}]`;
        const timeout = parseTimeout(source?.timeout);
        if (timeout === null) return { error: `${path}.timeout must be a positive number` };
        const request = source?.request;
        if (!isObject(request) || !isObject(request.payload)) return { error: `${path}.request.payload is required` };
        if (request.resultMode !== undefined && request.resultMode !== 'all') return { error: `${path}.request.resultMode is invalid` };
        try {
            const referenceImages = validateReferenceImages(request.referenceImages);
            normalized.push({ kind: 'image', request: {
                payload: normalizePayload(request.payload, normalizedContext),
                ...(referenceImages.length ? { referenceImages } : {}),
                ...(request.resultMode === 'all' ? { resultMode: 'all' } : {}),
            }, timeout });
        } catch (error) {
            return { error: `${path}.request.${error.message}` };
        }
    }
    return { context: normalizedContext, items: normalized };
}

async function postImageApi(url, { headers, body, signal, providerName, errorReason, readResult, httpError, onConnectionLost }) {
    // Redirects could forward an API key header or a private reference image to another origin.
    signal.throwIfAborted();
    let response;
    try { response = await fetch(url, { method: 'POST', headers, body, signal, redirect: 'manual' }); }
    catch (error) {
        if (!signal.aborted && onConnectionLost) throw onConnectionLost();
        throw error;
    }
    if (!response.ok) {
        if (httpError) throw await httpError(response, async value => JSON.parse(await readErrorText(value)));
        const errorText = await readErrorText(response);
        let reason = '';
        // Never reflect raw upstream error messages: proxies can echo keys, URLs, or prompts.
        try { reason = upstreamReason(errorReason(JSON.parse(errorText)?.error)); }
        catch (error) { if (!(error instanceof SyntaxError)) throw error; }
        throw createUpstreamError(response, `${providerName} returned HTTP ${response.status}${reason ? ` (${reason})` : ''}`);
    }
    if (readResult) return readResult(response, readJsonResponse);
    try {
        return await readJsonResponse(response);
    } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        throw imageResultError(`${providerName} returned an invalid JSON response`);
    }
}

function imageResultError(message, code = 'invalid_result') {
    return Object.assign(new Error(message), { code });
}

async function decodeImageResult(values, { providerName, resultMode, incomplete = false, missingError, signal }) {
    if (!values.length) throw missingError || imageResultError(`${providerName} did not return an image`, 'no_image');
    if (resultMode !== 'all') signal.throwIfAborted();
    const { isDecodableImage } = await import('./image-decoder.mjs');
    const images = [];
    for (const { data, mimeType } of values) {
        const buffer = base64Size(data) > 0 ? Buffer.from(data, 'base64') : null;
        const mime = buffer && detectImageMime(buffer);
        if (!mime || (mimeType !== undefined && mimeType !== mime) || !await isDecodableImage(buffer, mime)) {
            incomplete = true;
            continue;
        }
        if (resultMode !== 'all') return { buffer, mime };
        images.push(buffer);
    }
    if (!images.length) {
        const { MULTIMODAL_COPY } = await import('../../providers/multimodal/copy.js');
        throw imageResultError(MULTIMODAL_COPY.invalidImageResult);
    }
    // The upstream body is already downloaded. Preserve completed images even if cancelled during packing.
    const { packImageCollection, IMAGE_COLLECTION_MIME } = await import('../../shared/image-collection.js');
    return { buffer: Buffer.from(packImageCollection(images, incomplete)), mime: IMAGE_COLLECTION_MIME };
}

module.exports = { isObject, normalizeImageApiContext, normalizeImageApi, postImageApi, imageResultError, decodeImageResult };
