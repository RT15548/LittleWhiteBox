import * as T from 'three';
import { LANDSCAPE } from '../content.js';
import { terrainAt } from '../environment.js';
import { elevationAt } from '../terrain.js';
import { shoreDistance } from '../coastline.js';
import type { Point } from '../model.js';
import { BASIN_SHAPES, WATER_BASINS, basinExtent } from '../water-basins.js';

export function islandGround(material: T.MeshStandardMaterial) {
    const metresPerTile = 4;
    const polygon = LANDSCAPE.land.map(p => new T.Vector2(p.x, p.y)), triangles = T.ShapeUtils.triangulateShape(polygon, []);
    const positions: number[] = [], normals: number[] = [], blends: number[] = [], uvs: number[] = [], indices: number[] = [], shores: number[] = [];
    const vertices = new Map<string, number>();
    const blend = { sand: [1, 0, 0, 0], scrub: [0, 1, 0, 0], reef: [0, 0, 1, 0], mangrove: [0, 0, 0, 1] };
    function vertex(p: Point) {
        const key = `${p.x}:${p.y}`, existing = vertices.get(key);
        if (existing !== undefined) { return existing; }
        const index = positions.length / 3; vertices.set(key, index);
        positions.push(p.x, elevationAt(p), p.y); uvs.push(p.x / metresPerTile, -p.y / metresPerTile);
        shores.push(shoreDistance(p));
        const normal = new T.Vector3(elevationAt({ x: p.x - .1, y: p.y }) - elevationAt({ x: p.x + .1, y: p.y }), .2,
            elevationAt({ x: p.x, y: p.y - .1 }) - elevationAt({ x: p.x, y: p.y + .1 })).normalize();
        normals.push(...normal.toArray());
        blends.push(...blend[terrainAt(p)]);
        return index;
    }
    function triangle(a: Point, b: Point, c: Point, basins = WATER_BASINS) {
        const sides = [[a, b, c], [b, c, a], [c, a, b]].sort((x, y) => (y[0].x - y[1].x) ** 2 + (y[0].y - y[1].y) ** 2 - ((x[0].x - x[1].x) ** 2 + (x[0].y - x[1].y) ** 2));
        const [u, v, w] = sides[0];
        const minX = Math.min(a.x, b.x, c.x), maxX = Math.max(a.x, b.x, c.x), minY = Math.min(a.y, b.y, c.y), maxY = Math.max(a.y, b.y, c.y);
        const nearby = basins.filter(basin => {
            const r = basinExtent(basin.kind), p = basin.position;
            return p.x + r >= minX && p.x - r <= maxX && p.y + r >= minY && p.y - r <= maxY;
        });
        const maxEdge = nearby.reduce((size, basin) => Math.min(size, BASIN_SHAPES[basin.kind].radius / 10), 10);
        if (Math.hypot(u.x - v.x, u.y - v.y) > maxEdge) {
            const mid = { x: (u.x + v.x) / 2, y: (u.y + v.y) / 2 }; triangle(u, mid, w, nearby); triangle(mid, v, w, nearby); return;
        }
        // Clockwise in x/z produces upward facing triangles.
        if ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0) { indices.push(vertex(a), vertex(c), vertex(b)); }
        else { indices.push(vertex(a), vertex(b), vertex(c)); }
    }
    for (const [a, b, c] of triangles) { triangle(LANDSCAPE.land[a], LANDSCAPE.land[b], LANDSCAPE.land[c]); }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3)); geometry.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('groundBlend', new T.Float32BufferAttribute(blends, 4)); geometry.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('shoreMetres', new T.Float32BufferAttribute(shores, 1));
    geometry.setIndex(indices);
    const mesh = new T.Mesh(geometry, material); mesh.receiveShadow = true; return mesh;
}
