import { Float32BufferAttribute, Matrix4, Mesh, MeshStandardMaterial, type BufferGeometry, type Group } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { SceneKit } from '../scene-kit.js';
import { LOCAL_LIFE, type LocalResident } from '../content/local-life.js';
import type { CourtyardScene } from '../content/world-types.js';
import type { Point } from '../types.js';
import { localElapsed, localPose } from '../world/local-life.js';
import { LAND } from './world-palette.js';

/** Vertex pigments let every moving part use one shared material rather than a draw per colour. */
function bakePart(root: Group, material: MeshStandardMaterial) {
    root.updateWorldMatrix(true, true);
    const inverse = root.matrixWorld.clone().invert(), transform = new Matrix4();
    const pieces: BufferGeometry[] = [];
    root.traverse(object => {
        if (!(object instanceof Mesh)) { return; }
        const geometry = (object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone())
            .applyMatrix4(transform.multiplyMatrices(inverse, object.matrixWorld));
        const pigment = (object.material as MeshStandardMaterial).color, color = new Float32BufferAttribute(new Float32Array(geometry.getAttribute('position').count * 3), 3);
        for (let i = 0; i < color.count; i++) { color.setXYZ(i, pigment.r, pigment.g, pigment.b); }
        geometry.setAttribute('color', color); pieces.push(geometry);
    });
    const merged = mergeGeometries(pieces); pieces.forEach(geometry => geometry.dispose());
    if (!merged) { throw new Error('expedition_geometry_merge'); }
    root.clear(); const mesh = new Mesh(merged, material); mesh.receiveShadow = true; root.add(mesh);
    return () => { merged.dispose(); root.clear(); };
}

function residentModel(k: SceneKit, parent: Group, resident: LocalResident, material: MeshStandardMaterial) {
    const root = k.group(parent), body = k.group(root), arms: Group[] = [], legs: Group[] = [];
    const coat = { blue: LAND.slate, rose: LAND.rose, cream: LAND.cloth }[resident.coat];
    const seated = resident.activity === 'mend' || resident.activity === 'warm', skin = '#dfbda7';
    const height = seated ? .75 : 1.05;
    k.mesh(body, 'box', coat, [.59, .68, .38], [0, height, 0]);
    k.mesh(body, 'crown', skin, [.23, .27, .21], [0, height + .61, 0]);
    k.mesh(body, 'crown', LAND.timber, [.245, .17, .225], [0, height + .77, -.02]);
    k.mesh(body, 'box', LAND.wood, [.62, .055, .41], [0, height - .23, 0]);
    k.mesh(body, 'box', LAND.cloth, [.26, .35, .04], [0, height + .12, .21]);
    for (const side of [-1, 1]) {
        const arm = k.group(root, [side * .36, height + .22, 0]); arms.push(arm);
        k.mesh(arm, 'box', coat, [.17, .44, .19], [0, -.2, 0]);
        k.mesh(arm, 'crown', skin, [.1, .11, .1], [0, -.46, .02]);
        const leg = k.group(root, [side * .16, height - .31, 0]); legs.push(leg);
        k.mesh(leg, 'box', LAND.timber, [.2, seated ? .3 : .59, .22], [0, seated ? -.12 : -.26, seated ? .2 : 0]);
        k.mesh(leg, 'box', LAND.shadow, [.22, .16, .34], [0, seated ? -.34 : -.56, .07]);
    }
    if (seated) { k.mesh(body, 'box', LAND.wood, [.62, .55, .6], [0, .275, -.12]); }
    if (resident.activity === 'water') {
        for (const side of [-1, 1]) { k.mesh(arms[side > 0 ? 1 : 0], 'box', LAND.wood, [.36, .39, .36], [side * .13, -.65, 0]); }
    } else if (resident.activity === 'deliver') {
        k.mesh(body, 'box', LAND.wood, [.65, .47, .5], [0, height - .05, .45]);
        k.mesh(body, 'box', LAND.light, [.18, .17, .025], [0, height - .05, .72]);
    } else if (resident.activity === 'mend' || resident.activity === 'dressings') {
        k.mesh(body, 'box', LAND.light, [.52, .055, .4], [0, height - .22, .36]);
    } else if (resident.activity === 'warm') {
        k.mesh(body, 'box', LAND.pottery, [.2, .22, .2], [0, height + .1, .38]);
    }
    // Low-poly shared primitives; ordinary residents do not request another shadow pass.
    root.traverse(object => { object.castShadow = false; });
    const release = [body, ...arms, ...legs].map(part => bakePart(part, material));
    return { root, body, arms, legs, dispose() { release.forEach(dispose => dispose()); root.removeFromParent(); } };
}

export function buildLocalLife(k: SceneKit, parent: Group, scene: CourtyardScene) {
    const material = new MeshStandardMaterial({ vertexColors: true, roughness: .95 });
    const residents = (LOCAL_LIFE[scene] ?? []).map(spec => ({ spec, model: residentModel(k, parent, spec, material), time: 0 }));
    let previous: number | null = null;
    let wasReduced: boolean | null = null;
    return {
        animate(player: Point, now: number, reduced: boolean, inView: (point: Point) => boolean) {
            const elapsed = reduced ? 0 : localElapsed(previous, now); previous = now;
            let changed = residents.length > 0 && wasReduced !== reduced; wasReduced = reduced;
            for (const resident of residents) {
                const { spec, model } = resident, before = localPose(spec, resident.time);
                const visible = Math.hypot(before.position.x - player.x, before.position.y - player.y) < 27 && inView(before.position);
                if (model.root.visible !== visible) { model.root.visible = visible; changed = true; }
                if (!visible) { continue; }
                resident.time += elapsed;
                const pose = localPose(spec, resident.time), motion = reduced ? 0 : Math.sin(resident.time * (pose.walking ? 5.5 : 1.5) + spec.phase);
                model.root.position.set(pose.position.x, 0, pose.position.y); model.root.rotation.y = pose.facing;
                model.body.position.y = pose.walking ? Math.abs(motion) * .035 : 0;
                model.legs.forEach((leg, i) => { leg.rotation.x = pose.walking ? motion * .35 * (i ? 1 : -1) : 0; });
                model.arms.forEach((arm, i) => {
                    arm.rotation.x = pose.walking ? motion * .24 * (i ? -1 : 1) : -.6 + motion * .13 * (i ? 1 : -1);
                    if (spec.activity === 'deliver') { arm.rotation.x = -.75; }
                    if (spec.activity === 'warm') { arm.rotation.x = -1.1; }
                    if (spec.activity === 'cook' && !i) { arm.rotation.x = -.8 + motion * .3; }
                });
                changed = elapsed > 0 || changed;
            }
            return changed;
        },
        dispose() { residents.forEach(resident => resident.model.dispose()); material.dispose(); },
    };
}
