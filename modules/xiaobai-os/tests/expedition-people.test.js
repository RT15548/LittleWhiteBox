import assert from 'node:assert/strict';
import test from 'node:test';
import { traveler } from './fixtures/expedition-traveler.js';
import { createCampaign, recordFact, canTalk, tickCampaign, advanceCampaign } from '../apps/game/expedition/campaign/rules.ts';
import { movePerson, tickPeople, personMap, campaignInteractions } from '../apps/game/expedition/world/people.ts';
import { COURTYARD } from '../apps/game/expedition/content/courtyard.ts';
import { DESTINATIONS } from '../apps/game/expedition/content/people-places.ts';
import { narrativeActions } from '../apps/game/expedition/narrative/actions.ts';
import { validateExpedition } from '../apps/game/expedition/partition.ts';
import { emptyExpedition } from '../apps/game/expedition/domain.ts';
const create = () => createCampaign('people', 7, 'blade', 'traveler', traveler);
const idle = { move: 0, dash: false, skill: false };

test('captives can talk across their locked bars without moving out or offering camp activities', () => {
    const c = create(); c.location.scene = 'cells';
    for (const id of ['kouzi', 'anian']) {
        c.location.position = { ...COURTYARD.cells.anchors[`${id}_talk`] };
        assert.equal(canTalk(c, id), true); assert.deepEqual(narrativeActions(c, id), {});
        assert.throws(() => movePerson(c, id, 'follow'));
    }
    assert.ok(!c.facts.includes('captives_released'));
});

test('all camp appointments physically reach authored anchors and survive reload during walking', () => {
    for (const destination of ['gatehouse', 'clinic_back', 'registry', 'pipewalk']) {
        let c = create(); const initial = structuredClone(c.people.laobai.position);
        movePerson(c, 'laobai', `go:${destination}`);
        for (let t = 0; t < 1500 && c.people.laobai.mode === 'travel'; t++) {
            tickPeople(c);
            if (t === 20) { const data = emptyExpedition(); data.active = c; validateExpedition(data); c = structuredClone(c); }
        }
        assert.equal(c.people.laobai.mode, 'idle'); assert.notDeepEqual(c.people.laobai.position, initial);
        const target = COURTYARD.camp.anchors[DESTINATIONS[destination].anchor];
        assert.ok(Math.hypot(c.people.laobai.position.x - target.x, c.people.laobai.position.y - target.y) < .2);
        const marker = campaignInteractions(c).find(i => i.target.id === 'laobai'); assert.deepEqual(marker.position, c.people.laobai.position);
    }
});

test('every follower settles within talking reach instead of waiting just beyond interaction range', () => {
    const c = create(); c.facts.push('captives_arrived');
    for (const id of Object.keys(c.people)) {
        c.people[id] = { ...c.people.laobai, position: { ...COURTYARD.camp.anchors.guard }, scene: 'camp', mode: 'follow', destination: null };
    }
    for (let t = 0; t < 2000; t++) { tickPeople(c); }
    for (const id of Object.keys(c.people)) { assert.equal(canTalk(c, id), true, id); }
    assert.ok('stay' in narrativeActions(c, 'sanniang'));
    assert.ok(!('receiving' in narrativeActions(c, 'laobai')));
});

test('chapter handoff stays available beside Sanniang at a camp appointment, without another model request', () => {
    const c = create();
    for (const fact of ['captives_arrived', 'supplies_secured', 'warden_defeated']) recordFact(c, fact);
    movePerson(c, 'sanniang', 'go:clinic_back');
    for (let t = 0; t < 1500 && c.people.sanniang.mode === 'travel'; t++) tickPeople(c);
    assert.equal(c.people.sanniang.mode, 'idle'); c.location.position = { ...c.people.sanniang.position };
    assert.equal(canTalk(c, 'sanniang'), true);
    assert.ok('finish' in narrativeActions(c, 'sanniang')); assert.ok(!('clinic' in narrativeActions(c, 'sanniang')));
    advanceCampaign(c, { type: 'choice', id: 'finish', person: 'sanniang' });
    assert.ok(c.facts.includes('chapter_completed'));
});

test('locked captives cannot follow; solo appointments cannot route through a hostile scene', () => {
    const c = create();
    assert.ok(!('follow' in narrativeActions(c, 'kouzi'))); assert.throws(() => movePerson(c, 'kouzi', 'follow'));
    recordFact(c, 'briefed');
    const crossroads = personMap(c, 'laobai').find(p => p.id === 'crossroads');
    assert.equal(crossroads.accessible, true); assert.equal(crossroads.safe, false); assert.equal(crossroads.solo, false);
    assert.throws(() => movePerson(c, 'laobai', 'go:crossroads'));
});

test('solo travel excludes a cleared waterway whose physical sluice still blocks the onward path', () => {
    const c = create(); c.facts.push('briefed', 'crossroads_cleared', 'waterway_cleared');
    assert.equal(personMap(c, 'laobai').find(p => p.id === 'cells').accessible, false);
    assert.throws(() => movePerson(c, 'laobai', 'go:cells'));
    c.facts.push('sluice_opened');
    assert.equal(personMap(c, 'laobai').find(p => p.id === 'cells').solo, true);
    movePerson(c, 'laobai', 'go:cells');
    for (let t = 0; t < 5000 && c.people.laobai.mode === 'travel'; t++) { tickPeople(c); }
    assert.equal(c.people.laobai.mode, 'idle'); assert.equal(c.people.laobai.scene, 'cells');
});

test('following crosses scenes, sees local events and stays outside all combat target lists', () => {
    const c = create(); recordFact(c, 'briefed'); movePerson(c, 'sanniang', 'follow');
    c.location.position = { ...COURTYARD.camp.anchors.road }; advanceCampaign(c, { type: 'interact', id: 'road' });
    assert.equal(c.people.sanniang.scene, 'crossroads'); assert.equal(c.people.laobai.scene, 'camp');
    recordFact(c, 'crossroads_cleared'); assert.ok(c.knowledge.sanniang.includes('crossroads_cleared')); assert.ok(!c.knowledge.laobai.includes('crossroads_cleared'));
    c.location.position = { ...COURTYARD.crossroads.anchors.gate }; advanceCampaign(c, { type: 'interact', id: 'gate' });
    c.location.position = { ...COURTYARD.gate.anchors.encounter }; tickCampaign(c, idle);
    assert.equal(c.phase, 'battle'); assert.equal(c.people.sanniang.scene, 'gate');
    const followers = c.battle.companions ?? []; assert.ok(!followers.some(p => p.id === 'sanniang'));
});

test('stay preserves the agreed location when the player leaves and returns', () => {
    const c = create(); recordFact(c, 'briefed'); movePerson(c, 'laobai', 'follow');
    c.location.position = { ...COURTYARD.camp.anchors.road }; advanceCampaign(c, { type: 'interact', id: 'road' });
    movePerson(c, 'laobai', 'stay'); assert.equal(canTalk(c, 'laobai'), true);
    advanceCampaign(c, { type: 'interact', id: 'camp' });
    assert.equal(c.people.laobai.scene, 'crossroads'); assert.equal(canTalk(c, 'laobai'), false);
    assert.deepEqual(c.people.laobai.position, COURTYARD.crossroads.anchors.camp);
    advanceCampaign(c, { type: 'interact', id: 'road' });
    assert.equal(canTalk(c, 'laobai'), true);
});
