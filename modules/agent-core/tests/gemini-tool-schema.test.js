import assert from 'node:assert/strict';
import test from 'node:test';
import { OpenAICompatibleAdapter } from '../adapters/openai-compatible.js';
import { collectToolInputIssues } from '../runtime/tool-input-validation.js';

// Protocol failure blocks the entire turn; null must remain distinct from omission.
test('Gemini native schemas preserve nullable values, constraints and literal data without changing other requests', () => {
    const literal = { type: ['string', 'null'] };
    const schema = { type: 'object', properties: {
        rows: { type: 'array', items: { type: 'object', properties: {
            type: { type: ['string', 'null'], maxLength: 4 },
            point: { type: ['array', 'null'], items: { type: 'number' }, minItems: 2, maxItems: 2 },
            enabled: { type: ['boolean', 'null'] },
            amount: { type: ['number', 'null'], minimum: 0 },
            choice: { anyOf: [{ type: ['string', 'null'], enum: ['a', null] }, { type: 'integer' }] },
        }, required: ['type'], additionalProperties: false } },
        literal: { type: 'object', enum: [literal], default: literal, examples: [literal] },
    }, additionalProperties: false };
    const task = { messages: [{ role: 'user', content: 'test' }], tools: [
        { type: 'function', function: { name: 'edit', parameters: schema } },
    ] };
    const original = structuredClone(task);
    const body = (model, toolMode = 'native') => new OpenAICompatibleAdapter({ apiKey: 'test', model, toolMode }).buildRequestBody(task);
    const projected = body('relay/gemini-2.5-pro').tools[0].function.parameters;
    const fields = projected.properties.rows.items.properties;
    for (const name of ['type', 'point', 'enabled', 'amount']) {
        assert.equal(Array.isArray(fields[name].type), false, `${name}: Gemini type is scalar`);
    }
    for (const value of [
        {}, { rows: [{ type: null }] }, { rows: [{ type: 'a', point: null, enabled: null, amount: null, choice: null }] },
        { rows: [{ type: 'a', point: [1, 2], enabled: false, amount: 0, choice: 2 }] },
        { rows: [{}] }, { rows: [{ type: 1 }] }, { rows: [{ type: 'longer' }] },
        { rows: [{ type: 'a', point: [1] }] }, { rows: [{ type: 'a', point: [1, 'bad'] }] },
        { rows: [{ type: 'a', enabled: 1 }] }, { rows: [{ type: 'a', amount: -1 }] },
        { rows: [{ type: 'a', choice: 'bad' }] }, { rows: [{ type: 'a', extra: true }] },
    ]) {
        assert.equal(collectToolInputIssues(value, projected).length === 0,
            collectToolInputIssues(value, schema).length === 0, JSON.stringify(value));
    }
    assert.deepEqual(projected.properties.literal, schema.properties.literal);
    assert.deepEqual(task, original);
    for (const model of ['gpt-4.1', 'deepseek-chat', 'custom-model']) assert.deepEqual(body(model).tools, task.tools);
    assert.equal(Object.hasOwn(body('gemini-2.5-pro', 'tagged-json'), 'tools'), false);
});
