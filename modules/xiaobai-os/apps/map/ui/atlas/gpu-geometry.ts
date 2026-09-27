import { BufferGeometry, Float32BufferAttribute, ShapeUtils, Vector2 } from 'three';
import { geometryClosed, geometryPoints } from '../../../../domains/map/space/geometry.js';
import type { SpaceGeometry, SpacePoint } from '../../../../domains/map/space/types.js';

/** XY map coordinates become (x,-y,z). Bands use the same strips/discs as domain geometry. */
export function atlasMeshGeometry(geometry: SpaceGeometry): BufferGeometry {
    const points = geometryPoints(geometry), positions: number[] = [];
    const triangle = (a: SpacePoint, b: SpacePoint, c: SpacePoint) => {
        for (const p of [a, b, c]) { positions.push(p[0], -p[1], 0); }
    };
    if (geometryClosed(geometry)) {
        for (const [a, b, c] of ShapeUtils.triangulateShape(points.map(p => new Vector2(...p)), [])) { triangle(points[a], points[b], points[c]); }
    } else {
        const radius = 'width' in geometry ? (geometry.width || 1) / 2 : 2;
        for (let i = 1; i < points.length; i++) {
            const a = points[i - 1], b = points[i], length = Math.hypot(b[0] - a[0], b[1] - a[1]);
            if (!length) { continue; }
            const dx = -(b[1] - a[1]) / length * radius, dy = (b[0] - a[0]) / length * radius;
            const q: SpacePoint[] = [[a[0] + dx, a[1] + dy], [b[0] + dx, b[1] + dy], [b[0] - dx, b[1] - dy], [a[0] - dx, a[1] - dy]];
            triangle(q[0], q[1], q[2]); triangle(q[0], q[2], q[3]);
        }
        for (const p of points) {
            for (let i = 0; i < 16; i++) {
                const a = i * Math.PI / 8, b = (i + 1) * Math.PI / 8;
                triangle(p, [p[0] + Math.cos(a) * radius, p[1] + Math.sin(a) * radius], [p[0] + Math.cos(b) * radius, p[1] + Math.sin(b) * radius]);
            }
        }
    }
    const result = new BufferGeometry();
    result.setAttribute('position', new Float32BufferAttribute(positions, 3));
    result.setAttribute('uv', new Float32BufferAttribute(positions.flatMap((_, i) => i % 3 === 0 ? [positions[i] / 64, -positions[i + 1] / 64] : []), 2));
    result.computeVertexNormals();
    return result;
}
