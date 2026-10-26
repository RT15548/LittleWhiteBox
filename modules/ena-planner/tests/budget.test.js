import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPlannerBudget } from '../ena-planner-budget.js';
import { PLANNER_COPY } from '../ena-planner-copy.js';

// Contract: over-budget or unmeasurable requests cannot reach the paid main API.
// Text, tools and media stay in their respective accounting paths.
const io = {
    text: async text => text.length,
    messages: async messages => JSON.stringify(messages).length,
    media: async part => part.cost,
};
test('tool schemas and tool history contribute to the chat budget', async () => {
    const run = { field: 'messages', contextSize: 100 };
    const data = { messages: [{ role: 'user', content: 'hello' }] };
    await checkPlannerBudget(data, run, io);
    await assert.rejects(checkPlannerBudget({ ...data, tools: [{ description: 'x'.repeat(100) }] }, run, io));
    await assert.rejects(checkPlannerBudget({ messages: [...data.messages,
        { role: 'assistant', content: null, tool_calls: [{ arguments: 'x'.repeat(100) }] }] }, run, io));
});
for (const type of ['image_url', 'audio_url', 'video_url']) test(`${type} costs count without passing binary content to the text tokenizer`, async () => {
    const data = { messages: [{ role: 'user', content: [
        { type: 'text', text: 'hello' }, { type, cost: 100, privateData: 'binary' },
    ] }] };
    let tokenized;
    const counter = { ...io, messages: async messages => { tokenized = messages; return 40; } };
    await assert.rejects(checkPlannerBudget(data, { field: 'messages', contextSize: 140 }, counter));
    await checkPlannerBudget(data, { field: 'messages', contextSize: 143 }, counter);
    assert.deepEqual(tokenized, [{ role: 'user', content: 'hello' }]);
});
test('unknown media accounting, tokenizer failure and invalid limits stop rather than count as zero', async () => {
    const data = { messages: [{ role: 'user', content: [{ type: 'unknown' }] }] };
    await assert.rejects(checkPlannerBudget(data, { field: 'messages', contextSize: 100 }, io));
    await assert.rejects(checkPlannerBudget({ prompt: 'x' }, { field: 'prompt', contextSize: NaN }, io));
    await assert.rejects(checkPlannerBudget({ prompt: 'x' }, { field: 'prompt', contextSize: 100 },
        { ...io, text: async () => NaN }));
});
test('CFG branches each fit the window, not their sum; the negative branch can exceed it', async () => {
    const run = { field: 'prompt', companionFields: ['negative_prompt'], contextSize: 100 };
    await checkPlannerBudget({ prompt: 'x'.repeat(80), negative_prompt: 'x'.repeat(80) }, run, io);
    await assert.rejects(checkPlannerBudget({ prompt: 'x', negative_prompt: 'x'.repeat(101) }, run, io));
});
test('final text transport context/output limits can narrow the interceptor budget', async () => {
    const run = { field: 'prompt', contextSize: 100 };
    await assert.rejects(checkPlannerBudget({ prompt: 'x'.repeat(81), max_context_length: 100, max_length: 20 }, run, io));
    await checkPlannerBudget({ input: 'x'.repeat(80) }, { field: 'input', contextSize: 100 }, io);
});

// Mirror countTokensOpenAIAsync's call-level accounting, not a JSON length:
// each cached server response includes padding; the client starts at -1 and
// subtracts another 2 unless the model is Claude. Message uses full=false.
function hostCounter(claude = false) {
    const calls = [];
    const serverCost = message => 6 + Object.values(message).reduce((sum, value) => sum + value.length, 0);
    const messages = async batch => {
        calls.push(structuredClone(batch));
        return batch.reduce((sum, message) => sum + serverCost(message), -1) - (claude ? 0 : 2);
    };
    const messageCost = message => serverCost(message) - (claude ? 1 : 3);
    return { ...io, calls, messages, messageCost };
}

async function exactBudget(data, counter, tokens) {
    const before = structuredClone(data);
    await checkPlannerBudget(data, { field: 'messages', contextSize: tokens }, counter);
    await assert.rejects(checkPlannerBudget(data, { field: 'messages', contextSize: tokens - 1 }, counter),
        { message: PLANNER_COPY.budget });
    assert.deepEqual(data, before, 'budget checks must not modify the outgoing request');
}

for (const claude of [false, true]) test(`host per-message accounting reserves reply padding once (${claude ? 'Claude' : 'OpenAI'})`, async () => {
    const counter = hostCounter(claude);
    const messages = [
        { role: 'system', content: 'instructions' },
        { role: 'user', content: 'question', name: 'Alice' },
        { role: 'assistant', content: 'answer' },
    ];
    const total = messages.reduce((sum, message) => sum + counter.messageCost(message), 3);
    await exactBudget({ messages }, counter, total);
    assert.deepEqual(counter.calls, [...messages, ...messages].map(message => [message]));
});

test('tool schema reserve and tool history use the host single-message costs', async () => {
    const counter = hostCounter();
    const tool_calls = [{ id: 'call-1', type: 'function', function: { name: 'lookup', arguments: '{}' } }];
    const tools = [{ type: 'function', function: { name: 'lookup', parameters: { type: 'object' } } }];
    const data = { messages: [
        { role: 'assistant', tool_calls, reasoning: 'look up a fact' },
        { role: 'tool', content: 'a fact', tool_call_id: 'call-1' },
    ], tools, tool_choice: 'auto' };
    const counted = [
        { role: 'assistant', reasoning: 'look up a fact', tool_calls: JSON.stringify(tool_calls) },
        { role: 'tool', content: 'a fact' },
        { role: 'user', content: JSON.stringify({ tools, tool_choice: 'auto' }) },
    ];
    const total = counted.reduce((sum, message) => sum + counter.messageCost(message), 3);
    await exactBudget(data, counter, total);
    assert.deepEqual(counter.calls, [...counted, ...counted].map(message => [message]));
});

test('transport signatures and tool result ids do not inflate text costs', async () => {
    const counter = hostCounter();
    const counted = [
        { role: 'assistant', content: 'answer' },
        { role: 'tool', content: 'result' },
    ];
    const data = { messages: [
        { ...counted[0], signature: 'opaque'.repeat(1000) },
        { ...counted[1], tool_call_id: 'opaque'.repeat(1000) },
    ] };
    await exactBudget(data, counter, counted.reduce((sum, message) => sum + counter.messageCost(message), 3));
    assert.deepEqual(counter.calls, [...counted, ...counted].map(message => [message]));
});

test('media-only and empty messages have no extra text envelope', async () => {
    const counter = hostCounter();
    const data = { messages: [
        { role: 'user', content: [{ type: 'text', text: '' }, { type: 'image_url', cost: 85 }] },
        { role: 'assistant', content: '' },
    ] };
    await exactBudget(data, counter, 88);
    assert.deepEqual(counter.calls, []);
});

test('multiple media costs and text are each counted exactly once', async () => {
    const counter = hostCounter();
    const mediaCalls = [];
    counter.media = async part => { mediaCalls.push(part.type); return part.cost; };
    const message = { role: 'user', content: 'question\nmore text', name: 'Alice' };
    const data = { messages: [{ ...message, content: [
        { type: 'text', text: 'question' }, { type: 'image_url', cost: 85 },
        { type: 'text', text: 'more text' }, { type: 'audio_url', cost: 32 }, { type: 'video_url', cost: 263 },
    ] }] };
    await exactBudget(data, counter, counter.messageCost(message) + 85 + 32 + 263 + 3);
    assert.deepEqual(counter.calls, [[message], [message]]);
    assert.deepEqual(mediaCalls, ['image_url', 'audio_url', 'video_url', 'image_url', 'audio_url', 'video_url']);
});

test('prompt context is already net of the output reserve', async () => {
    await checkPlannerBudget({ messages: [{ role: 'user', content: 'x' }], max_tokens: 100 },
        { field: 'messages', contextSize: 43 }, { ...io, messages: async () => 40 });
    await checkPlannerBudget({ prompt: 'x'.repeat(80), max_context_length: 100, max_length: 20 },
        { field: 'prompt', contextSize: 80 }, io);
});

test('individual invalid message and tool counts fail closed before aggregation', async () => {
    const data = { messages: [{ role: 'user', content: 'x' }] };
    for (const invalid of [NaN, Infinity, -1]) {
        await assert.rejects(checkPlannerBudget(data, { field: 'messages', contextSize: 100 },
            { ...io, messages: async () => invalid }), { message: PLANNER_COPY.budgetUnknown });
        await assert.rejects(checkPlannerBudget({ messages: [], tools: [] }, { field: 'messages', contextSize: 100 },
            { ...io, messages: async () => invalid }), { message: PLANNER_COPY.budgetUnknown });
    }
});
