'use strict';
const { pipeline } = require('node:stream/promises');
const { generateImage, openImageStream, testConnection } = require('./providers/novelai/client.js');
const { parseTimeout } = require('./providers/upstream.js');
const { createRequestAbortScope } = require('../../../server-plugin/littlewhitebox-server/request-abort.js');
const LOG_PREFIX = '[littlewhitebox-server]';
/**
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<unknown>} handler
 * @returns {import('express').RequestHandler}
 */
function asyncRoute(handler) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Express receives failures through next; return the observed task so direct callers can await completion.
    return (req, res, next) => handler(req, res, next).catch(next);
}


function parseUpstreamUrl(value) {
    try {
        const url = new URL(String(value || '').trim());
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
    } catch {
        return null;
    }
}

function errorMessage(error) {
    return String(error?.message || error);
}

function sendRequestError(scope, res, error, label) {
    if (scope.cause === 'client') return;
    if (scope.cause === 'timeout') {
        return res.status(200).send({ ok: false, code: 'timeout', error: 'NovelAI request timed out' });
    }
    console.error(`${LOG_PREFIX} ${label} error:`, error);
    return res.status(200).send({ ok: false, error: errorMessage(error) });
}

function registerGenerateRoute(router, path) {
    router.post(path, async (req, res) => {
        const scope = createRequestAbortScope(req, res);
        try {
            if (scope.signal.aborted) return;
            const body = req.body || {};
            const key = String(body.key || '').trim();
            const url = parseUpstreamUrl(body.url);
            const payload = body.payload;
            const timeout = parseTimeout(body.timeout);
            if (!key) return res.status(400).send({ ok: false, error: 'API key is required' });
            if (!url) return res.status(400).send({ ok: false, error: 'A complete HTTP(S) url is required' });
            if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
                return res.status(400).send({ ok: false, error: 'payload is required' });
            }
            if (timeout === null) return res.status(400).send({ ok: false, error: 'timeout must be a positive number' });
            scope.setDeadline(timeout);

            const result = await generateImage({
                url,
                key,
                payload,
                insecure: body.insecure === true,
                signal: scope.signal,
            });

            if (!result.ok) {
                console.warn(`${LOG_PREFIX} upstream ${result.status}: ${result.error.slice(0, 300)}`);
            }
            return res.status(200).send(result);
        } catch (error) {
            return sendRequestError(scope, res, error, path);
        } finally {
            scope.dispose();
        }
    });
}

function registerTestRoute(router, path) {
    router.post(path, async (req, res) => {
        const scope = createRequestAbortScope(req, res);
        try {
            if (scope.signal.aborted) return;
            const body = req.body || {};
            const key = String(body.key || '').trim();
            const url = parseUpstreamUrl(body.url);
            const payload = body.payload;
            const timeout = parseTimeout(body.timeout);
            if (!key) return res.status(400).send({ ok: false, error: 'API key is required' });
            if (!url) return res.status(400).send({ ok: false, error: 'A complete HTTP(S) url is required' });
            if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
                return res.status(400).send({ ok: false, error: 'payload is required' });
            }
            if (timeout === null) return res.status(400).send({ ok: false, error: 'timeout must be a positive number' });
            scope.setDeadline(timeout);

            const result = await testConnection({
                url,
                key,
                payload,
                multipart: body.multipart === true,
                insecure: body.insecure === true,
                signal: scope.signal,
            });
            return res.status(200).send(result);
        } catch (error) {
            return sendRequestError(scope, res, error, path);
        } finally {
            scope.dispose();
        }
    });
}


function registerTransportRoutes(router) {
    // v1 is the frozen upstream 1.0.1 contract; URL resolution deliberately
    // stays inside the client so input validation runs in its original order.
    router.post('/v1/generate-image', asyncRoute(async (req, res) => {
        const scope = createRequestAbortScope(req, res);
        try {
            if (scope.signal.aborted) return;
            const body = req.body || {};
            const key = String(body.key || '').trim();
            const payload = body.payload;
            const timeout = parseTimeout(body.timeout);
            if (!key) return res.status(400).send({ ok: false, error: 'API key is required' });
            if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
                return res.status(400).send({ ok: false, error: 'payload is required' });
            }
            if (timeout === null) return res.status(400).send({ ok: false, error: 'timeout must be a positive number' });
            scope.setDeadline(timeout);

            const result = await generateImage({
                baseUrl: body.url,
                key,
                payload,
                insecure: body.insecure === true,
                signal: scope.signal,
            });
            if (!result.ok) {
                console.warn(`${LOG_PREFIX} upstream ${result.status}: ${result.error.slice(0, 300)}`);
            }
            return res.status(200).send(result);
        } catch (error) {
            return sendRequestError(scope, res, error, 'generate-image');
        } finally {
            scope.dispose();
        }
    }));

    registerGenerateRoute(router, '/v2/generate-image');

    router.post('/v1/generate-image-stream', asyncRoute(async (req, res) => {
        const scope = createRequestAbortScope(req, res);
        try {
            if (scope.signal.aborted) return;
            const body = req.body || {};
            const key = String(body.key || '').trim();
            const url = parseUpstreamUrl(body.url);
            const payload = body.payload;
            const timeout = parseTimeout(body.timeout);
            if (!key) return res.status(400).send('API key is required');
            if (!url) return res.status(400).send('A complete HTTP(S) url is required');
            if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
                return res.status(400).send('payload is required');
            }
            if (timeout === null) return res.status(400).send('timeout must be a positive number');
            scope.setDeadline(timeout);

            const result = await openImageStream({
                url,
                key,
                payload,
                insecure: body.insecure === true,
                signal: scope.signal,
            });
            if (!result.ok) {
                return res.status(result.status || 502).type('text/plain').send(result.error || 'NovelAI V5 request failed');
            }

            res.status(200);
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Cache-Control', 'no-store');
            await pipeline(result.response, res, { signal: scope.signal });
        } catch (error) {
            if (scope.cause === 'client') return;
            if (scope.cause === 'timeout') {
                if (!res.headersSent) res.status(504).type('text/plain').send('NovelAI request timed out');
                else res.destroy();
                return;
            }
            console.error(`${LOG_PREFIX} generate-image-stream error:`, error);
            if (!res.headersSent) res.status(502).type('text/plain').send(errorMessage(error));
            else res.destroy(error);
        } finally {
            scope.dispose();
        }
    }));

    router.post('/v1/test', asyncRoute(async (req, res) => {
        const scope = createRequestAbortScope(req, res);
        try {
            if (scope.signal.aborted) return;
            const body = req.body || {};
            const key = String(body.key || '').trim();
            const timeout = parseTimeout(body.timeout);
            if (!key) return res.status(400).send({ ok: false, error: 'API key is required' });
            if (timeout === null) return res.status(400).send({ ok: false, error: 'timeout must be a positive number' });
            scope.setDeadline(timeout);

            const result = await testConnection({
                baseUrl: body.url,
                key,
                insecure: body.insecure === true,
                signal: scope.signal,
            });
            return res.status(200).send(result);
        } catch (error) {
            return sendRequestError(scope, res, error, 'test');
        } finally {
            scope.dispose();
        }
    }));

    registerTestRoute(router, '/v2/test');

}
module.exports = { registerTransportRoutes };
