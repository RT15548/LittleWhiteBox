import assert from 'node:assert/strict';
import test from 'node:test';

import { createSillyTavernFileStorage } from '../storage/sillytavern-file-storage.js';

function envelope(commitId = 'commit_1', revision = 0) {
    return {
        formatVersion: 1,
        osId: 'os_1',
        binding: { kind: 'character', ownerLocator: 'avatar.png', chatId: 'chat-a' },
        revision,
        commitId,
        partitions: { opaque: { keep: true } },
    };
}

function response(status, body = '') {
    return {
        ok: status >= 200 && status < 300,
        status,
        text: async () => body,
    };
}

function decodeUpload(options) {
    const body = JSON.parse(options.body);
    const bytes = Uint8Array.from(atob(body.data), char => char.charCodeAt(0));
    return { body, candidate: JSON.parse(new TextDecoder().decode(bytes)) };
}

test('SillyTavern storage reads with no-store and preserves opaque partitions', async () => {
    const requests = [];
    const storage = createSillyTavernFileStorage({
        nonce: () => 'unique',
        getRequestHeaders: () => ({ 'X-Test': 'yes' }),
        fetch: async (url, options) => {
            requests.push({ url, options });
            return response(200, JSON.stringify(envelope()));
        },
    });

    assert.deepEqual(await storage.read('os_1'), envelope());
    assert.match(requests[0].url, /^\/user\/files\/LittleWhiteBox_OS_os_1\.json\?v=unique$/);
    assert.equal(requests[0].options.cache, 'no-store');
    assert.equal(requests[0].options.headers['Cache-Control'], 'no-store');
});

test('SillyTavern storage distinguishes missing, invalid JSON and invalid envelope', async () => {
    const missing = createSillyTavernFileStorage({ fetch: async () => response(404) });
    assert.equal(await missing.read('os_1'), null);

    const invalidJson = createSillyTavernFileStorage({ fetch: async () => response(200, '{') });
    await assert.rejects(invalidJson.read('os_1'), error => error.code === 'storage_invalid_json');

    const invalidEnvelope = createSillyTavernFileStorage({ fetch: async () => response(200, '{}') });
    await assert.rejects(invalidEnvelope.read('os_1'), error => error.code === 'storage_invalid_envelope');
});

test('SillyTavern storage uploads UTF-8 JSON once and accepts a successful response as confirmed', async () => {
    const uploads = [];
    const candidate = envelope();
    candidate.partitions = { text: '你好' };
    const storage = createSillyTavernFileStorage({
        fetch: async (url, options) => {
            assert.equal(url, '/api/files/upload');
            uploads.push(decodeUpload(options));
            return response(200, '{}');
        },
    });

    assert.deepEqual(await storage.replace({ expected: null, candidate }), { status: 'confirmed' });
    assert.equal(uploads.length, 1);
    assert.equal(uploads[0].body.name, 'LittleWhiteBox_OS_os_1.json');
    assert.deepEqual(uploads[0].candidate, candidate);
});

test('unknown upload results are classified by commitId read-back without retrying the upload', async () => {
    const cases = [
        { observed: envelope('candidate', 1), expected: envelope('before', 0), status: 'confirmed' },
        { observed: envelope('before', 0), expected: envelope('before', 0), status: 'unconfirmed' },
        { observed: envelope('other', 1), expected: envelope('before', 0), status: 'conflict' },
    ];
    for (const scenario of cases) {
        let uploads = 0;
        const storage = createSillyTavernFileStorage({
            fetch: async (url) => {
                if (url === '/api/files/upload') {
                    uploads++;
                    throw new TypeError('network result unknown');
                }
                return response(200, JSON.stringify(scenario.observed));
            },
        });
        const result = await storage.replace({
            expected: {
                osId: scenario.expected.osId,
                revision: scenario.expected.revision,
                commitId: scenario.expected.commitId,
            },
            candidate: envelope('candidate', 1),
        });
        assert.equal(result.status, scenario.status);
        assert.equal(uploads, 1);
    }
});

test('ambiguous HTTP write failures are confirmed by read-back while definite rejections are not', async () => {
    for (const status of [408, 429, 500]) {
        let requests = 0;
        const storage = createSillyTavernFileStorage({
            fetch: async (url) => {
                requests++;
                return url === '/api/files/upload'
                    ? response(status, 'unknown')
                    : response(200, JSON.stringify(envelope('candidate', 1)));
            },
        });
        const result = await storage.replace({
            expected: { osId: 'os_1', revision: 0, commitId: 'before' },
            candidate: envelope('candidate', 1),
        });
        assert.equal(result.status, 'confirmed');
        assert.equal(requests, 2);
    }

    let requests = 0;
    const rejected = createSillyTavernFileStorage({
        fetch: async () => { requests++; return response(400, 'invalid'); },
    });
    const result = await rejected.replace({ expected: null, candidate: envelope() });
    assert.equal(result.status, 'failed');
    assert.equal(result.error.retryable, false);
    assert.equal(requests, 1);
});

test('a write timeout performs one read-back and never resends the candidate', async () => {
    let uploads = 0;
    let reads = 0;
    const storage = createSillyTavernFileStorage({
        requestTimeoutMs: 5,
        fetch: async (url, options) => {
            if (url === '/api/files/upload') {
                uploads++;
                return await new Promise((_resolve, reject) => {
                    options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true });
                });
            }
            reads++;
            return response(200, JSON.stringify(envelope('candidate', 1)));
        },
    });
    const result = await storage.replace({
        expected: { osId: 'os_1', revision: 0, commitId: 'before' },
        candidate: envelope('candidate', 1),
    });
    assert.equal(result.status, 'confirmed');
    assert.equal(uploads, 1);
    assert.equal(reads, 1);
});

test('a pre-aborted write is explicitly failed and sends no request', async () => {
    let requests = 0;
    const controller = new AbortController();
    controller.abort();
    const storage = createSillyTavernFileStorage({ fetch: async () => { requests++; return response(200); } });
    const result = await storage.replace({ expected: null, candidate: envelope() }, controller.signal);
    assert.equal(result.status, 'failed');
    assert.equal(result.error.code, 'storage_aborted');
    assert.equal(requests, 0);
});

test('normal writes have no 15-second deadline and cancellation after dispatch cannot cause a resend', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let release, sentSignal, requests = 0, finished = false;
    const controller = new AbortController();
    const storage = createSillyTavernFileStorage({ fetch: async (_url, options) => {
        requests++; sentSignal = options.signal;
        return new Promise(resolve => { release = resolve; });
    } });
    const saving = storage.replace({ expected: null, candidate: envelope() }, controller.signal)
        .then(result => { finished = true; return result; });
    while (!release) { await Promise.resolve(); }
    controller.abort(); t.mock.timers.tick(20_000); await Promise.resolve();
    assert.equal(finished, false); assert.equal(sentSignal.aborted, false); assert.equal(requests, 1);
    release(response(200, '{}'));
    assert.equal((await saving).status, 'confirmed');
    assert.equal(requests, 1);
});

test('SillyTavern storage deletes through the user files path and treats 404 as missing', async () => {
    const bodies = [];
    let status = 200;
    const storage = createSillyTavernFileStorage({
        fetch: async (_url, options) => {
            bodies.push(JSON.parse(options.body));
            return response(status);
        },
    });
    assert.equal(await storage.delete('os_1'), 'deleted');
    status = 404;
    assert.equal(await storage.delete('os_1'), 'missing');
    assert.deepEqual(bodies[0], { path: 'user/files/LittleWhiteBox_OS_os_1.json' });
});
