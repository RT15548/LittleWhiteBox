'use strict';

const {
    generateImageBuffer,
    generateV5ImageBuffer,
} = require('./client.js');

function createUpstreamError(result) {
    const error = new Error(result.error || `NovelAI upstream returned HTTP ${result.status || 502}`);
    error.code = 'upstream_error';
    error.status = result.status;
    return error;
}

async function execute({ context, item, signal }) {
    const { key, insecure } = context;
    const { transport, url, payload } = item.request;
    const result = transport === 'msgpack-stream'
        ? await generateV5ImageBuffer({ url, key, payload, insecure, signal })
        : await generateImageBuffer({ url, key, payload, insecure, signal });
    if (!result.ok) throw createUpstreamError(result);
    return {
        buffer: result.buffer,
        mime: result.mime,
    };
}

function normalize(context, items, { parseTimeout, parseUrl }) {
    const key = String(context?.key || '').trim();
    if (!key) return { error: 'NovelAI API key is required' };
    const normalized = [];
    for (let index = 0; index < items.length; index++) {
        const source = items[index];
        const request = source?.request;
        if (!source || typeof source !== 'object' || !request || typeof request !== 'object' || Array.isArray(request)) {
            return { error: `items[${index}].request is required` };
        }
        if (request.transport !== 'legacy-image' && request.transport !== 'msgpack-stream') return { error: `items[${index}].request.transport is invalid` };
        const url = parseUrl(request.url);
        if (!url) return { error: `items[${index}].request.url must be a complete HTTP(S) URL` };
        if (!request.payload || typeof request.payload !== 'object' || Array.isArray(request.payload)) return { error: `items[${index}].request.payload is required` };
        const timeout = parseTimeout(source.timeout);
        if (timeout === null) return { error: `items[${index}].timeout must be a positive number` };
        normalized.push({ kind: request.transport, request: { transport: request.transport, url, payload: request.payload }, timeout });
    }
    return { context: { key, insecure: context?.insecure === true }, items: normalized };
}

module.exports = {
    execute,
    normalize,
};
