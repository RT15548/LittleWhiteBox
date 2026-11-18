import test from 'node:test';
import assert from 'node:assert/strict';
import Ajv from 'ajv';
import { compileDefinition } from '../definition/compile.js';
import { equipmentExample } from '../definition/example.js';
import { buildUpdateTask } from '../model/prompts.js';
import { getTools } from '../model/tools.js';
import type { Schema } from '../types.js';
import { prepareGoogleToolParameters } from '../../../agent-core/adapters/google-tool-schema.js';

// Action parameters are embedded inside the write tool. References written
// against the action schema must keep their meaning there, and literal data that
// happens to contain `$ref` must stay data.
const cases: { schema: Schema; values: unknown[] }[] = [
    { schema: { type: 'object', properties: { op: { const: 'read' } }, required: ['op'] }, values: [{ op: 'read' }, { op: 'write' }, {}] },
    { schema: { type: 'object', required: ['definitions', '$defs'], properties: {
        definitions: { type: 'string' }, $defs: { type: 'integer' },
        literal: { enum: [{ $ref: '#/$defs/value', const: 5 }], default: { $ref: '#/$defs/value' } },
    }, $defs: { value: { type: 'number' } } }, values: [{ definitions: 'yes', $defs: 1 }, { definitions: 'yes', $defs: 1, literal: { $ref: '#/$defs/value', const: 5 } }, {}] },
    { schema: { type: 'object', properties: { n: { $ref: '#/$defs/n', minimum: 3 } }, $defs: { n: { type: 'integer', maximum: 9 } } }, values: [{ n: 2 }, { n: 3 }, { n: 10 }, { n: '3' }, {}] },
    { schema: { $ref: '#/$defs/a~1b~0c', $defs: { 'a/b~c': { type: 'string', const: 'yes' } } }, values: ['yes', 'no', 1] },
    { schema: { type: 'object', properties: { next: { $ref: '#' }, tag: { const: 'node' } }, required: ['tag'] }, values: [{ tag: 'node' }, { tag: 'node', next: { tag: 'node' } }, { tag: 'node', next: {} }, {}] },
    { schema: { $ref: '#/$defs/node', $defs: { node: { type: 'object', properties: { next: { $ref: '#/$defs/node' }, n: { type: 'number' } }, required: ['n'] } } }, values: [{ n: 1 }, { n: 1, next: { n: 2 } }, { n: 1, next: {} }, {}] },
    { schema: { type: 'object', properties: { p: { $id: 'https://offline.invalid/p', $defs: { t: { type: 'string' } }, properties: { q: { $ref: '#/$defs/t' } } } } }, values: [{ p: { q: 'x' } }, { p: { q: 1 } }] },
    { schema: { type: 'object', dependencies: { a: { properties: { b: { $ref: '#/$defs/b' } } }, c: ['a'] }, $defs: { b: { type: 'string' } } }, values: [{ a: 1, b: 'x' }, { a: 1, b: 1 }, { c: 1 }, { b: 1 }] },
    { schema: { type: ['string', 'null'], minLength: 2 }, values: ['a', 'ab', 1, null] },
    { schema: { $id: '#root', type: 'object', definitions: { n: { type: 'integer' } }, properties: { n: { $ref: '#/definitions/n' } } }, values: [{ n: 1 }, { n: 'one' }] },
];

test('3.0 write tool validates action parameters exactly as the card schema', () => {
    for (const { schema, values } of cases) {
        const compiled = compileDefinition(equipmentExample());
        compiled.definition.actions = [{ ...compiled.definition.actions[0], id: 'probe', parameters: schema }];
        const original = new Ajv({ strict: false }).compile(schema);
        const tool = getTools(compiled)[0].function.parameters;
        for (const declaration of [tool, prepareGoogleToolParameters(tool)]) {
            const action = new Ajv({ strict: false }).compile(declaration);
            for (const value of values) {
                assert.equal(action({ state: [{ action: 'probe', params: value }] }), original(value), JSON.stringify({ schema, value, errors: action.errors }));
            }
        }
    }
});

test('3.0 custom tools reach the provider adapter with the card schema unchanged', () => {
    const bundle = equipmentExample();
    const parameters = { type: 'object', properties: { op: { const: 'read' }, n: { $ref: '#/$defs/n' } }, required: ['op'], $defs: { n: { type: 'integer' } } };
    bundle.definition.extensions = { tools: { inspect: { title: 'Inspect', description: 'Inspect state.', enabled: true, stages: ['after'], parameters } } };
    bundle.tools = { inspect: 'return input;' };
    const task = buildUpdateTask(compileDefinition(bundle), {}, { messages: [] });
    const custom = task.tools!.find(tool => tool.function.name === 'inspect')!.function;
    assert.deepEqual(custom.parameters, parameters);
    assert.equal(custom.description, 'Inspect state.');
});

// Separate valid actions must stay separately scoped when combined (broken tool protocol).
test('action-local named references remain independent inside write', () => {
    const bundle = equipmentExample();
    for (const [index, action] of bundle.definition.actions.entries()) {
        action.parameters = { type: 'object', definitions: { value: { $id: '#value', type: index ? 'integer' : 'string' } },
            properties: { value: { $ref: '#value' } }, required: ['value'] };
    }
    const compiled = compileDefinition(bundle);
    const tool = getTools(compiled)[0].function.parameters;
    for (const declaration of [tool, prepareGoogleToolParameters(tool)]) {
        const validate = new Ajv({ strict: false }).compile(declaration);
        for (const [index, action] of bundle.definition.actions.entries()) {
            for (const value of [1, 'one']) {
                assert.equal(validate({ state: [{ action: action.id, params: { value } }] }), index ? value === 1 : value === 'one');
            }
        }
    }
});
