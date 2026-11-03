import assert from 'node:assert/strict';
import test from 'node:test';
import { administratorHarness, settled, COMMON_TOOL_NAMES as common } from './administrator-harness.js';
import { createAdministratorToolExecutor } from '../apps/administrator/agent/tool-executor.js';
import { createAdministratorChatReader } from '../apps/administrator/host/chat-reader.js';
import { administratorLoadedApps, TOOLS_LOAD } from '../apps/administrator/agent/tool-loader.js';
import { OpenAICompatibleAdapter } from '../../agent-core/adapters/openai-compatible.js';
import { GoogleAdapter } from '../../agent-core/adapters/google.js';
import { administratorContext, contextUsage } from '../apps/administrator/agent/history.js';
import { ADMINISTRATOR_PROMPT } from '../apps/administrator/agent/prompt.js';
import { administratorReferenceMessage } from '../apps/administrator/agent/reference-data.js';

const names = tools => tools.map(tool => tool.function.name);
const call = (name, args = {}) => ({ toolCalls: [{ id: 'call', name, arguments: JSON.stringify(args) }] });
const result = (messages, name) => JSON.parse(messages.findLast(message => message.role === 'tool' && message.toolName === name).content);

async function executorFixture(h, saveReceipts = async () => { assert.fail('loading cannot save business data'); }, loadedApps = []) {
    const abort = new AbortController(), operations = [];
    const reader = createAdministratorChatReader(h.capture, () => abort.signal);
    const executor = await createAdministratorToolExecutor({ registry: h.registry,
        reader, readEnvironment: h.readEnvironment, loadedApps,
        operations, guard: reader.isCurrent, onChange() {}, saveReceipts });
    let sequence = 0;
    return { executor, operations, abort, call: (name, args = {}) => executor.execute(name, args, String(++sequence), sequence) };
}

test('story search and reading work immediately while APP reads and writes still require selection', async () => {
    const h = await administratorHarness(), f = await executorFixture(h);
    const writes = h.state.writes.length;
    assert.equal((await f.call('MapAtlasRead', { mode: 'summary' })).code, 'tool_not_loaded');
    assert.equal((await f.call('WorldEdit', { overview: 'must not save' })).code, 'tool_not_loaded');
    const search = await f.call('ChatSearch', { query: 'floor-55' });
    assert.equal(search.status, 'read');
    assert.deepEqual(search.data.items.map(item => item.floor), [55]);
    const read = await f.call('ChatRead', { from: search.data.items[0].floor });
    assert.equal(read.status, 'read');
    assert.equal(read.data.items[0].text, h.state.messages[55].mes);
    assert.deepEqual(names(f.executor.getTools()), common);
    assert.equal(h.state.writes.length, writes);
    assert.equal(f.operations.length, 2);
});

test('one load adds a complete registered APP package to the common tools without business activity', async () => {
    const h = await administratorHarness(), f = await executorFixture(h);
    const expected = (await h.registry.get('map').open()).tools.map(tool => tool.definition);
    const initial = f.executor.getTools(), data = structuredClone(f.executor.data);
    const writes = h.state.writes.length, reads = h.state.environmentReads.length;
    assert.deepEqual(names(initial), common);
    assert.equal((await f.call('MapAtlasRead', { mode: 'summary' })).code, 'tool_not_loaded');
    const loaded = await f.call(TOOLS_LOAD, { apps: ['map'] });
    assert.deepEqual(f.executor.getTools().slice(common.length), expected);
    assert.deepEqual(loaded.data, { apps: ['map'], tools: [...common, ...names(expected)] });
    assert.deepEqual(names(initial), common);
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

test('invalid loads are atomic, initial read failures retain their package, and common tools need no APP', async () => {
    const h = await administratorHarness();
    const remove = h.registry.register({ id: 'unavailable', label: 'Unavailable', prompt: '', tools: [], async open() { throw Object.assign(new Error('read failed'), { code: 'storage_read_failed' }); } });
    const f = await executorFixture(h);
    for (const args of [null, [], { apps: null }, { apps: 'map' }, { apps: [1] }, { apps: [{ toString: null }] },
        { apps: [], extra: true }, { apps: ['map', 'unknown'] }]) {
        assert.equal((await f.call(TOOLS_LOAD, args)).status, 'failed');
        assert.deepEqual(names(f.executor.getTools()), common);
    }
    assert.equal((await f.call(TOOLS_LOAD, { apps: ['unavailable'] })).status, 'read');
    assert.deepEqual(f.executor.data.readErrors.map(error => error.code), ['storage_read_failed']);
    remove();
    assert.deepEqual((await f.call(TOOLS_LOAD)).data, { apps: ['unavailable'], tools: common });
    assert.deepEqual((await f.call(TOOLS_LOAD, { apps: [] })).data, { apps: ['unavailable'], tools: common });
    const after = await executorFixture(h);
    assert.deepEqual(after.executor.data.readErrors, []);
    assert.deepEqual(names(after.executor.getTools()), common);
});

test('restored APP selections use current registered definitions and executors; removed packages stay unavailable', async () => {
    const h = await administratorHarness(); let executed = 0;
    const tools = [{ effect: 'read', label: 'Probe', target: () => '', definition: {
            type: 'function', function: { name: 'ProbeRead', description: 'Read probe.', parameters: { type: 'object', properties: {} } },
        } }];
    const remove = h.registry.register({ id: 'probe', label: 'Probe', prompt: '', tools, async open() { return {
        prompt: '', initial: {}, tools, async execute() { executed++; return { ok: true, status: 'read', data: 7 }; },
    }; } });
    const f = await executorFixture(h);
    await f.call(TOOLS_LOAD, { apps: ['probe'] });
    assert.equal(executed, 0);
    assert.equal((await f.call('ProbeRead')).data, 7); assert.equal(executed, 1);
    remove();
    const next = await executorFixture(h, undefined, ['probe']);
    assert.equal((await next.call(TOOLS_LOAD, { apps: ['probe'] })).code, 'management_unavailable');
    assert.deepEqual(names(next.executor.getTools()), common);
    const currentTools = tools.map(tool => ({ ...tool, definition: structuredClone(tool.definition) }));
    currentTools[0].definition.function.parameters.properties = { version: { const: 2 } };
    h.registry.register({ id: 'probe', label: 'Probe', prompt: '', tools: currentTools, async open() { return {
        prompt: '', initial: {}, tools: currentTools, async execute() { return { ok: true, status: 'read', data: 8 }; },
    }; } });
    const restored = await executorFixture(h, undefined, ['probe']);
    assert.deepEqual(restored.executor.getTools().slice(common.length), currentTools.map(tool => tool.definition));
    assert.equal((await restored.call('ProbeRead', { version: 2 })).data, 8);
    assert.equal(executed, 1);
});

test('selection follows confirmed call arguments, including paged results and reused provider call IDs', () => {
    const group = (apps, outcome) => [
        { role: 'assistant', content: '', toolCalls: [
            { id: 'read', name: 'ChatRead', arguments: '{"from":0}' }, ...call(TOOLS_LOAD, { apps }).toolCalls,
        ] },
        { role: 'tool', toolName: 'ChatRead', toolCallId: 'read', content: '{"ok":true,"status":"read"}' },
        { role: 'tool', toolName: TOOLS_LOAD, toolCallId: 'call', content: JSON.stringify(outcome) },
    ];
    const turns = [{ toolMessages: [
        ...group(['world'], { ok: false, status: 'failed', code: 'tool_not_executed' }),
        ...group(['tasks'], { ok: false, status: 'unconfirmed', code: 'tool_result_unconfirmed' }),
        ...group(['map', 'world'], { ok: true, status: 'read', data: { reference: 'page', text: 'partial result' } }),
        ...group(['tasks', 'missing'], { ok: false, status: 'failed', code: 'management_unavailable' }),
    ] }, { toolMessages: group(['world'], { ok: true, status: 'read' }) }];
    assert.deepEqual(administratorLoadedApps(turns), ['map', 'world']);
    assert.deepEqual(administratorLoadedApps([]), []);
});

test('changed story floors block only the attempted write until all changed evidence is reread', async () => {
    const h = await administratorHarness(); let receipts = 0;
    const f = await executorFixture(h, async () => { receipts++; });
    await f.call(TOOLS_LOAD, { apps: ['world'] });
    assert.equal((await f.call('ChatRead', { from: 0, to: 1 })).status, 'read');
    assert.equal((await f.call('WorldEdit', { overview: 'already saved' })).status, 'saved');
    const writes = h.state.writes.length;
    h.state.messages[0].mes = 'edited story';
    h.state.messages[1].swipe_id++;
    const stale = await f.call('WorldEdit', { overview: 'stale rewrite' });
    assert.equal(stale.code, 'story_evidence_changed');
    assert.deepEqual(stale.data.floors, [0, 1]);
    assert.deepEqual(stale.data.missingFloors, []);
    assert.equal((await f.call('ChatRead', { from: 0 })).status, 'read');
    const partial = await f.call('WorldEdit', { overview: 'still stale' });
    assert.equal(partial.code, 'story_evidence_changed');
    assert.deepEqual(partial.data.floors, [1]);
    assert.equal(receipts, 1); assert.equal(h.state.writes.length, writes);
    assert.equal(h.world.readCurrent().world.overview, 'already saved');
    assert.equal((await f.call('ChatRead', { from: 1 })).status, 'read');
    assert.equal((await f.call('WorldEdit', { overview: 'fresh evidence' })).status, 'saved');
    assert.equal(receipts, 2); assert.equal(h.state.writes.length, writes + 1);
    assert.equal(h.world.readCurrent().world.overview, 'fresh evidence');
});

test('removed story floors remain blocked in this run but do not prevent a fresh request', async () => {
    const h = await administratorHarness(); let receipts = 0;
    const saveReceipts = async () => { receipts++; };
    const f = await executorFixture(h, saveReceipts);
    await f.call(TOOLS_LOAD, { apps: ['world'] });
    const last = h.state.messages.length - 1;
    assert.equal((await f.call('ChatRead', { from: last - 1, to: last })).status, 'read');
    h.state.messages.pop();
    h.state.messages[last - 1].mes = 'edited remaining floor';
    const writes = h.state.writes.length;
    const stale = await f.call('WorldEdit', { overview: 'stale rewrite' });
    assert.equal(stale.code, 'story_evidence_changed');
    assert.deepEqual(stale.data.floors, [last - 1, last]);
    assert.deepEqual(stale.data.missingFloors, [last]);
    assert.equal((await f.call('ChatRead', { from: last })).code, 'administrator_floor_missing');
    assert.equal((await f.call('ChatRead', { from: last - 1 })).status, 'read');
    const retry = await f.call('WorldEdit', { overview: 'still missing evidence' });
    assert.equal(retry.code, 'story_evidence_changed');
    assert.deepEqual(retry.data.floors, [last]);
    assert.deepEqual(retry.data.missingFloors, [last]);
    assert.equal(receipts, 0); assert.equal(h.state.writes.length, writes);
    const next = await executorFixture(h, saveReceipts);
    await next.call(TOOLS_LOAD, { apps: ['world'] });
    assert.equal((await next.call('ChatRead', { from: last - 1 })).status, 'read');
    assert.equal((await next.call('WorldEdit', { overview: 'current story' })).status, 'saved');
    assert.equal(receipts, 1); assert.equal(h.state.writes.length, writes + 1);
    assert.equal(h.world.readCurrent().world.overview, 'current story');
});

test('loading and loaded writes are cancelled on chat switch or stop without changing tools or records', async () => {
    for (const boundary of ['chat', 'stop']) {
        for (const tool of [TOOLS_LOAD, 'WorldEdit']) {
            const h = await administratorHarness(), f = await executorFixture(h);
            if (tool === 'WorldEdit') { await f.call(TOOLS_LOAD, { apps: ['world'] }); }
            const advertised = names(f.executor.getTools()), writes = h.state.writes.length;
            if (boundary === 'chat') { h.state.capture.identityKey = 'another-chat'; } else { f.abort.abort(); }
            await assert.rejects(f.call(tool, tool === TOOLS_LOAD ? { apps: ['map'] } : { overview: 'must not save' }),
                boundary === 'chat' ? { message: 'administrator_context_changed' } : { name: 'AbortError' });
            assert.deepEqual(names(f.executor.getTools()), advertised);
            assert.equal(h.state.writes.length, writes);
        }
    }
});

test('a newly loaded tool needs the next model request; later turns retain it but regenerating its first load resets it', async () => {
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
    h.state.generate = async request => { assert.ok(names(request.tools).includes('WorldEdit')); return { text: 'continued' }; };
    await h.request('send', { text: 'next question' }); await settled(h.runtime);
    assert.equal(h.repository.read().turns.at(-1).status, 'finished', h.runtime.error());
    h.state.generate = async request => { assert.deepEqual(names(request.tools), common); return { text: 'fresh' }; };
    await h.request('regenerate', { turnId: sent.turnId }); await settled(h.runtime);
    assert.equal(h.repository.read().turns[0].status, 'finished');
});

test('reopening and cold reload retain directly usable tools, summaries preserve selection, and clearing resets it', async () => {
    const h = await administratorHarness(), initialTools = h.runtime.context().tools;
    let step = 0;
    h.state.generate = async () => [call(TOOLS_LOAD, { apps: ['world'] }), call('WorldRead'), { text: 'done' }][step++];
    await h.request('send', { text: 'read world' }); await settled(h.runtime);
    assert.equal(h.repository.read().turns[0].status, 'finished', h.runtime.error());
    const saved = structuredClone(h.repository.read());
    const selectedTools = h.runtime.context().tools;
    assert.ok(selectedTools > initialTools);
    h.controller.deactivate();
    await h.controller.activate({ isCurrent: () => true, activationToken: 'reopened', post: () => true });
    assert.deepEqual(h.repository.read(), saved);
    assert.equal(h.runtime.context().tools, selectedTools);

    async function readDirectly(target) {
        const before = target.state.requests.length;
        let step = 0;
        target.state.generate = async request => {
            assert.ok(names(request.tools).includes('WorldRead'));
            if (++step === 1) { return call('WorldRead'); }
            assert.equal(result(request.messages, 'WorldRead').ok, true);
            return { text: 'done' };
        };
        await target.request('send', { text: 'read again' }); await settled(target.runtime);
        const turn = target.repository.read().turns.at(-1);
        assert.equal(turn.status, 'finished', target.runtime.error());
        assert.equal(target.state.requests.length - before, 2);
        assert.deepEqual(turn.toolMessages.flatMap(message => message.toolCalls ?? []).map(call => call.name), ['WorldRead']);
    }
    await readDirectly(h);
    const summarized = structuredClone(h.conversation.read());
    summarized.summary = { text: 'earlier facts', throughId: summarized.turns.at(-1).id, throughToolMessage: null };
    await h.conversation.save(summarized, () => true);
    const reload = await administratorHarness(h.state.persisted.partitions);
    assert.equal(reload.runtime.context().tools, selectedTools);
    assert.equal(reload.state.requests.length, 0);
    assert.equal(administratorContext(reload.repository.read()).messages.some(message => message.role === 'tool'), false);
    await readDirectly(reload);
    await reload.request('clear');
    assert.deepEqual(reload.repository.read().turns, []);
    assert.equal(reload.runtime.context().tools, initialTools);
    reload.state.generate = async request => { assert.deepEqual(names(request.tools), common); return { text: 'new conversation' }; };
    await reload.request('send', { text: 'start over' }); await settled(reload.runtime);
    assert.equal(reload.repository.read().turns[0].status, 'finished', reload.runtime.error());
});

test('regeneration inherits only preceding selections and deleting their reply removes those selections', async () => {
    const h = await administratorHarness();
    for (const app of ['world', 'map']) {
        let step = 0;
        h.state.generate = async () => ++step === 1 ? call(TOOLS_LOAD, { apps: [app] }) : { text: 'done' };
        await h.request('send', { text: app }); await settled(h.runtime);
        assert.equal(h.repository.read().turns.at(-1).status, 'finished', h.runtime.error());
    }
    const [first, second] = h.repository.read().turns;
    h.state.generate = async request => {
        assert.ok(names(request.tools).includes('WorldRead'));
        assert.equal(names(request.tools).includes('MapAtlasRead'), false);
        return { text: 'regenerated' };
    };
    await h.request('regenerate', { turnId: second.id }); await settled(h.runtime);
    assert.equal(h.repository.read().turns.at(-1).status, 'finished', h.runtime.error());
    await h.request('delete', { turnId: first.id, role: 'assistant', revision: h.repository.read().revision });
    h.state.generate = async request => { assert.deepEqual(names(request.tools), common); return { text: 'done' }; };
    await h.request('send', { text: 'continue' }); await settled(h.runtime);
    assert.equal(h.repository.read().turns.at(-1).status, 'finished', h.runtime.error());
});

test('switching to an empty chat resets selection and returning restores only that chat history', async () => {
    const h = await administratorHarness(), initialTools = h.runtime.context().tools;
    let step = 0;
    h.state.generate = async () => ++step === 1 ? call(TOOLS_LOAD, { apps: ['world'] }) : { text: 'done' };
    await h.request('send', { text: 'world' }); await settled(h.runtime);
    assert.equal(h.repository.read().turns[0].status, 'finished', h.runtime.error());
    const original = structuredClone(h.state.capture), selectedTools = h.runtime.context().tools;
    h.state.capture = { ...original, identityKey: 'other-chat', binding: { ...original.binding, chatId: 'other' }, reference: null };
    await h.controller.handleChatChanged();
    await h.controller.activate({ isCurrent: () => true, activationToken: 'other', post: () => true });
    assert.deepEqual(h.repository.read().turns, []);
    assert.equal(h.runtime.context().tools, initialTools);
    h.state.capture = original;
    await h.controller.handleChatChanged();
    await h.controller.activate({ isCurrent: () => true, activationToken: 'original', post: () => true });
    assert.equal(h.runtime.context().tools, selectedTools);
    h.state.generate = async request => { assert.ok(names(request.tools).includes('WorldRead')); return { text: 'continued' }; };
    await h.request('send', { text: 'continue' }); await settled(h.runtime);
    assert.equal(h.repository.read().turns.at(-1).status, 'finished', h.runtime.error());
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
    assert.deepEqual(initial, commonOnly);
    assert.ok(initial.tools < map.tools && map.tools < all.tools);
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
        assert.deepEqual(names(requests[0].tools), common);
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
            assert.deepEqual(creations[0].config.tools[0].functionDeclarations.map(tool => tool.name), common);
            assert.deepEqual(creations[1].config.tools[0].functionDeclarations.map(tool => tool.name), expected);
            assert.equal(requests[1].toolResponses, undefined);
            assert.equal(result(requests[1].messages, TOOLS_LOAD).status, 'read');
            assert.equal(creations[1].history.flatMap(message => message.parts).find(part => part.functionCall)?.thoughtSignature, 'fixture-signature');
            assert.ok(requests.slice(2).every(request => request.toolResponses && !request.messages.length));
        } else if (transport === 'native') {
            assert.deepEqual(names(wire[0].tools), common);
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
