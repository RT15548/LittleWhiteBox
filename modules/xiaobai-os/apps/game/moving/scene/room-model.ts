import { Group } from 'three';
import type { MovingLevel } from '../types.js';
import { STACK_BASES } from '../levels.js';
import { MATCH_SIZE } from '../rules.js';
import { createItem } from './items.js';
import { createToyKit } from './toy-kit.js';

const PALETTES = {
    weekend: { wall: '#e0efe7', floor: '#fff0df', trim: '#95c9b3', seat: '#f2b4bc', rug: '#c9e1f3', cabinet: '#f4d294' },
    witch: { wall: '#e9e3fc', floor: '#f3efff', trim: '#b5a5dc', seat: '#b2d2e5', rug: '#c7eddf', cabinet: '#b8ded8' },
};

export function createRoomModel(level: MovingLevel) {
    const kit = createToyKit();
    const root = new Group();
    const palette = PALETTES[level.id];
    const decoration = kit.group(root);
    const items = new Map<string, Group>();
    const markers = new Map<string, Group>();
    const box = kit.box, ball = kit.ball;
    box(decoration, [9.6, .5, 8.8], palette.trim, [0, -.46, 0], .22);
    box(decoration, [9.25, .26, 8.5], palette.floor, [0, -.13, 0], .16);
    box(decoration, [9.05, 4.35, .22], palette.wall, [0, 2.08, -3.58], .08);
    box(decoration, [.22, 4.35, 6.9], palette.wall, [-4.42, 2.08, -.22], .08);
    box(decoration, [9.05, .14, .15], palette.trim, [0, .13, -3.4], .03);
    for (let x = -4; x <= 4; x++) { box(decoration, [.014, .009, 8.15], '#e5ddd2', [x, .008, .1], 0); }
    for (const z of [-2, 0, 2]) { box(decoration, [8.8, .009, .014], '#e5ddd2', [0, .008, z], 0); }
    const rug = box(decoration, [5.9, .055, 3.15], palette.rug, [0, .035, 1.45], .025);
    rug.rotation.y = -.035;
    for (let i = 0; i < 14; i++) { box(decoration, [.055, .025, .18], '#fffdf6', [-2.6 + i * .4, .05, 3.08], .01); }

    // Windows and curtains stay luminous even in the enchanted second chapter.
    box(decoration, [2.5, 1.65, .17], '#fffaf0', [.35, 3.15, -3.38], .09);
    box(decoration, [2.24, 1.4, .06], level.id === 'witch' ? '#b6bde9' : '#b8e2ee', [.35, 3.15, -3.27], .05);
    ball(decoration, [.25, .25, .04], '#fff0ba', [.98, 3.48, -3.2]);
    if (level.id === 'witch') {
        ball(decoration, [.22, .22, .045], '#b6bde9', [1.1, 3.56, -3.15]);
        for (const [x, y] of [[-.25, 3.55], [.15, 2.85], [.85, 2.8]]) {
            const star = createItem(kit, 'star'); star.position.set(x, y, -3.17); star.scale.setScalar(.25); decoration.add(star);
        }
    } else {
        for (const x of [-.3, -.05, .2]) { ball(decoration, [.22, .11, .025], '#f8fcff', [x, 3.3, -3.21]); }
    }
    box(decoration, [.06, 1.45, .07], '#fffaf0', [.35, 3.15, -3.15], .02);
    for (const x of [-1.12, 1.82]) { box(decoration, [.42, 1.8, .25], level.id === 'witch' ? '#c4b2e7' : '#f4c4bf', [x, 3.15, -3.12], .1); }

    const [sx, sy, sz] = STACK_BASES[0];
    if (level.id === 'weekend') {
        box(decoration, [3, .45, 1.42], palette.seat, [sx, sy - .3, sz], .18);
        box(decoration, [3, .85, .32], palette.seat, [sx, sy + .25, sz - .67], .15);
        for (const x of [sx - 1.35, sx + 1.35]) { box(decoration, [.3, .65, 1.48], palette.seat, [x, sy, sz], .14); }
        for (const x of [sx - .8, sx, sx + .8]) { box(decoration, [.73, .18, 1.05], '#ffd7d9', [x, sy - .04, sz], .08); }
    } else {
        box(decoration, [3.05, .64, 1.5], palette.seat, [sx, sy - .35, sz], .1);
        box(decoration, [3.2, .15, 1.6], '#fff6e8', [sx, sy - .04, sz], .06);
        for (const x of [sx - .9, sx + .9]) {
            box(decoration, [.68, .38, .035], '#8699be', [x, .31, sz + .77], .06);
            ball(decoration, [.055, .055, .03], '#f6d38b', [x, .52, sz + .8]);
        }
        const pot = kit.group(decoration, [-3.42, .46, .7]);
        ball(pot, [.47, .4, .43], '#9c91c5', [0, 0, 0]);
        kit.ring(pot, .36, .06, '#c0b1e1', [0, .26, 0]).rotation.x = Math.PI / 2;
        kit.cylinder(pot, .33, .33, .018, '#a8edcf', [0, .26, 0]);
        for (const x of [-.48, .48]) { kit.ring(pot, .1, .03, '#dfcfa1', [x, .06, 0]); }
        for (const [x, y] of [[-.16, .48], [.1, .74], [.21, .43]]) { ball(pot, [.095, .095, .095], '#c2f5df', [x, y, 0]); }
    }
    const [cx, cy, cz] = STACK_BASES[1];
    box(decoration, [2.35, cy, 1.45], palette.cabinet, [cx, cy / 2, cz], .09);
    box(decoration, [2.48, .13, 1.56], '#fff7e6', [cx, cy, cz], .05);
    for (const y of [.25, .62]) {
        box(decoration, [2.12, .27, .04], palette.trim, [cx, y, cz + .75], .03);
        box(decoration, [.45, .055, .08], '#fff7e6', [cx, y, cz + .81], .02);
    }
    const [bx, by, bz] = STACK_BASES[2];
    box(decoration, [1.85, by, 1.45], '#e9be94', [bx, by / 2, bz], .06);
    box(decoration, [.2, by + .016, 1.48], '#ffe5b7', [bx, by / 2, bz], .01);
    box(decoration, [.5, .25, .02], '#fff7e6', [bx - .45, .35, bz + .74], .03);
    const [tx, ty, tz] = STACK_BASES[3];
    box(decoration, [2.15, .13, 1.35], level.id === 'witch' ? '#c1d8f0' : '#f5d6ac', [tx, ty, tz], .055);
    for (const x of [tx - .7, tx + .7]) { box(decoration, [.11, ty, .8], palette.trim, [x, ty / 2, tz], .03); }

    // Shelf furnishings have their own silhouettes, distinct from every playable item.
    box(decoration, [1.4, .13, .62], palette.trim, [3.25, 3.45, -3.02], .05);
    const clock = kit.group(decoration, [2.94, 3.515, -2.96]);
    box(clock, [.5, .075, .24], palette.seat, [0, .04, 0], .025);
    kit.cylinder(clock, .25, .25, .16, palette.seat, [0, .3, 0]).rotation.x = Math.PI / 2;
    kit.cylinder(clock, .207, .207, .018, '#fffaf0', [0, .3, .09]).rotation.x = Math.PI / 2;
    box(clock, [.025, .145, .018], '#53646b', [0, .36, .11], .008);
    box(clock, [.13, .025, .018], '#53646b', [.05, .3, .11], .008);
    for (const [x, height, color] of [[3.36, .42, palette.rug], [3.53, .54, palette.trim], [3.7, .46, palette.seat]] as const) {
        const book = kit.group(decoration, [x, 3.515, -2.96]);
        box(book, [.14, height, .3], color, [0, height / 2, 0], .012);
        box(book, [.1, .018, .25], '#fffaf0', [0, height - .025, .012], .003);
        for (const y of [.07, height - .07]) { box(book, [.095, .016, .012], '#fffaf0', [0, y, .151], .003); }
    }
    const portrait = kit.group(decoration, [-4.25, 2.55, .05]); portrait.rotation.y = Math.PI / 2;
    box(portrait, [1, 1.1, .09], '#fff7e8', [0, 0, 0], .04);
    box(portrait, [.82, .9, .03], '#cddff3', [0, 0, .06], .025);
    const friend = createItem(kit, level.id === 'witch' ? 'potion' : 'cat'); friend.scale.setScalar(.8); friend.position.set(0, -.08, .15); portrait.add(friend);

    for (const item of level.items) {
        const model = createItem(kit, item.kind);
        // Protective packing pads make the supporting relationship physically readable.
        box(model, [.93, .085, .76], '#fff9e9', [0, -.29, 0], .035);
        for (const x of [-.34, .34]) { ball(model, [.1, .055, .25], '#f4e8d5', [x, -.23, 0]); }
        model.position.set(...item.position);
        model.userData.itemId = item.id; root.add(model); items.set(item.id, model);
        const marker = kit.group(root, [item.position[0], item.position[1] - .27, item.position[2]]);
        kit.ring(marker, .47, .023, '#eaba61', [0, 0, 0]).rotation.x = Math.PI / 2;
        markers.set(item.id, marker);
    }
    const mascot = kit.group(root, [-3.05, .52, 3.55]);
    ball(mascot, [.32, .4, .27], '#fffaf2', [0, .1, 0]);
    for (const x of [-.2, .2]) {
        ball(mascot, [.09, .17, .085], '#fffaf2', [x, .48, 0]);
        ball(mascot, [.065, .07, .1], '#667486', [x * .75, -.28, .06]);
        ball(mascot, [.028, .039, .02], '#354353', [x * .5, .22, .252]);
        ball(mascot, [.052, .028, .025], '#f0afb0', [x * .8, .12, .242]);
    }
    const parcel = kit.group(mascot, [0, -.03, .37]);
    box(parcel, [.47, .35, .33], '#dfb084', [0, 0, 0], .035);
    box(parcel, [.08, .36, .34], '#ffe6b8', [0, 0, 0], .008);
    parcel.visible = false;
    const shipped = kit.group(root, [3.6, .1, 3.55]);
    for (let n = 0; n < level.items.length / MATCH_SIZE; n++) {
        const carton = box(shipped, [.4, .26, .4], n % 2 ? '#e2b585' : '#efcba2',
            [(n % 2) * .43 - .25, Math.floor(n / 2) * .28 + .14, 0], .03);
        carton.visible = false;
    }
    const halo = kit.ring(root, .49, .03, '#e6ac44', [0, .1, 0]);
    halo.rotation.x = -Math.PI / 2; halo.visible = false; halo.castShadow = false;
    return { root, items, markers, mascot, parcel, shipped, halo, dispose: () => kit.dispose() };
}
