import * as T from 'three';
import type { Structure } from '../model.js';
import { BLUEPRINTS } from '../survival-content.js';
import { LATRINE_SCREEN } from '../structure-shape.js';
import { mesh, pole } from './meshes.js';
import type { Foliage } from './foliage.js';

export function structure(site: Omit<Structure, 'builder' | 'water'> & { water: { millilitres: number } | null }, foliage: Foliage) {
    const group = new T.Group(), wood = '#947958', kind = site.kind;
    const progress = 1 - site.workLeft / BLUEPRINTS[kind].seconds;
    function binding(x: number, y: number, z: number) {
        for (let i = 0; i < 3; i++) {
            const tie = mesh(new T.TorusGeometry(.085, .013, 4, 10), '#c0ae77', group, x, y + i * .035, z); tie.rotation.x = Math.PI / 2;
        }
    }
    if (kind === 'signal') {
        for (let i = 0; i < Math.max(1, Math.ceil(progress * 6)); i++) {
            const angle = i % 3 * Math.PI / 3, sign = i < 3 ? -1 : 1;
            pole(group, new T.Vector3(0, .07, 0), new T.Vector3(Math.cos(angle) * 3.7 * sign, .07, Math.sin(angle) * 3.7 * sign), .09, wood);
        }
        return group;
    }
    if (kind === 'firepit') {
        const hearth = mesh(new T.CircleGeometry(.7, 24), site.burning || !site.fuelSeconds ? '#777364' : '#b6a88a', group, 0, .025, 0); hearth.rotation.x = -Math.PI / 2;
        for (let i = 0; i < Math.min(7, Math.ceil(site.fuelSeconds / 1000)); i++) {
            const angle = i * 2.4;
            pole(group, new T.Vector3(Math.cos(angle) * -.55, .08, Math.sin(angle) * -.55), new T.Vector3(Math.cos(angle) * .55, .12, Math.sin(angle) * .55), .055, '#65523e');
        }
        if (site.burning && site.fuelSeconds > 0) {
            for (let i = 0; i < 3; i++) {
                const flame = mesh(new T.ConeGeometry(.12, .4 + i * .08, 7), '#f7c15c', group, Math.sin(i * 2.3) * .12, .29, Math.cos(i * 2.3) * .12);
                (flame.material as T.MeshStandardMaterial).emissive.set('#bc480e');
            }
        }
        return group;
    }
    if (kind === 'latrine') {
        const { halfWidth, offset, height } = LATRINE_SCREEN;
        for (const x of [-halfWidth, halfWidth].slice(0, progress > .15 ? 2 : 1)) {
            pole(group, new T.Vector3(x, 0, offset), new T.Vector3(x, height, offset), .055, wood);
            if (progress > .25) { binding(x, height - .12, offset); }
        }
        if (progress > .25) {
            pole(group, new T.Vector3(-halfWidth, height - .08, offset), new T.Vector3(halfWidth, height - .08, offset), .025, '#c0ae77');
            const count = Math.ceil((progress - .25) / .75 * 8);
            for (let i = 0; i < count; i++) {
                const leaf = foliage.leaf('palm', height, .9, .03, 0); leaf.rotation.x = -Math.PI / 2;
                leaf.position.set(-halfWidth + (i + .5) * halfWidth / 4, .03, offset + i % 2 * .035); group.add(leaf);
            }
        }
        return group;
    }
    const shelter = kind === 'shelter', width = shelter ? 3.8 : 1.65, depth = shelter ? 2.5 : 1.65;
    const high = shelter ? 2.1 : 1.45, low = shelter ? 1.35 : 1.1;
    const posts = [[-width / 2, -depth / 2], [width / 2, -depth / 2], [-width / 2, depth / 2], [width / 2, depth / 2]];
    for (const [x, z] of posts.slice(0, Math.max(1, Math.ceil(progress / .2 * 4)))) {
        const height = z < 0 ? high : low;
        pole(group, new T.Vector3(x, 0, z), new T.Vector3(x + .025, height, z), .065, wood);
        if (progress > .2) { binding(x, height - .13, z); }
    }
    if (progress > .2) {
        for (const z of [-depth / 2, depth / 2]) {
            const height = z < 0 ? high : low;
            pole(group, new T.Vector3(-width / 2 - .18, height, z), new T.Vector3(width / 2 + .18, height, z), .05, wood);
        }
        for (const x of [-width / 2, 0, width / 2]) {
            pole(group, new T.Vector3(x, high, -depth / 2), new T.Vector3(x, low, depth / 2), .035, '#aa9772');
        }
    }
    if (progress > .4) {
        const count = shelter ? 8 : 4, covered = Math.ceil((progress - .4) / .6 * count);
        for (let i = 0; i < covered; i++) {
            const leaf = foliage.leaf('palm', depth + .8, .95, .12, high - low);
            leaf.position.set(-width / 2 + (i + .5) / count * width, high + .07 + i % 2 * .02, -depth / 2 - .25); group.add(leaf);
        }
    }
    if (kind === 'raincatcher' && site.workLeft === 0) {
        const bowl = mesh(new T.SphereGeometry(.6, 18, 8, 0, Math.PI * 2, Math.PI * .52, Math.PI * .48), '#708553', group, 0, .45, 0);
        (bowl.material as T.MeshStandardMaterial).side = T.DoubleSide;
        if (site.water?.millilitres) {
            const fullness = site.water.millilitres / BLUEPRINTS.raincatcher.capacity;
            const water = mesh(new T.CircleGeometry(.2 + fullness * .33, 24), '#77b6b6', group, 0, .11 + fullness * .27, 0); water.rotation.x = -Math.PI / 2;
        }
    }
    return group;
}
