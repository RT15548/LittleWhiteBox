import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Group, Vector3 } from 'three';
import { createMascot } from '../brand/mascot/model.ts';
import { dressMascot } from '../brand/mascot/outfit-model.ts';
import { createMascotPerformer, createMascotPoses } from '../brand/mascot/performance.ts';
import { BUILDER_OUTFIT } from '../apps/game/building/outfit.ts';
import { MOVER_OUTFIT } from '../apps/game/moving/outfit.ts';
import { createToyKit } from '../apps/game/moving/scene/toy-kit.ts';

test('work clothes preserve the base mascot and foot placement, follow poses, and use scene-owned resources', () => {
    for (const outfit of [BUILDER_OUTFIT, MOVER_OUTFIT]) {
        const kit = createToyKit(), mascot = createMascot(kit, new Group(), [0, 0, 0]);
        const foot = new Box3().setFromObject(mascot).min.y;
        const base = [...mascot.children], transforms = base.map(o => o.matrix.toArray());
        dressMascot(kit, mascot, outfit);
        const clothes = mascot.children.filter(o => !base.includes(o));
        assert.ok(clothes.length > 0);
        assert.ok(Math.abs(new Box3().setFromObject(mascot).min.y - foot) < 1e-6);
        assert.deepEqual(base.map(o => o.matrix.toArray()), transforms);
        const local = clothes.map(o => o.position.toArray());
        const poses = createMascotPoses(mascot), anchor = new Vector3(2, 1, .3);
        for (const pose of ['reading', 'sleeping', 'sipping']) {
            poses.pose(pose, anchor, 250);
            for (const piece of clothes) {
                assert.equal(piece.parent, mascot);
                assert.ok(piece.getWorldPosition(new Vector3()).distanceTo(mascot.localToWorld(piece.position.clone())) < 1e-6);
            }
        }
        const parcel = new Group(); mascot.add(parcel);
        const performer = createMascotPerformer(mascot, anchor);
        performer.carry(.5, 5, parcel); assert.equal(parcel.visible, true);
        performer.rest(parcel); assert.equal(parcel.visible, false);
        assert.deepEqual(clothes.map(o => o.position.toArray()), local);
        const resources = new Set(clothes.flatMap(o => [o.geometry, o.material]));
        let disposed = 0;
        for (const resource of resources) { resource.addEventListener('dispose', () => disposed++); }
        kit.dispose(); assert.equal(disposed, resources.size);
    }
});
