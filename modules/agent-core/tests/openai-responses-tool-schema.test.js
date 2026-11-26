import assert from 'node:assert/strict';
import test from 'node:test';
import { OpenAIResponsesAdapter } from '../adapters/openai-responses.js';

test('Responses keeps function parameters optional unless strict mode is explicit', () => {
    const adapter = new OpenAIResponsesAdapter({ model: 'gpt-5', apiKey: 'fixture' });
    const parameters = { type: 'object', properties: { value: { type: 'string' } }, required: [], additionalProperties: false };
    const strictParameters = { ...parameters, required: ['value'] };
    const tools = [
        { type: 'function', function: { name: 'optional', parameters } },
        { type: 'function', function: { name: 'strict', parameters: strictParameters, strict: true } },
    ];
    const body = JSON.parse(JSON.stringify(adapter.inspectRequest({ messages: [], tools }).request.body));
    assert.deepEqual(body.tools, [
        { type: 'function', name: 'optional', parameters, strict: false },
        { type: 'function', name: 'strict', parameters: strictParameters, strict: true },
    ]);
    assert.deepEqual(parameters.required, []);
});
