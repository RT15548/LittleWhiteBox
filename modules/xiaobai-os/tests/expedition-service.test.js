import assert from 'node:assert/strict';
import test from 'node:test';
import { journey } from './fixtures/expedition-traveler.js';
import { setImmediate } from 'node:timers';
import { userEconomyHarness } from './user-economy-harness.js';
import { EXPEDITION_PARTITION } from '../apps/game/expedition/partition.ts';
import { createExpeditionService } from '../apps/game/expedition/service.ts';
import { RULES } from '../apps/game/expedition/content.ts';
import { campaignDriver } from './fixtures/campaign-driver.mjs';
import { narrativeOptions, narrativeReply, inspectNarrativePrompt } from './fixtures/expedition-narrative.js';
import { withExpeditionRuntime } from '../apps/game/expedition/host.ts';
import { createExpeditionClient } from '../apps/game/expedition/client.ts';
import { conversationContext } from '../apps/game/expedition/narrative/prompt.ts';
import { courtyardBattle } from '../apps/game/expedition/content/courtyard-encounters.ts';
import { decodeNarrativeReply } from '../apps/game/expedition/narrative/response.ts';
import { pendingEnding } from '../apps/game/expedition/campaign/reply-checkpoint.ts';
const start = { type: 'start', weapon: 'blade', outfit: 'traveler', ...journey };
async function setup(files, dependencies = {}) {
    const h = await userEconomyHarness({ files }); await h.economy.ensureOpen();
    const service = createExpeditionService(h.store(EXPEDITION_PARTITION), h.transactions, h.economy, { seed: () => 7, ...narrativeOptions, ...dependencies });
    await service.refresh();
    const request = command => ({ actionId: crypto.randomUUID(), revision: service.view().data.revision, command });
    const act = command => service.act(request(command), () => true);
    return { ...h, service, request, act, driver: campaignDriver(() => service.view().data.active, act) };
}

test('complete chapter commits rescue, ending, equipment and wallet rewards and survives a real file reload', async () => {
    const h = await setup(), balance = h.service.view().balance;
    const begin = h.request(start); await h.service.act(begin, () => true); await h.service.act(begin, () => true);
    await h.driver.complete('waterway');
    const end = h.service.view();
    assert.ok(end.data.active.facts.includes('chapter_completed'));
    assert.equal(end.data.active.evidence.dispatchNoteSeen, true);
    const withoutEvidence = structuredClone(end.data.active); withoutEvidence.evidence.dispatchNoteSeen = false;
    for (const id of Object.keys(end.data.active.conversations)) {
        assert.deepEqual(conversationContext(end.data.active, id), conversationContext(withoutEvidence, id));
    }
    assert.equal(end.balance, balance + RULES.firstBossAward + 1000);
    assert.deepEqual(Object.fromEntries(end.data.awards.map(a => [a.key, a.amount])), {
        'boss-0': 80, 'chapter-one': 200, 'cells-opened': 200, 'rescue-returned': 300, 'supplies-received': 300,
    });
    const reloaded = await setup(h.state.files); assert.deepEqual(reloaded.service.view().data, end.data);
    await assert.rejects(reloaded.act({ type: 'choice', id: 'finish', person: 'sanniang' })); assert.equal(reloaded.service.view().balance, end.balance);
    await reloaded.act({ ...start, type: 'restart' }); await reloaded.driver.complete('waterway');
    assert.deepEqual(reloaded.service.view().data.awards, end.data.awards);
    assert.equal(reloaded.service.view().balance, end.balance);
});

for (const mode of ['rejected', 'unknown']) {
    test(`a ${mode} rescue-milestone save recovers its original wallet payment exactly once`, async () => {
        const h = await setup(); await h.act(start);
        await h.driver.walk('clinic'); await h.act({ type: 'choice', id: 'briefing', person: 'sanniang' });
        await h.driver.interact('road'); await h.driver.interact('waterway'); await h.driver.interact('sluice');
        await h.driver.interact('cells'); await h.driver.walk('release');
        const before = h.service.view(), open = h.request({ type: 'interact', id: 'release' });
        h.state.mode = mode; await assert.rejects(h.service.act(open, () => true));
        h.state.mode = 'confirmed'; await h.service.confirm(() => true);
        const paid = h.service.view(); assert.equal(paid.balance, before.balance + 200);
        assert.equal(paid.data.awards.filter(a => a.key === 'cells-opened').length, 1);
        await h.service.act(open, () => true); assert.equal(h.service.view().balance, paid.balance);
        const loaded = await setup(h.state.files); assert.deepEqual(loaded.service.view().data, paid.data);
        assert.equal(loaded.service.view().balance, paid.balance);
    });
}

test('both persuaded and mixed routes finish; Chang suppresses already-raised reinforcements after a failed-save recovery', async () => {
    for (const persuadeGate of [true, false]) {
        let response = { reply: 'fixture', affection: 'up' }, calls = 0;
        const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: async () => {
            calls++; return { text: narrativeReply(response) };
        } }) };
        let h = await setup(undefined, { agent }); await h.act(start);
        const talk = person => h.service.converse({ actionId: crypto.randomUUID(), revision: h.service.view().data.revision, person, text: 'fixture' }, () => true, new AbortController().signal);
        await h.driver.walk('clinic'); await h.act({ type: 'choice', id: 'briefing', person: 'sanniang' });
        for (const [person, anchor] of [['sanniang', 'clinic'], ...(persuadeGate ? [['laobai', 'guard']] : [])]) {
            await h.driver.walk(anchor); response = { reply: 'fixture', affection: 'up' };
            while (h.service.view().data.active.relationships[person].affection < 81) { await talk(person); }
            response = { reply: 'fixture', action: 'share_secret' }; await talk(person);
        }
        await h.driver.walk('guard'); await h.act({ type: 'choice', id: 'receiving', person: 'laobai' });
        await h.driver.interact('road'); await h.driver.interact('gate');
        if (persuadeGate) {
            await h.driver.walk('parley'); response = { reply: 'fixture', action: 'pass' }; await talk('bajin');
            await h.act({ type: 'resolve_parley' });
        }
        await h.driver.interact('beacon'); await h.driver.walk('parley');
        response = { reply: 'fixture' }; await talk('changyounian');
        await h.driver.interact('gate'); await h.driver.interact('crossroads');
        await h.driver.interact('waterway'); await h.driver.interact('sluice'); await h.driver.interact('cells');
        await h.driver.walk('anian_talk'); await talk('anian');
        const captiveTurns = h.service.view().data.active.conversations.anian.length;
        await h.driver.interact('release'); await h.driver.interact('postern_latch'); await h.driver.interact('postern');
        assert.equal(h.service.view().data.active.conversations.anian.length, captiveTurns);
        assert.ok(h.service.view().data.active.facts.includes('alarm_raised'));
        await h.driver.interact('rest'); await h.driver.interact('road'); await h.driver.interact('gate'); await h.driver.interact('beacon'); await h.driver.walk('parley');
        assert.equal(h.service.view().data.active.conversations.changyounian.filter(t => t.kind === 'dialogue').length, 1);
        response = { reply: 'fixture', action: 'pass' }; h.state.mode = 'rejected';
        await assert.rejects(talk('changyounian'), { code: 'expedition_save_failed' }); const before = calls;
        h.state.mode = 'confirmed'; await h.service.confirm(() => true); h = await setup(h.state.files, { agent });
        assert.equal(calls, before); assert.equal(h.service.view().data.active.pendingParley.enemy, 'changyounian');
        await h.act({ type: 'resolve_parley' });
        const c = h.service.view().data.active;
        assert.ok(c.facts.includes('alarm_silenced')); assert.equal(c.conversations.changyounian.filter(t => t.kind === 'dialogue').length, 2);
        await h.driver.interact('hall'); await h.driver.walk('encounter', false);
        const fight = h.service.view().data.active;
        assert.equal(fight.phase, 'battle');
        assert.deepEqual(courtyardBattle('hall', new Set(fight.facts), fight.location.position, 7, fight.hp, false).field.waves[0].map(e => e.kind), ['warden']);
        assert.deepEqual(fight.battle.enemies.map(e => e.kind), ['warden']);
        await h.driver.battle(); await h.driver.interact('cells'); await h.driver.interact('postern'); await h.driver.interact('cargo');
        await h.driver.walk('clinic'); await h.act({ type: 'choice', id: 'finish', person: 'sanniang' });
        const end = h.service.view().data; h = await setup(h.state.files, { agent }); assert.deepEqual(h.service.view().data, end);
        assert.equal(end.active.facts.filter(f => f === 'changyounian_passed').length, 1);
        assert.equal(end.active.facts.includes('bajin_passed'), persuadeGate); assert.ok(end.active.facts.includes('chapter_completed'));
    }
});

test('rejected save retains the original candidate; confirmation cannot buy a reroll or duplicate action', async () => {
    let draws = 0; const h = await setup(undefined, { seed: () => { draws++; return 7; } });
    const request = h.request(start); h.state.mode = 'rejected';
    await assert.rejects(h.service.act(request, () => true), { code: 'expedition_save_failed' });
    assert.equal(h.service.view().data.active, null); assert.equal(h.service.view().pending, true);
    h.state.mode = 'confirmed'; await h.service.confirm(() => true);
    assert.equal(draws, 1); assert.equal(h.service.view().data.active.id, request.actionId);
    await h.service.act(request, () => true); assert.equal(draws, 1); assert.equal(h.service.view().data.revision, 1);
    await assert.rejects(h.service.act({ ...request, command: { ...start, outfit: 'guardian' } }, () => true), { code: 'expedition_identity' });
});

test('world position survives chat changes and stale or oversized commands cannot alter it', async () => {
    const h = await setup(); await h.act(start);
    const input = h.request({ type: 'input', spans: [{ move: 3, dash: false, skill: false, ticks: 120 }] });
    await h.service.act(input, () => true); const checkpoint = h.service.view().data;
    h.switchStory('b'); await h.service.refresh(); assert.deepEqual(h.service.view().data, checkpoint);
    await assert.rejects(h.service.act({ ...input, actionId: 'stale-action' }, () => true), { code: 'expedition_stale' });
    await assert.rejects(h.act({ type: 'input', spans: [{ move: 3, dash: false, skill: false, ticks: 1e9 }] }), { code: 'expedition_invalid' });
    const restored = await setup(h.state.files); assert.deepEqual(restored.service.view().data.active, checkpoint.active);
});

test('main generation and identity guards block writes without consuming a seed', async () => {
    let idle = false, draws = 0;
    const h = await setup(undefined, { idle: () => idle, seed: () => { draws++; return 7; } });
    await assert.rejects(h.act(start), { code: 'expedition_unavailable' }); idle = true;
    await assert.rejects(h.service.act(h.request(start), () => false), { code: 'expedition_unavailable' }); assert.equal(draws, 0);
});

test('NPC dialogue and allowed action commit atomically; unknown save confirmation never repeats a paid call', async () => {
    let calls = 0, captured;
    const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: async request => {
        calls++; captured = request; return { text: narrativeReply({ reply: '我在这里等你回来。', action: 'briefing', affection: 'up' }) };
    } }) };
    const h = await setup(undefined, { agent }); await h.act(start); await h.driver.walk('clinic');
    const input = { actionId: 'conversation-one', revision: h.service.view().data.revision, person: 'sanniang', text: '我去把他们带回来。' };
    h.state.mode = 'unknown';
    await assert.rejects(h.service.converse(input, () => true, new AbortController().signal));
    assert.equal(h.service.view().data.active.conversations.sanniang.length, 0);
    assert.equal(h.service.view().data.active.facts.includes('briefed'), false);
    h.state.mode = 'confirmed'; await h.service.confirm(() => true);
    const c = h.service.view().data.active; assert.equal(c.conversations.sanniang.filter(t => t.kind === 'dialogue').length, 1); assert.ok(c.facts.includes('briefed')); assert.equal(calls, 1);
    assert.ok(c.relationships.sanniang.affection >= 2 && c.relationships.sanniang.affection <= 4);
    assert.equal(c.conversations.sanniang.at(-1).affectionDelta, c.relationships.sanniang.affection);
    assert.equal(h.service.view().replyFailure, null);
    assert.equal(c.conversations.sanniang.at(-1).action, 'briefing'); assert.equal(c.conversations.sanniang.at(-1).reply, '我在这里等你回来。');
    await h.service.converse(input, () => true, new AbortController().signal); assert.equal(calls, 1);
    assert.equal(h.service.view().data.active.relationships.sanniang.affection, c.relationships.sanniang.affection);
    const restored = await setup(h.state.files, { agent }); assert.deepEqual(restored.service.view().data.active, c);
    assert.equal(inspectNarrativePrompt(captured).input, input.text);
    assert.equal(c.conversations.sanniang.at(-1).player, input.text);
    const actions = inspectNarrativePrompt(captured).operations.actions;
    assert.ok(Object.hasOwn(actions, 'briefing'));
    assert.ok(Object.hasOwn(actions, 'follow'));
});

test('model errors, invalid actions, cancellation and changed identity never fabricate saved dialogue', async () => {
    let respond;
    const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' },
        run: async () => new Promise(resolve => { respond = resolve; }) }) };
    const h = await setup(undefined, { agent }); await h.act(start); await h.driver.walk('clinic');
    let current = true;
    const request = { actionId: 'cancelled-conversation', revision: h.service.view().data.revision, person: 'sanniang', text: '等一等。' };
    const controller = new AbortController(), pending = h.service.converse(request, () => current, controller.signal);
    while (!respond) { await new Promise(resolve => setImmediate(resolve)); }
    current = false; controller.abort(); respond({ text: narrativeReply({ reply: '应当被丢弃', action: null }) });
    await assert.rejects(pending); assert.equal(h.service.view().data.active.conversations.sanniang.length, 0);
    assert.equal(h.service.view().data.revision, request.revision);
});

test('cancelling while a reply save fails does not poison its retained candidate or shared-file writes', async () => {
    let calls = 0;
    const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: async () => {
        calls++; return { text: narrativeReply({ reply: 'received', action: 'briefing', affection: 'up' }) };
    } }) };
    const h = await setup(undefined, { agent }); await h.act(start); await h.driver.walk('clinic');
    const controller = new AbortController(); let began, rejectSave;
    const uploading = new Promise(resolve => { began = resolve; }), replace = h.storage.replace;
    h.storage.replace = () => { began(); return new Promise((_, reject) => { rejectSave = reject; }); };
    const pending = h.service.converse({ actionId: 'cancel-during-save', revision: h.service.view().data.revision,
        person: 'sanniang', text: 'hello' }, () => true, controller.signal);
    const rejected = assert.rejects(pending, { code: 'expedition_save_failed' });
    await uploading; controller.abort(); rejectSave(Object.assign(new Error('rejected'), { httpStatus: 403 })); await rejected;
    assert.equal(h.service.view().pending, true); h.storage.replace = replace;
    await h.service.confirm(() => true);
    const recovered = h.service.view(); assert.equal(recovered.pending, false); assert.equal(recovered.writeState, 'ready');
    assert.ok(recovered.data.active.facts.includes('briefed')); assert.equal(calls, 1);
    const affection = recovered.data.active.relationships.sanniang.affection;
    await h.service.confirm(() => true); assert.equal(h.service.view().data.active.relationships.sanniang.affection, affection);
    await h.act({ type: 'loadout', equipped: [] });
    assert.equal(h.service.view().data.active.conversations.sanniang.filter(t => t.id === 'cancel-during-save').length, 1);
});

test('rejected actions and raw receipts survive reload without fictional facts, affection or a replacement model request', async () => {
    let calls = 0, response = { text: narrativeReply({ reply: 'received', action: 'finish' }) };
    const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: async () => { calls++; return response; } }) };
    let h = await setup(undefined, { agent }); await h.act(start); await h.driver.walk('clinic');
    const inputs = [];
    for (const [index, value] of [{ text: narrativeReply({ reply: 'received', action: 'finish' }) }, { text: '{broken' },
        { text: narrativeReply({ reply: 'partial', action: 'briefing', affection: 'up' }), truncated: true },
        { text: '<dialogue>完整的付费对白。</dialogue>\n{"action":"briefing"' }].entries()) {
        response = value;
        const input = { actionId: `receipt-${index}`, revision: h.service.view().data.revision, person: 'sanniang', text: 'hello' };
        inputs.push(input); await h.service.converse(input, () => true, new AbortController().signal);
        const current = h.service.view();
        assert.equal(current.replyFailure !== null, current.data.active.conversations.sanniang.at(-1).kind === 'receipt');
    }
    const c = h.service.view().data.active;
    assert.deepEqual(c.facts, []); assert.equal(c.relationships.sanniang.affection, 0);
    assert.deepEqual(c.conversations.sanniang.filter(t => t.kind !== 'greeting').map(t => [t.kind, t.action, t.issue]), [
        ['dialogue', null, 'action_rejected'], ['receipt', null, 'reply_invalid'], ['receipt', null, 'reply_incomplete'], ['dialogue', null, 'metadata_invalid'],
    ]);
    h = await setup(h.state.files, { agent }); assert.deepEqual(h.service.view().data.active, c);
    for (const input of inputs) await h.service.converse(input, () => true, new AbortController().signal);
    assert.equal(calls, 4);
});

test('a cancelled summary save remains recoverable and never starts a dialogue request after cancellation', async () => {
    let calls = 0;
    const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: async () => {
        calls++; return { text: 'Retained attributed memory.', finishReason: 'STOP' };
    } }) };
    const countTokens = async ({ messages }) => ({ tokens: messages.filter(m => m.role === 'assistant').length > 5 ? 130000 : JSON.stringify(messages).length, source: 'estimated' });
    const h = await setup(undefined, { agent, countTokens }); await h.act(start); await h.driver.walk('clinic');
    await h.store(EXPEDITION_PARTITION).transact(tx => {
        const data = structuredClone(tx.current); data.revision++;
        data.active.conversations.sanniang = Array.from({ length: 20 }, (_, i) => ({ id: `older-${i}`, kind: 'dialogue', player: 'question',
            reply: 'answer', action: null, scene: 'camp', facts: [] })); tx.replace(data);
    });
    const controller = new AbortController(); let began, rejectSave;
    const uploading = new Promise(resolve => { began = resolve; }), replace = h.storage.replace;
    h.storage.replace = () => { began(); return new Promise((_, reject) => { rejectSave = reject; }); };
    const pending = h.service.converse({ actionId: 'cancel-summary-save', revision: h.service.view().data.revision,
        person: 'sanniang', text: 'hello' }, () => true, controller.signal);
    const rejected = assert.rejects(pending, { code: 'expedition_cancelled' });
    await uploading; controller.abort(); rejectSave(Object.assign(new Error('rejected'), { httpStatus: 403 })); await rejected;
    while (h.service.view().memories.sanniang?.status === 'running') { await new Promise(resolve => setImmediate(resolve)); }
    h.storage.replace = replace; await h.service.confirm(() => true);
    assert.equal(h.service.view().pending, false); assert.equal(calls, 1);
    assert.equal(h.service.view().replyFailure, null);
    assert.equal(h.service.view().data.active.memories.sanniang.throughId, 'older-14');
    assert.equal(h.service.view().memories.sanniang, undefined);
    assert.equal(h.service.view().data.active.conversations.sanniang.length, 20);
});

function deferred() {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
}
async function until(check) {
    for (let i = 0; i < 10000; i++) {
        if (check()) return;
        await new Promise(resolve => setImmediate(resolve));
    }
    assert.fail('Expected async boundary was not reached');
}

test('real request phases reach a busy and reattached client, stay transient, and stop after completion or cancellation', async () => {
    let request, response, calls = 0;
    const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: input => {
        calls++; request = input; response = deferred(); return response.promise;
    } }) };
    const h = await setup(undefined, { agent }); await h.act(start); await h.driver.walk('clinic');
    const runtime = withExpeditionRuntime({}, h.service, () => 'chat'), posts = [];
    let listener, reattached;
    const bridge = { subscribe(fn) { listener = fn; return () => { listener = null; }; },
        request: async (type, payload) => ({ result: await runtime.handleMessage({ type, payload }) }) };
    const activate = () => runtime.activate({ post(type, payload) { posts.push(structuredClone(payload.state)); listener?.({ type, payload }); } });
    const client = createExpeditionClient(bridge, 'chat');
    await runtime.startBackground(); await activate(); await client.read();
    try {
        const before = structuredClone(h.service.view().data);
        const pending = client.talk('sanniang', 'question');
        assert.equal(client.conversationProgress.value.phase, 'preparing');
        await until(() => !!request);
        assert.equal(client.conversationProgress.value.phase, 'waiting');
        const startedAt = client.conversationProgress.value.startedAt;
        const count = posts.length;
        request.onStreamProgress({ activity: 'thinking' });
        request.onStreamProgress({ activity: 'thinking' });
        assert.equal(posts.length, count + 1);
        assert.equal(client.conversationProgress.value.phase, 'thinking');
        request.onStreamProgress({ thoughts: [{ text: 'private' }] });
        request.onStreamProgress({ text: '<dialogue>partial', thoughts: [{ text: 'private' }] });
        assert.equal(client.conversationProgress.value.phase, 'replying');
        request.onStreamProgress({ text: '<dialogue>partial', thoughts: [{ text: 'private' }] });
        assert.equal(client.conversationProgress.value.phase, 'replying');
        assert.deepEqual(h.service.view().data, before);
        assert.equal(Object.hasOwn(client.conversationProgress.value, 'thoughts'), false);
        await runtime.deactivate('switch-app');
        reattached = createExpeditionClient(bridge, 'chat'); await activate(); await reattached.read();
        assert.equal(reattached.conversationProgress.value.phase, 'replying');
        assert.equal(reattached.conversationProgress.value.startedAt, startedAt);
        response.resolve({ text: narrativeReply({ reply: 'complete', action: null }) });
        assert.equal(await pending, true);
        assert.equal(reattached.conversationProgress.value, null);
        assert.ok(posts.some(state => state.conversation?.phase === 'saving'));
        const finishedPosts = posts.length;
        request.onStreamProgress({ activity: 'thinking' }); assert.equal(posts.length, finishedPosts);
        assert.equal(Object.hasOwn(h.service.view().data, 'conversation'), false);
        const original = h.service.view().data.active.lastReply.turnId;
        const replacing = reattached.talk('sanniang', 'question', original);
        await until(() => calls === 2);
        assert.equal(reattached.conversationProgress.value.phase, 'waiting');
        assert.equal(reattached.conversationProgress.value.regenerating, true);
        const afterRemoval = structuredClone(h.service.view().data);
        assert.equal(afterRemoval.active.conversations.sanniang.at(-1).kind, 'player');
        assert.equal(afterRemoval.active.conversations.sanniang.at(-1).reply, '');
        await reattached.cancelTalk();
        assert.equal(reattached.conversationProgress.value.phase, 'stopping');
        request.onStreamProgress({ activity: 'replying' });
        assert.equal(reattached.conversationProgress.value.phase, 'stopping');
        response.reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
        assert.equal(await replacing, false);
        assert.equal(reattached.conversationProgress.value, null);
        assert.deepEqual(h.service.view().data, afterRemoval);
        const failed = reattached.talk('sanniang', 'try again');
        await until(() => calls === 3);
        response.reject(Object.assign(new Error('fixture'), { status: 500 }));
        assert.equal(await failed, false); assert.equal(reattached.conversationProgress.value, null);
        assert.equal(reattached.conversationFailure.value.code, 'expedition_agent_failed');
    } finally { client.dispose(); reattached?.dispose(); await runtime.stopBackground(); }
});
async function memoryHarness(t) {
    const summaries = [], dialogues = [], control = { tokens: 80000, afterSummary: 10000, reply: null, count: null, counting: false };
    t.mock.method(console, 'warn', () => {});
    const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture', maxTokens: 12345 }, run: async request => {
        if (request.maxTokens === undefined) {
            const result = deferred(); summaries.push({ request, ...result }); return result.promise;
        }
        dialogues.push(request);
        return control.reply ? control.reply.promise : { text: narrativeReply({ reply: 'A new exchange.', action: null, affection: 'up' }) };
    } }) };
    const countTokens = async options => {
        if (options.messages.some(m => m.role === 'assistant')) {
            const data = inspectNarrativePrompt({ systemPrompt: options.messages[0].content, messages: options.messages.slice(1) });
            if (control.count) { const pending = control.count; control.count = null; control.counting = true; await pending.promise; }
            return { tokens: data.story.memory ? control.afterSummary : control.tokens, source: 'estimated' };
        }
        return narrativeOptions.countTokens(options);
    };
    const h = await setup(undefined, { agent, countTokens }); await h.act(start); await h.driver.walk('clinic');
    await h.store(EXPEDITION_PARTITION).transact(tx => {
        const data = structuredClone(tx.current); data.revision++;
        data.active.conversations.sanniang = Array.from({ length: 20 }, (_, i) => ({ id: `older-${i}`, kind: 'dialogue', player: `question-${i}`,
            reply: `answer-${i}`, action: null, scene: 'camp', facts: [] })); tx.replace(data);
    });
    t.after(() => h.service.stopMemory());
    const speak = regenerate => h.service.converse({ actionId: crypto.randomUUID(), revision: h.service.view().data.revision,
        person: 'sanniang', text: 'next question', ...(regenerate ? { regenerate } : {}) }, () => true, new AbortController().signal);
    return { ...h, control, summaries, dialogues, speak };
}

test('80k summary runs beside five new exchanges; completion keeps the fixed ten floors plus every new floor', async t => {
    const h = await memoryHarness(t);
    const before = h.service.view().data;
    for (let i = 0; i < 5; i++) await h.speak();
    assert.equal(h.dialogues.length, 5); assert.equal(h.summaries.length, 1);
    assert.equal(h.service.view().data.active.memories.sanniang, null);
    assert.equal(h.service.view().memories.sanniang.status, 'running');
    const source = JSON.parse(h.summaries[0].request.messages[0].content);
    assert.equal(source.conversation.length, 30); // First 15 exchanges only; last ten floors stay raw.
    assert.equal(Object.hasOwn(h.summaries[0].request, 'maxTokens'), false);
    const latest = h.service.view().data;
    h.summaries[0].resolve({ text: 'Remember the original promises.' });
    await until(() => !h.service.view().memories.sanniang);
    const done = h.service.view().data;
    assert.equal(done.revision, before.revision + 5); assert.deepEqual(done.last, latest.last);
    assert.deepEqual(done.active.conversations, latest.active.conversations);
    assert.deepEqual(done.active.relationships, latest.active.relationships);
    assert.equal(done.active.memories.sanniang.throughId, 'older-14');
    await h.speak();
    assert.equal(h.dialogues.at(-1).messages.filter(m => m.role === 'assistant').length, 10); // 20 retained floors.
    assert.equal(inspectNarrativePrompt(h.dialogues.at(-1)).story.memory, 'Remember the original promises.');
    const reloaded = await setup(h.state.files);
    assert.deepEqual(reloaded.service.view().data.active, h.service.view().data.active);
});

test('98k waits for the existing summary, recounts, and sends a retained tail above 98k without a false hard-limit error', async t => {
    const h = await memoryHarness(t); await h.speak();
    h.control.tokens = 110000;
    const pending = h.speak(); await until(() => h.service.view().conversation?.phase === 'summarizing');
    assert.equal(h.dialogues.length, 1); assert.equal(h.summaries.length, 1);
    assert.equal(h.service.view().conversation.text, 'next question');
    assert.equal(h.service.view().conversation.phase, 'summarizing');
    h.summaries[0].resolve({ text: 'Earlier events.' }); await pending;
    assert.equal(h.dialogues.length, 2); assert.equal(h.summaries.length, 1);
    assert.equal(inspectNarrativePrompt(h.dialogues[1]).story.memory, 'Earlier events.');

    // An unusually long retained tail is not rejected just because it exceeds the visible meter.
    h.control.afterSummary = 100000;
    const another = h.speak(); await until(() => h.summaries.length === 2);
    h.summaries[1].resolve({ text: 'Compact memory.' }); await another;
    assert.equal(h.dialogues.length, 3); assert.equal(h.service.view().replyFailure, null);
});

test('a background summary completing during regeneration cannot stale the paid reply or be overwritten by its checkpoint', async t => {
    const h = await memoryHarness(t); await h.speak();
    const original = h.service.view().data.active;
    h.control.reply = deferred();
    const pending = h.speak(original.lastReply.turnId); await until(() => h.dialogues.length === 2);
    h.summaries[0].resolve({ text: 'Earlier events, never the discarded reply.' });
    await until(() => !h.service.view().memories.sanniang);
    h.control.reply.resolve({ text: narrativeReply({ reply: 'Replacement.', affection: 'down' }) }); await pending;
    const done = h.service.view().data.active;
    assert.equal(done.memories.sanniang.throughId, 'older-14');
    assert.equal(done.conversations.sanniang.length, original.conversations.sanniang.length);
    assert.equal(done.conversations.sanniang.at(-1).reply, 'Replacement.');
    assert.equal(done.relationships.sanniang.affection, 0);
    assert.equal(h.service.view().replyFailure, null);
});

test('summary completion during remote token counting uses the new memory instead of repurchasing its old prefix', async t => {
    const h = await memoryHarness(t); await h.speak();
    const counter = deferred(); h.control.count = counter;
    const pending = h.speak(); await until(() => h.control.counting);
    h.summaries[0].resolve({ text: 'Memory completed while counting.' });
    await until(() => !h.service.view().memories.sanniang);
    counter.resolve(); await pending;
    assert.equal(h.summaries.length, 1); assert.equal(h.dialogues.length, 2);
    assert.equal(inspectNarrativePrompt(h.dialogues[1]).story.memory, 'Memory completed while counting.');
});

test('failed background summaries preserve history, do not disturb dialogue or rebuy on each send, and have an explicit retry', async t => {
    const h = await memoryHarness(t); await h.speak();
    const cause = Object.assign(new Error('HTTP 500: summary upstream unavailable\nrequest_id: summary-fixture'), { status: 500 });
    h.summaries[0].reject(cause);
    await until(() => h.service.view().memories.sanniang?.status === 'failed');
    assert.equal(h.service.view().memories.sanniang.message, cause.message);
    await h.speak(); await h.speak();
    assert.equal(h.dialogues.length, 3); assert.equal(h.summaries.length, 1);
    assert.equal(h.service.view().replyFailure, null); assert.equal(h.service.view().data.active.memories.sanniang, null);
    h.control.tokens = 99000;
    await assert.rejects(h.speak(), { code: 'expedition_agent_failed' });
    assert.equal(h.dialogues.length, 3); assert.equal(h.summaries.length, 1);
    assert.equal(h.service.view().replyFailure.playerText, 'next question');
    assert.equal(h.service.view().replyFailure.message, cause.message);
    await h.service.retryMemory('sanniang', () => true);
    await until(() => h.summaries.length === 2);
    h.summaries[1].resolve({ text: 'All earlier promises.' });
    await until(() => !h.service.view().memories.sanniang); await h.speak();
    assert.equal(h.dialogues.length, 4); assert.equal(h.summaries.length, 2);
});

test('leaving the game keeps its summary alive; starting a new journey aborts it and rejects late results', async t => {
    const h = await memoryHarness(t), runtime = withExpeditionRuntime({}, h.service, () => 'chat');
    await runtime.activate({ post() {} }); await h.speak();
    await runtime.deactivate('switch-app'); assert.equal(h.summaries[0].request.signal.aborted, false);
    await h.act({ type: 'restart', weapon: 'blade', outfit: 'traveler', ...journey });
    assert.equal(h.summaries[0].request.signal.aborted, true);
    const fresh = h.service.view().data;
    h.summaries[0].resolve({ text: 'Late old memory.' }); await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(h.service.view().data, fresh); assert.deepEqual(h.service.view().memories, {});
});

test('a reattached client sees background conversation failure without blocking unrelated game actions', async () => {
    let started, rejectReply; const began = new Promise(resolve => { started = resolve; });
    const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: () => {
        started(); return new Promise((_, reject) => { rejectReply = reject; });
    } }) };
    const h = await setup(undefined, { agent }); await h.act(start); await h.driver.walk('clinic');
    const runtime = withExpeditionRuntime({}, h.service, () => 'chat'); let listener;
    const activate = () => runtime.activate({ post: (type, payload) => listener?.({ type, payload: structuredClone(payload) }) });
    await activate();
    const pending = runtime.handleMessage({ type: 'game/expedition/talk', payload: { chatIdentity: 'chat', actionId: 'background-failure',
        revision: h.service.view().data.revision, person: 'sanniang', text: 'hello' } });
    const rejected = assert.rejects(pending, { code: 'expedition_agent_failed' });
    await began; await runtime.deactivate('switch-app');
    const client = createExpeditionClient({ subscribe(fn) { listener = fn; return () => { listener = null; }; },
        request: async (type, payload) => ({ result: await runtime.handleMessage({ type, payload }) }) }, 'chat');
    try {
        await activate(); await client.read(); assert.equal(client.talking.value, true);
        const before = structuredClone(h.service.view().data);
        const cause = Object.assign(new Error('HTTP 500: provider unavailable\nrequest_id: dialogue-fixture'), { status: 500 });
        rejectReply(cause); await rejected;
        assert.equal(client.conversationFailure.value.code, 'expedition_agent_failed'); assert.equal(client.conversationFailure.value.person, 'sanniang');
        assert.equal(client.conversationFailure.value.message, cause.message);
        assert.deepEqual(h.service.view().data, before);
        assert.equal(client.talking.value, false); assert.equal(client.blocked.value, false);
        assert.equal(client.outgoing.value.text, 'hello'); assert.equal(client.outgoing.value.status, 'failed');
        client.dismissConversationFailure(); assert.equal(client.conversationFailure.value, null);
        assert.equal(await client.act({ type: 'loadout', equipped: [] }), true);
    } finally { client.dispose(); await runtime.stopBackground(); }
});

test('a live paid request survives deactivation and reactivation, including main-generation starting meanwhile', async () => {
    let resolveReply, started;
    const began = new Promise(resolve => { started = resolve; });
    let idle = true, calls = 0;
    const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: () => {
        calls++; started(); return new Promise(resolve => { resolveReply = resolve; });
    } }) };
    const h = await setup(undefined, { agent, idle: () => idle }); await h.act(start); await h.driver.walk('clinic');
    const states = [], runtime = withExpeditionRuntime({}, h.service, () => 'chat');
    const activate = () => runtime.activate({ post: (type, payload) => states.push({ type, payload }) });
    await activate();
    const pending = runtime.handleMessage({ type: 'game/expedition/talk', payload: { chatIdentity: 'chat', actionId: 'live-reply',
        revision: h.service.view().data.revision, person: 'sanniang', text: 'hello' } });
    await began; await runtime.deactivate('switch-app'); await runtime.cancelForeground('minimize'); idle = false;
    await activate();
    const inFlight = await runtime.handleMessage({ type: 'game/expedition/read', payload: { chatIdentity: 'chat' } });
    assert.equal(inFlight.conversation.actionId, 'live-reply');
    resolveReply({ text: narrativeReply({ reply: 'answer' }) }); await pending;
    assert.equal(calls, 1); assert.equal(h.service.view().data.active.conversations.sanniang.at(-1).id, 'live-reply');
    assert.equal(states.at(-1).payload.state.conversation, null);
});

test('malformed expedition data cannot turn a local game error into a fatal whole-App error', async () => {
    const h = await setup(), runtime = withExpeditionRuntime({ handleMessage: async () => 'other-game' }, {
        ...h.service, refresh: async () => { throw Object.assign(new Error('invalid'), { code: 'partition_invalid' }); },
    }, () => 'chat');
    await runtime.activate({ post() {} });
    await assert.rejects(runtime.handleMessage({ type: 'game/expedition/read', payload: { chatIdentity: 'chat' } }), { code: 'expedition_data_invalid' });
    assert.equal(await runtime.handleMessage({ type: 'game/dice/read' }), 'other-game');
});

test('parley waits for acknowledgement, persists its result, and cannot be escaped or submitted without intel', async () => {
    let response = { reply: 'fixture', affection: 'up' }, calls = 0;
    const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: async () => {
        calls++; return { text: narrativeReply(response) };
    } }) };
    let h = await setup(undefined, { agent }); await h.act(start);
    const talk = person => h.service.converse({ actionId: crypto.randomUUID(), revision: h.service.view().data.revision, person, text: 'fixture' }, () => true, new AbortController().signal);
    await h.driver.walk('guard'); await h.act({ type: 'choice', id: 'briefing', person: 'laobai' });
    while (h.service.view().data.active.relationships.laobai.affection < 81) await talk('laobai');
    response = { reply: 'fixture', action: 'share_secret' }; await talk('laobai');
    await h.driver.interact('road'); await h.driver.interact('gate'); await h.driver.walk('parley');
    response = { reply: 'fixture', action: 'pass' }; await talk('bajin');
    assert.deepEqual(h.service.view().data.active.pendingParley, { enemy: 'bajin', decision: 'pass' });
    assert.ok(!h.service.view().data.active.facts.includes('patrol_cleared'));
    const beforeCalls = calls; h = await setup(h.state.files, { agent });
    assert.equal(h.service.view().data.active.pendingParley.decision, 'pass');
    for (const decision of ['attack', 'pass']) {
        const regenerate = h.service.view().data.active.lastReply.turnId;
        response = { reply: 'replaced final words', action: decision };
        await h.service.converse({ actionId: crypto.randomUUID(), revision: h.service.view().data.revision,
            person: 'bajin', text: 'fixture', regenerate }, () => true, new AbortController().signal);
        assert.equal(h.service.view().data.active.pendingParley.decision, decision);
        assert.equal(h.service.view().data.active.phase, 'exploration');
        assert.equal(h.service.view().data.active.conversations.bajin.filter(t => t.kind === 'dialogue').length, 1);
    }
    await assert.rejects(h.act({ type: 'interact', id: 'crossroads' }), { code: 'expedition_unavailable' });
    await h.act({ type: 'resolve_parley' });
    assert.equal(calls, beforeCalls + 2); assert.ok(h.service.view().data.active.facts.includes('bajin_passed'));
    assert.equal(h.service.view().data.active.phase, 'exploration');
    await h.driver.walk('parley_side'); response = { reply: 'fixture' }; await talk('bajin');
    assert.equal(h.service.view().data.active.conversations.bajin.filter(t => t.kind === 'dialogue').length, 2);

    h = await setup(undefined, { agent }); await h.act(start); await h.driver.walk('guard'); await h.act({ type: 'choice', id: 'briefing', person: 'laobai' });
    await h.driver.interact('road'); await h.driver.interact('gate'); await h.driver.walk('parley');
    response = { reply: 'fixture', action: 'pass' }; await talk('bajin');
    assert.equal(h.service.view().data.active.pendingParley, null);
    assert.equal(h.service.view().data.active.conversations.bajin.at(-1).issue, 'action_rejected');
    response = { reply: 'fixture', action: 'attack' }; await talk('bajin');
    h = await setup(h.state.files, { agent });
    assert.equal(h.service.view().data.active.pendingParley.decision, 'attack');
    await assert.rejects(h.act({ type: 'retreat' }), { code: 'expedition_unavailable' });
    await h.act({ type: 'resolve_parley' }); assert.equal(h.service.view().data.active.phase, 'battle');
    await assert.rejects(talk('bajin'), { code: 'expedition_unavailable' });
});

test('greeting needs no model; replacements share one persisted baseline and recover failed saves without another model call', async () => {
    let response = { reply: 'original', action: 'briefing', affection: 'up' }, calls = 0, captured, rejectReplySave = false;
    const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: async request => {
        calls++; captured = request; if (rejectReplySave) h.state.mode = 'rejected'; return { text: narrativeReply(response) };
    } }) };
    let h = await setup(undefined, { agent }); await h.act(start); await h.driver.walk('clinic');
    await h.act({ type: 'greet', person: 'sanniang' }); await h.act({ type: 'greet', person: 'sanniang' });
    assert.equal(calls, 0); assert.equal(h.service.view().data.active.conversations.sanniang.length, 1);
    const speak = regenerate => h.service.converse({ actionId: crypto.randomUUID(), revision: h.service.view().data.revision,
        person: 'sanniang', text: 'same question', ...(regenerate ? { regenerate } : {}) }, () => true, new AbortController().signal);
    await speak(); let c = h.service.view().data.active;
    const baseline = c.lastReply.before, affection = c.relationships.sanniang.affection, oldId = c.lastReply.turnId;
    h = await setup(h.state.files, { agent }); assert.deepEqual(h.service.view().data.active, c);
    response = { reply: 'replacement', action: 'follow', affection: 'up' };
    await speak(oldId); c = h.service.view().data.active;
    assert.equal(c.relationships.sanniang.affection, affection); assert.deepEqual(c.lastReply.before, baseline);
    assert.equal(c.facts.includes('briefed'), false); assert.equal(c.people.sanniang.mode, 'follow');
    assert.deepEqual(captured.messages.filter(m => m.role === 'assistant').map(m => decodeNarrativeReply(m.content).reply), [c.conversations.sanniang[0].reply]);
    assert.equal(c.conversations.sanniang.length, 2);
    const replacementId = c.lastReply.turnId;
    response = { reply: 'recovered', action: null, affection: 'down' }; rejectReplySave = true;
    await assert.rejects(speak(replacementId), { code: 'expedition_save_failed' });
    assert.equal(h.service.view().data.active.conversations.sanniang.at(-1).kind, 'player');
    rejectReplySave = false;
    const count = calls; h.state.mode = 'confirmed'; await h.service.confirm(() => true); assert.equal(calls, count);
    c = h.service.view().data.active; assert.equal(c.conversations.sanniang.at(-1).reply, response.reply);
    assert.equal(c.relationships.sanniang.affection, 0); assert.equal(c.people.sanniang.mode, baseline.people.sanniang.mode);
    assert.deepEqual(c.lastReply.before, baseline); assert.equal(c.conversations.sanniang.length, 2);
    await h.act({ type: 'loadout', equipped: [] }); assert.equal(h.service.view().data.active.lastReply, undefined);
    await speak(c.lastReply.turnId); assert.equal(calls, count + 1);
    assert.equal(h.service.view().data.active.conversations.sanniang.length, 2);
});

for (const mode of ['rejected', 'unknown']) {
    test(`a ${mode} reply-removal save never starts a model call; confirmation retains the user-only turn`, async () => {
        let calls = 0;
        const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: async () => {
            calls++; return { text: narrativeReply({ reply: 'original', action: null }) };
        } }) };
        const h = await setup(undefined, { agent }); await h.act(start); await h.driver.walk('clinic');
        const speak = regenerate => h.service.converse({ actionId: crypto.randomUUID(), revision: h.service.view().data.revision,
            person: 'sanniang', text: 'question', ...(regenerate ? { regenerate } : {}) }, () => true, new AbortController().signal);
        await speak(); const before = h.service.view().data;
        const turnId = before.active.conversations.sanniang.at(-1).id;
        h.state.mode = mode;
        await assert.rejects(speak(turnId));
        assert.equal(calls, 1); assert.deepEqual(h.service.view().data, before);
        h.state.mode = 'confirmed'; await h.service.confirm(() => true);
        assert.equal(calls, 1);
        assert.equal(h.service.view().data.active.conversations.sanniang.at(-1).kind, 'player');
        await speak(turnId);
        assert.equal(calls, 2); assert.equal(h.service.view().data.active.conversations.sanniang.length, before.active.conversations.sanniang.length);
    });
}

test('complete no-operation regenerations stay successful, retain diagnostics and never accumulate discarded affection', async t => {
    let text = narrativeReply({ reply: 'original', action: 'briefing', affection: 'up' }), calls = 0;
    const warnings = t.mock.method(console, 'warn', () => {});
    const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: async () => {
        calls++; return { text };
    } }) };
    const h = await setup(undefined, { agent }); await h.act(start); await h.driver.walk('clinic');
    const speak = regenerate => h.service.converse({ actionId: crypto.randomUUID(), revision: h.service.view().data.revision,
        person: 'sanniang', text: 'question', ...(regenerate ? { regenerate } : {}) }, () => true, new AbortController().signal);
    await speak();
    const baseline = h.service.view().data.active.lastReply.before;
    for (const [source, issue] of [
        ['<dialogue>replacement</dialogue>', 'metadata_invalid'],
        ['replacement', 'metadata_invalid'],
        ['<dialogue>replacement</dialogue>\n{"action":', 'metadata_invalid'],
        [narrativeReply({ reply: 'replacement', performance: { expression: 'unknown' } }), 'performance_rejected'],
        [narrativeReply({ reply: 'replacement', action: null }), undefined],
    ]) {
        text = source;
        await speak(h.service.view().data.active.lastReply.turnId);
        const view = h.service.view(), c = view.data.active, turn = c.conversations.sanniang.at(-1);
        assert.equal(view.replyFailure, null); assert.equal(view.pending, false);
        assert.equal(turn.kind, 'dialogue'); assert.equal(turn.action, null); assert.equal(turn.issue, issue);
        assert.equal(c.conversations.sanniang.filter(t => t.kind !== 'greeting').length, 1);
        assert.deepEqual(c.relationships, baseline.relationships); assert.deepEqual(c.facts, baseline.facts);
        assert.deepEqual(c.lastReply.before, baseline);
    }
    assert.equal(calls, 6);
    assert.deepEqual(warnings.mock.calls.map(call => call.arguments[1].code),
        ['expedition_metadata_invalid', 'expedition_metadata_invalid', 'expedition_metadata_invalid', 'expedition_performance_rejected']);
});

test('failed, cancelled and incomplete regenerations keep a durable user message and retry never deletes another reply', async () => {
    let mode = 'ok', controller;
    const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: async () => {
        if (mode === 'failed') throw new Error('fixture provider failure');
        if (mode === 'cancelled') controller.abort();
        if (mode === 'incomplete') return { text: '<dialogue>partial', truncated: true };
        return { text: narrativeReply({ reply: 'original', action: 'briefing', affection: 'up' }) };
    } }) };
    const h = await setup(undefined, { agent }); await h.act(start); await h.driver.walk('clinic');
    const speak = regenerate => { controller = new AbortController(); return h.service.converse({ actionId: crypto.randomUUID(),
        revision: h.service.view().data.revision, person: 'sanniang', text: 'question', ...(regenerate ? { regenerate } : {}) }, () => true, controller.signal); };
    await speak(); const original = h.service.view().data;
    let removed;
    for (mode of ['failed', 'cancelled', 'incomplete']) {
        await assert.rejects(speak(original.active.lastReply.turnId));
        const next = h.service.view().data;
        assert.equal(next.active.conversations.sanniang.at(-1).kind, 'player');
        assert.equal(next.active.conversations.sanniang.at(-1).player, 'question');
        assert.equal(next.active.conversations.sanniang.at(-1).reply, '');
        assert.deepEqual(next.active.relationships, original.active.lastReply.before.relationships);
        assert.deepEqual(next.active.conversations.sanniang.slice(0, -1), original.active.conversations.sanniang.slice(0, -1));
        if (removed) assert.deepEqual(next, removed);
        removed = next;
        assert.equal(h.service.view().pending, false);
    }
    assert.ok(h.service.view().replyFailure.text);
    const restored = await setup(h.state.files, { agent });
    assert.deepEqual(restored.service.view().data, removed);
    mode = 'ok';
    await restored.service.converse({ actionId: 'resume-user-only', revision: removed.revision, person: 'sanniang', text: 'question',
        regenerate: removed.active.conversations.sanniang.at(-1).id }, () => true, new AbortController().signal);
    assert.equal(restored.service.view().data.active.conversations.sanniang.length, original.active.conversations.sanniang.length);
    assert.equal(restored.service.view().data.active.conversations.sanniang.at(-1).kind, 'dialogue');
});

test('the chapter ending stays a readable replaceable reply until explicit acceptance, which awards only once', async () => {
    let action = 'finish';
    const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: async () => ({ text: narrativeReply({ reply: 'last words', action }) }) }) };
    let h = await setup(undefined, { agent }); await h.act(start);
    await campaignDriver(() => h.service.view().data.active, command => command.type === 'choice' && command.id === 'finish' ? Promise.resolve() : h.act(command)).complete('waterway');
    const balance = h.service.view().balance;
    const speak = regenerate => h.service.converse({ actionId: crypto.randomUUID(), revision: h.service.view().data.revision,
        person: 'sanniang', text: 'we are back', ...(regenerate ? { regenerate } : {}) }, () => true, new AbortController().signal);
    await speak(); let c = h.service.view().data.active;
    assert.equal(pendingEnding(c), 'sanniang'); assert.equal(c.facts.includes('chapter_completed'), false); assert.equal(h.service.view().balance, balance);
    h = await setup(h.state.files, { agent }); assert.equal(pendingEnding(h.service.view().data.active), 'sanniang');
    action = null; await speak(c.lastReply.turnId); c = h.service.view().data.active;
    assert.equal(pendingEnding(c), null); assert.equal(h.service.view().balance, balance);
    action = 'finish'; await speak(c.lastReply.turnId);
    const accept = h.request({ type: 'accept_reply' }); await h.service.act(accept, () => true); await h.service.act(accept, () => true);
    c = h.service.view().data.active; assert.equal(pendingEnding(c), null); assert.equal(c.lastReply, undefined);
    assert.ok(c.facts.includes('chapter_completed')); assert.equal(h.service.view().balance, balance + RULES.firstVictoryAward);
    await assert.rejects(h.act({ type: 'accept_reply' }), { code: 'expedition_unavailable' });
    const loaded = await setup(h.state.files); assert.deepEqual(loaded.service.view().data, h.service.view().data);
});

test('regeneration compression excludes discarded speech and survives a failed replacement with the user message intact', async () => {
    let compress = false, summaries = 0, failReply = false, number = 0;
    const requests = [];
    const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run: async request => {
        requests.push(request);
        if (request.maxTokens === undefined) { summaries++; return { text: '记得较早的交谈。' }; }
        if (failReply) throw new Error('fixture');
        return { text: narrativeReply({ reply: `answer-${++number}`, action: null }) };
    } }) };
    const countTokens = async options => {
        if (compress && options.messages.filter(m => m.role === 'assistant').length > 5 && !summaries) return { tokens: 130000, source: 'estimated' };
        return narrativeOptions.countTokens(options);
    };
    const h = await setup(undefined, { agent, countTokens }); await h.act(start); await h.driver.walk('clinic');
    const speak = regenerate => h.service.converse({ actionId: crypto.randomUUID(), revision: h.service.view().data.revision,
        person: 'sanniang', text: 'question', ...(regenerate ? { regenerate } : {}) }, () => true, new AbortController().signal);
    for (let i = 0; i < 9; i++) await speak();
    const original = h.service.view().data, last = original.active.conversations.sanniang.at(-1);
    compress = true; failReply = true; requests.length = 0;
    await assert.rejects(speak(last.id));
    const compacted = h.service.view().data;
    assert.ok(compacted.active.memories.sanniang);
    assert.deepEqual(compacted.active.conversations.sanniang.slice(0, -1), original.active.conversations.sanniang.slice(0, -1));
    assert.equal(compacted.active.conversations.sanniang.at(-1).kind, 'player');
    assert.equal(compacted.active.conversations.sanniang.at(-1).player, last.player);
    assert.equal(summaries, 1);
    failReply = false; await speak(last.id);
    assert.equal(summaries, 1);
    const c = h.service.view().data.active;
    assert.ok(c.memories.sanniang); assert.notEqual(c.memories.sanniang.throughId, last.id);
    for (const request of requests) {
        const messages = request.maxTokens === undefined ? JSON.parse(request.messages[0].content).conversation : request.messages;
        assert.equal(messages.filter(m => m.role === 'assistant').some(m => decodeNarrativeReply(m.content)?.reply === last.reply), false);
    }
});
