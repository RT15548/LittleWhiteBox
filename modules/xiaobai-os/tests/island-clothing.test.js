import assert from 'node:assert/strict';
import test from 'node:test';
import { newJourney } from '../apps/game/island/world.ts';
import { CAST, LANDSCAPE, TIDE } from '../apps/game/island/content.ts';
import { PERSON_IDS } from '../apps/game/island/model.ts';
import { GARMENTS } from '../apps/game/island/clothing.ts';
import { RECIPES, SURVIVAL } from '../apps/game/island/survival-content.ts';
import { operate } from '../apps/game/island/operations.ts';
import { advance } from '../apps/game/island/clock.ts';
import { createItem } from '../apps/game/island/inventory.ts';
import { observe, openScene } from '../apps/game/island/scene.ts';
import { createSceneWork } from '../apps/game/island/scene-work.ts';
import { ISLAND_PARTITION } from '../apps/game/island/partition.ts';
import { applyDeath } from '../apps/game/island/mortality.ts';
import { weatherAt } from '../apps/game/island/environment.ts';
import { surfaceWaterDepth } from '../apps/game/island/surface-water.ts';
import { basinExtent } from '../apps/game/island/water-basins.ts';
import { canStand } from '../apps/game/island/space.ts';

const styles = ['ivory_blouse', 'charcoal_trousers', 'inner_top', 'inner_shorts'];
const itemId = kind => `ye-${kind}`;
function world() {
    const w = newJourney('clothing');
    for (const id of PERSON_IDS) if (id !== 'player' && id !== 'ye') w.people[id].activity = { kind: 'rest', until: 3600 };
    return w;
}
const act = (w, actor, operation) => operate(w, actor === 'player' ? { kind: 'player' }
    : { kind: 'gm', scene: openScene(w, actor, LANDSCAPE) }, actor, operation, LANDSCAPE);
const stored = w => JSON.parse(JSON.stringify({ formatVersion: 1, revision: 1, active: w, last: { id: 'clothing-save', fingerprint: '0'.repeat(64) } }));
function reload(w) {
    const parsed = ISLAND_PARTITION.parse(stored(w));
    assert.equal(parsed.ok, true);
    assert.deepEqual(parsed.value.active, w);
    return parsed.value.active;
}

test('Ye starts at 45 with four independent approved styles, vest and shoes; other starting garments do not change', () => {
    const w = newJourney('clothing');
    assert.equal(CAST.ye.age, 45);
    for (const person of PERSON_IDS) {
        const expected = person === 'ye' ? ['lifejacket', ...styles, 'shoes']
            : ['lifejacket', 'shirt', 'trousers', ...(['player', 'lin', 'zhou'].includes(person) ? ['shoes'] : [])];
        const items = Object.values(w.items).filter(i => i.location.kind === 'worn' && i.location.person === person);
        assert.deepEqual(items.map(i => i.kind).sort(), [...expected].sort());
        for (const item of items) { assert.equal(item.quantity, 1); assert.equal(item.wetness, .8); }
    }
    // These values are the approved GLB material/garment_id contract, not a source-text snapshot.
    assert.deepEqual(styles.map(kind => GARMENTS[kind].shape), ['shirt', 'trousers', 'inner-top', 'inner-shorts']);
    assert.deepEqual(styles.map(kind => GARMENTS[kind].color), [[.74, .71, .65], [.021, .025, .029], [.105, .118, .115], [.105, .118, .115]]);
    assert.deepEqual(styles.map(kind => GARMENTS[kind].dryRoughness), [.82, .76, .9, .9]);
    reload(w);
});

test('GM can remove and replace each Ye layer independently but cannot undress the player; observing changes no time or state', () => {
    const source = newJourney('clothing'), work = createSceneWork(source, 'ye', LANDSCAPE);
    assert.throws(() => work.act('player', { kind: 'unwear', item: 'player-shirt' }), { code: 'island_authority' });
    for (const kind of styles) {
        work.act('ye', { kind: 'unwear', item: itemId(kind) });
        const removed = work.finish().world;
        assert.deepEqual(removed.items[itemId(kind)].location, { kind: 'carried', person: 'ye' });
        assert.equal(observe(removed, 'player', LANDSCAPE).items.some(i => i.id === itemId(kind)), false);
        for (const other of styles.filter(s => s !== kind)) assert.equal(removed.items[itemId(other)].location.kind, 'worn');
        work.act('ye', { kind: 'wear', item: itemId(kind) });
        assert.equal(work.finish().world.items[itemId(kind)].location.kind, 'worn');
    }
    const before = work.finish().world;
    for (let i = 0; i < 3; i++) { work.context(); observe(before, 'player', LANDSCAPE); }
    assert.deepEqual(work.finish().world, before);
    assert.equal(before.clock, 0);
    assert.deepEqual(before.people, source.people);
    assert.deepEqual(before.items, source.items);
    assert.equal(source.experiences.length, 0);
});

test('new outer styles conflict with the existing outer slots and inner styles only with their own slots, including on load', () => {
    for (const kind of ['shirt', 'trousers', 'inner_top', 'inner_shorts']) {
        let w = world();
        const extra = createItem(w, 'ye', kind, 1);
        assert.throws(() => act(w, 'ye', { kind: 'wear', item: extra }), { code: 'island_conditions' });
        const invalid = structuredClone(w); invalid.items[extra].location = { kind: 'worn', person: 'ye' };
        assert.equal(ISLAND_PARTITION.parse(stored(invalid)).ok, false);
        const occupied = kind === 'shirt' ? 'ivory_blouse' : kind === 'trousers' ? 'charcoal_trousers' : kind;
        w = act(w, 'ye', { kind: 'unwear', item: itemId(occupied) });
        w = act(w, 'ye', { kind: 'wear', item: extra });
        assert.equal(w.items[extra].location.kind, 'worn');
        for (const other of styles.filter(s => s !== occupied)) assert.equal(w.items[itemId(other)].location.kind, 'worn');
        reload(w);
    }
});

test('each real garment keeps its kind and wetness through offering, transfer, another wearer, dropping and JSON reload', () => {
    let w = world(); w.people.player.position = { ...w.people.ye.position };
    const count = Object.keys(w.items).length;
    for (const kind of styles) {
        const id = itemId(kind), original = structuredClone(w.items[id]);
        assert.throws(() => act(w, 'ye', { kind: 'offer', item: id, to: 'player', units: 1 }), { code: 'island_unavailable' });
        w = act(w, 'ye', { kind: 'unwear', item: id });
        w = act(w, 'ye', { kind: 'offer', item: id, to: 'player', units: 1 });
        const offer = observe(w, 'player', LANDSCAPE).offers.find(o => o.item === id);
        assert.equal(offer.form, kind); assert.equal(offer.wetness, original.wetness);
        w = reload(w);
        w = act(w, 'player', { kind: 'accept', from: 'ye' });
        assert.deepEqual(w.items[id], { ...original, location: { kind: 'carried', person: 'player' } });
        const old = kind === 'ivory_blouse' ? 'shirt' : kind === 'charcoal_trousers' ? 'trousers' : null;
        if (old) w = act(w, 'player', { kind: 'unwear', item: `player-${old}` });
        w = act(w, 'player', { kind: 'wear', item: id });
        assert.deepEqual(w.items[id], { ...original, location: { kind: 'worn', person: 'player' } });
        w = reload(w);
        w = act(w, 'player', { kind: 'drop', item: id });
        w = reload(w);
        assert.deepEqual(w.items[id], { ...original, location: { kind: 'ground', position: w.people.player.position } });
        const visible = observe(w, 'ye', LANDSCAPE).items.find(i => i.id === id);
        assert.equal(visible.kind, original.kind); assert.equal(visible.wetness, original.wetness);
        assert.equal(GARMENTS[visible.kind], GARMENTS[original.kind]);
    }
    assert.equal(Object.keys(w.items).length, count);
    assert.equal(w.clock, 0);
});

test('cutting up any new style consumes the actual garment and removes it from observations and subsequent wearing', () => {
    for (const kind of styles) {
        let w = world(); const id = itemId(kind);
        const recipe = kind === 'ivory_blouse' || kind === 'charcoal_trousers' ? 'tear_cloth' : 'twist_cord';
        const materials = [{ item: id, units: 1 }];
        if (kind === 'inner_shorts') {
            assert.throws(() => act(w, 'ye', { kind: 'work', task: { kind: 'craft', recipe, materials } }), { code: 'island_materials' });
            materials.push({ item: createItem(w, 'ye', 'inner_shorts', 1, .8), units: 1 });
        }
        w = act(w, 'ye', { kind: 'work', task: { kind: 'craft', recipe, materials } });
        const result = advance(w, RECIPES[recipe].seconds, LANDSCAPE); w = result.world;
        assert.equal(result.elapsed, RECIPES[recipe].seconds);
        assert.equal(w.items[id].quantity, 0);
        for (const observer of ['ye', 'player']) assert.equal(observe(w, observer, LANDSCAPE).items.some(i => i.id === id), false);
        assert.throws(() => act(w, 'ye', { kind: 'wear', item: id }), { code: 'island_unavailable' });
        const output = recipe === 'tear_cloth' ? 'cloth' : 'cord';
        assert.equal(Object.values(w.items).filter(i => i.kind === output).reduce((sum, i) => sum + i.quantity, 0), 2);
        reload(w);
    }
});

test('upper and lower inner/outer layers wet only beyond their own hems on real terrain; observation never advances wetness', () => {
    const template = newJourney('clothing-wading'); template.clock = Math.round(TIDE.periodSeconds / 4);
    for (const id of PERSON_IDS) if (id !== 'player') template.people[id].activity = { kind: 'rest', until: template.clock + 3600 };
    for (const item of Object.values(template.items)) item.wetness = 0;
    const tide = weatherAt({ ...template, clock: template.clock + 1 }).tide;
    const samples = styles.flatMap(kind => [-.02, .02].map(offset => ({ kind, offset, target: GARMENTS[kind].hemMetres + offset, distance: Infinity, position: null, depth: null })));
    // Find valid nearby footing in existing tidal basins, rather than inventing a water level or coordinate.
    const steps = Math.ceil(basinExtent('reef_food') / .2);
    for (const source of Object.values(template.resources).filter(r => r.kind === 'reef_food')) {
        for (let x = -steps; x <= steps; x++) for (let y = -steps; y <= steps; y++) {
            const position = { x: source.position.x + x * .2, y: source.position.y + y * .2 };
            if (!canStand(position, LANDSCAPE)) continue;
            const depth = surfaceWaterDepth(template, position, tide);
            for (const sample of samples) {
                const distance = Math.abs(depth - sample.target);
                if (distance < sample.distance) Object.assign(sample, { distance, position, depth });
            }
        }
    }
    for (const sample of samples) {
        assert.ok(sample.distance < .015, `No real footing near ${sample.kind} hem at ${sample.target}m; nearest depth ${sample.depth}`);
        assert.equal(sample.depth > GARMENTS[sample.kind].hemMetres, sample.offset > 0);
        let w = structuredClone(template); w.people.ye.position = { ...sample.position };
        const before = structuredClone(w);
        for (let i = 0; i < 3; i++) observe(w, 'ye', LANDSCAPE);
        assert.deepEqual(w, before);
        const result = advance(w, 1, LANDSCAPE); w = result.world;
        assert.equal(result.elapsed, 1);
        for (const kind of styles) assert.equal(w.items[itemId(kind)].wetness === 1, sample.depth > GARMENTS[kind].hemMetres);
        reload(w);
    }
});

test('all four new fabrics reject covering while worn and persist as the same covering item after use', () => {
    for (const kind of styles) {
        let w = world(); w.clock = 1;
        for (const person of PERSON_IDS) if (person !== 'ye' && person !== 'player') w.people[person].position = { x: -500, y: -200 };
        w.people.lin.position = { ...w.people.ye.position };
        applyDeath(w, 'lin', 'trauma', LANDSCAPE);
        const id = itemId(kind), task = { kind: 'cover_body', subject: 'lin', item: id };
        assert.throws(() => act(w, 'ye', { kind: 'work', task }), { code: 'island_conditions' });
        w = act(w, 'ye', { kind: 'unwear', item: id });
        w = act(w, 'ye', { kind: 'work', task });
        const result = advance(w, SURVIVAL.coverBodySeconds, LANDSCAPE); w = result.world;
        assert.equal(result.elapsed, SURVIVAL.coverBodySeconds);
        assert.deepEqual(w.items[id].location, { kind: 'covering', person: 'lin' });
        assert.equal(w.items[id].kind, kind); assert.equal(w.items[id].quantity, 1);
        assert.equal(observe(w, 'ye', LANDSCAPE).items.find(i => i.id === id).location.kind, 'covering');
        reload(w);
    }
});
