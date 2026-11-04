import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import * as drawRuntime from '../../node-entry.js';
import {
    beginDrawScenePlannerDiagnostic,
    callDrawScenePlannerAgentRuntime,
} from '../draw-agent-runtime.js';
import { createPreparedScenePlannerTask } from '../scene-planner-executor.js';
import {
    assertScenePlannerMessages,
    buildScenePlannerGoogleHistory,
    GOOGLE_SYNTHETIC_HISTORY_SIGNATURE,
} from '../scene-planner-messages.js';
import { createSubmitScenePlanTool } from '../scene-plan-tool.js';
import { createSceneSource } from '../scene-source.js';

const require = createRequire(import.meta.url);
const { createEnvelopeValidator } = require('../../server/draw-runs/envelope.js');

function call(id, name = 'read_scene_materials', args = '{}') {
    return { id, type: 'function', function: { name, arguments: args } };
}

function history(includeGoogleHistory = true) {
    return [
        { role: 'system', content: 'Image planning.' },
        { role: 'user', content: 'Prepare the image plan.' },
        { role: 'assistant', content: 'Read materials.', tool_calls: [call('materials')] },
        { role: 'tool', content: JSON.stringify({ content: 'A rainy street.' }), tool_call_id: 'materials' },
        { role: 'assistant', content: 'Read the guide.', tool_calls: [call('guide', 'read_drawing_guide')] },
        { role: 'tool', content: JSON.stringify({ content: 'One landscape image.' }), tool_call_id: 'guide' },
        { role: 'assistant', content: 'Request approval.', tool_calls: [call('approval', 'request_draw_approval')] },
        { role: 'tool', content: JSON.stringify({ approved: true }), tool_call_id: 'approval' },
    ].map(message => includeGoogleHistory && message.tool_calls
        ? { ...message, providerPayload: { googleContent: buildScenePlannerGoogleHistory(message) } }
        : message);
}

function prepared(messages = history()) {
    return {
        version: 1,
        planner: {
            prompt: { systemPrompt: '', messages },
            tool: createSubmitScenePlanTool(),
            validationContext: {
                sceneSource: createSceneSource('Rain fell.'),
                effectiveMaxImages: 1,
                maxPlanImages: 1,
                effectiveMaxCharactersPerImage: 1,
                centerMode: 'normalized',
            },
            presentCharacters: [],
        },
        agent: {
            channel: 'openai-compatible',
            providerConfig: {
                provider: 'openai-compatible', baseUrl: 'https://example.invalid/v1', model: 'fixture',
                maxTokens: 1000, timeoutMs: 5000, toolMode: 'native', reasoning: { mode: 'off' },
            },
        },
    };
}

function envelope(input = prepared()) {
    return {
        ...input,
        runId: 'run-prompt-history',
        sourceHash: input.planner.validationContext.sceneSource.sourceHash,
        imageProvider: 'sd-webui',
        generationRecipe: {
            host: 'https://example.invalid', auth: '', timeout: 5000, delayMs: 1000,
            params: {}, positivePrefix: '', negativePrefix: '', knownCharacters: [],
            promptOverride: '', negativePromptOverride: '',
        },
    };
}

const invalidChanges = [
    ['unsupported role', messages => { messages[0].role = 'developer'; }],
    ['non-string role', messages => { messages[0].role = ['system']; }],
    ['inherited role', messages => { messages[0].role = 'constructor'; }],
    ['unknown message field', messages => { messages[0].extra = true; }],
    ['empty content', messages => { messages[0].content = ' '; }],
    ['non-string content', messages => { messages[0].content = null; }],
    ['call on a user message', messages => { messages[1].tool_calls = [call('wrong')]; }],
    ['empty tool calls', messages => { messages[2].tool_calls = []; }],
    ['call id missing', messages => { delete messages[2].tool_calls[0].id; }],
    ['unknown call field', messages => { messages[2].tool_calls[0].extra = true; }],
    ['wrong call type', messages => { messages[2].tool_calls[0].type = 'other'; }],
    ['empty function name', messages => { messages[2].tool_calls[0].function.name = ''; }],
    ['unknown function field', messages => { messages[2].tool_calls[0].function.extra = true; }],
    ['malformed arguments', messages => { messages[2].tool_calls[0].function.arguments = '{'; }],
    ['object rather than serialized arguments', messages => { messages[2].tool_calls[0].function.arguments = {}; }],
    ['array arguments', messages => { messages[2].tool_calls[0].function.arguments = '[]'; }],
    ['null arguments', messages => { messages[2].tool_calls[0].function.arguments = 'null'; }],
    ['primitive arguments', messages => { messages[2].tool_calls[0].function.arguments = '1'; }],
    ['orphan result', messages => { messages[3].tool_call_id = 'other'; }],
    ['missing result id', messages => { delete messages[3].tool_call_id; }],
    ['unknown result field', messages => { messages[3].toolName = 'read_scene_materials'; }],
    ['missing result', messages => { messages.splice(3, 1); }],
    ['duplicate result', messages => { messages.splice(4, 0, { ...messages[3] }); }],
    ['duplicate call id', messages => { messages[4].tool_calls[0].id = 'materials'; messages[5].tool_call_id = 'materials'; }],
    ['unfinished last call', messages => { messages.pop(); }],
    ['no user', messages => { messages.splice(1, 1); }],
    ['metadata on a user message', messages => { messages[1].providerPayload = messages[2].providerPayload; }],
    ['metadata on a tool result', messages => { messages[3].providerPayload = messages[2].providerPayload; }],
    ['metadata on a plain assistant message', messages => { delete messages[2].tool_calls; messages.splice(3, 1); }],
    ['unknown provider metadata', messages => { messages[2].providerPayload.extra = true; }],
    ['alternative replay histories', messages => { messages[2].providerPayload.googleContents = []; }],
    ['missing Google replay', messages => { messages[2].providerPayload = {}; }],
    ['wrong Google role', messages => { messages[2].providerPayload.googleContent.role = 'user'; }],
    ['unknown Google field', messages => { messages[2].providerPayload.googleContent.extra = true; }],
    ['missing replay part', messages => { messages[2].providerPayload.googleContent.parts.pop(); }],
    ['extra replay part', messages => { messages[2].providerPayload.googleContent.parts.push({ text: 'other' }); }],
    ['reordered replay parts', messages => { messages[2].providerPayload.googleContent.parts.reverse(); }],
    ['changed replay text', messages => { messages[2].providerPayload.googleContent.parts[0].text = 'other'; }],
    ['unknown text part field', messages => { messages[2].providerPayload.googleContent.parts[0].extra = true; }],
    ['missing replay signature', messages => { delete messages[2].providerPayload.googleContent.parts[1].thoughtSignature; }],
    ['arbitrary replay signature', messages => { messages[2].providerPayload.googleContent.parts[1].thoughtSignature = 'other'; }],
    ['unknown call part field', messages => { messages[2].providerPayload.googleContent.parts[1].extra = true; }],
    ['changed replay call id', messages => { messages[2].providerPayload.googleContent.parts[1].functionCall.id = 'other'; }],
    ['changed replay call name', messages => { messages[2].providerPayload.googleContent.parts[1].functionCall.name = 'other'; }],
    ['changed replay arguments', messages => { messages[2].providerPayload.googleContent.parts[1].functionCall.args = { other: true }; }],
    ['unknown replay call field', messages => { messages[2].providerPayload.googleContent.parts[1].functionCall.extra = true; }],
];

test('prepared messages accept ordinary conversations and complete historical tool exchanges without mutation', () => {
    for (const messages of [
        [{ role: 'user', content: 'Plan.' }],
        [{ role: 'system', content: 'Plan.' }, { role: 'user', content: 'Task.' }, { role: 'assistant', content: 'Prefill.' }],
        history(),
        history(false),
    ]) {
        const original = structuredClone(messages);
        assert.equal(assertScenePlannerMessages(messages), messages);
        assert.deepEqual(messages, original);
    }
    const parallel = history().slice(0, 2);
    parallel.push(
        { role: 'assistant', content: 'Read both.', tool_calls: [call('a'), call('b')] },
        { role: 'tool', content: '{}', tool_call_id: 'b' },
        { role: 'tool', content: '{}', tool_call_id: 'a' },
    );
    assert.doesNotThrow(() => assertScenePlannerMessages(parallel));
    for (const messages of [null, {}, []]) assert.throws(() => assertScenePlannerMessages(messages), TypeError);
});

test('Google synthetic replay derives every call and accepts semantically identical object key order', () => {
    // These exact bytes are Google's external manual-history protocol marker.
    assert.equal(GOOGLE_SYNTHETIC_HISTORY_SIGNATURE, 'skip_thought_signature_validator');
    const message = {
        role: 'assistant', content: 'Read documents.',
        tool_calls: [call('a', 'read_scene_materials', '{"x":{"y":1},"z":[true,null,"tag"]}'), call('b')],
    };
    const googleContent = buildScenePlannerGoogleHistory(message);
    assert.deepEqual(googleContent, {
        role: 'model',
        parts: [
            { text: message.content },
            { functionCall: { id: 'a', name: 'read_scene_materials', args: { x: { y: 1 }, z: [true, null, 'tag'] } }, thoughtSignature: GOOGLE_SYNTHETIC_HISTORY_SIGNATURE },
            { functionCall: { id: 'b', name: 'read_scene_materials', args: {} }, thoughtSignature: GOOGLE_SYNTHETIC_HISTORY_SIGNATURE },
        ],
    });
    message.providerPayload = { googleContent };
    googleContent.parts[1].functionCall.args = { z: [true, null, 'tag'], x: { y: 1 } };
    assert.doesNotThrow(() => assertScenePlannerMessages([
        { role: 'user', content: 'Task.' }, message,
        { role: 'tool', content: '{}', tool_call_id: 'a' },
        { role: 'tool', content: '{}', tool_call_id: 'b' },
    ]));
});

for (const [reason, change] of invalidChanges) {
    test(`prepared messages reject ${reason}`, () => {
        const messages = history();
        change(messages);
        assert.throws(() => assertScenePlannerMessages(messages), TypeError);
    });
}

test('browser and backend reject an orphan tool result with their domain error codes', () => {
    const input = prepared();
    input.planner.prompt.messages[3].tool_call_id = 'unknown';
    assert.throws(() => createPreparedScenePlannerTask(input), { code: 'PREPARED_INPUT_INVALID' });
    assert.throws(() => createEnvelopeValidator(drawRuntime)(envelope(input)), { code: 'invalid_draw_run', status: 400 });
});

test('backend admission preserves serialized prompt history and retains the message count limit', () => {
    const input = JSON.parse(JSON.stringify(envelope()));
    const validate = createEnvelopeValidator(drawRuntime);
    const accepted = validate(input).envelope;
    assert.deepEqual(accepted.planner.prompt.messages, input.planner.prompt.messages);
    const task = createPreparedScenePlannerTask({ version: 1, planner: accepted.planner });
    assert.deepEqual(task.messages, input.planner.prompt.messages);
    assert.deepEqual(task.tools.map(tool => tool.function.name), ['submit_scene_plan']);
    assert.equal(task.toolChoice, 'auto');
    input.planner.prompt.messages = Array.from({ length: 1001 }, () => ({ role: 'user', content: 'Task.' }));
    assert.throws(() => validate(input), { code: 'invalid_draw_run', status: 400 });
});

for (const toolMode of ['native', 'tagged-json']) {
    test(`runtime uses auto and submits historical messages in one ${toolMode} request`, async t => {
        t.mock.method(console, 'log', () => {});
        const input = prepared();
        const task = createPreparedScenePlannerTask(input);
        const requests = [];
        const diagnostic = beginDrawScenePlannerDiagnostic();
        assert.equal(diagnostic.snapshot().toolChoice, 'auto');
        await callDrawScenePlannerAgentRuntime({
            task: { ...task, toolChoice: 'required' },
            providerConfig: { ...input.agent.providerConfig, toolMode },
            diagnostic,
            agentCore: { createAgentAdapter: () => ({ chat: async request => {
                requests.push(request);
                return { toolCalls: [{ id: 'submitted', name: 'submit_scene_plan', arguments: { images: [] } }] };
            } }) },
        });
        assert.equal(requests.length, 1);
        assert.equal(requests[0].toolChoice, 'auto');
        assert.deepEqual(requests[0].messages, input.planner.prompt.messages);
        assert.deepEqual(requests[0].tools.map(tool => tool.function.name), ['submit_scene_plan']);
        assert.equal(diagnostic.snapshot().toolChoice, 'auto');
    });
}
