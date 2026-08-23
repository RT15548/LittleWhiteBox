'use strict';

const http = require('node:http');
const https = require('node:https');
const { Readable } = require('node:stream');
const { resolveLoopbackTarget } = require('./loopback-probe.js');

const ALLOWED_HOST_PATHS = new Set([
    '/api/backends/chat-completions/generate',
    '/api/backends/chat-completions/status',
]);

function readHeader(req, name) {
    const value = req.headers?.[String(name).toLowerCase()];
    if (Array.isArray(value)) return value.join(', ');
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function readBasicAuthorization(req) {
    const value = readHeader(req, 'authorization');
    return /^Basic\s+\S+$/i.test(String(value || '')) ? value : null;
}

function createAbortError() {
    const error = new Error('The operation was aborted');
    error.name = 'AbortError';
    error.code = 'ABORT_ERR';
    return error;
}

function toHeaderObject(source) {
    const output = Object.create(null);
    if (!source) return output;
    if (typeof source.forEach === 'function') {
        source.forEach((value, key) => { output[String(key)] = String(value); });
        return output;
    }
    if (Array.isArray(source)) {
        source.forEach(([key, value]) => { output[String(key)] = String(value); });
        return output;
    }
    Object.entries(source).forEach(([key, value]) => {
        if (value !== undefined && value !== null) output[key] = String(value);
    });
    return output;
}

function responseHeaders(source = {}) {
    const headers = new Headers();
    Object.entries(source).forEach(([key, value]) => {
        if (Array.isArray(value)) value.forEach(item => headers.append(key, String(item)));
        else if (value !== undefined) headers.set(key, String(value));
    });
    return headers;
}

function captureLoopbackRequestContext(req) {
    const target = resolveLoopbackTarget(req);
    const credentials = {
        host: readHeader(req, 'host'),
        cookie: readHeader(req, 'cookie'),
        csrfToken: readHeader(req, 'x-csrf-token'),
        basicAuthorization: readBasicAuthorization(req),
    };
    return { target, credentials };
}

function createLoopbackFetch(context) {
    const target = context.target;
    const credentials = context.credentials;
    let disposed = false;

    const fetchImpl = (input, options = {}) => {
        if (disposed) return Promise.reject(new Error('Draw Run Host Client 已释放'));
        const path = typeof input === 'string' ? input : String(input?.url || '');
        if (!ALLOWED_HOST_PATHS.has(path)) {
            return Promise.reject(new Error('Draw Run Host Client 拒绝访问非酒馆 Chat Completion 端点'));
        }
        const body = options.body === undefined || options.body === null
            ? null
            : Buffer.from(String(options.body));
        const headers = toHeaderObject(options.headers);
        if (credentials.host) headers.Host = credentials.host;
        if (credentials.cookie) headers.Cookie = credentials.cookie;
        if (credentials.csrfToken) headers['X-CSRF-Token'] = credentials.csrfToken;
        if (credentials.basicAuthorization) headers.Authorization = credentials.basicAuthorization;
        if (body) headers['Content-Length'] = String(body.length);

        return new Promise((resolve, reject) => {
            const signal = options.signal;
            if (signal?.aborted) {
                reject(createAbortError());
                return;
            }
            let settled = false;
            const requestModule = target.protocol === 'https:' ? https : http;
            const request = requestModule.request({
                protocol: target.protocol,
                hostname: target.hostname,
                port: target.port,
                path,
                method: String(options.method || 'GET').toUpperCase(),
                headers,
                ...(target.protocol === 'https:' ? {
                    rejectUnauthorized: false,
                    servername: 'localhost',
                } : {}),
            });
            const onAbort = () => request.destroy(createAbortError());
            const cleanupSignal = () => signal?.removeEventListener('abort', onAbort);
            signal?.addEventListener('abort', onAbort, { once: true });
            request.on('response', (response) => {
                settled = true;
                response.once('close', cleanupSignal);
                resolve(new Response(Readable.toWeb(response), {
                    status: response.statusCode || 500,
                    statusText: response.statusMessage || '',
                    headers: responseHeaders(response.headers),
                }));
            });
            request.on('error', (error) => {
                cleanupSignal();
                if (!settled) reject(error);
            });
            if (body) request.end(body);
            else request.end();
        });
    };

    return {
        fetch: fetchImpl,
        getRequestHeaders() {
            if (disposed) return {};
            return {
                ...(credentials.csrfToken ? { 'X-CSRF-Token': credentials.csrfToken } : {}),
                ...(credentials.cookie ? { Cookie: credentials.cookie } : {}),
                ...(credentials.basicAuthorization ? { Authorization: credentials.basicAuthorization } : {}),
            };
        },
        dispose() {
            disposed = true;
            Object.keys(credentials).forEach((key) => { credentials[key] = null; });
        },
    };
}

function createPerRunHostClient(req, agentCore) {
    if (!agentCore || typeof agentCore.createHostChatCompletionsClient !== 'function') {
        throw new TypeError('Draw Run Agent Core 缺少 Host Client 工厂');
    }
    const transport = createLoopbackFetch(captureLoopbackRequestContext(req));
    try {
        const client = agentCore.createHostChatCompletionsClient({
            requestHeadersProvider: transport.getRequestHeaders,
            fetch: transport.fetch,
        });
        return Object.freeze({ client, dispose: transport.dispose });
    } catch (error) {
        transport.dispose();
        throw error;
    }
}

module.exports = {
    ALLOWED_HOST_PATHS,
    captureLoopbackRequestContext,
    createLoopbackFetch,
    createPerRunHostClient,
};
