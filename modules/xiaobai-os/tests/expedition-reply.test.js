import assert from 'node:assert/strict';
import test from 'node:test';
import { traveler } from './fixtures/expedition-traveler.js';
import { createCampaign, recordFact } from '../apps/game/expedition/campaign/rules.ts';
import { dialogueEffects, rewindReply, prepareRegeneration, latestConversationReply } from '../apps/game/expedition/campaign/reply-checkpoint.ts';
import { advanceExpedition, emptyExpedition } from '../apps/game/expedition/domain.ts';
import { EXPEDITION_PARTITION } from '../apps/game/expedition/partition.ts';
import { applyReply } from '../apps/game/expedition/narrative/apply-reply.ts';
import { greet, greetingTurn } from '../apps/game/expedition/content/greetings.ts';
import { PARTICIPANT_IDS } from '../apps/game/expedition/content/participants.ts';
import { readPerformance } from '../apps/game/expedition/performance/catalog.ts';
import { replayTurns } from '../apps/game/expedition/narrative/history.ts';
import { decodeNarrativeReply } from '../apps/game/expedition/narrative/response.ts';
import { segmentDialogue } from '../apps/game/expedition/performance/dialogue-text.ts';
const campaign = () => createCampaign('reply-fixture', 7, 'blade', 'traveler', traveler);
const reply = (action, affection = null) => ({ kind: 'dialogue', reply: 'fixture', action, affection });
const input = (actionId = 'one') => ({ actionId, person: 'sanniang', text: 'question' });

test('world movement commits progress without disabling reroll or stacking discarded relationship and clothing changes', () => {
    const c = campaign(); c.location.position = { ...c.people.sanniang.position };
    applyReply(c, input(), { ...reply('follow', 'up'), clothing: { outer: null } });
    const committed = advanceExpedition({ ...emptyExpedition(), active: c },
        { type: 'input', spans: [{ move: 3, ticks: 20, dash: false, skill: false }] }, 'walk', 0);
    const world = committed.active;
    assert.equal(world.lastReply, undefined);
    assert.equal(latestConversationReply(world, 'sanniang').id, 'one');
    const candidate = prepareRegeneration(world, 'sanniang', 'one');
    assert.deepEqual(candidate.location, world.location);
    assert.deepEqual(candidate.people, world.people);
    assert.deepEqual(candidate.facts, world.facts);
    assert.equal(candidate.seed, world.seed);
    assert.equal(candidate.relationships.sanniang.affection, 0);
    assert.equal(candidate.conversations.sanniang.at(-1).clothing, undefined);
    assert.equal(candidate.conversations.sanniang.at(-1).kind, 'player');
    assert.deepEqual(prepareRegeneration(candidate, 'sanniang', 'one'), candidate);
    const saved = EXPEDITION_PARTITION.parse({ ...committed, active: candidate });
    assert.equal(saved.ok, true);
    assert.deepEqual(saved.value.active, candidate);
    assert.equal(replayTurns(candidate.conversations.sanniang).at(-1).role, 'user');
    applyReply(candidate, { ...input('two'), regenerate: 'one' }, reply(null, 'up'));
    assert.equal(candidate.relationships.sanniang.affection, candidate.conversations.sanniang.at(-1).affectionDelta);
    assert.equal(candidate.conversations.sanniang.length, world.conversations.sanniang.length);
});

test('each authored greeting appears once as assistant speech with a valid portrait performance', () => {
    const c = campaign();
    for (const person of PARTICIPANT_IDS) {
        greet(c, person); greet(c, person);
        const turns = c.conversations[person]; assert.equal(turns.length, 1);
        assert.equal(turns[0].kind, 'greeting'); assert.equal(turns[0].action, null);
        assert.deepEqual(readPerformance(person, turns[0].performance), turns[0].performance);
        const messages = replayTurns(turns); assert.equal(messages.length, 1); assert.equal(messages[0].role, 'assistant');
        assert.equal(decodeNarrativeReply(messages[0].content).reply, turns[0].reply);
    }
    const returned = campaign(); recordFact(returned, 'captives_arrived');
    for (const person of ['anian', 'kouzi']) assert.notEqual(greetingTurn(returned, person).reply, greetingTurn(c, person).reply);
    for (const world of [c, returned]) for (const person of PARTICIPANT_IDS) {
        const segments = segmentDialogue(greetingTurn(world, person).reply);
        assert.deepEqual(segments.map(segment => segment.spoken), [false, true]);
        assert.ok(segments.every(segment => segment.text.trim().length > 0));
    }
    assert.deepEqual(returned.relationships, c.relationships);
});

test('replacement rewinds secrets, movement, random seed and highest relationship band without erasing earlier discoveries', () => {
    const c = campaign(); c.location.position = { ...c.people.sanniang.position };
    recordFact(c, 'briefed', ['sanniang']);
    // A unit boundary fixture, not a claimed real-model relationship playthrough.
    c.relationships.sanniang = { affection: 80, highestBand: 2 };
    const baseline = dialogueEffects(c);
    applyReply(c, input(), reply('share_secret', 'up'));
    assert.ok(c.relationships.sanniang.affection > 80); assert.ok(c.facts.length > baseline.facts.length);
    const restored = rewindReply(c, 'sanniang', 'one');
    assert.deepEqual(dialogueEffects(restored), baseline);
    assert.equal(restored.conversations.sanniang.length, 1); assert.equal(restored.conversations.sanniang[0].kind, 'greeting');
    applyReply(restored, { ...input('two'), regenerate: 'one' }, reply('follow', 'down'));
    assert.equal(restored.people.sanniang.mode, 'follow'); assert.deepEqual(restored.facts, baseline.facts);
    const again = rewindReply(restored, 'sanniang', 'two');
    assert.deepEqual(dialogueEffects(again), baseline);
    applyReply(again, { ...input('three'), regenerate: 'two' }, reply(null, 'up'));
    assert.equal(again.relationships.sanniang.affection, c.relationships.sanniang.affection);
    assert.equal(again.seed, c.seed); assert.equal(again.people.sanniang.mode, baseline.people.sanniang.mode);
    assert.deepEqual(again.lastReply.before, baseline);
    assert.equal(again.conversations.sanniang.filter(t => t.kind === 'dialogue').length, 1);
    assert.throws(() => rewindReply(again, 'laobai', 'three'), { code: 'expedition_stale' });
    assert.throws(() => rewindReply(again, 'sanniang', 'two'), { code: 'expedition_stale' });
});
