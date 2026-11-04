'use strict';

const { MAX_TIMEOUT_MS, parseTimeout } = require('../providers/upstream.js');

const MAX_JOB_ITEMS = 20;

function createServiceError(message, code = 'invalid_request', status = 400) {
    const error = new Error(message);
    error.code = code;
    error.status = status;
    return error;
}

function parseUrl(value) {
    const raw = String(value || '').trim();
    try {
        const url = new URL(raw);
        return url.protocol === 'http:' || url.protocol === 'https:' ? raw : null;
    } catch {
        return null;
    }
}

function normalizeImageJobRequest(body, adapters) {
    const provider = String(body?.provider || '').trim();
    if (!Object.hasOwn(adapters, provider)) {
        throw createServiceError('provider is invalid');
    }
    const requestId = String(body?.requestId || '').trim();
    if (!/^[A-Za-z0-9._:-]{1,128}$/.test(requestId)) {
        throw createServiceError('requestId is required and must use safe identifier characters');
    }
    const minDelay = Math.round(Number(body?.delay?.min));
    const maxDelay = Math.round(Number(body?.delay?.max));
    if (!Number.isFinite(minDelay) || !Number.isFinite(maxDelay)
        || minDelay < 1 || maxDelay < 1 || minDelay > maxDelay || maxDelay > MAX_TIMEOUT_MS) {
        throw createServiceError('delay min/max must be positive numbers with min <= max');
    }
    if (!Array.isArray(body?.items) || body.items.length === 0 || body.items.length > MAX_JOB_ITEMS) {
        throw createServiceError(`items must contain between 1 and ${MAX_JOB_ITEMS} entries`);
    }

    let normalized;
    try {
        normalized = adapters[provider].normalize(body.context, body.items, { parseTimeout, parseUrl });
    } catch (error) {
        throw createServiceError(String(error?.message || 'Image job request is invalid'));
    }
    if (normalized?.error) throw createServiceError(normalized.error);
    return {
        provider,
        requestId,
        context: normalized.context,
        delay: { min: minDelay, max: maxDelay },
        items: normalized.items,
    };
}

function createImageJobService({ manager, adapters }) {
    if (!manager || typeof manager.createJob !== 'function') {
        throw new TypeError('Image Job service requires a manager');
    }
    if (!adapters || typeof adapters !== 'object') {
        throw new TypeError('Image Job service requires provider adapters');
    }
    const providerAdapters = Object.assign(Object.create(null), adapters);
    return Object.freeze({
        normalize(body) {
            return normalizeImageJobRequest(body, providerAdapters);
        },
        create(owner, body) {
            return manager.createJob({
                owner,
                ...normalizeImageJobRequest(body, providerAdapters),
            });
        },
        get(owner, jobId) {
            return manager.getJob(owner, jobId);
        },
        cancel(owner, jobId) {
            return manager.cancelJob(owner, jobId);
        },
    });
}

module.exports = {
    MAX_JOB_ITEMS,
    createImageJobService,
    normalizeImageJobRequest,
};
