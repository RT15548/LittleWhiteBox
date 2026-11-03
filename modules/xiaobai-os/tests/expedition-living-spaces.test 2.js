import assert from 'node:assert/strict';
import test from 'node:test';
import { traveler } from './fixtures/expedition-traveler.js';
import { createCampaign, advanceCampaign, canTalk } from '../apps/game/expedition/campaign/rules.ts';
import { COURTYARD } from '../apps/game/expedition/content/courtyard.ts';
import { LIVING_SPACES, LIVING_ENTRANCES } from '../apps/game/expedition/content/living-spaces.ts';
import { PERSON_PLACES, DESTINATIONS } from '../apps/game/expedition/content/people-places.ts';
import { movePerson, tickPeople, personAt, personMap } from '../apps/game/expedition/world/people.ts';
import { conversationContext } from '../apps/game/expedition/narrative/prompt.ts';
import { LOCAL_LIFE } from '../apps/game/expedition/content/local-life.ts';
import { WORLD_COPY } from '../apps/game/expedition/content/world-copy.ts';
import { EXPEDITION_PARTITION } from '../apps/game/expedition/partition.ts';
import { emptyExpedition } from '../apps/game/expedition/domain.ts';
import { discoveredRoutes } from '../apps/game/expedition/presentation/map-projection.ts';
import { narrativeActions } from '../apps/game/expedition/narrative/actions.ts';
import { canChangeOutfit } from '../apps/game/expedition/outfits.ts';

const create = () => createCampaign('homes', 7, 'blade', 'traveler', traveler);
function door(c, id) {
    const scene = COURTYARD[c.location.scene], exit = scene.exits.find(exit => exit.id === id);
    c.location.position = { ...scene.anchors[exit.anchor] };
    advanceCampaign(c, { type: 'interact', id });
}
function reload(c) {
    const data = { ...emptyExpedition(), active: c };
    const parsed = EXPEDITION_PARTITION.parse(EXPEDITION_PARTITION.serialize(data));
    assert.equal(parsed.ok, true); assert.deepEqual(parsed.value.active, c);
    return parsed.value.active;
}

// Exits/reach are tested separately. Here the stable contract is campaign gating, actors and save ownership.
test('every household has bidirectional living-space travel before briefing, without clearing conversations or moving workers home', () => {
    let c = create();
    c.location.position = { ...c.people.sanniang.position }; advanceCampaign(c, { type: 'greet', person: 'sanniang' });
    const history = structuredClone(c.conversations), people = structuredClone(c.people);
    for (const entrance of LIVING_ENTRANCES) {
        door(c, entrance.to);
        assert.equal(c.location.scene, entrance.to);
        const inner = COURTYARD[entrance.to].exits.find(exit => exit.to !== 'camp');
        if (inner) {
            door(c, inner.id); c = reload(c);
            assert.ok(canChangeOutfit(c)); door(c, 'south');
        }
        c = reload(c); door(c, 'south');
        assert.equal(c.location.scene, 'camp');
    }
    assert.deepEqual(c.conversations, history); assert.deepEqual(c.people, people); assert.deepEqual(c.facts, []);
    assert.throws(() => door(c, 'road'), { code: 'expedition_world_interaction_unavailable' });
    assert.equal(personMap(c, 'sanniang').find(place => place.id === 'crossroads').accessible, false);
    assert.deepEqual(discoveredRoutes(c).scenes, ['camp']);
});

test('followers enter the actual room; staying survives departure and reload without silently returning to the clinic', () => {
    let c = create(); movePerson(c, 'sanniang', 'follow');
    door(c, 'clinic_front'); door(c, 'north');
    assert.equal(c.people.sanniang.scene, 'sanniang_room'); assert.equal(canTalk(c, 'sanniang'), true);
    movePerson(c, 'sanniang', 'stay'); const waiting = structuredClone(c.people.sanniang);
    door(c, 'south'); door(c, 'south'); c = reload(c);
    assert.deepEqual(c.people.sanniang, waiting); assert.equal(canTalk(c, 'sanniang'), false);
    door(c, 'clinic_front'); door(c, 'north'); assert.equal(canTalk(c, 'sanniang'), true);
});

test('every room is physically reachable by solo appointment; movement reloads mid-route and arrival clears only the travel order', () => {
    for (const id of Object.keys(LIVING_SPACES)) {
        let c = create(); movePerson(c, 'sanniang', `go:${id}`);
        assert.equal(c.people.sanniang.scene, PERSON_PLACES.sanniang.initial.scene);
        assert.equal(c.people.sanniang.mode, 'travel');
        for (let tick = 0; tick < 2200 && c.people.sanniang.mode === 'travel'; tick++) {
            tickPeople(c);
            if (tick === 40) c = reload(c);
        }
        assert.equal(c.people.sanniang.scene, id); assert.equal(c.people.sanniang.mode, 'idle');
        assert.equal(c.people.sanniang.destination, null); c = reload(c);
        const target = COURTYARD[id].anchors[DESTINATIONS[id].anchor];
        assert.ok(Math.hypot(c.people.sanniang.position.x - target.x, c.people.sanniang.position.y - target.y) < .2);
        assert.equal(c.location.scene, 'camp');
    }
});

test('model context reports the physical room, furniture, ordinary occupants, nearby people and not-yet-started movement', () => {
    const c = create(); movePerson(c, 'sanniang', 'go:sanniang_room');
    const pending = conversationContext(c, 'sanniang');
    assert.equal(pending.place, WORLD_COPY.scenes.camp);
    assert.equal(pending.movement.mode, 'travel'); assert.equal(pending.movement.destination, LIVING_SPACES.sanniang_room.name);
    movePerson(c, 'sanniang', 'follow'); door(c, 'anian_home');
    const room = conversationContext(c, 'sanniang');
    assert.equal(room.place, LIVING_SPACES.anian_home.name);
    assert.deepEqual(room.positions.player, c.location.position);
    assert.deepEqual(room.room.furniture.map(item => item.item), LIVING_SPACES.anian_home.furniture.map(item => item.label));
    assert.deepEqual(room.residents.map(item => item.name), LOCAL_LIFE.anian_home.map(local => local.name));
    assert.deepEqual(room.present, [traveler.name, WORLD_COPY.people.sanniang]);
    door(c, 'north'); const bedroom = conversationContext(c, 'sanniang');
    assert.deepEqual(bedroom.residents, []);
    assert.equal(bedroom.place, LIVING_SPACES.anian_room.name);
    assert.equal(bedroom.playerLodging, LIVING_SPACES.guest_room.name);
    assert.deepEqual(c.conversations.sanniang, []);
});

test('clinic work stays in treatment spaces; briefing and chapter handoff remain available inside the settlement', () => {
    const c = create();
    c.facts.push('captives_arrived', 'supplies_secured', 'warden_defeated');
    for (const id of Object.keys(LIVING_SPACES)) {
        c.people.sanniang = personAt(DESTINATIONS[id]); c.location.scene = id; c.location.position = { ...c.people.sanniang.position };
        const actions = narrativeActions(c, 'sanniang');
        assert.ok('briefing' in actions); assert.ok('finish' in actions);
        assert.equal('clinic' in actions, id === 'clinic_front');
    }
});
