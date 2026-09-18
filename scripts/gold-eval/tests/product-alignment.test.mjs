import test from 'node:test';
import assert from 'node:assert/strict';
import { parseReplaySample } from '../../story-summary-replay/sample.mjs';
import { buildReplayPanelOverrides } from '../../story-summary-replay/config.mjs';
import { getAutoSummaryPlan } from '../../../modules/story-summary/generate/summary-trigger.js';
import { registerSummarySourceBoundary } from '../../../modules/story-summary/generate/source-boundary.js';
import { createStrictTransportCassette } from '../lib/transport-cassette.mjs';
import { assertProductAlignedCapture, PRODUCT_RECALL_CONTRACT } from '../lib/product-recall-turn.mjs';
import { executeNaturalBoundaryCase } from '../lib/natural-boundary-execution.mjs';

test('explicit replay API overrides preserve the selected product panel settings', () => {
    const panel = buildReplayPanelOverrides({
        mode: 'natural-capture',
        panelConfig: { trigger: { timing: 'after_ai', delayFloors: 4 },
            vector: { enabled: true, l0Concurrency: 3,
                embeddingApi: { provider: 'custom', url: 'https://alignment.invalid/v1', model: 'old' } } },
        vectorConfig: { embeddingApi: { model: 'new' } },
    });
    assert.deepEqual(panel.trigger, { enabled: true, timing: 'after_ai', delayFloors: 4 });
    assert.equal(panel.vector.enabled, true);
    assert.equal(panel.vector.l0Concurrency, 3);
    assert.deepEqual(panel.vector.embeddingApi, { provider: 'custom', url: 'https://alignment.invalid/v1', model: 'new' });
});

test('native imports preserve empty floors, text bytes, system flags and swipe metadata', () => {
    const rows = [
        { is_user: true, mes: '', is_system: true, extra: { marker: 1 } },
        { is_user: false, mes: '原文\r\n不能改', swipe_id: 1, swipes: ['旧', '原文\r\n不能改'],
            swipe_info: [{}, { send_date: 'frozen' }], send_date: 'frozen' },
        { is_user: true, mes: '真实问题' },
    ];
    const raw = [{ user_name: '主人', character_name: '角色', chat_metadata: {} }, ...rows]
        .map(row => JSON.stringify(row)).join('\n');
    const result = parseReplaySample(raw);
    assert.deepEqual(result.messages, rows);
    assert.equal(result.messages[2].mes, '真实问题');
    assert.equal(result.names.name1, '主人');
    assert.deepEqual(parseReplaySample(raw, { maxFloors: 2 }).messages, rows.slice(0, 2));
});

test('automatic summaries use the stable delayed boundary and configured timing', () => {
    const chat = Array.from({ length: 22 }, () => ({ mes: '历史' }));
    const trigger = { enabled: true, timing: 'before_user', interval: 20, delayFloors: 2 };
    assert.equal(getAutoSummaryPlan(chat.slice(0, 20), -1, trigger, 'before_user').triggered, false);
    assert.deepEqual(getAutoSummaryPlan(chat, -1, trigger, 'before_user'),
        { target: 19, pending: 20, interval: 20, triggered: true });
    assert.equal(getAutoSummaryPlan(chat, -1, trigger, 'after_ai').triggered, false);
    assert.equal(getAutoSummaryPlan(chat, -1, { ...trigger, enabled: false }, 'before_user').triggered, false);
    const unregister = registerSummarySourceBoundary(() => 18);
    try { assert.equal(getAutoSummaryPlan(chat, -1, trigger, 'before_user').triggered, false); }
    finally { unregister(); }
});

test('a recorded zero-request product result replays with a network-denying empty cassette', () => {
    const cassette = createStrictTransportCassette([]);
    assert.equal(cassette.sourceRequestCount, 0);
    cassette.assertFullyConsumed();
    assert.throws(() => cassette.consume({ host: 'unexpected', path: '/embeddings', requestHash: 'x' }), /Cassette miss/);
    assert.throws(() => createStrictTransportCassette(undefined), /没有 production transport/);
});

test('historical captures cannot claim the current product computation contract', () => {
    assert.throws(() => assertProductAlignedCapture({ manifest: { mode: 'story-summary-replay-natural-capture' } }), /historical replay contract/);
    assert.doesNotThrow(() => assertProductAlignedCapture({ manifest: { execution: { contract: PRODUCT_RECALL_CONTRACT } } }));
});

test('a legitimate zero-request empty injection is a measured miss, not an invalid natural run', async () => {
    const history = [{ is_user: false, mes: '历史事实' }];
    const focus = { is_user: true, mes: '问题' };
    const result = await executeNaturalBoundaryCase({
        modules: {
            getContext: () => ({ chatId: 'fixture', chat: history }),
            getSummaryStore: () => ({ json: { events: [], facts: [] } }),
            getAllChunks: async () => [], getStateAtoms: () => [],
        },
        goldCase: { id: 'empty-case', category: 'fact', atFloor: 1, historyThroughFloor: 0,
            query: { text: '问题' }, expectedAnswer: { type: 'evidence-only' }, evidence: { requiredAll: [0] } },
        visibleMessages: history, focusMessage: focus, snapshotRef: {},
        executeRecallCase: async () => ({
            normalizedRecall: {}, promptText: '', promptInput: { skipped: true },
            evidenceTrace: { final: [], prompt: [] }, transportTrace: [],
            externalCalls: 0, externalRequests: 0, recallMs: 0, reportCase: {},
        }),
    });
    assert.equal(result.scored.stageTraceRow.stages.prompt, 'miss');
    assert.equal(result.productionExternalCalls, 0);
    assert.equal(history.length, 1);
});
