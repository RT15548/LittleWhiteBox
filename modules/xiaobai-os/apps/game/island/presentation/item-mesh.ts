import * as T from 'three';
import type { Item } from '../model.js';
import { mesh, pole } from './meshes.js';
import type { Foliage } from './foliage.js';
import { GARMENTS } from '../clothing.js';
import type { CharacterRoster } from './character-loader.js';
import type { FabricAppearance } from './survivor-visual.js';

export function itemMesh(item: Pick<Item, 'kind' | 'quantity'> & FabricAppearance, foliage: Foliage, characters: CharacterRoster) {
    if (GARMENTS[item.kind]) { return characters.garment(item); }
    const g = new T.Group(), brown = '#a38b61', cloth = item.cleanliness === 'dirty' ? '#9b947c' : item.wetness > .25 ? '#a6b9bd' : '#d0dcd8';
    switch (item.kind) {
        case 'bottle': {
            const body = mesh(new T.CylinderGeometry(.1, .1, .3, 10), '#aeddda', g, 0, .11, 0); body.rotation.z = Math.PI / 2;
            const neck = mesh(new T.CylinderGeometry(.05, .065, .1, 8), '#e9f3ed', g, .19, .11, 0); neck.rotation.z = Math.PI / 2;
            break;
        }
        case 'metal_cup': case 'shell': case 'coconut_open': {
            const metal = item.kind === 'metal_cup', color = metal ? '#bac7c8' : brown;
            const radius = metal ? .04 : .17, base = metal ? .034 : .12, height = metal ? .09 : .22;
            mesh(new T.CylinderGeometry(radius, base, height, 16, 1, true), color, g, 0, height / 2 + .01, 0);
            const rim = mesh(new T.TorusGeometry(radius, metal ? .004 : .014, 5, 16), color, g, 0, height + .01, 0); rim.rotation.x = Math.PI / 2;
            const bottom = mesh(new T.CircleGeometry(base, 16), item.kind === 'coconut_open' ? '#f2ecdb' : color, g, 0, .01, 0); bottom.rotation.x = -Math.PI / 2;
            break;
        }
        case 'coconut': mesh(new T.SphereGeometry(.18, 10, 8), '#9b9e5e', g, 0, .17, 0).scale.y = 1.15; break;
        case 'coconut_husk': {
            for (let i = 0; i < 3; i++) {
                const strip = mesh(new T.SphereGeometry(.16, 8, 5), '#a18b61', g, (i - 1) * .17, .05, 0);
                strip.scale.set(.5, .3, 1.7); strip.rotation.y = (i - 1) * .45;
            }
            break;
        }
        case 'coral_stone': mesh(new T.DodecahedronGeometry(.23, 1), '#c4bdaa', g, 0, .12, 0).scale.y = .65; break;
        case 'metal_edge': {
            const plate = mesh(new T.BoxGeometry(.35, .02, .19), '#b2c3c9', g, 0, .035, 0); plate.rotation.set(.09, .6, .1); break;
        }
        case 'branch': case 'fire_drill': {
            for (let i = 0; i < Math.min(item.quantity, 5); i++) {
                pole(g, new T.Vector3(-.65, .06 + i * .05, i * .09), new T.Vector3(.55, .12 + i * .05, i * .06 + .1), .045, brown);
            }
            if (item.kind === 'fire_drill') { pole(g, new T.Vector3(-.3, .1, -.25), new T.Vector3(.15, .12, .3), .025, '#bba77c'); }
            break;
        }
        case 'palm_leaf': {
            for (let i = 0; i < Math.min(item.quantity, 5); i++) {
                const leaf = foliage.leaf('palm', 1.9, .9, .06, 0);
                leaf.position.set(i * .07, .06 + i * .035, -.95); leaf.rotation.y = i * .18; g.add(leaf);
            }
            break;
        }
        case 'fish': case 'cooked_fish': {
            const color = item.kind === 'fish' ? '#a9bfc5' : '#be976d';
            mesh(new T.SphereGeometry(.12, 10, 6), color, g, 0, .065, 0).scale.set(1.7, .5, .7);
            const tail = mesh(new T.ConeGeometry(.09, .13, 3), color, g, -.23, .06, 0); tail.rotation.z = -Math.PI / 2; tail.scale.z = .35; break;
        }
        case 'cord': {
            const coil = mesh(new T.TorusGeometry(.15, .018, 5, 16), brown, g, 0, .04, 0); coil.rotation.x = Math.PI / 2; break;
        }
        case 'basket': {
            mesh(new T.CylinderGeometry(.33, .23, .36, 12, 1, true), '#b0a16f', g, 0, .2, 0).material.side = T.DoubleSide;
            const handle = mesh(new T.TorusGeometry(.3, .025, 5, 16, Math.PI), brown, g, 0, .34, 0); handle.rotation.y = Math.PI / 2; break;
        }
        case 'cloth': mesh(new T.BoxGeometry(.42, .025, .35), cloth, g, 0, .025, 0); break;
        case 'tinder': {
            for (let i = 0; i < 7; i++) { pole(g, new T.Vector3(-.14, .02, i * .03), new T.Vector3(.1, .025 + i * .008, .15 - i * .02), .012, '#cfbf8e'); } break;
        }
    }
    return g;
}

export function heldItemMesh(item: Pick<Item, 'kind' | 'quantity' | 'wetness'>, foliage: Foliage, characters: CharacterRoster) {
    const held = itemMesh(item, foliage, characters);
    if (held.userData.garment && !['shoes', 'wraps'].includes(item.kind)) {
        const bounds = new T.Box3().setFromObject(held);
        held.rotation.x = Math.PI / 2; held.position.y = bounds.min.z;
    } else {
        if (item.kind === 'bottle') { held.rotation.z = Math.PI / 2; }
        const center = new T.Box3().setFromObject(held).getCenter(new T.Vector3());
        held.position.sub(center);
    }
    return held;
}
