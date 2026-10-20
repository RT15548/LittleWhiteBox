import assert from 'node:assert/strict';
import test from 'node:test';
import { runAdministratorLoop } from '../apps/administrator/agent/provider-loop.js';
import { runLearningProviderLoop } from '../apps/learning/agent/provider-loop.js';
import { learningHistoryPrompt } from '../apps/learning/agent/history-prompt.js';

// Acceptance contracts (cost: lost conversation / broken tool protocol / wasted API fees):
// - Actual requests keep two answered turns, or at least one, separately from the current request.
// - Native session replay after compaction keeps the current tool calls and results paired.
// - Oversized protected material fails explicitly without erasing recent answers or paid summary retries.
// - Cancellation cannot adopt a late summary or start another model call.
const tool = { type: 'function', function: { name: 'Read', description: 'Read', parameters: { type: 'object', properties: {} } } };
const words = count => 'word '.repeat(count);
const answered = (i, size) => ({ id: `turn-${i}`, user: { text: `question ${i}` }, assistant: `answer ${i} ${words(size)}`,
    toolMessages: [], operations: [], status: 'finished', error: '' });
const current = () => ({ ...answered('current', 0), assistant: null, status: 'running' });
const userQuestions = messages => messages.filter(message => message.role === 'user').map(message => message.content);
const assertToolPairs = messages => {
    for (const [index, message] of messages.entries()) {
        if (message.tool_calls?.length) assert.deepEqual(messages.slice(index + 1, index + 1 + message.tool_calls.length)
            .map(item => item.tool_call_id), message.tool_calls.map(call => call.id));
    }
};

function administrator(sizes, { toolSize = 0, summaryResult, signal = new AbortController().signal } = {}) {
    const state = { summary: null, turns: [...sizes.map((size, i) => answered(i, size)), current()] };
    const requests = [], summaries = [], saves = [];
    const gateway = { openSession: async () => ({ providerConfig: {}, supportsSessionToolLoop: true, run: async request => {
        if (!request.tools.length) { summaries.push(request); return summaryResult ? summaryResult() : { text: 'memory' }; }
        requests.push(structuredClone({ messages: request.messages, toolResponses: request.toolResponses }));
        if (toolSize && requests.length === 1) return { toolCalls: [{ id: 'read-1', name: 'Read', arguments: '{}' }] };
        return { text: 'finished' };
    } }) };
    const run = () => runAdministratorLoop({ gateway, config: {}, system: 'system', prefix: [],
        request: { role: 'user', content: 'current request' }, requestForCounting: { role: 'user', content: 'current request' },
        imageCount: 0, state, signal, getTools: () => [tool], execute: async () => ({ text: words(toolSize) }),
        save: async () => { saves.push(structuredClone(state)); }, onText() {}, onPhase() {}, onContext() {} });
    return { state, requests, summaries, saves, run };
}

test('administrator keeps two completed exchanges in the actual request', async () => {
    const h = administrator([30000, 30000, 30000, 30000, 30000]);
    await h.run();
    assert.deepEqual(userQuestions(h.requests[0].messages), ['question 3', 'question 4', 'current request']);
    assert.equal(h.state.summary.throughId, 'turn-2');
    assert.equal(h.state.summary.throughToolMessage, null);
    assert.equal(h.summaries.length, 1);
});

test('administrator falls back to one exchange while keeping the entire active tool round', async () => {
    const h = administrator([30000, 30000, 30000, 30000, 30000], { toolSize: 55000 });
    await h.run();
    const replay = h.requests[1];
    assert.equal(replay.toolResponses, undefined);
    assert.deepEqual(userQuestions(replay.messages), ['question 4', 'current request']);
    assert.equal(replay.messages.at(-1).role, 'tool');
    assertToolPairs(replay.messages);
    assert.equal(h.state.summary.throughId, 'turn-3');
    assert.equal(h.state.summary.throughToolMessage, null);
});

test('administrator rejects an oversized protected exchange without summarizing it', async () => {
    const h = administrator([1000, 170000]);
    const before = structuredClone(h.state);
    await assert.rejects(h.run(), /administrator_context_full/);
    assert.deepEqual(h.state, before);
    assert.equal(h.summaries.length, 0);
    assert.equal(h.requests.length, 0);
});

test('administrator ignores a late summary after cancellation', async () => {
    const abort = new AbortController();
    const h = administrator([30000, 30000, 30000, 30000, 30000], { signal: abort.signal,
        summaryResult: () => { abort.abort(); return { text: 'late memory' }; } });
    await assert.rejects(h.run(), { name: 'AbortError' });
    assert.equal(h.state.summary, null);
    assert.equal(h.requests.length, 0);
    assert.equal(h.saves.length, 0);
});

test('administrator does not buy repeated summaries after a non-shrinking result', async () => {
    const h = administrator([10000, 50000, 50000], { summaryResult: () => ({ text: words(100000) }) });
    await assert.rejects(h.run(), /administrator_summary_failed/);
    assert.equal(h.summaries.length, 2);
    assert.equal(h.requests.length, 0);
    assert.equal(h.state.summary, null);
});

function learning(kind, { toolSize = 0, overflow = false, signal = new AbortController().signal, summaryResult } = {}) {
    const history = Array.from({ length: 5 }, (_, i) => ({ user: `question ${i}`, status: 'finished',
        messages: [{ role: 'assistant', content: `answer ${i} ${words(35000)}` }] }));
    const requests = [], summaries = [], commits = [];
    const openSession = async () => ({ providerConfig: {}, supportsSessionToolLoop: true, run: async request => {
        if (!request.tools.length) { summaries.push(request); return summaryResult ? summaryResult() : { text: 'memory' }; }
        requests.push(structuredClone({ messages: request.messages, toolResponses: request.toolResponses }));
        if (overflow) throw Object.assign(new Error('too long'), { code: 'context_length_exceeded' });
        if (toolSize && requests.length === 1) return { toolCalls: [{ id: 'learning-read', name: 'Read', arguments: '{}' }] };
        return { text: 'finished' };
    } });
    const run = async () => runLearningProviderLoop({ agent: await openSession(), systemPrompt: 'system',
        summaryPrompt: learningHistoryPrompt(kind), messages: [{ role: 'user', content: 'current request' }], tools: [tool],
        signal, guard: () => true, history, reopen: openSession, executeTool: async () => ({ text: words(toolSize) }),
        onCompact: (removed, summary) => commits.push({ removed, summary }) });
    return { history, requests, summaries, commits, run };
}

for (const kind of ['workbench', 'companion']) {
    test(`${kind} sends two answered turns plus its current request after compaction`, async () => {
        const h = learning(kind);
        assert.equal((await h.run()).status, 'finished');
        assert.deepEqual(userQuestions(h.requests[0].messages), ['question 3', 'question 4', 'current request']);
        assert.equal(h.commits[0].removed, 3);
    });
    test(`${kind} preserves one answered turn and paired tools after native session compaction`, async () => {
        const h = learning(kind, { toolSize: 100000 });
        assert.equal((await h.run()).status, 'finished');
        assert.deepEqual(userQuestions(h.requests[1].messages), ['question 4', 'current request']);
        assert.equal(h.requests[1].toolResponses, undefined);
        assertToolPairs(h.requests[1].messages);
        assert.equal(h.commits.reduce((sum, item) => sum + item.removed, 0), 4);
    });
    test(`${kind} reports capacity instead of dropping its final answered turn`, async () => {
        const h = learning(kind, { overflow: true });
        const result = await h.run();
        assert.equal(result.status, 'failed');
        assert.equal(result.reason, 'learning_context_full');
        assert.deepEqual(userQuestions(h.requests.at(-1).messages), ['question 4', 'current request']);
        assert.equal(h.summaries.length, 2);
        assert.equal(h.requests.length, 2);
    });
    test(`${kind} cancellation ignores a late summary without spending another model call`, async () => {
        const abort = new AbortController();
        const h = learning(kind, { signal: abort.signal, summaryResult: () => { abort.abort(); return { text: 'late' }; } });
        assert.equal((await h.run()).status, 'cancelled');
        assert.equal(h.requests.length, 0);
        assert.equal(h.commits.length, 0);
    });
}
