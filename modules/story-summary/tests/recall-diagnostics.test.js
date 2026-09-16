import assert from 'node:assert/strict';
import test from 'node:test';
import { createRecallDiagnostics, formatRecallDiagnostics, formatRecallReuseDiagnostics, recordRecallFallback } from '../recall-diagnostics.js';
import { createMetrics, detectIssues, finalizeMetricsTiming } from '../vector/retrieval/metrics.js';

test('recall reports distinguish empty, failed, cancelled and degraded with real reasons', () => {
    const d = createRecallDiagnostics('chat-a');
    d.stage = 'round1-embed';
    d.reason = '没有可用的查询内容';
    d.metrics = createMetrics();
    const empty = formatRecallDiagnostics(d, { status: 'empty' });
    assert.match(empty, /status: empty/);
    assert.match(empty, /没有可用的查询内容/);
    assert.match(empty, /部分指标/);
    assert.doesNotMatch(empty, /potential_issues: none/);
    const error = new Error('request failed', { cause: new Error('HTTP 429') });
    const failed = formatRecallDiagnostics(d, { status: 'failed', error });
    assert.match(failed, /status: failed/);
    assert.match(failed, /Caused by: Error: HTTP 429/);
    assert.match(formatRecallDiagnostics(d, { status: 'cancelled', reason: 'user-stop' }), /reason: user-stop/);
    d.reason = '';
    assert.match(formatRecallDiagnostics(d, { status: 'success' }), /status: success/);
    recordRecallFallback(d, 'event-rerank', error);
    assert.match(formatRecallDiagnostics(d, { status: 'success' }), /status: degraded/);
});

test('external status and actual lexical gates appear in the copyable report', () => {
    const d = createRecallDiagnostics('chat-a');
    d.metrics = createMetrics();
    d.metrics.lexical.denseGateThresholds = { event: 0.61, floor: 0.47 };
    d.metrics.external.failures.push({ stage: 'event-rerank', kind: 'http', status: 429, batchIndex: 1, elapsedMs: 25 });
    const text = formatRecallDiagnostics(d, { status: 'success' });
    assert.match(text, /event-rerank: http \| HTTP 429 \| batch=2 \| 25ms/);
    assert.match(text, /0\.61/);
    assert.match(text, /0\.47/);
    assert.doesNotMatch(text, /threshold=0\.50/);
});

test('timing counts assembly and local L1 selection once, excluding retry backoff from API time', () => {
    const m = createMetrics();
    Object.assign(m.timing, {
        round1Embed: 700, round1EmbedRetryWait: 500,
        directEvidenceRetrieval: 90,
        evidenceAssembly: 30, constraintFilter: 10, formatting: 10, runtimeEndSession: 5,
    });
    m.query.buildTime = 15;
    finalizeMetricsTiming(m, 900);
    assert.equal(m.timing.total, 900);
    assert.equal(m.timing.externalTotal, 200);
    assert.equal(m.timing.localKnownTotal, 160);
    assert.equal(m.timing.unattributed, 40);
    finalizeMetricsTiming(m, 900);
    assert.equal(m.timing.localKnownTotal, 160);
    m.evidence.directEvidenceStatus = 'failed';
    finalizeMetricsTiming(m, 900);
    assert.equal(m.timing.localKnownTotal, 160);
    assert.equal(m.timing.unattributed, 40);
});

test('event-only recall is not diagnosed as total retrieval failure', () => {
    const m = createMetrics();
    m.event.selected = 1;
    m.event.byRecallType.lexical = 1;
    assert.doesNotMatch(detectIssues(m).join('\n'), /all retrieval paths|No floor or event candidates|No DIRECT or CAUSAL/i);
});

test('reuse identifies the source and preserves degradation as an original report, without new retrieval metrics', () => {
    const original = createRecallDiagnostics('chat-a');
    recordRecallFallback(original, 'lexical-index', new Error('IndexedDB read failed'));
    const memory = { sourceIndex: 5, report: formatRecallDiagnostics(original, { status: 'success' }) };
    const reused = createRecallDiagnostics('chat-a', 'continue');
    reused.finishedAt = reused.startedAt + 1;
    const text = formatRecallReuseDiagnostics(reused, memory);
    assert.match(text, /复用本轮记忆/);
    assert.match(text, /来源楼层: 6/);
    assert.match(text, /以下状态及耗时属于首次召回/);
    assert.match(text, /status: degraded/);
    assert.match(text, /IndexedDB read failed/);
    assert.equal(text.split('[Recall Result]').length, 2);
    assert.equal(formatRecallReuseDiagnostics(reused, memory), text);
    assert.equal(reused.metrics, null);
});
