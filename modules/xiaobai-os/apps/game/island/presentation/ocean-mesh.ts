import * as T from 'three';
import { LANDSCAPE } from '../content.js';
import { shoreDistance } from '../coastline.js';

// The authored island is star-shaped about (0, 0). Nested radial rings retain
// every coastline vertex without intersecting coves or bridging across land.
// Dense near-shore rings carry metres from the same coast as the ground; the
// fragment shader never scans hundreds of coastline segments on every pixel.
export function oceanGeometry() {
    const positions: number[] = [], distances: number[] = [], indices: number[] = [];
    const rings = [1, 1.003, 1.009, 1.022, 1.05, 1.12, 1.3, 1.8, 3.5, 10], count = LANDSCAPE.land.length;
    for (const scale of rings) {
        for (const p of LANDSCAPE.land) {
            const q = { x: p.x * scale, y: p.y * scale };
            positions.push(q.x, 0, q.y); distances.push(scale === 1 ? 0 : shoreDistance(q));
        }
    }
    for (let ring = 0; ring < rings.length - 1; ring++) {
        for (let i = 0; i < count; i++) {
            const a = ring * count + i, b = ring * count + (i + 1) % count, c = a + count, d = b + count;
            indices.push(a, b, c, b, d, c);
        }
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('shoreMetres', new T.Float32BufferAttribute(distances, 1));
    geometry.setIndex(indices); return geometry;
}
