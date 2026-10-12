import type { Group } from 'three';
import { RULES } from './content.js';
import type { Battle } from './types.js';
import type { SceneKit } from './scene-kit.js';
import { PALETTES } from './visuals.js';

/** Everything outside the arena is scenery. Playable cover is built only from battle.obstacles. */
export function buildWorld(k: SceneKit, root: Group, zone: number, battle: Battle | null) {
    const c = PALETTES[zone], a = RULES.arena, { mesh, group, ring } = k;
    const stone = (p: Group, size: [number, number, number], pos: [number, number, number], color: string = c.stone) => mesh(p, 'box', color, size, pos);
    function pillar(x: number, z: number, height: number, ornate = true) {
        const g = group(root, [x, 0, z]);
        stone(g, [1.65, .38, 1.65], [0, .15, 0]); stone(g, [1.3, .3, 1.3], [0, .49, 0], c.light);
        stone(g, [.91, height, .91], [0, height / 2 + .6, 0]);
        for (const dx of [-.38, .38]) { stone(g, [.08, height - .35, .12], [dx, height / 2 + .6, .48], c.light); }
        stone(g, [1.3, .24, 1.3], [0, height + .6, 0], c.light);
        stone(g, [1.56, .3, 1.56], [0, height + .85, 0], c.dark);
        if (ornate) {
            mesh(g, 'cone', c.trim, [.2, .65, .2], [0, height + 1.24, 0]);
            stone(g, [.16, .6, .08], [0, height - .15, .52], c.trim);
        }
        return g;
    }
    function arch(x: number, z: number, width: number, height: number) {
        pillar(x - width / 2, z, height - 2); pillar(x + width / 2, z, height - 2);
        const arch = group(root, [x, height - 2, z]);
        mesh(arch, 'arch', c.light, [width / 2, 2.3, 1.15]);
        for (let i = 1; i < 10; i++) {
            const t = i / 10 * Math.PI;
            const seam = stone(arch, [.025, .64, .025], [Math.cos(t) * width * .49, Math.sin(t) * 2.25, .59], c.trim);
            seam.rotation.z = t - Math.PI / 2;
        }
        stone(arch, [.6, .9, 1.3], [0, 2.28, 0], c.trim);
    }
    function shrub(x: number, z: number, scale = 1) {
        const g = group(root, [x, 0, z]); g.scale.setScalar(scale);
        for (let i = 0; i < 5; i++) {
            const t = i * 2.4;
            const leaf = mesh(g, 'rock', i % 2 ? c.foliage : c.accent, [.55, .8 + i % 2 * .3, .45], [Math.cos(t) * .4, .5, Math.sin(t) * .4]); leaf.rotation.z = Math.sin(t) * .4;
        }
        for (let i = 0; i < 3; i++) { mesh(g, 'rock', c.flower, [.13, .16, .13], [Math.sin(i * 4) * .5, 1, Math.cos(i * 4) * .4]); }
    }
    function tree(x: number, z: number, scale: number) {
        const g = group(root, [x, 0, z]); g.scale.setScalar(scale);
        const trunk = mesh(g, 'cylinder', c.dark, [.15, 3.5, .19], [0, 1.65, 0]); trunk.rotation.z = -.1;
        for (let i = 0; i < 6; i++) {
            const t = i * 2.4;
            mesh(g, 'rock', i % 2 ? c.foliage : c.accent, [1.65, .88, 1.4], [Math.cos(t) * .95, 3 + Math.sin(t) * .5, Math.sin(t) * .85]);
        }
    }
    // Deep water and staggered terraces make the playable floor part of an actual place.
    stone(root, [180, .3, 180], [0, -4.1, 0], c.water);
    for (let i = 0; i < 16; i++) {
        stone(root, [3 + i % 4 * 2, .015, .055], [Math.sin(i * 7) * 32, -3.92, Math.cos(i * 3) * 25], c.haze);
    }
    stone(root, [a * 2 + 2.4, 2.4, a * 2 + 2.4], [0, -1.5, 0], c.dark);
    stone(root, [a * 2 + 1.1, .42, a * 2 + 1.1], [0, -.42, 0], c.trim);
    stone(root, [a * 2 + .5, .35, a * 2 + .5], [0, -.14, 0], c.floor);
    // Large cut-stone slabs, not a grid overlay. Subtle value shifts give the floor material.
    for (let x = -10; x <= 10; x += 2) { for (let z = -10; z <= 10; z += 2) {
        stone(root, [1.96, .045, 1.96], [x, .025, z], (x * 3 + z + 40) % 8 === 0 ? c.tile : c.floor);
    } }
    if (battle) {
        ring(root, c.trim, 5.35, 0, 0, 1, false, .058);
        ring(root, c.light, 5.18, 0, 0, .6, false, .059);
        ring(root, c.seam, 4.72, 0, 0, .65, false, .061);
        for (let i = 0; i < 8; i++) {
            const t = i * Math.PI / 4, m = stone(root, [.18, .025, .55], [Math.cos(t) * 5.04, .065, Math.sin(t) * 5.04], c.trim); m.rotation.y = -t + Math.PI / 2;
        }
        if (zone === 1) {
            const moon = mesh(root, 'crescent', c.seam, [3, 3, .12], [0, .065, 0]); moon.rotation.set(-Math.PI / 2, 0, .7);
        } else {
            const points: [number, number][] = [];
            for (let i = 0; i < (zone === 2 ? 24 : 16); i++) {
                const t = i * Math.PI * 2 / (zone === 2 ? 24 : 16), radius = i % 2 ? .85 : zone === 2 ? 2.6 : i % 4 ? 1.8 : 3.2;
                points.push([Math.cos(t) * radius, Math.sin(t) * radius]);
            }
            const emblem = k.shape(root, points, c.seam, [0, .061, 0]); emblem.rotation.x = -Math.PI / 2;
            ring(root, c.floor, .65, 0, 0, 1, true, .065);
        }
    }
    for (const side of [-1, 1]) {
        for (let i = 0; i < 4; i++) {
            const x = side * (7 + i % 2), z = -7 + i * 4;
            const crack = stone(root, [.035, .016, .55 + i * .1], [x, .055, z], c.seam); crack.rotation.y = i * 1.3;
            const crack2 = stone(root, [.028, .015, .3], [x + .1, .055, z + .3], c.seam); crack2.rotation.y = i * 1.3 + .8;
        }
    }
    for (const x of [-a - .35, a + .35]) {
        stone(root, [.38, .18, a * 2 + 1], [x, .08, 0], c.light);
        for (let z = -10; z <= 10; z += 5) { pillar(x + Math.sign(x) * .5, z, z === -10 ? 3.6 : 1.35); }
    }
    // Entrance stairs and a monumental gate; open centre never occludes enemies.
    for (let i = 0; i < 6; i++) { stone(root, [7.2, .24, 1], [0, -.12 - i * .26, a + .65 + i * .8], i % 2 ? c.stone : c.light); }
    arch(0, -a - 3, 8, 6.3);
    for (const side of [-1, 1]) {
        stone(root, [5, 3.2, 1.9], [side * 8.4, 1.45, -a - 3], c.dark);
        stone(root, [5.5, .3, 2.3], [side * 8.4, 3.2, -a - 3], c.light);
        // Long hanging cloth carries the region's colour; geometry folds catch real light.
        const banner = group(root, [side * 5.8, 4.8, -a - 2.9]);
        stone(banner, [2, .08, .08], [0, 0, 0], c.trim);
        for (let i = 0; i < 5; i++) { stone(banner, [.35, 2.6 - Math.abs(i - 2) * .12, .08], [(i - 2) * .34, -1.35, Math.sin(i * 2) * .08], i % 2 ? c.foliage : c.dark); }
        stone(banner, [.12, 1.8, .09], [0, -1.15, .13], c.trim);
        if (zone < 3) {
            for (let i = 0; i < 4; i++) { shrub(side * (12.8 + i % 2), -9 + i * 5, .8 + i * .1); }
            tree(side * 15, -13, 1.5); tree(side * 17, 1, 1.7);
        } else if (zone === 3) {
            for (let i = 0; i < 3; i++) {
                const furnace = group(root, [side * 15, 0, -9 + i * 7]);
                mesh(furnace, 'cylinder', c.dark, [1.4, 2.8, 1.4], [0, 1.4, 0]); mesh(furnace, 'cylinder', c.trim, [.7, 4.5, .7], [0, 4.9, 0]);
                stone(furnace, [1.5, 1, .2], [0, 1, 1.3], c.accent); mesh(furnace, 'torus', c.trim, [1.1, 1.1, .3], [0, 1.2, 1.4]);
            }
        } else if (zone === 4) {
            for (let i = 0; i < 5; i++) { mesh(root, 'rock', i % 2 ? c.light : c.accent, [1, 2.2 + i % 3, .9], [side * (13.5 + i % 2), 1.2, -9 + i * 4]).rotation.z = side * -.2; }
            const mast = group(root, [side * 17, 0, -13]); stone(mast, [.22, 8, .22], [0, 3.5, 0], c.dark);
            k.shape(mast, [[0, 0], [3, -1], [0, -4]], c.light, [0, 6.5, 0]);
        } else {
            for (let i = 0; i < 4; i++) {
                const shelf = group(root, [side * 14, 0, -10 + i * 6]);
                stone(shelf, [2.4, 3.5, 1], [0, 1.75, 0], c.dark);
                for (let row = 0; row < 3; row++) { stone(shelf, [2.6, .12, 1.1], [0, .8 + row, 0], c.trim); for (let col = 0; col < 5; col++) { stone(shelf, [.27, .65 + col % 2 * .12, .6], [-.85 + col * .4, 1.2 + row, .1], col % 2 ? c.foliage : c.stone); } }
            }
            const portal = mesh(root, 'torus', c.trim, [3.4, 4, .5], [side * 18, 6.2, -13]); portal.rotation.y = side * .3;
        }
        stone(root, [7, 1.4, 18], [side * 17, -.7, -3], c.dark);
        stone(root, [6.7, .1, 17.7], [side * 17, .06, -3], c.seam);
        for (const edge of [-3.5, 3.5]) { stone(root, [.22, .25, 18.2], [side * 17 + edge, .13, -3], c.stone); }
        stone(root, [9, 1.8, 10], [side * 15, -.9, -17], c.dark);
        stone(root, [8.7, .1, 9.7], [side * 15, .06, -17], c.seam);
    }
    // Each region keeps the open arena but changes the skyline and surrounding place.
    for (let i = 0; i < 7; i++) {
        const x = (i - 3) * 8, z = -26 - (i % 3) * 6, h = 7 + (i * 5 % 7);
        stone(root, [5.2, h, 5.5], [x, h / 2 - 3, z], c.stone);
        stone(root, [5.8, .4, 6], [x, h - 3, z], c.light);
        if (zone === 1) {
            const crescent = mesh(root, 'crescent', c.trim, [1.5, 1.5, 1.5], [x, h - .8, z]); crescent.rotation.z = .9;
        } else if (zone === 2) {
            mesh(root, 'cone', c.trim, [3.4, 4.8, 3.4], [x, h - .8, z]);
        } else if (zone === 3) {
            for (const dx of [-1.3, 1.3]) { mesh(root, 'cylinder', c.dark, [.7, 5 + i % 2 * 2, .7], [x + dx, h - 1, z]); }
            stone(root, [3.8, .25, 4], [x, h - 2.5, z], c.trim);
        } else if (zone === 4) {
            mesh(root, 'cone', c.light, [3.2, 4.5, 3.2], [x, h - .8, z]);
            for (const dx of [-1, 1]) { mesh(root, 'rock', c.accent, [.4, 2, .4], [x + dx, h - 3, z + 3]); }
        } else if (zone === 5) {
            mesh(root, 'rock', c.trim, [1.4, 2.3, 1.4], [x, h + .7, z]);
            mesh(root, 'torus', c.accent, [2, 2, 2], [x, h - 1, z]).rotation.x = Math.PI / 2;
        } else {
            for (const dx of [-2, 0, 2]) { stone(root, [.7, 1.2, 5.6], [x + dx, h - 2.35, z], c.light); }
            if (i % 2) { tree(x + 1, z + 2, 1.5); }
        }
        for (const dx of [-1.5, 0, 1.5]) { stone(root, [.5, 2.8, .12], [x + dx, h - 5.6, z + 2.8], c.dark); }
    }
    for (const o of battle?.obstacles ?? []) {
        const g = group(root, [o.x, 0, o.y]);
        mesh(g, 'cylinder', c.dark, [o.radius, .22, o.radius], [0, .11, 0]);
        mesh(g, 'cylinder', c.stone, [o.radius * .85, 1.15, o.radius * .85], [0, .78, 0]);
        mesh(g, 'cylinder', c.light, [o.radius, .2, o.radius], [0, 1.4, 0]);
        mesh(g, 'rock', c.accent, [.28, .58, .28], [0, 1.9, 0]);
        for (let i = 0; i < 6; i++) { const t = i * Math.PI / 3; stone(g, [.09, .8, .09], [Math.cos(t) * o.radius * .86, .8, Math.sin(t) * o.radius * .86], c.trim); }
    }
    if (!battle) {
        mesh(root, 'cylinder', c.dark, [2.1, .16, 2.1], [0, .08, -8]);
        mesh(root, 'cylinder', c.light, [1.95, .14, 1.95], [0, .2, -8]);
        ring(root, c.trim, 1.68, 0, -8, 1, false, .28);
        for (const side of [-1, 1]) {
            shrub(side * 3, -8, 1.2); shrub(side * 4, -10, .85);
            const lantern = group(root, [side * 2.6, .5, -6]);
            mesh(lantern, 'box', c.dark, [.5, .16, .5]); mesh(lantern, 'box', c.flower, [.3, .55, .3], [0, .35, 0]);
            mesh(lantern, 'cone', c.trim, [.42, .3, .42], [0, .74, 0]);
        }
    }
    return k.bake(root);
}
