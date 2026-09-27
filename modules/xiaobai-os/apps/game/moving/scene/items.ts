import { Group } from 'three';
import type { ItemKind } from '../types.js';
import type { ToyKit } from './toy-kit.js';

export const ITEM_COLORS: Record<ItemKind, string> = {
    cat: '#f8bbbf', toast: '#dd9a54', ufo: '#70c9b3', cup: '#b8a2e5',
    duck: '#ffce5b', plant: '#52ad89', potion: '#916ce1', star: '#ffd36b',
};

export function createItem(kit: ToyKit, kind: ItemKind): Group {
    const root = new Group();
    const color = ITEM_COLORS[kind];
    const face = (y: number, z: number, spread = .1) => {
        for (const x of [-spread, spread]) { kit.ball(root, [.025, .038, .02], '#343447', [x, y, z]); }
    };
    switch (kind) {
        case 'cat': {
            kit.ball(root, [.26, .26, .21], color, [0, -.06, 0]);
            kit.ball(root, [.29, .23, .22], color, [0, .15, 0]);
            for (const x of [-.19, .19]) {
                kit.cylinder(root, 0, .12, .25, color, [x, .37, -.015], 3).rotation.y = Math.PI;
                kit.ball(root, [.065, .035, .03], '#ed90a1', [x, .09, .2]);
            }
            face(.18, .212); kit.ball(root, [.032, .025, .03], '#d97690', [0, .11, .224]);
            kit.ring(root, .13, .045, color, [.26, -.11, -.03]).rotation.y = .5;
            break;
        }
        case 'toast': {
            kit.box(root, [.52, .58, .2], color, [0, .04, 0], .1);
            kit.ball(root, [.3, .16, .12], color, [0, .28, 0]);
            kit.box(root, [.4, .43, .025], '#ffe9b9', [0, .045, .11], .1);
            kit.box(root, [.18, .14, .045], '#ffd467', [0, .08, .14], .03).rotation.z = .15;
            face(-.07, .145); break;
        }
        case 'ufo': {
            kit.ball(root, [.35, .1, .3], color, [0, -.04, 0]);
            kit.ball(root, [.2, .21, .19], '#bbe8ec', [0, .09, 0]);
            kit.ring(root, .26, .045, '#ede7aa', [0, -.04, 0]).rotation.x = Math.PI / 2;
            for (const x of [-.18, .18]) { kit.ball(root, [.06, .06, .06], '#f7b2b8', [x, -.075, .19]); }
            face(.09, .172, .07); break;
        }
        case 'cup': {
            kit.cylinder(root, .235, .18, .43, color, [0, 0, 0]);
            kit.cylinder(root, .19, .19, .015, '#715144', [0, .22, 0]);
            kit.ring(root, .13, .047, color, [.25, .025, 0]);
            kit.ring(root, .213, .025, '#e7d9fb', [0, .22, 0]).rotation.x = Math.PI / 2;
            face(0, .208); break;
        }
        case 'duck': {
            kit.ball(root, [.27, .19, .26], color, [0, -.08, 0]);
            kit.ball(root, [.18, .18, .17], color, [0, .16, .07]);
            kit.ball(root, [.1, .045, .11], '#f59b46', [0, .12, .24]);
            for (const x of [-.22, .22]) { kit.ball(root, [.06, .1, .15], '#f4b742', [x, -.045, 0]); }
            face(.19, .218, .07); break;
        }
        case 'plant': {
            kit.cylinder(root, .19, .14, .25, '#efa08e', [0, -.19, 0]);
            kit.cylinder(root, .2, .2, .06, '#ffc1ac', [0, -.07, 0]);
            kit.cylinder(root, .025, .025, .34, color, [0, .1, 0]);
            for (let n = 0; n < 5; n++) {
                const angle = n * 2.4;
                const leaf = kit.ball(root, [.085, .21, .07], color, [Math.sin(angle) * .13, .15 + n * .025, Math.cos(angle) * .12]);
                leaf.rotation.z = Math.sin(angle) * .7; leaf.rotation.x = Math.cos(angle) * .7;
            }
            break;
        }
        case 'potion': {
            kit.ball(root, [.235, .25, .21], color, [0, -.04, 0]);
            kit.cylinder(root, .095, .11, .23, '#c1a1f2', [0, .21, 0]);
            kit.cylinder(root, .105, .09, .1, '#d1a370', [0, .35, 0]);
            kit.box(root, [.2, .17, .025], '#fff0bc', [0, -.03, .205], .04).rotation.z = .15;
            kit.ball(root, [.04, .065, .02], '#fff5ff', [-.11, .05, .19]); break;
        }
        case 'star': {
            kit.ball(root, [.2, .2, .115], color, [0, 0, 0]);
            for (let i = 0; i < 5; i++) {
                const a = i * Math.PI * 2 / 5;
                const ray = kit.cylinder(root, 0, .13, .25, color, [Math.sin(a) * .22, Math.cos(a) * .22, 0], 4);
                ray.rotation.z = -a;
            }
            face(.02, .11, .07); break;
        }
    }
    return root;
}
