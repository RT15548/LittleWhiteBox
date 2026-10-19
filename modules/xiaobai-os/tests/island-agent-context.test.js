import assert from 'node:assert/strict';
import test from 'node:test';
import { LANDSCAPE } from '../apps/game/island/content.ts';
import { createSceneWork } from '../apps/game/island/scene-work.ts';
import { createIntentWork } from '../apps/game/island/intent-work.ts';
import { newJourney } from '../apps/game/island/world.ts';
import { AGENT_POLICY as P } from '../apps/game/island/agent/policy.ts';
import { measureGmContext, runIslandGm } from '../apps/game/island/agent/runner.ts';
import { interpretPlayerIntent } from '../apps/game/island/agent/intent-runner.ts';
import { runIslandToolLoop } from '../apps/game/island/agent/tool-loop.ts';
import { estimateConversationTokens } from '../../agent-core/runtime/context-tokens.js';

const initial = { request: { goal: 'collect-water', pending: ['boil-water'] }, recent: { entries: [{ source: 42 }], earlier: true } };
const largeKnowledge = marker => ({ marker, text: 'evidence '.repeat(27_000) });
const call = (id, name, args = {}) => ({ id, name, arguments: JSON.stringify(args) });
const toolCall = (id, name, args) => ({ toolCalls: [call(id, name, args)] });
const tools = ['Act', 'ReadKnowledge', 'Observe'].map(name => ({ type: 'function', function: { name, parameters: { type: 'object', properties: {} } } }));
const knowledge = { observer: 'lin', source: 42, fact: 'spring-unsafe' };
const progress = { action: 'collect-water', status: 'done', pending: ['boil-water'] };
const summary = JSON.stringify({ knowledge, progress });
const count = request => estimateConversationTokens({ messages: [{ role: 'system', content: request.systemPrompt }, ...request.messages], tools: request.tools });

function loopGateway(responses, native = false) {
    const requests = [], sessions = [];
    const gateway = {
        async loadConfig() { return {}; },
        async openSession() {
            const session = { providerConfig: {}, supportsSessionToolLoop: native, async run(request) {
                requests.push({ ...structuredClone({ ...request, signal: undefined }), session });
                const next = responses.shift();
                assert.ok(next, 'No additional model request is authorized');
                return typeof next === 'function' ? await next(request) : next;
            } };
            sessions.push(session);
            return session;
        },
    };
    return { gateway, requests, sessions };
}
function loopOptions(gateway, overrides = {}) {
    return { agent: gateway, signal: new AbortController().signal, guard: () => true,
        prompt: 'Complete the original goal using tools.', tools, initial, formatInitial: JSON.stringify,
        complete: () => true, async execute(name) { return largeKnowledge(name); }, ...overrides };
}
function freshWorld() { return newJourney('fresh-six-npc', { name: '玩家', gender: 'female', appearanceAge: 'twenties' }); }

// Real world/prompt/schema generation, offline provider only. A 24K rejection must not
// recur even when the initial cast and complete observation page are present.
test('a fresh six-NPC scene reaches the model and completes with ample budget', async t => {
    const world = freshWorld(), work = createSceneWork(world, 'player', LANDSCAPE);
    const actors = work.scope().actors;
    const h = loopGateway([{ toolCalls: actors.map(actor => call(`rest-${actor}`, 'Act', { actor, operation: { kind: 'rest', seconds: 60 } })) }, { text: 'done' }]);
    const options = { agent: h.gateway, memory: {}, signal: new AbortController().signal, guard: () => true };
    const usage = await measureGmContext(work, options);
    assert.equal(actors.length, 6);
    assert.equal(usage.limit, 158_000);
    assert.equal(usage.refresh, 128_000);
    assert.ok(usage.used < usage.refresh);
    assert.ok(usage.limit - usage.used > P.outputTokens * 4);
    await runIslandGm(work, options);
    assert.equal(h.requests.length, 2);
    assert.equal(count(h.requests[0]), usage.used);
    assert.equal(h.requests[0].maxTokens, P.outputTokens);
    assert.equal(work.finish().operations.length, 6);
    assert.equal(world.experiences.length, 0);
    t.diagnostic(`Initial request ${usage.used} tokens, remaining ${usage.limit - usage.used}.`);
});

for (const native of [false, true]) {
    test(`${native ? 'native' : 'replayed'} compression retains original intent, old knowledge/actions and newest complete batch`, async () => {
        const executed = [], firstBatch = { toolCalls: [call('read', 'ReadKnowledge'), call('act', 'Act')] };
        const lastBatch = { toolCalls: [call('observe', 'Observe'), call('tail', 'Observe')] };
        const h = loopGateway([firstBatch, lastBatch, request => {
            assert.deepEqual(executed, ['ReadKnowledge', 'Act', 'Observe', 'Observe']);
            const source = JSON.parse(request.messages[0].content);
            assert.equal(source.originalRequest, JSON.stringify(initial));
            assert.equal(source.earlierToolKnowledge, null);
            assert.deepEqual(source.completedToolGroups.filter(m => m.role === 'tool').map(m => m.tool_call_id), ['read', 'act']);
            assert.deepEqual(JSON.parse(source.completedToolGroups[2].content).data, progress);
            assert.deepEqual(JSON.parse(source.completedToolGroups[1].content).data.knowledge, knowledge);
            assert.ok(count(request) + request.maxTokens <= P.inputTokens);
            return { text: summary };
        }, request => {
            assert.equal(request.messages[0].content, JSON.stringify(initial));
            assert.ok(request.messages.some(m => String(m.content).includes(JSON.stringify(summary))));
            assert.deepEqual(request.messages.filter(m => m.role === 'tool').map(m => m.tool_call_id), ['observe', 'tail']);
            assert.deepEqual(request.messages.find(m => m.role === 'assistant').tool_calls.map(c => c.id), ['observe', 'tail']);
            assert.equal(request.toolResponses, undefined);
            assert.ok(count(request) < P.contextRefreshTokens);
            return { text: 'done' };
        }], native);
        let reads = 0;
        await runIslandToolLoop(loopOptions(h.gateway, { async execute(name) {
            executed.push(name);
            if (name === 'Act') { return progress; }
            return ++reads <= 2 ? { ...largeKnowledge(name), knowledge } : { tail: true };
        } }));
        assert.deepEqual(executed, ['ReadKnowledge', 'Act', 'Observe', 'Observe']);
        assert.equal(h.requests.filter(r => r.tools.length > 0).length, 3);
        assert.equal(h.requests.length, 4);
        assert.notEqual(h.requests[2].session, h.requests[0].session);
        if (native) {
            assert.equal(h.requests[1].messages.length, 0);
            assert.equal(h.requests[1].toolResponses.length, 2);
            assert.notEqual(h.requests.at(-1).session, h.requests[0].session);
        } else {
            assert.equal(h.requests.at(-1).session, h.requests[0].session);
        }
    });
}

for (const [name, result] of [
    ['refused', { refused: true, text: summary }], ['empty', { text: '   ' }],
    ['tool call', { text: summary, ...toolCall('extra', 'Act') }],
    ['native-only tool call', { text: summary, provider: 'google', providerPayload: { googleContent: { parts: [{ functionCall: { name: 'Act', args: {} } }] } } }],
    ['incomplete', { text: summary, completion: 'incomplete' }], ['truncated', { text: summary, truncated: true }],
    ['nonshrinking', { text: 'evidence '.repeat(70_000) }],
]) {
    test(`a ${name} summary stops without executing or requesting another round`, async () => {
        const h = loopGateway([toolCall('read', 'ReadKnowledge'), toolCall('observe', 'Observe'), result]);
        const executed = [];
        await assert.rejects(runIslandToolLoop(loopOptions(h.gateway, { async execute(name) { executed.push(name); return largeKnowledge(name); } })), { code: 'island_context_refresh_failed' });
        assert.deepEqual(executed, ['ReadKnowledge', 'Observe']);
        assert.equal(h.requests.length, 3);
    });
}

for (const boundary of ['summary', 'reopen', 'execute']) {
    for (const failure of ['abort', 'stale']) {
        test(`${failure} at ${boundary} prevents later actions and model requests`, async () => {
            const controller = new AbortController(); let current = true;
            const stop = () => failure === 'abort' ? controller.abort() : current = false;
            const executed = [];
            const h = loopGateway([
                boundary === 'execute' ? { toolCalls: [call('first', 'Act'), call('second', 'Act')] } : toolCall('read', 'ReadKnowledge'),
                toolCall('observe', 'Observe'), () => { if (boundary === 'summary') { stop(); } return { text: summary }; },
            ], true);
            const openSession = h.gateway.openSession;
            h.gateway.openSession = async () => { const session = await openSession(); if (boundary === 'reopen' && h.sessions.length === 3) { stop(); } return session; };
            await assert.rejects(runIslandToolLoop(loopOptions(h.gateway, { signal: controller.signal, guard: () => current,
                async execute(name) { executed.push(name); if (boundary === 'execute') { stop(); } return largeKnowledge(name); },
            })), failure === 'abort' ? { name: 'AbortError' } : { code: 'island_stale' });
            assert.equal(h.requests.length, boundary === 'execute' ? 1 : 3);
            assert.equal(executed.length, boundary === 'execute' ? 1 : 2);
        });
    }
}

test('the last allowed tool round never purchases a useless summary', async () => {
    const h = loopGateway(Array.from({ length: P.rounds }, (_, i) => toolCall(String(i), 'ReadKnowledge')));
    let executed = 0;
    await assert.rejects(runIslandToolLoop(loopOptions(h.gateway, { async execute() {
        executed++; return executed >= P.rounds - 1 ? largeKnowledge(executed) : {};
    } })), { code: 'island_agent_limit' });
    assert.equal(executed, P.rounds);
    assert.equal(h.requests.length, P.rounds);
    assert.equal(h.sessions.length, 1);
});

test('a later compression carries forward the preceding knowledge summary', async () => {
    const h = loopGateway([toolCall('one', 'ReadKnowledge'), toolCall('two', 'Observe'), { text: summary },
        toolCall('three', 'Observe'), request => {
            const source = JSON.parse(request.messages[0].content);
            assert.equal(source.earlierToolKnowledge, summary);
            assert.deepEqual(source.completedToolGroups.filter(m => m.role === 'tool').map(m => m.tool_call_id), ['two']);
            return { text: summary };
        }, { text: 'done' }], true);
    await runIslandToolLoop(loopOptions(h.gateway));
    assert.equal(h.requests.length, 6);
    assert.equal(h.sessions.length, 5);
});

for (const native of [false, true]) {
    test(`intent runner uses compressed context and stops on confirmation without executing it (${native})`, async () => {
        const world = freshWorld(), original = structuredClone(world), work = createIntentWork(world, LANDSCAPE);
        const intent = '休息一分钟', clarifications = [{ input: '休息', question: '休息多久？' }];
        // Large knowledge pages exercise the shared loop while the intent work/proposal are real.
        const h = loopGateway([toolCall('one', 'ReadMemory', { observer: 'player', sequence: 1 }),
            toolCall('two', 'ReadMemory', { observer: 'player', sequence: 2 }), { text: summary }, request => {
                const first = JSON.parse(request.messages[0].content);
                assert.equal(first.intent, intent);
                assert.deepEqual(first.clarifications, clarifications);
                return toolCall('propose', 'ProposeAction', { operation: { kind: 'rest', seconds: 60 } });
            }], native);
        await interpretPlayerIntent({ ...work, read: () => largeKnowledge('memory') }, intent,
            { agent: h.gateway, memory: {}, signal: new AbortController().signal, guard: () => true }, clarifications);
        assert.equal(work.finish().kind, 'action');
        assert.deepEqual(work.finish().operation, { kind: 'rest', seconds: 60 });
        assert.deepEqual(world, original);
        assert.equal(h.requests.length, 4);
    });
}

test('an oversized immutable initial request fails without dropping entries or calling the model', async () => {
    const h = loopGateway([]), source = { ...initial, recent: { entries: [largeKnowledge('one'), largeKnowledge('two'), largeKnowledge('three')], earlier: false } };
    const original = structuredClone(source);
    await assert.rejects(runIslandToolLoop(loopOptions(h.gateway, { initial: source })), { code: 'island_context_full' });
    assert.equal(h.requests.length, 0);
    assert.deepEqual(source, original);
});
