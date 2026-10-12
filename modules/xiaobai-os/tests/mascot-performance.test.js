import test from 'node:test';
import assert from 'node:assert/strict';
import { Group, Vector3 } from 'three';
import { createMascotPerformer, createMascotPoses } from '../brand/mascot/performance.ts';
import { createMascotReactions } from '../brand/mascot/reactions.ts';

test('Xiaobai pauses, runs with a box, then returns to the same resting pose', () => {
    const mascot = new Group();
    const carried = new Group();
    const home = new Vector3(-3.05, .52, 3.55);
    mascot.position.copy(home);
    const performer = createMascotPerformer(mascot, home);

    performer.carry(0, 3.6, carried);
    assert.equal(carried.visible, false);
    assert.equal(mascot.position.x, home.x);

    performer.carry(.3, 3.6, carried);
    assert.equal(carried.visible, true);
    assert.ok(mascot.position.x > home.x);
    assert.ok(mascot.position.y > home.y);

    performer.carry(1, 3.6, carried);
    assert.equal(carried.visible, false);
    performer.rest(carried);
    assert.deepEqual(mascot.position.toArray(), home.toArray());
    assert.equal(mascot.rotation.y, 0);
});

test('Xiaobai reactions keep their stage position and return to the original scale without accumulating transforms', () => {
    const mascot = new Group(); mascot.position.set(-1, 0.5, 0); mascot.scale.setScalar(1.12);
    const home = mascot.position.clone(), size = mascot.scale.clone(), performer = createMascotReactions(mascot);
    for (const mood of ['careful', 'sad', 'happy', 'watch']) {
        performer.pose(mood, 0.25, 0.2);
        const first = [mascot.position.toArray(), mascot.scale.toArray(), mascot.rotation.toArray()];
        performer.pose(mood, 0.25, 0.2);
        assert.deepEqual([mascot.position.toArray(), mascot.scale.toArray(), mascot.rotation.toArray()], first);
        assert.equal(mascot.position.x, home.x);
        performer.rest();
        assert.deepEqual(mascot.position.toArray(), home.toArray()); assert.deepEqual(mascot.scale.toArray(), size.toArray());
        assert.deepEqual(mascot.rotation.toArray(), [0, 0, 0, 'XYZ']);
    }
});

test('living postures do not accumulate transforms or change Xiaobai proportions, and reduced motion is static', () => {
    const mascot = new Group(), anchor = new Vector3(2, 1, .3), poses = createMascotPoses(mascot);
    mascot.scale.setScalar(.57); const size = mascot.scale.clone(), rotations = new Set();
    for (const posture of ['reading', 'reclining', 'sleeping', 'sipping', 'looking']) {
        poses.pose(posture, anchor, 100, true); const first = [mascot.position.toArray(), mascot.rotation.toArray()];
        poses.pose(posture, anchor, 2000, true);
        assert.deepEqual([mascot.position.toArray(), mascot.rotation.toArray()], first);
        assert.deepEqual(mascot.scale, size); rotations.add(JSON.stringify(mascot.rotation.toArray()));
    }
    assert.equal(rotations.size, 5); poses.reset(); assert.deepEqual(mascot.rotation.toArray(), [0, 0, 0, 'XYZ']);
});
