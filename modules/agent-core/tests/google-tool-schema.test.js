import test from 'node:test';
import assert from 'node:assert/strict';
import Ajv from 'ajv';
import { prepareGoogleToolParameters } from '../adapters/google-tool-schema.js';

// Native declarations must resolve their references while retaining validation
// and literal data; otherwise a valid card fails before any tool call (protocol 400).
test('Google expands finite deep and named references without changing constraints', () => {
    const source = { type: 'object', properties: {
        a: { $ref: '#/definitions/resource/properties/value' },
        b: { $ref: '#value' },
    }, definitions: {
        resource: { $id: 'https://example.invalid/resource', type: 'object', $defs: { value: { type: 'integer' } }, properties: { value: { $ref: '#/$defs/value' } } },
        named: { $id: '#value', type: 'string', enum: ['one'] },
    }, $defs: { lwb_ref_0: { type: 'boolean' } }, default: { $ref: '#value' } };
    const untouched = structuredClone(source);
    const result = prepareGoogleToolParameters(source);
    for (const name of ['a', 'b']) {
        assert.equal(Object.hasOwn(result.properties[name], '$ref'), false);
    }
    assert.deepEqual(result.default, source.default);
    assert.deepEqual(result.$defs.lwb_ref_0, source.$defs.lwb_ref_0);
    const original = new Ajv({ strict: false }).compile(source), projected = new Ajv({ strict: false }).compile(result);
    for (const input of [{}, { a: 1, b: 'one' }, { a: 'one' }, { b: 1 }, { b: 'two' }]) assert.equal(projected(input), original(input));
    assert.deepEqual(source, untouched);
});

test('ordinary Google schemas are retained', () => {
    const schema = { type: 'object', properties: { value: { type: 'string' } } };
    assert.equal(prepareGoogleToolParameters(schema), schema);
});
