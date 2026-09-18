import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { loadResponseArchive } from '../../story-summary-replay/response-archive.mjs';
import { withPreparedRequestBudget } from '../../story-summary-replay/prepared-config.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
const body = JSON.stringify({ model: 'fixture-embedding', input: ['Silver key'] });
const url = 'https://archive.invalid/v1/embeddings';

async function fixture(t, alter = () => {}) {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-response-archive-'));
    t.after(() => fs.rm(directory, { recursive: true, force: true }));
    const responseBody = { data: [{ index: 0, embedding: [1, 0] }] };
    const row = { status: 200, method: 'POST', endpoint: 'embedding', model: 'fixture-embedding',
        host: 'archive.invalid', path: '/v1/embeddings', requestHash: hash(body),
        responseBody, responseHash: hash(JSON.stringify(responseBody)) };
    const manifest = { status: 'valid', execution: { contract: 'story-summary-computation-v1' },
        config: { effectivePanel: { vector: { embeddingApi: { url: 'https://archive.invalid/v1', model: row.model } } } },
        artifactHashes: {} };
    alter(row, manifest);
    const trace = JSON.stringify({ preparation: [row], production: [] }) + '\n';
    manifest.artifactHashes.transportTrace = hash(trace);
    await fs.writeFile(path.join(directory, 'transport-trace.jsonl'), trace);
    const serialized = JSON.stringify(manifest);
    const manifestPath = path.join(directory, 'manifest.json');
    await fs.writeFile(manifestPath, serialized);
    return { path: manifestPath, sha256: hash(serialized) };
}

test('archive matches exact URL, method and full request; parameters and failed receipts cannot match', async t => {
    const source = await fixture(t);
    const archive = await loadResponseArchive([source]);
    const response = archive.match(url, { method: 'POST', body });
    assert.deepEqual(await response.json(), { data: [{ index: 0, embedding: [1, 0] }] });
    assert.equal(response.preparedReceipt.source, 'archive');
    assert.equal(response.preparedReceipt.archive.manifestSha256, source.sha256);
    for (const [address, init] of [
        [url.replace('https:', 'http:'), { method: 'POST', body }],
        [url.replace('embeddings', 'rerank'), { method: 'POST', body }],
        [url + '?key=not-a-key', { method: 'POST', body }],
        [url, { method: 'GET', body }],
        [url, { method: 'POST', body: body.replace('fixture-embedding', 'changed-model') }],
        [url, { method: 'POST', body: body.replace('Silver', 'Copper') }],
        [url, { method: 'POST', body: body.slice(0, -1) + ',"dimensions":2}' }],
    ]) assert.equal(archive.match(address, init), null);
    const aborted = AbortSignal.abort();
    assert.throws(() => archive.match(url, { method: 'POST', body, signal: aborted }), { name: 'AbortError' });
    const failed = await loadResponseArchive([await fixture(t, row => { row.status = 429; })]);
    assert.equal(failed.match(url, { method: 'POST', body }), null);
    assert.deepEqual(archive.stats, { sources: 1, successfulRows: 1, uniqueRequests: 1, hits: 1 });
});

test('archive rejects changed pins, trace bytes, response bodies and ambiguous API identities', async t => {
    const source = await fixture(t);
    await assert.rejects(loadResponseArchive([{ ...source, sha256: '0'.repeat(64) }]), /hash changed/);
    await fs.appendFile(path.join(path.dirname(source.path), 'transport-trace.jsonl'), '\n');
    await assert.rejects(loadResponseArchive([source]), /hash changed/);
    for (const alter of [
        row => { delete row.responseBody; },
        row => { row.responseBody.data[0].embedding[0] = 2; },
        row => { row.path = '/v2/embeddings'; },
        (_row, manifest) => { manifest.status = 'invalid'; },
    ]) await assert.rejects(loadResponseArchive([await fixture(t, alter)]));
});

test('archive hits spend no budget; misses remain bounded and fetch is restored on failure', async t => {
    const source = await fixture(t);
    const api = { url: 'https://archive.invalid/v1', model: 'fixture-embedding' };
    const config = { responseArchive: [source], prepared: { maxRequests: 1 }, summaryApi: api,
        vectorConfig: { l0Api: api, embeddingApi: api, rerankApi: api } };
    const original = globalThis.fetch;
    let calls = 0;
    const provider = async () => { calls++; return Response.json({ ok: true }); };
    globalThis.fetch = provider;
    try {
        await assert.rejects(withPreparedRequestBudget(config, async () => {
            for (let i = 0; i < 3; i++) assert.equal((await fetch(url, { method: 'POST', body })).preparedReceipt.source, 'archive');
            await fetch(url, { method: 'POST', body: '{}' });
            await fetch(url, { method: 'POST', body: '{}' });
        }), /budget exhausted/);
        assert.equal(calls, 1);
        assert.equal(globalThis.fetch, provider);
    } finally { globalThis.fetch = original; }
});
