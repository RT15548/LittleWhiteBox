import { columnHeight, PARTS, ROOM_CHOICES, BUILDING_POLICY as P, cells, partKey, solid, type Blueprint, type Room, type RoomChoice } from './policy.js';
import { occupancy, connected } from './layout.js';
import { houseParts } from './house.js';
import { livingSpaces, wishes } from './spaces.js';
export type PlacementIssue = 'bounds' | 'occupied' | 'materials' | 'support' | 'entrance' | 'garden' | 'path' | 'terrace' | 'connected';
export function materialUsed(rooms: Room[]) { return rooms.reduce((sum, p) => sum + PARTS[p.kind].cost, 0); }
export function placementIssue(brief: Blueprint, rooms: Room[]): PlacementIssue | null {
    if (rooms.length > P.maxParts) { return 'materials'; }
    const map = new Map<string, Room>();
    for (const p of rooms) {
        if (p.kind !== 'hall' && !ROOM_CHOICES.includes(p.kind) || !Number.isInteger(p.x) || !Number.isInteger(p.y) || !Number.isInteger(p.z)
            || p.z < 0 || p.z >= brief.depth || p.x < 0 || p.x + PARTS[p.kind].width > brief.width || p.y < 0 || cells(p).some(c => c.y >= columnHeight(brief, c.x, c.z))) { return 'bounds'; }
        for (const c of cells(p)) { const key = partKey(c); if (map.has(key)) { return 'occupied'; } map.set(key, p); }
    }
    if (materialUsed(rooms) > brief.materials) { return 'materials'; }
    if (!map.has(partKey({ x: brief.entrance, y: 0, z: brief.entryZ }))) { return 'entrance'; }
    for (const p of rooms) {
        if (p.kind === 'garden' && (p.y !== 0 || rooms.some(other => other.y > 0 && cells(other).some(c => c.x === p.x && c.z === p.z)))) { return 'garden'; }
        if (p.kind === 'path' && p.y !== 0) { return 'path'; }
        if (p.kind === 'terrace' && (p.y === 0 || !brief.terraces)) { return 'terrace'; }
        if (p.y > 0 && cells(p).some(c => { const below = map.get(partKey({ x: c.x, y: c.y - 1, z: c.z })); return !below || !solid(below.kind); })) { return 'support'; }
    }
    const reached = connected(brief, rooms);
    return rooms.some(p => cells(p).some(c => !reached.has(partKey(c)))) ? 'connected' : null;
}
export function inspect(brief: Blueprint, rooms: Room[]) {
    const parts = houseParts(brief, rooms), reached = connected(brief, parts), requests = wishes(brief, parts);
    const habitable = !placementIssue(brief, rooms) && rooms.some(p => p.kind === 'room');
    return { wishes: requests, spaces: livingSpaces(brief, parts), habitable, fulfilled: habitable && requests.every(w => w.met), materials: materialUsed(rooms),
        unreachable: rooms.filter(p => !reached.has(partKey(p))).map(partKey) };
}
export function legalPlaces(brief: Blueprint, rooms: Room[], kind: RoomChoice) {
    const map = occupancy(rooms), places: Room[] = [];
    for (let y = 0; y < brief.floors; y++) {
        for (let z = 0; z < brief.depth; z++) { for (let x = 0; x < brief.width; x++) {
            const room = { kind, x, y, z };
            if (!map.has(partKey(room)) && !placementIssue(brief, [...rooms, room])) { places.push(room); }
        } }
    }
    return places;
}
export function refitted(rooms: Room[], at: Pick<Room, 'x' | 'y' | 'z'>, kind: 'room' | 'study'): Room[] | null {
    const old = rooms.find(p => partKey(p) === partKey(at));
    if (!old || !['room', 'study'].includes(old.kind) || old.kind === kind) { return null; }
    return rooms.map(p => p === old ? { ...p, kind } : p);
}
