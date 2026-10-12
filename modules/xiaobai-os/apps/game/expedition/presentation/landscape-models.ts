import type { Group } from 'three';
import type { SceneKit } from '../scene-kit.js';
import type { LandscapeFeature } from '../world/landscape.js';
import { LAND } from './world-palette.js';
import { cookstove, medicineBench, streetHouse, wallHomes } from './street-models.js';
import { bunkBelongings, supplyFurniture } from './supply-models.js';
import { roomDoor, roomFurniture, roomWall } from './room-models.js';

export function lamp(k: SceneKit, root: Group, x: number, z: number, height = 2.8) {
    k.mesh(root, 'cylinder', LAND.shadow, [.055, height, .055], [x, height / 2, z]);
    k.mesh(root, 'box', LAND.brass, [.4, .08, .4], [x, height, z]);
    k.mesh(root, 'box', LAND.ember, [.22, .38, .22], [x, height + .21, z], true);
    k.mesh(root, 'cone', LAND.shadow, [.32, .24, .32], [x, height + .51, z]);
    for (const side of [-1, 1]) { k.mesh(root, 'box', LAND.shadow, [.035, .4, .035], [x + side * .14, height + .2, z + .14]); }
}

function roof(k: SceneKit, root: Group, width: number, depth: number, eave: number, rise: number) {
    const half = width / 2 + .45, slope = Math.atan2(rise, half), length = Math.hypot(half, rise);
    for (const side of [-1, 1]) {
        const wing = k.group(root, [side * half / 2, eave + rise / 2, 0]); wing.rotation.z = -side * slope;
        k.mesh(wing, 'box', LAND.roof, [length + .2, .18, depth + 1.1]);
        for (let i = 0; i < Math.ceil(length / .65); i++) {
            k.mesh(wing, 'box', i % 3 ? LAND.roof : LAND.roofLight, [.14, .07, depth + 1.15], [-length / 2 + i * .65, .13, 0]);
        }
        k.mesh(wing, 'box', LAND.shadow, [.2, .24, depth + 1.25], [side * length / 2, -.05, 0]);
    }
    k.mesh(root, 'box', LAND.brass, [.24, .23, depth + 1.4], [0, eave + rise + .14, 0]);
    for (const z of [-depth / 2 - .08, depth / 2 + .08]) {
        k.shape(root, [[-width / 2, 0], [width / 2, 0], [0, rise]], LAND.light, [0, eave, z], .08);
        k.mesh(root, 'box', LAND.timber, [.15, rise, .18], [0, eave + rise / 2, z + .12]);
    }
}

function windowFrame(k: SceneKit, root: Group, x: number, z: number, y: number, width = 1.1) {
    k.mesh(root, 'box', LAND.shadow, [width, 1.45, .12], [x, y, z]);
    k.mesh(root, 'box', LAND.window, [width - .18, 1.25, .14], [x, y, z + .07]);
    for (const side of [-1, 1]) {
        k.mesh(root, 'box', LAND.wood, [.13, 1.6, .2], [x + side * width / 2, y, z + .12]);
        k.mesh(root, 'box', LAND.light, [width + .28, .14, .26], [x, y + side * .8, z + .12]);
    }
    k.mesh(root, 'box', LAND.timber, [.07, 1.3, .16], [x, y, z + .16]);
    k.mesh(root, 'box', LAND.timber, [width, .06, .16], [x, y, z + .16]);
}

function house(k: SceneKit, root: Group, item: LandscapeFeature) {
    const { width: w, depth: d } = item.footprint, clinic = item.kind === 'clinic', wallHeight = clinic ? 3.7 : 5;
    k.mesh(root, 'box', LAND.stone, [w - .3, wallHeight, d - .3], [0, wallHeight / 2, 0]);
    k.mesh(root, 'box', LAND.light, [w - .4, wallHeight - 1, d - .1], [0, wallHeight / 2 + .4, 0]);
    for (const x of [-w / 2 + .15, w / 2 - .15]) {for (const z of [-d / 2 + .15, d / 2 - .15]) {
        k.mesh(root, 'box', LAND.timber, [.27, wallHeight, .27], [x, wallHeight / 2, z]);
    }}
    for (const y of [.8, wallHeight - .25]) { k.mesh(root, 'box', LAND.timber, [w, .18, d], [0, y, 0]); }
    for (const x of [-w * .29, w * .29]) { windowFrame(k, root, x, d / 2, 2.3, clinic ? 1.6 : 1.2); }
    const sideWindows = k.group(root, [w / 2, 0, 0]); sideWindows.rotation.y = Math.PI / 2;
    for (const x of [-d * .27, d * .27]) { windowFrame(k, sideWindows, x, .03, 2.3); }
    k.mesh(root, 'box', LAND.shadow, [1.9, 2.65, .13], [0, 1.35, d / 2]);
    for (const side of [-1, 1]) { k.mesh(root, 'box', LAND.wood, [.85, 2.5, .12], [side * .46, 1.3, d / 2 + .08]); }
    k.mesh(root, 'sphere', LAND.brass, [.07, .07, .05], [.23, 1.15, d / 2 + .19]);
    roof(k, root, w, d, wallHeight, clinic ? 1.15 : 3.2);
    const chimney = k.group(root, [-w * .27, wallHeight, -d * .18]);
    const chimneyHeight = clinic ? 2.1 : 3.3;
    k.mesh(chimney, 'box', LAND.stone, [1.1, chimneyHeight, 1.2], [0, chimneyHeight / 2, 0]);
    k.mesh(chimney, 'box', LAND.light, [1.4, .3, 1.5], [0, chimneyHeight - .2, 0]);
    k.mesh(chimney, 'box', LAND.shadow, [.85, .04, .95], [0, chimneyHeight - .03, 0]);
    if (clinic) {
        // A folded canvas shade and pharmacy sign identify a working clinic without a floating label.
        const shade = k.group(root, [0, 2.9, d / 2 + 1]); shade.rotation.x = .19;
        for (let i = -6; i <= 6; i++) { k.mesh(shade, 'box', i % 3 ? LAND.cloth : LAND.light, [.74, .04, 2.3], [i * .75, 0, 0]); }
        // Brackets attach to the facade; no invisible posts across the clinic approach.
        for (const side of [-1, 1]) { k.mesh(root, 'box', LAND.timber, [.09, .12, 2.1], [side * 4.5, 2.6, d / 2 + .95]); }
        k.mesh(shade, 'box', LAND.rose, [1, .014, .65], [-2.2, .034, .3]);
        for (let i = -3; i <= 3; i++) {
            k.mesh(root, 'box', LAND.timber, [.025, .35, .025], [i * .45 - 3, 2.5, d / 2 + .16]);
            k.mesh(root, 'cone', LAND.leaf, [.17, .6, .15], [i * .45 - 3, 2.05, d / 2 + .16]);
        }
        for (const x of [-w * .29, w * .29]) { k.mesh(root, 'box', LAND.ember, [1.35, 1.15, .015], [x, 2.3, d / 2 + .151], true); }
        k.mesh(root, 'box', LAND.slate, [.9, 1.2, .14], [2.8, 2.8, d / 2 + .25]);
        k.mesh(root, 'cylinder', LAND.brass, [.21, .47, .06], [2.8, 2.75, d / 2 + .36]);
        k.mesh(root, 'box', LAND.brass, [.18, .16, .1], [2.8, 3.08, d / 2 + .36]);
    } else {
        windowFrame(k, root, 0, d / 2 + .09, wallHeight + 1, .9);
        k.mesh(root, 'box', LAND.timber, [w + .4, .26, .24], [0, 3.5, d / 2 + .25]);
    }
}

function tree(k: SceneKit, root: Group, item: LandscapeFeature) {
    const h = item.height!, w = item.footprint.width, warm = item.tint === 'amber', rose = item.tint === 'rose';
    const c = warm ? LAND.amber : rose ? LAND.rose : LAND.leaf, light = warm ? LAND.amberLight : rose ? '#dfb2a1' : LAND.leafLight;
    const trunk = k.mesh(root, 'cylinder', LAND.timber, [.24, h * .67, .28], [0, h * .33, 0]); trunk.rotation.z = .06;
    for (let i = 0; i < 3; i++) {
        const arm = k.group(root, [0, h * .39, 0]); arm.rotation.set(.4 * Math.sin(i * 2), 0, (i - 1) * .65);
        k.mesh(arm, 'cylinder', LAND.timber, [.095, h * .32, .095], [0, h * .16, 0]);
    }
    for (let i = 0; i < 9; i++) {
        const t = i * 2.4, reach = i === 8 ? .1 : w * .56;
        const crown = k.mesh(root, 'crown', i % 3 ? c : light, [w * .49 + .4, h * .16, w * .45 + .4],
            [Math.sin(t) * reach, h * (.68 + (i % 3) * .11), Math.cos(t) * reach]);
        crown.rotation.set(i * .37, i * .61, .14);
        crown.receiveShadow = false;
    }
}

function tower(k: SceneKit, root: Group, item: LandscapeFeature) {
    const { width: w, depth: d } = item.footprint, h = item.height!;
    k.mesh(root, 'box', LAND.stone, [w, h, d], [0, h / 2, 0]);
    for (const y of [1, h * .55, h - .6]) { k.mesh(root, 'box', LAND.light, [w + .25, .3, d + .25], [0, y, 0]); }
    for (const x of [-w / 2 + .3, w / 2 - .3]) { k.mesh(root, 'box', LAND.mortar, [.55, h - 1, d + .15], [x, h / 2, 0]); }
    for (const y of [h * .35, h * .7]) { windowFrame(k, root, 0, d / 2 + .02, y, .7); }
    roof(k, root, w + .35, d + .35, h, h * .32);
    k.mesh(root, 'cylinder', LAND.brass, [.055, 2.7, .055], [0, h * 1.32 + 1.2, 0]);
    k.shape(root, [[0, 0], [1.6, -.3], [1.2, -.75], [0, -.95]], LAND.cloth, [.05, h * 1.32 + 2.4, 0]);
}

export function landscapeFeature(k: SceneKit, ground: Group, upper: Group, item: LandscapeFeature, interior: boolean) {
    const f = item.footprint, base = k.group(ground, [f.x, 0, f.z]), model = k.group(upper, [f.x, 0, f.z]);
    switch (item.kind) {
        case 'door': roomDoor(k, model); break;
        case 'screen': roomFurniture(k, model, item); break;
        case 'bed': case 'cabinet': case 'wardrobe': case 'toolrack': case 'table': case 'chair': case 'basin': case 'workbench':
            roomFurniture(k, base, item); break;
        case 'dwelling': case 'workshop': streetHouse(k, base, model, item); break;
        case 'stove': cookstove(k, base); break;
        case 'medicine': medicineBench(k, base, f.width, f.depth); break;
        case 'cargo': case 'fuel': case 'ledger': supplyFurniture(k, base, item); break;
        case 'clinic': case 'storehouse':
            k.mesh(base, 'box', LAND.mortar, [f.width, .3, f.depth], [0, .15, 0]); house(k, model, item); break;
        case 'tree':
            k.mesh(base, 'box', LAND.soil, [f.width, .18, f.depth], [0, .08, 0]);
            for (let i = 0; i < 7; i++) { const t = i * .9; k.mesh(base, 'rock', LAND.grassDark, [.7, .3, .5], [Math.sin(t) * f.width * .33, .2, Math.cos(t) * f.depth * .33]); }
            tree(k, model, item); break;
        case 'tower': tower(k, model, item); break;
        case 'column': {
            const h = item.height!, r = Math.min(f.width, f.depth) * .3;
            k.mesh(base, 'box', LAND.mortar, [f.width, .35, f.depth], [0, .17, 0]);
            k.mesh(base, 'box', LAND.light, [f.width * .84, .35, f.depth * .84], [0, .5, 0]);
            k.mesh(model, 'cylinder', LAND.stone, [r, h - 1.1, r], [0, h / 2, 0]);
            for (let i = 0; i < 10; i++) {
                const t = i * Math.PI / 5;
                k.mesh(model, 'box', LAND.light, [.085, h - 2, .085], [Math.sin(t) * r, h / 2, Math.cos(t) * r]);
            }
            for (const y of [.85, h - .7]) { k.mesh(model, 'cylinder', LAND.brass, [r * 1.15, .18, r * 1.15], [0, y, 0]); }
            k.mesh(model, 'box', LAND.light, [f.width, .4, f.depth], [0, h - .3, 0]);
            k.mesh(model, 'box', LAND.slate, [f.width * .9, .3, f.depth * .9], [0, h, 0]);
            break;
        }
        case 'beacon': {
            k.mesh(base, 'box', LAND.mortar, [f.width, .28, f.depth], [0, .14, 0]);
            k.mesh(base, 'cylinder', LAND.stone, [2.5, .5, 2.5], [0, .5, 0]);
            k.mesh(model, 'cylinder', LAND.slate, [1.35, 3.9, 1.35], [0, 2.3, 0]);
            for (const y of [1.2, 3.5, 4.4]) { k.mesh(model, 'cylinder', LAND.brass, [1.55, .2, 1.55], [0, y, 0]); }
            k.mesh(model, 'cylinder', LAND.shadow, [2.2, .5, 2.2], [0, 4.8, 0]);
            k.mesh(model, 'torus', LAND.brass, [2.3, 2.3, 1.4], [0, 5.1, 0]).rotation.x = Math.PI / 2;
            for (let i = 0; i < 6; i++) {
                const t = i * Math.PI / 3, claw = k.group(model, [Math.sin(t) * 2.1, 4.8, Math.cos(t) * 2.1]);
                claw.rotation.y = t;
                k.shape(claw, [[-.12, 0], [.12, 0], [.2, 1.8], [0, 2.4], [-.2, 1.8]], LAND.brass, [0, 0, 0], .14);
            }
            break;
        }
        case 'bunk':
            bunkBelongings(k, base, f.width, f.depth);
            for (const y of [.55, 1.9]) {
                k.mesh(base, 'box', LAND.timber, [f.width - .5, .18, f.depth - .5], [0, y, 0]);
                k.mesh(base, 'box', LAND.cloth, [f.width - .8, .18, f.depth - .9], [0, y + .16, 0]);
                k.mesh(base, 'box', LAND.light, [f.width - 1, .24, 1.2], [0, y + .28, -f.depth / 2 + 1.3]);
            }
            for (const x of [-1, 1]) { for (const z of [-1, 1]) {
                k.mesh(base, 'box', LAND.shadow, [.12, 2.7, .12], [x * (f.width / 2 - .3), 1.35, z * (f.depth / 2 - .3)]);
            }}
            break;
        case 'root': {
            const h = item.height!, r = f.width * .23;
            k.mesh(base, 'rock', LAND.soil, [f.width * .5, .65, f.depth * .5], [0, .1, 0]);
            for (let i = 0; i < 5; i++) {
                const t = i * Math.PI * .4, reach = f.width * .25;
                const limb = k.group(model, [Math.sin(t) * r * .45, 0, Math.cos(t) * r * .45]); limb.rotation.y = t;
                const stem = k.mesh(limb, 'cylinder', i % 2 ? LAND.root : LAND.rootLight, [r * .65, h * .64, r * .49], [0, h * .3, 0]); stem.rotation.z = .13;
                const elbow = k.group(limb, [0, h * .48, 0]); elbow.rotation.z = .4 + i * .12;
                k.mesh(elbow, 'cone', LAND.root, [r * .47, h * .55, r * .4], [0, h * .25, 0]);
                const toe = k.mesh(limb, 'cone', LAND.root, [r * .5, reach * 1.4, r * .4], [reach * .6, .7, 0]); toe.rotation.z = -1.15;
            }
            if (h > 8) {
                k.mesh(model, 'rock', LAND.shadow, [r * .65, h * .22, .35], [0, h * .38, r * .65]);
                k.mesh(model, 'rock', LAND.brass, [r * .16, h * .16, .15], [0, h * .4, r * .68], true);
                for (let i = 0; i < 7; i++) {
                    k.mesh(model, 'crown', i % 2 ? LAND.leaf : LAND.leafLight, [1.4, .8, 1.2], [Math.sin(i * 2) * r, h * .55 + i * .4, Math.cos(i * 2) * r]);
                }
            }
            break;
        }
        case 'arch': {
            const h = item.height!;
            k.mesh(model, 'arch', LAND.light, [f.width / 2 - .4, 3.1, f.depth * .65], [0, h - 3, 0]);
            k.mesh(model, 'box', LAND.brass, [.8, 1.4, f.depth * .75], [0, h + .2, 0]);
            for (const side of [-1, 1]) {
                const banner = k.group(model, [side * (f.width / 2 - .5), h - 2.2, f.depth / 2 - .4]);
                k.mesh(banner, 'box', LAND.brass, [1.5, .08, .1]);
                k.shape(banner, [[-.6, 0], [.6, 0], [.6, -2.5], [0, -2.9], [-.6, -2.5]], LAND.slate, [0, -.05, .06]);
                k.mesh(banner, 'box', LAND.cloth, [.08, 1.9, .06], [0, -1.2, .14]);
            }
            break;
        }
        case 'wall': {
            if (item.wallUse === 'room') { roomWall(k, base, model, item); break; }
            const h = item.height!, plinth = Math.min(h, .65);
            if (item.wallUse === 'homes') { wallHomes(k, model, f); }
            k.mesh(base, 'box', LAND.mortar, [f.width, plinth, f.depth], [0, plinth / 2, 0]);
            // The cutaway leaves the plinth standing; its sides must not share the wall's surface.
            if (h > plinth) { k.mesh(model, 'box', interior ? LAND.marble : LAND.stone, [f.width, h - plinth, f.depth], [0, (h + plinth) / 2, 0]); }
            k.mesh(model, 'box', LAND.light, [f.width + .12, .23, f.depth + .12], [0, h, 0]);
            const alongX = f.width > f.depth, length = Math.max(f.width, f.depth);
            if (interior) {
                for (const y of [1.1, h - .55]) { k.mesh(model, 'box', LAND.light, [f.width + .15, .22, f.depth + .15], [0, y, 0]); }
                for (let offset = -length / 2 + 3; offset < length / 2 - 1; offset += 6) {
                    for (const side of [-1, 1]) {
                        const panel = k.group(model, [alongX ? offset : side * (f.width / 2 + .04), 0, alongX ? side * (f.depth / 2 + .04) : offset]);
                        panel.rotation.y = alongX ? (side < 0 ? Math.PI : 0) : side * Math.PI / 2;
                        const wy = h * .61, wh = Math.min(2.1, h * .3);
                        k.mesh(panel, 'box', LAND.undercroft, [1.5, wh, .05], [0, wy, 0]);
                        for (const x of [-.55, 0, .55]) { k.mesh(panel, 'box', LAND.shadow, [.07, wh, .06], [x, wy, .06]); }
                        for (const y of [-1, 1]) { k.mesh(panel, 'box', LAND.light, [1.9, .15, .2], [0, wy + y * wh / 2, .06]); }
                        k.mesh(panel, 'box', LAND.stone, [.45, h - 1, .32], [2.2, h / 2, 0]);
                    }
                }
                break;
            }
            for (let i = -length / 2 + 1; i < length / 2; i += 3.5) {
                if (h > 4) { k.mesh(model, 'box', LAND.stone, alongX ? [1.3, .85, f.depth] : [f.width, .85, 1.3], [alongX ? i : 0, h + .55, alongX ? 0 : i]); }
                for (let row = 0; row < Math.floor(h / .9); row++) {
                    k.mesh(model, 'box', LAND.mortar, alongX ? [.035, .6, .025] : [.025, .6, .035],
                        [alongX ? i + row % 2 * .7 : f.width / 2 + .01, .55 + row * .85, alongX ? f.depth / 2 + .01 : i + row % 2 * .7]);
                }
            }
            break;
        }
        case 'water':
            k.mesh(base, 'box', LAND.water, [f.width, .12, f.depth], [0, -.18, 0]);
            for (let i = 0; i < f.width * f.depth / 9; i++) {
                const x = Math.sin(i * 7.3) * (f.width / 2 - .8), z = Math.cos(i * 3.7) * (f.depth / 2 - .3);
                k.mesh(base, 'box', LAND.ripple, [.4 + i % 4 * .3, .012, .04], [x, -.11, z], true);
            }
            break;
        case 'planter':
            k.mesh(base, 'box', LAND.stone, [f.width, .55, f.depth], [0, .275, 0]);
            k.mesh(base, 'box', LAND.soil, [f.width - .35, .1, f.depth - .35], [0, .57, 0]);
            for (let x = -f.width / 2 + .65; x < f.width / 2; x += 1) {for (let z = -f.depth / 2 + .6; z < f.depth / 2; z += .95) {
                const variation = Math.sin(x * 7 + z * 19), spread = f.width > 8 ? .63 : .37;
                k.mesh(base, 'crown', variation > .3 ? LAND.leafLight : LAND.leaf, [spread, .32 + variation * .1, spread * .9], [x + variation * .15, .81, z]);
                if (variation > .5) { k.mesh(base, 'rock', variation > .8 ? LAND.light : LAND.rose, [.1, .12, .1], [x + .1, 1.13, z]); }
            }} break;
        case 'thicket':
            k.mesh(base, 'box', LAND.soil, [f.width, .2, f.depth], [0, .07, 0]);
            for (let x = -f.width / 2 + .7; x < f.width / 2; x += 1.3) {for (let z = -f.depth / 2 + .65; z < f.depth / 2; z += 1.25) {
                const t = Math.sin(x * 13 + z * 7), h = .6 + t * .2;
                k.mesh(base, 'crown', t > 0 ? LAND.leaf : LAND.leafLight, [.7, h, .7], [x, h * .75, z]);
                if (t > .75) { k.mesh(base, 'rock', LAND.amberLight, [.16, .15, .16], [x, h * 1.65, z]); }
            }} break;
        case 'wagon':
            k.mesh(base, 'box', LAND.wood, [f.width - 1, .35, f.depth - 1.2], [0, 1.1, 0]);
            for (const side of [-1, 1]) {
                for (let row = 0; row < 3; row++) { k.mesh(base, 'box', LAND.wood, [.12, .24, f.depth - 1], [side * (f.width / 2 - .5), 1.4 + row * .29, 0]); }
                for (const z of [-f.depth * .28, f.depth * .28]) {
                    if (item.damaged && side < 0 && z > 0) {
                        k.mesh(base, 'torus', LAND.shadow, [.7, .7, .7], [-f.width / 2 + .8, .18, z]).rotation.x = Math.PI / 2;
                        k.mesh(base, 'box', LAND.wood, [1.1, .1, .1], [-f.width / 2 + .8, .18, z]);
                        k.mesh(base, 'box', LAND.wood, [.1, .1, 1.1], [-f.width / 2 + .8, .18, z]);
                        continue;
                    }
                    k.mesh(base, 'torus', LAND.shadow, [.7, .7, .7], [side * (f.width / 2 - .2), .76, z]).rotation.y = Math.PI / 2;
                    for (let i = 0; i < 4; i++) { const spoke = k.mesh(base, 'box', LAND.wood, [.09, 1.25, .09], [side * (f.width / 2 - .2), .76, z]); spoke.rotation.x = i * Math.PI / 4; }
                }
            }
            k.mesh(base, 'box', LAND.cloth, [1.4, .8, 1.8], [0, 1.7, -.8]);
            k.mesh(base, 'cylinder', LAND.timber, [.45, .9, .45], [.6, 1.8, 1]); break;
        case 'supplies':
            for (let i = 0; i < 4; i++) {
                const crate = k.group(base, [i % 2 * 1.5 - .75, i === 3 ? 1.3 : 0, i < 2 ? -.7 : .7]);
                k.mesh(crate, 'box', LAND.wood, [1.2, 1.2, 1.2], [0, .6, 0]);
                for (const side of [-1, 1]) { k.mesh(crate, 'box', LAND.timber, [.1, 1.25, 1.3], [side * .43, .6, 0]); }
                k.mesh(crate, 'box', LAND.light, [.32, .35, .02], [0, .7, .62]);
            } break;
        case 'bench':
            k.mesh(base, 'box', LAND.wood, [f.width - .3, .18, f.depth - .2], [0, .72, 0]);
            k.mesh(base, 'box', LAND.wood, [.13, .75, f.depth - .2], [-f.width / 2 + .1, 1.12, 0]);
            for (const side of [-1, 1]) { k.mesh(base, 'box', LAND.shadow, [f.width - .5, .7, .22], [0, .35, side * (f.depth / 2 - .5)]); } break;
        case 'ruin':
            k.mesh(base, 'box', LAND.stone, [f.width, .5, f.depth], [0, .25, 0]);
            for (let i = 0; i < 3; i++) {
                const x = -f.width * .3 + i * f.width * .3, h = (item.height ?? 3) * (1 - i * .22), r = f.width * .11;
                k.mesh(model, 'cylinder', LAND.stone, [r, h, r], [x, h / 2 + .3, -f.depth * .2]);
                k.mesh(model, 'box', LAND.light, [r * 2.6, .25, r * 2.6], [x, h + .3, -f.depth * .2]);
                for (let j = 0; j < 6; j++) { const t = j * Math.PI / 3; k.mesh(model, 'box', LAND.mortar, [.055, h * .8, .055], [x + Math.sin(t) * r, h / 2 + .3, -f.depth * .2 + Math.cos(t) * r]); }
            }
            k.mesh(base, 'rock', LAND.grassDark, [f.width * .4, .3, f.depth * .3], [0, .7, f.depth * .2]); break;
    }
    return model.children.length > 0;
}
