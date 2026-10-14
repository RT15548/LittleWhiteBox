import * as T from 'three';

const materials = new Map<string, T.MeshStandardMaterial>();
export function surface(color: string) {
    let material = materials.get(color);
    if (!material) { material = new T.MeshStandardMaterial({ color, roughness: 0.92 }); materials.set(color, material); }
    return material;
}
export function mesh(geometry: T.BufferGeometry, color: string, parent: T.Object3D, x = 0, y = 0, z = 0) {
    const object = new T.Mesh(geometry, surface(color)); object.position.set(x, y, z); object.castShadow = true; object.receiveShadow = true;
    parent.add(object); return object;
}
export function pole(parent: T.Object3D, from: T.Vector3, to: T.Vector3, width: number, color: string) {
    const p = mesh(new T.CylinderGeometry(width * .8, width, from.distanceTo(to), 7), color, parent);
    p.position.copy(from).add(to).multiplyScalar(.5); p.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), to.clone().sub(from).normalize()); return p;
}
export function disposeGroup(group: T.Object3D, retained: readonly T.Material[] = []) {
    const kept = new Set([...materials.values(), ...retained]);
    group.traverse(o => {
        if (!(o instanceof T.Mesh)) { return; }
        o.geometry.dispose();
        for (const material of Array.isArray(o.material) ? o.material : [o.material]) { if (!kept.has(material)) { material.dispose(); } }
    });
}
export function disposeSurfaces() { for (const material of materials.values()) { material.dispose(); } materials.clear(); }
