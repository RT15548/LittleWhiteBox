import { Group } from 'three';
import { CELL, PARTS, cells, partKey, solid, type Blueprint, type Part } from '../policy.js';
import { occupancy, stairLinks } from '../layout.js';
import { doorway } from '../house.js';
import type { MemoryId } from '../memories.js';
import { windowSides } from '../spaces.js';
import { PALETTE as C } from './palette.js';
import type { Resources } from './resources.js';

export function worldX(brief: Blueprint, x: number) { return (x - (brief.width - 1) / 2) * CELL.width; }
export function worldZ(brief: Blueprint, z: number) { return (z - (brief.depth - 1) / 2) * CELL.depth; }
export function createPartModel(r: Resources, brief: Blueprint, parts: Part[], part: Part, lit: boolean, gifts: readonly MemoryId[]) {
    const root = new Group(), spec = PARTS[part.kind], w = spec.width * CELL.width, h = CELL.height;
    root.position.set(worldX(brief, part.x) + (spec.width - 1) * CELL.width / 2, part.y * h, worldZ(brief, part.z));
    const map = occupancy(parts), door = doorway(brief, parts);
    const box = (color: number, size: [number, number, number], pos: [number, number, number], finish: 'chalk' | 'enamel' | 'glass' | 'metal' | 'light' = 'chalk') => r.mesh(root, 'box', color, size, pos, finish);
    const ball = (color: number, size: [number, number, number], pos: [number, number, number]) => r.mesh(root, 'sphere', color, size, pos);
    if (solid(part.kind)) {
        box(C.porcelain, [w, .10, CELL.depth], [0, .05, 0]);
        // Cutaway walls keep the floor plan readable; adjoining rows have actual open doorways.
        const behind = cells(part).some(c => map.has(partKey({ ...c, z: c.z - 1 })));
        if (!behind) { box(C.milk, [w, .38, .10], [0, .24, -.52]); }
        else {
            for (const x of [-w / 2 + .05, w / 2 - .05]) { box(C.milk, [.10, .38, .10], [x, .24, -.52]); }
        }
        for (const direction of [-1, 1]) {
            const neighbour = map.get(partKey({ x: direction < 0 ? part.x - 1 : part.x + spec.width, y: part.y, z: part.z }));
            if (!neighbour || neighbour.kind === 'roof') {
                const x = direction * (w / 2 - .05);
                if (part.kind === 'study' && windowSides(part, parts).includes(direction)) {
                    for (const z of [-.44, .44]) { box(C.milk, [.10, h, .27], [x, h / 2, z]); }
                    box(C.milk, [.10, .35, .62], [x, .175, 0]);
                    box(C.milk, [.10, .12, .62], [x, h - .06, 0]);
                    box(C.glass, [.035, .62, .62], [x, .67, 0], 'glass');
                    box(C.mint, [.12, .045, .64], [x, .35, 0], 'enamel');
                    box(C.porcelain, [.055, .63, .025], [x, .67, 0]);
                } else { box(C.milk, [.10, .38, CELL.depth], [x, .24, 0]); }
            }
            else if (!solid(neighbour.kind)) {
                // A garden-facing study has a rear side window AND an open front passage.
                if (part.kind === 'study') {
                    const x = direction * (w / 2 - .05);
                    for (const z of [-.53, .02]) { box(C.milk, [.10, h, .09], [x, h / 2, z]); }
                    box(C.milk, [.10, .30, .47], [x, .15, -.26]);
                    box(C.glass, [.035, .62, .47], [x, .64, -.26], 'glass');
                    box(C.mint, [.12, .04, .50], [x, .33, -.26], 'enamel');
                    box(C.porcelain, [.055, .62, .025], [x, .64, -.26]);
                }
                // Outdoor neighbours always retain a doorway in the front circulation strip.
                for (const z of [-.48, .48]) { box(C.milk, [.10, h, .16], [direction * (w / 2 - .05), h / 2, z]); }
                box(C.milk, [.10, .13, CELL.depth], [direction * (w / 2 - .05), h - .065, 0]);
            }
            box(C.porcelain, [.06, h, .10], [direction * (w / 2 - .035), h / 2, .51]);
        }
        box(C.porcelain, [w, .08, .12], [0, h - .04, .52]);
        box(C.timber, [w - .16, .035, .93], [0, .115, 0]);
        const hasDoor = door && cells(part).some(c => partKey(c) === partKey(door));
        if (hasDoor && !behind) {
            const dx = (door.x - part.x - (spec.width - 1) / 2) * CELL.width;
            box(C.mint, [.64, .88, .07], [dx, .5, -.42], 'enamel');
            box(lit ? C.windowLight : C.glass, [.43, .34, .04], [dx, .66, -.37], lit ? 'light' : 'glass');
            ball(C.brass, [.025, .025, .025], [dx + .23, .39, -.36]);
            box(C.rose, [.64, .025, .36], [dx, .14, .26]);
            box(C.porcelain, [.94, .09, .35], [dx, .04, .69]);
            box(C.brass, [.12, .19, .12], [dx - .43, .79, .59], 'metal');
            ball(lit ? C.windowLight : C.porcelain, [.065, .07, .06], [dx - .43, .78, .65]);
        }
        if (part.kind !== 'entry') {
            // A continuous interior replaces the old closed, individually roofed boxes.
            for (let x = -w / 2 + .39; !behind && part.kind !== 'study' && x < w / 2; x += CELL.width) {
                if (hasDoor && Math.abs(x - (door.x - part.x - (spec.width - 1) / 2) * CELL.width) < CELL.width / 2) { continue; }
                box(C.mint, [.62, .62, .05], [x, .70, -.445], 'enamel');
                box(lit ? C.windowLight : C.glass, [.51, .51, .035], [x, .70, -.405], lit ? 'light' : 'glass');
                box(C.porcelain, [.025, .53, .04], [x, .7, -.375]);
                box(C.porcelain, [.54, .025, .04], [x, .7, -.375]);
            }
            if (part.kind === 'wide') {
                box(C.rose, [1.18, .25, .46], [-.38, .27, -.06], 'enamel');
                box(C.rose, [1.2, .32, .14], [-.38, .49, -.24], 'enamel');
                for (const x of [-.85, .11]) { box(C.milk, [.17, .21, .47], [x, .45, -.055]); }
                box(C.timber, [.69, .06, .32], [.59, .43, -.12]);
                box(C.porcelain, [.09, .28, .09], [.59, .27, -.12]);
                if (!gifts.includes('gardenTea')) {
                    ball(C.leaves, [.13, .13, .13], [.65, .6, -.12]);
                    box(C.porcelain, [.15, .12, .15], [.65, .49, -.12]);
                }
            } else if (part.kind === 'study') {
                box(C.timber, [.29, .74, .22], [.40, .50, -.29]);
                for (const y of [.24, .47, .69]) {
                    box(C.milk, [.29, .035, .24], [.40, y, -.27]);
                    for (let i = 0; i < 3; i++) { box([C.mint, C.rose, C.porcelain][i], [.045, .15 - i * .02, .16], [.32 + i * .075, y + .09, -.24]); }
                }
                box(C.mint, [.46, .13, .44], [-.18, .26, -.06], 'enamel');
                box(C.mint, [.46, .38, .12], [-.18, .47, -.23], 'enamel');
                for (const x of [-.40, .04]) { box(C.milk, [.065, .18, .41], [x, .37, -.025]); }
                box(C.rose, [.71, .018, .60], [-.12, .141, .10]);
            } else if (part.kind === 'room') {
                // The front strip stays clear for the same circulation route used by Xiaobai.
                box((part.x + part.y) % 2 ? C.mint : C.rose, [.76, .23, .45], [0, .26, -.13], 'enamel');
                box(C.milk, [.78, .13, .46], [0, .43, -.13]);
                box(C.porcelain, [.60, .09, .18], [0, .53, -.27]);
                box(C.timber, [.16, .33, .19], [.48, .29, -.19]);
                ball(C.windowLight, [.07, .095, .07], [.48, .56, -.19]);
            }
            box(C.porcelain, [w - .10, .065, .10], [0, .16, .52]);
        }
        // The front circulation strip is also the stair route used by the mascot.
        const links = stairLinks(brief, parts);
        for (const cell of cells(part).filter(c => links.has(partKey(c)))) {
            const offset = (cell.x - part.x - (spec.width - 1) / 2) * CELL.width;
            for (let i = 0; i < 8; i++) {
                box(C.porcelain, [.14, .055, .28], [offset - .45 + i * .128, .15 + i * h / 8, .39]);
            }
            const rail = box(C.brass, [1.37, .022, .022], [offset, .81, .54], 'metal'); rail.rotation.z = .85;
        }
    } else if (part.kind === 'roof') {
        for (const side of [-1, 1]) {
            const panel = box(C.mint, [w + .055, .12, .78], [0, .28, side * .30], 'enamel'); panel.rotation.x = side * .44;
            const trim = box(C.porcelain, [w + .08, .07, .10], [0, .09, side * .66]); trim.rotation.x = side * .44;
        }
        box(C.porcelain, [w + .05, .075, .08], [0, .47, 0]);
        if (part.x % 3 === 0) { box(C.milk, [.22, .43, .24], [.30, .54, -.25]); box(C.timber, [.27, .065, .29], [.30, .78, -.25]); }
    } else if (part.kind === 'path') {
        box(C.leaves, [w - .02, .07, CELL.depth - .02], [0, .035, 0]);
        for (const z of [-.34, 0, .34]) { box(C.porcelain, [.48, .04, .26], [0, .10, z]); }
    } else if (part.kind === 'garden') {
        box(C.leaves, [w - .04, .10, 1.20], [0, .05, 0]);
        for (const z of [-.23, .10, .40]) { box(C.porcelain, [.40, .035, .24], [-.20, .13, z]); }
        r.mesh(root, 'rod', C.timber, [.055, .63, .055], [.35, .37, -.21]);
        ball(C.mint, [.33, .39, .31], [.35, .88, -.21]); ball(C.leaves, [.29, .3, .27], [.47, .72, -.12]);
        for (const x of [-.46, .03, .44]) { ball(C.rose, [.05, .05, .05], [x, .18, .46]); }
        if (!map.has(partKey({ ...part, z: part.z - 1 }))) { box(C.timber, [.90, .035, .035], [0, .43, -.55]);
        for (const x of [-.48, -.24, 0, .24, .48]) { box(C.porcelain, [.065, .40, .07], [x, .28, -.55]); } }
    } else {
        box(C.porcelain, [w, .11, 1.17], [0, .055, 0]);
        box(C.timber, [w - .12, .035, 1.0], [0, .13, 0]);
        for (const x of [-.52, -.26, 0, .26, .52]) { box(C.porcelain, [.035, .43, .045], [x, .34, .52]); }
        box(C.brass, [w - .15, .035, .055], [0, .56, .52], 'metal');
        box(C.timber, [.28, .25, .28], [.35, .25, -.23]); ball(C.leaves, [.2, .24, .2], [.35, .59, -.23]);
        box(C.mint, [.36, .07, .33], [-.31, .36, -.12]); box(C.mint, [.36, .35, .06], [-.31, .51, -.25]);
        for (const x of [-.45, -.17]) { box(C.porcelain, [.04, .23, .04], [x, .23, -.10]); }
    }
    const batch = r.batch(root); return { root, dispose: batch.dispose };
}

export function createSite(r: Resources, brief: Blueprint) {
    const root = new Group(), width = brief.width * CELL.width, depth = brief.depth * CELL.depth;
    r.mesh(root, 'box', C.milk, [width + .30, .25, depth + .35], [0, -.135, 0]);
    r.mesh(root, 'box', C.mint, [width + .43, .16, depth + .50], [0, -.34, 0], 'enamel');
    r.mesh(root, 'box', C.porcelain, [width + .57, .075, depth + .65], [0, -.45, 0]);
    for (let z = 0; z < brief.depth; z++) { for (let x = 0; x < brief.width; x++) {
        if (brief.heights[z * brief.width + x] !== 0) { continue; }
        const cx = worldX(brief, x), cz = worldZ(brief, z);
        r.mesh(root, 'box', C.glass, [CELL.width, .025, CELL.depth], [cx, .005, cz], 'enamel');
        r.mesh(root, 'sphere', C.stone, [.40, .28, .33], [cx + .23, .10, cz + .22]);
        r.mesh(root, 'sphere', C.leaves, [.28, .08, .22], [cx - .26, .07, cz - .13]);
    } }
    const path = worldX(brief, brief.entrance);
    for (let i = 0; i < 3; i++) { r.mesh(root, 'box', C.porcelain, [.53, .055, .28], [path, -.04, depth / 2 + .25 + i * .34]); }
    for (let i = 0; i < 12; i++) {
        r.mesh(root, 'sphere', i % 3 ? C.cloud : C.distantCloud, [1.0 + i % 2 * .4, .35, .75],
            [(i - 5.5) * .95, -.78 - i % 3 * .15, (i % 2 ? -1 : 1) * (depth / 2 + .2)], 'cloud');
    }
    return r.batch(root);
}
