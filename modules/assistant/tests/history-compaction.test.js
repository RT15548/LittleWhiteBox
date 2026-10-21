import assert from 'node:assert/strict';
import test from 'node:test';
import { createHistoryCompactionController } from '../app-src/runtime/history-compaction.js';
import { SUMMARY_SYSTEM_PROMPT } from '../app-src/prompts/system-prompt.js';
import { readResponseCompletion } from '../../agent-core/runtime/response-completion.js';
import { settleAssistantRunFailure } from '../app-src/runtime/run-failure.js';

// Acceptance contracts (cost: lost history / duplicate paid requests):
// - Plain-text summaries replace archived history without triggering the local fallback.
// - API failures retain the existing local fallback, without another model call.
// - Cancellation never archives history or adopts a late reply.
// - Recent answers and the active tool round are retained separately (cost: lost context / broken protocol).
// - Budget pressure may summarize every prior turn, without changing the current request/tool group.
// - Failed/cancelled prose never occupies an answered-turn slot; confirmed tool groups remain intact (cost: lost context / broken protocol).
function harness(respond, fitsAt = 5) {
    const state = { messages: [
        { role: 'user', content: 'Remember the original request.' }, { role: 'assistant', content: 'Confirmed.' },
        { role: 'user', content: 'Second question.' }, { role: 'assistant', content: 'Second answer.' },
        { role: 'user', content: 'Third question.' }, { role: 'assistant', content: 'Third answer.' },
        { role: 'user', content: 'Continue the next step.' },
    ], archivedTurnCount: 0, historySummary: 'original memory', contextStats: { usedTokens: 0 } };
    const notices = [], requests = [];
    let saves = 0;
    const controller = createHistoryCompactionController({ state, render() {}, persistSession() { saves++; },
        showToast: text => notices.push(text), getActiveProviderConfig: () => ({ maxTokens: 15000 }),
        formatToolResultDisplay: () => ({}), buildTextWithAttachmentSummary: text => text, trimForSummary: text => text,
        SUMMARY_SYSTEM_PROMPT, SUMMARY_TRIGGER_TOKENS: 100,
        buildContextMeterLabel: () => '', toProviderMessages: messages => messages,
        updateContextStats() { state.contextStats.usedTokens = state.messages.length > fitsAt ? 200 : 1; },
    });
    const adapter = { chat: async request => { requests.push(request); return respond(request); } };
    return { state, notices, requests, run: signal => controller.ensureContextBudget(adapter, signal), saves: () => saves };
}

for (const reason of ['stop', 'length', undefined]) {
    test(`assistant adopts plain-text summary after ${reason ?? 'missing completion'} without fallback`, async () => {
        const h = harness(() => ({ ...readResponseCompletion('openai', reason), text: 'merged memory' }));
        await h.run(new AbortController().signal);
        assert.equal(h.state.historySummary, 'merged memory');
        assert.equal(h.state.messages.length, 5);
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

test('assistant prefers one answered turn when it fits beside the complete active tool round', async () => {
    const h = harness(() => ({ text: 'memory' }), 5);
    h.state.messages.push({ role: 'assistant', content: '', toolCalls: [{ id: 'a', name: 'Read', arguments: '{}' }] },
        { role: 'tool', content: 'observed', toolCallId: 'a' });
    const active = structuredClone(h.state.messages.slice(-3));
    const messages = await h.run(new AbortController().signal);
    assert.deepEqual(messages.slice(-3), active);
    assert.deepEqual(messages.slice(0, 2), [{ role: 'user', content: 'Third question.' }, { role: 'assistant', content: 'Third answer.' }]);
    assert.equal(h.requests.length, 2);
    await h.run(new AbortController().signal);
    assert.equal(h.requests.length, 2);
});

test('assistant summarizes its only prior answer while retaining the complete active tool round', async () => {
    const h = harness(() => ({ text: 'memory' }), 3);
    h.state.messages = h.state.messages.slice(-3);
    h.state.messages.push({ role: 'assistant', content: '', toolCalls: [{ id: 'a', name: 'Read', arguments: '{}' }] },
        { role: 'tool', content: 'observed', toolCallId: 'a' });
    const active = structuredClone(h.state.messages.slice(-3));
    assert.deepEqual(await h.run(new AbortController().signal), active);
    assert.equal(h.notices.length, 1);
    assert.deepEqual(h.state.messages, active);
    assert.equal(h.state.historySummary, 'memory');
    assert.equal(h.requests.length, 1);
    assert.equal(h.saves(), 1);
    await h.run(new AbortController().signal);
    assert.equal(h.requests.length, 1);
});

for (const notice of ['provider failure', 'cancelled', '']) {
    test(`assistant can summarize failed runs together with the last answer (${notice || 'silent cancellation'})`, async () => {
        const h = harness(() => ({ text: 'memory' }), 0);
        h.state.messages.pop();
        for (let i = 0; i < 2; i++) {
            h.state.messages.push({ role: 'user', content: `attempt ${i}` },
                { role: 'assistant', content: 'partial reply', streaming: true });
            settleAssistantRunFailure({ messages: h.state.messages, notice,
                pushMessage: message => h.state.messages.push(message), persistSession() {} });
        }
        h.state.messages.push({ role: 'user', content: 'current request' });
        const messages = await h.run(new AbortController().signal);
        assert.deepEqual(messages, [{ role: 'user', content: 'current request' }]);
        assert.equal(h.state.historySummary, 'memory');
        assert.equal(h.requests.length, 3);
        await h.run(new AbortController().signal);
        assert.equal(h.requests.length, 3, 'Already summarized history cannot trigger more requests');
        h.state.messages.push({ role: 'assistant', content: 'next successful answer' },
            { role: 'user', content: 'continue' });
        const next = await h.run(new AbortController().signal);
        assert.deepEqual(next, [{ role: 'user', content: 'continue' }]);
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
