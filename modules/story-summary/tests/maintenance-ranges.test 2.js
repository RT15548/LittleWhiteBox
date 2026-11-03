import assert from 'node:assert/strict';
import test from 'node:test';
import { maintenanceRanges, memoryOwnership, invalidateChangedMaintenance } from '../maintenance/ranges.js';
import { buildSummaryUndo } from '../data/summary-undo.js';
import { createSummaryBaseline, createSummaryBatch, upgradeSummaryHistory } from '../data/summary-history.js';
import { memoryPolicy } from '../data/memory-policy.js';
import { memoryRecords } from '../maintenance/domain.js';
import { maintenanceFixture } from './fixtures/memory-maintenance.js';
import { createMemoryContext } from '../maintenance/context.js';
import { REVIEW_LIMITS } from '../maintenance/limits.js';
import { estimateConversationTokens } from '../../agent-core/runtime/context-tokens.js';

const completion = (from, to) => ({ version: 2, id: 'c', runId: 'r', cutoff: to, policy: memoryPolicy(),
    operations: [], completion: { from, to }, coverage: { supplied: [], missingAnchors: [] } });

test('updated facts use the latest exact inverse; snapshot collections keep unchanged records in their original range', () => {
    const fixture = maintenanceFixture(), old = structuredClone(fixture.json), json = structuredClone(old);
    json.facts[0].o = '更新';
    old.keywords = [{ text: '旧词', weight: '重要', _addedAt: 19 }];
    json.keywords = [...old.keywords, { text: '新词', weight: '核心', _addedAt: 23 }];
    const history = [createSummaryBaseline(19), createSummaryBatch(19, 23, buildSummaryUndo(old, json), memoryPolicy())];
    const owner = memoryOwnership(history, 23), records = memoryRecords({ json, atoms: fixture.atoms });
    const range = key => owner(records.find(record => record.key === key)).range;
    assert.deepEqual(range('f-1'), { from: 21, to: 24 });
    assert.deepEqual(range('f-2'), { from: 1, to: 20 });
    assert.deepEqual(range('旧词'), { from: 1, to: 20 });
    assert.deepEqual(range('新词'), { from: 21, to: 24 });
    assert.deepEqual(range('atom-1-0'), { from: 2, to: 2 });
    history.push(createSummaryBatch(23, 999, buildSummaryUndo(json, json)));
    assert.deepEqual(memoryOwnership(history, 999)(records.find(record => record.key === 'f-2')).range, { from: 1, to: 20 });
});

test('new generation does not invalidate old completed responsibility; rollback removes only the new responsibility', () => {
    const fixture = maintenanceFixture(), baseline = createSummaryBaseline(23);
    baseline.maintenance.push(completion(1, 24));
    const previous = { storySummary: { json: fixture.json, lastSummarizedMesId: 23, summaryHistory: [baseline] }, stateAtoms: [], l0Index: {} };
    const next = structuredClone(previous); next.storySummary.json.facts[0].o = '后来发生变化';
    next.storySummary.summaryHistory.push(createSummaryBatch(23, 25, buildSummaryUndo(fixture.json, next.storySummary.json)));
    next.storySummary.lastSummarizedMesId = 25;
    invalidateChangedMaintenance(previous, next);
    assert.deepEqual(maintenanceRanges(next.storySummary.summaryHistory, 25), {
        from: 1, cutoff: 26, completed: [{ from: 1, to: 24 }], pending: [{ from: 25, to: 26 }],
    });
    next.storySummary.summaryHistory[1].maintenance.push(completion(25, 26));
    assert.deepEqual(maintenanceRanges(next.storySummary.summaryHistory, 25).pending, []);
    next.storySummary.summaryHistory.pop();
    assert.deepEqual(maintenanceRanges(next.storySummary.summaryHistory, 23).completed, [{ from: 1, to: 24 }]);
});

test('old normal completion remains an outcome, never a range declaration during load', () => {
    const baseline = createSummaryBaseline(23), receipt = completion(1, 24);
    delete receipt.completion; receipt.outcome = { status: 'completed' }; baseline.maintenance.push(receipt);
    const { value } = upgradeSummaryHistory([baseline]);
    assert.deepEqual(maintenanceRanges(value, 23).completed, []);
});

test('oversized working history is summarized in bounded fragments, without mutating the original conversation', async () => {
    const config = { maxTokens: 1000 }, limits = { ...REVIEW_LIMITS, inputTokens: 19800, compactTokens: 17800 };
    const task = { from: 1, cutoff: 5000, completed: [{ from: 1, to: 1000 }], pending: [{ from: 1001, to: 5000 }] };
    const messages = [{ role: 'user', content: JSON.stringify({ task, memory: [] }) },
        { role: 'assistant', content: '需要保持的调查'.repeat(20000), tool_calls: [] },
        { role: 'assistant', content: '近一轮', tool_calls: [] }, { role: 'assistant', content: '近二轮', tool_calls: [] }];
    const original = structuredClone(messages), fragments = [];
    const context = createMemoryContext({ config, limits,
        countTokens: async args => ({ tokens: estimateConversationTokens(args), source: 'estimated' }),
        summarize: async (request, measured) => {
            assert.ok(measured.tokens <= limits.inputTokens); assert.equal(request.maxTokens, 1000);
            fragments.push(JSON.parse(request.messages[0].content).workFragment);
            return { text: '继续调查；未解决事项仍待查证。' };
        },
    });
    const result = await context.compact(messages, task, 100);
    assert.ok(fragments.length > 2);
    assert.equal(fragments[0].from, 0);
    for (let i = 1; i < fragments.length; i++) assert.equal(fragments[i].from, fragments[i - 1].to);
    assert.equal(fragments.at(-1).to, fragments[0].total);
    assert.deepEqual(JSON.parse(result.messages[0].content).task, task);
    assert.deepEqual(result.messages.slice(-2), messages.slice(-2));
    assert.deepEqual(messages, original);
});
