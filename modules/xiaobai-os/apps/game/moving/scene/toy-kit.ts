import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry, TorusGeometry, type BufferGeometry, type Object3D } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { Point3 } from '../types.js';

/** One scene owns all its GPU resources; meshes share cached materials/geometries. */
export function createToyKit() {
    const materials = new Map<string, MeshStandardMaterial>();
    const geometries = new Map<string, BufferGeometry>();
    function mesh(parent: Object3D, key: string, geometry: () => BufferGeometry, color: string, position: Point3) {
        if (!geometries.has(key)) { geometries.set(key, geometry()); }
        if (!materials.has(color)) { materials.set(color, new MeshStandardMaterial({ color, roughness: .55, metalness: .02 })); }
        const result = new Mesh(geometries.get(key)!, materials.get(color)!);
        result.position.set(...position); result.castShadow = true; result.receiveShadow = true;
        parent.add(result); return result;
    }
    return {
        group(parent: Object3D, position: Point3 = [0, 0, 0]) {
            const group = new Group(); group.position.set(...position); parent.add(group); return group;
        },
        box(parent: Object3D, size: Point3, color: string, position: Point3, radius = .08) {
            const r = Math.min(radius, ...size.map(n => n / 2));
            return mesh(parent, `b:${size}:${r}`, () => new RoundedBoxGeometry(...size, 2, r), color, position);
        },
        ball(parent: Object3D, size: Point3, color: string, position: Point3) {
            const result = mesh(parent, 'ball', () => new SphereGeometry(1, 16, 12), color, position);
            result.scale.set(...size); return result;
        },
        cylinder(parent: Object3D, top: number, bottom: number, height: number, color: string, position: Point3, segments = 24) {
            return mesh(parent, `c:${top}:${bottom}:${height}:${segments}`, () => new CylinderGeometry(top, bottom, height, segments), color, position);
        },
        ring(parent: Object3D, radius: number, tube: number, color: string, position: Point3) {
            return mesh(parent, `t:${radius}:${tube}`, () => new TorusGeometry(radius, tube, 8, 32), color, position);
        },
        dispose() {
            geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
            geometries.clear(); materials.clear();
        },
    };
}
export type ToyKit = ReturnType<typeof createToyKit>;
