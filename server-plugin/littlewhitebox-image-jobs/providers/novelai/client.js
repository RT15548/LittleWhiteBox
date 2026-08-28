'use strict';

const http = require('node:http');
const https = require('node:https');
const zlib = require('node:zlib');
const { randomBytes } = require('node:crypto');
const { readNovelV5FinalImage } = require('./v5-stream.js');

const NOVELAI_DEFAULT_BASE_URL = 'https://image.novelai.net';
const MAX_RESPONSE_BYTES = 128 * 1024 * 1024;
const MAX_DECOMPRESSED_BYTES = 128 * 1024 * 1024;
const MAX_ERROR_BYTES = 1024 * 1024;
const MAX_REDIRECTS = 5;
const ZIP_LOCAL_FILE_HEADER = 0x04034b50;
const ZIP_CENTRAL_DIRECTORY_HEADER = 0x02014b50;
const ZIP_END_OF_CENTRAL_DIRECTORY = 0x06054b50;

// Compatibility boundary for the upstream-released v1.0.1 server API.
// Remove together with the /v1 generate/test routes once that public API is retired.
function resolveLegacyImageApi(baseUrl) {
    const raw = String(baseUrl || '').trim();
    if (!raw) return `${NOVELAI_DEFAULT_BASE_URL}/ai/generate-image`;
    const trimmed = raw.replace(/\/+$/, '');
    if (/\/ai\/generate-image$/i.test(trimmed)) return trimmed;
    return `${trimmed}/ai/generate-image`;
}

function createAbortError() {
    const error = new Error('Request aborted');
    error.name = 'AbortError';
    return error;
}

function requestUpstream({ url, key, body, method, insecure, signal, accept, sendAuthorization, contentType }) {
    return new Promise((resolve, reject) => {
        const target = new URL(url);
        if (target.protocol !== 'http:' && target.protocol !== 'https:') {
            reject(new Error('Only HTTP and HTTPS endpoints are supported'));
            return;
        }

        const transport = target.protocol === 'https:' ? https : http;
        const headers = {
            'Accept-Encoding': 'identity',
            ...(accept ? { 'Accept': accept } : {}),
            ...(sendAuthorization ? { 'Authorization': `Bearer ${key}` } : {}),
        };
        if (body !== null) {
            headers['Content-Type'] = contentType || 'application/json';
            headers['Content-Length'] = Buffer.isBuffer(body) ? body.length : Buffer.byteLength(body);
        }
        const requestOptions = {
            method,
            headers: {
                ...headers,
            },
            signal,
        };
        if (target.protocol === 'https:' && insecure) {
            requestOptions.rejectUnauthorized = false;
        }

        const request = transport.request(target, requestOptions, resolve);
        request.once('error', reject);
        request.end(body ?? undefined);
    });
}

function isRedirect(response) {
    return [301, 302, 303, 307, 308].includes(responseStatus(response));
}

async function openUpstreamResponse({ url, key, payload, rawBody, contentType, insecure, signal, accept }) {
    let target = new URL(url);
    let method = 'POST';
    let body = rawBody ?? JSON.stringify(payload);
    let sendAuthorization = true;

    for (let redirectCount = 0; ; redirectCount++) {
        const response = await requestUpstream({
            url: target,
            key,
            body,
            method,
            insecure,
            signal,
            accept,
            sendAuthorization,
            contentType,
        });
        const location = response.headers.location;
        if (!isRedirect(response) || !location) return response;
        if (redirectCount >= MAX_REDIRECTS) {
            response.destroy();
            throw new Error(`NovelAI request exceeded ${MAX_REDIRECTS} redirects`);
        }

        const nextTarget = new URL(location, target);
        sendAuthorization = sendAuthorization && nextTarget.origin === target.origin;
        const status = responseStatus(response);
        if (status === 303 || ((status === 301 || status === 302) && method === 'POST')) {
            method = 'GET';
            body = null;
        }
        response.destroy();
        target = nextTarget;
    }
}

function createMultipartRequest(payload) {
    const boundary = `----LittleWhiteBox${randomBytes(12).toString('hex')}`;
    const json = JSON.stringify(payload);
    const head = Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="request"; filename="blob"\r\n`
        + 'Content-Type: application/json\r\n\r\n',
        'utf8',
    );
    const tail = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
    return {
        body: Buffer.concat([head, Buffer.from(json, 'utf8'), tail]),
        contentType: `multipart/form-data; boundary=${boundary}`,
    };
}

function readContentLength(response) {
    const value = Array.isArray(response.headers['content-length'])
        ? response.headers['content-length'][0]
        : response.headers['content-length'];
    if (value === undefined) return null;
    const length = Number(value);
    return Number.isSafeInteger(length) && length >= 0 ? length : null;
}

function decodeContentEncoding(response, buffer, maxOutputBytes = MAX_RESPONSE_BYTES) {
    const encoding = String(response.headers['content-encoding'] || '').trim().toLowerCase();
    if (!encoding || encoding === 'identity') return Promise.resolve(buffer);

    const operation = encoding === 'gzip' || encoding === 'x-gzip'
        ? zlib.gunzip
        : encoding === 'deflate'
            ? zlib.inflate
            : encoding === 'br'
                ? zlib.brotliDecompress
                : null;
    if (!operation) return Promise.reject(new Error(`Unsupported upstream content encoding: ${encoding}`));

    return new Promise((resolve, reject) => {
        operation(buffer, { maxOutputLength: maxOutputBytes }, (error, decoded) => {
            if (error) {
                reject(new Error(`Invalid ${encoding} NovelAI response: ${error.message}`));
                return;
            }
            resolve(decoded);
        });
    });
}

async function readResponseBuffer(response, signal, maxBytes = MAX_RESPONSE_BYTES) {
    const declaredLength = readContentLength(response);
    if (declaredLength !== null && declaredLength > maxBytes) {
        response.destroy();
        throw new Error(`NovelAI response exceeds the ${maxBytes} byte limit`);
    }

    const abort = () => response.destroy(createAbortError());
    if (signal?.aborted) {
        abort();
        throw createAbortError();
    }
    signal?.addEventListener('abort', abort, { once: true });

    const chunks = [];
    let total = 0;
    try {
        for await (const chunk of response) {
            const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            total += buffer.length;
            if (total > maxBytes) {
                response.destroy();
                throw new Error(`NovelAI response exceeds the ${maxBytes} byte limit`);
            }
            chunks.push(buffer);
        }
        const buffer = Buffer.concat(chunks, total);
        const decoded = await decodeContentEncoding(response, buffer, maxBytes);
        if (signal?.aborted) throw createAbortError();
        return decoded;
    } finally {
        signal?.removeEventListener('abort', abort);
    }
}

function responseStatus(response) {
    return Number(response.statusCode || 0);
}

function responseIsSuccessful(response) {
    const status = responseStatus(response);
    return status >= 200 && status < 300;
}

async function readError(response, signal) {
    const status = responseStatus(response);
    try {
        const body = await readResponseBuffer(response, signal, MAX_ERROR_BYTES);
        return body.toString('utf8') || `HTTP ${status}`;
    } catch (error) {
        if (signal?.aborted) throw error;
        return `HTTP ${status}（错误响应读取失败：${String(error?.message || error).slice(0, 200)}）`;
    }
}

function findEndOfCentralDirectory(buffer) {
    const firstPossibleOffset = Math.max(0, buffer.length - 22 - 0xFFFF);
    for (let offset = buffer.length - 22; offset >= firstPossibleOffset; offset--) {
        if (buffer.readUInt32LE(offset) !== ZIP_END_OF_CENTRAL_DIRECTORY) continue;
        const commentLength = buffer.readUInt16LE(offset + 20);
        if (offset + 22 + commentLength === buffer.length) return offset;
    }
    return -1;
}

function detectImageMime(buffer) {
    const isPng = buffer.length >= 8
        && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
    const isJpeg = buffer.length >= 3
        && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    const isWebp = buffer.length >= 12
        && buffer.toString('ascii', 0, 4) === 'RIFF'
        && buffer.toString('ascii', 8, 12) === 'WEBP';
    if (isPng) return 'image/png';
    if (isJpeg) return 'image/jpeg';
    if (isWebp) return 'image/webp';
    return null;
}

function extractImageFromZip(buffer) {
    const directoryEnd = findEndOfCentralDirectory(buffer);
    if (directoryEnd < 0) throw new Error('Invalid NovelAI ZIP response');

    const diskNumber = buffer.readUInt16LE(directoryEnd + 4);
    const directoryDisk = buffer.readUInt16LE(directoryEnd + 6);
    const diskEntries = buffer.readUInt16LE(directoryEnd + 8);
    const totalEntries = buffer.readUInt16LE(directoryEnd + 10);
    const directorySize = buffer.readUInt32LE(directoryEnd + 12);
    const directoryOffset = buffer.readUInt32LE(directoryEnd + 16);
    if (diskNumber !== 0 || directoryDisk !== 0 || diskEntries !== totalEntries) {
        throw new Error('Multi-volume NovelAI ZIP responses are not supported');
    }
    if (totalEntries === 0xFFFF || directorySize === 0xFFFFFFFF || directoryOffset === 0xFFFFFFFF) {
        throw new Error('ZIP64 NovelAI responses are not supported');
    }
    if (directoryOffset + directorySize > directoryEnd) {
        throw new Error('Invalid NovelAI ZIP central directory');
    }

    let offset = directoryOffset;
    for (let index = 0; index < totalEntries; index++) {
        if (offset + 46 > directoryEnd || buffer.readUInt32LE(offset) !== ZIP_CENTRAL_DIRECTORY_HEADER) {
            throw new Error('Invalid NovelAI ZIP entry');
        }

        const flags = buffer.readUInt16LE(offset + 8);
        const method = buffer.readUInt16LE(offset + 10);
        const compressedSize = buffer.readUInt32LE(offset + 20);
        const decompressedSize = buffer.readUInt32LE(offset + 24);
        const nameLength = buffer.readUInt16LE(offset + 28);
        const extraLength = buffer.readUInt16LE(offset + 30);
        const commentLength = buffer.readUInt16LE(offset + 32);
        const localHeaderOffset = buffer.readUInt32LE(offset + 42);
        const entryEnd = offset + 46 + nameLength + extraLength + commentLength;
        if (entryEnd > directoryEnd) throw new Error('Invalid NovelAI ZIP entry length');

        const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength).toLowerCase();
        if (/\.(png|jpe?g|webp)$/.test(name)) {
            if ((flags & 0x1) !== 0) throw new Error('Encrypted NovelAI ZIP entries are not supported');
            if (decompressedSize > MAX_DECOMPRESSED_BYTES) {
                throw new Error('NovelAI image exceeds the 128 MiB decompression limit');
            }
            if (localHeaderOffset + 30 > buffer.length
                || buffer.readUInt32LE(localHeaderOffset) !== ZIP_LOCAL_FILE_HEADER) {
                throw new Error('Invalid NovelAI ZIP local header');
            }

            const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
            const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
            const dataOffset = localHeaderOffset + 30 + localNameLength + localExtraLength;
            if (dataOffset + compressedSize > buffer.length) {
                throw new Error('Truncated NovelAI ZIP image');
            }

            const compressed = buffer.subarray(dataOffset, dataOffset + compressedSize);
            let image;
            if (method === 0) {
                image = compressed;
            } else if (method === 8) {
                image = zlib.inflateRawSync(compressed, { maxOutputLength: MAX_DECOMPRESSED_BYTES });
            } else {
                throw new Error(`Unsupported NovelAI ZIP compression method ${method}`);
            }
            const mime = detectImageMime(image);
            if (image.length !== decompressedSize || !mime) {
                throw new Error('Invalid image data in NovelAI ZIP response');
            }
            return { image, mime };
        }

        offset = entryEnd;
    }

    throw new Error('No supported image found in NovelAI ZIP response');
}

function extractImageBase64(buffer) {
    if (buffer.length === 0) throw new Error('NovelAI returned an empty response');
    const extracted = buffer.length >= 4 && buffer.readUInt32LE(0) === ZIP_LOCAL_FILE_HEADER
        ? extractImageFromZip(buffer)
        : { image: buffer, mime: detectImageMime(buffer) };
    const { image, mime } = extracted;
    if (image.length > MAX_DECOMPRESSED_BYTES) {
        throw new Error('NovelAI image exceeds the 128 MiB limit');
    }
    if (!mime) {
        throw new Error('NovelAI returned an unsupported response format');
    }
    return { base64: image.toString('base64'), mime };
}

async function generateImage({ url, baseUrl, key, payload, insecure, signal }) {
    const response = await openUpstreamResponse({
        url: url ?? resolveLegacyImageApi(baseUrl),
        key,
        payload,
        insecure,
        signal,
        accept: 'application/zip, application/octet-stream, image/*, */*',
    });
    if (!responseIsSuccessful(response)) {
        return {
            ok: false,
            status: responseStatus(response),
            error: await readError(response, signal),
        };
    }

    const body = await readResponseBuffer(response, signal);
    return { ok: true, ...extractImageBase64(body) };
}

async function openImageStream({ url, key, payload, insecure, signal }) {
    const multipart = createMultipartRequest(payload);
    const response = await openUpstreamResponse({
        url,
        key,
        rawBody: multipart.body,
        contentType: multipart.contentType,
        insecure,
        signal,
        accept: 'application/octet-stream, */*',
    });
    if (!responseIsSuccessful(response)) {
        return {
            ok: false,
            status: responseStatus(response),
            error: await readError(response, signal),
        };
    }
    return { ok: true, response };
}

async function generateImageBuffer(options) {
    const result = await generateImage(options);
    if (!result.ok) return result;
    return {
        ok: true,
        buffer: Buffer.from(result.base64, 'base64'),
        mime: result.mime,
    };
}

async function generateV5ImageBuffer(options) {
    const result = await openImageStream(options);
    if (!result.ok) return result;
    const startedAt = Date.now();
    const image = await readNovelV5FinalImage(result.response, { signal: options.signal });
    const elapsedMs = Date.now() - startedAt;
    console.info(
        `[LittleWhiteBox Image Jobs] NovelAI V5 final arrived ${elapsedMs}ms after response opened; `
        + `received ${image.streamBytes} stream bytes and retained ${image.buffer.length} PNG bytes`,
    );
    return {
        ok: true,
        buffer: image.buffer,
        mime: 'image/png',
    };
}

async function testConnection({ url, baseUrl, key, payload, multipart, insecure, signal }) {
    const legacy = url === undefined;
    const requestPayload = legacy
        ? {
            input: 'test',
            model: 'nai-diffusion-3',
            action: 'generate',
            parameters: { width: 64, height: 64, steps: 1, n_samples: 1 },
        }
        : payload;
    const multipartRequest = !legacy && multipart ? createMultipartRequest(requestPayload) : null;
    const response = await openUpstreamResponse({
        url: legacy ? resolveLegacyImageApi(baseUrl) : url,
        key,
        insecure,
        signal,
        payload: requestPayload,
        ...(multipartRequest ? {
            rawBody: multipartRequest.body,
            contentType: multipartRequest.contentType,
        } : {}),
    });
    const status = responseStatus(response);

    // 400/402 视为“连通”（鉴权通过但参数/额度问题），401 视为 key 无效。
    if (status === 401) {
        response.destroy();
        return { ok: false, status, error: 'API Key 无效' };
    }
    if (responseIsSuccessful(response) || status === 400 || status === 402) {
        response.destroy();
        return { ok: true };
    }
    return { ok: false, status, error: await readError(response, signal) };
}

module.exports = {
    generateImage,
    generateImageBuffer,
    generateV5ImageBuffer,
    openImageStream,
    resolveLegacyImageApi,
    testConnection,
};
