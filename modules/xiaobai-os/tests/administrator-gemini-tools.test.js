import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { GoogleGenAI } from '@google/genai';
import { createAgentAdapter } from '../../agent-core/provider-config.js';
import { createAdministratorToolLoader, administratorLoadedApps } from '../apps/administrator/agent/tool-loader.js';
import { ADMINISTRATOR_CHAT_TOOLS } from '../apps/administrator/agent/chat-tools.js';
import { ADMINISTRATOR_OS_INSPECT } from '../apps/administrator/agent/os-tools.js';
import { ADMINISTRATOR_RESULT_READ } from '../apps/administrator/agent/result-tools.js';
import { createAdministratorWebTools } from '../apps/administrator/agent/web-tools.js';
import { createMapManagementTools } from '../apps/map/management/tool-contract.js';

// A restored tool package must not make every subsequent provider request fail.
test('administrator map tools survive loading and history restoration in Gemini source and shipped adapters', async t => {
    const packages = [{ id: 'map', label: 'Map', tools: createMapManagementTools() }];
    const common = [...ADMINISTRATOR_CHAT_TOOLS, ADMINISTRATOR_OS_INSPECT, ADMINISTRATOR_RESULT_READ,
        ...createAdministratorWebTools({ tavilyApiKey: 'fixture-only' }).tools];
    const loader = createAdministratorToolLoader(packages, common);
    const before = loader.getTools();
    const args = { apps: ['map'] };
    const result = loader.load(args);
    assert.equal(result.ok, true);
    const history = [{ toolMessages: [
        { role: 'assistant', content: '', toolCalls: [{ id: 'load', name: 'ToolsLoad', arguments: JSON.stringify(args) }] },
        { role: 'tool', toolCallId: 'load', content: JSON.stringify(result) },
    ] }];
    const restored = createAdministratorToolLoader(packages, common, administratorLoadedApps(history));
    const original = structuredClone(restored.getTools());
    assert.equal(original[8].function.name, 'MapAtlasEdit');
    assert.equal(original[10].function.name, 'MapSceneEdit');
    let googleBody;
    t.mock.method(globalThis, 'fetch', async (_url, init) => {
        googleBody = JSON.parse(init.body);
        return new Response(JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: 'ok' }] }, finishReason: 'STOP' }] }),
            { headers: { 'Content-Type': 'application/json' } });
    });
    const google = new GoogleGenAI({ apiKey: 'fixture-only' });
    const manifest = JSON.parse(await readFile(new URL('../../../dist/manifest.json', import.meta.url), 'utf8'));
    const entry = new URL(`../../../dist/${manifest.entries['runtime/agent-core'].file}`, import.meta.url);
    // eslint-disable-next-line no-unsanitized/method -- Trusted entry from this repository's build manifest.
    const browser = await import(entry.href);
    const node = createRequire(import.meta.url)('../../../server-plugin/littlewhitebox-server/draw-runs/vendor/agent-core-node.cjs');
    for (const factory of [createAgentAdapter, browser.createAgentAdapter, node.createAgentAdapter]) {
        const adapter = factory({ provider: 'openai-compatible', apiKey: 'fixture-only', model: 'gemini-2.5-pro' });
        for (const tools of [before, loader.getTools(), restored.getTools()]) {
            const body = adapter.buildRequestBody({ messages: [{ role: 'user', content: 'continue' }], tools });
            const declarations = body.tools.map(tool => tool.function);
            const inspect = schema => {
                if (!schema || typeof schema !== 'object') return;
                assert.equal(Array.isArray(schema.type), false, 'Gemini Schema.type cannot be a list');
                if (Object.hasOwn(schema, 'items')) assert.equal(schema.type, 'array', 'items requires ARRAY before any SDK rewriting');
                if (Object.hasOwn(schema, 'properties')) assert.equal(schema.type, 'object', 'properties requires OBJECT before any SDK rewriting');
                if (Object.hasOwn(schema, 'maxLength')) assert.equal(schema.type, 'string', 'maxLength requires STRING');
                if (Object.hasOwn(schema, 'minimum')) assert.ok(['number', 'integer'].includes(schema.type), 'minimum requires a numeric type');
                for (const value of Object.values(schema)) if (typeof value === 'object') {
                    if (Array.isArray(value)) value.forEach(inspect);
                    else inspect(value);
                }
            };
            declarations.forEach(tool => inspect(tool.parameters));
            await google.models.generateContent({ model: 'gemini-2.5-pro', contents: 'test', config: {
                tools: [{ functionDeclarations: structuredClone(declarations) }],
            } });
            if (tools.length === before.length) continue;
            const fields = googleBody.tools[0].functionDeclarations[10].parameters.properties.elements.items.properties;
            for (const [name, type] of [['label', 'STRING'], ['actorKey', 'STRING'], ['closed', 'BOOLEAN'], ['rotation', 'NUMBER']]) {
                assert.equal(fields[name].type, type);
                assert.equal(fields[name].nullable, true);
            }
            const atlas = googleBody.tools[0].functionDeclarations[8].parameters;
            const locations = atlas.properties.locations.items.properties;
            assert.equal(locations.parent.type, 'STRING');
            assert.equal(locations.parent.nullable, true);
            assert.equal(locations.position.type, 'ARRAY');
            assert.equal(locations.position.nullable, true);
            assert.equal(locations.position.items.type, 'NUMBER');
        }
    }
    assert.deepEqual(restored.getTools(), original);
});
