import assert from 'node:assert/strict';
import test from 'node:test';
import { createCampaign, advanceCampaign, tickCampaign, canTalk } from '../apps/game/expedition/campaign/rules.ts';
import { hasReturned } from '../apps/game/expedition/campaign/rescue.ts';
import { movePerson, personMap } from '../apps/game/expedition/world/people.ts';
import { buildConversationPrompt } from '../apps/game/expedition/narrative/prompt.ts';
import { generateConversation } from '../apps/game/expedition/narrative/conversation.ts';
import { applyReply } from '../apps/game/expedition/narrative/apply-reply.ts';
import { rewindReply } from '../apps/game/expedition/campaign/reply-checkpoint.ts';
import { COURTYARD } from '../apps/game/expedition/content/courtyard.ts';
import { PERSON_PLACES } from '../apps/game/expedition/content/people-places.ts';
import { startWorld } from '../apps/game/expedition/world/exploration.ts';
import { emptyExpedition } from '../apps/game/expedition/domain.ts';
import { EXPEDITION_PARTITION } from '../apps/game/expedition/partition.ts';
import { traveler } from './fixtures/expedition-traveler.js';
import { loadCanon, inspectNarrativePrompt, narrativeOptions, narrativeReply } from './fixtures/expedition-narrative.js';

const idle = { move: 0, dash: false, skill: false };
const captives = ['anian', 'kouzi'];
function atCells() {
    const c = createCampaign('rescue', 7, 'blade', 'traveler', traveler);
    c.facts.push('briefed');
    c.location = { ...startWorld(COURTYARD.cells, 'release'), visited: ['camp', 'cells'] };
    return c;
}
function interact(c, id) {
    const scene = COURTYARD[c.location.scene], target = [...scene.objects, ...scene.exits].find(item => item.id === id);
    c.location.position = { ...scene.anchors[target.anchor] };
    advanceCampaign(c, { type: 'interact', id });
}
function restore(c) {
    const data = emptyExpedition(); data.active = c;
    const parsed = EXPEDITION_PARTITION.parse(EXPEDITION_PARTITION.serialize(data));
    assert.equal(parsed.ok, true); assert.deepEqual(parsed.value.active, c);
    return parsed.value.active;
}

test('opening the physical doors unlocks real movement and current context for both captives, including existing conversations', async () => {
    let c = atCells();
    for (const person of captives) {
        c.conversations[person].push({ id: `old-${person}`, kind: 'dialogue', player: 'Earlier question', reply: 'Earlier answer',
            action: null, scene: 'cells', facts: [] });
        const canon = await loadCanon(person, new AbortController().signal);
        const inspect = () => inspectNarrativePrompt(buildConversationPrompt(c, person, 'Follow me', canon));
        const locked = inspect();
        assert.equal(locked.story.rescue.phase, 'confined'); assert.equal(locked.story.opening, null);
        assert.equal(locked.operations.actions.follow, undefined);
        const control = locked.story.playerMechanisms.find(item => item.id === 'release');
        assert.deepEqual(control.position, COURTYARD.cells.anchors.release);
        assert.equal(control.completed, false); assert.equal(control.withinReach, true);
        assert.throws(() => movePerson(c, person, 'follow'), { code: 'expedition_unavailable' });
    }
    const conversations = structuredClone(c.conversations);
    interact(c, 'release'); c = restore(c);
    for (const person of captives) {
        const data = inspectNarrativePrompt(buildConversationPrompt(c, person, 'Follow me', await loadCanon(person, new AbortController().signal)));
        assert.equal(data.story.rescue.phase, 'released'); assert.equal(data.story.rescued, false);
        assert.equal(data.story.playerMechanisms.find(item => item.id === 'release').completed, true);
        assert.ok(data.story.events.some(event => event.id === 'captives_released'));
        assert.ok(data.operations.actions.follow); assert.ok(data.operations.actions.stay);
        assert.equal(data.operations.actions['go:camp'], undefined);
        movePerson(c, person, 'follow'); assert.equal(c.people[person].mode, 'follow');
    }
    assert.deepEqual(c.conversations, conversations);
    assert.equal(c.facts.includes('captives_arrived'), false);
});

test('a valid conversation action starts following after release, and regeneration can undo it without undoing the opened door', async () => {
    for (const person of captives) {
        const c = atCells(); interact(c, 'release');
        c.location.position = { ...c.people[person].position }; assert.equal(canTalk(c, person), true);
        const agent = { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' },
            run: async request => {
                assert.ok(inspectNarrativePrompt(request).operations.actions.follow);
                return { text: narrativeReply({ reply: 'Agreed', action: 'follow' }) };
            } }) };
        const response = await generateConversation(agent, c, person, 'Follow me', new AbortController().signal, narrativeOptions);
        applyReply(c, { actionId: `follow-${person}`, person, text: 'Follow me' }, response);
        assert.equal(response.issue, undefined); assert.equal(c.people[person].mode, 'follow');
        const saved = restore(c), rewound = rewindReply(saved, person, `follow-${person}`);
        assert.equal(rewound.people[person].mode, 'idle'); assert.ok(rewound.facts.includes('captives_released'));
    }
});

test('following both people home completes rescue without arranging reception and preserves their following agreement', () => {
    const c = atCells(); interact(c, 'release'); interact(c, 'postern_latch');
    for (const person of captives) movePerson(c, person, 'follow');
    interact(c, 'postern');
    for (const person of captives) {
        assert.equal(c.people[person].scene, 'camp'); assert.equal(c.people[person].mode, 'follow');
        assert.ok(c.knowledge[person].includes(PERSON_PLACES[person].returnFact));
    }
    assert.ok(c.facts.includes('captives_arrived')); assert.equal(c.facts.includes('receiving_arranged'), false);
    const before = structuredClone(c.facts); tickCampaign(c, idle); assert.deepEqual(c.facts, before); restore(c);
});

test('escort can return along an opened waterway without the postern or reception', () => {
    const c = atCells(); c.facts.push('crossroads_cleared', 'waterway_cleared', 'sluice_opened');
    interact(c, 'release'); for (const person of captives) movePerson(c, person, 'follow');
    for (const exit of ['waterway', 'crossroads', 'camp']) interact(c, exit);
    assert.ok(c.facts.includes('captives_arrived'));
    assert.equal(c.facts.includes('postern_opened'), false); assert.equal(c.facts.includes('receiving_arranged'), false);
    restore(c);
});

test('separate returns survive reload and later departure; only the second actual return completes rescue', () => {
    let c = atCells(); interact(c, 'release'); interact(c, 'postern_latch');
    movePerson(c, 'anian', 'follow'); interact(c, 'postern');
    assert.equal(hasReturned(c.facts, 'anian'), true); assert.equal(hasReturned(c.facts, 'kouzi'), false);
    assert.equal(c.facts.includes('captives_arrived'), false);
    assert.equal(c.knowledge.kouzi.includes('anian_returned'), false);
    c = restore(c); interact(c, 'road'); movePerson(c, 'anian', 'stay'); interact(c, 'camp');
    interact(c, 'postern'); movePerson(c, 'kouzi', 'follow'); interact(c, 'postern');
    assert.equal(c.people.anian.scene, 'crossroads'); assert.equal(c.people.anian.mode, 'idle');
    assert.ok(c.facts.includes('captives_arrived'));
    assert.equal(c.knowledge.anian.includes('kouzi_returned'), false); restore(c);
});

test('a completed rescue remains complete without reconstructing or rewriting individual return events', async () => {
    const c = atCells(); c.facts.push('captives_released', 'captives_arrived');
    c.location = startWorld(COURTYARD.camp, 'start');
    for (const person of captives) {
        c.people[person].scene = 'camp'; c.people[person].position = { ...c.location.position };
        const data = inspectNarrativePrompt(buildConversationPrompt(c, person, 'Follow me', await loadCanon(person, new AbortController().signal)));
        assert.equal(data.story.rescue.phase, 'returned'); assert.equal(data.story.rescued, true);
        assert.ok(data.operations.actions.follow);
    }
    const restored = restore(c), facts = [...restored.facts];
    tickCampaign(restored, idle); assert.deepEqual(restored.facts, facts);
});

test('a released person can walk home independently; arrival is recorded by gameplay ticks while the player stays elsewhere', () => {
    let c = atCells(); interact(c, 'release'); interact(c, 'postern_latch');
    assert.equal(personMap(c, 'kouzi').find(place => place.id === 'camp').solo, true);
    movePerson(c, 'kouzi', 'go:camp');
    for (let i = 0; i < 4000 && c.people.kouzi.mode === 'travel'; i++) {
        tickCampaign(c, idle); if (i === 20) c = restore(c);
    }
    assert.equal(c.people.kouzi.scene, 'camp'); assert.equal(c.people.kouzi.mode, 'idle');
    assert.equal(hasReturned(c.facts, 'kouzi'), true); assert.equal(c.location.scene, 'cells');
    assert.equal(c.facts.includes('captives_arrived'), false);
    assert.equal(c.knowledge.anian.includes('kouzi_returned'), false); restore(c);
});

test('reception collects only a waiting prisoner and does not reset an escorted person', () => {
    const c = atCells(); interact(c, 'release'); interact(c, 'postern_latch');
    movePerson(c, 'anian', 'follow'); interact(c, 'postern');
    const escorted = structuredClone(c.people.anian);
    c.location.position = { ...c.people.laobai.position };
    advanceCampaign(c, { type: 'choice', id: 'receiving', person: 'laobai' });
    assert.deepEqual(c.people.anian, escorted);
    assert.equal(c.people.kouzi.scene, 'camp'); assert.ok(c.facts.includes('captives_arrived')); restore(c);
});

test('reception never fetches an agreed traveller from a different scene', () => {
    const c = atCells(); interact(c, 'release'); interact(c, 'postern_latch');
    movePerson(c, 'anian', 'follow'); interact(c, 'hall'); movePerson(c, 'anian', 'stay');
    interact(c, 'cells'); interact(c, 'postern'); const waiting = structuredClone(c.people.anian);
    c.location.position = { ...c.people.laobai.position };
    advanceCampaign(c, { type: 'choice', id: 'receiving', person: 'laobai' });
    assert.deepEqual(c.people.anian, waiting); assert.equal(c.people.kouzi.scene, 'camp');
    assert.equal(hasReturned(c.facts, 'anian'), false); assert.equal(c.facts.includes('captives_arrived'), false); restore(c);
});
