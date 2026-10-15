import type { Group } from 'three';
import type { SceneKit } from '../scene-kit.js';
import type { LandscapeFeature } from '../world/landscape.js';
import { LAND } from './world-palette.js';

/** Domestic furniture uses the authored solid footprint; small belongings stay on its surfaces. */
export function roomFurniture(k: SceneKit, root: Group, item: LandscapeFeature) {
    const { width: w, depth: d } = item.footprint;
    const fabric = item.tint === 'rose' ? LAND.rose : item.tint === 'amber' ? LAND.amber : LAND.leafLight;
    const legs = (height: number) => {
        for (const x of [-1, 1]) { for (const z of [-1, 1]) {
            k.mesh(root, 'box', LAND.timber, [.16, height, .16], [x * (w / 2 - .3), height / 2, z * (d / 2 - .3)]);
        } }
    };
    switch (item.kind) {
        case 'bed':
            legs(.65);
            k.mesh(root, 'box', LAND.wood, [w - .25, .3, d - .25], [0, .65, 0]);
            k.mesh(root, 'box', LAND.light, [w - .5, .25, d - .5], [0, .91, 0]);
            k.mesh(root, 'box', fabric, [w - .42, .1, d * .6], [0, 1.08, d * .13]);
            k.mesh(root, 'box', LAND.cloth, [w - .7, .12, .35], [0, 1.15, -d * .15]);
            k.mesh(root, 'box', LAND.light, [w - 1, .25, 1], [0, 1.15, -d / 2 + 1]);
            k.mesh(root, 'box', LAND.timber, [w - .1, 1.5, .17], [0, .9, -d / 2 + .12]);
            for (const x of [-1, 1]) { k.mesh(root, 'cylinder', LAND.brass, [.07, 1.35, .07], [x * (w / 2 - .23), .9, -d / 2 + .22]); }
            k.mesh(root, 'box', fabric, [1, .018, d - .8], [w / 2 + .65, .015, 0]).castShadow = false;
            for (const z of [-1, 1]) { k.mesh(root, 'box', LAND.cloth, [.95, .021, .1], [w / 2 + .65, .02, z * (d / 2 - .65)]).castShadow = false; }
            break;
        case 'wardrobe': {
            const h = 2.9;
            k.mesh(root, 'box', LAND.timber, [w - .15, h, d - .15], [0, h / 2, 0]);
            for (const side of [-1, 1]) {
                k.mesh(root, 'box', LAND.wood, [w / 2 - .18, h - .35, .14], [side * w / 4, h / 2, d / 2]);
                k.mesh(root, 'box', LAND.cloth, [w / 2 - .5, h - .8, .025], [side * w / 4, h / 2 + .06, d / 2 + .09]);
                k.mesh(root, 'box', LAND.brass, [.045, .27, .08], [side * .2, 1.4, d / 2 + .14]);
            }
            k.mesh(root, 'box', LAND.wood, [w + .1, .16, d + .15], [0, h, 0]);
            k.mesh(root, 'box', fabric, [w * .4, .17, d * .65], [-w * .23, h + .16, 0]);
            break;
        }
        case 'toolrack':
            for (const x of [-1, 1]) { k.mesh(root, 'box', LAND.timber, [.17, 2.8, d], [x * (w / 2 - .2), 1.4, 0]); }
            for (const y of [.3, 1.4, 2.5]) {
                k.mesh(root, 'box', LAND.wood, [w, .15, d], [0, y, 0]);
                for (let i = 0; i < 4; i++) { k.mesh(root, 'cylinder', LAND.brass, [.12, d * .8, .12], [-w * .3 + i * .6, y + .21, 0]).rotation.x = Math.PI / 2; }
                k.mesh(root, 'box', LAND.shadow, [.2, .25, .7], [w * .32, y + .2, 0]);
            }
            break;
        case 'cabinet': {
            const h = item.height ?? 2.5;
            k.mesh(root, 'box', LAND.timber, [w - .2, h, d - .2], [0, h / 2, 0]);
            for (let x = -w / 2 + .55; x < w / 2 - .2; x += 1) {
                for (let y = .5; y < h - .1; y += .8) {
                    k.mesh(root, 'box', LAND.wood, [.88, .68, .12], [x, y, d / 2 - .04]);
                    k.mesh(root, 'sphere', LAND.brass, [.055, .055, .06], [x, y, d / 2 + .03]);
                }
            }
            k.mesh(root, 'box', LAND.cloth, [w * .45, .13, d * .66], [-w * .2, h + .075, 0]);
            for (let i = 0; i < 3; i++) { k.mesh(root, 'cylinder', i % 2 ? LAND.pottery : LAND.light, [.15, .32 + i * .1, .15], [w * .15 + i * .4, h + .2, 0]); }
            break;
        }
        case 'table': case 'workbench':
            legs(1.2);
            k.mesh(root, 'box', LAND.wood, [w, .18, d], [0, 1.28, 0]);
            k.mesh(root, 'box', LAND.timber, [w - .5, .15, .15], [0, .4, 0]);
            if (item.kind === 'workbench') {
                for (let i = 0; i < 3; i++) { k.mesh(root, 'cylinder', LAND.brass, [.15, 1, .15], [(i - 1) * .7, 1.55, 0]).rotation.x = Math.PI / 2; }
                k.mesh(root, 'box', LAND.shadow, [.1, .08, 1], [w * .3, 1.42, 0]).rotation.y = .5;
            } else {
                k.mesh(root, 'box', LAND.light, [1, .08, .7], [-w * .24, 1.42, 0]).rotation.y = -.12;
                k.mesh(root, 'cylinder', LAND.pottery, [.28, .45, .28], [w * .2, 1.6, 0]);
                for (const z of [-.45, .45]) { k.mesh(root, 'cylinder', LAND.light, [.13, .19, .13], [w * .2 + .65, 1.48, z]); }
                k.mesh(root, 'cylinder', LAND.brass, [.15, .13, .15], [-w * .32, 1.43, -d * .3]);
                k.mesh(root, 'cylinder', LAND.light, [.07, .32, .07], [-w * .32, 1.65, -d * .3]);
                k.mesh(root, 'rock', LAND.ember, [.055, .14, .055], [-w * .32, 1.92, -d * .3], true);
            }
            break;
        case 'chair':
            legs(.7);
            k.mesh(root, 'box', LAND.wood, [w - .25, .18, d - .25], [0, .78, 0]);
            for (const x of [-1, 1]) { k.mesh(root, 'box', LAND.timber, [.14, 1.5, .14], [x * (w / 2 - .3), .78, d / 2 - .3]); }
            k.mesh(root, 'box', LAND.wood, [w - .45, .4, .13], [0, 1.35, d / 2 - .3]);
            break;
        case 'basin':
            legs(.9);
            k.mesh(root, 'box', LAND.wood, [w - .2, .15, d - .2], [0, .95, 0]);
            k.mesh(root, 'cylinder', LAND.light, [.65, .22, .65], [0, 1.12, 0]);
            k.mesh(root, 'cylinder', LAND.water, [.54, .025, .54], [0, 1.24, 0]);
            k.mesh(root, 'box', LAND.cloth, [.35, .07, d * .8], [w / 2 - .25, 1.06, 0]);
            break;
        case 'screen': {
            const alongX = w > d, length = Math.max(w, d), panel = k.group(root);
            if (!alongX) { panel.rotation.y = Math.PI / 2; }
            for (let x = -length / 2 + .15; x < length / 2; x += 1.4) {
                k.mesh(panel, 'box', LAND.timber, [.09, 2.8, .12], [x, 1.4, 0]);
                k.mesh(panel, 'box', LAND.cloth, [Math.min(1.27, length / 2 - x), 2.15, .055], [x + Math.min(.68, (length / 2 - x) / 2), 1.53, 0]);
            }
            for (const x of [-1, 1]) { k.mesh(panel, 'box', LAND.timber, [.3, .18, .8], [x * (length / 2 - .25), .09, 0]); }
            break;
        }
    }
}

export function roomWall(k: SceneKit, base: Group, upper: Group, item: LandscapeFeature) {
    const { width: w, depth: d } = item.footprint, h = item.height!;
    k.mesh(base, 'box', LAND.slate, [w, .3, d], [0, .15, 0]);
    k.mesh(upper, 'box', LAND.light, [w, h - .3, d], [0, (h + .3) / 2, 0]);
    for (const y of [.5, h - .1]) { k.mesh(upper, 'box', LAND.wood, [w + .04, .16, d + .04], [0, y, 0]); }
    const alongX = w > d, length = Math.max(w, d);
    for (let offset = -length / 2 + .3; offset < length / 2; offset += 3.5) {
        k.mesh(upper, 'box', LAND.wood, [alongX ? .12 : w + .04, h, alongX ? d + .04 : .12], [alongX ? offset : 0, h / 2, alongX ? 0 : offset]);
    }
    if (item.id === 'west-wall') {
        const window = k.group(upper, [w / 2 + .04, 2.35, 0]); window.rotation.y = Math.PI / 2;
        k.mesh(window, 'box', LAND.timber, [2.2, 1.7, .12]);
        k.mesh(window, 'box', LAND.window, [1.95, 1.45, .14], [0, 0, .08]);
        for (const x of [-1, 1]) {
            k.mesh(window, 'box', LAND.cloth, [.75, 1.75, .12], [x * .73, -.07, .21]);
            k.mesh(window, 'box', LAND.brass, [.78, .06, .03], [x * .73, -.23, .29]);
        }
        k.mesh(window, 'box', LAND.timber, [.07, 1.5, .16], [0, 0, .16]);
        k.mesh(window, 'box', LAND.wood, [2.5, .13, .6], [0, -.85, .24]);
    }
}

export function roomDoor(k: SceneKit, root: Group) {
    for (const side of [-1, 1]) { k.mesh(root, 'box', LAND.timber, [.22, 3.6, .4], [side * 1.9, 1.8, 0]); }
    k.mesh(root, 'box', LAND.wood, [4, .22, .45], [0, 3.65, 0]);
    k.mesh(root, 'box', LAND.wood, [3.5, 3.35, .16], [0, 1.7, 0]);
    for (const y of [.5, 2.8]) { k.mesh(root, 'box', LAND.timber, [3.5, .13, .2], [0, y, 0]); }
    for (const side of [-1, 1]) { k.mesh(root, 'sphere', LAND.brass, [.09, .09, .09], [1.25, 1.45, side * .16]); }
}
