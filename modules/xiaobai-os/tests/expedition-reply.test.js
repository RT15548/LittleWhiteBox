import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { userEconomyHarness } from './user-economy-harness.js';
import { createCampaign } from '../apps/game/expedition/campaign/rules.ts';
import { emptyExpedition } from '../apps/game/expedition/domain.ts';
import { EXPEDITION_PARTITION } from '../apps/game/expedition/partition.ts';
import { createExpeditionService } from '../apps/game/expedition/service.ts';
import { loadNarrativeCanon } from '../apps/game/expedition/narrative/canon.ts';
import { decodeNarrativeReply } from '../apps/game/expedition/narrative/response.ts';
import { replayTurns } from '../apps/game/expedition/narrative/history.ts';
import { readResponseCompletion } from '../../agent-core/runtime/response-completion.js';

// Acceptance contracts:
// - Dialogue inherits the user's API output budget (paid requests / protocol mismatch).
// - Complete envelopes survive abnormal transport endings: effects settle once, and
//   both body and operations survive reload, regeneration and replay (lost paid replies / state).
// - Invalid controls cannot change game state; valid body remains in history (state corruption).
// - Explicit cancellation still prevents late replies from changing the save (wrong state).
const body = '我放下药碗，向你点头。\n「路上小心，我会跟上。」';
const envelope = controls => `<dialogue>\n${body}\n</dialogue>\n${JSON.stringify(controls)}`;
const controls = { action: 'follow', affection: 'up', performance: { expression: 'smile', gesture: 'nod' }, clothing: { outer: '青色短外衣' } };
const canon = loadNarrativeCanon('sanniang', new AbortController().signal,
    name => readFile(new URL(`../docs/expedition-cards/${name}.md`, import.meta.url), 'utf8'));

async function setup(responses, maxTokens = 16000) {
    const h = await userEconomyHarness(); await h.economy.ensureOpen();
    const store = h.store(EXPEDITION_PARTITION);
    const active = createCampaign('reply-contract', 7, 'blade', 'traveler', { name: '旅人', gender: 'male', appearanceAge: 'twenties' });
    active.people.sanniang.position = { ...active.location.position };
    await store.transact(transaction => transaction.replace({ ...emptyExpedition(), active }));
    const requests = [], queue = [...responses];
    const agent = { loadConfig: async () => ({}), openSession: async () => ({
        providerConfig: { model: 'offline-fixture', maxTokens },
        async run(request) {
            requests.push(request);
            const response = queue.shift();
            assert.ok(response, 'No extra model request is authorized');
            if (typeof response === 'function') { return response(request); }
            if (response.error) { throw response.error; }
            return { ...readResponseCompletion('openai', response.finish), text: response.text,
                thoughts: [{ text: 'offline reasoning' }], ...(response.truncated === undefined ? {} : { truncated: response.truncated }) };
        },
    }) };
    const service = createExpeditionService(store, h.transactions, h.economy, {
        agent, loadCanon: () => canon, countTokens: async () => ({ tokens: 100 }),
    });
    await service.refresh();
    let serial = 0;
    const talk = (regenerate, signal = new AbortController().signal) => service.converse({
        actionId: `reply-${++serial}`, revision: service.view().data.revision, person: 'sanniang', text: '我们一起走吧。',
        ...(regenerate ? { regenerate } : {}),
    }, () => true, signal);
    return { h, service, requests, talk };
}

for (const finish of ['stop', 'length', undefined]) {
    test(`complete dialogue and operations survive ${finish ?? 'missing completion'}, reload and context replay`, async () => {
        const { h, requests, talk } = await setup([{ finish, text: envelope(controls) }]);
        const view = await talk(), campaign = view.data.active;
        assert.equal(view.replyFailure, null);
        const turn = campaign.conversations.sanniang.at(-1);
        assert.equal(turn.kind, 'dialogue'); assert.equal(turn.reply, body);
        assert.equal(turn.action, 'follow'); assert.equal(campaign.people.sanniang.mode, 'follow');
        assert.ok(turn.affectionDelta > 0);
        assert.equal(campaign.relationships.sanniang.affection, turn.affectionDelta);
        assert.deepEqual(turn.performance, controls.performance);
        assert.equal(turn.clothing.outer, controls.clothing.outer);
        assert.equal(requests[0].maxTokens, undefined, 'Owner must leave the configured API limit untouched');

        const restored = await userEconomyHarness({ files: h.state.files });
        const reopened = createExpeditionService(restored.store(EXPEDITION_PARTITION), restored.transactions, restored.economy);
        const saved = (await reopened.refresh()).data.active;
        assert.deepEqual(saved.conversations.sanniang.at(-1), turn);
        const message = replayTurns(saved.conversations.sanniang).at(-1);
        assert.equal(message.role, 'assistant');
        const replay = decodeNarrativeReply(message.content);
        assert.equal(replay.reply, body);
        assert.deepEqual(replay.controls, controls);
    });
}

test('a truncated flag does not override a complete envelope; regeneration replaces effects and history', async () => {
    const replacement = { ...controls, action: 'stay', affection: null, clothing: { outer: '灰色布外衣' } };
    const { service, talk, requests } = await setup([
        { finish: 'stop', text: envelope(controls), truncated: true },
        { finish: 'length', text: envelope(replacement) },
        { finish: 'stop', text: envelope({ action: null, affection: null }) },
    ]);
    const first = await talk();
    const prior = first.data.active.conversations.sanniang.at(-1);
    const regenerated = await talk(prior.id);
    const current = regenerated.data.active;
    assert.equal(regenerated.replyFailure, null);
    assert.equal(current.people.sanniang.mode, 'idle');
    assert.equal(current.relationships.sanniang.affection, 0);
    const turns = current.conversations.sanniang.filter(turn => turn.kind === 'dialogue');
    assert.equal(turns.length, 1);
    assert.equal(turns[0].regeneratedFrom, prior.id);
    assert.deepEqual(decodeNarrativeReply(replayTurns(turns).at(-1).content).controls, replacement);
    await talk();
    const previousReply = requests[2].messages.filter(message => message.role === 'assistant').at(-1);
    assert.equal(decodeNarrativeReply(previousReply.content).reply, body);
    assert.deepEqual(decodeNarrativeReply(previousReply.content).controls, replacement);
    service.stopMemory();
});

test('an invalid JSON tail preserves complete dialogue without applying its unfinished operations', async () => {
    const { talk } = await setup([{ finish: 'length', text: `<dialogue>${body}</dialogue>\n{"action":"follow","affection":` }]);
    const view = await talk(), campaign = view.data.active, turn = campaign.conversations.sanniang.at(-1);
    assert.equal(view.replyFailure, null); assert.equal(turn.kind, 'dialogue');
    assert.equal(turn.reply, body); assert.equal(turn.action, null);
    assert.equal(campaign.people.sanniang.mode, 'idle'); assert.equal(campaign.relationships.sanniang.affection, 0);
    assert.equal(decodeNarrativeReply(replayTurns([turn]).at(-1).content).reply, body);
});

test('an unclosed body remains a receipt and cannot execute a JSON-looking fragment', async () => {
    const { talk } = await setup([{ finish: 'length', text: `<dialogue>${body}\n${JSON.stringify(controls)}` }]);
    const campaign = (await talk()).data.active, turn = campaign.conversations.sanniang.at(-1);
    assert.equal(turn.kind, 'receipt'); assert.equal(turn.action, null);
    assert.equal(campaign.people.sanniang.mode, 'idle'); assert.equal(campaign.relationships.sanniang.affection, 0);
    assert.deepEqual(replayTurns([turn]), []);
});

test('explicit cancellation rejects a late complete reply without persisting its effects', async () => {
    const controller = new AbortController();
    const { service, talk } = await setup([() => { controller.abort(); return { text: envelope(controls) }; }]);
    await assert.rejects(talk(undefined, controller.signal), { code: 'expedition_cancelled' });
    const campaign = service.view().data.active;
    assert.equal(campaign.conversations.sanniang.length, 0);
    assert.equal(campaign.people.sanniang.mode, 'idle'); assert.equal(campaign.relationships.sanniang.affection, 0);
});
