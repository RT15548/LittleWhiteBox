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
    return group;
}
