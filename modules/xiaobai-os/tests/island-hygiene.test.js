import assert from 'node:assert/strict';
import test from 'node:test';
import { newJourney } from '../apps/game/island/world.ts';
import { LANDSCAPE } from '../apps/game/island/content.ts';
import { PERSON_IDS } from '../apps/game/island/model.ts';
import { HYGIENE, SURVIVAL, RESOURCE_RULES } from '../apps/game/island/survival-content.ts';
import { operate } from '../apps/game/island/operations.ts';
import { advance } from '../apps/game/island/clock.ts';
import { createItem } from '../apps/game/island/inventory.ts';
import { observe, openScene } from '../apps/game/island/scene.ts';
import { ISLAND_PARTITION } from '../apps/game/island/partition.ts';
import { plainWater } from '../apps/game/island/water.ts';
import { createIntentWork } from '../apps/game/island/intent-work.ts';

function world() {
    const w = newJourney('hygiene');
    for (const id of PERSON_IDS) if (id !== 'player') w.people[id].activity = { kind: 'rest', until: 3600 };
    return w;
}
function act(w, task, actor = 'player') {
    return operate(w, actor === 'player' ? { kind: 'player' } : { kind: 'gm', scene: openScene(w, actor, LANDSCAPE) }, actor, { kind: 'work', task }, LANDSCAPE);
}
const finish = w => advance(w, 3600, LANDSCAPE).world;
function reload(w) {
    const parsed = ISLAND_PARTITION.parse({ formatVersion: 1, revision: 1, active: w, last: { id: 'save', fingerprint: '0'.repeat(64) } });
    assert.equal(parsed.ok, true); return parsed.value.active;
}

test('a completed privacy screen does not bury waste; NPC relief and covering remain separate work and information', () => {
    let w = world(); const person = w.people.lin;
    person.position = { x: -500, y: 150 }; person.activity = null; person.body.needs.bowel = 180;
    w.structures.screen = { kind: 'latrine', position: { ...person.position }, builder: 'lin', workLeft: 0, water: null, burning: false, fuelSeconds: 0 };
    w = finish(act(w, { kind: 'relieve', waste: 'feces' }, 'lin'));
    const waste = Object.keys(w.waste)[0];
    assert.equal(w.waste[waste].covered, false);
    assert.equal(w.people.lin.body.needs.bowel, 0);
    assert.deepEqual(w.experiences.find(e => e.payload.kind === 'worked' && e.payload.task === 'relieve').audience, ['lin']);
    assert.deepEqual(observe(w, 'player', LANDSCAPE).waste, []);
    w.people.player.position = { ...person.position };
    assert.deepEqual(observe(w, 'player', LANDSCAPE).waste, [{ id: waste, position: person.position, kind: 'feces' }]);
    w = act(w, { kind: 'cover_waste', waste }, 'lin');
    w = advance(w, 20, LANDSCAPE).world;
    assert.equal(w.waste[waste].covered, false);
    w = finish(reload(w));
    assert.equal(w.waste[waste].covered, true);
    assert.deepEqual(observe(w, 'player', LANDSCAPE).waste, [{ id: waste, position: person.position, kind: 'disturbed_ground' }]);
});

test('washing directly at a seep consumes shared stock without a container, survives reload, and does not heal wounds or clean clothing', () => {
    let w = world(); const source = 'center_seep', task = { kind: 'wash', supply: { kind: 'source', id: source }, millilitres: HYGIENE.portionMl };
    assert.throws(() => act(w, task), { code: 'island_unavailable' });
    w.people.player.position = { ...w.resources[source].position };
    w.people.player.body.needs.soiling = .9; w.people.player.body.needs.infection = .3;
    const before = structuredClone(w);
    const control = advance(before, SURVIVAL.washSeconds, LANDSCAPE).world;
    w = finish(reload(act(w, task)));
    assert.equal(w.clock, SURVIVAL.washSeconds);
    assert.ok(Math.abs(w.resources[source].stock - (before.resources[source].stock + w.clock * RESOURCE_RULES.seep.renewalPerDay / 86400 - task.millilitres)) < 1e-8);
    assert.equal(w.people.player.body.needs.soiling, .9 - task.millilitres / HYGIENE.fullWashMl);
    assert.equal(w.people.player.body.needs.skinWound, before.people.player.body.needs.skinWound);
    assert.ok(w.people.player.body.needs.infection >= before.people.player.body.needs.infection);
    assert.equal(w.items['player-shirt'].wetness, control.items['player-shirt'].wetness);
    assert.deepEqual(Object.keys(w.items), Object.keys(before.items));
});

test('washing respects actual containers and collectors; cancellation or losing water cannot grant cleaning', () => {
    let w = world(); w.people.player.body.needs.soiling = .8;
    const cup = createItem(w, 'player', 'metal_cup', 1); w.items[cup].water = plainWater(300, 'treated');
    const task = { kind: 'wash', supply: { kind: 'container', id: cup }, millilitres: 250 };
    const started = act(w, task), progress = advance(started, 20, LANDSCAPE).world;
    assert.equal(progress.items[cup].water.millilitres, 300); assert.equal(progress.people.player.body.needs.soiling, .8);
    w = operate(progress, { kind: 'player' }, 'player', { kind: 'cancel' }, LANDSCAPE);
    w = finish(act(w, task));
    assert.equal(w.items[cup].water.millilitres, 50); assert.ok(w.people.player.body.needs.soiling < .8);
    const lost = structuredClone(started); lost.items[cup].location = { kind: 'carried', person: 'lin' };
    const failed = finish(lost);
    assert.equal(failed.people.player.body.needs.soiling, .8);
    assert.equal(failed.items[cup].water.millilitres, 300);
    assert.ok(failed.experiences.some(e => e.payload.kind === 'work_failed' && e.payload.task === 'wash'));
    w.structures.collector = { kind: 'raincatcher', position: { ...w.people.player.position }, builder: 'player', workLeft: 1,
        water: plainWater(300), burning: false, fuelSeconds: 0 };
    const collected = { kind: 'wash', supply: { kind: 'source', id: 'collector' }, millilitres: 250 };
    assert.throws(() => act(w, collected), { code: 'island_unavailable' });
    w.structures.collector.workLeft = 0;
    w = finish(act(w, collected));
    assert.equal(w.structures.collector.water.millilitres, 50);
});

test('simultaneous washing competes with drinking for the same last water, not a parallel hygiene inventory', () => {
    let w = world(); const source = 'center_seep'; w.resources[source].stock = 510;
    for (const actor of ['player', 'lin']) { w.people[actor].position = { ...w.resources[source].position }; w.people[actor].activity = null; }
    w.people.player.body.needs.soiling = .8;
    w = act(w, { kind: 'wash', supply: { kind: 'source', id: source }, millilitres: 400 });
    // Sip 500 ml finishes in 50 seconds; schedule it after ten seconds of washing.
    w.people.lin.activity = { kind: 'rest', until: 3600 };
    w = advance(w, 10, LANDSCAPE).world; w.people.lin.activity = null;
    w = act(w, { kind: 'sip', source, millilitres: 500 }, 'lin');
    const before = w.resources[source].stock;
    w = finish(w);
    assert.ok(w.resources[source].stock >= before);
    assert.equal(w.people.player.body.needs.soiling, .8);
    const clash = w.experiences.find(e => e.payload.kind === 'resource_contested');
    assert.deepEqual(clash.payload.actors, ['player', 'lin']);
    assert.equal(w.people.player.activity, null); assert.equal(w.people.lin.activity, null);
});

test('washing proposals use only observed supplies and saved activities reject dangling supply references', () => {
    let w = world();
    const bottle = createItem(w, 'player', 'bottle', 1); w.items[bottle].water = plainWater(500);
    const task = { kind: 'wash', supply: { kind: 'container', id: bottle }, millilitres: 250 };
    const intent = createIntentWork(w, LANDSCAPE); intent.propose({ kind: 'work', task });
    assert.deepEqual(intent.finish().operation.task, task);
    assert.equal(w.items[bottle].water.millilitres, 500);
    w.items[bottle].location = { kind: 'carried', person: 'lin' };
    assert.throws(() => createIntentWork(w, LANDSCAPE).propose({ kind: 'work', task }), { code: 'island_unavailable' });
    w.items[bottle].location = { kind: 'carried', person: 'player' };
    w = act(w, task);
    for (const kind of ['container', 'source']) {
        const invalid = structuredClone(w); invalid.people.player.activity.task.supply = { kind, id: 'missing' };
        assert.equal(ISLAND_PARTITION.parse({ formatVersion: 1, revision: 1, active: invalid, last: { id: 'save', fingerprint: '0'.repeat(64) } }).ok, false);
    }
});
