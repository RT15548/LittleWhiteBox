import test from 'node:test';
import assert from 'node:assert/strict';
import Ajv from 'ajv';
import { projectGeminiToolParameters } from '../adapters/gemini-tool-schema.js';
import { createAgentAdapter } from '../provider-config.js';
import { prepareGeminiRelayRequest } from '../adapters/gemini-relay.js';

// Valid card arguments must remain representable at the provider boundary (broken updates).
const regressions = [
    [{ type: 'object', patternProperties: { '^item_': { type: 'integer' } }, additionalProperties: false }, { item_gold: 2 }],
    [{ type: 'object', properties: { amount: { type: 'integer', not: { multipleOf: 2 } } } }, { amount: 3 }],
    [{ type: 'object', properties: { amount: { type: 'integer', oneOf: [{ multipleOf: 2 }, { multipleOf: 3 }] } } }, { amount: 2 }],
    [{ type: 'object', properties: { amount: { type: 'integer', if: { multipleOf: 2 }, then: { minimum: 10 }, else: { minimum: 1 } } } }, { amount: 3 }],
];
test('projection never rejects valid arguments in dependent constraints', () => {
    for (const [schema, value] of regressions) {
        assert.equal(new Ajv({ strict: true }).compile(schema)(value), true);
        const { parameters, lossy } = projectGeminiToolParameters(schema);
        assert.equal(new Ajv({ strict: false }).compile(parameters)(value), true, JSON.stringify(parameters));
        assert.equal(lossy, true);
    }
});

test('non-Gemini and tagged requests remain unchanged', () => {
    const tools = [{ type: 'function', function: { name: 'read', parameters: { type: 'object', properties: { op: { const: 'read' } } } } }];
    const messages = [{ role: 'tool', content: '{"$ref":"#/data"}' }];
    for (const [model, tagged] of [['deepseek-flash', false], ['gpt-4.1', false], ['claude-sonnet', false], ['alias', false], ['gemini-3.8-flash', true]]) {
        const result = prepareGeminiRelayRequest(model, tools, messages, tagged);
        assert.equal(result.tools, tools);
        assert.equal(result.messages, messages);
    }
});

test('finite references use the target resource scope', () => {
    const schema = { type: 'object', $defs: { t: { type: 'string' }, inner: { $id: 'https://example.invalid/nested', type: 'object',
        $defs: { t: { type: 'integer' } }, properties: { value: { $ref: '#/$defs/t' } } } },
    properties: { amount: { $ref: '#/$defs/inner/properties/value' } } };
    const { parameters, lossy } = projectGeminiToolParameters(schema);
    assert.equal(lossy, false);
    for (const amount of [1, 'one']) assert.equal(new Ajv({ strict: false }).compile(parameters)({ amount }), amount === 1);
});

// Both user-facing native relay routes must send the same definition/result (protocol 400).
test('hosted and direct OpenAI-compatible Gemini share native tool adaptation', () => {
    const task = { tools: [{ type: 'function', function: { name: 'read', parameters: { type: 'object', properties: { op: { const: 'read' } } } } }],
        messages: [{ role: 'user', content: 'read' }, { role: 'assistant', content: '', tool_calls: [{ id: 'a', type: 'function', function: { name: 'read', arguments: '{}' } }] },
            { role: 'tool', tool_call_id: 'a', content: '{"$ref":"#/data"}' }] };
    const direct = createAgentAdapter({ provider: 'openai-compatible', model: 'gemini-3.8-flash' }).buildRequestBody(task);
    const hosted = createAgentAdapter({ provider: 'sillytavern-openai-compatible', model: 'gemini-3.8-flash' }).buildPayload(task);
    assert.deepEqual(hosted.tools, direct.tools);
    assert.deepEqual(hosted.messages, direct.messages);
    assert.deepEqual(JSON.parse(hosted.messages.at(-1).content), { output: task.messages.at(-1).content });
});
