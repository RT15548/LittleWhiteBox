import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
    prepareNaturalCapturePlan,
    runNaturalCaptureCases,
} from '../natural-replay-session.mjs';
import {
    prepareNaturalRecallPlan,
    runNaturalRecallCases,
} from '../natural-recall-session.mjs';
import {
    prepareNaturalResumePlan,
    runNaturalResumeCases,
} from '../natural-resume-session.mjs';
import {
    abortRunningGoldRun,
    beginGoldRun,
    loadGoldCapture,
    sha256Text,
} from '../lib/run-store.mjs';

function message(floor) {
    return {
        is_user: floor % 2 === 0,
        mes: floor % 2 === 0 ? `用户问题 ${floor}` : `角色回答 ${floor}`,
        name: floor % 2 === 0 ? '用户' : '角色',
    };
}

function naturalCase(id, queryFloor, evidenceFloor = 0) {
    const text = `用户问题 ${queryFloor}`;
    return {
        schemaVersion: 2,
        id,
        corpusId: 'fixture-chat',
        split: 'dev',
        track: 'natural',
        category: 'unclassified',
        query: {
            kind: 'verbatim-user',
            floor: queryFloor,
            text,
            sha256: sha256Text(text),
        },
        historyThroughFloor: queryFloor - 1,
        expectedAnswer: { type: 'evidence-only' },
        evidence: {
            requiredAll: [evidenceFloor],
            requiredAny: [],
            requiredAnyGroups: [],
            supporting: [],
            forbiddenAsCurrent: [],
        },
        provenance: {
            queryOrigin: 'verbatim-user-message',
            goldMethod: 'source-evidence-verified',
            verifier: 'independent',
            status: 'accepted',
        },
    };
}

function successfulTransport(index = 0) {
    const responseBody = { data: [{ embedding: [0.1] }] };
    return {
        index,
        endpoint: 'embedding',
        host: 'api.example.com',
        path: '/v1/embeddings',
        method: 'POST',
        model: 'embed-a',
        requestHash: sha256Text(`request-${index}`),
        status: 200,
        responseBody,
        responseHash: sha256Text(JSON.stringify(responseBody)),
    };
}

function successfulExecution() {
    const ranked = [{ floor: 0, rank: 1, score: 1, unitId: 'chunk:0' }];
    return {
        normalizedRecall: { metrics: { external: { failures: [] } } },
        promptText: '#1 【用户】\n用户问题 0',
        corePromptText: '#1 【用户】\n用户问题 0',
        promptInput: {
            schemaVersion: 1,
            recallResult: { events: [], l0Selected: [], causalChain: [], l1ByFloorEntries: [] },
            meta: {},
            wrapperHead: '',
            wrapperTail: '',
        },
        evidenceTrace: { final: ranked, prompt: ranked },
        recallMs: 10,
        externalCalls: 1,
        externalRequests: 1,
        transportTrace: [successfulTransport()],
        reportCase: { label: 'fixture', resultCounts: {} },
    };
}

function successfulPairedExecution(extraNetworkRows = []) {
    const execution = successfulExecution();
    const cassetteRow = {
        ...successfulTransport(),
        source: 'cassette',
        cassetteHit: true,
    };
    const networkRows = extraNetworkRows.map(row => ({
        ...row,
        source: 'network',
        cassetteHit: false,
    }));
    return {
        ...execution,
        externalCalls: networkRows.length,
        externalRequests: 1 + networkRows.length,
        transportTrace: [cassetteRow, ...networkRows],
    };
}

async function healthyHistory({ floor }) {
    return {
        floor,
        externalCalls: 0,
        externalRequests: 0,
        transportTrace: [],
        result: { healthy: true },
    };
}

async function writeFixtureRecoverySnapshot({
    snapshotPath,
    resumeFloor,
    visibleMessages,
    preparation,
}) {
    await fs.writeFile(snapshotPath, `${JSON.stringify({
        kind: 'natural-operational-recovery',
        generatedAt: '2026-08-10T00:00:00.000Z',
        boundary: { resumeFloor, historyThroughFloor: resumeFloor },
        sample: { messageCount: visibleMessages.length },
        recovery: { preparation },
    })}\n`, 'utf8');
}

async function fixture(t) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-natural-replay-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const samplePath = path.join(tempDir, 'sample.jsonl');
    const casesPath = path.join(tempDir, 'cases.jsonl');
    const messages = Array.from({ length: 8 }, (_, floor) => message(floor));
    await fs.writeFile(samplePath, `${messages.map(item => JSON.stringify(item)).join('\n')}\n`, 'utf8');
    await fs.writeFile(casesPath, `${[
        naturalCase('natural-floor-2', 2),
        naturalCase('natural-floor-6', 6),
    ].map(item => JSON.stringify(item)).join('\n')}\n`, 'utf8');
    const config = {
        summaryApi: { provider: 'custom', url: 'https://summary.example.com/v1', model: 'summary-a' },
        vectorConfig: {
            enabled: true,
            l0Api: { provider: 'custom', url: 'https://l0.example.com/v1', model: 'l0-a' },
            embeddingApi: { provider: 'custom', url: 'https://api.example.com/v1', model: 'embed-a' },
            rerankApi: { provider: 'custom', url: 'https://api.example.com/v1', model: 'rerank-a' },
        },
        goldEval: {
            enabled: true,
            casesPath,
            runsRoot: tempDir,
            split: 'dev',
            runName: 'fixture-natural',
            minEvidenceDistanceFloors: 1,
            turnIntervalMinMs: 1,
            turnIntervalMaxMs: 1,
            reader: { enabled: false },
        },
    };
    const sample = { messages, names: { name1: '用户', name2: '角色' } };
    const plan = await prepareNaturalCapturePlan({ rootDir: tempDir, config, sample });
    return { tempDir, samplePath, sample, config, plan };
}

async function createSourceCapture({ samplePath, sample, config, plan }) {
    let visibleMessages = [];
    let now = 0;
    const modules = {
        getSummaryStore: () => ({ json: { events: [], facts: [] } }),
        getContext: () => ({ chatId: 'fixture-chat', chat: visibleMessages }),
        getAllChunks: async () => [{ floor: 0, text: '用户问题 0' }],
        getStateAtoms: () => [],
    };
    return await runNaturalCaptureCases({
        modules,
        plan,
        sample,
        samplePath,
        config,
        setVisibleHistory: async messages => {
            visibleMessages = messages;
        },
        summarizeBeforeUser: async () => ({ externalCalls: 0, externalRequests: 0, transportTrace: [] }),
        maintainAfterAi: async ({ floor }) => ({
            floor,
            externalCalls: 0,
            externalRequests: 0,
            transportTrace: [],
        }),
        assertHistoryHealthy: healthyHistory,
        writeRecoverySnapshot: writeFixtureRecoverySnapshot,
        writeBoundarySnapshot: async ({ snapshotPath, goldCase, visibleMessages: boundaryMessages }) => {
            await fs.writeFile(snapshotPath, `${JSON.stringify({
                kind: 'natural-query-boundary',
                boundary: {
                    queryFloor: goldCase.atFloor,
                    historyThroughFloor: goldCase.historyThroughFloor,
                },
                sample: { messageCount: boundaryMessages.length },
            })}\n`, 'utf8');
        },
        executeRecallCase: async () => successfulExecution(),
        clock: () => now,
        wait: async delayMs => {
            now += delayMs;
        },
    });
}

async function createInvalidCaptureAfterFirstCase(fixtureState) {
    const { samplePath, sample, config, plan, tempDir } = fixtureState;
    let visibleMessages = [];
    let now = 0;
    const failedTrace = {
        ...successfulTransport(9),
        status: 200,
        endpoint: 'other',
        model: 'summary-a',
        responseBody: null,
        responseHash: null,
        errorKind: 'parse',
    };
    const modules = {
        getSummaryStore: () => ({ json: { events: [], facts: [] } }),
        getContext: () => ({ chatId: 'fixture-chat', chat: visibleMessages }),
        getAllChunks: async () => [{ floor: 0, text: '用户问题 0' }],
        getStateAtoms: () => [],
    };
    await assert.rejects(() => runNaturalCaptureCases({
        modules,
        plan,
        sample,
        samplePath,
        config,
        setVisibleHistory: async messages => { visibleMessages = messages; },
        summarizeBeforeUser: async () => ({ externalCalls: 0, externalRequests: 0, transportTrace: [] }),
        maintainAfterAi: async ({ floor }) => {
            if (floor !== 3) return { floor, externalCalls: 0, externalRequests: 0, transportTrace: [] };
            const error = new Error('fixture summary parse');
            error.goldFailure = {
                stage: 'summary',
                kind: 'natural-preparation-failure',
                caseId: 'natural-floor-6',
                message: error.message,
            };
            error.externalTrace = [failedTrace];
            error.externalCalls = 1;
            error.externalRequests = 1;
            throw error;
        },
        assertHistoryHealthy: healthyHistory,
        writeRecoverySnapshot: writeFixtureRecoverySnapshot,
        writeBoundarySnapshot: async ({ snapshotPath, goldCase, visibleMessages: boundaryMessages }) => {
            await fs.writeFile(snapshotPath, JSON.stringify({
                kind: 'natural-query-boundary',
                boundary: {
                    queryFloor: goldCase.atFloor,
                    historyThroughFloor: goldCase.historyThroughFloor,
                },
                sample: { messageCount: boundaryMessages.length },
            }), 'utf8');
        },
        executeRecallCase: async () => successfulExecution(),
        clock: () => now,
        wait: async delayMs => { now += delayMs; },
    }), /fixture summary parse/);
    const runDirs = (await fs.readdir(tempDir, { withFileTypes: true }))
        .filter(entry => entry.isDirectory() && entry.name.includes('fixture-natural'));
    assert.equal(runDirs.length, 1);
    return path.join(tempDir, runDirs[0].name);
}

async function createInvalidCaptureWithRecovery(fixtureState) {
    const { samplePath, sample, config, plan, tempDir } = fixtureState;
    let visibleMessages = [];
    let now = 0;
    const summaryTrace = successfulTransport(21);
    const failedTrace = {
        ...successfulTransport(22),
        endpoint: 'other',
        model: 'summary-a',
        status: 200,
        responseBody: null,
        responseHash: null,
        errorKind: 'parse',
    };
    const modules = {
        getSummaryStore: () => ({ json: { events: [], facts: [] } }),
        getContext: () => ({ chatId: 'fixture-chat', chat: visibleMessages }),
        getAllChunks: async () => [{ floor: 0, text: '用户问题 0' }],
        getStateAtoms: () => [],
    };
    await assert.rejects(() => runNaturalCaptureCases({
        modules,
        plan,
        sample,
        samplePath,
        config,
        setVisibleHistory: async messages => { visibleMessages = messages; },
        summarizeBeforeUser: async ({ floor }) => floor === 4
            ? {
                floor,
                externalCalls: 1,
                externalRequests: 1,
                transportTrace: [summaryTrace],
                result: { triggered: true },
            }
            : { floor, externalCalls: 0, externalRequests: 0, transportTrace: [], result: { triggered: false } },
        maintainAfterAi: async ({ floor }) => {
            if (floor !== 5) return { floor, externalCalls: 0, externalRequests: 0, transportTrace: [] };
            const error = new Error('fixture post-recovery parse');
            error.goldFailure = {
                stage: 'l0-index',
                kind: 'natural-preparation-failure',
                caseId: 'natural-floor-6',
                message: error.message,
            };
            error.externalTrace = [failedTrace];
            error.externalCalls = 1;
            error.externalRequests = 1;
            throw error;
        },
        assertHistoryHealthy: healthyHistory,
        writeRecoverySnapshot: writeFixtureRecoverySnapshot,
        writeBoundarySnapshot: async ({ snapshotPath, goldCase, visibleMessages: boundaryMessages }) => {
            await fs.writeFile(snapshotPath, JSON.stringify({
                kind: 'natural-query-boundary',
                boundary: {
                    queryFloor: goldCase.atFloor,
                    historyThroughFloor: goldCase.historyThroughFloor,
                },
                sample: { messageCount: boundaryMessages.length },
            }), 'utf8');
        },
        executeRecallCase: async () => successfulExecution(),
        clock: () => now,
        wait: async delayMs => { now += delayMs; },
    }), /fixture post-recovery parse/);
    const runDirs = (await fs.readdir(tempDir, { withFileTypes: true }))
        .filter(entry => entry.isDirectory() && entry.name.includes('fixture-natural'));
    assert.equal(runDirs.length, 1);
    return path.join(tempDir, runDirs[0].name);
}

test('natural capture 单次顺序回放，并在每题严格排除 query 与未来历史', async t => {
    const { samplePath, sample, config, plan } = await fixture(t);
    let visibleMessages = [];
    const visibleAtRecall = [];
    const maintenanceFloors = [];
    let now = 0;
    const modules = {
        getSummaryStore: () => ({ json: { events: [], facts: [] } }),
        getContext: () => ({ chatId: 'fixture-chat', chat: visibleMessages }),
        getAllChunks: async () => [{ floor: 0, text: '用户问题 0' }],
        getStateAtoms: () => [],
    };

    const result = await runNaturalCaptureCases({
        modules,
        plan,
        sample,
        samplePath,
        config,
        setVisibleHistory: async messages => {
            visibleMessages = messages;
        },
        summarizeBeforeUser: async () => ({ externalCalls: 0, externalRequests: 0, transportTrace: [] }),
        maintainAfterAi: async ({ floor }) => {
            maintenanceFloors.push(floor);
            return { floor, externalCalls: 0, externalRequests: 0, transportTrace: [] };
        },
        assertHistoryHealthy: healthyHistory,
        writeRecoverySnapshot: writeFixtureRecoverySnapshot,
        writeBoundarySnapshot: async ({ snapshotPath, goldCase, visibleMessages: boundaryMessages }) => {
            await fs.writeFile(snapshotPath, `${JSON.stringify({
                kind: 'natural-query-boundary',
                boundary: {
                    queryFloor: goldCase.atFloor,
                    historyThroughFloor: goldCase.historyThroughFloor,
                },
                sample: { messageCount: boundaryMessages.length },
            })}\n`, 'utf8');
        },
        executeRecallCase: async recallCase => {
            visibleAtRecall.push({
                pending: recallCase.pendingUserMessage,
                visibleCount: visibleMessages.length,
                visibleTail: visibleMessages.at(-1)?.mes || null,
            });
            return successfulExecution();
        },
        clock: () => now,
        wait: async delayMs => {
            now += delayMs;
        },
    });

    assert.deepEqual(visibleAtRecall, [
        { pending: '用户问题 2', visibleCount: 2, visibleTail: '角色回答 1' },
        { pending: '用户问题 6', visibleCount: 6, visibleTail: '角色回答 5' },
    ]);
    assert.deepEqual(maintenanceFloors, [1, 3, 5]);
    assert.deepEqual(result.boundarySnapshots.map(item => item.messageCount), [2, 6]);
    assert.equal(result.aggregated.overall.cases, 2);
    assert.equal(result.aggregated.overall.recallAt5, 1);
    assert.equal(result.manifest.status, 'valid');
    assert.equal(result.manifest.progress.completedCases, 2);
    assert.ok(result.manifest.artifactHashes.boundarySnapshots);
});

test('natural capture 的历史维护一旦出现外部错误立即作废且不继续召回', async t => {
    const { samplePath, sample, config, plan, tempDir } = await fixture(t);
    let visibleMessages = [];
    let recallCalls = 0;
    const failedTrace = {
        ...successfulTransport(),
        status: 429,
        responseBody: { error: 'rate limited' },
    };
    const modules = {
        getSummaryStore: () => ({ json: { events: [], facts: [] } }),
        getContext: () => ({ chatId: 'fixture-chat', chat: visibleMessages }),
        getAllChunks: async () => [],
        getStateAtoms: () => [],
    };

    await assert.rejects(() => runNaturalCaptureCases({
        modules,
        plan,
        sample,
        samplePath,
        config,
        setVisibleHistory: async messages => {
            visibleMessages = messages;
        },
        summarizeBeforeUser: async () => ({ externalCalls: 0, externalRequests: 0, transportTrace: [] }),
        maintainAfterAi: async ({ floor }) => ({
            floor,
            externalCalls: 1,
            externalRequests: 1,
            transportTrace: [failedTrace],
        }),
        assertHistoryHealthy: healthyHistory,
        writeRecoverySnapshot: writeFixtureRecoverySnapshot,
        writeBoundarySnapshot: async () => assert.fail('外部错误后不得写 snapshot'),
        executeRecallCase: async () => {
            recallCalls += 1;
            return successfulExecution();
        },
        clock: () => 0,
        wait: async () => {},
    }), /外部调用失败.*429/);
    assert.equal(recallCalls, 0);

    const runDirs = (await fs.readdir(tempDir, { withFileTypes: true }))
        .filter(entry => entry.isDirectory() && entry.name.includes('fixture-natural'));
    assert.equal(runDirs.length, 1);
    const manifest = JSON.parse(await fs.readFile(path.join(tempDir, runDirs[0].name, 'manifest.json'), 'utf8'));
    assert.equal(manifest.status, 'invalid');
    assert.equal(manifest.progress.completedCases, 0);
    assert.equal(manifest.progress.productionExternalCalls, 1);
    assert.equal(manifest.progress.productionTransportRequests, 1);
    const failedCheckpoint = (await fs.readdir(path.join(tempDir, runDirs[0].name, 'checkpoints')))
        .find(name => name.includes('FAILED'));
    const checkpoint = JSON.parse(await fs.readFile(
        path.join(tempDir, runDirs[0].name, 'checkpoints', failedCheckpoint),
        'utf8',
    ));
    assert.equal(checkpoint.transport.length, 1);
    assert.equal(checkpoint.transport[0].preparationStage, 'maintenance-after-ai:1');
});

test('natural capture允许同请求有界重试恢复但完整记录transient', async t => {
    const { samplePath, sample, config, plan } = await fixture(t);
    let visibleMessages = [];
    let now = 0;
    const timeoutRow = {
        ...successfulTransport(),
        status: null,
        responseBody: null,
        responseHash: null,
        errorKind: 'timeout',
        errorMessage: 'operation aborted',
    };
    const recoveredRow = successfulTransport(1);
    recoveredRow.requestHash = timeoutRow.requestHash;
    const modules = {
        getSummaryStore: () => ({ json: { events: [], facts: [] } }),
        getContext: () => ({ chatId: 'fixture-chat', chat: visibleMessages }),
        getAllChunks: async () => [{ floor: 0, text: '用户问题 0' }],
        getStateAtoms: () => [],
    };
    const result = await runNaturalCaptureCases({
        modules,
        plan,
        sample,
        samplePath,
        config,
        setVisibleHistory: async messages => { visibleMessages = messages; },
        summarizeBeforeUser: async () => ({ externalCalls: 0, externalRequests: 0, transportTrace: [] }),
        maintainAfterAi: async ({ floor }) => floor === 1
            ? { floor, externalCalls: 2, externalRequests: 2, transportTrace: [timeoutRow, recoveredRow] }
            : { floor, externalCalls: 0, externalRequests: 0, transportTrace: [] },
        assertHistoryHealthy: healthyHistory,
        writeRecoverySnapshot: writeFixtureRecoverySnapshot,
        writeBoundarySnapshot: async ({ snapshotPath, goldCase, visibleMessages: boundaryMessages }) => {
            await fs.writeFile(snapshotPath, JSON.stringify({
                kind: 'natural-query-boundary',
                boundary: {
                    queryFloor: goldCase.atFloor,
                    historyThroughFloor: goldCase.historyThroughFloor,
                },
                sample: { messageCount: boundaryMessages.length },
            }), 'utf8');
        },
        executeRecallCase: async () => successfulExecution(),
        clock: () => now,
        wait: async delayMs => { now += delayMs; },
    });
    assert.equal(result.manifest.status, 'valid');
    assert.equal(result.manifest.progress.productionExternalCalls, 4);
    assert.deepEqual(
        result.replayCases[0].preparation
            .flatMap(step => step.recoveredTransientAttempts || [])
            .map(item => item.errorKind),
        ['timeout'],
    );
});

test('natural capture允许L0失败跨AI回合恢复，并在query boundary统一验真', async t => {
    const fixtureState = await fixture(t);
    const singleConfig = structuredClone(fixtureState.config);
    singleConfig.goldEval.caseIds = ['natural-floor-6'];
    const singlePlan = await prepareNaturalCapturePlan({
        rootDir: fixtureState.tempDir,
        config: singleConfig,
        sample: fixtureState.sample,
    });
    let visibleMessages = [];
    let now = 0;
    const timeoutRow = {
        ...successfulTransport(31),
        status: null,
        responseBody: null,
        responseHash: null,
        errorKind: 'timeout',
    };
    const recoveredRow = successfulTransport(32);
    recoveredRow.requestHash = timeoutRow.requestHash;
    const modules = {
        getSummaryStore: () => ({ json: { events: [], facts: [] } }),
        getContext: () => ({ chatId: 'fixture-chat', chat: visibleMessages }),
        getAllChunks: async () => [{ floor: 0, text: '用户问题 0' }],
        getStateAtoms: () => [],
    };
    const result = await runNaturalCaptureCases({
        modules,
        plan: singlePlan,
        sample: fixtureState.sample,
        samplePath: fixtureState.samplePath,
        config: singleConfig,
        setVisibleHistory: async messages => { visibleMessages = messages; },
        summarizeBeforeUser: async ({ floor }) => ({
            floor,
            externalCalls: 0,
            externalRequests: 0,
            transportTrace: [],
            result: { triggered: false },
        }),
        maintainAfterAi: async ({ floor }) => {
            if (floor === 1) {
                return {
                    floor,
                    externalCalls: 1,
                    externalRequests: 1,
                    transportTrace: [timeoutRow],
                    allowUnrecoveredTransient: true,
                    result: { l0Status: 'fail', l0Reason: 'timeout', l0PendingRetry: true },
                };
            }
            if (floor === 3) {
                return {
                    floor,
                    externalCalls: 1,
                    externalRequests: 1,
                    transportTrace: [recoveredRow],
                    result: { l0Status: 'ok', l0PendingRetry: false },
                };
            }
            return { floor, externalCalls: 0, externalRequests: 0, transportTrace: [] };
        },
        assertHistoryHealthy: healthyHistory,
        writeRecoverySnapshot: writeFixtureRecoverySnapshot,
        writeBoundarySnapshot: async ({ snapshotPath, goldCase, visibleMessages: boundaryMessages }) => {
            await fs.writeFile(snapshotPath, JSON.stringify({
                kind: 'natural-query-boundary',
                boundary: {
                    queryFloor: goldCase.atFloor,
                    historyThroughFloor: goldCase.historyThroughFloor,
                },
                sample: { messageCount: boundaryMessages.length },
            }), 'utf8');
        },
        executeRecallCase: async () => successfulExecution(),
        clock: () => now,
        wait: async delayMs => { now += delayMs; },
    });
    assert.equal(result.manifest.status, 'valid');
    assert.equal(result.manifest.progress.productionExternalCalls, 3);
    assert.equal(result.replayCases[0].preparation
        .find(step => step.stage === 'maintenance-after-ai:1')
        .pendingTransientAttempts.length, 1);
    assert.deepEqual(
        result.replayCases[0].preparation
            .filter(step => step.stage.startsWith('maintenance-after-ai:'))
            .map(step => step.result?.l0Status || null),
        ['fail', 'ok', null],
    );
});

test('natural capture在真实query boundary仍有L0 fail时作废且不召回', async t => {
    const fixtureState = await fixture(t);
    const singleConfig = structuredClone(fixtureState.config);
    singleConfig.goldEval.caseIds = ['natural-floor-2'];
    const singlePlan = await prepareNaturalCapturePlan({
        rootDir: fixtureState.tempDir,
        config: singleConfig,
        sample: fixtureState.sample,
    });
    let visibleMessages = [];
    let recallCalls = 0;
    let healthChecks = 0;
    let now = 0;
    const modules = {
        getSummaryStore: () => ({ json: { events: [], facts: [] } }),
        getContext: () => ({ chatId: 'fixture-chat', chat: visibleMessages }),
        getAllChunks: async () => [],
        getStateAtoms: () => [],
    };
    await assert.rejects(() => runNaturalCaptureCases({
        modules,
        plan: singlePlan,
        sample: fixtureState.sample,
        samplePath: fixtureState.samplePath,
        config: singleConfig,
        setVisibleHistory: async messages => { visibleMessages = messages; },
        summarizeBeforeUser: async ({ floor }) => ({
            floor,
            externalCalls: 0,
            externalRequests: 0,
            transportTrace: [],
            result: { triggered: false },
        }),
        maintainAfterAi: async ({ floor }) => ({
            floor,
            externalCalls: 1,
            externalRequests: 1,
            transportTrace: [successfulTransport(41)],
            allowUnrecoveredTransient: true,
            result: { l0Status: 'fail', l0Reason: 'invalid_json', l0PendingRetry: true },
        }),
        assertHistoryHealthy: async ({ floor, nextCaseId }) => {
            healthChecks += 1;
            const error = new Error(`query floor ${floor} 前仍有未恢复 L0: 1:fail(invalid_json)`);
            error.goldFailure = {
                stage: 'l0-index',
                kind: 'natural-preparation-failure',
                caseId: nextCaseId,
                message: error.message,
            };
            throw error;
        },
        writeRecoverySnapshot: writeFixtureRecoverySnapshot,
        writeBoundarySnapshot: async () => assert.fail('未恢复L0不得写query boundary'),
        executeRecallCase: async () => {
            recallCalls += 1;
            return successfulExecution();
        },
        clock: () => now,
        wait: async delayMs => { now += delayMs; },
    }), /仍有未恢复 L0/);
    assert.equal(healthChecks, 1);
    assert.equal(recallCalls, 0);
});

test('natural capture每次成功Summary写恢复点且目录只保留最近两份', async t => {
    const fixtureState = await fixture(t);
    const singleConfig = structuredClone(fixtureState.config);
    singleConfig.goldEval.caseIds = ['natural-floor-6'];
    const singlePlan = await prepareNaturalCapturePlan({
        rootDir: fixtureState.tempDir,
        config: singleConfig,
        sample: fixtureState.sample,
    });
    let visibleMessages = [];
    let now = 0;
    const modules = {
        getSummaryStore: () => ({ json: { events: [], facts: [] } }),
        getContext: () => ({ chatId: 'fixture-chat', chat: visibleMessages }),
        getAllChunks: async () => [{ floor: 0, text: '用户问题 0' }],
        getStateAtoms: () => [],
    };
    const result = await runNaturalCaptureCases({
        modules,
        plan: singlePlan,
        sample: fixtureState.sample,
        samplePath: fixtureState.samplePath,
        config: singleConfig,
        setVisibleHistory: async messages => { visibleMessages = messages; },
        summarizeBeforeUser: async ({ floor }) => ({
            floor,
            externalCalls: 0,
            externalRequests: 0,
            transportTrace: [],
            result: { triggered: [2, 4, 6].includes(floor) },
        }),
        maintainAfterAi: async ({ floor }) => ({
            floor,
            externalCalls: 0,
            externalRequests: 0,
            transportTrace: [],
        }),
        assertHistoryHealthy: healthyHistory,
        writeRecoverySnapshot: writeFixtureRecoverySnapshot,
        writeBoundarySnapshot: async ({ snapshotPath, goldCase, visibleMessages: boundaryMessages }) => {
            await fs.writeFile(snapshotPath, JSON.stringify({
                kind: 'natural-query-boundary',
                boundary: {
                    queryFloor: goldCase.atFloor,
                    historyThroughFloor: goldCase.historyThroughFloor,
                },
                sample: { messageCount: boundaryMessages.length },
            }), 'utf8');
        },
        executeRecallCase: async () => successfulExecution(),
        clock: () => now,
        wait: async delayMs => { now += delayMs; },
    });
    const recoveryFiles = (await fs.readdir(path.join(result.artifacts.runDir, 'recovery')))
        .filter(name => name.endsWith('-natural-recovery.json'));
    assert.deepEqual(recoveryFiles.sort(), [
        '000003-natural-recovery.json',
        '000005-natural-recovery.json',
    ]);
    assert.deepEqual(result.recoveryPoints.map(item => item.resumeFloor), [3, 5]);
    assert.equal(result.manifest.progress.recoveryPoint.resumeFloor, 5);
    assert.ok(result.manifest.artifactHashes.recovery);
});

test('natural capture在已提交case后的准备失败记录真实错误请求而非上一题recall', async t => {
    const fixtureState = await fixture(t);
    const runDir = await createInvalidCaptureAfterFirstCase(fixtureState);
    const manifest = JSON.parse(await fs.readFile(path.join(runDir, 'manifest.json'), 'utf8'));
    assert.equal(manifest.status, 'invalid');
    assert.equal(manifest.progress.completedCases, 1);
    assert.equal(manifest.progress.productionExternalCalls, 2);
    assert.equal(manifest.progress.productionTransportRequests, 2);
    const failedName = (await fs.readdir(path.join(runDir, 'checkpoints')))
        .find(name => name.endsWith('-FAILED.json'));
    const failed = JSON.parse(await fs.readFile(path.join(runDir, 'checkpoints', failedName), 'utf8'));
    assert.equal(failed.transport.length, 1);
    assert.equal(failed.transport[0].errorKind, 'parse');
    assert.equal(failed.transport[0].model, 'summary-a');
});

test('natural resume导入原子前缀并只从最后boundary之后继续维护', async t => {
    const fixtureState = await fixture(t);
    const sourceRunDir = await createInvalidCaptureAfterFirstCase(fixtureState);
    const resumeConfig = structuredClone(fixtureState.config);
    resumeConfig.goldEval.captureRunDir = sourceRunDir;
    resumeConfig.goldEval.runName = 'fixture-natural-resume';
    resumeConfig.goldEval.expectedProductionSourceHash = 'fixture-production';
    resumeConfig.goldEval.resumeMisattributedAttempts = 1;
    resumeConfig.goldEval.resumeUnarchivedTerminalAttempts = 2;
    resumeConfig.__codeState = { productionSourceHash: 'fixture-production' };
    const plan = await prepareNaturalResumePlan({
        rootDir: fixtureState.tempDir,
        config: resumeConfig,
        sample: fixtureState.sample,
        samplePath: fixtureState.samplePath,
    });

    let visibleMessages = [];
    let now = 0;
    const maintained = [];
    const recalled = [];
    const restored = [];
    const modules = {
        getSummaryStore: () => ({ json: { events: [], facts: [] } }),
        getContext: () => ({ chatId: 'fixture-chat', chat: visibleMessages }),
        getAllChunks: async () => [{ floor: 0, text: '用户问题 0' }],
        getStateAtoms: () => [],
    };
    const result = await runNaturalResumeCases({
        modules,
        plan,
        sample: fixtureState.sample,
        samplePath: fixtureState.samplePath,
        config: resumeConfig,
        restoreResumeBoundary: async ({ snapshot, visibleMessages: boundaryMessages }) => {
            visibleMessages = boundaryMessages;
            restored.push({ floor: snapshot.boundary.queryFloor, visible: boundaryMessages.length });
        },
        setVisibleHistory: async messages => { visibleMessages = messages; },
        summarizeBeforeUser: async () => ({ externalCalls: 0, externalRequests: 0, transportTrace: [] }),
        maintainAfterAi: async ({ floor }) => {
            maintained.push(floor);
            return { floor, externalCalls: 0, externalRequests: 0, transportTrace: [] };
        },
        assertHistoryHealthy: healthyHistory,
        writeRecoverySnapshot: writeFixtureRecoverySnapshot,
        writeBoundarySnapshot: async ({ snapshotPath, goldCase, visibleMessages: boundaryMessages }) => {
            await fs.writeFile(snapshotPath, JSON.stringify({
                kind: 'natural-query-boundary',
                boundary: {
                    queryFloor: goldCase.atFloor,
                    historyThroughFloor: goldCase.historyThroughFloor,
                },
                sample: { messageCount: boundaryMessages.length },
            }), 'utf8');
        },
        executeRecallCase: async recallCase => {
            recalled.push({ pending: recallCase.pendingUserMessage, visible: visibleMessages.length });
            return successfulExecution();
        },
        clock: () => now,
        wait: async delayMs => { now += delayMs; },
    });

    assert.deepEqual(restored, [{ floor: 2, visible: 2 }]);
    assert.deepEqual(maintained, [3, 5]);
    assert.deepEqual(recalled, [{ pending: '用户问题 6', visible: 6 }]);
    assert.equal(result.manifest.status, 'valid');
    assert.equal(result.manifest.mode, 'story-summary-replay-natural-resume');
    assert.equal(result.manifest.progress.completedCases, 2);
    assert.equal(result.manifest.progress.reusedCases, 1);
    assert.equal(result.manifest.progress.productionExternalCalls, 2);
    assert.equal(result.manifest.sourcePrefix.recordedAbandonedSuffixRequests, 1);
    assert.equal(result.manifest.sourcePrefix.misattributedDuplicatedAttempts, 1);
    assert.equal(result.manifest.sourcePrefix.unarchivedTerminalAttempts, 2);
    assert.equal(result.manifest.sourcePrefix.actualAbandonedSuffixAttempts, 2);
    const loaded = await loadGoldCapture(result.artifacts.runDir);
    assert.equal(loaded.cases.length, 2);
    assert.equal(loaded.stageTraces.length, 2);
});

test('natural resume优先恢复最新operational point并守恒复用请求账本', async t => {
    const fixtureState = await fixture(t);
    const sourceRunDir = await createInvalidCaptureWithRecovery(fixtureState);
    const resumeConfig = structuredClone(fixtureState.config);
    resumeConfig.goldEval.captureRunDir = sourceRunDir;
    resumeConfig.goldEval.runName = 'fixture-natural-recovery-resume';
    resumeConfig.goldEval.expectedProductionSourceHash = 'fixture-production';
    resumeConfig.__codeState = { productionSourceHash: 'fixture-production' };
    const plan = await prepareNaturalResumePlan({
        rootDir: fixtureState.tempDir,
        config: resumeConfig,
        sample: fixtureState.sample,
        samplePath: fixtureState.samplePath,
    });
    assert.equal(plan.resumePoint.kind, 'natural-operational-recovery');
    assert.equal(plan.resumeFloor, 3);
    assert.equal(plan.resumeMessageCount, 4);
    assert.equal(plan.reusedRecoveryRequests, 1);
    assert.equal(plan.recordedAbandoned, 2);
    assert.equal(plan.recordedAbandonedAfterRecovery, 1);

    let visibleMessages = [];
    let now = 0;
    const restored = [];
    const summarized = [];
    const maintained = [];
    const modules = {
        getSummaryStore: () => ({ json: { events: [], facts: [] } }),
        getContext: () => ({ chatId: 'fixture-chat', chat: visibleMessages }),
        getAllChunks: async () => [{ floor: 0, text: '用户问题 0' }],
        getStateAtoms: () => [],
    };
    const result = await runNaturalResumeCases({
        modules,
        plan,
        sample: fixtureState.sample,
        samplePath: fixtureState.samplePath,
        config: resumeConfig,
        restoreResumeBoundary: async ({ snapshot, visibleMessages: boundaryMessages }) => {
            visibleMessages = boundaryMessages;
            restored.push({
                kind: snapshot.kind,
                resumeFloor: snapshot.boundary.resumeFloor,
                visible: boundaryMessages.length,
            });
        },
        setVisibleHistory: async messages => { visibleMessages = messages; },
        summarizeBeforeUser: async ({ floor }) => {
            summarized.push(floor);
            return {
                floor,
                externalCalls: 0,
                externalRequests: 0,
                transportTrace: [],
                result: { triggered: false },
            };
        },
        maintainAfterAi: async ({ floor }) => {
            maintained.push(floor);
            return { floor, externalCalls: 0, externalRequests: 0, transportTrace: [] };
        },
        assertHistoryHealthy: healthyHistory,
        writeRecoverySnapshot: writeFixtureRecoverySnapshot,
        writeBoundarySnapshot: async ({ snapshotPath, goldCase, visibleMessages: boundaryMessages }) => {
            await fs.writeFile(snapshotPath, JSON.stringify({
                kind: 'natural-query-boundary',
                boundary: {
                    queryFloor: goldCase.atFloor,
                    historyThroughFloor: goldCase.historyThroughFloor,
                },
                sample: { messageCount: boundaryMessages.length },
            }), 'utf8');
        },
        executeRecallCase: async () => successfulExecution(),
        clock: () => now,
        wait: async delayMs => { now += delayMs; },
    });
    assert.deepEqual(restored, [{ kind: 'natural-operational-recovery', resumeFloor: 3, visible: 4 }]);
    assert.deepEqual(summarized, [4, 6]);
    assert.deepEqual(maintained, [5]);
    assert.equal(result.manifest.sourcePrefix.reusedOperationalRecoveryRequests, 1);
    assert.equal(result.manifest.sourcePrefix.recordedAbandonedSuffixRequests, 1);
    assert.equal(result.manifest.sourcePrefix.actualAbandonedSuffixAttempts, 1);
    assert.equal(result.manifest.progress.productionTransportRequests, 3);
    assert.deepEqual(result.recoveryPoints.map(item => item.resumeFloor), [3]);
    assert.equal(
        result.manifest.progress.recoveryPoint.path.startsWith(`${result.artifacts.runDir}/recovery/`),
        true,
    );
    const loaded = await loadGoldCapture(result.artifacts.runDir);
    assert.equal(loaded.transportTrace[1].preparation.length, 1);
});

test('natural resume在任何API前拒绝被篡改的operational recovery', async t => {
    const fixtureState = await fixture(t);
    const sourceRunDir = await createInvalidCaptureWithRecovery(fixtureState);
    const sourceManifest = JSON.parse(await fs.readFile(path.join(sourceRunDir, 'manifest.json'), 'utf8'));
    const recoveryPath = sourceManifest.progress.recoveryPoint.path;
    const recovery = JSON.parse(await fs.readFile(recoveryPath, 'utf8'));
    recovery.sample.messageCount += 1;
    await fs.writeFile(recoveryPath, JSON.stringify(recovery), 'utf8');
    const resumeConfig = structuredClone(fixtureState.config);
    resumeConfig.goldEval.captureRunDir = sourceRunDir;
    resumeConfig.goldEval.expectedProductionSourceHash = 'fixture-production';
    resumeConfig.__codeState = { productionSourceHash: 'fixture-production' };
    await assert.rejects(() => prepareNaturalResumePlan({
        rootDir: fixtureState.tempDir,
        config: resumeConfig,
        sample: fixtureState.sample,
        samplePath: fixtureState.samplePath,
    }), /recovery snapshot hash/);
});

test('running Gold run 可由控制面显式abort并留下invalid原因', async t => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-gold-abort-'));
    t.after(() => fs.rm(tempDir, { recursive: true, force: true }));
    const runStore = await beginGoldRun({
        runsRoot: tempDir,
        runId: 'fixture-abort-run',
        manifest: { mode: 'fixture', capture: {} },
        cases: [{ id: 'case-a' }],
        bundlePath: null,
        codeArtifacts: [],
    });
    const manifest = await abortRunningGoldRun(runStore.runDir, {
        stage: 'control-plane',
        kind: 'manual-abort',
        caseId: 'case-a',
        message: 'fixture abort',
    });
    assert.equal(manifest.status, 'invalid');
    assert.equal(manifest.invalidReason.kind, 'manual-abort');
    assert.match(await fs.readFile(path.join(runStore.runDir, 'INVALID.md'), 'utf8'), /控制面主动终止/);
});

test('natural resume在API前拒绝被篡改的最后boundary', async t => {
    const fixtureState = await fixture(t);
    const sourceRunDir = await createInvalidCaptureAfterFirstCase(fixtureState);
    const checkpointName = (await fs.readdir(path.join(sourceRunDir, 'checkpoints')))
        .find(name => !name.endsWith('-FAILED.json'));
    const checkpoint = JSON.parse(await fs.readFile(path.join(sourceRunDir, 'checkpoints', checkpointName), 'utf8'));
    const snapshot = JSON.parse(await fs.readFile(checkpoint.boundarySnapshot.path, 'utf8'));
    snapshot.sample.messageCount += 1;
    await fs.writeFile(checkpoint.boundarySnapshot.path, JSON.stringify(snapshot), 'utf8');
    const resumeConfig = structuredClone(fixtureState.config);
    resumeConfig.goldEval.captureRunDir = sourceRunDir;
    resumeConfig.goldEval.expectedProductionSourceHash = 'fixture-production';
    resumeConfig.__codeState = { productionSourceHash: 'fixture-production' };
    await assert.rejects(() => prepareNaturalResumePlan({
        rootDir: fixtureState.tempDir,
        config: resumeConfig,
        sample: fixtureState.sample,
        samplePath: fixtureState.samplePath,
    }), /boundary snapshot hash/);
});

test('natural recall 只消费同一valid capture的逐题边界且不重建历史', async t => {
    const fixtureState = await fixture(t);
    const source = await createSourceCapture(fixtureState);
    const recallConfig = structuredClone(fixtureState.config);
    recallConfig.goldEval.captureRunDir = source.artifacts.runDir;
    recallConfig.goldEval.runName = 'fixture-natural-recall';
    const plan = await prepareNaturalRecallPlan({
        rootDir: fixtureState.tempDir,
        config: recallConfig,
        sample: fixtureState.sample,
        samplePath: fixtureState.samplePath,
    });

    let visibleMessages = [];
    const restored = [];
    const observed = [];
    let now = 0;
    const modules = {
        getSummaryStore: () => ({ json: { events: [], facts: [] } }),
        getContext: () => ({ chatId: 'fixture-chat', chat: visibleMessages }),
        getAllChunks: async () => [{ floor: 0, text: '用户问题 0' }],
        getStateAtoms: () => [],
    };
    const result = await runNaturalRecallCases({
        modules,
        plan,
        sample: fixtureState.sample,
        samplePath: fixtureState.samplePath,
        config: recallConfig,
        restoreBoundarySnapshot: async ({ snapshot, goldCase, visibleMessages: boundaryMessages }) => {
            visibleMessages = boundaryMessages;
            restored.push({
                floor: goldCase.atFloor,
                snapshotCount: snapshot.sample.messageCount,
                visibleCount: boundaryMessages.length,
            });
        },
        executeRecallCase: async (recallCase, _observer, cassette) => {
            assert.equal(cassette.sourceRequestCount, 1);
            observed.push({
                pending: recallCase.pendingUserMessage,
                visibleCount: visibleMessages.length,
                visibleTail: visibleMessages.at(-1)?.mes || null,
            });
            return successfulPairedExecution();
        },
        clock: () => now,
        wait: async delayMs => {
            now += delayMs;
        },
    });

    assert.deepEqual(restored, [
        { floor: 2, snapshotCount: 2, visibleCount: 2 },
        { floor: 6, snapshotCount: 6, visibleCount: 6 },
    ]);
    assert.deepEqual(observed, [
        { pending: '用户问题 2', visibleCount: 2, visibleTail: '角色回答 1' },
        { pending: '用户问题 6', visibleCount: 6, visibleTail: '角色回答 5' },
    ]);
    assert.equal(result.manifest.status, 'valid');
    assert.equal(result.manifest.mode, 'story-summary-replay-natural-recall');
    assert.equal(result.manifest.sourceCapture.runId, source.manifest.runId);
    assert.equal(result.manifest.progress.completedCases, 2);
    assert.equal(result.manifest.progress.productionExternalCalls, 0);
    assert.equal(result.manifest.progress.productionTransportRequests, 2);
    assert.equal(result.manifest.capture.transportMode, 'paired-core-cassette-live-enrichment');
    assert.equal(result.aggregated.overall.recallAt5, 1);
});

test('natural recall 在API前拒绝被篡改的boundary snapshot', async t => {
    const fixtureState = await fixture(t);
    const source = await createSourceCapture(fixtureState);
    const snapshotPath = source.boundarySnapshots[0].path;
    const snapshot = JSON.parse(await fs.readFile(snapshotPath, 'utf8'));
    snapshot.sample.messageCount += 1;
    await fs.writeFile(snapshotPath, JSON.stringify(snapshot), 'utf8');
    const recallConfig = structuredClone(fixtureState.config);
    recallConfig.goldEval.captureRunDir = source.artifacts.runDir;
    await assert.rejects(() => prepareNaturalRecallPlan({
        rootDir: fixtureState.tempDir,
        config: recallConfig,
        sample: fixtureState.sample,
        samplePath: fixtureState.samplePath,
    }), /boundarySnapshots|boundary snapshot/);
});

test('natural recall 首个外部错误立即作废且不执行后续边界', async t => {
    const fixtureState = await fixture(t);
    const source = await createSourceCapture(fixtureState);
    const recallConfig = structuredClone(fixtureState.config);
    recallConfig.goldEval.captureRunDir = source.artifacts.runDir;
    recallConfig.goldEval.runName = 'fixture-natural-recall-failure';
    const plan = await prepareNaturalRecallPlan({
        rootDir: fixtureState.tempDir,
        config: recallConfig,
        sample: fixtureState.sample,
        samplePath: fixtureState.samplePath,
    });
    let calls = 0;
    let visibleMessages = [];
    let now = 0;
    const modules = {
        getSummaryStore: () => ({ json: { events: [], facts: [] } }),
        getContext: () => ({ chatId: 'fixture-chat', chat: visibleMessages }),
        getAllChunks: async () => [{ floor: 0, text: '用户问题 0' }],
        getStateAtoms: () => [],
    };
    const failedExecution = successfulPairedExecution([{
        ...successfulTransport(),
        status: 429,
        responseBody: { error: 'rate limited' },
    }]);

    await assert.rejects(() => runNaturalRecallCases({
        modules,
        plan,
        sample: fixtureState.sample,
        samplePath: fixtureState.samplePath,
        config: recallConfig,
        restoreBoundarySnapshot: async ({ visibleMessages: boundaryMessages }) => {
            visibleMessages = boundaryMessages;
        },
        executeRecallCase: async (_recallCase, _observer, cassette) => {
            assert.equal(cassette.sourceRequestCount, 1);
            calls += 1;
            return failedExecution;
        },
        clock: () => now,
        wait: async delayMs => {
            now += delayMs;
        },
    }), /外部调用失败.*429/);
    assert.equal(calls, 1);

    const runDirs = (await fs.readdir(fixtureState.tempDir, { withFileTypes: true }))
        .filter(entry => entry.isDirectory() && entry.name.includes('fixture-natural-recall-failure'));
    assert.equal(runDirs.length, 1);
    const manifest = JSON.parse(await fs.readFile(
        path.join(fixtureState.tempDir, runDirs[0].name, 'manifest.json'),
        'utf8',
    ));
    assert.equal(manifest.status, 'invalid');
    assert.equal(manifest.progress.completedCases, 0);
    assert.equal(manifest.progress.productionExternalCalls, 1);
    assert.equal(manifest.progress.productionTransportRequests, 2);
});

test('natural recall 的 candidate core Prompt 漂移时立即作废且不执行后续边界', async t => {
    const fixtureState = await fixture(t);
    const source = await createSourceCapture(fixtureState);
    const recallConfig = structuredClone(fixtureState.config);
    recallConfig.goldEval.captureRunDir = source.artifacts.runDir;
    recallConfig.goldEval.runName = 'fixture-natural-recall-core-drift';
    const plan = await prepareNaturalRecallPlan({
        rootDir: fixtureState.tempDir,
        config: recallConfig,
        sample: fixtureState.sample,
        samplePath: fixtureState.samplePath,
    });
    let calls = 0;
    let visibleMessages = [];
    let now = 0;
    const modules = {
        getSummaryStore: () => ({ json: { events: [], facts: [] } }),
        getContext: () => ({ chatId: 'fixture-chat', chat: visibleMessages }),
        getAllChunks: async () => [{ floor: 0, text: '用户问题 0' }],
        getStateAtoms: () => [],
    };

    await assert.rejects(() => runNaturalRecallCases({
        modules,
        plan,
        sample: fixtureState.sample,
        samplePath: fixtureState.samplePath,
        config: recallConfig,
        restoreBoundarySnapshot: async ({ visibleMessages: boundaryMessages }) => {
            visibleMessages = boundaryMessages;
        },
        executeRecallCase: async (_recallCase, _observer, cassette) => {
            assert.equal(cassette.sourceRequestCount, 1);
            calls += 1;
            return {
                ...successfulPairedExecution(),
                corePromptText: '漂移的 core Prompt',
            };
        },
        clock: () => now,
        wait: async delayMs => {
            now += delayMs;
        },
    }), /core Prompt 漂移/);
    assert.equal(calls, 1);

    const runDirs = (await fs.readdir(fixtureState.tempDir, { withFileTypes: true }))
        .filter(entry => entry.isDirectory() && entry.name.includes('fixture-natural-recall-core-drift'));
    assert.equal(runDirs.length, 1);
    const manifest = JSON.parse(await fs.readFile(
        path.join(fixtureState.tempDir, runDirs[0].name, 'manifest.json'),
        'utf8',
    ));
    assert.equal(manifest.status, 'invalid');
    assert.equal(manifest.progress.completedCases, 0);
    assert.equal(manifest.progress.productionExternalCalls, 0);
    assert.equal(manifest.progress.productionTransportRequests, 1);
});
