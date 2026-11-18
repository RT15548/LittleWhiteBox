import assert from 'node:assert/strict';
import test from 'node:test';
import Ajv from 'ajv';
import { projectGeminiRelayTools, projectGeminiToolParameters } from '../adapters/gemini-tool-schema.js';

// Google's published v1beta Schema fields, independent of relay-specific extensions.
const ACCEPTED = new Set(['type', 'title', 'description', 'format', 'nullable', 'enum', 'default', 'example', 'propertyOrdering',
    'properties', 'required', 'items', 'minItems', 'maxItems', 'minProperties', 'maxProperties',
    'minLength', 'maxLength', 'pattern', 'minimum', 'maximum', 'anyOf']);
const OBJECT_ONLY = ['properties', 'required'];

function assertGeminiShape(schema, path = 'parameters') {
    assert.equal(typeof schema, 'object', path);
    for (const key of Object.keys(schema)) assert.ok(ACCEPTED.has(key), `${path}.${key}`);
    if (schema.type !== undefined) assert.equal(typeof schema.type, 'string', `${path}.type`);
    for (const key of OBJECT_ONLY) if (Object.hasOwn(schema, key)) assert.equal(schema.type, 'object', `${path}.${key}`);
    if (Object.hasOwn(schema, 'items') || schema.type === 'array') {
        assert.equal(schema.type, 'array', `${path}.items`);
        assert.ok(Object.hasOwn(schema, 'items'), `${path} array without items`);
    }
    for (const name of schema.required || []) assert.ok(Object.hasOwn(schema.properties || {}, name), `${path}.required ${name}`);
    if (schema.enum) for (const value of schema.enum) assert.equal(typeof value, 'string', `${path}.enum`);
    for (const [name, child] of Object.entries(schema.properties || {})) assertGeminiShape(child, `${path}.properties.${name}`);
    for (const key of ['anyOf', 'oneOf', 'allOf']) for (const [index, child] of (schema[key] || []).entries()) assertGeminiShape(child, `${path}.${key}[${index}]`);
    for (const key of ['items', 'not']) if (Object.hasOwn(schema, key)) assertGeminiShape(schema[key], `${path}.${key}`);
    if (typeof schema.additionalProperties === 'object') assertGeminiShape(schema.additionalProperties, `${path}.additionalProperties`);
}

const values = [{}, { a: 'x' }, { a: 'yy' }, { a: 2 }, { a: 2.5 }, { a: null }, { a: true }, { a: [] }, { a: ['x'] }, { a: [1, 2] },
    { a: {} }, { a: { x: 'v' } }, { a: { x: 1 } }, { a: { next: { x: 'v' } } }, { a: { next: {} } }, { a: 'x', b: 'y' }, { b: 'y' }, { k: 1 }];
// Schemas whose projection must accept exactly the same arguments.
const exact = {
    const: { type: 'object', properties: { a: { const: 2 } } },
    enumMixed: { type: 'object', properties: { a: { enum: ['x', 2, null] } } },
    typeArray: { type: 'object', properties: { a: { type: ['string', 'null'], minLength: 2 } } },
    typeArrayWithAnyOf: { type: 'object', properties: { a: { type: ['string', 'number'], anyOf: [{ enum: ['x'] }, { minimum: 2 }] } } },
    untypedObjectKeywords: { type: 'object', properties: { a: { properties: { x: { type: 'string' } }, required: ['x'] } } },
    refs: { type: 'object', properties: { a: { $ref: '#/$defs/a', title: 'A' } }, $defs: { a: { type: 'string', minLength: 2 } } },
    nestedId: { type: 'object', properties: { a: { $id: 'https://x.invalid/a', $defs: { t: { type: 'string' } }, properties: { x: { $ref: '#/$defs/t' } } } } },
    trueSchema: { type: 'object', properties: { a: true } },
    itemsFalse: { type: 'object', properties: { a: { type: 'array', items: false } } },
    requiredWithoutProperty: { type: 'object', properties: { a: { type: 'object', required: ['x'] } } },
    annotations: { $schema: 'http://json-schema.org/draft-07/schema#', type: 'object', properties: { a: { type: 'string', examples: ['x'], deprecated: true, $comment: 'c' } } },
    conjunction: { type: 'object', properties: { k: { allOf: [{ type: 'integer' }, { minimum: 1 }] } } },
};
// Schemas Gemini parameters cannot express; the projection widens them.
const lossy = {
    booleans: { type: 'object', properties: { a: true, b: false } },
    ifThenElse: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' } }, if: { properties: { a: { const: 'x' } }, required: ['a'] }, then: { required: ['b'] } },
    requiredWithoutProperty: { type: 'object', properties: { a: { type: 'object', additionalProperties: { type: 'string' }, required: ['x'] } } },
    compositions: { type: 'object', properties: { a: { oneOf: [{ type: 'string' }, { type: 'number' }] }, b: { not: { type: 'null' } }, k: { allOf: [{ type: 'integer' }, { minimum: 1 }] } } },
    uniqueItems: { type: 'object', properties: { a: { type: 'array', items: { type: 'number' }, uniqueItems: true } } },
    recursive: { type: 'object', properties: { a: { $ref: '#/$defs/n' } }, $defs: { n: { type: 'object', properties: { next: { $ref: '#/$defs/n' } } } } },
    patternProperties: { type: 'object', properties: { a: { type: 'object', patternProperties: { '^x': { type: 'string' } } } } },
    multipleOf: { type: 'object', properties: { a: { type: 'number', multipleOf: 2 } } },
};

test('Gemini relay projection accepts the same arguments when it reports no loss', () => {
    for (const [name, schema] of Object.entries(exact)) {
        const { parameters, lossy: changed } = projectGeminiToolParameters(schema);
        assert.equal(changed, false, name);
        assertGeminiShape(parameters);
        const original = new Ajv({ strict: false }).compile(schema);
        const projected = new Ajv({ strict: false }).compile(parameters);
        for (const value of values) assert.equal(projected(value), original(value), `${name} ${JSON.stringify(value)} ${JSON.stringify(parameters)}`);
    }
});

// Apply the same contract to combinations, not just fixture keywords (broken updates).
test('nested compositions preserve every valid value and use only protocol fields', () => {
    const leaves = [true, false, {}, { type: 'integer', multipleOf: 2 }, { const: 'x' }, { enum: [1, 'x', true, null] },
        { type: ['string', 'number'], minimum: 2, minLength: 2 }, { type: 'array', uniqueItems: true, items: { type: 'integer' } },
        { type: 'object', patternProperties: { '^x': { type: 'number' } }, additionalProperties: false }];
    const samples = [null, true, false, 0, 1, 2, 3, 'x', 'yy', [], [1, 1], [1, 2], {}, { x: 1 }, { y: 2 }];
    const ajv = new Ajv({ strict: false });
    for (const left of leaves) for (const right of leaves) {
        for (const part of [{ allOf: [left, right] }, { anyOf: [left, right] }, { oneOf: [left, right] }, { not: { allOf: [left, right] } },
            { if: left, then: right, else: { type: 'string' } }]) {
            const source = { type: 'object', properties: { value: part } };
            const before = JSON.stringify(source);
            const projected = projectGeminiToolParameters(source);
            assertGeminiShape(projected.parameters);
            const original = ajv.compile(source), converted = ajv.compile(projected.parameters);
            for (const value of samples) {
                const input = { value };
                if (original(input)) assert.equal(converted(input), true, JSON.stringify({ source, projected, input }));
                if (!projected.lossy) assert.equal(converted(input), original(input), JSON.stringify({ source, projected, input }));
            }
            assert.equal(JSON.stringify(source), before);
        }
    }
});

test('Gemini relay projection widens inexpressible rules and publishes the original schema', () => {
    for (const [name, schema] of Object.entries(lossy)) {
        const [tool] = projectGeminiRelayTools([{ type: 'function', function: { name, description: 'Probe.', parameters: schema } }]);
        assertGeminiShape(tool.function.parameters);
        const original = new Ajv({ strict: false }).compile(schema);
        const projected = new Ajv({ strict: false }).compile(tool.function.parameters);
        for (const value of values) if (original(value)) assert.equal(projected(value), true, `${name} ${JSON.stringify(value)}`);
        const start = tool.function.description.indexOf('\n{');
        assert.deepEqual(JSON.parse(tool.function.description.slice(start + 1)), schema, name);
    }
    const plain = { type: 'function', function: { name: 'plain', description: 'Probe.', parameters: exact.const } };
    assert.equal(projectGeminiRelayTools([plain])[0].function.description, 'Probe.');
});
