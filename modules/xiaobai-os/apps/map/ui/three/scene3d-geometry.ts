import { BufferGeometry, Float32BufferAttribute, Shape, ExtrudeGeometry, Vector2, Vector3 } from 'three';
import type { MapElement, MapScene } from '../../../../domains/map/types.js';
import { sceneElementBounds, sceneElementOutline, sceneUnitScale } from '../scene-geometry.js';

export function sceneFrame(scene: MapScene) {
    const [x, y, w, h] = scene.viewBox;
    const scale = sceneUnitScale(w, h);
    return { scale, point: (px: number, py: number, height = 0) => new Vector3((px - x - w / 2) / scale, height, (py - y - h / 2) / scale) };
}

export function elementFootprint(element: MapElement, scale: number) {
    const b = sceneElementBounds(element);
    const center: [number, number] = [b.x + b.width / 2, b.y + b.height / 2];
    const outline = sceneElementOutline(element);
    const points = outline.points.map(([x, y]) => new Vector2((x - center[0]) / scale, (y - center[1]) / scale));
    // Explicit repeated end points are legitimate input, but need not form a zero-length closing edge.
    if (outline.closed && points.length > 1 && points[0].equals(points[points.length - 1])) {points.pop();}
    return { center, width: b.width / scale, depth: b.height / scale, points, closed: outline.closed, rotation: -(element.rotation || 0) * Math.PI / 180 };
}

export function footprintGeometry(points: Vector2[], height: number): BufferGeometry {
    const shape = new Shape(points.map(p => new Vector2(p.x, -p.y)));
    const geometry = new ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, steps: 1, curveSegments: 1 });
    geometry.rotateX(-Math.PI / 2);
    return geometry;
}

export function outlineGeometry(points: Vector2[], closed: boolean, height: number): BufferGeometry {
    const vertices = points.map(p => new Vector3(p.x, height, p.y));
    if (closed && vertices.length) {vertices.push(vertices[0].clone());}
    return new BufferGeometry().setFromPoints(vertices);
}

/** Continuous ribbons have a fixed visual width; centreline and open ends stay authored. */
export function ribbonGeometry(points: Vector2[], closed: boolean, width: number): BufferGeometry {
    const vertices: number[] = [];
    for (let i = 0; i < points.length - (closed ? 0 : 1); i += 1) {
        const a = points[i], b = points[(i + 1) % points.length];
        const delta = b.clone().sub(a);
        if (!delta.lengthSq()) {continue;}
        const normal = new Vector2(-delta.y, delta.x).normalize().multiplyScalar(width / 2);
        const corners = [a.clone().add(normal), a.clone().sub(normal), b.clone().add(normal), b.clone().sub(normal)];
        for (const index of [0, 2, 1, 1, 2, 3]) {vertices.push(corners[index].x, 0, corners[index].y);}
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return geometry;
}

export function wallSegments(points: Vector2[], closed: boolean) {
    return points.slice(0, closed ? points.length : -1).flatMap((a, i) => {
        const b = points[(i + 1) % points.length];
        const length = a.distanceTo(b);
        return length ? [{ x: (a.x + b.x) / 2, z: (a.y + b.y) / 2, length, rotation: -Math.atan2(b.y - a.y, b.x - a.x) }] : [];
    });
}
