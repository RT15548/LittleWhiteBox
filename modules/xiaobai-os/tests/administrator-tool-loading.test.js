import assert from 'node:assert/strict';
import test from 'node:test';
import { administratorHarness, settled } from './administrator-harness.js';
import { createAdministratorToolExecutor } from '../apps/administrator/agent/tool-executor.js';
import { createAdministratorChatReader } from '../apps/administrator/host/chat-reader.js';
import { TOOLS_LOAD } from '../apps/administrator/agent/tool-loader.js';
import { OpenAICompatibleAdapter } from '../../agent-core/adapters/openai-compatible.js';
import { GoogleAdapter } from '../../agent-core/adapters/google.js';
import { administratorContext, contextUsage } from '../apps/administrator/agent/history.js';
import { ADMINISTRATOR_PROMPT } from '../apps/administrator/agent/prompt.js';
import { administratorReferenceMessage } from '../apps/administrator/agent/reference-data.js';

const names = tools => tools.map(tool => tool.function.name);
const common = [TOOLS_LOAD, 'ChatSearch', 'ChatRead', 'OSInspect', 'ToolResultRead'];
const call = (name, args = {}) => ({ toolCalls: [{ id: 'call', name, arguments: JSON.stringify(args) }] });
const result = (messages, name) => JSON.parse(messages.findLast(message => message.role === 'tool' && message.toolName === name).content);

async function executorFixture(h) {
    const abort = new AbortController(), operations = [];
    const executor = await createAdministratorToolExecutor({ registry: h.registry,
        reader: createAdministratorChatReader(h.capture, () => abort.signal), readEnvironment: h.readEnvironment,
        operations, guard: () => !abort.signal.aborted, onChange() {}, async saveReceipts() { assert.fail('loading cannot save business data'); } });
    let sequence = 0;
    return { executor, operations, abort, call: (name, args = {}) => executor.execute(name, args, String(++sequence), sequence) };
}

test('one load supplies a complete registered APP package and common tools without business activity', async () => {
    const h = await administratorHarness(), f = await executorFixture(h);
    const expected = (await h.registry.get('map').open()).tools.map(tool => tool.definition);
    const initial = f.executor.getTools(), data = structuredClone(f.executor.data);
    const writes = h.state.writes.length, reads = h.state.environmentReads.length;
    assert.deepEqual(names(initial), [TOOLS_LOAD]);
    assert.equal((await f.call('MapAtlasRead', { mode: 'summary' })).code, 'tool_not_loaded');
    const loaded = await f.call(TOOLS_LOAD, { apps: ['map'] });
    assert.deepEqual(f.executor.getTools().slice(common.length), expected);
    assert.deepEqual(loaded.data, { apps: ['map'], tools: [...common, ...names(expected)] });
    assert.deepEqual(names(initial), [TOOLS_LOAD]);
    assert.deepEqual(f.executor.data, data);
    const snapshot = f.executor.getTools();
    assert.deepEqual((await f.call(TOOLS_LOAD, { apps: ['map', 'map'] })).data, loaded.data);
    assert.deepEqual(f.executor.getTools(), snapshot);
    assert.equal(h.state.writes.length, writes); assert.equal(h.state.environmentReads.length, reads);
    assert.equal(f.operations.every(operation => operation.appId === 'administrator' && operation.status === 'read'), true);
    const next = await f.call(TOOLS_LOAD, { apps: ['world', 'tasks'] });
    assert.deepEqual(next.data.apps, ['map', 'world', 'tasks']);
    assert.equal(new Set(next.data.tools).size, 15);
    assert.deepEqual(f.executor.getTools().slice(0, snapshot.length), snapshot);
});

test('invalid loads are atomic, unavailable APPs are excluded, and common tools need no APP', async () => {
    const h = await administratorHarness();
    const remove = h.registry.register({ id: 'unavailable', label: 'Unavailable', async open() { throw new Error('private'); } });
    const f = await executorFixture(h);
    for (const args of [null, [], { apps: null }, { apps: 'map' }, { apps: [1] }, { apps: [{ toString: null }] },
        { apps: [], extra: true }, { apps: ['map', 'unknown'] }, { apps: ['map', 'unavailable'] }]) {
        assert.equal((await f.call(TOOLS_LOAD, args)).status, 'failed');
        assert.deepEqual(names(f.executor.getTools()), [TOOLS_LOAD]);
    }
    assert.deepEqual(f.executor.data.unavailable, [{ id: 'unavailable', code: 'management_unavailable' }]);
    remove();
    assert.deepEqual((await f.call(TOOLS_LOAD)).data, { apps: [], tools: common });
    assert.deepEqual((await f.call(TOOLS_LOAD, { apps: [] })).data, { apps: [], tools: common });
    const after = await executorFixture(h);
    assert.deepEqual(after.executor.data.unavailable, []);
    assert.deepEqual(names(after.executor.getTools()), [TOOLS_LOAD]);
});

test('new APP registration joins loading without administrator-specific routing, and removal leaves no package', async () => {
    const h = await administratorHarness(); let executed = 0;
    const remove = h.registry.register({ id: 'probe', label: 'Probe', async open() { return {
        prompt: '', initial: {}, tools: [{ effect: 'read', label: 'Probe', target: () => '', definition: {
            type: 'function', function: { name: 'ProbeRead', description: 'Read probe.', parameters: { type: 'object', properties: {} } },
        } }], async execute() { executed++; return { ok: true, status: 'read', data: 7 }; },
    }; } });
    const f = await executorFixture(h);
    await f.call(TOOLS_LOAD, { apps: ['probe'] });
    assert.equal(executed, 0);
    assert.equal((await f.call('ProbeRead')).data, 7); assert.equal(executed, 1);
    remove();
    const next = await executorFixture(h);
    assert.equal((await next.call(TOOLS_LOAD, { apps: ['probe'] })).code, 'management_unavailable');
    assert.deepEqual(names(next.executor.getTools()), [TOOLS_LOAD]);
});

test('loading is cancelled on chat switch or stop and cannot mutate the advertised tool surface', async () => {
    for (const boundary of ['chat', 'stop']) {
        const h = await administratorHarness(), f = await executorFixture(h);
        if (boundary === 'chat') { h.state.capture.identityKey = 'another-chat'; } else { f.abort.abort(); }
        await assert.rejects(f.call(TOOLS_LOAD, { apps: ['map'] }), boundary === 'chat' ? { message: 'administrator_context_changed' } : { name: 'AbortError' });
        assert.deepEqual(names(f.executor.getTools()), [TOOLS_LOAD]);
    }
});

test('a tool loaded in the same batch cannot run until the next request; later turns and regeneration start fresh', async () => {
    const h = await administratorHarness(); let step = 0;
    h.state.generate = async request => {
        if (++step === 1) { return { toolCalls: [call(TOOLS_LOAD, { apps: ['world'] }).toolCalls[0],
            { ...call('WorldEdit', { overview: 'must not run' }).toolCalls[0], id: 'edit' }] }; }
        assert.equal(result(request.messages, 'WorldEdit').code, 'tool_not_loaded');
        assert.ok(names(request.tools).includes('WorldEdit'));
        return { text: 'done' };
    };
    const sent = await h.request('send', { text: 'check world' }); await settled(h.runtime);
    assert.equal(h.world.readCurrent().world.overview, '');
    assert.equal(h.repository.read().turns[0].operations.length, 1);
    h.state.generate = async request => { assert.deepEqual(names(request.tools), [TOOLS_LOAD]); return { text: 'fresh' }; };
    await h.request('send', { text: 'next question' }); await settled(h.runtime);
    await h.request('regenerate', { turnId: sent.turnId }); await settled(h.runtime);
    assert.equal(h.repository.read().turns[0].status, 'finished');
});

test('context estimates charge only the loaded definitions, with unchanged reference data', async t => {
    const h = await administratorHarness(), f = await executorFixture(h);
    const system = [ADMINISTRATOR_PROMPT, f.executor.prompt].join('\n\n');
    const reference = structuredClone(f.executor.data);
    const prefix = [administratorReferenceMessage(f.executor.data)], history = administratorContext({ turns: [], summary: null });
    const measure = tools => { const { used, rules, tools: cost } = contextUsage(system, tools, prefix, history, 0, {}); return { used, rules, tools: cost }; };
    const initial = measure(f.executor.getTools());
    await f.call(TOOLS_LOAD);
    const commonOnly = measure(f.executor.getTools());
    await f.call(TOOLS_LOAD, { apps: ['map'] });
    const map = measure(f.executor.getTools());
    await f.call(TOOLS_LOAD, { apps: ['tasks', 'world'] });
    const all = measure(f.executor.getTools()), eager = measure(f.executor.getTools().filter(tool => tool.function.name !== TOOLS_LOAD));
    assert.ok(initial.tools < commonOnly.tools && commonOnly.tools < map.tools && map.tools < all.tools);
    assert.deepEqual(f.executor.data, reference);
    assert.ok(initial.used < eager.used);
    t.diagnostic(JSON.stringify({ estimatorOnly: true, initial, commonOnly, map, all, eager }));
});

// These are transport/execution tests with isolated data, not model-quality evaluations.
for (const transport of ['native', 'tagged-json', 'google']) {
    test(`${transport}: loading, reading and editing use the real protocol and preserve history without duplicate execution`, async t => {
        const h = await administratorHarness();
        const wire = [], creations = [], requests = [], counts = [];
        const location = { key: 'north-port', name: '北岸“码头”🙂', scale: 'region', brief: '路牌写着 "到站"\n第二行' };
        const script = [call(TOOLS_LOAD, { apps: ['map'] }), call('MapAtlasRead', { mode: 'summary' }),
            call('MapAtlasEdit', { locations: [location] }), call(TOOLS_LOAD, { apps: ['map'] }), { text: 'done' }];
        let step = 0;
        const config = { provider: transport === 'google' ? 'google' : 'openai-compatible', apiKey: 'fixture-key',
            baseUrl: 'https://example.invalid/v1', model: transport === 'google' ? 'gemini-test' : 'fixture-model', toolMode: transport };
        function openAIEvents(body) {
            wire.push(body);
            const response = script[step++]; assert.ok(response);
            const calls = response.toolCalls?.map(({ id, name, arguments: args }) => ({ index: 0, id, type: 'function', function: { name, arguments: args } }));
            if (transport === 'native' && calls) {
                return [{ choices: [{ delta: { role: 'assistant', tool_calls: calls } }] }, { choices: [{ delta: {}, finish_reason: 'tool_calls' }] }];
            }
            const content = calls ? `<tool_call>${JSON.stringify({ name: calls[0].function.name, arguments: JSON.parse(calls[0].function.arguments) })}</tool_call>` : response.text;
            return [...Array.from(content, char => ({ choices: [{ delta: { content: char } }] })), { choices: [{ delta: {}, finish_reason: 'stop' }] }];
        }
        if (transport === 'native') {
            t.mock.method(globalThis, 'fetch', async (_, input) => new Response(
                openAIEvents(JSON.parse(input.body)).map(event => `data: ${JSON.stringify(event)}\n\n`).join('') + 'data: [DONE]\n\n',
                { headers: { 'content-type': 'text/event-stream' } }));
        }
        h.gateway.openSession = async () => {
            const adapter = transport === 'google' ? new GoogleAdapter(config) : new OpenAICompatibleAdapter(config);
            if (transport === 'google') {
                adapter.client.chats.create = payload => {
                    creations.push(payload);
                    return { async *sendMessageStream(input) {
                        wire.push(input);
                        const response = script[step++]; assert.ok(response);
                        const functionCalls = response.toolCalls?.map(call => ({ id: call.id, name: call.name, args: JSON.parse(call.arguments) }));
                        yield { functionCalls, candidates: [{ finishReason: 'STOP', content: { role: 'model', parts: functionCalls
                            ? functionCalls.map(functionCall => ({ functionCall, thoughtSignature: 'fixture-signature' })) : [{ text: response.text }] } }] };
                    } };
                };
            } else if (transport === 'tagged-json') {
                adapter.client.chat.completions.create = async body => ({ async *[Symbol.asyncIterator]() { yield* openAIEvents(body); } });
            }
            return { providerConfig: config, supportsSessionToolLoop: transport === 'google', async run(request) {
                requests.push(request); counts.push(h.runtime.context().tools);
                return adapter.chat(request);
            } };
        };
        await h.request('send', { text: '检查地图并添加北岸码头' }); await settled(h.runtime);
        const turn = h.repository.read().turns[0];
        assert.equal(turn.status, 'finished', h.runtime.error());
        assert.equal(step, script.length);
        assert.deepEqual(names(requests[0].tools), [TOOLS_LOAD]);
        const expected = [...common, ...names((await h.registry.get('map').open()).tools.map(tool => tool.definition))];
        for (const request of requests.slice(1)) { assert.deepEqual(names(request.tools), expected); }
        assert.equal(new Set(requests.map(request => request.systemPrompt)).size, 1);
        assert.ok(counts[1] > counts[0]); assert.equal(counts[4], counts[1]);
        assert.equal(result(turn.toolMessages, 'MapAtlasEdit').status, 'saved');
        assert.deepEqual(JSON.parse(turn.toolMessages.find(message => message.toolCalls?.[0].name === 'MapAtlasEdit').toolCalls[0].arguments),
            JSON.parse(script[2].toolCalls[0].arguments));
        const place = h.map.readCurrent().map.atlas.locations.find(item => item.key === location.key);
        assert.equal(place.name, location.name);
        let previous, businessChanges = 0;
        for (const write of h.state.writes) {
            const map = JSON.stringify(write.candidate.partitions.map);
            if (map !== previous) { businessChanges++; previous = map; }
        }
        assert.equal(businessChanges, 1);
        if (transport === 'google') {
            assert.equal(creations.length, 2);
            assert.deepEqual(creations[0].config.tools[0].functionDeclarations.map(tool => tool.name), [TOOLS_LOAD]);
            assert.deepEqual(creations[1].config.tools[0].functionDeclarations.map(tool => tool.name), expected);
            assert.equal(requests[1].toolResponses, undefined);
            assert.equal(result(requests[1].messages, TOOLS_LOAD).status, 'read');
            assert.equal(creations[1].history.flatMap(message => message.parts).find(part => part.functionCall)?.thoughtSignature, 'fixture-signature');
            assert.ok(requests.slice(2).every(request => request.toolResponses && !request.messages.length));
        } else if (transport === 'native') {
            assert.deepEqual(names(wire[0].tools), [TOOLS_LOAD]);
            assert.ok(wire.slice(1).every(body => names(body.tools).join() === expected.join()));
            assert.ok(wire[1].messages.some(message => message.role === 'tool'));
        } else {
            assert.ok(wire.every(body => !Object.hasOwn(body, 'tools')));
            // JSON Schema serialization is the external text-tool protocol, not prompt wording.
            const schema = JSON.stringify(requests[1].tools.find(tool => tool.function.name === 'MapSceneEdit').function.parameters);
            assert.equal(wire[0].messages.some(message => String(message.content).includes(schema)), false);
            assert.equal(wire[1].messages.some(message => String(message.content).includes(schema)), true);
        }
    });
}
