import * as T from 'three';
import { mesh, pole } from './meshes.js';
import type { Foliage, LeafKind } from './foliage.js';

export function palm(seed: number, foliage: Foliage) {
    const group = new T.Group(), height = 5.3 + (seed % 7) * .35, lean = Math.sin(seed) * 1.2;
    const curve = new T.CatmullRomCurve3([new T.Vector3(0, 0, 0), new T.Vector3(lean * .25, height * .5, .1), new T.Vector3(lean, height, .3)]);
    const trunk = new T.TubeGeometry(curve, 14, .18, 9, false), positions = trunk.getAttribute('position'), uv = trunk.getAttribute('uv');
    const point = new T.Vector3();
    for (let i = 0; i < positions.count; i++) {
        const along = uv.getX(i), centre = curve.getPointAt(along), radius = .24 - .1 * along;
        point.fromBufferAttribute(positions, i).sub(centre).multiplyScalar(radius / .18).add(centre);
        positions.setXYZ(i, point.x, point.y, point.z);
    }
    trunk.computeVertexNormals(); mesh(trunk, '#aa9b7d', group);
    for (let i = 1; i < 13; i++) {
        const along = i / 14, ring = mesh(new T.TorusGeometry(.24 - .1 * along, .008, 3, 9), '#877f67', group);
        ring.position.copy(curve.getPointAt(along)); ring.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), curve.getTangentAt(along));
    }
    for (let i = 0; i < 11; i++) {
        const angle = i * Math.PI * 2 / 11 + seed, length = 3.1 + .5 * Math.sin(seed + i);
        const leaf = foliage.leaf('palm', length, 1.65, i < 8 ? .65 : 1, i < 8 ? .6 : -.45);
        leaf.position.set(lean, height - (i < 8 ? .1 : 0), .3); leaf.rotation.y = angle; group.add(leaf);
    }
    // Old attached fronds are part of the tree silhouette, not collectible ground inventory.
    for (let i = 0; i < 2; i++) {
        const leaf = foliage.leaf('dry', 2.5, 1.1, .1, 1.8); leaf.rotation.y = seed + i * 3;
        leaf.position.set(lean, height - .35, .3); group.add(leaf);
    }
    return group;
}

function crown(group: T.Group, foliage: Foliage, kind: LeafKind, centre: T.Vector3, seed: number, size: number) {
    for (let layer = 0; layer < 2; layer++) { for (let i = 0; i < 6; i++) {
        const leaf = foliage.leaf(kind, size, size * .85, .25, -.15), angle = seed + i * Math.PI / 3 + layer * .6;
        leaf.position.copy(centre).add(new T.Vector3(0, layer * .3, 0)); leaf.rotation.set(layer ? -.5 : .18, angle, .08 * Math.sin(i)); group.add(leaf);
    } }
}

export function coastalPlant(seed: number, foliage: Foliage, height: number) {
    const group = new T.Group();
    for (let i = 0; i < 3; i++) {
        const angle = seed + i * 2.4, x = Math.cos(angle) * height * .35, z = Math.sin(angle) * height * .35;
        const end = new T.Vector3(x, height * (.75 + i * .1), z);
        pole(group, new T.Vector3(0, 0, 0), end, height * .035, '#887d61');
        crown(group, foliage, 'coastal', end, angle, height * .6);
    }
    return group;
}

export function mangrove(seed: number, foliage: Foliage) {
    const group = new T.Group(), height = 2.6 + seed % 4 * .3;
    for (let i = 0; i < 6; i++) {
        const angle = seed + i * Math.PI / 3, radius = 1.2 + .2 * Math.sin(i + seed);
        const curve = new T.QuadraticBezierCurve3(new T.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
            new T.Vector3(Math.cos(angle) * .8, 1.25, Math.sin(angle) * .8), new T.Vector3(0, 1.4, 0));
        mesh(new T.TubeGeometry(curve, 7, .055, 6, false), '#7c7862', group);
    }
    pole(group, new T.Vector3(0, .6, 0), new T.Vector3(.1, height, 0), .14, '#797c65');
    for (let i = 0; i < 4; i++) {
        const angle = seed + i * Math.PI / 2, end = new T.Vector3(Math.cos(angle) * .9, height + .2 * Math.sin(i), Math.sin(angle) * .9);
        pole(group, new T.Vector3(.1, height - .8, 0), end, .055, '#82806a'); crown(group, foliage, 'mangrove', end, angle, 1.35);
    }
    return group;
}

export function thicket(seed: number, foliage: Foliage) {
    const group = new T.Group();
    for (let i = 0; i < 2; i++) {
        const angle = seed + i * 2.4, plant = coastalPlant(seed + i, foliage, 1.5 + i * .25);
        plant.position.set(Math.cos(angle) * .6, 0, Math.sin(angle) * .6); group.add(plant);
    }
    return group;
}
