'use strict';

const {
    basicAuthHeader,
    createUpstreamError,
    detectImageMime,
    endpoint,
    readErrorText,
    readJsonResponse,
} = require('../upstream.js');

async function execute({ context, item, signal }) {
    const url = endpoint(context.url, '/sdapi/v1/txt2img');
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(context.auth ? { Authorization: basicAuthHeader(context.auth) } : {}),
        },
        body: JSON.stringify(item.request.payload),
        signal,
    });
    if (!response.ok) throw createUpstreamError(response, await readErrorText(response));
    const data = await readJsonResponse(response);
    if (item.request.resultMode === 'all') {
        const { packImageCollection, imageMime, IMAGE_COLLECTION_MIME } = await import('../../../shared/image-collection.js');
        const images = [];
        let incomplete = false;
        if (!Array.isArray(data?.images) || !data.images.length) throw new Error('SD WebUI did not return an image');
        for (const encodedImage of data.images) {
            try {
                const bytes = Buffer.from(String(encodedImage).replace(/^data:[^,]*,/, ''), 'base64');
                imageMime(bytes);
                images.push(bytes);
            } catch (error) {
                incomplete = true;
            }
        }
        if (!images.length) throw new Error('SD WebUI did not return a valid image');
        return { buffer: Buffer.from(packImageCollection(images, incomplete)), mime: IMAGE_COLLECTION_MIME };
    }
    const encoded = Array.isArray(data?.images) ? data.images[0] : null;
    if (!encoded) throw new Error('SD WebUI did not return an image');
    const buffer = Buffer.from(String(encoded).replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const mime = detectImageMime(buffer);
    if (!mime) throw new Error('SD WebUI returned an unsupported image format');
    return { buffer, mime };
}

function normalize(context, items, { parseTimeout, parseUrl }) {
    const url = parseUrl(context?.url);
    if (!url) return { error: 'SD WebUI URL must be a complete HTTP(S) URL' };
    const normalized = [];
    for (let index = 0; index < items.length; index++) {
        const source = items[index];
        if (!source || typeof source !== 'object' || !source.request?.payload || typeof source.request.payload !== 'object' || Array.isArray(source.request.payload)) {
            return { error: `items[${index}].request.payload is required` };
        }
        const timeout = parseTimeout(source.timeout);
        if (timeout === null) return { error: `items[${index}].timeout must be a positive number` };
        normalized.push({ kind: 'image', request: { payload: source.request.payload,
            ...(source.request.resultMode === 'all' ? { resultMode: 'all' } : {}),
        }, timeout });
    }
    return { context: { url, auth: String(context?.auth || '') }, items: normalized };
}

module.exports = { execute, normalize };
