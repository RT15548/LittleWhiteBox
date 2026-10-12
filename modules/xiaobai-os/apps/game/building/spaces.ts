import { cells, partKey, residential, solid, PARTS, type Blueprint, type Part } from './policy.js';
import { occupancy, connected } from './layout.js';
import { doorway } from './house.js';

export type SpaceActivity = 'read' | 'sunbathe' | 'rest' | 'relax' | 'garden';
export type SpaceIssue = 'disconnected' | 'uncovered' | 'noisy' | 'shaded' | 'window';
export interface LivingSpace { part: Part; activity: SpaceActivity; issue: SpaceIssue | null }
export type Wish = 'quietReading' | 'sunTerrace' | 'garden' | 'spacious' | 'upstairs' | 'terrace';
export function quiet(brief: Blueprint, part: Part, parts: Part[]) {
    const door = doorway(brief, parts);
    return !door || Math.abs(door.y - part.y) + Math.abs(door.x - part.x) + Math.abs(door.z - part.z) > 1;
}
/** Side windows face open air, a garden or a terrace, never another interior. */
export function windowSides(part: Part, parts: Part[]): number[] {
    const map = occupancy(parts);
    return [-1, 1].filter(side => {
        const neighbour = map.get(partKey({ x: side < 0 ? part.x - 1 : part.x + PARTS[part.kind].width, y: part.y, z: part.z }));
        return !neighbour || !solid(neighbour.kind);
    });
}
export function sunny(brief: Blueprint, part: Part, parts: Part[]) {
    return !parts.some(p => p !== part && p.z === part.z && p.y >= part.y && cells(p).some(c => c.x === part.x || Math.sign(c.x - part.x) === brief.sunSide));
}
function readingIssue(brief: Blueprint, part: Part, parts: Part[]): SpaceIssue | null {
    return !quiet(brief, part, parts) ? 'noisy' : !windowSides(part, parts).length ? 'window' : null;
}
export function livingSpaces(brief: Blueprint, parts: Part[]): LivingSpace[] {
    const map = occupancy(parts), reached = connected(brief, parts);
    return parts.flatMap(part => {
        const activity: SpaceActivity | null = part.kind === 'study' ? 'read' : part.kind === 'terrace' ? 'sunbathe'
            : part.kind === 'room' ? 'rest' : part.kind === 'wide' ? 'relax' : part.kind === 'garden' ? 'garden' : null;
        if (!activity) { return []; }
        const issue: SpaceIssue | null = !reached.has(partKey(part)) ? 'disconnected'
            : activity === 'read' && readingIssue(brief, part, parts) ? readingIssue(brief, part, parts)
                : activity === 'sunbathe' && !sunny(brief, part, parts) ? 'shaded'
                    : ['read', 'rest', 'relax'].includes(activity) && cells(part).some(c => !map.has(partKey({ x: c.x, y: c.y + 1, z: c.z }))) ? 'uncovered' : null;
        return [{ part, activity, issue }];
    });
}
export function wishes(brief: Blueprint, parts: Part[]) {
    const reached = connected(brief, parts);
    const accessible = parts.filter(p => reached.has(partKey(p)));
    const criteria: Record<Wish, boolean> = {
        quietReading: accessible.some(p => p.kind === 'study' && !readingIssue(brief, p, parts)),
        sunTerrace: accessible.some(p => p.kind === 'terrace' && sunny(brief, p, parts)),
        garden: accessible.some(p => p.kind === 'garden' && Math.sign(p.x - brief.entrance) === brief.gardenSide),
        spacious: accessible.filter(p => residential(p.kind)).reduce((sum, p) => sum + PARTS[p.kind].width, 0) >= brief.living,
        upstairs: accessible.some(p => residential(p.kind) && p.y === brief.floors - 1),
        terrace: accessible.some(p => p.kind === 'terrace'),
    };
    return commissionWishes(brief).map(id => ({ id, met: criteria[id] }));
}
export function commissionWishes(brief: Pick<Blueprint, 'tier'>): Wish[] {
    switch (brief.tier) {
        case 'courtyard': return ['garden', 'spacious'];
        case 'duplex': return ['spacious', 'upstairs'];
        case 'terrace': return ['upstairs', 'terrace'];
        case 'sunroom': return ['quietReading', 'sunTerrace'];
    }
}
/** The tour follows the actual usable rooms. No actor clock, queue or needs are persisted. */
export function lifeTour(brief: Blueprint, parts: Part[]) {
    const available = livingSpaces(brief, parts).filter(space => !space.issue);
    return (['read', 'sunbathe', 'relax', 'rest', 'garden'] as const).flatMap(activity => {
        const space = available.find(s => s.activity === activity); return space ? [space] : [];
    });
}
