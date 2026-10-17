import assert from 'node:assert/strict';
import test from 'node:test';
import { createHistoryCompactionController } from '../app-src/runtime/history-compaction.js';
import { SUMMARY_SYSTEM_PROMPT } from '../app-src/prompts/system-prompt.js';
import { readResponseCompletion } from '../../agent-core/runtime/response-completion.js';

// Acceptance contracts (cost: lost history / duplicate paid requests):
// - Plain-text summaries replace archived history without triggering the local fallback.
// - API failures retain the existing local fallback, without another model call.
// - Cancellation never archives history or adopts a late reply.
function harness(respond) {
    const state = { messages: [
        { role: 'user', content: 'Remember the original request.' }, { role: 'assistant', content: 'Confirmed.' },
        { role: 'user', content: 'Continue the next step.' },
    ], archivedTurnCount: 0, historySummary: 'original memory', contextStats: { usedTokens: 0 } };
    const notices = [], requests = [];
    let saves = 0;
    const controller = createHistoryCompactionController({ state, render() {}, persistSession() { saves++; },
        showToast: text => notices.push(text), getActiveProviderConfig: () => ({ maxTokens: 15000 }),
        formatToolResultDisplay: () => ({}), buildTextWithAttachmentSummary: text => text, trimForSummary: text => text,
        SUMMARY_SYSTEM_PROMPT, DEFAULT_PRESERVED_TURNS: 1, MIN_PRESERVED_TURNS: 1, SUMMARY_TRIGGER_TOKENS: 100,
        buildContextMeterLabel: () => '', toProviderMessages: messages => messages,
        updateContextStats() { state.contextStats.usedTokens = state.messages.length > 1 ? 200 : 1; },
    });
    const adapter = { chat: async request => { requests.push(request); return respond(request); } };
    return { state, notices, requests, run: signal => controller.ensureContextBudget(adapter, signal), saves: () => saves };
}

for (const reason of ['stop', 'length', undefined]) {
    test(`assistant adopts plain-text summary after ${reason ?? 'missing completion'} without fallback`, async () => {
        const h = harness(() => ({ ...readResponseCompletion('openai', reason), text: 'merged memory' }));
        await h.run(new AbortController().signal);
        assert.equal(h.state.historySummary, 'merged memory');
        assert.equal(h.state.messages.length, 1);
        assert.equal(h.notices.length, 1, 'Only the normal compaction notice is emitted');
        assert.equal(h.requests.length, 1);
        assert.equal(h.requests[0].maxTokens, 15000);
        assert.equal(h.saves(), 1);
    });
}

test('assistant uses its existing local fallback for an API error without a paid retry', async () => {
    const h = harness(() => { throw new Error('offline provider failure'); });
    await h.run(new AbortController().signal);
    assert.ok(h.state.historySummary.includes('original memory'));
    assert.ok(h.state.historySummary.includes('Remember the original request.'));
    assert.equal(h.notices.length, 2);
    assert.equal(h.requests.length, 1);
});

test('assistant cancellation preserves the original history and memory', async () => {
    const abort = new AbortController();
    const h = harness(() => { abort.abort(); return { text: 'late reply' }; });
    const original = structuredClone(h.state);
    await assert.rejects(h.run(abort.signal), { name: 'AbortError' });
    assert.equal(h.state.historySummary, original.historySummary);
    assert.deepEqual(h.state.messages, original.messages);
    assert.equal(h.saves(), 0);
});
