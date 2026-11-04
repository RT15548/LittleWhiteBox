'use strict';

const { createAsyncImageJobManager } = require('./image-jobs/job-manager.js');
const { registerImageJobRoutes } = require('./image-jobs/routes.js');
const { createDrawRunManager } = require('./draw-runs/draw-run-manager.js');
const { createPerRunHostClient } = require('./draw-runs/loopback-host-client.js');
const { registerLoopbackProbeRoutes } = require('./draw-runs/loopback-probe.js');
const { registerDrawRunRoutes } = require('./draw-runs/routes.js');
const pluginManifest = require('./manifest.json');
const { registerWebRoutes, EXA_BACKEND_CAPABILITY } = require('./web/routes.js');
const { IMAGE_SAVE_CAPABILITY, OPEN_FOLDER_CAPABILITY, registerImageFileRoutes } = require('./image-files/routes.js');
const { CANCELLATION_CAPABILITY, createCancellationRegistry, registerCancellationRoutes } = require('./cancellation.js');
const { RUNTIME_HOST_ABI, createRuntimeLoader } = require('./runtime-loader.js');

const info = { ...pluginManifest };
const loader = createRuntimeLoader();
const cancellations = createCancellationRegistry();
const jobManager = createAsyncImageJobManager({ cancellations });
const imageJobService = {
    create(owner, body, execution) {
        const runtime = jobManager.runtimeFor(owner, body.requestId) || execution;
        return jobManager.createJob({ owner, ...runtime.api.normalizeImageJob(body), execution: runtime });
    },
    get: (owner, id) => jobManager.getJob(owner, id),
    cancel: (owner, id) => jobManager.cancelJob(owner, id),
};
const drawRunManager = createDrawRunManager({
    cancellations, imageJobService,
    resolveRuntime: req => req.runtime,
    createHostClient: (req, agentCore) => createPerRunHostClient(req, agentCore),
});
const capabilities = [
    'v5-msgpack-stream', 'image-batch-jobs-v1', 'novelai-v5-final-image-v1',
    'draw-runs-v1', 'draw-run-runtime-v4', 'draw-run-planner-retry-v1', 'draw-run-planner-layout-v1',
    CANCELLATION_CAPABILITY, EXA_BACKEND_CAPABILITY, IMAGE_SAVE_CAPABILITY, OPEN_FOLDER_CAPABILITY,
];
const transportRoutes = new WeakMap();

function requestRuntime(req) {
    return loader.load(req, {
        extensionId: req.headers?.['x-lwb-extension'] || 'LittleWhiteBox',
        runtimeId: req.headers?.['x-lwb-runtime'] || undefined,
    });
}

function route(handler) {
    return (req, res) => Promise.resolve().then(() => handler(req, res)).catch(error => {
        if (res.headersSent) return res.destroy(error);
        return res.status(Number.isInteger(error.status) ? error.status : 503).send({
            ok: false, code: error.code || 'runtime_unavailable', error: String(error.message || error),
        });
    });
}

async function init(router) {
    router.get('/status', (_req, res) => res.status(200).send({
        ok: true, id: info.id, version: info.version, capabilities, runtimeHostAbi: RUNTIME_HOST_ABI,
    }));
    router.post('/v1/runtime/prepare', route(async (req, res) => {
        if (!req.user?.profile?.handle) return res.status(403).send({ ok: false, code: 'authenticated_profile_required' });
        const runtime = await loader.load(req, req.body || {});
        return res.status(200).send({ ok: true, runtimeId: runtime.id, abi: RUNTIME_HOST_ABI });
    }));
    const runtimeRouter = {
        get: (...args) => router.get(...args),
        delete: (...args) => router.delete(...args),
        post(path, handler) {
            router.post(path, route(async (req, res) => {
                if (path === '/v1/jobs' || path === '/v1/draw-runs') {
                    const owner = req.user?.profile?.handle;
                    if (!owner) return res.status(403).send({ ok: false, code: 'authenticated_profile_required' });
                    req.runtime = path === '/v1/jobs'
                        ? jobManager.runtimeFor(owner, req.body?.requestId)
                        : drawRunManager.runtimeFor(owner, req.body?.runId);
                    req.runtime ||= await requestRuntime(req);
                }
                return handler(req, res);
            }));
        },
    };
    registerImageJobRoutes(runtimeRouter, { manager: jobManager, service: imageJobService });
    registerDrawRunRoutes(runtimeRouter, { manager: drawRunManager });
    registerLoopbackProbeRoutes(router);
    registerCancellationRoutes(router, { registry: cancellations, jobManager, drawRunManager });
    registerWebRoutes(router);
    registerImageFileRoutes(router);
    for (const path of ['/v1/generate-image', '/v2/generate-image', '/v1/generate-image-stream', '/v1/test', '/v2/test', '/v1/encode-vibe']) {
        router.post(path, route(async (req, res) => {
            const runtime = await requestRuntime(req);
            let routes = transportRoutes.get(runtime);
            if (!routes) {
                routes = new Map();
                runtime.api.registerTransportRoutes({ post: (name, handler) => routes.set(name, handler) });
                transportRoutes.set(runtime, routes);
            }
            runtime.retain();
            try { return await routes.get(path)(req, res, error => { throw error; }); }
            finally { runtime.release(); }
        }));
    }
}

async function exit() {
    drawRunManager.close();
    jobManager.close();
    cancellations.close();
    loader.close();
}
module.exports = { exit, info, init };
