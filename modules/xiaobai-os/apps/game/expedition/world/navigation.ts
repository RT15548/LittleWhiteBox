import type { Point } from '../types.js';
import { canStandInWorld, cellCenter, worldCell, worldLineClear } from './geometry.js';
import type { WorldSpace } from './types.js';

const NEIGHBOURS = [[0, -1], [1, 0], [0, 1], [-1, 0], [1, -1], [1, 1], [-1, 1], [-1, -1]] as const;
const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

/** Scene-local waypoints; null means no route, never a teleport or an obstructed direct path. */
export function findWorldPath(space: WorldSpace, from: Point, to: Point, radius: number): Point[] | null {
    if (!canStandInWorld(space, from, radius) || !canStandInWorld(space, to, radius)) { return null; }
    if (worldLineClear(space, from, to, radius)) { return [{ ...to }]; }
    const { map, columns, rows } = space, start = worldCell(map, from);
    const costs = new Map<number, number>(), parents = new Map<number, number>(), closed = new Set<number>();
    const open: { id: number; score: number }[] = [];
    function center(id: number) { return cellCenter(map, id % columns, Math.floor(id / columns)); }
    function visit(column: number, row: number, cost: number, parent: number) {
        if (column < 0 || column >= columns || row < 0 || row >= rows) { return; }
        const id = row * columns + column;
        if (closed.has(id) || (costs.get(id) ?? Infinity) <= cost) { return; }
        costs.set(id, cost); parents.set(id, parent); open.push({ id, score: cost + distance(center(id), to) });
    }
    // A valid starting point can be off-centre; connect only to centres actually reachable by this body.
    for (let dy = -1; dy <= 1; dy++) {for (let dx = -1; dx <= 1; dx++) {
        const column = start.column + dx, row = start.row + dy, point = cellCenter(map, column, row);
        if (worldLineClear(space, from, point, radius)) { visit(column, row, distance(from, point), -1); }
    }}
    while (open.length) {
        open.sort((a, b) => b.score - a.score || b.id - a.id);
        const { id } = open.pop()!;
        if (closed.has(id)) { continue; }
        closed.add(id);
        const point = center(id);
        if (worldLineClear(space, point, to, radius)) {
            const path = [{ ...to }]; let cursor = id;
            while (cursor !== -1) { path.push(center(cursor)); cursor = parents.get(cursor)!; }
            path.reverse();
            const simplified: Point[] = []; let anchor = from;
            for (let i = 0; i < path.length;) {
                let last = i;
                while (last + 1 < path.length && worldLineClear(space, anchor, path[last + 1], radius)) { last++; }
                anchor = path[last]; simplified.push(anchor); i = last + 1;
            }
            return simplified;
        }
        for (const [dx, dy] of NEIGHBOURS) {
            const column = id % columns + dx, row = Math.floor(id / columns) + dy, next = cellCenter(map, column, row);
            if (worldLineClear(space, point, next, radius)) { visit(column, row, costs.get(id)! + distance(point, next), id); }
        }
    }
    return null;
}
