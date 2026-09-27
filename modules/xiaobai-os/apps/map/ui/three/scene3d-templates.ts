import { ConeGeometry, CylinderGeometry, DodecahedronGeometry, InstancedMesh, LatheGeometry, Matrix4, SphereGeometry, Vector2, type BufferGeometry, type Group, type MeshStandardMaterial } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { MapElement, MapMaterial } from '../../../../domains/map/types.js';
import type { SceneTemplate } from './scene3d-presentation.js';
import type { createSceneMaterials } from './scene3d-materials.js';
import type { Scene3DResources } from './scene3d-resources.js';
import { buildFixture } from './scene3d-fixtures.js';

/** Normalized parts keep even tiny footprints positive and inside the authored bounds. */
export function createTemplates(resources: Scene3DResources, materials: ReturnType<typeof createSceneMaterials>) {
    const cube = resources.own(new RoundedBoxGeometry(1, 1, 1, 3, .035));
    const cushion = resources.own(new RoundedBoxGeometry(1, 1, 1, 4, .16));
    const leg = resources.own(cube.clone());
    const positions = leg.getAttribute('position');
    for (let i = 0; i < positions.count; i += 1) {
        const taper = .72 + .28 * (positions.getY(i) + .5);
        positions.setX(i, positions.getX(i) * taper); positions.setZ(i, positions.getZ(i) * taper);
    }
    leg.computeVertexNormals();
    const cylinder = resources.own(new CylinderGeometry(.5, .5, 1, 32));
    const sphere = resources.own(new SphereGeometry(.5, 16, 10));
    const rock = resources.own(new DodecahedronGeometry(.5, 0));
    const cone = resources.own(new ConeGeometry(.5, 1, 9));
    const ring = resources.own(new LatheGeometry([[.35, -.5], [.5, -.5], [.5, .5], [.35, .5], [.35, -.5]].map(([x, y]) => new Vector2(x, y)), 32));
    return function build(parent: Group, element: MapElement, template: SceneTemplate, w: number, d: number): number {
        const h = Math.min(1.6, Math.min(w, d));
        const batches = new Map<string, { geometry: BufferGeometry; material: MeshStandardMaterial; matrices: Matrix4[] }>();
        function part(x: number, y: number, z: number, sx: number, sy: number, sz: number, tint = 0, geometry: BufferGeometry = cube, surface?: MapMaterial) {
            const material = materials.mesh(surface ? { ...element, material: surface } : element, tint);
            const key = `${geometry.uuid}:${material.uuid}`;
            if (!batches.has(key)) {batches.set(key, { geometry, material, matrices: [] });}
            batches.get(key)!.matrices.push(new Matrix4().makeScale(sx * w, sy * h, sz * d).setPosition(x * w, y * h, z * d));
        }
        function legs(top: number) {
            for (const x of [-.37, .37]) {
                for (const z of [-.36, .36]) {part(x, top / 2, z, .075, top, .075, -.16, leg);}
            }
        }
        function buildParts(): number {
            switch (template) {
            case 'table':
                if (element.shape === 'circle') {
                    part(0, .60, 0, 1, .08, 1, .12, cylinder);
                    part(0, .29, 0, .18, .58, .18, -.15, cylinder);
                    part(0, .04, 0, .43, .08, .43, -.22, cylinder);
                } else {
                    legs(.58);
                    for (const z of [-.36, .36]) {part(0, .52, z, .83, .13, .045, -.12);}
                    for (const x of [-.37, .37]) {part(x, .52, 0, .045, .13, .75, -.12);}
                    part(0, .607, 0, .98, .065, .98, -.1);
                    part(0, .651, 0, 1, .035, 1, .12);
                }
                return .67 * h;
            case 'chair':
                legs(.52); part(0, .55, .035, 1, .08, .93, .06);
                part(0, .595, .05, .91, .035, .83, .16);
                for (const x of [-.42, .42]) {part(x, .82, -.425, .095, .73, .12, -.10);}
                for (const x of [-.22, 0, .22]) {part(x, .9, -.425, .12, .42, .07, .02);}
                part(0, 1.14, -.425, .96, .1, .14, .12);
                for (const x of [-.37, .37]) {part(x, .23, 0, .035, .045, .74, -.12);}
                return 1.19 * h;
            case 'bed':
                legs(.20); part(0, .24, 0, 1, .18, 1, -.20);
                part(0, .39, .02, .96, .16, .92, .55);
                part(0, .5, .15, .98, .06, .63, .08);
                part(0, .50, -.29, .64, .13, .22, .65);
                part(0, .47, -.47, 1, .7, .06, -.16);
                return .82 * h;
            case 'counter':
                part(0, .08, 0, .9, .16, .86, -.28);
                part(0, .57, 0, .94, .90, .91, -.08);
                part(0, .17, .46, .96, .1, .06, .06);
                part(0, .94, .46, .96, .08, .06, .08);
                for (const x of [-.32, 0, .32]) {
                    part(x, .55, .46, .28, .66, .045, .03);
                    part(x, .55, .487, .235, .52, .02, -.09);
                }
                part(0, 1.025, 0, 1, .065, 1, -.18);
                part(0, 1.065, 0, 1, .03, 1, .16);
                return 1.08 * h;
            case 'shelf':
                part(0, 1.05, -.47, 1, 2.1, .06, -.20);
                for (const x of [-.48, .48]) {part(x, 1.05, 0, .04, 2.1, 1, -.08);}
                for (let row = 0; row < 4; row += 1) {
                    part(0, .04 + row * .67, 0, 1, .06, 1, .12);
                }
                // Structural cubbies only; contents are not provided by the map.
                for (const x of [-.17, .17]) {part(x, 1.03, 0, .025, 1.98, .92, -.04);}
                part(0, 2.06, 0, 1, .08, 1, .16);
                return 2.1 * h;
            case 'sofa':
                legs(.14); part(0, .26, 0, .96, .27, .96, -.18);
                part(0, .65, -.37, .98, .76, .26, -.08, cushion);
                for (const x of [-.44, .44]) {part(x, .52, 0, .12, .49, .98, .02, cushion);}
                for (const x of [-.26, 0, .26]) {
                    part(x, .46, .11, .245, .19, .72, .12, cushion);
                    part(x, .77, -.22, .245, .43, .22, .08, cushion);
                }
                return 1.04 * h;
            case 'bridge':
                for (let i = 0; i < 12; i += 1) {part(0, .16, -.46 + i * .083, 1, .10, .075, i % 2 ? .1 : 0);}
                for (const x of [-.45, .45]) {
                    part(x, .61, 0, .045, .045, 1, -.15);
                    for (const z of [-.45, 0, .45]) {part(x, .35, z, .055, .55, .04, -.18);}
                }
                return .65 * h;
            case 'tree':
                part(0, .44, 0, .14, .88, .14, -.42, cylinder);
                part(0, 1.04, 0, 1, 1.2, 1, -.04, sphere);
                part(-.16, 1.30, -.06, .60, .65, .60, .13, sphere);
                return 1.65 * h;
            case 'rock':
                part(0, .29, 0, 1, .62, 1, .03, rock);
                return .60 * h;
            default:
                return buildFixture(template, element, part, { cylinder, ring, cone }) * h;
            }
        }
        const height = buildParts();
        for (const { geometry, material, matrices } of batches.values()) {
            const mesh = resources.own(new InstancedMesh(geometry, material, matrices.length));
            matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
            mesh.castShadow = material.opacity >= .8; mesh.receiveShadow = true;
            parent.add(mesh);
        }
        return height;
    };
}
