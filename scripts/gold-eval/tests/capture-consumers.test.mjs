import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { validateCase } from '../lib/cases.mjs';
import {
    beginGoldRun,
    invalidateGoldRun,
    loadGoldCapture,
    sha256File,
    sha256Text,
} from '../lib/run-store.mjs';
import {
    createStrictTransportCassette,
    summarizeExternalRequest,
    withExternalCallTrace,
} from '../lib/transport-cassette.mjs';
import { runGoldPromptOnly } from '../prompt-session.mjs';
import { runGoldReaderOnly } from '../reader-session.mjs';

function goldCase(id = 'fixture-capture-001') {
    const checked = validateCase({
        id,
        dataset: 'synthetic',
        split: 'dev',
        category: 'fact',
        atFloor: 0,
        query: '答案是什么？',
        expectedAnswer: { type: 'exact', values: ['答案'] },
        evidence: { requiredAll: [0], requiredAny: [], supporting: [], forbiddenAsCurrent: [] },
        provenance: { method: 'fixture', verifier: 'author', status: 'accepted' },
    });
    assert.equal(checked.ok, true, checked.errors.join('; '));
    return checked.case;
}

function observationBase() {
    const ranked = [{ floor: 0, rank: 1, score: 1, source: 'fixture', unitId: 'fixture:0' }];
    return {
        extractedFloors: [0],
        evidenceTextsByFloor: { 0: ['答案'] },
        stages: {
            r1Dense: ranked,
            r2Dense: ranked,
            lexical: [],
            fusion: ranked,
            rerank: ranked,
            graph: [],
            final: [],
            prompt: [],
        },
        timeline: [],
        efficiency: { recallMs: 10, externalCalls: 5, readerMs: null, readerCalls: 0, promptChars: 2 },
    };
}

async function createCapture(rootDir, { productionTransport = [], caseCount = 1 } = {}) {
    const cases = Array.from({ length: caseCount }, (_, index) => (
        goldCase(`fixture-capture-${String(index + 1).padStart(3, '0')}`)
    ));
    const bundlePath = path.join(rootDir, 'fixture-bundle.mjs');
    const archivedSourcePath = path.join(rootDir, 'fixture-source.mjs');
    const samplePath = path.join(rootDir, 'sample.jsonl');
    const snapshotPath = path.join(rootDir, 'snapshot.json');
    await fs.writeFile(bundlePath, 'export {};\n', 'utf8');
    await fs.writeFile(archivedSourcePath, 'export const fixture = true;\n', 'utf8');
    await fs.writeFile(samplePath, '{"fixture":true}\n', 'utf8');
    await fs.writeFile(snapshotPath, '{"fixture":true}\n', 'utf8');
    const [sampleHash, snapshotHash] = await Promise.all([
        sha256File(samplePath),
        sha256File(snapshotPath),
    ]);
    const bundleHash = await sha256File(bundlePath);
    const run = await beginGoldRun({
        runsRoot: rootDir,
        runId: 'source-capture',
        manifest: {
            runId: 'source-capture',
            mode: 'story-summary-replay-gold-capture',
            data: { casesHash: 'cases-hash', sampleHash, snapshotHash },
            code: { bundleHash },
            capture: {
                containsFullPrompts: true,
                containsPromptInputs: true,
                containsTransportTrace: true,
                containsTransportCassette: true,
            },
        },
        cases,
        bundlePath,
        codeArtifacts: [{ source: archivedSourcePath, destination: 'fixture-source.mjs' }],
    });
    const evidenceTrace = {
        final: [{ floor: 0, rank: 1, score: 1, source: 'fixture', unitId: 'fixture:0' }],
        prompt: [{ floor: 0, rank: 1, score: 1, source: 'fixture', unitId: 'fixture:0' }],
    };
    const prompts = [];
    const promptInputs = [];
    const stageTraces = [];
    const transportTrace = [];
    for (const [index, oneCase] of cases.entries()) {
        const prompt = {
            schemaVersion: 1,
            caseId: oneCase.id,
            promptText: '答案',
            promptHash: sha256Text('答案'),
            promptChars: 2,
            evidenceTrace,
        };
        const promptInput = {
            schemaVersion: 1,
            caseId: oneCase.id,
            production: {
                schemaVersion: 1,
                recallResult: { events: [], l0Selected: [], causalChain: [], l1ByFloorEntries: [] },
                meta: {},
                wrapperHead: '',
                wrapperTail: '',
            },
            observationBase: observationBase(),
        };
        const stageTrace = { id: oneCase.id };
        await run.commitCase({ index, caseId: oneCase.id, capture: { prompt, promptInput, stageTrace } });
        prompts.push(prompt);
        promptInputs.push(promptInput);
        stageTraces.push(stageTrace);
        transportTrace.push({ schemaVersion: 1, caseId: oneCase.id, production: productionTransport });
    }
    await run.complete({
        prompts,
        promptInputs,
        transportTrace,
        stageTraces,
        metrics: { overall: { cases: cases.length } },
        failures: [],
        reportMarkdown: 'fixture',
    });
    return { runDir: run.runDir, samplePath, snapshotPath };
}

test('reader-only 只消费冻结完整 Prompt，生产调用保持为零', async t => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-reader-only-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const { runDir: captureRunDir } = await createCapture(tempDir);
    const seen = [];
    const result = await runGoldReaderOnly({
        captureRunDir,
        runsRoot: tempDir,
        runName: 'reader-child',
        config: {
            summaryApi: { provider: 'custom', url: 'https://example.com/v1', model: 'reader-a' },
            goldEval: { reader: { enabled: true, temperature: 0, maxTokens: 512, reasoningEffort: 'none' } },
        },
        runReader: async input => {
            seen.push(input);
            return {
                answerText: '答案',
                readerMs: 12,
                readerCalls: 1,
                usage: { prompt_tokens: 2, completion_tokens: 1 },
                transport: { status: 200 },
            };
        },
    });
    assert.equal(seen.length, 1);
    assert.equal(seen[0].promptText, '答案');
    assert.equal(result.manifest.status, 'valid');
    assert.equal(result.manifest.progress.productionExternalCalls, 0);
    assert.equal(result.manifest.progress.readerExternalCalls, 1);
    assert.equal(result.aggregated.overall.answerAccuracy, 1);
});

test('prompt-only 复用同一召回输入且禁止外部调用', async t => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-prompt-only-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const { runDir: captureRunDir, samplePath, snapshotPath } = await createCapture(tempDir);
    const result = await runGoldPromptOnly({
        captureRunDir,
        runsRoot: tempDir,
        runName: 'prompt-child',
        config: { goldEval: { reader: { enabled: false } } },
        samplePath,
        snapshotPath,
        buildPrompt: async productionInput => {
            assert.equal(productionInput.schemaVersion, 1);
            return {
                promptText: '候选答案',
                evidenceTrace: {
                    final: [{ floor: 0, rank: 1, unitId: 'fixture:0' }],
                    prompt: [{ floor: 0, rank: 1, unitId: 'fixture:0' }],
                },
                externalCalls: 0,
            };
        },
    });
    assert.equal(result.manifest.status, 'valid');
    assert.equal(result.manifest.progress.productionExternalCalls, 0);
    assert.equal(result.changedPrompts, 1);

    const seen = [];
    const reader = await runGoldReaderOnly({
        captureRunDir: result.artifacts.runDir,
        runsRoot: tempDir,
        runName: 'prompt-reader-child',
        config: {
            summaryApi: { provider: 'custom', url: 'https://example.com/v1', model: 'reader-a' },
            goldEval: { reader: { enabled: true, temperature: 0, maxTokens: 512, reasoningEffort: 'none' } },
        },
        runReader: async input => {
            seen.push(input.promptText);
            return {
                answerText: '答案',
                readerMs: 1,
                readerCalls: 1,
                usage: null,
                transport: { status: 200 },
            };
        },
    });
    assert.deepEqual(seen, ['候选答案']);
    assert.equal(reader.manifest.sourceCapture.mode, 'gold-prompt-only-paired');
    assert.equal(reader.manifest.progress.productionExternalCalls, 0);
});

test('capture Prompt 被篡改时消费者拒绝运行', async t => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-capture-tamper-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const { runDir: captureRunDir } = await createCapture(tempDir);
    const promptPath = path.join(captureRunDir, 'prompts.jsonl');
    const row = JSON.parse((await fs.readFile(promptPath, 'utf8')).trim());
    row.promptText = '被篡改';
    await fs.writeFile(promptPath, `${JSON.stringify(row)}\n`, 'utf8');
    await assert.rejects(() => loadGoldCapture(captureRunDir), /Prompt hash 不匹配/);
});

test('strict cassette 命中冻结响应且不需要网络', async () => {
    const body = JSON.stringify({ model: 'embed-a', input: ['问题'] });
    const request = summarizeExternalRequest('https://api.example.com/v1/embeddings', {
        method: 'POST',
        body,
    });
    const responseBody = { data: [{ embedding: [0.1, 0.2] }], usage: { total_tokens: 2 } };
    const cassette = createStrictTransportCassette([{
        ...request,
        status: 200,
        rateHeaders: {},
        responseBody,
        responseHash: sha256Text(JSON.stringify(responseBody)),
    }], { caseId: 'fixture-capture-001' });

    const originalFetch = globalThis.fetch;
    let networkCalls = 0;
    globalThis.fetch = async () => {
        networkCalls += 1;
        throw new Error('cassette hit 不得触发真实网络');
    };
    try {
        const result = await withExternalCallTrace(async () => {
            const response = await fetch('https://api.example.com/v1/embeddings', {
                method: 'POST',
                body,
            });
            return await response.json();
        }, { cassette });
        assert.deepEqual(result.value, responseBody);
        assert.equal(result.calls, 0);
        assert.equal(result.requestCount, 1);
        assert.equal(result.trace[0].cassetteHit, true);
        assert.equal(networkCalls, 0);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('strict cassette miss 立即失败且不会回退网络', async () => {
    const body = JSON.stringify({ model: 'embed-a', input: ['原问题'] });
    const request = summarizeExternalRequest('https://api.example.com/v1/embeddings', {
        method: 'POST',
        body,
    });
    const responseBody = { data: [{ embedding: [0.1] }] };
    const cassette = createStrictTransportCassette([{
        ...request,
        status: 200,
        rateHeaders: {},
        responseBody,
        responseHash: sha256Text(JSON.stringify(responseBody)),
    }], { caseId: 'fixture-capture-001' });
    const changedRequest = summarizeExternalRequest('https://api.example.com/v1/embeddings', {
        method: 'POST',
        body: JSON.stringify({ model: 'embed-a', input: ['变化后的问题'] }),
    });

    const originalFetch = globalThis.fetch;
    let networkCalls = 0;
    globalThis.fetch = async () => {
        networkCalls += 1;
        throw new Error('cassette miss 不得回退真实网络');
    };
    try {
        await assert.rejects(
            () => withExternalCallTrace(
                () => fetch('https://api.example.com/v1/embeddings', {
                    method: 'POST',
                    body: JSON.stringify({ model: 'embed-a', input: ['变化后的问题'] }),
                }),
                { cassette },
            ),
            error => error?.goldFailure?.kind === 'miss'
                && error?.externalCalls === 0
                && error?.externalTrace?.[0]?.requestHash === changedRequest.requestHash
                && /新的 production capture/.test(error.message),
        );
        assert.equal(networkCalls, 0);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('production transport 会冻结可复放响应与请求 hash', async () => {
    const body = JSON.stringify({ model: 'rerank-a', query: '问题', documents: ['候选'] });
    const responseBody = { results: [{ index: 0, relevance_score: 0.9 }] };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: { 'content-type': 'application/json' },
    });
    try {
        const result = await withExternalCallTrace(async () => {
            const response = await fetch('https://api.example.com/v1/rerank', {
                method: 'POST',
                body,
            });
            return await response.json();
        });
        assert.equal(result.calls, 1);
        assert.equal(result.requestCount, 1);
        assert.equal(result.trace[0].requestHash, sha256Text(body));
        assert.deepEqual(result.trace[0].responseBody, responseBody);
        assert.equal(result.trace[0].responseHash, sha256Text(JSON.stringify(responseBody)));
        assert.equal(result.trace[0].source, 'network');
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('prompt-only 在当前 snapshot 与 source capture 不一致时拒绝运行', async t => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-source-mismatch-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const { runDir: captureRunDir, samplePath, snapshotPath } = await createCapture(tempDir);
    await fs.writeFile(snapshotPath, '{"fixture":"changed"}\n', 'utf8');

    await assert.rejects(() => runGoldPromptOnly({
        captureRunDir,
        runsRoot: tempDir,
        runName: 'prompt-mismatch',
        config: { goldEval: { reader: { enabled: false } } },
        samplePath,
        snapshotPath,
        buildPrompt: async () => assert.fail('来源不一致时不得进入 Prompt 装配'),
    }), /snapshot hash 不一致/);
});

test('capture code archive 被篡改时消费者拒绝运行', async t => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-code-tamper-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const { runDir: captureRunDir } = await createCapture(tempDir);
    await fs.writeFile(path.join(captureRunDir, 'code', 'fixture-source.mjs'), 'tampered\n', 'utf8');
    await assert.rejects(() => loadGoldCapture(captureRunDir), /codeArchive/);
});

test('reader 失败会自动作废消费 run', async t => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-reader-invalid-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const { runDir: captureRunDir } = await createCapture(tempDir);
    let failedError = null;
    try {
        await runGoldReaderOnly({
            captureRunDir,
            runsRoot: tempDir,
            runName: 'reader-invalid',
            config: {
                summaryApi: { provider: 'custom', url: 'https://example.com/v1', model: 'reader-a' },
                goldEval: { reader: { enabled: true } },
            },
            runReader: async () => { throw new Error('fixture reader failure'); },
        });
    } catch (error) {
        failedError = error;
    }
    assert.ok(failedError?.goldRunDir);
    const manifest = JSON.parse(await fs.readFile(path.join(failedError.goldRunDir, 'manifest.json'), 'utf8'));
    assert.equal(manifest.status, 'invalid');
    assert.match(await fs.readFile(path.join(failedError.goldRunDir, 'INVALID.md'), 'utf8'), /不得用于质量指标/);
});

test('reader 并发批次失败时记录批次内全部尝试', async t => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-reader-concurrent-invalid-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const { runDir: captureRunDir } = await createCapture(tempDir, { caseCount: 3 });
    let failedError = null;
    try {
        await runGoldReaderOnly({
            captureRunDir,
            runsRoot: tempDir,
            runName: 'reader-concurrent-invalid',
            config: {
                summaryApi: { provider: 'custom', url: 'https://example.com/v1', model: 'reader-a' },
                goldEval: { reader: { enabled: true, concurrency: 3 } },
            },
            runReader: async () => {
                const error = new Error('fixture concurrent failure');
                error.httpStatus = 401;
                throw error;
            },
        });
    } catch (error) {
        failedError = error;
    }
    assert.ok(failedError?.goldRunDir);
    const manifest = JSON.parse(await fs.readFile(path.join(failedError.goldRunDir, 'manifest.json'), 'utf8'));
    assert.equal(manifest.progress.readerExternalCalls, 3);
    assert.equal(manifest.invalidReason.batchAttempts.length, 3);
    assert.equal(manifest.invalidReason.batchAttempts.every(item => item.httpStatus === 401), true);
});

test('reader-only smoke limit 只消费 source 的前 N 题并保持零 production network', async t => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-reader-limit-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const { runDir: captureRunDir } = await createCapture(tempDir);
    const seen = [];
    const result = await runGoldReaderOnly({
        captureRunDir,
        runsRoot: tempDir,
        runName: 'reader-limit',
        config: {
            summaryApi: { provider: 'custom', url: 'https://example.com/v1', model: 'reader-a' },
            goldEval: { limit: 1, reader: { enabled: true } },
        },
        runReader: async input => {
            seen.push(input);
            return { answerText: '答案', readerMs: 1, readerCalls: 1, usage: null, transport: { status: 200 } };
        },
    });
    assert.equal(seen.length, 1);
    assert.equal(result.manifest.progress.totalCases, 1);
    assert.equal(result.manifest.evaluatedCases, 1);
    assert.equal(result.manifest.sourceCases, 1);
    assert.equal(result.manifest.progress.productionExternalCalls, 0);
});

test('reader-only 指定 case 时只消费目标 Prompt', async t => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-reader-case-id-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const { runDir: captureRunDir } = await createCapture(tempDir, { caseCount: 3 });
    const seen = [];
    const result = await runGoldReaderOnly({
        captureRunDir,
        runsRoot: tempDir,
        runName: 'reader-case-id',
        config: {
            summaryApi: { provider: 'custom', url: 'https://example.com/v1', model: 'reader-a' },
            goldEval: { caseIds: ['fixture-capture-003'], reader: { enabled: true } },
        },
        runReader: async input => {
            seen.push(input.caseId);
            return { answerText: '答案', readerMs: 1, readerCalls: 1, usage: null, transport: { status: 200 } };
        },
    });
    assert.deepEqual(seen, ['fixture-capture-003']);
    assert.equal(result.manifest.evaluatedCases, 1);
    assert.equal(result.manifest.sourceCases, 3);
    assert.equal(result.manifest.progress.readerExternalCalls, 1);
});

test('reader-only 同 fingerprint resume 复用成功 checkpoint 且只调用未完成 cases', async t => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-reader-resume-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const { runDir: captureRunDir } = await createCapture(tempDir, { caseCount: 3 });
    const config = {
        summaryApi: { provider: 'custom', url: 'https://example.com/v1', model: 'reader-a' },
        goldEval: { reader: { enabled: true, concurrency: 1 } },
    };
    let firstError = null;
    let firstCalls = 0;
    try {
        await runGoldReaderOnly({
            captureRunDir,
            runsRoot: tempDir,
            runName: 'reader-resume-source',
            config,
            runReader: async () => {
                firstCalls += 1;
                if (firstCalls === 2) throw new Error('fixture transient failure');
                return { answerText: '答案', readerMs: 1, readerCalls: 1, usage: null, transport: { status: 200 } };
            },
        });
    } catch (error) {
        firstError = error;
    }
    assert.ok(firstError?.goldRunDir);
    assert.equal(firstCalls, 2);

    const resumedCalls = [];
    const result = await runGoldReaderOnly({
        captureRunDir,
        runsRoot: tempDir,
        runName: 'reader-resume-target',
        resumeRunDir: firstError.goldRunDir,
        config,
        runReader: async input => {
            resumedCalls.push(input.caseId);
            return { answerText: '答案', readerMs: 1, readerCalls: 1, usage: null, transport: { status: 200 } };
        },
    });
    assert.deepEqual(resumedCalls, ['fixture-capture-002', 'fixture-capture-003']);
    assert.equal(result.manifest.status, 'valid');
    assert.equal(result.manifest.progress.completedCases, 3);
    assert.equal(result.manifest.progress.reusedCases, 1);
    assert.equal(result.manifest.progress.readerExternalCalls, 2);
    assert.equal(result.aggregated.overall.answerAccuracy, 1);
});

test('reader-only resume 配置变化时在 API 前拒绝', async t => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-reader-resume-mismatch-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const { runDir: captureRunDir } = await createCapture(tempDir, { caseCount: 2 });
    const baseConfig = {
        summaryApi: { provider: 'custom', url: 'https://example.com/v1', model: 'reader-a' },
        goldEval: { reader: { enabled: true } },
    };
    let sourceError = null;
    try {
        await runGoldReaderOnly({
            captureRunDir,
            runsRoot: tempDir,
            runName: 'reader-resume-mismatch-source',
            config: baseConfig,
            runReader: async input => {
                if (input.caseId === 'fixture-capture-002') throw new Error('fixture failure');
                return { answerText: '答案', readerMs: 1, readerCalls: 1, usage: null, transport: { status: 200 } };
            },
        });
    } catch (error) {
        sourceError = error;
    }
    let calls = 0;
    await assert.rejects(() => runGoldReaderOnly({
        captureRunDir,
        runsRoot: tempDir,
        runName: 'reader-resume-mismatch-target',
        resumeRunDir: sourceError.goldRunDir,
        config: {
            ...baseConfig,
            goldEval: { reader: { enabled: true, maxTokens: 512 } },
        },
        runReader: async () => {
            calls += 1;
            return { answerText: '答案', readerMs: 1, readerCalls: 1, usage: null, transport: { status: 200 } };
        },
    }), /fingerprint 不一致/);
    assert.equal(calls, 0);
});

test('reader-only resume 拒绝被篡改的成功 checkpoint', async t => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-reader-resume-tamper-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const { runDir: captureRunDir } = await createCapture(tempDir, { caseCount: 2 });
    const config = {
        summaryApi: { provider: 'custom', url: 'https://example.com/v1', model: 'reader-a' },
        goldEval: { reader: { enabled: true } },
    };
    let sourceError = null;
    try {
        await runGoldReaderOnly({
            captureRunDir,
            runsRoot: tempDir,
            runName: 'reader-resume-tamper-source',
            config,
            runReader: async input => {
                if (input.caseId === 'fixture-capture-002') throw new Error('fixture failure');
                return { answerText: '答案', readerMs: 1, readerCalls: 1, usage: null, transport: { status: 200 } };
            },
        });
    } catch (error) {
        sourceError = error;
    }
    const checkpointDir = path.join(sourceError.goldRunDir, 'checkpoints');
    const checkpointName = (await fs.readdir(checkpointDir)).find(name => (
        name.includes('fixture-capture-001') && !name.endsWith('-FAILED.json')
    ));
    const checkpointPath = path.join(checkpointDir, checkpointName);
    const checkpoint = JSON.parse(await fs.readFile(checkpointPath, 'utf8'));
    checkpoint.readerAnswer.text = '篡改答案';
    await fs.writeFile(checkpointPath, `${JSON.stringify(checkpoint, null, 2)}\n`, 'utf8');

    let calls = 0;
    await assert.rejects(() => runGoldReaderOnly({
        captureRunDir,
        runsRoot: tempDir,
        runName: 'reader-resume-tamper-target',
        resumeRunDir: sourceError.goldRunDir,
        config,
        runReader: async () => {
            calls += 1;
            return { answerText: '答案', readerMs: 1, readerCalls: 1, usage: null, transport: { status: 200 } };
        },
    }), /checkpoint hash 不匹配/);
    assert.equal(calls, 0);
});

test('失败 checkpoint 无法写入时仍必须把 run 标为 invalid', async t => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-invalid-lifecycle-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const run = await beginGoldRun({
        runsRoot: tempDir,
        runId: 'lifecycle-run',
        manifest: { runId: 'lifecycle-run', mode: 'fixture' },
        cases: [goldCase()],
    });
    await fs.rm(run.paths.checkpoints, { recursive: true, force: true });
    await fs.writeFile(run.paths.checkpoints, 'block checkpoint directory creation', 'utf8');
    const result = await invalidateGoldRun({
        runStore: run,
        failure: { stage: 'reader', kind: 'request', caseId: 'fixture-capture-001', message: 'failed' },
        failedCase: {
            index: 0,
            caseId: 'fixture-capture-001',
            capture: { failure: true },
        },
    });
    assert.ok(result.checkpointError);
    assert.equal(result.invalidationError, null);
    const manifest = JSON.parse(await fs.readFile(run.paths.manifest, 'utf8'));
    assert.equal(manifest.status, 'invalid');
});
