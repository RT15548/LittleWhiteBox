import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createTestModuleUrl } from './helpers/bundle-module.js';
import { createSessionStorage } from './helpers/session-storage.js';
import { createEmbeddingAttempts } from '../vector/runtime/embedding-attempts.js';
import {
    createEmbeddingFailureError,
    getEmbeddingFailureDetails,
    isRetryableEmbeddingFailure,
    readEmbeddingFailure,
} from '../vector/llm/embedding-failure.js';

// Storage embedding receipts are exercised independently of host state and paid
// APIs. The protocol validator is real; only the actual transport is substituted.
const bundle = await build({
    entryPoints: [fileURLToPath(new URL('../vector/runtime/embedding-receipts.js', import.meta.url))],
    bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent',
    plugins: [{ name: 'embedding-receipt-transport', setup(api) {
        api.onResolve({ filter: /utils\/embedder\.js$/ }, () => ({ path: 'embedder', namespace: 'fixture' }));
        api.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({
            contents: 'export const embed = () => { throw new Error("Unexpected real transport"); };', loader: 'js',
        }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Imports only the local isolated test bundle.
const { createEmbeddingReceipts } = await import(await createTestModuleUrl(bundle.outputFiles[0].text));
const config = { enabled: true, embeddingApi: { provider: 'custom', url: 'https://embedding.test/v1', model: 'test-model', key: 'test-key' } };
const owner = { chatId: 'character:alice:chat' };
const vectorsFor = texts => texts.map(text => [text.length, 1]);

function fixture(transport = vectorsFor, attempts = null) {
    const calls = [];
    const receipts = createEmbeddingReceipts({ attempts, embed: async (texts, cfg, options) => {
        calls.push({ texts: [...texts], config: cfg, options });
        return transport(texts, cfg, options);
    } });
    return { ...receipts, calls };
}

function deferred() {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
}

const persisted = storage => createEmbeddingAttempts({ getStorage: () => storage });
const uncertainResult = error => error.embeddingFailure?.kind === 'unknown_outcome' && error.embeddingFailure?.uncertain === true;
const unknownFailure = error => error.embeddingFailure?.kind === 'unknown';

test('a fresh receipt owner cannot rebuy an unacknowledged response after reload', async () => {
    const storage = createSessionStorage();
    const first = fixture(vectorsFor, persisted(storage));
    await first.embedForStorage(['private source text'], config, owner);
    const fresh = fixture(vectorsFor, persisted(storage));
    await assert.rejects(fresh.embedForStorage(['private source text'], config, owner), uncertainResult);
    await assert.rejects(fresh.embedForStorage(['new input', 'private source text'], config, owner), uncertainResult);
    assert.equal(fresh.calls.length, 0);
    assert.equal(storage.length, 1);
    const key = storage.key(0);
    // Persisted security boundary: only an opaque chat digest, request digest
    // and a fixed pending flag may leave memory, never source/API credentials.
    assert.match(key, /^LittleWhiteBox\.embedding-attempt\.v1:[a-f0-9]{64}:[a-f0-9]{64}$/u);
    assert.equal(storage.getItem(key), '1');
    for (const secret of [owner.chatId, config.embeddingApi.key, config.embeddingApi.url, 'private source text']) {
        assert.equal(key.includes(secret), false);
    }
    await fresh.embedForStorage(['new input'], config, owner);
    const changed = { ...config, embeddingApi: { ...config.embeddingApi, model: 'different model' } };
    await fresh.embedForStorage(['private source text'], changed, owner);
    assert.equal(fresh.calls.length, 2);
});

for (const [name, failure, response] of [
    ['HTTP 401', { kind: 'http', status: 401 }],
    ['HTTP 429', { kind: 'http', status: 429 }],
    ['invalid response', null, []],
]) {
    test(`a known ${name} failure survives reload without purchasing another request`, async () => {
        const storage = createSessionStorage();
        const first = fixture(() => {
            if (failure) throw createEmbeddingFailureError('fixture paid failure', failure);
            return response;
        }, persisted(storage));
        let original;
        await assert.rejects(first.embedForStorage(['failed'], config, owner), error => { original = error; return true; });
        const fresh = fixture(vectorsFor, persisted(storage));
        const saved = fresh.readStoredEmbeddingFailure(['failed'], config, owner);
        assert.deepEqual(getEmbeddingFailureDetails(saved), getEmbeddingFailureDetails(original));
        assert.equal(isRetryableEmbeddingFailure(saved), isRetryableEmbeddingFailure(original));
        assert.notEqual(readEmbeddingFailure(saved)?.uncertain, true);
        for (const texts of [['failed'], ['new input', 'failed']]) {
            await assert.rejects(fresh.embedForStorage(texts, config, owner), error => {
                assert.deepEqual(getEmbeddingFailureDetails(error), getEmbeddingFailureDetails(original));
                return true;
            });
        }
        assert.equal(first.calls.length, 1);
        assert.equal(fresh.calls.length, 0);
        assert.equal(storage.length, 1);
    });
}

test('failure receipts persist only safe classification and status, never raw provider data', async () => {
    const storage = createSessionStorage();
    const source = 'private source text';
    const raw = 'raw provider message, body, credential and vector payload';
    const failure = createEmbeddingFailureError(raw, {
        kind: 'http', status: 401, message: raw, body: raw, reason: source,
        credentials: config.embeddingApi.key, vector: [987654321, 123456789],
    }, new Error(raw));
    const f = fixture(() => { throw new Error(raw, { cause: failure }); }, persisted(storage));
    await assert.rejects(f.embedForStorage([source], config, owner));
    const key = storage.key(0), value = storage.getItem(key);
    // This exact whitelist protects the persisted security boundary, not copy.
    assert.deepEqual(JSON.parse(value), { kind: 'http', status: 401 });
    for (const secret of [owner.chatId, source, raw, config.embeddingApi.key, config.embeddingApi.url, '987654321', '123456789']) {
        assert.equal(`${key}${value}`.includes(secret), false);
    }
});

for (const [name, failure] of [
    ['untyped', new Error('secret raw failure')],
    ['unrecognized', createEmbeddingFailureError('secret raw failure', { kind: 'unrecognized secret kind', status: 401, body: 'secret body' })],
]) {
    test(`a completed ${name} failure stays unknown after reload without persisting provider data`, async () => {
        const storage = createSessionStorage();
        const first = fixture(() => { throw failure; }, persisted(storage));
        await assert.rejects(first.embedForStorage(['failed'], config, owner));
        const fresh = fixture(vectorsFor, persisted(storage));
        const saved = fresh.readStoredEmbeddingFailure(['failed'], config, owner);
        assert.equal(unknownFailure(saved), true);
        assert.notEqual(readEmbeddingFailure(saved)?.uncertain, true);
        assert.deepEqual(getEmbeddingFailureDetails(saved), getEmbeddingFailureDetails(failure));
        await assert.rejects(fresh.embedForStorage(['failed'], config, owner), unknownFailure);
        // Only the bounded classification may cross the persistence boundary.
        assert.deepEqual(JSON.parse(storage.getItem(storage.key(0))), { kind: 'unknown' });
        assert.equal(fresh.calls.length, 0);
    });
}

test('a failed failure-metadata write retains every paid marker and the original in-memory failure', async () => {
    const storage = createSessionStorage();
    const write = storage.setItem;
    let writes = 0;
    storage.setItem = (key, value) => {
        if (++writes === 4) throw new Error('fixture quota exceeded');
        write(key, value);
    };
    const failure = createEmbeddingFailureError('fixture paid failure', { kind: 'http', status: 401 });
    const f = fixture(() => { throw failure; }, persisted(storage));
    await assert.rejects(f.embedForStorage(['alpha', 'beta'], config, owner), error => {
        assert.ok(error instanceof AggregateError);
        assert.equal(readEmbeddingFailure(error).status, 401);
        assert.equal(error.errors[1].embeddingFailure?.kind, 'receipt_storage');
        return true;
    });
    assert.equal(storage.length, 2);
    await assert.rejects(f.embedForStorage(['alpha', 'beta'], config, owner), error => error === failure);
    assert.equal(f.calls.length, 1);
    storage.setItem = write;
    const fresh = fixture(vectorsFor, persisted(storage));
    await assert.rejects(fresh.embedForStorage(['alpha'], config, owner), error => readEmbeddingFailure(error)?.status === 401);
    await assert.rejects(fresh.embedForStorage(['beta'], config, owner), uncertainResult);
    assert.equal(fresh.calls.length, 0);
    assert.equal(storage.length, 2);
});

test('confirmed storage acknowledgement removes only its markers and permits a later legitimate gap', async () => {
    const storage = createSessionStorage();
    const first = fixture(vectorsFor, persisted(storage));
    await first.embedForStorage(['alpha', 'beta'], config, owner);
    first.acknowledgeStoredEmbeddings(['alpha'], config, owner);
    assert.equal(storage.length, 1);
    const fresh = fixture(vectorsFor, persisted(storage));
    await fresh.embedForStorage(['alpha'], config, owner);
    await assert.rejects(fresh.embedForStorage(['beta'], config, owner), uncertainResult);
    assert.equal(fresh.calls.length, 1);
});

test('manual retry clears reloaded failures for its chat but preserves ready responses and in-flight attempts', async () => {
    const storage = createSessionStorage();
    const entered = deferred(), release = deferred();
    const failure = new Error('fixture paid request failed');
    const f = fixture(async texts => {
        if (texts.includes('failed')) throw failure;
        if (texts.includes('pending')) { entered.resolve(); await release.promise; }
        return vectorsFor(texts);
    }, persisted(storage));
    const other = { chatId: 'another-chat' };
    await f.embedForStorage(['ready'], config, owner);
    await assert.rejects(f.embedForStorage(['failed'], config, owner));
    await assert.rejects(f.embedForStorage(['failed'], config, other));
    const reloaded = fixture(vectorsFor, persisted(storage));
    await reloaded.embedForStorage(['orphaned by reload'], config, owner);
    const pending = f.embedForStorage(['pending'], config, owner);
    await entered.promise;
    f.retryStoredEmbeddings(owner.chatId);
    assert.equal(storage.length, 3);
    const after = fixture(vectorsFor, persisted(storage));
    await assert.rejects(after.embedForStorage(['ready'], config, owner), uncertainResult);
    await assert.rejects(after.embedForStorage(['pending'], config, owner), uncertainResult);
    await assert.rejects(after.embedForStorage(['failed'], config, other), unknownFailure);
    await after.embedForStorage(['failed', 'orphaned by reload'], config, owner);
    assert.equal(after.calls.length, 1);
    release.resolve();
    await pending;
    const beforeReplay = f.calls.length;
    await f.embedForStorage(['ready', 'pending'], config, owner);
    assert.equal(f.calls.length, beforeReplay);
});

test('read-only failure inspection ignores ready and in-flight work and never calls transport', async () => {
    const storage = createSessionStorage();
    const response = deferred(), entered = deferred();
    const failure = createEmbeddingFailureError('fixture paid failure', { kind: 'http', status: 429 });
    const f = fixture(async texts => {
        if (texts.includes('failed')) throw failure;
        if (texts.includes('pending')) { entered.resolve(); await response.promise; }
        return vectorsFor(texts);
    }, persisted(storage));
    assert.equal(f.readStoredEmbeddingFailure(['new'], config, owner), null);
    await f.embedForStorage(['ready'], config, owner);
    await assert.rejects(f.embedForStorage(['failed'], config, owner));
    const pending = f.embedForStorage(['pending'], config, owner);
    await entered.promise;
    const calls = f.calls.length;
    assert.equal(f.readStoredEmbeddingFailure(['ready', 'pending', 'new'], config, owner), null);
    assert.equal(f.readStoredEmbeddingFailure(['ready', 'pending', 'failed'], config, owner), failure);
    const fresh = fixture(vectorsFor, persisted(storage));
    assert.equal(readEmbeddingFailure(fresh.readStoredEmbeddingFailure(['failed'], config, owner))?.status, 429);
    assert.equal(uncertainResult(fresh.readStoredEmbeddingFailure(['pending'], config, owner)), true);
    assert.equal(fresh.readStoredEmbeddingFailure(['failed'], config, { chatId: 'other chat' }), null);
    assert.equal(storage.length, 3);
    assert.equal(f.calls.length, calls);
    assert.equal(fresh.calls.length, 0);
    response.resolve();
    await pending;
});

test('read-only failure inspection surfaces storage access failures without permitting transport', () => {
    const storage = createSessionStorage();
    storage.getItem = () => { throw new Error('fixture unavailable storage'); };
    const f = fixture(vectorsFor, persisted(storage));
    assert.throws(() => f.readStoredEmbeddingFailure(['absent'], config, owner), error => readEmbeddingFailure(error)?.kind === 'receipt_storage');
    assert.equal(f.calls.length, 0);
});

test('selected manual retry unlocks only its failed inputs, configuration, and chat', async () => {
    const storage = createSessionStorage();
    const failure = createEmbeddingFailureError('fixture paid failure', { kind: 'http', status: 401 });
    let fail = true;
    const transport = texts => {
        if (fail) throw failure;
        return vectorsFor(texts);
    };
    const first = fixture(transport, persisted(storage));
    const changed = { ...config, embeddingApi: { ...config.embeddingApi, model: 'different model' } };
    const other = { chatId: 'another-chat' };
    for (const [texts, cfg, chat] of [
        [['selected', 'unselected'], config, owner],
        [['selected'], changed, owner],
        [['selected'], config, other],
    ]) await assert.rejects(first.embedForStorage(texts, cfg, chat));
    fail = false;
    const fresh = fixture(transport, persisted(storage));
    await fresh.embedForStorage(['selected'], config, { ...owner, retryFailed: true });
    assert.deepEqual(fresh.calls.map(call => call.texts), [['selected']]);
    for (const [text, cfg, chat] of [
        ['unselected', config, owner], ['selected', changed, owner], ['selected', config, other],
    ]) {
        await assert.rejects(fresh.embedForStorage([text], cfg, chat), error => readEmbeddingFailure(error)?.status === 401);
    }
    assert.equal(fresh.calls.length, 1);
    assert.equal(storage.length, 4);
});

test('selected manual retry preserves ready and in-flight responses while buying only the failed input', async () => {
    const storage = createSessionStorage();
    const entered = deferred(), response = deferred();
    const failure = createEmbeddingFailureError('fixture paid failure', { kind: 'http', status: 429 });
    let fail = true;
    const f = fixture(async texts => {
        if (texts.includes('failed') && fail) throw failure;
        if (texts.includes('pending')) { entered.resolve(); await response.promise; }
        return vectorsFor(texts);
    }, persisted(storage));
    await f.embedForStorage(['ready'], config, owner);
    await assert.rejects(f.embedForStorage(['failed'], config, owner));
    const pending = f.embedForStorage(['pending'], config, owner);
    await entered.promise;
    fail = false;
    const retry = f.embedForStorage(['ready', 'pending', 'failed'], config, { ...owner, retryFailed: true });
    response.resolve();
    assert.deepEqual(await retry, vectorsFor(['ready', 'pending', 'failed']));
    await pending;
    assert.deepEqual(f.calls.map(call => call.texts), [['ready'], ['failed'], ['pending'], ['failed']]);
    const fresh = fixture(vectorsFor, persisted(storage));
    for (const text of ['ready', 'pending', 'failed']) {
        await assert.rejects(fresh.embedForStorage([text], config, owner), uncertainResult);
    }
    assert.equal(fresh.calls.length, 0);
});

test('stopping a selected manual retry leaves later batches blocked and cannot unlock a pre-aborted selection', async () => {
    const storage = createSessionStorage();
    const failure = createEmbeddingFailureError('fixture paid failure', { kind: 'http', status: 401 });
    const f = fixture(() => { throw failure; }, persisted(storage));
    await assert.rejects(f.embedForStorage(['first batch', 'later batch'], config, owner));
    await assert.rejects(f.embedForStorage(['first batch'], config, { ...owner, retryFailed: true }));
    const controller = new AbortController(); controller.abort();
    await assert.rejects(f.embedForStorage(['later batch'], config, { ...owner, signal: controller.signal, retryFailed: true }), { name: 'AbortError' });
    const fresh = fixture(vectorsFor, persisted(storage));
    for (const text of ['first batch', 'later batch']) {
        await assert.rejects(fresh.embedForStorage([text], config, owner), error => readEmbeddingFailure(error)?.status === 401);
    }
    assert.deepEqual(f.calls.map(call => call.texts), [['first batch', 'later batch'], ['first batch']]);
    assert.equal(fresh.calls.length, 0);
});

test('failed selected retry reservation preserves the original paid failure and successful responses', async () => {
    const storage = createSessionStorage();
    const failure = createEmbeddingFailureError('fixture paid failure', { kind: 'http', status: 401 });
    const f = fixture(texts => {
        if (texts.includes('failed')) throw failure;
        return vectorsFor(texts);
    }, persisted(storage));
    await f.embedForStorage(['ready'], config, owner);
    await assert.rejects(f.embedForStorage(['failed'], config, owner));
    storage.setItem = () => { throw new Error('fixture unavailable storage'); };
    await assert.rejects(f.embedForStorage(['ready', 'failed'], config, { ...owner, retryFailed: true }), error => readEmbeddingFailure(error)?.kind === 'receipt_storage');
    await assert.rejects(f.embedForStorage(['failed'], config, owner), error => error === failure);
    assert.deepEqual(await f.embedForStorage(['ready'], config, owner), vectorsFor(['ready']));
    const fresh = fixture(vectorsFor, persisted(storage));
    await assert.rejects(fresh.embedForStorage(['failed'], config, owner), error => readEmbeddingFailure(error)?.status === 401);
    assert.equal(fresh.calls.length, 0);
    assert.equal(storage.length, 2);
    assert.equal(f.calls.length, 2);
});

for (const boundary of ['pre-dispatch cancellation', 'partial storage write']) {
    test(`selected retry rolls back ${boundary} without unlocking paid inputs or losing ready responses`, async () => {
        const storage = createSessionStorage();
        const failure = createEmbeddingFailureError('fixture paid failure', { kind: 'http', status: 401 });
        const f = fixture(texts => {
            if (texts.some(text => text.startsWith('failed'))) throw failure;
            return vectorsFor(texts);
        }, persisted(storage));
        await f.embedForStorage(['ready'], config, owner);
        await assert.rejects(f.embedForStorage(['failed alpha', 'failed beta'], config, owner));
        const write = storage.setItem, controller = new AbortController();
        let writes = 0;
        storage.setItem = (key, value) => {
            writes++;
            if (boundary === 'partial storage write' && writes === 3) throw new Error('fixture quota exceeded');
            write(key, value);
            if (boundary === 'pre-dispatch cancellation' && writes === 3) controller.abort();
        };
        await assert.rejects(f.embedForStorage(['ready', 'failed alpha', 'new', 'failed beta'], config,
            { ...owner, signal: controller.signal, retryFailed: true }), error => boundary === 'pre-dispatch cancellation'
            ? error.name === 'AbortError' : readEmbeddingFailure(error)?.kind === 'receipt_storage');
        storage.setItem = write;
        const fresh = fixture(vectorsFor, persisted(storage));
        for (const text of ['failed alpha', 'failed beta']) {
            await assert.rejects(f.embedForStorage([text], config, owner), error => error === failure);
            assert.equal(readEmbeddingFailure(fresh.readStoredEmbeddingFailure([text], config, owner))?.status, 401);
        }
        assert.equal(fresh.readStoredEmbeddingFailure(['new'], config, owner), null);
        assert.deepEqual(await f.embedForStorage(['ready'], config, owner), vectorsFor(['ready']));
        assert.equal(f.calls.length, 2);
        assert.equal(fresh.calls.length, 0);
        assert.equal(storage.length, 3);
    });
}

test('explicit chat deletion clears persisted attempts without clearing another chat', async () => {
    const storage = createSessionStorage();
    const f = fixture(vectorsFor, persisted(storage));
    await f.embedForStorage(['alpha'], config, owner);
    await f.embedForStorage(['alpha'], config, { chatId: 'another-chat' });
    f.forgetStoredEmbeddings(owner.chatId);
    assert.equal(storage.length, 1);
    const fresh = fixture(vectorsFor, persisted(storage));
    await fresh.embedForStorage(['alpha'], config, owner);
    await assert.rejects(fresh.embedForStorage(['alpha'], config, { chatId: 'another-chat' }), uncertainResult);
    assert.equal(fresh.calls.length, 1);
});

for (const boundary of ['unavailable', 'access', 'read', 'write']) {
    test(`unavailable receipt storage at ${boundary} blocks the paid call`, async () => {
        const storage = createSessionStorage();
        const failure = new Error('fixture storage unavailable');
        const attempts = createEmbeddingAttempts({ getStorage: () => {
            if (boundary === 'access') throw failure;
            return boundary === 'unavailable' ? undefined : storage;
        } });
        if (boundary === 'read') storage.getItem = () => { throw failure; };
        if (boundary === 'write') storage.setItem = () => { throw failure; };
        const f = fixture(vectorsFor, attempts);
        await assert.rejects(f.embedForStorage(['alpha'], config, owner), error => error.embeddingFailure?.kind === 'receipt_storage');
        assert.equal(f.calls.length, 0);
        assert.equal(storage.length, 0);
    });
}

test('a partially failed marker reservation makes no API request and rolls back its own markers', async () => {
    const storage = createSessionStorage();
    const write = storage.setItem;
    let writes = 0;
    storage.setItem = (key, value) => {
        if (++writes === 2) throw new Error('fixture quota exceeded');
        write(key, value);
    };
    const f = fixture(vectorsFor, persisted(storage));
    await assert.rejects(f.embedForStorage(['alpha', 'beta'], config, owner), error => error.embeddingFailure?.kind === 'receipt_storage');
    assert.equal(f.calls.length, 0);
    assert.equal(storage.length, 0);
    storage.setItem = write;
    await f.embedForStorage(['alpha', 'beta'], config, owner);
    assert.equal(f.calls.length, 1);
    assert.equal(storage.length, 2);
});

test('a pre-aborted caller does not access persistent storage or reserve an attempt', async () => {
    const storage = createSessionStorage();
    let reads = 0;
    const attempts = createEmbeddingAttempts({ getStorage: () => { reads++; return storage; } });
    const f = fixture(vectorsFor, attempts);
    const controller = new AbortController(); controller.abort();
    await assert.rejects(f.embedForStorage(['alpha'], config, { ...owner, signal: controller.signal }), { name: 'AbortError' });
    assert.equal(reads, 0);
    assert.equal(storage.length, 0);
    assert.equal(f.calls.length, 0);
});

test('cancellation after reserving but before dispatch removes only the unspent markers', async () => {
    const storage = createSessionStorage();
    const write = storage.setItem;
    const controller = new AbortController();
    storage.setItem = (key, value) => { write(key, value); controller.abort(); };
    const f = fixture(vectorsFor, persisted(storage));
    await assert.rejects(f.embedForStorage(['alpha'], config, { ...owner, signal: controller.signal }), { name: 'AbortError' });
    assert.equal(storage.length, 0);
    assert.equal(f.calls.length, 0);
    storage.setItem = write;
    await f.embedForStorage(['alpha'], config, owner);
    assert.equal(f.calls.length, 1);
});

test('a failed acknowledgement retains the ready response and marker for free local replay', async () => {
    const storage = createSessionStorage();
    const f = fixture(vectorsFor, persisted(storage));
    await f.embedForStorage(['alpha'], config, owner);
    const remove = storage.removeItem;
    storage.removeItem = () => { throw new Error('fixture storage unavailable'); };
    assert.throws(() => f.acknowledgeStoredEmbeddings(['alpha'], config, owner), error => error.embeddingFailure?.kind === 'receipt_storage');
    assert.deepEqual(await f.embedForStorage(['alpha'], config, owner), vectorsFor(['alpha']));
    assert.equal(f.calls.length, 1);
    assert.equal(storage.length, 1);
    storage.removeItem = remove;
    f.acknowledgeStoredEmbeddings(['alpha'], config, owner);
    assert.equal(storage.length, 0);
});

test('successful responses survive a failed save and replay reordered subsets without another request', async () => {
    const f = fixture();
    const first = await f.embedForStorage(['alpha', 'beta', 'gamma'], config, owner);
    // No acknowledgement: the caller failed to confirm its storage commit.
    assert.deepEqual(await f.embedForStorage(['gamma', 'alpha'], config, owner), [first[2], first[0]]);
    assert.equal(f.calls.length, 1);
    f.acknowledgeStoredEmbeddings(['alpha', 'gamma'], config, owner);
    assert.deepEqual(await f.embedForStorage(['beta'], config, owner), [first[1]]);
    assert.equal(f.calls.length, 1);
    await f.embedForStorage(['alpha'], config, owner);
    assert.equal(f.calls.length, 2);
});

test('mixed cached and new inputs purchase only the new response while retaining output order', async () => {
    const f = fixture();
    await f.embedForStorage(['ready'], config, owner);
    assert.deepEqual(await f.embedForStorage(['new', 'ready', 'new'], config, owner), vectorsFor(['new', 'ready', 'new']));
    assert.deepEqual(f.calls.map(call => call.texts), [['ready'], ['new']]);
});

test('changing unrelated settings does not unlock a failed paid input', async () => {
    const failure = new Error('fixture failure');
    const f = fixture(() => { throw failure; });
    await assert.rejects(f.embedForStorage(['failed'], config, owner));
    const changed = { ...config, recallTimeoutSec: 90, embeddingApi: { ...config.embeddingApi, timeoutSec: 120 } };
    await assert.rejects(f.embedForStorage(['failed'], changed, owner), error => error === failure);
    assert.equal(f.calls.length, 1);
});

test('duplicate texts and overlapping in-flight requests share the paid response', async () => {
    const response = deferred();
    const entered = deferred();
    const f = fixture(texts => { entered.resolve(); return response.promise.then(() => vectorsFor(texts)); });
    const first = f.embedForStorage(['alpha', 'beta', 'alpha'], config, owner);
    await entered.promise;
    const second = f.embedForStorage(['beta', 'alpha'], config, owner);
    assert.equal(f.calls.length, 1);
    assert.deepEqual(f.calls[0].texts, ['alpha', 'beta']);
    response.resolve();
    const [a, b] = await Promise.all([first, second]);
    assert.deepEqual(a, [b[1], b[0], b[1]]);
    assert.equal(f.calls.length, 1);
});

for (const kind of ['timeout', 'network', 'http', 'invalid_response', 'unknown']) {
    test(`a ${kind} failure is retained across scans and another chat without an automatic retry`, async () => {
        const failure = Object.assign(new Error('fixture failure'), { embeddingFailure: { kind, status: 503 } });
        const f = fixture(texts => { if (texts.includes('failed')) throw failure; return vectorsFor(texts); });
        await assert.rejects(f.embedForStorage(['failed'], config, owner), error => error === failure);
        for (let scan = 0; scan < 3; scan++) {
            await assert.rejects(f.embedForStorage(['failed'], config, owner), error => error === failure);
        }
        await f.embedForStorage(['different chat'], config, { chatId: 'character:bob:chat' });
        await assert.rejects(f.embedForStorage(['failed'], config, owner), error => error === failure);
        assert.equal(f.calls.length, 2);
        // A genuinely changed source is not the failed request.
        await f.embedForStorage(['new source'], config, owner);
        assert.equal(f.calls.length, 3);
    });
}

test('a rebatch containing a failed input rejects before spending on its new inputs', async () => {
    const failure = new Error('fixture failed request');
    const f = fixture(texts => { if (texts.includes('failed')) throw failure; return vectorsFor(texts); });
    await f.embedForStorage(['ready'], config, owner);
    await assert.rejects(f.embedForStorage(['failed'], config, owner), error => error === failure);
    await assert.rejects(f.embedForStorage(['ready', 'new', 'failed'], config, owner), error => error === failure);
    assert.equal(f.calls.length, 2);
    assert.deepEqual(await f.embedForStorage(['ready'], config, owner), vectorsFor(['ready']));
    assert.equal(f.calls.length, 2);
});

test('manual retry resets failed requests for only its chat and preserves successful responses', async () => {
    let fail = true;
    const failure = new Error('fixture failure');
    const f = fixture(texts => { if (fail && texts.includes('failed')) throw failure; return vectorsFor(texts); });
    const other = { chatId: 'another-chat' };
    await f.embedForStorage(['ready'], config, owner);
    await assert.rejects(f.embedForStorage(['failed'], config, owner));
    await assert.rejects(f.embedForStorage(['failed'], config, other));
    f.retryStoredEmbeddings(owner.chatId);
    fail = false;
    await f.embedForStorage(['ready', 'failed'], config, owner);
    assert.deepEqual(f.calls.at(-1).texts, ['failed']);
    await assert.rejects(f.embedForStorage(['failed'], config, other), error => error === failure);
    assert.equal(f.calls.length, 4);
});

for (const field of ['provider', 'url', 'model', 'key']) {
    test(`a changed ${field} configuration cannot inherit an old failed request or cached response`, async () => {
        const failure = new Error('fixture service failure');
        const f = fixture((texts, cfg) => {
            if (texts.includes('failed') && cfg.embeddingApi[field] === config.embeddingApi[field]) throw failure;
            return vectorsFor(texts);
        });
        await f.embedForStorage(['ready'], config, owner);
        await assert.rejects(f.embedForStorage(['failed'], config, owner));
        const changed = { ...config, embeddingApi: { ...config.embeddingApi, [field]: 'changed' } };
        await f.embedForStorage(['ready', 'failed'], changed, owner);
        assert.deepEqual(f.calls.at(-1).texts, ['ready', 'failed']);
        await assert.rejects(f.embedForStorage(['failed'], config, owner), error => error === failure);
        assert.equal(f.calls.length, 3);
    });
}

test('an already aborted caller neither dispatches nor blocks a later attempt', async () => {
    const f = fixture();
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(f.embedForStorage(['alpha'], config, { ...owner, signal: controller.signal }), { name: 'AbortError' });
    assert.equal(f.calls.length, 0);
    await f.embedForStorage(['alpha'], config, owner);
    assert.equal(f.calls.length, 1);
});

test('cancellation before dispatch leaves no uncertain receipt', async () => {
    const f = fixture();
    const controller = new AbortController();
    const pending = f.embedForStorage(['alpha'], config, { ...owner, signal: controller.signal });
    controller.abort();
    await assert.rejects(pending, { name: 'AbortError' });
    assert.equal(f.calls.length, 0);
    await f.embedForStorage(['alpha'], config, owner);
    assert.equal(f.calls.length, 1);
});

test('abort after dispatch retains the unknown outcome across reload without automatic resubmission', async () => {
    const storage = createSessionStorage();
    const entered = deferred();
    const controller = new AbortController();
    const f = fixture((texts, cfg, { signal }) => new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        entered.resolve();
    }), persisted(storage));
    const pending = f.embedForStorage(['alpha'], config, { ...owner, signal: controller.signal });
    await entered.promise;
    controller.abort();
    await assert.rejects(pending, error => error === controller.signal.reason);
    let uncertain;
    await assert.rejects(f.embedForStorage(['alpha'], config, owner), error => {
        uncertain = error;
        return error.name !== 'AbortError' && error.cause === controller.signal.reason && uncertainResult(error);
    });
    await assert.rejects(f.embedForStorage(['alpha'], config, owner), error => error === uncertain);
    assert.equal(f.calls.length, 1);
    const fresh = fixture(vectorsFor, persisted(storage));
    await assert.rejects(fresh.embedForStorage(['alpha'], config, owner), uncertainResult);
    assert.equal(fresh.calls.length, 0);
});

test('a valid late response remains reusable after cancellation without permitting the cancelled caller to write', async () => {
    const entered = deferred();
    const response = deferred();
    const f = fixture(texts => { entered.resolve(); return response.promise.then(() => vectorsFor(texts)); });
    const controller = new AbortController();
    const pending = f.embedForStorage(['alpha'], config, { ...owner, signal: controller.signal });
    await entered.promise;
    controller.abort();
    response.resolve();
    await assert.rejects(pending, { name: 'AbortError' });
    assert.deepEqual(await f.embedForStorage(['alpha'], config, owner), vectorsFor(['alpha']));
    assert.equal(f.calls.length, 1);
});

for (const response of [[], [[NaN, 1]], [[Infinity, 1]], [[1e100, 1]], [[1, 1], [2, 2]]]) {
    test(`an invalid response is never made reusable (${JSON.stringify(response)})`, async () => {
        const f = fixture(() => response);
        let original;
        await assert.rejects(f.embedForStorage(['alpha'], config, owner), error => {
            original = error;
            return error.embeddingFailure?.kind === 'invalid_response';
        });
        await assert.rejects(f.embedForStorage(['alpha'], config, owner), error => error === original);
        assert.equal(f.calls.length, 1);
    });
}

test('a late paid failure cannot recreate receipts after explicit chat deletion', async () => {
    const storage = createSessionStorage();
    const entered = deferred(), response = deferred();
    const f = fixture(() => { entered.resolve(); return response.promise; }, persisted(storage));
    const pending = f.embedForStorage(['alpha'], config, owner);
    await entered.promise;
    f.forgetStoredEmbeddings(owner.chatId);
    response.reject(createEmbeddingFailureError('fixture paid failure', { kind: 'http', status: 401 }));
    await assert.rejects(pending);
    assert.equal(storage.length, 0);
    const fresh = fixture(vectorsFor, persisted(storage));
    assert.equal(fresh.readStoredEmbeddingFailure(['alpha'], config, owner), null);
    assert.equal(fresh.calls.length, 0);
});

test('explicit deletion forgets only the selected chat and a late response cannot resurrect deleted receipts', async () => {
    const entered = deferred();
    const response = deferred();
    let block = true;
    const f = fixture(async texts => {
        if (block) { entered.resolve(); await response.promise; }
        return vectorsFor(texts);
    });
    const pending = f.embedForStorage(['alpha'], config, owner);
    await entered.promise;
    f.forgetStoredEmbeddings(owner.chatId);
    response.resolve();
    await pending;
    block = false;
    await f.embedForStorage(['alpha'], config, owner);
    assert.equal(f.calls.length, 2);
    await f.embedForStorage(['alpha'], config, { chatId: 'another-chat' });
    f.forgetStoredEmbeddings(owner.chatId);
    await f.embedForStorage(['alpha'], config, { chatId: 'another-chat' });
    assert.equal(f.calls.length, 3);
});
