import assert from 'node:assert/strict';
import test from 'node:test';
import { Group, Mesh } from 'three';
import { LOCAL_LIFE } from '../apps/game/expedition/content/local-life.ts';
import { COURTYARD } from '../apps/game/expedition/content/courtyard.ts';
import { localPose, localElapsed } from '../apps/game/expedition/world/local-life.ts';
import { canStandInWorld } from '../apps/game/expedition/world/geometry.ts';
import { sceneSpace } from '../apps/game/expedition/world/exploration.ts';
import { buildLocalLife } from '../apps/game/expedition/presentation/local-people.ts';
import { createSceneKit } from '../apps/game/expedition/scene-kit.ts';

// Authored short routes bypass pathfinding. Sampling every 5 cm catches a walk through a wall or a closed gate.
test('ordinary residents walk only on accessible ground and stop at every authored destination', () => {
    for (const [id, residents] of Object.entries(LOCAL_LIFE)) {
        const space = sceneSpace(COURTYARD[id], new Set()), before = structuredClone(residents);
        for (const resident of residents) {
            const stopped = new Set();
            for (let seconds = 0; seconds < 180; seconds += .05) {
                const pose = localPose(resident, seconds);
                assert.ok(Number.isFinite(pose.facing));
                assert.ok(canStandInWorld(space, pose.position, .34), `${resident.id} ${JSON.stringify(pose.position)}`);
                if (!pose.walking) { resident.route.forEach((stop, i) => { if (Math.hypot(pose.position.x - stop.position.x, pose.position.y - stop.position.y) < .01) stopped.add(i); }); }
            }
            resident.route.forEach((stop, i) => { if (stop.wait || resident.route.length === 1) assert.ok(stopped.has(i)); });
        }
        assert.deepEqual(residents, before);
    }
});

// Background gaps, reduced motion and offscreen work must not create hidden simulation or catch-up movement.
test('life pauses without catch-up, freezes out of view and with reduced motion', () => {
    assert.equal(localElapsed(null, 50000), 0);
    assert.ok(localElapsed(100, 50000) <= .1);
    const kit = createSceneKit(), root = new Group(), life = buildLocalLife(kit, root, 'camp');
    const player = COURTYARD.camp.anchors.start;
    const poses = () => root.children.map(actor => actor.position.toArray());
    try {
        life.animate(player, 0, false, () => true);
        const initial = poses();
        for (let now = 80; now < 8000; now += 80) life.animate(player, now, false, () => true);
        assert.notDeepEqual(poses(), initial);
        const moved = poses();
        for (let now = 8000; now < 11000; now += 80) life.animate(player, now, false, () => false);
        assert.deepEqual(poses(), moved);
        life.animate(player, 11100, true, () => true);
        const reduced = poses();
        assert.equal(life.animate(player, 12000, true, () => true), false);
        assert.deepEqual(poses(), reduced);
        life.animate(player, 900000, false, () => true);
        poses().forEach((position, i) => assert.ok(Math.hypot(position[0] - reduced[i][0], position[2] - reduced[i][2]) < .1));
    } finally { life.dispose(); kit.dispose(); }
});

// Shared primitive mutation broke the next scenery build; owned GPU buffers/materials must all be released.
test('resident batching leaves shared geometry untouched and releases every owned resource', () => {
    const kit = createSceneKit(), root = new Group();
    const source = Object.values(kit.geometries).map(geometry => ({ geometry, attributes: Object.keys(geometry.attributes), positions: geometry.getAttribute('position').array.slice() }));
    const life = buildLocalLife(kit, root, 'camp'), resources = new Set(), disposed = new Set();
    root.traverse(object => { if (object instanceof Mesh) { resources.add(object.geometry); resources.add(object.material); assert.equal(object.castShadow, false); } });
    for (const resource of resources) resource.addEventListener('dispose', () => disposed.add(resource));
    life.dispose();
    assert.equal(root.children.length, 0); assert.deepEqual(disposed, resources);
    for (const item of source) {
        assert.deepEqual(Object.keys(item.geometry.attributes), item.attributes);
        assert.deepEqual(item.geometry.getAttribute('position').array, item.positions);
    }
    kit.dispose();
});
