import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { prepareGoldEvalPlan, runGoldEvalCases } from '../replay-session.mjs';
import { validateCase } from '../lib/cases.mjs';
import { beginGoldRun, sha256File, sha256Text } from '../lib/run-store.mjs';
import { summarizeExternalRequest, withExternalCallTrace } from '../lib/transport-cassette.mjs';

function makeCase(id) {
    const checked = validateCase({
        id,
        dataset: 'synthetic',
        split: 'dev',
        category: 'fact',
        atFloor: 0,
        query: '答案是什么？',
        expectedAnswer: { type: 'exact', values: ['答案'] },
        evidence: {
            requiredAll: [0],
            requiredAny: [],
            supporting: [],
            forbiddenAsCurrent: [],
        },
        provenance: { method: 'fixture', verifier: 'author', status: 'accepted' },
    });
    assert.equal(checked.ok, true, checked.errors.join('; '));
    return checked.case;
}

test('goldEval.caseIds 在 limit 前精确选择 case，未知 id 在执行前拒绝', async t => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-gold-case-ids-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const casesPath = path.join(tempDir, 'cases.jsonl');
    const cases = ['case-a', 'case-b', 'case-c'].map(makeCase);
    await fs.writeFile(casesPath, `${cases.map(item => JSON.stringify(item)).join('\n')}\n`, 'utf8');
    const goldEval = {
        enabled: true,
        casesPath,
        runsRoot: tempDir,
        split: 'dev',
        caseIds: ['case-c', 'case-a', 'case-b'],
        limit: 2,
    };

    const plan = await prepareGoldEvalPlan({
        rootDir: tempDir,
        config: { goldEval },
        boundaryFloor: 0,
    });
    assert.deepEqual(plan.cases.map(item => item.id), ['case-c', 'case-a']);

    await assert.rejects(
        prepareGoldEvalPlan({
            rootDir: tempDir,
            config: { goldEval: { ...goldEval, caseIds: ['case-a', 'missing'], limit: 1 } },
            boundaryFloor: 0,
        }),
        /未加载 case: missing/,
    );
});

function modulesFixture() {
    return {
        getSummaryStore: () => ({ json: { events: [], facts: [] } }),
        getContext: () => ({ chatId: 'fixture-chat' }),
        getAllChunks: async () => [],
        getStateAtoms: () => [],
    };
}

function successfulExecution(externalCalls = 5) {
    const ranked = [{ floor: 0, rank: 1, score: 1, unitId: 'fixture:0' }];
    const responseBody = { data: [{ embedding: [0.1] }] };
    const transportTrace = Array.from({ length: externalCalls }, (_, index) => ({
        index,
        endpoint: 'embedding',
        host: 'api.example.com',
        path: '/v1/embeddings',
        method: 'POST',
        model: 'embed-a',
        requestHash: sha256Text(`fixture-request-${index}`),
        status: 200,
        rateHeaders: {},
        responseBody,
        responseHash: sha256Text(JSON.stringify(responseBody)),
    }));
    return {
        normalizedRecall: { metrics: { external: { failures: [] } } },
        promptText: '答案',
        promptInput: {
            schemaVersion: 1,
            recallResult: { events: [], l0Selected: [], causalChain: [], l1ByFloorEntries: [] },
            meta: {},
            wrapperHead: '',
            wrapperTail: '',
        },
        evidenceTrace: { final: ranked, prompt: ranked },
        recallMs: 1000,
        externalCalls,
        externalRequests: externalCalls,
        transportTrace,
        reportCase: {},
    };
}

test('Gold Eval 用可复现的用户回合抖动控制 case 启动节奏，且不改变题内执行', async t => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-gold-pacing-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const samplePath = path.join(tempDir, 'sample.jsonl');
    const snapshotPath = path.join(tempDir, 'snapshot.json');
    await fs.writeFile(samplePath, '{}\n', 'utf8');
    await fs.writeFile(snapshotPath, '{}\n', 'utf8');

    let now = 0;
    const starts = [];
    const waits = [];
    const executeRecallCase = async () => {
        starts.push(now);
        now += 1000;
        return successfulExecution(5);
    };

    const result = await runGoldEvalCases({
        modules: modulesFixture(),
        goldPlan: {
            cases: [
                makeCase('fixture-pacing-001'),
                makeCase('fixture-pacing-002'),
                makeCase('fixture-pacing-003'),
            ],
            casesPath: samplePath,
            casesHash: 'fixture-cases-hash',
            runsRoot: tempDir,
            runName: 'pacing-contract',
            caseIntervalMinMs: 12000,
            caseIntervalMaxMs: 15000,
        },
        sample: { messages: [{ mes: '答案' }] },
        samplePath,
        snapshotPath,
        config: {
            goldEval: { reader: { enabled: false }, caseIntervalMinMs: 12000, caseIntervalMaxMs: 15000 },
        },
        executeRecallCase,
        clock: () => now,
        wait: async delayMs => {
            waits.push(delayMs);
            now += delayMs;
        },
    });

    const startIntervals = starts.slice(1).map((startedAt, index) => startedAt - starts[index]);
    assert.equal(startIntervals.length, 2);
    assert.ok(startIntervals.every(interval => interval >= 12000 && interval <= 15000));
    assert.equal(new Set(startIntervals).size, 2);
    assert.ok(waits.every(delay => delay >= 11000 && delay <= 14000));
    assert.deepEqual(result.manifest.config.pacing, {
        caseIntervalMinMs: 12000,
        caseIntervalMaxMs: 15000,
        strategy: 'deterministic-jitter-from-cases-hash-and-case-id',
        scope: 'case-start cadence; production execution inside each case is unchanged',
    });
    assert.equal(result.manifest.status, 'valid');
    const prompts = await fs.readFile(result.artifacts.files.prompts, 'utf8');
    assert.match(prompts, /"promptText":"答案"/);
    const promptInputs = await fs.readFile(result.artifacts.files.promptInputs, 'utf8');
    assert.match(promptInputs, /"observationBase"/);
});

test('Gold Eval 首个外部错误立即终止并自动落盘 invalid，不执行后续 case', async t => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-gold-invalid-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const samplePath = path.join(tempDir, 'sample.jsonl');
    const snapshotPath = path.join(tempDir, 'snapshot.json');
    await fs.writeFile(samplePath, '{}\n', 'utf8');
    await fs.writeFile(snapshotPath, '{}\n', 'utf8');
    let executeCount = 0;
    let waitCount = 0;
    const failedExecution = successfulExecution(5);
    failedExecution.normalizedRecall.metrics.external.failures.push({
        stage: 'rerank',
        kind: 'http',
        status: 429,
        batchIndex: 0,
    });

    await assert.rejects(() => runGoldEvalCases({
        modules: modulesFixture(),
        goldPlan: {
            cases: [makeCase('fixture-stop-001'), makeCase('fixture-stop-002')],
            casesPath: samplePath,
            runsRoot: tempDir,
            runName: 'invalid-contract',
            casesHash: 'fixture-cases-hash',
            caseIntervalMinMs: 12000,
            caseIntervalMaxMs: 15000,
        },
        sample: { messages: [{ mes: '答案' }] },
        samplePath,
        snapshotPath,
        config: { goldEval: { reader: { enabled: false } } },
        executeRecallCase: async () => {
            executeCount += 1;
            return failedExecution;
        },
        clock: () => 0,
        wait: async () => {
            waitCount += 1;
        },
    }), /Gold Eval 已中止.*rerank.*429/);

    assert.equal(executeCount, 1);
    assert.equal(waitCount, 0);
    const runDirs = (await fs.readdir(tempDir, { withFileTypes: true }))
        .filter(entry => entry.isDirectory())
        .map(entry => path.join(tempDir, entry.name));
    assert.equal(runDirs.length, 1);
    const manifest = JSON.parse(await fs.readFile(path.join(runDirs[0], 'manifest.json'), 'utf8'));
    assert.equal(manifest.status, 'invalid');
    assert.equal(manifest.progress.completedCases, 0);
    assert.equal(manifest.progress.attemptedCaseId, 'fixture-stop-001');
    assert.match(await fs.readFile(path.join(runDirs[0], 'INVALID.md'), 'utf8'), /rerank.*429/s);
});

test('recall-cassette 按 case id 复放 source 子集、跳过节奏等待且 production network 为零', async t => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-gold-cassette-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const samplePath = path.join(tempDir, 'sample.jsonl');
    const snapshotPath = path.join(tempDir, 'snapshot.json');
    await fs.writeFile(samplePath, '{}\n', 'utf8');
    await fs.writeFile(snapshotPath, '{}\n', 'utf8');
    const [sampleHash, snapshotHash] = await Promise.all([
        sha256File(samplePath),
        sha256File(snapshotPath),
    ]);
    const sourceCases = [makeCase('fixture-cassette-001'), makeCase('fixture-cassette-002')];
    const selectedCase = sourceCases[1];
    const bodies = sourceCases.map(goldCase => JSON.stringify({ model: 'embed-a', input: [goldCase.id] }));
    const responseBodies = sourceCases.map((_, index) => ({ data: [{ embedding: [index, index + 1] }] }));
    const transportRows = sourceCases.map((_, index) => ({
        ...summarizeExternalRequest('https://api.example.com/v1/embeddings', {
            method: 'POST',
            body: bodies[index],
        }),
        status: 200,
        rateHeaders: {},
        responseBody: responseBodies[index],
        responseHash: sha256Text(JSON.stringify(responseBodies[index])),
    }));
    const source = await beginGoldRun({
        runsRoot: tempDir,
        runId: 'source-capture',
        manifest: {
            runId: 'source-capture',
            mode: 'story-summary-replay-gold-capture',
            data: { sampleHash, snapshotHash },
            capture: {
                containsFullPrompts: true,
                containsPromptInputs: true,
                containsTransportTrace: true,
                containsTransportCassette: true,
            },
        },
        cases: sourceCases,
    });
    const prompts = sourceCases.map(goldCase => ({
        schemaVersion: 1,
        caseId: goldCase.id,
        promptText: '答案',
        promptHash: sha256Text('答案'),
        promptChars: 2,
        evidenceTrace: { final: [], prompt: [] },
    }));
    const promptInputs = sourceCases.map(goldCase => ({
        schemaVersion: 1,
        caseId: goldCase.id,
        production: {},
        observationBase: {},
    }));
    for (const [index, goldCase] of sourceCases.entries()) {
        await source.commitCase({
            index,
            caseId: goldCase.id,
            capture: {},
            productionExternalCalls: 1,
            productionTransportRequests: 1,
        });
    }
    await source.complete({
        prompts,
        promptInputs,
        transportTrace: sourceCases.map((goldCase, index) => ({
            schemaVersion: 1,
            caseId: goldCase.id,
            production: [transportRows[index]],
        })),
        stageTraces: sourceCases.map(goldCase => ({ id: goldCase.id })),
        metrics: {},
        failures: [],
        reportMarkdown: 'source',
    });

    const originalFetch = globalThis.fetch;
    let networkCalls = 0;
    globalThis.fetch = async () => {
        networkCalls += 1;
        throw new Error('recall-cassette 不得联网');
    };
    try {
        const result = await runGoldEvalCases({
            modules: modulesFixture(),
            goldPlan: {
                cases: [selectedCase],
                casesPath: samplePath,
                casesHash: 'fixture-cases-hash',
                runsRoot: tempDir,
                runName: 'cassette-contract',
                caseIntervalMinMs: 12000,
                caseIntervalMaxMs: 15000,
                captureRunDir: source.runDir,
            },
            sample: { messages: [{ mes: '答案' }] },
            samplePath,
            snapshotPath,
            config: {
                mode: 'recall-cassette',
                goldEval: { reader: { enabled: false } },
            },
            executeRecallCase: async (recallCase, _observer, cassette) => {
                assert.equal(recallCase.label, selectedCase.id);
                const counted = await withExternalCallTrace(async () => {
                    const response = await fetch('https://api.example.com/v1/embeddings', {
                        method: 'POST',
                        body: bodies[1],
                    });
                    return await response.json();
                }, { cassette });
                assert.deepEqual(counted.value, responseBodies[1]);
                return {
                    ...successfulExecution(counted.calls),
                    externalRequests: counted.requestCount,
                    transportTrace: counted.trace,
                };
            },
            wait: async () => assert.fail('recall-cassette 不应等待 live API 回合节奏'),
        });
        assert.equal(networkCalls, 0);
        assert.equal(result.manifest.mode, 'story-summary-replay-gold-recall-cassette');
        assert.equal(result.manifest.sourceCapture.runId, 'source-capture');
        assert.equal(result.manifest.progress.productionExternalCalls, 0);
        assert.equal(result.manifest.progress.productionTransportRequests, 1);
    } finally {
        globalThis.fetch = originalFetch;
    }
});
