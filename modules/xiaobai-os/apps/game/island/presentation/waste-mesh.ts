import * as T from 'three';
import type { observe } from '../scene.js';
import { mesh } from './meshes.js';

// Small ground traces, never a bodily animation or an owner/time label.
export function wasteMesh(waste: ReturnType<typeof observe>['waste'][number]) {
    const group = new T.Group(), covered = waste.kind === 'disturbed_ground', liquid = waste.kind === 'urine';
    const patch = mesh(new T.SphereGeometry(1, 12, 6), covered ? '#ac9670' : liquid ? '#baae85' : '#796448', group, 0, .012);
    patch.scale.set(covered ? .32 : .2, covered ? .075 : liquid ? .01 : .035, covered ? .24 : .16);
    patch.castShadow = !liquid;
    if (covered) {
        for (let i = 0; i < 5; i++) {
            const clod = mesh(new T.DodecahedronGeometry(.045), '#c5b08c', group, Math.cos(i * 2.4) * .26, .015, Math.sin(i * 2.4) * .19);
            clod.scale.y = .5;
        }
    }
    if (waste.faded) { group.scale.set(.65, .4, .65); }
    return group;
}

export function graveMesh() {
    const group = new T.Group();
    const mound = mesh(new T.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), '#af9877', group);
    mound.scale.set(.55, .28, 1.05);
    for (let i = 0; i < 12; i++) {
        const angle = i * 2.4, radius = .6 + i % 3 * .12;
        const clod = mesh(new T.DodecahedronGeometry(.065), '#c3ad89', group, Math.cos(angle) * .55 * radius, .05, Math.sin(angle) * 1.1 * radius);
        clod.scale.y = .55;
    }
    return group;
}
