import test from 'node:test';
import assert from 'node:assert/strict';

import { parseCasesJsonl, validateCase } from '../lib/cases.mjs';
import { parseAdjudicationJsonl, validateAdjudication } from '../lib/adjudication.mjs';
import { pairSemanticOutcomes } from '../lib/paired-reader.mjs';
import {
    aggregateMetrics,
    computeCaseRecallMetrics,
    scoreAnswer,
} from '../lib/metrics.mjs';
import { scoreCase } from '../lib/scorer.mjs';
import {
    buildEvidenceCatalog,
    createReplayObservationCollector,
    loadGoldCasesFromText,
    parseFloorReferences,
} from '../lib/replay-adapter.mjs';
import {
    assertGoldExternalStagesHealthy,
    buildGoldReaderMessages,
    buildReplayConfigFingerprint,
    describeApi,
    describeGoldReaderGeneration,
    GOLD_READER_SYSTEM_PROMPT,
    runGoldReader,
} from '../replay-session.mjs';

test('requiredAnyGroups 要求每个独立证据组都至少命中一个', () => {
    const metrics = computeCaseRecallMetrics({
        requiredAll: [],
        requiredAny: [],
        requiredAnyGroups: [[10, 11], [20, 21]],
        ranked: [
            { floor: 10, rank: 1, unitId: 'a' },
            { floor: 21, rank: 2, unitId: 'b' },
        ],
    });
    assert.equal(metrics.recallAt5, 1);

    const missingGroup = computeCaseRecallMetrics({
        requiredAll: [],
        requiredAny: [],
        requiredAnyGroups: [[10, 11], [20, 21]],
        ranked: [{ floor: 10, rank: 1, unitId: 'a' }],
    });
    assert.equal(missingGroup.recallAt5, 0.5);
});

function goldCase(overrides = {}) {
    const raw = {
        id: 'fixture-fact-001',
        dataset: 'synthetic',
        split: 'dev',
        category: 'fact',
        atFloor: 20,
        query: '艾伦加入了哪个组织？',
        expectedAnswer: { type: 'exact', values: ['守望团'] },
        evidence: {
            requiredAll: [8],
            requiredAny: [],
            supporting: [],
            forbiddenAsCurrent: [],
        },
        provenance: { method: 'fixture', verifier: 'author', status: 'accepted' },
        ...overrides,
    };
    const validated = validateCase(raw);
    assert.equal(validated.ok, true, validated.errors.join('; '));
    return validated.case;
}

function ranked(...floors) {
    return floors.map((floor, index) => ({ floor, rank: index + 1, score: 1 - index * 0.1 }));
}

function successfulObservation(floor = 8) {
    return {
        extractedFloors: [floor],
        stages: {
            r1Dense: ranked(floor),
            r2Dense: ranked(floor),
            lexical: [],
            fusion: ranked(floor),
            rerank: ranked(floor),
            graph: [],
            final: ranked(floor),
            prompt: ranked(floor),
        },
        promptFloors: [floor],
        answerText: '艾伦加入了守望团。',
        efficiency: { recallMs: 12, externalCalls: 1 },
    };
}

test('case JSONL 校验会规范楼层并拒绝重复 id', () => {
    const one = {
        ...goldCase(),
        evidence: {
            requiredAll: [8, 8],
            requiredAny: [],
            supporting: [],
            forbiddenAsCurrent: [],
        },
    };
    const parsed = parseCasesJsonl(`${JSON.stringify(one)}\n${JSON.stringify(one)}\n`);
    assert.equal(parsed.cases.length, 1);
    assert.deepEqual(parsed.cases[0].evidence.requiredAll, [8]);
    assert.match(parsed.errors[0], /id 重复/);
});

test('召回指标使用最终排名并正确统计 required-all 与 forbidden', () => {
    const metrics = computeCaseRecallMetrics({
        requiredAll: [4, 5],
        requiredAny: [],
        supporting: [9],
        forbidden: [2],
        ranked: ranked(4, 9, 2),
        inPromptFloors: [4, 2],
    });
    assert.equal(metrics.recallAt5, 0.5);
    assert.equal(metrics.precisionAt5, 2 / 3);
    assert.equal(metrics.mrr, 1);
    assert.deepEqual(metrics.requiredAll, { applicable: true, covered: false, ratio: 0.5 });
    assert.deepEqual(metrics.forbidden.inTop10, [2]);
    assert.deepEqual(metrics.forbidden.inPrompt, [2]);
});

test('同一检索单元覆盖多楼层时共享 rank，Precision 分母按唯一单元计算', () => {
    const metrics = computeCaseRecallMetrics({
        requiredAll: [41],
        supporting: [],
        ranked: [
            { floor: 40, rank: 1, unitId: 'event:e1' },
            { floor: 41, rank: 1, unitId: 'event:e1' },
            { floor: 8, rank: 2, unitId: 'constraint:f1' },
            { floor: 9, rank: 3, unitId: 'l0:9' },
        ],
    });
    assert.equal(metrics.recallAt5, 1);
    assert.equal(metrics.mrr, 1);
    assert.equal(metrics.precisionAt5, 1 / 3);
    assert.equal(metrics.ranks.byFloor[41], 1);
});

test('完整事实链路得到满召回且无失败归因', () => {
    const result = scoreCase({ case: goldCase(), observation: successfulObservation() });
    assert.equal(result.metricRow.metrics.recallAt5, 1);
    assert.equal(result.stageTraceRow.requiredFinalRanking[0].rank, 1);
    assert.equal(result.metricRow.answer.correct, true);
    assert.equal(result.stageTraceRow.answer.text, '艾伦加入了守望团。');
    assert.equal(result.stageTraceRow.answer.correct, true);
    assert.equal(result.metricRow.earliestFailure, null);
    assert.equal(result.failureRow, null);
    assert.equal(result.stageTraceRow.stages.prompt, 'hit');
});

test('required-all 必须每个证据都通过，不能用任一命中冒充成功', () => {
    const c = goldCase({
        id: 'fixture-causal-001',
        category: 'causal',
        expectedAnswer: { type: 'contains', substrings: ['下雨', '城门'] },
        evidence: {
            requiredAll: [4, 5],
            requiredAny: [],
            supporting: [],
            forbiddenAsCurrent: [],
        },
    });
    const observation = {
        ...successfulObservation(4),
        extractedFloors: [4, 5],
        answerText: null,
    };
    const result = scoreCase({ case: c, observation });
    assert.equal(result.stageTraceRow.stages.extraction, 'hit');
    assert.equal(result.stageTraceRow.stages.retrieval, 'miss');
    assert.equal(result.metricRow.metrics.requiredAll.covered, false);
    assert.equal(result.metricRow.earliestFailure, 'retrieval');
});

test('required-any 只需一个等价证据完整通过', () => {
    const c = goldCase({
        id: 'fixture-any-001',
        evidence: {
            requiredAll: [],
            requiredAny: [8, 10],
            supporting: [],
            forbiddenAsCurrent: [],
        },
    });
    const result = scoreCase({ case: c, observation: successfulObservation(10) });
    assert.equal(result.stageTraceRow.stages.prompt, 'hit');
    assert.equal(result.metricRow.metrics.recallAt10, 1);
    assert.equal(result.metricRow.earliestFailure, null);
});

test('失败归因返回证据不可恢复后的最早阶段', () => {
    const cases = [
        ['extraction', { extractedFloors: [], stages: {} }],
        ['retrieval', { extractedFloors: [8], stages: {} }],
        ['fusion', { extractedFloors: [8], stages: { r1Dense: ranked(8) } }],
        ['rerank', {
            extractedFloors: [8],
            stages: { r1Dense: ranked(8), fusion: ranked(8) },
        }],
        ['graph', {
            extractedFloors: [8],
            stages: { r1Dense: ranked(8), fusion: ranked(8), rerank: ranked(8) },
        }],
    ];

    for (const [expected, observation] of cases) {
        const result = scoreCase({ case: goldCase(), observation });
        assert.equal(result.metricRow.earliestFailure, expected);
    }
});

test('graph 恢复的证据进入最终排名，不被前序 miss 误报为失败', () => {
    const c = goldCase({
        id: 'fixture-associative-001',
        category: 'associative',
        query: '守望团用什么徽章？',
        expectedAnswer: { type: 'exact', values: ['银鹰'] },
        evidence: {
            requiredAll: [10],
            requiredAny: [],
            supporting: [8],
            forbiddenAsCurrent: [],
        },
    });
    const result = scoreCase({
        case: c,
        observation: {
            extractedFloors: [8, 10],
            stages: {
                r1Dense: ranked(8),
                r2Dense: ranked(8),
                fusion: ranked(8),
                rerank: ranked(8),
                graph: ranked(10),
                final: ranked(8, 10),
                prompt: ranked(10),
            },
            answerText: '徽章是银鹰。',
        },
    });
    assert.equal(result.stageTraceRow.stageByFloor[10].graph, 'recovered-by-graph');
    assert.equal(result.stageTraceRow.stages.graph, 'recovered-by-graph');
    assert.equal(result.metricRow.metrics.recallAt5, 1);
    assert.equal(result.metricRow.earliestFailure, null);
});

test('最终证据被 Prompt 预算丢弃时归因到 prompt', () => {
    const observation = successfulObservation();
    observation.stages.prompt = [];
    observation.promptFloors = [];
    observation.promptText = '完全不相关的内容';
    observation.answerText = null;
    const result = scoreCase({ case: goldCase(), observation });
    assert.equal(result.stageTraceRow.stages.graph, 'hit');
    assert.equal(result.metricRow.earliestFailure, 'prompt');
});

test('Prompt 文本证据匹配可补充楼层归属，错误答案只归因到 answer', () => {
    const observation = successfulObservation();
    observation.stages.prompt = [];
    observation.promptFloors = [];
    observation.promptText = '历史证据：守望团的艾伦正式加入了队伍。';
    observation.evidenceTextsByFloor = {
        8: ['守望团的艾伦正式加入了队伍'],
    };
    observation.answerText = '艾伦加入了商会。';
    const result = scoreCase({ case: goldCase(), observation });
    assert.equal(result.stageTraceRow.stageByFloor[8].prompt, 'hit');
    assert.deepEqual(result.stageTraceRow.answerSurfaceInPrompt, { applicable: true, matched: true });
    assert.equal(result.metricRow.earliestFailure, 'answer');
});

test('答案判定与汇总指标保持可复算', () => {
    assert.equal(scoreAnswer({ type: 'abstain' }, '历史中没有相关信息。').correct, true);
    assert.equal(scoreAnswer({ type: 'contains', substrings: ['下雨', '城门'] }, '因为下雨，城门关闭。').correct, true);

    const success = scoreCase({ case: goldCase(), observation: successfulObservation() }).metricRow;
    const aggregated = aggregateMetrics([success]);
    assert.equal(aggregated.overall.cases, 1);
    assert.equal(aggregated.overall.recallAt10, 1);
    assert.equal(aggregated.overall.answerAccuracy, 1);
});

test('replay observer 只保存标准楼层排名并去重', () => {
    const collector = createReplayObservationCollector(() => 123);
    collector.observe({
        stage: 'r1Dense',
        ranked: [
            { floor: 8, score: 0.9 },
            { floor: 8, score: 0.8 },
            { floor: 10, score: 0.7 },
        ],
    });
    const observation = collector.build({ extractedFloors: [8, 10] });
    assert.deepEqual(observation.stages.r1Dense, [
        { floor: 8, rank: 1, score: 0.9 },
        { floor: 10, rank: 2, score: 0.7 },
    ]);
    assert.deepEqual(observation.timeline, [{ stage: 'r1Dense', at: 123 }]);
});

test('replay observer 将显式诊断阶段与评分阶段隔离保存', () => {
    const collector = createReplayObservationCollector(() => 123);
    collector.observe({
        stage: 'lexicalPreDenseGate',
        ranked: [
            { floor: 8, score: 0.9, denseScore: 0.49, passedDenseGate: false },
            { floor: 10, score: 0.7, denseScore: 0.51, passedDenseGate: true },
        ],
    });
    const observation = collector.build();
    assert.deepEqual(observation.stages.lexical, []);
    assert.deepEqual(observation.diagnostics.lexicalPreDenseGate, [
        { floor: 8, rank: 1, score: 0.9, denseScore: 0.49, passedDenseGate: false },
        { floor: 10, rank: 2, score: 0.7, denseScore: 0.51, passedDenseGate: true },
    ]);
    collector.observe({ stage: 'fusionPreCap', ranked: [{ floor: 8, rank: 61, score: 0.02 }] });
    assert.deepEqual(collector.build().diagnostics.fusionPreCap, [
        { floor: 8, rank: 61, score: 0.02 },
    ]);
    collector.observe({ stage: 'queryFocusOwnership', value: { usesFocusOnlyCandidate: true } });
    assert.deepEqual(collector.build().diagnosticValues.queryFocusOwnership, { usesFocusOnlyCandidate: true });
});

test('replay observer 保留同一单元的共享 rank 与 unitId', () => {
    const collector = createReplayObservationCollector(() => 456);
    collector.observe({
        stage: 'final',
        ranked: [
            { floor: 40, rank: 1, unitId: 'event:e1', source: 'event' },
            { floor: 8, rank: 2, unitId: 'constraint:f1', source: 'constraint' },
            { floor: 41, rank: 1, unitId: 'event:e1', source: 'causal' },
            { floor: 41, rank: 1, unitId: 'event:e1', source: 'causal' },
        ],
    });
    const observation = collector.build();
    assert.deepEqual(observation.stages.final, [
        { floor: 40, rank: 1, score: null, unitId: 'event:e1', source: 'event' },
        { floor: 41, rank: 1, score: null, unitId: 'event:e1', source: 'causal' },
        { floor: 8, rank: 2, score: null, unitId: 'constraint:f1', source: 'constraint' },
    ]);
});

test('评分器按单元 rank 定位 required evidence，并在 trace 保留 unitId', () => {
    const observation = successfulObservation(8);
    observation.stages.final = [
        { floor: 30, rank: 1, unitId: 'event:e1', source: 'event' },
        { floor: 8, rank: 1, unitId: 'event:e1', source: 'event' },
    ];
    const result = scoreCase({ case: goldCase(), observation });
    assert.equal(result.metricRow.metrics.mrr, 1);
    assert.equal(result.stageTraceRow.requiredFinalRanking[0].rank, 1);
    assert.equal(result.stageTraceRow.requiredFinalRanking[0].unitId, 'event:e1');
    assert.deepEqual(result.stageTraceRow.rankingDiagnostics, {
        rows: 2,
        units: 1,
        multiFloorUnits: 1,
        maxFloorsPerUnit: 2,
    });
});

test('replay adapter 建立真实索引覆盖，并拒绝 atFloor 越界用例', () => {
    assert.deepEqual(parseFloorReferences('事件发生于 (#3-4)，后来在 #8 更新。'), [2, 3, 7]);
    const catalog = buildEvidenceCatalog({
        messages: [{ mes: '原始消息' }],
        stateAtoms: [{ floor: 0, semantic: '原始消息的状态' }],
        chunks: [{ floor: 1, text: '第二楼 chunk' }],
        events: [{ title: '事件', summary: '发生在 (#3-4)' }],
        facts: [{ s: '艾伦', p: '组织', o: '守望团', since: 7 }],
    });
    assert.deepEqual(catalog.extractedFloors, [0, 1, 2, 3, 7]);
    assert.ok(catalog.evidenceTextsByFloor[0].includes('原始消息'));

    const line = JSON.stringify(goldCase());
    assert.equal(loadGoldCasesFromText(line, { split: 'dev', boundaryFloor: 20 }).length, 1);
    assert.throws(() => loadGoldCasesFromText(line, { split: 'dev', boundaryFloor: 19 }), /atFloor/);
});

test('运行清单只记录 API host/model，永不落盘 Key', () => {
    const api = {
        provider: 'custom',
        url: 'https://api.example.com/v1?token=secret-in-url',
        key: 'secret-key',
        model: 'model-a',
    };
    assert.deepEqual(describeApi(api), {
        provider: 'custom',
        endpointHost: 'api.example.com',
        model: 'model-a',
    });
    const fingerprint = buildReplayConfigFingerprint({
        summaryApi: api,
        vectorConfig: { enabled: true, embeddingApi: api },
    });
    assert.match(fingerprint, /^[a-f0-9]{64}$/);
    assert.equal(fingerprint.includes('secret'), false);
});

test('固定 reader 只接收实际 Prompt 与 query，并冻结生成参数', async () => {
    const googleGeneration = describeGoldReaderGeneration({
        summaryApi: { provider: 'google' },
        goldEval: { reader: { enabled: true } },
    });
    assert.deepEqual({
        ...googleGeneration,
        promptHash: '<hash>',
    }, {
        temperature: 0,
        maxTokens: 30000,
        reasoningEffort: 'none',
        maxAttempts: 3,
        retryDelayMs: 5000,
        concurrency: 4,
        promptVersion: 2,
        promptHash: '<hash>',
        providerThinkingConfig: null,
    });
    assert.match(googleGeneration.promptHash, /^[a-f0-9]{64}$/);
    const messages = buildGoldReaderMessages({ promptText: 'memory-only', query: 'question-only' });
    const serialized = JSON.stringify(messages);
    assert.match(serialized, /memory-only/);
    assert.match(serialized, /question-only/);
    assert.doesNotMatch(serialized, /expected-answer-sentinel/);
    assert.equal(messages[0].content, GOLD_READER_SYSTEM_PROMPT);
    assert.equal(messages[0].content, [
        'role: 你是严格的记忆问答 reader。',
        'task: 协助完成记忆模块功能开发，进行记忆召回准确性测评。',
        '',
        '具体要求: 只能依据提供的“实际记忆 Prompt”回答问题，不得使用外部知识补全。',
        '答案尽量简短、直接；不要解释推理，不要复述问题。',
        '若实际记忆 Prompt 不足以确定答案，只输出“不知道”。',
    ].join('\n'));

    const calls = [];
    const times = [100, 142];
    const result = await runGoldReader({
        config: {
            summaryApi: { provider: 'deepseek', url: 'https://example.com', model: 'reader-a' },
            goldEval: {
                reader: { enabled: true, temperature: 0 },
            },
        },
        promptText: 'memory-only',
        query: 'question-only',
        callApi: async (api, inputMessages, args) => {
            calls.push({ api, inputMessages, args });
            return '  answer-only  ';
        },
        clock: () => times.shift(),
    });
    assert.deepEqual(result, {
        answerText: 'answer-only',
        readerMs: 42,
        readerCalls: 1,
        usage: null,
        transport: null,
        responseMeta: null,
        attempts: [{
            attempt: 1,
            status: 'success',
            transport: null,
            usage: null,
            responseMeta: null,
        }],
    });
    assert.equal(calls.length, 1);
    assert.deepEqual({
        temperature: calls[0].args.temperature,
        max_tokens: calls[0].args.max_tokens,
        reasoning_effort: calls[0].args.reasoning_effort,
    }, {
        temperature: 0,
        max_tokens: 30000,
        reasoning_effort: 'none',
    });
    assert.equal(typeof calls[0].args.onResponse, 'function');
    assert.equal(typeof calls[0].args.onTransport, 'function');
});

test('reader 空答失败保存安全的 provider 响应元数据', async () => {
    await assert.rejects(
        runGoldReader({
            config: {
                summaryApi: { provider: 'google', url: 'https://example.com', model: 'reader-a' },
                goldEval: { reader: { enabled: true, maxAttempts: 1 } },
            },
            promptText: 'memory-only',
            query: 'question-only',
            callApi: async (_api, _messages, args) => {
                args.onResponse({
                    candidates: [{
                        finishReason: 'PROHIBITED_CONTENT',
                        content: { parts: [] },
                    }],
                    promptFeedback: { blockReason: 'SAFETY' },
                    usageMetadata: { promptTokenCount: 8, thoughtsTokenCount: 2 },
                });
                return '';
            },
        }),
        error => {
            assert.deepEqual(error.goldFailure.responseMeta, {
                protocol: 'google',
                candidateCount: 1,
                finishReasons: ['PROHIBITED_CONTENT'],
                promptBlockReason: 'SAFETY',
                outputChars: 0,
            });
            assert.equal(JSON.stringify(error.goldFailure.responseMeta).includes('memory-only'), false);
            return true;
        },
    );
});

test('reader 对空答进行有界重试，并记录每次尝试', async () => {
    let calls = 0;
    const result = await runGoldReader({
        config: {
            summaryApi: { provider: 'custom', url: 'https://example.com', model: 'reader-a' },
            goldEval: { reader: { enabled: true, maxAttempts: 3, retryDelayMs: 5000 } },
        },
        promptText: 'memory-only',
        query: 'question-only',
        sleep: async () => {},
        callApi: async (_api, _messages, args) => {
            calls++;
            if (calls === 1) return '';
            return 'answer-only';
        },
    });
    assert.equal(calls, 2);
    assert.equal(result.readerCalls, 2);
    assert.equal(result.attempts.length, 2);
    assert.equal(result.attempts[0].kind, 'empty-response');
    assert.equal(result.attempts[0].retryable, true);
    assert.equal(result.attempts[0].retryDelayMs, 5000);
    assert.equal(result.attempts[1].status, 'success');
});

test('reader 对参数类 HTTP 错误不盲目重试', async () => {
    let calls = 0;
    await assert.rejects(
        runGoldReader({
            config: {
                summaryApi: { provider: 'custom', url: 'https://example.com', model: 'reader-a' },
                goldEval: { reader: { enabled: true, maxAttempts: 3 } },
            },
            promptText: 'memory-only',
            query: 'question-only',
            sleep: async () => {},
            callApi: async () => {
                calls++;
                const error = new Error('bad request');
                error.httpStatus = 400;
                throw error;
            },
        }),
        error => {
            assert.equal(calls, 1);
            assert.equal(error.goldFailure.retryable, false);
            assert.equal(error.goldFailure.readerExternalCalls, 1);
            return true;
        },
    );
});

test('Gold Eval 遇到任一关键外部阶段失败会立即作废', () => {
    assert.doesNotThrow(() => assertGoldExternalStagesHealthy({
        normalizedRecall: { metrics: { external: { failures: [] } } },
    }, 'healthy-case'));

    assert.throws(() => assertGoldExternalStagesHealthy({
        normalizedRecall: {
            metrics: {
                external: {
                    failures: [
                        {
                            stage: 'rerank',
                            kind: 'http',
                            status: 429,
                            batchIndex: 1,
                        },
                    ],
                },
            },
        },
    }, 'failed-case'), /Gold Eval 已中止.*failed-case.*rerank.*429/);
});

test('结构化人工裁决覆盖全部机器错题并推导语义指标', () => {
    const cases = [
        { id: 'c1', evidence: { requiredAll: [1], requiredAny: [] } },
        { id: 'c2', evidence: { requiredAll: [2], requiredAny: [] } },
        { id: 'c3', evidence: { requiredAll: [3], requiredAny: [] } },
    ];
    const stageTraces = [
        { id: 'c1', promptFloors: [], answer: { correct: false } },
        { id: 'c2', promptFloors: [2], answer: { correct: false } },
        { id: 'c3', promptFloors: [3], answer: { correct: true } },
    ];
    const parsed = parseAdjudicationJsonl([
        JSON.stringify({ caseId: 'c1', classification: 'prompt-insufficient', semanticPass: false }),
        JSON.stringify({ caseId: 'c2', classification: 'scorer-false-negative', semanticPass: true }),
    ].join('\n'));
    assert.deepEqual(parsed.errors, []);
    const result = validateAdjudication({ cases, stageTraces, rows: parsed.rows });
    assert.equal(result.ok, true);
    assert.equal(result.summary.machinePass, 1);
    assert.equal(result.summary.semanticPass, 2);
    assert.equal(result.summary.semanticAccuracy, 2 / 3);
    assert.equal(result.summary.evidencePresent, 2);
    assert.equal(result.summary.evidencePresentSemanticPass, 2);
});

test('结构化人工裁决拒绝漏题和与 Prompt 证据相反的分类', () => {
    const cases = [
        { id: 'c1', evidence: { requiredAll: [1], requiredAny: [] } },
        { id: 'c2', evidence: { requiredAll: [2], requiredAny: [] } },
    ];
    const stageTraces = [
        { id: 'c1', promptFloors: [1], answer: { correct: false } },
        { id: 'c2', promptFloors: [2], answer: { correct: false } },
    ];
    const result = validateAdjudication({
        cases,
        stageTraces,
        rows: [{ caseId: 'c1', classification: 'prompt-insufficient', semanticPass: false }],
    });
    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /required evidence 已在 Prompt/);
    assert.match(result.errors.join('\n'), /缺少机器错题裁决: c2/);
});

test('人工裁决允许实际 Prompt 含答案表面时识别等价回答', () => {
    const cases = [{ id: 'c1', evidence: { requiredAll: [1], requiredAny: [] } }];
    const stageTraces = [{
        id: 'c1',
        promptFloors: [],
        answerSurfaceInPrompt: { applicable: true, matched: true },
        answer: { correct: false },
    }];
    const result = validateAdjudication({
        cases,
        stageTraces,
        rows: [{ caseId: 'c1', classification: 'scorer-false-negative', semanticPass: true }],
    });
    assert.equal(result.ok, true);
    assert.equal(result.summary.evidencePresent, 1);
    assert.equal(result.summary.semanticPass, 1);
});

test('v2 人工证据判断可推翻 floor/surface 的语义假阳性', () => {
    const cases = [
        { id: 'floor-hit', evidence: { requiredAll: [1], requiredAny: [] } },
        { id: 'surface-hit', evidence: { requiredAll: [2], requiredAny: [] } },
    ];
    const stageTraces = [
        {
            id: 'floor-hit',
            promptFloors: [1],
            stages: { prompt: 'hit' },
            answerSurfaceInPrompt: { matched: false },
            answer: { correct: false },
        },
        {
            id: 'surface-hit',
            promptFloors: [],
            stages: { fusion: 'miss', prompt: 'miss' },
            answerSurfaceInPrompt: { matched: true },
            answer: { correct: false },
        },
    ];
    const parsed = parseAdjudicationJsonl([
        JSON.stringify({
            schemaVersion: 2,
            caseId: 'floor-hit',
            promptEvidence: 'distorted',
            semanticPass: false,
            note: '来源楼层进入事件，但目标事实被摘要改写。',
        }),
        JSON.stringify({
            schemaVersion: 2,
            caseId: 'surface-hit',
            promptEvidence: 'missing',
            semanticPass: false,
            note: '答案词只出现在无关关系中。',
        }),
    ].join('\n'));
    assert.deepEqual(parsed.errors, []);

    const result = validateAdjudication({ cases, stageTraces, rows: parsed.rows });
    assert.equal(result.ok, true);
    assert.equal(result.summary.classifications['prompt-insufficient'], 2);
    assert.equal(result.summary.evidenceSignalConflicts, 2);
    assert.equal(result.summary.failureOwners['summary-fidelity'], 1);
    assert.equal(result.summary.failureOwners.fusion, 1);
});

test('v2 从证据充分性和语义判断唯一推导 scorer 与 reader 归因', () => {
    const cases = [
        { id: 'equivalent', evidence: { requiredAll: [1], requiredAny: [] } },
        { id: 'reader-error', evidence: { requiredAll: [2], requiredAny: [] } },
        { id: 'fixture', evidence: { requiredAll: [3], requiredAny: [] } },
    ];
    const stageTraces = cases.map((item, index) => ({
        id: item.id,
        promptFloors: [index + 1],
        answer: { correct: false },
    }));
    const parsed = parseAdjudicationJsonl([
        JSON.stringify({
            schemaVersion: 2,
            caseId: 'equivalent',
            promptEvidence: 'sufficient',
            semanticPass: true,
            note: '回答语义等价。',
        }),
        JSON.stringify({
            schemaVersion: 2,
            caseId: 'reader-error',
            promptEvidence: 'sufficient',
            semanticPass: false,
            note: '证据充分但回答错误。',
        }),
        JSON.stringify({
            schemaVersion: 2,
            caseId: 'fixture',
            promptEvidence: 'sufficient',
            semanticPass: true,
            fixtureDefect: true,
            note: 'fixture 的 expectedAnswer 与问题类型不符。',
        }),
    ].join('\n'));
    assert.deepEqual(parsed.errors, []);

    const result = validateAdjudication({ cases, stageTraces, rows: parsed.rows });
    assert.equal(result.ok, true);
    assert.equal(result.summary.semanticPass, 2);
    assert.equal(result.summary.classifications['scorer-false-negative'], 1);
    assert.equal(result.summary.classifications['model-error'], 1);
    assert.equal(result.summary.classifications['fixture-defect'], 1);
    assert.equal(result.summary.failureOwners.scorer, 1);
    assert.equal(result.summary.failureOwners.reader, 1);
    assert.equal(result.summary.failureOwners.fixture, 1);
});

test('v2 不奖励无 Prompt 证据的幸运猜中且要求审计说明', () => {
    const unsupported = parseAdjudicationJsonl(JSON.stringify({
        schemaVersion: 2,
        caseId: 'c1',
        promptEvidence: 'missing',
        semanticPass: true,
        note: '答案碰巧命中，但 Prompt 不支持。',
    }));
    assert.match(unsupported.errors.join('\n'), /不得 semanticPass=true/);

    const noNote = parseAdjudicationJsonl(JSON.stringify({
        schemaVersion: 2,
        caseId: 'c1',
        promptEvidence: 'sufficient',
        semanticPass: false,
    }));
    assert.match(noNote.errors.join('\n'), /缺少 note/);
});

test('语义配对严格按同一 caseId 统计胜负且拒绝集合漂移', () => {
    const baseline = new Map([['c1', true], ['c2', false], ['c3', true]]);
    const candidate = new Map([['c1', true], ['c2', true], ['c3', false]]);
    assert.deepEqual(pairSemanticOutcomes(baseline, candidate), {
        wins: 1,
        losses: 1,
        ties: 1,
        winIds: ['c2'],
        lossIds: ['c3'],
        tieIds: ['c1'],
    });
    assert.throws(
        () => pairSemanticOutcomes(baseline, new Map([['c1', true], ['c2', true]])),
        /candidate missing case: c3/,
    );
});
