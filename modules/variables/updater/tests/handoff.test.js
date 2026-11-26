import assert from 'node:assert/strict';
import test from 'node:test';
import * as agentCore from '../../../agent-core/browser-entry.js';
import { createPublicAgentApi } from '../../../agent-core/public-api.js';
import { scanAssistantText, decodeTextToolCalls } from '../../../agent-core/adapters/text-tool-protocol.js';
import { APPROVAL, buildUpdateTask, GUIDE_RESULT, HANDOFF, MANUSCRIPT_RESULT, REQUIREMENTS_RESULT, WORK_REQUIREMENTS } from '../handoff.js';
import { parseSubmission } from '../transport.js';
import { getStateInputSchema } from '../../state2/json-input.js';

// Protocol/cost contract: four supplied tool exchanges survive the real Agent
// adapters with payloads mounted in tool descriptions; exactly one model request returns write.
const material = { context: { target: { floor: 4, swipeId: 1 }, messages: [{ role: 'assistant', content: 'Offline passage' }] },
    state: { values: { HP: 80 }, constraints: {} } };
const submitted = { ops: [{ op: 'inc', path: 'HP', delta: -5, old: 80, 理由: '本楼受伤' }] };
for (const [provider, toolMode] of [['openai-compatible', 'native'], ['openai-compatible', 'tagged-json'], ['google', 'native'], ['openai-responses', 'native']]) {
    test(`V5 handoff through ${provider}/${toolMode}`, async t => {
        const requests = [];
        t.mock.method(globalThis, 'fetch', async (input, init) => {
            const request = new Request(input, init);
            assert.equal(new URL(request.url).hostname, 'offline.invalid');
            requests.push(await request.json());
            const args = { state: provider === 'openai-responses' ? { ops: [] } : submitted };
            const body = provider === 'google'
                ? { candidates: [{ content: { role: 'model', parts: [{ functionCall: { name: HANDOFF.write, args } }] }, finishReason: 'STOP' }] }
                : provider === 'openai-responses' ? { id: 'resp_offline', status: 'completed', output: [
                    { type: 'function_call', id: 'fc_result', call_id: 'result', name: HANDOFF.write, arguments: JSON.stringify(args) },
                ] }
                : { choices: [{ message: { role: 'assistant', content: toolMode === 'tagged-json'
                    ? `<tool_call>${JSON.stringify({ name: HANDOFF.write, arguments: args })}</tool_call>` : '',
                ...(toolMode === 'native' ? { tool_calls: [{ id: 'result', type: 'function', function: {
                    name: HANDOFF.write, arguments: JSON.stringify(args),
                } }] } : {}) }, finish_reason: toolMode === 'native' ? 'tool_calls' : 'stop' }] };
            return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
        });
        const config = { provider, model: 'offline-model', apiKey: 'offline-fixture',
            baseUrl: 'https://offline.invalid', toolMode, maxTokens: 256 };
        const settings = agentCore.normalizeAgentSettings({ currentPresetName: 'offline', presets: { offline: config },
            delegateConfigured: true, delegateConfig: config });
        const { api } = createPublicAgentApi({ isEnabled: () => true, loadSettings: () => settings, loadCore: () => agentCore });
        for (const source of ['main', 'delegate']) {
            const session = await api.openSession({ api: source });
            try {
                const task = buildUpdateTask(material, getStateInputSchema());
                assert.equal(task.toolChoice, 'auto');
                assert.deepEqual(task.tools.map(tool => tool.function.name),
                    [HANDOFF.manuscript, HANDOFF.guide, HANDOFF.requirements, HANDOFF.approval, HANDOFF.write]);
                assert.ok(task.tools[0].function.description.endsWith(JSON.stringify(material.context)));
                assert.ok(task.tools[1].function.description.endsWith(JSON.stringify(material.state)));
                assert.ok(task.tools[2].function.description.endsWith(WORK_REQUIREMENTS));
                const before = structuredClone(task);
                const response = await session.chat(task);
                assert.deepEqual(parseSubmission(response), provider === 'openai-responses' ? { ops: [] } : submitted);
                assert.throws(() => parseSubmission({ ...response, completion: 'incomplete' }));
                assert.throws(() => parseSubmission({ ...response, truncated: true }));
                assert.deepEqual(task, before);
                const sent = requests.at(-1);
                const names = [HANDOFF.manuscript, HANDOFF.guide, HANDOFF.requirements, HANDOFF.approval];
                if (provider === 'google') {
                    assert.equal(sent.toolConfig.functionCallingConfig.mode, 'AUTO');
                    const calls = sent.contents.flatMap(message => message.parts).filter(part => part.functionCall);
                    assert.deepEqual(calls.map(part => part.functionCall.name), names);
                    assert.ok(calls.every(part => part.thoughtSignature === 'skip_thought_signature_validator'));
                    assert.deepEqual(sent.contents.flatMap(message => message.parts).filter(part => part.functionResponse)
                        .map(part => part.functionResponse.response), [
                        { status: MANUSCRIPT_RESULT },
                        { status: GUIDE_RESULT },
                        { status: REQUIREMENTS_RESULT },
                        { approval: APPROVAL },
                    ]);
                } else if (provider === 'openai-responses') {
                    assert.equal(response.finishReason, 'completed');
                    const calls = sent.input.filter(item => item.type === 'function_call');
                    assert.deepEqual(calls.map(call => call.name), names);
                    assert.deepEqual(sent.input.filter(item => item.type === 'function_call_output').map(item => item.call_id), calls.map(call => call.call_id));
                    assert.equal(sent.tool_choice, 'auto');
                } else if (toolMode === 'native') {
                    const calls = sent.messages.flatMap(message => message.tool_calls || []);
                    assert.deepEqual(calls.map(call => call.function.name), names);
                    assert.deepEqual(sent.messages.filter(message => message.role === 'tool').map(message => message.tool_call_id), calls.map(call => call.id));
                    assert.equal(sent.tool_choice, 'auto');
                } else {
                    assert.ok(sent.messages.every(message => !message.tool_calls && message.role !== 'tool'));
                    assert.equal(sent.tools, undefined);
                    assert.equal(sent.tool_choice, undefined);
                    const calls = sent.messages.filter(message => message.role === 'assistant').flatMap(message =>
                        decodeTextToolCalls(scanAssistantText(message.content)));
                    assert.deepEqual(calls.map(call => call.name), names);
                }
            } finally { session.dispose(); }
        }
        assert.equal(requests.length, 2);
    });
}
