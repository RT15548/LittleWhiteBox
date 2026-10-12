import assert from 'node:assert/strict';
import test from 'node:test';
import { createCampaign, advanceCampaign } from '../apps/game/expedition/campaign/rules.ts';
import { chapterProgress } from '../apps/game/expedition/campaign/progress.ts';
import { conversationContext, buildConversationPrompt } from '../apps/game/expedition/narrative/prompt.ts';
import { movePerson } from '../apps/game/expedition/world/people.ts';
import { COURTYARD } from '../apps/game/expedition/content/courtyard.ts';
import { availableChoices } from '../apps/game/expedition/content/campaign-actions.ts';
import { SUPPLIES_HANDOFF } from '../apps/game/expedition/content/supplies.ts';
import { campaignObjective } from '../apps/game/expedition/content/campaign-copy.ts';
import { traveler } from './fixtures/expedition-traveler.js';
import { loadCanon, inspectNarrativePrompt } from './fixtures/expedition-narrative.js';

const campaign = () => createCampaign('progress-review', 7, 'blade', 'traveler', traveler);

test('cell dialogue receives real exits, physical access, the current leader and navigable scene routes', async () => {
    const c = campaign(); c.facts.push('briefed', 'crossroads_cleared', 'waterway_cleared', 'sluice_opened');
    c.location = { scene: 'cells', position: { ...COURTYARD.cells.anchors.kouzi_talk }, facing: 0, visited: ['camp', 'cells'] };
    const canon = await loadCanon('kouzi', new AbortController().signal);
    const inspect = () => inspectNarrativePrompt(buildConversationPrompt(c, 'kouzi', 'Where can we go?', canon)).story;
    let story = inspect();
    assert.deepEqual(story.exits.map(e => e.to), ['waterway', 'hall', 'camp']);
    assert.ok(story.exits.every(e => e.selfAccessible === false));
    assert.equal(story.exits.find(e => e.to === 'camp').open, false);
    c.location.position = { ...COURTYARD.cells.anchors.release }; advanceCampaign(c, { type: 'interact', id: 'release' });
    movePerson(c, 'kouzi', 'follow'); story = inspect();
    assert.equal(story.movement.mode, 'follow'); assert.equal(story.movement.leader, traveler.name);
    assert.equal(story.movement.destination, null);
    assert.equal(story.exits.find(e => e.to === 'hall').selfAccessible, true);
    assert.equal(story.exits.find(e => e.to === 'camp').selfAccessible, false);
    assert.deepEqual(story.map.find(p => p.id === 'camp').route.map(e => e.to), ['waterway', 'crossroads', 'camp']);
    for (const place of story.map) for (const step of place.route ?? []) {
        const exit = COURTYARD[step.from].exits.find(e => e.id === step.exit);
        assert.equal(exit.to, step.to); assert.deepEqual(COURTYARD[step.from].anchors[exit.anchor], step.position);
    }
    c.location.position = { ...COURTYARD.cells.anchors.latch }; advanceCampaign(c, { type: 'interact', id: 'postern_latch' });
    story = inspect(); assert.equal(story.exits.find(e => e.to === 'camp').selfAccessible, true);
    assert.deepEqual(story.map.find(p => p.id === 'camp').route.map(e => e.exit), ['postern']);
    assert.equal(story.map.find(p => p.id === 'hall').solo, false);
});

test('supply guidance references the actual cargo interaction and changes only with its real unlock and collection', () => {
    const c = campaign(), handoff = SUPPLIES_HANDOFF;
    const object = COURTYARD[handoff.scene].objects.find(o => o.id === handoff.object.id);
    assert.ok(object); assert.equal(object.kind, 'inspect');
    let supplies = conversationContext(c, 'sanniang').supplies;
    assert.equal(supplies.phase, 'held'); assert.equal(supplies.collection.available, false);
    assert.equal(supplies.collection.scene, handoff.scene);
    assert.deepEqual(supplies.collection.position, COURTYARD[handoff.scene].anchors[object.anchor]);
    c.facts.push('warden_defeated'); supplies = conversationContext(c, 'sanniang').supplies;
    assert.equal(supplies.phase, 'ready'); assert.equal(supplies.collection.available, true);
    c.location.position = { ...supplies.collection.position }; advanceCampaign(c, { type: 'interact', id: object.id });
    assert.equal(conversationContext(c, 'sanniang').supplies.phase, 'collected');
});

test('chapter completion becomes public context without inventing eyewitness memories or moving the cast', () => {
    const c = campaign(); c.facts.push('briefed', 'crossroads_cleared', 'captives_released', 'captives_arrived', 'warden_defeated', 'supplies_secured');
    c.location.position = { ...c.people.sanniang.position };
    const people = structuredClone(c.people);
    advanceCampaign(c, { type: 'choice', id: 'finish', person: 'sanniang' });
    assert.deepEqual(c.people, people);
    for (const person of ['sanniang', 'laobai', 'anian', 'kouzi']) {
        const context = conversationContext(c, person);
        assert.equal(context.chapter.phase, 'free'); assert.ok(context.actions.includes('follow'));
        assert.equal(context.actions.includes('receiving'), false); assert.equal(context.actions.includes('finish'), false);
        assert.equal(context.events.some(e => e.id === 'chapter_completed'), person === 'sanniang');
    }
    assert.equal(chapterProgress(c).optionalRoots, true); const withRoots = campaignObjective(c);
    c.facts.push('roots_cleared'); assert.equal(chapterProgress(c).optionalRoots, false);
    assert.notEqual(campaignObjective(c), withRoots);
    assert.equal(chapterProgress(c).phase, 'free');
    assert.equal(availableChoices(c.facts, 'laobai', c.people.laobai).includes('receiving'), false);
});
