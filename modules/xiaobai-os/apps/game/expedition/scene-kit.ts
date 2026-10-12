import { BoxGeometry, type BufferGeometry, CircleGeometry, ConeGeometry, CylinderGeometry, DoubleSide, ExtrudeGeometry, Group, IcosahedronGeometry,
    Mesh, MeshBasicMaterial, MeshStandardMaterial, RingGeometry, Shape, ShapeGeometry, SphereGeometry, TorusGeometry,
    Matrix4, type Material, type Object3D, type Texture } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export type Vec3 = [number, number, number];
/** Scene-owned shared resources. Static architecture is baked by material, not drawn block by block. */
export function createSceneKit(textures?: ReadonlyMap<string, Texture>) {
    const archProfile = new Shape(); archProfile.absarc(0, 0, 1.1, 0, Math.PI, false);
    archProfile.lineTo(-.86, 0); archProfile.absarc(0, 0, .86, Math.PI, 0, true); archProfile.closePath();
    const geometries = {
        box: new BoxGeometry(1, 1, 1), sphere: new SphereGeometry(1, 20, 14), rock: new IcosahedronGeometry(1, 0), crown: new IcosahedronGeometry(1, 1),
        cylinder: new CylinderGeometry(1, 1, 1, 24), cone: new ConeGeometry(1, 1, 12),
        disc: new CircleGeometry(1, 48), ring: new RingGeometry(.965, 1, 64),
        arc: new RingGeometry(.87, 1, 40, 1, -.2, Math.PI * 1.3), torus: new TorusGeometry(1, .08, 8, 40),
        stroke: new RingGeometry(.975, 1, 48, 1, -.2, Math.PI * 1.3),
        crescent: new TorusGeometry(1, .14, 6, 24, Math.PI * 1.45),
        arch: new ExtrudeGeometry(archProfile, { depth: 1, bevelEnabled: false, curveSegments: 24 }).translate(0, 0, -.5),
    };
    const shapes = new Map<string, BufferGeometry>(), materials = new Map<string, MeshStandardMaterial | MeshBasicMaterial>();
    const texturedGeometry = new Set<BufferGeometry>();
    function material(color: string, flat = false, opacity = 1, metal = false) {
        const key = `${color}/${flat}/${opacity}/${metal}`;
        let m = materials.get(key);
        if (!m) {
            m = flat ? new MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity === 1, side: DoubleSide })
                : new MeshStandardMaterial({ color, map: textures?.get(color) ?? null, roughness: metal ? .34 : .88, metalness: metal ? .45 : .02, side: DoubleSide });
            materials.set(key, m);
        }
        return m;
    }
    function mesh(parent: Object3D, kind: keyof typeof geometries, color: string, size: Vec3, pos: Vec3 = [0, 0, 0], flat = false, opacity = 1, metal = false) {
        let geometry = geometries[kind];
        if (!flat && kind === 'box' && textures?.has(color)) {
            geometry = geometry.clone(); texturedGeometry.add(geometry);
            const positions = geometry.getAttribute('position'), normals = geometry.getAttribute('normal'), uv = geometry.getAttribute('uv');
            for (let i = 0; i < uv.count; i++) {
                const u = Math.abs(normals.getX(i)) > .5 ? positions.getZ(i) * size[2] : positions.getX(i) * size[0];
                const v = Math.abs(normals.getY(i)) > .5 ? positions.getZ(i) * size[2] : positions.getY(i) * size[1];
                uv.setXY(i, u / 8, v / 8);
            }
        }
        const m = new Mesh(geometry, material(color, flat, opacity, metal));
        m.scale.set(...size); m.position.set(...pos); m.castShadow = !flat; m.receiveShadow = !flat; parent.add(m); return m;
    }
    function group(parent: Object3D, pos: Vec3 = [0, 0, 0]) { const g = new Group(); g.position.set(...pos); parent.add(g); return g; }
    function ring(parent: Object3D, color: string, radius: number, x: number, z: number, opacity = 1, filled = false, height = .04) {
        const m = mesh(parent, filled ? 'disc' : 'ring', color, [radius, radius, 1], [x, height, z], true, opacity); m.rotation.x = -Math.PI / 2; return m;
    }
    function shape(parent: Object3D, points: readonly [number, number][], color: string, pos: Vec3 = [0, 0, 0], depth = 0) {
        const textured = textures?.has(color) ?? false;
        const key = JSON.stringify([points, depth, textured]); let geo = shapes.get(key);
        if (!geo) {
            const s = new Shape(); points.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath();
            geo = depth ? new ExtrudeGeometry(s, { depth, steps: 1, bevelEnabled: true, bevelThickness: depth * .3, bevelSize: depth * .3, bevelSegments: 2 }) : new ShapeGeometry(s);
            if (textured) {
                const uv = geo.getAttribute('uv');
                for (let i = 0; i < uv.count; i++) { uv.setXY(i, uv.getX(i) / 8, uv.getY(i) / 8); }
            }
            shapes.set(key, geo);
        }
        const m = new Mesh(geo, material(color)); m.position.set(...pos); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
    }
    function bake(root: Group) {
        root.updateMatrixWorld(true);
        const inverse = root.matrixWorld.clone().invert(), local = new Matrix4();
        const batches = new Map<string, { material: Material; castShadow: boolean; receiveShadow: boolean; geometries: BufferGeometry[] }>();
        root.traverse(o => {
            if (!(o instanceof Mesh) || Array.isArray(o.material)) { return; }
            const geo = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(local.multiplyMatrices(inverse, o.matrixWorld));
            // All environment primitives have position/normal/uv; batching preserves their lighting.
            const key = `${o.material.uuid}/${o.castShadow}/${o.receiveShadow}`;
            let batch = batches.get(key);
            if (!batch) { batch = { material: o.material, castShadow: o.castShadow, receiveShadow: o.receiveShadow, geometries: [] }; batches.set(key, batch); }
            batch.geometries.push(geo);
        });
        root.clear();
        const baked: BufferGeometry[] = [];
        for (const { material: mat, castShadow, receiveShadow, geometries: list } of batches.values()) {
            const merged = mergeGeometries(list); list.forEach(g => g.dispose());
            if (!merged) { throw new Error('expedition_geometry_merge'); }
            const mesh = new Mesh(merged, mat); mesh.castShadow = castShadow; mesh.receiveShadow = receiveShadow;
            root.add(mesh); baked.push(merged);
        }
        return () => { root.clear(); baked.forEach(g => g.dispose()); };
    }
    return { mesh, group, ring, shape, material, bake, geometries,
        dispose() { Object.values(geometries).forEach(g => g.dispose()); shapes.forEach(g => g.dispose()); texturedGeometry.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); } };
}
export type SceneKit = ReturnType<typeof createSceneKit>;
