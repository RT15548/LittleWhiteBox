import type { MapElement, MapIconToken, RectGeometry, CircleGeometry, PointGeometry, PointsGeometry } from '../../../domains/map/types.js';
import { MAP_OBJECT_ICONS } from '../../../domains/map/semantics.js';

export interface SceneBounds { x: number; y: number; width: number; height: number }
const AREA_CATEGORIES = new Set(['water', 'terrain', 'furniture', 'decoration', 'danger', 'magic', 'secret', 'light']);
const FOOTPRINT_OBJECT_ICONS = new Set<MapIconToken>(MAP_OBJECT_ICONS);
const PLAN_OBJECT_DRAWINGS = new Set<MapIconToken>(['chair', 'table', 'bed', 'counter', 'shelf', 'sofa', 'bridge', 'tree', 'rock']);
export function hasSceneObjectDrawing(element: MapElement): boolean {return !!element.icon && PLAN_OBJECT_DRAWINGS.has(element.icon);}
const numberText = (value: number): string => Number(value.toFixed(3)).toString();
const pointsOf = (element: MapElement): Array<[number, number]> => (element.geometry as PointsGeometry).points || [];

/** Identity markers keep their glyph in both renderers, even with a sized footprint. */
export function isSceneMarker(element: MapElement): boolean {
    return element.shape === 'icon' || element.shape === 'label' || element.category === 'actor' || element.category === 'door'
        || element.kind === 'stairs' || element.icon === 'stairs' || element.icon === 'door-open';
}

function closesPath(element: MapElement): boolean {
    return pointsOf(element).length >= 3 && (element.closed ?? AREA_CATEGORIES.has(element.category));
}

export function isAreaElement(element: MapElement): boolean {
    if (element.category === 'wall' || element.category === 'grid' || (element.icon === 'fence' && ['path', 'curve'].includes(element.shape))) {return false;}
    if (element.shape === 'rect' || element.shape === 'circle') {return true;}
    return (element.shape === 'path' || element.shape === 'curve') && closesPath(element);
}

/** A sized known object remains an object regardless of which category authored it. */
export function isSceneObject(element: MapElement): boolean {
    return !['wall', 'grid', 'actor'].includes(element.category) && (element.shape === 'rect' || element.shape === 'circle') && (
        (element.icon !== undefined && FOOTPRINT_OBJECT_ICONS.has(element.icon))
        || ['furniture', 'decoration', 'door'].includes(element.category)
    );
}

function curveControls(points: Array<[number, number]>, closed: boolean, index: number): [[number, number], [number, number]] {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    const previous = points[index - 1] || (closed ? points[points.length - 1] : current);
    const following = points[index + 2] || (closed ? points[(index + 2) % points.length] : next);
    const clamp = (value: number, a: number, b: number): number => Math.max(Math.min(a, b), Math.min(Math.max(a, b), value));
    return [
        [clamp(current[0] + (next[0] - previous[0]) / 6, current[0], next[0]), clamp(current[1] + (next[1] - previous[1]) / 6, current[1], next[1])],
        [clamp(next[0] - (following[0] - current[0]) / 6, current[0], next[0]), clamp(next[1] - (following[1] - current[1]) / 6, current[1], next[1])],
    ];
}

/** Sample the same bounded cubic curves used by SVG, without parsing SVG or changing map facts. */
export function sceneElementOutline(element: MapElement): { points: Array<[number, number]>; closed: boolean } {
    if (element.shape === 'rect') {
        const { x, y, width, height } = element.geometry as RectGeometry;
        return { points: [[x, y], [x + width, y], [x + width, y + height], [x, y + height]], closed: true };
    }
    if (element.shape === 'circle') {
        const { x, y, radius } = element.geometry as CircleGeometry;
        return { points: Array.from({ length: 64 }, (_, i) => [x + radius * Math.cos(i * Math.PI / 32), y + radius * Math.sin(i * Math.PI / 32)]), closed: true };
    }
    if (element.shape !== 'path' && element.shape !== 'curve') {return { points: [], closed: false };}
    const points = pointsOf(element);
    const closed = closesPath(element);
    const rounded = (point: [number, number]): [number, number] => point.map(value => Number(numberText(value))) as [number, number];
    if (element.shape === 'path' || points.length < 2) {return { points: points.map(rounded), closed };}
    const sampled: Array<[number, number]> = [rounded(points[0])];
    for (let index = 0; index < points.length - (closed ? 0 : 1); index += 1) {
        const start = rounded(points[index]);
        const end = rounded(points[(index + 1) % points.length]);
        const [first, second] = curveControls(points, closed, index).map(rounded);
        for (let step = 1; step <= 12; step += 1) {
            const t = step / 12, u = 1 - t;
            sampled.push([0, 1].map(axis => u ** 3 * start[axis] + 3 * u ** 2 * t * first[axis] + 3 * u * t ** 2 * second[axis] + t ** 3 * end[axis]) as [number, number]);
        }
    }
    if (closed) {sampled.pop();}
    return { points: sampled, closed };
}

/** Actual geometry only: no outline expansion, door cutting or inferred connections. */
export function sceneElementPath(element: MapElement): string {
    if (element.shape === 'rect') {
        const { x, y, width, height } = element.geometry as RectGeometry;
        return `M ${x} ${y} h ${width} v ${height} h ${-width} Z`;
    }
    if (element.shape === 'circle') {
        const { x, y, radius: r } = element.geometry as CircleGeometry;
        return `M ${x - r} ${y} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z`;
    }
    const points = pointsOf(element);
    if (points.length < 2) {return '';}
    const closed = closesPath(element);
    if (element.shape === 'path') {
        return `M ${points.map(([x, y]) => `${numberText(x)} ${numberText(y)}`).join(' L ')}${closed ? ' Z' : ''}`;
    }
    const commands = [`M ${points[0].map(numberText).join(' ')}`];
    const count = points.length;
    for (let i = 0; i < count - (closed ? 0 : 1); i += 1) {
        // Bounded controls keep smoothing inside each supplied segment's envelope.
        const [first, second] = curveControls(points, closed, i);
        const next = points[(i + 1) % count];
        commands.push(`C ${first.map(numberText).join(' ')}, ${second.map(numberText).join(' ')}, ${next.map(numberText).join(' ')}`);
    }
    return commands.join(' ') + (closed ? ' Z' : '');
}

export function sceneElementBounds(element: MapElement): SceneBounds {
    if (element.shape === 'rect') {return { ...element.geometry as RectGeometry };}
    if (element.shape === 'circle') {
        const { x, y, radius } = element.geometry as CircleGeometry;
        return { x: x - radius, y: y - radius, width: radius * 2, height: radius * 2 };
    }
    const points = pointsOf(element);
    if (!points.length) {
        const { x, y } = element.geometry as PointGeometry;
        return { x, y, width: 0, height: 0 };
    }
    const xs = points.map(point => point[0]);
    const ys = points.map(point => point[1]);
    return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
}

export function sceneElementTransform(element: MapElement): string | undefined {
    if (!element.rotation) {return undefined;}
    const b = sceneElementBounds(element);
    return `rotate(${element.rotation} ${b.x + b.width / 2} ${b.y + b.height / 2})`;
}

export function sceneElementLabelPoint(element: MapElement, unitScale = 1): [number, number] {
    const b = sceneElementBounds(element);
    const centre: [number, number] = [b.x + b.width / 2, b.y + b.height / 2];
    if (element.shape === 'label') {return centre;}
    if (isSceneMarker(element)) {return [centre[0], centre[1] + 23 * unitScale];}
    if ((element.category === 'terrain' || element.category === 'water') && isAreaElement(element)) {return centre;}
    if (element.shape === 'path' || element.shape === 'curve') {
        const points = pointsOf(element);
        const closed = closesPath(element);
        const segmentCount = points.length - (closed ? 0 : 1);
        const lengths = Array.from({ length: segmentCount }, (_, index) => Math.hypot(
            points[(index + 1) % points.length][0] - points[index][0],
            points[(index + 1) % points.length][1] - points[index][1],
        ));
        let remainder = lengths.reduce((total, length) => total + length, 0) / 2;
        let index = 0;
        while (index < lengths.length - 1 && remainder > lengths[index]) {remainder -= lengths[index]; index += 1;}
        const start = points[index];
        const end = points[(index + 1) % points.length];
        const progress = lengths[index] ? remainder / lengths[index] : .5;
        let x = start[0] + (end[0] - start[0]) * progress;
        let y = start[1] + (end[1] - start[1]) * progress;
        let dx = end[0] - start[0];
        let dy = end[1] - start[1];
        if (element.shape === 'curve') {
            const [first, second] = curveControls(points, closed, index);
            const inverse = 1 - progress;
            x = inverse ** 3 * start[0] + 3 * inverse ** 2 * progress * first[0] + 3 * inverse * progress ** 2 * second[0] + progress ** 3 * end[0];
            y = inverse ** 3 * start[1] + 3 * inverse ** 2 * progress * first[1] + 3 * inverse * progress ** 2 * second[1] + progress ** 3 * end[1];
            dx = 3 * inverse ** 2 * (first[0] - start[0]) + 6 * inverse * progress * (second[0] - first[0]) + 3 * progress ** 2 * (end[0] - second[0]);
            dy = 3 * inverse ** 2 * (first[1] - start[1]) + 6 * inverse * progress * (second[1] - first[1]) + 3 * progress ** 2 * (end[1] - second[1]);
        }
        const length = Math.hypot(dx, dy);
        if (!length) {return [x, y - 13 * unitScale];}
        let normalX = -dy / length;
        let normalY = dx / length;
        if (normalY > 0 || (normalY === 0 && normalX < 0)) {normalX = -normalX; normalY = -normalY;}
        return [x + normalX * 13 * unitScale, y + normalY * 13 * unitScale];
    }
    const angle = (element.rotation || 0) * Math.PI / 180;
    const halfHeight = element.shape === 'circle' ? b.height / 2
        : (Math.abs(Math.sin(angle)) * b.width + Math.abs(Math.cos(angle)) * b.height) / 2;
    return [centre[0], centre[1] + halfHeight + 13 * unitScale];
}

export interface ForestCrown { x: number; y: number; size: number; variant: number }
export const MAX_FOREST_CROWNS = 256;

function seedOf(text: string): number {
    let value = 2166136261;
    for (const char of text) {value = Math.imul(value ^ char.charCodeAt(0), 16777619);}
    return value >>> 0;
}

/** Bounded decorative density, always clipped by the caller to the actual surface. Not map facts. */
export function forestCanopies(elements: readonly MapElement[]): ReadonlyMap<string, readonly ForestCrown[]> {
    const forests = elements.filter(element => element.category === 'terrain' && element.material === 'forest' && isAreaElement(element) && !isSceneObject(element))
        .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    const result = new Map<string, ForestCrown[]>();
    for (let index = 0; index < forests.length; index += 1) {
        const element = forests[index];
        const b = sceneElementBounds(element);
        const quota = Math.floor(MAX_FOREST_CROWNS / forests.length) + (index < MAX_FOREST_CROWNS % forests.length ? 1 : 0);
        const count = b.width && b.height ? Math.min(quota, Math.max(1, Math.ceil(b.width * b.height / 2704))) : 0;
        const columns = Math.min(count, Math.max(1, Math.ceil(Math.sqrt(count * b.width / Math.max(1, b.height)))));
        const rows = Math.ceil(count / Math.max(1, columns));
        let seed = seedOf(element.id);
        const random = (): number => {seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296;};
        const crowns: ForestCrown[] = [];
        for (let i = 0; i < count; i += 1) {
            crowns.push({
                x: b.x + (i % columns + .5 + (random() - .5) * .35) * b.width / columns,
                y: b.y + (Math.floor(i / columns) + .5 + (random() - .5) * .35) * b.height / rows,
                size: Math.min(Math.max(b.width / columns, b.height / rows), Math.min(b.width, b.height)) * (1.25 + random() * .35),
                variant: Math.floor(random() * 3),
            });
        }
        result.set(element.id, crowns);
    }
    return result;
}
