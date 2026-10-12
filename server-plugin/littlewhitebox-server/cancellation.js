'use strict';

const CANCELLATION_CAPABILITY = 'draw-work-cancellation-v1';
const MAX_CANCELLATION_TARGETS = 128;
const CANCELLATION_RETENTION_MS = 60 * 60 * 1000;
const COPY = Object.freeze({
    invalid: 'Cancellation requires safe jobIds/runIds within the target limit',
    full: 'Too many retained cancellation targets',
    cancelled: 'This request was cancelled',
    ownerChanged: 'Cancellation belongs to another authenticated profile',
});

function failure(message, code, status) {
    return Object.assign(new Error(message), { code, status });
}

// Process-local, like the jobs themselves. No credentials or request bodies.
// Retention is independent of result ACK/deletion: a delayed POST must not undo
// cancellation just because the browser has already cleaned up its journal.
function createCancellationRegistry({ now = Date.now, retentionMs = CANCELLATION_RETENTION_MS,
    maxTargets = 4096, maxTargetsPerOwner = 256 } = {}) {
    const entries = new Map();
    const keyOf = (owner, kind, id) => JSON.stringify([owner, kind, id]);
    const sweep = () => {
        for (const [key, entry] of entries) if (!entry.reserved && entry.expiresAt <= now()) entries.delete(key);
    };
    const keysOf = (owner, { jobIds = [], runIds = [] }) => [...new Set([
        ...jobIds.map(id => keyOf(owner, 'job', id)), ...runIds.map(id => keyOf(owner, 'run', id)),
    ])];
    const requireCapacity = (owner, keys) => {
        const added = keys.filter(key => !entries.has(key));
        if (entries.size + added.length > maxTargets
            || [...entries.values()].filter(entry => entry.owner === owner).length + added.length > maxTargetsPerOwner) {
            throw failure(COPY.full, 'cancellation_limit', 429);
        }
    };
    return {
        // Admission reserves the space needed to stop accepted work. Draw Runs
        // reserve both their planner and their deterministic child before paying
        // for planning; the child manager takes ownership at dispatch.
        reserve(owner, targets) {
            sweep();
            const keys = keysOf(owner, targets);
            for (const key of keys) if (entries.get(key)?.cancelled) throw failure(COPY.cancelled, 'request_cancelled', 409);
            requireCapacity(owner, keys);
            for (const key of keys) entries.set(key, { owner, reserved: true, cancelled: false, expiresAt: 0 });
        },
        release(owner, kind, id) {
            const key = keyOf(owner, kind, id);
            const entry = entries.get(key);
            if (!entry) return;
            if (entry.cancelled && entry.expiresAt > now()) entry.reserved = false;
            else entries.delete(key);
        },
        remember(owner, { jobIds, runIds }) {
            sweep();
            const keys = keysOf(owner, { jobIds, runIds });
            requireCapacity(owner, keys);
            const expiresAt = now() + retentionMs;
            for (const key of keys) entries.set(key, { owner, expiresAt, cancelled: true,
                reserved: entries.get(key)?.reserved === true });
        },
        assertAllowed(owner, kind, id) {
            sweep();
            if (entries.get(keyOf(owner, kind, id))?.cancelled) throw failure(COPY.cancelled, 'request_cancelled', 409);
        },
        close() { entries.clear(); },
    };
}

function normalizeCancellation(body) {
    const { jobIds = [], runIds = [] } = body || {};
    if (![jobIds, runIds].every(ids => Array.isArray(ids)
        && ids.every(id => typeof id === 'string' && /^[A-Za-z0-9._:-]{1,128}$/.test(id)))
        || jobIds.length + runIds.length === 0 || jobIds.length + runIds.length > MAX_CANCELLATION_TARGETS) {
        throw failure(COPY.invalid, 'invalid_cancellation', 400);
    }
    return { jobIds: [...new Set(jobIds)], runIds: [...new Set(runIds)] };
}

function registerCancellationRoutes(router, { registry, jobManager, drawRunManager }) {
    router.post('/v1/cancel', (req, res) => {
        const owner = req.user?.profile?.handle;
        if (typeof owner !== 'string' || !owner) return res.status(403).send({ ok: false, code: 'authenticated_profile_required' });
        try {
            // A browser can retain an intent across account switches. Never ACK
            // that intent in the namespace of the newly logged-in account.
            if (req.body?.owner !== owner) throw failure(COPY.ownerChanged, 'cancellation_owner_mismatch', 409);
            const targets = normalizeCancellation(req.body);
            // All validation and capacity checks precede effects. The whole
            // operation is synchronous: neither scheduler can advance between
            // cancelling a planner/child and the remaining selected jobs.
            registry.remember(owner, targets);
            for (const id of targets.runIds) drawRunManager.cancel(owner, id);
            jobManager.cancelJobs(owner, targets.jobIds);
            return res.status(200).send({ ok: true });
        } catch (error) {
            return res.status(error.status || 503).send({ ok: false, code: error.code || 'cancellation_failed', error: error.message });
        }
    });
}

module.exports = { CANCELLATION_CAPABILITY, CANCELLATION_RETENTION_MS, createCancellationRegistry,
    normalizeCancellation, registerCancellationRoutes };
