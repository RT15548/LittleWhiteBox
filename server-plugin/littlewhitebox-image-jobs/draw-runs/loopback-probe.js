'use strict';

const crypto = require('node:crypto');
const http = require('node:http');
const https = require('node:https');
const net = require('node:net');

const LOOPBACK_PROBE_PATH = '/v1/draw-runs/probe';
const LOOPBACK_VERIFY_PATH = '/v1/draw-runs/probe/verify';
const LOOPBACK_VERIFY_REQUEST_PATH = `/api/plugins/littlewhitebox-image-jobs${LOOPBACK_VERIFY_PATH}`;
const LOOPBACK_PROBE_HEADER = 'x-littlewhitebox-loopback-probe';
const DEFAULT_PROBE_TIMEOUT_MS = 5_000;
const MAX_PROBE_RESPONSE_BYTES = 16 * 1024;

class LoopbackProbeError extends Error {
    constructor(code, message, details = undefined) {
        super(message);
        this.name = 'LoopbackProbeError';
        this.code = code;
        this.details = details;
    }
}

function getRequestOwner(req) {
    const handle = req.user?.profile?.handle;
    return typeof handle === 'string' && handle.length > 0 ? handle : null;
}

function readHeader(req, name) {
    const value = req.headers?.[name.toLowerCase()];
    if (Array.isArray(value)) return value.join(', ');
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function readBasicAuthorization(req) {
    const authorization = readHeader(req, 'authorization');
    if (!authorization) return null;
    const [scheme, credentials, ...extra] = authorization.split(' ');
    return scheme === 'Basic' && credentials && extra.length === 0 ? authorization : null;
}

function fingerprint(value) {
    return value === null
        ? null
        : crypto.createHash('sha256').update(value, 'utf8').digest('base64url');
}

function matchesFingerprint(expected, actual) {
    return expected === fingerprint(actual);
}

function resolveLoopbackTarget(req) {
    let listeningAddress = null;
    try {
        listeningAddress = req.socket?.server?.address?.();
    } catch {
        // A closing server may no longer expose its listening address.
    }
    const port = Number(listeningAddress?.port);
    if (!listeningAddress || typeof listeningAddress === 'string'
        || !Number.isInteger(port) || port < 1 || port > 65_535) {
        throw new LoopbackProbeError(
            'loopback_socket_unavailable',
            'The SillyTavern listening socket is unavailable.',
        );
    }

    const boundAddress = String(listeningAddress.address || '');
    let hostname = boundAddress;
    if (boundAddress === '0.0.0.0') hostname = '127.0.0.1';
    if (boundAddress === '::') hostname = '::1';
    const addressFamily = net.isIP(hostname);
    if (addressFamily !== 4 && addressFamily !== 6) {
        throw new LoopbackProbeError(
            'loopback_socket_unavailable',
            'The SillyTavern listening address is unavailable.',
        );
    }

    return Object.freeze({
        protocol: req.socket?.encrypted ? 'https:' : 'http:',
        hostname,
        port,
        addressFamily,
    });
}

function buildForwardedHeaders(req, challenge, body) {
    const headers = {
        Accept: 'application/json',
        Connection: 'close',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        [LOOPBACK_PROBE_HEADER]: challenge,
    };
    const host = readHeader(req, 'host');
    const cookie = readHeader(req, 'cookie');
    const csrfToken = readHeader(req, 'x-csrf-token');
    const basicAuthorization = readBasicAuthorization(req);
    if (host) headers.Host = host;
    if (cookie) headers.Cookie = cookie;
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
    if (basicAuthorization) headers.Authorization = basicAuthorization;
    return headers;
}

function createHeaderExpectations(req) {
    return Object.freeze({
        cookie: fingerprint(readHeader(req, 'cookie')),
        csrfToken: fingerprint(readHeader(req, 'x-csrf-token')),
        basicAuth: fingerprint(readBasicAuthorization(req)),
    });
}

function requestLoopbackJson(target, req, challenge, timeoutMs) {
    const body = '{}';
    const requestModule = target.protocol === 'https:' ? https : http;
    const requestOptions = {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port,
        path: LOOPBACK_VERIFY_REQUEST_PATH,
        method: 'POST',
        headers: buildForwardedHeaders(req, challenge, body),
        ...(target.protocol === 'https:' ? {
            // The destination is forced to the same process over loopback, so native self-signed TLS is safe here.
            rejectUnauthorized: false,
            servername: 'localhost',
        } : {}),
    };

    return new Promise((resolve, reject) => {
        let settled = false;
        let timeoutId = null;
        const settle = (callback, value) => {
            if (settled) return;
            settled = true;
            if (timeoutId !== null) clearTimeout(timeoutId);
            callback(value);
        };
        const request = requestModule.request(requestOptions, (response) => {
            const chunks = [];
            let size = 0;
            response.on('data', (chunk) => {
                size += chunk.length;
                if (size > MAX_PROBE_RESPONSE_BYTES) {
                    response.destroy();
                    settle(reject, new LoopbackProbeError(
                        'loopback_response_too_large',
                        'The SillyTavern loopback probe returned an oversized response.',
                    ));
                    return;
                }
                chunks.push(chunk);
            });
            response.on('end', () => {
                const text = Buffer.concat(chunks).toString('utf8');
                let parsed = null;
                try {
                    parsed = JSON.parse(text);
                } catch {
                    // Authentication middleware may return HTML. The status code remains diagnostic.
                }
                settle(resolve, { statusCode: response.statusCode || 0, body: parsed });
            });
            response.on('error', error => settle(reject, error));
        });
        timeoutId = setTimeout(() => {
            settle(reject, new LoopbackProbeError(
                'loopback_timeout',
                'The SillyTavern loopback probe timed out.',
            ));
            request.destroy();
        }, timeoutMs);
        timeoutId.unref?.();
        request.on('error', error => settle(reject, error));
        request.end(body);
    });
}

function describeCredential(expectedFingerprint) {
    return expectedFingerprint === null ? 'not-present' : 'verified';
}

function normalizeTransportError(error) {
    if (error instanceof LoopbackProbeError) return error;
    const code = String(error?.code || '');
    if (['ECONNREFUSED', 'EHOSTUNREACH', 'ENETUNREACH'].includes(code)) {
        return new LoopbackProbeError(
            'loopback_unreachable',
            'The SillyTavern process could not reach its local listening socket.',
        );
    }
    return new LoopbackProbeError(
        'loopback_transport_failed',
        'The SillyTavern loopback request failed.',
    );
}

function createLoopbackProbeService(options = {}) {
    const timeoutMs = Number.isFinite(options.timeoutMs) && options.timeoutMs > 0
        ? Math.round(options.timeoutMs)
        : DEFAULT_PROBE_TIMEOUT_MS;
    const pending = new Map();

    function verify(req) {
        const challenge = readHeader(req, LOOPBACK_PROBE_HEADER);
        const expected = challenge ? pending.get(challenge) : null;
        if (!expected) {
            return { statusCode: 404, body: { ok: false, error: 'Loopback probe not found' } };
        }
        pending.delete(challenge);
        const owner = getRequestOwner(req);
        if (!owner) {
            return { statusCode: 403, body: { ok: false, error: 'Authenticated user profile is required' } };
        }
        return {
            statusCode: 200,
            body: {
                ok: true,
                challenge,
                ownerMatches: owner === expected.owner,
                forwarded: {
                    cookie: matchesFingerprint(expected.headers.cookie, readHeader(req, 'cookie')),
                    csrfToken: matchesFingerprint(expected.headers.csrfToken, readHeader(req, 'x-csrf-token')),
                    basicAuth: matchesFingerprint(expected.headers.basicAuth, readBasicAuthorization(req)),
                },
            },
        };
    }

    async function probe(req) {
        const owner = getRequestOwner(req);
        if (!owner) {
            throw new LoopbackProbeError(
                'authenticated_profile_required',
                'Authenticated user profile is required.',
            );
        }
        const target = resolveLoopbackTarget(req);
        const challenge = crypto.randomBytes(24).toString('base64url');
        const headers = createHeaderExpectations(req);
        pending.set(challenge, { owner, headers });

        let response;
        try {
            response = await requestLoopbackJson(target, req, challenge, timeoutMs);
        } catch (error) {
            throw normalizeTransportError(error);
        } finally {
            pending.delete(challenge);
        }

        if (response.statusCode === 401) {
            throw new LoopbackProbeError(
                'loopback_basic_auth_failed',
                'The loopback request did not pass SillyTavern Basic Auth.',
            );
        }
        if (response.statusCode === 403) {
            throw new LoopbackProbeError(
                'loopback_session_or_csrf_failed',
                'The loopback request did not pass SillyTavern session or CSRF validation.',
            );
        }
        if (response.statusCode !== 200 || response.body?.ok !== true
            || response.body?.challenge !== challenge) {
            throw new LoopbackProbeError(
                'loopback_invalid_response',
                'The SillyTavern loopback probe returned an invalid response.',
                { statusCode: response.statusCode },
            );
        }
        if (response.body.ownerMatches !== true) {
            throw new LoopbackProbeError(
                'loopback_identity_mismatch',
                'The outer and loopback SillyTavern users do not match.',
            );
        }
        const failedHeaders = ['cookie', 'csrfToken', 'basicAuth']
            .filter(name => response.body.forwarded?.[name] !== true);
        if (failedHeaders.length > 0) {
            throw new LoopbackProbeError(
                'loopback_credentials_mismatch',
                'The loopback request did not preserve its authentication credentials.',
                { failedHeaders },
            );
        }

        return {
            ok: true,
            transport: {
                protocol: target.protocol.slice(0, -1),
                addressFamily: target.addressFamily === 6 ? 'IPv6' : 'IPv4',
            },
            authentication: {
                cookie: describeCredential(headers.cookie),
                csrfToken: describeCredential(headers.csrfToken),
                basicAuth: describeCredential(headers.basicAuth),
            },
        };
    }

    return Object.freeze({ probe, verify });
}

function registerLoopbackProbeRoutes(router, options = {}) {
    const service = options.service || createLoopbackProbeService(options);
    router.post(LOOPBACK_VERIFY_PATH, (req, res) => {
        res.setHeader('Cache-Control', 'no-store');
        const result = service.verify(req);
        return res.status(result.statusCode).send(result.body);
    });
    router.post(LOOPBACK_PROBE_PATH, async (req, res) => {
        res.setHeader('Cache-Control', 'no-store');
        if (!getRequestOwner(req)) {
            return res.status(403).send({ ok: false, error: 'Authenticated user profile is required' });
        }
        try {
            const result = await service.probe(req);
            return res.status(200).send(result);
        } catch (error) {
            const failure = normalizeTransportError(error);
            return res.status(503).send({
                ok: false,
                code: failure.code,
                error: failure.message,
                ...(failure.details ? { details: failure.details } : {}),
            });
        }
    });
    return service;
}

module.exports = {
    LOOPBACK_PROBE_PATH,
    LOOPBACK_VERIFY_PATH,
    createLoopbackProbeService,
    registerLoopbackProbeRoutes,
    resolveLoopbackTarget,
};
