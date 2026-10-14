import assert from 'node:assert/strict';
import test from 'node:test';
import { newJourney } from '../apps/game/island/world.ts';
import { LANDSCAPE } from '../apps/game/island/content.ts';
import { PERSON_IDS } from '../apps/game/island/model.ts';
import { SURVIVAL, RESOURCE_RULES } from '../apps/game/island/survival-content.ts';
import { operate } from '../apps/game/island/operations.ts';
import { advance } from '../apps/game/island/clock.ts';
import { createItem, carriedWeight } from '../apps/game/island/inventory.ts';
import { openScene, observe } from '../apps/game/island/scene.ts';
import { ISLAND_PARTITION } from '../apps/game/island/partition.ts';
import { walkSpeedFactor } from '../apps/game/island/physiology.ts';
import { weatherAt } from '../apps/game/island/environment.ts';
import { discover, discoveryIndex } from '../apps/game/island/discovery.ts';

function world() {
    const w = newJourney('survival');
    for (const id of PERSON_IDS) if (id !== 'player') w.people[id].activity = { kind: 'rest', until: 3600 };
    return w;
}
const act = (w, task, actor = 'player') => operate(w, actor === 'player' ? { kind: 'player' } : { kind: 'gm', scene: openScene(w, actor, LANDSCAPE) }, actor, { kind: 'work', task }, LANDSCAPE);
const saved = w => ISLAND_PARTITION.parse({ formatVersion: 1, revision: 1, active: w, last: { id: 'save', fingerprint: '0'.repeat(64) } });
function finish(w, seconds = 3600) { return advance(w, seconds, LANDSCAPE).world; }

test('walking diagonally to a real resource arrives at its exact position without a floating remainder stall', () => {
    let w = world(); const destination = { ...w.resources.west_coconuts.position };
    w = operate(w, { kind: 'player' }, 'player', { kind: 'travel', route: [destination] }, LANDSCAPE);
    const result = advance(w, 60, LANDSCAPE);
    assert.equal(result.stop, 'player_finished');
    assert.deepEqual(result.world.people.player.position, destination);
    assert.equal(result.world.people.player.activity, null);
    assert.ok(result.elapsed < 60);
});

test('remembered places survive leaving and reloading without revealing changed stocks or another survivor discoveries', () => {
    const w = world(); w.people.player.position = { ...w.resources.center_seep.position };
    discover(w, LANDSCAPE, discoveryIndex(w));
    const known = observe(w, 'player', LANDSCAPE).knownPlaces;
    assert.ok(known.some(p => p.subject.id === 'center_seep'));
    assert.equal(known.some(p => p.subject.id === 'west_wood'), false);
    w.people.player.position = { x: -400, y: -250 }; w.resources.center_seep.stock = 0;
    const view = observe(saved(w).value.active, 'player', LANDSCAPE);
    assert.deepEqual(view.knownPlaces, known);
    assert.equal(view.resources.some(r => r.id === 'center_seep'), false);
    assert.equal(Object.hasOwn(view.knownPlaces.find(p => p.subject.id === 'center_seep'), 'stock'), false);
});

test('gathering spends real stock one completed unit at a time; cancellation retains completed yields', () => {
    let w = world(); w.people.player.position = { ...w.resources.west_wood.position };
    const initialStock = w.resources.west_wood.stock;
    w = act(w, { kind: 'gather', source: 'west_wood', units: 3 });
    w = finish(w, 46);
    const expected = initialStock - 1 + w.clock * RESOURCE_RULES.wood.renewalPerDay / 86400;
    assert.ok(Math.abs(w.resources.west_wood.stock - expected) < 1e-8);
    assert.equal(Object.values(w.items).filter(i => i.kind === 'branch').reduce((sum, i) => sum + i.quantity, 0), 1);
    w = operate(w, { kind: 'player' }, 'player', { kind: 'cancel' }, LANDSCAPE);
    assert.ok(Math.abs(w.resources.west_wood.stock - expected) < 1e-8); assert.equal(saved(w).ok, true);
});

test('water needs a physical container and capacity; filling does not purify it and drinking consumes it', () => {
    let w = world(); w.people.player.position = { ...w.resources.center_seep.position };
    const cup = createItem(w, 'player', 'metal_cup', 1);
    assert.throws(() => act(w, { kind: 'fill', source: 'center_seep', container: 'player-shirt', millilitres: 100 }), { code: 'island_conditions' });
    assert.throws(() => act(w, { kind: 'fill', source: 'center_seep', container: cup, millilitres: 500 }), { code: 'island_capacity' });
    w = finish(act(w, { kind: 'fill', source: 'center_seep', container: cup, millilitres: 300 }));
    assert.equal(w.items[cup].water.millilitres, 300); assert.equal(w.items[cup].water.quality, 'untreated');
    const thirst = w.people.player.body.needs.waterDeficit;
    w = finish(act(w, { kind: 'drink', container: cup, millilitres: 200 }));
    assert.equal(w.items[cup].water.millilitres, 100); assert.ok(w.people.player.body.needs.waterDeficit < thirst);
    assert.equal(saved(w).ok, true);
});

test('rising water interrupts a harvest batch without undoing completed fish or producing the unfinished one', () => {
    let w = world(); const source = w.resources.east_pools;
    source.stock = RESOURCE_RULES.reef_food.capacity;
    w.people.player.position = { ...source.position };
    w = finish(act(w, { kind: 'gather', source: 'east_pools', units: source.stock }));
    const caught = Object.values(w.items).filter(i => i.kind === 'fish').reduce((sum, i) => sum + i.quantity, 0);
    assert.ok(caught > 0 && caught < source.stock);
    assert.equal(w.people.player.activity, null);
    assert.ok(w.experiences.some(e => e.payload.kind === 'work_failed' && e.payload.reason === 'island_conditions'));
    assert.ok(w.resources.east_pools.stock >= source.stock - caught);
    assert.ok(w.resources.east_pools.stock < source.stock - caught + 1);
    assert.equal(saved(w).ok, true);
});

test('two simultaneous water claims cannot overdraft a finite source', () => {
    let w = world(); const source = w.resources.center_seep; source.stock = 310;
    w.people.player.position = { ...source.position }; w.people.lin.position = { ...source.position }; w.people.lin.activity = null;
    const a = createItem(w, 'player', 'metal_cup', 1), b = createItem(w, 'lin', 'metal_cup', 1);
    w = act(w, { kind: 'fill', source: 'center_seep', container: a, millilitres: 300 });
    w = act(w, { kind: 'fill', source: 'center_seep', container: b, millilitres: 300 }, 'lin');
    w = finish(w);
    assert.equal(w.items[a].water.millilitres, 0); assert.equal(w.items[b].water.millilitres, 0);
    assert.ok(w.experiences.some(e => e.payload.kind === 'resource_contested')); assert.equal(saved(w).ok, true);
});

test('drinking at a source requires reach and water, not a bottle; it creates no carried water and retains untreated-water risk', () => {
    let w = world(); const task = { kind: 'sip', source: 'center_seep', millilitres: 200 };
    assert.throws(() => act(w, task), { code: 'island_unavailable' });
    w.people.player.position = { ...w.resources.center_seep.position };
    const stock = w.resources.center_seep.stock, itemCount = Object.keys(w.items).length;
    w = act(w, task); assert.equal(saved(w).ok, true);
    w = finish(saved(w).value.active);
    assert.ok(w.people.player.body.needs.waterDeficit < 100);
    assert.ok(w.people.player.body.needs.illness > 0);
    assert.ok(w.resources.center_seep.stock < stock - 190);
    assert.equal(Object.keys(w.items).length, itemCount); assert.equal(saved(w).ok, true);
});

test('two people drinking from the same limited source cannot each claim all its water', () => {
    let w = world(); w.resources.center_seep.stock = 200;
    for (const id of ['player', 'lin']) { w.people[id].position = { ...w.resources.center_seep.position }; w.people[id].activity = null; }
    for (const id of ['player', 'lin']) w = act(w, { kind: 'sip', source: 'center_seep', millilitres: 150 }, id);
    w = finish(w);
    assert.ok(w.resources.center_seep.stock >= 200);
    assert.ok(w.experiences.some(e => e.payload.kind === 'resource_contested'));
    assert.equal(saved(w).ok, true);
});

test('cutting up a worn garment consumes that actual garment, not an invented material copy', () => {
    let w = finish(act(world(), { kind: 'craft', recipe: 'tear_cloth', materials: [{ item: 'player-shirt', units: 1 }] }));
    assert.equal(w.items['player-shirt'].quantity, 0);
    assert.equal(observe(w, 'player', LANDSCAPE).items.some(i => i.id === 'player-shirt'), false);
    assert.equal(Object.values(w.items).find(i => i.kind === 'cloth').quantity, 2);
    assert.equal(saved(w).ok, true);
});

test('a camp can be built off the landing at a suitable arbitrary coordinate and resumed after cancellation', () => {
    let w = world(); w.people.player.position = { x: -505, y: -145 };
    const branch = createItem(w, 'player', 'branch', 4), leaves = createItem(w, 'player', 'palm_leaf', 8), cord = createItem(w, 'player', 'cord', 4);
    w = finish(act(w, { kind: 'build', blueprint: 'shelter', materials: [{ item: branch, units: 4 }, { item: leaves, units: 8 }, { item: cord, units: 4 }] }), 100);
    const site = Object.keys(w.structures)[0], left = w.structures[site].workLeft;
    assert.deepEqual(w.structures[site].position, { x: -505, y: -145 }); assert.ok(left > 0 && left < 2400);
    w = operate(w, { kind: 'player' }, 'player', { kind: 'cancel' }, LANDSCAPE);
    assert.equal(w.items[branch].quantity, 0); assert.equal(w.structures[site].workLeft, left);
    assert.equal(observe(w, 'lin', LANDSCAPE).structures.length, 0);
    w = operate(w, { kind: 'player' }, 'player', { kind: 'construct', site }, LANDSCAPE);
    w = finish(w, 30); assert.equal(w.structures[site].workLeft, left - 30); assert.equal(saved(w).ok, true);
});

test('bodily relief is autonomous for an NPC; it leaves physical waste but does not broadcast a private bodily log', () => {
    let w = world(); w.people.lin.position = { x: -500, y: 150 }; w.people.lin.activity = null;
    w.people.lin.body.needs.bowel = 180;
    w = finish(act(w, { kind: 'relieve', waste: 'feces' }, 'lin'));
    const event = w.experiences.find(e => e.payload.kind === 'worked');
    assert.deepEqual(event.audience, ['lin']); assert.equal(w.people.lin.body.needs.bowel, 0);
    const id = Object.keys(w.waste)[0]; assert.equal(w.waste[id].covered, false);
    w = finish(act(w, { kind: 'cover_waste', waste: id }, 'lin'));
    assert.equal(w.waste[id].covered, true); assert.equal(saved(w).ok, true);
});

test('firepit construction retains all supplied fuel once, across cancellation, reload and resumed construction', () => {
    let w = world(); w.people.player.position = { x: -505, y: -145 };
    const wood = createItem(w, 'player', 'branch', 4);
    w = finish(act(w, { kind: 'build', blueprint: 'firepit', materials: [{ item: wood, units: 4 }] }), 100);
    const id = Object.keys(w.structures)[0], fuel = 4 * SURVIVAL.fireSecondsPerFuel;
    assert.equal(w.items[wood].quantity, 0); assert.equal(w.structures[id].fuelSeconds, fuel);
    assert.ok(w.structures[id].workLeft > 0); assert.equal(w.structures[id].burning, false);
    w = operate(w, { kind: 'player' }, 'player', { kind: 'cancel' }, LANDSCAPE);
    const loaded = saved(w); assert.equal(loaded.ok, true);
    w = finish(operate(loaded.value.active, { kind: 'player' }, 'player', { kind: 'construct', site: id }, LANDSCAPE));
    assert.equal(w.structures[id].workLeft, 0); assert.equal(w.structures[id].fuelSeconds, fuel);
    assert.equal(w.structures[id].burning, false); assert.equal(w.items[wood].quantity, 0);
    assert.equal(saved(w).ok, true);
});

test('barefoot movement on rough ground harms mobility while worn shoes protect feet', () => {
    const run = shoes => {
        let w = world(); w.people.player.position = { x: -450, y: -200 };
        if (!shoes) w.items['player-shoes'].location = { kind: 'carried', person: 'player' };
        w = operate(w, { kind: 'player' }, 'player', { kind: 'travel', route: [{ x: -350, y: -200 }] }, LANDSCAPE);
        return finish(w, 40);
    };
    const bare = run(false), shod = run(true);
    assert.ok(bare.people.player.body.needs.footWound > 0); assert.equal(shod.people.player.body.needs.footWound, 0);
    assert.ok(bare.people.player.position.x < shod.people.player.position.x);
});

test('dehydration ends the shared world immediately and the last saved experience is player death', () => {
    let w = world(); w.people.player.body.needs.waterDeficit = SURVIVAL.lethalWaterDeficit - 0.01;
    const result = advance(w, 100, LANDSCAPE); w = result.world;
    assert.equal(result.stop, 'ended'); assert.equal(result.elapsed, 1);
    assert.deepEqual(w.experiences.at(-1).payload, { kind: 'died', actor: 'player' });
    assert.equal(saved(w).ok, true);
});

test('prolonged food deficit weakens movement and recovery, survives saving, and cannot remain indefinitely at zero food', () => {
    const fed = world(), hungry = world();
    hungry.people.player.body.needs.energy = -12000;
    assert.ok(walkSpeedFactor(hungry, 'player') < walkSpeedFactor(fed, 'player'));
    assert.equal(saved(hungry).ok, true);
    for (const w of [fed, hungry]) w.people.player.activity = { kind: 'rest', until: 600 };
    const restedFed = finish(fed, 60), restedHungry = finish(hungry, 60);
    assert.ok(restedHungry.people.player.body.needs.fatigue > restedFed.people.player.body.needs.fatigue);
    const dying = world(); dying.people.player.body.needs.energy = SURVIVAL.lethalEnergyBalance + .001;
    const result = advance(dying, 60, LANDSCAPE);
    assert.equal(result.stop, 'ended'); assert.equal(result.world.people.player.body.cause, 'starvation');
    assert.equal(saved(result.world).ok, true);
});

test('an opened coconut preserves its water in the remaining shell when eaten, without ghost inventory weight', () => {
    let w = world(); const coconut = createItem(w, 'player', 'coconut_open', 1), before = carriedWeight(w, 'player');
    w = finish(act(w, { kind: 'eat', item: coconut }));
    assert.equal(w.items[coconut].quantity, 0); assert.equal(w.items[coconut].water, null);
    assert.equal(Object.values(w.items).find(i => i.kind === 'shell').water.millilitres, 300);
    assert.ok(carriedWeight(w, 'player') < before); assert.equal(saved(w).ok, true);
});

test('coconut opening accepts an accessible striking tool without consuming it; another survivor carrying it is not access', () => {
    let w = world();
    const coconut = createItem(w, 'player', 'coconut', 1), stone = createItem(w, 'lin', 'coral_stone', 1);
    const task = { kind: 'craft', recipe: 'open_coconut', materials: [{ item: coconut, units: 1 }] };
    assert.throws(() => act(w, task), { code: 'island_tool_missing' });
    w.items[stone].location = { kind: 'ground', position: { ...w.people.player.position } };
    w = finish(act(w, task));
    assert.equal(w.items[stone].quantity, 1);
    assert.equal(w.items[coconut].quantity, 0);
    assert.equal(Object.values(w.items).find(i => i.kind === 'coconut_open').water.millilitres, 300);
    assert.equal(saved(w).ok, true);
});

test('loss of the tool during processing interrupts without inventing the finished product or consuming materials', () => {
    let w = world(); const coconut = createItem(w, 'player', 'coconut', 1), edge = createItem(w, 'player', 'metal_edge', 1);
    w = act(w, { kind: 'craft', recipe: 'open_coconut', materials: [{ item: coconut, units: 1 }] });
    w.items[edge].location = { kind: 'carried', person: 'zhou' };
    w = finish(w);
    assert.equal(w.items[coconut].quantity, 1); assert.equal(w.people.player.activity, null);
    assert.equal(w.experiences.find(e => e.payload.kind === 'work_failed').payload.reason, 'island_tool_missing');
    assert.equal(Object.values(w.items).some(i => i.kind === 'coconut_open'), false);
});

test('coconut husks provide a slower binding route without destroying clothes or consuming the striking tool', () => {
    let w = world(); const coconut = createItem(w, 'player', 'coconut', 1), stone = createItem(w, 'player', 'coral_stone', 1);
    w = finish(act(w, { kind: 'craft', recipe: 'open_coconut', materials: [{ item: coconut, units: 1 }] }));
    const husk = Object.entries(w.items).find(([, item]) => item.kind === 'coconut_husk')[0];
    const task = { kind: 'craft', recipe: 'coir_cord', materials: [{ item: husk, units: 1 }] };
    w.items[stone].location = { kind: 'carried', person: 'zhou' };
    assert.throws(() => act(w, task), { code: 'island_tool_missing' });
    w.items[stone].location = { kind: 'carried', person: 'player' };
    w = finish(act(w, task));
    assert.equal(w.items[husk].quantity, 0); assert.equal(w.items[stone].quantity, 1);
    assert.ok(Object.values(w.items).some(item => item.kind === 'cord' && item.quantity > 0));
    for (const id of ['player-shirt', 'player-trousers']) { assert.equal(w.items[id].quantity, 1); assert.equal(w.items[id].location.kind, 'worn'); }
    assert.equal(saved(w).ok, true);
});

test('crafting distinguishes tool capabilities, dry material and active heat', () => {
    const w = world(), branches = createItem(w, 'player', 'branch', 2), cord = createItem(w, 'player', 'cord', 1);
    createItem(w, 'player', 'coral_stone', 1);
    assert.throws(() => act(w, { kind: 'craft', recipe: 'fire_drill', materials: [{ item: branches, units: 2 }, { item: cord, units: 1 }] }), { code: 'island_tool_missing' });
    const leaf = createItem(w, 'player', 'palm_leaf', 1, 0.8), fish = createItem(w, 'player', 'fish', 1);
    assert.throws(() => act(w, { kind: 'craft', recipe: 'dry_tinder', materials: [{ item: leaf, units: 1 }] }), { code: 'island_material_wet' });
    assert.throws(() => act(w, { kind: 'craft', recipe: 'cook_fish', materials: [{ item: fish, units: 1 }] }), { code: 'island_fire_missing' });
});

test('cooking stops when heat is lost; a plastic bottle cannot be used as a boiling vessel', () => {
    let w = world(); const p = w.people.player.position;
    w.structures.fire = { kind: 'firepit', position: { ...p }, builder: 'player', workLeft: 0, water: null, fuelSeconds: 4, burning: true };
    const fish = createItem(w, 'player', 'fish', 1), bottle = createItem(w, 'player', 'bottle', 1); w.items[bottle].water.millilitres = 300;
    assert.throws(() => act(w, { kind: 'boil', site: 'fire', container: bottle }), { code: 'island_conditions' });
    w = finish(act(w, { kind: 'craft', recipe: 'cook_fish', materials: [{ item: fish, units: 1 }] }));
    assert.equal(w.items[fish].quantity, 1); assert.equal(w.people.player.activity, null);
    assert.equal(Object.values(w.items).some(i => i.kind === 'cooked_fish'), false); assert.equal(saved(w).ok, true);
});

test('rain persists through reload and actually collects water, wets exposed clothes and puts out an uncovered fire', () => {
    let w = world();
    const wetMinute = Array.from({ length: 24 * 60 }, (_, minute) => minute * 60).find(clock =>
        weatherAt({ id: w.id, clock }).rain && weatherAt({ id: w.id, clock: clock + 30 }).rain);
    assert.notEqual(wetMinute, undefined);
    w.clock = wetMinute;
    for (const p of Object.values(w.people)) p.activity = { kind: 'rest', until: w.clock + 3600 };
    const p = w.people.player.position;
    w.items['player-shirt'].wetness = .1;
    w.structures.collector = { kind: 'raincatcher', position: { ...p }, builder: 'player', workLeft: 0, water: { millilitres: 0, quality: 'untreated', coconut: null }, fuelSeconds: 0, burning: false };
    w.structures.fire = { kind: 'firepit', position: { x: p.x + 4, y: p.y }, builder: 'player', workLeft: 0, water: null, fuelSeconds: 3600, burning: true };
    const loaded = saved(w); assert.equal(loaded.ok, true);
    assert.deepEqual(weatherAt(loaded.value.active), weatherAt(w));
    w = finish(loaded.value.active, 30);
    assert.equal(w.structures.collector.water.millilitres, 30 * SURVIVAL.rainCollectionMlPerSecond);
    assert.equal(w.structures.collector.water.quality, 'untreated');
    assert.ok(w.items['player-shirt'].wetness > .1); assert.equal(w.structures.fire.burning, false);
});

test('discovering a private camp preserves a personal observation, not its builder or old conversations', () => {
    let w = world(); w.people.player.position = { x: -500, y: -180 };
    w.structures.hidden = { kind: 'shelter', position: { x: -496, y: -180 }, builder: 'lin', workLeft: 0, water: null, fuelSeconds: 0, burning: false };
    w = finish(w, 2);
    const seen = observe(w, 'player', LANDSCAPE).structures.find(s => s.id === 'hidden');
    assert.equal(Object.hasOwn(seen, 'builder'), false);
    const discovery = w.experiences.filter(e => e.payload.kind === 'discovered' && e.payload.subject.id === 'hidden');
    assert.equal(discovery.length, 1); assert.deepEqual(discovery[0].audience, ['player']);
    assert.equal(discovery[0].payload.subject.form, 'shelter');
    assert.equal(saved(w).ok, true);
});
