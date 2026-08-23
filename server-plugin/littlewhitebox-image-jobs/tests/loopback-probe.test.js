'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const net = require('node:net');
const path = require('node:path');
const { test } = require('node:test');

const {
    LOOPBACK_PROBE_PATH,
    LOOPBACK_VERIFY_PATH,
    createLoopbackProbeService,
    registerLoopbackProbeRoutes,
    resolveLoopbackTarget,
} = require('../draw-runs/loopback-probe.js');

const LOOPBACK_VERIFY_REQUEST_PATH = `/api/plugins/littlewhitebox-image-jobs${LOOPBACK_VERIFY_PATH}`;
const TEST_CERT = fs.readFileSync(path.join(__dirname, 'fixtures', 'loopback-test-cert.pem'));
const TEST_KEY = fs.readFileSync(path.join(__dirname, 'fixtures', 'loopback-test-key.pem'));

function sendJson(response, statusCode, body) {
    response.writeHead(statusCode, {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json',
    });
    response.end(JSON.stringify(body));
}

function parseSessionOwner(request) {
    const match = /(?:^|;\s*)session=([^;]+)/.exec(String(request.headers.cookie || ''));
    return match ? decodeURIComponent(match[1]) : null;
}

function basicAuthorization(owner) {
    return `Basic ${Buffer.from(`${owner}:secret`).toString('base64')}`;
}

function createOuterRequest({ owner, port, encrypted = false, address = '127.0.0.1', boundAddress = address }) {
    return {
        protocol: encrypted ? 'http' : 'https',
        headers: {
            host: 'tavern.example.test',
            cookie: `session=${owner}`,
            'x-csrf-token': `csrf-${owner}`,
            authorization: basicAuthorization(owner),
        },
        socket: {
            encrypted,
            localAddress: address,
            localPort: port,
            server: {
                address: () => ({
                    address: boundAddress,
                    family: net.isIP(boundAddress) === 6 ? 'IPv6' : 'IPv4',
                    port,
                }),
            },
        },
        user: { profile: { handle: owner } },
    };
}

async function listen(server, host, port = 0) {
    await new Promise((resolve, reject) => {
        const onError = (error) => {
            server.off('listening', onListening);
            reject(error);
        };
        const onListening = () => {
            server.off('error', onError);
            resolve();
        };
        server.once('error', onError);
        server.once('listening', onListening);
        server.listen({ host, port, ipv6Only: host === '::1' });
    });
    return server.address().port;
}

function closeServer(server) {
    return new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
}

async function createProbeServer(t, service, options = {}) {
    const observed = [];
    const replayStatuses = [];
    const handler = async (request, response) => {
        request.resume();
        await new Promise(resolve => request.once('end', resolve));
        if (request.method !== 'POST' || request.url !== LOOPBACK_VERIFY_REQUEST_PATH) {
            sendJson(response, 404, { ok: false });
            return;
        }

        const sessionOwner = parseSessionOwner(request);
        observed.push({
            owner: sessionOwner,
            host: request.headers.host,
            csrfToken: request.headers['x-csrf-token'],
            authorization: request.headers.authorization,
        });
        if (options.requireCredentials !== false) {
            if (request.headers.authorization !== basicAuthorization(sessionOwner)) {
                sendJson(response, 401, { ok: false });
                return;
            }
            if (request.headers['x-csrf-token'] !== `csrf-${sessionOwner}`) {
                sendJson(response, 403, { ok: false });
                return;
            }
        }
        if (typeof options.delay === 'function') {
            await new Promise(resolve => setTimeout(resolve, options.delay(sessionOwner)));
        }
        const innerOwner = typeof options.resolveOwner === 'function'
            ? options.resolveOwner(sessionOwner)
            : sessionOwner;
        request.user = innerOwner ? { profile: { handle: innerOwner } } : undefined;
        const result = service.verify(request);
        if (options.verifyChallengeIsOneTime) {
            replayStatuses.push(service.verify(request).statusCode);
        }
        sendJson(response, result.statusCode, result.body);
    };
    const server = options.encrypted
        ? https.createServer({ cert: TEST_CERT, key: TEST_KEY }, handler)
        : http.createServer(handler);
    const host = options.host || '127.0.0.1';
    const port = await listen(server, host);
    t.after(() => closeServer(server));
    return { observed, port, replayStatuses };
}

test('loopback target follows the actual socket instead of proxy protocol metadata', () => {
    assert.deepEqual(resolveLoopbackTarget({
        protocol: 'https',
        socket: {
            encrypted: false,
            localAddress: '127.0.0.2',
            localPort: 9000,
            server: { address: () => ({ address: '0.0.0.0', family: 'IPv4', port: 8000 }) },
        },
    }), {
        protocol: 'http:',
        hostname: '127.0.0.1',
        port: 8000,
        addressFamily: 4,
    });
    assert.deepEqual(resolveLoopbackTarget({
        protocol: 'http',
        socket: {
            encrypted: true,
            localAddress: '::1',
            localPort: 9443,
            server: { address: () => ({ address: '::', family: 'IPv6', port: 8443 }) },
        },
    }), {
        protocol: 'https:',
        hostname: '::1',
        port: 8443,
        addressFamily: 6,
    });
    assert.deepEqual(resolveLoopbackTarget({
        socket: {
            localAddress: '127.0.0.1',
            localPort: 8000,
            server: { address: () => ({ address: '127.0.0.2', family: 'IPv4', port: 8123 }) },
        },
    }), {
        protocol: 'http:',
        hostname: '127.0.0.2',
        port: 8123,
        addressFamily: 4,
    });
    assert.throws(
        () => resolveLoopbackTarget({
            socket: { localAddress: '127.0.0.1', localPort: 8000 },
        }),
        error => error?.code === 'loopback_socket_unavailable',
    );
});

test('an explicitly bound address cannot leak credentials to a loopback process on the same port', async (t) => {
    const service = createLoopbackProbeService();
    let target;
    try {
        target = await createProbeServer(t, service, { host: '127.0.0.2' });
    } catch (error) {
        if (error?.code === 'EADDRNOTAVAIL') {
            t.skip('127.0.0.2 is unavailable');
            return;
        }
        throw error;
    }
    const baitRequests = [];
    const bait = http.createServer((request, response) => {
        baitRequests.push({ ...request.headers });
        request.resume();
        response.writeHead(418);
        response.end();
    });
    await listen(bait, '127.0.0.1', target.port);
    t.after(() => closeServer(bait));

    const result = await service.probe(createOuterRequest({
        owner: 'alice',
        port: target.port,
        address: '127.0.0.2',
        boundAddress: '127.0.0.2',
    }));

    assert.equal(result.ok, true);
    assert.equal(baitRequests.length, 0);
    assert.equal(target.observed.length, 1);
});

test('HTTP IPv4 probe preserves Cookie, CSRF, Basic Auth, and Host', async (t) => {
    const service = createLoopbackProbeService();
    const { observed, port } = await createProbeServer(t, service);
    const result = await service.probe(createOuterRequest({ owner: 'alice', port }));

    assert.deepEqual(result, {
        ok: true,
        transport: {
            protocol: 'http',
            addressFamily: 'IPv4',
        },
        authentication: {
            cookie: 'verified',
            csrfToken: 'verified',
            basicAuth: 'verified',
        },
    });
    assert.deepEqual(observed, [{
        owner: 'alice',
        host: 'tavern.example.test',
        csrfToken: 'csrf-alice',
        authorization: basicAuthorization('alice'),
    }]);
});

test('native HTTPS probe accepts the same server self-signed certificate', async (t) => {
    const service = createLoopbackProbeService();
    const { port } = await createProbeServer(t, service, { encrypted: true });
    const result = await service.probe(createOuterRequest({ owner: 'alice', port, encrypted: true }));

    assert.equal(result.transport.protocol, 'https');
    assert.equal(result.transport.addressFamily, 'IPv4');
    assert.equal(result.authentication.cookie, 'verified');
});

test('HTTP IPv6 probe uses the IPv6 loopback address when available', async (t) => {
    const service = createLoopbackProbeService();
    let server;
    try {
        server = await createProbeServer(t, service, { host: '::1' });
    } catch (error) {
        if (['EADDRNOTAVAIL', 'EAFNOSUPPORT'].includes(error?.code)) {
            t.skip(`IPv6 loopback is unavailable: ${error.code}`);
            return;
        }
        throw error;
    }
    const result = await service.probe(createOuterRequest({
        owner: 'alice',
        port: server.port,
        address: '::1',
    }));

    assert.equal(result.transport.addressFamily, 'IPv6');
});

test('concurrent probes keep per-user credentials and identity isolated', async (t) => {
    const service = createLoopbackProbeService();
    const { observed, port } = await createProbeServer(t, service, {
        delay: owner => owner === 'alice' ? 20 : 0,
    });

    const [alice, bob] = await Promise.all([
        service.probe(createOuterRequest({ owner: 'alice', port })),
        service.probe(createOuterRequest({ owner: 'bob', port })),
    ]);

    assert.equal(alice.ok, true);
    assert.equal(bob.ok, true);
    assert.deepEqual(new Set(observed.map(request => request.owner)), new Set(['alice', 'bob']));
    assert.ok(observed.every(request => (
        request.csrfToken === `csrf-${request.owner}`
        && request.authorization === basicAuthorization(request.owner)
    )));
});

test('the internal verification challenge can be consumed only once', async (t) => {
    const service = createLoopbackProbeService();
    const { port, replayStatuses } = await createProbeServer(t, service, {
        verifyChallengeIsOneTime: true,
    });

    const result = await service.probe(createOuterRequest({ owner: 'alice', port }));

    assert.equal(result.ok, true);
    assert.deepEqual(replayStatuses, [404]);
});

test('non-Basic and malformed Authorization values are not forwarded', async (t) => {
    const service = createLoopbackProbeService();
    const { observed, port } = await createProbeServer(t, service, {
        requireCredentials: false,
    });
    const bearerRequest = createOuterRequest({ owner: 'alice', port });
    bearerRequest.headers.authorization = 'Bearer private-token';
    const malformedBasicRequest = createOuterRequest({ owner: 'bob', port });
    malformedBasicRequest.headers.authorization = 'Basic credentials extra-secret';

    const [bearer, malformedBasic] = await Promise.all([
        service.probe(bearerRequest),
        service.probe(malformedBasicRequest),
    ]);

    assert.equal(bearer.authentication.basicAuth, 'not-present');
    assert.equal(malformedBasic.authentication.basicAuth, 'not-present');
    assert.ok(observed.every(request => request.authorization === undefined));
});

test('probe timeout is a total deadline even when the response keeps sending bytes', async (t) => {
    const service = createLoopbackProbeService({ timeoutMs: 30 });
    const server = http.createServer((request, response) => {
        request.resume();
        response.writeHead(200, { 'Content-Type': 'application/json' });
        const interval = setInterval(() => response.write(' '), 5);
        response.on('close', () => clearInterval(interval));
    });
    const port = await listen(server, '127.0.0.1');
    t.after(() => closeServer(server));

    await assert.rejects(
        () => service.probe(createOuterRequest({ owner: 'alice', port })),
        error => error?.code === 'loopback_timeout',
    );
});

test('probe rejects a loopback identity mismatch', async (t) => {
    const service = createLoopbackProbeService();
    const { port } = await createProbeServer(t, service, {
        resolveOwner: () => 'bob',
    });

    await assert.rejects(
        () => service.probe(createOuterRequest({ owner: 'alice', port })),
        error => error?.code === 'loopback_identity_mismatch',
    );
});

test('probe routes expose only authenticated outer diagnostics and challenged verification', async () => {
    const routes = new Map();
    const router = {
        post(routePath, handler) {
            routes.set(routePath, handler);
        },
    };
    const service = {
        async probe(req) {
            return { ok: true, transport: { protocol: 'http', addressFamily: 'IPv4' } };
        },
        verify() {
            return { statusCode: 404, body: { ok: false } };
        },
    };
    registerLoopbackProbeRoutes(router, { service });
    const invoke = async (routePath, user) => {
        const response = {
            statusCode: 200,
            headers: {},
            status(code) { this.statusCode = code; return this; },
            setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
            send(body) { this.body = body; return this; },
        };
        await routes.get(routePath)({ user }, response);
        return response;
    };

    const anonymous = await invoke(LOOPBACK_PROBE_PATH, undefined);
    assert.equal(anonymous.statusCode, 403);
    const authenticated = await invoke(LOOPBACK_PROBE_PATH, { profile: { handle: 'alice' } });
    assert.equal(authenticated.statusCode, 200);
    assert.equal(authenticated.body.ok, true);
    const unchallenged = await invoke(LOOPBACK_VERIFY_PATH, { profile: { handle: 'alice' } });
    assert.equal(unchallenged.statusCode, 404);
    assert.equal(unchallenged.headers['cache-control'], 'no-store');
});
