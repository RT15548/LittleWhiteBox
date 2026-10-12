import assert from 'node:assert/strict';

import { EXT_ID } from '../../core/constants.js';
import { getRecallRuntimeStats, shutdownRecallRuntime } from '../../modules/story-summary/vector/runtime/runtime.js';
import { getAutoSummaryPlan } from '../../modules/story-summary/generate/summary-trigger.js';
import { withProductRecallTurn } from '../gold-eval/lib/product-recall-turn.mjs';
import { assertGoldExternalStagesHealthy } from '../gold-eval/replay-session.mjs';
import { executeRecallCase } from './recall-execution.mjs';
import { applyReplayConfig } from './config.mjs';
import { parseReplaySample } from './sample.mjs';
import { maintainNaturalHistoryAfterAi } from './natural-runtime.mjs';
import { __setReplayContext } from './shims/extensions.js';
import { __setChatMetadata } from './shims/script.js';

// Deterministic provider responses exercise real retrieval and packing, not
// semantic quality. No local credentials, private chats or network are used.
export async function runAlignmentCheck({ modules, extSettings, summarize }) {
    const originalFetch = globalThis.fetch;
    const requests = [];
    let failRerank = false;
    let abortOnEmbed = null;
    let failStateVector = false;
    const maintenanceScene = '角色在房间里把银色钥匙交给用户，指着桌上的蓝色盒子解释钥匙的用途，要求用户将盒子收好，用户接过钥匙并答应保管，角色确认盒子已经锁上。';
    globalThis.fetch = async (url, init) => {
        assert.equal(new URL(String(url)).host, 'alignment.invalid');
        const body = JSON.parse(init.body);
        requests.push({ path: new URL(String(url)).pathname, body });
        if (String(url).endsWith('/embeddings')) {
            if (failStateVector && body.input.length === 2) return Response.json({ error: 'fixture state-vector failure' }, { status: 400 });
            if (abortOnEmbed) {
                abortOnEmbed.abort();
                throw new DOMException('aborted', 'AbortError');
            }
            return Response.json({ data: body.input.map((_, index) => ({ index, embedding: [1, 0] })) });
        }
        if (String(url).endsWith('/chat/completions')) return Response.json({ choices: [{ message: { content: JSON.stringify({
            anchors: [{ scene: maintenanceScene, edges: [{ s: '角色', t: '用户', r: '交付银色钥匙' }], where: '房间' }],
        }) } }] });
        assert.ok(String(url).endsWith('/rerank'), 'unexpected provider endpoint');
        if (failRerank) return Response.json({ error: 'fixture failure' }, { status: 500 });
        return Response.json({ results: body.documents.map((_, index) => ({ index, relevance_score: 0.9 })) });
    };
    const chatId = 'story-summary-alignment';
    const api = { provider: 'custom', url: 'https://alignment.invalid/v1', key: 'local-fixture', model: 'fixture-model' };
    const config = {
        mode: 'natural-capture', summaryApi: api,
        wrapperHead: 'BEGIN_MEMORY', wrapperTail: 'END_MEMORY',
        vectorConfig: { enabled: true, l0Concurrency: 99, l0Api: api, embeddingApi: api, rerankApi: api },
    };
    const evidenceChunks = [5, 12].flatMap((count, floor) => Array.from({ length: count }, (_, chunkIdx) => ({
        chunkId: `c-${floor}-${chunkIdx}`, floor, chunkIdx, speaker: floor === 0 ? '用户' : '角色',
        isUser: floor === 0, textHash: `fixture-${floor}-${chunkIdx}`,
        text: floor === 1 && chunkIdx === 2 ? '角色把钥匙藏在蓝色盒子里。' : `历史证据[${floor}:${chunkIdx}]。`,
    })));
    const anchorScores = new Map([['c-1-2', 0.8], ['c-1-6', 0.7], ['c-1-10', 0.6]]);
    const native = Array.from({ length: 8 }, (_, floor) => ({
        is_user: floor % 2 === 0, name: floor % 2 === 0 ? '用户' : '角色',
        mes: floor < 2 ? evidenceChunks.filter(chunk => chunk.floor === floor).map(chunk => chunk.text).join('')
            : `角色和用户在房间里交谈 ${floor}。`,
        extra: { type: 'fixture' }, is_system: false,
    }));
    // An exact keyword hit would bypass evidence reranking via must-keep floors.
    const focus = { is_user: true, name: '用户', mes: '先前那件东西放哪儿了？', extra: {} };
    const sample = parseReplaySample(native.concat(focus).map(row => JSON.stringify(row)).join('\n'));
    const history = sample.messages.slice(0, -1);
    const store = {
        lastSummarizedMesId: 5, summaryHistory: [],
        json: {
            keywords: [], events: [{ id: 'evt-1', title: '藏好钥匙', summary: '角色把钥匙藏在蓝色盒子里 (#1-2)',
                participants: ['角色'], memoryRole: '具体经历', causedBy: [], _addedAt: 1 }],
            characters: { main: [{ name: '角色' }] }, arcs: [], facts: [], characterAliases: [],
        },
    };
    __setReplayContext({ chatId, chat: history, name1: '用户', name2: '角色', saveMetadata: async () => {} });
    __setChatMetadata({ extensions: { [EXT_ID]: {
        storySummary: store,
        stateAtoms: [{ atomId: 'atom-1', id: 'atom-1', floor: 1, semantic: '角色把钥匙藏在蓝色盒子里。',
            entities: ['角色'], anchors: ['钥匙', '蓝色盒子'] }],
    } } });
    const applied = applyReplayConfig(config, modules);
    assert.deepEqual(applied.panel, modules.getSummaryPanelConfig());
    assert.deepEqual(applied.config.vectorConfig, modules.getVectorConfig());
    assert.equal(applied.config.effectivePanel.gen.temperature, applied.panel.gen.temperature);
    assert.equal(JSON.stringify(applied.config.effectivePanel).includes('local-fixture'), false);
    assert.equal(applied.panel.vector.l0Concurrency, 50);
    assert.equal(applied.panel.trigger.delayFloors, 2);
    const fingerprint = modules.getEngineFingerprint(applied.panel.vector);
    try {
        await modules.getMeta(chatId);
        await modules.updateMeta(chatId, { fingerprint, lastChunkFloor: 7 });
        await modules.saveChunks(chatId, evidenceChunks);
        await modules.saveChunkVectors(chatId, evidenceChunks.map(({ chunkId, floor, chunkIdx }) => {
            const score = floor === 0 ? 0.9 + chunkIdx / 100 : (anchorScores.get(chunkId) ?? 0.1);
            return { chunkId, vector: [score, Math.sqrt(1 - score * score)] };
        }), fingerprint);
        await modules.saveEventVectors(chatId, [{ eventId: 'evt-1', vector: [1, 0] }], fingerprint);
        await modules.saveStateVectors(chatId, [{ atomId: 'atom-1', floor: 1, vector: [1, 0], rVector: [1, 0] }], fingerprint);
        modules.invalidateLexicalIndex();
        await modules.getLexicalIndex();
        const invoke = execute => withProductRecallTurn({ modules, historyMessages: history,
            focusMessage: sample.messages.at(-1), execute });
        const assertReleased = () => {
            assert.deepEqual(modules.getContext().chat, history);
            for (const stats of getRecallRuntimeStats()) {
                assert.ok(!stats.chunkVectors && !stats.eventVectors && !stats.stateVectors,
                    `runtime still owns vectors: ${JSON.stringify(stats)}`);
            }
        };
        const product = await invoke(() => modules.buildVectorPromptText());
        const productRequests = requests.splice(0);
        assertReleased();
        const replay = await invoke(() => executeRecallCase(modules, { label: 'alignment' }));
        assertReleased();
        assert.equal(replay.promptText, product.text);
        assert.deepEqual(requests.splice(0), productRequests);
        assert.ok(replay.promptText.includes('蓝色盒子'), JSON.stringify(replay.reportCase.diagnostics));
        assert.equal(replay.reportCase.metrics.event.rerank.status, 'applied');
        assert.equal(replay.reportCase.metrics.evidence.directEvidenceStatus, 'applied');
        assert.ok(replay.normalizedRecall.directEvidenceL1.length > 0);
        assert.ok(replay.evidenceTrace.eventEvidence.some(row => row.kind === 'l1' && row.admitted));
        assert.ok(replay.evidenceTrace.eventEvidence.every(row => typeof row.admitted === 'boolean'));
        assert.ok(productRequests.some(row => row.path.endsWith('/rerank')));
        // Inspect the actual provider payload: USER is complete, AI alone gets
        // three anchors and neighbours, and both sides form one ordered document.
        const evidenceDocs = productRequests.filter(row => row.path.endsWith('/rerank'))
            .flatMap(row => row.body.documents)
            .filter(text => evidenceChunks.some(chunk => text.includes(chunk.text)));
        assert.equal(evidenceDocs.length, 1);
        const selectedChunks = evidenceChunks.filter(chunk => evidenceDocs[0].includes(chunk.text))
            .sort((left, right) => evidenceDocs[0].indexOf(left.text) - evidenceDocs[0].indexOf(right.text));
        assert.deepEqual(selectedChunks.map(chunk => chunk.chunkId), [
            'c-0-0', 'c-0-1', 'c-0-2', 'c-0-3', 'c-0-4',
            'c-1-1', 'c-1-2', 'c-1-3', 'c-1-5', 'c-1-6', 'c-1-7', 'c-1-9', 'c-1-10', 'c-1-11',
        ]);
        const expectedRequestCount = productRequests.length;

        // Empty product results must stay empty, including wrapper handling.
        extSettings[EXT_ID].storySummary.enabled = false;
        const disabled = await invoke(() => executeRecallCase(modules, { label: 'disabled' }));
        assert.equal(disabled.promptText, '');
        assert.equal(disabled.promptInput.skipped, true);
        assert.equal(disabled.externalCalls, 0);
        assertReleased();
        extSettings[EXT_ID].storySummary.enabled = true;

        // A provider fallback is observable and cannot become a quality pass.
        failRerank = true;
        const failed = await invoke(() => executeRecallCase(modules, { label: 'failed-rerank' }));
        assert.throws(() => assertGoldExternalStagesHealthy(failed), /关键外部阶段失败/);
        assertReleased();
        failRerank = false;
        requests.splice(0);

        abortOnEmbed = new AbortController();
        const aborted = await invoke(() => executeRecallCase(modules, { label: 'aborted', signal: abortOnEmbed.signal }));
        assert.equal(aborted.promptText, '');
        assert.match(aborted.reportCase.diagnostics.reason, /取消/);
        assertReleased();
        abortOnEmbed = null;

        __setChatMetadata({ extensions: { [EXT_ID]: {
            storySummary: { ...store, json: { ...store.json, events: [] } }, stateAtoms: [],
        } } });
        modules.invalidateLexicalIndex();
        await modules.getLexicalIndex();
        const noHit = await invoke(() => executeRecallCase(modules, { label: 'no-hit' }));
        assert.equal(noHit.promptText, '');
        assert.equal(noHit.promptInput.skipped, true);
        assert.equal(noHit.normalizedRecall.events.length, 0);
        assertReleased();

        // Check the replay scheduler at the boundary that formerly fired early.
        const triggerChat = Array.from({ length: 22 }, () => ({ is_user: false, mes: '已完成的历史' }));
        const summaries = [];
        const summaryModules = { ...modules,
            getSummaryStore: () => ({ lastSummarizedMesId: -1, json: { events: [] } }),
            runSummaryGeneration: async target => {
                summaries.push(target);
                return { success: true, endMesId: target, newEventIds: [] };
            },
        };
        for (const length of [20, 21, 22]) {
            const visibleMessages = triggerChat.slice(0, length);
            const expected = getAutoSummaryPlan(visibleMessages, -1, applied.panel.trigger, 'before_user');
            const result = await summarize({ modules: summaryModules, chatId, panelConfig: applied.panel,
                floor: length, historyThroughFloor: length - 1, visibleMessages, nextCaseId: 'trigger' });
            assert.equal(result.result.triggered, expected.triggered);
            assert.equal(result.result.target, expected.target);
        }
        assert.deepEqual(summaries, [19]);
        const detail = '返回的JSON不是有效总结：events[0].summary：来源楼层越界';
        await assert.rejects(() => summarize({
            modules: { ...summaryModules, runSummaryGeneration: async () => ({ success: false, error: 'structure', message: detail }) },
            chatId, panelConfig: applied.panel, floor: 22, historyThroughFloor: 21,
            visibleMessages: triggerChat, nextCaseId: 'summary-error',
        }), error => error.message.includes(detail));

        // Start from empty real stores: a vector failure must retain successful
        // extraction. Repair dispatches only missing vectors, never the LLM again.
        const maintenanceChatId = `${chatId}-maintenance`;
        const maintenanceHistory = [{ is_user: false, name: '角色', mes: maintenanceScene }];
        __setReplayContext({ chatId: maintenanceChatId, chat: maintenanceHistory });
        __setChatMetadata({});
        requests.splice(0);
        failStateVector = true;
        const maintain = () => maintainNaturalHistoryAfterAi({ modules, chatId: maintenanceChatId,
            panelConfig: applied.panel, floor: 0, visibleMessages: maintenanceHistory, nextCaseId: 'maintenance',
            // This fixture has no L2 events; its event stage performs no requests.
            repairEvents: async () => ({ success: true, repaired: 0 }) });
        await assert.rejects(maintain, /maintenance incomplete/);
        assert.equal(modules.getL0FloorStatus(0).status, 'ok');
        assert.ok(modules.getStateAtoms().length > 0);
        assert.equal((await modules.getAllStateVectors(maintenanceChatId)).length, 0);
        assert.equal(requests.filter(row => row.path.endsWith('/chat/completions')).length, 1);
        requests.splice(0);
        failStateVector = false;
        await maintain();
        assert.equal((await modules.getAllStateVectors(maintenanceChatId)).length, modules.getStateAtoms().length);
        assert.equal(requests.length, 1);
        assert.ok(requests[0].path.endsWith('/embeddings'));
        requests.splice(0);
        await maintain();
        assert.equal(requests.length, 0, 'completed maintenance must not spend another request');
        return { networkCalls: 0, provider: 'local-stub', promptParity: true, requestParity: true,
            requestsPerRecall: expectedRequestCount, l1LocalSelection: true, l2Rerank: true,
            emptyResult: true, noHit: true, failureObserved: true, cancellation: true, sessionRelease: true,
            summaryTrigger: true, effectiveConfig: true, incrementalStateVectors: true,
            repairPreservesSuccessfulExtraction: true, qualityMeasured: false };
    } finally {
        globalThis.fetch = originalFetch;
        await shutdownRecallRuntime();
    }
}
