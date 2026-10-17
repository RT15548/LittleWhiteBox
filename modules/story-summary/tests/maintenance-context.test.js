import assert from 'node:assert/strict';
import test from 'node:test';
import { createMemoryContext } from '../maintenance/context.js';
import { readResponseCompletion } from '../../agent-core/runtime/response-completion.js';

// Acceptance contracts (cost: lost working history / duplicate paid requests):
// - Plain-text summaries replace old cycles independently of transport completion flags.
// - Empty replies, tools and cancellation leave the source conversation unchanged.
const history = () => [{ role: 'user', content: JSON.stringify({ workingNotes: 'original notes' }) },
    ...Array.from({ length: 4 }, (_, i) => [
        { role: 'assistant', content: `investigation ${i}` }, { role: 'tool', content: `observed fact ${i}` },
    ]).flat()];
function harness(respond, signal = new AbortController().signal) {
    const requests = [], counted = [];
    const context = createMemoryContext({ config: { maxTokens: 1000 }, signal,
        limits: { summaryTokens: 500, inputTokens: 10000, compactTokens: 5000 },
        countTokens: async input => { counted.push(input); return { tokens: 100 }; },
        summarize: async request => { requests.push(request); return respond(request); },
    });
    return { context, requests, counted };
}

for (const reason of ['stop', 'length', undefined]) {
    test(`memory-maintainer compaction adopts plain-text notes after ${reason ?? 'missing completion'}`, async () => {
        const h = harness(() => ({ ...readResponseCompletion('openai', reason), text: 'merged notes' }));
        const source = history(), original = structuredClone(source);
        const result = await h.context.compact(source, {}, 4);
        assert.equal(JSON.parse(result.messages[0].content).workingNotes, 'merged notes');
        assert.deepEqual(result.messages.slice(1), source.slice(5));
        assert.deepEqual(source, original);
        assert.equal(h.requests.length, 1);
        const summaryCount = h.counted.find(input => input.messages.length === 2 && input.messages[0].content === '');
        assert.equal(summaryCount.messages[1].content, 'merged notes');
    });
}

for (const response of [{ text: '' },
    { text: 'new notes', toolCalls: [{ name: 'Write', arguments: '{}' }] }]) {
    test(`memory-maintainer does not replace working history with ${response.toolCalls ? 'tools' : 'an empty summary'}`, async () => {
        const h = harness(() => ({ ...readResponseCompletion('openai', 'stop'), ...response }));
        const source = history(), original = structuredClone(source);
        await assert.rejects(h.context.compact(source, {}, 4), { code: 'compaction_failed' });
        assert.deepEqual(source, original);
        assert.equal(h.requests.length, 1);
    });
}

test('memory-maintainer cancellation does not replace working history', async () => {
    const abort = new AbortController();
    const h = harness(() => { abort.abort(); return { text: 'late reply' }; }, abort.signal);
    const source = history(), original = structuredClone(source);
    await assert.rejects(h.context.compact(source, {}, 4), { name: 'AbortError' });
    assert.deepEqual(source, original);
});
