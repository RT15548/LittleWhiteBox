'use strict';

const MAX_RESPONSE_BYTES = 128 * 1024 * 1024;
const MAX_ERROR_BYTES = 1024 * 1024;
const MAX_TIMEOUT_MS = 0x7FFFFFFF;

function createUpstreamError(response, message) {
    const error = new Error(message || `Upstream returned HTTP ${response.status}`);
    error.code = 'upstream_error';
    error.status = response.status;
    return error;
}

function basicAuthHeader(auth) {
    return `Basic ${Buffer.from(String(auth || '')).toString('base64')}`;
}

function parseTimeout(value) {
    const timeout = Number(value);
    if (!Number.isFinite(timeout) || timeout <= 0) return null;
    return Math.min(Math.max(1, Math.round(timeout)), MAX_TIMEOUT_MS);
}

function detectImageMime(buffer) {
    if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return 'image/png';
    if (buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'image/jpeg';
    if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
    if (buffer.length >= 6 && (buffer.toString('ascii', 0, 6) === 'GIF87a' || buffer.toString('ascii', 0, 6) === 'GIF89a')) return 'image/gif';
    return null;
}

async function readResponseBuffer(response, maxBytes = MAX_RESPONSE_BYTES) {
    const declared = Number(response.headers.get('content-length'));
    if (Number.isSafeInteger(declared) && declared > maxBytes) {
        throw new Error(`Upstream response exceeds the ${maxBytes} byte limit`);
    }
    if (!response.body?.getReader) {
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length > maxBytes) throw new Error(`Upstream response exceeds the ${maxBytes} byte limit`);
        return buffer;
    }
    const reader = response.body.getReader();
    const chunks = [];
    let total = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.byteLength;
            if (total > maxBytes) {
                await reader.cancel().catch(() => {});
                throw new Error(`Upstream response exceeds the ${maxBytes} byte limit`);
            }
            chunks.push(Buffer.from(value.buffer, value.byteOffset, value.byteLength));
        }
    } finally {
        reader.releaseLock();
    }
    return Buffer.concat(chunks, total);
}

async function readErrorText(response) {
    let buffer = null;
    try {
        buffer = await readResponseBuffer(response, MAX_ERROR_BYTES);
    } catch (error) {
        if (error?.name === 'AbortError') throw error;
    }
    return buffer?.toString('utf8').trim() || `HTTP ${response.status}`;
}

async function readJsonResponse(response) {
    return JSON.parse((await readResponseBuffer(response)).toString('utf8'));
}

function endpoint(base, pathname, { appendPath = false } = {}) {
    const url = new URL(String(base || '').trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Only HTTP and HTTPS endpoints are supported');
    if (appendPath) {
        const basePath = url.pathname.replace(/\/+$/, '');
        const childPath = String(pathname || '').replace(/^\/+/, '');
        url.pathname = `${basePath}/${childPath}`;
    } else {
        url.pathname = pathname;
    }
    return url;
}

module.exports = {
    MAX_TIMEOUT_MS,
    basicAuthHeader,
    createUpstreamError,
    detectImageMime,
    endpoint,
    parseTimeout,
    readErrorText,
    readJsonResponse,
    readResponseBuffer,
};
