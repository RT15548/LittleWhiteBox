import type { Group } from 'three';
import type { SceneKit } from './scene-kit.js';
import type { BossKind } from './types.js';
import type { Palette } from './visuals.js';

/** The original three actors stay in scene-actors; these nine have their own bodies, not reskins. */
export function sculptBoss(k: SceneKit, body: Group, head: Group, weapon: Group, kind: Exclude<BossKind, 'warden' | 'weaver' | 'king'>, c: Palette) {
    const { mesh, group, shape } = k, gold = '#d6b881', eye = '#fff0c1';
    const eyes = (y: number, z: number, gap: number) => { for (const side of [-1, 1]) { mesh(head, 'sphere', eye, [.09, .055, .06], [side * gap, y, z], true); } };
    switch (kind) {
        case 'thornheart':
            mesh(body, 'cone', '#576e58', [1.6, 2.9, 1.3], [0, 1.45, 0]); mesh(head, 'rock', '#8da17f', [.8, 1, .65], [0, 2.3, .5]); eyes(2.6, 1.06, .28);
            for (let i = 0; i < 7; i++) {
                const a = i * Math.PI * 2 / 7, branch = group(body, [Math.cos(a) * .8, 2.6, Math.sin(a) * .6]); branch.rotation.z = Math.cos(a) * .8;
                mesh(branch, 'cone', '#526451', [.18, 2.4, .18], [0, .9, 0]); mesh(branch, 'rock', c.foliage, [.6, .6, .4], [0, 1.3, 0]);
                mesh(body, 'cone', '#67765a', [.3, 2, .3], [Math.cos(a), .28, Math.sin(a)]).rotation.z = 1.15;
            }
            mesh(body, 'rock', '#ebbb73', [.35, .55, .2], [0, 1.6, 1.1]); break;
        case 'astrologer':
            mesh(body, 'cone', '#777191', [.85, 2.2, .75], [0, 1.8, 0]); mesh(head, 'sphere', '#c3c1db', [.5, .6, .42], [0, 3.1, 0]);
            mesh(head, 'box', '#4c4469', [.94, .18, .16], [0, 3.2, .38]);
            for (const size of [1.35, 1.8, 2.25]) { const orbit = mesh(weapon, 'torus', gold, [size, size, size], [0, 2.2, 0], false, 1, true); orbit.rotation.set(size * .7, .5, size); }
            mesh(weapon, 'sphere', '#d6dbff', [.23, .23, .23], [1.8, 2.3, .3], true); break;
        case 'phoenix':
            mesh(body, 'rock', '#ac6249', [.65, 1.3, .7], [0, 1.8, 0]); mesh(head, 'sphere', '#e4ac68', [.4, .5, .43], [0, 3.15, .25]); eyes(3.25, .63, .18);
            mesh(head, 'cone', gold, [.18, .55, .15], [0, 3.03, .76]).rotation.x = Math.PI / 2;
            for (const side of [-1, 1]) {
                for (let i = 0; i < 5; i++) { shape(weapon, [[0, 0], [side * (2.4 - i * .25), .95 - i * .22], [side * (2 - i * .24), -.1 - i * .24], [0, -.45]], i % 2 ? '#e2a465' : '#d47c4f', [side * .4, 2.5, -.1 - i * .06]); }
                mesh(body, 'cone', '#e3a25b', [.18, 1.5, .25], [side * .3, .6, -.6]).rotation.x = -.8;
            } break;
        case 'forgemaster':
            mesh(body, 'box', '#675756', [1.8, 2.1, 1.2], [0, 1.6, 0]); mesh(body, 'box', '#9b6148', [1.2, 1.6, .17], [0, 1.55, .7]);
            mesh(head, 'cylinder', '#b08563', [.7, .7, .6], [0, 3.05, 0]); mesh(head, 'box', '#ffd18c', [.65, .1, .08], [0, 3.12, .63], true);
            for (const side of [-1, 1]) { mesh(body, 'cylinder', c.dark, [.36, .8, .38], [side * .55, .5, 0]); mesh(body, 'sphere', '#c9976e', [.65, .55, .55], [side * 1.05, 2.5, 0], false, 1, true); }
            weapon.position.set(1.4, 1.7, .4); mesh(weapon, 'cylinder', '#765948', [.1, 2.3, .1]); mesh(weapon, 'box', '#444e57', [1.8, .8, .9], [0, 1.3, 0]); mesh(weapon, 'box', '#ffc482', [.5, .72, .95], [0, 1.3, 0]); break;
        case 'colossus':
            mesh(body, 'sphere', '#565d63', [1.45, 1.6, .95], [0, 2.15, 0]);
            mesh(body, 'torus', '#b68d66', [.78, .78, .45], [0, 2.25, .82], false, 1, true); mesh(body, 'sphere', '#ffb77b', [.57, .57, .2], [0, 2.25, 1], true);
            mesh(head, 'box', '#818883', [1.3, .5, 1], [0, 3.7, 0]); eyes(3.73, .51, .3);
            for (const side of [-1, 1]) { mesh(body, 'box', '#818883', [.8, 1.2, .95], [side * .8, .6, 0]); mesh(weapon, 'cylinder', '#6b7375', [.65, 2.1, .65], [side * 1.75, 1.85, 0]); mesh(weapon, 'box', '#b29370', [1.1, .8, 1.1], [side * 1.75, .8, .15]); } break;
        case 'frostqueen':
            mesh(body, 'cone', '#82a9c1', [1.1, 2.7, .95], [0, 1.8, 0]); mesh(head, 'sphere', '#d5e9ec', [.45, .58, .4], [0, 3.35, 0]); eyes(3.4, .39, .18);
            for (let i = -2; i <= 2; i++) { mesh(head, 'rock', '#d8fbff', [.11, .48 - Math.abs(i) * .08, .11], [i * .18, 3.94, .02]); }
            for (const side of [-1, 1]) { shape(body, [[0, 0], [side * .95, .8], [side * .5, -1.3], [0, -.5]], '#bddeeb', [side * .5, 2.7, -.35]); }
            weapon.position.set(1.05, 1.9, 0); mesh(weapon, 'cylinder', '#aec9d5', [.045, 2.5, .045]); mesh(weapon, 'rock', '#ddfbff', [.28, .5, .2], [0, 1.5, 0]); break;
        case 'leviathan':
            for (let i = 0; i < 5; i++) { const r = 1 - i * .14; mesh(body, 'sphere', i % 2 ? '#658c9c' : '#7da9b8', [r, r * .8, r], [Math.sin(i * .6) * .4, .8, .5 - i * .8]); mesh(body, 'cone', '#d7e9dc', [.2 * r, .6 * r, .25 * r], [0, 1.5 - i * .13, .4 - i * .7]); }
            mesh(head, 'rock', '#7da9b8', [1.05, .7, .85], [0, 1.05, 1]); eyes(1.32, 1.65, .43);
            for (const side of [-1, 1]) { shape(weapon, [[0, 0], [side * 1.4, .1], [side * .8, -.7]], '#b6d6d8', [side * .7, .7, 0]); mesh(head, 'cone', '#e4efde', [.15, 1, .15], [side * .72, 1.65, 1.2]).rotation.z = side * -.7; } break;
        case 'archivist':
            mesh(body, 'cone', '#685881', [.95, 2.6, .8], [0, 2, 0]); mesh(head, 'rock', '#e7dcc4', [.45, .62, .38], [0, 3.6, 0]); eyes(3.65, .38, .16);
            for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5, book = group(weapon, [Math.cos(a) * 1.7, 2.5 + Math.sin(a) * .6, Math.sin(a) * 1.3]); book.rotation.z = a * .3; mesh(book, 'box', '#baa481', [.55, .72, .14]); mesh(book, 'box', '#f1e4c6', [.48, .65, .15], [0, 0, .03]); }
            mesh(head, 'torus', gold, [.75, .75, .75], [0, 4.25, 0]).rotation.x = Math.PI / 2; break;
        case 'voidknight':
            mesh(body, 'box', '#51486f', [.95, 1.5, .65], [0, 1.75, 0]); mesh(head, 'rock', '#b8afcc', [.43, .66, .4], [0, 2.95, 0]); eyes(3, .4, .17);
            for (const side of [-1, 1]) { mesh(body, 'box', '#867995', [.33, .9, .4], [side * .3, .55, 0]); mesh(body, 'rock', '#b8afcc', [.5, .28, .38], [side * .6, 2.4, 0]);
                const blade = group(weapon, [side * .85, 1.8, .2]); blade.rotation.z = side * -.25;
                shape(blade, [[-.07, 0], [.15, 0], [.3, 1.5], [.12, 2.25], [-.13, 1.7]], '#dfc9ff'); }
            shape(body, [[-.4, 0], [.4, 0], [.85, -2.1], [0, -1.4], [-.65, -2.3]], '#4a4266', [0, 2.45, -.4]); break;
    }
}
