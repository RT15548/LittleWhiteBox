import assert from 'node:assert/strict';
import test from 'node:test';
import { canStandInWorld, cellCenter, createWorldSpace, moveInWorld, worldLineClear } from '../apps/game/expedition/world/geometry.ts';
import { findWorldPath } from '../apps/game/expedition/world/navigation.ts';

const map = {
    origin: { x: -4, y: -3 }, cellSize: 1,
    rows: ['#########', '#...#...#', '#...#...#', '#.......#', '#...#...#', '#...#...#', '#########'],
    gates: [{ id: 'sluice', cells: [{ column: 4, row: 3 }] }],
};
const point = (column, row) => cellCenter(map, column, row);

test('a confirmed door changes movement, projectile occlusion and pathfinding together without changing the authored map', () => {
    const before = structuredClone(map), shut = createWorldSpace(map, new Set()), open = createWorldSpace(map, new Set(['sluice']));
    const a = point(2, 3), b = point(6, 3);
    assert.equal(worldLineClear(shut, a, b, .16), false);
    assert.equal(findWorldPath(shut, a, b, .34), null);
    const body = { ...a }; moveInWorld(shut, body, { x: 8, y: 0 }, .34);
    assert.ok(body.x < point(4, 3).x); assert.equal(canStandInWorld(shut, body, .34), true);
    assert.equal(worldLineClear(open, a, b, .16), true);
    assert.deepEqual(findWorldPath(open, a, b, .34), [b]);
    assert.deepEqual(map, before);
});

test('swept bodies and shots cannot skip thin walls even when both endpoints are clear', () => {
    const space = createWorldSpace(map, new Set(['sluice'])), a = point(2, 1), b = point(6, 1);
    assert.equal(worldLineClear(space, a, b), false);
    assert.equal(worldLineClear(space, a, b, .16), false);
    const body = { ...a }; moveInWorld(space, body, { x: b.x - a.x, y: 0 }, .34);
    assert.ok(body.x < point(4, 1).x); assert.equal(canStandInWorld(space, body, .34), true);
});

test('routes go through an actual gap and respect the radius of the travelling actor', () => {
    const space = createWorldSpace(map, new Set(['sluice'])), a = point(2, 1), b = point(6, 1);
    const route = findWorldPath(space, a, b, .34);
    assert.ok(route?.length > 1); assert.deepEqual(route.at(-1), b);
    let previous = a;
    for (const next of route) { assert.equal(worldLineClear(space, previous, next, .34), true); previous = next; }
    assert.equal(findWorldPath(space, a, b, .6), null);
});

test('world voids and disconnected islands stay inaccessible and diagonal movement does not cut corners', () => {
    const islands = { origin: { x: 0, y: 0 }, cellSize: 1, rows: ['..  ', '..  ', '  ..', '  ..'], gates: [] };
    const space = createWorldSpace(islands, new Set()), a = { x: 1.5, y: 1.5 }, b = { x: 2.5, y: 2.5 };
    assert.equal(findWorldPath(space, a, b, .2), null);
    assert.equal(worldLineClear(space, a, b, .2), false);
    const body = { ...a }; moveInWorld(space, body, { x: 6, y: 6 }, .2);
    assert.ok(body.x < 2 && body.y < 2); assert.equal(canStandInWorld(space, body, .2), true);
});

test('sliding preserves legal contact and replay produces the same result', () => {
    const space = createWorldSpace(map, new Set()), a = point(3, 1), b = { ...a };
    const moves = [{ x: 4, y: 2 }, { x: -1, y: 3 }, { x: -9, y: -9 }];
    for (const body of [a, b]) for (const delta of moves) { moveInWorld(space, body, delta, .34); assert.equal(canStandInWorld(space, body, .34), true); }
    assert.deepEqual(a, b);
    assert.throws(() => moveInWorld(space, point(4, 1), { x: 1, y: 0 }, .34), { code: 'expedition_world_position_blocked' });
});

test('invalid authored doors and foreign open-door facts are rejected rather than silently changing topology', () => {
    assert.throws(() => createWorldSpace(map, new Set(['other'])), { code: 'expedition_world_gate_unknown' });
    assert.throws(() => createWorldSpace({ ...map, gates: [{ id: 'sluice', cells: [{ column: 4, row: 1 }] }] }, new Set()), { code: 'expedition_world_map_invalid' });
    assert.throws(() => createWorldSpace({ ...map, rows: ['..', '.'] }, new Set()), { code: 'expedition_world_map_invalid' });
});
