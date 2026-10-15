import assert from 'node:assert/strict';
import test from 'node:test';
import { PERSON_IDS } from '../apps/game/island/model.ts';
import { LANDSCAPE } from '../apps/game/island/content.ts';
import { FOOD, ITEMS, RECIPES } from '../apps/game/island/survival-content.ts';
import { newJourney } from '../apps/game/island/world.ts';
import { createItem, carriedWeight, carryLimit } from '../apps/game/island/inventory.ts';
import { operate } from '../apps/game/island/operations.ts';
import { advance } from '../apps/game/island/clock.ts';
import { observe, openScene } from '../apps/game/island/scene.ts';
import { createAgentKnowledge } from '../apps/game/island/agent-knowledge.ts';
import { ISLAND_PARTITION } from '../apps/game/island/partition.ts';
import { coconutWater, plainWater, drawWater, mixWater, waterIllness } from '../apps/game/island/water.ts';

function world(clock = 0) {
    const w = newJourney('water-life'); w.clock = clock;
    for (const id of PERSON_IDS) if (id !== 'player') w.people[id].activity = { kind: 'rest', until: clock + 3600 };
    return w;
}
const act = (w, operation, actor = 'player') => operate(w, actor === 'player' ? { kind: 'player' }
    : { kind: 'gm', scene: openScene(w, actor, LANDSCAPE) }, actor, operation, LANDSCAPE);
const work = (w, task, actor = 'player') => act(w, { kind: 'work', task }, actor);
const finish = w => advance(w, 3600, LANDSCAPE).world;
const parse = w => ISLAND_PARTITION.parse({ formatVersion: 1, revision: 1, active: w, last: { id: 'water-save', fingerprint: '0'.repeat(64) } });
function reload(w) { const r = parse(w); assert.equal(r.ok, true); return r.value.active; }
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);

test('opening starts flesh and liquid exposure; eating and handing over preserve the same remaining liquid', () => {
    let w = world(500); const nut = createItem(w, 'player', 'coconut', 1);
    createItem(w, 'player', 'coral_stone', 1);
    w = finish(work(w, { kind: 'craft', recipe: 'open_coconut', materials: [{ item: nut, units: 1 }] }));
    const opened = Object.keys(w.items).find(id => w.items[id].kind === 'coconut_open'), openedAt = 500 + RECIPES.open_coconut.seconds;
    assert.equal(w.items[opened].foodSince, openedAt);
    assert.equal(w.items[opened].water.coconut.openedAt, openedAt);
    w = finish(work(w, { kind: 'drink', container: opened, millilitres: 100 }));
    const liquid = structuredClone(w.items[opened].water);
    w = finish(work(w, { kind: 'eat', item: opened }));
    const shell = Object.keys(w.items).find(id => w.items[id].kind === 'shell');
    assert.equal(w.items[opened].quantity, 0); assert.equal(w.items[opened].water, null);
    assert.equal(w.items[shell].foodSince, null); assert.deepEqual(w.items[shell].water, liquid);
    assert.equal(liquid.millilitres, ITEMS.coconut_open.capacity - 100);
    w.people.lin.position = { ...w.people.player.position };
    w = act(w, { kind: 'offer', item: shell, to: 'lin', units: 1 }); w = act(w, { kind: 'accept', from: 'player' }, 'lin');
    w = reload(w); assert.deepEqual(w.items[shell].water, liquid);
    assert.deepEqual(w.items[shell].location, { kind: 'carried', person: 'lin' });
    assert.equal(Object.values(w.items).reduce((sum, i) => sum + (i.water?.millilitres ?? 0), 0), liquid.millilitres);
});

test('pouring is a timed physical transfer; boiling the resulting mixture does not erase old coconut exposure', () => {
    let w = world(FOOD.odorAfterSeconds + 10);
    const shell = createItem(w, 'player', 'shell', 1), cup = createItem(w, 'player', 'metal_cup', 1);
    w.items[shell].water = coconutWater(300, 0); w.items[cup].water = plainWater(100, 'treated');
    const initialWeight = carriedWeight(w, 'player');
    w = work(w, { kind: 'pour', from: shell, container: cup, millilitres: 200 });
    w = advance(w, 1, LANDSCAPE).world;
    assert.equal(w.items[shell].water.millilitres, 300); assert.equal(w.items[cup].water.millilitres, 100);
    w = finish(reload(w));
    assert.equal(w.items[shell].water.millilitres, 100); assert.equal(w.items[cup].water.millilitres, 300);
    assert.deepEqual(w.items[cup].water.coconut, { millilitres: 200, openedAt: 0 });
    assert.deepEqual(w.experiences.at(-1).payload, { kind: 'poured', actor: 'player', from: shell, to: cup, millilitres: 200 });
    assert.equal(w.items[cup].water.quality, 'untreated'); near(carriedWeight(w, 'player'), initialWeight);
    const position = { ...w.people.player.position };
    w.structures.fire = { kind: 'firepit', position, builder: 'player', workLeft: 0, water: null, fuelSeconds: 2000, burning: true };
    w.structures.roof = { kind: 'shelter', position, builder: 'player', workLeft: 0, water: null, fuelSeconds: 0, burning: false };
    w = finish(work(w, { kind: 'boil', site: 'fire', container: cup }));
    assert.equal(w.items[cup].water.quality, 'treated'); assert.equal(w.items[cup].water.coconut.openedAt, 0);
    assert.ok(waterIllness(w.items[cup].water, w.clock) > 0);
    const fresh = structuredClone(w); fresh.items[cup].water.coconut.openedAt = fresh.clock;
    const drink = input => finish(work(input, { kind: 'drink', container: cup, millilitres: 150 }));
    const staleDrunk = drink(w), freshDrunk = drink(fresh);
    assert.ok(staleDrunk.people.player.body.needs.illness > freshDrunk.people.player.body.needs.illness);
    near(staleDrunk.items[cup].water.coconut.millilitres, 100);
    near(staleDrunk.items[cup].water.millilitres, 150);
});

test('dilution and partial draws conserve coconut volume and exposure; drinking risk is proportional to the consumed portion', () => {
    const source = coconutWater(300, 0), cup = plainWater(100, 'treated'), clock = FOOD.odorAfterSeconds;
    mixWater(cup, drawWater(source, 150));
    const expected = waterIllness(cup, clock); let actual = 0, coconutMl = 0;
    for (const ml of [1, 7, 19, 83, 140]) {
        const draw = drawWater(cup, ml); actual += waterIllness(draw, clock); coconutMl += draw.coconut.millilitres;
    }
    near(actual, expected); near(coconutMl, 150); assert.equal(cup.coconut, null); assert.equal(cup.millilitres, 0);
    mixWater(source, coconutWater(10, clock));
    assert.deepEqual(source.coconut, { millilitres: 160, openedAt: 0 });
});

test('emptying may be cancelled; finishing empties the liquid, not the container or stale flesh, and refilling creates no old liquid', () => {
    let w = world(FOOD.odorAfterSeconds + 1), item = createItem(w, 'player', 'coconut_open', 1);
    w.items[item].foodSince = 0; w.items[item].water.coconut.openedAt = 0;
    w = work(w, { kind: 'empty', container: item, millilitres: 300 }); w = advance(w, 2, LANDSCAPE).world;
    w = act(w, { kind: 'cancel' }); assert.equal(w.items[item].water.millilitres, 300);
    w = finish(work(w, { kind: 'empty', container: item, millilitres: 300 }));
    assert.equal(w.items[item].quantity, 1); assert.equal(w.items[item].foodSince, 0);
    assert.equal(w.items[item].water.millilitres, 0); assert.equal(w.items[item].water.coconut, null);
    w.people.player.position = { ...w.resources.center_seep.position };
    w = finish(work(w, { kind: 'fill', source: 'center_seep', container: item, millilitres: 200 }));
    w = reload(w); assert.equal(w.items[item].water.millilitres, 200); assert.equal(w.items[item].water.coconut, null);
    const seen = observe(w, 'player', LANDSCAPE).items.find(i => i.id === item);
    assert.equal(seen.food, 'off_odor'); assert.equal(seen.water.food, null);
});

test('pouring respects capacity, reach and total carried weight; losing the source or a simultaneous claim cannot partly transfer water', () => {
    let w = world(), source = createItem(w, 'player', 'bottle', 1), target = createItem(w, 'player', 'bottle', 1);
    w.items[source].water = plainWater(1000); w.items[target].water = plainWater(900);
    const task = { kind: 'pour', from: source, container: target, millilitres: 1000 };
    assert.throws(() => work(w, task), { code: 'island_capacity' });
    assert.throws(() => work(w, { ...task, container: source }), { code: 'island_conditions' });
    w.items[target].water = plainWater(); w.items[source].location = { kind: 'ground', position: { x: -500, y: 150 } };
    assert.throws(() => work(w, task), { code: 'island_unavailable' });
    w.items[source].location = { kind: 'carried', person: 'player' };
    const ballast = createItem(w, 'player', 'branch', 1); w.items[ballast].location = { kind: 'carried', person: 'player' };
    while (carriedWeight(w, 'player') + ITEMS.branch.kilograms <= carryLimit(w, 'player')) w.items[ballast].quantity++;
    assert.doesNotThrow(() => work(w, task));
    const gaining = structuredClone(w); gaining.items[source].location = { kind: 'ground', position: { ...w.people.player.position } };
    gaining.items[ballast].quantity++; assert.throws(() => work(gaining, task), { code: 'island_capacity' });
    w.items[ballast].quantity = 0; w.items[source].location = { kind: 'ground', position: { ...w.people.player.position } };
    w.people.lin.position = { ...w.people.player.position }; w.people.lin.activity = null;
    const before = structuredClone(w);
    w = act(work(w, task), { kind: 'take', item: source }, 'lin');
    w = advance(w, 3600, LANDSCAPE).world;
    w.people.lin.activity = { kind: 'rest', until: w.clock + 3600 }; w = finish(w);
    assert.equal(w.items[source].water.millilitres, 1000); assert.equal(w.items[target].water.millilitres, 0);
    assert.ok(w.experiences.some(e => e.payload.kind === 'work_failed' && e.payload.actor === 'player'));
    const contested = work(work(before, { ...task, millilitres: 300 }), { kind: 'empty', container: source, millilitres: 300 }, 'lin');
    const stopped = finish(contested);
    assert.equal(stopped.items[source].water.millilitres, 1000); assert.equal(stopped.items[target].water.millilitres, 0);
    assert.ok(stopped.experiences.some(e => e.payload.kind === 'contested'));
});

test('observations and offers reveal local sensory state, not liquid provenance, and saved liquid quantities are validated', () => {
    let w = world(FOOD.odorAfterSeconds + 1), shell = createItem(w, 'player', 'shell', 1);
    w.items[shell].water = coconutWater(200, 0);
    w.people.lin.position = { ...w.people.player.position }; w.people.zhou.position = { x: w.people.player.position.x + 10, y: w.people.player.position.y };
    const before = structuredClone(w), own = observe(w, 'player', LANDSCAPE).items.find(i => i.id === shell);
    assert.equal(own.water.food, 'off_odor'); assert.equal(Object.hasOwn(own.water, 'coconut'), false); assert.deepEqual(w, before);
    w = act(w, { kind: 'offer', item: shell, units: 1, to: 'lin' });
    const context = createAgentKnowledge(() => w, ['lin', 'zhou'], LANDSCAPE).context();
    assert.deepEqual(context.map(o => o.offers[0].water.food), ['off_odor', 'unexamined']);
    assert.ok(context.every(o => !Object.hasOwn(o.offers[0].water, 'coconut')));
    assert.deepEqual(reload(w).items[shell].water, w.items[shell].water);
    for (const coconut of [{ millilitres: 201, openedAt: 0 }, { millilitres: 0, openedAt: 0 }, { millilitres: 100, openedAt: w.clock + 1 }]) {
        const bad = structuredClone(w); bad.items[shell].water.coconut = coconut; assert.equal(parse(bad).ok, false);
    }
});
