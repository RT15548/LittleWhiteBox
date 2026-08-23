'use strict';

const { MAX_TIMEOUT_MS, parseTimeout } = require('../providers/upstream.js');
const MAX_JOB_ITEMS = 20;

function parseUrl(value) {
    const raw = String(value || '').trim();
    try {
        const url = new URL(raw);
        return url.protocol === 'http:' || url.protocol === 'https:' ? raw : null;
    } catch {
        return null;
    }
}

function getRequestOwner(req) {
    const handle = req.user?.profile?.handle;
    return typeof handle === 'string' && handle.length > 0 ? handle : null;
}

function parseRequest(body, adapters) {
    const provider = String(body?.provider || '').trim();
    if (!Object.hasOwn(adapters, provider)) return { error: 'provider is invalid' };
    const adapter = adapters[provider];
    const requestId = String(body?.requestId || '').trim();
    if (!/^[A-Za-z0-9._:-]{1,128}$/.test(requestId)) {
        return { error: 'requestId is required and must use safe identifier characters' };
    }
    const minDelay = Math.round(Number(body?.delay?.min));
    const maxDelay = Math.round(Number(body?.delay?.max));
    if (!Number.isFinite(minDelay) || !Number.isFinite(maxDelay)
        || minDelay < 1 || maxDelay < 1 || minDelay > maxDelay || maxDelay > MAX_TIMEOUT_MS) {
        return { error: 'delay min/max must be positive numbers with min <= max' };
    }
    if (!Array.isArray(body?.items) || body.items.length === 0 || body.items.length > MAX_JOB_ITEMS) {
        return { error: `items must contain between 1 and ${MAX_JOB_ITEMS} entries` };
    }
    const normalized = adapter.normalize(body.context, body.items, { parseTimeout, parseUrl });
    if (normalized?.error) return normalized;
    return {
        value: {
            provider,
            requestId,
            context: normalized.context,
            delay: { min: minDelay, max: maxDelay },
            items: normalized.items,
        },
    };
}

function parseItemIndex(value) {
    const raw = String(value ?? '');
    if (!/^(0|[1-9]\d*)$/.test(raw)) return null;
    const index = Number(raw);
    return Number.isSafeInteger(index) && index < MAX_JOB_ITEMS ? index : null;
}

function sendOwnerError(res) {
    return res.status(403).send({ ok: false, error: 'Authenticated user profile is required' });
}

function sendNotFound(res) {
    return res.status(404).send({ ok: false, error: 'Image job not found' });
}

function registerImageJobRoutes(router, { manager, adapters }) {
    router.post('/v1/jobs', (req, res) => {
        const owner = getRequestOwner(req);
        if (!owner) return sendOwnerError(res);
        let parsed;
        try {
            parsed = parseRequest(req.body || {}, adapters);
        } catch (error) {
            return res.status(400).send({
                ok: false,
                error: String(error?.message || 'Image job request is invalid'),
                code: 'invalid_request',
            });
        }
        if (parsed.error) return res.status(400).send({ ok: false, error: parsed.error, code: 'invalid_request' });
        try {
            const job = manager.createJob({ owner, ...parsed.value });
            return res.status(202).send({ ok: true, job: { id: job.id, state: job.state, total: job.total, createdAt: job.createdAt } });
        } catch (error) {
            return res.status(Number.isInteger(error?.status) ? error.status : 503).send({
                ok: false,
                error: String(error?.message || 'Image job could not be created'),
                code: error?.code || 'job_create_failed',
            });
        }
    });

    // 重连发现接口：只暴露调用者自己名下的任务，供客户端把存活的 jobId 与本地交付日志对齐。
    router.get('/v1/jobs', (req, res) => {
        const owner = getRequestOwner(req);
        if (!owner) return sendOwnerError(res);
        return res.status(200).send({ ok: true, jobs: manager.listJobs(owner) });
    });

    router.get('/v1/jobs/:jobId', (req, res) => {
        const owner = getRequestOwner(req);
        if (!owner) return sendOwnerError(res);
        const job = manager.getJob(owner, req.params.jobId);
        return job ? res.status(200).send({ ok: true, job }) : sendNotFound(res);
    });

    router.get('/v1/jobs/:jobId/results/:index', (req, res) => {
        const owner = getRequestOwner(req);
        if (!owner) return sendOwnerError(res);
        const index = parseItemIndex(req.params.index);
        if (index === null) return res.status(400).send({ ok: false, error: 'Result index is invalid' });
        const result = manager.getResult(owner, req.params.jobId, index);
        if (!result) return sendNotFound(res);
        if (result.state === 'consumed') return res.status(410).send({ ok: false, state: result.state, error: 'Image result was already consumed' });
        if (result.state !== 'ready') return res.status(409).send({ ok: false, state: result.state, error: result.error || null });
        res.setHeader('Content-Type', result.mime);
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).send(result.buffer);
    });

    router.delete('/v1/jobs/:jobId/results/:index', (req, res) => {
        const owner = getRequestOwner(req);
        if (!owner) return sendOwnerError(res);
        const index = parseItemIndex(req.params.index);
        if (index === null) return res.status(400).send({ ok: false, error: 'Result index is invalid' });
        const result = manager.consumeResult(owner, req.params.jobId, index);
        if (!result) return sendNotFound(res);
        if (!result.ok) return res.status(409).send({ ok: false, state: result.state, error: result.error || null });
        return res.status(200).send({ ok: true, state: 'consumed' });
    });

    router.post('/v1/jobs/:jobId/cancel', (req, res) => {
        const owner = getRequestOwner(req);
        if (!owner) return sendOwnerError(res);
        const job = manager.cancelJob(owner, req.params.jobId);
        return job ? res.status(200).send({ ok: true, job }) : sendNotFound(res);
    });

    router.delete('/v1/jobs/:jobId', (req, res) => {
        const owner = getRequestOwner(req);
        if (!owner) return sendOwnerError(res);
        const result = manager.deleteJob(owner, req.params.jobId);
        if (!result) return sendNotFound(res);
        if (!result.ok) return res.status(409).send({ ok: false, state: result.state, error: 'Image job is not terminal' });
        return res.status(200).send({ ok: true });
    });
}

module.exports = { registerImageJobRoutes };
