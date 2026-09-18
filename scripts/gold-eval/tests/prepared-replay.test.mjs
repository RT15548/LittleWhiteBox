import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { sha256File } from '../lib/run-store.mjs';
import { withExternalCallTrace } from '../lib/transport-cassette.mjs';
import { selectPreparedJob, assertCredentialFree, assertPreparedArguments, verifyPreparedCode, verifyPreparedInputs, assertPreparedJobNotStarted, withPreparedRequestBudget } from '../../story-summary-replay/prepared-config.mjs';
import { describeNaturalWorkload } from '../../story-summary-replay/preflight.mjs';
import { preparedJournalBinding } from '../../story-summary-replay/request-journal.mjs';
import { prepareUnknownRetry, prepareReviewedContinuation } from '../../story-summary-replay/prepared-resume.mjs';

test('reviewed generation continuation permits only the bound product fix and evaluation effort setting', async t => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'prepared-continuation-'));
    t.after(() => fs.rm(dir, { recursive: true, force: true }));
    const profile = { mode: 'natural-capture', summaryApi: { model: 'fixed' }, jobs: [{ id: 'a', outputPath: dir,
        prepared: { productionSourceHash: 'old-product', maxRequests: 8, sampleSha256: 'sample', casesSha256: 'cases' } }] };
    const original = selectPreparedJob(profile, 'a');
    const oldCode = { bundleHash: 'old-bundle', runnerHash: 'old-runner', supportHash: 'old-support',
        productionSourceHash: 'old-product', packageLockHash: 'dependencies', nodeVersion: 'node', platform: 'platform', arch: 'arch' };
    const code = { ...oldCode, productionSourceHash: 'new-product', bundleHash: 'new-bundle' };
    const source = { code: oldCode, status: 'invalid', mode: 'story-summary-replay-natural-capture', invalidReason: { stage: 'summary' },
        capture: { requestJournal: { binding: preparedJournalBinding(original, oldCode),
            journalPath: path.join(dir, 'request-journal.jsonl'), maxRequests: 8 } }, data: { sampleHash: 'sample', casesHash: 'cases' } };
    const profilePath = path.join(dir, 'profile.json');const manifestPath = path.join(dir, 'manifest.json');
    await fs.writeFile(profilePath, JSON.stringify(profile));await fs.writeFile(manifestPath, JSON.stringify(source));
    const config = { ...original, prepared: { ...original.prepared, productionSourceHash: code.productionSourceHash },
        evaluationSummaryRequest: { reasoningEffort: 'low', fromFloor: 124 }, continuation: {
            summaryFromFloor: 124,
            journalSha256: 'a'.repeat(64), sourceProfile: { path: profilePath, sha256: await sha256File(profilePath) },
            sourceManifest: { path: manifestPath, sha256: await sha256File(manifestPath) } } };
    assert.equal((await prepareReviewedContinuation(config, code)).previousBinding, preparedJournalBinding(original, oldCode));
    for (const changed of [{ ...config, summaryApi: { model: 'other' } },
        { ...config, prepared: { ...config.prepared, maxRequests: 9 } },
        { ...config, prepared: { ...config.prepared, sampleSha256: 'changed' } },
        { ...config, evaluationSummaryRequest: { reasoningEffort: 'high', fromFloor: 124 } }]) {
        await assert.rejects(() => prepareReviewedContinuation(changed, code));
    }
    await assert.rejects(() => prepareReviewedContinuation(config, { ...code, productionSourceHash: 'unreviewed' }));
    await assert.rejects(() => prepareReviewedContinuation(config, { ...code, nodeVersion: 'changed' }));
    await assert.rejects(() => prepareReviewedContinuation({ ...config,
        continuation: { ...config.continuation, summaryFromFloor: undefined } }, code), /recovery Summary boundary/);
    await assert.rejects(() => prepareReviewedContinuation({ ...config,
        evaluationSummaryRequest: { reasoningEffort: 'low', fromFloor: 0 } }, code), /saved Summary request settings/);

    // A pure product repair can retain low from the first batch while recovering
    // at a later failed Summary. Neither setting removal nor relocation is allowed.
    profile.evaluationSummaryRequest = { reasoningEffort: 'low', fromFloor: 0 };
    const originalLow = selectPreparedJob(profile, 'a');
    source.capture.requestJournal.binding = preparedJournalBinding(originalLow, oldCode);
    await fs.writeFile(profilePath, JSON.stringify(profile));
    await fs.writeFile(manifestPath, JSON.stringify(source));
    const unchangedLow = { ...config, evaluationSummaryRequest: profile.evaluationSummaryRequest,
        continuation: { ...config.continuation,
            sourceProfile: { path: profilePath, sha256: await sha256File(profilePath) },
            sourceManifest: { path: manifestPath, sha256: await sha256File(manifestPath) } } };
    const transition = await prepareReviewedContinuation(unchangedLow, code);
    assert.equal(transition.summaryFromFloor, 124);
    assert.equal(transition.previousBinding, preparedJournalBinding(originalLow, oldCode));
    for (const override of [undefined, { reasoningEffort: 'low', fromFloor: 124 }]) {
        await assert.rejects(() => prepareReviewedContinuation({ ...unchangedLow,
            evaluationSummaryRequest: override }, code), /saved Summary request settings/);
    }
    await fs.appendFile(profilePath, ' ');
    await assert.rejects(() => prepareReviewedContinuation(unchangedLow, code), /hash changed/);
});

test('operator-approved tooling transition still rejects config, product, runtime and source drift', async t => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'prepared-approval-'));
    t.after(() => fs.rm(dir, { recursive: true, force: true }));
    const config = { outputPath: path.join(dir, 'output'), summaryApi: { model: 'fixed' },
        prepared: { maxRequests: 8, sampleSha256: 'sample', casesSha256: 'cases' } };
    const oldCode = { bundleHash: 'old-bundle', runnerHash: 'old-runner', supportHash: 'old-support',
        productionSourceHash: 'product', packageLockHash: 'dependencies', nodeVersion: 'node', platform: 'platform', arch: 'arch' };
    const code = { ...oldCode, bundleHash: 'reviewed-bundle', runnerHash: 'reviewed-runner', supportHash: 'reviewed-support' };
    const manifest = { code: oldCode, status: 'invalid', mode: 'story-summary-replay-natural-capture',
        capture: { requestJournal: { binding: preparedJournalBinding(config, oldCode),
            journalPath: path.join(config.outputPath, 'request-journal.jsonl'), maxRequests: 8 } },
        data: { sampleHash: 'sample', casesHash: 'cases' } };
    const sourceManifestPath = path.join(dir, 'manifest.json');
    await fs.writeFile(sourceManifestPath, JSON.stringify(manifest));
    const approval = { requestId: 2, journalSha256: 'a'.repeat(64), sourceManifestPath,
        sourceManifestSha256: await sha256File(sourceManifestPath) };
    const valid = await prepareUnknownRetry(config, code, approval);
    assert.equal(valid.previousBinding, preparedJournalBinding(config, oldCode));
    await assert.rejects(() => prepareUnknownRetry({ ...config, summaryApi: { model: 'changed' } }, code, approval), /binding changed/);
    for (const field of ['productionSourceHash', 'packageLockHash', 'nodeVersion', 'platform', 'arch']) {
        await assert.rejects(() => prepareUnknownRetry(config, { ...code, [field]: 'changed' }, approval), /changed/);
    }
    await assert.rejects(() => prepareUnknownRetry(config, code, { ...approval, requestId: 0 }), /exact request/);
    await fs.appendFile(sourceManifestPath, ' ');
    await assert.rejects(() => prepareUnknownRetry(config, code, approval), /hash changed/);
});

test('prepared jobs preserve common config, select one dataset and reject credentials', () => {
    const profile = { mode: 'natural-capture', goldEval: { enabled: true, reader: { enabled: false } },
        jobs: [{ id: 'a', samplePath: 'a.jsonl', goldEval: { casesPath: 'a-cases.jsonl' } }] };
    const config = selectPreparedJob(profile, 'a');
    assert.equal(config.samplePath, 'a.jsonl');
    assert.deepEqual(config.goldEval, { enabled: true, reader: { enabled: false }, casesPath: 'a-cases.jsonl' });
    assert.throws(() => selectPreparedJob(profile, 'missing'), /Unknown/);
    assert.doesNotThrow(() => assertCredentialFree(profile));
    assert.throws(() => assertCredentialFree({ vectorConfig: { embeddingApi: { key: 'test-only-secret' } } }), /must not contain/);
});

test('prepared input changes stop execution before any API', async t => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'prepared-replay-'));
    t.after(() => fs.rm(dir, { recursive: true, force: true }));
    const samplePath = path.join(dir, 'sample.jsonl');
    const casesPath = path.join(dir, 'cases.jsonl');
    await fs.writeFile(samplePath, 'original sample');
    await fs.writeFile(casesPath, 'original cases');
    const config = { samplePath, goldEval: { casesPath }, prepared: {
        sampleSha256: await sha256File(samplePath), casesSha256: await sha256File(casesPath), maxRequests: 2,
    } };
    await verifyPreparedInputs(config);
    await fs.writeFile(casesPath, 'changed cases');
    await assert.rejects(() => verifyPreparedInputs(config), /Prepared input changed/);
});

test('prepared execution rejects CLI overrides and unreviewed production source', () => {
    const args = ['--config=fixture.json', '--job=a'];
    assert.doesNotThrow(() => assertPreparedArguments([...args, '--preflight']));
    assert.doesNotThrow(() => assertPreparedArguments([...args, '--allow-api']));
    for (const override of ['reader-only', '--mode=reader-only', '--summary-api-url=https://unexpected.invalid', '--gold-case-id=x']) {
        assert.throws(() => assertPreparedArguments([...args, override]), /Prepared runs accept only/);
    }
    const hash = 'a'.repeat(64);
    const config = { prepared: { productionSourceHash: hash } };
    assert.doesNotThrow(() => verifyPreparedCode(config, { complete: true, productionSourceHash: hash }));
    assert.throws(() => verifyPreparedCode(config, { complete: true, productionSourceHash: 'b'.repeat(64) }), /source changed/);
    assert.throws(() => verifyPreparedCode(config, { complete: false, productionSourceHash: hash }), /unavailable/);
});

test('an already started prepared job cannot silently start a fresh batch', async t => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'prepared-started-'));
    t.after(() => fs.rm(dir, { recursive: true, force: true }));
    const config = { outputPath: path.join(dir, 'report') };
    await assertPreparedJobNotStarted(config);
    await fs.mkdir(config.outputPath);
    await assert.rejects(() => assertPreparedJobNotStarted(config), /already started/);
});

test('request cap includes failed dispatches, denies other origins and restores fetch', async () => {
    const previous = globalThis.fetch;
    const dispatched = [];
    const provider = async (input, init) => {
        dispatched.push({ input, init });
        return Response.json({}, { status: 500 });
    };
    globalThis.fetch = provider;
    const api = { url: 'https://fixture.invalid/v1' };
    const config = { summaryApi: api, vectorConfig: { l0Api: api, embeddingApi: api, rerankApi: api }, prepared: { maxRequests: 1 } };
    try {
        const observed = await withPreparedRequestBudget(config, () => withExternalCallTrace(async () => {
            await assert.rejects(() => fetch('https://unexpected.invalid'), error => error.goldFailure.kind === 'unapproved-origin');
            await fetch('https://fixture.invalid/v1/embeddings');
            await assert.rejects(() => fetch('https://fixture.invalid/v1/embeddings'), error => error.goldFailure.kind === 'request-budget');
        }));
        assert.equal(observed.calls, 1);
        assert.equal(observed.requestCount, 3);
        assert.deepEqual(observed.trace.map(row => row.source), ['local-guard', 'network', 'local-guard']);
        assert.equal(dispatched.length, 1);
        assert.equal(dispatched[0].init.redirect, 'error');
        assert.equal(globalThis.fetch, provider);
    } finally { globalThis.fetch = previous; }
});

test('preflight workload ends at the last query and keeps delayed summary eligibility', () => {
    const messages = Array.from({ length: 30 }, (_, i) => ({ is_user: i % 2 === 0, mes: 'fixture' }));
    let history = [];
    const result = describeNaturalWorkload({ messages, cases: [{ atFloor: 22 }],
        trigger: { enabled: true, timing: 'before_user', interval: 20, delayFloors: 2, maxPerRun: 100 },
        chunkMessage: () => [{}], setHistory: value => { history = value; },
        summarySlice: target => ({ count: 20, endMesId: target }),
    });
    assert.equal(result.lastQueryFloor, 22);
    assert.equal(result.aiTurns, 11);
    assert.equal(result.chunks, 22);
    assert.equal(result.chunkBatches, 11);
    assert.deepEqual(result.summaryBatches, [{ atFloor: 22, start: 0, end: 19, count: 20 }]);
    assert.equal(history.length, 22);
});
