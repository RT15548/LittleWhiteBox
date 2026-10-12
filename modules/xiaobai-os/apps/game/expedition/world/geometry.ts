import type { Point } from '../types.js';
import { type Cell, type WorldMap, type WorldSpace, worldFault } from './types.js';

// Contact is legal; this tolerance only absorbs floating-point error at cell boundaries.
const CONTACT_EPSILON = 1e-9;

export function cellCenter(map: WorldMap, column: number, row: number): Point {
    return { x: map.origin.x + (column + .5) * map.cellSize, y: map.origin.y + (row + .5) * map.cellSize };
}
export function worldCell(map: WorldMap, point: Point): Cell {
    return { column: Math.floor((point.x - map.origin.x) / map.cellSize), row: Math.floor((point.y - map.origin.y) / map.cellSize) };
}

/** Rebuilt from confirmed door facts; never persisted beside those facts. */
export function createWorldSpace(map: WorldMap, openedGates: ReadonlySet<string>): WorldSpace {
    const columns = map.rows[0]?.length ?? 0, rows = map.rows.length;
    if (!columns || !rows || !Number.isFinite(map.cellSize) || map.cellSize <= 0
        || !Number.isFinite(map.origin.x) || !Number.isFinite(map.origin.y)
        || map.rows.some(row => row.length !== columns || /[^.# ]/.test(row))) { worldFault('map_invalid'); }
    const gateIds = new Set<string>(), occupied = new Set<number>(), closedCells = new Set<number>(), closedGates = new Set<string>();
    for (const gate of map.gates) {
        if (!gate.id || gateIds.has(gate.id) || !gate.cells.length) { worldFault('map_invalid'); }
        gateIds.add(gate.id);
        const closed = !openedGates.has(gate.id);
        if (closed) { closedGates.add(gate.id); }
        for (const { column, row } of gate.cells) {
            if (!Number.isInteger(column) || !Number.isInteger(row) || column < 0 || column >= columns
                || map.rows[row]?.[column] !== '.') { worldFault('map_invalid'); }
            const index = row * columns + column;
            if (occupied.has(index)) { worldFault('map_invalid'); }
            occupied.add(index);
            if (closed) { closedCells.add(index); }
        }
    }
    for (const id of openedGates) { if (!gateIds.has(id)) { worldFault('gate_unknown'); } }
    return { map, columns, rows, closedGates, blocked(column, row) {
        return column < 0 || column >= columns || row < 0 || row >= rows
            || map.rows[row][column] !== '.' || closedCells.has(row * columns + column);
    } };
}

function pointBoxDistanceSquared(p: Point, left: number, top: number, size: number) {
    const dx = Math.max(left - p.x, 0, p.x - left - size), dy = Math.max(top - p.y, 0, p.y - top - size);
    return dx * dx + dy * dy;
}
function pointSegmentDistanceSquared(p: Point, from: Point, to: Point) {
    const dx = to.x - from.x, dy = to.y - from.y, length = dx * dx + dy * dy;
    const t = length === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - from.x) * dx + (p.y - from.y) * dy) / length));
    return (p.x - from.x - dx * t) ** 2 + (p.y - from.y - dy * t) ** 2;
}
function segmentEntersBox(from: Point, to: Point, left: number, top: number, size: number) {
    let start = 0, end = 1;
    for (const [p, delta, low] of [[from.x, to.x - from.x, left], [from.y, to.y - from.y, top]]) {
        if (delta === 0) {
            if (p <= low || p >= low + size) { return false; }
        } else {
            const a = (low - p) / delta, b = (low + size - p) / delta;
            start = Math.max(start, Math.min(a, b)); end = Math.min(end, Math.max(a, b));
            if (start >= end) { return false; }
        }
    }
    return start < end;
}
function segmentBoxDistanceSquared(from: Point, to: Point, left: number, top: number, size: number) {
    if (segmentEntersBox(from, to, left, top, size)) { return 0; }
    return Math.min(pointBoxDistanceSquared(from, left, top, size), pointBoxDistanceSquared(to, left, top, size),
        pointSegmentDistanceSquared({ x: left, y: top }, from, to),
        pointSegmentDistanceSquared({ x: left + size, y: top }, from, to),
        pointSegmentDistanceSquared({ x: left, y: top + size }, from, to),
        pointSegmentDistanceSquared({ x: left + size, y: top + size }, from, to));
}

/** The entire swept disc is checked, including voids, closed doors, and thin walls. */
export function worldLineClear(space: WorldSpace, from: Point, to: Point, radius = 0): boolean {
    if (![from.x, from.y, to.x, to.y, radius].every(Number.isFinite) || radius < 0) { worldFault('input_invalid'); }
    const { map } = space, size = map.cellSize;
    const first = worldCell(map, { x: Math.min(from.x, to.x) - radius, y: Math.min(from.y, to.y) - radius });
    const last = worldCell(map, { x: Math.max(from.x, to.x) + radius, y: Math.max(from.y, to.y) + radius });
    for (let row = first.row; row <= last.row; row++) {
        for (let column = first.column; column <= last.column; column++) {
            if (!space.blocked(column, row)) { continue; }
            const left = map.origin.x + column * size, top = map.origin.y + row * size;
            if (radius === 0 ? segmentEntersBox(from, to, left, top, size)
                || pointBoxDistanceSquared(from, left, top, size) === 0 && pointBoxDistanceSquared(to, left, top, size) === 0
                : segmentBoxDistanceSquared(from, to, left, top, size) < radius * radius - CONTACT_EPSILON) { return false; }
        }
    }
    return true;
}

export const canStandInWorld = (space: WorldSpace, point: Point, radius: number) => worldLineClear(space, point, point, radius);

/** Mutates position only. Small swept steps permit sliding without dash/knockback tunnelling. */
export function moveInWorld(space: WorldSpace, body: Point, displacement: Point, radius: number) {
    if (![displacement.x, displacement.y].every(Number.isFinite)) { worldFault('input_invalid'); }
    if (!canStandInWorld(space, body, radius)) { worldFault('position_blocked'); }
    const length = Math.hypot(displacement.x, displacement.y);
    if (length === 0) { return; }
    const steps = Math.ceil(length / (space.map.cellSize / 4)), dx = displacement.x / steps, dy = displacement.y / steps;
    for (let step = 0; step < steps; step++) {
        const next = { x: body.x + dx, y: body.y + dy };
        if (worldLineClear(space, body, next, radius)) { Object.assign(body, next); continue; }
        const axes: ('x' | 'y')[] = Math.abs(dx) >= Math.abs(dy) ? ['x', 'y'] : ['y', 'x'];
        for (const axis of axes) {
            const slide = { ...body, [axis]: body[axis] + (axis === 'x' ? dx : dy) };
            if (worldLineClear(space, body, slide, radius)) { Object.assign(body, slide); }
        }
    }
}
