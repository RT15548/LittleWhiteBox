'use strict';

/**
 * LittleWhiteBox background image jobs server plugin.
 *
 * 安装：把本文件夹整个放到 SillyTavern/plugins/littlewhitebox-image-jobs/ ，
 *       在 config.yaml 中开启 enableServerPlugins: true ，然后重启 SillyTavern。
 *
 * 本插件的身份（目录、info.id、路由命名空间）都是 littlewhitebox-image-jobs，
 * 与历史插件 littlewhitebox-nai 完全独立：ID 不同，不会互相顶掉，可以并存。
 * 小白X前端只请求本插件的命名空间，不探测、不回退旧插件；旧目录留着也不会被使用，
 * 建议直接删除 plugins/littlewhitebox-nai/，避免维护两份不再使用的代码。
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

const providerAdapters = Object.freeze({
    novelai,
    'sd-webui': sdWebUi,
    comfyui,
});

const PLUGIN_VERSION = pluginManifest.version;
const PLUGIN_CAPABILITIES = Object.freeze([
    'v5-msgpack-stream',
    'image-batch-jobs-v1',
    'draw-runs-v1',
    'draw-run-runtime-v2',
]);
const LOG_PREFIX = '[littlewhitebox-image-jobs]';

const info = {
    id: 'littlewhitebox-image-jobs',
    name: 'LittleWhiteBox Image Jobs',
    version: PLUGIN_VERSION,
    description: 'Background image job runner for LittleWhiteBox providers; also serves the NovelAI proxy routes.',
};

const jobManager = createAsyncImageJobManager({
    adapters: providerAdapters,
});
const imageJobService = createImageJobService({
    manager: jobManager,
    adapters: providerAdapters,
});
const drawRunManager = createDrawRunManager({
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

function createRequestAbortScope(req, res) {
    const controller = new AbortController();
    let cause = null;
    let timeoutId = null;
    const abort = (nextCause) => {
        if (nextCause === 'client' || cause === null) cause = nextCause;
        if (controller.signal.aborted) return;
        controller.abort();
    };
    const abortForClient = () => abort('client');
    const abortIfIncomplete = () => {
        if (!res.writableEnded) abortForClient();
    };

    req.once('aborted', abortForClient);
    res.once('close', abortIfIncomplete);
    // SillyTavern's global middleware may finish and destroy an already complete
    // request body while the response socket is still alive. That is not a
    // client disconnect and must not suppress the route response.
    if (req.aborted || (!req.complete && req.destroyed) || res.destroyed) abortForClient();

    return {
        signal: controller.signal,
        get cause() {
            return cause;
        },
        setDeadline(timeout) {
            timeoutId = setTimeout(() => abort('timeout'), timeout);
            timeoutId.unref?.();
        },
        dispose() {
            if (timeoutId !== null) clearTimeout(timeoutId);
            req.off('aborted', abortForClient);
            res.off('close', abortIfIncomplete);
        },
    };
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
}

module.exports = { exit, info, init };
