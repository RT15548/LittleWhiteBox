import assert from 'node:assert/strict';
import test from 'node:test';
import { createCampaign } from '../apps/game/expedition/campaign/rules.ts';
import { rewindReply } from '../apps/game/expedition/campaign/reply-checkpoint.ts';
import { currentClothing } from '../apps/game/expedition/clothing.ts';
import { CLOTHING_SLOTS, INITIAL_CLOTHING } from '../apps/game/expedition/content/clothing.ts';
import { PARTICIPANT_IDS } from '../apps/game/expedition/content/participants.ts';
import { emptyExpedition } from '../apps/game/expedition/domain.ts';
import { EXPEDITION_PARTITION } from '../apps/game/expedition/partition.ts';
import { applyReply } from '../apps/game/expedition/narrative/apply-reply.ts';
import { generateConversation } from '../apps/game/expedition/narrative/conversation.ts';
import { buildConversationPrompt } from '../apps/game/expedition/narrative/prompt.ts';
import { replayTurns } from '../apps/game/expedition/narrative/history.ts';
import { decodeNarrativeReply } from '../apps/game/expedition/narrative/response.ts';
import { traveler } from './fixtures/expedition-traveler.js';
import { inspectNarrativePrompt, loadCanon, narrativeOptions, narrativeReply } from './fixtures/expedition-narrative.js';

const campaign = () => createCampaign('clothing-fixture', 7, 'blade', 'traveler', traveler);
const signal = () => new AbortController().signal;
async function receive(c, controls, person = 'sanniang', response = {}) {
    let calls = 0;
    const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' },
        run: async () => { calls++; return { text: narrativeReply({ reply: 'fixture dialogue', ...controls }), ...response }; } }) };
    const result = await generateConversation(agent, c, person, 'fixture question', signal(), narrativeOptions);
    assert.equal(calls, 1);
    return result;
}
const apply = (c, response, id = 'one', person = 'sanniang') => applyReply(c, { actionId: id, person, text: 'fixture question' }, response);

test('every participant has six readable initial values without changing an existing save', async () => {
    const c = campaign(), saved = { ...emptyExpedition(), active: c };
    const restored = EXPEDITION_PARTITION.parse(EXPEDITION_PARTITION.serialize(saved));
    assert.equal(restored.ok, true); assert.deepEqual(restored.value, saved);
    for (const person of PARTICIPANT_IDS) {
        const current = currentClothing(restored.value.active, person);
        assert.deepEqual(Object.keys(current), Object.keys(CLOTHING_SLOTS));
        assert.deepEqual(current, INITIAL_CLOTHING[person]);
        const context = inspectNarrativePrompt(buildConversationPrompt(c, person, 'hello', await loadCanon(person, signal())));
        assert.deepEqual(context.story.clothing, current);
        assert.deepEqual(context.operations.clothing, CLOTHING_SLOTS);
        current.outer = 'changed local projection';
        assert.notEqual(currentClothing(c, person).outer, current.outer);
    }
});

test('model descriptions can replace several categories without items, stock, location or relationship gates', async () => {
    for (const person of PARTICIPANT_IDS) {
        const c = campaign(), before = currentClothing(c, person);
        const clothing = { outer: '披着临时编成的草披肩，系结松开', lower: '新编的草裙，叫作 "远行"\n边缘不齐', shoes: null };
        const response = await receive(c, { clothing }, person);
        assert.equal(response.issue, undefined); assert.equal(response.action, null);
        apply(c, response, 'one', person);
        assert.deepEqual(currentClothing(c, person), { ...before, ...clothing });
        assert.deepEqual(c.conversations[person].at(-1).clothing, clothing);
        const restored = EXPEDITION_PARTITION.parse(EXPEDITION_PARTITION.serialize({ ...emptyExpedition(), active: c }));
        assert.equal(restored.ok, true); assert.deepEqual(currentClothing(restored.value.active, person), { ...before, ...clothing });
        const replay = replayTurns(c.conversations[person]);
        assert.deepEqual(decodeNarrativeReply(replay.at(-1).content).controls.clothing, clothing);
    }
});

test('existing conversations gain initial clothing without rewriting history or resetting later changes', async () => {
    const c = campaign();
    for (const person of PARTICIPANT_IDS) {
        apply(c, await receive(c, {}, person), `existing-${person}`, person);
        assert.equal(Object.hasOwn(c.conversations[person].at(-1), 'clothing'), false);
    }
    const saved = EXPEDITION_PARTITION.serialize({ ...emptyExpedition(), active: c });
    const restored = EXPEDITION_PARTITION.parse(saved);
    assert.equal(restored.ok, true);
    for (const person of PARTICIPANT_IDS) {
        const current = currentClothing(restored.value.active, person);
        assert.deepEqual(current, INITIAL_CLOTHING[person]);
        const context = inspectNarrativePrompt(buildConversationPrompt(restored.value.active, person, 'continue', await loadCanon(person, signal())));
        assert.deepEqual(context.story.clothing, current);
    }
    assert.deepEqual(EXPEDITION_PARTITION.serialize(restored.value), saved);

    const changed = { outer: '旅途中换上的草披肩', socks: null };
    apply(restored.value.active, await receive(restored.value.active, { clothing: changed }), 'new-clothing');
    const reopened = EXPEDITION_PARTITION.parse(EXPEDITION_PARTITION.serialize(restored.value));
    assert.equal(reopened.ok, true);
    for (const person of PARTICIPANT_IDS) {
        assert.deepEqual(currentClothing(reopened.value.active, person), {
            ...INITIAL_CLOTHING[person], ...(person === 'sanniang' ? changed : {}),
        });
        assert.deepEqual(reopened.value.active.conversations[person].slice(0, c.conversations[person].length), c.conversations[person]);
    }
});

test('current clothing survives summary boundaries and a replacement removes only its own changes', async () => {
    const c = campaign(), baseline = currentClothing(c, 'sanniang');
    apply(c, await receive(c, { clothing: { lower: '草裙' } }), 'earlier');
    c.memories.sanniang = { throughId: 'earlier', text: 'summary without any clothing details' };
    apply(c, await receive(c, { clothing: { outer: '临时披肩', socks: null }, affection: 'up' }), 'latest');
    const beforeRegeneration = structuredClone(c);
    const next = rewindReply(c, 'sanniang', 'latest');
    assert.deepEqual(c, beforeRegeneration);
    assert.deepEqual(currentClothing(next, 'sanniang'), { ...baseline, lower: '草裙' });
    assert.deepEqual(next.relationships, campaign().relationships);
    applyReply(next, { actionId: 'replacement', person: 'sanniang', text: 'fixture question', regenerate: 'latest' },
        await receive(next, { clothing: { outer: '借来的宽大棉袍' } }));
    const prompt = inspectNarrativePrompt(buildConversationPrompt(next, 'sanniang', 'continue', await loadCanon('sanniang', signal())));
    assert.deepEqual(prompt.story.clothing, { ...baseline, lower: '草裙', outer: '借来的宽大棉袍' });
    assert.equal(prompt.story.memory, c.memories.sanniang.text);
    assert.deepEqual(currentClothing(next, 'laobai'), INITIAL_CLOTHING.laobai);
    assert.equal(EXPEDITION_PARTITION.parse({ ...emptyExpedition(), active: next }).ok, true);
});

test('missing, empty and unchanged updates are quiet while null explicitly removes a category', async () => {
    for (const clothing of [undefined, null, {}, { ...INITIAL_CLOTHING.sanniang }]) {
        const c = campaign(), before = currentClothing(c, 'sanniang');
        const response = await receive(c, { clothing });
        assert.equal(response.issue, undefined); apply(c, response);
        assert.equal(c.conversations.sanniang.at(-1).clothing, undefined);
        assert.deepEqual(currentClothing(c, 'sanniang'), before);
    }
    const c = campaign();
    apply(c, await receive(c, { clothing: { inner: null, underpants: '', socks: null } }));
    assert.equal(currentClothing(c, 'sanniang').inner, null);
    assert.equal(currentClothing(c, 'sanniang').underpants, '');
    assert.equal(currentClothing(c, 'sanniang').socks, null);
    assert.equal(currentClothing(c, 'sanniang').outer, INITIAL_CLOTHING.sanniang.outer);
});

test('bad clothing fields do not erase dialogue, valid clothing, affection or independent actions', async () => {
    for (const clothing of ['a robe', [], 12, { lower: { name: 'skirt' } }, { hat: 'hat' }]) {
        const c = campaign();
        const response = await receive(c, { clothing, action: 'follow', affection: 'up', performance: { expression: 'smile', gesture: 'none' } });
        assert.equal(response.kind, 'dialogue'); assert.equal(response.issue, 'clothing_rejected');
        assert.equal(response.action, 'follow'); assert.equal(response.affection, 'up'); assert.ok(response.performance);
        apply(c, response);
        assert.equal(c.people.sanniang.mode, 'follow'); assert.ok(c.relationships.sanniang.affection > 0);
        assert.deepEqual(currentClothing(c, 'sanniang'), INITIAL_CLOTHING.sanniang);
        assert.equal(EXPEDITION_PARTITION.parse({ ...emptyExpedition(), active: c }).ok, true);
    }
    const c = campaign(), text = '<img src=x onerror=alert(1)> & "a robe"';
    apply(c, await receive(c, { clothing: { outer: text, lower: false, shoes: null } }));
    assert.equal(currentClothing(c, 'sanniang').outer, text);
    assert.equal(currentClothing(c, 'sanniang').lower, INITIAL_CLOTHING.sanniang.lower);
    assert.equal(currentClothing(c, 'sanniang').shoes, null);
    assert.equal(EXPEDITION_PARTITION.parse({ ...emptyExpedition(), active: c }).ok, true);
});

test('broken JSON, plain prose and incomplete replies never manufacture clothing changes', async () => {
    for (const response of [
        { text: '<dialogue>I changed my coat.</dialogue>\n{"clothing":' },
        { text: 'I changed into a new coat.' },
        { truncated: true },
    ]) {
        const c = campaign();
        const result = await receive(c, { clothing: { outer: 'new coat' } }, 'sanniang', response);
        apply(c, result);
        assert.deepEqual(currentClothing(c, 'sanniang'), INITIAL_CLOTHING.sanniang);
        assert.equal(c.conversations.sanniang.at(-1).clothing, undefined);
    }
});
