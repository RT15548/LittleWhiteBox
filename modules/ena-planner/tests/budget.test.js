import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPlannerBudget } from '../ena-planner-budget.js';

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
