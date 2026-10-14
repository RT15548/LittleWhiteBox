import assert from 'node:assert/strict';
import test from 'node:test';
import * as T from 'three';
import { PERSON_IDS } from '../apps/game/island/model.ts';
import { survivor } from '../apps/game/island/presentation/survivor.ts';
import { disposeGroup } from '../apps/game/island/presentation/meshes.ts';

// Real geometry protects contact/attachment contracts; types and domain tests cannot see clipping.
test('living poses stay grounded and lower the body without moving its world anchor', () => {
    for (const id of PERSON_IDS.filter(person => person !== 'ye')) {
        const person = survivor(id, ['shirt', 'trousers', 'shoes', 'lifejacket'], false);
        person.pose(0, false, null);
        const standing = person.headAnchor.getWorldPosition(new T.Vector3()).y;
        for (const activity of [null, 'rest', 'work', 'construct', 'take', 'offer', 'drag']) {
            for (const moving of [false, true]) for (const phase of [0, .7, 1.6, 3.4, 5.5]) {
                person.pose(phase, moving, activity);
                const box = new T.Box3().setFromObject(person.root, true);
                assert.ok(box.min.y >= -.005 && box.min.y < .03, `${id}/${activity}/${moving}: ${box.min.y}`);
                if (activity === 'rest' && !moving) {
                    assert.ok(person.headAnchor.getWorldPosition(new T.Vector3()).y < standing * .65);
                }
            }
        }
        person.root.position.set(17, 3, -29); person.root.rotation.y = .8;
        for (const activity of ['rest', 'work', 'construct', 'offer']) {
            person.pose(2, false, activity);
            assert.deepEqual(person.root.position.toArray(), [17, 3, -29]);
            assert.equal(person.root.rotation.y, .8);
        }
        disposeGroup(person.root);
    }
});

test('a body remains prone, including its hair and clothes, during movement replay or a stale activity', () => {
    for (const id of PERSON_IDS.filter(person => person !== 'ye')) {
        const body = survivor(id, ['shirt', 'trousers', 'lifejacket'], true);
        body.pose(0, false, null);
        const initial = new T.Box3().setFromObject(body.root, true), size = initial.getSize(new T.Vector3());
        assert.ok(initial.min.y >= -.005 && initial.min.y < .04, `${id}: ${initial.min.y}`);
        assert.ok(size.y < .5 && size.z > 1.5 && size.x < .85);
        body.pose(5, true, 'rest');
        assert.deepEqual(new T.Box3().setFromObject(body.root, true), initial);
        assert.ok(body.headAnchor.getWorldPosition(new T.Vector3()).y < .5);
        disposeGroup(body.root);
    }
});

test('the offered object follows the hand and wet clothing changes only its own wearer', () => {
    const a = survivor('lin', ['shirt', 'trousers'], false), b = survivor('lin', ['shirt', 'trousers'], false);
    const appearance = person => {
        const colors = []; person.root.traverse(o => { if (o.isMesh) colors.push([o.material.color.getHex(), o.material.roughness]); }); return colors;
    };
    const dry = appearance(a), other = appearance(b);
    a.wetness([{ kind: 'shirt', wetness: 1 }]);
    assert.notDeepEqual(appearance(a), dry); assert.deepEqual(appearance(b), other);
    a.wetness([{ kind: 'shirt', wetness: 0 }]); assert.deepEqual(appearance(a), dry);
    a.pose(0, false, null); const idleHand = a.hand.getWorldPosition(new T.Vector3());
    a.pose(0, false, 'offer'); const heldAt = a.hand.getWorldPosition(new T.Vector3());
    assert.ok(heldAt.distanceTo(idleHand) > .3);
    assert.ok(heldAt.y > .8 && heldAt.y < 1.4);
    let gap = Infinity;
    a.root.traverse(o => {
        if (!o.isMesh) return;
        const vertices = o.geometry.getAttribute('position'), point = new T.Vector3();
        for (let i = 0; i < vertices.count; i++) {
            point.fromBufferAttribute(vertices, i).applyMatrix4(o.matrixWorld); gap = Math.min(gap, point.distanceTo(heldAt));
        }
    });
    assert.ok(gap < .06);
    a.root.position.set(3, 7, -9); a.root.rotation.y = Math.PI / 2; a.pose(0, false, 'offer');
    assert.ok(a.hand.getWorldPosition(new T.Vector3()).distanceTo(heldAt.clone().applyMatrix4(a.root.matrixWorld)) < 1e-6);
    disposeGroup(a.root); disposeGroup(b.root);
});
