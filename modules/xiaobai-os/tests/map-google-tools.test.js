import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { once } from 'node:events';
import { createServer } from 'node:http';
import test from 'node:test';
import { GoogleAdapter } from '../../agent-core/adapters/google.js';
import { MAP_MAINTENANCE_TOOLS } from '../apps/map/maintenance/tool-contract.js';

// External protocol contract: Gemini functionDeclaration.parameters uses Schema,
// not arbitrary JSON Schema. Check the SDK's outgoing body, not source text.
const schemaFields = new Set(['anyOf', 'default', 'description', 'enum', 'example', 'format', 'items', 'maxItems', 'maxLength', 'maxProperties', 'maximum', 'minItems', 'minLength', 'minProperties', 'minimum', 'nullable', 'pattern', 'properties', 'propertyOrdering', 'required', 'title', 'type']);

function checkSchema(schema, path) {
    for (const key of Object.keys(schema)) assert.ok(schemaFields.has(key), `${path}.${key} is not a Gemini Schema field`);
    if (schema.enum) assert.ok(schema.enum.every(value => typeof value === 'string'), `${path}.enum must contain only strings`);
    for (const [name, child] of Object.entries(schema.properties || {})) checkSchema(child, `${path}.${name}`);
    if (schema.items) checkSchema(schema.items, `${path}[]`);
    for (const child of schema.anyOf || []) checkSchema(child, `${path}.anyOf`);
}

test('all Map tools survive the Google SDK as supported schemas with nullable fields', { timeout: 10000 }, async t => {
    let outgoing;
    const server = createServer(async (request, response) => {
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);
        outgoing = JSON.parse(Buffer.concat(chunks));
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: 'ok' }] }, finishReason: 'STOP' }] }));
    });
    t.after(() => { server.closeAllConnections(); server.close(); });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const adapter = new GoogleAdapter({ apiKey: 'test-only', baseUrl: `http://127.0.0.1:${server.address().port}`, model: 'gemini-2.5-flash' });
    await adapter.chat({ messages: [{ role: 'user', content: 'Protocol check only.' }], tools: MAP_MAINTENANCE_TOOLS });
    const declarations = outgoing.tools.flatMap(tool => tool.functionDeclarations || []);
    assert.deepEqual(declarations.map(tool => tool.name), MAP_MAINTENANCE_TOOLS.map(tool => tool.function.name));
    for (const tool of declarations) checkSchema(tool.parameters, tool.name);
    const edit = declarations.find(tool => tool.name === 'MapSceneEdit').parameters.properties;
    const element = edit.elements.items.properties;
    for (const field of ['kind', 'icon', 'material', 'certainty', 'rotation', 'closed', 'label']) {
        assert.equal(element[field].nullable, true, `${field} remains clearable`);
        assert.ok(element[field].description, `${field} keeps its model-facing description`);
    }
    assert.equal(edit.mood.nullable, true);
});
