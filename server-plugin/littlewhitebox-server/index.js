'use strict';

/**
 * LittleWhiteBox server plugin. Feature routes are registered here; each feature owns its implementation.
 * Installation and coordinated frontend/backend upgrades are documented in README.md.
 */

const { pipeline } = require('node:stream/promises');
const {
    generateImage,
    openImageStream,
    testConnection,
} = require('./providers/novelai/client.js');
const { createAsyncImageJobManager } = require('./image-jobs/job-manager.js');
const { registerImageJobRoutes } = require('./image-jobs/routes.js');
const { createImageJobService } = require('./image-jobs/service.js');
const { createDrawRunManager } = require('./draw-runs/draw-run-manager.js');
const { createEnvelopeValidator } = require('./draw-runs/envelope.js');
const { createPerRunHostClient } = require('./draw-runs/loopback-host-client.js');
const { registerLoopbackProbeRoutes } = require('./draw-runs/loopback-probe.js');
const { registerDrawRunRoutes } = require('./draw-runs/routes.js');
const agentCore = require('./draw-runs/vendor/agent-core-node.cjs');
const drawRunRuntime = require('./draw-runs/vendor/draw-run-runtime.cjs');
const { parseTimeout } = require('./providers/upstream.js');
const novelai = require('./providers/novelai/adapter.js');
const sdWebUi = require('./providers/sd-webui/adapter.js');
const comfyui = require('./providers/comfyui/adapter.js');
const pluginManifest = require('./manifest.json');
const { createRequestAbortScope } = require('./request-abort.js');
const { registerWebRoutes, EXA_BACKEND_CAPABILITY } = require('./web/routes.js');
const { CANCELLATION_CAPABILITY, createCancellationRegistry, registerCancellationRoutes } = require('./cancellation.js');

const providerAdapters = Object.freeze({
    novelai,
    'sd-webui': sdWebUi,
    comfyui,
});

const PLUGIN_VERSION = pluginManifest.version;
const PLUGIN_CAPABILITIES = Object.freeze([
    'v5-msgpack-stream',
    'image-batch-jobs-v1',
    'novelai-v5-final-image-v1',
    'draw-runs-v1',
    'draw-run-runtime-v4',
    'draw-run-planner-retry-v1',
    CANCELLATION_CAPABILITY,
    EXA_BACKEND_CAPABILITY,
]);
const LOG_PREFIX = `[${pluginManifest.id}]`;

const info = {
    id: pluginManifest.id,
    name: pluginManifest.name,
    version: PLUGIN_VERSION,
    description: pluginManifest.description,
};

const cancellations = createCancellationRegistry();
const jobManager = createAsyncImageJobManager({
    adapters: providerAdapters,
    cancellations,
});
const imageJobService = createImageJobService({
    manager: jobManager,
    adapters: providerAdapters,
});
const drawRunManager = createDrawRunManager({
    cancellations,
    runtime: drawRunRuntime,
    agentCore,
    envelopeValidator: createEnvelopeValidator(drawRunRuntime),
    imageJobService,
    createHostClient: req => createPerRunHostClient(req, agentCore),
});

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

/**
 * @param {import('express').Router} router
 */
async function init(router) {
    router.get('/status', (_req, res) => {
        res.status(200).send({
            ok: true,
            id: info.id,
            version: PLUGIN_VERSION,
            capabilities: [...PLUGIN_CAPABILITIES],
        });
    });

    registerImageJobRoutes(router, {
        manager: jobManager,
        adapters: providerAdapters,
        service: imageJobService,
    });
    registerLoopbackProbeRoutes(router);
    registerDrawRunRoutes(router, { manager: drawRunManager });
    registerCancellationRoutes(router, { registry: cancellations, jobManager, drawRunManager });
    registerWebRoutes(router);

    // v1 is the frozen upstream 1.0.1 contract; URL resolution deliberately
    // stays inside the client so input validation runs in its original order.
    router.post('/v1/generate-image', async (req, res) => {
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
    });

    registerGenerateRoute(router, '/v2/generate-image');

    router.post('/v1/generate-image-stream', async (req, res) => {
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
    });

    router.post('/v1/test', async (req, res) => {
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
    });

    registerTestRoute(router, '/v2/test');

    console.log(`${LOG_PREFIX} server plugin initialized (v${PLUGIN_VERSION})`);
}

async function exit() {
    drawRunManager.close();
    jobManager.close();
    cancellations.close();
}

module.exports = { exit, info, init };
