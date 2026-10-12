import { Box3, BufferGeometry, ConeGeometry, CylinderGeometry, Float32BufferAttribute, Group, IcosahedronGeometry, Mesh, SphereGeometry, Vector3 } from 'three';
import type { MapElement, MapMaterial } from '../../../../domains/map/types.js';
import type { Scene3DResources } from './scene3d-resources.js';
import type { createSceneMaterials } from './scene3d-materials.js';
import { sweepGeometry } from './scene3d-growth.js';
import { type SCULPTED_SURFACES, formSurface } from '../scene-forms.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Authored footprints select static local sculptures, never animations or extra entities. */
export function createSculptures(resources: Scene3DResources, materials: ReturnType<typeof createSceneMaterials>) {
    const sphere = resources.own(new SphereGeometry(1, 20, 14));
    const cone = resources.own(new ConeGeometry(1, 1, 6));
    const cylinder = resources.own(new CylinderGeometry(1, 1, 1, 12));
    const gem = resources.own(new IcosahedronGeometry(1, 0));
    const prototypes = new Map<string, { group: Group; box: Box3; radius: number }>();
    return (parent: Group, element: MapElement, width: number, depth: number): number => {
        const kind = element.icon as keyof typeof SCULPTED_SURFACES;
        const material = formSurface(element)!;
        const key = `${kind}:${material}:${element.certainty}:${element.category}`;
        if (!prototypes.has(key)) {
            const sculpture = new Group();
            function part(geometry: BufferGeometry, x: number, y: number, z: number, sx: number, sy: number, sz: number, tint = 0, surface: MapMaterial = material) {
                const mesh = new Mesh(geometry, materials.mesh({ ...element, material: surface }, tint));
                mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz);
                mesh.castShadow = mesh.material.opacity >= .8; mesh.receiveShadow = true;
                sculpture.add(mesh); return mesh;
            }
            function eyes(x: number, y: number, z: number, radius: number) {
                for (const side of [-1, 1]) {part(sphere, side * x, y, z, radius, radius * 1.4, radius * .65, -.92, 'stone');}
            }
            if (kind === 'slime') {
                part(sphere, 0, .25, 0, .47, .25, .45);
                part(sphere, -.04, .48, -.03, .34, .38, .33, .06);
                eyes(.105, .49, .29, .028);
            } else if (kind === 'mushroom') {
                part(cylinder, 0, .34, 0, .105, .68, .1, .25, 'wood');
                part(sphere, 0, .65, 0, .5, .22, .48);
                part(sphere, 0, .60, 0, .46, .04, .44, .45, 'fabric');
                for (const [x, z, r] of [[-.18, -.08, .06], [.18, .14, .055], [.08, -.26, .045], [-.25, .19, .04]]) {
                    part(sphere, x, .82 - (x * x + z * z) * .48, z, r, .022, r, .65);
                }
            } else if (kind === 'crystal') {
                part(gem, 0, .62, 0, .23, .64, .24, .05).rotation.z = -.12;
                part(gem, -.28, .3, .14, .13, .38, .15, -.13).rotation.z = .3;
                part(gem, .27, .26, -.05, .15, .34, .17, .12).rotation.z = -.36;
            } else if (kind === 'dragon') {
                part(sphere, 0, .35, .02, .16, .22, .28);
                part(sphere, 0, .62, .22, .095, .24, .11, .04).rotation.x = -.3;
                part(sphere, 0, .84, .3, .12, .11, .18, .12);
                part(sphere, 0, .79, .41, .085, .05, .13, .2);
                for (const side of [-1, 1]) {
                    for (const z of [-.13, .21]) {part(sphere, side * .15, .15, z, .065, .16, .065, -.08);}
                    part(cone, side * .08, .99, .23, .035, .2, .045, .35, 'wood').rotation.z = -side * .3;
                    // One membrane with a raised leading edge and scalloped trailing edge.
                    const rings = [new Vector3(side * .1, .46, -.06), new Vector3(side * .26, .7, -.24), new Vector3(side * .47, .85, -.26)];
                    const rib = new Mesh(resources.own(sweepGeometry(rings, t => .022 * (1 - t * .8), 6)), materials.mesh({ ...element, material }, .2));
                    sculpture.add(rib);
                    const wing = resources.own(new BufferGeometry());
                    const edge = [[.1, .46, -.06], [.26, .7, -.24], [.47, .85, -.26], [.4, .48, -.12], [.34, .35, .13], [.24, .41, .03], [.16, .32, .21]];
                    wing.setAttribute('position', new Float32BufferAttribute(edge.flatMap(([x, y, z]) => [side * x, y, z]), 3));
                    wing.setAttribute('uv', new Float32BufferAttribute(edge.flatMap(([x, , z]) => [x, z]), 2));
                    wing.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 6]); wing.computeVertexNormals();
                    const mesh = new Mesh(wing, materials.mesh({ ...element, material }, -.18));
                    mesh.castShadow = mesh.receiveShadow = true; sculpture.add(mesh);
                }
                const tail = resources.own(sweepGeometry([new Vector3(0, .27, -.16), new Vector3(.12, .13, -.3), new Vector3(.29, .08, -.42), new Vector3(.37, .04, -.33)], t => .09 * (1 - t) + .005));
                sculpture.add(new Mesh(tail, materials.mesh({ ...element, material })));
                eyes(.075, .87, .43, .016);
            } else {
                const dwarf = kind === 'dwarf', breadth = dwarf ? .3 : .19;
                part(cone, 0, .46, 0, breadth, .66, breadth * .75, -.04);
                part(sphere, 0, .89, 0, dwarf ? .21 : .15, .21, .15, .38, 'wood');
                for (const side of [-1, 1]) {
                    part(cylinder, side * breadth * .75, .14, .015, .055, .27, .07, -.35, 'wood');
                    part(sphere, side * breadth, .55, .015, .075, .23, .08, .06).rotation.z = side * .25;
                }
                if (dwarf) {
                    part(sphere, 0, 1.02, -.005, .225, .14, .18, .1, 'metal');
                    part(cone, 0, .71, .16, .18, .37, .12, -.2, 'wood').rotation.z = Math.PI;
                    part(cylinder, 0, .5, 0, .30, .07, .235, -.25, 'wood');
                } else {
                    for (const side of [-1, 1]) {part(cone, side * .19, .94, 0, .06, .23, .035, .38, 'wood').rotation.z = -side * 1.1;}
                    part(sphere, 0, 1.02, -.05, .17, .1, .15, -.28, 'wood');
                }
                eyes(.06, .9, .135, .015);
            }
            // Static parts share a draw per surface rather than a draw per eye, limb or wing.
            sculpture.updateMatrixWorld(true);
            const batches = new Map<ReturnType<typeof materials.mesh>, BufferGeometry[]>();
            sculpture.traverse(object => {
                if (!(object instanceof Mesh)) {return;}
                const surface = object.material as ReturnType<typeof materials.mesh>;
                const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
                geometry.applyMatrix4(object.matrixWorld);
                if (!batches.has(surface)) {batches.set(surface, []);}
                batches.get(surface)!.push(geometry);
            });
            sculpture.clear();
            for (const [surface, parts] of batches) {
                let merged;
                try {merged = mergeGeometries(parts);} finally {parts.forEach(part => part.dispose());}
                if (!merged) {throw new Error('map_sculpture_geometry_invalid');}
                const mesh = new Mesh(resources.own(merged), surface);
                mesh.castShadow = surface.opacity >= .8; mesh.receiveShadow = true; sculpture.add(mesh);
            }
            const box = new Box3().setFromObject(sculpture), center = box.getCenter(new Vector3());
            let radius = 0;
            sculpture.traverse(object => {
                if (!(object instanceof Mesh)) {return;}
                const positions = object.geometry.getAttribute('position');
                for (let i = 0; i < positions.count; i++) {
                    const p = new Vector3().fromBufferAttribute(positions, i).sub(center);
                    radius = Math.max(radius, Math.hypot(p.x, p.z));
                }
            });
            prototypes.set(key, { group: sculpture, box, radius });
        }
        // Scale once, uniformly: no squeezed faces, clipped wings, or invented occupancy.
        const prototype = prototypes.get(key)!, sculpture = prototype.group.clone(true), { box, radius } = prototype;
        const size = box.getSize(new Vector3()), center = box.getCenter(new Vector3());
        const scale = Math.min(width / size.x, depth / size.z, 2.8 / size.y, element.shape === 'circle' ? width / (2 * radius) : Infinity);
        sculpture.scale.setScalar(scale); sculpture.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
        parent.add(sculpture); return size.y * scale;
    };
}
