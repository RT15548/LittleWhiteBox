import type { Group } from 'three';
import type { SceneKit } from '../scene-kit.js';
import type { Landscape, LandscapeFeature } from '../world/landscape.js';

export const FURNACE_COLORS = { iron: '#526777', deck: '#637b8c', walkway: '#8297a5', edge: '#9dacae', copper: '#a97b55', snow: '#d8e6e9', snowPath: '#bdd0d9', snowCrest: '#edf3f2', ice: '#a8c3cf', soot: '#354558', ember: '#f5c58b' } as const;
const C = FURNACE_COLORS;

export function furnaceFeature(k: SceneKit, root: Group, item: LandscapeFeature) {
    const { width: w, depth: d } = item.footprint, h = item.height!;
    if (item.kind === 'cliff') {
        const alongX = w > d, length = Math.max(w, d), count = Math.ceil(length / 7);
        for (let i = 0; i < count; i++) {
            const p: [number, number, number] = [alongX ? -w / 2 + (i + .5) * w / count : 0, h * .4, alongX ? 0 : -d / 2 + (i + .5) * d / count];
            k.mesh(root, 'rock', C.ice, [alongX ? w / count * .55 : w / 2, h * .7, alongX ? d / 2 : d / count * .55], p);
            k.mesh(root, 'rock', C.snow, [alongX ? w / count * .53 : w * .48, h * .17, alongX ? d * .48 : d / count * .53], [p[0], h * .93, p[2]]);
        }
        return;
    }
    k.mesh(root, 'box', C.soot, [w, .65, d], [0, .325, 0]);
    if (item.kind === 'hoist') {
        for (const side of [-1, 1]) {
            k.mesh(root, 'box', C.iron, [.65, h, d * .72], [side * (w / 2 - .5), h / 2, 0]);
            for (let y = 2; y < h; y += 4) { k.mesh(root, 'box', C.copper, [w, .25, .3], [0, y, d * .34]); }
            k.mesh(root, 'cylinder', C.edge, [.075, h - 2, .075], [side * w * .18, h / 2, .6]);
        }
        k.mesh(root, 'box', C.iron, [w + .4, 1, d], [0, h, 0]);
        k.mesh(root, 'torus', C.copper, [w * .3, w * .3, .8], [0, h - 1.8, .3]);
        k.mesh(root, 'box', C.edge, [w * .7, .45, d * .7], [0, h * .35, 0]);
        return;
    }
    // Broad riveted pressure vessel; facade stays within the collision footprint.
    k.mesh(root, 'cylinder', C.iron, [w * .44, h - 1, d * .44], [0, h / 2 + .5, 0]);
    for (const y of [1.1, h * .38, h * .7, h - .3]) {
        k.mesh(root, 'cylinder', C.copper, [w * .48, .3, d * .48], [0, y, 0]);
    }
    for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        k.mesh(root, 'box', C.edge, [.22, h, .22], [Math.sin(a) * w * .44, h / 2, Math.cos(a) * d * .44]);
    }
    for (const side of [-1, 1]) {
        k.mesh(root, 'box', C.soot, [w * .16, h * .34, .15], [side * w * .23, h * .58, d * .45]);
        for (let j = 0; j < 5; j++) { k.mesh(root, 'box', C.copper, [w * .16, .14, .2], [side * w * .23, h * .44 + j * h * .065, d * .46]); }
    }
    k.mesh(root, 'box', C.soot, [w * .4, h * .22, .18], [0, h * .16, d * .45]);
    k.mesh(root, 'torus', C.copper, [Math.min(w * .16, 1.3), Math.min(w * .16, 1.3), .25], [0, h * .18, d * .47]);
}

/** Distant shapes only; neither another map nor another simulation is kept alive. */
export function furnaceVista(k: SceneKit, root: Group, land: Landscape) {
    const b = land.bounds, north = b.z - b.depth / 2;
    if (land.vista === 'snow') {
        for (let i = 0; i < 14; i++) {
            const side = i % 2 ? -1 : 1, height = 18 + i % 4 * 11;
            const x = side * (b.width / 2 + 22 + i % 3 * 16), z = north - 35 + i * 12;
            k.mesh(root, 'rock', i % 3 ? '#99b2c4' : '#b9cdd7', [19, height, 23], [x, -15, z]);
            k.mesh(root, 'rock', '#e4eff0', [12, height * .29, 15], [x, height * .66 - 15, z]);
        }
        return;
    }
    const vessel = k.group(root, [0, -8, north - 27]);
    furnaceFeature(k, vessel, { id: 'vista-furnace', kind: 'kiln', height: 68, footprint: { x: 0, z: 0, width: 40, depth: 34 } });
    for (const side of [-1, 1]) {
        const tower = k.group(root, [side * 33, -8, north - 18]);
        furnaceFeature(k, tower, { id: 'vista-hoist', kind: 'hoist', height: 42, footprint: { x: 0, z: 0, width: 8, depth: 9 } });
        for (let i = 0; i < 5; i++) {
            const x = side * (b.width / 2 + 16), z = north + i * 18;
            k.mesh(root, 'box', '#8197a5', [11, 10 + i % 2 * 6, 12], [x, -3, z]);
            k.mesh(root, 'box', '#52687b', [12, .5, 13], [x, 2 + i % 2 * 3, z]);
        }
    }
}
