import assert from 'node:assert/strict';
import { EXT_ID } from '../../core/constants.js';
import { __setReplayContext, __setExtensionSettings } from './shims/extensions.js';
import { __setChatMetadata } from './shims/script.js';
import { applySummaryPanelConfigSnapshot, getVectorConfig } from '../../modules/story-summary/data/config.js';
import { getSummaryStore } from '../../modules/story-summary/data/store.js';
import { buildVectorPromptText, buildVectorPromptForReplay } from '../../modules/story-summary/generate/prompt.js';
import { runSummaryGeneration } from '../../modules/story-summary/generate/generator.js';
import { createRecallDiagnostics, formatRecallDiagnostics } from '../../modules/story-summary/recall-diagnostics.js';
import { createMetrics } from '../../modules/story-summary/vector/retrieval/metrics.js';
import { getEngineFingerprint } from '../../modules/story-summary/vector/utils/embedder.js';
import { metaTable, eventVectorsTable, chunksTable, chunkVectorsTable } from '../../modules/story-summary/data/db.js';
import { shutdownRecallRuntime, getRecallRuntimeStats } from '../../modules/story-summary/vector/runtime/runtime.js';
import { invalidateLexicalIndex } from '../../modules/story-summary/vector/retrieval/lexical-index.js';

// Real production paths with only host/API boundaries substituted. No external calls.
export async function runDiagnosticsCheck() {
    const chatId = 'diagnostics-check';
    const event = { id: 'evt-1', title: '回家', summary: '小红回到家里。 (#1)', participants: ['小红'], causedBy: [] };
    const store = { lastSummarizedMesId: 0, json: { events: [event], characters: { main: ['小红'] }, facts: [], arcs: [], keywords: [] } };
    const chat = [{ is_user: false, mes: '' }, { is_user: true, mes: '' }];
    __setExtensionSettings({ [EXT_ID]: { storySummary: { enabled: true } } });
    __setChatMetadata({ extensions: { [EXT_ID]: { storySummary: store } } });
    __setReplayContext({ chatId, chat, name1: '用户', name2: '小红', saveMetadata: async () => {} });
    applySummaryPanelConfigSnapshot({
        prompts: { memoryTemplate: '{$剧情记忆}' },
        vector: { enabled: true, eventRerankEnabled: false,
            embeddingApi: { provider: 'custom', url: 'https://diagnostics.invalid', key: 'test', model: 'test' },
            rerankApi: { provider: 'custom', url: 'https://diagnostics.invalid', key: 'test', model: 'test' },
        },
    });
    const originalFetch = globalThis.fetch;
    const originalStreaming = globalThis.window.xiaobaixStreamingGeneration;
    const passed = [];
    try {
        let requests = 0;
        globalThis.fetch = async () => { requests++; throw new Error('unexpected request'); };
        const empty = await buildVectorPromptText();
        assert.equal(empty.text, '');
        assert.equal(empty.notice, null);
        assert.match(formatRecallDiagnostics(empty.diagnostics, { status: 'empty' }), /没有可用的查询内容/);
        assert.equal(requests, 0);
        passed.push('empty query preserves its reason without a false missing-vector warning');

        chat[1].mes = '小红回家了吗？';
        globalThis.fetch = async () => { requests++; return new Response('', { status: 429 }); };
        const failed = createRecallDiagnostics(chatId);
        await assert.rejects(buildVectorPromptText(false, { diagnostics: failed }), error => {
            const report = formatRecallDiagnostics(failed, { status: 'failed', error });
            assert.match(report, /round1-embed: http \| HTTP 429 \| attempt=2/);
            assert.match(report, /Caused by: Error: Embedding HTTP 429/);
            assert.ok(failed.metrics.timing.round1Embed >= failed.metrics.timing.round1EmbedRetryWait);
            return true;
        });
        assert.equal(requests, 2);
        passed.push('embedding retry retains HTTP status and cause');

        const config = getVectorConfig();
        assert.equal(Object.hasOwn(config, 'eventRerankEnabled'), false);
        const fingerprint = getEngineFingerprint(config);
        await metaTable.put({ chatId, fingerprint, lastChunkFloor: 0 });
        await eventVectorsTable.put({ chatId, eventId: event.id, vector: new Float32Array([1, 0]).buffer, dims: 2, fingerprint });
        globalThis.fetch = async (url, options) => {
            if (String(url).endsWith('/embeddings')) {
                return Response.json({ data: JSON.parse(options.body).input.map((_, index) => ({ index, embedding: [1, 0] })) });
            }
            assert.ok(String(url).endsWith('/rerank'));
            return new Response('', { status: 429 });
        };
        const degraded = await buildVectorPromptText();
        assert.ok(degraded.text.includes('小红回到家里'), formatRecallDiagnostics(degraded.diagnostics, { status: 'success' }));
        const report = formatRecallDiagnostics(degraded.diagnostics, { status: 'success' });
        assert.match(report, /status: degraded/);
        assert.match(report, /event-rerank: http \| HTTP 429/);
        passed.push('rerank failure preserves usable events and reports the degraded stage');

        const rawText = '她当时带着蓝色信封回家，约好第二天解释缘由。';
        await chunksTable.put({ chatId, chunkId: 'raw-0', floor: 0, chunkIdx: 0, speaker: '小红', text: rawText });
        await chunkVectorsTable.put({ chatId, chunkId: 'raw-0', vector: new Float32Array([1, 0]).buffer, dims: 2, fingerprint });
        invalidateLexicalIndex();
        const rerankDocuments = [];
        globalThis.fetch = async (url, options) => {
            const body = JSON.parse(options.body);
            if (String(url).endsWith('/embeddings')) {
                return Response.json({ data: body.input.map((_, index) => ({ index, embedding: [1, 0] })) });
            }
            assert.ok(String(url).endsWith('/rerank'));
            rerankDocuments.push(body.documents);
            return Response.json({ results: body.documents.map((_, index) => ({ index, relevance_score: 0.9 })) });
        };
        const selected = await buildVectorPromptText();
        assert.ok(selected.text.includes(rawText), formatRecallDiagnostics(selected.diagnostics, { status: 'success' }));
        assert.equal(selected.diagnostics.metrics.evidence.directEvidenceStatus, 'applied');
        assert.equal(rerankDocuments.length, 1, 'only event rerank is needed when no L0 floors exist');
        assert.ok(rerankDocuments[0][0].includes('小红回到家里'));
        assert.ok(!rerankDocuments.flat().some(text => text.includes(rawText)), 'raw evidence must not be sent for rerank');
        assert.ok(getRecallRuntimeStats().every(stats => !stats.chunkVectors && !stats.eventVectors));
        passed.push('saved false cannot disable L2 rerank; L1 reaches the prompt with no extra API call or retained runtime');

        // Advance a controlled wall clock through public data reads during assembly.
        const originalPerformance = globalThis.performance;
        let clock = 100;
        const metrics = createMetrics();
        metrics.timing.total = 100;
        const timedEvent = { ...event, get summary() { clock += 5; return event.summary; } };
        try {
            globalThis.performance = { now: () => clock };
            const built = await buildVectorPromptForReplay(store, {
                events: [{ event: timedEvent, _recallType: 'DIRECT', _evidenceEligible: true }],
                l0Selected: [], l1ByFloor: new Map(), directEvidenceStatus: 'applied',
            }, new Map(), ['小红'], { lastChunkFloor: 0 }, metrics);
            assert.ok(built.promptText.includes(event.title));
            assert.ok(clock > 100);
            assert.equal(metrics.timing.total, clock);
            assert.equal(metrics.timing.localKnownTotal, clock - 100);
        } finally {
            globalThis.performance = originalPerformance;
        }
        passed.push('final prompt timings include assembly exactly once');

        const configForRun = { api: { provider: 'st' }, trigger: { useStream: false, delayFloors: 0 } };
        const run = async (onComplete) => {
            __setChatMetadata({});
            const messages = [];
            globalThis.window.xiaobaixStreamingGeneration = { async xbgenrawCommand() { return '{"events":[]}'; } };
            const result = await runSummaryGeneration(1, configForRun, {
                onStatus: text => messages.push(text), onError: text => messages.push(text), onComplete,
            });
            assert.equal(result.committed, true);
            assert.equal(getSummaryStore().lastSummarizedMesId, 1);
            return { result, messages };
        };
        const saved = await run();
        assert.match(saved.messages.at(-1), /总结完成，已保存至 2 楼/);
        const followupFailed = await run(() => { throw new Error('index failed', { cause: new Error('storage unavailable') }); });
        assert.equal(followupFailed.result.success, true);
        assert.match(followupFailed.messages.at(-1), /总结已保存，但后续处理失败/);
        assert.match(followupFailed.messages.at(-1), /Caused by: storage unavailable/);
        passed.push('saved summary is not mislabeled failed when follow-up fails');
        return { passed };
    } finally {
        globalThis.fetch = originalFetch;
        globalThis.window.xiaobaixStreamingGeneration = originalStreaming;
        invalidateLexicalIndex();
        await shutdownRecallRuntime();
    }
}
