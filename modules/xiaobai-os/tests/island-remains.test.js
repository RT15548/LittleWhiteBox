import assert from 'node:assert/strict';
import test from 'node:test';
import { PERSON_IDS } from '../apps/game/island/model.ts';
import { LANDSCAPE } from '../apps/game/island/content.ts';
import { SURVIVAL } from '../apps/game/island/survival-content.ts';
import { newJourney } from '../apps/game/island/world.ts';
import { operate } from '../apps/game/island/operations.ts';
import { advance, awaitingDecision } from '../apps/game/island/clock.ts';
import { settleDeath } from '../apps/game/island/mortality.ts';
import { observe, openScene } from '../apps/game/island/scene.ts';
import { createItem } from '../apps/game/island/inventory.ts';
import { itemPosition } from '../apps/game/island/space.ts';
import { ISLAND_PARTITION } from '../apps/game/island/partition.ts';

function start() {
    let w = newJourney('remains');
    for (const [i, id] of PERSON_IDS.entries()) {
        w.people[id].position = { x: -700 + i * 90, y: 0 };
        if (id !== 'player') w.people[id].activity = { kind: 'rest', until: 3600 };
    }
    w.people.lin.position = { x: -699, y: 0 };
    w = settleDeath(w, 'lin', 'trauma', LANDSCAPE);
    return w;
}
const act = (w, actor, op) => operate(w, actor === 'player' ? { kind: 'player' } : { kind: 'gm', scene: openScene(w, actor, LANDSCAPE) }, actor, op, LANDSCAPE);
const save = w => ({ formatVersion: 1, revision: 1, active: w, last: { id: 'remains', fingerprint: '0'.repeat(64) } });
const drag = { kind: 'drag', subject: 'lin', route: [{ x: -710, y: 0 }] };

test('moving remains preserves the original body and possessions, advances gradually, and can be stopped anywhere', () => {
    let w = start(); const original = structuredClone(w.people.lin), items = structuredClone(w.items);
    w = act(w, 'player', drag);
    assert.deepEqual(w.people.lin, original); assert.equal(w.clock, 0);
    const walking = act(start(), 'player', { kind: 'travel', route: drag.route });
    w = advance(w, 5, LANDSCAPE).world;
    assert.ok(w.people.player.position.x < -700 && w.people.player.position.x > -710);
    assert.equal(w.people.lin.position.x - w.people.player.position.x, 1);
    assert.deepEqual(w.people.lin.body, original.body);
    assert.deepEqual(w.items['lin-shirt'].location, items['lin-shirt'].location);
    assert.equal(w.items['lin-shirt'].quantity, items['lin-shirt'].quantity);
    assert.deepEqual(itemPosition(w, 'lin-shirt'), w.people.lin.position);
    assert.ok(w.people.player.body.needs.waterDeficit > advance(walking, 5, LANDSCAPE).world.people.player.body.needs.waterDeficit);
    assert.equal(observe(w, 'zhou', LANDSCAPE).people.some(p => p.id === 'lin'), false);
    const at = structuredClone(w.people.lin.position);
    w = act(w, 'player', { kind: 'cancel' });
    assert.equal(w.people.player.activity, null); assert.deepEqual(w.people.lin.position, at);
    assert.deepEqual(w.experiences.at(-1).payload, { kind: 'body_handling', actor: 'player', subject: 'lin', stage: 'placed' });
    assert.equal(ISLAND_PARTITION.parse(save(w)).ok, true);
});

test('an unfinished move resumes from saved positions and arrival leaves the same body at the reached location', () => {
    let w = advance(act(start(), 'player', drag), 3, LANDSCAPE).world;
    const loaded = ISLAND_PARTITION.parse(ISLAND_PARTITION.serialize(save(w)));
    assert.equal(loaded.ok, true);
    assert.deepEqual(loaded.value.active.people, w.people);
    const result = advance(loaded.value.active, 60, LANDSCAPE); w = result.world;
    assert.equal(result.stop, 'player_finished'); assert.deepEqual(w.people.player.position, drag.route[0]);
    assert.deepEqual(w.people.lin.position, { x: -709, y: 0 });
    assert.equal(w.people.player.activity, null); assert.equal(w.people.lin.activity, null);
    assert.equal(ISLAND_PARTITION.parse(save(w)).ok, true);
});

test('dragging at the reach boundary keeps a saveable grip through diagonal route segments', () => {
    let w = start(); w.people.lin.position = { x: -700, y: 1.5 };
    w = act(w, 'player', { ...drag, route: [{ x: -714, y: 13 }, { x: -717, y: -8 }] });
    for (let step = 0; step < 200 && w.people.player.activity; step++) {
        w = advance(w, 1, LANDSCAPE).world;
        assert.equal(ISLAND_PARTITION.parse(save(w)).ok, true);
    }
    assert.equal(w.people.player.activity, null);
});

test('living, distant and already-held bodies cannot be dragged, and neither actor nor body can cross an obstacle', () => {
    let w = start(); w.people.zhou.position = { x: -699, y: 1 }; w.people.zhou.activity = null;
    assert.throws(() => act(w, 'player', { ...drag, subject: 'zhou' }), { code: 'island_unavailable' });
    w.people.lin.position.x = -680;
    assert.throws(() => act(w, 'player', drag), { code: 'island_unavailable' });
    w.people.lin.position.x = -699;
    w = act(w, 'player', drag);
    assert.throws(() => act(w, 'zhou', { ...drag, route: [{ x: -705, y: 1 }] }), { code: 'island_body_held' });
    const corrupt = save(structuredClone(w)); corrupt.active.people.zhou.activity = { ...drag, route: [{ x: -705, y: 1 }] };
    assert.equal(ISLAND_PARTITION.parse(corrupt).ok, false);
    w = act(w, 'player', { kind: 'cancel' });
    const land = { ...LANDSCAPE, obstacles: [[{ x: -699.2, y: 2 }, { x: -698.8, y: 2 }, { x: -698.8, y: 4 }, { x: -699.2, y: 4 }]] };
    const before = structuredClone(w);
    assert.throws(() => operate(w, { kind: 'player' }, 'player', { ...drag, route: [{ x: -700, y: 6 }] }, land), { code: 'island_blocked' });
    assert.deepEqual(w, before);
});

test('covering consumes time, not the actual fabric; it moves with the body and can be taken back', () => {
    let w = start(); const cloth = createItem(w, 'player', 'cloth', 2, .7);
    assert.throws(() => act(w, 'player', { kind: 'work', task: { kind: 'cover_body', subject: 'lin', item: 'player-shirt' } }), { code: 'island_conditions' });
    const task = { kind: 'cover_body', subject: 'lin', item: cloth };
    w = act(w, 'player', { kind: 'work', task });
    w = advance(w, 10, LANDSCAPE).world;
    assert.equal(w.items[cloth].location.person, 'player');
    w = act(w, 'player', { kind: 'cancel' });
    assert.equal(w.items[cloth].quantity, 2);
    w = advance(act(w, 'player', { kind: 'work', task }), SURVIVAL.coverBodySeconds, LANDSCAPE).world;
    assert.deepEqual(w.items[cloth].location, { kind: 'covering', person: 'lin' });
    assert.equal(w.items[cloth].quantity, 2); assert.ok(w.items[cloth].wetness > .6);
    assert.equal(w.experiences.at(-1).payload.kind, 'body_covered');
    assert.equal(observe(w, 'player', LANDSCAPE).items.find(i => i.id === cloth).location.kind, 'covering');
    assert.equal(ISLAND_PARTITION.parse(save(w)).ok, true);
    w = advance(act(w, 'player', drag), 60, LANDSCAPE).world;
    assert.deepEqual(itemPosition(w, cloth), w.people.lin.position);
    w = advance(act(w, 'player', { kind: 'take', item: cloth }), 2, LANDSCAPE).world;
    assert.deepEqual(w.items[cloth].location, { kind: 'carried', person: 'player' }); assert.equal(w.items[cloth].quantity, 2);
    const corrupt = save(structuredClone(w)); corrupt.active.items[cloth].location = { kind: 'covering', person: 'zhou' };
    assert.equal(ISLAND_PARTITION.parse(corrupt).ok, false);
});

test('covering fails without consuming its item when another person has started moving that body', () => {
    let w = start(); w.people.zhou.position = { x: -699, y: 1 }; w.people.zhou.activity = null;
    const cloth = createItem(w, 'player', 'cloth', 1);
    w = act(w, 'player', { kind: 'work', task: { kind: 'cover_body', subject: 'lin', item: cloth } });
    w = act(w, 'zhou', { ...drag, route: [{ x: -700, y: 1 }] });
    assert.equal(awaitingDecision(w).includes('zhou'), false);
    // No teleport: while still held, the actual completion check reports why it cannot finish.
    w.people.player.activity.remaining = 1;
    w = advance(w, 1, LANDSCAPE).world;
    assert.equal(w.people.player.activity, null); assert.equal(w.items[cloth].location.person, 'player');
    assert.ok(w.experiences.some(e => e.payload.kind === 'work_failed' && e.payload.reason === 'island_body_held'));
    assert.equal(ISLAND_PARTITION.parse(save(w)).ok, true);
});

test('handler death releases remains before the final death event and the GM never controls player dragging', () => {
    let w = act(start(), 'player', drag); w = advance(w, 2, LANDSCAPE).world;
    const at = structuredClone(w.people.lin.position);
    w = settleDeath(w, 'player', 'dehydration', LANDSCAPE);
    assert.equal(w.people.player.activity, null); assert.deepEqual(w.people.lin.position, at);
    assert.deepEqual(w.experiences.at(-1).payload, { kind: 'died', actor: 'player' });
    assert.equal(ISLAND_PARTITION.parse(save(w)).ok, true);
    w = start(); w.people.zhou.position = { x: -700, y: 1 };
    assert.throws(() => operate(w, { kind: 'gm', scene: openScene(w, 'zhou', LANDSCAPE) }, 'player', drag, LANDSCAPE), { code: 'island_authority' });
});

test('witnessing a death asks only its living NPC witnesses to reconsider without deciding their reaction or stopping their work', () => {
    let w = newJourney('death-attention');
    for (const [i, id] of PERSON_IDS.entries()) {
        w.people[id].position = { x: -700 + i * 90, y: 0 };
        if (id !== 'player') w.people[id].activity = { kind: 'rest', until: 3600 };
    }
    w.people.lin.position = { x: -699, y: 0 }; w.people.zhou.position = { x: -697, y: 0 };
    const originalActivity = structuredClone(w.people.zhou.activity);
    w = settleDeath(w, 'lin', 'trauma', LANDSCAPE);
    assert.deepEqual(awaitingDecision(w), ['zhou']); assert.deepEqual(w.people.zhou.activity, originalActivity);
    const loaded = ISLAND_PARTITION.parse(save(w)); assert.equal(loaded.ok, true);
    assert.deepEqual(awaitingDecision(loaded.value.active), ['zhou']);
    assert.equal(advance(w, 10, LANDSCAPE).elapsed, 0);
    w = act(w, 'zhou', { kind: 'intend', text: '先缓一口气，再决定怎么帮忙。' });
    assert.deepEqual(awaitingDecision(w), []); assert.deepEqual(w.people.zhou.activity, originalActivity);
    assert.deepEqual(awaitingDecision(ISLAND_PARTITION.parse(save(w)).value.active), []);
});

test('finding an already-dead person wakes an offscreen NPC at the actual discovery, without replaying the unwitnessed death', () => {
    let w = start(); w.people.player.position = { x: 0, y: 300 };
    w.people.zhou.position = { x: -700, y: -40 }; w.people.zhou.activity = null;
    w = act(w, 'zhou', { kind: 'travel', route: [{ x: -700, y: -10 }] });
    const result = advance(w, 60, LANDSCAPE); w = result.world;
    assert.equal(result.stop, 'decision'); assert.ok(result.elapsed > 0 && result.elapsed < 30);
    assert.deepEqual(result.due, ['zhou']); assert.equal(w.people.zhou.activity.kind, 'travel');
    const discovery = w.experiences.find(e => e.payload.kind === 'noticed_body' && e.payload.actor === 'zhou');
    assert.ok(discovery); assert.equal(discovery.audience.includes('player'), false);
    assert.equal(w.experiences.find(e => e.payload.kind === 'died').audience.includes('zhou'), false);
    assert.deepEqual(observe(w, 'zhou', LANDSCAPE).people.find(p => p.id === 'lin').body, { kind: 'dead' });
});
