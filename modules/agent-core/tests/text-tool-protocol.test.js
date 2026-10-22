import test from 'node:test';
import assert from 'node:assert/strict';
import {
    OpenAICompatibleAdapter,
    analyzeAssistantText,
    buildTaggedMessages,
    extractTaggedToolCalls,
    extractThinkTaggedContent,
    mergeReplayMessages,
    stripTaggedToolCallsForDisplay,
} from '../adapters/openai-compatible.js';
import { SillyTavernOpenAICompatibleAdapter } from '../adapters/sillytavern-openai-compatible.js';
import { buildProviderMessagesFromHistory } from '../runtime/protocol.js';
import { boundaryCases, invalidBoundaryCases, readBlock, readCall } from './fixtures/text-tool-boundaries.js';

// Acceptance contracts (failure costs: unintended writes or paid corrective requests):
// - Complete calls in separate blocks, an array or a JSON sequence retain order, ids and arguments.
// - An invalid member of a closed block rejects the batch; an unclosed tail cannot consume completed calls.
// - Quoted markers and markers in argument strings are data, not extra calls.
// - Reasoning stays in thoughts, never executable calls, across direct/hosted and streaming replies.
// - Normalized calls replay with the same identity and arguments, without executing examples twice.
// - Code examples and opaque thoughts before/between/after calls never authorize writes or deletes.
// - Fence-like text inside a code block cannot end that example and authorize a call.
// - Broken closed blocks report a protocol failure rather than silently losing paid output.
// - Fragment boundaries never add bytes to arguments or expose quoted examples as tool drafts.
const wrap = payload => `<tool_call>${payload}</tool_call>`;
const example = wrap(JSON.stringify({ name: 'Delete', arguments: { path: 'local/example.md' } }));
const inputs = [
    { id: 'tool-call-2', name: 'Write', arguments: { filePath: 'local/a.md', content: `${example}\n<think>literal</think> \\ "quoted"` } },
    { name: 'Read', arguments: { filePath: 'local/a.md', ranges: [{ start: 1, end: 4 }] } },
];
const jsons = inputs.map(input => JSON.stringify(input));
const expected = inputs.map((input, index) => ({
    id: input.id || `tool-call-${index + 2}`,
    name: input.name,
    arguments: JSON.stringify(input.arguments),
}));
const task = {
    messages: [{ role: 'user', content: 'Write, then read.' }],
    tools: inputs.map(input => ({ type: 'function', function: {
        name: input.name, parameters: { type: 'object' },
    } })),
};

function replay(result) {
    const messages = buildTaggedMessages({ messages: buildProviderMessagesFromHistory([{
        role: 'assistant', content: result.text || '', toolCalls: result.toolCalls, providerPayload: result.providerPayload,
    }]) });
    return extractTaggedToolCalls(messages.find(message => message.role === 'assistant').content);
}

test('tagged batches preserve every call and normalize to the standard replay format', () => {
    for (const content of [
        jsons.map(wrap).join('\n'),
        wrap(JSON.stringify(inputs)),
        wrap(jsons.join('')),
        wrap(jsons.join('\n')),
        wrap(jsons.join(',\n')),
        wrap(`${jsons[0]}\n[${jsons[1]}]`),
        wrap(`Here are the calls:\n\`\`\`json\n[${jsons.join(',')}]\n\`\`\`\nDone.`),
    ]) {
        const calls = extractTaggedToolCalls(content);
        assert.deepEqual(calls, expected);
        assert.deepEqual(replay({ toolCalls: calls }), calls);
    }
});

test('invalid batch members never silently disappear or release earlier calls', () => {
    for (const body of [
        `[${jsons[0]},null]`,
        `[${jsons[0]},"example"]`,
        `[${jsons[0]},{}]`,
        `[${jsons[0]},[${jsons[1]}]]`,
        `[${jsons[0]},{"name":7,"arguments":{}}]`,
        `[${jsons[0]},{"name":"Read","arguments":{},"misplaced":1}]`,
        `[${jsons.join(',')},]`,
        `${jsons[0]}\n{"name":"Read",`,
        `${jsons[0]}\n{"name":"Read","arguments":{`,
        `${jsons[0]}\n{"name":"Read","arguments":[]]`,
        `${jsons[0]}\nExample: ${jsons[1]}`,
        `${jsons[0]}\n"arguments": ${jsons[1]}`,
    ]) {
        assert.throws(() => extractTaggedToolCalls(wrap(jsons[0]) + wrap(body)), {
            code: 'TAGGED_TOOL_CALL_INVALID',
        }, body);
    }
    assert.deepEqual(extractTaggedToolCalls(wrap(jsons[0]) + `<tool_call>${jsons[1]}`), [expected[0]]);
});

test('payload annotations, argument strings and body code examples retain literal markers', () => {
    const quoted = JSON.stringify(`Mention <tool_call> and </tool_call>, or this example: ${example}; <｜DSML｜invoke name="Delete">`);
    const args = { note: quoted, content: example };
    const payload = JSON.stringify({ name: 'Write', arguments: args });
    for (const content of [
        wrap(`${quoted}\n${payload}\n${quoted}`),
        wrap(`<status value='${example}'/>${payload}`),
        `\`${quoted}\`\n${wrap(payload)}\n\`${quoted}\``,
    ]) {
        const calls = extractTaggedToolCalls(content);
        assert.equal(calls.length, 1);
        assert.deepEqual(JSON.parse(calls[0].arguments), args);
    }
    assert.deepEqual(extractTaggedToolCalls(`\`${quoted}\``), []);
    assert.equal(stripTaggedToolCallsForDisplay(`\`${quoted}\``), `\`${quoted}\``);
});

test('closed and unfinished think blocks cannot leak tool examples into execution', () => {
    for (const prefix of [`<think>${example}</think>`, `<think>Mention "<tool_call>"</think>`]) {
        const split = extractThinkTaggedContent(prefix + wrap(JSON.stringify(inputs)));
        assert.equal(split.thoughts.length, 1);
        assert.deepEqual(extractTaggedToolCalls(split.cleaned), expected);
    }
    const split = extractThinkTaggedContent(`<think>Considering ${example}`);
    assert.equal(split.cleaned, '');
    assert.deepEqual(extractTaggedToolCalls(split.cleaned), []);
});

test('a final content snapshot replaces streaming fragments without duplicating calls or losing reasoning', () => {
    const text = wrap(JSON.stringify(inputs));
    const message = { role: 'assistant', content: [{ type: 'text', text }] };
    for (const content of [
        message.content,
        [{ type: 'text', text: text.slice(0, 30) }, { type: 'text', text: text.slice(30) }],
    ]) {
        const merged = mergeReplayMessages({ ...message, content, reasoning_content: 'Reasoning' }, message);
        assert.deepEqual(merged.content, message.content);
        assert.equal(merged.reasoning_content, 'Reasoning');
        assert.deepEqual(extractTaggedToolCalls(merged.content[0].text), expected);
    }
});

test('one partition owns prose, thoughts, drafts and execution regardless of marker placement', () => {
    for (const sample of boundaryCases) {
        const analysis = analyzeAssistantText(sample.content);
        assert.equal(analysis.text, sample.text, sample.label);
        assert.deepEqual(analysis.thoughts.map(thought => thought.text), sample.thoughts, sample.label);
        const calls = extractTaggedToolCalls(sample.content);
        assert.deepEqual(calls.map(call => ({ name: call.name, arguments: JSON.parse(call.arguments) })), sample.calls, sample.label);
        assert.deepEqual(replay({ text: sample.text, toolCalls: calls }), calls, sample.label);
        for (let end = 1; end <= sample.content.length; end += 1) {
            const progress = analyzeAssistantText(sample.content.slice(0, end), { streaming: true });
            assert.ok(progress.draft.every(call => call.name !== 'Delete'), `${sample.label} at ${end}`);
        }
    }
});

test('every real malformed block rejects final decoding including separate later tags', () => {
    for (const content of invalidBoundaryCases) {
        assert.throws(() => extractTaggedToolCalls(content), {
            code: 'TAGGED_TOOL_CALL_INVALID', offset: content.startsWith(readBlock) ? readBlock.length : 0,
        });
        // A draft may describe the first call, but it cannot authorize execution.
        assert.ok(analyzeAssistantText(content, { streaming: true }).draft.every(call => call.draft === true));
    }
});

test('direct and hosted transports use the same boundary contract and issue only one request', async t => {
    for (const hosted of [false, true]) {
        for (const transport of ['non-stream', 'tagged-stream', 'native-stream']) {
            await t.test(`${hosted ? 'hosted' : 'direct'}/${transport}`, async subtest => {
                const streaming = transport !== 'non-stream';
                let content;
                let requests = 0;
                const response = () => ({ choices: [{ message: { role: 'assistant', content }, finish_reason: 'length' }] });
                const events = function* () {
                    for (const char of content) yield { choices: [{ delta: { content: char } }] };
                    yield { choices: [{ delta: {}, finish_reason: 'length' }] };
                };
                const config = { apiKey: 'unused', model: 'compat-test', toolMode: transport === 'native-stream' ? 'native' : 'tagged-json' };
                const adapter = hosted ? new SillyTavernOpenAICompatibleAdapter(config, {
                    buildHostChatCompletionGenerateRequest() { return {}; },
                    async createHostChatCompletion() { requests += 1; return response(); },
                    async streamHostChatCompletion(_payload, accept) {
                        requests += 1;
                        for (const event of events()) accept(event);
                    },
                }) : new OpenAICompatibleAdapter(config);
                if (!hosted) adapter.client.chat.completions.create = async () => {
                    requests += 1;
                    return streaming ? { async *[Symbol.asyncIterator]() { yield* events(); } } : response();
                };
                if (!hosted && transport === 'native-stream') {
                    const originalFetch = globalThis.fetch;
                    subtest.after(() => { globalThis.fetch = originalFetch; });
                    globalThis.fetch = async () => {
                        requests += 1;
                        return new Response([...events()].map(event => `data: ${JSON.stringify(event)}\n\n`).join('') + 'data: [DONE]\n\n');
                    };
                }
                const progress = [];
                const requestTask = { ...task, captureRawAssistantMessage: true,
                    ...(streaming ? { onStreamProgress: value => progress.push(value) } : {}) };
                for (const sample of boundaryCases) {
                    content = sample.content;
                    const before = requests;
                    progress.length = 0;
                    const result = await adapter.chat(requestTask);
                    assert.equal(requests, before + 1, sample.label);
                    assert.equal(result.text, sample.text, sample.label);
                    assert.deepEqual(result.toolCalls.map(call => ({ name: call.name, arguments: JSON.parse(call.arguments) })), sample.calls, sample.label);
                    assert.deepEqual(result.thoughts.map(thought => thought.text), sample.thoughts, sample.label);
                    assert.deepEqual(replay(result), result.toolCalls, sample.label);
                    assert.ok(progress.every(snapshot => (snapshot.toolCalls || []).every(call => call.name !== 'Delete')), sample.label);
                    assert.ok(progress.every(snapshot => !snapshot.toolCalls?.length || snapshot.toolCallDraft === true), sample.label);
                }
                for (content of invalidBoundaryCases) {
                    const before = requests;
                    await assert.rejects(adapter.chat(requestTask), error => {
                        assert.equal(error.code, 'TAGGED_TOOL_CALL_INVALID');
                        assert.equal(error.rawAssistantMessage.content, content);
                        return true;
                    });
                    assert.equal(requests, before + 1);
                }
            });
        }
    }
});

test('structured text fragments retain exact JSON bytes and native calls remain authoritative', async () => {
    const adapter = new OpenAICompatibleAdapter({ apiKey: 'unused', model: 'compat-test', toolMode: 'tagged-json' });
    const parts = [...readBlock].map(text => ({ type: 'text', text }));
    for (const streaming of [false, true]) {
        adapter.client.chat.completions.create = async () => streaming ? {
            async *[Symbol.asyncIterator]() {
                for (const part of parts) yield { choices: [{ delta: { content: [part] } }] };
            },
            finalChatCompletion: async () => ({ choices: [{ message: { role: 'assistant', content: parts }, finish_reason: 'stop' }] }),
        } : { choices: [{ message: { role: 'assistant', content: parts }, finish_reason: 'stop' }] };
        const result = await adapter.chat({ ...task, ...(streaming ? { onStreamProgress() {} } : {}) });
        assert.equal(result.toolCalls.length, 1);
        assert.deepEqual(JSON.parse(result.toolCalls[0].arguments), readCall.arguments);
    }
    adapter.client.chat.completions.create = async () => ({ choices: [{ message: {
        content: '<tool_call>{"name": ,"arguments":{}}</tool_call>',
        tool_calls: [{ id: 'native-1', type: 'function', function: { name: readCall.name, arguments: JSON.stringify(readCall.arguments) } }],
    }, finish_reason: 'tool_calls' }] });
    const result = await adapter.chat(task);
    assert.deepEqual(result.toolCalls.map(call => call.id), ['native-1']);
});

test('direct and hosted adapters separate reasoning and finalize batches without another request', async t => {
    for (const hosted of [false, true]) {
        for (const transport of ['non-stream', 'tagged-stream', 'native-stream']) {
            await t.test(`${hosted ? 'hosted' : 'direct'} ${transport}`, async () => {
                const streaming = transport !== 'non-stream';
                const reasoning = `Considering ${example}`;
                const parts = [
                    { type: 'thinking', text: reasoning },
                    { type: 'thinking', thinking: reasoning },
                    { type: 'reasoning', content: reasoning },
                    { type: 'reasoning_content', reasoning_content: reasoning },
                    { type: 'reasoning_text', text: reasoning },
                    { type: 'summary_text', text: reasoning },
                    { type: 'text', text: `Ready.\n${wrap(JSON.stringify(inputs))}` },
                ];
                const message = { role: 'assistant', content: parts, reasoning_content: reasoning };
                let requests = 0;
                const events = () => parts.map(part => ({ choices: [{ delta: { content: [part] } }] }));
                const response = () => ({ choices: [{ message, finish_reason: 'stop' }] });
                const config = { apiKey: 'test-key', model: 'compat-test', toolMode: transport === 'native-stream' ? 'native' : 'tagged-json' };
                const adapter = hosted ? new SillyTavernOpenAICompatibleAdapter(config, {
                    buildHostChatCompletionGenerateRequest() { return {}; },
                    async createHostChatCompletion() { requests += 1; return response(); },
                    async streamHostChatCompletion(_payload, onEvent) {
                        requests += 1;
                        for (const event of events()) onEvent(event);
                    },
                }) : new OpenAICompatibleAdapter(config);
                if (!hosted) adapter.client.chat.completions.create = async () => {
                    requests += 1;
                    return streaming ? { async *[Symbol.asyncIterator]() { yield* events(); } } : response();
                };
                const progress = [];
                const originalFetch = globalThis.fetch;
                if (!hosted && transport === 'native-stream') globalThis.fetch = async () => {
                    requests += 1;
                    return new Response(events().map(event => `data: ${JSON.stringify(event)}\n\n`).join('') + 'data: [DONE]\n\n');
                };
                let result;
                try {
                    result = await adapter.chat({
                        ...task, captureRawAssistantMessage: true,
                        ...(streaming ? { onStreamProgress: value => progress.push(value) } : {}),
                    });
                } finally {
                    globalThis.fetch = originalFetch;
                }
                assert.equal(requests, 1);
                assert.deepEqual(result.toolCalls, expected);
                assert.equal(result.text, 'Ready.');
                assert.ok(result.thoughts.length >= 6);
                assert.ok(result.thoughts.every(thought => thought.text === reasoning));
                assert.deepEqual(result.rawAssistantMessage.content, parts);
                assert.deepEqual(replay(result), expected);
                assert.ok(progress.every(snapshot => !snapshot.text.includes('Delete')));
                assert.ok(progress.every(snapshot => (snapshot.toolCalls || []).every(call => call.name !== 'Delete')));
            });
        }
    }
});
