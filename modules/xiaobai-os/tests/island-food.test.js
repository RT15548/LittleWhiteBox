import assert from 'node:assert/strict';
import test from 'node:test';
import { PERSON_IDS } from '../apps/game/island/model.ts';
import { LANDSCAPE } from '../apps/game/island/content.ts';
import { FOOD, RECIPES } from '../apps/game/island/survival-content.ts';
import { newJourney } from '../apps/game/island/world.ts';
import { createItem } from '../apps/game/island/inventory.ts';
import { operate } from '../apps/game/island/operations.ts';
import { advance } from '../apps/game/island/clock.ts';
import { observe, openScene } from '../apps/game/island/scene.ts';
import { foodIllness } from '../apps/game/island/food.ts';
import { createAgentKnowledge } from '../apps/game/island/agent-knowledge.ts';
import { ISLAND_PARTITION } from '../apps/game/island/partition.ts';
import { groupMaterials, selectMaterials } from '../apps/game/island/presentation/material-selection.ts';

function start(clock = 0) {
    const w = newJourney('fish-life'); w.clock = clock;
    for (const id of PERSON_IDS) if (id !== 'player') w.people[id].activity = { kind: 'rest', until: clock + 3600 };
    return w;
}
const act = (w, operation, actor = 'player') => operate(w, actor === 'player' ? { kind: 'player' }
    : { kind: 'gm', scene: openScene(w, actor, LANDSCAPE) }, actor, operation, LANDSCAPE);
const parse = w => ISLAND_PARTITION.parse({ formatVersion: 1, revision: 1, active: w, last: { id: 'fish-save', fingerprint: '0'.repeat(64) } });
function reload(w) { const saved = parse(w); assert.equal(saved.ok, true); return saved.value.active; }
const seen = (w, item, who = 'player') => observe(w, who, LANDSCAPE).items.find(i => i.id === item);

// Protects clock ownership and finite food, not a claim about real-world shelf life.
test('fish age only with game time, remain physical objects, and reading or reloading does not refresh them', () => {
    let w = start(FOOD.odorAfterSeconds - 1);
    const fish = createItem(w, 'player', 'fish', 2); w.items[fish].foodSince = 0;
    const before = structuredClone(w);
    assert.equal(seen(w, fish).food, 'no_obvious_spoilage');
    assert.equal(Object.hasOwn(seen(w, fish), 'foodSince'), false);
    assert.deepEqual(w, before);
    w = reload(w); assert.deepEqual(w, before);
    w = act(w, { kind: 'rest', seconds: 2 });
    const step = advance(w, 2, LANDSCAPE); w = step.world;
    assert.equal(step.elapsed, 2);
    assert.equal(seen(w, fish).food, 'off_odor');
    assert.equal(w.items[fish].quantity, 2);
    assert.equal(w.items[fish].foodSince, 0);
    assert.equal(reload(w).items[fish].foodSince, 0);
});

test('close observation and handovers expose sensory condition but not capture time or a hidden inventory', () => {
    let w = start(FOOD.odorAfterSeconds + 1);
    w.people.lin.position = { x: w.people.player.position.x + 1, y: w.people.player.position.y };
    w.people.zhou.position = { x: w.people.player.position.x + 10, y: w.people.player.position.y };
    const fish = createItem(w, 'player', 'fish', 4); w.items[fish].foodSince = 0;
    assert.equal(seen(w, fish, 'lin'), undefined);
    w = act(w, { kind: 'offer', item: fish, to: 'lin', units: 1 });
    const near = observe(w, 'lin', LANDSCAPE).offers[0], far = observe(w, 'zhou', LANDSCAPE).offers[0];
    assert.equal(near.food, 'off_odor'); assert.equal(near.units, 1);
    assert.equal(far.food, 'unexamined');
    assert.equal(Object.hasOwn(near, 'foodSince'), false); assert.equal(Object.hasOwn(near, 'quantity'), false);
    const knowledge = createAgentKnowledge(() => w, ['lin', 'zhou'], LANDSCAPE).context();
    assert.deepEqual(knowledge.map(o => o.offers[0].food), ['off_odor', 'unexamined']);
    assert.equal(knowledge.some(o => o.items.some(i => i.id === fish)), false);
    w = act(w, { kind: 'cancel' }); w = act(w, { kind: 'drop', item: fish });
    assert.equal(seen(w, fish, 'lin').food, 'off_odor');
    assert.equal(seen(w, fish, 'zhou').food, 'unexamined');
});

test('both split and whole handovers preserve the original food exposure and total amount', () => {
    let w = start(FOOD.odorAfterSeconds + 1);
    w.people.lin.position = { ...w.people.player.position };
    const fish = createItem(w, 'player', 'fish', 4); w.items[fish].foodSince = 20;
    w = act(w, { kind: 'offer', item: fish, to: 'lin', units: 1 });
    w = act(w, { kind: 'accept', from: 'player' }, 'lin');
    const received = w.experiences.at(-1).payload.item;
    assert.notEqual(received, fish); assert.equal(w.items[received].foodSince, 20);
    assert.equal(w.items[fish].quantity, 3);
    w = act(w, { kind: 'offer', item: fish, to: 'lin', units: 3 });
    w = act(w, { kind: 'accept', from: 'player' }, 'lin');
    assert.equal(w.experiences.at(-1).payload.item, fish);
    assert.equal(w.items[fish].foodSince, 20);
    assert.equal(Object.values(w.items).filter(i => i.kind === 'fish').reduce((sum, i) => sum + i.quantity, 0), 4);
    assert.equal(reload(w).items[received].foodSince, 20);
});

test('cooking and save restoration retain exposure, including spoilage reached while cooking', () => {
    let w = start(FOOD.odorAfterSeconds - RECIPES.cook_fish.seconds / 2);
    const fish = createItem(w, 'player', 'fish', 1); w.items[fish].foodSince = 0;
    const position = { ...w.people.player.position };
    w.structures.fire = { kind: 'firepit', position, builder: 'player', workLeft: 0, water: null, fuelSeconds: 2000, burning: true };
    w.structures.roof = { kind: 'shelter', position, builder: 'player', workLeft: 0, water: null, fuelSeconds: 0, burning: false };
    w = act(w, { kind: 'work', task: { kind: 'craft', recipe: 'cook_fish', materials: [{ item: fish, units: 1 }] } });
    w = advance(w, 100, LANDSCAPE).world;
    assert.equal(w.items[fish].quantity, 1); assert.equal(Object.values(w.items).some(i => i.kind === 'cooked_fish'), false);
    w = advance(reload(w), RECIPES.cook_fish.seconds, LANDSCAPE).world;
    const cooked = Object.entries(w.items).find(([, i]) => i.kind === 'cooked_fish');
    assert.ok(cooked); assert.equal(w.items[fish].quantity, 0);
    assert.equal(cooked[1].foodSince, 0); assert.equal(seen(w, cooked[0]).food, 'off_odor');
    assert.equal(foodIllness(cooked[1], w.clock), FOOD.spoilageIllness);
    assert.equal(reload(w).items[cooked[0]].foodSince, 0);
});

test('spoiled fish may still be eaten at increased illness cost; lack of odor is not a safety guarantee', () => {
    const initial = start(FOOD.odorAfterSeconds + 1);
    const fish = createItem(initial, 'player', 'cooked_fish', 1);
    const old = structuredClone(initial); old.items[fish].foodSince = 0;
    const eat = w => advance(act(w, { kind: 'work', task: { kind: 'eat', item: fish } }), 120, LANDSCAPE).world;
    const eatenFresh = eat(initial), eatenOld = eat(old);
    assert.equal(eatenFresh.items[fish].quantity, 0); assert.equal(eatenOld.items[fish].quantity, 0);
    assert.equal(eatenFresh.people.player.body.needs.energy, eatenOld.people.player.body.needs.energy);
    assert.ok(eatenOld.people.player.body.needs.illness - eatenFresh.people.player.body.needs.illness > FOOD.spoilageIllness * .99);
    const beforeOdor = structuredClone(initial);
    beforeOdor.items[fish].foodSince = beforeOdor.clock - FOOD.riskAfterSeconds - 1;
    assert.equal(seen(beforeOdor, fish).food, 'no_obvious_spoilage');
    assert.ok(foodIllness(beforeOdor.items[fish], beforeOdor.clock) > 0);
});

test('food selection keeps visibly different batches apart and rejects invalid persisted exposure', () => {
    const w = start(FOOD.odorAfterSeconds + 1), old = createItem(w, 'player', 'fish', 2), fresh = createItem(w, 'player', 'fish', 2);
    w.items[old].foodSince = 0;
    const groups = groupMaterials(observe(w, 'player', LANDSCAPE).items.filter(i => i.kind === 'fish'));
    assert.equal(groups.length, 2);
    assert.deepEqual(selectMaterials(groups, { [groups.find(g => g.food === 'no_obvious_spoilage').key]: 1 }), [{ item: fresh, units: 1 }]);
    for (const since of [null, -1, .5, w.clock + 1]) {
        const invalid = structuredClone(w); invalid.items[old].foodSince = since;
        assert.equal(parse(invalid).ok, false);
    }
    const invalid = structuredClone(w); invalid.items['player-shirt'].foodSince = 0;
    assert.equal(parse(invalid).ok, false);
});
