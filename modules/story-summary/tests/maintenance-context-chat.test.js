import assert from 'node:assert/strict';
import test from 'node:test';
import { createMemoryContext } from '../maintenance/context.js';
import { runMemoryAgent } from '../maintenance/runner.js';
import { memoryRegenerationNote } from '../maintenance/conversation.js';

// Preserve actual user intent and provider protocol when changing a prefix.
const question = '不是 JSON。请解释上次失败，先别做全库维护。';
const toolGroup = index => [{ role: 'assistant', content: '',
    providerPayload: { anthropicContent: [{ type: 'thinking', thinking: 'private', signature: 'invalid-after-prefix-edit' },
        { type: 'tool_use', id: `read-${index}`, name: 'ReadMaintenance', input: {} }], googleParts: [{ thoughtSignature: `google-${index}` }] },
    tool_calls: [{ id: `read-${index}`, type: 'function', function: { name: 'ReadMaintenance', arguments: '{}' } }],
}, { role: 'tool', tool_call_id: `read-${index}`, content: JSON.stringify({ runId: `run-${index}`, status: 'failed' }) }];
const previousTurns = () => Array.from({ length: 5 }, (_, i) => [
    { role: 'user', content: `question ${i}` }, ...toolGroup(i), { role: 'assistant', content: `answer ${i}` },
]).flat();
function harness() {
    const summaries = [];
    const context = createMemoryContext({ config: { maxTokens: 1000 }, systemPrompt: 'domain', tools: [],
        limits: { inputTokens: 10000, compactTokens: 1100, summaryTokens: 500 },
        countTokens: async ({ messages }) => ({ tokens: messages.length * 100, source: 'test' }),
        summarize: async request => { summaries.push(request); return { text: 'Prior requests and saved work, without stale record values.' }; },
    });
    return { context, summaries };
}
function assertPaired(messages) {
    for (let i = 0; i < messages.length; i++) {
        if (!messages[i].tool_calls?.length) continue;
        const ids = messages[i].tool_calls.map(tool => tool.id);
        assert.deepEqual(messages.slice(i + 1, i + 1 + ids.length).map(message => message.tool_call_id), ids);
    }
}

test('manual compaction summarizes whole prior user turns and preserves the current non-JSON question', async () => {
    const h = harness(), source = [...previousTurns(), { role: 'user', content: question }], original = structuredClone(source);
    const result = await h.context.compactChat(source);
    assert.equal(result.messages.at(-1).role, 'user');
    assert.equal(result.messages.at(-1).content, question);
    assert.equal(result.messages.filter(message => message.content === question).length, 1);
    const fragment = JSON.parse(h.summaries[0].messages[0].content).workFragment.text;
    const archived = JSON.parse(fragment);
    assert.equal(archived.every(turn => turn[0].role === 'user' && turn.at(-1).role === 'assistant'), true);
    assertPaired(result.messages);
    assert.deepEqual(source, original);
});

test('compaction retains the current regeneration metadata with the fixed user question', async () => {
    const h = harness(), note = memoryRegenerationNote({ runId: 'uncertain-attempt', status: 'unconfirmed', saved: 1 });
    const result = await h.context.compactChat([...previousTurns(), note, { role: 'user', content: question }]);
    assert.deepEqual(result.messages.at(-2), note);
    assert.equal(result.messages.at(-1).content, question);
});

test('all carried Anthropic signatures are dropped after manual prefix edits, not other provider payloads', async () => {
    const h = harness();
    const result = await h.context.compactChat([...previousTurns(), { role: 'user', content: question }]);
    const carried = result.messages.filter(message => message.providerPayload);
    assert.equal(carried.length > 0, true);
    for (const message of carried) {
        assert.equal(message.providerPayload.anthropicContent.some(block => block.type === 'thinking'), false);
        assert.equal(message.providerPayload.anthropicContent[0].type, 'tool_use');
        assert.equal(message.providerPayload.googleParts[0].thoughtSignature.startsWith('google-'), true);
    }
});

test('automatic compaction also removes invalidated Anthropic thinking from retained tool groups', async () => {
    const h = harness();
    const source = [{ role: 'user', content: JSON.stringify({ task: {}, memory: [] }) },
        ...Array.from({ length: 5 }, (_, i) => toolGroup(i)).flat()];
    const result = await h.context.compact(source, {}, 10);
    assert.equal(result.messages.filter(message => message.providerPayload)
        .every(message => message.providerPayload.anthropicContent.every(block => block.type !== 'thinking')), true);
    assertPaired(result.messages);
});

test('long current-turn tool work can compact without discarding or summarizing away the current request', async () => {
    const h = harness();
    const result = await h.context.compactChat([{ role: 'user', content: question },
        ...Array.from({ length: 6 }, (_, i) => toolGroup(i)).flat()]);
    assert.equal(result.messages.find(message => message.role === 'user').content, question);
    assert.equal(result.messages.filter(message => message.role === 'user').length, 1);
    const archived = JSON.parse(JSON.parse(h.summaries[0].messages[0].content).workFragment.text);
    assert.equal(archived.flat().some(message => message.role === 'user'), false);
    assertPaired(result.messages);
});

test('an oversized current question fails rather than deleting it or buying a useless summary', async () => {
    let summaries = 0;
    const context = createMemoryContext({ config: { maxTokens: 100 }, systemPrompt: '', tools: [],
        limits: { inputTokens: 100, compactTokens: 90, summaryTokens: 50 },
        countTokens: async ({ messages }) => ({ tokens: messages.reduce((sum, message) => sum + message.content.length, 0) }),
        summarize: async () => { summaries++; return { text: 'should not happen' }; },
    });
    const source = [{ role: 'user', content: 'x'.repeat(200) }];
    await assert.rejects(context.compactChat(source), { code: 'input_limit' });
    assert.equal(summaries, 0);
    assert.equal(source[0].content.length, 200);
});

test('native continuation is rebuilt after chat compaction and receives a complete provider history', async () => {
    const requests = [], summaries = [];
    const result = await runMemoryAgent(null, { mode: 'chat', question, history: previousTurns(),
        config: { provider: 'anthropic', model: 'offline', maxTokens: 1000 },
        limits: { turns: 10, inputTokens: 10000, compactTokens: 1100, summaryTokens: 500 },
        countTokens: async ({ messages }) => ({ tokens: messages.length * 100, source: 'test' }),
        createSummaryAdapter: () => ({ chat: async request => { summaries.push(request); return { text: 'Retained work.' }; } }),
        readMaintenance: async () => ({ status: 'idle' }),
        adapter: { supportsSessionToolLoop: true, chat: async request => {
            requests.push({ ...request, messages: structuredClone(request.messages) });
            return requests.length === 1 ? { toolCalls: Array.from({ length: 3 }, (_, i) => ({ id: `diagnostic-${i}`, name: 'ReadMaintenance', arguments: '{}' })) }
                : { text: 'Here is the diagnostic explanation.' };
        } },
    });
    assert.equal(result.status, 'completed');
    assert.equal(summaries.length > 0, true);
    assert.equal(requests.length, 2);
    assert.equal(requests[1].toolResponses, undefined);
    assert.equal(requests[1].messages.some(message => message.role === 'user' && message.content === question), true);
    assertPaired(result.messages);
    assert.equal(result.calls.length, summaries.length + requests.length);
    assert.equal(result.replayBeforeTurn.length > 0, true);
});
