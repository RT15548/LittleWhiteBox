import { BufferGeometry, Float32BufferAttribute, InstancedMesh, Matrix4, Mesh, Quaternion, SphereGeometry, Vector3, type Group, type Vector2 } from 'three';
import type { MapElement } from '../../../../domains/map/types.js';
import type { Scene3DResources } from './scene3d-resources.js';
import type { createSceneMaterials } from './scene3d-materials.js';

import { type GROWTH_SURFACES, formSurface } from '../scene-forms.js';

/** A tapered sweep over an already sampled centreline. It never invents connections. */
export function sweepGeometry(points: readonly Vector3[], radiusAt: (t: number) => number, sides = 10): BufferGeometry {
    const vertices: number[] = [], indices: number[] = [], uv: number[] = [];
    const up = new Vector3(0, 1, 0);
    points.forEach((point, i) => {
        const tangent = points[Math.min(i + 1, points.length - 1)].clone().sub(points[Math.max(0, i - 1)]).normalize();
        const normal = new Vector3().crossVectors(tangent, Math.abs(tangent.y) > .95 ? new Vector3(1, 0, 0) : up).normalize();
        const binormal = new Vector3().crossVectors(tangent, normal).normalize();
        const t = i / (points.length - 1), radius = radiusAt(t);
        for (let j = 0; j <= sides; j++) {
            const angle = j / sides * Math.PI * 2;
            const p = point.clone().addScaledVector(normal, Math.cos(angle) * radius).addScaledVector(binormal, Math.sin(angle) * radius);
            vertices.push(p.x, p.y, p.z); uv.push(j / sides, t);
            if (i && j < sides) {
                const a = (i - 1) * (sides + 1) + j, b = i * (sides + 1) + j;
                indices.push(a, b, a + 1, b, b + 1, a + 1);
            }
        }
    });
    // Cap both ends, including a flat conduit. No hollow seams into the ground.
    for (const end of [0, points.length - 1]) {
        const center = vertices.length / 3, p = points[end], start = end * (sides + 1);
        vertices.push(p.x, p.y, p.z); uv.push(.5, end ? 1 : 0);
        for (let j = 0; j < sides; j++) {indices.push(center, start + j + (end ? 0 : 1), start + j + (end ? 1 : 0));}
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    return geometry;
}

export function buildGrowth(parent: Group, element: MapElement, points: readonly Vector2[], resources: Scene3DResources, materials: ReturnType<typeof createSceneMaterials>): number {
    const kind = element.icon as keyof typeof GROWTH_SURFACES;
    const surface = formSurface(element)!;
    // Repeated source points are valid, but must not create zero-length sweep segments.
    const path = points.filter((point, i) => !i || !point.equals(points[i - 1]));
    if (path.length < 2) {return 0;}
    const distances = [0];
    for (let i = 1; i < path.length; i++) {distances.push(distances[i - 1] + path[i].distanceTo(path[i - 1]));}
    const length = distances[distances.length - 1];
    const radius = Math.min(kind === 'tentacle' ? .22 : .09, Math.max(.025, length * .035));
    const radiusAt = (t: number) => kind === 'pipe' ? radius : radius * (.08 + .92 * (1 - t) ** .7);
    const radii = path.map((_, i) => radiusAt(i / (path.length - 1)));
    const samples = path.map((p, i) => {
        const t = i / (path.length - 1);
        return new Vector3(p.x, radii[i] + (kind === 'tentacle' ? Math.sin(t * Math.PI) * radius * 1.6 : 0), p.y);
    });
    const body = new Mesh(resources.own(sweepGeometry(samples, radiusAt)), materials.mesh({ ...element, material: surface }));
    body.castShadow = body.receiveShadow = true; parent.add(body);
    if (kind === 'vine' || kind === 'tentacle') {
        const count = Math.min(24, Math.max(2, Math.floor(length * 3)));
        const detailGeometry = resources.own(new SphereGeometry(1, 8, 6));
        const details = resources.own(new InstancedMesh(detailGeometry, materials.mesh({ ...element, material: surface }, kind === 'vine' ? .12 : .3), count));
        let segment = 0;
        for (let i = 0; i < count; i++) {
            const distance = (i + .5) / count * length;
            while (segment < path.length - 2 && distances[segment + 1] < distance) {segment++;}
            const progress = (distance - distances[segment]) / (distances[segment + 1] - distances[segment]);
            // Interpolate the drawn segment's centre and radius, not the nearest authored vertex.
            const position = samples[segment].clone().lerp(samples[segment + 1], progress);
            const size = radii[segment] + (radii[segment + 1] - radii[segment]) * progress, side = i % 2 ? -1 : 1;
            const tangent = path[segment + 1].clone().sub(path[segment]).normalize();
            position.add(new Vector3(tangent.y, 0, -tangent.x).multiplyScalar(kind === 'vine' ? side * size * 1.2 : 0));
            position.y += size * .65;
            const rotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.atan2(tangent.x, tangent.y) + side * .75);
            const scale = kind === 'vine' ? new Vector3(size * 2.1, size * .3, size * .8) : new Vector3(size * .5, size * .28, size * .55);
            details.setMatrixAt(i, new Matrix4().compose(position, rotation, scale));
        }
        details.castShadow = details.receiveShadow = true; parent.add(details);
    }
    return Math.max(...samples.map(p => p.y)) + radius;
}
