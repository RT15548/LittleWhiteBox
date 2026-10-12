import { cells, partKey, solid, type Blueprint, type Part, type Room } from './policy.js';
import { connected, neighbours, occupancy } from './layout.js';
import { houseParts } from './house.js';
import { livingSpaces, quiet } from './spaces.js';
import { inspect } from './rules.js';

export const MEMORY_IDS = ['gardenWalk', 'gardenReading', 'gardenTea', 'quietBedroom', 'courtyard'] as const;
export type MemoryId = typeof MEMORY_IDS[number];
export const MEMORY_MATERIALS = 2;
export const MEMORY_ROOMS = { gardenWalk: 'garden', gardenReading: 'study', gardenTea: 'wide', quietBedroom: 'room', courtyard: 'garden' } as const;
export type MemoryNeed = 'bedroom' | 'garden' | 'path' | 'study' | 'gardenWindow' | 'livingRoom' | 'gardenDoor' | 'privacy' | 'enclosure';
export interface MemoryOpportunity { id: MemoryId; part: Part | null; need: MemoryNeed | null }
export interface Keepsake { id: MemoryId; part: Part }
export function memoryMaterials(memories: readonly MemoryId[]) { return memories.length * MEMORY_MATERIALS; }
export function memoryOrder(seed: number): MemoryId[] {
    const order: MemoryId[] = [...MEMORY_IDS];
    if ((seed >>> 4) % 2) { [order[1], order[2]] = [order[2], order[1]]; }
    return order;
}
function orderParts(a: Part, b: Part) { return a.y - b.y || a.z - b.z || a.x - b.x; }

/** A memory certifies a spatial relationship, never elapsed time, clicks or a room count. */
export function memoryOpportunity(id: MemoryId, brief: Blueprint, rooms: Room[]): MemoryOpportunity {
    const unmet = (need: MemoryNeed): MemoryOpportunity => ({ id, part: null, need });
    const met = (part: Part): MemoryOpportunity => ({ id, part, need: null });
    if (!inspect(brief, rooms).habitable) { return unmet('bedroom'); }
    const parts = houseParts(brief, rooms), map = occupancy(rooms);
    const usable = livingSpaces(brief, parts).filter(s => !s.issue).map(s => s.part).sort(orderParts);
    const gardens = usable.filter(p => p.kind === 'garden');
    const touchesGarden = (p: Part) => cells(p).some(c => neighbours(c).some(n => map.get(partKey(n))?.kind === 'garden'));
    switch (id) {
        case 'gardenWalk': {
            if (!gardens.length) { return unmet('garden'); }
            const garden = gardens.find(p => neighbours(p).some(c => map.get(partKey(c))?.kind === 'path'));
            return garden ? met(garden) : unmet('path');
        }
        case 'gardenReading': {
            const studies = usable.filter(p => p.kind === 'study');
            if (!studies.length) { return unmet('study'); }
            const study = studies.find(p => [-1, 1].some(side => map.get(partKey({ ...p, x: p.x + side }))?.kind === 'garden'));
            return study ? met(study) : unmet('gardenWindow');
        }
        case 'gardenTea': {
            const lounges = usable.filter(p => p.kind === 'wide');
            if (!lounges.length) { return unmet('livingRoom'); }
            const lounge = lounges.find(touchesGarden);
            return lounge ? met(lounge) : unmet('gardenDoor');
        }
        case 'quietBedroom': {
            const bedroom = usable.filter(p => p.kind === 'room' && quiet(brief, p, parts)).find(p => {
                const others = parts.filter(other => other !== p && other.kind !== 'roof');
                const reached = connected(brief, others);
                return others.every(other => cells(other).every(c => reached.has(partKey(c))));
            });
            return bedroom ? met(bedroom) : unmet('privacy');
        }
        case 'courtyard': {
            if (!gardens.length) { return unmet('garden'); }
            const garden = gardens.find(p => neighbours(p).filter(n => { const neighbour = map.get(partKey(n)); return neighbour && solid(neighbour.kind); }).length >= 3);
            return garden ? met(garden) : unmet('enclosure');
        }
    }
}
export function nextMemory(brief: Blueprint, rooms: Room[], memories: readonly MemoryId[]) {
    const id = memoryOrder(brief.seed).find(id => !memories.includes(id));
    return id ? memoryOpportunity(id, brief, rooms) : null;
}

/** Gifts belong to the house. Remodels re-display them in a matching room; no room means safely stored. */
export function keepsakePlacements(brief: Blueprint, rooms: Room[], memories: readonly MemoryId[]): Keepsake[] {
    return memories.flatMap(id => {
        const candidates = rooms.filter(p => p.kind === MEMORY_ROOMS[id]).sort(orderParts);
        const part = memoryOpportunity(id, brief, rooms).part ?? candidates[0];
        return part ? [{ id, part }] : [];
    });
}
