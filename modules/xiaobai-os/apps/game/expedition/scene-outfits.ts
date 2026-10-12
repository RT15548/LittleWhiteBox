import type { Group } from 'three';
import { OUTFITS } from './outfits.js';
import type { SceneKit } from './scene-kit.js';
import type { Outfit } from './types.js';

/** Outfit ownership/palettes stay unchanged; all garments fit the expedition traveler rig. */
export function dressHero(k: SceneKit, parent: Group, id: Outfit) {
    const c = OUTFITS[id], { mesh, group, shape } = k;
    const cape = group(parent, [0, .2, -.23]), head = group(parent, [0, .328, 0]), orbit = group(parent, [0, .55, 0]);
    head.scale.set(.64, .78, .72);
    const long = c.silhouette === 'robe' || c.silhouette === 'coat';
    shape(cape, [[-.23, 0], [.23, 0], [.38, long ? -.68 : -.48], [.1, long ? -.77 : -.59], [-.36, long ? -.68 : -.5]], c.fabric);
    shape(cape, [[-.04, -.08], [.04, -.08], [.055, long ? -.61 : -.45], [0, long ? -.68 : -.5], [-.05, long ? -.61 : -.45]], c.metal, [0, 0, -.012]);
    mesh(parent, 'torus', c.fabric, [.2, .15, .19], [0, .19, 0]).rotation.x = Math.PI / 2;
    if (c.silhouette === 'armor') {
        mesh(parent, 'sphere', c.metal, [.295, .18, .27], [0, -.15, 0], false, 1, true);
        mesh(parent, 'rock', c.glow, [.065, .09, .025], [0, -.07, .285]);
        for (const side of [-1, 1]) { mesh(parent, 'rock', c.metal, [.15, .12, .17], [side * .3, -.02, 0], false, 1, true); }
    } else if (long) {
        mesh(parent, 'cone', c.fabric, [.34, .46, .27], [0, -.2, -.025]);
        shape(parent, [[-.07, 0], [.07, 0], [.14, -.42], [-.14, -.42]], c.metal, [0, -.02, .245]);
        mesh(parent, 'rock', c.glow, [.055, .065, .035], [0, -.12, .285]);
    }
    if (c.head === 'helm') {
        mesh(head, 'sphere', c.metal, [.31, .13, .265], [0, .44, -.015], false, 1, true);
        for (const side of [-1, 1]) { mesh(head, 'box', c.metal, [.065, .22, .17], [side * .285, .29, -.02], false, 1, true); }
    } else if (c.head === 'hat') {
        mesh(head, 'cylinder', c.fabric, [.43, .045, .32], [0, .46, 0]);
        mesh(head, 'cone', c.fabric, [.23, .48, .23], [.055, .7, -.02]).rotation.z = -.18;
        mesh(head, 'torus', c.metal, [.245, .245, .24], [0, .52, -.01]).rotation.x = Math.PI / 2;
    } else if (c.head === 'hood') {
        mesh(head, 'sphere', c.fabric, [.345, .35, .265], [0, .22, -.12]);
        // Open front keeps the original face visible, with a cloth rim behind the cheeks.
        for (const side of [-1, 1]) { mesh(head, 'sphere', c.fabric, [.075, .19, .08], [side * .285, .19, .055]); }
    } else if (c.head === 'crown') {
        mesh(head, 'torus', c.metal, [.28, .28, .28], [0, .48, 0], false, 1, true).rotation.x = Math.PI / 2;
        for (let i = 0; i < 5; i++) { const t = i * Math.PI * 2 / 5; mesh(head, 'cone', c.metal, [.045, .2, .045], [Math.sin(t) * .27, .57, Math.cos(t) * .27]); }
    } else if (c.head === 'horns') {
        for (const side of [-1, 1]) {
            const antler = group(head, [side * .26, .5, -.06]); antler.rotation.z = side * -.45;
            mesh(antler, 'cylinder', c.metal, [.035, .44, .03], [0, .18, 0]);
            for (const at of [.16, .3]) { mesh(antler, 'cone', c.metal, [.025, .22, .025], [side * .06, at, 0]).rotation.z = side * -.8; }
        }
    } else if (c.head === 'goggles') {
        mesh(head, 'torus', '#4c4a42', [.32, .22, .27], [0, .4, 0]).rotation.x = Math.PI / 2;
        for (const side of [-1, 1]) { mesh(head, 'torus', c.metal, [.095, .075, .05], [side * .115, .39, .24]); mesh(head, 'sphere', c.glow, [.08, .06, .045], [side * .115, .39, .24]); }
    }
    switch (id) {
        case 'guardian': mesh(head, 'cone', c.fabric, [.08, .28, .1], [0, .67, -.06]); break;
        case 'moonweaver': mesh(head, 'crescent', c.metal, [.15, .15, .05], [0, .67, .19]).rotation.z = .8; break;
        case 'sovereign':
            for (const side of [-1, 1]) { mesh(parent, 'cone', c.metal, [.1, .2, .12], [side * .35, .12, -.03]).rotation.z = side * -.5; } break;
        case 'ranger':
            mesh(parent, 'cylinder', '#79543d', [.095, .46, .085], [-.25, .1, -.31]).rotation.z = -.35;
            for (let i = 0; i < 3; i++) { mesh(parent, 'cylinder', c.metal, [.012, .32, .012], [-.21 + i * .04, .4, -.29]); }
            mesh(head, 'cone', c.glow, [.06, .25, .04], [-.31, .48, -.05]).rotation.z = -.6; break;
        case 'paladin':
            for (const side of [-1, 1]) { shape(parent, [[0, 0], [side * .22, .24], [side * .18, -.05], [side * .05, -.12]], c.metal, [side * .32, .02, -.06]); } break;
        case 'witch':
            for (const side of [-1, 1]) { mesh(parent, 'sphere', c.glow, [.05, .065, .04], [side * .27, -.16, .17]); mesh(parent, 'box', c.metal, [.07, .025, .07], [side * .27, -.09, .17]); } break;
        case 'assassin':
            mesh(parent, 'sphere', c.metal, [.21, .045, .055], [0, .045, .25]);
            shape(parent, [[0, 0], [.1, -.07], [.08, -.29], [0, -.19]], c.metal, [-.1, -.02, .27]); break;
        case 'machinist':
            mesh(parent, 'box', c.metal, [.38, .4, .18], [0, .06, -.35], false, 1, true);
            for (const side of [-1, 1]) { mesh(parent, 'cylinder', '#c99767', [.06, .32, .06], [side * .14, .21, -.38]); }
            mesh(parent, 'rock', c.glow, [.09, .14, .05], [0, .06, -.46]); break;
        case 'beastcaller':
            for (let i = -2; i <= 2; i++) { mesh(parent, 'rock', i % 2 ? c.fabric : c.metal, [.07, .17, .045], [i * .11, -.07, .21]).rotation.z = i * .27; } break;
        case 'frostbound':
            for (let i = -2; i <= 2; i++) { mesh(parent, 'sphere', '#f6ffff', [.08, .075, .09], [i * .115, .005, .13]); }
            for (const side of [-1, 1]) { mesh(parent, 'rock', c.glow, [.09, .36, .09], [side * .3, .22, -.35]).rotation.z = side * -.5; } break;
        case 'stargazer':
            mesh(orbit, 'torus', c.metal, [.43, .43, .43], [0, .16, 0], false, 1, true).rotation.x = .6;
            for (let i = 0; i < 3; i++) { const t = i * Math.PI * 2 / 3; mesh(orbit, 'rock', c.glow, [.04, .075, .04], [Math.cos(t) * .47, .16, Math.sin(t) * .47]); } break;
        case 'traveler': break;
    }
    return { cape, animate(time: number, reduced: boolean) { orbit.rotation.y = reduced ? .4 : time * .014; } };
}
