import assert from 'node:assert/strict';
import test from 'node:test';
import { userEconomyHarness } from './user-economy-harness.js';
import { newJourney } from '../apps/game/island/world.ts';
import { LANDSCAPE } from '../apps/game/island/content.ts';
import { createIntentWork } from '../apps/game/island/intent-work.ts';
import { interpretPlayerIntent } from '../apps/game/island/agent/intent-runner.ts';
import { createIslandService } from '../apps/game/island/service.ts';
import { ISLAND_PARTITION } from '../apps/game/island/partition.ts';
import { record } from '../apps/game/island/experience.ts';
import { createIslandMemory, ISLAND_MEMORY_PARTITION } from '../apps/game/island/agent/memory-store.ts';
import { createIslandClient } from '../apps/game/island/client.ts';
import { withIslandRuntime } from '../apps/game/island/host.ts';

const allowed = () => true;
const call = (name, args, id = 'intent') => ({ id, name, arguments: JSON.stringify(args) });
const unwear = { kind: 'unwear', item: 'player-lifejacket' };
function gateway(replies, native = false) {
    const requests = [];
    return { requests, async loadConfig() { return {}; }, async openSession() {
        return { providerConfig: {}, supportsSessionToolLoop: native, async run(request) {
            requests.push(structuredClone({ ...request, signal: undefined }));
            const reply = replies.shift(); if (reply instanceof Error) { throw reply; } return reply;
        } };
    } };
}
async function setup(files) {
    const h = await userEconomyHarness({ files, additionalPartitions: [ISLAND_PARTITION, ISLAND_MEMORY_PARTITION] });
    await h.economy.ensureOpen();
    const store = h.store(ISLAND_PARTITION), service = createIslandService(store, h.transactions);
    const memory = createIslandMemory(h.store(ISLAND_MEMORY_PARTITION), h.transactions);
    await service.refresh();
    const request = () => ({ id: crypto.randomUUID(), revision: service.view().revision });
    if (service.view().phase === 'unstarted') { await service.start(request(), 'start', allowed); }
    return { ...h, store, service, memory, request };
}

for (const native of [false, true]) {
    test(`player interpreter ${native ? 'native' : 'history'} has player-only knowledge and never acts for any character`, async () => {
        const world = newJourney('intent-private'), h = await setup();
        record(world, { kind: 'speech', actor: 'lin', text: '林遥和周泽的秘密' }, world.people.lin.position, 'self', LANDSCAPE, ['lin', 'zhou']);
        record(world, { kind: 'speech', actor: 'player', text: '只有我自己记得的事' }, world.people.player.position, 'self', LANDSCAPE, ['player']);
        const before = structuredClone(world), work = createIntentWork(world, LANDSCAPE);
        const agent = gateway([
            { toolCalls: [call('ReadMemory', { sequence: 1 }, 'hidden'), call('ReadMemory', { sequence: 2 }, 'known'),
                call('Act', { actor: 'lin', operation: unwear }, 'authority')] },
            { toolCalls: [call('ProposeAction', { operation: unwear })] },
        ], native);
        await interpretPlayerIntent(work, '脱下救生衣', { agent, memory: h.memory, signal: new AbortController().signal, guard: allowed });
        const data = JSON.parse(agent.requests[0].messages[0].content);
        assert.deepEqual(data.observations.map(o => o.observer), ['player']);
        assert.deepEqual(data.recent.entries.map(e => e.sequence), [2]);
        assert.ok(data.people.every(p => Object.keys(p).length === 2));
        const responses = native ? agent.requests[1].toolResponses.map(r => r.response)
            : agent.requests[1].messages.filter(m => m.role === 'tool').map(m => JSON.parse(m.content));
        assert.equal(responses[0].code, 'island_memory_unavailable');
        assert.equal(responses[1].data.sequence, 2);
        assert.equal(responses[2].ok, false);
        assert.deepEqual(work.finish().operation, unwear);
        assert.deepEqual(world, before);
        assert.equal(agent.requests.length, 2);
    });
}

test('interpreter can clarify a physically impossible action without converting it into a world event', async () => {
    const h = await setup(), work = createIntentWork(h.store.peekCurrent().value.active, LANDSCAPE);
    const agent = gateway([
        { toolCalls: [call('ProposeAction', { operation: { kind: 'work', task: { kind: 'gather', source: 'center_seep', units: 1 } } })] },
        { toolCalls: [call('AskPlayer', { text: '这处水源还没发现。先沿林边查看吗？' })] },
    ]);
    await interpretPlayerIntent(work, '去接水', { agent, memory: h.memory, signal: new AbortController().signal, guard: allowed });
    const result = JSON.parse(agent.requests[1].messages.find(m => m.role === 'tool').content);
    assert.equal(result.code, 'island_unavailable');
    assert.equal(work.finish().kind, 'question');
    assert.equal(h.service.view().recent.length, 0); assert.equal(h.service.view().player.clock, 0);
});

test('two model results cannot silently pick one operation or turn a proposal into a queue', async () => {
    const h = await setup(), work = createIntentWork(h.store.peekCurrent().value.active, LANDSCAPE);
    const agent = gateway([{ toolCalls: [call('ProposeAction', { operation: unwear }),
        call('ProposeAction', { operation: { kind: 'rest', seconds: 60 } }, 'second')] }]);
    await assert.rejects(interpretPlayerIntent(work, '脱下救生衣再休息', { agent, memory: h.memory, signal: new AbortController().signal, guard: allowed }), { code: 'island_intent_multiple' });
    assert.equal(h.service.view().recent.length, 0); assert.equal(h.service.view().player.self.activity, null);
});

test('planning is ephemeral, exact-request rereads do not repurchase, and only confirmation commits', async () => {
    const h = await setup(), before = structuredClone(h.store.peekCurrent().value), request = h.request();
    let calls = 0;
    const run = async work => { calls++; work.propose(unwear); };
    await h.service.interpret(request, '脱下救生衣', run, allowed);
    await h.service.interpret(request, '脱下救生衣', run, allowed);
    assert.equal(calls, 1); assert.deepEqual(h.store.peekCurrent().value, before);
    assert.equal(h.service.view().intent.result.operation.item, 'player-lifejacket');
    const loaded = await setup(h.state.files);
    assert.equal(loaded.service.view().intent, null); assert.deepEqual(loaded.store.peekCurrent().value, before);
    await h.service.acceptIntent(request, allowed);
    await h.service.acceptIntent(request, allowed);
    assert.equal(h.service.view().intent, null); assert.equal(h.service.view().revision, before.revision + 1);
    assert.equal(h.service.view().recent.filter(e => e.payload.kind === 'unworn').length, 1);
    assert.equal(h.store.peekCurrent().value.active.items['player-lifejacket'].location.kind, 'carried');
    assert.equal(calls, 1);
});

test('clarification answers keep the original intent only within the same world revision', async () => {
    const h = await setup();
    await h.service.interpret(h.request(), '把衣服脱下', async work => { work.ask('要脱哪件？'); }, allowed);
    await h.service.interpret(h.request(), '救生衣', async (work, input, clarifications) => {
        assert.equal(input, '救生衣');
        assert.deepEqual(clarifications, [{ input: '把衣服脱下', question: '要脱哪件？' }]);
        work.propose(unwear);
    }, allowed);
    assert.equal(h.service.view().intent.clarifications.length, 1);
    await h.service.player(h.request(), { kind: 'say', text: '先等一会' }, allowed);
    await h.service.interpret(h.request(), '救生衣', async (work, _input, clarifications) => {
        assert.deepEqual(clarifications, []); work.ask('想怎样处理救生衣？');
    }, allowed);
    assert.equal(h.service.view().recent.length, 1);
});

test('a changed world invalidates a proposal; clarifications and dismissals cannot execute', async () => {
    const h = await setup(), proposal = h.request();
    await h.service.interpret(proposal, '脱下救生衣', async work => { work.propose(unwear); }, allowed);
    await h.service.player(h.request(), { kind: 'say', text: '先等一会' }, allowed);
    assert.equal(h.service.view().intent, null);
    await assert.rejects(h.service.acceptIntent(proposal, allowed), { code: 'island_stale' });
    const question = h.request();
    await h.service.interpret(question, '把东西给她', async work => { work.ask('哪件东西，递给谁？'); }, allowed);
    await assert.rejects(h.service.acceptIntent(question, allowed), { code: 'island_stale' });
    h.service.dismissIntent(question.id);
    assert.equal(h.service.view().intent, null);
    assert.equal(h.service.view().recent.length, 1);
});

for (const mode of ['rejected', 'unknown']) {
    test(`a ${mode} confirmation recovers the same operation without interpreting or auto-running again`, async () => {
        const h = await setup(), request = h.request(); let calls = 0;
        await h.service.interpret(request, '脱下救生衣', async work => { calls++; work.propose(unwear); }, allowed);
        h.state.mode = mode;
        await assert.rejects(h.service.acceptIntent(request, allowed), { code: `island_save_${mode === 'rejected' ? 'failed' : 'unconfirmed'}` });
        assert.equal(h.service.view().pending, true);
        h.state.mode = 'confirmed'; await h.service.confirm(allowed);
        assert.equal(h.service.view().intent, null); assert.equal(calls, 1);
        assert.equal(h.service.view().recent.filter(e => e.payload.kind === 'unworn').length, 1);
        assert.equal((await setup(h.state.files)).store.peekCurrent().value.active.items['player-lifejacket'].location.kind, 'carried');
    });
}

test('cancellation and provider failure leave no proposed operation or saved effect', async () => {
    const h = await setup(), before = structuredClone(h.store.peekCurrent().value);
    await assert.rejects(h.service.interpret(h.request(), '脱下救生衣', async work => {
        work.propose(unwear); throw new Error('provider-disconnected');
    }, allowed), /provider-disconnected/);
    let current = true;
    await assert.rejects(h.service.interpret(h.request(), '脱下救生衣', async work => {
        work.propose(unwear); current = false;
    }, () => current), { code: 'island_stale' });
    assert.deepEqual(h.store.peekCurrent().value, before); assert.equal(h.service.view().intent, null);
});

test('client reads an uncertain interpretation without repurchase and acknowledges confirmation after save recovery', async () => {
    const h = await setup();
    const agent = gateway([{ toolCalls: [call('ProposeAction', { operation: unwear })] }]);
    const listeners = new Set();
    const runtime = withIslandRuntime({}, h.service, h.memory, agent, () => 'story', allowed);
    await runtime.activate({ post: (type, payload) => { for (const listener of listeners) listener({ type, payload }); } });
    let loseInterpretReply = true;
    const bridge = {
        subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
        async request(type, payload) {
            const result = await runtime.handleMessage({ type, payload });
            if (type === 'game/island/interpret' && loseInterpretReply) { loseInterpretReply = false; throw Object.assign(new Error('timeout'), { code: 'host_request_timeout' }); }
            return { result };
        },
    };
    const client = createIslandClient(bridge, 'story'); await client.read();
    assert.equal(await client.interpret('脱下救生衣'), false); assert.equal(client.uncertain.value, true);
    await client.read(); assert.equal(client.view.value.intent.result.kind, 'action'); assert.equal(agent.requests.length, 1);
    let acknowledgements = 0; h.state.mode = 'rejected';
    assert.equal(await client.acceptIntent(() => { acknowledgements++; }), null);
    assert.equal(acknowledgements, 0); assert.equal(client.view.value.pending, true);
    h.state.mode = 'confirmed'; await client.recover(); await client.read();
    assert.equal(acknowledgements, 1); assert.equal(agent.requests.length, 1);
    assert.equal(client.view.value.intent, null); assert.equal(client.view.value.player.clock, 0);
    client.dispose();
});

test('Host cancellation aborts only the in-flight interpretation and publishes a settled unmodified world', async () => {
    const h = await setup(), before = structuredClone(h.store.peekCurrent().value);
    let entered;
    const ready = new Promise(resolve => { entered = resolve; });
    const agent = { async loadConfig() { return {}; }, async openSession() {
        return { providerConfig: {}, supportsSessionToolLoop: false, async run({ signal }) {
            return new Promise((_resolve, reject) => { signal.addEventListener('abort', () => reject(signal.reason), { once: true }); entered(); });
        } };
    } };
    const states = [], runtime = withIslandRuntime({}, h.service, h.memory, agent, () => 'story', allowed);
    await runtime.activate({ post: (_type, payload) => states.push(payload.state) });
    const request = h.request();
    const pending = runtime.handleMessage({ type: 'game/island/interpret', payload: { chatIdentity: 'story', actionId: request.id, revision: request.revision, text: '脱下救生衣' } });
    await ready;
    assert.equal(states.at(-1).interpreting, true);
    await runtime.handleMessage({ type: 'game/island/cancel', payload: { chatIdentity: 'story' } });
    await assert.rejects(pending, { code: 'island_cancelled' });
    assert.equal(states.at(-1).busy, false); assert.equal(states.at(-1).interpreting, false);
    assert.equal(states.at(-1).intent, null); assert.deepEqual(h.store.peekCurrent().value, before);
});
