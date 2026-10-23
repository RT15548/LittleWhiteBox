import assert from 'node:assert/strict';
import test from 'node:test';
import { OpenAIResponsesAdapter } from '../../../agent-core/adapters/openai-responses.js';
import { OpenAICompatibleAdapter } from '../../../agent-core/adapters/openai-compatible.js';
import { buildAnthropicMessages } from '../../../agent-core/adapters/anthropic.js';
import { beginDrawScenePlannerDiagnostic, callDrawScenePlannerAgentRuntime } from '../draw-agent-runtime.js';
import { prepareScenePlannerInput } from '../scene-planner.js';
import { executePreparedScenePlanner } from '../scene-planner-executor.js';
import { ScenePlannerError } from '../scene-plan-contract.js';
import { addBlock, createCustomBlock, createDefaultLayout } from '../scene-planner-layout.js';
import { createInProcessToolHost } from './helpers/in-process-tool-host.js';

// Acceptance contracts:
// - Mixed calls receive one result per call during correction; skipped tools never execute (protocol failure / repeated paid requests).
// - Retries retain tool records with the matching global attempt and total count, including stealth calls (invisible execution history).
const note = { name: 'note', parameters: { type: 'object', properties: {} } };
const toolCall = (name, id, args = {}) => ({ name, id, arguments: JSON.stringify(args) });
const plan = { images: [{ insert_after: 1, scene: 'opening door', characters: [] }] };

for (const provider of ['google', 'openai-responses', 'openai-compatible', 'anthropic']) {
    test(`${provider}: mixed calls retain both receipts when the submitted plan needs correction`, async () => {
        const tasks = [];
        const invoked = [];
        const mixed = [toolCall('note', 'n1'), toolCall('submit_scene_plan', 's1', { images: [] })];
        const output = mixed.map(call => ({ type: 'function_call', id: `fc-${call.id}`, call_id: call.id,
            name: call.name, arguments: call.arguments, status: 'completed' }));
        const diagnostic = beginDrawScenePlannerDiagnostic();
        await callDrawScenePlannerAgentRuntime({
            diagnostic,
            providerConfig: { provider, model: 'offline-model' },
            task: { messages: [{ role: 'user', content: 'A opens a door.' }],
                tools: [{ function: { name: 'submit_scene_plan' } }, { function: note }] },
            customTools: [note],
            customToolHost: { invoke: async name => { invoked.push(name); return '{}'; } },
            agentCore: { createAgentAdapter: () => ({
                supportsSessionToolLoop: provider === 'google',
                chat: async task => {
                    tasks.push(structuredClone(task));
                    return tasks.length === 1
                        ? { toolCalls: mixed, providerPayload: { openAIResponseOutput: output } }
                        : { toolCalls: [toolCall('submit_scene_plan', 's2', plan)] };
                },
            }) },
            validateResult: (result, { attempt }) => {
                assert.deepEqual(result.toolCalls.map(call => call.name), ['submit_scene_plan']);
                if (attempt === 1) throw new ScenePlannerError('No images', 'NO_IMAGE_TASKS');
                return {};
            },
        });
        assert.deepEqual(invoked, []);
        assert.equal(tasks.length, 2);
        assert.deepEqual(JSON.parse(diagnostic.snapshot().validationFailures[0].modelOutput).toolCalls.map(call => call.name), ['note', 'submit_scene_plan']);
        if (provider === 'google') {
            assert.deepEqual(tasks[1].toolResponses.map(call => call.id), ['n1', 's1']);
            assert.equal(tasks[1].toolResponses[0].response.skipped, true);
            assert.equal(tasks[1].toolResponses[1].response.ok, false);
        } else {
            let calls;
            let receipts;
            const config = { provider, model: 'offline-model', apiKey: 'fixture' };
            if (provider === 'openai-responses') {
                const wire = new OpenAIResponsesAdapter(config).buildRequestBody(tasks[1]);
                calls = wire.input.filter(item => item.type === 'function_call').map(item => item.call_id);
                receipts = wire.input.filter(item => item.type === 'function_call_output').map(item => ({ id: item.call_id, result: JSON.parse(item.output) }));
            } else if (provider === 'anthropic') {
                const blocks = buildAnthropicMessages(tasks[1].messages).flatMap(message => message.content);
                calls = blocks.filter(item => item.type === 'tool_use').map(item => item.id);
                receipts = blocks.filter(item => item.type === 'tool_result').map(item => ({ id: item.tool_use_id, result: JSON.parse(item.content) }));
            } else {
                const wire = new OpenAICompatibleAdapter(config).buildRequestBody(tasks[1]);
                calls = wire.messages.flatMap(message => message.tool_calls || []).map(item => item.id);
                receipts = wire.messages.filter(message => message.role === 'tool').map(item => ({ id: item.tool_call_id, result: JSON.parse(item.content) }));
            }
            assert.deepEqual(calls, ['n1', 's1']);
            assert.deepEqual(receipts.map(item => item.id), calls);
            assert.equal(receipts[0].result.skipped, true);
            assert.equal(receipts[1].result.ok, false);
        }
    });
}

for (const stealth of [false, true]) {
    for (const invokeOnRetry of [false, true]) {
        test(`retry history retains prior tool calls, stealth=${stealth}, call on retry=${invokeOnRetry}`, async t => {
            const host = createInProcessToolHost();
            t.after(() => host.dispose());
            const code = `let n=0; return {name:'note',parameters:{type:'object',properties:{}},stealth:${stealth},action(){return {n:++n}}};`;
            const layout = addBlock(createDefaultLayout(), createCustomBlock({ tool: { code } }));
            const prepared = await prepareScenePlannerInput({
                messageText: 'A opens a door.', customPrompts: { layout }, customToolHost: host, keepCustomToolHost: true,
                expansionOptions: { runtime: { substituteParams: text => text } },
                agentOptions: { providerConfig: { provider: 'openai-compatible', model: 'offline-model' } },
                plannerRetry: { maxRetries: 2, baseDelayMs: 1 },
            });
            let run = 0;
            const diagnostic = beginDrawScenePlannerDiagnostic();
            const result = await executePreparedScenePlanner(prepared, {
                diagnostic, customToolHost: host, sleep: async () => {},
                agentCore: { createAgentAdapter: () => {
                    const index = run++;
                    let request = 0;
                    return { chat: async () => {
                        if (request++ === 0 && (index === 0 || invokeOnRetry)) return { toolCalls: [toolCall('note', 'n')] };
                        if (index < 2) throw new Error('Temporary offline provider failure');
                        return { toolCalls: [toolCall('submit_scene_plan', 's', plan)] };
                    } };
                } },
            });
            assert.equal(result.length, 1);
            const record = diagnostic.snapshot();
            const count = invokeOnRetry ? 3 : 1;
            assert.equal(host.calls.length, count);
            assert.equal(record.customToolCallCount, count);
            assert.deepEqual(record.customToolCalls.map(call => call.attempt), stealth ? [] : invokeOnRetry ? [1, 3, 5] : [1]);
            assert.deepEqual(record.customToolCalls.map(call => JSON.parse(call.result).n), stealth ? [] : invokeOnRetry ? [1, 2, 3] : [1]);
            assert.deepEqual(record.customToolCalls.map(call => call.retry ?? 0), stealth ? [] : invokeOnRetry ? [0, 1, 2] : [0]);
            assert.equal(record.attempts.length, invokeOnRetry ? 6 : 4);
        });
    }
}
