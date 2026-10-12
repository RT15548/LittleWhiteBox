import { cells, partKey, solid, type Blueprint, type Part, type Room } from './policy.js';
import { occupancy } from './layout.js';

export function initialRooms(brief: Blueprint): Room[] { return [{ kind: 'hall', x: brief.entrance, y: 0, z: brief.entryZ }]; }
export function doorway(brief: Blueprint, parts: Part[]) {
    return parts.filter(p => p.y === 0 && solid(p.kind)).flatMap(cells)
        .sort((a, b) => (Math.abs(a.x - brief.entrance) + Math.abs(a.z - brief.entryZ)) - (Math.abs(b.x - brief.entrance) + Math.abs(b.z - brief.entryZ)) || a.x - b.x)[0] ?? null;
}

/** Infrastructure is a view of the layout, never another saved source of truth. */
export function houseParts(brief: Blueprint, rooms: Room[]): Part[] {
    const door = doorway(brief, rooms);
    const parts: Part[] = rooms.map(room => room.kind === 'hall' && door && partKey(room) === partKey(door) ? { ...room, kind: 'entry' } : room);
    const map = occupancy(parts);
    const roofs = parts.filter(p => solid(p.kind)).flatMap(cells).filter(c => !map.has(partKey({ x: c.x, y: c.y + 1, z: c.z })));
    return [...parts, ...roofs.map(c => ({ kind: 'roof' as const, x: c.x, y: c.y + 1, z: c.z }))];
}
