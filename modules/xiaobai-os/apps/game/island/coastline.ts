import type { Point } from './model.js';

// Authored headlands and shore character, in metres. This is the land boundary,
// not a second decorative shoreline; walking, elevation and water all consume it.
const headlands = [
    { x: -760, y: -180, scallop: 5 }, { x: -580, y: -400, scallop: 9 },
    { x: -120, y: -500, scallop: 7 }, { x: 420, y: -400, scallop: .6 },
    { x: 850, y: -100, scallop: .6 }, { x: 700, y: 260, scallop: 7 },
    { x: 250, y: 450, scallop: 9 }, { x: -300, y: 420, scallop: 6 },
    { x: -720, y: 160, scallop: 5 },
];
const spacing = 6, rounding = 12;
const between = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
function trimmed(a: Point, b: Point) { return between(a, b, rounding / Math.hypot(b.x - a.x, b.y - a.y)); }

export const COASTLINE: Point[] = headlands.flatMap((a, i) => {
    const previous = headlands[(i + headlands.length - 1) % headlands.length], b = headlands[(i + 1) % headlands.length];
    const enter = trimmed(a, previous), leave = trimmed(a, b), end = trimmed(b, a);
    const points: Point[] = [];
    for (let j = 0; j < 6; j++) {
        const t = j / 6;
        points.push(between(between(enter, a, t), between(a, leave, t), t));
    }
    const dx = end.x - leave.x, dy = end.y - leave.y, length = Math.hypot(dx, dy), steps = Math.ceil(length / spacing);
    for (let j = 0; j < steps; j++) {
        const t = j / steps, p = between(leave, end, t);
        // Broad coves with smaller tongues of sand; fade at a rounded headland.
        const envelope = Math.sin(Math.PI * t) ** 2;
        const outward = a.scallop * envelope * (.55 + .32 * Math.sin(t * length / 32 + i) + .13 * Math.sin(t * length / 11));
        points.push({ x: p.x + dy / length * outward, y: p.y - dx / length * outward });
    }
    return points;
});

interface Bounds { minX: number; minY: number; maxX: number; maxY: number }
interface Segment extends Bounds { a: Point; dx: number; dy: number; lengthSquared: number }
type Branch = Bounds & ({ segments: Segment[] } | { children: [Branch, Branch] });
function partition(segments: Segment[]): Branch {
    const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    for (const s of segments) {
        bounds.minX = Math.min(bounds.minX, s.minX); bounds.minY = Math.min(bounds.minY, s.minY);
        bounds.maxX = Math.max(bounds.maxX, s.maxX); bounds.maxY = Math.max(bounds.maxY, s.maxY);
    }
    if (segments.length <= 8) { return { ...bounds, segments }; }
    const wide = bounds.maxX - bounds.minX > bounds.maxY - bounds.minY;
    segments.sort((a, b) => wide ? a.minX + a.maxX - b.minX - b.maxX : a.minY + a.maxY - b.minY - b.maxY);
    const half = Math.floor(segments.length / 2);
    return { ...bounds, children: [partition(segments.slice(0, half)), partition(segments.slice(half))] };
}
// Derived once in memory, never saved. Terrain construction and game-time tide
// checks need exact proximity without scanning the whole island for each sample.
const shore = partition(COASTLINE.map((a, i) => {
    const b = COASTLINE[(i + 1) % COASTLINE.length], dx = b.x - a.x, dy = b.y - a.y;
    return { a, dx, dy, lengthSquared: dx * dx + dy * dy,
        minX: Math.min(a.x, b.x), maxX: Math.max(a.x, b.x), minY: Math.min(a.y, b.y), maxY: Math.max(a.y, b.y) };
}));
export function shoreDistance(position: Point): number {
    let nearest = Infinity;
    function bound(b: Bounds) {
        const x = Math.max(b.minX - position.x, 0, position.x - b.maxX), y = Math.max(b.minY - position.y, 0, position.y - b.maxY);
        return x * x + y * y;
    }
    function visit(node: Branch, lower: number) {
        if (lower >= nearest) { return; }
        if ('children' in node) {
            const [a, b] = node.children, da = bound(a), db = bound(b);
            if (da < db) { visit(a, da); visit(b, db); } else { visit(b, db); visit(a, da); }
        } else {
            for (const s of node.segments) {
                if (bound(s) >= nearest) { continue; }
                const x = position.x - s.a.x, y = position.y - s.a.y;
                const t = Math.max(0, Math.min(1, (x * s.dx + y * s.dy) / s.lengthSquared));
                nearest = Math.min(nearest, (x - t * s.dx) ** 2 + (y - t * s.dy) ** 2);
            }
        }
    }
    visit(shore, 0); return Math.sqrt(nearest);
}
