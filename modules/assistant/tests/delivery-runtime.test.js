import assert from 'node:assert/strict';
import test from 'node:test';
import { GoogleAdapter } from '../../agent-core/adapters/google.js';
import { OpenAICompatibleAdapter } from '../../agent-core/adapters/openai-compatible.js';
import { SillyTavernOpenAICompatibleAdapter } from '../../agent-core/adapters/sillytavern-openai-compatible.js';
import { createHostChatCompletionsClient } from '../../../shared/host-llm/chat-completions/client.js';
import { createAssistantRuntime } from '../app-src/runtime.js';
import { estimateConversationTokens } from '../../agent-core/runtime/context-tokens.js';
import { buildProviderMessagesFromHistory } from '../../agent-core/runtime/protocol.js';
import { deliveredText } from '../plugins/delivery/history.js';
import { selectCompactionRange } from '../app-src/runtime/compaction-range.js';
import { APPROVAL_RESULT, createResponseDelivery, DEFAULT_REQUIREMENTS, DELIVERY_CHECKLIST, DELIVERY_FINAL_STEP, READ_RESULT, TOOL_APPROVAL, TOOL_DELIVER, TOOL_READ } from '../plugins/delivery/protocol.js';
import { SILENT_EFFORT } from '../shared/direct-output.js';

const deliveryTools = [TOOL_READ, TOOL_APPROVAL, TOOL_DELIVER];
const makeCall = (id, body) => ({ id, name: TOOL_DELIVER, arguments: JSON.stringify({ body }) });
const ordinaryReply = { text: 'Ordinary reply', toolCalls: [] };
const systemInstructions = 'Assistant system instructions.';

function harness(t, options = {}) {
    t.mock.method(console, 'info', () => {});
    const run = { id: 'delivery-test', controller: new AbortController(), deliverySettings: options.settings };
    const user = { role: 'user', content: 'Answer the question.' };
    const state = { activeRun: run, compactions: [], messages: [user], config: { permissionMode: 'default' },
        archivedSkillIds: options.delegateSteps ? ['builtin-planning'] : [] };
    const requests = [], delegateRequests = [], saved = [];
    const delegateConfig = options.delegateSteps ? { provider: 'google', model: 'delegate-fixture' } : undefined;
    let id = 0;
    const runtime = createAssistantRuntime({
        state, pendingToolCalls: new Map(), pendingApprovals: new Map(),
        render() {}, persistSession() { saved.push(structuredClone(state.messages)); },
        createRequestId: prefix => `${prefix}-${++id}`, safeJsonParse: JSON.parse,
        normalizeAttachments: () => [], normalizeThoughtBlocks: () => [],
        normalizeSlashSkillTrigger: value => value,
        buildUserContentParts: message => message.content,
        getActiveProviderConfig: () => options.provider ?? { provider: 'google', model: 'fixture' },
        getToolDefinitions: ({ role }) => delegateConfig && role === 'main' ? [{ function: { name: 'DelegateRun' } }] : [],
        getDelegateProviderConfig: () => delegateConfig,
        isJsApiEnabled: () => false,
        SYSTEM_PROMPT: systemInstructions, MAX_CONTEXT_TOKENS: 100000, SUMMARY_TRIGGER_TOKENS: 90000,
        TOOL_NAMES: { RUN_JAVASCRIPT_API: 'RunJavaScriptApi', RUN_SLASH_COMMAND: 'RunSlashCommand', DELEGATE_RUN: 'DelegateRun' },
        createAdapter: config => config !== delegateConfig && options.adapter ? options.adapter : ({ supportsSessionToolLoop: options.session !== false, async chat(task) {
            const queue = config === delegateConfig ? delegateRequests : requests;
            const steps = config === delegateConfig ? options.delegateSteps : options.steps;
            const step = steps[queue.length];
            queue.push(task);
            assert.ok(step, 'Unexpected extra model request');
            return typeof step === 'function' ? step(task) : step;
        } }),
        post() { assert.fail('Local delivery must not dispatch to the host'); },
    });
    return { runtime, run, state, requests, delegateRequests, saved, start: () => runtime.runAssistantLoop(run) };
}

const receipts = (messages, name) => messages.filter(message => message.role === 'tool' && message.toolName === name)
    .map(message => JSON.parse(message.content));
const toolNames = task => task.tools.map(tool => tool.function.name);

// Contracts (cache loss / changed history): the two choices are independent;
// only a new native turn draws them, and subsequent requests replay the saved text.
test('native preparation exposes all 100 independent pairs without changing the request instructions', t => {
    const draws = [];
    t.mock.method(Math, 'random', () => {
        assert.ok(draws.length, 'Only creating the turn prelude may draw a line');
        return draws.shift();
    });
    const readLines = new Set(), approvalLines = new Set(), pairs = new Set();
    const readByIndex = new Map(), approvalByIndex = new Map();
    let instructions;
    for (let read = 0; read < 10; read++) for (let approval = 0; approval < 10; approval++) {
        const delivery = createResponseDelivery({ enabled: true }, { provider: 'google' });
        const requestInstructions = JSON.stringify([delivery.systemPrefix, delivery.instructions, delivery.definitions]);
        instructions ??= requestInstructions;
        assert.equal(requestInstructions, instructions);
        draws.push((read + 0.5) / 10, (approval + 0.5) / 10);
        const prelude = delivery.createPrelude();
        assert.equal(draws.length, 0);
        assert.deepEqual(prelude.map(item => item.name), [TOOL_READ, TOOL_APPROVAL]);
        const [first, second] = prelude.map(item => item.content);
        assert.ok(typeof first === 'string' && first.length > 0);
        assert.ok(typeof second === 'string' && second.length > 0);
        if (readByIndex.has(read)) assert.equal(first, readByIndex.get(read));
        if (approvalByIndex.has(approval)) assert.equal(second, approvalByIndex.get(approval));
        readByIndex.set(read, first); approvalByIndex.set(approval, second);
        readLines.add(first); approvalLines.add(second); pairs.add(JSON.stringify([first, second]));
    }
    assert.equal(readLines.size, 10); assert.equal(approvalLines.size, 10); assert.equal(pairs.size, 100);
    assert.equal(createResponseDelivery({ enabled: false }, { provider: 'google' }), null);
    assert.equal(createResponseDelivery({ enabled: true }, { provider: 'openai-compatible', toolMode: 'tagged-json' }).createPrelude, null);
});

for (const session of [false, true]) test(`meter updates, tool continuation and later turns reuse saved preparation; session: ${session}`, async t => {
    const draws = [0.05, 0.95];
    t.mock.method(Math, 'random', () => {
        assert.ok(draws.length, 'Stored preparation must be reused');
        return draws.shift();
    });
    const h = harness(t, { session, settings: { enabled: true }, steps: [task => {
        assert.deepEqual(task.messages.slice(-4), buildProviderMessagesFromHistory(h.saved.at(-1)).slice(-4));
        assert.equal(draws.length, 0);
        h.runtime.updateDisplayContextStats({ enabled: true });
        return { text: '', toolCallsAreNative: true, toolCalls: [makeCall('invalid', ' ')] };
    }, ordinaryReply, ordinaryReply] });
    h.runtime.updateDisplayContextStats({ enabled: true });
    assert.equal(draws.length, 2, 'An estimate does not create a new turn');
    await h.start();
    assert.equal(h.requests.length, 2);
    const history = structuredClone(h.state.messages);
    const firstPrelude = buildProviderMessagesFromHistory(history).slice(1, 5);
    if (session) {
        assert.equal(h.requests[1].messages, undefined, 'Session continuation must not replay or rebuild the prefix');
        assert.equal(h.requests[1].toolResponses[0].id, 'invalid');
    } else {
        assert.deepEqual(h.requests[1].messages.filter(message => message.role !== 'system').slice(1, 5), firstPrelude);
    }

    draws.push(0.95, 0.05);
    h.state.messages.push({ role: 'user', content: 'Next question.' });
    await h.start();
    assert.equal(draws.length, 0);
    assert.deepEqual(h.state.messages.slice(0, history.length), history);
    const replay = h.requests[2].messages.filter(message => message.role !== 'system');
    assert.deepEqual(replay.slice(1, 5), firstPrelude);
    assert.notEqual(replay.at(-4).content, firstPrelude[0].content);
    assert.notEqual(replay.at(-2).content, firstPrelude[2].content);
});

test('enabled native delivery records local read and scoped acknowledgement, then commits only one final receipt', async t => {
    const requirements = 'Use short sections.';
    const body = '## Result\nAnswer.';
    const h = harness(t, { settings: { enabled: true, requirements }, steps: [task => {
        assert.equal(task.toolChoice, 'auto');
        assert.deepEqual(toolNames(task), deliveryTools);
        assert.ok(task.tools[0].function.description.endsWith(requirements));
        assert.ok(task.messages[0].content.startsWith(`${SILENT_EFFORT}\n\n`));
        assert.equal(task.messages.find(message => message.content === DELIVERY_CHECKLIST)?.role, 'system');
        assert.deepEqual(task.messages.filter(message => message.role === 'user').map(message => message.content), ['Answer the question.']);
        assert.deepEqual(receipts(task.messages, TOOL_READ), [{ ok: true, status: READ_RESULT }]);
        assert.deepEqual(receipts(task.messages, TOOL_APPROVAL), [{ ok: true, status: APPROVAL_RESULT }]);
        return { text: '', toolCallsAreNative: true, toolCalls: [makeCall('deliver', body), makeCall('repeat', 'No'), {
            id: 'js', name: 'RunJavaScriptApi', arguments: '{"code":"return 1"}',
        }] };
    }] });
    await h.start();
    assert.equal(h.requests.length, 1);
    const stored = h.saved.at(-1);
    assert.deepEqual(receipts(stored, TOOL_DELIVER), [{ ok: true }, { ok: false, error: 'reply_already_delivered' }]);
    assert.deepEqual(receipts(stored, 'RunJavaScriptApi').map(receipt => receipt.error), ['jsapi_permission_denied']);
    assert.equal(stored.some(message => message.role === 'assistant' && message.content === body), false);
    assert.equal(JSON.stringify(stored).includes(requirements), false);
});

test('invalid delivery can continue through the native tool session and fall back to ordinary text', async t => {
    const h = harness(t, { settings: { enabled: true }, steps: [{ text: '', toolCallsAreNative: true, toolCalls: [makeCall('invalid', ' ')] }, task => {
        assert.ok(task.tools[0].function.description.endsWith(DEFAULT_REQUIREMENTS));
        assert.deepEqual(task.toolResponses, [{ id: 'invalid', name: TOOL_DELIVER, response: { ok: false, error: 'reply_body_required' } }]);
        return ordinaryReply;
    }] });
    await h.start();
    assert.equal(h.state.messages.at(-1).content, ordinaryReply.text);
    assert.equal(receipts(h.state.messages, TOOL_READ).length, 1);
});

test('an empty post-tool response gets the delivery reminder without forcing tool choice', async t => {
    const h = harness(t, { settings: { enabled: true }, steps: [
        { text: '', toolCallsAreNative: true, toolCalls: [makeCall('invalid', ' ')] },
        { text: '', toolCalls: [] },
        task => {
            assert.equal(task.finalAnswerReminderText, DELIVERY_FINAL_STEP);
            assert.equal(task.toolChoice, 'auto');
            return ordinaryReply;
        },
    ] });
    await h.start();
    assert.equal(h.requests.length, 3);
    assert.equal(h.state.messages.at(-1).content, ordinaryReply.text);
});

test('disabled delivery rejects stale model calls locally in either transport', async t => {
    for (const options of [
        { settings: { enabled: false, requirements: 'Off' } },
        { settings: { enabled: false, requirements: 'Off' }, provider: { provider: 'openai-compatible', toolMode: 'tagged-json' } },
    ]) {
        const h = harness(t, { ...options, steps: [task => {
            assert.deepEqual(toolNames(task), []);
            assert.deepEqual(task.messages.map(message => message.role), ['system', 'user']);
            return { text: '', toolCalls: [makeCall('stale', 'Not delivered')] };
        }, ordinaryReply] });
        await h.start();
        assert.deepEqual(receipts(h.state.messages, TOOL_DELIVER), [{ ok: false, error: 'response_delivery_unavailable' }]);
        assert.equal(h.state.messages.at(-1).content, ordinaryReply.text);
    }
});

test('delegate cannot deliver the parent reply or see the parent delivery settings', async t => {
    const h = harness(t, { settings: { enabled: true, requirements: 'For the main reply only.' },
        steps: [{ text: '', toolCalls: [{ id: 'delegate', name: 'DelegateRun', arguments: '{"task":"Check the note."}' }] }, ordinaryReply],
        delegateSteps: [task => {
            assert.deepEqual(toolNames(task), []);
            assert.equal(task.messages.some(message => message.content === DELIVERY_CHECKLIST), false);
            return { text: '', toolCalls: [makeCall('forged', 'Not a main reply')] };
        }, task => {
            assert.equal(task.toolResponses[0].response.error, 'delegate_tool_not_available');
            return { text: 'Delegate answer', toolCalls: [] };
        }],
    });
    await h.start();
    assert.equal(h.delegateRequests.length, 2);
    assert.deepEqual(receipts(h.state.messages, TOOL_DELIVER), []);
    assert.equal(h.state.messages.at(-1).content, ordinaryReply.text);
});

function completionStream(delta, finishReason = 'tool_calls') {
    const chunk = { choices: [{ index: 0, delta: { role: 'assistant', ...delta }, finish_reason: finishReason }] };
    return new Response(`data: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`, {
        headers: { 'Content-Type': 'text/event-stream' },
    });
}

// Request contract (context/cost): one system prompt, with the delivery prefix first;
// tool continuation and a later user turn must preserve that ordering.
test('Google sends one prefixed system prompt through tool continuation and a new user turn', async t => {
    for (const enabled of [true, false]) {
        const provider = { provider: 'google', model: 'fixture', apiKey: 'offline', resolvedBaseUrl: 'https://offline.invalid/v1beta' };
        const requests = [];
        t.mock.method(globalThis, 'fetch', async (input, init) => {
            const request = new Request(input, init);
            assert.equal(new URL(request.url).hostname, 'offline.invalid');
            requests.push(await request.json());
            const part = requests.length === 1
                ? { functionCall: { name: TOOL_DELIVER, args: { body: ' ' } } }
                : { text: 'Done' };
            return new Response(`data: ${JSON.stringify({ candidates: [{ content: { role: 'model', parts: [part] }, finishReason: 'STOP' }] })}\n\n`, {
                headers: { 'Content-Type': 'text/event-stream' },
            });
        });
        const h = harness(t, { settings: { enabled }, provider, adapter: new GoogleAdapter(provider) });
        await h.start();
        assert.equal(requests.length, 2);
        assert.ok(requests[1].contents.at(-1).parts.some(part => part.functionResponse));
        h.state.messages.push({ role: 'user', content: 'Next question.' });
        await h.start();
        assert.equal(requests.length, 3);
        const expected = enabled ? `${SILENT_EFFORT}\n\n${systemInstructions}` : systemInstructions;
        for (const request of requests) {
            const system = request.systemInstruction.parts.map(part => part.text).join('\n\n');
            assert.ok(system.startsWith(expected));
            assert.equal(system.split(systemInstructions).length - 1, 1);
        }
        assert.equal(h.state.messages.at(-1).content, 'Done');
    }
});

function textCall(name, args) {
    return `<tool_call>${JSON.stringify({ name, arguments: args })}</tool_call>`;
}

const nativeDelivery = {
    index: 0,
    id: 'call-native-delivery',
    type: 'function',
    function: { name: TOOL_DELIVER, arguments: '{ "body": "Native reply" }' },
    extra_content: { google: { thought_signature: 'gemini-signature' } },
};

test('native and tagged deliveries finish once and replay one copy of the body on the next request', async t => {
    const body = 'Reply-token-'.repeat(250);
    for (const toolMode of ['native', 'tagged-json']) {
        const provider = { provider: 'openai-compatible', toolMode, model: 'fixture', apiKey: 'fixture' };
        const adapter = new OpenAICompatibleAdapter(provider);
        const requests = [];
        t.mock.method(globalThis, 'fetch', async (_url, init) => {
            requests.push(JSON.parse(init.body));
            if (requests.length === 2) return completionStream({ content: 'Follow-up' }, 'stop');
            assert.equal(requests.length, 1);
            const system = requests[0].messages[0].content;
            assert.ok(system.startsWith(toolMode === 'native' ? `${SILENT_EFFORT}\n\n${systemInstructions}` : systemInstructions));
            assert.equal(system.split(systemInstructions).length - 1, 1);
            return completionStream(toolMode === 'native'
                ? { tool_calls: [{ ...nativeDelivery, function: { name: TOOL_DELIVER, arguments: JSON.stringify({ body }) } }] }
                : { content: textCall(TOOL_DELIVER, { body }) });
        });
        const h = harness(t, { settings: { enabled: true, requirements: 'Keep replies brief.' }, provider, adapter });
        await h.start();
        assert.deepEqual(receipts(h.state.messages, TOOL_DELIVER), [{ ok: true }]);
        assert.equal(deliveredText(h.state.messages, h.state.messages.length - 1), body);
        await adapter.chat({ messages: [...buildProviderMessagesFromHistory(h.state.messages), { role: 'user', content: 'Next?' }], tools: h.run.requestContext.requestTools, onStreamProgress() {} });
        assert.equal(JSON.stringify(requests[1].messages).split(body).length - 1, 1);
        if (toolMode === 'native') {
            const stored = h.state.messages.findLast(m => m.role === 'assistant').providerPayload.openaiCompatibleMessage.tool_calls[0];
            assert.deepEqual(stored.extra_content, nativeDelivery.extra_content);
        }
    }
});

test('SillyTavern tagged retry can deliver immediately without changing ordinary tool permissions', async t => {
    for (const taggedDelta of [
        { content: textCall(TOOL_DELIVER, { body: 'Tagged body' }) + textCall('RunJavaScriptApi', { code: 'return 1' }) },
        { tool_calls: [nativeDelivery] }, // Structured fields on the fallback response do not change the request's protocol.
    ]) {
        const provider = { provider: 'sillytavern-openai-compatible', model: 'fixture', toolMode: 'native' };
        const requests = [];
        const host = createHostChatCompletionsClient({ requestHeadersProvider: () => ({}), fetch: async (_url, options) => {
            requests.push(JSON.parse(options.body));
            const system = requests.at(-1).messages[0].content;
            assert.ok(system.startsWith(`${SILENT_EFFORT}\n\n${systemInstructions}`));
            assert.equal(system.split(systemInstructions).length - 1, 1);
            if (requests.length === 1) return Response.json({ error: { message: "Cannot read properties of null (reading 'function')" } }, { status: 500 });
            assert.equal(requests.length, 2);
            return completionStream(taggedDelta);
        } });
        const h = harness(t, { settings: { enabled: true }, provider, adapter: new SillyTavernOpenAICompatibleAdapter(provider, host) });
        await h.start();
        assert.equal(requests.length, 2);
        assert.ok(requests[0].tools.some(tool => tool.function.name === TOOL_DELIVER));
        assert.equal(Object.hasOwn(requests[1], 'tools'), false);
        const preparation = h.state.messages.filter(message => message.toolCalls?.some(call => [TOOL_READ, TOOL_APPROVAL].includes(call.name)));
        assert.equal(preparation.length, 2);
        for (const { content } of preparation) {
            assert.ok(requests[0].messages.some(message => message.content === content));
            assert.ok(requests[1].messages.some(message => typeof message.content === 'string' && message.content.startsWith(content)), 'Fallback must retain the sampled prose');
        }
        assert.deepEqual(receipts(h.state.messages, TOOL_DELIVER), [{ ok: true }]);
        if (taggedDelta.content) assert.deepEqual(receipts(h.state.messages, 'RunJavaScriptApi').map(receipt => receipt.error), ['jsapi_permission_denied']);
    }
});

test('the meter includes the same custom requirements and tools as preflight and keeps in-flight settings', async t => {
    for (const toolMode of ['native', 'tagged-json']) {
        const provider = { provider: 'openai-compatible', toolMode };
        const settings = { enabled: true, requirements: 'Short paragraphs. '.repeat(1200) };
        const h = harness(t, { provider, settings, steps: [task => {
            const expected = estimateConversationTokens({ messages: task.messages, tools: task.tools, providerConfig: provider });
            assert.equal(h.state.contextStats.usedTokens, expected);
            assert.equal(h.runtime.updateDisplayContextStats({ enabled: false }), expected);
            return ordinaryReply;
        }] });
        await h.start();
        h.state.activeRun = null;
        const without = h.runtime.updateDisplayContextStats({ enabled: false });
        assert.ok(h.runtime.updateDisplayContextStats(settings) > without + 5000);
    }
});

test('compaction preserves each pinned prelude call and result even when no tool exchanges fit the tail budget', () => {
    const prior = { role: 'user' }, request = { role: 'user' };
    const prelude = [{ role: 'assistant' }, { role: 'tool' }, { role: 'assistant' }, { role: 'tool' }];
    const work = [{ role: 'assistant' }, { role: 'tool' }];
    const context = [prior, request, ...prelude, ...work];
    const { archived, retained } = selectCompactionRange(context, context.map(() => 100), 1000, 0, prelude);
    assert.deepEqual(archived, [prior, ...work]);
    assert.deepEqual(retained, [request, ...prelude]);
});
