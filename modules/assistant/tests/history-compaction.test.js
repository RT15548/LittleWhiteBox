import assert from 'node:assert/strict';
import test from 'node:test';
import { createHistoryCompactionController } from '../app-src/runtime/history-compaction.js';
import { currentHistorySummary } from '../app-src/state/compaction-history.js';
import { selectCompactionRange } from '../app-src/runtime/compaction-range.js';
import { buildProviderMessagesFromHistory } from '../../agent-core/runtime/protocol.js';
import { estimateConversationTokens } from '../../agent-core/runtime/context-tokens.js';
import { readResponseCompletion } from '../../agent-core/runtime/response-completion.js';
import { settleAssistantRunFailure } from '../app-src/runtime/run-failure.js';
import { summaryResult, summarySource } from './helpers/summary.js';

// Contracts: preserve the user's instruction and complete newest groups within budget
// (lost work / invalid provider requests); use one visible operation even for chunked summaries.
const message = (role, content) => ({ role, content });
const batch = id => [{ role: 'assistant', toolCalls: [{ id, name: 'Write', arguments: '{}' }] }, { role: 'tool', toolCallId: id, content: 'ok' }];
test('keep the three fitting batches and never round up to take a large fourth batch', () => {
    const user = message('user', '开始写我的卡');
    const older = message('user', 'Previous');
    const big = batch('large');
    const recent = ['a', 'b', 'c'].flatMap(batch);
    const messages = [older, user, ...big, ...recent];
    for (const cost of [100, 800]) {
        const { archived, retained } = selectCompactionRange(messages, [1, 900, cost - 1, 1, 20, 10, 20, 10, 30, 10], 1000);
        assert.deepEqual(archived, [older, ...big]);
        assert.deepEqual(retained, [user, ...recent]);
    }
    const latest = selectCompactionRange([older, user, ...big], [1, 900, 1, 799], 1000);
    assert.deepEqual(latest.retained, [user]);
    assert.deepEqual(latest.archived, [older, ...big]);
});

function harness(respond) {
    const state = { messages: [message('user', 'historical '.repeat(2000)), ...batch('old-call'), message('assistant', 'previous task finished'),
        message('user', '开始写我的卡'), ...batch('latest')],
        compactions: [{ summary: 'original memory' }], contextStats: {} };
    const requests = [], stages = [];
    let saves = 0;
    const providerConfig = { provider: 'openai-compatible', maxTokens: 200 };
    const controller = createHistoryCompactionController({
        state, render() { stages.push(state.compactionPending); }, persistSession() { saves++; },
        getActiveProviderConfig: () => providerConfig, formatToolResultDisplay: () => ({}),
        buildTextWithAttachmentSummary: text => text,
        compactionThreshold: () => 3000, requestInputLimit: () => 4000,
        toProviderMessages: (messages, { historySummary = currentHistorySummary(state) } = {}) => [message('system', historySummary), ...buildProviderMessagesFromHistory(messages)],
        updateContextStats(messages) { state.contextStats = { usedTokens: estimateConversationTokens({ messages, providerConfig }) }; },
    });
    const adapter = { chat: async request => { requests.push(request); return respond(request, requests.length); } };
    return { state, requests, stages, run: signal => controller.ensureContextBudget(adapter, signal), saves: () => saves };
}

for (const reason of ['stop', 'tool_calls', undefined]) {
    test(`one checkpoint for all chunks after ${reason || 'missing completion'}; next call continues with original user and tool pair`, async () => {
        const h = harness((_, n) => ({ ...readResponseCompletion('openai', reason), ...summaryResult('merged memory ' + n) }));
        const messages = await h.run(new AbortController().signal);
        const record = h.state.compactions.at(-1);
        assert.ok(record.after < record.before);
        assert.equal(record.summary, 'merged memory ' + h.requests.length);
        assert.deepEqual(h.stages, [true, false]);
        assert.equal(h.saves(), 1);
        assert.ok(h.requests.length > 1);
        assert.ok(summarySource(h.requests[0]).includes('original memory'));
        assert.ok(h.requests.some(request => summarySource(request).includes('previous task finished')));
        for (let i = 1; i < h.requests.length; i++) assert.ok(summarySource(h.requests[i]).includes('merged memory ' + i));
        assert.deepEqual(messages.map(m => m.role), ['system', 'user', 'assistant', 'tool']);
        assert.equal(messages[1].content, '开始写我的卡');
        assert.equal(messages[3].tool_call_id, 'latest');
        const count = h.requests.length;
        await h.run(new AbortController().signal);
        assert.equal(h.requests.length, count);
    });
}

test('failure settlement retains completed tool evidence and persists silent interruption', () => {
    const group = [{ role: 'assistant', content: 'reading', toolCalls: [{ id: 'a', name: 'Read', arguments: '{}' }] },
        { role: 'tool', toolCallId: 'a', content: 'observed' }];
    const messages = [{ role: 'user', content: 'earlier' }, { role: 'assistant', content: 'answered' },
        { role: 'user', content: 'current' }, ...structuredClone(group),
        { role: 'assistant', content: 'partial', streaming: true }];
    let saved;
    settleAssistantRunFailure({ messages, notice: '', pushMessage() { assert.fail('No notice requested'); },
        persistSession() { saved = structuredClone(messages); } });
    assert.deepEqual(saved.slice(3, 5), group);
    assert.equal(saved[1].error, undefined);
    assert.equal(saved.at(-1).error, true);
    assert.equal(saved.at(-1).streaming, false);
});
