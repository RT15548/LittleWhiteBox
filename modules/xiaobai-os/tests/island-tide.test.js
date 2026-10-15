import assert from 'node:assert/strict';
import test from 'node:test';
import * as T from 'three';
import { LANDSCAPE, TIDE } from '../apps/game/island/content.ts';
import { PERSON_IDS } from '../apps/game/island/model.ts';
import { newJourney } from '../apps/game/island/world.ts';
import { seaLevel, elevationAt, basinWaterLevel } from '../apps/game/island/terrain.ts';
import { surfaceWaterDepth } from '../apps/game/island/surface-water.ts';
import { weatherAt } from '../apps/game/island/environment.ts';
import { operate } from '../apps/game/island/operations.ts';
import { advance } from '../apps/game/island/clock.ts';
import { createItem } from '../apps/game/island/inventory.ts';
import { walkSpeedFactor } from '../apps/game/island/physiology.ts';
import { observe } from '../apps/game/island/scene.ts';
import { ISLAND_PARTITION } from '../apps/game/island/partition.ts';
import { waterBasin } from '../apps/game/island/presentation/water-basin.ts';

test('tidal footing follows the actual seabed; isolated pools retain water and an empty seep has none', () => {
    const world = newJourney('tide');
    for (const source of Object.values(world.resources).filter(r => r.kind === 'reef_food')) {
        const low = surfaceWaterDepth(world, source.position, 0), high = surfaceWaterDepth(world, source.position, 1);
        assert.ok(high > low);
        assert.ok(Math.abs(low - (basinWaterLevel(source.kind, source.position) - elevationAt(source.position))) < 1e-8);
        assert.ok(Math.abs(high + elevationAt(source.position) - seaLevel(1)) < 1e-8);
    }
    assert.equal(surfaceWaterDepth(world, world.people.player.position, 1), 0);
    const seep = world.resources.center_seep;
    const before = surfaceWaterDepth(world, seep.position, 1); assert.ok(before > 0);
    seep.stock = 0; assert.equal(surfaceWaterDepth(world, seep.position, 1), 0);
});

test('rising sea replaces a lower pool surface, while inland seep water is not replaced by a map-wide sheet', () => {
    const world = newJourney('tide'), stone = new T.MeshStandardMaterial(), water = new T.MeshStandardMaterial();
    for (const source of [world.resources.east_pools, world.resources.center_seep]) {
        for (const tide of [0, 1]) {
            const group = waterBasin(source, stone, water, tide);
            assert.equal(group.children.some(o => o.material === water), source.kind === 'seep' || tide === 0);
            group.traverse(o => o.geometry?.dispose());
        }
    }
    stone.dispose(); water.dispose();
});

test('wading slows actual travel, wets only contacted belongings and survives reload without advancing during observation', () => {
    let world = newJourney('wading'); world.clock = Math.round(TIDE.periodSeconds / 4);
    for (const id of PERSON_IDS) if (id !== 'player') world.people[id].activity = { kind: 'rest', until: world.clock + 3600 };
    world.people.player.position = { ...world.resources.east_pools.position };
    for (const item of Object.values(world.items)) item.wetness = 0;
    const held = createItem(world, 'player', 'cloth', 1), dropped = createItem(world, 'player', 'tinder', 1);
    world.items[dropped].location = { kind: 'ground', position: { ...world.people.player.position } };
    // The authored shore is shallow: feet and trousers are immersed, the held cloth is not.
    world.people.player.position.x -= 1.5;
    const tide = weatherAt(world).tide, depth = surfaceWaterDepth(world, world.people.player.position, tide);
    assert.ok(depth > .1 && depth < .75);
    const dry = structuredClone(world); dry.people.player.position = { x: 0, y: 0 };
    assert.ok(walkSpeedFactor(world, 'player') < walkSpeedFactor(dry, 'player'));
    const before = structuredClone(world);
    for (let i = 0; i < 5; i++) observe(world, 'player', LANDSCAPE);
    assert.deepEqual(world, before);
    const start = { ...world.people.player.position };
    world = operate(world, { kind: 'player' }, 'player', { kind: 'travel', route: [{ x: start.x - 5, y: start.y }] }, LANDSCAPE);
    const result = advance(world, 1, LANDSCAPE); world = result.world;
    assert.equal(result.elapsed, 1);
    assert.ok(start.x - world.people.player.position.x < 1);
    assert.equal(world.items['player-shoes'].wetness, 1);
    assert.equal(world.items['player-trousers'].wetness, 1);
    assert.ok(world.items['player-shirt'].wetness < 1);
    assert.ok(world.items[held].wetness < 1);
    assert.equal(world.items[dropped].wetness, 1);
    const parsed = ISLAND_PARTITION.parse({ formatVersion: 1, revision: 1, active: world, last: { id: 'tide-save', fingerprint: '0'.repeat(64) } });
    assert.equal(parsed.ok, true); assert.deepEqual(parsed.value.active, world);
});
