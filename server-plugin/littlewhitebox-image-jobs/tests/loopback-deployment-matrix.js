'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const fsPromises = require('node:fs/promises');
const http = require('node:http');
const https = require('node:https');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const PLUGIN_ID = 'littlewhitebox-image-jobs';
const REQUIRED_SILLYTAVERN_VERSION = '1.18.0';
const PROBE_PATH = `/api/plugins/${PLUGIN_ID}/v1/draw-runs/probe`;
const STATUS_PATH = `/api/plugins/${PLUGIN_ID}/status`;
const START_TIMEOUT_MS = 60_000;
const REQUEST_TIMEOUT_MS = 10_000;
const BASIC_AUTH = `Basic ${Buffer.from('probe-user:probe-password').toString('base64')}`;
const pluginRoot = path.resolve(__dirname, '..');
const defaultSillyTavernRoot = path.resolve(pluginRoot, '..', '..', '..', '..', '..', '..', '..');
const sillyTavernRoot = path.resolve(process.argv[2] || defaultSillyTavernRoot);
const certificatePath = path.join(__dirname, 'fixtures', 'loopback-test-cert.pem');
const privateKeyPath = path.join(__dirname, 'fixtures', 'loopback-test-key.pem');
const activeChildren = new Set();
const activeServers = new Set();
const temporaryLinks = [];
let activeTempRoot = null;
let cleanupPromise = null;

class CookieJar {
    constructor() {
        this.cookies = new Map();
    }

    update(setCookie) {
        for (const entry of Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : []) {
            const pair = entry.split(';', 1)[0];
            const separator = pair.indexOf('=');
            if (separator > 0) this.cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
        }
    }

    header() {
        return [...this.cookies].map(([name, value]) => `${name}=${value}`).join('; ');
    }
}

function yamlString(value) {
    return JSON.stringify(String(value).replaceAll('\\', '/'));
}

function buildConfig({ dataRoot, port, ipv6 = false, tls = false, basicAuth = false, bindAddress = null }) {
    return [
        `dataRoot: ${yamlString(dataRoot)}`,
        `listen: ${basicAuth || bindAddress ? 'true' : 'false'}`,
        'listenAddress:',
        `  ipv4: ${bindAddress || '127.0.0.1'}`,
        '  ipv6: "[::]"',
        'protocol:',
        `  ipv4: ${ipv6 ? 'false' : 'true'}`,
        `  ipv6: ${ipv6 ? 'true' : 'false'}`,
        `port: ${port}`,
        'browserLaunch:',
        '  enabled: false',
        'ssl:',
        `  enabled: ${tls ? 'true' : 'false'}`,
        `  certPath: ${yamlString(certificatePath)}`,
        `  keyPath: ${yamlString(privateKeyPath)}`,
        'whitelistMode: true',
        'whitelist:',
        '  - ::1',
        '  - 127.0.0.1',
        `basicAuthMode: ${basicAuth ? 'true' : 'false'}`,
        'basicAuthUser:',
        '  username: probe-user',
        '  password: probe-password',
        'enableUserAccounts: true',
        'enableServerPlugins: true',
        'enableServerPluginsAutoUpdate: false',
        'skipContentCheck: true',
        'extensions:',
        '  enabled: false',
        'logging:',
        '  enableAccessLog: false',
        '',
    ].join('\n');
}

async function getFreePort(host) {
    const server = net.createServer();
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen({ host, port: 0, ipv6Only: host === '::1' }, resolve);
    });
    const address = server.address();
    await new Promise(resolve => server.close(resolve));
    return address.port;
}

async function getSharedFreePort(hosts) {
    const servers = [];
    let port = 0;
    try {
        for (const host of hosts) {
            const server = net.createServer();
            await new Promise((resolve, reject) => {
                server.once('error', reject);
                server.listen({ host, port }, resolve);
            });
            servers.push(server);
            port = server.address().port;
        }
        return port;
    } finally {
        await Promise.all(servers.map(server => new Promise(resolve => server.close(resolve))));
    }
}

function request(endpoint, options = {}) {
    const body = options.body === undefined
        ? null
        : Buffer.from(JSON.stringify(options.body));
    const headers = {
        Accept: 'application/json',
        ...(body ? {
            'Content-Type': 'application/json',
            'Content-Length': body.length,
        } : {}),
        ...options.headers,
    };
    const transport = endpoint.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
        let settled = false;
        let timeoutId = null;
        const settle = (callback, value) => {
            if (settled) return;
            settled = true;
            if (timeoutId !== null) clearTimeout(timeoutId);
            callback(value);
        };
        const req = transport.request({
            protocol: endpoint.protocol,
            hostname: endpoint.hostname,
            port: endpoint.port,
            path: options.path || '/',
            method: options.method || 'GET',
            headers,
            rejectUnauthorized: false,
            servername: 'localhost',
        }, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const text = Buffer.concat(chunks).toString('utf8');
                let json = null;
                try {
                    json = JSON.parse(text);
                } catch {
                    // Startup and authentication failures may return HTML or an empty body.
                }
                settle(resolve, { status: res.statusCode || 0, headers: res.headers, json, text });
            });
            res.once('error', error => settle(reject, error));
        });
        timeoutId = setTimeout(() => req.destroy(new Error('Request timed out')), REQUEST_TIMEOUT_MS);
        timeoutId.unref?.();
        req.once('error', error => settle(reject, error));
        req.end(body);
    });
}

function sessionHeaders(session, extra = {}) {
    return {
        ...(session.authorization ? { Authorization: session.authorization } : {}),
        ...(session.jar.header() ? { Cookie: session.jar.header() } : {}),
        ...(session.csrfToken ? { 'X-CSRF-Token': session.csrfToken } : {}),
        ...extra,
    };
}

async function openSession(endpoint, { authorization = null, handle = 'default-user', password = '' } = {}) {
    const jar = new CookieJar();
    const authHeaders = authorization ? { Authorization: authorization } : {};
    const csrfResponse = await request(endpoint, { path: '/csrf-token', headers: authHeaders });
    assert.equal(csrfResponse.status, 200, `CSRF bootstrap failed: ${csrfResponse.status} ${csrfResponse.text}`);
    assert.equal(typeof csrfResponse.json?.token, 'string');
    jar.update(csrfResponse.headers['set-cookie']);

    const session = { authorization, jar, csrfToken: csrfResponse.json.token };
    const loginResponse = await request(endpoint, {
        method: 'POST',
        path: '/api/users/login',
        headers: sessionHeaders(session),
        body: { handle, password },
    });
    assert.equal(loginResponse.status, 200, `Login failed: ${loginResponse.status} ${loginResponse.text}`);
    jar.update(loginResponse.headers['set-cookie']);

    const meResponse = await request(endpoint, {
        path: '/api/users/me',
        headers: sessionHeaders(session),
    });
    assert.equal(meResponse.status, 200, `Session check failed: ${meResponse.status} ${meResponse.text}`);
    assert.equal(meResponse.json?.handle, handle);
    return session;
}

async function postJson(endpoint, pathName, session, body = {}) {
    const response = await request(endpoint, {
        method: 'POST',
        path: pathName,
        headers: sessionHeaders(session),
        body,
    });
    session.jar.update(response.headers['set-cookie']);
    return response;
}

async function assertPluginLoaded(endpoint, authorization) {
    const response = await request(endpoint, {
        path: STATUS_PATH,
        headers: authorization ? { Authorization: authorization } : {},
    });
    assert.equal(response.status, 403, 'The plugin route must be behind SillyTavern login');
}

async function probe(endpoint, session, expected) {
    const response = await postJson(endpoint, PROBE_PATH, session);
    assert.equal(response.status, 200, `Probe failed: ${response.status} ${response.text}`);
    assert.deepEqual(response.json, {
        ok: true,
        transport: {
            protocol: expected.protocol,
            addressFamily: expected.addressFamily,
        },
        authentication: {
            cookie: 'verified',
            csrfToken: 'verified',
            basicAuth: expected.basicAuth ? 'verified' : 'not-present',
        },
    });
    return response.json;
}

async function createSecondUser(endpoint, adminSession) {
    const response = await postJson(endpoint, '/api/users/create', adminSession, {
        handle: 'probe-second-user',
        name: 'Probe Second User',
        password: 'second-user-password',
    });
    assert.equal(response.status, 200, `User creation failed: ${response.status} ${response.text}`);
    assert.equal(response.json?.handle, 'probe-second-user');
}

async function waitForServer(endpoint, authorization, child, output, getSpawnError) {
    const deadline = Date.now() + START_TIMEOUT_MS;
    while (Date.now() < deadline) {
        if (getSpawnError()) throw getSpawnError();
        if (child.exitCode !== null || child.signalCode !== null) {
            throw new Error(`SillyTavern exited during startup (${child.exitCode ?? child.signalCode}).\n${output()}`);
        }
        try {
            const response = await request(endpoint, {
                path: '/csrf-token',
                headers: authorization ? { Authorization: authorization } : {},
            });
            if (response.status === 200) return;
        } catch {
            // The listening socket is not ready yet.
        }
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    throw new Error(`Timed out waiting for SillyTavern.\n${output()}`);
}

async function waitForChildExit(exited, timeoutMs) {
    let timeoutId = null;
    try {
        return await Promise.race([
            exited,
            new Promise((resolve) => {
                timeoutId = setTimeout(resolve, timeoutMs, false);
                timeoutId.unref?.();
            }),
        ]);
    } finally {
        if (timeoutId !== null) clearTimeout(timeoutId);
    }
}

async function stopChild(child) {
    if (child.exitCode !== null || child.signalCode !== null) {
        activeChildren.delete(child);
        return;
    }
    if (!child.pid) {
        activeChildren.delete(child);
        return;
    }
    const exited = new Promise(resolve => child.once('exit', () => resolve(true)));
    child.kill('SIGTERM');
    let didExit = await waitForChildExit(exited, 5_000);
    if (!didExit) {
        child.kill('SIGKILL');
        didExit = await waitForChildExit(exited, 5_000);
    }
    if (!didExit) throw new Error(`SillyTavern child process ${child.pid} did not exit`);
}

async function startSillyTavern(sandboxRoot, tempRoot, name, options) {
    const instanceRoot = path.join(tempRoot, name);
    const dataRoot = path.join(instanceRoot, 'data');
    const configPath = path.join(instanceRoot, 'config.yaml');
    const host = options.ipv6 ? '::1' : options.bindAddress || '127.0.0.1';
    const port = options.port || await getFreePort(host);
    await fsPromises.mkdir(instanceRoot, { recursive: true });
    await fsPromises.writeFile(configPath, buildConfig({ ...options, dataRoot, port }), 'utf8');

    const child = spawn(process.execPath, [
        path.join(sandboxRoot, 'server.js'),
        '--configPath', configPath,
        '--dataRoot', dataRoot,
        '--browserLaunchEnabled', 'false',
    ], {
        cwd: sandboxRoot,
        env: { ...process.env, NODE_ENV: 'production' },
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
    });
    activeChildren.add(child);
    child.once('exit', () => activeChildren.delete(child));
    let spawnError = null;
    child.once('error', (error) => {
        spawnError = error;
    });
    let logs = '';
    const appendLog = (chunk) => {
        logs = `${logs}${chunk}`.slice(-64 * 1024);
    };
    child.stdout.on('data', appendLog);
    child.stderr.on('data', appendLog);

    const endpointHost = options.ipv6 ? '[::1]' : host;
    const endpoint = new URL(`${options.tls ? 'https' : 'http'}://${endpointHost}:${port}`);
    const authorization = options.basicAuth ? BASIC_AUTH : null;
    try {
        await waitForServer(endpoint, authorization, child, () => logs, () => spawnError);
        if (options.basicAuth) {
            const unauthorized = await request(endpoint, { path: '/csrf-token' });
            assert.equal(unauthorized.status, 401, 'SillyTavern Basic Auth must reject missing credentials');
        }
        await assertPluginLoaded(endpoint, authorization);
    } catch (error) {
        await stopChild(child);
        throw error;
    }
    return { child, endpoint, authorization, logs: () => logs };
}

async function withSillyTavern(sandboxRoot, tempRoot, name, options, callback) {
    const instance = await startSillyTavern(sandboxRoot, tempRoot, name, options);
    try {
        return await callback(instance);
    } catch (error) {
        error.message = `${error.message}\nSillyTavern output:\n${instance.logs()}`;
        throw error;
    } finally {
        await stopChild(instance.child);
    }
}

async function startTlsReverseProxy(targetEndpoint) {
    const port = await getFreePort('127.0.0.1');
    const server = https.createServer({
        cert: fs.readFileSync(certificatePath),
        key: fs.readFileSync(privateKeyPath),
    }, (incoming, outgoing) => {
        const headers = { ...incoming.headers, 'x-forwarded-proto': 'https' };
        const upstream = http.request({
            hostname: targetEndpoint.hostname,
            port: targetEndpoint.port,
            method: incoming.method,
            path: incoming.url,
            headers,
        }, (response) => {
            outgoing.writeHead(response.statusCode || 500, response.headers);
            response.pipe(outgoing);
        });
        upstream.once('error', (error) => {
            outgoing.statusCode = 502;
            outgoing.end(error.message);
        });
        incoming.pipe(upstream);
    });
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, '127.0.0.1', resolve);
    });
    activeServers.add(server);
    let closed = false;
    return {
        endpoint: new URL(`https://127.0.0.1:${port}`),
        close: async () => {
            if (closed) return;
            closed = true;
            activeServers.delete(server);
            await closeServer(server);
        },
    };
}

async function startCredentialBait(port) {
    const requests = [];
    const server = http.createServer((incoming, outgoing) => {
        requests.push({ ...incoming.headers });
        incoming.resume();
        outgoing.writeHead(418);
        outgoing.end();
    });
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, '127.0.0.1', resolve);
    });
    activeServers.add(server);
    let closed = false;
    return {
        requests,
        close: async () => {
            if (closed) return;
            closed = true;
            activeServers.delete(server);
            await closeServer(server);
        },
    };
}

async function createTemporaryLink(target, linkPath) {
    await fsPromises.symlink(target, linkPath, process.platform === 'win32' ? 'junction' : 'dir');
    temporaryLinks.push(linkPath);
}

async function removeTemporaryLink(linkPath) {
    try {
        await fsPromises.unlink(linkPath);
    } catch (error) {
        if (error?.code === 'ENOENT') return;
        if (!['EISDIR', 'EPERM'].includes(error?.code)) throw error;
        await fsPromises.rmdir(linkPath);
    }
}

async function prepareSillyTavernSandbox(tempRoot) {
    assert.equal(fs.existsSync(path.join(sillyTavernRoot, 'server.js')), true, `SillyTavern not found: ${sillyTavernRoot}`);
    assert.equal(fs.existsSync(path.join(sillyTavernRoot, 'node_modules')), true, `SillyTavern dependencies not found: ${sillyTavernRoot}`);
    const packageJson = JSON.parse(await fsPromises.readFile(path.join(sillyTavernRoot, 'package.json'), 'utf8'));
    assert.equal(
        packageJson.version,
        REQUIRED_SILLYTAVERN_VERSION,
        `Expected SillyTavern ${REQUIRED_SILLYTAVERN_VERSION}, received ${packageJson.version}`,
    );

    const sandboxRoot = path.join(tempRoot, 'sillytavern');
    await fsPromises.mkdir(sandboxRoot, { recursive: true });
    await Promise.all([
        fsPromises.cp(path.join(sillyTavernRoot, 'src'), path.join(sandboxRoot, 'src'), { recursive: true }),
        fsPromises.cp(path.join(sillyTavernRoot, 'default'), path.join(sandboxRoot, 'default'), { recursive: true }),
        fsPromises.copyFile(path.join(sillyTavernRoot, 'server.js'), path.join(sandboxRoot, 'server.js')),
        fsPromises.copyFile(path.join(sillyTavernRoot, 'package.json'), path.join(sandboxRoot, 'package.json')),
        fsPromises.copyFile(path.join(sillyTavernRoot, 'webpack.config.js'), path.join(sandboxRoot, 'webpack.config.js')),
        fsPromises.mkdir(path.join(sandboxRoot, 'public'), { recursive: true }),
        fsPromises.mkdir(path.join(sandboxRoot, 'plugins'), { recursive: true }),
    ]);
    await createTemporaryLink(path.join(sillyTavernRoot, 'node_modules'), path.join(sandboxRoot, 'node_modules'));
    await createTemporaryLink(pluginRoot, path.join(sandboxRoot, 'plugins', PLUGIN_ID));
    return sandboxRoot;
}

function closeServer(server) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            server.closeAllConnections?.();
            reject(new Error('Reverse proxy did not close within 5 seconds'));
        }, 5_000);
        timeoutId.unref?.();
        server.close((error) => {
            clearTimeout(timeoutId);
            if (error && error.code !== 'ERR_SERVER_NOT_RUNNING') reject(error);
            else resolve();
        });
        server.closeAllConnections?.();
    });
}

async function cleanupResources() {
    if (cleanupPromise) return cleanupPromise;
    cleanupPromise = (async () => {
        await Promise.allSettled([...activeServers].map(server => closeServer(server)));
        activeServers.clear();
        const childResults = await Promise.allSettled([...activeChildren].map(child => stopChild(child)));
        const childFailure = childResults.find(result => result.status === 'rejected');
        if (childFailure) throw childFailure.reason;
        for (const linkPath of temporaryLinks.reverse()) {
            await removeTemporaryLink(linkPath);
        }
        temporaryLinks.length = 0;
        if (activeTempRoot) {
            await fsPromises.rm(activeTempRoot, { recursive: true, force: true });
            activeTempRoot = null;
        }
    })();
    return cleanupPromise;
}

for (const [signal, exitCode] of [['SIGINT', 130], ['SIGTERM', 143]]) {
    process.once(signal, () => {
        void cleanupResources().finally(() => process.exit(exitCode));
    });
}

async function main() {
    activeTempRoot = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'lwb-loopback-matrix-'));
    try {
        const sandboxRoot = await prepareSillyTavernSandbox(activeTempRoot);
        const results = [];
        await withSillyTavern(sandboxRoot, activeTempRoot, 'http-ipv4', {}, async ({ endpoint }) => {
            const first = await openSession(endpoint);
            await createSecondUser(endpoint, first);
            const second = await openSession(endpoint, {
                handle: 'probe-second-user',
                password: 'second-user-password',
            });
            const probes = await Promise.all([
                probe(endpoint, first, { protocol: 'http', addressFamily: 'IPv4', basicAuth: false }),
                probe(endpoint, second, { protocol: 'http', addressFamily: 'IPv4', basicAuth: false }),
            ]);
            results.push({ case: 'HTTP IPv4 + two concurrent sessions + CSRF', ok: probes.every(value => value.ok) });
        });

        await withSillyTavern(sandboxRoot, activeTempRoot, 'https-ipv4-basic', { tls: true, basicAuth: true }, async ({ endpoint, authorization }) => {
            const session = await openSession(endpoint, { authorization });
            const result = await probe(endpoint, session, { protocol: 'https', addressFamily: 'IPv4', basicAuth: true });
            results.push({ case: 'native HTTPS IPv4 + Basic Auth', ok: result.ok });
        });

        const explicitBindPort = await getSharedFreePort(['127.0.0.1', '127.0.0.2']);
        await withSillyTavern(sandboxRoot, activeTempRoot, 'explicit-ipv4-bind', {
            basicAuth: true,
            bindAddress: '127.0.0.2',
            port: explicitBindPort,
        }, async ({ endpoint, authorization }) => {
            const bait = await startCredentialBait(explicitBindPort);
            try {
                const session = await openSession(endpoint, { authorization });
                const result = await probe(endpoint, session, { protocol: 'http', addressFamily: 'IPv4', basicAuth: true });
                assert.equal(bait.requests.length, 0, 'The 127.0.0.1 bait must receive no request or credentials');
                results.push({ case: 'explicit 127.0.0.2 bind + same-port 127.0.0.1 credential bait', ok: result.ok });
            } finally {
                await bait.close();
            }
        });

        await withSillyTavern(sandboxRoot, activeTempRoot, 'http-ipv6', { ipv6: true }, async ({ endpoint }) => {
            const session = await openSession(endpoint);
            const result = await probe(endpoint, session, { protocol: 'http', addressFamily: 'IPv6', basicAuth: false });
            results.push({ case: 'HTTP IPv6 + session + CSRF', ok: result.ok });
        });

        await withSillyTavern(sandboxRoot, activeTempRoot, 'reverse-proxy', { basicAuth: true }, async ({ endpoint, authorization }) => {
            const proxy = await startTlsReverseProxy(endpoint);
            try {
                const session = await openSession(proxy.endpoint, { authorization });
                const result = await probe(proxy.endpoint, session, { protocol: 'http', addressFamily: 'IPv4', basicAuth: true });
                results.push({ case: 'HTTPS reverse proxy -> HTTP SillyTavern + Basic Auth', ok: result.ok });
            } finally {
                await proxy.close();
            }
        });

        console.table(results);
        assert.equal(results.length, 5);
        assert.equal(results.every(result => result.ok), true);
    } finally {
        await cleanupResources();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
