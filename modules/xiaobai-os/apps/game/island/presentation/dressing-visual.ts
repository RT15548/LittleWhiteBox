import * as T from 'three';
import type { VisibleDressing } from './survivor-visual.js';
import { fabricAppearance } from './garment-material.js';

// The simulation distinguishes foot/skin, not individual wound coordinates.
// An ankle wrap and forearm wrap are visual representatives, fitted to the existing skin.
function wrap(body: T.Object3D, start: T.Bone, end: T.Bone) {
    body.updateMatrixWorld(true);
    const direction = start.worldToLocal(end.getWorldPosition(new T.Vector3())), length = direction.length();
    const axis = direction.clone().normalize(), rotation = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), axis);
    const inverse = rotation.clone().invert(), point = new T.Vector3();
    let radiusX = 0, radiusZ = 0;
    body.traverse(object => {
        if (!(object instanceof T.SkinnedMesh)) { return; }
        let owner: T.Object3D | null = object;
        while (owner && !owner.userData.asset_role) { owner = owner.parent; }
        if (owner?.userData.asset_role !== 'body.skin') { return; }
        for (let i = 0; i < object.geometry.getAttribute('position').count; i++) {
            object.getVertexPosition(i, point).applyMatrix4(object.matrixWorld);
            start.worldToLocal(point).applyQuaternion(inverse);
            if (point.y < length * .66 || point.y > length * .92 || Math.hypot(point.x, point.z) > length * .4) { continue; }
            radiusX = Math.max(radiusX, Math.abs(point.x)); radiusZ = Math.max(radiusZ, Math.abs(point.z));
        }
    });
    if (!radiusX || !radiusZ) { throw new Error('island_dressing_fit'); }
    const root = new T.Group(), material = new T.MeshStandardMaterial({ roughness: .96, side: T.DoubleSide });
    root.quaternion.copy(rotation); root.position.copy(axis).multiplyScalar(length * .79); start.add(root);
    for (let i = 0; i < 3; i++) {
        const strip = new T.Mesh(new T.CylinderGeometry(1, 1, length * .105, 20, 1, true), material);
        strip.scale.set(radiusX + .004 + i * .001, 1, radiusZ + .004 + i * .001);
        strip.position.y = (i - 1) * length * .075; strip.castShadow = strip.receiveShadow = true; root.add(strip);
    }
    const dry = new T.Color('#e2e4d9');
    return { root, update(item: VisibleDressing | undefined) { root.visible = !!item; if (item) { fabricAppearance(material, dry, .96, item); } },
        dispose() { root.removeFromParent(); root.children.forEach(child => (child as T.Mesh).geometry.dispose()); material.dispose(); } };
}

export function createDressings(body: T.Object3D, bone: (name: string) => T.Bone) {
    const foot = wrap(body, bone('lowerleg01.L'), bone('foot.L'));
    let skin: ReturnType<typeof wrap>;
    try { skin = wrap(body, bone('lowerarm01.L'), bone('wrist.L')); }
    catch (error) { foot.dispose(); throw error; }
    return { anchor(wound: VisibleDressing['wound']) { return (wound === 'foot' ? foot : skin).root.getWorldPosition(new T.Vector3()); }, update(items: readonly VisibleDressing[]) {
        foot.update(items.find(item => item.wound === 'foot')); skin.update(items.find(item => item.wound === 'skin'));
    }, dispose() { foot.dispose(); skin.dispose(); } };
}
