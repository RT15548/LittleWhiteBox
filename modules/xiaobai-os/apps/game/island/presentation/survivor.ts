import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Activity, Item, ItemKind, PersonId } from '../model.js';
import { APPEARANCE } from './cast-appearance.js';
import { BODY, poseSurvivor, type Limb, type SurvivorRig } from './survivor-pose.js';
import { GARMENTS } from '../clothing.js';
import { garmentColor, wetFabric } from './garment-material.js';
import type { SurvivorVisual } from './survivor-visual.js';
import { disposeGroup } from './meshes.js';

function add(parent: T.Group, geometry: T.BufferGeometry, material: T.MeshStandardMaterial, x = 0, y = 0, z = 0) {
    const mesh = new T.Mesh(geometry, material); mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function ellipsoid(parent: T.Group, material: T.MeshStandardMaterial, size: [number, number, number], position: [number, number, number]) {
    const mesh = add(parent, new T.SphereGeometry(1, 14, 10), material, ...position); mesh.scale.set(...size); return mesh;
}
function section(parent: T.Group, material: T.MeshStandardMaterial, rows: [number, number][], depth = 1) {
    const mesh = add(parent, new T.LatheGeometry(rows.map(([r, y]) => new T.Vector2(r, y)), 16), material); mesh.scale.z = depth; return mesh;
}
function joint(parent: T.Group, x = 0, y = 0, z = 0) { const group = new T.Group(); group.position.set(x, y, z); parent.add(group); return group; }

// Merge rigid parts only within a joint, so small clothing details do not each cost a draw call.
function mergeRigidParts(group: T.Group) {
    for (const child of [...group.children]) { if (child instanceof T.Group) { mergeRigidParts(child); } }
    const batches = new Map<T.MeshStandardMaterial, T.BufferGeometry[]>();
    for (const child of [...group.children]) {
        if (!(child instanceof T.Mesh) || !(child.material instanceof T.MeshStandardMaterial)) { continue; }
        child.updateMatrix();
        const geometry = child.geometry.index ? child.geometry.toNonIndexed() : child.geometry.clone();
        geometry.applyMatrix4(child.matrix); geometry.deleteAttribute('uv');
        const parts = batches.get(child.material) ?? []; parts.push(geometry); batches.set(child.material, parts);
        child.geometry.dispose(); group.remove(child);
    }
    for (const [material, parts] of batches) {
        const geometry = mergeGeometries(parts); parts.forEach(p => p.dispose());
        if (!geometry) { throw new Error('island_survivor_geometry'); }
        add(group, geometry, material);
    }
}

function hairCap(style: typeof APPEARANCE.player.hair) {
    const positions: number[] = [], indices: number[] = [], rows = 10, columns = 24;
    for (let row = 0; row <= rows; row++) { for (let column = 0; column <= columns; column++) {
        const phi = column / columns * Math.PI * 2, back = (1 - Math.cos(phi)) / 2;
        const edge = style === 'bob' || style === 'wavy' ? 1.45 + back * 1.25 : 1.35 + back * .65;
        const theta = row / rows * edge;
        const wave = style === 'wavy' ? 1 + Math.sin(phi * 7) * .055 : 1;
        positions.push(Math.sin(theta) * Math.sin(phi) * .126 * wave,
            Math.cos(theta) * .155 - (style === 'bob' && theta > 1.5 ? (theta - 1.5) * .06 : 0),
            Math.sin(theta) * Math.cos(phi) * .125 * wave);
        if (row < rows && column < columns) { const a = row * (columns + 1) + column, b = a + columns + 1; indices.push(a, b, a + 1, a + 1, b, b + 1); }
    } }
    const geometry = new T.BufferGeometry(); geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
}

export function survivor(id: Exclude<PersonId, 'ye'>, worn: ItemKind[], dead: boolean): SurvivorVisual {
    const appearance = APPEARANCE[id], root = new T.Group(), body = joint(root), scale = appearance.height / BODY.stature;
    body.scale.set(scale * appearance.build, scale, scale);
    const skin = new T.MeshStandardMaterial({ color: appearance.skin, roughness: .82 }), hair = new T.MeshStandardMaterial({ color: '#38352f', roughness: .95 });
    const dark = new T.MeshStandardMaterial({ color: '#454d4d', roughness: .86 });
    const cloth = new Map<ItemKind, T.MeshStandardMaterial>();
    function fabric(kind: ItemKind) {
        const spec = GARMENTS[kind]!;
        const material = new T.MeshStandardMaterial({ color: garmentColor(spec), roughness: spec.dryRoughness }); cloth.set(kind, material); return material;
    }
    const upperKind = worn.find(kind => GARMENTS[kind]?.slot === 'upper'), lowerKind = worn.find(kind => GARMENTS[kind]?.slot === 'lower');
    const innerUpper = worn.find(kind => GARMENTS[kind]?.slot === 'upper_inner'), innerLower = worn.find(kind => GARMENTS[kind]?.slot === 'lower_inner');
    const footKind = worn.find(kind => GARMENTS[kind]?.slot === 'feet');
    const shirt = upperKind ? fabric(upperKind) : innerUpper ? fabric(innerUpper) : skin;
    const trousers = lowerKind ? fabric(lowerKind) : skin, underwear = !lowerKind && innerLower ? fabric(innerLower) : trousers;
    const feet = footKind ? fabric(footKind) : skin;
    const hips = joint(body, 0, BODY.hipY), spine = joint(hips), head = joint(spine, 0, BODY.headY);
    ellipsoid(hips, underwear, [.17, .105, .115], [0, -.025, 0]);
    section(spine, shirt, [[.135, -.04], [.15, .06], [.17, .2], [.205, .36], [.225, .43], [.18, .49], [.065, .53]], .62);
    add(spine, new T.CylinderGeometry(.048, .055, .10, 12), skin, 0, .565);
    ellipsoid(head, skin, [.112, BODY.headRadius, .108], [0, 0, 0]);
    add(head, hairCap(appearance.hair), hair, 0, .006, -.012);
    ellipsoid(head, skin, [.024, .032, .024], [0, -.005, .104]);
    for (const sign of [-1, 1]) {
        ellipsoid(head, skin, [.021, .037, .017], [sign * .111, -.005, 0]);
        ellipsoid(head, dark, [.012, .006, .004], [sign * .044, .031, .10]);
        add(head, new T.BoxGeometry(.035, .008, .008), hair, sign * .044, .053, .10);
    }
    if (appearance.hair === 'tied') {
        const tail = new T.CatmullRomCurve3(dead
            ? [new T.Vector3(0, -.015, -.095), new T.Vector3(.08, -.12, -.098), new T.Vector3(.12, -.30, -.10)]
            : [new T.Vector3(0, -.015, -.12), new T.Vector3(.01, -.10, -.19), new T.Vector3(.015, -.29, -.18)]);
        add(head, new T.TubeGeometry(tail, 10, .038, 8, false), hair);
    }
    if (upperKind) {
        add(spine, new T.BoxGeometry(.014, .4, .009), shirt, 0, .23, .129);
        for (let i = 0; i < 4; i++) { ellipsoid(spine, dark, [.009, .009, .004], [0, .1 + i * .09, .137]); }
        for (const sign of [-1, 1]) {
            const collar = add(spine, new T.BoxGeometry(.065, .085, .012), shirt, sign * .047, .482, .077);
            collar.rotation.z = sign * .45; collar.rotation.x = -.3;
        }
    }
    const legs: Limb[] = [], arms: Limb[] = [];
    for (const sign of [-1, 1]) {
        const base = joint(hips, sign * .10, 0), bend = joint(base, 0, -BODY.thigh), end = joint(bend, 0, -BODY.shin);
        section(base, trousers, [[.069, -BODY.thigh - .01], [.082, -.24], [.096, -.04], [.084, .015]]);
        ellipsoid(bend, trousers, [.07, .071, .07], [0, 0, 0]);
        section(bend, trousers, [[.045, -BODY.shin], [.056, -.25], [.071, -.035], [.067, .005]]);
        ellipsoid(end, feet, [.054, .05, .135], [0, -.015, .057]);
        if (worn.includes('shoes')) { const sole = add(end, new T.BoxGeometry(.104, .018, .24), dark, 0, -.054, .047); sole.rotation.x = -.015; }
        legs.push({ base, bend, end });
        const upper = joint(spine, sign * .222, .435), elbow = joint(upper, 0, -BODY.upperArm), wrist = joint(elbow, 0, -BODY.forearm);
        section(upper, skin, [[.042, -BODY.upperArm], [.063, -.065], [.059, .02]]);
        ellipsoid(upper, shirt, [.072, .077, .073], [0, -.016, 0]);
        if (upperKind) {
            section(upper, shirt, [[.064, -.16], [.073, -.04], [.066, .015]]);
            add(upper, new T.CylinderGeometry(.066, .064, .024, 12), shirt, 0, -.155);
        }
        ellipsoid(elbow, skin, [.043, .048, .043], [0, 0, 0]);
        section(elbow, skin, [[.027, -BODY.forearm], [.045, -.07], [.04, .005]]);
        ellipsoid(wrist, skin, [.035, .055, .023], [0, -.039, .01]);
        ellipsoid(wrist, skin, [.017, .028, .019], [-sign * .027, -.024, .026]);
        arms.push({ base: upper, bend: elbow, end: wrist });
    }
    if (worn.includes('lifejacket')) {
        const vest = fabric('lifejacket');
        for (const sign of [-1, 1]) {
            const pad = add(spine, new T.CapsuleGeometry(.07, .27, 5, 10), vest, sign * .105, .285, .14); pad.scale.set(1.05, 1, .66);
            add(spine, new T.BoxGeometry(.14, .028, .015), dark, sign * .104, .19, .19);
        }
        const collar = new T.CatmullRomCurve3([new T.Vector3(-.15, .43, .08), new T.Vector3(-.10, .55, -.05), new T.Vector3(0, .56, -.09), new T.Vector3(.10, .55, -.05), new T.Vector3(.15, .43, .08)]);
        add(spine, new T.TubeGeometry(collar, 14, .047, 8, false), vest);
        add(spine, new T.BoxGeometry(.054, .034, .016), dark, 0, .19, .2);
    }
    mergeRigidParts(body);
    const rig: SurvivorRig = { hips, spine, head, legs, arms }, hand = joint(root), covering = joint(root, 0, .36 * scale), headAnchor = joint(head, 0, .23);
    const handPosition = new T.Vector3(), handOffset = new T.Vector3(0, -.03, .045);
    return { root, hand, covering, headAnchor,
        wetness(items: readonly Pick<Item, 'kind' | 'wetness'>[]) {
            for (const item of items) { const material = cloth.get(item.kind); if (material) { wetFabric(material, GARMENTS[item.kind]!, item.wetness); } }
        },
        pose(phase: number, moving: boolean, activity: Activity['kind'] | null) {
            poseSurvivor(rig, phase, moving, activity, dead);
            root.updateMatrixWorld(true); arms[1].end.getWorldPosition(handPosition); root.worldToLocal(handPosition);
            hand.position.copy(handPosition).add(handOffset);
        },
        dispose() { disposeGroup(root); },
    };
}
