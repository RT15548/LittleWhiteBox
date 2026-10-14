import assert from 'node:assert/strict';
import test from 'node:test';
import { userEconomyHarness } from './user-economy-harness.js';
import { newJourney } from '../apps/game/island/world.ts';
import { LANDSCAPE } from '../apps/game/island/content.ts';
import { PERSON_IDS } from '../apps/game/island/model.ts';
import { createSceneWork } from '../apps/game/island/scene-work.ts';
import { operate } from '../apps/game/island/operations.ts';
import { runIslandGm } from '../apps/game/island/agent/runner.ts';
import { createIslandMemory, ISLAND_MEMORY_PARTITION } from '../apps/game/island/agent/memory-store.ts';
import { record } from '../apps/game/island/experience.ts';
import { AGENT_POLICY } from '../apps/game/island/agent/policy.ts';
import { SURVIVAL } from '../apps/game/island/survival-content.ts';
import { createItem } from '../apps/game/island/inventory.ts';

const call = (name, args, id = 'call') => ({ id, name, arguments: JSON.stringify(args) });
function gateway(replies, native = false) {
    const requests = [];
    return { requests, async loadConfig() { return {}; }, async openSession() {
        return { providerConfig: {}, supportsSessionToolLoop: native, async run(request) {
            requests.push(structuredClone({ ...request, signal: undefined }));
            const reply = replies.shift(); if (reply instanceof Error) throw reply; return reply;
        } };
    } };
}
async function memoryHarness(files) {
    const h = await userEconomyHarness({ files, additionalPartitions: [ISLAND_MEMORY_PARTITION] });
    await h.economy.ensureOpen();
    const memory = createIslandMemory(h.store(ISLAND_MEMORY_PARTITION), h.transactions);
    return { ...h, memory };
}
const options = (agent, memory, extra = {}) => ({ agent, memory, signal: new AbortController().signal, guard: () => true, ...extra });
const restAll = () => PERSON_IDS.filter(id => id !== 'player').map(id => call('Act', { actor: id, operation: { kind: 'rest', seconds: 120 } }, id));

for (const native of [false, true]) {
    test(`GM ${native ? 'native-session' : 'message-history'} loop submits six independent real activities and has no map-wide private signature`, async () => {
        const source = newJourney('agent'), work = createSceneWork(source, 'player', LANDSCAPE), h = await memoryHarness();
        const agent = gateway([{ toolCalls: restAll() }, { text: 'done' }], native);
        await runIslandGm(work, options(agent, h.memory));
        const candidate = work.finish().world;
        assert.equal(source.people.lin.activity, null); assert.equal(candidate.people.lin.activity.until, 120); assert.equal(candidate.clock, 0);
        assert.equal(candidate.people.player.activity, null);
        const data = JSON.parse(agent.requests[0].messages[0].content);
        assert.equal(Object.hasOwn(data.scope, 'signature'), false); assert.equal(data.observations.some(o => o.observer === 'player'), false);
        assert.equal(data.physiology.thirstSignal, SURVIVAL.thirstSignal);
        if (native) { assert.equal(agent.requests[1].messages.length, 0); assert.equal(agent.requests[1].toolResponses.length, 6); }
        else { assert.equal(agent.requests[1].messages.filter(m => m.role === 'tool').length, 6); }
    });
}

test('provider failure never saves an unfinished GM candidate, and an empty or idle-only reply is not completion', async () => {
    const w = newJourney('agent'), h = await memoryHarness();
    for (const replies of [[{ text: 'no tools' }], [{ toolCalls: [call('Act', { actor: 'lin', operation: { kind: 'say', text: '一句话' } })] }, { text: 'done' }]]) {
        const work = createSceneWork(w, 'player', LANDSCAPE);
        await assert.rejects(runIslandGm(work, options(gateway(replies), h.memory)), { code: 'island_agent_empty' });
        assert.equal(w.experiences.length, 0);
    }
    await assert.rejects(runIslandGm(createSceneWork(w, 'player', LANDSCAPE), options(gateway([{ toolCalls: restAll() }, new Error('provider-offline')]), h.memory)), /provider-offline/);
    assert.equal(w.people.lin.activity, null);
});

test('a missing physical tool is returned to the GM for a new decision without discarding the whole scene', async () => {
    const w = newJourney('missing-tool'), coconut = createItem(w, 'lin', 'coconut', 1);
    const work = createSceneWork(w, 'player', LANDSCAPE), h = await memoryHarness();
    const agent = gateway([{ toolCalls: [call('Act', { actor: 'lin', operation: { kind: 'work', task: { kind: 'craft', recipe: 'open_coconut', materials: [{ item: coconut, units: 1 }] } } })] },
        { toolCalls: restAll() }, { text: 'done' }]);
    await runIslandGm(work, options(agent, h.memory));
    const result = JSON.parse(agent.requests[1].messages.find(m => m.role === 'tool').content);
    assert.deepEqual(result, { ok: false, code: 'island_tool_missing' });
    assert.equal(work.finish().world.people.lin.activity.kind, 'rest');
    assert.equal(work.finish().world.items[coconut].quantity, 1);
});

test('a long original history stays out of initial context while an old source remains readable and private sources remain unavailable', async () => {
    const w = newJourney('long-history');
    record(w, { kind: 'speech', actor: 'lin', text: '旧约定：金属杯放在西岸树下，谁取走谁告诉对方。' }, w.people.lin.position, 'self', LANDSCAPE, ['lin', 'zhou']);
    record(w, { kind: 'speech', actor: 'player', text: '独自藏下的私事。' }, w.people.player.position, 'self', LANDSCAPE, ['player']);
    for (let i = 0; i < 12000; i++) record(w, { kind: 'speech', actor: 'lin', text: `第${i}段可知的现场交谈。${'海边的事仍在继续。'.repeat(12)}` }, w.people.lin.position, 'self', LANDSCAPE, ['lin']);
    const agent = gateway([{ toolCalls: [call('ReadMemory', { sequence: 1 }, 'old'), call('ReadMemory', { sequence: 2 }, 'private'), ...restAll()] }, { text: 'done' }]);
    await runIslandGm(createSceneWork(w, 'player', LANDSCAPE), options(agent, (await memoryHarness()).memory));
    const initial = JSON.parse(agent.requests[0].messages[0].content);
    assert.equal(initial.recent.earlier, true);
    assert.ok(initial.recent.entries.length < 100);
    assert.ok(initial.recent.entries.reduce((sum, e) => sum + JSON.stringify(e).length, 0) <= AGENT_POLICY.recentCharacters);
    assert.equal(initial.recent.entries.some(e => e.sequence === 1 || e.sequence === 2), false);
    const replies = agent.requests[1].messages.filter(m => m.role === 'tool').map(m => JSON.parse(m.content));
    assert.equal(replies[0].data.sequence, 1); assert.deepEqual(replies[0].data.audience, ['lin', 'zhou']);
    assert.deepEqual(replies[1], { ok: false, code: 'island_memory_unavailable' });
});

test('a tool read cannot use player-only knowledge, while known original statements remain attributed', async () => {
    let w = newJourney('private');
    w = operate(w, { kind: 'player' }, 'player', { kind: 'say', text: '共有的旧事' }, LANDSCAPE);
    const savedPosition = w.people.player.position; w.people.player.position = { x: -490, y: -180 };
    w = operate(w, { kind: 'player' }, 'player', { kind: 'say', text: '玩家独知' }, LANDSCAPE); w.people.player.position = savedPosition;
    const agent = gateway([{ toolCalls: [call('ReadMemory', { sequence: 2 }, 'secret'), call('ReadMemory', { sequence: 1 }, 'known'), ...restAll()] }, { text: 'done' }]);
    await runIslandGm(createSceneWork(w, 'player', LANDSCAPE), options(agent, (await memoryHarness()).memory));
    const responses = agent.requests[1].messages.filter(m => m.role === 'tool').map(m => JSON.parse(m.content));
    assert.deepEqual(responses[0], { ok: false, code: 'island_memory_unavailable' });
    assert.equal(responses[1].data.payload.actor, 'player'); assert.equal(responses[1].data.sequence, 1);
    const initial = JSON.parse(agent.requests[0].messages[0].content);
    assert.deepEqual(initial.recent.entries.map(e => e.sequence), [1]);
});

test('GM tools act on attributed cooperation records without deciding for the player', async () => {
    let w = newJourney('cooperation-agent');
    w = operate(w, { kind: 'player' }, 'player', { kind: 'declare', text: '我负责收集椰子，愿意一起分担取水。', choice: { kind: 'proposal' } }, LANDSCAPE);
    const work = createSceneWork(w, 'player', LANDSCAPE);
    const agent = gateway([{ toolCalls: [
        call('Act', { actor: 'lin', operation: { kind: 'declare', text: '我愿意去接水。', choice: { kind: 'response', proposal: 1, stance: 'accept' } } }, 'reply'),
        call('Act', { actor: 'zhou', operation: { kind: 'declare', text: '我听见她的回应了。', choice: { kind: 'relay', reference: 2 } } }, 'relay'),
        call('Act', { actor: 'player', operation: { kind: 'declare', text: '替玩家改变主意。', choice: { kind: 'response', proposal: 1, stance: 'decline' } } }, 'forbidden'),
        ...restAll(),
    ] }, { text: 'done' }]);
    await runIslandGm(work, options(agent, (await memoryHarness()).memory));
    const injected = JSON.parse(agent.requests[0].messages[0].content);
    assert.equal(injected.observations.find(o => o.observer === 'lin').agreements[0].proposal, 1);
    const replies = agent.requests[1].messages.filter(m => m.role === 'tool').map(m => JSON.parse(m.content));
    assert.equal(replies[0].ok, true); assert.equal(replies[1].ok, true);
    assert.deepEqual(replies[2], { ok: false, code: 'island_authority' });
    const known = work.context().find(o => o.observer === 'lin').agreements[0];
    assert.deepEqual(known.commitments.map(s => [s.actor, s.stance]), [['player', 'accept'], ['lin', 'accept']]);
    assert.equal(work.read(3).shared.reference, 2);
    assert.equal(w.experiences.length, 1);
});

test('long private plans and public declarations remain readable without overflowing the initial observation page', () => {
    const w = newJourney('long-statements');
    const text = 'a'.repeat(AGENT_POLICY.statementPreviewCharacters - 1) + '🌴' + '记住取水约定。'.repeat(800);
    for (const actor of PERSON_IDS.filter(id => id !== 'player')) {
        record(w, { kind: 'intention', actor, text }, w.people[actor].position, 'self', LANDSCAPE, [actor]);
        record(w, { kind: 'declaration', actor, text, choice: { kind: 'support', person: 'player', stance: 'with' } }, w.people[actor].position, 'sound', LANDSCAPE, [actor]);
    }
    const work = createSceneWork(w, 'player', LANDSCAPE), page = work.context();
    assert.ok(JSON.stringify(page).length <= AGENT_POLICY.observationCharacters);
    for (const obs of page) {
        assert.equal(obs.intention.textTruncated, true);
        assert.equal(obs.intention.payload.text.length, AGENT_POLICY.statementPreviewCharacters - 1);
        assert.equal(work.read(obs.intention.sequence).payload.text, text);
        assert.ok(obs.declarations.every(e => e.textTruncated));
        assert.deepEqual(obs.intention.audience, [obs.observer]);
    }
});

test('paid embedding outputs persist, reload reuses them, and a different model space cannot reuse old vectors', async () => {
    const h = await memoryHarness(), inputs = [{ chunk: 'run:1:0', digest: 'a'.repeat(64), text: 'original' }];
    let count = 0;
    const connection = { space: 'space-a', async embed(texts) { count += texts.length; return texts.map(() => [1, 0]); } };
    await h.memory.index('run', inputs, connection, new AbortController().signal, () => true);
    const loaded = await memoryHarness(h.state.files);
    await loaded.memory.index('run', inputs, connection, new AbortController().signal, () => true); assert.equal(count, 1);
    const index = await loaded.memory.index('run', inputs, { ...connection, space: 'space-b' }, new AbortController().signal, () => true);
    assert.equal(count, 2); assert.equal(index.space, 'space-b');
    const next = await loaded.memory.index('other-run', [{ ...inputs[0], chunk: 'other-run:1:0' }], connection, new AbortController().signal, () => true);
    assert.deepEqual(next.entries.map(e => e.chunk), ['other-run:1:0']);
});

test('failed vector save retains the paid result and confirmation does not re-embed it', async () => {
    const h = await memoryHarness(); h.state.mode = 'rejected'; let calls = 0;
    const connection = { space: 'space', async embed() { calls++; return [[.4, .8]]; } }, inputs = [{ chunk: 'run:1:0', digest: 'b'.repeat(64), text: 'original' }];
    await assert.rejects(h.memory.index('run', inputs, connection, new AbortController().signal, () => true), { code: 'island_memory_save' });
    assert.equal(h.memory.pending(), true); h.state.mode = 'confirmed'; await h.memory.confirm(() => true);
    const index = await h.memory.index('run', inputs, connection, new AbortController().signal, () => true);
    assert.equal(index.entries.length, 1); assert.equal(calls, 1);
});
