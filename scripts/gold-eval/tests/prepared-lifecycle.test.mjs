/* global process */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { sha256Text, sha256File, loadGoldCapture } from '../lib/run-store.mjs';
import { createHash } from 'node:crypto';
import { createStrictTransportCassette } from '../lib/transport-cassette.mjs';
import { assertCredentialFree, selectPreparedJob } from '../../story-summary-replay/prepared-config.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const preload = new URL('./fixtures/offline-provider.mjs', import.meta.url).href;
const exec = promisify(execFile);

// Production fingerprint is an on-disk execution contract, not a source-text test.
async function productionHash() {
    const files = [];
    async function visit(dir) {
        for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
            if (entry.name === 'tests' && entry.isDirectory()) continue;
            const name = path.join(dir, entry.name);
            if (entry.isDirectory()) await visit(name);
            else if (entry.isFile()) files.push(name);
        }
    }
    await visit(path.join(root, 'modules', 'story-summary'));
    const digest = createHash('sha256');
    for (const name of files.sort((a, b) => a.localeCompare(b))) {
        digest.update(path.relative(root, name).replaceAll('\\', '/')); digest.update('\0');
        digest.update(await fs.readFile(name)); digest.update('\0');
    }
    return digest.digest('hex');
}

async function fixture(t, timing) {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-offline-flow-'));
    t.after(() => fs.rm(directory, { recursive: true, force: true }));
    const messages = Array.from({ length: 20 }, (_, floor) => ({ is_user: floor % 2 === 1,
        name: floor % 2 ? '用户' : '角色', mes: floor % 2 ? `第${floor}轮，银色钥匙放在哪里？`
            : `第${floor}轮，角色把银色钥匙交给用户，用户将钥匙放进蓝色盒子里，确认已经收好。` }));
    messages[19].mes = 'FUTURE_MUST_NOT_APPEAR';
    const cases = [9, 17].map(floor => ({ schemaVersion: 2, id: `fixture-${floor}`, corpusId: 'fixture', split: 'dev',
        track: 'natural', category: 'unclassified', query: { kind: 'verbatim-user', floor, text: messages[floor].mes,
            sha256: sha256Text(messages[floor].mes) }, historyThroughFloor: floor - 1,
        expectedAnswer: { type: 'evidence-only' },
        evidence: { requiredAll: [0], requiredAny: [], requiredAnyGroups: [], supporting: [], forbiddenAsCurrent: [] },
        provenance: { queryOrigin: 'verbatim-user-message', goldMethod: 'source-evidence-verified', verifier: 'independent', status: 'accepted' } }));
    const samplePath = path.join(directory, 'sample.jsonl');
    const casesPath = path.join(directory, 'cases.jsonl');
    await fs.writeFile(samplePath, messages.map(value => JSON.stringify(value)).join('\n'));
    await fs.writeFile(casesPath, cases.map(value => JSON.stringify(value)).join('\n'));
    const api = model => ({ provider: 'custom', url: 'https://offline-fixture.invalid/v1', model,
        providers: { custom: { url: 'https://offline-fixture.invalid/v1', model } } });
    const profile = { mode: 'natural-capture', name1: '用户', name2: '角色', samplePath,
        summaryApi: { ...api('fixture-summary'), useStream: false, maxPerRun: 100, maxTokens: 30000, temperature: 0 },
        summaryTriggerInterval: 4, panelConfig: { trigger: { enabled: true, timing, delayFloors: 2 } },
        vectorConfig: { enabled: true, l0Concurrency: 10, l0Api: api('fixture-l0'),
            embeddingApi: api('fixture-embedding'), rerankApi: api('fixture-rerank') },
        requestRecovery: { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 100 },
        credentialsPath: path.join(directory, 'fixture-credentials.json'),
        goldEval: { enabled: true, casesPath, split: 'dev', reader: { enabled: false }, minEvidenceDistanceFloors: 4,
            turnIntervalMinMs: 1, turnIntervalMaxMs: 1, runsRoot: path.join(directory, 'runs') },
        prepared: { sampleSha256: await sha256File(samplePath), casesSha256: await sha256File(casesPath),
            productionSourceHash: await productionHash(), maxRequests: 200 },
        jobs: [{ id: 'check', outputPath: path.join(directory, 'output'), goldEval: { runName: 'offline-check' } }],
    };
    const credentials = structuredClone(profile);
    credentials.summaryApi.key = 'offline-fixture-key';
    for (const key of ['l0Api', 'embeddingApi', 'rerankApi']) credentials.vectorConfig[key].key = 'offline-fixture-key';
    await fs.writeFile(profile.credentialsPath, JSON.stringify(credentials));
    const configPath = path.join(directory, 'config.json');
    await fs.writeFile(configPath, JSON.stringify(profile));
    const log = path.join(directory, 'calls.jsonl');
    const invoke = async (flags = [], environment = {}, timeout = 45000) => {
        try {
            const result = await exec(process.execPath, ['--import', preload, 'scripts/story-summary-replay-runner.mjs',
                `--config=${configPath}`, '--job=check', ...flags], { cwd: root, timeout, maxBuffer: 12 * 1024 * 1024,
                env: { ...process.env, LWB_OFFLINE_CALL_LOG: log, ...environment } });
            return { code: 0, output: result.stdout + result.stderr };
        } catch (error) { return { code: error.code,
            output: String(error.stdout) + String(error.stderr) + (error.killed ? `\nOffline CLI exceeded ${timeout}ms` : '') }; }
    };
    return { directory, profile, configPath, invoke, log, async calls() {
        try { return (await fs.readFile(log, 'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse); }
        catch (error) { if (error.code === 'ENOENT') return []; throw error; }
    } };
}

async function validateCapture(item, resumed, expectedCases = 2) {
    const report = JSON.parse(await fs.readFile(path.join(item.directory, 'output', 'story-summary-replay-report.json'), 'utf8'));
    const dirs = await fs.readdir(path.join(item.directory, 'runs'));
    const captures = await Promise.all(dirs.map(async dir => ({ dir, manifest: JSON.parse(await fs.readFile(
        path.join(item.directory, 'runs', dir, 'manifest.json'), 'utf8')) })));
    const valid = captures.filter(value => value.manifest.status === 'valid');
    assert.equal(valid.length, 1);
    const captured = await loadGoldCapture(path.join(item.directory, 'runs', valid[0].dir));
    assert.equal(captured.cases.length, expectedCases);
    assert.equal(captured.manifest.capture.requestJournal.resumed, resumed);
    assert.equal(captured.manifest.capture.latencyComparable, !resumed && !item.profile.responseArchive?.length);
    for (const row of captured.transportTrace) createStrictTransportCassette(row.production);
    for (const reference of captured.manifest.boundarySnapshots) {
        const snapshot = JSON.parse(await fs.readFile(reference.path, 'utf8'));
        assert.equal(snapshot.sample.messageCount, reference.queryFloor);
        assert.equal(JSON.stringify(snapshot).includes('FUTURE_MUST_NOT_APPEAR'), false);
    }
    assert.ok(captured.prompts.every(row => !JSON.stringify(row).includes('FUTURE_MUST_NOT_APPEAR')));
    assert.equal(JSON.stringify(report).includes('offline-fixture-key'), false);
    return captured;
}

test('evaluation low effort is sent only on later Summary requests without changing other models', async t => {
    const item = await fixture(t, 'before_user');
    item.profile.evaluationSummaryRequest = { reasoningEffort: 'low', fromFloor: 10 };
    await fs.writeFile(item.configPath, JSON.stringify(item.profile));
    const result = await item.invoke(['--allow-api']);
    assert.equal(result.code, 0, result.output);
    const calls = await item.calls();
    const summaries = calls.filter(row => row.kind === 'fixture-summary');
    assert.ok(summaries.some(row => row.reasoningEffort === null));
    assert.ok(summaries.some(row => row.reasoningEffort === 'low'));
    assert.ok(calls.filter(row => row.kind !== 'fixture-summary').every(row => row.reasoningEffort === null));
    await validateCapture(item, false);
});

test('pinned archive reuses cleaned requests across jobs; changed requests resume without repurchase', async t => {
    const original = await fixture(t, 'before_user');
    const first = await original.invoke(['--allow-api']);
    assert.equal(first.code, 0, first.output.slice(-9000));
    const originalCapture = await validateCapture(original, false);
    const manifestPath = path.join(original.directory, 'runs', originalCapture.manifest.runId, 'manifest.json');
    const archive = [{ path: manifestPath, sha256: await sha256File(manifestPath) }];
    for (const changed of [false, true]) {
        const item = await fixture(t, 'before_user');
        item.profile.responseArchive = archive;
        item.profile.textFilterRules = [{ start: '<plot>', end: '</plot>' }];
        const messages = (await fs.readFile(item.profile.samplePath, 'utf8')).split('\n').map(JSON.parse);
        for (const message of messages.filter(message => !message.is_user)) message.mes += '<plot>Excluded outline</plot>';
        if (changed) messages[0].mes += ' 另有一把铜钥匙留在窗台。';
        await fs.writeFile(item.profile.samplePath, messages.map(message => JSON.stringify(message)).join('\n'));
        item.profile.prepared.sampleSha256 = await sha256File(item.profile.samplePath);
        // Archive hits must not consume the new job's network budget.
        if (!changed) item.profile.prepared.maxRequests = 1;
        await fs.writeFile(item.configPath, JSON.stringify(item.profile));
        const preflight = await item.invoke(['--preflight'], { LWB_OFFLINE_FORBID_CREDENTIALS: '1' });
        assert.equal(preflight.code, 0, preflight.output.slice(-9000));
        const started = await item.invoke(['--allow-api'], changed ? { LWB_OFFLINE_KILL_RECEIPT: '2' } : {});
        if (changed) {
            assert.equal(started.code, 86, started.output.slice(-9000));
            const prefix = await item.calls();
            assert.equal(prefix.length, 2);
            const resumed = await item.invoke(['--allow-api', '--resume-prepared']);
            assert.equal(resumed.code, 0, resumed.output.slice(-9000));
            const calls = await item.calls();
            assert.deepEqual(calls.slice(0, 2), prefix);
            for (const call of prefix) assert.equal(calls.filter(row => row.requestHash === call.requestHash).length, 1);
        } else {
            assert.equal(started.code, 0, started.output.slice(-9000));
            assert.equal((await item.calls()).length, 0);
        }
        const capture = await validateCapture(item, changed);
        const rows = capture.transportTrace.flatMap(row => [...row.preparation, ...row.production]);
        assert.ok(rows.some(row => row.source === 'archive'));
        assert.ok(rows.filter(row => row.source === 'archive').every(row => row.receipt.archive.manifestSha256 === archive[0].sha256));
        if (changed) assert.ok(rows.some(row => row.source === 'journal'));
        else assert.ok(rows.every(row => row.source === 'archive'));
        assert.equal(capture.manifest.progress.productionExternalCalls,
            (await item.calls()).length - (changed ? 2 : 0));
    }
});

test('actual prepared CLI: empty store through both trigger timings, L0/L1/L2, two recalls and capture', async t => {
    for (const timing of ['before_user', 'after_ai']) {
        const item = await fixture(t, timing);
        const preflight = await item.invoke(['--preflight'], { LWB_OFFLINE_FORBID_CREDENTIALS: '1' });
        assert.equal(preflight.code, 0, preflight.output.slice(-6000));
        assert.equal((await item.calls()).length, 0);
        const result = await item.invoke(['--allow-api']);
        assert.equal(result.code, 0, result.output.slice(-9000));
        await validateCapture(item, false);
        const calls = await item.calls();
        assert.deepEqual([...new Set(calls.map(row => row.kind))].sort(),
            ['fixture-embedding', 'fixture-l0', 'fixture-rerank', 'fixture-summary']);
        const again = await item.invoke(['--allow-api']);
        assert.notEqual(again.code, 0);
        assert.equal((await item.calls()).length, calls.length);
    }
});

// Optional local acceptance against the owner's read-only dev inputs. Models,
// credentials and output paths are replaced BEFORE entering the real CLI.
// This is still a transport fixture, NOT a semantic evaluation or live baseline.
if (process.env.LWB_OFFLINE_REAL_PROFILE) test('read-only dev datasets traverse the full offline CLI', async t => {
    const original = JSON.parse(await fs.readFile(process.env.LWB_OFFLINE_REAL_PROFILE, 'utf8'));
    assertCredentialFree(original);
    const requested = process.env.LWB_OFFLINE_REAL_JOB;
    if (requested) assert.ok(['real-300', 'real-240', 'real-240-ui-clean', 'real-800'].includes(requested));
    for (const jobId of requested ? [requested] : ['real-300', 'real-240', 'real-800']) {
        const item = await fixture(t, 'before_user');
        const job = selectPreparedJob(original, jobId);
        assert.equal(job.goldEval.split, 'dev');
        const profile = { ...job, responseArchive: [], summaryApi: item.profile.summaryApi, vectorConfig: item.profile.vectorConfig,
            credentialsPath: item.profile.credentialsPath, outputPath: item.profile.jobs[0].outputPath,
            goldEval: { ...job.goldEval, reader: { enabled: false }, runsRoot: item.profile.goldEval.runsRoot,
                turnIntervalMinMs: 1, turnIntervalMaxMs: 1 },
            jobs: item.profile.jobs };
        await fs.writeFile(item.configPath, JSON.stringify(profile));
        const result = await item.invoke(['--allow-api'], {}, 180000);
        assert.equal(result.code, 0, `${jobId}: ${result.output.slice(-9000)}`);
        const capture = await validateCapture(item, false, jobId === 'real-800' ? 6 : 1);
        const calls = await item.calls();
        assert.equal(capture.manifest.progress.productionExternalCalls, calls.length);
        t.diagnostic(`${jobId}: ${capture.cases.length} cases, ${calls.length} fixture dispatches, real API=0`);
    }
});

test('receipt-only CLI replays without credentials, network dispatch or journal changes', async t => {
    const item = await fixture(t, 'before_user');
    const interrupted = await item.invoke(['--allow-api'], { LWB_OFFLINE_KILL_RECEIPT: '14' });
    assert.equal(interrupted.code, 86, interrupted.output.slice(-6000));
    const journalPath = path.join(item.directory, 'output', 'request-journal.jsonl');
    const before = await fs.readFile(journalPath);
    const calls = await item.calls();
    const checked = await item.invoke(['--resume-prepared', '--check-prepared-resume'],
        { LWB_OFFLINE_FORBID_CREDENTIALS: '1' });
    assert.equal(checked.code, 0, checked.output.slice(-6000));
    const receipt = JSON.parse(checked.output.split('\n').find(line => line.startsWith('[prepared-receipt-check] '))
        .slice('[prepared-receipt-check] '.length));
    assert.deepEqual(receipt, { networkCalls: 0, replayedResponses: 14, priorRequests: 14,
        journalUnchanged: true, qualityMeasured: false });
    assert.deepEqual(await fs.readFile(journalPath), before);
    assert.deepEqual(await item.calls(), calls);
});

test('actual process restart reuses saved L0/summary/embedding/rerank responses without repeat spend', async t => {
    for (const interruptAt of [2, 3, 13, 14, 20, 30]) {
        const item = await fixture(t, 'before_user');
        const first = await item.invoke(['--allow-api'], { LWB_OFFLINE_KILL_RECEIPT: String(interruptAt) });
        assert.equal(first.code, 86, first.output.slice(-6000));
        const prefix = await item.calls();
        assert.equal(prefix.length, interruptAt);
        const resumed = await item.invoke(['--allow-api', '--resume-prepared']);
        assert.equal(resumed.code, 0, resumed.output.slice(-9000));
        const capture = await validateCapture(item, true);
        const traces = capture.transportTrace.flatMap(row => [...(row.preparation || []), ...row.production]);
        assert.ok(traces.some(row => row.source === 'journal'));
        const receipts = (await fs.readFile(path.join(item.directory, 'output', 'request-journal.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
        const intents = receipts.filter(row => row.type === 'intent');
        assert.equal((await item.calls()).length, intents.length);
        assert.equal(receipts.filter(row => row.type === 'response').length, intents.length);
        assert.deepEqual((await item.calls()).slice(0, interruptAt), prefix);
    }
});

test('actual CLI retains failures: unknown outcome and disk-full refuse resume before credentials', async t => {
    for (const scenario of [{ LWB_OFFLINE_KILL_INTENT: '2' }, { LWB_OFFLINE_DISK_FAIL: '2' }]) {
        const item = await fixture(t, 'before_user');
        const failed = await item.invoke(['--allow-api'], scenario);
        assert.notEqual(failed.code, 0);
        const calls = await item.calls();
        assert.equal(calls.length, 2);
        const resumed = await item.invoke(['--allow-api', '--resume-prepared'], { LWB_OFFLINE_FORBID_CREDENTIALS: '1' });
        assert.match(resumed.output, /unknown-request-outcome/);
        assert.equal((await item.calls()).length, calls.length);
    }
});

test('actual CLI authorizes one unknown L0, retains accurate failure trace and reuses saved responses', async t => {
    const item = await fixture(t, 'before_user');
    const failed = await item.invoke(['--allow-api'], { LWB_OFFLINE_LOSE_MODEL: 'fixture-l0' });
    assert.notEqual(failed.code, 0);
    const originalCalls = await item.calls();
    assert.equal(originalCalls.length, 2);
    const runNames = await fs.readdir(path.join(item.directory, 'runs'));
    const source = path.join(item.directory, 'runs', runNames[0], 'manifest.json');
    const sourceManifest = JSON.parse(await fs.readFile(source, 'utf8'));
    assert.equal(sourceManifest.progress.productionExternalCalls, 2);
    const failedCheckpoint = JSON.parse(await fs.readFile(path.join(item.directory, 'runs', runNames[0],
        'checkpoints', '0001-fixture-9-FAILED.json'), 'utf8'));
    assert.equal(failedCheckpoint.failure.requestId, 2);
    assert.equal(failedCheckpoint.failure.transmitted, true);
    assert.equal(failedCheckpoint.failure.transportCode, 'ECONNRESET');
    assert.equal(failedCheckpoint.transport.length, 2);
    const journal = path.join(item.directory, 'output', 'request-journal.jsonl');
    const prefix = await fs.readFile(journal, 'utf8');
    const flags = ['--allow-api', '--resume-prepared', '--retry-unknown=2',
        `--retry-journal-sha256=${await sha256File(journal)}`, `--retry-source-manifest=${source}`,
        `--retry-source-sha256=${await sha256File(source)}`];
    const wrong = await item.invoke(flags.map(flag => flag === '--retry-unknown=2' ? '--retry-unknown=1' : flag),
        { LWB_OFFLINE_FORBID_CREDENTIALS: '1' });
    assert.match(wrong.output, /retry-target-not-unknown/);
    assert.equal(await fs.readFile(journal, 'utf8'), prefix);
    const resumed = await item.invoke(flags);
    assert.equal(resumed.code, 0, resumed.output.slice(-9000));
    const capture = await validateCapture(item, true);
    assert.equal(capture.manifest.capture.requestJournal.priorRequests, 2);
    assert.deepEqual(capture.manifest.capture.requestJournal.authorizedUnknownRequests, [2]);
    const calls = await item.calls();
    assert.deepEqual(calls.slice(0, 2), originalCalls);
    assert.deepEqual(calls[2], originalCalls[1], 'only the unknown original request is repeated');
    assert.equal(calls.filter(call => call.requestHash === originalCalls[0].requestHash).length, 1);
    assert.ok((await fs.readFile(journal, 'utf8')).startsWith(prefix));
});

test('actual CLI retries only the failed provider call at each of the four API boundaries', async t => {
    for (const [kind, timing] of [
        ...['fixture-l0', 'fixture-summary', 'fixture-embedding', 'fixture-rerank'].map(kind => [kind, 'before_user']),
        ['fixture-summary', 'after_ai'],
    ]) {
        const item = await fixture(t, timing);
        const result = await item.invoke(['--allow-api'], { LWB_OFFLINE_FAIL_MODEL: kind });
        assert.equal(result.code, 0, result.output.slice(-9000));
        const capture = await validateCapture(item, false);
        const rows = capture.transportTrace.flatMap(row => [...row.preparation, ...row.production]);
        assert.equal(rows.filter(row => row.status === 429).length, 1);
        const failed = rows.find(row => row.status === 429);
        assert.equal(rows.filter(row => row.requestHash === failed.requestHash && row.model === failed.model
            && row.status === 200 && row.preparationStage === failed.preparationStage).length, 1);
        assert.equal(rows.length, (await item.calls()).length);
    }
});

test('actual CLI rejects permanent/malformed responses without retrying or starting the next case', async t => {
    for (const environment of [{ LWB_OFFLINE_FAIL_MODEL: 'fixture-l0', LWB_OFFLINE_STATUS: '401' },
        { LWB_OFFLINE_FAIL_MODEL: 'fixture-l0', LWB_OFFLINE_STATUS: '429', LWB_OFFLINE_PERSISTENT: '1' },
        { LWB_OFFLINE_MALFORMED: 'fixture-summary' }]) {
        const item = await fixture(t, 'before_user');
        const failed = await item.invoke(['--allow-api'], environment);
        assert.notEqual(failed.code, 0);
        const calls = await item.calls();
        assert.equal(calls.filter(row => row.kind === (environment.LWB_OFFLINE_MALFORMED || environment.LWB_OFFLINE_FAIL_MODEL)).length,
            environment.LWB_OFFLINE_PERSISTENT ? 3 : 1);
        const resumed = await item.invoke(['--allow-api', '--resume-prepared']);
        assert.notEqual(resumed.code, 0);
        assert.equal((await item.calls()).length, calls.length);
    }
});
