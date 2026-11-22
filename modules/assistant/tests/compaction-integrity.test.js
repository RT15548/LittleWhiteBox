import assert from 'node:assert/strict';
import test from 'node:test';
import { createHistoryCompactionController } from '../app-src/runtime/history-compaction.js';
import { buildProviderMessagesFromHistory } from '../../agent-core/runtime/protocol.js';
import { estimateConversationTokens } from '../../agent-core/runtime/context-tokens.js';
import { currentHistorySummary } from '../app-src/state/compaction-history.js';
import { summaryResult, summarySource } from './helpers/summary.js';

// Acceptance contracts:
// - Repeated compaction keeps parallel calls and their replies together (broken provider protocol).
// - Empty/failed/cancelled summary chunks keep the unarchived history and memory (lost work).
// - Oversized final requests never reach the provider; complete tool results remain available (paid failures / lost evidence).
const cycle = (id, size = 6000) => {
    const calls = [0, 1].map(n => ({ id: `${id}-${n}`, name: 'Read', arguments: JSON.stringify({ filePath: `local/${id}-${n}.md` }) }));
    return [{ role: 'assistant', content: '', toolCalls: calls,
        providerPayload: { anthropicContent: [{ type: 'thinking', thinking: 'plan', signature: 'signature' },
            ...calls.map(call => ({ type: 'tool_use', id: call.id, name: call.name, input: JSON.parse(call.arguments) }))] } },
    ...calls.map(call => ({ role: 'tool', toolCallId: call.id, toolName: call.name, content: `${id}:` + 'x'.repeat(size / 2) }))];
};

function harness({ messages, summary = '', threshold = 2500, inputLimit = 5000, respond = () => summaryResult('memory'), saveResult } = {}) {
    const state = { messages: [{ role: 'user', content: 'Continue the card.' }, ...(messages || Array.from({ length: 5 }, (_, i) => cycle(`c${i}`)).flat())],
        compactions: summary ? [{ summary }] : [], archivedSkillIds: [], contextStats: {} };
    const requests = [], saved = [];
    const providerConfig = { provider: 'anthropic', maxTokens: 1000 };
    const controller = createHistoryCompactionController({ state, render() {}, persistSession() { saved.push(structuredClone(state)); return saveResult; }, showToast() {},
        getActiveProviderConfig: () => providerConfig, formatToolResultDisplay: () => ({}), buildTextWithAttachmentSummary: text => text,
        compactionThreshold: () => threshold, requestInputLimit: () => inputLimit,
        buildContextMeterLabel: () => '',
        toProviderMessages: (messages, { historySummary = currentHistorySummary(state) } = {}) => [...(historySummary ? [{ role: 'system', content: historySummary }] : []), ...buildProviderMessagesFromHistory(messages)],
        updateContextStats(messages) { state.contextStats = { usedTokens: estimateConversationTokens({ messages, providerConfig }), budgetTokens: 258000 }; },
    });
    const adapter = { chat: async request => {
        requests.push(request); return respond(request, requests.length);
    } };
    return { state, requests, saved, run: signal => controller.ensureContextBudget(adapter, signal) };
}

test('compaction retains fitting parallel Anthropic calls with both replies and invalidates old signatures', async () => {
    const h = harness({ messages: [...cycle('big', 12000), ...cycle('c4', 400)] });
    const result = await h.run(new AbortController().signal);
    const calls = result.flatMap(message => (message.tool_calls || []).map(call => call.id));
    const replies = result.filter(message => message.role === 'tool').map(message => message.tool_call_id);
    assert.deepEqual(calls, ['c4-0', 'c4-1']);
    assert.deepEqual(replies, calls);
    assert.equal(h.saved.length, 1);
    assert.ok(h.state.messages.every(message => !message.providerPayload?.anthropicContent.some(block => block.type === 'thinking')));
});

for (const failure of ['empty-first', 'empty-later', 'error-later', 'cancel-later', 'text-later', 'truncated-later', 'invalid-later']) {
    test(`summary ${failure} keeps original memory, messages and persisted state`, async () => {
        const abort = new AbortController();
        const h = harness({ summary: 'original memory', respond: (_request, n) => {
            if (n === (failure === 'empty-first' ? 1 : 2)) {
                if (failure === 'error-later') throw new Error('provider unavailable');
                if (failure === 'cancel-later') abort.abort();
                if (failure === 'text-later') return { text: '抱歉，我无法协助处理这段内容。' };
                if (failure === 'truncated-later') return { ...summaryResult('cut off'), truncated: true };
                if (failure === 'invalid-later') return { toolCalls: [{ name: 'submit_summary', arguments: '{"content":"partial' }] };
                return summaryResult('   ');
            }
            return summaryResult('temporary partial summary');
        } });
        const original = structuredClone(h.state);
        await assert.rejects(h.run(abort.signal), failure === 'cancel-later' ? { name: 'AbortError' } : { code: 'assistant_summary_failed' });
        assert.equal(currentHistorySummary(h.state), currentHistorySummary(original));
        assert.deepEqual(h.state.messages, original.messages);
        assert.equal(h.state.compactionPending, false);
        assert.equal(h.saved.length, 0);
    });
}

test('even a latest batch larger than one request is summarized in pieces without replaying it', async () => {
    const h = harness({ messages: cycle('latest', 1000000), threshold: 200000, inputLimit: 210000 });
    const result = await h.run(new AbortController().signal);
    assert.deepEqual(result.map(m => m.role), ['system', 'user']);
    assert.ok(h.requests.length > 1);
    assert.equal(h.saved.length, 1);
});

test('a failed checkpoint write restores tool evidence and the previous summary before reporting the failure', async () => {
    const h = harness({ summary: 'prior summary', saveResult: { ok: false, error: 'quota' } });
    const original = structuredClone(h.state.messages);
    await assert.rejects(h.run(new AbortController().signal), error => error.compactionReported === true);
    assert.equal(currentHistorySummary(h.state), 'prior summary');
    assert.deepEqual(h.state.messages, original);
    assert.equal(h.state.compactionPending, false);
    assert.ok(h.state.compactions.at(-1).error.includes('quota'));
});

test('an oversized pinned user request stops before buying summaries of available history', async () => {
    const h = harness({ messages: cycle('archivable') });
    h.state.messages[0].content = 'u'.repeat(100000);
    const original = structuredClone(h.state.messages);
    await assert.rejects(h.run(new AbortController().signal), { code: 'assistant_context_over_budget' });
    assert.equal(h.requests.length, 0);
    assert.deepEqual(h.state.messages, original);
});

test('a legal pinned input leaves room for the summary by archiving an otherwise fitting recent batch', async () => {
    const h = harness({ messages: [{role: 'assistant', toolCalls: [{id: 'a', name: 'Read', arguments: '{}'}]},
        {role: 'tool', toolCallId: 'a', content: 'x'.repeat(245)}], threshold: 3970, inputLimit: 4000 });
    h.state.messages[0].content = 'p'.repeat(13100);
    const next = await h.run();
    assert.deepEqual(next.map(m => m.role), ['system', 'user']);
    assert.ok(h.state.compactions.at(-1).after <= 4000);
});

for (const inputLimit of [4000, 5000]) test('an unhelpful summary preserves original inputs, input limit ' + inputLimit, async () => {
    const h = harness({ messages: cycle('large', 14000), threshold: 4000, inputLimit,
        respond: request => summaryResult(summarySource(request).includes('END-OF-EVIDENCE') ? 'm'.repeat(15500) : 'partial') });
    h.state.messages.at(-1).content += 'END-OF-EVIDENCE';
    const original = structuredClone(h.state.messages);
    if (inputLimit === 4000) await assert.rejects(h.run(), { code: 'assistant_context_over_budget' });
    else {
        assert.deepEqual((await h.run()).map(m => m.role), original.map(m => m.role));
        const requests = h.requests.length;
        await h.run();
        assert.equal(h.requests.length, requests, 'do not buy the same rejected summary again');
    }
    assert.deepEqual(h.state.messages, original);
    assert.equal(currentHistorySummary(h.state), '');
    assert.ok(h.state.compactions.every(record => !record.summary));
});

test('an oversized running summary stops before sending another chunk and preserves history', async () => {
    const h = harness({ summary: 'original memory', respond: () => summaryResult('large summary '.repeat(2000)) });
    const original = structuredClone(h.state.messages);
    await assert.rejects(h.run(new AbortController().signal), { code: 'assistant_summary_failed' });
    assert.equal(h.requests.length, 1);
    assert.equal(currentHistorySummary(h.state), 'original memory');
    assert.deepEqual(h.state.messages, original);
    assert.equal(h.saved.length, 0);
});
