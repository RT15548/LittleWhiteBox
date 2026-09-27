import { transformPoint } from './frames.js';
import { SPACE_CURVE_STEPS, type FrameMapping, type SpaceBounds, type SpaceGeometry, type SpacePoint } from './types.js';

export function geometryClosed(g: SpaceGeometry): boolean { return g.shape === 'rect' || g.shape === 'circle' || ((g.shape === 'path' || g.shape === 'curve') && g.closed === true); }

/** Bounded interpolation passes through the authored nodes. Shared by validation and SVG. */
export function geometryPoints(g: SpaceGeometry): SpacePoint[] {
    if (g.shape === 'rect') { return [[g.x, g.y], [g.x + g.width, g.y], [g.x + g.width, g.y + g.height], [g.x, g.y + g.height]]; }
    if (g.shape === 'point') { return [[g.x, g.y]]; }
    if (g.shape === 'circle') { return Array.from({ length: 64 }, (_, i) => [g.x + g.radius * Math.cos(i * Math.PI / 32), g.y + g.radius * Math.sin(i * Math.PI / 32)]); }
    if (g.shape === 'path') { return g.points; }
    const points: SpacePoint[] = [];
    const count = g.points.length;
    const at = (i: number) => g.points[g.closed ? (i + count) % count : Math.max(0, Math.min(count - 1, i))];
    for (let i = 0; i < count - (g.closed ? 0 : 1); i++) {
        const a = at(i - 1), b = at(i), c = at(i + 1), d = at(i + 2);
        for (let j = 0; j < SPACE_CURVE_STEPS; j++) {
            const t = j / SPACE_CURVE_STEPS;
            points.push([0, 1].map(k => .5 * (2 * b[k] + (-a[k] + c[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t * t + (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * t * t * t)) as SpacePoint);
        }
    }
    if (!g.closed) { points.push(g.points[count - 1]); }
    return points;
}

export function transformGeometry(g: SpaceGeometry, mapping: FrameMapping): SpaceGeometry {
    if ('points' in g) { return { ...g, points: g.points.map(p => transformPoint(p, mapping)), ...(g.width === undefined ? {} : { width: g.width * mapping.scale }) }; }
    const [x, y] = transformPoint([g.x, g.y], mapping);
    if (g.shape === 'rect') { return { ...g, x, y, width: g.width * mapping.scale, height: g.height * mapping.scale }; }
    if (g.shape === 'circle') { return { ...g, x, y, radius: g.radius * mapping.scale }; }
    return { ...g, x, y };
}

export function pointsBounds(points: readonly SpacePoint[], margin = 0): SpaceBounds {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [x, y] of points) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
    return [minX - margin, minY - margin, maxX - minX + 2 * margin, maxY - minY + 2 * margin];
}
export function geometryBounds(g: SpaceGeometry): SpaceBounds {
    return pointsBounds(geometryPoints(g), (g.shape === 'path' || g.shape === 'curve') && !g.closed ? (g.width || 0) / 2 : 0);
}
export function boundsOverlap(a: SpaceBounds, b: SpaceBounds): boolean { return a[0] <= b[0] + b[2] && b[0] <= a[0] + a[2] && a[1] <= b[1] + b[3] && b[1] <= a[1] + a[3]; }
export function pointInGeometry(point: SpacePoint, geometry: SpaceGeometry): boolean {
    return geometryContains(geometry)(point);
}
/** Prepare a contour once for repeated sampling; coordinate/edge semantics stay identical. */
export function geometryContains(geometry: SpaceGeometry): (point: SpacePoint) => boolean {
    const points = geometryPoints(geometry);
    const closed = geometryClosed(geometry);
    return point => {
        if (!closed) {
            const width = (geometry.shape === 'path' || geometry.shape === 'curve') ? (geometry.width || 0) / 2 : 0;
            for (let i = 1; i < points.length; i++) {
                const a = points[i - 1], b = points[i];
                const dx = b[0] - a[0], dy = b[1] - a[1];
                const t = Math.max(0, Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
                if (Math.hypot(point[0] - a[0] - t * dx, point[1] - a[1] - t * dy) <= width) { return true; }
            }
            return false;
        }
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const a = points[i], b = points[j];
            if ((a[1] > point[1]) !== (b[1] > point[1]) && point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) { inside = !inside; }
        }
        return inside;
    };
}

function intersection(a: SpacePoint, b: SpacePoint, c: SpacePoint, d: SpacePoint): SpacePoint | null {
    const dx = b[0] - a[0], dy = b[1] - a[1], ex = d[0] - c[0], ey = d[1] - c[1];
    const divisor = dx * ey - dy * ex;
    if (!divisor) { return null; }
    const t = ((c[0] - a[0]) * ey - (c[1] - a[1]) * ex) / divisor;
    const u = ((c[0] - a[0]) * dy - (c[1] - a[1]) * dx) / divisor;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? [a[0] + t * dx, a[1] + t * dy] : null;
}

export function simpleContour(points: readonly SpacePoint[]): boolean {
    const onSegment = (p: SpacePoint, a: SpacePoint, b: SpacePoint) => (p[0] - a[0]) * (b[1] - a[1]) === (p[1] - a[1]) * (b[0] - a[0])
        && p[0] >= Math.min(a[0], b[0]) && p[0] <= Math.max(a[0], b[0]) && p[1] >= Math.min(a[1], b[1]) && p[1] <= Math.max(a[1], b[1]);
    for (let i = 0; i < points.length; i++) {
        const a = points[i], b = points[(i + 1) % points.length];
        if (a[0] === b[0] && a[1] === b[1]) { return false; }
        for (let j = i + 2; j < points.length; j++) {
            if ((j + 1) % points.length === i) { continue; }
            const c = points[j], d = points[(j + 1) % points.length];
            if (intersection(a, b, c, d) || onSegment(a, c, d) || onSegment(b, c, d) || onSegment(c, a, b) || onSegment(d, a, b)) { return false; }
        }
    }
    return true;
}

function circleEdgeIntersections(center: SpacePoint, radius: number, a: SpacePoint, b: SpacePoint): SpacePoint[] {
    const dx = b[0] - a[0], dy = b[1] - a[1], x = a[0] - center[0], y = a[1] - center[1];
    const aa = dx * dx + dy * dy, bb = 2 * (x * dx + y * dy), cc = x * x + y * y - radius * radius;
    const discriminant = bb * bb - 4 * aa * cc;
    if (!aa || discriminant < 0) { return []; }
    return [(-bb - Math.sqrt(discriminant)) / (2 * aa), (-bb + Math.sqrt(discriminant)) / (2 * aa)]
        .filter(t => t >= 0 && t <= 1).map(t => [a[0] + dx * t, a[1] + dy * t]);
}

/** A round band is the union of segment strips and vertex discs, not its bounding box. */
function clippedBandPoints(g: SpaceGeometry, clip: SpaceGeometry, radius: number): SpacePoint[] {
    const line = geometryPoints(g), edge = geometryPoints(clip);
    const result = edge.filter(p => pointInGeometry(p, g));
    for (const center of line) {
        const extrema: SpacePoint[] = [[center[0] - radius, center[1]], [center[0] + radius, center[1]], [center[0], center[1] - radius], [center[0], center[1] + radius]];
        result.push(...extrema.filter(p => pointInGeometry(p, clip)));
        for (let j = 0; j < edge.length; j++) { result.push(...circleEdgeIntersections(center, radius, edge[j], edge[(j + 1) % edge.length])); }
    }
    for (let i = 1; i < line.length; i++) {
        const a = line[i - 1], b = line[i], length = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (!length) { continue; }
        const x = -(b[1] - a[1]) / length * radius, y = (b[0] - a[0]) / length * radius;
        const strip: SpacePoint[] = [[a[0] + x, a[1] + y], [b[0] + x, b[1] + y], [b[0] - x, b[1] - y], [a[0] - x, a[1] - y]];
        result.push(...strip.filter(p => pointInGeometry(p, clip)));
        for (let k = 0; k < strip.length; k++) {
            for (let j = 0; j < edge.length; j++) {
                const p = intersection(strip[k], strip[(k + 1) % strip.length], edge[j], edge[(j + 1) % edge.length]);
                if (p) { result.push(p); }
            }
        }
    }
    return result;
}

/** Bounds of the visible intersection; clipping itself uses the same outlines, not this rectangle. */
export function clippedGeometryBounds(g: SpaceGeometry, clip?: SpaceGeometry): SpaceBounds | null {
    const bounds = geometryBounds(g);
    if (!clip) { return bounds; }
    const clipBounds = geometryBounds(clip);
    if (!boundsOverlap(bounds, clipBounds)) { return null; }
    const width = (g.shape === 'path' || g.shape === 'curve') && !g.closed ? (g.width || 0) / 2 : 0;
    if (width) {
        const visible = clippedBandPoints(g, clip, width);
        if (!visible.length) { return null; }
        const box = pointsBounds(visible);
        // Clamp numerical edge-intersection roundoff to the clip's known extent.
        const x = Math.max(box[0], clipBounds[0]), y = Math.max(box[1], clipBounds[1]);
        return [x, y, Math.max(0, Math.min(box[0] + box[2], clipBounds[0] + clipBounds[2]) - x), Math.max(0, Math.min(box[1] + box[3], clipBounds[1] + clipBounds[3]) - y)];
    }
    const a = geometryPoints(g), b = geometryPoints(clip);
    const points = a.filter(p => pointInGeometry(p, clip));
    if (geometryClosed(g)) { points.push(...b.filter(p => pointInGeometry(p, g))); }
    for (let i = 0; i < a.length - (geometryClosed(g) ? 0 : 1); i++) {
        for (let j = 0; j < b.length; j++) {
            const p = intersection(a[i], a[(i + 1) % a.length], b[j], b[(j + 1) % b.length]);
            if (p) { points.push(p); }
        }
    }
    return points.length ? pointsBounds(points) : null;
}
