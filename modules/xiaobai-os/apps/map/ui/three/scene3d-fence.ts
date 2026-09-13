import { InstancedMesh, Matrix4, Vector3, type BufferGeometry, type Group, type MeshStandardMaterial, type Vector2 } from 'three';
import { wallSegments } from './scene3d-geometry.js';
import type { Scene3DResources } from './scene3d-resources.js';

/** Rails follow the authored line; posts are decorative subdivisions, never added connections. */
export function buildFence(parent: Group, points: Vector2[], closed: boolean, cube: BufferGeometry, material: MeshStandardMaterial, resources: Scene3DResources): number {
    const segments = wallSegments(points, closed), matrices: Matrix4[] = [];
    const spacing = Math.max(.45, segments.reduce((sum, segment) => sum + segment.length, 0) / 128);
    let untilPost = 0;
    for (const segment of segments) {
        for (const y of [.22, .5]) {
            matrices.push(new Matrix4().makeRotationY(segment.rotation).scale(new Vector3(segment.length, .045, .04)).setPosition(segment.x, y, segment.z));
        }
        while (untilPost <= segment.length) {
            const along = untilPost - segment.length / 2;
            matrices.push(new Matrix4().makeScale(.065, .58, .065).setPosition(
                segment.x + Math.cos(segment.rotation) * along, .29, segment.z - Math.sin(segment.rotation) * along));
            untilPost += spacing;
        }
        untilPost -= segment.length;
    }
    if (!closed && points.length) {
        const end = points.at(-1)!;
        matrices.push(new Matrix4().makeScale(.065, .58, .065).setPosition(end.x, .29, end.y));
    }
    const mesh = resources.own(new InstancedMesh(cube, material, matrices.length));
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.castShadow = material.opacity >= .8; mesh.receiveShadow = true;
    parent.add(mesh);
    return .58;
}
