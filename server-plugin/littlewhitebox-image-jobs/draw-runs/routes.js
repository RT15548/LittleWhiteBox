'use strict';

const { MAX_ENVELOPE_BYTES } = require('./envelope.js');

const DRAW_RUNS_PATH = '/v1/draw-runs';

function requestOwner(req) {
    const handle = req.user?.profile?.handle;
    return typeof handle === 'string' && handle.length > 0 ? handle : null;
}

function sendOwnerError(res) {
    return res.status(403).send({ ok: false, code: 'authenticated_profile_required', error: 'Authenticated user profile is required' });
}

function sendNotFound(res) {
    return res.status(404).send({ ok: false, code: 'draw_run_not_found', error: 'Draw Run not found' });
}

function sendError(res, error) {
    const status = Number.isInteger(error?.status) ? error.status : 503;
    return res.status(status).send({
        ok: false,
        code: String(error?.code || 'draw_run_failed'),
        error: String(error?.message || 'Draw Run failed'),
    });
}

function exceedsDeclaredLimit(req) {
    const raw = req.headers?.['content-length'];
    if (raw === undefined) return false;
    const length = Number(raw);
    return Number.isFinite(length) && length > MAX_ENVELOPE_BYTES;
}

function registerDrawRunRoutes(router, { manager }) {
    if (!manager || typeof manager.create !== 'function') {
        throw new TypeError('Draw Run routes require a manager');
    }

    router.post(DRAW_RUNS_PATH, (req, res) => {
        res.setHeader('Cache-Control', 'no-store');
        const owner = requestOwner(req);
        if (!owner) return sendOwnerError(res);
        if (exceedsDeclaredLimit(req)) {
            return res.status(413).send({
                ok: false,
                code: 'draw_run_input_limit',
                error: 'Draw Run envelope is too large',
            });
        }
        try {
            const run = manager.create(owner, req.body || {}, req);
            return res.status(202).send({ ok: true, run });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.get(DRAW_RUNS_PATH, (req, res) => {
        res.setHeader('Cache-Control', 'no-store');
        const owner = requestOwner(req);
        if (!owner) return sendOwnerError(res);
        return res.status(200).send({ ok: true, runs: manager.list(owner) });
    });

    router.get(`${DRAW_RUNS_PATH}/:runId`, (req, res) => {
        res.setHeader('Cache-Control', 'no-store');
        const owner = requestOwner(req);
        if (!owner) return sendOwnerError(res);
        const run = manager.get(owner, req.params.runId);
        return run ? res.status(200).send({ ok: true, run }) : sendNotFound(res);
    });

    router.post(`${DRAW_RUNS_PATH}/:runId/cancel`, (req, res) => {
        res.setHeader('Cache-Control', 'no-store');
        const owner = requestOwner(req);
        if (!owner) return sendOwnerError(res);
        try {
            const run = manager.cancel(owner, req.params.runId);
            return run ? res.status(200).send({ ok: true, run }) : sendNotFound(res);
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.delete(`${DRAW_RUNS_PATH}/:runId`, (req, res) => {
        res.setHeader('Cache-Control', 'no-store');
        const owner = requestOwner(req);
        if (!owner) return sendOwnerError(res);
        const result = manager.acknowledge(owner, req.params.runId);
        if (!result) return sendNotFound(res);
        if (!result.ok) {
            return res.status(409).send({
                ok: false,
                code: 'draw_run_not_ready',
                state: result.state,
                error: 'Draw Run has not reached a handoff or terminal state',
            });
        }
        return res.status(200).send({ ok: true });
    });
}

module.exports = {
    DRAW_RUNS_PATH,
    registerDrawRunRoutes,
};
