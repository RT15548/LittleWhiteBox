import { Group } from 'three';
import { CELL, PARTS, type Blueprint } from '../policy.js';
import type { Keepsake } from '../memories.js';
import { worldX, worldZ } from './models.js';
import { PALETTE as C } from './palette.js';
import type { Resources } from './resources.js';

/** Gifts share the room's frame and leave its front circulation strip clear. */
export function createKeepsake(r: Resources, brief: Blueprint, gift: Keepsake) {
    const root = new Group(), p = gift.part;
    root.position.set(worldX(brief, p.x) + (PARTS[p.kind].width - 1) * CELL.width / 2, p.y * CELL.height, worldZ(brief, p.z));
    const box = (color: number, size: [number, number, number], at: [number, number, number]) => r.mesh(root, 'box', color, size, at);
    const ball = (color: number, size: [number, number, number], at: [number, number, number]) => r.mesh(root, 'sphere', color, size, at);
    const rod = (color: number, size: [number, number, number], at: [number, number, number]) => r.mesh(root, 'rod', color, size, at);
    switch (gift.id) {
        case 'gardenWalk':
            rod(C.porcelain, [.15, .10, .15], [-.38, .15, -.32]);
            rod(C.milk, [.05, .35, .05], [-.38, .34, -.32]);
            rod(C.porcelain, [.24, .08, .24], [-.38, .53, -.32]);
            rod(C.glass, [.20, .018, .20], [-.38, .578, -.32]);
            ball(C.rose, [.07, .08, .06], [-.21, .65, -.32]);
            ball(C.porcelain, [.045, .05, .045], [-.17, .72, -.32]);
            break;
        case 'gardenReading':
            box(C.timber, [.36, .15, .20], [-.38, .34, -.38]);
            for (const dx of [-.10, .06]) {
                rod(C.leaves, [.015, .30, .015], [-.38 + dx, .55, -.38]);
                ball(C.mint, [.09, .055, .07], [-.44 + dx, .60, -.38]);
                ball(C.rose, [.055, .06, .05], [-.38 + dx, .72, -.38]);
            }
            break;
        case 'gardenTea':
            box(C.rose, [.72, .015, .34], [.59, .47, -.12]);
            ball(C.porcelain, [.09, .075, .08], [.65, .59, -.12]);
            rod(C.mint, [.045, .10, .045], [.40, .54, -.12]);
            rod(C.mint, [.045, .10, .045], [.81, .54, -.12]);
            box(C.timber, [.13, .018, .13], [.55, .49, -.01]);
            break;
        case 'quietBedroom':
            box(C.mint, [.77, .025, .30], [0, .509, -.055]);
            for (const x of [-.25, 0, .25]) {
                const stitch = box(C.milk, [.09, .018, .09], [x, .53, -.055]); stitch.rotation.y = Math.PI / 4;
            }
            break;
        case 'courtyard':
            for (const x of [-.50, .50]) { rod(C.timber, [.025, 1.30, .025], [x, .72, -.48]); }
            for (let i = 0; i < 7; i++) {
                const x = -.46 + i * .153, y = 1.36 - Math.sin(i / 6 * Math.PI) * .14;
                box(C.brass, [.16, .015, .02], [x, y, -.48]);
                ball(C.windowLight, [.045, .065, .045], [x, y - .085, -.48]);
            }
            break;
    }
    return r.batch(root);
}
