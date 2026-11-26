import assert from 'node:assert/strict';
import test from 'node:test';

import { MAX_CUSTOM_TOOL_CALLS, normalizeToolDefinition, toFunctionTool } from '../custom-tools.js';
import { callDrawScenePlannerAgentRuntime } from '../draw-agent-runtime.js';
import { parseSubmittedScenePlan, SUBMIT_SCENE_PLAN_TOOL_NAME } from '../scene-plan-contract.js';
import { createSubmitScenePlanTool } from '../scene-plan-tool.js';
import {
    createScenePlannerHandoffTools,
    scenePlannerHandoffReceipt,
    SCENE_PLANNER_HANDOFF_NAMES,
} from '../scene-planner-handoff.js';

const [materials, guide, requirements, approval] = SCENE_PLANNER_HANDOFF_NAMES;
const MATERIALS = 'Story reference: a lantern on the pier.';
const NOTE = normalizeToolDefinition({ name: 'note' });
const submitTool = createSubmitScenePlanTool();
const submit = (id = 'submit', args = { images: [{ insert_after: 1, scene: 'A lantern on the pier', characters: [] }] }) => (
    call(id, SUBMIT_SCENE_PLAN_TOOL_NAME, args)
);
const call = (id, name, args = {}) => ({ id, name, arguments: JSON.stringify(args), providerId: '' });

function setupRuntime({ replies = [], sessionLoop, custom = false, host = true, handoffTools = createScenePlannerHandoffTools({ documents: { content: MATERIALS } }) }) {
    const requests = [];
    const invocations = [];
    const tools = [submitTool, ...handoffTools, ...(custom ? [toFunctionTool(NOTE)] : [])];
    const run = () => callDrawScenePlannerAgentRuntime({
        task: { messages: [{ role: 'user', content: MATERIALS }], tools },
        providerConfig: { provider: 'google' },
        agentCore: {
            createAgentAdapter: () => ({
                supportsSessionToolLoop: sessionLoop,
                chat: async (task) => {
                    const toolCalls = replies[requests.length];
                    requests.push(structuredClone({ ...task, signal: undefined }));
                    assert.ok(toolCalls);
                    return { toolCalls };
                },
            }),
        },
        customTools: custom ? [NOTE] : [],
        ...(custom && host ? { customToolHost: { async invoke(name, args) {
            invocations.push({ name, args });
            return JSON.stringify({ ok: true });
        } } } : {}),
        validateResult: result => parseSubmittedScenePlan(result, { sceneSource: { points: [{ number: 1, offset: 15 }] } }),
    });
    return { run, requests, invocations, tools };
}

function readResponses(request, sessionLoop, ids) {
    if (sessionLoop) {
        assert.equal(Object.hasOwn(request, 'messages'), false);
        assert.deepEqual(request.toolResponses.map(({ id, providerId }) => ({ id, providerId })), ids.map(id => ({ id, providerId: '' })));
        return request.toolResponses.map(({ response }) => response);
    }
    assert.equal(Object.hasOwn(request, 'toolResponses'), false);
    const messages = request.messages.slice(-ids.length - 1);
    assert.deepEqual(messages[0].tool_calls.map(({ id }) => id), ids);
    assert.deepEqual(messages.slice(1).map(({ role, tool_call_id }) => [role, tool_call_id]), ids.map(id => ['tool', id]));
    return messages.slice(1).map(({ content }) => JSON.parse(content));
}

for (const sessionLoop of [true, false]) {
    const mode = sessionLoop ? 'session loop' : 'message replay';

    test(`${mode}: all four registered handoffs repeat with receipt only and no host`, async () => {
        const calls = SCENE_PLANNER_HANDOFF_NAMES.map((name, index) => call(`handoff-${index}`, name));
        const { run, requests, tools } = setupRuntime({ sessionLoop, replies: [calls, [call('again', materials)], [submit()]] });
        const { parsed, diagnostic } = await run();
        assert.equal(parsed.tasks.length, 1);
        const responses = readResponses(requests[1], sessionLoop, calls.map(({ id }) => id));
        assert.deepEqual(responses, SCENE_PLANNER_HANDOFF_NAMES.map(scenePlannerHandoffReceipt));
        assert.equal(responses[3].approved, true);
        assert.ok(responses.every(response => !JSON.stringify(response).includes(MATERIALS)));
        assert.deepEqual(readResponses(requests[2], sessionLoop, ['again']), [scenePlannerHandoffReceipt(materials)]);
        const snapshot = diagnostic.snapshot();
        assert.equal(snapshot.toolsCount, tools.length);
        assert.equal(snapshot.correctionCount, 0);
        assert.equal(snapshot.customToolCallCount ?? 0, 0);
        assert.deepEqual(snapshot.customToolCalls ?? [], []);
    });

    test(`${mode}: local receipts share the five-call budget with custom tools`, async () => {
        const first = [call('read', materials), call('note', NOTE.name, { value: 1 })];
        const extraHandoffs = Array.from({ length: MAX_CUSTOM_TOOL_CALLS - first.length }, (_, index) => call(`guide-${index}`, guide));
        const { run, requests, invocations } = setupRuntime({
            custom: true,
            sessionLoop,
            replies: [first, extraHandoffs, [call('over-budget', NOTE.name)]],
        });
        await assert.rejects(run(), { code: 'CUSTOM_TOOL_LIMIT_EXCEEDED' });
        assert.deepEqual(invocations, [{ name: NOTE.name, args: { value: 1 } }]);
        assert.deepEqual(readResponses(requests[1], sessionLoop, ['read', 'note']), [scenePlannerHandoffReceipt(materials), { ok: true }]);
        assert.deepEqual(readResponses(requests[2], sessionLoop, extraHandoffs.map(({ id }) => id)), extraHandoffs.map(() => scenePlannerHandoffReceipt(guide)));
    });

    test(`${mode}: mixed submission validates only the submit call and replays a receipt on correction`, async () => {
        const failed = [call('approval', approval), call('note', NOTE.name), submit('bad-submit', { images: [] })];
        const next = [call('note-2', NOTE.name, { value: 2 }), call('requirements', requirements)];
        const success = [call('guide', guide), call('note-3', NOTE.name), submit()];
        const { run, requests, invocations, tools } = setupRuntime({ custom: true, sessionLoop, replies: [failed, next, success] });
        const { result, diagnostic } = await run();
        assert.deepEqual(result.toolCalls, [submit()]);
        const [receipt, skipped, correction] = readResponses(requests[1], sessionLoop, failed.map(({ id }) => id));
        assert.deepEqual(receipt, scenePlannerHandoffReceipt(approval));
        assert.equal(skipped.skipped, true);
        assert.equal(correction.error.code, 'NO_IMAGE_TASKS');
        assert.deepEqual(readResponses(requests[2], sessionLoop, next.map(({ id }) => id)), [{ ok: true }, scenePlannerHandoffReceipt(requirements)]);
        assert.deepEqual(invocations, [{ name: NOTE.name, args: { value: 2 } }]);
        const snapshot = diagnostic.snapshot();
        assert.equal(snapshot.toolsCount, tools.length);
        assert.equal(snapshot.customToolCallCount, 1);
        assert.deepEqual(snapshot.customToolCalls.map(({ name }) => name), [NOTE.name]);
    });
}

test('unknown calls still fail validation even alongside registered handoff and submit calls', async () => {
    const batch = [call('handoff', materials), call('unknown', 'unregistered'), submit()];
    const { run, requests, invocations } = setupRuntime({ replies: [batch, batch] });
    await assert.rejects(run(), { code: 'TOOL_CALL_MULTIPLE' });
    assert.equal(requests.length, 2);
    assert.deepEqual(invocations, []);
});

test('submit-only tasks work, but a handoff not registered in the task is an unknown tool', async () => {
    const submitOnly = setupRuntime({ handoffTools: [], replies: [[submit()]] });
    const { diagnostic } = await submitOnly.run();
    assert.equal(diagnostic.snapshot().toolsCount, 1);

    const handoffCall = [call('unregistered', materials)];
    const unregistered = setupRuntime({ handoffTools: [], replies: [handoffCall, handoffCall] });
    await assert.rejects(unregistered.run(), { code: 'TOOL_CALL_NAME_INVALID' });
    const [feedback] = readResponses(unregistered.requests[1], false, ['unregistered']);
    assert.notDeepEqual(feedback, scenePlannerHandoffReceipt(materials));
});

test('rejects partial, reordered, mispositioned or nonempty-parameter handoff tool tables before sending', async () => {
    const tools = createScenePlannerHandoffTools();
    const invalidSchema = structuredClone(tools);
    invalidSchema[0].function.parameters.properties.body = { type: 'string' };
    for (const handoffTools of [tools.slice(1), [...tools].reverse(), invalidSchema]) {
        const { run, requests } = setupRuntime({ handoffTools });
        await assert.rejects(run(), { code: 'TOOL_CONTRACT_INVALID' });
        assert.equal(requests.length, 0);
    }

    const misplaced = setupRuntime({ custom: true });
    misplaced.tools.splice(1, 0, misplaced.tools.pop());
    await assert.rejects(misplaced.run(), { code: 'TOOL_CONTRACT_INVALID' });
    assert.equal(misplaced.requests.length, 0);
});

test('handoff names are reserved and real custom tools still require a host', async () => {
    for (const name of SCENE_PLANNER_HANDOFF_NAMES) assert.throws(() => normalizeToolDefinition({ name }));
    const { run, requests } = setupRuntime({ custom: true, host: false });
    await assert.rejects(run(), { code: 'CUSTOM_TOOL_HOST_MISSING' });
    assert.equal(requests.length, 0);
});
