import { BoxGeometry, CylinderGeometry, SphereGeometry, TorusGeometry, MeshStandardMaterial, Mesh, Matrix4,
    type Group, type Object3D, type ColorRepresentation, type BufferGeometry } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type Point = [number, number, number];
type Finish = 'chalk' | 'enamel' | 'glass' | 'metal' | 'light' | 'cloud';
const FINISHES = {
    chalk: { roughness: 0.88, metalness: 0 },
    enamel: { roughness: 0.4, metalness: 0.03 },
    glass: { roughness: 0.23, metalness: 0.15 },
    metal: { roughness: 0.38, metalness: 0.35 },
    light: { roughness: 0.55, metalness: 0, emissiveIntensity: 0.55 },
    cloud: { roughness: 1, metalness: 0 },
} as const;

export function createResources() {
    const geometry = { box: new RoundedBoxGeometry(1, 1, 1, 2, 0.055), flat: new BoxGeometry(1, 1, 1),
        sphere: new SphereGeometry(1, 24, 16), rod: new CylinderGeometry(1, 1, 1, 16), ring: new TorusGeometry(1, 0.1, 8, 24) };
    const materials = new Map<string, MeshStandardMaterial>();
    const merged = new Set<BufferGeometry>();
    function material(color: ColorRepresentation, finish: Finish = 'chalk') {
        const key = `${color}:${finish}`;
        if (!materials.has(key)) { materials.set(key, new MeshStandardMaterial({ color, ...FINISHES[finish], emissive: finish === 'light' ? color : 0 })); }
        return materials.get(key)!;
    }
    function mesh(parent: Object3D, kind: keyof typeof geometry, color: ColorRepresentation, size: Point,
        position: Point, finish: Finish = 'chalk') {
        const object = new Mesh(geometry[kind], material(color, finish)); object.scale.set(...size); object.position.set(...position);
        object.castShadow = finish !== 'cloud'; object.receiveShadow = finish !== 'light'; parent.add(object); return object;
    }
    /** One draw per static surface, rather than one draw per window frame. */
    function batch(root: Group) {
        root.updateWorldMatrix(true, true);
        const inverse = root.matrixWorld.clone().invert();
        const buckets = new Map<MeshStandardMaterial, BufferGeometry[]>();
        root.traverse(object => {
            if (!(object instanceof Mesh)) { return; }
            const shape = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
            shape.applyMatrix4(new Matrix4().multiplyMatrices(inverse, object.matrixWorld));
            const surface = object.material as MeshStandardMaterial;
            const pieces = buckets.get(surface) ?? []; pieces.push(shape); buckets.set(surface, pieces);
        });
        root.clear();
        const owned: BufferGeometry[] = [], meshes: Mesh<BufferGeometry, MeshStandardMaterial>[] = [];
        for (const [surface, pieces] of buckets) {
            const shape = mergeGeometries(pieces); pieces.forEach(piece => piece.dispose());
            if (!shape) { throw new Error('building_geometry_merge'); }
            merged.add(shape); owned.push(shape);
            const object = new Mesh(shape, surface); object.castShadow = true; object.receiveShadow = true;
            root.add(object); meshes.push(object);
        }
        return {
            root,
            replace(from: MeshStandardMaterial, to: MeshStandardMaterial) {
                meshes.forEach(object => { if (object.material === from) { object.material = to; } });
            },
            dispose() { owned.forEach(shape => { if (merged.delete(shape)) { shape.dispose(); } }); },
        };
    }
    return { mesh, material, batch,
        dispose() {
            merged.forEach(shape => shape.dispose()); merged.clear(); Object.values(geometry).forEach(shape => shape.dispose());
            materials.forEach(surface => surface.dispose()); materials.clear();
        },
    };
}
export type Resources = ReturnType<typeof createResources>;
