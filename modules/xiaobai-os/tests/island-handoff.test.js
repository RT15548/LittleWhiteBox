import assert from 'node:assert/strict';
import test from 'node:test';
import { PERSON_IDS } from '../apps/game/island/model.ts';
import { LANDSCAPE } from '../apps/game/island/content.ts';
import { newJourney } from '../apps/game/island/world.ts';
import { operate } from '../apps/game/island/operations.ts';
import { advance, awaitingDecision } from '../apps/game/island/clock.ts';
import { openScene, observe } from '../apps/game/island/scene.ts';
import { createItem, carriedWeight } from '../apps/game/island/inventory.ts';
import { settleDeath } from '../apps/game/island/mortality.ts';
import { ISLAND_PARTITION } from '../apps/game/island/partition.ts';

function start() {
    const w = newJourney('handoff');
    for (const [i, id] of PERSON_IDS.entries()) {
        w.people[id].position = { x: -700 + i * 90, y: 0 };
        if (id !== 'player') w.people[id].activity = { kind: 'rest', until: 600 };
    }
    w.people.lin.position = { x: -699, y: 0 };
    return w;
}
const act = (w, actor, operation) => operate(w, actor === 'player' ? { kind: 'player' }
    : { kind: 'gm', scene: openScene(w, actor, LANDSCAPE) }, actor, operation, LANDSCAPE);
const offer = (w, actor, item, to, units = 1) => act(w, actor, { kind: 'offer', item, to, units });
const save = w => ({ formatVersion: 1, revision: 1, active: w, last: { id: 'handoff', fingerprint: '0'.repeat(64) } });

test('holding out part of a bundle wakes the actual recipient but transfers nothing until their own acceptance', () => {
    let w = start(); const item = createItem(w, 'player', 'cord', 5, .6);
    const total = carriedWeight(w, 'player') + carriedWeight(w, 'lin'), resting = structuredClone(w.people.lin.activity);
    w = offer(w, 'player', item, 'lin', 2);
    assert.equal(w.items[item].quantity, 5); assert.equal(w.items[item].location.person, 'player');
    assert.deepEqual(awaitingDecision(w), ['lin']); assert.deepEqual(w.people.lin.activity, resting);
    const incoming = observe(w, 'lin', LANDSCAPE);
    assert.equal(incoming.items.some(i => i.id === item), false);
    assert.deepEqual(incoming.offers.map(o => [o.from, o.to, o.units]), [['player', 'lin', 2]]);
    assert.deepEqual(observe(w, 'zhou', LANDSCAPE).offers, []);
    assert.throws(() => act(w, 'zhou', { kind: 'accept', from: 'player' }), { code: 'island_unavailable' });
    w = act(w, 'lin', { kind: 'accept', from: 'player' });
    const received = w.experiences.at(-1).payload;
    assert.equal(received.kind, 'received'); assert.equal(received.units, 2);
    assert.notEqual(received.item, item); assert.equal(w.items[item].quantity, 3);
    assert.equal(w.items[received.item].quantity, 2); assert.equal(w.items[received.item].wetness, .6);
    assert.equal(carriedWeight(w, 'player') + carriedWeight(w, 'lin'), total);
    assert.equal(w.people.player.activity, null); assert.deepEqual(w.people.lin.activity, resting);
    assert.deepEqual(awaitingDecision(w), []); assert.equal(w.clock, 0);
    assert.throws(() => act(w, 'lin', { kind: 'accept', from: 'player' }), { code: 'island_unavailable' });
});

test('a water container keeps its identity, water and condition; the GM cannot perform the player acceptance', () => {
    let w = start(); const item = createItem(w, 'lin', 'metal_cup', 1, .4);
    w.items[item].water = { millilitres: 180, quality: 'untreated', coconut: null }; w.people.lin.activity = null;
    const container = structuredClone(w.items[item]);
    w = offer(w, 'lin', item, 'player');
    const authority = { kind: 'gm', scene: openScene(w, 'player', LANDSCAPE) };
    assert.throws(() => operate(w, authority, 'player', { kind: 'accept', from: 'lin' }, LANDSCAPE), { code: 'island_authority' });
    assert.equal(w.items[item].location.person, 'lin');
    w = act(w, 'player', { kind: 'rest', seconds: 60 });
    w = act(w, 'player', { kind: 'accept', from: 'lin' });
    assert.deepEqual(w.items[item], { ...container, location: { kind: 'carried', person: 'player' } });
    assert.equal(w.people.player.activity.kind, 'rest'); assert.equal(w.people.lin.activity, null);
    assert.equal(w.experiences.at(-1).payload.item, item);
});

test('offers survive reload, require carried goods and cannot be duplicated, worn away or accepted after withdrawal', () => {
    let w = start(); const item = createItem(w, 'player', 'branch', 3);
    assert.throws(() => offer(w, 'player', 'player-shirt', 'lin'), { code: 'island_unavailable' });
    assert.throws(() => offer(w, 'player', item, 'zhou'), { code: 'island_unavailable' });
    assert.throws(() => offer(w, 'player', item, 'lin', 4), { code: 'island_unavailable' });
    assert.throws(() => offer(w, 'player', item, 'player'), { code: 'island_unavailable' });
    w = offer(w, 'player', item, 'lin', 2);
    assert.throws(() => offer(w, 'player', item, 'lin'), { code: 'island_occupied' });
    assert.throws(() => act(w, 'player', { kind: 'drop', item }), { code: 'island_occupied' });
    const loaded = ISLAND_PARTITION.parse(ISLAND_PARTITION.serialize(save(w)));
    assert.equal(loaded.ok, true); assert.deepEqual(loaded.value.active.people.player.activity, w.people.player.activity);
    assert.deepEqual(observe(loaded.value.active, 'lin', LANDSCAPE).offers, observe(w, 'lin', LANDSCAPE).offers);
    const corrupt = save(structuredClone(w)); corrupt.active.people.player.activity.units = 4;
    assert.equal(ISLAND_PARTITION.parse(corrupt).ok, false);
    w = act(w, 'player', { kind: 'cancel' });
    assert.throws(() => act(w, 'lin', { kind: 'accept', from: 'player' }), { code: 'island_unavailable' });
    assert.equal(w.items[item].quantity, 3); assert.deepEqual(observe(w, 'lin', LANDSCAPE).offers, []);
});

test('over-capacity acceptance fails atomically and can succeed later without inventing or losing quantities', () => {
    let w = start(); const item = createItem(w, 'player', 'branch', 4);
    w.items.load = { kind: 'coral_stone', location: { kind: 'carried', person: 'lin' }, quantity: 100, water: null, wetness: 0, foodSince: null };
    w = offer(w, 'player', item, 'lin', 2); const before = structuredClone(w);
    assert.throws(() => act(w, 'lin', { kind: 'accept', from: 'player' }), { code: 'island_capacity' });
    assert.deepEqual(w, before);
    w = act(w, 'lin', { kind: 'cancel' }); w = act(w, 'lin', { kind: 'drop', item: 'load' });
    w = act(w, 'lin', { kind: 'accept', from: 'player' });
    assert.equal(Object.values(w.items).filter(i => i.kind === 'branch').reduce((n, i) => n + i.quantity, 0), 4);
    assert.equal(w.people.player.activity, null);
});

test('walking away ends the physical offer without moving the goods or making a remote reservation', () => {
    let w = start(); const item = createItem(w, 'lin', 'metal_cup', 1); w.people.lin.activity = null;
    w = offer(w, 'lin', item, 'player');
    w = act(w, 'player', { kind: 'travel', route: [{ x: -710, y: 0 }] });
    const step = advance(w, 10, LANDSCAPE); w = step.world;
    assert.equal(step.elapsed, 1); assert.equal(w.people.lin.activity, null);
    assert.equal(w.items[item].location.person, 'lin');
    assert.equal(w.people.player.activity.kind, 'travel'); assert.ok(step.due.includes('lin'));
    assert.equal(ISLAND_PARTITION.parse(save(w)).ok, true);
});

test('death cancels handovers consistently and leaves physical goods on the original body', () => {
    for (const deceased of ['player', 'lin']) {
        let w = start(); const item = createItem(w, 'lin', 'metal_cup', 1); w.people.lin.activity = null;
        w = offer(w, 'lin', item, 'player'); w = settleDeath(w, deceased, 'trauma', LANDSCAPE);
        assert.equal(w.people.lin.activity, null); assert.equal(w.items[item].location.person, 'lin');
        assert.equal(w.experiences.at(-1).payload.kind, 'died');
        assert.equal(ISLAND_PARTITION.parse(save(w)).ok, true);
    }
});
