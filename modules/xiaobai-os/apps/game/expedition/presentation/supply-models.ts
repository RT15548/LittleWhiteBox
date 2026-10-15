import type { Group } from 'three';
import type { SceneKit } from '../scene-kit.js';
import type { LandscapeFeature } from '../world/landscape.js';
import { LAND } from './world-palette.js';

/** Occupied floor area is the same authored solid as the crates, desks and beds. */
export function supplyFurniture(k: SceneKit, root: Group, feature: LandscapeFeature) {
    const { width: w, depth: d } = feature.footprint;
    if (feature.kind === 'ledger') {
        k.mesh(root, 'box', LAND.wood, [w, .18, d], [0, 1.18, 0]);
        for (const x of [-1, 1]) { k.mesh(root, 'box', LAND.timber, [.25, 1.1, d - .4], [x * (w / 2 - .3), .55, 0]); }
        for (let i = -1; i <= 1; i++) {
            k.mesh(root, 'box', LAND.slate, [.85, .17, 1.1], [i * 1.2, 1.35, -.3]);
            k.mesh(root, 'box', LAND.light, [.77, .025, .98], [i * 1.2, 1.45, -.3]);
            k.mesh(root, 'box', LAND.brass, [.08, .025, 1.13], [i * 1.2, 1.48, -.3]);
        }
        k.mesh(root, 'cylinder', LAND.brass, [.18, .25, .18], [w * .28, 1.4, d * .28]);
        k.mesh(root, 'box', LAND.light, [1.1, .024, .65], [-w * .2, 1.3, d * .28]);
        return;
    }
    k.mesh(root, 'box', LAND.timber, [w, .16, d], [0, .08, 0]);
    const rows = Math.max(1, Math.floor(d / 2.2)), columns = Math.max(1, Math.floor(w / 1.8));
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const x = -w / 2 + (column + .5) * w / columns, z = -d / 2 + (row + .5) * d / rows;
            const width = w / columns - .22, depth = d / rows - .24;
            if (feature.kind === 'fuel') {
                for (let i = 0; i < 5; i++) {
                    k.mesh(root, 'box', i % 2 ? LAND.wood : LAND.timber, [width, .2, depth / 2 - .07], [x, .28 + i * .24, z + i % 2 * .12]);
                }
                k.mesh(root, 'box', LAND.cloth, [width + .08, .055, depth], [x, 1.42, z]);
            } else {
                const height = .85 + (row + column) % 3 * .22;
                k.mesh(root, 'box', LAND.wood, [width, height, depth], [x, .16 + height / 2, z]);
                for (const side of [-1, 1]) { k.mesh(root, 'box', LAND.timber, [.11, height + .04, depth + .05], [x + side * width * .32, .16 + height / 2, z]); }
                k.mesh(root, 'box', LAND.light, [.32, .4, .03], [x, .7, z + depth / 2 + .02]);
                k.mesh(root, 'box', LAND.rose, [.09, .09, .04], [x, .61, z + depth / 2 + .045]);
                for (let plank = -.25; plank <= .25; plank += .25) {
                    k.mesh(root, 'box', LAND.timber, [width, .015, .016], [x, height + .17, z + plank * depth]);
                }
                if ((row + column) % 3 === 0) {
                    k.mesh(root, 'box', LAND.cloth, [width * .75, .38, depth * .55], [x, height + .37, z - .18]);
                    k.mesh(root, 'box', LAND.timber, [.055, .4, depth * .57], [x, height + .37, z - .18]);
                }
                k.mesh(root, 'box', LAND.light, [.32, .018, .45], [x + width * .23, height + .19, z + depth * .25]);
            }
        }
    }
}

export function bunkBelongings(k: SceneKit, root: Group, width: number, depth: number) {
    for (let i = 0; i < 3; i++) { k.mesh(root, 'box', LAND.slate, [width * .65, .08, .7], [0, 2.19 + i * .08, depth * .22]); }
    k.mesh(root, 'box', LAND.rose, [width * .6, .03, .08], [0, 2.41, depth * .22 + .25]);
    k.mesh(root, 'cylinder', LAND.pottery, [.22, .15, .22], [width * .35, .17, depth * .35]);
    k.mesh(root, 'cylinder', LAND.shadow, [.18, .014, .18], [width * .35, .25, depth * .35]);
    for (const x of [-.17, .17]) { k.mesh(root, 'box', LAND.wood, [.23, .12, .44], [x, .08, -depth * .37]); }
    k.mesh(root, 'box', LAND.rose, [.42, .045, .3], [.3, .9, depth * .2]);
}
