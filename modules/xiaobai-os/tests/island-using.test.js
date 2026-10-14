import assert from 'node:assert/strict';
import test from 'node:test';
import { PERSON_IDS } from '../apps/game/island/model.ts';
import { LANDSCAPE } from '../apps/game/island/content.ts';
import { newJourney } from '../apps/game/island/world.ts';
import { createItem, consumeMaterials } from '../apps/game/island/inventory.ts';
import { operate } from '../apps/game/island/operations.ts';
import { advance } from '../apps/game/island/clock.ts';
import { settleDeath } from '../apps/game/island/mortality.ts';
import { observe, openScene } from '../apps/game/island/scene.ts';
import { ISLAND_PARTITION } from '../apps/game/island/partition.ts';

const act = (w, actor, operation) => operate(w, actor === 'player' ? { kind: 'player' }
    : { kind: 'gm', scene: openScene(w, actor, LANDSCAPE) }, actor, operation, LANDSCAPE);
function usingWork(kind, actor = 'ye', ground = false) {
    const source = newJourney('visible-use');
    for (const person of PERSON_IDS) if (person !== 'player' && person !== actor) source.people[person].activity = { kind: 'rest', until: 3600 };
    const item = createItem(source, actor, kind === 'drink' ? 'bottle' : 'cooked_fish', kind === 'drink' ? 1 : 3, .37);
    const other = createItem(source, actor, 'cloth', 4, .8);
    if (kind === 'drink') source.items[item].water.millilitres = 250;
    if (ground) source.items[item].location = { kind: 'ground', position: { ...source.people[actor].position } };
    const task = kind === 'drink' ? { kind, container: item, millilitres: 100 } : { kind, item };
    const w = act(source, actor, { kind: 'work', task });
    return { w, source, item, other, duration: w.people[actor].activity.remaining };
}
function reload(w) {
    const parsed = ISLAND_PARTITION.parse(JSON.parse(JSON.stringify({ formatVersion: 1, revision: 1, active: w,
        last: { id: 'using-save', fingerprint: '0'.repeat(64) } })));
    assert.equal(parsed.ok, true); assert.deepEqual(parsed.value.active, w); return parsed.value.active;
}

// This exact observation shape is the privacy boundary, not a snapshot of display copy.
test('actual drinking and eating expose one visible used form, not item IDs, water, stack totals, task targets or other carried items', () => {
    for (const actor of ['ye', 'player']) for (const kind of ['drink', 'eat']) {
        const { w, source, item, other } = usingWork(kind, actor);
        assert.deepEqual(w.items, source.items);
        const loaded = reload(w), before = structuredClone(loaded);
        const expected = [{ person: actor, form: w.items[item].kind, wetness: .37, units: 1 }];
        const observer = actor === 'ye' ? 'player' : 'lin';
        const view = observe(loaded, observer, LANDSCAPE);
        assert.deepEqual(view.using, expected);
        assert.equal(view.items.some(entry => entry.id === item || entry.id === other), false);
        assert.deepEqual(view.people.find(person => person.id === actor), { id: actor, position: w.people[actor].position,
            body: { kind: 'living' }, activity: 'work', work: kind });
        for (let i = 0; i < 3; i++) assert.deepEqual(observe(loaded, actor, LANDSCAPE).using, expected);
        assert.deepEqual(loaded, before); assert.equal(loaded.clock, 0);
    }
});

test('using disappears on cancellation, completion, death or loss of sight, while self observation retains the actual held use', () => {
    for (const kind of ['drink', 'eat']) {
        const { w, item, duration } = usingWork(kind);
        assert.equal(observe(w, 'player', LANDSCAPE).using.length, 1);
        const cancelled = act(w, 'ye', { kind: 'cancel' });
        assert.deepEqual(observe(cancelled, 'player', LANDSCAPE).using, []);
        const finished = advance(w, duration, LANDSCAPE);
        assert.equal(finished.elapsed, duration); assert.equal(finished.world.people.ye.activity, null);
        assert.deepEqual(observe(finished.world, 'player', LANDSCAPE).using, []);
        assert.ok(finished.world.items[item].quantity > 0);
        if (kind === 'drink') assert.equal(finished.world.items[item].water.millilitres, 150);
        else assert.equal(finished.world.items[item].quantity, 2);
        const dead = settleDeath(w, 'ye', 'trauma', LANDSCAPE);
        assert.deepEqual(observe(dead, 'player', LANDSCAPE).using, []);
        const far = structuredClone(w); far.people.ye.position = { x: -400, y: -200 };
        const distant = observe(far, 'player', LANDSCAPE);
        assert.equal(distant.people.some(person => person.id === 'ye'), false); assert.deepEqual(distant.using, []);
        assert.equal(observe(far, 'ye', LANDSCAPE).using.length, 1);
        const screened = { ...LANDSCAPE, sightScreens: [...LANDSCAPE.sightScreens,
            [{ x: -740, y: -2 }, { x: -710, y: -2 }, { x: -710, y: -1 }, { x: -740, y: -1 }]] };
        const hidden = observe(w, 'player', screened);
        assert.equal(hidden.people.some(person => person.id === 'ye'), false); assert.deepEqual(hidden.using, []);
    }
});

test('ground food and containers remain ground objects rather than duplicate hand props; washing and source drinking do not imply held use', () => {
    for (const kind of ['drink', 'eat']) {
        const { w, item } = usingWork(kind, 'ye', true), before = structuredClone(w);
        for (const observer of ['player', 'ye']) {
            const view = observe(w, observer, LANDSCAPE);
            assert.deepEqual(view.using, []);
            assert.equal(view.items.find(entry => entry.id === item).location.kind, 'ground');
        }
        assert.deepEqual(w, before);
    }
    const { w, item } = usingWork('drink');
    let washing = act(w, 'ye', { kind: 'cancel' });
    washing = act(washing, 'ye', { kind: 'work', task: { kind: 'wash', supply: { kind: 'container', id: item }, millilitres: 100 } });
    assert.deepEqual(observe(washing, 'player', LANDSCAPE).using, []);
    let sipping = act(w, 'ye', { kind: 'cancel' });
    sipping.people.ye.position = { ...sipping.resources.center_seep.position };
    sipping = act(sipping, 'ye', { kind: 'work', task: { kind: 'sip', source: 'center_seep', millilitres: 100 } });
    const before = structuredClone(sipping);
    assert.deepEqual(observe(sipping, 'ye', LANDSCAPE).using, []);
    assert.deepEqual(sipping, before);
});

test('a still-recorded task cannot project an exhausted item or an item now carried by another person', () => {
    for (const kind of ['drink', 'eat']) {
        const { w, item } = usingWork(kind);
        const exhausted = structuredClone(w); consumeMaterials(exhausted, [{ item, units: exhausted.items[item].quantity }]);
        assert.deepEqual(observe(exhausted, 'player', LANDSCAPE).using, []);
        const moved = structuredClone(w); moved.items[item].location = { kind: 'carried', person: 'lin' };
        assert.deepEqual(observe(moved, 'player', LANDSCAPE).using, []);
        assert.deepEqual(observe(moved, 'ye', LANDSCAPE).using, []);
    }
});
