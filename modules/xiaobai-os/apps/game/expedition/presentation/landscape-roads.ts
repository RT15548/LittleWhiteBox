import type { Group } from 'three';
import type { SceneKit } from '../scene-kit.js';
import type { Landscape, LandscapeRoad } from '../world/landscape.js';
import { LAND } from './world-palette.js';

type Vertex = [number, number];
type Polygon = Vertex[];
const EPSILON = 1e-7;

function cross(a: Vertex, b: Vertex, p: Vertex) { return (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]); }
function halfPlane(subject: Polygon, a: Vertex, b: Vertex, inside: boolean): Polygon {
    const result: Polygon = [];
    for (let i = 0; i < subject.length; i++) {
        const p = subject[i], q = subject[(i + 1) % subject.length], dp = cross(a, b, p), dq = cross(a, b, q);
        const keepP = inside ? dp >= -EPSILON : dp <= EPSILON, keepQ = inside ? dq >= -EPSILON : dq <= EPSILON;
        if (keepP) { result.push(p); }
        if (keepP !== keepQ && Math.abs(dp - dq) > EPSILON) {
            const t = dp / (dp - dq); result.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
        }
    }
    return result;
}
function area(p: Polygon) { return Math.abs(p.reduce((sum, v, i) => sum + v[0] * p[(i + 1) % p.length][1] - v[1] * p[(i + 1) % p.length][0], 0)) / 2; }
function subtract(subject: Polygon, clip: Polygon): Polygon[] {
    let remaining = subject;
    const pieces: Polygon[] = [];
    for (let i = 0; i < clip.length && remaining.length >= 3; i++) {
        const a = clip[i], b = clip[(i + 1) % clip.length], outside = halfPlane(remaining, a, b, false);
        if (area(outside) > EPSILON) { pieces.push(outside); }
        remaining = halfPlane(remaining, a, b, true);
    }
    return pieces;
}
function rectangle(a: readonly number[], b: readonly number[], width: number): Polygon {
    const dx = b[0] - a[0], dz = b[1] - a[1], scale = width / (2 * Math.hypot(dx, dz)), x = -dz * scale, z = dx * scale;
    return [[a[0] + x, a[1] + z], [a[0] - x, a[1] - z], [b[0] - x, b[1] - z], [b[0] + x, b[1] + z]];
}
function outlines(roads: readonly LandscapeRoad[], padding: number) {
    const polygons: Polygon[] = [];
    for (const road of roads) {
        for (let i = 1; i < road.points.length; i++) { polygons.push(rectangle(road.points[i - 1], road.points[i], road.width + padding)); }
        for (const [x, z] of road.points.slice(1, -1)) {
            polygons.push(Array.from({ length: 12 }, (_, i): Vertex => {
                const t = i * Math.PI / 6, r = (road.width + padding) / 2; return [x + Math.cos(t) * r, z + Math.sin(t) * r];
            }));
        }
    }
    return polygons;
}

/** Disjoint convex pieces: crossings have one surface, not overlapping coplanar road meshes. */
export function roadSurface(roads: readonly LandscapeRoad[], padding = 0): Polygon[] {
    const shapes = outlines(roads, padding), result: Polygon[] = [];
    for (let i = 0; i < shapes.length; i++) {
        let pieces = [shapes[i]];
        for (let j = 0; j < i && pieces.length; j++) { pieces = pieces.flatMap(p => subtract(p, shapes[j])); }
        result.push(...pieces.filter(p => area(p) > EPSILON));
    }
    return result;
}

export function buildRoads(k: SceneKit, roads: readonly LandscapeRoad[], surface: Landscape['surface'], chunk: (x: number, z: number) => Group) {
    const marble = surface === 'marble', street = surface === 'street';
    for (const [padding, height, color] of [[.4, .025, marble ? LAND.brass : street ? LAND.streetSeam : LAND.mortar], [0, .04, marble ? LAND.slate : street ? LAND.streetStone : LAND.stone]] as const) {
        for (const polygon of roadSurface(roads, padding)) {
            const x = polygon.reduce((sum, p) => sum + p[0], 0) / polygon.length, z = polygon.reduce((sum, p) => sum + p[1], 0) / polygon.length;
            const surface = k.shape(chunk(x, z), polygon.map(p => [p[0], -p[1]]), color, [0, height, 0]);
            surface.rotation.x = -Math.PI / 2; surface.castShadow = false;
        }
    }
    // Joints end before a junction. They cannot cut a gold border across another road.
    const polygons = outlines(roads, .4);
    let index = 0;
    for (const road of roads) {
        for (let i = 1; i < road.points.length; i++, index++) {
            const a = road.points[i - 1], b = road.points[i], dx = b[0] - a[0], dz = b[1] - a[1], length = Math.hypot(dx, dz);
            for (let distance = 1.5; distance < length; distance += 1.65) {
                const x = a[0] + dx * distance / length, z = a[1] + dz * distance / length;
                if (polygons.some((poly, j) => j !== index && poly.every((v, n) => cross(v, poly[(n + 1) % poly.length], [x, z]) >= -EPSILON))) { continue; }
                const line = k.mesh(chunk(x, z), 'box', marble ? LAND.shadow : street ? LAND.streetSeam : LAND.mortar, [road.width - .08, .012, .025], [x, .049, z]);
                line.rotation.y = Math.atan2(dx, dz); line.castShadow = false;
                if (street) {
                    const joint = k.mesh(chunk(x, z), 'box', LAND.streetSeam, [.025, .012, 1.4], [x + Math.cos(distance) * .55, .049, z]);
                    joint.rotation.y = Math.atan2(dx, dz); joint.castShadow = false;
                }
            }
        }
        index += road.points.length - 2;
    }
}
