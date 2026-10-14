import assert from 'node:assert/strict';
import test from 'node:test';
import { renewResources, resourceAccessible } from '../apps/game/island/resources.ts';
import { INITIAL_RESOURCES, RESOURCE_RULES, ITEMS, SURVIVAL } from '../apps/game/island/survival-content.ts';
import { TIDE, LANDSCAPE } from '../apps/game/island/content.ts';
import { PERSON_IDS } from '../apps/game/island/model.ts';
import { newJourney } from '../apps/game/island/world.ts';
import { canStand } from '../apps/game/island/space.ts';
import { shoreDistance } from '../apps/game/island/coastline.ts';
import { terrainAt, weatherAt } from '../apps/game/island/environment.ts';
import { observe } from '../apps/game/island/scene.ts';
import { ISLAND_PARTITION } from '../apps/game/island/partition.ts';

test('authored food patches are reachable ground, with tidal food on the actual reef shore', () => {
    for (const resource of Object.values(INITIAL_RESOURCES)) {
        assert.equal(canStand(resource.position, LANDSCAPE), true);
        if (resource.kind === 'reef_food') {
            assert.equal(terrainAt(resource.position), 'reef');
            assert.ok(shoreDistance(resource.position) < 15);
        }
        if (resource.kind === 'coconuts') assert.ok(['sand', 'scrub'].includes(terrainAt(resource.position)));
    }
});

test('renewable food is not inherently below seven resting bodies needs, nor unlimited all-day labour', () => {
    const daily = Object.values(INITIAL_RESOURCES).reduce((sum, r) => {
        const rule = RESOURCE_RULES[r.kind];
        const energy = rule.output === 'coconut' ? ITEMS.coconut_open.energy : rule.output ? ITEMS[rule.output].energy : 0;
        return sum + energy * rule.renewalPerDay;
    }, 0);
    assert.ok(daily > PERSON_IDS.length * 24 * SURVIVAL.energyRestPerHour);
    assert.ok(daily < PERSON_IDS.length * 24 * SURVIVAL.energyWorkPerHour);
});

test('tide pools replenish only at high water, remain inaccessible then, and average the authored rate over a full tide cycle', () => {
    const resources = { pool: { kind: 'reef_food', position: { x: 0, y: 0 }, stock: 0 } };
    renewResources(resources, 0); assert.equal(resources.pool.stock, 0);
    assert.equal(resourceAccessible('reef_food', 0), true);
    assert.equal(resourceAccessible('reef_food', 1), false);
    for (let clock = 0; clock < TIDE.periodSeconds; clock++) renewResources(resources, weatherAt({ id: 'tides', clock }).tide);
    const expected = RESOURCE_RULES.reef_food.renewalPerDay * TIDE.periodSeconds / 86400;
    assert.ok(Math.abs(resources.pool.stock - expected) < .001);
});

test('patches cannot accumulate past capacity or refill just because the view is opened or the save is loaded', () => {
    const world = newJourney('resource-save');
    for (const source of Object.values(world.resources)) source.stock = RESOURCE_RULES[source.kind].capacity;
    renewResources(world.resources, 1);
    for (const source of Object.values(world.resources)) assert.equal(source.stock, RESOURCE_RULES[source.kind].capacity);
    world.resources.east_pools.stock = 0;
    for (let i = 0; i < 60; i++) observe(world, 'player', LANDSCAPE);
    const saved = ISLAND_PARTITION.parse({ formatVersion: 1, revision: 1, active: world, last: { id: 'saved', fingerprint: '0'.repeat(64) } });
    assert.equal(saved.ok, true); assert.deepEqual(saved.value.active.resources, world.resources);
    const unseen = observe(world, 'player', LANDSCAPE).resources;
    assert.equal(unseen.some(r => r.id === 'east_pools'), false);
    assert.equal(world.resources.east_pools.stock, 0);
});

test('the same elapsed game time replenishes a depleted grove regardless of where people live', () => {
    const a = newJourney('same-time'), b = structuredClone(a);
    a.resources.west_coconuts.stock = b.resources.west_coconuts.stock = 0;
    b.people.player.position = { x: 500, y: 0 };
    for (let clock = 0; clock < 3600; clock++) {
        const tide = weatherAt({ id: a.id, clock }).tide;
        renewResources(a.resources, tide); renewResources(b.resources, tide);
    }
    assert.deepEqual(a.resources, b.resources);
    assert.ok(Math.abs(a.resources.west_coconuts.stock - RESOURCE_RULES.coconuts.renewalPerDay / 24) < 1e-8);
});
